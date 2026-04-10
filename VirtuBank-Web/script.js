// ============================================================
//  VirtuBank — script.js   Bharat 2.0
//  i18n (14 langs) + Gyani + Trust Score + Virtu-Loans
//  Services Hub + 3D Virtu-Cards + Group Gullak Invites
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

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

// ── 2. CONSTANTS ────────────────────────────────────────────
const SESSION_KEY      = "virtuBankSession";
const INITIAL_BALANCE  = 5000;
const MAX_HISTORY      = 5;
const GULLAK_INTEREST  = 0.065;
const GOLD_PRICE_PER_GRAM = 7420;
const MAX_TRUST        = 1000;

// ── 3. LOCALIZATION DICTIONARY ──────────────────────────────
const TRANSLATIONS = {
  en: {
    nav_login:"Login", nav_join:"Join Us", brand_badge:"VIT-AP Innovation",
    brand_headline:"Banking for the <em>Next Billion.</em>",
    brand_tagline:"Secure, AI-powered banking for everyone from Amaravati to the world.",
    stat_fees:"Fees", stat_support:"AI Support", login_title:"Welcome Back",
    login_sub:"Enter your unique UID to access your vault.", uid_label:"Account UID",
    pass_label:"Secret Password", sign_in:"Sign In", no_account:"New to VirtuBank?",
    create_acc:"Create an account", join_title:"Join VirtuBank",
    join_sub:"Create a secure digital identity in seconds.", sec_personal:"Personal Details",
    sec_identity:"Identity & Contact", sec_security:"Security", lbl_name:"Full Name",
    lbl_age:"Age", lbl_gender:"Gender", lbl_status:"Status", lbl_pan:"PAN Card",
    lbl_aadhar:"Aadhar Number", lbl_email:"Email Address", lbl_mobile:"Mobile Number",
    lbl_address:"Full Address", lbl_password:"Login Password", lbl_mpin:"4-Digit MPIN",
    create_account:"Create My Account", have_uid:"Already have a UID?",
    sign_in_here:"Sign in here", services_hub:"Services", logout:"Logout",
    savings_acc:"Digital Savings Account", acc_holder:"Account Holder", uid_num:"UID Number",
    trust_score:"Virtu-Trust Score", send_money:"Send Money", voice_pay:"Voice Pay",
    favorites:"Favorites", virtu_invests:"Virtu-Invests", invested_label:"INVESTED",
    status_label:"STATUS", secure:"Secure", view_history:"View VirtuTransactions",
    txn_log:"VirtuTransactions Log", virtu_loans:"Virtu-Loans", loans_sub:"MSME & Kisan Credit",
    need_450:"Need Score 450+", need_600:"Need Score 600+", need_750:"Need Score 750+",
    emergency_fund:"Emergency Fund", laghu_vyapaar:"Laghu Vyapaar", kisan_sahayata:"Kisan Sahayata",
    apply_now:"Apply Now", welcome_aboard:"Welcome Aboard!",
    uid_created:"Your unique digital identity has been created.", your_uid:"Your Private UID",
    save_uid_note:"Please save this UID. You will need it to log in.", go_to_login:"Go to Login",
    virtu_uid_tab:"VirtuBank UID", ext_upi_tab:"External / UPI", receiver_uid:"Receiver UID",
    amount_lbl:"Amount (₹)", confirm_mpin:"Confirm MPIN", save_as_fav:"Save receiver as Favorite",
    upi_id_lbl:"UPI ID / Account", send_via_upi:"Send via UPI",
    voice_instruction:'Say: "Send 500 to [Name in Favorites]"',
    tap_mic:"Tap the mic to start speaking...", start_listening:"Start Listening",
    fav_sub:"Quick-send to your trusted contacts", add_new_fav:"+ Add New Favorite",
    nickname:"Nickname", their_uid:"Their UID", save_favorite:"Save Favorite",
    invest_sub:"Grow your wealth with smart instruments", long_term:"Long-Term",
    digital_gold:"Digital Gold", sip_desc:"Systematic Investment Plan — invest a fixed amount every month.",
    lt_desc:"Lump-sum Fixed Deposit style investment.", gold_desc:"Buy digital 24K gold. Sell anytime at live market rates.",
    sip_amount:"Monthly SIP Amount (₹)", duration_yr:"Duration (years)", calc_returns:"Calculate Returns",
    start_sip:"Start SIP", invest_amount:"Investment Amount (₹)", invest_now:"Invest Now",
    live_gold_price:"Live Gold Price", gold_invest_amt:"Amount to invest (₹)",
    see_how_much_gold:"See How Much Gold", buy_gold:"Buy Gold", your_portfolio:"Your Portfolio",
    services_hub_title:"Services Hub", services_sub:"All your financial tools in one place",
    svc_gullak_desc:"Smart Savings Goal", svc_invest_desc:"SIP, FD & Digital Gold",
    svc_loans_desc:"MSME & Kisan Credit", svc_cards_desc:"Debit & Credit Cards",
    cards_sub:"Click a card to flip and view secure details", credit_locked:"Virtu-Trust Score 850+ needed",
    build_trust:"Keep saving & transacting!", gullak_tagline:"Set a savings goal. Toot-ti nahi, sirf badhti hai.",
    solo_gullak:"Solo Gullak", solo_desc:"Save alone, at your own pace", group_gullak:"Group Gullak",
    group_desc:"Save together with favorites", gullak_name:"Gullak Name / Goal", target_amt:"Target Amount (₹)",
    save_freq:"Saving Frequency", daily:"Daily", weekly:"Weekly", monthly:"Monthly",
    amt_per_interval:"Amount per interval (₹)", invite_members:"Invite Favorite Members",
    create_gullak:"🏺 Create Gullak", days_remaining:"Days Remaining", est_completion:"Estimated Completion",
    interest_earned:"Interest Earned", add_money:"Add Money", withdraw:"Withdraw", pause_delete:"Pause / Delete Gullak",
    add_to_gullak:"Add to Gullak", add_gullak_sub:"Directly deposit any amount into your Gullak",
    deposit_gullak:"Deposit to Gullak", lbl_mpin:"MPIN", withdraw_gullak:"Withdraw from Gullak",
    withdraw_captcha:"Solve the captcha to confirm withdrawal", security_check:"Security Check",
    your_answer:"Your Answer", withdraw_amt:"Withdraw Amount (₹)", confirm_withdrawal:"Confirm Withdrawal",
    pause_sub:"This will stop contributions. Solve to confirm.", confirm_pause:"Confirm Pause",
    gullak_invites:"VirtuGullak Invites", invites_sub:"Accept to join a Group Gullak",
    member_contributions:"Member Contributions", pending_invites:"Pending Invites",
    ai_subtitle:"AI Financial Advisor",
    ai_greeting:"Namaste! Main aapka Virtu-Mitra hoon. Saving ya banking ke baare mein kuch poochna hai?",
    ask_anything:"Ask anything...",
    gyani_send_money:"Send Money lets you transfer funds instantly to any VirtuBank user using their UID, or to any UPI ID externally. Your MPIN verifies every transaction.",
    gyani_virtugullak:"VirtuGullak is your digital piggy bank. Set a savings goal, choose how often you save, and watch your money grow with 6.5% annual interest. You can even save with friends in a Group Gullak!",
    gyani_virtu_loans:"Virtu-Loans are specially designed for small business owners and farmers. Build your Virtu-Trust Score by transacting and saving to unlock Emergency Fund, Laghu Vyapaar, and Kisan Sahayata loans.",
    gyani_virtu_cards:"Virtu-Cards give you a Debit Card for everyday spending and a Credit Card once your Virtu-Trust Score crosses 850. Click either card to flip it and see secure details like CVV."
  },
  hi: {
    nav_login:"लॉगिन", nav_join:"जुड़ें", brand_badge:"VIT-AP इनोवेशन",
    brand_headline:"Banking for the <em>Next Billion.</em>",
    brand_tagline:"अमरावती से दुनिया तक — सबके लिए सुरक्षित AI बैंकिंग।", stat_fees:"शुल्क", stat_support:"AI सहायता",
    login_title:"वापसी पर स्वागत", login_sub:"अपना UID दर्ज करें।", uid_label:"खाता UID", pass_label:"पासवर्ड",
    sign_in:"साइन इन", no_account:"VirtuBank में नए हैं?", create_acc:"खाता बनाएं", join_title:"VirtuBank से जुड़ें",
    join_sub:"कुछ सेकंड में डिजिटल पहचान बनाएं।", sec_personal:"व्यक्तिगत विवरण", sec_identity:"पहचान और संपर्क",
    sec_security:"सुरक्षा", lbl_name:"पूरा नाम", lbl_age:"उम्र", lbl_gender:"लिंग", lbl_status:"स्थिति",
    lbl_pan:"पैन कार्ड", lbl_aadhar:"आधार नंबर", lbl_email:"ईमेल", lbl_mobile:"मोबाइल", lbl_address:"पूरा पता",
    lbl_password:"लॉगिन पासवर्ड", lbl_mpin:"4-अंकीय MPIN", create_account:"मेरा खाता बनाएं",
    have_uid:"पहले से UID है?", sign_in_here:"यहाँ साइन इन करें", services_hub:"सेवाएं", logout:"लॉग आउट",
    savings_acc:"डिजिटल बचत खाता", acc_holder:"खाताधारक", uid_num:"UID नंबर", trust_score:"विर्तु-ट्रस्ट स्कोर",
    send_money:"पैसे भेजें", voice_pay:"वॉइस पे", favorites:"पसंदीदा", virtu_invests:"विर्तु-इन्वेस्ट",
    invested_label:"निवेश", status_label:"स्थिति", secure:"सुरक्षित", view_history:"विर्तु-लेनदेन देखें",
    txn_log:"विर्तु-लेनदेन लॉग", virtu_loans:"विर्तु-लोन", loans_sub:"MSME और किसान क्रेडिट",
    need_450:"450+ स्कोर चाहिए", need_600:"600+ स्कोर चाहिए", need_750:"750+ स्कोर चाहिए",
    emergency_fund:"आपातकालीन फंड", laghu_vyapaar:"लघु व्यापार", kisan_sahayata:"किसान सहायता", apply_now:"अभी आवेदन करें",
    welcome_aboard:"आपका स्वागत है!", uid_created:"आपकी डिजिटल पहचान बन गई।", your_uid:"आपका निजी UID",
    save_uid_note:"यह UID सुरक्षित रखें। लॉगिन के लिए जरूरी है।", go_to_login:"लॉगिन पर जाएं",
    virtu_uid_tab:"VirtuBank UID", ext_upi_tab:"बाहरी / UPI", receiver_uid:"प्राप्तकर्ता UID", amount_lbl:"राशि (₹)",
    confirm_mpin:"MPIN की पुष्टि करें", save_as_fav:"पसंदीदा में सेव करें", upi_id_lbl:"UPI ID / खाता",
    send_via_upi:"UPI से भेजें", voice_instruction:'"Nikki ko 500 bhej do" — बोलकर पैसे भेजें',
    tap_mic:"माइक दबाएं और बोलें...", start_listening:"सुनना शुरू करें", fav_sub:"विश्वसनीय संपर्कों को तुरंत पैसे भेजें",
    add_new_fav:"+ नया पसंदीदा जोड़ें", nickname:"उपनाम", their_uid:"उनका UID", save_favorite:"पसंदीदा सेव करें",
    invest_sub:"स्मार्ट निवेश से संपत्ति बढ़ाएं", long_term:"दीर्घकालिक", digital_gold:"डिजिटल सोना",
    sip_desc:"SIP — हर महीने निश्चित राशि निवेश करें। 1-30 साल के लिए सर्वोत्तम।",
    lt_desc:"एकमुश्त FD जैसा निवेश। 1-10 साल के लिए स्थिर रिटर्न।", gold_desc:"24K डिजिटल सोना खरीदें। कभी भी बेचें।",
    sip_amount:"मासिक SIP राशि (₹)", duration_yr:"अवधि (वर्ष)", calc_returns:"रिटर्न की गणना करें", start_sip:"SIP शुरू करें",
    invest_amount:"निवेश राशि (₹)", invest_now:"अभी निवेश करें", live_gold_price:"लाइव सोने का भाव",
    gold_invest_amt:"निवेश राशि (₹)", see_how_much_gold:"कितना सोना मिलेगा?", buy_gold:"सोना खरीदें",
    your_portfolio:"आपका पोर्टफोलियो", services_hub_title:"सेवा केंद्र", services_sub:"एक जगह सभी वित्तीय सुविधाएं",
    svc_gullak_desc:"स्मार्ट बचत लक्ष्य", svc_invest_desc:"SIP, FD और डिजिटल सोना", svc_loans_desc:"MSME और किसान क्रेडिट",
    svc_cards_desc:"डेबिट और क्रेडिट कार्ड", cards_sub:"CVV देखने के लिए कार्ड पर क्लिक करें",
    credit_locked:"विर्तु-ट्रस्ट स्कोर 850+ चाहिए", build_trust:"बचत और लेनदेन जारी रखें!",
    gullak_tagline:"बचत का लक्ष्य रखें। टूटती नहीं, सिर्फ बढ़ती है।", solo_gullak:"एकल गुल्लक",
    solo_desc:"अकेले, अपनी गति से बचाएं", group_gullak:"ग्रुप गुल्लक", group_desc:"पसंदीदा के साथ मिलकर बचाएं",
    gullak_name:"गुल्लक का नाम / लक्ष्य", target_amt:"लक्ष्य राशि (₹)", save_freq:"बचत आवृत्ति", daily:"दैनिक",
    weekly:"साप्ताहिक", monthly:"मासिक", amt_per_interval:"प्रति अंतराल राशि (₹)", invite_members:"सदस्यों को आमंत्रण दें",
    create_gullak:"🏺 गुल्लक बनाएं", days_remaining:"बाकी दिन", est_completion:"अनुमानित समापन",
    interest_earned:"अर्जित ब्याज", add_money:"पैसे जोड़ें", withdraw:"निकालें", pause_delete:"गुल्लक रोकें / मिटाएं",
    add_to_gullak:"गुल्लक में जोड़ें", add_gullak_sub:"सीधे राशि जमा करें", deposit_gullak:"गुल्लक में जमा करें",
    lbl_mpin:"MPIN", withdraw_gullak:"गुल्लक से निकालें", withdraw_captcha:"निकासी के लिए कैप्चा हल करें",
    security_check:"सुरक्षा जांच", your_answer:"आपका उत्तर", withdraw_amt:"निकासी राशि (₹)",
    confirm_withdrawal:"निकासी की पुष्टि करें", pause_sub:"इससे योगदान बंद होगा। पुष्टि के लिए हल करें।",
    confirm_pause:"रोकने की पुष्टि करें", gullak_invites:"VirtuGullak आमंत्रण",
    invites_sub:"ग्रुप गुल्लक में शामिल होने के लिए स्वीकार करें", member_contributions:"सदस्य योगदान",
    pending_invites:"लंबित आमंत्रण", ai_subtitle:"AI वित्तीय सलाहकार",
    ai_greeting:"नमस्ते! मैं आपका विर्तु-मित्र हूं। बचत या बैंकिंग के बारे में पूछें?", ask_anything:"कुछ भी पूछें...",
    gyani_send_money:"पैसे भेजें — VirtuBank UID से या UPI ID से तुरंत ट्रांसफर करें। हर ट्रांजेक्शन MPIN से सुरक्षित है।",
    gyani_virtugullak:"VirtuGullak आपकी डिजिटल गुल्लक है। बचत का लक्ष्य तय करें, 6.5% सालाना ब्याज पाएं। दोस्तों के साथ ग्रुप गुल्लक भी बना सकते हैं!",
    gyani_virtu_loans:"विर्तु-लोन छोटे व्यापारियों और किसानों के लिए है। ट्रांजेक्शन और बचत से ट्रस्ट स्कोर बढ़ाएं और इमरजेंसी फंड, लघु व्यापार, किसान सहायता लोन अनलॉक करें।",
    gyani_virtu_cards:"विर्तु-कार्ड में डेबिट कार्ड तुरंत मिलता है। क्रेडिट कार्ड के लिए ट्रस्ट स्कोर 850+ चाहिए। CVV देखने के लिए कार्ड पर क्लिक करें।"
  }
};

