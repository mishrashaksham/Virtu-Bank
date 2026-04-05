// Shreya

#include "../include/structure.h"
#include <stdio.h>
#include<string.h>

//Phase 3

//Storing Transaction + History

void storeTransaction(struct accounts *user, char *primaryUID, char *secondaryUID, double amount, char *type){
    char entry[40];

    //Format: Pri UID - amount - Sec UID
    
    sprintf(entry, "%s-%.2lf %s %s", primaryUID, amount, secondaryUID, type);

    // If less than 5 then shift and add at top
    if(user->transactionCount < 5){
        for(int i = user->transactionCount; i>0; i--){ // har ek i k saath neeche shift hote rahega
            strcpy(user->transactionHistory[i], user->transactionHistory[i-1]); 
        }

        strcpy(user->transactionHistory[0], entry); // new entry add
        user->transactionCount++; //increment 
    }
    else{
        //if already 5 then shift all and bottom one gets deleted
        for(int i = 4; i > 0; i--){
            strcpy(user->transactionHistory[i], user->transactionHistory[i-1]); //indices change
        }

        strcpy(user->transactionHistory[0], entry); //new entry
    }

}


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

    //Sender ka debit store hoga
    storeTransaction(sender, sender->uid, "EXTERNAL", amount, "Debited");
}

// 2. VIRTU BANK

void intTransfer(struct accounts *sender, char UPI[11], double amount, int enteredPin)
{ // INTERNAL TRANSFER func declaration

    if (amount <= 0)
    { // amt validity
        printf("Invalid Amount\n");
        return;
    }
    if (sender->mpin != enteredPin)
    { // mpin check
        printf("Invalid MPIN\n");
        return;
    }
    struct accounts* receiver = searchAcc(UPI);
    if (receiver == NULL)
    { // search for receiver
        printf("Receiver not found\n");
        return;
    }

    if(sender == receiver) 
    { 
        printf("Cannot transfer to yourself!");
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

    //Sender ka debit store
    storeTransaction(sender, sender->uid, receiver->uid, amount, "Debited");

    //Receiver ka Credit store
    storeTransaction(receiver, receiver->uid, sender->uid, amount, "Credited");
}



// SHOW TRANSACTION HISTORY

void showHistory(struct accounts *user){ //Func declare 
    printf("\n     TRANSACTION HISTORY     \n"); //Heading

    if(user->transactionCount == 0){ //Agr koi transaction nhi kiya hoga abhi tk aur direct history khola
        printf("No Transactions yet.\n");
        return;
    }

    for(int i = 0; i < user -> transactionCount; i++){ //Jitna transaction h utna baar chalega loop
        printf("%s\n", user->transactionHistory[i]); //Jaise i ka value badhega ek ek kr k print hoga transaction
    }
}

