# 🏦 VirtuBank (v1.0)
**A dynamic, memory-efficient, and crash-proof banking simulation built entirely in C.** **Team:** Virtu Masters  

![VirtuBank Banner](https://img.shields.io/badge/Language-C-blue.svg) ![Version](https://img.shields.io/badge/Version-1.0-brightgreen.svg) ![Status](https://img.shields.io/badge/Status-Completed-success.svg)

---

## 📖 About the Project
VirtuBank is a console-based, robust banking backend system designed to mimic real-world banking operations. Instead of using high-level frameworks, we challenged ourselves to build this entirely in **C Programming**, utilizing advanced Data Structures like **Binary Search Trees (BST)** and **Circular Queues**, along with robust File Handling to ensure zero data loss. 

We developed this project in **phases** to ensure modularity, clean code, and effective task distribution among team members.

## 🚀 Development Phases

### 🔹 Phase 1: Foundation & Structuring
- Defined the core `accounts` structure (`structure.h`).
- Implemented the automated 10-character `UID` and `UPI-ID` generation logic.
- Set up the project directory workflow and the initial `main()` skeleton.

### 🔹 Phase 2: Core Banking Operations (BST Optimization)
- Implemented **Binary Search Trees (BST)** for highly optimized $O(\log n)$ memory allocation and searching.
- Built functions to **Create Account**, **Search Account**, and **Display All Accounts** (Admin Panel).
- Implemented `freeTree()` to traverse and free nodes, preventing memory leaks.

### 🔹 Phase 3: Fast Transactions & File Handling (Circular Queues)
- **$O(1)$ Transaction Logs:** Replaced traditional array shifting with a **Circular Queue** to log real-time transaction history efficiently without data-shifting overhead.
- Added **Internal & External Money Transfers** with MPIN authentication.
- Designed a custom **Mathematical Captcha Security** for Account Deletion.
- **Fault Tolerance:** Integrated advanced File Handling (`loadBankData` & `saveBankData`) to make the database crash-proof and persistent across sessions.

---

## 🛠️ Tech Stack & Concepts Used
- **Language:** C (C99 Standard)
- **Data Structures:** Binary Search Trees (BST), Circular Queues, 2D Arrays, Pointers.
- **Algorithms:** Time Complexity Optimization ($O(1)$ queuing, $O(\log n)$ searching).
- **Concepts:** Dynamic Memory Allocation, File I/O, Modular Programming (Header files), Buffer Overflow Prevention.

---

## 🔮 What's Next? (Future Updates - v2.0)
VirtuBank v1.0 is just the beginning! Our team is currently working on:
1. **Web Interface:** Upgrading from a CLI to a sleek Web-based UI using HTML/CSS/JS with LocalStorage mapping.
2. **Account Types:** Introducing Joint Accounts and NRI/Tourist Accounts.
3. **Database Migration:** Shifting from text files to a dedicated SQL/NoSQL database.

---

*Built with ❤️ and countless cups of coffee by Team Virtu Masters.*
