// ============================================================
//  VirtuBank — script.js  (v7 — FINAL: CLOUD + AI + PIGGY BANK)
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDp0dcnMcAQftNUqR16J4QxdKgONT6TESw",
  authDomain: "virtubank999.firebaseapp.com",
  projectId: "virtubank999",
  storageBucket: "virtubank999.firebasestorage.app",
  messagingSenderId: "609281991520",
  appId: "1:609281991520:web:207db48e7f0cead4f47405"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔑 Gemini API Key 
const GEMINI_API_KEY = "AIzaSyBv3JECRwVdal3oc4994_UIagUbb3x5xBc"; 

const SESSION_KEY     = "virtuBankSession";
const INITIAL_BALANCE = 5000;
const MAX_HISTORY     = 5;
const MAX_FAVORITES   = 5;

function nowISO() { return new Date().toISOString(); }

// ─── DATA LAYER (FIREBASE CLOUD) ──────────────────────────────
async function generateUID() {
  let uid; let exists = true;
  while(exists) {
    uid = Array.from({ length: 10 }, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)]).join("");
    const docSnap = await getDoc(doc(db, "accounts", uid));
    exists = docSnap.exists();
  }
  return uid;
}

async function createAccount(name, age, gender, maritalStatus, pan, aadhar, email, mobile, address, password, mpin) {
  const fields = { name, age, gender, maritalStatus, pan, aadhar, email, mobile, address, password, mpin };
  for (const [k, v] of Object.entries(fields)) { if (!v || String(v).trim() === "") return { success: false, message: `'${k}' is required.` }; }
  
  const panUp = String(pan).trim().toUpperCase(); 
  const emailLo = String(email).trim().toLowerCase();
  
  const accountsRef = collection(db, "accounts");
  const [panSnap, emailSnap] = await Promise.all([ getDocs(query(accountsRef, where("pan", "==", panUp))), getDocs(query(accountsRef, where("email", "==", emailLo))) ]);
  
  if (!panSnap.empty) return { success: false, message: "PAN already registered." };
  if (!emailSnap.empty) return { success: false, message: "Email already registered." };
  
  const uid = await generateUID();
  const account = { uid, name: String(name).trim(), age: Number(age), gender: String(gender).trim(), maritalStatus: String(maritalStatus).trim(), pan: panUp, aadhar: String(aadhar).trim(), email: emailLo, mobile: String(mobile).trim(), address: String(address).trim(), password: String(password), mpin: String(mpin), balance: INITIAL_BALANCE, piggyBank: 0, transactions: [], favorites: [], accountStatus: "active", createdAt: nowISO(), updatedAt: nowISO() };
  
  await setDoc(doc(db, "accounts", uid), account);
  return { success: true, message: "Account created.", account };
}

async function searchAccount(uid) {
  try {
    const docSnap = await getDoc(doc(db, "accounts", String(uid).trim().toUpperCase()));
    if (docSnap.exists()) {
      const account = docSnap.data();
      if (!account.favorites) account.favorites = [];
      if (account.piggyBank === undefined) account.piggyBank = 0;
      return { success: true, account };
    }
    return { success: false, message: `No account found: ${uid}` };
  } catch(e) { return { success: false, message: "Network error." }; }
}

// 💰 SMART SAVINGS (Piggy Bank) Logic
async function processAutoSave(uid, amount) {
  const roundUpTo = 100;
  const target = Math.ceil(amount / roundUpTo) * roundUpTo;
  const savings = parseFloat((target - amount).toFixed(2));

  if (savings > 0) {
    const res = await searchAccount(uid);
    if (res.success) {
      const acc = res.account;
      if (acc.balance >= savings) {
        acc.balance = parseFloat((acc.balance - savings).toFixed(2));
        acc.piggyBank = (acc.piggyBank || 0) + savings;
        acc.transactions.unshift({ id: Date.now() + 9, type: "debit", description: `Piggy Bank Auto-Save (RoundUp)`, amount: savings, balanceAfter: acc.balance, timestamp: nowISO() });
        if (acc.transactions.length > MAX_HISTORY) acc.transactions.pop();
        await updateDoc(doc(db, "accounts", uid), { balance: acc.balance, piggyBank: acc.piggyBank, transactions: acc.transactions });
        return savings;
      }
    }
  }
  return 0;
}

