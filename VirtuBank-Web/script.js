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
    nav_login:"Login", nav_join:"Join Us",
    brand_badge:"VIT-AP Innovation",
    brand_headline:"Banking for the <em>Next Billion.</em>",
    brand_tagline:"Secure, AI-powered banking for everyone from Amaravati to the world.",
    stat_fees:"Fees", stat_support:"AI Support",
    login_title:"Welcome Back", login_sub:"Enter your unique UID to access your vault.",
    uid_label:"Account UID", pass_label:"Secret Password", sign_in:"Sign In",
    no_account:"New to VirtuBank?", create_acc:"Create an account",
    join_title:"Join VirtuBank", join_sub:"Create a secure digital identity in seconds.",
    sec_personal:"Personal Details", sec_identity:"Identity & Contact", sec_security:"Security",
    lbl_name:"Full Name", lbl_age:"Age", lbl_gender:"Gender", lbl_status:"Status",
    lbl_pan:"PAN Card", lbl_aadhar:"Aadhar Number", lbl_email:"Email Address",
    lbl_mobile:"Mobile Number", lbl_address:"Full Address",
    lbl_password:"Login Password", lbl_mpin:"4-Digit MPIN",
    create_account:"Create My Account", have_uid:"Already have a UID?", sign_in_here:"Sign in here",
    services_hub:"Services", logout:"Logout",
    savings_acc:"Digital Savings Account", acc_holder:"Account Holder", uid_num:"UID Number",
    trust_score:"Virtu-Trust Score",
    send_money:"Send Money", voice_pay:"Voice Pay", favorites:"Favorites",
    virtu_invests:"Virtu-Invests", invested_label:"INVESTED", status_label:"STATUS", secure:"Secure",
    view_history:"View VirtuTransactions", txn_log:"VirtuTransactions Log",
    virtu_loans:"Virtu-Loans", loans_sub:"MSME & Kisan Credit",
    need_450:"Need Score 450+", need_600:"Need Score 600+", need_750:"Need Score 750+",
    emergency_fund:"Emergency Fund", laghu_vyapaar:"Laghu Vyapaar", kisan_sahayata:"Kisan Sahayata",
    apply_now:"Apply Now",
    welcome_aboard:"Welcome Aboard!", uid_created:"Your unique digital identity has been created.",
    your_uid:"Your Private UID", save_uid_note:"Please save this UID. You will need it to log in.",
    go_to_login:"Go to Login",
    virtu_uid_tab:"VirtuBank UID", ext_upi_tab:"External / UPI",
    receiver_uid:"Receiver UID", amount_lbl:"Amount (₹)", confirm_mpin:"Confirm MPIN",
    save_as_fav:"Save receiver as Favorite", upi_id_lbl:"UPI ID / Account", send_via_upi:"Send via UPI",
    voice_instruction:'Say: "Send 500 to [Name in Favorites]"',
    tap_mic:"Tap the mic to start speaking...", start_listening:"Start Listening",
    fav_sub:"Quick-send to your trusted contacts", add_new_fav:"+ Add New Favorite",
    nickname:"Nickname", their_uid:"Their UID", save_favorite:"Save Favorite",
    invest_sub:"Grow your wealth with smart instruments",
    long_term:"Long-Term", digital_gold:"Digital Gold",
    sip_desc:"Systematic Investment Plan — invest a fixed amount every month.",
    lt_desc:"Lump-sum Fixed Deposit style investment.",
    gold_desc:"Buy digital 24K gold. Sell anytime at live market rates.",
    sip_amount:"Monthly SIP Amount (₹)", duration_yr:"Duration (years)",
    calc_returns:"Calculate Returns", start_sip:"Start SIP",
    invest_amount:"Investment Amount (₹)", invest_now:"Invest Now",
    live_gold_price:"Live Gold Price", gold_invest_amt:"Amount to invest (₹)",
    see_how_much_gold:"See How Much Gold", buy_gold:"Buy Gold",
    your_portfolio:"Your Portfolio",
    services_hub_title:"Services Hub", services_sub:"All your financial tools in one place",
    svc_gullak_desc:"Smart Savings Goal", svc_invest_desc:"SIP, FD & Digital Gold",
    svc_loans_desc:"MSME & Kisan Credit", svc_cards_desc:"Debit & Credit Cards",
    cards_sub:"Click a card to flip and view secure details",
    credit_locked:"Virtu-Trust Score 850+ needed", build_trust:"Keep saving & transacting!",
    gullak_tagline:"Set a savings goal. Toot-ti nahi, sirf badhti hai.",
    solo_gullak:"Solo Gullak", solo_desc:"Save alone, at your own pace",
    group_gullak:"Group Gullak", group_desc:"Save together with favorites",
    gullak_name:"Gullak Name / Goal", target_amt:"Target Amount (₹)",
    save_freq:"Saving Frequency", daily:"Daily", weekly:"Weekly", monthly:"Monthly",
    amt_per_interval:"Amount per interval (₹)", invite_members:"Invite Favorite Members",
    create_gullak:"🏺 Create Gullak",
    days_remaining:"Days Remaining", est_completion:"Estimated Completion",
    interest_earned:"Interest Earned", add_money:"Add Money", withdraw:"Withdraw",
    pause_delete:"Pause / Delete Gullak",
    add_to_gullak:"Add to Gullak", add_gullak_sub:"Directly deposit any amount into your Gullak",
    deposit_gullak:"Deposit to Gullak", lbl_mpin:"MPIN",
    withdraw_gullak:"Withdraw from Gullak", withdraw_captcha:"Solve the captcha to confirm withdrawal",
    security_check:"Security Check", your_answer:"Your Answer", withdraw_amt:"Withdraw Amount (₹)",
    confirm_withdrawal:"Confirm Withdrawal",
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
    nav_login:"लॉगिन", nav_join:"जुड़ें",
    brand_badge:"VIT-AP इनोवेशन",
    brand_headline:"Banking for the <em>Next Billion.</em>",
    brand_tagline:"अमरावती से दुनिया तक — सबके लिए सुरक्षित AI बैंकिंग।",
    stat_fees:"शुल्क", stat_support:"AI सहायता",
    login_title:"वापसी पर स्वागत", login_sub:"अपना UID दर्ज करें।",
    uid_label:"खाता UID", pass_label:"पासवर्ड", sign_in:"साइन इन",
    no_account:"VirtuBank में नए हैं?", create_acc:"खाता बनाएं",
    join_title:"VirtuBank से जुड़ें", join_sub:"कुछ सेकंड में डिजिटल पहचान बनाएं।",
    sec_personal:"व्यक्तिगत विवरण", sec_identity:"पहचान और संपर्क", sec_security:"सुरक्षा",
    lbl_name:"पूरा नाम", lbl_age:"उम्र", lbl_gender:"लिंग", lbl_status:"स्थिति",
    lbl_pan:"पैन कार्ड", lbl_aadhar:"आधार नंबर", lbl_email:"ईमेल",
    lbl_mobile:"मोबाइल", lbl_address:"पूरा पता",
    lbl_password:"लॉगिन पासवर्ड", lbl_mpin:"4-अंकीय MPIN",
    create_account:"मेरा खाता बनाएं", have_uid:"पहले से UID है?", sign_in_here:"यहाँ साइन इन करें",
    services_hub:"सेवाएं", logout:"लॉग आउट",
    savings_acc:"डिजिटल बचत खाता", acc_holder:"खाताधारक", uid_num:"UID नंबर",
    trust_score:"विर्तु-ट्रस्ट स्कोर",
    send_money:"पैसे भेजें", voice_pay:"वॉइस पे", favorites:"पसंदीदा",
    virtu_invests:"विर्तु-इन्वेस्ट", invested_label:"निवेश", status_label:"स्थिति", secure:"सुरक्षित",
    view_history:"विर्तु-लेनदेन देखें", txn_log:"विर्तु-लेनदेन लॉग",
    virtu_loans:"विर्तु-लोन", loans_sub:"MSME और किसान क्रेडिट",
    need_450:"450+ स्कोर चाहिए", need_600:"600+ स्कोर चाहिए", need_750:"750+ स्कोर चाहिए",
    emergency_fund:"आपातकालीन फंड", laghu_vyapaar:"लघु व्यापार", kisan_sahayata:"किसान सहायता",
    apply_now:"अभी आवेदन करें",
    welcome_aboard:"आपका स्वागत है!", uid_created:"आपकी डिजिटल पहचान बन गई।",
    your_uid:"आपका निजी UID", save_uid_note:"यह UID सुरक्षित रखें। लॉगिन के लिए जरूरी है।",
    go_to_login:"लॉगिन पर जाएं",
    virtu_uid_tab:"VirtuBank UID", ext_upi_tab:"बाहरी / UPI",
    receiver_uid:"प्राप्तकर्ता UID", amount_lbl:"राशि (₹)", confirm_mpin:"MPIN की पुष्टि करें",
    save_as_fav:"पसंदीदा में सेव करें", upi_id_lbl:"UPI ID / खाता", send_via_upi:"UPI से भेजें",
    voice_instruction:'"Nikki ko 500 bhej do" — बोलकर पैसे भेजें',
    tap_mic:"माइक दबाएं और बोलें...", start_listening:"सुनना शुरू करें",
    fav_sub:"विश्वसनीय संपर्कों को तुरंत पैसे भेजें", add_new_fav:"+ नया पसंदीदा जोड़ें",
    nickname:"उपनाम", their_uid:"उनका UID", save_favorite:"पसंदीदा सेव करें",
    invest_sub:"स्मार्ट निवेश से संपत्ति बढ़ाएं",
    long_term:"दीर्घकालिक", digital_gold:"डिजिटल सोना",
    sip_desc:"SIP — हर महीने निश्चित राशि निवेश करें। 1-30 साल के लिए सर्वोत्तम।",
    lt_desc:"एकमुश्त FD जैसा निवेश। 1-10 साल के लिए स्थिर रिटर्न।",
    gold_desc:"24K डिजिटल सोना खरीदें। कभी भी बेचें।",
    sip_amount:"मासिक SIP राशि (₹)", duration_yr:"अवधि (वर्ष)",
    calc_returns:"रिटर्न की गणना करें", start_sip:"SIP शुरू करें",
    invest_amount:"निवेश राशि (₹)", invest_now:"अभी निवेश करें",
    live_gold_price:"लाइव सोने का भाव", gold_invest_amt:"निवेश राशि (₹)",
    see_how_much_gold:"कितना सोना मिलेगा?", buy_gold:"सोना खरीदें",
    your_portfolio:"आपका पोर्टफोलियो",
    services_hub_title:"सेवा केंद्र", services_sub:"एक जगह सभी वित्तीय सुविधाएं",
    svc_gullak_desc:"स्मार्ट बचत लक्ष्य", svc_invest_desc:"SIP, FD और डिजिटल सोना",
    svc_loans_desc:"MSME और किसान क्रेडिट", svc_cards_desc:"डेबिट और क्रेडिट कार्ड",
    cards_sub:"CVV देखने के लिए कार्ड पर क्लिक करें",
    credit_locked:"विर्तु-ट्रस्ट स्कोर 850+ चाहिए", build_trust:"बचत और लेनदेन जारी रखें!",
    gullak_tagline:"बचत का लक्ष्य रखें। टूटती नहीं, सिर्फ बढ़ती है।",
    solo_gullak:"एकल गुल्लक", solo_desc:"अकेले, अपनी गति से बचाएं",
    group_gullak:"ग्रुप गुल्लक", group_desc:"पसंदीदा के साथ मिलकर बचाएं",
    gullak_name:"गुल्लक का नाम / लक्ष्य", target_amt:"लक्ष्य राशि (₹)",
    save_freq:"बचत आवृत्ति", daily:"दैनिक", weekly:"साप्ताहिक", monthly:"मासिक",
    amt_per_interval:"प्रति अंतराल राशि (₹)", invite_members:"सदस्यों को आमंत्रण दें",
    create_gullak:"🏺 गुल्लक बनाएं",
    days_remaining:"बाकी दिन", est_completion:"अनुमानित समापन",
    interest_earned:"अर्जित ब्याज", add_money:"पैसे जोड़ें", withdraw:"निकालें",
    pause_delete:"गुल्लक रोकें / मिटाएं",
    add_to_gullak:"गुल्लक में जोड़ें", add_gullak_sub:"सीधे राशि जमा करें",
    deposit_gullak:"गुल्लक में जमा करें", lbl_mpin:"MPIN",
    withdraw_gullak:"गुल्लक से निकालें", withdraw_captcha:"निकासी के लिए कैप्चा हल करें",
    security_check:"सुरक्षा जांच", your_answer:"आपका उत्तर", withdraw_amt:"निकासी राशि (₹)",
    confirm_withdrawal:"निकासी की पुष्टि करें",
    pause_sub:"इससे योगदान बंद होगा। पुष्टि के लिए हल करें।", confirm_pause:"रोकने की पुष्टि करें",
    gullak_invites:"VirtuGullak आमंत्रण", invites_sub:"ग्रुप गुल्लक में शामिल होने के लिए स्वीकार करें",
    member_contributions:"सदस्य योगदान", pending_invites:"लंबित आमंत्रण",
    ai_subtitle:"AI वित्तीय सलाहकार",
    ai_greeting:"नमस्ते! मैं आपका विर्तु-मित्र हूं। बचत या बैंकिंग के बारे में पूछें?",
    ask_anything:"कुछ भी पूछें...",
    gyani_send_money:"पैसे भेजें — VirtuBank UID से या UPI ID से तुरंत ट्रांसफर करें। हर ट्रांजेक्शन MPIN से सुरक्षित है।",
    gyani_virtugullak:"VirtuGullak आपकी डिजिटल गुल्लक है। बचत का लक्ष्य तय करें, 6.5% सालाना ब्याज पाएं। दोस्तों के साथ ग्रुप गुल्लक भी बना सकते हैं!",
    gyani_virtu_loans:"विर्तु-लोन छोटे व्यापारियों और किसानों के लिए है। ट्रांजेक्शन और बचत से ट्रस्ट स्कोर बढ़ाएं और इमरजेंसी फंड, लघु व्यापार, किसान सहायता लोन अनलॉक करें।",
    gyani_virtu_cards:"विर्तु-कार्ड में डेबिट कार्ड तुरंत मिलता है। क्रेडिट कार्ड के लिए ट्रस्ट स्कोर 850+ चाहिए। CVV देखने के लिए कार्ड पर क्लिक करें।"
  },
  te: {
    nav_login:"లాగిన్", nav_join:"చేరండి",
    brand_badge:"VIT-AP ఇన్నోవేషన్",
    brand_headline:"Banking for the <em>Next Billion.</em>",
    brand_tagline:"అమరావతి నుండి ప్రపంచానికి — అందరికీ సురక్షిత AI బ్యాంకింగ్.",
    stat_fees:"రుసుం", stat_support:"AI సహాయం",
    login_title:"తిరిగి స్వాగతం", login_sub:"మీ UID నమోదు చేయండి.",
    uid_label:"ఖాతా UID", pass_label:"పాస్‌వర్డ్", sign_in:"సైన్ ఇన్",
    no_account:"కొత్తా?", create_acc:"ఖాతా తెరవండి",
    join_title:"VirtuBank లో చేరండి", join_sub:"కొన్ని సెకన్లలో డిజిటల్ గుర్తింపు పొందండి.",
    sec_personal:"వ్యక్తిగత వివరాలు", sec_identity:"గుర్తింపు & సంప్రదింపు", sec_security:"భద్రత",
    lbl_name:"పూర్తి పేరు", lbl_age:"వయసు", lbl_gender:"లింగం", lbl_status:"స్థితి",
    lbl_pan:"PAN కార్డ్", lbl_aadhar:"ఆధార్ నంబర్", lbl_email:"ఈమెయిల్",
    lbl_mobile:"మొబైల్", lbl_address:"పూర్తి చిరునామా",
    lbl_password:"లాగిన్ పాస్‌వర్డ్", lbl_mpin:"4-అంకెల MPIN",
    create_account:"నా ఖాతా తెరవండి", have_uid:"UID ఉందా?", sign_in_here:"ఇక్కడ సైన్ ఇన్",
    services_hub:"సేవలు", logout:"లాగ్ అవుట్",
    savings_acc:"డిజిటల్ పొదుపు ఖాతా", acc_holder:"ఖాతాదారుడు", uid_num:"UID నంబర్",
    trust_score:"విర్తు-ట్రస్ట్ స్కోర్",
    send_money:"డబ్బు పంపండి", voice_pay:"వాయిస్ పే", favorites:"ఇష్టమైనవి",
    virtu_invests:"విర్తు-ఇన్వెస్ట్", invested_label:"పెట్టుబడి", status_label:"స్థితి", secure:"సురక్షితం",
    view_history:"విర్తు-లావాదేవీలు చూడండి", txn_log:"విర్తు-లావాదేవీల లాగ్",
    virtu_loans:"విర్తు-లోన్లు", loans_sub:"MSME & రైతు క్రెడిట్",
    need_450:"450+ స్కోర్ కావాలి", need_600:"600+ స్కోర్ కావాలి", need_750:"750+ స్కోర్ కావాలి",
    emergency_fund:"అత్యవసర నిధి", laghu_vyapaar:"లఘు వ్యాపార్", kisan_sahayata:"కిసాన్ సహాయత",
    apply_now:"ఇప్పుడే దరఖాస్తు",
    welcome_aboard:"స్వాగతం!", uid_created:"మీ డిజిటల్ గుర్తింపు సృష్టించబడింది.",
    your_uid:"మీ ప్రైవేట్ UID", save_uid_note:"ఈ UID భద్రపరచుకోండి. లాగిన్ కోసం అవసరం.",
    go_to_login:"లాగిన్ కి వెళ్ళండి",
    virtu_uid_tab:"VirtuBank UID", ext_upi_tab:"బాహ్య / UPI",
    receiver_uid:"గ్రహీత UID", amount_lbl:"మొత్తం (₹)", confirm_mpin:"MPIN నిర్ధారించండి",
    save_as_fav:"ఇష్టమైనవిగా సేవ్ చేయండి", upi_id_lbl:"UPI ID / ఖాతా", send_via_upi:"UPI ద్వారా పంపండి",
    voice_instruction:'"Nikki ki 500 pampandi" — మాట్లాడి పంపండి',
    tap_mic:"మాట్లాడటానికి మైక్ నొక్కండి...", start_listening:"వినడం ప్రారంభించండి",
    fav_sub:"నమ్మకమైన వారికి త్వరగా పంపండి", add_new_fav:"+ కొత్త ఇష్టమైన జోడించండి",
    nickname:"మారుపేరు", their_uid:"వారి UID", save_favorite:"ఇష్టమైనవి సేవ్ చేయండి",
    invest_sub:"స్మార్ట్ పెట్టుబడితో సంపద పెంచుకోండి",
    long_term:"దీర్ఘకాలిక", digital_gold:"డిజిటల్ బంగారం",
    sip_desc:"SIP — ప్రతి నెల పెట్టుబడి పెట్టండి. 1-30 సంవత్సరాలకు ఉత్తమం.",
    lt_desc:"ఒకేసారి FD స్టైల్ పెట్టుబడి. స్థిరమైన రాబడి.",
    gold_desc:"24K డిజిటల్ బంగారం కొనండి. ఎప్పుడైనా అమ్మండి.",
    sip_amount:"నెలవారీ SIP మొత్తం (₹)", duration_yr:"వ్యవధి (సంవత్సరాలు)",
    calc_returns:"రాబడి లెక్కించండి", start_sip:"SIP ప్రారంభించండి",
    invest_amount:"పెట్టుబడి మొత్తం (₹)", invest_now:"ఇప్పుడే పెట్టుబడి",
    live_gold_price:"లైవ్ బంగారం ధర", gold_invest_amt:"పెట్టుబడి మొత్తం (₹)",
    see_how_much_gold:"ఎంత బంగారం వస్తుంది?", buy_gold:"బంగారం కొనండి",
    your_portfolio:"మీ పోర్ట్‌ఫోలియో",
    services_hub_title:"సేవా కేంద్రం", services_sub:"అన్ని ఆర్థిక సేవలు ఒక చోట",
    svc_gullak_desc:"స్మార్ట్ పొదుపు లక్ష్యం", svc_invest_desc:"SIP, FD & డిజిటల్ బంగారం",
    svc_loans_desc:"MSME & రైతు క్రెడిట్", svc_cards_desc:"డెబిట్ & క్రెడిట్ కార్డులు",
    cards_sub:"CVV చూడటానికి కార్డ్ పై క్లిక్ చేయండి",
    credit_locked:"విర్తు-ట్రస్ట్ స్కోర్ 850+ కావాలి", build_trust:"పొదుపు & లావాదేవీలు కొనసాగించండి!",
    gullak_tagline:"పొదుపు లక్ష్యం పెట్టండి. ఆగదు, పెరుగుతుంది.",
    solo_gullak:"సోలో గుల్లక్", solo_desc:"స్వంత వేగంతో పొదుపు చేయండి",
    group_gullak:"గ్రూప్ గుల్లక్", group_desc:"ఇష్టమైనవారితో కలిసి పొదుపు",
    gullak_name:"గుల్లక్ పేరు / లక్ష్యం", target_amt:"లక్ష్య మొత్తం (₹)",
    save_freq:"పొదుపు పౌనఃపున్యం", daily:"రోజువారీ", weekly:"వారానికోసారి", monthly:"నెలవారీ",
    amt_per_interval:"ప్రతి విరామంలో మొత్తం (₹)", invite_members:"సభ్యులను ఆహ్వానించండి",
    create_gullak:"🏺 గుల్లక్ సృష్టించండి",
    days_remaining:"మిగిలిన రోజులు", est_completion:"అంచనా పూర్తి తేదీ",
    interest_earned:"సంపాదించిన వడ్డీ", add_money:"డబ్బు జోడించండి", withdraw:"తీసుకోండి",
    pause_delete:"గుల్లక్ ఆపండి / తొలగించండి",
    add_to_gullak:"గుల్లక్‌లో జోడించండి", add_gullak_sub:"నేరుగా మొత్తం జమ చేయండి",
    deposit_gullak:"గుల్లక్‌లో జమ", lbl_mpin:"MPIN",
    withdraw_gullak:"గుల్లక్ నుండి తీసుకోండి", withdraw_captcha:"క్యాప్చా పరిష్కరించి నిర్ధారించండి",
    security_check:"భద్రత తనిఖీ", your_answer:"మీ సమాధానం", withdraw_amt:"ఉపసంహరణ మొత్తం (₹)",
    confirm_withdrawal:"ఉపసంహరణ నిర్ధారించండి",
    pause_sub:"ఇది సహకారాన్ని ఆపుతుంది. నిర్ధారించడానికి పరిష్కరించండి.", confirm_pause:"ఆపడం నిర్ధారించండి",
    gullak_invites:"VirtuGullak ఆహ్వానాలు", invites_sub:"గ్రुप గుల్లక్‌లో చేరడానికి అంగీకరించండి",
    member_contributions:"సభ్యుల సహకారం", pending_invites:"పెండింగ్ ఆహ్వానాలు",
    ai_subtitle:"AI ఆర్థిక సలహాదారు",
    ai_greeting:"నమస్తే! నేను మీ విర్తు-మిత్ర. పొదుపు లేదా బ్యాంకింగ్ గురించి అడగండి?",
    ask_anything:"ఏదైనా అడగండి...",
    gyani_send_money:"డబ్బు పంపండి — VirtuBank UID లేదా UPI ID కి తక్షణం ట్రాన్స్ఫర్ చేయండి. MPIN తో సురక్షితం.",
    gyani_virtugullak:"VirtuGullak మీ డిజిటల్ గుల్లక. లక్ష్యం నిర్ణయించండి, 6.5% వార్షిక వడ్డీ పొందండి. స్నేహితులతో గ్రూప్ గుల్లక్ కూడా చేయవచ్చు!",
    gyani_virtu_loans:"విర్తు-లోన్లు చిన్న వ్యాపారులు మరియు రైతులకు. ట్రస్ట్ స్కోర్ పెంచి అత్యవసర నిధి, లఘు వ్యాపార్, కిసాన్ సహాయత అన్‌లాక్ చేయండి.",
    gyani_virtu_cards:"విర్తు-కార్డులలో డెబిట్ కార్డ్ వెంటనే లభిస్తుంది. క్రెడిట్ కార్డుకు 850+ స్కోర్ కావాలి. CVV చూడటానికి కార్డ్ పై క్లిక్ చేయండి."
  },
  ta: { nav_login:"உள்நுழை", nav_join:"சேருங்கள்", sign_in:"உள்நுழை", trust_score:"விர்து-நம்பிக்கை மதிப்பு", send_money:"பணம் அனுப்பு", virtu_loans:"விர்து-கடன்கள்", emergency_fund:"அவசர நிதி", kisan_sahayata:"கிசான் உதவி", laghu_vyapaar:"சிறு வணிகம்", gyani_send_money:"Send Money உங்கள் VirtuBank UID அல்லது UPI ID மூலம் பணம் அனுப்ப பயன்படுகிறது.", gyani_virtugullak:"VirtuGullak உங்கள் டிஜிட்டல் சேமிப்பு பாத்திரம். 6.5% ஆண்டு வட்டியுடன் சேமிக்கவும்.", gyani_virtu_loans:"Virtu-Loans சிறு தொழிலதிபர்கள் மற்றும் விவசாயிகளுக்கானது.", gyani_virtu_cards:"Virtu-Cards இல் Debit Card உடனடியாக கிடைக்கும். Credit Card-க்கு 850+ score வேண்டும்." },
  ml: { nav_login:"ലോഗിൻ", nav_join:"ചേരുക", sign_in:"ലോഗിൻ ചെയ്യുക", trust_score:"വിർതു-ട്രസ്റ്റ് സ്കോർ", send_money:"പണം അയയ്ക്കുക", virtu_loans:"വിർതു-ലോണുകൾ", emergency_fund:"അടിയന്തര ഫണ്ട്", kisan_sahayata:"കിസാൻ സഹായ", laghu_vyapaar:"ലഘു വ്യാപാർ", gyani_send_money:"Send Money ഉപയോഗിച്ച് VirtuBank UID അല്ലെങ്കിൽ UPI ID-ലേക്ക് ഉടനടി ട്രാൻസ്ഫർ ചെയ്യാം.", gyani_virtugullak:"VirtuGullak നിങ്ങളുടെ ഡിജിറ്റൽ ഗുൽലക് ആണ്. 6.5% വാർഷിക പലിശയോടെ സേവ് ചെയ്യാം.", gyani_virtu_loans:"Virtu-Loans ചെറുകിട ബിസിനസ്സ് ഉടമകൾക്കും കർഷകർക്കും ആണ്.", gyani_virtu_cards:"Virtu-Cards-ൽ ഡെബിറ്റ് കാർഡ് ഉടനടി ലഭ്യമാകും. ക്രെഡിറ്റ് കാർഡിന് 850+ സ്കോർ ആവശ്യമാണ്." },
  kn: { nav_login:"ಲಾಗಿನ್", nav_join:"ಸೇರಿ", sign_in:"ಸೈನ್ ಇನ್", trust_score:"ವಿರ್ತು-ಟ್ರಸ್ಟ್ ಸ್ಕೋರ್", send_money:"ಹಣ ಕಳುಹಿಸಿ", virtu_loans:"ವಿರ್ತು-ಸಾಲಗಳು", emergency_fund:"ತುರ್ತು ನಿಧಿ", kisan_sahayata:"ಕಿಸಾನ್ ಸಹಾಯತ", laghu_vyapaar:"ಲಘು ವ್ಯಾಪಾರ", gyani_send_money:"Send Money ಮೂಲಕ VirtuBank UID ಅಥವಾ UPI ID ಗೆ ತ್ವರಿತವಾಗಿ ಹಣ ಕಳುಹಿಸಿ.", gyani_virtugullak:"VirtuGullak ನಿಮ್ಮ ಡಿಜಿಟಲ್ ಗಲ್ಲಕ್. 6.5% ವಾರ್ಷಿಕ ಬಡ್ಡಿಯೊಂದಿಗೆ ಉಳಿಸಿ.", gyani_virtu_loans:"Virtu-Loans ಸಣ್ಣ ವ್ಯಾಪಾರಿಗಳು ಮತ್ತು ರೈತರಿಗಾಗಿ.", gyani_virtu_cards:"Debit Card ತಕ್ಷಣ ಲಭ್ಯ. Credit Card ಗೆ 850+ ಸ್ಕೋರ್ ಬೇಕು." },
  mr: { nav_login:"लॉगिन", nav_join:"सामील व्हा", sign_in:"साइन इन", trust_score:"विर्तु-ट्रस्ट गुण", send_money:"पैसे पाठवा", virtu_loans:"विर्तु-कर्ज", emergency_fund:"आपत्कालीन निधी", kisan_sahayata:"किसान सहायता", laghu_vyapaar:"लघु व्यवसाय", gyani_send_money:"पैसे पाठवण्यासाठी VirtuBank UID किंवा UPI ID वापरा.", gyani_virtugullak:"VirtuGullak ही तुमची डिजिटल गुल्लक आहे. 6.5% वार्षिक व्याजासह बचत करा.", gyani_virtu_loans:"Virtu-Loans लहान व्यावसायिक आणि शेतकऱ्यांसाठी आहे.", gyani_virtu_cards:"Debit Card लगेच मिळतो. Credit Card साठी 850+ गुण हवेत." },
  gu: { nav_login:"લૉગિન", nav_join:"જોડાઓ", sign_in:"સાઇન ઇન", trust_score:"વિર્તુ-ટ્રસ્ટ સ્કોર", send_money:"પૈસા મોકલો", virtu_loans:"વિર્તુ-લૉન", emergency_fund:"કટોકટી ભંડોળ", kisan_sahayata:"કિસાન સહાયતા", laghu_vyapaar:"લઘુ વ્યાપાર", gyani_send_money:"VirtuBank UID અથવા UPI ID પર ઝડપથી પૈસા મોકલો.", gyani_virtugullak:"VirtuGullak તમારી ડિજિટલ ગુલ્લક છે. 6.5% વાર્ષિક વ્યાજ સાથે બચત કરો.", gyani_virtu_loans:"Virtu-Loans નાના વ્યાપારીઓ અને ખેડૂતો માટે છે.", gyani_virtu_cards:"Debit Card તરત મળે. Credit Card માટે 850+ સ્કોર જોઈએ." },
  bn: { nav_login:"লগইন", nav_join:"যোগ দিন", sign_in:"সাইন ইন", trust_score:"ভির্তু-ট্রাস্ট স্কোর", send_money:"টাকা পাঠান", virtu_loans:"ভির্তু-লোন", emergency_fund:"জরুরি তহবিল", kisan_sahayata:"কিষান সহায়তা", laghu_vyapaar:"লঘু ব্যবসা", gyani_send_money:"VirtuBank UID বা UPI ID-তে তাৎক্ষণিক টাকা পাঠান।", gyani_virtugullak:"VirtuGullak আপনার ডিজিটাল গুল্লক। 6.5% বার্ষিক সুদে সঞ্চয় করুন।", gyani_virtu_loans:"Virtu-Loans ক্ষুদ্র ব্যবসায়ী ও কৃষকদের জন্য।", gyani_virtu_cards:"Debit Card সাথে সাথে পাবেন। Credit Card-এর জন্য 850+ স্কোর দরকার।" },
  pa: { nav_login:"ਲੌਗਿਨ", nav_join:"ਜੁੜੋ", sign_in:"ਸਾਈਨ ਇਨ", trust_score:"ਵਿਰਤੁ-ਟਰੱਸਟ ਸਕੋਰ", send_money:"ਪੈਸੇ ਭੇਜੋ", virtu_loans:"ਵਿਰਤੁ-ਕਰਜ਼ੇ", emergency_fund:"ਐਮਰਜੈਂਸੀ ਫੰਡ", kisan_sahayata:"ਕਿਸਾਨ ਸਹਾਇਤਾ", laghu_vyapaar:"ਲਘੂ ਵਪਾਰ", gyani_send_money:"VirtuBank UID ਜਾਂ UPI ID ਤੇ ਤੁਰੰਤ ਪੈਸੇ ਭੇਜੋ।", gyani_virtugullak:"VirtuGullak ਤੁਹਾਡਾ ਡਿਜੀਟਲ ਗੁੱਲਕ ਹੈ। 6.5% ਸਾਲਾਨਾ ਵਿਆਜ ਨਾਲ ਬੱਚਤ ਕਰੋ।", gyani_virtu_loans:"Virtu-Loans ਛੋਟੇ ਕਾਰੋਬਾਰੀਆਂ ਅਤੇ ਕਿਸਾਨਾਂ ਲਈ।", gyani_virtu_cards:"Debit Card ਤੁਰੰਤ ਮਿਲਦਾ ਹੈ। Credit Card ਲਈ 850+ ਸਕੋਰ ਚਾਹੀਦਾ ਹੈ।" },
  as: { nav_login:"লগইন", nav_join:"যোগ দিয়ক", sign_in:"চাইন ইন", trust_score:"ভাৰ্তু-ট্ৰাষ্ট স্কোৰ", send_money:"টকা পঠাওক", gyani_send_money:"VirtuBank UID বা UPI ID লৈ তাৎক্ষণিকভাৱে টকা পঠাওক।", gyani_virtugullak:"VirtuGullak আপোনাৰ ডিজিটেল গুল্লক। 6.5% বাৰ্ষিক সুদেৰে সঞ্চয় কৰক।", gyani_virtu_loans:"Virtu-Loans ক্ষুদ্ৰ ব্যৱসায়ী আৰু কৃষকৰ বাবে।", gyani_virtu_cards:"Debit Card তাৎক্ষণিকভাৱে পাব। Credit Card-ৰ বাবে 850+ স্কোৰ লাগিব।" },
  fr: { nav_login:"Connexion", nav_join:"Rejoindre", sign_in:"Se connecter", trust_score:"Score de Confiance Virtu", send_money:"Envoyer de l'argent", virtu_loans:"Virtu-Prêts", emergency_fund:"Fonds d'urgence", kisan_sahayata:"Aide Kisan", laghu_vyapaar:"Petite Entreprise", gyani_send_money:"Envoyez de l'argent instantanément via UID VirtuBank ou UPI.", gyani_virtugullak:"VirtuGullak est votre tirelire numérique avec 6,5% d'intérêt annuel.", gyani_virtu_loans:"Virtu-Prêts sont conçus pour les petites entreprises et les agriculteurs.", gyani_virtu_cards:"La carte de débit est disponible immédiatement. La carte de crédit nécessite un score 850+." },
  de: { nav_login:"Anmelden", nav_join:"Beitreten", sign_in:"Einloggen", trust_score:"Virtu-Vertrauenspunkt", send_money:"Geld senden", virtu_loans:"Virtu-Kredite", emergency_fund:"Notfallfonds", kisan_sahayata:"Kisan-Hilfe", laghu_vyapaar:"Kleinunternehmen", gyani_send_money:"Senden Sie sofort Geld über VirtuBank UID oder UPI ID.", gyani_virtugullak:"VirtuGullak ist Ihr digitales Sparschwein mit 6,5% Jahreszins.", gyani_virtu_loans:"Virtu-Kredite sind für Kleinunternehmer und Landwirte gedacht.", gyani_virtu_cards:"Die Debitkarte ist sofort verfügbar. Die Kreditkarte benötigt 850+ Punkte." },
  ru: { nav_login:"Войти", nav_join:"Присоединиться", sign_in:"Войти", trust_score:"Virtu-Рейтинг доверия", send_money:"Отправить деньги", virtu_loans:"Virtu-Кредиты", emergency_fund:"Экстренный фонд", kisan_sahayata:"Помощь Кисан", laghu_vyapaar:"Малый бизнес", gyani_send_money:"Мгновенно отправляйте деньги через UID VirtuBank или UPI.", gyani_virtugullak:"VirtuGullak — ваша цифровая копилка с 6,5% годовых.", gyani_virtu_loans:"Virtu-Кредиты предназначены для малого бизнеса и фермеров.", gyani_virtu_cards:"Дебетовая карта доступна сразу. Кредитная карта требует 850+ баллов." }
};

