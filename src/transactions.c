// Shreya

#include "../include/structure.h"
#include <stdio.h>

// Transfer case

// 1. External Bank

void extTransfer(struct accounts *sender, double amount, int enteredPin) // External transfer function declaration
// sender: our customer
// amount: amt to be entered
// enteredPin: user input pin

{
    if (amount <= 0)
    { // check amt validity
        printf("Invalid Amount\n");
        return;
    }

    if (sender->mpin != enteredPin)
    { // mpin check
        printf("Wrong MPIN\n");
        return;
    }

    if (sender->balance < amount)
    { // balance check
        printf("Insufficient Balance\n");
        return;
    }

    sender->balance -= amount; // deduct amt

    printf("Transfer to External Bank Succesfull!\n");
    printf("Remaining Balance: %.2lf\n", sender->balance);
}

// 2. VIRTU BANK

void intTransfer(struct accounts *sender, struct accounts *receiver, double amount, int enteredPin)
{ // INTERNAL TRANSFER func declaration

    if (amount <= 0)
    { // amt validity
        printf("Invalid Amount\n");
        return;
    }

    if (receiver == NULL)
    { // search for receiver
        printf("Receiver not found\n");
        return;
    }

    if (sender->mpin != enteredPin)
    { // mpin check
        printf("Invalid MPIN\n");
        return;
    }

    if (sender->balance < amount)
    { // balance check
        printf("Insufficient Balance\n");
        return;
    }

    sender->balance -= amount;   // minus amt in sender
    receiver->balance += amount; // add amt in receiver

    printf("Transfer Successful to %s\n", receiver->name);
    printf("Your New Balance: %.2lf\n", sender->balance);
}


