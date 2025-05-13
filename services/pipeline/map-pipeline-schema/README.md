# tic-mapping-schema

## Create database

```
create database <db>;
create user <user> with password '<pass>';
grant all on database <db> to <user>;
```

## Create schema in the database

```
stack build
```
Run the following command in map-pipeline-schema directory.
```
stack exec tic-mapping-name-exe <inputFile> <outputFile>
```
where the <inputFile> is mappings json file which can be found 
[here](https://github.com/RENCI/ctmd-dashboard/blob/master/mapping.json) 
and outputFile is tables.sql file which is created in the 
ctmd-pipeline container by running the command below.
```
stack exec map-pipeline-schema-exe ../mapping.json ../data/tables.sql
```

The output tables.sql file is a collection of CREATE TABLES 
SQL statements which can be run to create all the tables with 
specified columns and types in the database. In other words, 
the output tables.sql serves as database schema which is 
dynamically created from mappings.json file. If schemas need 
to be changed in the future, mappings.json file should be changed 
along with Item data type definition in [HEALMapping.hs](https://github.com/RENCI/map-pipeline-schema/blob/master/src/PMD/HEALMapping.hs)

