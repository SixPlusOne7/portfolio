struct record
{
    int                accountno;
    char               name[25];
    char               address[45];
    struct record*     next;
};
