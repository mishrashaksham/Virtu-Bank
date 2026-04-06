// ============================================================
//  VirtuBank — script.js  (v5 — Voice Pay, Favorites, UPI, & Gemini AI)
// ============================================================

const DB_KEY          = "virtuBankDB";
const SESSION_KEY     = "virtuBankSession";
const INITIAL_BALANCE = 5000;
const UID_LENGTH      = 10;
const UID_CHARSET     = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const MAX_HISTORY     = 5;
const MAX_FAVORITES   = 5;

// 🔥🚨 YAHAN APNI GOOGLE GEMINI API KEY DAALNI HAI 🚨🔥
const GEMINI_API_KEY  = "YOUR_GEMINI_API_KEY_HERE"; 

// ─── DATA LAYER ──────────────────────────────────────────────
function loadDB() { try { const raw = localStorage.getItem(DB_KEY); return raw ? JSON.parse(raw) : []; } catch (e) { return []; } }
function saveDB(db) { try { localStorage.setItem(DB_KEY, JSON.stringify(db)); return true; } catch (e) { return false; } }
function generateUID(db) { const used = new Set(db.map(a => a.uid)); let uid; do { uid = Array.from({ length: UID_LENGTH }, () => UID_CHARSET[crypto.getRandomValues(new Uint8Array(1))[0] % UID_CHARSET.length]).join(""); } while (used.has(uid)); return uid; }
function nowISO() { return new Date().toISOString(); }

function createAccount(name, age, gender, maritalStatus, pan, aadhar, email, mobile, address, password, mpin) {
  const fields = { name, age, gender, maritalStatus, pan, aadhar, email, mobile, address, password, mpin };
  for (const [k, v] of Object.entries(fields)) { if (!v || String(v).trim() === "") return { success: false, message: `'${k}' is required.` }; }
  const db = loadDB(); const panUp = String(pan).trim().toUpperCase(); const emailLo = String(email).trim().toLowerCase(); const mobStr = String(mobile).trim(); const aadharSt = String(aadhar).trim();
  if (db.some(a => a.pan === panUp)) return { success: false, message: "PAN already registered." };
  if (db.some(a => a.email === emailLo)) return { success: false, message: "Email already registered." };
  const account = { uid: generateUID(db), name: String(name).trim(), age: Number(age), gender: String(gender).trim(), maritalStatus: String(maritalStatus).trim(), pan: panUp, aadhar: aadharSt, email: emailLo, mobile: mobStr, address: String(address).trim(), password: String(password), mpin: String(mpin), balance: INITIAL_BALANCE, transactions: [], favorites: [], accountStatus: "active", createdAt: nowISO(), updatedAt: nowISO() };
  db.push(account); if (!saveDB(db)) return { success: false, message: "Storage error." };
  return { success: true, message: "Account created.", account };
}

function searchAccount(uid) {
  const db = loadDB(); const found = db.find(a => a.uid === String(uid).trim().toUpperCase());
  if (!found) return { success: false, message: `No account found: ${uid}` };
  if (!found.favorites) found.favorites = []; 
  return { success: true, account: found };
}

function storeTransaction(account, details) {
  account.transactions.unshift({ id: Date.now(), type: details.type, description: details.description, amount: details.amount, balanceAfter: details.balanceAfter, timestamp: nowISO() });
  if (account.transactions.length > MAX_HISTORY) account.transactions.pop();
  account.updatedAt = nowISO();
}

function externalTransfer(senderUID, upiID, amount, mpin) {
  if (!amount || amount <= 0) return { success: false, message: "Enter a valid amount." };
  const db = loadDB(); const idx = db.findIndex(a => a.uid === senderUID);
  if (idx === -1) return { success: false, message: "Sender account not found." };
  const sender = db[idx];
  if (sender.mpin !== String(mpin).trim()) return { success: false, message: "Incorrect MPIN." };
  if (sender.balance < amount) return { success: false, message: `Insufficient balance. Available: ₹${formatBalance(sender.balance)}` };
  sender.balance = parseFloat((sender.balance - amount).toFixed(2));
  storeTransaction(sender, { type: "debit", description: `UPI Transfer to ${upiID}`, amount, balanceAfter: sender.balance });
  saveDB(db); return { success: true, newBalance: sender.balance };
}