// Voice command regex per language
const VOICE_PATTERNS = {
  "en-IN": /send\s+(\d+(?:\.\d+)?)\s+(?:rupees?\s+)?to\s+(.+)/i,
  "hi-IN": /(?:(\S+)\s+ko\s+(\d+(?:\.\d+)?)\s+(?:rupee|rupaye|rs)?\s*(?:bhej|do|bhejdo)|send\s+(\d+(?:\.\d+)?)\s+to\s+(.+)|(\d+(?:\.\d+)?)\s+(\S+)\s+ko\s+(?:bhej|do))/i,
  "te-IN": /(?:(\S+)\s+ki\s+(\d+(?:\.\d+)?)\s+(?:pampandi|pampu)|send\s+(\d+(?:\.\d+)?)\s+to\s+(.+)|(\d+(?:\.\d+)?)\s+(\S+)\s+ki\s+pampandi)/i,
  "ta-IN": /(?:send\s+(\d+(?:\.\d+)?)\s+to\s+(.+)|(\d+(?:\.\d+)?)\s+(\S+)\s+ku\s+anuppu)/i,
  "ml-IN": /send\s+(\d+(?:\.\d+)?)\s+to\s+(.+)/i,
  "kn-IN": /send\s+(\d+(?:\.\d+)?)\s+to\s+(.+)/i,
  "mr-IN": /(?:(\S+)\s+la\s+(\d+(?:\.\d+)?)\s+(?:rupye)?\s*pathva|send\s+(\d+(?:\.\d+)?)\s+to\s+(.+))/i,
  "gu-IN": /send\s+(\d+(?:\.\d+)?)\s+to\s+(.+)/i,
  "bn-IN": /send\s+(\d+(?:\.\d+)?)\s+to\s+(.+)/i,
  "pa-IN": /send\s+(\d+(?:\.\d+)?)\s+to\s+(.+)/i,
  "as-IN": /send\s+(\d+(?:\.\d+)?)\s+to\s+(.+)/i,
  "fr-FR": /envoyer?\s+(\d+(?:\.\d+)?)\s+(?:euros?\s+)?(?:à|a)\s+(.+)/i,
  "de-DE": /sende?\s+(\d+(?:\.\d+)?)\s+(?:euro\s+)?an\s+(.+)/i,
  "ru-RU": /send\s+(\d+(?:\.\d+)?)\s+to\s+(.+)/i
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

// ── 6. GYANI (Audio Tooltip) ────────────────────────────────
const GYANI_KEYS = {
  send_money:  "gyani_send_money",
  virtugullak: "gyani_virtugullak",
  virtu_loans: "gyani_virtu_loans",
  virtu_cards: "gyani_virtu_cards"
};

function speakGyani(featureKey) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const text = t(GYANI_KEYS[featureKey]) || "";
  if (!text) return;
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang  = currentLangCode;
  utt.rate  = 0.92;
  utt.pitch = 1;
  window.speechSynthesis.speak(utt);
}

