// Shaksham

#include "../include/structure.h"
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

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

// int main()
// {
//     srand(time(NULL));
//     char meraNayaID[11];
//     generateUID(meraNayaID);
//     printf("Success! Tera VirtuBank UID hai: %s\n", meraNayaID);
//     return 0;
// }