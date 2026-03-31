#include "../include/structure.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

int main()
{
    srand(time(NULL));
    int choice = 0;

    while (choice != 3)
    {
        printf("\n------- RADHE RADHE -------\n");
        printf("----WELCOME TO VIRTU-BANK----\n");
        printf("1. Login\n");
        printf("2. Sign in\n");
        printf("3. Exit\n");
        printf("Enter your choice: ");
        scanf("%d", &choice);

        switch (choice)
        {
        case 1:
        {
            char uid[11], password[20];
            int mpin;

            printf("Enter UID: ");
            scanf("%s", uid);

            struct accounts* user = searchAcc(uid);

            if (user == NULL)
            {
                printf("Invalid UID! Account not found.\n");
                break;
            }

            printf("Enter Password");
            scanf("%s", password);

            if(strcmp(user->password, password)!=0){
                printf("Invalid Password");
                break;
            }

            printf("Enter MPIN: ");
            scanf("%d", &mpin);

            if (user->mpin != mpin)
            {
                printf("Wrong MPIN! Authentication Failed.\n");
                break;
            }

            int option = 0;
            while (option != 3)
            {
                printf("\n--- USER DASHBOARD ---\n");
                printf("1. Transaction\n");
                printf("2. Check Balance\n");
                printf("3. Logout\n");
                printf("Select option: ");
                scanf("%d", &option);

                if (option == 1)
                {
                    int tchoice = 0;
                    printf("\n1. External\n2. Internal\n3. Back\nSelect: ");
                    scanf("%d", &tchoice);

                    while (tchoice != 3)
                    {
                        if (tchoice == 1)
                        {
                            double amount;
                            printf("Enter Amount: ");
                            scanf("%lf", &amount);
                            printf("Confirm mpin: ");
                            scanf("%d", &mpin);
                            extTransfer(user, amount, mpin);
                        }
                        else if (tchoice == 2)
                        {
                            double amount;
                            char targetUID[20];
                            printf("Enter Receiver UID: ");
                            scanf("%s", targetUID);
                            printf("Enter Amount: ");
                            scanf("%lf", &amount);
                            printf("Confirm mpin: ");
                            scanf("%d", &mpin);
                            intTransfer(user, targetUID, amount, mpin);
                        }
                        
                        printf("\n1. External\n2. Internal\n3. Back\nSelect: ");
                        scanf("%d", &tchoice);
                    }
                }
                else if (option == 2)
                {
                    printf("\nYour Current Balance is: Rs %.2lf\n", user->balance);
                }
            }
            break;
        }

        case 2:
        {
            char name[15], gender[10], maritalStatus[11];
            char pan[11], aadharNumber[13], email[50];
            char mobileNumber[11], address[100], password[20];
            int age, mpin;
            double balance = 5000;

            printf("Enter Name: ");
            scanf(" %[^\n]", name);
            printf("Enter Age: ");
            scanf(" %d", &age);
            printf("Enter Gender: ");
            scanf(" %s", gender);
            printf("Enter Marital Status: ");
            scanf(" %[^\n]", maritalStatus);
            printf("Enter PAN: ");
            scanf(" %[^\n]", pan);
            printf("Enter Aadhar: ");
            scanf(" %[^\n]", aadharNumber);
            printf("Enter Email: ");
            scanf(" %[^\n]", email);
            printf("Enter Mobile: ");
            scanf(" %[^\n]", mobileNumber);
            printf("Enter Address: ");
            scanf(" %[^\n]", address);
            printf("Set your Password: ");
            scanf(" %[^\n]", password);
            printf("Set your mpin: ");
            scanf(" %d", &mpin);
            createAccount(name, age, gender, maritalStatus, pan, aadharNumber, email, mobileNumber, address, balance, mpin, password);
            printf("\nAccount created successfully! Kindly login now.\n");
            break;
        }

        case 3:
            freeTree(root);
            printf("\nSuccessfully exited. Thank You for visiting Virtu-Bank!!! Radhe Radhe!\n");
            break;

        case 4:
            printf("\n--- ADMIN PANEL (All Accounts) ---\n");
            displayAllAccounts(root);
            break;

        default:
            printf("Invalid choice! Please re-enter.\n");
        }
    }
    return 0;
}


//Password input for login
// Initial balance...