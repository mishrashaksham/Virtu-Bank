// ============================================================
//  VirtuBank — script.js  (v3 — full banking features)
//  Data Layer + Transfer + History + Delete Account
// ============================================================

// ─── Constants ───────────────────────────────────────────────
const DB_KEY          = "virtuBankDB";
const SESSION_KEY     = "virtuBankSession";
const INITIAL_BALANCE = 5000;
const UID_LENGTH      = 10;
const UID_CHARSET     = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const MAX_HISTORY     = 5;   // rolling window per account

// ════════════════════════════════════════════════════════════
//  SECTION 1 · DATA LAYER
// ════════════════════════════════════════════════════════════

function loadDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("[VirtuBank] loadDB:", e);
    return [];
  }
}

function saveDB(db) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    return true;
  } catch (e) {
    console.error("[VirtuBank] saveDB:", e);
    return false;
  }
}

function generateUID(db) {
  const used = new Set(db.map(a => a.uid));
  let uid;
  do {
    uid = Array.from({ length: UID_LENGTH }, () => {
      const i = crypto.getRandomValues(new Uint8Array(1))[0] % UID_CHARSET.length;
      return UID_CHARSET[i];
    }).join("");
  } while (used.has(uid));
  return uid;
}

function nowISO() { return new Date().toISOString(); }

// ── createAccount ────────────────────────────────────────────
function createAccount(
  name, age, gender, maritalStatus,
  pan, aadhar, email, mobile, address,
  password, mpin
) {
  const fields = { name, age, gender, maritalStatus, pan, aadhar, email, mobile, address, password, mpin };
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined || v === null || String(v).trim() === "")
      return { success: false, message: `'${k}' is required.` };
  }

  const db       = loadDB();
  const panUp    = String(pan).trim().toUpperCase();
  const emailLo  = String(email).trim().toLowerCase();
  const mobStr   = String(mobile).trim();
  const aadharSt = String(aadhar).trim();

  if (db.some(a => a.pan    === panUp))   return { success: false, message: "PAN already registered." };
  if (db.some(a => a.email  === emailLo)) return { success: false, message: "Email already registered." };
  if (db.some(a => a.mobile === mobStr))  return { success: false, message: "Mobile already registered." };
  if (db.some(a => a.aadhar === aadharSt))return { success: false, message: "Aadhaar already registered." };

  const account = {
    uid: generateUID(db),
    name:          String(name).trim(),
    age:           Number(age),
    gender:        String(gender).trim(),
    maritalStatus: String(maritalStatus).trim(),
    pan:           panUp,
    aadhar:        aadharSt,
    email:         emailLo,
    mobile:        mobStr,
    address:       String(address).trim(),
    password:      String(password),   // hash in production
    mpin:          String(mpin),       // hash in production
    balance:       INITIAL_BALANCE,
    transactions:  [],
    accountStatus: "active",
    createdAt:     nowISO(),
    updatedAt:     nowISO(),
  };

  db.push(account);
  if (!saveDB(db)) return { success: false, message: "Storage error." };
  return { success: true, message: "Account created.", account };
}

// ── searchAccount ────────────────────────────────────────────
function searchAccount(uid) {
  if (!uid || !String(uid).trim())
    return { success: false, message: "UID is required." };

  const db    = loadDB();
  const found = db.find(a => a.uid === String(uid).trim().toUpperCase());
  if (!found) return { success: false, message: `No account found: ${uid}` };
  return { success: true, message: "Found.", account: found };
}

// ── storeTransaction ─────────────────────────────────────────
/**
 * Prepend a transaction to the account's history.
 * Enforces a MAX_HISTORY (5) cap — oldest entry is discarded (array-shift sim).
 *
 * @param {Object} account  - Mutable account object (will be mutated in-place)
 * @param {Object} details  - { type, description, amount, balanceAfter }
 */
function storeTransaction(account, details) {
  const txn = {
    id:           Date.now(),          // simple unique key
    type:         details.type,        // "debit" | "credit"
    description:  details.description,
    amount:       details.amount,
    balanceAfter: details.balanceAfter,
    timestamp:    nowISO(),
  };

  // Add to front (index 0) — newest first
  account.transactions.unshift(txn);

  // O(1) cap: if over limit, remove last element (oldest)
  if (account.transactions.length > MAX_HISTORY) {
    account.transactions.pop();
  }

  account.updatedAt = nowISO();
}