// ── 7. FIRESTORE HELPERS ────────────────────────────────────
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
    balance: INITIAL_BALANCE,
    gullak: null, investments: [], favorites: [], transactions: [],
    gullakInvites: [],   // incoming invites for this user
    virtuTrustScore: 400,
    createdAt: nowISO()
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
  const cur = res.account.virtuTrustScore || 400;
  const nxt = Math.min(MAX_TRUST, cur + pts);
  await saveAccount(uid, { virtuTrustScore: nxt });
  return nxt;
}

function renderTrustScore(score) {
  const s    = score || 400;
  const pct  = (s / MAX_TRUST) * 100;
  const fill = document.getElementById("trust-fill");
  const num  = document.getElementById("trust-score-num");
  if (fill) fill.style.width = pct + "%";
  if (num)  num.textContent  = s;
  updateLoanLocks(s);
  updateCreditCard(s);
}

function updateLoanLocks(score) {
  [["lock-emergency",450],["lock-vyapaar",600],["lock-kisan",750]].forEach(([id, min]) => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle("unlocked", score >= min);
  });
}

function updateCreditCard(score) {
  const overlay = document.getElementById("credit-locked-overlay");
  const fill    = document.getElementById("credit-progress-fill");
  if (fill) fill.style.width = Math.min(100, (score / 850) * 100) + "%";
  if (overlay) overlay.classList.toggle("hidden", score >= 850);
}