function internalTransfer(senderUID, receiverUID, amount, mpin) {
  const rUID = String(receiverUID).trim().toUpperCase();
  if (!amount || amount <= 0) return { success: false, message: "Enter a valid amount." };
  const db = loadDB(); const sIdx = db.findIndex(a => a.uid === senderUID); const rIdx = db.findIndex(a => a.uid === rUID);
  if (sIdx === -1) return { success: false, message: "Sender account not found." };
  if (rIdx === -1) return { success: false, message: `No VirtuBank account found for UID: ${rUID}` };
  const sender = db[sIdx]; const receiver = db[rIdx];
  if (sender.uid === receiver.uid) return { success: false, message: "Cannot transfer to yourself."};
  if (sender.mpin !== String(mpin).trim()) return { success: false, message: "Incorrect MPIN." };
  if (sender.balance < amount) return { success: false, message: "Insufficient balance." };
  sender.balance = parseFloat((sender.balance - amount).toFixed(2));
  receiver.balance = parseFloat((receiver.balance + amount).toFixed(2));
  storeTransaction(sender, { type: "debit", description: `Transfer to ${receiver.name} (${rUID})`, amount, balanceAfter: sender.balance });
  storeTransaction(receiver, { type: "credit", description: `Transfer from ${sender.name} (${senderUID})`, amount, balanceAfter: receiver.balance });
  saveDB(db); return { success: true, message: `₹${formatBalance(amount)} sent to ${receiver.name}.` };
}

function deleteAccount(uid) { const db = loadDB(); const newDB = db.filter(a => a.uid !== uid); saveDB(newDB); return { success: true }; }

// ─── FAVORITES LOGIC ──────────────────────────────────────────
function addFavorite(ownerUID, alias, targetUID) {
  const db = loadDB(); const acc = db.find(a => a.uid === ownerUID);
  if(!acc) return { success: false, message: "User not found" };
  if(!acc.favorites) acc.favorites = [];
  if(acc.favorites.length >= MAX_FAVORITES) return { success: false, message: `You can only save up to ${MAX_FAVORITES} favorites.`};
  if(acc.favorites.some(f => f.alias.toLowerCase() === alias.toLowerCase())) return { success: false, message: "Alias already exists."};
  if(!db.find(a => a.uid === targetUID)) return { success: false, message: "Target UID does not exist in VirtuBank."};
  acc.favorites.push({ alias: alias.trim(), uid: targetUID.trim().toUpperCase() });
  saveDB(db); return { success: true };
}
function removeFavorite(ownerUID, alias) {
  const db = loadDB(); const acc = db.find(a => a.uid === ownerUID);
  if(acc && acc.favorites) { acc.favorites = acc.favorites.filter(f => f.alias !== alias); saveDB(db); }
}