// Map Telugu, Tamil, Malayalam etc to Hindi logic for now (for length), or keep your stubs
const fallbackLang = Object.keys(TRANSLATIONS)[1] || "en";
['te', 'ta', 'ml', 'kn', 'mr', 'gu', 'bn', 'pa', 'as', 'fr', 'de', 'ru'].forEach(l => {
  if(!TRANSLATIONS[l]) TRANSLATIONS[l] = TRANSLATIONS[fallbackLang]; // Fallback translation
});

const VOICE_PATTERNS = {
  "en-IN": /send\s+(\d+(?:\.\d+)?)\s+(?:rupees?\s+)?to\s+(.+)/i,
  "hi-IN": /(?:(\S+)\s+ko\s+(\d+(?:\.\d+)?)\s+(?:rupee|rupaye|rs)?\s*(?:bhej|do|bhejdo)|send\s+(\d+(?:\.\d+)?)\s+to\s+(.+)|(\d+(?:\.\d+)?)\s+(\S+)\s+ko\s+(?:bhej|do))/i,
};

// ── 4. STATE ────────────────────────────────────────────────
let currentLang     = "en";
let currentLangCode = "en-IN";
let speechRecog     = null;
const nowISO = () => new Date().toISOString();
const fmt    = n  => Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });

// ── 5. i18n APPLY ───────────────────────────────────────────
function t(key) {
  const dict = TRANSLATIONS[currentLang] || {};
  return dict[key] || TRANSLATIONS.en[key] || key;
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    const val = t(key);
    if (val) el.innerHTML = val;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    const val = t(key);
    if (val) el.placeholder = val;
  });
}

