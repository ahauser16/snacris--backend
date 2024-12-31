# react jobly (backend)

## architecture notes

The following are my own notes to understand how the backend server of the `React-jobly` assignment can be used for my own backend server to be used with my Google Chrome Extension called "SNACRIS".

### Code Overview

#### `server.js` overview

This file is the entry point for the backend server. It imports the Express application from `app.js` and starts the server on the specified port. The port number is retrieved from the configuration file.

#### `app.js` overview

This file sets up the Express application. It configures middleware for handling CORS, JSON parsing, logging, and JWT authentication. It also defines routes for authentication, companies, users, and jobs. Additionally, it includes error handling for 404 errors and other generic errors.

#### `config.js` overview

This file contains configuration settings for the application. It loads environment variables using `dotenv`, sets up constants like `SECRET_KEY` and `PORT`, and defines a function to get the database URI based on the environment. It also configures the bcrypt work factor for password hashing.

#### `db.js` overview

This file sets up the connection to the PostgreSQL database using the `pg` library. It determines the database URI based on the environment and configures SSL for production. It exports the connected database client for use in other parts of the application.

#### models overview

The models folder contains files like `company.js`, `job.js`, and `user.js`, which define the structure and methods for interacting with the database. These models encapsulate the logic for creating, reading, updating, and deleting records in the database. For example, the `Job` model includes methods for creating a job, finding jobs with optional filters, retrieving a job by ID, updating job data, and deleting a job.

##### `user.js` model overview

This file defines the `User` model, which contains methods for interacting with the `users` table in the database. It includes methods for user authentication, registration, retrieval, updating, and deletion. It also includes a method for applying to jobs. The model handles hashing passwords and validating user data.

##### `company.js` model overview

This file defines the `Company` model, which contains methods for interacting with the `companies` table in the database. It includes methods for creating, retrieving, updating, and deleting companies. It also supports filtering companies based on search criteria and retrieving associated jobs for a company.

##### `job.js` model overview

This file defines the `Job` model, which contains methods for interacting with the `jobs` table in the database. It includes methods for creating, retrieving, updating, and deleting jobs. It also supports filtering job listings based on specific criteria. The model handles the association between jobs and companies, ensuring that job data includes relevant company details.

#### routes overview

The `routes` folder contains files like `auth.js`, `companies.js`, `jobs.js`, and `users.js`, which define the API endpoints for the application. These routes handle HTTP requests, invoke the appropriate model methods, and return responses to the client. For instance, the `jobs.js` route file includes endpoints for creating a new job, retrieving all jobs, retrieving a specific job, updating a job, and deleting a job. The routes also include middleware functions for tasks like authentication and authorization.

##### `auth.js` route overview
This file defines the authentication-related routes. It includes routes for logging in (`POST /auth/token`) and registering (`POST /auth/register`). These routes validate the input data using JSON schemas and handle user authentication and registration, returning a JWT token upon successful login or registration.

##### `users.js` route overview
This file defines the user-related routes. It includes routes for adding new users (`POST /`), retrieving all users (`GET /`), retrieving a specific user (`GET /:username`), updating a user (`PATCH /:username`), deleting a user (`DELETE /:username`), and applying to a job (`POST /:username/jobs/:id`). These routes validate the input data using JSON schemas and ensure proper authorization using middleware functions.

##### `companies.js` route overview
This file defines the company-related routes. It includes routes for creating a new company (`POST /`), retrieving all companies (`GET /`), retrieving a specific company (`GET /:handle`), updating a company (`PATCH /:handle`), and deleting a company (`DELETE /:handle`). These routes validate the input data using JSON schemas and ensure proper authorization using middleware functions.

##### `jobs.js` route overview
This file defines the job-related routes. It includes routes for creating a new job (`POST /`), retrieving all jobs (`GET /`), retrieving a specific job (`GET /:id`), updating a job (`PATCH /:id`), and deleting a job (`DELETE /:id`). These routes validate the input data using JSON schemas and ensure proper authorization using middleware functions.

#### schemas overview

The `schemas` folder contains JSON schema files like `companyNew.json`, `companySearch.json`, `companyUpdate.json`, `jobNew.json`, `jobSearch.json`, `jobUpdate.json`, `userAuth.json`, `userNew.json`, `userRegister.json`, and `userUpdate.json`. These schemas define the structure and validation rules for the data used in the application. They ensure that the data conforms to the expected format before it is processed by the routes and models. For example, the `jobNew.json` schema validates the data for creating a new job, ensuring that required fields like `title` and `companyHandle` are present and correctly formatted.

##### `companyNew.json` schema overview

This file defines the schema for creating a new company. It ensures that the company data includes `name`, `handle`, and `description`, with optional fields for `numEmployees` and `logoUrl`. The schema validates the data types and constraints, such as string lengths and integer minimums.

##### `companySearch.json` schema overview

This file defines the schema for searching companies. It allows optional search filters like `minEmployees`, `maxEmployees`, and `name`. The schema ensures that these filters are of the correct data types and within valid ranges.

##### `companyUpdate.json` schema overview

This file defines the schema for updating company data. It allows partial updates with fields like `name`, `description`, `numEmployees`, and `logoUrl`. The schema validates the data types and constraints for these fields.

##### `jobNew.json` schema overview

This file defines the schema for creating a new job. It ensures that the job data includes `title` and `companyHandle`, with optional fields for `salary` and `equity`. The schema validates the data types and constraints, such as string lengths and integer minimums.

##### `jobSearch.json` schema overview

This file defines the schema for searching jobs. It allows optional search filters like `minSalary`, `hasEquity`, and `title`. The schema ensures that these filters are of the correct data types and within valid ranges.

##### `jobUpdate.json` schema overview

This file defines the schema for updating job data. It allows partial updates with fields like `title`, `salary`, and `equity`. The schema validates the data types and constraints for these fields.

##### `userAuth.json` schema overview

This file defines the schema for user authentication. It ensures that the authentication data includes `username` and `password`. The schema validates that these fields are strings and are required.

##### `userNew.json` schema overview

This file defines the schema for creating a new user. It ensures that the user data includes `username`, `password`, `firstName`, `lastName`, and `email`, with an optional field for `isAdmin`. The schema validates the data types and constraints, such as string lengths and email format.

##### `userRegister.json` schema overview

This file defines the schema for user registration. It ensures that the registration data includes `username`, `password`, `firstName`, `lastName`, and `email`. The schema validates the data types and constraints, such as string lengths and email format.

##### `userUpdate.json` schema overview

This file defines the schema for updating user data. It allows partial updates with fields like `password`, `firstName`, `lastName`, and `email`. The schema validates the data types and constraints for these fields.

#### Model, Route & Schema Integration

When a client makes a request to the server, the following sequence occurs:
1. **Request Handling**: The request is received by an appropriate route defined in the `routes` folder.
2. **Data Validation**: The route uses a JSON schema from the `schemas` folder to validate the request data. If the data is invalid, an error is returned.
3. **Model Interaction**: If the data is valid, the route invokes a method from the corresponding model in the `models` folder to perform the desired operation (e.g., creating a new job, retrieving user information).
4. **Response**: The route sends the result of the model operation back to the client as a response.