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

void createAccount(char name[], int age, char gender[], char maritalStatus[], char pan[], char aadhar[], char email[], char mobile[], char address[], double balance, int pin)
{
    struct accounts *newAcc = (struct accounts *)malloc(sizeof(struct accounts));
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
    sprintf(newAcc->upiID, "%s@vb", newAcc->uid);
    newAcc->left = newAcc->right = NULL;
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
        printf(" UPI ID         : %s\n", node->upiID);
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