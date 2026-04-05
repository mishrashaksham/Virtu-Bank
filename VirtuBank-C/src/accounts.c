// Shaksham

#include "../include/structure.h"
#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <string.h>


void generateUID(char uid[])
{
    for (int i = 0; i < 4; i++)
    {
        uid[i] = 'A' + (rand() % 26);
    }
    for (int i = 4; i < 10; i++)
    {
        uid[i] = '0' + (rand() % 10);
    }
    uid[10] = '\0';
}

struct accounts *root = NULL;

void createAccount(char name[], int age, char gender[], char maritalStatus[], char pan[], char aadhar[], char email[], char mobile[], char address[], double balance, int pin, char password[])
{
    struct accounts *newAcc = (struct accounts *)malloc(sizeof(struct accounts));
    newAcc->transactionCount=0;
    strcpy(newAcc->name, name);
    strcpy(newAcc->aadharNumber, aadhar);
    newAcc->balance = balance;
    newAcc->age = age;
    newAcc->mpin = pin;
    generateUID(newAcc->uid);
    strcpy(newAcc->gender, gender);
    strcpy(newAcc->maritalStatus, maritalStatus);
    strcpy(newAcc->pan, pan);
    strcpy(newAcc->email, email);
    strcpy(newAcc->mobileNumber, mobile);
    strcpy(newAcc->address, address);
    strcpy(newAcc->password, password);
    newAcc->left = newAcc->right = NULL;
    printf("\n==========================================\n");
    printf(" VIRTU-BANK IDS GENERATED\n");
    printf(" -> Your UID    : %s\n", newAcc->uid);
    printf(" -> Your UPI-ID : %s@vitap\n", newAcc->uid);
    printf(" -> Your Password : %s\n", newAcc->password);
    printf("==========================================\n");
    if (root == NULL)
    {
        root = newAcc;
        return;
    }
    struct accounts *temp = root;
    struct accounts *temp2;
    while (temp != NULL)
    {
        if (strcmp(newAcc->uid, temp->uid) > 0)
        {
            temp2 = temp;
            temp = temp->right;
        }
        else
        {
            temp2 = temp;
            temp = temp->left;
        }
    }
    if (strcmp(newAcc->uid, temp2->uid) > 0)
        temp2->right = newAcc;
    else
        temp2->left = newAcc;
}

struct accounts *searchAcc(char uid[])
{
    if (root == NULL)
    {
        return NULL;
    }
    struct accounts *temp = root;
    while (temp != NULL)
    {
        if (strcmp(uid, temp->uid) == 0)
        {
            return temp;
        }
        else if (strcmp(uid, temp->uid) > 0)
        {
            temp = temp->right;
        }
        else
            temp = temp->left;
    }
    return NULL;
}

void displayAllAccounts(struct accounts *node)
{
    if(node==NULL)
        return;
        displayAllAccounts(node->left);
        printf("\n===================================================\n");
        printf(" VirtuBank UID  : %s\n", node->uid);
        printf(" Name           : %s\n", node->name);
        printf(" Account Balance: Rs %.2lf\n", node->balance);
        printf(" UPI ID         : %s@vb\n", node->uid);
        printf("---------------------------------------------------\n");
        printf(" Age: %d | Gender: %s | Marital Status: %s\n", node->age, node->gender, node->maritalStatus);
        printf(" Address        : %s\n", node->address);
        printf(" Aadhar Number  : %s\n", node->aadharNumber);
        printf(" PAN Card       : %s\n", node->pan);
        printf(" Mobile Number  : %s\n", node->mobileNumber);
        printf(" Email ID       : %s\n", node->email);
        printf("===================================================\n");
        displayAllAccounts(node->right);
}

void freeTree(struct accounts *node)
{
    if (node == NULL)
    {
        return;
    }
    freeTree(node->left);
    freeTree(node->right);
    free(node);
}

void writeNodeToFile(struct accounts *temp, FILE *file) {
    if (temp == NULL) {
        return;
    }
    writeNodeToFile(temp->left, file);
    fprintf(file, "%s|%s|%d|%s|%s|%s|%s|%s|%s|%s|%lf|%d|%s", 
            temp->uid, temp->name, temp->age, temp->gender, temp->maritalStatus, 
            temp->pan, temp->aadharNumber, temp->email, temp->mobileNumber, 
            temp->address, temp->balance, temp->mpin, temp->password);
    fprintf(file, "|%d", temp->transactionCount);
    for (int i = 0; i < temp->transactionCount; i++) {
        fprintf(file, "|%s", temp->transactionHistory[i]);
    }
    fprintf(file, "\n");
    writeNodeToFile(temp->right, file);
}