// ── 9. CARD GENERATION ──────────────────────────────────────
function populateCards(acc) {
  const seed = (acc.uid || "X").split("").reduce((a,c) => a + c.charCodeAt(0), 0);
  const r = n => ((seed * 37 + n * 13) % n) + (n === 9000 ? 1000 : n === 999 ? 100 : 0);
  const debitNum  = `${4000 + (seed % 1000)} ${1000 + (seed * 7 % 9000)} ${1000 + (seed * 3 % 9000)} ${1000 + (seed * 11 % 9000)}`;
  const debitCVV  = String(100 + seed % 900);
  const creditCVV = String(100 + (seed * 3) % 900);
  const yr = new Date().getFullYear() + 4;
  const mo = String((seed % 12) + 1).padStart(2, "0");
  const el = id => document.getElementById(id);
  if (el("debit-card-name"))  el("debit-card-name").textContent  = (acc.name || "").toUpperCase().slice(0,20);
  if (el("debit-card-num"))   el("debit-card-num").textContent   = debitNum;
  if (el("debit-card-exp"))   el("debit-card-exp").textContent   = `${mo}/${yr}`;
  if (el("debit-card-cvv"))   el("debit-card-cvv").textContent   = debitCVV;
  if (el("credit-card-name")) el("credit-card-name").textContent = (acc.name || "").toUpperCase().slice(0,20);
  if (el("credit-card-cvv"))  el("credit-card-cvv").textContent  = creditCVV;
  updateCreditCard(acc.virtuTrustScore || 400);
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
  
  // Check pending gullak invites
  const invites = (acc.gullakInvites || []).filter(i => i.status === "pending");
  const invBtn  = document.getElementById("open-gullak-invites-btn");
  if (invBtn) {
    invBtn.style.display = invites.length ? "inline-flex" : "none";
    document.getElementById("invites-count-badge").textContent = invites.length;
  }
  
  const badgeMap = {
    external: '<span class="txn-badge badge-ext">UPI</span>',
    internal: '<span class="txn-badge badge-int">Virtu</span>',
    gullak:   '<span class="txn-badge badge-gullak">Gullak</span>',
    invest:   '<span class="txn-badge badge-invest">Invest</span>',
  };
  const list  = document.getElementById("history-list");
  const badge = document.getElementById("hist-badge");
  const txns  = acc.transactions || [];
  if (badge) badge.textContent = `${txns.length}/${MAX_HISTORY}`;
  list.innerHTML = txns.length ? txns.map(t => `
    <div class="txn-row">
      <div class="txn-icon-wrap ${t.type}">${t.type === "debit" ? "↑" : "↓"}</div>
      <div class="txn-body">
        <span class="txn-description">${t.description} ${badgeMap[t.category] || ""}</span>
        <span class="txn-meta">${new Date(t.timestamp).toLocaleString("en-IN")}</span>
      </div>
      <span class="txn-amount ${t.type}">${t.type === "debit" ? "-" : "+"}₹${fmt(t.amount)}</span>
    </div>`).join("")
  : `<p style="text-align:center;opacity:.6;padding:20px;">No VirtuTransactions yet.</p>`;
}

