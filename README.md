# 🏦 VirtuBank - Digital Banking Architecture

> A dual-architecture banking simulation showcasing the evolution from a strict Data Structures (DSA) backend engine to a modern Single Page Application (SPA).

VirtuBank is a comprehensive project designed to bridge the gap between core computer science algorithms and modern user interfaces. The project is maintained in two distinct versions, demonstrating a clear software development lifecycle from algorithmic foundations to client-side scalability.

---

## 🚀 Version Evolution & Architecture

### 🛡️ v1.x Branch: The Core DSA Engine (Current: v1.0.3)
The foundational backend built entirely in C. This version serves as the algorithmic brain of VirtuBank, focusing on memory efficiency, optimal data retrieval, and terminal-based interaction.

* **O(log n) Account Retrieval:** Engineered a **Binary Search Tree (BST)** to store user data dynamically, allowing rapid credential verification and account fetching.
* **O(1) Transaction Logging:** Implemented an array-shifting algorithm that maintains a dynamic rolling history of the 5 most recent transactions without memory overflow.
* **Complex Memory Management:** Handled intricate BST node deletions (including finding inorder successors) and implemented a `freeTree()` sweep to guarantee zero memory leaks upon exit.
* **Fault-Tolerant Persistence:** Built manual File I/O serialization to save the entire RAM state directly into local `.txt` storage, ensuring no data loss.

### 🌐 v2.x Branch: The "Bharat 2.0" Web Experience (Current: v-2.0.31)
The evolution from a strict C-based terminal engine into a highly scalable, serverless Single Page Application (SPA). Designed with the "Next Billion Users" in mind, this branch transforms complex banking algorithms into an accessible, hyper-localized, and AI-driven financial ecosystem.

* **⚡ Serverless NoSQL Architecture:** Completely ditched manual file I/O for a real-time, cloud-native backend powered by **Firebase Firestore**. Engineered a custom 10-character cryptographic digital identity (UID) system, ensuring instantaneous, frictionless onboarding without the overhead of traditional email verification.
* **🧠 Agentic AI & Voice-First Accessibility:** Integrated the **Gemini 1.5 Flash REST API** to power *Virtu-Mitra*—a context-aware, multilingual financial chatbot. Pioneered an inclusive **Voice Pay** system via the Web Speech API, executing transactions through vernacular voice commands (Hindi, Telugu, English). Further enhanced accessibility with **Gyani**, a dynamic Text-to-Speech (TTS) tooltip engine for low-literacy users.
* **🏺 Algorithmic Wealth Management (VirtuGullak & Invests):** Developed a collaborative smart-savings engine featuring algorithmic interest accrual (6.5% p.a.) and real-time visual tracking via **HTML5 Canvas** dynamic charts. Built a robust portfolio manager handling SIPs, FDs, and 24K Digital Gold, complete with an instant liquidation/sell logic that updates the user's ledger in O(1) time.
* **🏆 Gamified Credit Scoring (Virtu-Trust):** Replaced traditional CIBIL scores with an internal **Virtu-Trust Score** algorithm. This dynamic metric analyzes savings discipline and transaction frequency to programmatically unlock tiered **Virtu-Loans** (Emergency, Laghu Vyapaar, Kisan Sahayata) and secure, 3D CSS-rendered credit facilities.
* **🌍 Hyper-Localization (i18n Engine):** Built a custom, lightweight localization dictionary from scratch. Seamlessly maps and translates the entire UI across 14 regional and international languages on the fly, eliminating the need for heavy external dependencies.

## 🛠️ Tech Stack

**v1.0.3 (Core Engine - The Foundation)**
* **Language:** C (C99 Standard)
* **Architecture:** Pointers, Structs, Binary Search Trees (BST), Array-shifting
* **Database:** Local File I/O Serialization (`accounts.txt`)

**v-2.0.31 (Bharat 2.0 Web SPA - Current)**
* **Frontend:** HTML5, CSS3 (Custom Variables & 3D Transforms), Vanilla JavaScript (ES6+ Modules)
* **Backend & Database:** Firebase Firestore (Serverless NoSQL Cloud Database)
* **Generative AI:** Google Gemini 1.5 Flash REST API (Virtu-Mitra)
* **Native Web APIs:** * `Web Speech API` (Multilingual Voice Recognition for Voice Pay)
  * `SpeechSynthesis API` (Gyani TTS Engine)
  * `HTML5 Canvas API` (Dynamic Gullak Algorithmic Charts)
* **Architecture:** State-driven DOM Manipulation, Custom i18n Localization Engine, Asynchronous Fetch/Promises
---