// ── externalTransfer ─────────────────────────────────────────
/**
 * Deduct `amount` from the logged-in user's account.
 * @param {string} senderUID
 * @param {number} amount
 * @param {string} mpin
 * @returns {{ success: boolean, message: string, newBalance?: number }}
 */
function externalTransfer(senderUID, amount, mpin) {
  if (!amount || amount <= 0)
    return { success: false, message: "Enter a valid amount greater than ₹0." };

  const db  = loadDB();
  const idx = db.findIndex(a => a.uid === senderUID);
  if (idx === -1) return { success: false, message: "Sender account not found." };

  const sender = db[idx];
  if (sender.mpin !== String(mpin).trim())
    return { success: false, message: "Incorrect MPIN." };
  if (sender.balance < amount)
    return { success: false, message: `Insufficient balance. Available: ₹${formatBalance(sender.balance)}` };

  sender.balance = parseFloat((sender.balance - amount).toFixed(2));
  storeTransaction(sender, {
    type:         "debit",
    description:  "External Transfer (Withdrawal)",
    amount,
    balanceAfter: sender.balance,
  });

  if (!saveDB(db)) return { success: false, message: "Storage error." };
  return { success: true, message: "Transfer successful.", newBalance: sender.balance };
}

// ── internalTransfer ─────────────────────────────────────────
/**
 * Transfer `amount` from sender to receiver (both in virtuBankDB).
 * @param {string} senderUID
 * @param {string} receiverUID
 * @param {number} amount
 * @param {string} mpin
 */
function internalTransfer(senderUID, receiverUID, amount, mpin) {
  const rUID = String(receiverUID).trim().toUpperCase();

  if (!rUID) return { success: false, message: "Receiver UID is required." };
  if (rUID === senderUID)
    return { success: false, message: "You cannot transfer funds to your own account." };
  if (!amount || amount <= 0)
    return { success: false, message: "Enter a valid amount greater than ₹0." };

  const db      = loadDB();
  const sIdx    = db.findIndex(a => a.uid === senderUID);
  const rIdx    = db.findIndex(a => a.uid === rUID);

  if (sIdx === -1) return { success: false, message: "Sender account not found." };
  if (rIdx === -1) return { success: false, message: `No VirtuBank account found for UID: ${rUID}` };

  const sender   = db[sIdx];
  const receiver = db[rIdx];

  if (sender.mpin !== String(mpin).trim())
    return { success: false, message: "Incorrect MPIN." };
  if (sender.balance < amount)
    return { success: false, message: `Insufficient balance. Available: ₹${formatBalance(sender.balance)}` };

  // Debit sender
  sender.balance = parseFloat((sender.balance - amount).toFixed(2));
  storeTransaction(sender, {
    type:         "debit",
    description:  `Transfer to ${receiver.name} (${rUID})`,
    amount,
    balanceAfter: sender.balance,
  });

  // Credit receiver
  receiver.balance = parseFloat((receiver.balance + amount).toFixed(2));
  storeTransaction(receiver, {
    type:         "credit",
    description:  `Transfer from ${sender.name} (${senderUID})`,
    amount,
    balanceAfter: receiver.balance,
  });

  if (!saveDB(db)) return { success: false, message: "Storage error." };
  return {
    success:    true,
    message:    `₹${formatBalance(amount)} sent to ${receiver.name} successfully.`,
    newBalance: sender.balance,
  };
}

// ── deleteAccount ────────────────────────────────────────────
function deleteAccount(uid) {
  const db     = loadDB();
  const newDB  = db.filter(a => a.uid !== uid);
  if (newDB.length === db.length) return { success: false, message: "Account not found." };
  if (!saveDB(newDB)) return { success: false, message: "Storage error." };
  return { success: true, message: "Account deleted." };
}

function getAllAccounts() { return loadDB(); }
function clearDB()       { localStorage.removeItem(DB_KEY); console.warn("[VirtuBank] DB cleared."); }