// ── 6. GYANI (Help Modal) - BUG 2 FIX ───────────────────────
const GYANI_KEYS = {
  send_money:  "gyani_send_money",
  virtugullak: "gyani_virtugullak",
  virtu_loans: "gyani_virtu_loans",
  virtu_cards: "gyani_virtu_cards"
};
let currentGyaniText = "";

document.querySelectorAll(".gyani-icon[data-feature]").forEach(icon => {
  icon.addEventListener("click", e => {
    e.stopPropagation();
    const featureKey = icon.dataset.feature;
    currentGyaniText = t(GYANI_KEYS[featureKey]) || "";
    document.getElementById("gyani-text-content").textContent = currentGyaniText;
    openModal("gyani-modal");
  });
});

document.getElementById("gyani-close-btn")?.addEventListener("click", () => {
    closeModal("gyani-modal");
    if(window.speechSynthesis) window.speechSynthesis.cancel();
});

document.getElementById("gyani-speak-btn")?.addEventListener("click", () => {
  if (!window.speechSynthesis || !currentGyaniText) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(currentGyaniText);
  utt.lang  = currentLangCode;
  utt.rate  = 0.92;
  window.speechSynthesis.speak(utt);
});

// ── 7. FIRESTORE HELPERS ────────────────────────────────────
async function searchAccount(uid) {
  if (!uid) return { success: false };
  try {
    const snap = await getDoc(doc(db, "accounts", uid.trim().toUpperCase()));
    if (snap.exists()) return { success: true, account: snap.data() };
  } catch (e) { console.error("DB:", e); }
  return { success: false };
}