void insertLoadedAccount(char uid[], char name[], int age, char gender[], char maritalStatus[], char pan[], char aadhar[], char email[], char mobile[], char address[], double balance, int pin, char password[], int tCount, char history[5][100]) 
{    struct accounts *newAcc = (struct accounts *)malloc(sizeof(struct accounts));
    
    // Basic Details Copy 
    strcpy(newAcc->uid, uid); 
    strcpy(newAcc->name, name);
    newAcc->age = age;
    strcpy(newAcc->gender, gender);
    strcpy(newAcc->maritalStatus, maritalStatus);
    strcpy(newAcc->pan, pan);
    strcpy(newAcc->aadharNumber, aadhar);
    strcpy(newAcc->email, email);
    strcpy(newAcc->mobileNumber, mobile);
    strcpy(newAcc->address, address);
    newAcc->balance = balance;
    newAcc->mpin = pin;
    strcpy(newAcc->password, password);
    newAcc->transactionCount = tCount;
    
    // Loop for History
    for(int i = 0; i < tCount; i++) {
        strcpy(newAcc->transactionHistory[i], history[i]); 
    }
    
    newAcc->left = newAcc->right = NULL;
    if (root == NULL) {
        root = newAcc;
        return;
    }
    struct accounts* temp = root;
    struct accounts* temp2;
    while (temp != NULL) {
        temp2 = temp;
        if (strcmp(newAcc->uid, temp->uid) > 0)
            temp = temp->right;
        else
            temp = temp->left;
    }
    if (strcmp(newAcc->uid, temp2->uid) > 0)
        temp2->right = newAcc;
    else
        temp2->left = newAcc;
}

void loadBankData() {
    FILE *file = fopen("../data/accounts.txt", "r");
    if (file == NULL) return;
    char uid[20], name[100], gender[20], maritalStatus[20], pan[20];
    char aadhar[20], email[50], mobile[15], address[200], password[50];
    int age, mpin, tCount;
    double balance;
    char history[5][100];
    while (fscanf(file, "%[^|]|%[^|]|%d|%[^|]|%[^|]|%[^|]|%[^|]|%[^|]|%[^|]|%[^|]|%lf|%d|%[^|]|%d", 
                  uid, name, &age, gender, maritalStatus, pan, aadhar, email, mobile, address, &balance, &mpin, password, &tCount) != EOF) {
        
        for (int i = 0; i < tCount; i++) {
            fscanf(file, "|%[^|\n]", history[i]);
        }
        
        insertLoadedAccount(uid, name, age, gender, maritalStatus, pan, aadhar, email, mobile, address, balance, mpin, password, tCount, history);
        
        fgetc(file);
    }

    fclose(file);
    printf("\nVirtuBank Database Loaded Successfully.\n");
}

void saveBankData() {
    FILE *file = fopen("../data/accounts.txt", "w");
    if (file == NULL) {
        printf("Error: Could not open database for saving!\n");
        return;
    }
    writeNodeToFile(root, file);
    fclose(file);
    printf("Bank Database Updated Successfully.\n");
}

struct accounts* minValueNode(struct accounts* node) {
    struct accounts* current = node;
    while (current && current->left != NULL) {
        current = current->left;
    }
    return current;
}

struct accounts* deleteNode(struct accounts* root, char uid[]) {
    if (root == NULL) return root;

    if (strcmp(uid, root->uid) < 0) {
        root->left = deleteNode(root->left, uid);
    }
    else if (strcmp(uid, root->uid) > 0) {
        root->right = deleteNode(root->right, uid);
    }
    else {
        if (root->left == NULL) {
            struct accounts* temp = root->right;
            free(root);
            return temp;
        }
        else if (root->right == NULL) {
            struct accounts* temp = root->left;
            free(root);
            return temp;
        }

        struct accounts* temp = minValueNode(root->right);
        
        struct accounts* original_left = root->left;
        struct accounts* original_right = root->right;

        *root = *temp;

        root->left = original_left;
        root->right = original_right;

        root->right = deleteNode(root->right, root->uid);
    }
    
    return root;
}