// ── 11. GULLAK CHART ─────────────────────────────────────────
function drawGullakChart(gullak) {
  const canvas = document.getElementById("gullak-chart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width = canvas.offsetWidth || 460;
  const H = canvas.height = 130;
  ctx.clearRect(0, 0, W, H);
  const target = gullak.targetAmount;
  const current = gullak.currentAmount;
  const freqDays = { daily:1, weekly:7, monthly:30 }[gullak.frequency] || 30;
  const intervalsLeft = Math.ceil((target - current) / gullak.limitPerInterval);
  const daysLeft = intervalsLeft * freqDays;
  const totalDays = Math.max(daysLeft + 10, 60);
  const step = Math.max(1, Math.floor(totalDays / 50));
  const points = [];
  let simBal = current;
  for (let d = 0; d <= totalDays; d += step) {
    if (d % freqDays === 0) simBal = Math.min(target, simBal + gullak.limitPerInterval + simBal * GULLAK_INTEREST / 365 * step);
    points.push({ d, val: simBal });
  }
  const pad = { l: 38, r: 8, t: 8, b: 22 };
  const W2 = W - pad.l - pad.r, H2 = H - pad.t - pad.b;
  const toX = d => pad.l + (d / totalDays) * W2;
  const toY = v => pad.t + H2 - (Math.min(v, target) / target) * H2;
  
  // Grid
  ctx.strokeStyle = "rgba(0,0,0,.05)"; ctx.lineWidth = 1;
  [0,.25,.5,.75,1].forEach(f => {
    const y = toY(target * f);
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W-pad.r, y); ctx.stroke();
    ctx.fillStyle = "rgba(0,0,0,.4)"; ctx.font = "9px Poppins";
    ctx.fillText("₹" + Math.round(target * f / 1000) + "k", 2, y + 4);
  });
  
  // Fill
  const grad = ctx.createLinearGradient(0, pad.t, 0, H - pad.b);
  grad.addColorStop(0, "rgba(42,138,84,.35)");
  grad.addColorStop(1, "rgba(42,138,84,.03)");
  ctx.beginPath();
  points.forEach((p,i) => i === 0 ? ctx.moveTo(toX(p.d), toY(p.val)) : ctx.lineTo(toX(p.d), toY(p.val)));
  ctx.lineTo(toX(points[points.length-1].d), H - pad.b);
  ctx.lineTo(pad.l, H - pad.b);
  ctx.closePath(); ctx.fillStyle = grad; ctx.fill();
  
  // Line
  ctx.beginPath(); ctx.strokeStyle = "rgba(42,138,84,.9)"; ctx.lineWidth = 2;
  points.forEach((p,i) => i === 0 ? ctx.moveTo(toX(p.d), toY(p.val)) : ctx.lineTo(toX(p.d), toY(p.val)));
  ctx.stroke();
  
  // Marker
  ctx.beginPath(); ctx.arc(toX(0), toY(current), 5, 0, Math.PI*2);
  ctx.fillStyle = "#e86018"; ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,.4)"; ctx.font = "9px Poppins";
  ctx.fillText("Today", toX(0) - 14, H - 4);
}

// ── 12. GULLAK ACTIVE VIEW ───────────────────────────────────
function renderGullakActiveView(gullak, myUID) {
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
  document.getElementById("g-interest-earned").textContent = "₹" + fmt(
    parseFloat(((gullak.principalDeposited || current) * GULLAK_INTEREST / 365 * daysEl).toFixed(2))
  );
  
  const freqDays = { daily:1, weekly:7, monthly:30 }[gullak.frequency] || 30;
  const intLeft  = Math.ceil(Math.max(0, target - current) / gullak.limitPerInterval);
  const daysLeft = intLeft * freqDays;
  const eta      = new Date(Date.now() + daysLeft * 86400000);
  document.getElementById("g-days-left").textContent = daysLeft > 0 ? daysLeft + "d" : "🎉 Done!";
  document.getElementById("g-eta").textContent = daysLeft > 0
    ? eta.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})
    : "Completed!";
    
  // Group Gullak Contribution Tracker
  const tracker = document.getElementById("g-contribution-tracker");
  const isGroup = gullak.type === "group";
  tracker.style.display = isGroup ? "block" : "none";
  if (isGroup) {
    const contributions = gullak.contributions || {};
    const acceptedMembers = gullak.acceptedMembers || [];
    const pendingInvites  = gullak.pendingInvites  || [];
    const allMembers = [
      { uid: myUID, name: "You (Owner)", isOwner: true },
      ...acceptedMembers.map(m => ({ uid: m.uid, name: m.name, isOwner: false }))
    ];
    const contribList = document.getElementById("g-contributions-list");
    contribList.innerHTML = allMembers.map(m => `
      <div class="g-contribution-row">
        <div class="g-contrib-info">
          <span class="g-contrib-name">${m.name}${m.isOwner ? " 👑" : ""}</span>
          <span class="g-contrib-status">Accepted Member</span>
        </div>
        <span class="g-contrib-amt">₹${fmt(contributions[m.uid] || 0)}</span>
      </div>`).join("") || "<p style='font-size:12px;color:var(--text-muted);padding:10px 0;'>No accepted members yet.</p>";
      
    const pendWrap = document.getElementById("g-pending-invites-wrap");
    const pendList = document.getElementById("g-pending-invites-list");
    pendWrap.style.display = pendingInvites.length ? "block" : "none";
    pendList.innerHTML = pendingInvites.map(p => `
      <div class="g-pending-row">
        <span class="g-pending-name">👤 ${p.name}</span>
        <span class="g-pending-label">📬 Invite Sent</span>
      </div>`).join("");
  }
  drawGullakChart(gullak);
}

// ── 13. INVESTMENT HELPERS ───────────────────────────────────
function calcSIP(monthly, years, rate=0.12) {
  const n=years*12, r=rate/12, fv=monthly*((Math.pow(1+r,n)-1)/r)*(1+r);
  return { invested:monthly*n, returns:fv-monthly*n, total:fv };
}
function calcLT(principal, years, rate=0.09) {
  const fv=principal*Math.pow(1+rate,years);
  return { invested:principal, returns:fv-principal, total:fv };
}
function renderInvestPortfolio(investments) {
  const wrap = document.getElementById("invest-portfolio");
  const list = document.getElementById("invest-portfolio-list");
  if (!investments || !investments.length) { wrap.style.display="none"; return; }
  wrap.style.display = "block";
  list.innerHTML = investments.map(inv => {
    let proj = 0;
    if (inv.type==="sip")      proj = calcSIP(inv.monthly||0, inv.years||1).total;
    if (inv.type==="longterm") proj = calcLT(inv.amount||0, inv.years||1).total;
    if (inv.type==="gold")     proj = (inv.amount||0)*1.08;
    return `<div class="portfolio-item">
      <div><div class="portfolio-item-label">${inv.label}</div><div style="font-size:11px;color:var(--text-muted);">Invested: ₹${fmt(inv.amount)}</div></div>
      <div class="portfolio-item-val">≈ ₹${fmt(proj)}</div>
    </div>`;
  }).join("");
}

// ── 14. UTILITIES ────────────────────────────────────────────
function showToast(msg, isErr=false) {
  const t=document.getElementById("toast"), tm=document.getElementById("toast-message");
  if (!t) { alert(msg); return; }
  tm.textContent = msg;
  t.className = isErr ? "toast show toast-error" : "toast show";
  clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove("show"), 3500);
}
function openModal(id)  { document.getElementById(id)?.classList.add("open"); }
function closeModal(id) { document.getElementById(id)?.classList.remove("open"); }