async function saveAccount(uid, data) { await updateDoc(doc(db, "accounts", uid), data); }

async function createAccount(data) {
  const uid = Array.from({ length: 10 }, () =>
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)]
  ).join("");
  const account = {
    ...data, uid, balance: INITIAL_BALANCE, gullak: null, investments: [], favorites: [], transactions: [],
    gullakInvites: [], virtuTrustScore: 400, createdAt: nowISO()
  };
  await setDoc(doc(db, "accounts", uid), account);
  return uid;
}

function addTxn(acc, txn) {
  acc.transactions.unshift({ ...txn, timestamp: nowISO() });
  if (acc.transactions.length > MAX_HISTORY) acc.transactions.pop();
}

// ── 8. TRUST SCORE ──────────────────────────────────────────
async function bumpTrust(uid, pts) {
  const res = await searchAccount(uid);
  if (!res.success) return 400;
  const nxt = Math.min(MAX_TRUST, (res.account.virtuTrustScore || 400) + pts);
  await saveAccount(uid, { virtuTrustScore: nxt });
  return nxt;
}

function renderTrustScore(score) {
  const s = score || 400, pct = (s / MAX_TRUST) * 100;
  if (document.getElementById("trust-fill")) document.getElementById("trust-fill").style.width = pct + "%";
  if (document.getElementById("trust-score-num")) document.getElementById("trust-score-num").textContent = s;
  [["lock-emergency",450],["lock-vyapaar",600],["lock-kisan",750]].forEach(([id, min]) => {
    document.getElementById(id)?.classList.toggle("unlocked", s >= min);
  });
  document.getElementById("credit-progress-fill")?.setAttribute("style", `width:${Math.min(100,(s/850)*100)}%`);
  document.getElementById("credit-locked-overlay")?.classList.toggle("hidden", s >= 850);
}