// ════════════════════════════════════════════════════════════
//  SECTION 2 · DOM HELPERS
// ════════════════════════════════════════════════════════════

function showSection(id) {
  ["section-login", "section-signup", "section-dashboard"].forEach(sid => {
    document.getElementById(sid).classList.toggle("active", sid === id);
  });
  document.getElementById("site-header").classList.toggle("hidden", id === "section-dashboard");
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.target === id.replace("section-", ""));
  });
}

function showToast(msg, isError = false, duration = 3800) {
  const toast = document.getElementById("toast");
  document.getElementById("toast-message").textContent = msg;
  toast.classList.toggle("toast-error", isError);
  toast.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove("show"), duration);
}

function openModal(id)  { document.getElementById(id).classList.add("open"); }
function closeModal(id) { document.getElementById(id).classList.remove("open"); }

function markError(inputId, errId, msg) {
  const el = document.getElementById(inputId);
  const er = document.getElementById(errId);
  if (el) el.classList.add("error");
  if (er) er.textContent = msg;
}

function clearFormErrors(formId) {
  document.querySelectorAll(`#${formId} .field-error`).forEach(e => (e.textContent = ""));
  document.querySelectorAll(`#${formId} .field-input`).forEach(e => e.classList.remove("error"));
}

function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

function formatBalance(n) {
  return Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

function saveSession(uid)  { sessionStorage.setItem(SESSION_KEY, uid); }
function clearSession()    { sessionStorage.removeItem(SESSION_KEY); }
function getSessionUID()   { return sessionStorage.getItem(SESSION_KEY); }


// ════════════════════════════════════════════════════════════
//  SECTION 3 · DASHBOARD RENDER
// ════════════════════════════════════════════════════════════

function populateDashboard(account) {
  document.getElementById("dash-name").textContent    = account.name;
  document.getElementById("dash-uid").textContent     = account.uid;
  document.getElementById("dash-balance").textContent = formatBalance(account.balance);
  document.getElementById("dash-greeting").textContent = `${getGreeting()}, ${account.name.split(" ")[0]}`;

  const count = account.transactions.length;
  document.getElementById("dash-txn-count").textContent = `${count} record${count !== 1 ? "s" : ""}`;

  renderHistory(account.transactions);
}

function refreshDashboardBalance(uid) {
  const res = searchAccount(uid);
  if (res.success) populateDashboard(res.account);
}

// ── renderHistory ────────────────────────────────────────────
function renderHistory(transactions) {
  const list  = document.getElementById("history-list");
  const badge = document.getElementById("history-count-badge");
  badge.textContent = `${transactions.length} / ${MAX_HISTORY}`;

  if (!transactions.length) {
    list.innerHTML = `
      <div class="history-empty">
        <span class="history-empty-icon" aria-hidden="true">◌</span>
        <p>No transactions yet. Make your first transfer to get started.</p>
      </div>`;
    return;
  }

  list.innerHTML = transactions.map((t, i) => {
    const isDebit  = t.type === "debit";
    const sign     = isDebit ? "−" : "+";
    const cls      = isDebit ? "debit" : "credit";
    const icon     = isDebit ? "↑" : "↓";
    return `
      <div class="txn-row" style="animation-delay:${i * 0.05}s">
        <div class="txn-icon-wrap ${cls}" aria-hidden="true">${icon}</div>
        <div class="txn-body">
          <span class="txn-description" title="${t.description}">${t.description}</span>
          <span class="txn-meta">${formatDateTime(t.timestamp)} &nbsp;·&nbsp; Bal: ₹${formatBalance(t.balanceAfter)}</span>
        </div>
        <span class="txn-amount ${cls}">${sign}₹${formatBalance(t.amount)}</span>
      </div>`;
  }).join("");
}


// ════════════════════════════════════════════════════════════
//  SECTION 4 · MATH CAPTCHA
// ════════════════════════════════════════════════════════════

let _captchaAnswer = null;

function generateCaptcha() {
  const ops  = ["+", "-", "×"];
  const op   = ops[Math.floor(Math.random() * ops.length)];
  let a, b, answer;

  if (op === "+") {
    a = Math.floor(Math.random() * 50) + 5;
    b = Math.floor(Math.random() * 50) + 5;
    answer = a + b;
  } else if (op === "-") {
    a = Math.floor(Math.random() * 50) + 20;
    b = Math.floor(Math.random() * (a - 1)) + 1;
    answer = a - b;
  } else {
    a = Math.floor(Math.random() * 12) + 2;
    b = Math.floor(Math.random() * 10) + 2;
    answer = a * b;
  }

  _captchaAnswer = answer;
  document.getElementById("captcha-question").textContent = `What is  ${a}  ${op}  ${b} ?`;
  document.getElementById("captcha-answer").value = "";
  document.getElementById("captcha-err").textContent = "";
}


// ════════════════════════════════════════════════════════════
//  SECTION 5 · SIGNUP VALIDATION
// ════════════════════════════════════════════════════════════

const PAN_REGEX    = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/;
const EMAIL_REGEX  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateSignup() {
  let valid = true;
  const req = [
    ["s-name",    "s-name-err",    "Full name is required."],
    ["s-age",     "s-age-err",     "Age is required."],
    ["s-gender",  "s-gender-err",  "Please select a gender."],
    ["s-marital", "s-marital-err", "Please select marital status."],
    ["s-pan",     "s-pan-err",     "PAN number is required."],
    ["s-aadhar",  "s-aadhar-err",  "Aadhaar number is required."],
    ["s-email",   "s-email-err",   "Email is required."],
    ["s-mobile",  "s-mobile-err",  "Mobile is required."],
    ["s-address", "s-address-err", "Address is required."],
    ["s-password","s-password-err","Password is required."],
    ["s-mpin",    "s-mpin-err",    "MPIN is required."],
  ];
  req.forEach(([inp, err, msg]) => {
    const el = document.getElementById(inp);
    if (!el || !el.value.trim()) { markError(inp, err, msg); valid = false; }
  });

  const age = parseInt(document.getElementById("s-age").value, 10);
  if (!isNaN(age) && (age < 18 || age > 120)) { markError("s-age","s-age-err","Age must be 18–120."); valid = false; }

  const pan = document.getElementById("s-pan").value.trim().toUpperCase();
  if (pan && !PAN_REGEX.test(pan))   { markError("s-pan","s-pan-err","Invalid PAN (e.g. ABCDE1234F)."); valid = false; }

  const aadhar = document.getElementById("s-aadhar").value.trim();
  if (aadhar && !/^\d{12}$/.test(aadhar)) { markError("s-aadhar","s-aadhar-err","Aadhaar must be 12 digits."); valid = false; }

  const email = document.getElementById("s-email").value.trim();
  if (email && !EMAIL_REGEX.test(email)) { markError("s-email","s-email-err","Enter a valid email."); valid = false; }

  const mobile = document.getElementById("s-mobile").value.trim();
  if (mobile && !MOBILE_REGEX.test(mobile)) { markError("s-mobile","s-mobile-err","Enter a valid 10-digit mobile."); valid = false; }

  const pwd = document.getElementById("s-password").value;
  if (pwd && pwd.length < 8) { markError("s-password","s-password-err","Min 8 characters."); valid = false; }

  const mpin = document.getElementById("s-mpin").value.trim();
  if (mpin && !/^\d{4,6}$/.test(mpin)) { markError("s-mpin","s-mpin-err","MPIN must be 4–6 digits."); valid = false; }

  return valid;
}


// ════════════════════════════════════════════════════════════
//  SECTION 6 · EVENT LISTENERS
// ════════════════════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", () => {

  // ── Session restore ──────────────────────────────────────
  const savedUID = getSessionUID();
  if (savedUID) {
    const res = searchAccount(savedUID);
    if (res.success) {
      populateDashboard(res.account);
      showSection("section-dashboard");
    } else {
      clearSession();
    }
  }

  // ── Navigation ───────────────────────────────────────────
  document.getElementById("nav-login-btn").addEventListener("click", () => showSection("section-login"));
  document.getElementById("nav-signup-btn").addEventListener("click", () => showSection("section-signup"));
  document.getElementById("goto-signup-link").addEventListener("click", () => { showSection("section-signup"); window.scrollTo({ top:0, behavior:"smooth" }); });
  document.getElementById("goto-login-link").addEventListener("click",  () => { showSection("section-login");  window.scrollTo({ top:0, behavior:"smooth" }); });

  // ── Password toggles ─────────────────────────────────────
  document.querySelectorAll(".toggle-pass").forEach(btn => {
    btn.addEventListener("click", () => {
      const t = document.getElementById(btn.dataset.target);
      if (!t) return;
      const pw = t.type === "password";
      t.type = pw ? "text" : "password";
      btn.querySelector(".eye-icon").textContent = pw ? "🙈" : "👁";
    });
  });

  // ── Auto-format ──────────────────────────────────────────
  document.getElementById("s-pan").addEventListener("input", function () {
    const p = this.selectionStart; this.value = this.value.toUpperCase(); this.setSelectionRange(p,p);
  });
  document.getElementById("login-uid").addEventListener("input", function () {
    const p = this.selectionStart; this.value = this.value.toUpperCase(); this.setSelectionRange(p,p);
  });
  document.getElementById("int-receiver-uid").addEventListener("input", function () {
    const p = this.selectionStart; this.value = this.value.toUpperCase(); this.setSelectionRange(p,p);
  });
  ["s-aadhar","s-mobile","s-mpin","ext-mpin","int-mpin"].forEach(id => {
    document.getElementById(id).addEventListener("input", function () { this.value = this.value.replace(/\D/g,""); });
  });

  // ── Clear error on input ─────────────────────────────────
  document.querySelectorAll(".field-input").forEach(inp => {
    inp.addEventListener("input", function () {
      this.classList.remove("error");
      const w = this.closest(".field-group");
      if (w) { const e = w.querySelector(".field-error"); if (e) e.textContent = ""; }
    });
  });

  // ════════════════════════════════════════════════════════
  //  SIGNUP
  // ════════════════════════════════════════════════════════
  document.getElementById("signup-form").addEventListener("submit", e => {
    e.preventDefault();
    clearFormErrors("signup-form");
    if (!validateSignup()) {
      const first = document.querySelector("#signup-form .field-input.error");
      if (first) first.scrollIntoView({ behavior:"smooth", block:"center" });
      return;
    }
    const btn = document.getElementById("signup-submit-btn");
    btn.disabled = true;
    btn.querySelector(".btn-text").textContent = "Creating…";

    setTimeout(() => {
      const result = createAccount(
        document.getElementById("s-name").value.trim(),
        document.getElementById("s-age").value.trim(),
        document.getElementById("s-gender").value,
        document.getElementById("s-marital").value,
        document.getElementById("s-pan").value.trim(),
        document.getElementById("s-aadhar").value.trim(),
        document.getElementById("s-email").value.trim(),
        document.getElementById("s-mobile").value.trim(),
        document.getElementById("s-address").value.trim(),
        document.getElementById("s-password").value,
        document.getElementById("s-mpin").value.trim()
      );
      btn.disabled = false;
      btn.querySelector(".btn-text").textContent = "Create My Account";
      if (result.success) {
        document.getElementById("signup-form").reset();
        document.getElementById("modal-uid-value").textContent = result.account.uid;
        openModal("uid-modal");
      } else {
        showToast(result.message, true);
      }
    }, 400);
  });

  // UID modal actions
  document.getElementById("copy-uid-btn").addEventListener("click", () => {
    const uid = document.getElementById("modal-uid-value").textContent;
    navigator.clipboard.writeText(uid)
      .then(() => { const b = document.getElementById("copy-uid-btn"); b.textContent = "Copied ✓"; setTimeout(() => (b.textContent = "Copy"), 2000); })
      .catch(() => showToast("Could not copy — note the UID manually.", true));
  });
  document.getElementById("modal-proceed-btn").addEventListener("click", () => {
    const uid = document.getElementById("modal-uid-value").textContent;
    closeModal("uid-modal");
    showSection("section-login");
    showToast("Account created! Sign in with your UID and password.");
    document.getElementById("login-uid").value = uid;
    document.getElementById("login-password").focus();
  });
  document.getElementById("uid-modal").addEventListener("click", e => { if (e.target === e.currentTarget) closeModal("uid-modal"); });

  // ════════════════════════════════════════════════════════
  //  LOGIN
  // ════════════════════════════════════════════════════════
  document.getElementById("login-form").addEventListener("submit", e => {
    e.preventDefault();
    clearFormErrors("login-form");
    const uid = document.getElementById("login-uid").value.trim().toUpperCase();
    const pwd = document.getElementById("login-password").value;
    let err = false;
    if (!uid) { markError("login-uid","login-uid-err","Please enter your Account UID."); err = true; }
    if (!pwd) { markError("login-password","login-pass-err","Please enter your password."); err = true; }
    if (err) return;

    const btn = document.getElementById("login-submit-btn");
    btn.disabled = true; btn.querySelector(".btn-text").textContent = "Verifying…";

    setTimeout(() => {
      btn.disabled = false; btn.querySelector(".btn-text").textContent = "Sign In";
      const res = searchAccount(uid);
      if (!res.success) { markError("login-uid","login-uid-err","No account found with this UID."); return; }
      if (res.account.password !== pwd) { markError("login-password","login-pass-err","Incorrect password."); document.getElementById("login-password").value = ""; return; }
      if (res.account.accountStatus !== "active") { showToast("Account inactive. Contact support.", true); return; }

      saveSession(res.account.uid);
      populateDashboard(res.account);
      document.getElementById("login-form").reset();
      showSection("section-dashboard");
      window.scrollTo({ top:0 });
      setTimeout(() => showToast(`Welcome back, ${res.account.name.split(" ")[0]}! 👋`), 300);
    }, 500);
  });

  // ════════════════════════════════════════════════════════
  //  LOGOUT
  // ════════════════════════════════════════════════════════
  document.getElementById("logout-btn").addEventListener("click", () => {
    clearSession();
    showSection("section-login");
    showToast("Signed out successfully.");
  });

  // ════════════════════════════════════════════════════════
  //  TRANSFER MODAL
  // ════════════════════════════════════════════════════════
  document.getElementById("open-transfer-btn").addEventListener("click", () => {
    clearFormErrors("external-transfer-form");
    clearFormErrors("internal-transfer-form");
    document.getElementById("external-transfer-form").reset();
    document.getElementById("internal-transfer-form").reset();
    openModal("transfer-modal");
  });
  document.getElementById("transfer-close-btn").addEventListener("click", () => closeModal("transfer-modal"));
  document.getElementById("transfer-modal").addEventListener("click", e => { if (e.target === e.currentTarget) closeModal("transfer-modal"); });

  // Tab switching
  document.querySelectorAll(".modal-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".modal-tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".transfer-panel").forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(`transfer-panel-${tab.dataset.tab}`).classList.add("active");
    });
  });

  // External Transfer submit
  document.getElementById("external-transfer-form").addEventListener("submit", e => {
    e.preventDefault();
    clearFormErrors("external-transfer-form");
    const amount = parseFloat(document.getElementById("ext-amount").value);
    const mpin   = document.getElementById("ext-mpin").value.trim();
    const uid    = getSessionUID();
    let err = false;
    if (!amount || amount <= 0) { markError("ext-amount","ext-amount-err","Enter a valid amount."); err = true; }
    if (!mpin)                  { markError("ext-mpin","ext-mpin-err","MPIN is required."); err = true; }
    if (err) return;

    const btn = document.getElementById("ext-submit-btn");
    btn.disabled = true; btn.querySelector(".btn-text").textContent = "Processing…";

    setTimeout(() => {
      btn.disabled = false; btn.querySelector(".btn-text").textContent = "Confirm Transfer";
      const result = externalTransfer(uid, amount, mpin);
      if (!result.success) {
        if (result.message.includes("MPIN"))    markError("ext-mpin","ext-mpin-err",result.message);
        else if (result.message.includes("bal")) markError("ext-amount","ext-amount-err",result.message);
        else showToast(result.message, true);
        return;
      }
      closeModal("transfer-modal");
      document.getElementById("external-transfer-form").reset();
      refreshDashboardBalance(uid);
      showToast(`₹${formatBalance(amount)} transferred successfully.`);
    }, 500);
  });

  // Internal Transfer submit
  document.getElementById("internal-transfer-form").addEventListener("submit", e => {
    e.preventDefault();
    clearFormErrors("internal-transfer-form");
    const rUID   = document.getElementById("int-receiver-uid").value.trim().toUpperCase();
    const amount = parseFloat(document.getElementById("int-amount").value);
    const mpin   = document.getElementById("int-mpin").value.trim();
    const uid    = getSessionUID();
    let err = false;
    if (!rUID)                  { markError("int-receiver-uid","int-uid-err","Receiver UID is required."); err = true; }
    if (!amount || amount <= 0) { markError("int-amount","int-amount-err","Enter a valid amount."); err = true; }
    if (!mpin)                  { markError("int-mpin","int-mpin-err","MPIN is required."); err = true; }
    if (err) return;

    const btn = document.getElementById("int-submit-btn");
    btn.disabled = true; btn.querySelector(".btn-text").textContent = "Sending…";

    setTimeout(() => {
      btn.disabled = false; btn.querySelector(".btn-text").textContent = "Send Money";
      const result = internalTransfer(uid, rUID, amount, mpin);
      if (!result.success) {
        if (result.message.includes("UID") || result.message.includes("account found"))
          markError("int-receiver-uid","int-uid-err",result.message);
        else if (result.message.includes("MPIN"))
          markError("int-mpin","int-mpin-err",result.message);
        else if (result.message.includes("bal") || result.message.includes("own"))
          markError("int-amount","int-amount-err",result.message);
        else showToast(result.message, true);
        return;
      }
      closeModal("transfer-modal");
      document.getElementById("internal-transfer-form").reset();
      refreshDashboardBalance(uid);
      showToast(result.message);
    }, 500);
  });

  // ════════════════════════════════════════════════════════
  //  HISTORY TOGGLE
  // ════════════════════════════════════════════════════════
  document.getElementById("toggle-history-btn").addEventListener("click", () => {
    const panel = document.getElementById("history-panel");
    const btn   = document.getElementById("toggle-history-btn");
    const isOpen = panel.classList.toggle("open");
    btn.classList.toggle("active", isOpen);
    btn.querySelector(".action-btn-label").textContent = isOpen ? "Hide History" : "History";
    if (isOpen) {
      panel.scrollIntoView({ behavior:"smooth", block:"nearest" });
    }
  });

  // ════════════════════════════════════════════════════════
  //  DELETE ACCOUNT MODAL
  // ════════════════════════════════════════════════════════
  document.getElementById("open-delete-btn").addEventListener("click", () => {
    generateCaptcha();
    openModal("delete-modal");
  });
  document.getElementById("delete-close-btn").addEventListener("click", () => closeModal("delete-modal"));
  document.getElementById("delete-cancel-btn").addEventListener("click", () => closeModal("delete-modal"));
  document.getElementById("delete-modal").addEventListener("click", e => { if (e.target === e.currentTarget) closeModal("delete-modal"); });

  document.getElementById("confirm-delete-btn").addEventListener("click", () => {
    const userAnswer = parseInt(document.getElementById("captcha-answer").value, 10);
    const errEl      = document.getElementById("captcha-err");

    if (isNaN(userAnswer)) {
      errEl.textContent = "Please enter a number.";
      document.getElementById("captcha-answer").classList.add("error");
      return;
    }
    if (userAnswer !== _captchaAnswer) {
      errEl.textContent = "Incorrect answer. Try again.";
      document.getElementById("captcha-answer").classList.add("error");
      generateCaptcha();   // refresh captcha on wrong answer
      return;
    }

    const uid    = getSessionUID();
    const result = deleteAccount(uid);
    if (!result.success) { showToast(result.message, true); return; }

    closeModal("delete-modal");
    clearSession();
    showSection("section-login");
    showToast("Your account has been permanently deleted.");
  });

}); // end DOMContentLoaded
