//Prasansa

#include "../include/structure.h"
#include <stdio.h>
#include <stdlib.h>

int main() 
{
    int choice = 0;
    char uid[11];
    int mpin;

    
    while(choice != 3)
    {
        printf("\n------- VIRTU BANK -------\n");
        printf("1. Open Account\n");
        printf("2. Login\n");
        printf("3. Exit\n");
        printf("Enter your choice: ");
        scanf("%d", &choice);

        switch(choice) 
        {
            case 1:
            printf("Selected account is openned\n");
            break;

            case 2:
            printf("Enter uid: ");
            scanf("%s", uid);

            printf("Enter mpin: ");
            scanf("%d", &mpin);
            break;

            case 3:
            printf("Successfully exited\n");
            return 0;

            default:
            printf("Invalid choice\n re-enter \n");
        }
    }
    return 0;
}


        

        