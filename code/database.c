/*****************************************************************
//
//  NAME:        Jiayi
//
//  PROJECT:     Project1
//
//  CLASS:       ICS 212
//
//  INSTRUCTOR:  Ravi Narayan
//
//  DATE:        November 1, 2024
//
//  FILE:        database.c
//
//  DESCRIPTION:
//    This file contains the function implementations for managing a 
//    bank record database. The functionality includes adding, finding,
//    printing, and deleting records, as well as reading from and writing 
//    to an external file to maintain database persistence. Additionally,
//    memory management functions ensure the proper allocation and 
//    deallocation of resources used by the records.
//
//    Functions:
//    - addRecord     : Adds a new record to the database
//    - findRecord    : Searches for a record by account number
//    - printAll      : Prints all records in the database
//    - deleteRecord  : Deletes a record using account number as a key
//    - writefile     : Saves the database to an external file
//    - readfile      : Loads records from an external file to the database
//    - cleanup       : Frees all dynamically allocated memory for records
//
****************************************************************/

#include <stdio.h>
#include <stdlib.h>
#include "record.h"
#include <string.h>

extern int debugmode;

/*****************************************************************
//
//  Function name: addRecord
//
//  DESCRIPTION:   Adds a new record to the linked list of records. 
//                 This function takes the pointer to the head of the 
//                 list, an account number, a name, and an address, 
//                 and it creates a new record to be added.
//
//  Parameters:    start (struct record **) : a pointer to the pointer 
//                                             to the head of the linked list
//                 accountno (int)         : the account number to be added
//                 name (char[])           : the name associated with the account
//                 address (char[])        : the address associated with the account
//
//  Return values:  0  : success
//                  -1 : failure
//
****************************************************************/

int addRecord(struct record** start, int uaccountno, char uname[], char uaddress[])
{
    int valueToReturn = 0;
    int accountExists = 0;  /* Flag to track if the account already exists */
    struct record* newRecordPointer;
    struct record* searchTemp;
    struct record* prevPointer = NULL;

    if (debugmode == 1) /* Debug output */
    {
        printf("\nDEBUG MESSAGE:\n");
        printf("The account number received is \n%d\n", uaccountno);
        printf("The account name received is \n%s\n", uname);
        printf("The account address received is \n%s\n", uaddress);
    }

    searchTemp = *start; /* Check if account already exists */
    while (searchTemp != NULL)
    {
        if (searchTemp->accountno == uaccountno)
        {
            printf("Account already exists\n");
            accountExists = 1;
        }
        searchTemp = searchTemp->next;
    }

    if (accountExists == 0)  /* create new record only if no duplicate account was found */
    {
        newRecordPointer = (struct record*) malloc(sizeof(struct record));
        newRecordPointer->accountno = uaccountno;
        strncpy(newRecordPointer->name, uname, 25);
        strncpy(newRecordPointer->address, uaddress, 45);
        newRecordPointer->next = NULL;

        if (*start == NULL || uaccountno < (*start)->accountno) /* Insert at the beginning if the list is empty or uaccountno is smallest */
        {
            newRecordPointer->next = *start;
            *start = newRecordPointer;
        }
        else
        {
            prevPointer = *start; /* Find the correct position to insert in sorted order */
            searchTemp = (*start)->next;

            while (searchTemp != NULL && uaccountno > searchTemp->accountno)
            {
                prevPointer = searchTemp;
                searchTemp = searchTemp->next;
            }

            prevPointer->next = newRecordPointer;
            newRecordPointer->next = searchTemp;
        }
    }
    else
    {
        valueToReturn = -1;  /* Indicate failure if account already exists */
    }

    if (valueToReturn == 0)
    {
        printf("Record successfully added\n");
    }
    
    if (debugmode == 1) /* Debug output */
    {
        printf("DEBUG MESSAGE: addRecord complete.\n");
    }

    return valueToReturn;
}