// ─── DOM & UI HELPERS ────────────────────────────────────────
function showSection(id) { 
  ["section-login", "section-signup", "section-dashboard"].forEach(sid => document.getElementById(sid).classList.toggle("active", sid === id)); 
  document.getElementById("site-header").classList.toggle("hidden", id === "section-dashboard"); 
  
  // Show AI Chatbot FAB only on Dashboard
  const fab = document.getElementById("ai-fab");
  if(id === "section-dashboard") { fab.style.display = "flex"; } else { fab.style.display = "none"; closeModal("ai-chat-window"); }
}
function showToast(msg, isError = false, duration = 3800) { const t = document.getElementById("toast"); document.getElementById("toast-message").textContent = msg; t.className = `toast show ${isError ? 'toast-error' : ''}`; clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove("show"), duration); }
function openModal(id) { document.getElementById(id).classList.add("open"); }
function closeModal(id) { document.getElementById(id).classList.remove("open"); }
function markError(inId, errId, msg) { document.getElementById(inId)?.classList.add("error"); document.getElementById(errId).textContent = msg; }
function clearFormErrors(formId) { document.querySelectorAll(`#${formId} .field-error`).forEach(e => e.textContent = ""); document.querySelectorAll(`#${formId} .field-input`).forEach(e => e.classList.remove("error")); }
function formatBalance(n) { return Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function getSessionUID() { return sessionStorage.getItem(SESSION_KEY); }

function populateDashboard(acc) {
  document.getElementById("dash-name").textContent = acc.name;
  document.getElementById("dash-uid").textContent = acc.uid;
  document.getElementById("dash-balance").textContent = formatBalance(acc.balance);
  document.getElementById("dash-greeting").textContent = `Good day, ${acc.name.split(" ")[0]}`;
  document.getElementById("dash-txn-count").textContent = `${acc.transactions.length} record(s)`;
  document.getElementById("dash-fav-count").textContent = `${(acc.favorites || []).length} / 5`;
  
  const list = document.getElementById("history-list");
  document.getElementById("history-count-badge").textContent = `${acc.transactions.length} / 5`;
  if (!acc.transactions.length) list.innerHTML = `<div class="history-empty"><p>No transactions yet.</p></div>`;
  else list.innerHTML = acc.transactions.map((t, i) => {
    const isDeb = t.type === "debit";
    return `<div class="txn-row" style="animation-delay:${i * 0.05}s">
      <div class="txn-icon-wrap ${isDeb ? 'debit' : 'credit'}">${isDeb ? '↑' : '↓'}</div>
      <div class="txn-body"><span class="txn-description">${t.description}</span><span class="txn-meta">${new Date(t.timestamp).toLocaleDateString()} · Bal: ₹${formatBalance(t.balanceAfter)}</span></div>
      <span class="txn-amount ${isDeb ? 'debit' : 'credit'}">${isDeb ? '−' : '+'}₹${formatBalance(t.amount)}</span>
    </div>`;
  }).join("");
}

function renderFavorites() {
  const acc = searchAccount(getSessionUID()).account;
  const list = document.getElementById("fav-list-container");
  if(!acc.favorites || acc.favorites.length === 0) { list.innerHTML = `<p style="color:var(--text-muted); font-size: 13px;">No favorites saved yet.</p>`; return; }
  list.innerHTML = acc.favorites.map(f => `
    <div class="fav-item">
      <div class="fav-item-info">
        <span class="fav-item-name">${f.alias}</span>
        <span class="fav-item-uid">${f.uid}</span>
      </div>
      <button class="fav-del-btn" onclick="window.delFav('${f.alias}')">✕</button>
    </div>
  `).join("");
}
window.delFav = function(alias) { removeFavorite(getSessionUID(), alias); renderFavorites(); refreshDash(); showToast(`${alias} removed from favorites.`); }
function refreshDash() { const res = searchAccount(getSessionUID()); if (res.success) populateDashboard(res.account); }


// ─── VIRTU-MITRA GEMINI AI CHATBOT ───────────────────────────
const aiFab = document.getElementById("ai-fab");
const aiChatWindow = document.getElementById("ai-chat-window");
const aiCloseBtn = document.getElementById("ai-close-btn");
const aiChatBody = document.getElementById("ai-chat-body");
const aiChatInput = document.getElementById("ai-chat-input");
const aiChatSend = document.getElementById("ai-chat-send");

// GSC specific context prompt
const SYSTEM_PROMPT = `You are Virtu-Mitra, an AI financial advisor integrated into VirtuBank. You help users (especially from rural areas like AP/Amaravati) with financial literacy, saving schemes, micro-loans, and avoiding scams. Keep your answers very short (1-2 sentences max), simple, and friendly. Answer in the language the user speaks (English, Hindi, or Telugu). Never give complex investment advice, just basic safe banking tips.`;

aiFab.addEventListener("click", () => { aiChatWindow.classList.add("open"); aiFab.style.transform = "scale(0)"; });
aiCloseBtn.addEventListener("click", () => { aiChatWindow.classList.remove("open"); aiFab.style.transform = "scale(1)"; });

function appendMessage(text, sender) {
  const div = document.createElement("div");
  div.className = `chat-msg ${sender === 'user' ? 'user-msg' : 'bot-msg'}`;
  div.textContent = text;
  aiChatBody.appendChild(div);
  aiChatBody.scrollTop = aiChatBody.scrollHeight;
}

async function askGemini(message) {
  if (GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
    return "Error: Please add your Gemini API Key in script.js to use Virtu-Mitra.";
  }
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\nUser: " + message }] }
        ]
      })
    });
    
    if (!response.ok) throw new Error("API Limit or Error");
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error(error);
    return "Sorry, Virtu-Mitra is currently resting. Please try again later.";
  }
}

