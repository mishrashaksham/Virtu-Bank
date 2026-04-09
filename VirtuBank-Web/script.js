// ============================================================
//  VirtuBank — script.js (v19 — VirtuGullak + Investments)
//  Firebase + Gemini keys: TU KHUD FILL KARNA
// ============================================================

import { initializeApp }        from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc }
                                 from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// ── 1. CONFIG (TU APNA DAALEGA) ─────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyDp0dcnMcAQftNUqR16J4QxdKgONT6TESw",
  authDomain: "virtubank999.firebaseapp.com",
  projectId: "virtubank999",
  storageBucket: "virtubank999.firebasestorage.app",
  messagingSenderId: "609281991520",
  appId: "1:609281991520:web:207db48e7f0cead4f47405"
};


const GEMINI_API_KEY = [
    "AIzaSyCw",             // Start ka hissa (sabki key yahan se shuru hoti hai)
    "-uC4Z-",        // Agla hissa (e.g., "AbCdEfG")
    "STQNY50xXwQB4",        // Uss se agla hissa (e.g., "123456")
    "EupSgP2HYtbo"         // Aakhiri bacha hua hissa (e.g., "XyZ")
].join(""); 


const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ── 2. CONSTANTS ─────────────────────────────────────────────
const SESSION_KEY     = "virtuBankSession";
const INITIAL_BALANCE = 5000;
const MAX_HISTORY     = 5;
const GULLAK_INTEREST = 0.065;   // 6.5% per annum
const GOLD_PRICE_PER_GRAM = 7420; // simulated live price ₹/gram

// ── 3. UTILITIES ─────────────────────────────────────────────
const nowISO = () => new Date().toISOString();
const fmt    = n  => Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });

function showToast(msg, isErr = false) {
    const t  = document.getElementById("toast");
    const tm = document.getElementById("toast-message");
    if (!t) { alert(msg); return; }
    tm.textContent = msg;
    t.className    = isErr ? "toast show toast-error" : "toast show";
    clearTimeout(t._t);
    t._t = setTimeout(() => t.classList.remove("show"), 3500);
}

function openModal(id)  { document.getElementById(id)?.classList.add("open");    }
function closeModal(id) { document.getElementById(id)?.classList.remove("open"); }

function mathCaptcha(targetId) {
    const ops = ["+", "-", "×"];
    const op  = ops[Math.floor(Math.random() * 3)];
    let a, b, ans;
    if (op === "+") { a = rand(10,60); b = rand(5,40);  ans = a + b; }
    if (op === "-") { a = rand(30,80); b = rand(5, a-1);ans = a - b; }
    if (op === "×") { a = rand(2,12);  b = rand(2,10);  ans = a * b; }
    document.getElementById(targetId).textContent = `${a}  ${op}  ${b}  = ?`;
    return ans;
}
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function showSection(id) {
    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
    document.getElementById(id)?.classList.add("active");
    document.getElementById("site-header").classList.toggle("hidden", id === "section-dashboard");
    document.getElementById("ai-fab").style.display = (id === "section-dashboard") ? "flex" : "none";
}

// ── 4. FIRESTORE HELPERS ─────────────────────────────────────
async function searchAccount(uid) {
    if (!uid) return { success: false };
    try {
        const snap = await getDoc(doc(db, "accounts", uid.trim().toUpperCase()));
        if (snap.exists()) return { success: true, account: snap.data() };
    } catch (e) { console.error("DB:", e); }
    return { success: false };
}

async function saveAccount(uid, data) {
    await updateDoc(doc(db, "accounts", uid), data);
}

async function createAccount(data) {
    const uid = Array.from({ length: 10 }, () =>
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)]
    ).join("");
    const account = {
        ...data, uid,
        balance:      INITIAL_BALANCE,
        gullak:       null,
        investments:  [],
        favorites:    [],
        transactions: [],
        createdAt:    nowISO()
    };
    await setDoc(doc(db, "accounts", uid), account);
    return uid;
}

function addTxn(acc, txn) {
    acc.transactions.unshift({ ...txn, timestamp: nowISO() });
    if (acc.transactions.length > MAX_HISTORY) acc.transactions.pop();
}

// ── 5. DASHBOARD RENDER ──────────────────────────────────────
function populateDashboard(acc) {
    document.getElementById("dash-name").textContent    = acc.name;
    document.getElementById("dash-uid").textContent     = acc.uid;
    document.getElementById("dash-balance").textContent = fmt(acc.balance);
    document.getElementById("dash-greeting").textContent= `Namaste, ${acc.name.split(" ")[0]} 👋`;
    document.getElementById("dash-txn-count").textContent = acc.transactions?.length ?? 0;
    document.getElementById("dash-gullak-balance").textContent =
        fmt(acc.gullak?.currentAmount ?? 0);

    const totalInvested = (acc.investments || []).reduce((s, i) => s + (i.amount || 0), 0);
    document.getElementById("dash-invest-balance").textContent = fmt(totalInvested);

    const badgeMap = {
        external: '<span class="txn-badge badge-ext">UPI</span>',
        internal: '<span class="txn-badge badge-int">Virtu</span>',
        gullak:   '<span class="txn-badge badge-gullak">Gullak</span>',
        invest:   '<span class="txn-badge badge-invest">Invest</span>',
    };
    const list = document.getElementById("history-list");
    const badge = document.getElementById("hist-badge");
    const txns  = acc.transactions || [];
    badge.textContent = `${txns.length}/${MAX_HISTORY}`;

    list.innerHTML = txns.length ? txns.map(t => `
        <div class="txn-row">
            <div class="txn-icon-wrap ${t.type}">${t.type === "debit" ? "↑" : "↓"}</div>
            <div class="txn-body">
                <span class="txn-description">${t.description} ${badgeMap[t.category] || ""}</span>
                <span class="txn-meta">${new Date(t.timestamp).toLocaleString("en-IN")}</span>
            </div>
            <span class="txn-amount ${t.type}">${t.type === "debit" ? "-" : "+"}₹${fmt(t.amount)}</span>
        </div>`).join("")
    : `<p style="text-align:center;opacity:.6;padding:20px;">No transactions yet.</p>`;
}

