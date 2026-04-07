// ============================================================
//  VirtuBank — script.js (v10 — The Master UI/UX Update)
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

function showToast(msg) {
    const t = document.getElementById("toast");
    if(t) {
        document.getElementById("toast-message").textContent = msg;
        t.className = "toast show";
        setTimeout(() => t.classList.remove("show"), 3500);
    } else {
        alert(msg);
    }
}

// UI NAVIGATION HELPER
function showSection(id) { 
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if(target) target.classList.add('active');
    
    document.getElementById("site-header").classList.toggle("hidden", id === "section-dashboard");
    document.getElementById("ai-fab").style.display = (id === "section-dashboard") ? "flex" : "none";
}

// DASHBOARD POPULATOR (WITH BADGES)
function populateDashboard(acc) {
    document.getElementById("dash-name").textContent = acc.name;
    document.getElementById("dash-uid").textContent = acc.uid;
    document.getElementById("dash-balance").textContent = formatBalance(acc.balance);
    document.getElementById("dash-piggy-balance").textContent = formatBalance(acc.piggyBank || 0);
    document.getElementById("dash-greeting").textContent = `Namaste, ${acc.name.split(" ")[0]}`;
    document.getElementById("dash-txn-count").textContent = acc.transactions ? acc.transactions.length : 0;
    
    const badgeMap = {
        'external': '<span class="txn-badge badge-ext">UPI Ext</span>',
        'internal': '<span class="txn-badge badge-int">Virtu Int</span>',
        'piggy': '<span class="txn-badge badge-piggy">Piggy Bank</span>'
    };

    const list = document.getElementById("history-list");
    if (acc.transactions && acc.transactions.length > 0) {
        list.innerHTML = acc.transactions.map(t => {
            const badge = t.category ? (badgeMap[t.category] || '') : '';
            return `
            <div class="txn-row">
                <div class="txn-icon-wrap ${t.type}">${t.type === 'debit'?'↑':'↓'}</div>
                <div class="txn-body">
                    <span class="txn-description">${t.description} ${badge}</span>
                    <span class="txn-meta">${new Date(t.timestamp).toLocaleDateString()}</span>
                </div>
                <span class="txn-amount ${t.type}">${t.type === 'debit'?'-':'+'}₹${formatBalance(t.amount)}</span>
            </div>`;
        }).join("");
    } else {
        list.innerHTML = `<p style="text-align:center; opacity:0.6; padding: 20px;">No transactions yet.</p>`;
    }
}

// --- CORE DATABASE FUNCTIONS ---
async function searchAccount(uid) {
    if(!uid) return { success: false };
    try {
        const docSnap = await getDoc(doc(db, "accounts", uid.trim().toUpperCase()));
        if (docSnap.exists()) {
            return { success: true, account: docSnap.data() };
        }
    } catch(e) {
        console.error("DB Error:", e);
    }
    return { success: false };
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
        if(res.success) {
            const acc = res.account;
            if (acc.balance >= savings) {
                acc.balance -= savings;
                acc.piggyBank = (acc.piggyBank || 0) + savings;
                acc.transactions.unshift({ type: 'debit', category: 'piggy', description: `Auto-Save`, amount: savings, timestamp: nowISO() });
                await updateDoc(doc(db, "accounts", uid), { 
                    balance: acc.balance, 
                    piggyBank: acc.piggyBank, 
                    transactions: acc.transactions.slice(0, MAX_HISTORY) 
                });
                return savings;
            }
        }
    }
    return 0;
}