async function externalTransfer(senderUID, upiID, amount, mpin) {
  const res = await searchAccount(senderUID);
  if (!res.success) return res;
  const sender = res.account;
  if (sender.mpin !== String(mpin).trim()) return { success: false, message: "Incorrect MPIN." };
  if (sender.balance < amount) return { success: false, message: `Insufficient balance.` };
  
  sender.balance = parseFloat((sender.balance - amount).toFixed(2));
  sender.transactions.unshift({ id: Date.now(), type: "debit", description: `UPI Transfer to ${upiID}`, amount, balanceAfter: sender.balance, timestamp: nowISO() });
  if (sender.transactions.length > MAX_HISTORY) sender.transactions.pop();
  
  await updateDoc(doc(db, "accounts", senderUID), { balance: sender.balance, transactions: sender.transactions, updatedAt: nowISO() });
  const saved = await processAutoSave(senderUID, amount);
  return { success: true, saved };
}

async function internalTransfer(senderUID, receiverUID, amount, mpin) {
  const rUID = String(receiverUID).trim().toUpperCase();
  if (senderUID === rUID) return { success: false, message: "Cannot transfer to yourself." };
  const [senderRes, receiverRes] = await Promise.all([searchAccount(senderUID), searchAccount(rUID)]);
  if (!senderRes.success || !receiverRes.success) return { success: false, message: "Account(s) not found." };

  const sender = senderRes.account; const receiver = receiverRes.account;
  if (sender.mpin !== String(mpin).trim()) return { success: false, message: "Incorrect MPIN." };
  if (sender.balance < amount) return { success: false, message: "Insufficient balance." };

  sender.balance = parseFloat((sender.balance - amount).toFixed(2));
  receiver.balance = parseFloat((receiver.balance + amount).toFixed(2));

  sender.transactions.unshift({ id: Date.now(), type: "debit", description: `Transfer to ${receiver.name}`, amount, balanceAfter: sender.balance, timestamp: nowISO() });
  receiver.transactions.unshift({ id: Date.now()+1, type: "credit", description: `Transfer from ${sender.name}`, amount, balanceAfter: receiver.balance, timestamp: nowISO() });

  await updateDoc(doc(db, "accounts", senderUID), { balance: sender.balance, transactions: sender.transactions.slice(0, MAX_HISTORY) });
  await updateDoc(doc(db, "accounts", rUID), { balance: receiver.balance, transactions: receiver.transactions.slice(0, MAX_HISTORY) });
  
  const saved = await processAutoSave(senderUID, amount);
  return { success: true, message: `₹${amount} sent.`, saved };
}

// ─── UI HELPERS ──────────────────────────────────────────────
function showSection(id) { 
  ["section-login", "section-signup", "section-dashboard"].forEach(sid => document.getElementById(sid).classList.toggle("active", sid === id)); 
  document.getElementById("site-header").classList.toggle("hidden", id === "section-dashboard"); 
  const fab = document.getElementById("ai-fab");
  fab.style.display = (id === "section-dashboard") ? "flex" : "none";
}
function showToast(msg, isError = false) { const t = document.getElementById("toast"); document.getElementById("toast-message").textContent = msg; t.className = `toast show ${isError ? 'toast-error' : ''}`; setTimeout(() => t.classList.remove("show"), 3500); }
function openModal(id) { document.getElementById(id).classList.add("open"); }
function closeModal(id) { document.getElementById(id).classList.remove("open"); }
function formatBalance(n) { return Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 }); }

