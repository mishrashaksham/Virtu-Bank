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
            char uid[11];
            int mpin;

            printf("Enter UID: ");
            scanf("%s", uid);

            struct accounts* user = searchAcc(uid);

            if (user == NULL)
            {
                printf("Invalid UID! Account not found.\n");
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

                    printf("1. External\n");
                    printf("2. Internal\n");
                    printf("3. Back\n");

                    scanf("%d", &tchoice);

                    while (tchoice != 3)
                    {
                        if (tchoice == 1)
                        {
                            double amount;
                            printf("Enter Amount: ");
                            scanf("%lf", &amount);

                            printf("Enter mpin: ");
                            scanf("%d", &mpin);

                            extTransfer(user, amount, mpin);
                        }
                        else if (tchoice == 2)
                        {
                            double amount;
                            char UPI[20];

                            printf("Enter UID: ");
                            scanf("%s", UPI);

                            printf("Enter Amount: ");
                            scanf("%lf", &amount);

                            printf("Enter mpin: ");
                            scanf("%d", &mpin);

                            intTransfer(user, UPI, amount, mpin);
                        }

                        if (tchoice != 3)
                        {
                            printf("1. External\n2. Internal\n3. Back\n");
                            scanf("%d", &tchoice);
                        }
                    }
                }
                else if (option == 2)
                {
                    printf("\nYour Current Balance is: Rs %.2lf\n", user->balance);
                }
            }
            freeTree(root);
            printf("\nSuccessfully exited. Thank You for visiting Virtu-Bank!!! Radhe Radhe!\n");
            break;

        case 4:
            adminLogin();
            break;

        default:
            printf("Invalid choice! Please re-enter.\n");
        }
    }
    return 0;
    }
 }