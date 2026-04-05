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

### 🌐 v2.x Branch: The Web Application (Current: v2.0.0)
The modern client-facing evolution. We decoupled the logic from our C-backend and ported it to a full-stack vanilla web environment to demonstrate real-world UI/UX and client-side storage.

* **State Management:** Migrated from text-file handling to **Browser LocalStorage**, creating a seamless, real-time JSON data layer.
* **Algorithmic Security:** Integrated a dynamic Math Captcha gatekeeper that generates randomized arithmetic equations to authenticate and prevent accidental account deletions.
* **Asynchronous UX:** Designed a responsive, SPA-style dashboard featuring color-coded transaction histories, modal-based transfers, and inline form validation.

---

## ✨ Key System Features (Cross-Version)

- **Automated KYC:** Mathematically generates cryptographically randomized 10-character alphanumeric UIDs for robust user identification.
- **Strict Financial Routing:** Enforces rigorous MPIN and balance validation gates before atomically updating sender and receiver nodes.
- **Dynamic History:** Real-time tracking of transactions with direction indicators (Debit/Credit) and running balances.

---

## 🛠️ Tech Stack

**v1.0.3 (Core Engine)**
* **Language:** C (C99 Standard)
* **Architecture:** Pointers, Structs, Binary Search Trees.
* **Database:** Local Text Serialization (`accounts.txt`)

**v2.0.0 (Web UI)**
* **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
* **Architecture:** DOM Manipulation, Event Listeners, JSON Parsing.
* **Database:** `window.localStorage`

---

## 💻 How to Run Locally

### Running the Web Version (v2.0)
1. Clone this repository: 
   ```bash
   git clone [https://github.com/mishrashaksham/Virtu-Bank.git](https://github.com/mishrashaksham/Virtu-Bank.git)