// ── 9. CARD GENERATION ──────────────────────────────────────
function populateCards(acc) {
  const seed = (acc.uid || "X").split("").reduce((a,c) => a + c.charCodeAt(0), 0);
  const debitNum  = `${4000+(seed%1000)} ${1000+(seed*7%9000)} ${1000+(seed*3%9000)} ${1000+(seed*11%9000)}`;
  document.getElementById("debit-card-name").textContent  = (acc.name||"").toUpperCase().slice(0,20);
  document.getElementById("debit-card-num").textContent   = debitNum;
  document.getElementById("debit-card-exp").textContent   = `${String((seed%12)+1).padStart(2,"0")}/${new Date().getFullYear()+4}`;
  document.getElementById("debit-card-cvv").textContent   = String(100+seed%900);
  document.getElementById("credit-card-name").textContent = (acc.name||"").toUpperCase().slice(0,20);
  document.getElementById("credit-card-cvv").textContent  = String(100+(seed*3)%900);
  renderTrustScore(acc.virtuTrustScore);
}

// ── 10. DASHBOARD RENDER ─────────────────────────────────────
function populateDashboard(acc) {
  document.getElementById("dash-name").textContent    = acc.name;
  document.getElementById("dash-uid").textContent     = acc.uid;
  document.getElementById("dash-balance").textContent = fmt(acc.balance);
  document.getElementById("dash-greeting").textContent= `Namaste, ${acc.name.split(" ")[0]} 👋`;
  document.getElementById("dash-txn-count").textContent = acc.transactions?.length ?? 0;
  document.getElementById("dash-gullak-balance").textContent = fmt(acc.gullak?.currentAmount ?? 0);
  const totalInv = (acc.investments || []).reduce((s,i) => s + (i.amount||0), 0);
  document.getElementById("dash-invest-balance").textContent = fmt(totalInv);
  renderTrustScore(acc.virtuTrustScore || 400);
  
  const invites = (acc.gullakInvites || []).filter(i => i.status === "pending");
  const invBtn  = document.getElementById("open-gullak-invites-btn");
  if (invBtn) {
    invBtn.style.display = invites.length ? "inline-flex" : "none";
    document.getElementById("invites-count-badge").textContent = invites.length;
  }
  
  const badgeMap = { external: '<span class="txn-badge badge-ext">UPI</span>', internal: '<span class="txn-badge badge-int">Virtu</span>', gullak: '<span class="txn-badge badge-gullak">Gullak</span>', invest: '<span class="txn-badge badge-invest">Invest</span>' };
  const list  = document.getElementById("history-list");
  const txns  = acc.transactions || [];
  document.getElementById("hist-badge").textContent = `${txns.length}/${MAX_HISTORY}`;
  list.innerHTML = txns.length ? txns.map(t => `
    <div class="txn-row"><div class="txn-icon-wrap ${t.type}">${t.type==="debit"?"↑":"↓"}</div>
      <div class="txn-body"><span class="txn-description">${t.description} ${badgeMap[t.category]||""}</span><span class="txn-meta">${new Date(t.timestamp).toLocaleString("en-IN")}</span></div>
      <span class="txn-amount ${t.type}">${t.type==="debit"?"-":"+"}₹${fmt(t.amount)}</span>
    </div>`).join("") : `<p style="text-align:center;opacity:.6;padding:20px;">No VirtuTransactions yet.</p>`;
}

