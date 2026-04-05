# 🏦 VirtuBank - The Future of Digital Banking

> A dual-architecture banking simulation bridging Core Algorithms (C/DSA) and Modern Web UI.

VirtuBank is a comprehensive digital banking system built from the ground up by **Team Virtu Masters**. It started as a robust, crash-proof backend engine written in C to demonstrate advanced data structures, and evolved into a fully functional Single Page Application (SPA) using Vanilla Web Technologies.

---

## 👥 Meet The Team (Virtu Masters)
* **Shaksham Mishra (Nikki)** - Core Logic, Memory Management, Search Algorithms & Web Integration.
* **Shruti** - Data Architecture, Security Layers (Math Captcha) & UI Finalization.
* **Shreya** - Financial Logic, Transfer Modules & Dynamic Transaction Tracking.
* **Prasansa** - Core Event Loops, Dashboard Mapping & UI Flow Integration.

---

## 🚀 Two-Phase Architecture

### Phase 1: The Core DSA Engine (C Language)
Our foundation was built on strict algorithmic principles to ensure maximum efficiency and zero memory leaks.
* **O(log n) Account Retrieval:** Utilized **Binary Search Trees (BST)** to store and search user accounts rapidly using auto-generated UIDs.
* **O(1) Transaction Logging:** Engineered a dynamic array-shifting technique to log the 5 most recent transactions per user without memory overflow.
* **Fault Tolerance:** Implemented deep File I/O operations (Serialization/Deserialization) to ensure the system is completely crash-proof.

### Phase 2: The Modern Web App (Vanilla JS/HTML/CSS)
To demonstrate scalability, we decoupled our C-backend logic and ported it into a client-side web application.
* **State Management:** Replaced text-file handling with **Browser LocalStorage** for seamless, real-time data persistence.
* **Algorithmic Security:** Integrated a randomized Math Captcha function to prevent accidental account deletions.
* **Premium UI/UX:** Designed a responsive, modern interface with a deep navy and warm gold theme, mimicking real-world fintech applications.

---

## ✨ Key Features

- **Automated KYC & Identification:** Generates a cryptographically randomized 10-character alphanumeric UID upon registration.
- **Secure Authentication:** UID + Password + MPIN required for sensitive actions.
- **Internal & External Transfers:** Strict balance and MPIN validation before atomically updating sender and receiver balances.
- **Dynamic History:** Real-time tracking of the latest 5 transactions with color-coded debit/credit indicators.
- **Safe Exit Protocol:** Prevents memory leaks in C via `freeTree()` and securely clears session states in the Web app.

---

## 🛠️ Tech Stack
* **Backend Engine:** C Programming, Data Structures (BST), File Handling.
* **Frontend Web:** HTML5, CSS3, Vanilla JavaScript (ES6+).
* **Database:** `accounts.txt` (C) / `window.localStorage` (Web).

---

## 💻 How to Run Locally

### Running the Web Version (Recommended)
1. Clone this repository: `git clone https://github.com/mishrashaksham/Virtu-Bank.git`
2. Navigate to the `VirtuBank_Web_UI` folder.
3. Simply double-click `index.html` to open it in your browser (Chrome/Edge/Brave). No local server required!

### Running the C Engine
1. Navigate to the `VirtuBank_Core_C` folder.
2. Compile the source code using GCC: 
   ```bash
   gcc src/main.c src/accounts.c src/transactions.c src/utilities.c -o virtubank -std=c99