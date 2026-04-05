//Shruti & Team

#ifndef STRUCTURE_H
#define STRUCTURE_H
#include <stdio.h>

struct accounts {

    // Personal details of my customer
    char name[50];              // Account holder name
    int age;                    // Age of account holder (user)
    char gender[10];            // Gender (Male/Female/Other)
    char maritalStatus[11];     // Marital status

    // Account details
    long long accountNumber;   // Unique account number
    double balance;            // Account balance details
    
    // Login credentials
    char uid[11];               // UId for user assigned by bank
    char password[30];          // Password for login
    int mpin;                   // MPIN for transactions
    int upiPin;
    
    // Identity details of user (KYC)
    char pan[11];              // PAN card number
    char aadharNumber[13];     // Aadhar number

    // Contact details from user
    char email[50];            // Email ID
    char mobileNumber[15];     // Mobile number

    //Transaction History
    char transactionHistory[5][100];
    int transactionCount;

    // Address
    char address[100];         // Full address
    
    // for further use in BST
    struct accounts *left;     // Pointer to left child (smaller account number)
    struct accounts *right;    // Pointer to right child (greater account number)

};

// Global root pointer
extern struct accounts *root;

// --- UTILITIES & SYSTEM FUNCTIONS ---
int generateCaptcha();
void generateUID(char uid[]);
void saveBankData();
void loadBankData();
void writeNodeToFile(struct accounts *temp, FILE *file);
void insertLoadedAccount(char uid[], char name[], int age, char gender[], char maritalStatus[], char pan[], char aadhar[], char email[], char mobile[], char address[], double balance, int pin, char password[], int tCount, char history[5][100]);

// --- ACCOUNT OPERATIONS ---
void createAccount(char name[], int age, char gender[], char maritalStatus[], char pan[], char aadhar[], char email[], char mobile[], char address[], double balance, int pin, char password[]);
struct accounts *searchAcc(char uid[]);
void displayAllAccounts(struct accounts *node);
void freeTree(struct accounts *root);
struct accounts* deleteNode(struct accounts* root, char uid[]);
struct accounts* minValueNode(struct accounts* node);

// --- TRANSACTIONS ---
void extTransfer(struct accounts *sender, double amount, int enteredPin);
void intTransfer(struct accounts *sender, char UPI[11], double amount, int enteredPin);
void storeTransaction(struct accounts *user, char *primaryUID, char *secondaryUID, double amount, char *type);
void showHistory(struct accounts *user);

#endif