// --- MAIN EVENT LISTENERS (WAIT FOR DOM) ---
document.addEventListener("DOMContentLoaded", async () => {
    
    // Auth Check on Reload
    const session = sessionStorage.getItem(SESSION_KEY);
    if (session) {
        const res = await searchAccount(session);
        if (res.success) { 
            populateDashboard(res.account); 
            showSection("section-dashboard"); 
        } else {
            sessionStorage.removeItem(SESSION_KEY);
        }
    }

    // Navigation Buttons
    document.getElementById("nav-login-btn")?.addEventListener("click", () => showSection("section-login"));
    document.getElementById("nav-signup-btn")?.addEventListener("click", () => showSection("section-signup"));
    document.getElementById("goto-signup-link")?.addEventListener("click", () => showSection("section-signup"));
    document.getElementById("goto-login-link")?.addEventListener("click", () => showSection("section-login"));

    // Login Form Submit
    document.getElementById("login-form")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = document.getElementById("login-submit-btn");
        btn.disabled = true; btn.querySelector(".btn-text").textContent = "Checking...";
        
        const uid = document.getElementById("login-uid").value.trim().toUpperCase();
        const pass = document.getElementById("login-password").value;
        
        const res = await searchAccount(uid);
        if (res.success && res.account.password === pass) {
            sessionStorage.setItem(SESSION_KEY, res.account.uid);
            populateDashboard(res.account);
            showSection("section-dashboard");
            showToast("Login Successful!");
        } else { 
            showToast("Invalid UID or Password!"); 
        }
        
        btn.disabled = false; btn.querySelector(".btn-text").textContent = "Sign In";
    });

    // Signup Form Submit
    document.getElementById("signup-form")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = document.getElementById("signup-submit-btn");
        btn.disabled = true; btn.querySelector(".btn-text").textContent = "Creating...";

        const data = {
            name: document.getElementById("s-name").value,
            age: document.getElementById("s-age").value,
            gender: document.getElementById("s-gender").value,
            pan: document.getElementById("s-pan").value.toUpperCase(),
            email: document.getElementById("s-email").value.toLowerCase(),
            password: document.getElementById("s-password").value,
            mpin: document.getElementById("s-mpin").value
        };

        try {
            const uid = await createAccount(data);
            document.getElementById("modal-uid-value").textContent = uid;
            document.getElementById("uid-modal").classList.add("open");
        } catch(err) {
            showToast("Error creating account.");
        }
        
        btn.disabled = false; btn.querySelector(".btn-text").textContent = "Create My Account";
    });

    // Modal close logic after signup
    document.getElementById("modal-proceed-btn")?.addEventListener("click", () => {
        document.getElementById("uid-modal").classList.remove("open");
        document.getElementById("signup-form").reset();
        showSection("section-login");
    });

    // --- TRANSFER: INTERNAL ---
    document.getElementById("internal-transfer-form")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const senderUID = sessionStorage.getItem(SESSION_KEY);
        const receiverUID = document.getElementById("int-receiver-uid").value.trim().toUpperCase();
        const amount = parseFloat(document.getElementById("int-amount").value);
        const mpin = document.getElementById("int-mpin").value;
        
        if (senderUID === receiverUID) { showToast("Cannot transfer to yourself."); return; }

        const sRes = await searchAccount(senderUID);
        const rRes = await searchAccount(receiverUID);

        if (sRes.success && rRes.success) {
            const sAcc = sRes.account;
            const rAcc = rRes.account;

            if(sAcc.mpin !== mpin) { showToast("Invalid MPIN"); return; }
            if(sAcc.balance < amount) { showToast("Insufficient Balance"); return; }

            sAcc.balance -= amount;
            rAcc.balance += amount;

            sAcc.transactions.unshift({ type: 'debit', category: 'internal', description: `Paid ${rAcc.name}`, amount, timestamp: nowISO() });
            rAcc.transactions.unshift({ type: 'credit', category: 'internal', description: `From ${sAcc.name}`, amount, timestamp: nowISO() });

            await updateDoc(doc(db, "accounts", senderUID), { balance: sAcc.balance, transactions: sAcc.transactions.slice(0, MAX_HISTORY) });
            await updateDoc(doc(db, "accounts", receiverUID), { balance: rAcc.balance, transactions: rAcc.transactions.slice(0, MAX_HISTORY) });

            const saved = await handleSavings(senderUID, amount);
            document.getElementById("transfer-modal").classList.remove("open");
            document.getElementById("internal-transfer-form").reset();
            
            showToast(`Sent! Auto-saved ₹${saved} in Piggy Bank.`);
            
            // Refresh Dashboard
            const freshRes = await searchAccount(senderUID);
            populateDashboard(freshRes.account);
        } else { 
            showToast("Receiver UID not found."); 
        }
    });

    // --- TRANSFER: EXTERNAL (UPI) - FIXED! ---
    document.getElementById("external-transfer-form")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const senderUID = sessionStorage.getItem(SESSION_KEY);
        const upiID = document.getElementById("ext-upi").value.trim();
        const amount = parseFloat(document.getElementById("ext-amount").value);
        const mpin = document.getElementById("ext-mpin").value;

        const sRes = await searchAccount(senderUID);

        if (sRes.success) {
            const sAcc = sRes.account;

            if(sAcc.mpin !== mpin) { showToast("Invalid MPIN"); return; }
            if(sAcc.balance < amount) { showToast("Insufficient Balance"); return; }

            sAcc.balance -= amount;
            sAcc.transactions.unshift({ type: 'debit', category: 'external', description: `UPI to ${upiID}`, amount, timestamp: nowISO() });

            await updateDoc(doc(db, "accounts", senderUID), { balance: sAcc.balance, transactions: sAcc.transactions.slice(0, MAX_HISTORY) });

            const saved = await handleSavings(senderUID, amount);
            document.getElementById("transfer-modal").classList.remove("open");
            document.getElementById("external-transfer-form").reset();
            
            showToast(`UPI Transfer Sent! Auto-saved ₹${saved}`);
            
            // Refresh Dashboard
            const freshRes = await searchAccount(senderUID);
            populateDashboard(freshRes.account);
        }
    });

    // Modals Open/Close
    document.getElementById("open-transfer-btn")?.addEventListener("click", () => document.getElementById("transfer-modal").classList.add("open"));
    document.getElementById("transfer-close-btn")?.addEventListener("click", () => document.getElementById("transfer-modal").classList.remove("open"));
    
    document.getElementById("toggle-history-btn")?.addEventListener("click", () => {
        document.getElementById("history-panel").classList.toggle("open");
    });

    // --- GEMINI AI BOT (WITH ENTER KEY FIX) ---
    document.getElementById("ai-fab")?.addEventListener("click", () => document.getElementById("ai-chat-window").classList.toggle("open"));
    document.getElementById("ai-close-btn")?.addEventListener("click", () => document.getElementById("ai-chat-window").classList.remove("open"));

    const handleChat = async () => {
        const input = document.getElementById("ai-chat-input");
        const chatBody = document.getElementById("ai-chat-body");
        if (!input.value.trim()) return;

        chatBody.innerHTML += `<div class="chat-msg user-msg">${input.value}</div>`;
        const prompt = input.value;
        input.value = "";

        // Add loader
        const loaderId = "loader-" + Date.now();
        chatBody.innerHTML += `<div id="${loaderId}" class="chat-msg bot-msg typing-indicator">Thinking...</div>`;
        chatBody.scrollTop = chatBody.scrollHeight;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: "You are Virtu-Mitra, a simple finance AI for a student banking app. Keep answers under 2 sentences. User says: " + prompt }] }] })
            });
            const result = await response.json();
            document.getElementById(loaderId)?.remove();
            
            if(result.error) throw new Error("API Limit");

            const reply = result.candidates[0].content.parts[0].text;
            chatBody.innerHTML += `<div class="chat-msg bot-msg">${reply}</div>`;
        } catch(e) {
            document.getElementById(loaderId)?.remove();
            chatBody.innerHTML += `<div class="chat-msg bot-msg" style="color:red;">Network Error. Try later.</div>`;
        }
        chatBody.scrollTop = chatBody.scrollHeight;
    };

    document.getElementById("ai-chat-send")?.addEventListener("click", handleChat);
    document.getElementById("ai-chat-input")?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleChat();
    });

    // Logout
    document.getElementById("logout-btn")?.addEventListener("click", () => { 
        sessionStorage.removeItem(SESSION_KEY); 
        location.reload(); 
    });
});