aiChatSend.addEventListener("click", async () => {
  const text = aiChatInput.value.trim();
  if(!text) return;
  appendMessage(text, "user");
  aiChatInput.value = "";
  
  const loader = document.createElement("div");
  loader.className = "chat-msg bot-msg typing-indicator";
  loader.textContent = "Thinking...";
  aiChatBody.appendChild(loader);
  aiChatBody.scrollTop = aiChatBody.scrollHeight;

  const reply = await askGemini(text);
  loader.remove();
  appendMessage(reply, "bot");
});

aiChatInput.addEventListener("keypress", (e) => { if(e.key === "Enter") aiChatSend.click(); });


// ─── VOICE RECOGNITION SETUP ─────────────────────────────────
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = 'en-IN';
  
  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript.toLowerCase();
    document.getElementById("voice-transcript").innerHTML = `"${transcript}"`;
    
    const match = transcript.match(/(?:send|pay|transfer)\s+(\d+)\s+(?:to)\s+(.+)/i);
    setTimeout(() => {
      closeModal("voice-modal");
      if(match) {
        const amount = parseInt(match[1], 10);
        const alias = match[2].replace(/[^\w\s]/gi, '').trim();
        const acc = searchAccount(getSessionUID()).account;
        const targetFav = (acc.favorites || []).find(f => f.alias.toLowerCase() === alias);
        
        if(targetFav) {
          document.getElementById("int-amount").value = amount;
          document.getElementById("int-receiver-uid").value = targetFav.uid;
          document.querySelectorAll(".modal-tab").forEach(t => t.classList.remove("active"));
          document.querySelectorAll(".transfer-panel").forEach(p => p.classList.remove("active"));
          document.getElementById("tab-internal").classList.add("active");
          document.getElementById("transfer-panel-internal").classList.add("active");
          openModal("transfer-modal");
          showToast(`Voice matched! Enter MPIN to send ₹${amount} to ${targetFav.alias}.`);
        } else { showToast(`Could not find "${alias}" in your Favorites.`, true); }
      } else { showToast(`Could not understand. Say "Send 500 to Nikki"`, true); }
    }, 1500);
  };
  recognition.onerror = function(e) { document.getElementById("voice-transcript").textContent = "Microphone error. Try again."; setTimeout(() => closeModal("voice-modal"), 2000); };
}