// ── 11. GULLAK CHART ─────────────────────────────────────────
function drawGullakChart(gullak) {
  const canvas = document.getElementById("gullak-chart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width = canvas.offsetWidth || 460, H = canvas.height = 130;
  ctx.clearRect(0, 0, W, H);
  const target = gullak.targetAmount, current = gullak.currentAmount;
  const freqDays = { daily:1, weekly:7, monthly:30 }[gullak.frequency] || 30;
  const intervalsLeft = Math.ceil((target - current) / gullak.limitPerInterval);
  const totalDays = Math.max(intervalsLeft * freqDays + 10, 60);
  const step = Math.max(1, Math.floor(totalDays / 50));
  const points = [];
  let simBal = current;
  for (let d = 0; d <= totalDays; d += step) {
    if (d % freqDays === 0) simBal = Math.min(target, simBal + gullak.limitPerInterval + simBal * GULLAK_INTEREST / 365 * step);
    points.push({ d, val: simBal });
  }
  const pad = { l: 38, r: 8, t: 8, b: 22 }, W2 = W - pad.l - pad.r, H2 = H - pad.t - pad.b;
  const toX = d => pad.l + (d / totalDays) * W2, toY = v => pad.t + H2 - (Math.min(v, target) / target) * H2;
  
  ctx.strokeStyle = "rgba(0,0,0,.05)"; ctx.lineWidth = 1;
  [0,.25,.5,.75,1].forEach(f => {
    const y = toY(target * f); ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W-pad.r, y); ctx.stroke();
    ctx.fillStyle = "rgba(0,0,0,.4)"; ctx.font = "9px Poppins"; ctx.fillText("₹" + Math.round(target*f/1000) + "k", 2, y+4);
  });
  
  const grad = ctx.createLinearGradient(0, pad.t, 0, H - pad.b);
  grad.addColorStop(0, "rgba(42,138,84,.35)"); grad.addColorStop(1, "rgba(42,138,84,.03)");
  ctx.beginPath();
  points.forEach((p,i) => i===0 ? ctx.moveTo(toX(p.d), toY(p.val)) : ctx.lineTo(toX(p.d), toY(p.val)));
  ctx.lineTo(toX(points[points.length-1].d), H - pad.b); ctx.lineTo(pad.l, H - pad.b);
  ctx.closePath(); ctx.fillStyle = grad; ctx.fill();
  
  ctx.beginPath(); ctx.strokeStyle = "rgba(42,138,84,.9)"; ctx.lineWidth = 2;
  points.forEach((p,i) => i===0 ? ctx.moveTo(toX(p.d), toY(p.val)) : ctx.lineTo(toX(p.d), toY(p.val))); ctx.stroke();
  
  ctx.beginPath(); ctx.arc(toX(0), toY(current), 5, 0, Math.PI*2);
  ctx.fillStyle = "#e86018"; ctx.fill(); ctx.fillStyle = "rgba(0,0,0,.4)"; ctx.fillText("Today", toX(0)-14, H-4);
}