function populateDashboard(acc) {
  document.getElementById("dash-name").textContent = acc.name;
  document.getElementById("dash-uid").textContent = acc.uid;
  document.getElementById("dash-balance").textContent = formatBalance(acc.balance);
  document.getElementById("dash-piggy-balance").textContent = formatBalance(acc.piggyBank || 0);
  document.getElementById("dash-greeting").textContent = `Namaste, ${acc.name.split(" ")[0]}`;
  
  const list = document.getElementById("history-list");
  list.innerHTML = acc.transactions.length ? acc.transactions.map(t => `<div class="txn-row"><div class="txn-icon-wrap ${t.type}">${t.type === 'debit'?'↑':'↓'}</div><div class="txn-body"><span>${t.description}</span><small>${new Date(t.timestamp).toLocaleDateString()}</small></div><span class="${t.type}">₹${formatBalance(t.amount)}</span></div>`).join("") : `<p>No transactions.</p>`;
}

// ─── GEMINI AI ───────────────────────────────────────────────
async function askGemini(message) {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: "You are Virtu-Mitra, a simple finance AI. Be very brief (1 sentence). Context: Banking assistant.\nUser: " + message }] }] })
    });
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (e) { return "I'm offline right now."; }
}

// ─── INITIALIZATION ──────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  const savedUID = sessionStorage.getItem(SESSION_KEY);
  if (savedUID) { const res = await searchAccount(savedUID); if (res.success) { populateDashboard(res.account); showSection("section-dashboard"); } }

  // Login
  document.getElementById("login-form").addEventListener("submit", async e => {
    e.preventDefault();
    const res = await searchAccount(document.getElementById("login-uid").value);
    if (res.success && res.account.password === document.getElementById("login-password").value) {
      sessionStorage.setItem(SESSION_KEY, res.account.uid);
      populateDashboard(res.account); showSection("section-dashboard");
    } else showToast("Invalid Credentials", true);
  });

  // Signup
  document.getElementById("signup-form").addEventListener("submit", async e => {
    e.preventDefault();
    const res = await createAccount(
      document.getElementById("s-name").value, document.getElementById("s-age").value, 
      document.getElementById("s-gender").value, document.getElementById("s-marital").value,
      document.getElementById("s-pan").value, document.getElementById("s-aadhar").value,
      document.getElementById("s-email").value, document.getElementById("s-mobile").value,
      document.getElementById("s-address").value, document.getElementById("s-password").value,
      document.getElementById("s-mpin").value
    );
    if (res.success) { alert("Account Created! UID: " + res.account.uid); showSection("section-login"); }
    else showToast(res.message, true);
  });

  // Transfer Forms
  document.getElementById("internal-transfer-form").addEventListener("submit", async e => {
    e.preventDefault();
    const res = await internalTransfer(sessionStorage.getItem(SESSION_KEY), document.getElementById("int-receiver-uid").value, parseFloat(document.getElementById("int-amount").value), document.getElementById("int-mpin").value);
    if (res.success) { 
       closeModal("transfer-modal"); 
       const fresh = await searchAccount(sessionStorage.getItem(SESSION_KEY)); 
       populateDashboard(fresh.account);
       showToast(`Sent! Saved ₹${res.saved} in Piggy Bank.`);
    } else showToast(res.message, true);
  });

  // AI Chat
  document.getElementById("ai-chat-send").addEventListener("click", async () => {
    const input = document.getElementById("ai-chat-input");
    const msg = input.value; if(!msg) return;
    const body = document.getElementById("ai-chat-body");
    body.innerHTML += `<div>User: ${msg}</div>`;
    input.value = "";
    const reply = await askGemini(msg);
    body.innerHTML += `<div>Bot: ${reply}</div>`;
  });
  
  // Logout
  document.getElementById("logout-btn").addEventListener("click", () => { sessionStorage.clear(); location.reload(); });
});