/*****************************************************************
//
//  Function name: printAllRecords
//
//  DESCRIPTION:   Prints all records in the linked list. This function 
//                 traverses through the linked list of records and 
//                 prints the details of each record.
//
//  Parameters:    start (struct record *) : pointer to the head of the linked list
//
//  Return values:  void
//
****************************************************************/

void printAllRecords(struct record* start)
{
    struct record* current = start;

    if (debugmode == 1)
    {
        printf("\nDEBUG MESSAGE: printAllRecords called, printing started\n");
    }

    if (current == NULL)
    {
        printf("\nNo records to display. The list is empty.\n");
    }
    else
    {
        printf("\nPrinting all records:\n");
        while (current != NULL)
        {
            printf("\nAccount Number: %d\n", current->accountno);
            printf("Name: %s\n", current->name);
            printf("Address:\n%s\n", current->address);
            current = current->next;
        }
        printf("\nAll records have been printed.\n");
    }

    if (debugmode == 1)
    {
        printf("DEBUG MESSAGE: printAllRecords complete.\n\n");
    }
}

/*****************************************************************
//
//  Function name: findRecord
//
//  DESCRIPTION:   Searches for a record with a given account number. 
//                 If the record is found, the account details are printed.
//
//  Parameters:    start (struct record *) : pointer to the head of the linked list
//                 accountno (int)         : the account number to search for
//
//  Return values:  0  : success (record found)
//                  -1  : failure (record not found)
//
****************************************************************/

int findRecord(struct record* start, int accountno)
{
    struct record* current = start;
    int found = -1; 

    if (debugmode == 1)
    {
        printf("\nDEBUG MESSAGE: findRecord called, searching for account number %d\n", accountno);
    }

    while (current != NULL && found == -1)
    {
        if (current->accountno == accountno)
        {
            printf("Record found:\n");
            printf("Account Number: %d\n", current->accountno);
            printf("Name: %s\n", current->name);
            printf("Address: %s\n", current->address);
            found = 0;
        }
        else
        {
            current = current->next;
        }
    }

    if (found == -1)
    {
        printf("No record found with account number %d.\n", accountno);
    }

    if (found == 0)
    {
        printf("Record successfully found\n");
    }

    if (debugmode == 1)
    {
        printf("DEBUG MESSAGE: findRecord complete.\n\n");
    }

    return found; 
}

/*****************************************************************
//
//  Function name: deleteRecord
//
//  DESCRIPTION:   Removes a record with a specified account number 
//                 from the linked list. The record is deallocated 
//                 and the list is updated accordingly.
//
//  Parameters:    start (struct record **) : pointer to the pointer 
//                                             to the head of the linked list
//                 accountno (int)         : the account number of the record to delete
//
//  Return values:  0  : success
//                  -1  : failure (record not found or could not be deleted)
//
****************************************************************/

int deleteRecord(struct record **start, int uaccountno)
{
    struct record *searchTemp = *start;
    struct record *prevPointer = NULL;
    int valueToReturn = -1;  /* Assume no match will be found */
    
    if (debugmode == 1)
    {
        printf("\nDEBUG MESSAGE: Attempting to delete record with account number %d...\n", uaccountno);
    }
    if (*start == NULL)
    {
        printf("Error: The list is empty. No records to delete.\n");
        valueToReturn = -1;
    }
    else if ((*start)->accountno == uaccountno)  /* Check if the first record matches */
    {
        *start = (*start)->next;  /* Update the start pointer to skip the first record */
        free(searchTemp);          /* Free the deleted record */
        printf("Record with account number %d deleted successfully (first record).\n", uaccountno);
        valueToReturn = 0;         /* Indicate success */
    }
    else
    {
        /* Traverse the list to find the matching record */
        while (searchTemp != NULL)
        {
            if (searchTemp->accountno == uaccountno)
            {
                prevPointer->next = searchTemp->next;  /* Bypass the record to delete */
                free(searchTemp);                     
                printf("Record with account number %d deleted successfully.\n", uaccountno);
                valueToReturn = 0;                     
                searchTemp = NULL;                     
            }
            else
            {
                prevPointer = searchTemp;
                searchTemp = searchTemp->next;
            }
        }

        /* If no match was found */
        if (valueToReturn == -1)
        {
            printf("Error: No record found with account number %d.\n", uaccountno);
        }
    }

    printf("DEBUG MESSAGE: Deletion process complete.\n\n");
    return valueToReturn;
}

