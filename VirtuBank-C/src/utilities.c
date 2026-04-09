// Shruti


#include <stdio.h>
#include <stdlib.h>
#include <time.h>

int generateCaptcha() {        // function to generate random numbers for captcha that will be displayed during acc deletion for user
    int num1, num2, correctSum;

    num1 = rand() % 90 + 10;
    num2 = rand() % 90 + 10;

    printf("  Security Check\n\n");
    printf("What is %d + %d? ", num1, num2); // this line will be displayed to user and user input liya jaega when this function will be called in main 

    correctSum =  num1 + num2; // correct answer joki yaha store hoga for checking from user input during acc deletion 

    return correctSum;  
}   
   // yeh function ka kaam hai random 2 numbers generate karna aur user ko display kar dena aur uske sum ko store kar lena for further use in main when called