// ── 12. GULLAK ACTIVE VIEW (BUG 1 FIX) ───────────────────────
function renderGullakActiveView(gullak, myUID, isMember = false) {
  document.getElementById("gullak-create-view").style.display = "none";
  document.getElementById("gullak-active-view").style.display = "block";
  const current = gullak.currentAmount, target = gullak.targetAmount;
  const pct = Math.min(100, (current / target) * 100).toFixed(1);
  
  document.getElementById("g-display-name").textContent   = gullak.name;
  document.getElementById("g-current-bal").textContent    = fmt(current);
  document.getElementById("g-target-display").textContent = fmt(target);
  document.getElementById("g-progress-fill").style.width  = pct + "%";
  document.getElementById("g-progress-pct").textContent   = pct + "%";
  document.getElementById("g-interest-badge").textContent = `+${(GULLAK_INTEREST*100).toFixed(1)}% p.a. interest`;
  document.getElementById("g-auto-status").textContent    = gullak.autoSave !== false ? "ON" : "OFF";
  
  const created = new Date(gullak.createdAt);
  const daysEl  = Math.floor((Date.now() - created) / 86400000);
  document.getElementById("g-interest-earned").textContent = "₹" + fmt(parseFloat(((gullak.principalDeposited||current)*GULLAK_INTEREST/365*daysEl).toFixed(2)));
  
  const freqDays = { daily:1, weekly:7, monthly:30 }[gullak.frequency] || 30;
  const daysLeft = Math.ceil(Math.max(0, target - current) / gullak.limitPerInterval) * freqDays;
  document.getElementById("g-days-left").textContent = daysLeft > 0 ? daysLeft + "d" : "🎉 Done!";
  document.getElementById("g-eta").textContent = daysLeft > 0 ? new Date(Date.now()+daysLeft*86400000).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : "Completed!";
    
  const tracker = document.getElementById("g-contribution-tracker");
  if (gullak.type === "group") {
    tracker.style.display = "block";
    const contribs = gullak.contributions || {};
    const acceptedMembers = gullak.acceptedMembers || [];
    
    // Label Owner vs Member correctly
    const allMembers = [
      { uid: isMember ? gullak.ownerUID : myUID, name: isMember ? "Owner" : "You (Owner)", isOwner: true },
      ...acceptedMembers.map(m => ({ uid: m.uid, name: m.uid === myUID ? "You (Member)" : m.name, isOwner: false }))
    ];
    
    document.getElementById("g-contributions-list").innerHTML = allMembers.map(m => `
      <div class="g-contribution-row">
        <div class="g-contrib-info"><span class="g-contrib-name">${m.name}${m.isOwner?" 👑":""}</span><span class="g-contrib-status">Accepted Member</span></div>
        <span class="g-contrib-amt">₹${fmt(contribs[m.uid] || 0)}</span>
      </div>`).join("");
      
    document.getElementById("g-pending-invites-wrap").style.display = (gullak.pendingInvites||[]).length && !isMember ? "block" : "none";
    document.getElementById("g-pending-invites-list").innerHTML = (gullak.pendingInvites||[]).map(p => `
      <div class="g-pending-row"><span class="g-pending-name">👤 ${p.name}</span><span class="g-pending-label">📬 Invite Sent</span></div>`).join("");
  } else { tracker.style.display = "none"; }
  
  // Bug 1 Fix: Hide owner controls if viewing as a member
  document.getElementById("g-withdraw-btn").style.display = isMember ? "none" : "flex";
  document.getElementById("g-pause-btn").style.display = isMember ? "none" : "inline-block";
  document.getElementById("g-auto-toggle-btn").style.display = isMember ? "none" : "flex";

  drawGullakChart(gullak);
}

// ── 13. UTILITIES & MODALS ──────────────────────────────────
function showToast(msg, isErr=false) {
  const t=document.getElementById("toast"), tm=document.getElementById("toast-message");
  if (!t) return; tm.textContent = msg; t.className = isErr ? "toast show toast-error" : "toast show";
  clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove("show"), 3500);
}
function openModal(id)  { document.getElementById(id)?.classList.add("open"); }
function closeModal(id) { document.getElementById(id)?.classList.remove("open"); }

function showSection(id) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.getElementById(id)?.classList.add("active");
  document.getElementById("site-header").classList.toggle("hidden", id==="section-dashboard");
  document.getElementById("ai-fab").style.display = (id==="section-dashboard") ? "flex" : "none";
}

