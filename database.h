int addRecord (struct record **, int, char [ ],char [ ]);
void printAllRecords(struct record *);
int findRecord (struct record *, int);
int deleteRecord(struct record **, int);
int writefile(struct record *, char []);
void cleanup(struct record **);
int readfile(struct record **, char []);