/*****************************************************************
 *
 *  Function name: writefile
 *
 *  DESCRIPTION:   Writes all records from the linked list to a
 *                 specified file.
 *
 *  Parameters:    start (struct record *) : pointer to the head 
 *                                            of the linked list
 *                 filename (char[])       : name of the file to write to
 *
 *  Return values:  0  : success
 *                  -1 : failure (could not open the file)
 *
 ****************************************************************/

int writefile(struct record *start, char filename[])
{
   
    int returnValue = -1;
    struct record *current;
    FILE *outfile = fopen(filename, "w");

    if (debugmode == 1)
    {
     	printf("\nDEBUG MESSAGE: writing to file with the filename %s\n", filename);
    }

    if (outfile != NULL)
    {
        returnValue = 0;
        current = start;

        while (current != NULL)
        {
            fprintf(outfile, "%d\n", current->accountno);
            fprintf(outfile, "%s\n", current->name);
            fprintf(outfile, "%s|", current->address);
            current = current->next;
        }

        fclose(outfile);
    }

    if (debugmode == 1)
    {
        printf("DEBUG MESSAGE: File writing complete.\n\n");
    }

    return returnValue;
}

/*****************************************************************
//
//  Function name: cleanup
//
//  DESCRIPTION:   This function deallocates all nodes in the linked
//                 list, freeing the memory associated with each 
//                 record and setting the head pointer to NULL.
//
//  Parameters:    start (struct record **) : pointer to the pointer
//                                            to the head of the linked list
//
//  Return values: None
//
****************************************************************/

void cleanup(struct record **start)
{
    struct record *current = *start;
    struct record *next;

    if (debugmode == 1)
    {
        printf("\nDEBUG MESSAGE: starting cleanup\n");
    }

    while (current != NULL)
    {
        next = current->next;
        free(current);
        current = next;
    }

    *start = NULL;

    if (debugmode == 1)
    {
        printf("DEBUG MESSAGE: finished cleanup\n\n");
    }
}

/*****************************************************************
//
//  Function name: readfile
//
//  DESCRIPTION:   reads from the file written by writefile and 
//                 stores the records into a linked list to be manipulated
//                 by user interface options
//
//  Parameters:    start (record**) : The pointer to the starting pointer
//                 accountnum (int) : The account number to delete
//
//  Return values:  0 : file read successfully
//                  -1 : file was not read successfully
//
 ****************************************************************/

int readfile(struct record **start, char filename[])
{
    int returnValue = -1;
    int accountnum;
    FILE *infile = fopen(filename, "r");

    if (debugmode == 1)
    {
        printf("\nDEBUG MESSAGE: reading from file with the filename %s\n", filename);
    }

    if (infile != NULL)
    {
        while (fscanf(infile, "%d", &accountnum) == 1)  /* stop reading till first nonmatch */
        {
            char name[25];
            char address[45];
            int i = 0;
            char c;

            fgetc(infile); /*eat up enter*/
            fgets(name, sizeof(name), infile);
            name[strcspn(name, "\n")] = 0;
            while ((c = fgetc(infile)) != '|' && c != EOF)
            {
                if (i < sizeof(address) - 1)
                {
                    address[i++] = c;
                }
            }
            address[i] = '\0';

            addRecord(start, accountnum, name, address);
            returnValue = 0;
        }
        fclose(infile);
    }

    if (debugmode == 1)
    {
        printf("\nDEBUG MESSAGE: finished reading from file\n\n");
    }
    
    return returnValue;
}