// ─── EVENT LISTENERS ──────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const savedUID = getSessionUID();
  if (savedUID) { const res = searchAccount(savedUID); if (res.success) { populateDashboard(res.account); showSection("section-dashboard"); } else sessionStorage.removeItem(SESSION_KEY); }

  document.getElementById("nav-login-btn").addEventListener("click", () => showSection("section-login"));
  document.getElementById("nav-signup-btn").addEventListener("click", () => showSection("section-signup"));
  document.getElementById("goto-signup-link").addEventListener("click", () => { showSection("section-signup"); window.scrollTo({top:0});});
  document.getElementById("goto-login-link").addEventListener("click", () => { showSection("section-login"); window.scrollTo({top:0});});

  document.querySelectorAll(".toggle-pass").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.target);
      if (input.type === "password") { input.type = "text"; btn.innerHTML = '🙈'; } else { input.type = "password"; btn.innerHTML = '👁'; }
    });
  });

  document.getElementById("signup-form").addEventListener("submit", e => {
    e.preventDefault(); clearFormErrors("signup-form");
    const btn = document.getElementById("signup-submit-btn"); btn.disabled = true; btn.querySelector(".btn-text").textContent = "Creating Account...";
    setTimeout(() => {
      btn.disabled = false; btn.querySelector(".btn-text").textContent = "Create My Account";
      const name = document.getElementById("s-name").value, age = document.getElementById("s-age").value, gender = document.getElementById("s-gender").value, marital = document.getElementById("s-marital").value, pan = document.getElementById("s-pan").value, aadhar = document.getElementById("s-aadhar").value, email = document.getElementById("s-email").value, mobile = document.getElementById("s-mobile").value, address = document.getElementById("s-address").value, password = document.getElementById("s-password").value, mpin = document.getElementById("s-mpin").value;
      if(password.length < 8) { markError("s-password", "s-password-err", "Min 8 characters required."); return; }
      if(mpin.length < 4) { markError("s-mpin", "s-mpin-err", "Min 4 digits required."); return; }
      const res = createAccount(name, age, gender, marital, pan, aadhar, email, mobile, address, password, mpin);
      if (res.success) {
        document.getElementById("signup-form").reset(); document.getElementById("modal-uid-value").textContent = res.account.uid; openModal("uid-modal");
        document.getElementById("modal-proceed-btn").onclick = () => { closeModal("uid-modal"); showSection("section-login"); document.getElementById("login-uid").value = res.account.uid; };
        document.getElementById("copy-uid-btn").onclick = () => { navigator.clipboard.writeText(res.account.uid); document.getElementById("copy-uid-btn").textContent = "Copied!"; setTimeout(() => document.getElementById("copy-uid-btn").textContent = "Copy", 2000); };
      } else { if(res.message.includes("PAN")) markError("s-pan", "s-pan-err", res.message); else if(res.message.includes("Email")) markError("s-email", "s-email-err", res.message); else showToast(res.message, true); }
    }, 600);
  });

  document.getElementById("login-form").addEventListener("submit", e => {
    e.preventDefault(); clearFormErrors("login-form");
    const uid = document.getElementById("login-uid").value.trim().toUpperCase(); const pwd = document.getElementById("login-password").value;
    const res = searchAccount(uid);
    if (!res.success) { markError("login-uid","login-uid-err","No account found."); return; }
    if (res.account.password !== pwd) { markError("login-password","login-pass-err","Incorrect password."); return; }
    sessionStorage.setItem(SESSION_KEY, uid); populateDashboard(res.account); showSection("section-dashboard"); showToast(`Welcome back, ${res.account.name.split(" ")[0]}!`);
  });

  document.getElementById("logout-btn").addEventListener("click", () => { sessionStorage.removeItem(SESSION_KEY); showSection("section-login"); showToast("Signed out."); });
  document.getElementById("open-fav-btn").addEventListener("click", () => { renderFavorites(); openModal("favorites-modal"); });
  document.getElementById("fav-close-btn").addEventListener("click", () => closeModal("favorites-modal"));
  document.getElementById("add-fav-form").addEventListener("submit", e => { e.preventDefault(); const alias = document.getElementById("fav-name").value, targetUID = document.getElementById("fav-uid").value; const res = addFavorite(getSessionUID(), alias, targetUID); if(res.success) { document.getElementById("add-fav-form").reset(); renderFavorites(); refreshDash(); showToast("Favorite added!"); } else { showToast(res.message, true); } });

  document.getElementById("open-voice-btn").addEventListener("click", () => { if(!SpeechRecognition) { showToast("Voice Pay is not supported in this browser.", true); return; } document.getElementById("voice-transcript").innerHTML = "Listening..."; openModal("voice-modal"); try { recognition.start(); } catch(e) {} });
  document.getElementById("voice-close-btn").addEventListener("click", () => { closeModal("voice-modal"); recognition.stop(); });

  document.getElementById("open-transfer-btn").addEventListener("click", () => { document.getElementById("external-transfer-form").reset(); document.getElementById("internal-transfer-form").reset(); openModal("transfer-modal"); });
  document.getElementById("transfer-close-btn").addEventListener("click", () => closeModal("transfer-modal"));
  document.querySelectorAll(".modal-tab").forEach(t => t.addEventListener("click", () => { document.querySelectorAll(".modal-tab").forEach(x => x.classList.remove("active")); document.querySelectorAll(".transfer-panel").forEach(x => x.classList.remove("active")); t.classList.add("active"); document.getElementById(`transfer-panel-${t.dataset.tab}`).classList.add("active"); }));

  document.getElementById("external-transfer-form").addEventListener("submit", e => { e.preventDefault(); clearFormErrors("external-transfer-form"); const upiID = document.getElementById("ext-upi").value.trim(), amt = parseFloat(document.getElementById("ext-amount").value), mpin = document.getElementById("ext-mpin").value.trim(); if(!upiID || !/^[a-zA-Z0-9.\-_]+@[a-zA-Z]+$/.test(upiID)) { markError("ext-upi","ext-upi-err","Invalid UPI format"); return; } const res = externalTransfer(getSessionUID(), upiID, amt, mpin); if (res.success) { closeModal("transfer-modal"); refreshDash(); showToast(`₹${formatBalance(amt)} sent to ${upiID}.`); } else { showToast(res.message, true); } });
  document.getElementById("internal-transfer-form").addEventListener("submit", e => { e.preventDefault(); clearFormErrors("internal-transfer-form"); const rUID = document.getElementById("int-receiver-uid").value.trim().toUpperCase(), amt = parseFloat(document.getElementById("int-amount").value), mpin = document.getElementById("int-mpin").value.trim(); const res = internalTransfer(getSessionUID(), rUID, amt, mpin); if (res.success) { closeModal("transfer-modal"); refreshDash(); showToast(res.message); } else { showToast(res.message, true); } });

  document.getElementById("toggle-history-btn").addEventListener("click", () => { const p = document.getElementById("history-panel"); p.classList.toggle("open"); });
  document.querySelectorAll(".modal-backdrop").forEach(m => m.addEventListener("click", e => { if (e.target === e.currentTarget) closeModal(m.id); }));
  
  let _captchaAns = 0;
  document.getElementById("open-delete-btn").addEventListener("click", () => { const a = Math.floor(Math.random()*10)+1, b = Math.floor(Math.random()*10)+1; _captchaAns = a+b; document.getElementById("captcha-question").textContent = `What is ${a} + ${b}?`; document.getElementById("captcha-answer").value = ""; openModal("delete-modal"); });
  document.getElementById("delete-close-btn").addEventListener("click", () => closeModal("delete-modal"));
  document.getElementById("confirm-delete-btn").addEventListener("click", () => { if(parseInt(document.getElementById("captcha-answer").value) !== _captchaAns) { document.getElementById("captcha-err").textContent = "Incorrect"; return; } deleteAccount(getSessionUID()); sessionStorage.removeItem(SESSION_KEY); closeModal("delete-modal"); showSection("section-login"); showToast("Account deleted."); });
});