# react jobly notes (frontend)

## how to use this repository

### start server in development mode

1. Start your `psql` service with the command `sudo service postgresql start`
    - you will be asked for your `psql` account username and password
    - if activated successfully the following message will display: `* Starting PostgreSQL 14 database server`
- other helpful `psql` commands:
    - To stop the PostgreSQL service: `sudo service postgresql stop`
    - To restart the PostgreSQL service: `sudo service postgresql restart`
    - Once the service is started, you can access the PostgreSQL interactive terminal by running: `psql -U your_username -d your_database`
    - Replace `your_username` with your PostgreSQL username and `your_database` with the name of the database you want to connect to.
    - `/l` lists all databases.
    - `/c db_name` connects to a database (replace `db_name` with the name of the database).
    - once connected to the database you can run `\dt` to list each of the tables within the database.
```bash
           List of relations
 Schema |     Name     | Type  | Owner 
--------+--------------+-------+-------
 public | applications | table | haus
 public | companies    | table | haus
 public | jobs         | table | haus
 public | users        | table | haus
(4 rows)
```
    - once connected to the database you can run the `sql` statement `SELECT * FROM users` to list all the users that registered with the application.
    - Running through these steps is helpful to check that the database is correctly linked to the frontend and backend.

2. while located in the `backend` folder within your VSC terminal run the command `npm run dev`.  This will run the script: `nodemon server.js`.  If the server starts successfully the following output should display in your terminal:

```bash
haus@LAPTOP-S3QG7NKP:~/springboard_bootcamp_dec_2023/react-jobly/backend$ npm run dev

> jobly-solution@2.0.0 dev
> nodemon server.js

[nodemon] 2.0.4
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,json
[nodemon] starting `node server.js`
Jobly Config:
SECRET_KEY: INTENTIONALLY_OMITTED
PORT: 3001
BCRYPT_WORK_FACTOR 12
Database: postgresql://INTENTIONALLY_OMITTED_USERNAME:INTENTIONALLY_OMITTED_PASSWORD@localhost:5432/jobly
---
Started on http://localhost:3001
```