// ── 6. GULLAK CHART (Canvas) ─────────────────────────────────
function drawGullakChart(gullak) {
    const canvas = document.getElementById("gullak-chart");
    if (!canvas) return;
    const ctx    = canvas.getContext("2d");
    const W = canvas.width  = canvas.offsetWidth  || 460;
    const H = canvas.height = 140;
    ctx.clearRect(0, 0, W, H);

    const target    = gullak.targetAmount;
    const current   = gullak.currentAmount;
    const startDate = new Date(gullak.createdAt);
    const freqDays  = { daily: 1, weekly: 7, monthly: 30 }[gullak.frequency] || 30;
    const limitPerInterval = gullak.limitPerInterval;
    const intervalsLeft    = Math.ceil((target - current) / limitPerInterval);
    const daysLeft         = intervalsLeft * freqDays;

    // Build past + future data points
    const points = [];
    const totalDays = Math.max(daysLeft + 10, 60);
    const step      = Math.max(1, Math.floor(totalDays / 50));
    let   simBal    = current;
    const now       = Date.now();

    for (let d = 0; d <= totalDays; d += step) {
        const ts = new Date(now + d * 86400000);
        if (d % freqDays === 0) {
            const interest = simBal * GULLAK_INTEREST / 365 * step;
            simBal = Math.min(target, simBal + limitPerInterval + interest);
        }
        points.push({ d, val: simBal });
    }

    const maxVal = target;
    const pad    = { l: 40, r: 10, t: 10, b: 24 };
    const W2 = W - pad.l - pad.r;
    const H2 = H - pad.t - pad.b;

    const toX = d   => pad.l + (d / totalDays) * W2;
    const toY = val => pad.t + H2 - (val / maxVal) * H2;

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,.06)";
    ctx.lineWidth   = 1;
    [0, .25, .5, .75, 1].forEach(f => {
        const y = toY(maxVal * f);
        ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,.3)";
        ctx.font      = "10px DM Sans";
        ctx.fillText("₹" + Math.round(maxVal * f / 1000) + "k", 2, y + 4);
    });

    // Gradient fill
    const grad = ctx.createLinearGradient(0, pad.t, 0, H - pad.b);
    grad.addColorStop(0, "rgba(201,168,76,.4)");
    grad.addColorStop(1, "rgba(201,168,76,.02)");

    ctx.beginPath();
    points.forEach((p, i) => {
        const x = toX(p.d);
        const y = toY(Math.min(p.val, target));
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.lineTo(toX(points[points.length - 1].d), H - pad.b);
    ctx.lineTo(pad.l, H - pad.b);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.strokeStyle = "rgba(201,168,76,.9)";
    ctx.lineWidth   = 2;
    points.forEach((p, i) => {
        const x = toX(p.d);
        const y = toY(Math.min(p.val, target));
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Current marker
    ctx.beginPath();
    ctx.arc(toX(0), toY(current), 5, 0, Math.PI * 2);
    ctx.fillStyle = "var(--gold-400)";
    ctx.fill();

    // Today label
    ctx.fillStyle = "rgba(255,255,255,.5)";
    ctx.font      = "10px DM Sans";
    ctx.fillText("Today", toX(0) - 14, H - 4);
}

// ── 7. GULLAK ACTIVE VIEW RENDER ─────────────────────────────
function renderGullakActiveView(gullak) {
    document.getElementById("gullak-create-view").style.display = "none";
    document.getElementById("gullak-active-view").style.display = "block";

    const current = gullak.currentAmount;
    const target  = gullak.targetAmount;
    const pct     = Math.min(100, (current / target) * 100).toFixed(1);

    document.getElementById("g-display-name").textContent    = gullak.name;
    document.getElementById("g-current-bal").textContent     = fmt(current);
    document.getElementById("g-target-display").textContent  = fmt(target);
    document.getElementById("g-progress-fill").style.width   = pct + "%";
    document.getElementById("g-progress-pct").textContent    = pct + "%";
    document.getElementById("g-interest-badge").textContent  = `+${(GULLAK_INTEREST * 100).toFixed(1)}% p.a. interest`;
    document.getElementById("g-auto-status").textContent     = gullak.autoSave ? "ON" : "OFF";

    // Interest earned so far
    const created      = new Date(gullak.createdAt);
    const daysElapsed  = Math.floor((Date.now() - created) / 86400000);
    const interestEarned = parseFloat((gullak.principalDeposited || current) * GULLAK_INTEREST / 365 * daysElapsed).toFixed(2);
    document.getElementById("g-interest-earned").textContent = "₹" + fmt(interestEarned);

    // ETA
    const freqDays   = { daily: 1, weekly: 7, monthly: 30 }[gullak.frequency] || 30;
    const intervalsLeft = Math.ceil(Math.max(0, target - current) / gullak.limitPerInterval);
    const daysLeft   = intervalsLeft * freqDays;
    const eta        = new Date(Date.now() + daysLeft * 86400000);
    document.getElementById("g-days-left").textContent = daysLeft > 0 ? daysLeft + "d" : "🎉 Done!";
    document.getElementById("g-eta").textContent = daysLeft > 0
        ? eta.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
        : "Completed!";

    // Members
    const membersRow = document.getElementById("g-members-row");
    if (gullak.members && gullak.members.length) {
        membersRow.style.display = "flex";
        membersRow.innerHTML     = "<span style='font-size:12px;color:var(--navy-200);margin-right:8px;'>Members:</span>" +
            gullak.members.map(m => `<span class="g-member-tag">👤 ${m}</span>`).join("");
    } else {
        membersRow.style.display = "none";
    }

    drawGullakChart(gullak);
}

// ── 8. INVESTMENT HELPERS ─────────────────────────────────────
function calcSIP(monthly, years, rate = 0.12) {
    const n  = years * 12;
    const r  = rate / 12;
    const fv = monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    return { invested: monthly * n, returns: fv - monthly * n, total: fv };
}
function calcLT(principal, years, rate = 0.09) {
    const fv = principal * Math.pow(1 + rate, years);
    return { invested: principal, returns: fv - principal, total: fv };
}
function renderInvestPortfolio(investments) {
    const wrap = document.getElementById("invest-portfolio");
    const list = document.getElementById("invest-portfolio-list");
    if (!investments || !investments.length) { wrap.style.display = "none"; return; }
    wrap.style.display = "block";
    list.innerHTML = investments.map(inv => {
        let proj = 0;
        if (inv.type === "sip")      proj = calcSIP(inv.monthly || 0, inv.years || 1).total;
        if (inv.type === "longterm") proj = calcLT(inv.amount || 0, inv.years || 1).total;
        if (inv.type === "gold")     proj = (inv.amount || 0) * 1.08;
        return `<div class="portfolio-item">
            <div>
                <div class="portfolio-item-label">${inv.label}</div>
                <div style="font-size:11px;color:var(--text-muted);">Invested: ₹${fmt(inv.amount)}</div>
            </div>
            <div class="portfolio-item-val">≈ ₹${fmt(proj)}</div>
        </div>`;
    }).join("");
}

// ════════════════════════════════════════════════════════════
//  MAIN EVENT LISTENERS
// ════════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", async () => {

    // ── Session restore ──────────────────────────────────────
    const session = sessionStorage.getItem(SESSION_KEY);
    if (session) {
        const res = await searchAccount(session);
        if (res.success) { populateDashboard(res.account); showSection("section-dashboard"); }
        else             { sessionStorage.removeItem(SESSION_KEY); }
    }

    // ── Nav ──────────────────────────────────────────────────
    document.getElementById("nav-login-btn")  ?.addEventListener("click", () => showSection("section-login"));
    document.getElementById("nav-signup-btn") ?.addEventListener("click", () => showSection("section-signup"));
    document.getElementById("goto-signup-link")?.addEventListener("click",() => showSection("section-signup"));
    document.getElementById("goto-login-link") ?.addEventListener("click",() => showSection("section-login"));
    document.getElementById("logout-btn")?.addEventListener("click", () => {
        sessionStorage.removeItem(SESSION_KEY); location.reload();
    });

    // ── Transfer Modal Tabs ──────────────────────────────────
    document.querySelectorAll(".modal-tab[data-tab]").forEach(tab => {
        tab.addEventListener("click", () => {
            const parent = tab.closest(".modal-card");
            parent.querySelectorAll(".modal-tab[data-tab]").forEach(t => t.classList.remove("active"));
            parent.querySelectorAll(".transfer-panel").forEach(p => p.classList.remove("active"));
            tab.classList.add("active");
            const pid = tab.dataset.tab === "internal" ? "transfer-panel-internal" : "transfer-panel-external";
            document.getElementById(pid)?.classList.add("active");
        });
    });

    // ── Invest Tabs ──────────────────────────────────────────
    document.querySelectorAll(".modal-tab[data-itab]").forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".modal-tab[data-itab]").forEach(t => t.classList.remove("active"));
            ["sip","longterm","gold"].forEach(p => {
                document.getElementById("invest-panel-" + p)?.classList.remove("active");
            });
            tab.classList.add("active");
            document.getElementById("invest-panel-" + tab.dataset.itab)?.classList.add("active");
        });
    });

    // ════════════════════════════════════════
    //  LOGIN
    // ════════════════════════════════════════
    document.getElementById("login-form")?.addEventListener("submit", async e => {
        e.preventDefault();
        const btn  = document.getElementById("login-submit-btn");
        const uid  = document.getElementById("login-uid").value.trim().toUpperCase();
        const pass = document.getElementById("login-password").value;
        btn.disabled = true; btn.querySelector(".btn-text").textContent = "Checking...";

        const res = await searchAccount(uid);
        if (res.success && res.account.password === pass) {
            sessionStorage.setItem(SESSION_KEY, res.account.uid);
            populateDashboard(res.account);
            showSection("section-dashboard");
            showToast("Login successful! 🎉");
        } else {
            showToast("Invalid UID or Password.", true);
        }
        btn.disabled = false; btn.querySelector(".btn-text").textContent = "Sign In";
    });

    // ════════════════════════════════════════
    //  SIGNUP
    // ════════════════════════════════════════
    document.getElementById("signup-form")?.addEventListener("submit", async e => {
        e.preventDefault();
        const btn = document.getElementById("signup-submit-btn");
        btn.disabled = true; btn.querySelector(".btn-text").textContent = "Creating...";
        try {
            const uid = await createAccount({
                name:     document.getElementById("s-name").value.trim(),
                age:      document.getElementById("s-age").value,
                gender:   document.getElementById("s-gender").value,
                marital:  document.getElementById("s-marital").value,
                pan:      document.getElementById("s-pan").value.toUpperCase(),
                aadhar:   document.getElementById("s-aadhar").value,
                email:    document.getElementById("s-email").value.toLowerCase(),
                mobile:   document.getElementById("s-mobile").value,
                address:  document.getElementById("s-address").value,
                password: document.getElementById("s-password").value,
                mpin:     document.getElementById("s-mpin").value,
            });
            document.getElementById("modal-uid-value").textContent = uid;
            openModal("uid-modal");
        } catch (err) { showToast("Error creating account. Try again.", true); }
        btn.disabled = false; btn.querySelector(".btn-text").textContent = "Create My Account";
    });
    document.getElementById("modal-proceed-btn")?.addEventListener("click", () => {
        closeModal("uid-modal");
        document.getElementById("signup-form").reset();
        showSection("section-login");
    });

    // ════════════════════════════════════════
    //  INTERNAL TRANSFER
    // ════════════════════════════════════════
    document.getElementById("open-transfer-btn")?.addEventListener("click", () => openModal("transfer-modal"));
    document.getElementById("transfer-close-btn")?.addEventListener("click",() => closeModal("transfer-modal"));

    document.getElementById("internal-transfer-form")?.addEventListener("submit", async e => {
        e.preventDefault();
        const sUID  = sessionStorage.getItem(SESSION_KEY);
        const rUID  = document.getElementById("int-receiver-uid").value.trim().toUpperCase();
        const amt   = parseFloat(document.getElementById("int-amount").value);
        const mpin  = document.getElementById("int-mpin").value;
        const saveFav = document.getElementById("int-save-fav")?.checked;

        if (sUID === rUID) { showToast("Cannot send to yourself!", true); return; }

        const [sRes, rRes] = await Promise.all([searchAccount(sUID), searchAccount(rUID)]);
        if (!sRes.success)             { showToast("Session error. Re-login.", true); return; }
        if (!rRes.success)             { showToast("Receiver UID not found.", true); return; }
        if (sRes.account.mpin !== mpin){ showToast("Invalid MPIN.", true); return; }
        if (sRes.account.balance < amt){ showToast("Insufficient balance.", true); return; }

        const sAcc = sRes.account;
        const rAcc = rRes.account;

        sAcc.balance -= amt;
        rAcc.balance += amt;
        addTxn(sAcc, { type:"debit",  category:"internal", description:`Paid ${rAcc.name}`, amount: amt });
        addTxn(rAcc, { type:"credit", category:"internal", description:`From ${sAcc.name}`, amount: amt });

        // Save as favorite?
        if (saveFav) {
            sAcc.favorites = sAcc.favorites || [];
            if (!sAcc.favorites.find(f => f.uid === rUID)) {
                sAcc.favorites.push({ uid: rUID, name: rAcc.name });
            }
        }

        // Auto-save to gullak?
        let gullakSaved = 0;
        if (sAcc.gullak && sAcc.autoSave !== false) {
            const roundUp = Math.ceil(amt / 100) * 100;
            const savings = parseFloat((roundUp - amt).toFixed(2));
            if (savings > 0 && sAcc.balance >= savings) {
                sAcc.balance -= savings;
                sAcc.gullak.currentAmount   = parseFloat((sAcc.gullak.currentAmount + savings).toFixed(2));
                sAcc.gullak.principalDeposited = (sAcc.gullak.principalDeposited || 0) + savings;
                addTxn(sAcc, { type:"debit", category:"gullak", description:`Auto-Save to Gullak`, amount: savings });
                gullakSaved = savings;
            }
        }

        await Promise.all([
            saveAccount(sUID, { balance: sAcc.balance, transactions: sAcc.transactions, favorites: sAcc.favorites, gullak: sAcc.gullak }),
            saveAccount(rUID, { balance: rAcc.balance, transactions: rAcc.transactions }),
        ]);

        closeModal("transfer-modal");
        document.getElementById("internal-transfer-form").reset();
        document.getElementById("int-save-fav").checked = false;

        const fresh = await searchAccount(sUID);
        if (fresh.success) populateDashboard(fresh.account);
        showToast(`₹${fmt(amt)} sent to ${rAcc.name}!${gullakSaved ? ` 🏺 ₹${fmt(gullakSaved)} auto-saved.` : ""}`);
    });

    // ════════════════════════════════════════
    //  EXTERNAL TRANSFER
    // ════════════════════════════════════════
    document.getElementById("external-transfer-form")?.addEventListener("submit", async e => {
        e.preventDefault();
        const sUID = sessionStorage.getItem(SESSION_KEY);
        const upi  = document.getElementById("ext-upi").value.trim();
        const amt  = parseFloat(document.getElementById("ext-amount").value);
        const mpin = document.getElementById("ext-mpin").value;

        const sRes = await searchAccount(sUID);
        if (!sRes.success)              { showToast("Session error.", true); return; }
        if (sRes.account.mpin !== mpin) { showToast("Invalid MPIN.", true); return; }
        if (sRes.account.balance < amt) { showToast("Insufficient balance.", true); return; }

        const sAcc = sRes.account;
        sAcc.balance -= amt;
        addTxn(sAcc, { type:"debit", category:"external", description:`UPI to ${upi}`, amount: amt });

        let gullakSaved = 0;
        if (sAcc.gullak && sAcc.autoSave !== false) {
            const roundUp = Math.ceil(amt / 100) * 100;
            const savings = parseFloat((roundUp - amt).toFixed(2));
            if (savings > 0 && sAcc.balance >= savings) {
                sAcc.balance -= savings;
                sAcc.gullak.currentAmount     = parseFloat((sAcc.gullak.currentAmount + savings).toFixed(2));
                sAcc.gullak.principalDeposited = (sAcc.gullak.principalDeposited || 0) + savings;
                addTxn(sAcc, { type:"debit", category:"gullak", description:`Auto-Save to Gullak`, amount: savings });
                gullakSaved = savings;
            }
        }

        await saveAccount(sUID, { balance: sAcc.balance, transactions: sAcc.transactions, gullak: sAcc.gullak });
        closeModal("transfer-modal");
        document.getElementById("external-transfer-form").reset();

        const fresh = await searchAccount(sUID);
        if (fresh.success) populateDashboard(fresh.account);
        showToast(`₹${fmt(amt)} sent via UPI!${gullakSaved ? ` 🏺 Auto-saved ₹${fmt(gullakSaved)}.` : ""}`);
    });

    // ════════════════════════════════════════
    //  HISTORY TOGGLE
    // ════════════════════════════════════════
    document.getElementById("toggle-history-btn")?.addEventListener("click", () => {
        document.getElementById("history-panel").classList.toggle("open");
    });

    // ════════════════════════════════════════
    //  VOICE PAY
    // ════════════════════════════════════════
    document.getElementById("open-voice-btn")?.addEventListener("click", () => openModal("voice-modal"));
    document.getElementById("voice-close-btn")?.addEventListener("click",() => closeModal("voice-modal"));

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.lang  = "en-IN";
        recog.continuous = false;
        recog.interimResults = false;

        recog.onresult = (event) => {
            const text = event.results[0][0].transcript.toLowerCase();
            document.getElementById("voice-transcript").textContent = `"${text}"`;
            document.getElementById("mic-pulse").style.display = "none";

            // Parse: "send [amount] to [uid]"
            const match = text.match(/send\s+(\d+(?:\.\d+)?)\s+(?:rupees?\s+)?to\s+([a-z0-9]+)/i);
            if (match) {
                const amount = parseFloat(match[1]);
                const uid    = match[2].toUpperCase();
                document.getElementById("voice-parsed").textContent =
                    `✅ Sending ₹${fmt(amount)} to UID: ${uid}`;
                // Pre-fill transfer form
                closeModal("voice-modal");
                document.getElementById("int-receiver-uid").value = uid;
                document.getElementById("int-amount").value       = amount;
                // Switch to internal tab
                document.querySelector(".modal-tab[data-tab='internal']")?.click();
                openModal("transfer-modal");
            } else {
                document.getElementById("voice-parsed").textContent =
                    `❌ Didn't catch that. Try: "Send 500 to UID"`;
            }
        };

        recog.onerror = () => {
            document.getElementById("mic-pulse").style.display = "none";
            document.getElementById("voice-transcript").textContent = "Error. Please try again.";
        };

        document.getElementById("voice-start-btn")?.addEventListener("click", () => {
            document.getElementById("mic-pulse").style.display = "block";
            document.getElementById("voice-transcript").textContent = "Listening...";
            document.getElementById("voice-parsed").textContent = "";
            recog.start();
        });
    } else {
        document.getElementById("voice-start-btn")?.addEventListener("click", () => {
            document.getElementById("voice-transcript").textContent =
                "Voice not supported in this browser. Try Chrome.";
        });
    }

    // ════════════════════════════════════════
    //  FAVORITES
    // ════════════════════════════════════════
    async function renderFavList() {
        const uid = sessionStorage.getItem(SESSION_KEY);
        const res = await searchAccount(uid);
        if (!res.success) return;
        const favs = res.account.favorites || [];
        const container = document.getElementById("fav-list-container");
        container.innerHTML = favs.length
            ? favs.map((f, i) => `
                <div class="fav-item">
                    <div class="fav-item-info">
                        <span class="fav-item-name">${f.name}</span>
                        <span class="fav-item-uid">${f.uid}</span>
                    </div>
                    <div class="fav-actions">
                        <button class="fav-send-btn" data-uid="${f.uid}">💸 Send</button>
                        <button class="fav-del-btn" data-idx="${i}">✕</button>
                    </div>
                </div>`).join("")
            : `<p style="text-align:center;color:var(--text-muted);font-size:13px;">No favorites yet. Send money and check "Save as Favorite"!</p>`;

        container.querySelectorAll(".fav-send-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                closeModal("fav-modal");
                document.getElementById("int-receiver-uid").value = btn.dataset.uid;
                document.querySelector(".modal-tab[data-tab='internal']")?.click();
                openModal("transfer-modal");
                document.getElementById("int-amount").focus();
            });
        });
        container.querySelectorAll(".fav-del-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
                const idx  = parseInt(btn.dataset.idx);
                const res2 = await searchAccount(uid);
                if (!res2.success) return;
                res2.account.favorites.splice(idx, 1);
                await saveAccount(uid, { favorites: res2.account.favorites });
                renderFavList();
            });
        });
    }

    document.getElementById("open-fav-btn")?.addEventListener("click", () => {
        renderFavList();
        openModal("fav-modal");
    });
    document.getElementById("fav-close-btn")?.addEventListener("click", () => closeModal("fav-modal"));

    document.getElementById("add-fav-btn")?.addEventListener("click", async () => {
        const uid  = sessionStorage.getItem(SESSION_KEY);
        const name = document.getElementById("fav-name").value.trim();
        const fuid = document.getElementById("fav-uid").value.trim().toUpperCase();
        if (!name || !fuid) { showToast("Fill in name and UID.", true); return; }

        const check = await searchAccount(fuid);
        if (!check.success) { showToast("UID not found in VirtuBank.", true); return; }

        const res = await searchAccount(uid);
        if (!res.success) return;
        res.account.favorites = res.account.favorites || [];
        if (res.account.favorites.find(f => f.uid === fuid)) {
            showToast("Already in favorites."); return;
        }
        res.account.favorites.push({ uid: fuid, name });
        await saveAccount(uid, { favorites: res.account.favorites });
        document.getElementById("fav-name").value = "";
        document.getElementById("fav-uid").value  = "";
        showToast(`${name} added to favorites! ⭐`);
        renderFavList();
    });

    // ════════════════════════════════════════
    //  INVESTMENTS
    // ════════════════════════════════════════
    document.getElementById("open-invest-btn")?.addEventListener("click", async () => {
        const uid = sessionStorage.getItem(SESSION_KEY);
        const res = await searchAccount(uid);
        if (res.success) renderInvestPortfolio(res.account.investments);
        openModal("invest-modal");
    });
    document.getElementById("invest-close-btn")?.addEventListener("click", () => closeModal("invest-modal"));

    // SIP Calculator
    document.getElementById("sip-calc-btn")?.addEventListener("click", () => {
        const monthly = parseFloat(document.getElementById("sip-amount").value);
        const years   = parseInt(document.getElementById("sip-years").value);
        if (!monthly || !years) { showToast("Fill both fields.", true); return; }
        const c = calcSIP(monthly, years);
        const el = document.getElementById("sip-result");
        el.innerHTML = `💰 Invested: ₹${fmt(c.invested)}<br>📈 Returns: ₹${fmt(c.returns)}<br>🏆 Total: <strong>₹${fmt(c.total)}</strong> in ${years} years`;
        el.classList.add("show");
    });

    document.getElementById("sip-form")?.addEventListener("submit", async e => {
        e.preventDefault();
        const uid     = sessionStorage.getItem(SESSION_KEY);
        const monthly = parseFloat(document.getElementById("sip-amount").value);
        const years   = parseInt(document.getElementById("sip-years").value);
        const res = await searchAccount(uid);
        if (!res.success) return;
        const acc = res.account;
        if (acc.balance < monthly) { showToast("Insufficient balance for first installment.", true); return; }
        acc.balance -= monthly;
        acc.investments = acc.investments || [];
        acc.investments.push({ type:"sip", label:`SIP ₹${fmt(monthly)}/mo`, monthly, years, amount: monthly, startedAt: nowISO() });
        addTxn(acc, { type:"debit", category:"invest", description:`SIP Started ₹${fmt(monthly)}/mo`, amount: monthly });
        await saveAccount(uid, { balance: acc.balance, investments: acc.investments, transactions: acc.transactions });
        closeModal("invest-modal");
        const fresh = await searchAccount(uid);
        if (fresh.success) { populateDashboard(fresh.account); }
        showToast(`SIP of ₹${fmt(monthly)}/month started! 📈`);
    });

    // Long-Term Calculator
    document.getElementById("lt-calc-btn")?.addEventListener("click", () => {
        const amt   = parseFloat(document.getElementById("lt-amount").value);
        const years = parseInt(document.getElementById("lt-years").value);
        if (!amt || !years) { showToast("Fill both fields.", true); return; }
        const c = calcLT(amt, years);
        const el = document.getElementById("lt-result");
        el.innerHTML = `💰 Principal: ₹${fmt(c.invested)}<br>📈 Interest: ₹${fmt(c.returns)}<br>🏆 Maturity: <strong>₹${fmt(c.total)}</strong> in ${years} years`;
        el.classList.add("show");
    });

    document.getElementById("lt-form")?.addEventListener("submit", async e => {
        e.preventDefault();
        const uid   = sessionStorage.getItem(SESSION_KEY);
        const amt   = parseFloat(document.getElementById("lt-amount").value);
        const years = parseInt(document.getElementById("lt-years").value);
        const res   = await searchAccount(uid);
        if (!res.success) return;
        const acc = res.account;
        if (acc.balance < amt) { showToast("Insufficient balance.", true); return; }
        acc.balance -= amt;
        acc.investments = acc.investments || [];
        acc.investments.push({ type:"longterm", label:`FD ₹${fmt(amt)} × ${years}yr`, amount: amt, years, startedAt: nowISO() });
        addTxn(acc, { type:"debit", category:"invest", description:`Long-Term Invest ₹${fmt(amt)}`, amount: amt });
        await saveAccount(uid, { balance: acc.balance, investments: acc.investments, transactions: acc.transactions });
        closeModal("invest-modal");
        const fresh = await searchAccount(uid);
        if (fresh.success) populateDashboard(fresh.account);
        showToast(`₹${fmt(amt)} invested for ${years} years! 💼`);
    });

    // Gold Calculator
    document.getElementById("gold-calc-btn")?.addEventListener("click", () => {
        const amt = parseFloat(document.getElementById("gold-amount").value);
        if (!amt) { showToast("Enter amount.", true); return; }
        const grams = (amt / GOLD_PRICE_PER_GRAM).toFixed(4);
        const el = document.getElementById("gold-result");
        el.innerHTML = `🥇 You get: <strong>${grams}g</strong> of 24K Digital Gold<br>@ ₹${fmt(GOLD_PRICE_PER_GRAM)}/gram`;
        el.classList.add("show");
    });

    document.getElementById("gold-form")?.addEventListener("submit", async e => {
        e.preventDefault();
        const uid = sessionStorage.getItem(SESSION_KEY);
        const amt = parseFloat(document.getElementById("gold-amount").value);
        const res = await searchAccount(uid);
        if (!res.success) return;
        const acc = res.account;
        if (acc.balance < amt) { showToast("Insufficient balance.", true); return; }
        const grams = parseFloat((amt / GOLD_PRICE_PER_GRAM).toFixed(4));
        acc.balance -= amt;
        acc.investments = acc.investments || [];
        acc.investments.push({ type:"gold", label:`Digital Gold ${grams}g`, amount: amt, grams, startedAt: nowISO() });
        addTxn(acc, { type:"debit", category:"invest", description:`Bought ${grams}g Digital Gold`, amount: amt });
        await saveAccount(uid, { balance: acc.balance, investments: acc.investments, transactions: acc.transactions });
        closeModal("invest-modal");
        const fresh = await searchAccount(uid);
        if (fresh.success) populateDashboard(fresh.account);
        showToast(`Bought ${grams}g of Digital Gold! 🥇`);
    });

    // ════════════════════════════════════════
    //  VIRTUGULLAK
    // ════════════════════════════════════════
    let gullakCaptchaAns = null;
    let gullakWithdrawCaptchaAns = null;
    let gullakPauseCaptchaAns    = null;
    let pendingGullakType = "solo";

    async function openGullakModal() {
        const uid = sessionStorage.getItem(SESSION_KEY);
        const res = await searchAccount(uid);
        if (!res.success) return;
        const acc = res.account;

        if (acc.gullak && !acc.gullak.paused) {
            // Show active view
            document.getElementById("gullak-create-view").style.display = "none";
            document.getElementById("gullak-active-view").style.display = "block";
            renderGullakActiveView(acc.gullak);
        } else {
            // Show create view
            document.getElementById("gullak-create-view").style.display = "block";
            document.getElementById("gullak-active-view").style.display = "none";
            document.getElementById("gullak-setup-form").style.display  = "none";

            // Populate member picker from favorites
            const favs   = acc.favorites || [];
            const picker = document.getElementById("gullak-member-picker");
            picker.innerHTML = favs.length
                ? favs.map(f => `<span class="member-chip" data-uid="${f.uid}">${f.name}</span>`).join("")
                : `<span style="font-size:12px;color:var(--navy-200);">No favorites yet. Add some first!</span>`;
            picker.querySelectorAll(".member-chip").forEach(c => {
                c.addEventListener("click", () => c.classList.toggle("selected"));
            });
        }
        openModal("gullak-modal");
    }

    document.getElementById("open-gullak-btn")?.addEventListener("click", openGullakModal);
    document.getElementById("gullak-close-btn")?.addEventListener("click", () => closeModal("gullak-modal"));

    // Choose Solo / Group
    document.getElementById("gullak-solo-btn")?.addEventListener("click", () => {
        pendingGullakType = "solo";
        document.getElementById("gullak-type-badge").textContent = "🏺 Solo Gullak";
        document.getElementById("gullak-group-section").style.display = "none";
        document.getElementById("gullak-setup-form").style.display    = "block";
    });
    document.getElementById("gullak-group-btn")?.addEventListener("click", () => {
        pendingGullakType = "group";
        document.getElementById("gullak-type-badge").textContent = "👥 Group Gullak";
        document.getElementById("gullak-group-section").style.display = "block";
        document.getElementById("gullak-setup-form").style.display    = "block";
    });

    // Frequency label update
    document.getElementById("g-frequency")?.addEventListener("change", function () {
        const labels = { daily:"Daily limit (₹)", weekly:"Weekly limit (₹)", monthly:"Monthly limit (₹)" };
        document.getElementById("g-limit-label").textContent = labels[this.value] || "Amount per interval (₹)";
    });

    // Create Gullak
    document.getElementById("gullak-setup-form")?.addEventListener("submit", async e => {
        e.preventDefault();
        const uid    = sessionStorage.getItem(SESSION_KEY);
        const name   = document.getElementById("g-name").value.trim();
        const target = parseFloat(document.getElementById("g-target").value);
        const freq   = document.getElementById("g-frequency").value;
        const limit  = parseFloat(document.getElementById("g-limit").value);

        if (!name || !target || !limit) { showToast("Fill all fields.", true); return; }

        let members = [];
        if (pendingGullakType === "group") {
            members = Array.from(document.querySelectorAll(".member-chip.selected")).map(c => c.dataset.uid);
        }

        const res = await searchAccount(uid);
        if (!res.success) return;
        const acc = res.account;

        const gullak = {
            name, targetAmount: target, currentAmount: 0,
            principalDeposited: 0, frequency: freq,
            limitPerInterval: limit, autoSave: true,
            type: pendingGullakType, members,
            createdAt: nowISO(), paused: false,
        };
        acc.gullak = gullak;

        await saveAccount(uid, { gullak });
        closeModal("gullak-modal");
        showToast(`🏺 Gullak "${name}" created! Goal: ₹${fmt(target)}`);
        const fresh = await searchAccount(uid);
        if (fresh.success) populateDashboard(fresh.account);
    });

    // Add Money to Gullak
    document.getElementById("g-add-money-btn")?.addEventListener("click", () => openModal("gullak-add-modal"));
    document.getElementById("gullak-add-close")?.addEventListener("click", () => closeModal("gullak-add-modal"));

    document.getElementById("g-manual-confirm-btn")?.addEventListener("click", async () => {
        const uid  = sessionStorage.getItem(SESSION_KEY);
        const amt  = parseFloat(document.getElementById("g-manual-amount").value);
        const mpin = document.getElementById("g-manual-mpin").value;

        const res = await searchAccount(uid);
        if (!res.success) { showToast("Error.", true); return; }
        const acc = res.account;
        if (acc.mpin !== mpin)   { showToast("Invalid MPIN.", true); return; }
        if (acc.balance < amt)   { showToast("Insufficient balance.", true); return; }
        if (!acc.gullak)         { showToast("No active Gullak.", true); return; }

        acc.balance                 -= amt;
        acc.gullak.currentAmount     = parseFloat((acc.gullak.currentAmount + amt).toFixed(2));
        acc.gullak.principalDeposited = (acc.gullak.principalDeposited || 0) + amt;
        addTxn(acc, { type:"debit", category:"gullak", description:`Manual Gullak Deposit`, amount: amt });

        // Check goal complete
        if (acc.gullak.currentAmount >= acc.gullak.targetAmount) {
            acc.gullak.completedAt = nowISO();
            showToast("🎉 Gullak goal reached! Congratulations!");
        }

        await saveAccount(uid, { balance: acc.balance, gullak: acc.gullak, transactions: acc.transactions });
        closeModal("gullak-add-modal");
        document.getElementById("g-manual-amount").value = "";
        document.getElementById("g-manual-mpin").value   = "";

        closeModal("gullak-modal");
        const fresh = await searchAccount(uid);
        if (fresh.success) {
            populateDashboard(fresh.account);
            if (fresh.account.gullak) renderGullakActiveView(fresh.account.gullak);
        }
        openModal("gullak-modal");
        showToast(`₹${fmt(amt)} deposited to Gullak! 🏺`);
    });

    // Withdraw from Gullak (captcha gated, 50% rule)
    document.getElementById("g-withdraw-btn")?.addEventListener("click", () => {
        gullakWithdrawCaptchaAns = mathCaptcha("gullak-captcha-q");
        const uid = sessionStorage.getItem(SESSION_KEY);
        searchAccount(uid).then(res => {
            if (!res.success || !res.account.gullak) return;
            const g   = res.account.gullak;
            const pct = (g.currentAmount / g.targetAmount) * 100;
            const sub = document.getElementById("gullak-withdraw-subtitle");
            if (pct < 50) {
                sub.textContent = `⚠️ Withdrawal locked! Need 50% of goal first. Currently at ${pct.toFixed(1)}%.`;
                document.getElementById("gullak-withdraw-amount").disabled = true;
                document.getElementById("gullak-withdraw-confirm-btn").disabled = true;
            } else {
                sub.textContent = `You can withdraw up to ₹${fmt(g.currentAmount)}`;
                document.getElementById("gullak-withdraw-amount").disabled = false;
                document.getElementById("gullak-withdraw-confirm-btn").disabled = false;
            }
        });
        openModal("gullak-withdraw-modal");
    });
    document.getElementById("gullak-withdraw-close")?.addEventListener("click", () => closeModal("gullak-withdraw-modal"));

    document.getElementById("gullak-withdraw-confirm-btn")?.addEventListener("click", async () => {
        const userAns = parseInt(document.getElementById("gullak-captcha-ans").value);
        if (userAns !== gullakWithdrawCaptchaAns) {
            showToast("Wrong answer! Try again.", true);
            gullakWithdrawCaptchaAns = mathCaptcha("gullak-captcha-q");
            document.getElementById("gullak-captcha-ans").value = "";
            return;
        }
        const uid  = sessionStorage.getItem(SESSION_KEY);
        const amt  = parseFloat(document.getElementById("gullak-withdraw-amount").value);
        const mpin = document.getElementById("gullak-withdraw-mpin").value;

        const res = await searchAccount(uid);
        if (!res.success || !res.account.gullak) return;
        const acc = res.account;

        if (acc.mpin !== mpin)               { showToast("Invalid MPIN.", true); return; }
        if (amt > acc.gullak.currentAmount)  { showToast("Amount exceeds Gullak balance.", true); return; }

        const pct = (acc.gullak.currentAmount / acc.gullak.targetAmount) * 100;
        if (pct < 50) { showToast("50% goal needed to withdraw.", true); return; }

        acc.gullak.currentAmount = parseFloat((acc.gullak.currentAmount - amt).toFixed(2));
        acc.balance              += amt;
        addTxn(acc, { type:"credit", category:"gullak", description:`Gullak Withdrawal`, amount: amt });

        await saveAccount(uid, { balance: acc.balance, gullak: acc.gullak, transactions: acc.transactions });
        closeModal("gullak-withdraw-modal");
        closeModal("gullak-modal");
        document.getElementById("gullak-captcha-ans").value     = "";
        document.getElementById("gullak-withdraw-amount").value = "";
        document.getElementById("gullak-withdraw-mpin").value   = "";

        const fresh = await searchAccount(uid);
        if (fresh.success) {
            populateDashboard(fresh.account);
            if (fresh.account.gullak) {
                renderGullakActiveView(fresh.account.gullak);
                openModal("gullak-modal");
            }
        }
        showToast(`₹${fmt(amt)} withdrawn from Gullak! 💰`);
    });

    // Auto-Save Toggle
    document.getElementById("g-auto-toggle-btn")?.addEventListener("click", async () => {
        const uid = sessionStorage.getItem(SESSION_KEY);
        const res = await searchAccount(uid);
        if (!res.success || !res.account.gullak) return;
        const acc = res.account;
        acc.autoSave = acc.autoSave === false ? true : false;
        await saveAccount(uid, { autoSave: acc.autoSave });
        document.getElementById("g-auto-status").textContent = acc.autoSave ? "ON" : "OFF";
        showToast(`Auto-Save ${acc.autoSave ? "enabled" : "disabled"}!`);
    });

    // Pause / Delete Gullak (captcha gated)
    document.getElementById("g-pause-btn")?.addEventListener("click", () => {
        gullakPauseCaptchaAns = mathCaptcha("gullak-pause-captcha-q");
        openModal("gullak-pause-modal");
    });
    document.getElementById("gullak-pause-close")?.addEventListener("click",() => closeModal("gullak-pause-modal"));

    document.getElementById("gullak-pause-confirm-btn")?.addEventListener("click", async () => {
        const userAns = parseInt(document.getElementById("gullak-pause-ans").value);
        if (userAns !== gullakPauseCaptchaAns) {
            showToast("Wrong answer!", true);
            gullakPauseCaptchaAns = mathCaptcha("gullak-pause-captcha-q");
            document.getElementById("gullak-pause-ans").value = "";
            return;
        }
        const uid = sessionStorage.getItem(SESSION_KEY);
        const res = await searchAccount(uid);
        if (!res.success || !res.account.gullak) return;
        const acc = res.account;

        // Return remaining balance to main account
        const leftover = acc.gullak.currentAmount || 0;
        acc.balance   += leftover;
        if (leftover > 0) {
            addTxn(acc, { type:"credit", category:"gullak", description:`Gullak closed — funds returned`, amount: leftover });
        }
        acc.gullak = null;

        await saveAccount(uid, { balance: acc.balance, gullak: null, transactions: acc.transactions });
        closeModal("gullak-pause-modal");
        closeModal("gullak-modal");
        document.getElementById("gullak-pause-ans").value = "";

        const fresh = await searchAccount(uid);
        if (fresh.success) populateDashboard(fresh.account);
        showToast(`Gullak closed. ₹${fmt(leftover)} returned to your balance.`);
    });

    // ════════════════════════════════════════
    //  GEMINI AI CHATBOT
    // ════════════════════════════════════════
    document.getElementById("ai-fab")?.addEventListener("click", () =>
        document.getElementById("ai-chat-window").classList.toggle("open"));
    document.getElementById("ai-close-btn")?.addEventListener("click", () =>
        document.getElementById("ai-chat-window").classList.remove("open"));

    const handleChat = async () => {
        const input    = document.getElementById("ai-chat-input");
        const chatBody = document.getElementById("ai-chat-body");
        if (!input.value.trim()) return;
        const prompt  = input.value;
        input.value   = "";

        chatBody.innerHTML += `<div class="chat-msg user-msg">${prompt}</div>`;
        const lid = "loader-" + Date.now();
        chatBody.innerHTML += `<div id="${lid}" class="chat-msg bot-msg typing-indicator">Thinking...</div>`;
        chatBody.scrollTop  = chatBody.scrollHeight;

        try {
            const r = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contents: [{ parts: [{ text:
                        "You are Virtu-Mitra, a friendly finance AI for VirtuBank (a student banking app). " +
                        "Keep answers under 2 sentences. Reply in Hinglish. Never reveal API keys. User says: " + prompt
                    }] }] })
                }
            );
            document.getElementById(lid)?.remove();
            const data = await r.json();
            if (!r.ok) throw new Error(data.error?.message || "API error");
            const reply = data.candidates[0].content.parts[0].text;
            chatBody.innerHTML += `<div class="chat-msg bot-msg">${reply}</div>`;
        } catch(err) {
            document.getElementById(lid)?.remove();
            chatBody.innerHTML += `<div class="chat-msg bot-msg" style="color:#d64040;">System Error: ${err.message}</div>`;
        }
        chatBody.scrollTop = chatBody.scrollHeight;
    };

    document.getElementById("ai-chat-send")?.addEventListener("click", handleChat);
    document.getElementById("ai-chat-input")?.addEventListener("keypress", e => {
        if (e.key === "Enter") handleChat();
    });

}); // end DOMContentLoaded
