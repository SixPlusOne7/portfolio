/*****************************************************************
//
//  NAME:        Jiayi
//
//  HOMEWORK:    Project1
//
//  CLASS:       ICS 212
//
//  INSTRUCTOR:  Ravi Narayan
//
//  DATE:        November 1, 2024
//
//  FILE:        user_interface.c
//
//  DESCRIPTION:
//   This program manages a simple record system with options to
//   add, print, find, delete, and quit the program.
//
****************************************************************/

#include <stdio.h>
#include <string.h>
#include "record.h"
#include "database.h"

int debugmode = 0; 
struct record * start = NULL;

void getaddress(char address[], int size);

/*****************************************************************
//
//  Function name: main
//
//  DESCRIPTION:   Entry point for the Bank Record Management System.
//                 Provides an interactive menu for the user to manage 
//                 bank records, supporting commands such as adding,
//                 printing, finding, and deleting records. If executed
//                 with the "debug" argument, debug messages will be enabled.
//
//  Parameters:    argc (int)     : Argument count, should be 1 or 2
//                 argv (char*[]) : Argument values, optional second
//                                  argument to enable debug mode
//
//  Return values:  0 : Program executed successfully
//
****************************************************************/

int main(int argc, char *argv[])
{
    int quit = 0;
   
    if (argc > 1)
    {
        if (argc == 2 && strcmp(argv[1], "debug") == 0) 
        {
            debugmode = 1;
            printf("DEBUG MODE\n");
            readfile(&start, "Records");
            
            printf("\nWelcome to the Bank Record Management System!\n");
            printf("Here are your available options:\n");
            printf("--------------------------------------------------------\n");
            printf("add       : Add a new record to the database\n");
            printf("printall  : Display all records currently in the database\n");
            printf("find      : Search for a record using a specific account number\n");
            printf("delete    : Remove a record from the database using the account number as a key\n");
            printf("quit      : Exit the program\n");
            printf("--------------------------------------------------------\n");
        }
        else
        {
            printf("Error: Invalid arguments.\n");
            printf("Usage: ./project1 or ./project1 debug\n");
            quit = 1;
        }
    }
    else
    {
        readfile(&start, "Records");
        printf("\nWelcome to the Bank Record Management System!\n");
        printf("Here are your available options:\n");
        printf("--------------------------------------------------------\n");
        printf("add       : Add a new record to the database\n");
        printf("printall  : Display all records currently in the database\n");
        printf("find      : Search for a record using a specific account number\n");
        printf("delete    : Remove a record from the database using the account number as a key\n");
        printf("quit      : Exit the program\n");
        printf("--------------------------------------------------------\n");
    }

    while (!quit)
    {
        int accountnum = 0;
        char name[25];
        char address[45];
        char option[100]; 

        printf("Please enter your choice (add, printall, find, delete, quit): \n");
        fgets(option, sizeof(option), stdin);
        option[strcspn(option, "\n")] = 0;

        if (strlen(option) != 0 && strncmp(option, "add", strlen(option)) == 0)
        {
            int validInputCount = 0; 
            int maxValidInputs = 6;  
            int iquit1 = 0;          

            if (debugmode == 1)
            {
                printf("\nDEBUG MESSAGE: getting account number\n");
            }

            while (!iquit1 && validInputCount < maxValidInputs)
            {
                printf("Enter account number (up to 6 digits): \n");

                if (scanf("%d", &accountnum) != 1) 
                {
                    printf("Error, enter valid numbers.\n");
                    while (fgetc(stdin) != '\n');  
                }
                else if (accountnum < 0 || accountnum > 999999) 
                {
                    printf("Error, enter a positive integer up to 6 digits.\n");
                } 
                else 
                {
                    validInputCount++; 
                    printf("Account number accepted: %d\n", accountnum);
                    
                    if (debugmode == 1)
                    {
                        printf("\nDEBUG MESSAGE: finished getting accountnum\n");
                    }

                    iquit1 = 1; 
                }
            }

            fgetc(stdin);
            printf("Please enter name: \n");
            if (fgets(name, sizeof(name), stdin) != NULL) 
            {
                if (name[strcspn(name, "\n")] == '\0') 
                {
                    int ch;
                    while ((ch = fgetc(stdin)) != '\n' && ch != EOF);
                } 
                else 
                {
                    name[strcspn(name, "\n")] = '\0';
                }
            }
            getaddress(address, sizeof(address));
            while (fgetc(stdin) != '\n');
            addRecord(&start, accountnum, name, address);
        }
        else if (strncmp(option, "printall", strlen(option)) == 0 && strlen(option) != 0)
        {
            printAllRecords(start);
        }
        else if (strncmp(option, "find", strlen(option)) == 0 && strlen(option) != 0)
        {
            int validInputCount = 0; 
            int maxValidInputs = 6;  
            int iquit1 = 0;          

            if (debugmode == 1)
            {
                printf("\nDEBUG MESSAGE: getting account number\n");
            }

            while (!iquit1 && validInputCount < maxValidInputs)
            {
                printf("Enter account number (up to 6 digits): \n");

                if (scanf("%d", &accountnum) != 1) 
                {
                    printf("Error, enter valid numbers.\n");
                    while (fgetc(stdin) != '\n');  
                }
                else if (accountnum < 0 || accountnum > 999999) 
                {
                    printf("Error, enter a positive integer up to 6 digits.\n");
                } 
                else 
                {
                    validInputCount++; 
                    printf("Account number accepted: %d\n", accountnum);

                    if (debugmode == 1)
                    {
                        printf("\nDEBUG MESSAGE: accountnum: finished getting accountnum\n");
                    }

                    iquit1 = 1; 
                }
            }
 
            while (fgetc(stdin) != '\n');
            findRecord(start, accountnum);
        }
        else if (strncmp(option, "delete", strlen(option)) == 0 && strlen(option) != 0)
        {
            int validInputCount = 0; 
            int maxValidInputs = 6;  
            int iquit1 = 0;          

            if (debugmode == 1)
            {
                printf("\nDEBUG MESSAGE: getting account number\n");
            }

            while (!iquit1 && validInputCount < maxValidInputs)
            {
                printf("Enter account number (up to 6 digits): \n");

                if (scanf("%d", &accountnum) != 1) 
                {
                    printf("Error, enter valid numbers.\n");
                    while (fgetc(stdin) != '\n');  
                }
                else if (accountnum < 0 || accountnum > 999999) 
                {
                    printf("Error, enter a positive integer up to 6 digits.\n");
                } 
                else 
                {
                    validInputCount++; 
                    printf("Account number accepted: %d\n", accountnum);

                    if (debugmode == 1)
                    {
                        printf("\nDEBUG MESSAGE: accountnum: finished getting accountnum\n");
                    }

                    iquit1 = 1; 
                }
            }
            
            while (fgetc(stdin) != '\n');
            deleteRecord(&start, accountnum);
        }
        else if (strncmp(option, "quit", strlen(option)) == 0 && strlen(option) != 0)
        {
            writefile(start, "Records");
            quit = 1;
            printf("Exiting program.\n");
        }
        else
        {
            printf("Invalid option. Please try again.\n");
        }
    }

    cleanup(&start);
    return 0;
}

/*****************************************************************
//
//  Function name: getaddress
//
//  DESCRIPTION:   This function prompts the user to enter an
//                 address and stores it in a character array.
//
//  Parameters:    address (char[]) : Buffer to store the address
//                 size (int) : Size of the buffer
//
//  Return values:  None
//
****************************************************************/

void getaddress(char address[], int size)
{
    int i = 0;
    char ch = 0;
    
    if (debugmode == 1)
    {
        printf("\nDEBUG MESSAGE: getting address\n");
    }

    printf("Please enter the address:\n");
    printf("When finished typing, add a | at the end.\n");
    printf("only accept 43 characters, more than 43 characters will be ignored\n");

    while (i < size - 1 && ch != '|')
    {        
        ch = fgetc(stdin); 
        if (ch != '|')
        {
            address[i++] = (char)ch;
        }
    }
    address[i] = '\0';

    if (debugmode == 1)
    {
        printf("\nAddress entered: \n%s\n", address);
        printf("\nFinished getting address.\n");
    }
}

