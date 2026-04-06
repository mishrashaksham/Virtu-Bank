// ============================================================
//  VirtuBank — script.js (v8 — THE ULTIMATE CLOUD EDITION)
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// 1. FIREBASE CONFIGURATION
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

// 2. GEMINI AI KEY
const GEMINI_API_KEY = "AIzaSyBv3JECRwVdal3oc4994_UIagUbb3x5xBc"; 

const SESSION_KEY     = "virtuBankSession";
const INITIAL_BALANCE = 5000;
const MAX_HISTORY     = 5;

// --- HELPERS ---
function nowISO() { return new Date().toISOString(); }
function formatBalance(n) { return Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 }); }

// --- CORE DATABASE FUNCTIONS ---
async function searchAccount(uid) {
    if(!uid) return { success: false };
    const docSnap = await getDoc(doc(db, "accounts", uid.trim().toUpperCase()));
    return docSnap.exists() ? { success: true, account: docSnap.data() } : { success: false };
}

async function createAccount(data) {
    const uid = Array.from({ length: 10 }, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)]).join("");
    const account = { 
        ...data, uid, balance: INITIAL_BALANCE, piggyBank: 0, 
        transactions: [], createdAt: nowISO() 
    };
    await setDoc(doc(db, "accounts", uid), account);
    return uid;
}

// --- PIGGY BANK LOGIC ---
async function handleSavings(uid, amount) {
    const target = Math.ceil(amount / 100) * 100;
    const savings = parseFloat((target - amount).toFixed(2));
    if (savings > 0) {
        const res = await searchAccount(uid);
        const acc = res.account;
        if (acc.balance >= savings) {
            acc.balance -= savings;
            acc.piggyBank = (acc.piggyBank || 0) + savings;
            acc.transactions.unshift({ type: 'debit', description: `Piggy Bank Save`, amount: savings, timestamp: nowISO() });
            await updateDoc(doc(db, "accounts", uid), { 
                balance: acc.balance, 
                piggyBank: acc.piggyBank, 
                transactions: acc.transactions.slice(0, MAX_HISTORY) 
            });
            return savings;
        }
    }
    return 0;
}

// --- UI NAVIGATION ---
function showSection(id) { 
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.getElementById("site-header").classList.toggle("hidden", id === "section-dashboard");
    document.getElementById("ai-fab").style.display = (id === "section-dashboard") ? "flex" : "none";
}

function populateDashboard(acc) {
    document.getElementById("dash-name").textContent = acc.name;
    document.getElementById("dash-uid").textContent = acc.uid;
    document.getElementById("dash-balance").textContent = formatBalance(acc.balance);
    document.getElementById("dash-piggy-balance").textContent = formatBalance(acc.piggyBank || 0);
    document.getElementById("dash-greeting").textContent = `Namaste, ${acc.name.split(" ")[0]}`;
    
    const list = document.getElementById("history-list");
    list.innerHTML = acc.transactions.length ? acc.transactions.map(t => `
        <div class="txn-row">
            <div class="txn-body"><span>${t.description}</span></div>
            <span class="${t.type}">₹${formatBalance(t.amount)}</span>
        </div>`).join("") : `<p>No transactions yet.</p>`;
}

// --- MAIN EVENT LISTENERS ---
document.addEventListener("DOMContentLoaded", async () => {
    
    // Auth Check
    const session = sessionStorage.getItem(SESSION_KEY);
    if (session) {
        const res = await searchAccount(session);
        if (res.success) { populateDashboard(res.account); showSection("section-dashboard"); }
    }

    // Nav Fixes (Module mode me ye aise hi kaam karenge)
    document.getElementById("nav-login-btn").onclick = () => showSection("section-login");
    document.getElementById("nav-signup-btn").onclick = () => showSection("section-signup");
    document.getElementById("goto-signup-link").onclick = () => showSection("section-signup");
    document.getElementById("goto-login-link").onclick = () => showSection("section-login");

    // Login Form
    document.getElementById("login-form").onsubmit = async (e) => {
        e.preventDefault();
        const uid = document.getElementById("login-uid").value;
        const pass = document.getElementById("login-password").value;
        const res = await searchAccount(uid);
        if (res.success && res.account.password === pass) {
            sessionStorage.setItem(SESSION_KEY, res.account.uid);
            populateDashboard(res.account);
            showSection("section-dashboard");
        } else { alert("Invalid Credentials!"); }
    };

    // Signup Form
    document.getElementById("signup-form").onsubmit = async (e) => {
        e.preventDefault();
        const data = {
            name: document.getElementById("s-name").value,
            email: document.getElementById("s-email").value,
            password: document.getElementById("s-password").value,
            pan: document.getElementById("s-pan").value,
            mpin: document.getElementById("s-mpin").value
        };
        const uid = await createAccount(data);
        alert("Account Created! Your UID is: " + uid);
        showSection("section-login");
    };

    // Transfer Logic
    document.getElementById("internal-transfer-form").onsubmit = async (e) => {
        e.preventDefault();
        const senderUID = sessionStorage.getItem(SESSION_KEY);
        const receiverUID = document.getElementById("int-receiver-uid").value;
        const amount = parseFloat(document.getElementById("int-amount").value);
        
        const sRes = await searchAccount(senderUID);
        const rRes = await searchAccount(receiverUID);

        if (sRes.success && rRes.success && sRes.account.balance >= amount) {
            const sAcc = sRes.account;
            const rAcc = rRes.account;

            sAcc.balance -= amount;
            rAcc.balance += amount;

            sAcc.transactions.unshift({ type: 'debit', description: `Paid ${rAcc.name}`, amount, timestamp: nowISO() });
            rAcc.transactions.unshift({ type: 'credit', description: `From ${sAcc.name}`, amount, timestamp: nowISO() });

            await updateDoc(doc(db, "accounts", senderUID), { balance: sAcc.balance, transactions: sAcc.transactions.slice(0, 5) });
            await updateDoc(doc(db, "accounts", receiverUID), { balance: rAcc.balance, transactions: rAcc.transactions.slice(0, 5) });

            const saved = await handleSavings(senderUID, amount);
            alert(`Transfer Success! Piggy Bank saved ₹${saved}`);
            location.reload();
        } else { alert("Transfer Failed! Check balance or UID."); }
    };

    // AI Chat Fix
    document.getElementById("ai-chat-send").onclick = async () => {
        const input = document.getElementById("ai-chat-input");
        const chatBody = document.getElementById("ai-chat-body");
        if (!input.value) return;

        chatBody.innerHTML += `<div class="chat-msg user-msg">${input.value}</div>`;
        const prompt = input.value;
        input.value = "";

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: "Briefly answer this banking query: " + prompt }] }] })
        });
        const result = await response.json();
        const reply = result.candidates[0].content.parts[0].text;
        chatBody.innerHTML += `<div class="chat-msg bot-msg">${reply}</div>`;
        chatBody.scrollTop = chatBody.scrollHeight;
    };

    document.getElementById("logout-btn").onclick = () => { sessionStorage.clear(); location.reload(); };
});

// Modals Open/Close Helper
window.openModal = (id) => document.getElementById(id).classList.add("open");
window.closeModal = (id) => document.getElementById(id).classList.remove("open");
document.getElementById("open-transfer-btn").onclick = () => window.openModal("transfer-modal");
document.getElementById("transfer-close-btn").onclick = () => window.closeModal("transfer-modal");
document.getElementById("ai-fab").onclick = () => document.getElementById("ai-chat-window").classList.toggle("open");
document.getElementById("ai-close-btn").onclick = () => document.getElementById("ai-chat-window").classList.remove("open");