// ═══════════════════════════════════════════════════════════
//  MAIN EVENT LISTENERS
// ═══════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", async () => {
  applyTranslations();

  // Basic Nav & Dropdown
  document.getElementById("lang-btn")?.addEventListener("click", e => { e.stopPropagation(); document.getElementById("lang-menu").classList.toggle("open"); });
  document.addEventListener("click", () => document.getElementById("lang-menu")?.classList.remove("open"));
  document.querySelectorAll(".lang-option").forEach(opt => {
    opt.addEventListener("click", () => {
      currentLang = opt.dataset.lang; currentLangCode = opt.dataset.code;
      document.querySelectorAll(".lang-option").forEach(o => o.classList.remove("active")); opt.classList.add("active");
      document.getElementById("lang-label").textContent = opt.textContent.trim(); document.getElementById("lang-flag").textContent = opt.dataset.flag;
      applyTranslations();
    });
  });

  const session = sessionStorage.getItem(SESSION_KEY);
  if (session) {
    const res = await searchAccount(session);
    if (res.success) { populateDashboard(res.account); showSection("section-dashboard"); }
  }

  document.getElementById("nav-login-btn")?.addEventListener("click", () => showSection("section-login"));
  document.getElementById("nav-signup-btn")?.addEventListener("click", () => showSection("section-signup"));
  document.getElementById("goto-signup-link")?.addEventListener("click",() => showSection("section-signup"));
  document.getElementById("goto-login-link")?.addEventListener("click",() => showSection("section-login"));
  document.getElementById("logout-btn")?.addEventListener("click", () => { sessionStorage.removeItem(SESSION_KEY); location.reload(); });

  // 3D Cards logic
  document.getElementById("debit-card-scene")?.addEventListener("click", () => document.getElementById("debit-card-flip")?.classList.toggle("flipped"));
  document.getElementById("credit-card-scene")?.addEventListener("click", async () => {
    const res = await searchAccount(sessionStorage.getItem(SESSION_KEY));
    if (res.success && (res.account.virtuTrustScore || 400) >= 850) { document.getElementById("credit-card-flip")?.classList.toggle("flipped"); } 
    else { showToast("Build trust score to 850 first!", true); }
  });

  // Services Hub
  document.getElementById("open-services-btn")?.addEventListener("click", () => openModal("services-modal"));
  document.getElementById("services-close-btn")?.addEventListener("click",() => closeModal("services-modal"));
  document.getElementById("svc-gullak")?.addEventListener("click",  () => { closeModal("services-modal"); document.getElementById("open-gullak-btn").click(); });
  document.getElementById("svc-cards")?.addEventListener("click",   async () => { closeModal("services-modal"); const res = await searchAccount(sessionStorage.getItem(SESSION_KEY)); if (res.success) populateCards(res.account); openModal("cards-modal"); });
  document.getElementById("cards-close-btn")?.addEventListener("click", () => closeModal("cards-modal"));

  // ── VIRTU-GULLAK INTEGRATION (BUG 1 FIX) ────────────────────────
  async function openGullakModal() {
    const uid = sessionStorage.getItem(SESSION_KEY);
    const res = await searchAccount(uid);
    if (!res.success) return;
    const acc = res.account;
    
    if (acc.gullak && !acc.gullak.paused) {
      // BUG 1: If user is a member, fetch Owner's Gullak object
      if (acc.gullak.isShared) {
        const ownerRes = await searchAccount(acc.gullak.ownerUID);
        if (ownerRes.success && ownerRes.account.gullak) {
          // Pass TRUE for isMember
          renderGullakActiveView(ownerRes.account.gullak, uid, true);
        } else {
          showToast("Error loading shared Gullak.", true);
        }
      } else {
        renderGullakActiveView(acc.gullak, uid, false);
      }
    } else {
      document.getElementById("gullak-create-view").style.display = "block";
      document.getElementById("gullak-active-view").style.display = "none";
      const picker = document.getElementById("gullak-member-picker");
      if(picker) picker.innerHTML = (acc.favorites||[]).map(f => `<span class="member-chip" data-uid="${f.uid}" data-name="${f.name}">${f.name}</span>`).join("") || "No favorites yet.";
      document.querySelectorAll(".member-chip").forEach(c => c.addEventListener("click", () => c.classList.toggle("selected")));
    }
    openModal("gullak-modal");
  }
  document.getElementById("open-gullak-btn")?.addEventListener("click", openGullakModal);
  document.getElementById("gullak-close-btn")?.addEventListener("click", () => closeModal("gullak-modal"));

  // ── VIRTU-MITRA (AI CHAT) BUG 3 FIX ─────────────────────────────
  const aiFab = document.getElementById("ai-fab");
  const aiWindow = document.getElementById("ai-chat-window");
  const aiClose = document.getElementById("ai-close-btn");
  const aiSend = document.getElementById("ai-chat-send");
  const aiInput = document.getElementById("ai-chat-input");
  const aiBody = document.getElementById("ai-chat-body");

  aiFab?.addEventListener("click", () => aiWindow.classList.add("open"));
  aiClose?.addEventListener("click", () => aiWindow.classList.remove("open"));

  const addChatMsg = (text, isUser) => {
    const div = document.createElement("div");
    div.className = `chat-msg ${isUser ? "user-msg" : "bot-msg"}`;
    div.textContent = text;
    aiBody.appendChild(div);
    aiBody.scrollTop = aiBody.scrollHeight;
  };

  aiSend?.addEventListener("click", () => {
    const text = aiInput.value.trim();
    if(!text) return;
    addChatMsg(text, true);
    aiInput.value = "";
    
    // BUG 3 FIX: Smart Keyword Matcher for prototype
    setTimeout(async () => {
      const uid = sessionStorage.getItem(SESSION_KEY);
      const res = await searchAccount(uid);
      const balance = res.success ? res.account.balance : 0;
      
      const lowerText = text.toLowerCase();
      let reply = "Main abhi seekh raha hoon, par aap mujhse apne balance, loans, ya gullak ke baare mein pooch sakte hain!";
      
      if (lowerText.includes("balance") || lowerText.includes("paise") || lowerText.includes("kitne") || lowerText.includes("amount")) {
          reply = `Aapka current account balance ₹${fmt(balance)} hai.`;
      } else if (lowerText.includes("loan") || lowerText.includes("udhaar") || lowerText.includes("credit")) {
          reply = "Hum 3 tarah ke loan dete hain: Emergency Fund (upto 10k), Laghu Vyapaar (upto 1 Lakh), aur Kisan Sahayata (upto 5 Lakhs). Inhe unlock karne ke liye apna Virtu-Trust score badhayein!";
      } else if (lowerText.includes("gullak") || lowerText.includes("save") || lowerText.includes("bachat")) {
          reply = "VirtuGullak mein aapko 6.5% p.a. ka interest milta hai. Aap doston ke saath Group Gullak bhi bana sakte hain!";
      }

      addChatMsg(reply, false);
    }, 800);
  });

  aiInput?.addEventListener("keypress", (e) => { if(e.key === "Enter") aiSend.click(); });

}); // ── END OF DOMContentLoaded ──