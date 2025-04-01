# Testing SNACRIS Routes Using Postman

**Table of Contents**

- [Testing SNACRIS Routes Using Postman](#testing-snacris-routes-using-postman)
  - [Miscellaneous Notes/Takeaways](#miscellaneous-notestakeaways)
    - [Notarious and JWT Tokens](#notarious-and-jwt-tokens)
    - [Frontend  Routing Logic, `/register` \& JWTs](#frontend--routing-logic-register--jwts)
  - [Helpful Notes](#helpful-notes)
  - [`Backend/routes/auth.js`](#backendroutesauthjs)
    - [`post("/register"` (Register User | Step One)](#postregister-register-user--step-one)
      - [Explanation](#explanation)
      - [Postman Notes](#postman-notes)
    - [`post("/token"` (Authenticate User | Step Two)](#posttoken-authenticate-user--step-two)
      - [Explanation](#explanation-1)
      - [Postman Notes](#postman-notes-1)
  - [`Backend/routes/users.js`](#backendroutesusersjs)
    - [`patch("/:username"` (Update User | Step Three)](#patchusername-update-user--step-three)
      - [Explanation](#explanation-2)
      - [Postman Notes](#postman-notes-2)
    - [`delete("/:username"` (Delete User | Step Four)](#deleteusername-delete-user--step-four)
      - [Explanation](#explanation-3)
      - [Postman Notes](#postman-notes-3)
    - [Step Three - Request record from ACRIS Real Property API](#step-three---request-record-from-acris-real-property-api)
    - [Step Four - Save record by user to DB](#step-four---save-record-by-user-to-db)
    - [Step One - Register New User (v2)](#step-one---register-new-user-v2)
    - [Step Two - Authenticate Regular User (v2)](#step-two---authenticate-regular-user-v2)
    - [Step Three - Get record from ACRIS Real Property API (v2)](#step-three---get-record-from-acris-real-property-api-v2)
    - [Step Four - Save record by user to db (v2)](#step-four---save-record-by-user-to-db-v2)
    - [`addRecordByUser` route overview](#addrecordbyuser-route-overview)
    - [Step Five - Retrieve All Records By User from DB (v2)](#step-five---retrieve-all-records-by-user-from-db-v2)
    - [Step Six - Retrieve Record By User and `document_id` from DB (v2)](#step-six---retrieve-record-by-user-and-document_id-from-db-v2)
    - [Step Seven - Search for records from User by `document_id`, `record_type` and `recorded_borough` from DB (v2)](#step-seven---search-for-records-from-user-by-document_id-record_type-and-recorded_borough-from-db-v2)
    - [Step Eight - Delete record from User by `document_id` from DB (v2)](#step-eight---delete-record-from-user-by-document_id-from-db-v2)
    - [Step Nine - Authenticate User as Admin (v2)](#step-nine---authenticate-user-as-admin-v2)
    - [Step Ten - Save Record by Admin to DB (v2)](#step-ten---save-record-by-admin-to-db-v2)
  - [Duplicate Record Handling](#duplicate-record-handling)
    - [Relationship Between Normalizing and Validating Data](#relationship-between-normalizing-and-validating-data)
    - [Step Eleven - Retrieve All Records By Admin from DB (v2)](#step-eleven---retrieve-all-records-by-admin-from-db-v2)
    - [Step Twelve - Retrieve Record By Admin and `document_id` from DB (v2)](#step-twelve---retrieve-record-by-admin-and-document_id-from-db-v2)
    - [Step Thirdteen - Search for records from Admin by `document_id`, `record_type` and `recorded_borough` from DB (v2)](#step-thirdteen---search-for-records-from-admin-by-document_id-record_type-and-recorded_borough-from-db-v2)
    - [Step Fourteen - Delete record from Admin by `document_id` from DB (v2)](#step-fourteen---delete-record-from-admin-by-document_id-from-db-v2)

## Miscellaneous Notes/Takeaways

### Notarious and JWT Tokens

The JWT token is created using the combination of a user's username, isAdmin boolean value and a SECRET_KEY.  For Notarious technically we could create JWT tokens based on a user's "electronic notary" status (e.g. isElectronicNotary) which would be connected to an identity verification process handled by ID.ME.  Ask a cyber security professional if this is a viable option and what the "best practice" would be for Notarious' use case.

[Back to TOC](#testing-snacris-routes-using-postman)

### Frontend  Routing Logic, `/register` & JWTs

You are correct in observing that the `/register` route issues a JWT token, and in theory, this token could be used to immediately log the user in after registration without requiring them to click the "Log In" button. However, the behavior you described (being redirected to the landing page and then needing to log in) is likely due to how the website's front-end is implemented, not an issue with the `/register` route itself.

**Why Does the /register Route Issue a JWT Token?**
The `/register` route is designed to both register the user and authenticate them by issuing a JWT token. This is a common practice because:

  1. Seamless User Experience: After registering, the user can immediately access protected resources without needing to log in again.
  2. Consistency: The `/register` route behaves similarly to the /token route by issuing a token, which simplifies the back-end logic for handling authentication.

**Why Might a Website Require Logging In After Registration?**
The behavior you experienced (being redirected to the landing page and needing to log in) could be due to several reasons:

  1. **Front-End Implementation**: The front-end may not be designed to automatically use the token returned by the `/register` route. Instead, it may redirect the user to the landing page and expect them to log in manually.
  2. **Security Considerations**: Some developers prefer to separate registration and login processes to ensure the user explicitly logs in after registration. This can help confirm that the user remembers their credentials and prevent accidental misuse of the account.
  3. **Token Handling**: The front-end may not store the token returned by the `/register` route (e.g., in local storage or cookies), which means the user must log in again to obtain a token.

**Can the `/register` Route Be Used to Automatically Log In the User?**
Yes, the `/register` route can be used to automatically log in the user. Here's how it could work:

  1. After the user registers, the front-end receives the JWT token returned by the /register route.
  2. The front-end stores the token (e.g., in local storage, session storage, or a cookie).
  3. The front-end redirects the user to the landing page or another protected page, and the token is used to authenticate the user for subsequent requests.

This approach eliminates the need for the user to log in again after registering, providing a smoother user experience.

**Best Practices for Using JWT Tokens**

  1. **Single Source of Truth**: Ensure that the front-end consistently uses the token returned by either the `/register` or `/token` route for authentication.
  2. **Token Storage**: Store the token securely (e.g., in HTTP-only cookies for better security or local storage for simplicity).
  3. **Clear Communication**: If the `/register` route issues a token, the front-end should be designed to handle it appropriately. If the front-end does not use the token, there is no point in issuing it.

**Conclusion**
The `/register` route is designed to issue a JWT token so that the user can be immediately authenticated. If the front-end does not use this token and requires the user to log in again, it is likely a design choice or oversight in the front-end implementation. You are correct that the `/register` route could be used to automatically log in the user, and implementing this would provide a smoother user experience.

[Back to TOC](#testing-snacris-routes-using-postman)

## Helpful Notes

Start the server locally on `http://localhost:3001/` by running the command: `npm run dev`.

[Back to TOC](#testing-snacris-routes-using-postman)

## `Backend/routes/auth.js`

### `post("/register"` (Register User | Step One)

#### Explanation

The `/register` route is used to register and authenticate new users by accepting their `username`, `password`, `firstName`, `lastName`, `email`, and an optional `isAdmin` value (defaulting to `false`).

1. **Validation**: It validates the incoming user data using the `userRegister.json` schema. This ensures that all required fields are present, have the correct data types, and meet constraints like string length and email format.

2. **Registration**: It calls the `User.register` method from the `user.js` model. This method:
   - Executes a SQL `SELECT` query to check for duplicate usernames in the database. If a duplicate is found, it throws a `BadRequestError`.
   - Hashes the provided password using bcrypt with the configured `BCRYPT_WORK_FACTOR`.
   - Executes a SQL `INSERT` query to add the new user to the database.
   - Returns the newly created user's data (excluding the password).

3. **Token Creation**: Similar to the `/token` route, it calls the `createToken` helper function to generate a JWT token for the new user.

4. **Response**: If all steps succeed, the route returns the generated JWT token to the user.

5. **When/Why Used**: This route is executed when an unregistered user clicks the "Register" button on the website. It allows the user to create an account and immediately receive a token for accessing protected resources.

#### Postman Notes

- [x] tested again on 3/21/25 with a `201 Created` status code.
- json body:

```json
{
  "username": "march21user",
  "password": "march21user",
  "firstName": "march21",
  "lastName": "user",
  "email": "march21@example.com"
}
```

- json response:

```json
{
"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im1hcmNoMjF1c2VyIiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTc0MjU4OTU4Mn0.PwVdoCKVU-TTCMi7ZKs-xQOeAq2sVMuwVkDDyk-58rc"
}
```

First I tested the `Register new user, return JWT token` POST request using the `json` body below which returned the token below.

- File Name: `Backend/routes/auth.js`
- Route Declaration: `router.post("/register", async function (req, res, next) { ... });`
- Request Type: **POST**
- Request URL: `http://localhost:3001/auth/register`
- Request Headers: None
- Request Body:

```json
{
  "username": "regularUser987",
  "password": "userPass123",
  "firstName": "Regular",
  "lastName": "User",
  "email": "regular@example.com"
}
```

Post response body

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJlZ3VsYXJVc2VyOTg3IiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTczNjYyMDM3OH0.JXXmUeY6eckizyf6SendfzuJ79pZUSRtvjx6OJiKJDc"
}
```

[Back to TOC](#testing-snacris-routes-using-postman)

### `post("/token"` (Authenticate User | Step Two)

#### Explanation

The `/token` route is used to authenticate registered users by accepting their `username` and `password` from the front end.

1. **Validation**: It validates the incoming `username` and `password` using the `\userAuth.json` schema. This ensures that both fields are present and are strings.

2. **Authentication**: It calls the `User.authenticate` method from the `user.js` model. This method:
   - Executes a SQL `SELECT` query to find the user in the database by their `username`.
   - Compares the provided password (hashed using bcrypt) with the stored hashed password in the database. If the passwords match, the method returns the user's data (excluding the password). If they don't match or the user is not found, it throws an `UnauthorizedError`.

3. **Token Creation**: It calls the `createToken` helper function to generate a JWT token. This function:
  - Creates a payload containing the `username` and the `isAdmin` property of the user.
  - Signs the payload using the `SECRET_KEY` from the `.env` file.

4. **Response**: If all steps succeed, the route returns the generated JWT token to the user. This token can be used for subsequent authenticated requests.

5. **When/Why Used**: This route is executed when a registered user clicks the "Log In" button on the website. It allows the user to authenticate and receive a token for accessing protected resources.

#### Postman Notes

- File Name: `Backend/routes/auth.js`
- Route Declaration: `router.post("/token", async function (req, res, next) { ... });`
- Request Type: **POST**
- Request URL: `http://localhost:3001/auth/token`
- Request Headers: None
- Request Body:

```json
{
  "username": "regularUser987",
  "password": "userPass123"
}
```

- Response Body:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJlZ3VsYXJVc2VyOTg3IiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTczNjYyMDk4NH0.8BRigc3DuFGBCqBa6751kjCjy91-oS43uNRqdKEZGtY"
}
```

[Back to TOC](#testing-snacris-routes-using-postman)

## `Backend/routes/users.js`

### `patch("/:username"` (Update User | Step Three)

#### Explanation

1. **Validation**
   - The route validates the incoming request body using the `userUpdate.json` schema. This schema ensures that the data being updated conforms to the expected format:
     - `password`: A string between 5 and 20 characters.
     - `firstName`: A string between 1 and 30 characters.
     - `lastName`: A string between 1 and 30 characters.
     - `email`: A string between 6 and 60 characters, formatted as a valid email.
   - If the validation fails, a BadRequestError is thrown with details about the validation errors.

2. **Authorization**
   - The route uses the `ensureCorrectUserOrAdmin` middleware to ensure that only the user themselves or an admin can access this route. If the user is not authorized, an `UnauthorizedError` is raised.

3. **Update Logic**
  - The route calls the `User.update` method from the `user.js` model. This method:
    - Hashes the new password (if provided) using bcrypt with the configured `BCRYPT_WORK_FACTOR`.
    - Uses the `sqlForPartialUpdate` helper function to dynamically generate the SQL `SET` clause for the update query based on the provided fields.
    - Executes a SQL `UPDATE` query to update the user's data in the database.
    - Returns the updated user data (excluding the password).

4. **Response**
   - If the update is successful, the route returns the updated user data in the response. The response includes:
     - `username`
     - `firstName`
     - `lastName`
     - `email`
     - `isAdmin`

5. **When/Why Used**
  - This route is executed when (1) a user wants to update their own profile information (e.g., change their password, email, or name) by pressing the "Edit Profile" button or (2) an admin wants to update a user's information for administrative purposes.

#### Postman Notes

- File Name: `Backend/routes/users.js`
- Route Declaration: `router.patch("/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {`
- Request Type: **PATCH**
- Request URL: `http://localhost:3001/users/march21user`
- Request Headers: None
- Request Body:

```json
{
  "password": "march21user",
  "firstName": "march23",
  "lastName": "user",
  "email": "march21@example.com"
}
```

- Response Body:

```json
{
    "user": {
        "username": "march21user",
        "firstName": "march23",
        "lastName": "user",
        "email": "march21@example.com",
        "isAdmin": false
    }
}
```

[Back to TOC](#testing-snacris-routes-using-postman)

### `delete("/:username"` (Delete User | Step Four)

#### Explanation

The `DELETE /:username` route is used to delete a user from the database. This route allows either the user themselves or an admin to delete the user account. Below is a detailed explanation of how this route works:

1. **Authorization**:
   - The route uses the `ensureCorrectUserOrAdmin` middleware to ensure that only the user themselves or an admin can access this route. If the user is not authorized, an `UnauthorizedError` is raised.

2. **Deletion Logic**:
   - The route calls the `User.remove` method from the `user.js` model. This method:
     - Executes a SQL `DELETE` query to remove the user from the database based on their `username`.
     - If no user is found with the given `username`, it throws a `NotFoundError`.

3. **Response**:
   - If the deletion is successful, the route returns a JSON response indicating the `username` of the deleted user:

```json
{ "deleted": "username" }
```

4. **When/Why Used**
   - This route is executed when:
     - A user wants to delete their own account (e.g., by clicking a "Delete Account" button on the front end).
     - An admin wants to delete a user's account for administrative purposes (e.g., to remove inactive or inappropriate accounts).

#### Postman Notes

- tested on 3/23/25 and received a `200 OK` status code
- File Name: `Backend/routes/users.js`
- Route Declaration: `router.delete("/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {`
- Request Type: **DELETE**
- Request URL: `http://localhost:3001/users/march21user`
- Request Headers: None
- Response Body: None
- Response Body:

```json
{
    "deleted": "march21user"
}
```
---
---
---

### Step Three - Request record from ACRIS Real Property API

I obtained the ACRIS data below from using the `Get Real Property Master Data` **GET** request in Postman. This will go in the body of the `addRecordByUser` route in the next step.

```json
{
  "document_id": "FT_3160005545216",
  "record_type": "A",
  "recorded_borough": "3",
  "doc_type": "DEED",
  "document_date": "1997-01-22T00:00:00.000",
  "document_amt": "0",
  "recorded_datetime": "1997-03-19T00:00:00.000",
  "modified_date": "1997-03-26T00:00:00.000",
  "reel_yr": "1997",
  "reel_nbr": "3902",
  "reel_pg": "1952",
  "percent_trans": "0",
  "good_through_date": "2015-07-31T00:00:00.000"
}
```

[Back to TOC](#testing-snacris-routes-using-postman)

### Step Four - Save record by user to DB

- File Name: `masterRealPropDbRoutes.js`
- Route Declaration: `router.post("/addRecordByUser", ensureLoggedIn, async function (req, res, next) {`
- Request Type: **POST**
- Request URL: `http://localhost:3001/db/real-property-master/addRecordByUser`
- Request Headers: `Authorization` / `Bearer <token>`
- Request Body:

```json
{
  "document_id": "FT_3160005545216",
  "record_type": "A",
  "recorded_borough": "3",
  "doc_type": "DEED",
  "document_date": "1997-01-22T00:00:00.000",
  "document_amt": "0",
  "recorded_datetime": "1997-03-19T00:00:00.000",
  "modified_date": "1997-03-26T00:00:00.000",
  "reel_yr": "1997",
  "reel_nbr": "3902",
  "reel_pg": "1952",
  "percent_trans": "0",
  "good_through_date": "2015-07-31T00:00:00.000"
}
```

**NB** I received the error from Postman and from the terminal of my VSC below after making the Post request above.

Postman error:

```
{
    "error": {
        "message": [
            "instance.recorded_borough is not of a type(s) integer",
            "instance.recorded_borough is not one of enum values: 1,2,3,4,5",
            "instance.document_date does not conform to the \"date\" format",
            "instance.document_amt is not of a type(s) number",
            "instance.recorded_datetime does not conform to the \"date-time\" format",
            "instance.modified_date does not conform to the \"date\" format",
            "instance.reel_yr is not of a type(s) integer",
            "instance.reel_nbr is not of a type(s) integer",
            "instance.reel_pg is not of a type(s) integer",
            "instance.percent_trans is not of a type(s) number",
            "instance.good_through_date does not conform to the \"date\" format",
            "instance requires property \"crfn\""
        ],
        "status": 400
    }
}
```

VSC Terminal Error:

```bash
Error: instance.recorded_borough is not of a type(s) integer,instance.recorded_borough is not one of enum values: 1,2,3,4,5,instance.document_date does not conform to the "date" format,instance.document_amt is not of a type(s) number,instance.recorded_datetime does not conform to the "date-time" format,instance.modified_date does not conform to the "date" format,instance.reel_yr is not of a type(s) integer,instance.reel_nbr is not of a type(s) integer,instance.reel_pg is not of a type(s) integer,instance.percent_trans is not of a type(s) number,instance.good_through_date does not conform to the "date" format,instance requires property "crfn"
    at /home/haus/springboard_bootcamp_dec_2023/snacris--backend/Backend/routes/db/acris/real-property/masterRealPropDbRoutes.js:66:19
    at Layer.handle [as handle_request] (/home/haus/springboard_bootcamp_dec_2023/snacris--backend/Backend/node_modules/express/lib/router/layer.js:95:5)
    at next (/home/haus/springboard_bootcamp_dec_2023/snacris--backend/Backend/node_modules/express/lib/router/route.js:149:13)
    at ensureLoggedIn (/home/haus/springboard_bootcamp_dec_2023/snacris--backend/Backend/middleware/auth.js:39:12)
    at Layer.handle [as handle_request] (/home/haus/springboard_bootcamp_dec_2023/snacris--backend/Backend/node_modules/express/lib/router/layer.js:95:5)
    at next (/home/haus/springboard_bootcamp_dec_2023/snacris--backend/Backend/node_modules/express/lib/router/route.js:149:13)
    at Route.dispatch (/home/haus/springboard_bootcamp_dec_2023/snacris--backend/Backend/node_modules/express/lib/router/route.js:119:3)
    at Layer.handle [as handle_request] (/home/haus/springboard_bootcamp_dec_2023/snacris--backend/Backend/node_modules/express/lib/router/layer.js:95:5)
    at /home/haus/springboard_bootcamp_dec_2023/snacris--backend/Backend/node_modules/express/lib/router/index.js:284:15
    at Function.process_params (/home/haus/springboard_bootcamp_dec_2023/snacris--backend/Backend/node_modules/express/lib/router/index.js:346:12)
POST /db/real-property-master/addRecordByUser 400 713 - 6.802 ms
```

Postman error:

```json
{
  "error": {
    "message": [
      "instance.recorded_borough is not of a type(s) integer",
      "instance.recorded_borough is not one of enum values: 1,2,3,4,5",
      "instance.document_date does not conform to the \"date\" format",
      "instance.document_amt is not of a type(s) number",
      "instance.recorded_datetime does not conform to the \"date-time\" format",
      "instance.modified_date does not conform to the \"date\" format",
      "instance.reel_yr is not of a type(s) integer",
      "instance.reel_nbr is not of a type(s) integer",
      "instance.reel_pg is not of a type(s) integer",
      "instance.percent_trans is not of a type(s) number",
      "instance.good_through_date does not conform to the \"date\" format",
      "instance requires property \"crfn\""
    ],
    "status": 400
  }
}
```

**Why did the error occur?**

The errors I encountered indicate that the data I provided in the JSON body does not conform to the schema defined in `masterRealPropNew.json`. How to fix them:

**Errors and Fixes**

1. `recorded_borough`:

- Error: "instance.recorded_borough is not of a type(s) integer"
- [x] Fix: Change `"recorded_borough": "3"` to `"recorded_borough": 3` (remove quotes to make it an integer).

2. `document_date`:

- Error: "instance.document_date does not conform to the \"date\" format"
- [x] Fix: Change `"document_date": "1997-01-22T00:00:00.000"` to `"document_date": "1997-01-22"` (use the correct date format).

3. `document_amt`:

- Error: "instance.document_amt is not of a type(s) number"
- [x] Fix: Change `"document_amt": "0"` to `"document_amt": 0` (remove quotes to make it a number).

4. `recorded_datetime`:

- Error: "instance.recorded_datetime does not conform to the \"date-time\" format"
- [x] Change `"recorded_datetime": "1997-03-19T00:00:00.000"` to `"recorded_datetime": "1997-03-19T00:00:00Z"` (use the correct date-time format).

5. `modified_date`:

- Error: "instance.modified_date does not conform to the \"date\" format"
- [x] Fix: Change `"modified_date": "1997-03-26T00:00:00.000"` to `"modified_date": "1997-03-26"` (use the correct date format).

6. `reel_yr`:

- Error: "instance.reel_yr is not of a type(s) integer"
- [x] Fix: Change `"reel_yr": "1997"` to `"reel_yr": 1997` (remove quotes to make it an integer).

7. `reel_nbr`:

- Error: "instance.reel_nbr is not of a type(s) integer"
- [x] Fix: Change `"reel_nbr": "3902"` to `"reel_nbr": 3902` (remove quotes to make it an integer).

8. `reel_pg`:

- Error: "instance.reel_pg is not of a type(s) integer"
- [x] Fix: Change `"reel_pg": "1952"` to `"reel_pg": 1952` (remove quotes to make it an integer).

9. `percent_trans`:

- Error: "instance.percent_trans is not of a type(s) number"
- [x] Fix: Change `"percent_trans": "0"` to `"percent_trans": 0` (remove quotes to make it a number).

10. `good_through_date`:

- Error: "instance.good_through_date does not conform to the \"date\" format"
- [x] Fix: Change `"good_through_date": "2015-07-31T00:00:00.000"` to `"good_through_date": "2015-07-31"` (use the correct date format).

11. `crfn`:

- Error: "instance requires property \"crfn\""
- [x] Fix: Add the crfn property to the JSON body with a valid value.
- I realized using the json body data above that not all documents have a `crfn` number. When I requested the data from ACRIS it was missing the `crfn` field entirely as opposed to having a `crfn` field with a blank value or `0`.
- I had to make the `crfn` field optional in my `masterRealPropNew.json` file.
- I had to update the `saveRecord` method in my `MasterRealPropModel.js` file so it accepted the possibility of no `crfn` value: `data.crfn || null,`.

After making the aforementioned changes I resubmitted the Post request using the `json` body below but I received new errors in Postman and in my VSC terminal.

Postman json body in Post request

```json
{
  "document_id": "FT_3160005545216",
  "record_type": "A",
  "recorded_borough": 3,
  "doc_type": "DEED",
  "document_date": "1997-01-22",
  "document_amt": 0,
  "recorded_datetime": "1997-03-19T00:00:00Z",
  "modified_date": "1997-03-26",
  "reel_yr": 1997,
  "reel_nbr": 3902,
  "reel_pg": 1952,
  "percent_trans": 0,
  "good_through_date": "2015-07-31"
}
```

Postman error

```bash
{
    "error": {
        "message": "Cannot read properties of undefined (reading 'username')",
        "status": 500
    }
}
```

VSC Terminal error

```bash
TypeError: Cannot read properties of undefined (reading 'username')
    at /home/haus/springboard_bootcamp_dec_2023/snacris--backend/Backend/routes/db/acris/real-property/masterRealPropDbRoutes.js:69:76
    at Layer.handle [as handle_request] (/home/haus/springboard_bootcamp_dec_2023/snacris--backend/Backend/node_modules/express/lib/router/layer.js:95:5)
    at next (/home/haus/springboard_bootcamp_dec_2023/snacris--backend/Backend/node_modules/express/lib/router/route.js:149:13)
    at ensureLoggedIn (/home/haus/springboard_bootcamp_dec_2023/snacris--backend/Backend/middleware/auth.js:39:12)
    at Layer.handle [as handle_request] (/home/haus/springboard_bootcamp_dec_2023/snacris--backend/Backend/node_modules/express/lib/router/layer.js:95:5)
    at next (/home/haus/springboard_bootcamp_dec_2023/snacris--backend/Backend/node_modules/express/lib/router/route.js:149:13)
    at Route.dispatch (/home/haus/springboard_bootcamp_dec_2023/snacris--backend/Backend/node_modules/express/lib/router/route.js:119:3)
    at Layer.handle [as handle_request] (/home/haus/springboard_bootcamp_dec_2023/snacris--backend/Backend/node_modules/express/lib/router/layer.js:95:5)
    at /home/haus/springboard_bootcamp_dec_2023/snacris--backend/Backend/node_modules/express/lib/router/index.js:284:15
    at Function.process_params (/home/haus/springboard_bootcamp_dec_2023/snacris--backend/Backend/node_modules/express/lib/router/index.js:346:12)
POST /db/real-property-master/addRecordByUser 500 93 - 6.856 ms
```

The source of this error was in my `masterRealPropDbRoutes.js` file the `"/addRecordByUser"` route contained this line of code: `const record = await MasterRealPropModel.saveRecordByUser(req.user.username, req.body);` which needed the `req.user.username` reference changed to `res.locals.user.username`.

In Express.js, `req.params` is an object containing properties mapped to the named route parameters. For example, if you have a route defined as `/users/:username`, then `req.params.username` will contain the value of the `username` parameter in the URL.

Example of `req.params.username`
In a route like this:

```js
router.get("/users/:username", ensureLoggedIn, async function (req, res, next) {
  try {
    const user = await User.get(req.params.username);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});
```

If you make a GET request to `/users/johndoe`, `req.params.username` will be `johndoe`.

**Why `req.params.username` Doesn't Work in `addRecordByUser`**

In your `addRecordByUser` route, you are not using a URL parameter to specify the username. Instead, you are relying on the authenticated user's information, which is stored in `res.locals.user` by the `authenticateJWT` middleware. This is why you should use `res.locals.user.username` instead of `req.params.username`.

**Correct Usage in `addRecordByUser`**

Here is the correct way to access the authenticated user's username in your addRecordByUser route:

```js
router.post(
  "/addRecordByUser",
  ensureLoggedIn,
  async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, masterRealPropNewSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      const record = await MasterRealPropModel.saveRecordByUser(
        res.locals.user.username,
        req.body
      ); // Use res.locals.user.username
      return res.status(201).json({ record });
    } catch (err) {
      return next(err);
    }
  }
);
```

**Summary**

- `req.params.username` is used to access URL parameters in routes like `/users/:username`.
- In the `addRecordByUser` route, you should use `res.locals.user.username` to access the authenticated user's username, as it is set by the `authenticateJWT` middleware.

New Error in VSC Terminal:

```bash
User authenticated: { username: 'regularUser987', isAdmin: false, iat: 1736620984 }
User is logged in: { username: 'regularUser987', isAdmin: false, iat: 1736620984 }
error: relation "user_saved_real_property_master" does not exist
    at /home/haus/springboard_bootcamp_dec_2023/snacris--backend/Backend/node_modules/pg/lib/client.js:535:17
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async MasterRealPropModel.saveRecordByUser (/home/haus/springboard_bootcamp_dec_2023/snacris--backend/Backend/models/acris/real-property/MasterRealPropModel.js:54:20)
    at async /home/haus/springboard_bootcamp_dec_2023/snacris--backend/Backend/routes/db/acris/real-property/masterRealPropDbRoutes.js:69:24
POST /db/real-property-master/addRecordByUser 500 96 - 50.848 ms
```

Debug Process:

The new error message `relation "user_saved_real_property_master" does not exist` indicates that the table `user_saved_real_property_master` does not exist in your database. This is a database schema issue, and you need to ensure that the table is created in your database.

**Step-by-Step Solution**

1. **Check Database Schema**: Ensure that the `user_saved_real_property_master` table is defined in your database schema. If it is not, you need to create it.
2. **Create the Table**: If the table does not exist, you can create it using the following SQL statement. You can run this SQL statement in your database management tool (e.g., `psql` for PostgreSQL).

```sql
CREATE TABLE user_saved_real_property_master (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) REFERENCES users(username),
    document_id VARCHAR(16) REFERENCES acris_real_property_master(document_id),
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**My use case for prompts**

```
I don't think you understand the requirements for my database. Again, the document_id is not a unique identifier for any of the tables and should not be used as such. Instead each table will have the id as its primary key. The following is my intended use case. I want the user to be able to save records from the 3rd party ACRIS datasets (acris_real_property_master_dataset, acris_real_property_legals_dataset, acris_real_property_parties_dataset, acris_real_property_references_dataset and acris_real_property_remarks_dataset) to my database that will only be viewable by that user. Keep in mind that each record from the five ACRIS datasets has a document_id field but it is only a unique identifier for the acris_real_property_master_dataset. That being said the records associated with these five datasets are meant to be cross referenced using the document_id value which is how the ACRIS website works. I want to replicate this cross reference feature for users of my application using the document_id value, however, I do not want to use the document_id field as the unique identifier in my database. How should I structure my sql tables and join tables given the aforementioned use case description?

For example, John Doe decides to save five records from five ACRIS datasets to the acris_real_property_master, acris_real_property_legals, acris_real_property_parties, acris_real_property_references and acris_real_property_remarks sql tables in my database. Each of these records have the document_id value "123456789" which is used to cross reference all records from the five datasets. Then, Jane Doe decides to save the same five records that contain the same document_id value "123456789" to the database, however, I don'e want John Doe to view Jane Doe's records and vice versa. Therefore, if John Doe and Jane Doe want to retrieve their records, and to cross reference them as they will want to do, then I should rely on the id of their records and not the document_id, correct? If this is true then refactor the code below to achieve the aforementioned use-case.
```

I encountered an error that required reseeding the database so I have to start over from Step One since the user data was deleted.

### Step One - Register New User (v2)

First I tested the `Register new user, return JWT token` POST request using the `json` body below which returned the token below.

- File Name: `Backend/routes/auth.js`
- Route Declaration: `router.post("/register", async function (req, res, next) { ... });`
- Request Type: **POST**
- Request URL: `http://localhost:3001/auth/register`
- Request Headers: None
- Request Body:

```json
{
  "username": "regularUser987",
  "password": "userPass123",
  "firstName": "Regular",
  "lastName": "User",
  "email": "regular@example.com"
}
```

Post response body

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJlZ3VsYXJVc2VyOTg3IiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTczNjYzODA1NH0.zPiWXBjuAlC6s7-wuaRxyGYkUpatqFJGAilElzi2N8s"
}
```

[Back to TOC](#testing-snacris-routes-using-postman)

### Step Two - Authenticate Regular User (v2)

- File Name: `Backend/routes/auth.js`
- Route Declaration: `router.post("/token", async function (req, res, next) { ... });`
- Request Type: **POST**
- Request URL: `http://localhost:3001/auth/token`
- Request Headers: None
- Request Body:

```json
{
  "username": "regularUser987",
  "password": "userPass123"
}
```

- Response Body:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJlZ3VsYXJVc2VyOTg3IiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTczNjYzODA2Nn0.AFXFRwv6aVuM4FuGX71REd1C5GKkYSbzHIM-AEybL-w"
}
```

[Back to TOC](#testing-snacris-routes-using-postman)

### Step Three - Get record from ACRIS Real Property API (v2)

I obtained the ACRIS data below from using the `Get Real Property Master Data` **GET** request in Postman. This will go in the body of the `addRecordByUser` route in the next step. Remember to refactor this so the value meet the validation requirements. I've already done this in the next step.

- File Name: `Backend/routes/api/acris/real-property/masterRealPropApiRoutes.js`
- Route Declaration: `router.get("/fetchRecord", async function (req, res, next) {...}`
- Request Type: **GET**
- Request URL: `http://localhost:3001/auth/token`
- Request Headers: None
- Request Body:

```json
{
  "document_id": "FT_3160005545216",
  "record_type": "A",
  "recorded_borough": "3",
  "doc_type": "DEED",
  "document_date": "1997-01-22T00:00:00.000",
  "document_amt": "0",
  "recorded_datetime": "1997-03-19T00:00:00.000",
  "modified_date": "1997-03-26T00:00:00.000",
  "reel_yr": "1997",
  "reel_nbr": "3902",
  "reel_pg": "1952",
  "percent_trans": "0",
  "good_through_date": "2015-07-31T00:00:00.000"
}
```

[Back to TOC](#testing-snacris-routes-using-postman)

### Step Four - Save record by user to db (v2)

- File Name: `masterRealPropDbRoutes.js`
- Route Declaration: `router.post("/addRecordByUser", ensureLoggedIn, async function (req, res, next) {`
- Request Type: **POST**
- Request URL: `http://localhost:3001/db/real-property-master/addRecordByUser`
- Request Headers: `Authorization` / `Bearer <token>`

`Bearer <token>`: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJlZ3VsYXJVc2VyOTg3IiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTczNjYzODA2Nn0.AFXFRwv6aVuM4FuGX71REd1C5GKkYSbzHIM-AEybL-w`

- Request Body:

```json
{
  "document_id": "FT_3160005545216",
  "record_type": "A",
  "recorded_borough": 3,
  "doc_type": "DEED",
  "document_date": "1997-01-22",
  "document_amt": 0,
  "recorded_datetime": "1997-03-19T00:00:00Z",
  "modified_date": "1997-03-26",
  "reel_yr": 1997,
  "reel_nbr": 3902,
  "reel_pg": 1952,
  "percent_trans": 0,
  "good_through_date": "2015-07-31"
}
```

Finally, I received the `201 Created` status code returning the json body below.

```json
{
  "record": {
    "id": 1,
    "username": "regularUser987",
    "master_id": 4,
    "saved_at": "2025-01-11T23:29:17.496Z"
  }
}
```

[Back to TOC](#testing-snacris-routes-using-postman)

### `addRecordByUser` route overview

**Step-by-Step Process**

1. **Route Definition and Validation**:

- The `POST /addRecordByUser` route in `masterRealPropDbRoutes.js` is defined to handle the addition of new records by users.
- The route uses the `ensureLoggedIn` middleware to ensure that only authenticated users can access it.
- The request body is validated against the `masterRealPropNewSchema.json` schema using `jsonschema`.

2. **Validation**:

- The `jsonschema.validate` method checks if the request body conforms to the schema defined in `masterRealPropNewSchema.json`.
- If the validation fails, a `BadRequestError` is thrown with the validation errors.

```js
router.post(
  "/addRecordByUser",
  ensureLoggedIn,
  async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, masterRealPropNewSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      const record = await MasterRealPropModel.saveRecordByUser(
        res.locals.user.username,
        req.body
      );
      return res.status(201).json({ record });
    } catch (err) {
      return next(err);
    }
  }
);
```

3. **Saving the Record**:

- The `saveRecordByUser` method is called with the authenticated user's username and the validated data.
- The `saveRecord` method inserts the record into the `acris_real_property_master` table and returns the inserted record, including its `id`.

4. **Inserting the Record into `acris_real_property_master`**:

- The `saveRecordByUser` method first calls the `saveRecord` method to insert the record into the `acris_real_property_master` table.
- The `saveRecord` method executes an `INSERT` SQL query to add the record to the `acris_real_property_master` table.
- The `RETURNING` clause in the SQL query returns the inserted record, including its `id`.

5. **Creating an Association in the Join Table**:

- After successfully inserting the record into `acris_real_property_master`, the `saveRecordByUser` method inserts a new entry into the `user_saved_real_property_master` join table.
- This entry associates the `username` with the `master_id` (the `id` of the inserted record in `acris_real_property_master`).
- The `RETURNING` clause in the SQL query returns the association record, including its `id`, `username`, `master_id`, and `saved_at` timestamp.

6. **Returning the Response**:

- The `saveRecordByUser` method returns the association record.
- The route handler sends a JSON response with the association record to the client.

```js
class MasterRealPropModel {
  static async saveRecord(data) {
    const result = await db.query(
      `INSERT INTO acris_real_property_master
       (document_id, record_type, crfn, recorded_borough, doc_type, document_date, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING id, document_id, record_type, crfn, recorded_borough, doc_type, document_date, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date`,
      [
        data.document_id,
        data.record_type,
        data.crfn || null,
        data.recorded_borough,
        data.doc_type,
        data.document_date,
        data.document_amt,
        data.recorded_datetime,
        data.modified_date,
        data.reel_yr,
        data.reel_nbr,
        data.reel_pg,
        data.percent_trans,
        data.good_through_date,
      ]
    );

    return result.rows[0];
  }

  static async saveRecordByUser(username, data) {
    const record = await this.saveRecord(data);
    const result = await db.query(
      `INSERT INTO user_saved_real_property_master (username, master_id)
       VALUES ($1, $2)
       RETURNING id, username, master_id, saved_at`,
      [username, record.id]
    );

    return result.rows[0];
  }
}
```

[Back to TOC](#testing-snacris-routes-using-postman)

### Step Five - Retrieve All Records By User from DB (v2)

- NB--> This is the same user from **Step Four**. This route is protected so only an authenticated user can retrieve their records that they previously saved to the database.
- File Name: `masterRealPropDbRoutes.js`
- Route Declaration: `router.get("/fetchAllRecordsByUser", ensureLoggedIn, async function (req, res, next) {`
- Request Type: **GET**
- Request URL: `http://localhost:3001/db/real-property-master/fetchAllRecordsByUser`
- Request Headers: `Authorization` / `Bearer <token>`

`Bearer <token>`: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJlZ3VsYXJVc2VyOTg3IiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTczNjYzODA2Nn0.AFXFRwv6aVuM4FuGX71REd1C5GKkYSbzHIM-AEybL-w`

- Request Body: none

I received a `200 OK` status code and the response body below.

```json
{
  "records": [
    {
      "document_id": "FT_3160005545216",
      "record_type": "A",
      "crfn": null,
      "recorded_borough": 3,
      "doc_type": "DEED",
      "document_date": "1997-01-22T05:00:00.000Z",
      "document_amt": "0.00",
      "recorded_datetime": "1997-03-19T05:00:00.000Z",
      "modified_date": "1997-03-26T05:00:00.000Z",
      "reel_yr": 1997,
      "reel_nbr": 3902,
      "reel_pg": 1952,
      "percent_trans": "0.000000",
      "good_through_date": "2015-07-31T04:00:00.000Z"
    }
  ]
}
```

[Back to TOC](#testing-snacris-routes-using-postman)

### Step Six - Retrieve Record By User and `document_id` from DB (v2)

- NB--> This is the same user from **Step Four** and **Step Five**. This route is protected so only an authenticated user can retrieve their records that they previously saved to the database.
- File Name: `masterRealPropDbRoutes.js`
- Route Declaration: `router.get("/fetchRecordFromUserByDocumentId/:document_id", ensureLoggedIn, async function (req, res, next) {`
- Request Type: **GET**
- Request URL: `http://localhost:3001/db/real-property-master/fetchRecordFromUserByDocumentId/FT_3160005545216`
- Request Headers: `Authorization` / `Bearer <token>`

`Bearer <token>`: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJlZ3VsYXJVc2VyOTg3IiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTczNjYzODA2Nn0.AFXFRwv6aVuM4FuGX71REd1C5GKkYSbzHIM-AEybL-w`

- Request Params: none
- Request Body: none

I received a `200 OK` status code and the json response body below.

```json
{
  "record": {
    "document_id": "FT_3160005545216",
    "record_type": "A",
    "crfn": null,
    "recorded_borough": 3,
    "doc_type": "DEED",
    "document_date": "1997-01-22T05:00:00.000Z",
    "document_amt": "0.00",
    "recorded_datetime": "1997-03-19T05:00:00.000Z",
    "modified_date": "1997-03-26T05:00:00.000Z",
    "reel_yr": 1997,
    "reel_nbr": 3902,
    "reel_pg": 1952,
    "percent_trans": "0.000000",
    "good_through_date": "2015-07-31T04:00:00.000Z"
  }
}
```

[Back to TOC](#testing-snacris-routes-using-postman)

### Step Seven - Search for records from User by `document_id`, `record_type` and `recorded_borough` from DB (v2)

- NB--> This is the same user from **Step Four**, **Step Five** and **Step Six**. This route is protected so only an authenticated user can retrieve their records that they previously saved to the database.
- File Name: `masterRealPropDbRoutes.js`
- Route Declaration: `router.get("/searchSavedUserRecords", ensureLoggedIn, async function (req, res, next) {`
- Request Type: **GET**
- Request URL: `http://localhost:3001/db/real-property-master/searchSavedUserRecords?document_id=FT_3160005545216&record_type=A&recorded_borough=3`
- Request Headers: `Authorization` / `Bearer <token>`

`Bearer <token>`: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJlZ3VsYXJVc2VyOTg3IiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTczNjYzODA2Nn0.AFXFRwv6aVuM4FuGX71REd1C5GKkYSbzHIM-AEybL-w`

- Request Params:
  - `document_id` / `FT_3160005545216`
  - `record_type` / `A`
  - `recorded_borough` / `3`
- Request Body: none

I received a `200 OK` status code and the json response body below.

```json
{
  "records": [
    {
      "document_id": "FT_3160005545216",
      "record_type": "A",
      "crfn": null,
      "recorded_borough": 3,
      "doc_type": "DEED",
      "document_date": "1997-01-22T05:00:00.000Z",
      "document_amt": "0.00",
      "recorded_datetime": "1997-03-19T05:00:00.000Z",
      "modified_date": "1997-03-26T05:00:00.000Z",
      "reel_yr": 1997,
      "reel_nbr": 3902,
      "reel_pg": 1952,
      "percent_trans": "0.000000",
      "good_through_date": "2015-07-31T04:00:00.000Z"
    }
  ]
}
```

[Back to TOC](#testing-snacris-routes-using-postman)

### Step Eight - Delete record from User by `document_id` from DB (v2)

- NB--> This is the same user from **Step Four**, **Step Five**, **Step Six** and **Step Seven**. This route is protected so only an authenticated user can delete their records that they previously saved to the database.
- File Name: `masterRealPropDbRoutes.js`
- Route Declaration: `router.delete("/deleteRecordByUser/:document_id", ensureLoggedIn, async function (req, res, next) {`
- Request Type: **DELETE**
- Request URL: `http://localhost:3001/db/real-property-master/deleteRecordByUser/FT_3160005545216`
- Request Headers: `Authorization` / `Bearer <token>`

`Bearer <token>`: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJlZ3VsYXJVc2VyOTg3IiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTczNjYzODA2Nn0.AFXFRwv6aVuM4FuGX71REd1C5GKkYSbzHIM-AEybL-w`

I received a `200 OK` status code and the json response body below.

```json
{
  "deleted": "FT_3160005545216"
}
```

[Back to TOC](#testing-snacris-routes-using-postman)

### Step Nine - Authenticate User as Admin (v2)

- File Name: `auth.js`
- Route Declaration: `router.post("/token", async function (req, res, next) { ... });`
- Request Type: **POST**
- Request URL: `http://localhost:3001/auth/token`
- Request Headers: None
- Request Body:

```json
{
  "username": "testadmin",
  "password": "password"
}
```

- Response Body:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3RhZG1pbiIsImlzQWRtaW4iOnRydWUsImlhdCI6MTczNjcxOTUwN30.GxmoKOj-aHe9HBM1dHVdhffy4lT7uNehCqnD1UinV-w"
}
```

I received a `200 OK` status code with the token above.

[Back to TOC](#testing-snacris-routes-using-postman)

### Step Ten - Save Record by Admin to DB (v2)

- File Name: `masterRealPropDbRoutes.js`
- Route Declaration: `router.get("/getAllRecordsByAdmin", ensureAdmin, async function (req, res, next) {`
- Request Type: **POST**
- Request URL: `http://localhost:3001/db/real-property-master/saveDataByAdmin`
- Request Headers: `Authorization` / `Bearer <token>`

`Bearer <token>`: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3RhZG1pbiIsImlzQWRtaW4iOnRydWUsImlhdCI6MTczNjg3MTM2NH0.5Eu9uJYxiu_FJyeKmVi3Y2vvgNyMiZyOQy8zhdaBBhE`

- Request Body:

```json
{
  "document_id": "FT_3150000953315",
  "record_type": "A",
  "recorded_borough": "3",
  "doc_type": "DEED",
  "document_date": "1983-03-31T00:00:00.000",
  "document_amt": "0",
  "recorded_datetime": "1983-04-01T00:00:00.000",
  "modified_date": "1983-04-01T00:00:00.000",
  "reel_yr": "1983",
  "reel_nbr": "1385",
  "reel_pg": "493",
  "percent_trans": "0",
  "good_through_date": "2015-07-31T00:00:00.000"
}
```

[Back to TOC](#testing-snacris-routes-using-postman)

## Duplicate Record Handling

### Relationship Between Normalizing and Validating Data

- **Order of Operations**: Typically, data is validated first to ensure it meets the basic requirements and constraints. After validation, data can be normalized to ensure consistency in storage and processing.

- **Complementary Processes**: Validation ensures that data is correct and complete, while normalization ensures that data is stored in a consistent and efficient manner.

I was able to receive a `400 Bad Request` error when attempting to save a duplicate record. The duplicate record was compared to the existing record and since all of the key value pairs matched the error was thrown. See the output below for more details.

```bash
Started on http://localhost:3001
[nodemon] restarting due to changes...
[nodemon] starting `node server.js`
Snacris Config:
SECRET_KEY: secret-dev
PORT: 3001
BCRYPT_WORK_FACTOR 12
Database: postgresql://haus:Laylacharlie22!@localhost:5432/snacris
---
Started on http://localhost:3001
User authenticated: { username: 'regularUser987', isAdmin: false, iat: 1736815859 }
User is logged in: { username: 'regularUser987', isAdmin: false, iat: 1736815859 }
Incoming data: {
  document_id: 'FT_3160005545216',
  record_type: 'A',
  recorded_borough: '3',
  doc_type: 'DEED',
  document_date: '1997-01-22T00:00:00.000',
  document_amt: '0',
  recorded_datetime: '1997-03-19T00:00:00.000',
  modified_date: '1997-03-26T00:00:00.000',
  reel_yr: '1997',
  reel_nbr: '3902',
  reel_pg: '1952',
  percent_trans: '0',
  good_through_date: '2015-07-31T00:00:00.000'
}
processed data: {
  document_id: 'FT_3160005545216',
  record_type: 'A',
  crfn: null,
  recorded_borough: 3,
  doc_type: 'DEED',
  document_date: '1997-01-22T00:00:00-05:00',
  document_amt: 0,
  recorded_datetime: '1997-03-19T00:00:00-05:00',
  modified_date: '1997-03-26T00:00:00-05:00',
  reel_yr: 1997,
  reel_nbr: 3902,
  reel_pg: 1952,
  percent_trans: 0,
  good_through_date: '2015-07-31T00:00:00-04:00'
}
Data after validation: {
  document_id: 'FT_3160005545216',
  record_type: 'A',
  crfn: null,
  recorded_borough: 3,
  doc_type: 'DEED',
  document_date: '1997-01-22T00:00:00-05:00',
  document_amt: 0,
  recorded_datetime: '1997-03-19T00:00:00-05:00',
  modified_date: '1997-03-26T00:00:00-05:00',
  reel_yr: 1997,
  reel_nbr: 3902,
  reel_pg: 1952,
  percent_trans: 0,
  good_through_date: '2015-07-31T00:00:00-04:00'
}
Existing record: {
  document_id: 'FT_3160005545216',
  record_type: 'A',
  crfn: null,
  recorded_borough: 3,
  doc_type: 'DEED',
  document_date: 1997-01-22T05:00:00.000Z,
  document_amt: '0.00',
  recorded_datetime: 1997-03-19T05:00:00.000Z,
  modified_date: 1997-03-26T05:00:00.000Z,
  reel_yr: 1997,
  reel_nbr: 3902,
  reel_pg: 1952,
  percent_trans: '0.000000',
  good_through_date: 2015-07-31T04:00:00.000Z
}
Normalized existing record: {
  document_id: 'FT_3160005545216',
  record_type: 'A',
  crfn: null,
  recorded_borough: 3,
  doc_type: 'DEED',
  document_date: '1997-01-22T00:00:00-05:00',
  document_amt: 0,
  recorded_datetime: '1997-03-19T00:00:00-05:00',
  modified_date: '1997-03-26T00:00:00-05:00',
  reel_yr: 1997,
  reel_nbr: 3902,
  reel_pg: 1952,
  percent_trans: 0,
  good_through_date: '2015-07-31T00:00:00-04:00'
}
Error: Record already exists for user.
    at /home/haus/springboard_bootcamp_dec_2023/snacris--backend/Backend/routes/db/acris/real-property/masterRealPropDbRoutes.js:129:23
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
POST /db/real-property-master/saveDataByUser 400 68 - 19.729 ms
```

**I will attempt to refactor the code below which works into a more maintainable format.**

```js
router.post("/saveDataByUser", ensureLoggedIn, async function (req, res, next) {
  try {
    // Log the incoming data before normalization
    console.log("Incoming data:", req.body);

    // Process the incoming data
    const processedData = {
      document_id: req.body.document_id,
      record_type: req.body.record_type,
      crfn: req.body.crfn || null,
      recorded_borough: parseInt(req.body.recorded_borough, 10),
      doc_type: req.body.doc_type,
      document_date: moment
        .tz(req.body.document_date, "America/New_York")
        .format(),
      document_amt: parseFloat(req.body.document_amt),
      recorded_datetime: moment
        .tz(req.body.recorded_datetime, "America/New_York")
        .format(),
      modified_date: moment
        .tz(req.body.modified_date, "America/New_York")
        .format(),
      reel_yr: parseInt(req.body.reel_yr, 10),
      reel_nbr: parseInt(req.body.reel_nbr, 10),
      reel_pg: parseInt(req.body.reel_pg, 10),
      percent_trans: parseFloat(req.body.percent_trans),
      good_through_date: moment
        .tz(req.body.good_through_date, "America/New_York")
        .format(),
    };

    // Log the processed data before validation
    console.log("processed data:", processedData);

    // Validate the processed data
    const validator = jsonschema.validate(
      processedData,
      masterRealPropNewSchema
    );
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      console.log("Validation errors:", errs);
      throw new BadRequestError(errs);
    }

    // Log the data after validation
    console.log("Data after validation:", processedData);

    // Check for duplicate record
    try {
      const existingRecord =
        await MasterRealPropModel.findRecordFromUserByDocumentId(
          res.locals.user.username,
          processedData.document_id
        );
      // Log the existing record
      console.log("Existing record:", existingRecord);

      // Normalize the existing record for comparison
      const normalizedExistingRecord = {
        document_id: existingRecord.document_id,
        record_type: existingRecord.record_type,
        crfn: existingRecord.crfn,
        recorded_borough: existingRecord.recorded_borough,
        doc_type: existingRecord.doc_type,
        document_date: moment
          .tz(existingRecord.document_date, "America/New_York")
          .format(),
        document_amt: parseFloat(existingRecord.document_amt),
        recorded_datetime: moment
          .tz(existingRecord.recorded_datetime, "America/New_York")
          .format(),
        modified_date: moment
          .tz(existingRecord.modified_date, "America/New_York")
          .format(),
        reel_yr: parseInt(existingRecord.reel_yr, 10),
        reel_nbr: parseInt(existingRecord.reel_nbr, 10),
        reel_pg: parseInt(existingRecord.reel_pg, 10),
        percent_trans: parseFloat(existingRecord.percent_trans),
        good_through_date: moment
          .tz(existingRecord.good_through_date, "America/New_York")
          .format(),
      };

      // Log the normalized existing record
      console.log("Normalized existing record:", normalizedExistingRecord);

      // Compare the existing record with the processed data
      if (
        JSON.stringify(normalizedExistingRecord) ===
        JSON.stringify(processedData)
      ) {
        throw new BadRequestError("Record already exists for user.");
      }
    } catch (err) {
      if (err instanceof NotFoundError) {
        // No existing record found, proceed to save the new record
        const record = await MasterRealPropModel.createRecordForUser(
          res.locals.user.username,
          processedData
        );

        // Log the data after successfully being saved to the database
        console.log("Saved record:", record);

        return res.status(201).json({ record });
      } else {
        throw err;
      }
    }
  } catch (err) {
    return next(err);
  }
});
```

The code above can be refactored into the form below. I've saved this code below which keeps the console.log statements at key locations in case I need to refer back for debugging purposes.

```js
function processIncomingData(data) {
  return {
    document_id: data.document_id,
    record_type: data.record_type,
    crfn: data.crfn || null,
    recorded_borough: parseInt(data.recorded_borough, 10),
    doc_type: data.doc_type,
    document_date: moment.tz(data.document_date, "America/New_York").format(),
    document_amt: parseFloat(data.document_amt),
    recorded_datetime: moment
      .tz(data.recorded_datetime, "America/New_York")
      .format(),
    modified_date: moment.tz(data.modified_date, "America/New_York").format(),
    reel_yr: parseInt(data.reel_yr, 10),
    reel_nbr: parseInt(data.reel_nbr, 10),
    reel_pg: parseInt(data.reel_pg, 10),
    percent_trans: parseFloat(data.percent_trans),
    good_through_date: moment
      .tz(data.good_through_date, "America/New_York")
      .format(),
  };
}

function validateData(data) {
  const validator = jsonschema.validate(data, masterRealPropNewSchema);
  if (!validator.valid) {
    const errs = validator.errors.map((e) => e.stack);
    console.log("Validation errors:", errs);
    throw new BadRequestError(errs);
  }
}

function normalizeRecord(record) {
  return {
    document_id: record.document_id,
    record_type: record.record_type,
    crfn: record.crfn,
    recorded_borough: record.recorded_borough,
    doc_type: record.doc_type,
    document_date: moment.tz(record.document_date, "America/New_York").format(),
    document_amt: parseFloat(record.document_amt),
    recorded_datetime: moment
      .tz(record.recorded_datetime, "America/New_York")
      .format(),
    modified_date: moment.tz(record.modified_date, "America/New_York").format(),
    reel_yr: parseInt(record.reel_yr, 10),
    reel_nbr: parseInt(record.reel_nbr, 10),
    reel_pg: parseInt(record.reel_pg, 10),
    percent_trans: parseFloat(record.percent_trans),
    good_through_date: moment
      .tz(record.good_through_date, "America/New_York")
      .format(),
  };
}

router.post("/saveDataByUser", ensureLoggedIn, async function (req, res, next) {
  try {
    console.log("Incoming data:", req.body);

    const processedData = processIncomingData(req.body);
    console.log("Processed data:", processedData);

    validateData(processedData);
    console.log("Data after validation:", processedData);

    try {
      const existingRecord =
        await MasterRealPropModel.findRecordFromUserByDocumentId(
          res.locals.user.username,
          processedData.document_id
        );
      console.log("Existing record:", existingRecord);

      const normalizedExistingRecord = normalizeRecord(existingRecord);
      console.log("Normalized existing record:", normalizedExistingRecord);

      if (
        JSON.stringify(normalizedExistingRecord) ===
        JSON.stringify(processedData)
      ) {
        throw new BadRequestError("Record already exists for user.");
      }
    } catch (err) {
      if (err instanceof NotFoundError) {
        const record = await MasterRealPropModel.createRecordForUser(
          res.locals.user.username,
          processedData
        );
        console.log("Saved record:", record);
        return res.status(201).json({ record });
      } else {
        throw err;
      }
    }
  } catch (err) {
    return next(err);
  }
});
```

[Back to TOC](#testing-snacris-routes-using-postman)

### Step Eleven - Retrieve All Records By Admin from DB (v2)

[Back to TOC](#testing-snacris-routes-using-postman)

### Step Twelve - Retrieve Record By Admin and `document_id` from DB (v2)

[Back to TOC](#testing-snacris-routes-using-postman)

### Step Thirdteen - Search for records from Admin by `document_id`, `record_type` and `recorded_borough` from DB (v2)

[Back to TOC](#testing-snacris-routes-using-postman)

### Step Fourteen - Delete record from Admin by `document_id` from DB (v2)

[Back to TOC](#testing-snacris-routes-using-postman)