function mathCaptcha(targetId) {
  const ops=["+","-","×"], op=ops[Math.floor(Math.random()*3)];
  const rnd=(mn,mx) => Math.floor(Math.random()*(mx-mn+1))+mn;
  let a,b,ans;
  if (op==="+"){a=rnd(10,60);b=rnd(5,40);ans=a+b;}
  if (op==="-"){a=rnd(30,80);b=rnd(5,a-1);ans=a-b;}
  if (op==="×"){a=rnd(2,12);b=rnd(2,10);ans=a*b;}
  document.getElementById(targetId).textContent=`${a}  ${op}  ${b}  = ?`;
  return ans;
}

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
  // Apply default translations
  applyTranslations();

  // ── Language Dropdown ──────────────────────────────────
  const langBtn  = document.getElementById("lang-btn");
  const langMenu = document.getElementById("lang-menu");
  langBtn?.addEventListener("click", e => { e.stopPropagation(); langMenu.classList.toggle("open"); });
  document.addEventListener("click", () => langMenu?.classList.remove("open"));
  
  document.querySelectorAll(".lang-option").forEach(opt => {
    opt.addEventListener("click", () => {
      currentLang     = opt.dataset.lang;
      currentLangCode = opt.dataset.code;
      document.querySelectorAll(".lang-option").forEach(o => o.classList.remove("active"));
      opt.classList.add("active");
      document.getElementById("lang-label").textContent = opt.textContent.trim();
      document.getElementById("lang-flag").textContent  = opt.dataset.flag;
      langMenu.classList.remove("open");
      applyTranslations();
      if (speechRecog) speechRecog.lang = currentLangCode;
    });
  });

  // ── Session restore ────────────────────────────────────
  const session = sessionStorage.getItem(SESSION_KEY);
  if (session) {
    const res = await searchAccount(session);
    if (res.success) { populateDashboard(res.account); showSection("section-dashboard"); }
    else sessionStorage.removeItem(SESSION_KEY);
  }

  // ── Nav ───────────────────────────────────────────────
  document.getElementById("nav-login-btn")?.addEventListener("click", () => showSection("section-login"));
  document.getElementById("nav-signup-btn")?.addEventListener("click", () => showSection("section-signup"));
  document.getElementById("goto-signup-link")?.addEventListener("click",() => showSection("section-signup"));
  document.getElementById("goto-login-link")?.addEventListener("click",() => showSection("section-login"));
  document.getElementById("logout-btn")?.addEventListener("click", () => {
    sessionStorage.removeItem(SESSION_KEY); location.reload();
  });

  // ── Gyani Icons ───────────────────────────────────────
  document.querySelectorAll(".gyani-icon[data-feature]").forEach(icon => {
    icon.addEventListener("click", e => {
      e.stopPropagation();
      speakGyani(icon.dataset.feature);
    });
  });

  // ── Transfer Modal Tabs ───────────────────────────────
  document.querySelectorAll(".modal-tab[data-tab]").forEach(tab => {
    tab.addEventListener("click", () => {
      const parent = tab.closest(".modal-card");
      parent.querySelectorAll(".modal-tab[data-tab]").forEach(t => t.classList.remove("active"));
      parent.querySelectorAll(".transfer-panel").forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      const pid = tab.dataset.tab==="internal" ? "transfer-panel-internal" : "transfer-panel-external";
      document.getElementById(pid)?.classList.add("active");
    });
  });

  // ── Invest Tabs ───────────────────────────────────────
  document.querySelectorAll(".modal-tab[data-itab]").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".modal-tab[data-itab]").forEach(t => t.classList.remove("active"));
      ["sip","longterm","gold"].forEach(p => document.getElementById("invest-panel-"+p)?.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById("invest-panel-"+tab.dataset.itab)?.classList.add("active");
    });
  });

  // ── 3D Card Flip ──────────────────────────────────────
  document.getElementById("debit-card-scene")?.addEventListener("click", () => {
    document.getElementById("debit-card-flip")?.classList.toggle("flipped");
  });
  document.getElementById("credit-card-scene")?.addEventListener("click", async () => {
    const uid = sessionStorage.getItem(SESSION_KEY);
    const res = await searchAccount(uid);
    if (!res.success) return;
    if ((res.account.virtuTrustScore || 400) >= 850) {
      document.getElementById("credit-card-flip")?.classList.toggle("flipped");
    } else {
      showToast(t("build_trust") + " Score: " + (res.account.virtuTrustScore||400) + " / 850", true);
    }
  });

  // ── LOGIN ─────────────────────────────────────────────
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
    btn.disabled = false; btn.querySelector(".btn-text").textContent = t("sign_in") || "Sign In";
  });

  // ── SIGNUP ────────────────────────────────────────────
  document.getElementById("signup-form")?.addEventListener("submit", async e => {
    e.preventDefault();
    const btn = document.getElementById("signup-submit-btn");
    btn.disabled = true; btn.querySelector(".btn-text").textContent = "Creating...";
    try {
      const uid = await createAccount({
        name: document.getElementById("s-name").value.trim(),
        age:  document.getElementById("s-age").value,
        gender: document.getElementById("s-gender").value,
        marital: document.getElementById("s-marital").value,
        pan:  document.getElementById("s-pan").value.toUpperCase(),
        aadhar: document.getElementById("s-aadhar").value,
        email: document.getElementById("s-email").value.toLowerCase(),
        mobile: document.getElementById("s-mobile").value,
        address: document.getElementById("s-address").value,
        password: document.getElementById("s-password").value,
        mpin: document.getElementById("s-mpin").value
      });
      document.getElementById("modal-uid-value").textContent = uid;
      openModal("uid-modal");
    } catch(err) { showToast("Error creating account. Try again.", true); }
    btn.disabled = false; btn.querySelector(".btn-text").textContent = t("create_account") || "Create My Account";
  });
  
  document.getElementById("modal-proceed-btn")?.addEventListener("click", () => {
    closeModal("uid-modal"); document.getElementById("signup-form").reset(); showSection("section-login");
  });

  // ── INTERNAL TRANSFER ─────────────────────────────────
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
    
    const sAcc = sRes.account, rAcc = rRes.account;
    sAcc.balance -= amt; rAcc.balance += amt;
    addTxn(sAcc, { type:"debit",  category:"internal", description:`Paid ${rAcc.name}`, amount:amt });
    addTxn(rAcc, { type:"credit", category:"internal", description:`From ${sAcc.name}`, amount:amt });
    
    if (saveFav) {
      sAcc.favorites = sAcc.favorites || [];
      if (!sAcc.favorites.find(f => f.uid===rUID)) sAcc.favorites.push({ uid:rUID, name:rAcc.name });
    }
    
    // Auto-save to gullak
    let gullakSaved = 0;
    if (sAcc.gullak && sAcc.autoSave !== false) {
      const roundUp = Math.ceil(amt/100)*100;
      const savings = parseFloat((roundUp-amt).toFixed(2));
      if (savings > 0 && sAcc.balance >= savings) {
        sAcc.balance -= savings;
        sAcc.gullak.currentAmount = parseFloat((sAcc.gullak.currentAmount+savings).toFixed(2));
        sAcc.gullak.principalDeposited = (sAcc.gullak.principalDeposited||0)+savings;
        if (sAcc.gullak.contributions) sAcc.gullak.contributions[sUID] = (sAcc.gullak.contributions[sUID]||0)+savings;
        addTxn(sAcc, { type:"debit", category:"gullak", description:`Auto-Save to Gullak`, amount:savings });
        gullakSaved = savings;
      }
    }
    
    await Promise.all([
      saveAccount(sUID, { balance:sAcc.balance, transactions:sAcc.transactions, favorites:sAcc.favorites, gullak:sAcc.gullak }),
      saveAccount(rUID, { balance:rAcc.balance, transactions:rAcc.transactions }),
    ]);
    await bumpTrust(sUID, 10);
    closeModal("transfer-modal"); document.getElementById("internal-transfer-form").reset();
    document.getElementById("int-save-fav").checked = false;
    
    const fresh = await searchAccount(sUID);
    if (fresh.success) populateDashboard(fresh.account);
    showToast(`₹${fmt(amt)} sent to ${rAcc.name}!${gullakSaved ? ` 🏺 ₹${fmt(gullakSaved)} auto-saved.` : ""}`);
  });

  // ── EXTERNAL TRANSFER ─────────────────────────────────
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
    addTxn(sAcc, { type:"debit", category:"external", description:`UPI to ${upi}`, amount:amt });
    
    let gullakSaved = 0;
    if (sAcc.gullak && sAcc.autoSave !== false) {
      const roundUp = Math.ceil(amt/100)*100;
      const savings = parseFloat((roundUp-amt).toFixed(2));
      if (savings > 0 && sAcc.balance >= savings) {
        sAcc.balance -= savings;
        sAcc.gullak.currentAmount = parseFloat((sAcc.gullak.currentAmount+savings).toFixed(2));
        sAcc.gullak.principalDeposited = (sAcc.gullak.principalDeposited||0)+savings;
        if (sAcc.gullak.contributions) sAcc.gullak.contributions[sUID] = (sAcc.gullak.contributions[sUID]||0)+savings;
        addTxn(sAcc, { type:"debit", category:"gullak", description:`Auto-Save to Gullak`, amount:savings });
        gullakSaved = savings;
      }
    }
    
    await saveAccount(sUID, { balance:sAcc.balance, transactions:sAcc.transactions, gullak:sAcc.gullak });
    await bumpTrust(sUID, 5);
    closeModal("transfer-modal"); document.getElementById("external-transfer-form").reset();
    
    const fresh = await searchAccount(sUID);
    if (fresh.success) populateDashboard(fresh.account);
    showToast(`₹${fmt(amt)} sent via UPI!${gullakSaved ? ` 🏺 Auto-saved ₹${fmt(gullakSaved)}.` : ""}`);
  });

  // ── HISTORY TOGGLE ────────────────────────────────────
  document.getElementById("toggle-history-btn")?.addEventListener("click", () => {
    document.getElementById("history-panel").classList.toggle("open");
  });

  // ── VOICE PAY ─────────────────────────────────────────
  document.getElementById("open-voice-btn")?.addEventListener("click",  () => openModal("voice-modal"));
  document.getElementById("voice-close-btn")?.addEventListener("click", () => closeModal("voice-modal"));
  
  const SpeechRecog = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecog) {
    speechRecog = new SpeechRecog();
    speechRecog.lang = currentLangCode;
    speechRecog.continuous = false;
    speechRecog.interimResults = false;
    speechRecog.onresult = async (event) => {
      const text = event.results[0][0].transcript;
      document.getElementById("voice-transcript").textContent = `"${text}"`;
      document.getElementById("mic-pulse").style.display = "none";
      const lower   = text.toLowerCase().trim();
      const pattern = VOICE_PATTERNS[currentLangCode] || VOICE_PATTERNS["en-IN"];
      let amount = null, spokenName = null;
      
      if (currentLangCode === "hi-IN") {
        const m1 = lower.match(/(\S+)\s+ko\s+(\d+(?:\.\d+)?)\s*(?:rupee|rupaye|rs)?\s*(?:bhej|do|bhejdo)?/i);
        const m2 = lower.match(/(\d+(?:\.\d+)?)\s+(\S+)\s+ko\s+(?:bhej|do)/i);
        const mE = lower.match(/send\s+(\d+(?:\.\d+)?)\s+to\s+(.+)/i);
        if (m1) { spokenName = m1[1]; amount = parseFloat(m1[2]); }
        else if (m2) { amount = parseFloat(m2[1]); spokenName = m2[2]; }
        else if (mE) { amount = parseFloat(mE[1]); spokenName = mE[2].trim(); }
      } else if (currentLangCode === "te-IN") {
        const m1 = lower.match(/(\S+)\s+ki\s+(\d+(?:\.\d+)?)\s+(?:pampandi|pampu)/i);
        const mE = lower.match(/send\s+(\d+(?:\.\d+)?)\s+to\s+(.+)/i);
        if (m1) { spokenName = m1[1]; amount = parseFloat(m1[2]); }
        else if (mE) { amount = parseFloat(mE[1]); spokenName = mE[2].trim(); }
      } else {
        const m = lower.match(pattern);
        if (m) { amount = parseFloat(m[1]||m[3]||m[5]||0); spokenName = (m[2]||m[4]||m[6]||"").trim().replace(/[.,!?]$/g,""); }
      }
      
      if (amount && spokenName) {
        document.getElementById("voice-parsed").textContent = `🔍 Searching: "${spokenName}"...`;
        const uid = sessionStorage.getItem(SESSION_KEY);
        const res = await searchAccount(uid);
        if (res.success) {
          const favs = res.account.favorites || [];
          const found = favs.find(f => f.name.toLowerCase().includes(spokenName.toLowerCase()) || spokenName.toLowerCase().includes(f.name.toLowerCase()));
          if (found) {
            document.getElementById("voice-parsed").textContent = `✅ Sending ₹${fmt(amount)} to ${found.name}`;
            setTimeout(() => {
              closeModal("voice-modal");
              document.getElementById("int-receiver-uid").value = found.uid;
              document.getElementById("int-amount").value = amount;
              document.querySelector(".modal-tab[data-tab='internal']")?.click();
              openModal("transfer-modal");
            }, 1200);
          } else {
            document.getElementById("voice-parsed").textContent = `❌ "${spokenName}" not in Favorites. Add them first!`;
          }
        }
      } else {
        document.getElementById("voice-parsed").textContent = `❌ Not understood. Try: "Send 500 to Rahul"`;
      }
    };
    speechRecog.onerror = () => {
      document.getElementById("mic-pulse").style.display = "none";
      document.getElementById("voice-transcript").textContent = "Audio unclear. Please try again.";
    };
    document.getElementById("voice-start-btn")?.addEventListener("click", () => {
      document.getElementById("mic-pulse").style.display = "block";
      document.getElementById("voice-transcript").textContent = "Listening...";
      document.getElementById("voice-parsed").textContent = "";
      speechRecog.lang = currentLangCode;
      speechRecog.start();
    });
  } else {
    document.getElementById("voice-start-btn")?.addEventListener("click", () => {
      document.getElementById("voice-transcript").textContent = "Voice not supported. Use Chrome.";
    });
  }

  // ── FAVORITES ─────────────────────────────────────────
  async function renderFavList() {
    const uid = sessionStorage.getItem(SESSION_KEY);
    const res = await searchAccount(uid);
    if (!res.success) return;
    const favs = res.account.favorites || [];
    const container = document.getElementById("fav-list-container");
    container.innerHTML = favs.length
      ? favs.map((f,i) => `
          <div class="fav-item">
            <div class="fav-item-info"><span class="fav-item-name">${f.name}</span><span class="fav-item-uid">${f.uid}</span></div>
            <div class="fav-actions">
              <button class="fav-send-btn" data-uid="${f.uid}">💸 Send</button>
              <button class="fav-del-btn" data-idx="${i}">✕</button>
            </div>
          </div>`).join("")
      : `<p style="text-align:center;color:var(--text-muted);font-size:13px;">No favorites yet.</p>`;
      
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
        const idx = parseInt(btn.dataset.idx);
        const res2 = await searchAccount(uid);
        if (!res2.success) return;
        res2.account.favorites.splice(idx,1);
        await saveAccount(uid, { favorites: res2.account.favorites });
        renderFavList();
      });
    });
  }
  document.getElementById("open-fav-btn")?.addEventListener("click", () => { renderFavList(); openModal("fav-modal"); });
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
    if (res.account.favorites.find(f => f.uid===fuid)) { showToast("Already in favorites."); return; }
    res.account.favorites.push({ uid:fuid, name });
    await saveAccount(uid, { favorites: res.account.favorites });
    document.getElementById("fav-name").value = "";
    document.getElementById("fav-uid").value  = "";
    showToast(`${name} added to favorites! ⭐`);
    renderFavList();
  });

  // ── LOAN APPLY ────────────────────────────────────────
  document.querySelectorAll(".loan-apply-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const uid    = sessionStorage.getItem(SESSION_KEY);
      const res    = await searchAccount(uid);
      if (!res.success) return;
      const score  = res.account.virtuTrustScore || 400;
      const minReq = parseInt(btn.dataset.min);
      if (score < minReq) {
        showToast(`${t("trust_score")}: ${score}/${minReq}. ${t("build_trust")}`, true);
      } else {
        showToast(`Loan application submitted! We'll process within 24 hours. 🎉`);
        await bumpTrust(uid, 20);
        const fresh = await searchAccount(uid);
        if (fresh.success) populateDashboard(fresh.account);
      }
    });
  });

  // ── SERVICES HUB ──────────────────────────────────────
  document.getElementById("open-services-btn")?.addEventListener("click", () => openModal("services-modal"));
  document.getElementById("services-close-btn")?.addEventListener("click",() => closeModal("services-modal"));
  document.getElementById("svc-gullak")?.addEventListener("click",  () => { closeModal("services-modal"); document.getElementById("open-gullak-btn").click(); });
  document.getElementById("svc-invest")?.addEventListener("click",  () => { closeModal("services-modal"); document.getElementById("open-invest-btn").click(); });
  document.getElementById("svc-loans")?.addEventListener("click",   () => { closeModal("services-modal"); document.querySelector(".loans-panel")?.scrollIntoView({ behavior:"smooth" }); });
  document.getElementById("svc-cards")?.addEventListener("click",   async () => {
    closeModal("services-modal");
    const uid = sessionStorage.getItem(SESSION_KEY);
    const res = await searchAccount(uid);
    if (res.success) populateCards(res.account);
    openModal("cards-modal");
  });
  document.getElementById("cards-close-btn")?.addEventListener("click", () => closeModal("cards-modal"));

  // ── VIRTU-INVESTS ─────────────────────────────────────
  document.getElementById("open-invest-btn")?.addEventListener("click", async () => {
    const uid = sessionStorage.getItem(SESSION_KEY);
    const res = await searchAccount(uid);
    if (res.success) renderInvestPortfolio(res.account.investments);
    openModal("invest-modal");
  });
  document.getElementById("invest-close-btn")?.addEventListener("click", () => closeModal("invest-modal"));
  
  document.getElementById("sip-calc-btn")?.addEventListener("click", () => {
    const m=parseFloat(document.getElementById("sip-amount").value), y=parseInt(document.getElementById("sip-years").value);
    if (!m||!y) { showToast("Fill both fields.",true); return; }
    const c=calcSIP(m,y), el=document.getElementById("sip-result");
    el.innerHTML=`💰 Invested: ₹${fmt(c.invested)}<br>📈 Returns: ₹${fmt(c.returns)}<br>🏆 Total: <strong>₹${fmt(c.total)}</strong> in ${y} years`;
    el.classList.add("show");
  });
  document.getElementById("sip-form")?.addEventListener("submit", async e => {
    e.preventDefault();
    const uid=sessionStorage.getItem(SESSION_KEY), m=parseFloat(document.getElementById("sip-amount").value), y=parseInt(document.getElementById("sip-years").value);
    const res=await searchAccount(uid); if(!res.success)return;
    const acc=res.account;
    if(acc.balance<m){showToast("Insufficient balance.",true);return;}
    acc.balance-=m; acc.investments=acc.investments||[];
    acc.investments.push({type:"sip",label:`SIP ₹${fmt(m)}/mo`,monthly:m,years:y,amount:m,startedAt:nowISO()});
    addTxn(acc,{type:"debit",category:"invest",description:`SIP Started ₹${fmt(m)}/mo`,amount:m});
    await saveAccount(uid,{balance:acc.balance,investments:acc.investments,transactions:acc.transactions});
    await bumpTrust(uid,15);
    closeModal("invest-modal");
    const fresh=await searchAccount(uid); if(fresh.success)populateDashboard(fresh.account);
    showToast(`SIP of ₹${fmt(m)}/month started! 📈`);
  });

  document.getElementById("lt-calc-btn")?.addEventListener("click", () => {
    const a=parseFloat(document.getElementById("lt-amount").value), y=parseInt(document.getElementById("lt-years").value);
    if(!a||!y){showToast("Fill both fields.",true);return;}
    const c=calcLT(a,y), el=document.getElementById("lt-result");
    el.innerHTML=`💰 Principal: ₹${fmt(c.invested)}<br>📈 Interest: ₹${fmt(c.returns)}<br>🏆 Maturity: <strong>₹${fmt(c.total)}</strong> in ${y} years`;
    el.classList.add("show");
  });
  document.getElementById("lt-form")?.addEventListener("submit", async e => {
    e.preventDefault();
    const uid=sessionStorage.getItem(SESSION_KEY), a=parseFloat(document.getElementById("lt-amount").value), y=parseInt(document.getElementById("lt-years").value);
    const res=await searchAccount(uid); if(!res.success)return;
    const acc=res.account;
    if(acc.balance<a){showToast("Insufficient balance.",true);return;}
    acc.balance-=a; acc.investments=acc.investments||[];
    acc.investments.push({type:"longterm",label:`FD ₹${fmt(a)} × ${y}yr`,amount:a,years:y,startedAt:nowISO()});
    addTxn(acc,{type:"debit",category:"invest",description:`Long-Term Invest ₹${fmt(a)}`,amount:a});
    await saveAccount(uid,{balance:acc.balance,investments:acc.investments,transactions:acc.transactions});
    await bumpTrust(uid,15);
    closeModal("invest-modal");
    const fresh=await searchAccount(uid); if(fresh.success)populateDashboard(fresh.account);
    showToast(`₹${fmt(a)} invested for ${y} years! 💼`);
  });

  document.getElementById("gold-calc-btn")?.addEventListener("click", () => {
    const a=parseFloat(document.getElementById("gold-amount").value);
    if(!a){showToast("Enter amount.",true);return;}
    const g=(a/GOLD_PRICE_PER_GRAM).toFixed(4), el=document.getElementById("gold-result");
    el.innerHTML=`🥇 You get: <strong>${g}g</strong> of 24K Digital Gold<br>@ ₹${fmt(GOLD_PRICE_PER_GRAM)}/gram`;
    el.classList.add("show");
  });
  document.getElementById("gold-form")?.addEventListener("submit", async e => {
    e.preventDefault();
    const uid=sessionStorage.getItem(SESSION_KEY), a=parseFloat(document.getElementById("gold-amount").value);
    const res=await searchAccount(uid); if(!res.success)return;
    const acc=res.account;
    if(acc.balance<a){showToast("Insufficient balance.",true);return;}
    const g=parseFloat((a/GOLD_PRICE_PER_GRAM).toFixed(4));
    acc.balance-=a; acc.investments=acc.investments||[];
    acc.investments.push({type:"gold",label:`Digital Gold ${g}g`,amount:a,grams:g,startedAt:nowISO()});
    addTxn(acc,{type:"debit",category:"invest",description:`Bought ${g}g Digital Gold`,amount:a});
    await saveAccount(uid,{balance:acc.balance,investments:acc.investments,transactions:acc.transactions});
    await bumpTrust(uid,10);
    closeModal("invest-modal");
    const fresh=await searchAccount(uid); if(fresh.success)populateDashboard(fresh.account);
    showToast(`Bought ${g}g of Digital Gold! 🥇`);
  });

  // ── VIRTUGULLAK ───────────────────────────────────────
  let gullakWithdrawAns=null, gullakPauseAns=null, pendingGullakType="solo";
  
  async function openGullakModal() {
    const uid = sessionStorage.getItem(SESSION_KEY);
    const res = await searchAccount(uid);
    if (!res.success) return;
    const acc = res.account;
    if (acc.gullak && !acc.gullak.paused) {
      renderGullakActiveView(acc.gullak, uid);
    } else {
      document.getElementById("gullak-create-view").style.display = "block";
      document.getElementById("gullak-active-view").style.display = "none";
      document.getElementById("gullak-setup-form").style.display  = "none";
      const favs   = acc.favorites || [];
      const picker = document.getElementById("gullak-member-picker");
      picker.innerHTML = favs.length
        ? favs.map(f => `<span class="member-chip" data-uid="${f.uid}" data-name="${f.name}">${f.name}</span>`).join("")
        : `<span style="font-size:11px;color:var(--text-muted);">No favorites yet. Add some first!</span>`;
      picker.querySelectorAll(".member-chip").forEach(c => c.addEventListener("click", () => c.classList.toggle("selected")));
    }
    openModal("gullak-modal");
  }

  document.getElementById("open-gullak-btn")?.addEventListener("click", openGullakModal);
  document.getElementById("gullak-close-btn")?.addEventListener("click", () => closeModal("gullak-modal"));
  
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
  document.getElementById("g-frequency")?.addEventListener("change", function() {
    const labels = { daily:"Daily limit (₹)", weekly:"Weekly limit (₹)", monthly:"Monthly limit (₹)" };
    document.getElementById("g-limit-label").textContent = labels[this.value] || "Amount per interval (₹)";
  });

  // CREATE GULLAK — includes invite system for Group
  document.getElementById("gullak-setup-form")?.addEventListener("submit", async e => {
    e.preventDefault();
    const uid    = sessionStorage.getItem(SESSION_KEY);
    const name   = document.getElementById("g-name").value.trim();
    const target = parseFloat(document.getElementById("g-target").value);
    const freq   = document.getElementById("g-frequency").value;
    const limit  = parseFloat(document.getElementById("g-limit").value);
    if (!name || !target || !limit) { showToast("Fill all fields.", true); return; }
    
    const res = await searchAccount(uid);
    if (!res.success) return;
    const ownerAcc = res.account;
    
    // Build gullak object
    const gullak = {
      name, targetAmount: target, currentAmount: 0,
      principalDeposited: 0, frequency: freq,
      limitPerInterval: limit, autoSave: true,
      type: pendingGullakType,
      contributions: { [uid]: 0 },   // contribution tracker
      acceptedMembers: [],             // UIDs who accepted invite
      pendingInvites:  [],             // UIDs of pending invitees
      createdAt: nowISO(), paused: false,
    };
    
    // Process group invites
    if (pendingGullakType === "group") {
      const selected = Array.from(document.querySelectorAll(".member-chip.selected"));
      for (const chip of selected) {
        const invUID  = chip.dataset.uid;
        const invName = chip.dataset.name;
        gullak.pendingInvites.push({ uid: invUID, name: invName });
        
        // Write invite to invitee's account
        const invRes = await searchAccount(invUID);
        if (invRes.success) {
          const invAcc = invRes.account;
          invAcc.gullakInvites = invAcc.gullakInvites || [];
          invAcc.gullakInvites.push({
            fromUID: uid, fromName: ownerAcc.name,
            gullakName: name, targetAmount: target,
            status: "pending", createdAt: nowISO()
          });
          await saveAccount(invUID, { gullakInvites: invAcc.gullakInvites });
        }
      }
    }
    
    await saveAccount(uid, { gullak });
    closeModal("gullak-modal");
    showToast(`🏺 Gullak "${name}" created!${gullak.pendingInvites.length ? " Invites sent! 📬" : ""}`);
    
    const fresh = await searchAccount(uid);
    if (fresh.success) populateDashboard(fresh.account);
  });

  // ── GULLAK INVITES INBOX ──────────────────────────────
  document.getElementById("open-gullak-invites-btn")?.addEventListener("click", async () => {
    const uid = sessionStorage.getItem(SESSION_KEY);
    const res = await searchAccount(uid);
    if (!res.success) return;
    const invites = (res.account.gullakInvites || []).filter(i => i.status === "pending");
    const list = document.getElementById("invite-inbox-list");
    
    list.innerHTML = invites.length ? invites.map((inv, idx) => `
      <div class="invite-inbox-item">
        <div class="invite-inbox-info">
          <span class="invite-inbox-gullak-name">🏺 ${inv.gullakName}</span>
          <span class="invite-inbox-from">From: ${inv.fromName}</span>
          <span class="invite-inbox-goal">Goal: ₹${fmt(inv.targetAmount)}</span>
        </div>
        <div>
          <button class="invite-btn-accept" data-idx="${idx}" data-owner="${inv.fromUID}">Accept</button>
          <button class="invite-btn-decline" data-idx="${idx}">Decline</button>
        </div>
      </div>
    `).join("") : `<p style="text-align:center;color:var(--text-muted);font-size:13px;padding:20px;">No pending invites.</p>`;

    list.querySelectorAll(".invite-btn-accept").forEach(btn => {
      btn.addEventListener("click", async () => {
        const idx = btn.dataset.idx;
        const ownerUID = btn.dataset.owner;
        const myRes = await searchAccount(uid);
        const ownerRes = await searchAccount(ownerUID);
        
        if(myRes.success && ownerRes.success) {
          const myAcc = myRes.account;
          const oAcc = ownerRes.account;
          
          // Move from pending to accepted in owner's group gullak
          if(oAcc.gullak && oAcc.gullak.type === "group") {
            oAcc.gullak.pendingInvites = (oAcc.gullak.pendingInvites || []).filter(p => p.uid !== uid);
            oAcc.gullak.acceptedMembers = oAcc.gullak.acceptedMembers || [];
            oAcc.gullak.acceptedMembers.push({uid: uid, name: myAcc.name});
            oAcc.gullak.contributions = oAcc.gullak.contributions || {};
            oAcc.gullak.contributions[uid] = 0;
            await saveAccount(ownerUID, { gullak: oAcc.gullak });
          }
          
          // Update my invite status and link shared gullak
          myAcc.gullakInvites[idx].status = "accepted";
          myAcc.gullak = { isShared: true, ownerUID: ownerUID, name: oAcc.gullak?.name || "Shared Gullak" };
          await saveAccount(uid, { gullakInvites: myAcc.gullakInvites, gullak: myAcc.gullak });
          
          closeModal("gullak-invite-inbox-modal");
          showToast("Invite Accepted! You're in the Group Gullak. 🎉");
          populateDashboard(myAcc);
        }
      });
    });

    list.querySelectorAll(".invite-btn-decline").forEach(btn => {
      btn.addEventListener("click", async () => {
        const idx = btn.dataset.idx;
        res.account.gullakInvites[idx].status = "declined";
        await saveAccount(uid, { gullakInvites: res.account.gullakInvites });
        closeModal("gullak-invite-inbox-modal");
        showToast("Invite declined.");
        populateDashboard(res.account);
      });
    });

    openModal("gullak-invite-inbox-modal");
  });
  document.getElementById("invite-inbox-close")?.addEventListener("click", () => closeModal("gullak-invite-inbox-modal"));

  // ── GULLAK ACTIONS (Add, Withdraw, Auto, Pause) ───────
  document.getElementById("g-add-money-btn")?.addEventListener("click", () => {
    document.getElementById("g-manual-amount").value = "";
    document.getElementById("g-manual-mpin").value = "";
    openModal("gullak-add-modal");
  });
  document.getElementById("gullak-add-close")?.addEventListener("click", () => closeModal("gullak-add-modal"));

  document.getElementById("g-manual-confirm-btn")?.addEventListener("click", async () => {
    const uid = sessionStorage.getItem(SESSION_KEY);
    const amt = parseFloat(document.getElementById("g-manual-amount").value);
    const mpin = document.getElementById("g-manual-mpin").value;
    if(!amt || !mpin) { showToast("Fill all fields.", true); return; }

    const res = await searchAccount(uid);
    if(!res.success) return;
    const acc = res.account;
    if(acc.mpin !== mpin) { showToast("Invalid MPIN.", true); return; }
    if(acc.balance < amt) { showToast("Insufficient balance.", true); return; }

    let targetUID = uid;
    let targetAcc = acc;
    let isShared = acc.gullak && acc.gullak.isShared;

    if (isShared) {
      const ownerRes = await searchAccount(acc.gullak.ownerUID);
      if(ownerRes.success) {
        targetUID = acc.gullak.ownerUID;
        targetAcc = ownerRes.account;
      }
    }

    if(!targetAcc.gullak) return;

    acc.balance -= amt;
    addTxn(acc, { type: "debit", category: "gullak", description: "Added to Gullak", amount: amt });

    targetAcc.gullak.currentAmount += amt;
    targetAcc.gullak.principalDeposited = (targetAcc.gullak.principalDeposited || 0) + amt;
    if(targetAcc.gullak.contributions) {
      targetAcc.gullak.contributions[uid] = (targetAcc.gullak.contributions[uid] || 0) + amt;
    }

    if(isShared) {
      await saveAccount(targetUID, { gullak: targetAcc.gullak });
      await saveAccount(uid, { balance: acc.balance, transactions: acc.transactions });
    } else {
      await saveAccount(uid, { balance: acc.balance, transactions: acc.transactions, gullak: acc.gullak });
    }

    await bumpTrust(uid, 10);
    closeModal("gullak-add-modal");
    showToast(`₹${fmt(amt)} added to Gullak! 🏺`);
    
    const fresh = await searchAccount(uid);
    if(fresh.success) {
      populateDashboard(fresh.account);
      if(isShared) {
        const fOwner = await searchAccount(fresh.account.gullak.ownerUID);
        if(fOwner.success) renderGullakActiveView(fOwner.account.gullak, uid);
      } else {
        renderGullakActiveView(fresh.account.gullak, uid);
      }
    }
  });

  document.getElementById("g-withdraw-btn")?.addEventListener("click", () => {
    gullakWithdrawAns = mathCaptcha("gullak-captcha-q");
    document.getElementById("gullak-captcha-ans").value = "";
    document.getElementById("gullak-withdraw-amount").value = "";
    document.getElementById("gullak-withdraw-mpin").value = "";
    openModal("gullak-withdraw-modal");
  });
  document.getElementById("gullak-withdraw-close")?.addEventListener("click", () => closeModal("gullak-withdraw-modal"));

  document.getElementById("gullak-withdraw-confirm-btn")?.addEventListener("click", async () => {
    const uid = sessionStorage.getItem(SESSION_KEY);
    const ans = parseInt(document.getElementById("gullak-captcha-ans").value);
    const amt = parseFloat(document.getElementById("gullak-withdraw-amount").value);
    const mpin = document.getElementById("gullak-withdraw-mpin").value;

    if(ans !== gullakWithdrawAns) { showToast("Incorrect security answer.", true); return; }
    const res = await searchAccount(uid);
    if(!res.success || !res.account.gullak) return;
    const acc = res.account;

    if(acc.gullak.isShared) { showToast("Only the owner can withdraw from a Group Gullak.", true); return; }
    if(acc.mpin !== mpin) { showToast("Invalid MPIN.", true); return; }
    if(acc.gullak.currentAmount < amt) { showToast("Insufficient Gullak balance.", true); return; }

    acc.gullak.currentAmount -= amt;
    acc.balance += amt;
    addTxn(acc, { type: "credit", category: "gullak", description: "Withdrew from Gullak", amount: amt });

    await saveAccount(uid, { balance: acc.balance, transactions: acc.transactions, gullak: acc.gullak });
    closeModal("gullak-withdraw-modal");
    showToast(`₹${fmt(amt)} withdrawn from Gullak. 💰`);
    
    const fresh = await searchAccount(uid);
    if(fresh.success) {
      populateDashboard(fresh.account);
      renderGullakActiveView(fresh.account.gullak, uid);
    }
  });

  document.getElementById("g-auto-toggle-btn")?.addEventListener("click", async () => {
    const uid = sessionStorage.getItem(SESSION_KEY);
    const res = await searchAccount(uid);
    if(!res.success || !res.account.gullak || res.account.gullak.isShared) return;
    
    res.account.gullak.autoSave = !(res.account.gullak.autoSave !== false);
    await saveAccount(uid, { gullak: res.account.gullak });
    document.getElementById("g-auto-status").textContent = res.account.gullak.autoSave ? "ON" : "OFF";
    showToast(`Auto-Save turned ${res.account.gullak.autoSave ? "ON" : "OFF"}`);
  });

  document.getElementById("g-pause-btn")?.addEventListener("click", () => {
    gullakPauseAns = mathCaptcha("gullak-pause-captcha-q");
    document.getElementById("gullak-pause-ans").value = "";
    openModal("gullak-pause-modal");
  });
  document.getElementById("gullak-pause-close")?.addEventListener("click", () => closeModal("gullak-pause-modal"));

  document.getElementById("gullak-pause-confirm-btn")?.addEventListener("click", async () => {
    const uid = sessionStorage.getItem(SESSION_KEY);
    const ans = parseInt(document.getElementById("gullak-pause-ans").value);
    if(ans !== gullakPauseAns) { showToast("Incorrect security answer.", true); return; }

    const res = await searchAccount(uid);
    if(!res.success || !res.account.gullak) return;
    
    if(res.account.gullak.isShared) {
      res.account.gullak = null; // Simply leave group gullak
    } else {
      const funds = res.account.gullak.currentAmount;
      res.account.balance += funds;
      if(funds > 0) {
        addTxn(res.account, { type: "credit", category: "gullak", description: "Gullak Closed & Funds Returned", amount: funds });
      }
      res.account.gullak = null;
    }
    
    await saveAccount(uid, { balance: res.account.balance, transactions: res.account.transactions, gullak: res.account.gullak });
    closeModal("gullak-pause-modal");
    closeModal("gullak-modal");
    showToast("Gullak closed successfully.");
    const fresh = await searchAccount(uid);
    if(fresh.success) populateDashboard(fresh.account);
  });

  // ── VIRTU-MITRA (AI CHAT) ─────────────────────────────
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
    
    // Quick prototype response for GSC
    setTimeout(() => {
      addChatMsg("Main ek prototype Virtu-Mitra hoon. GSC final submission mein hum yahan backend se Gemini LLM connect karenge! 🚀", false);
    }, 1000);
  });

  aiInput?.addEventListener("keypress", (e) => {
    if(e.key === "Enter") aiSend.click();
  });

}); // ── END OF DOMContentLoaded ──