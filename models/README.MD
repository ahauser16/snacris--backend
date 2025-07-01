# Javascript Models Notes

The models folder contains files from the last Springboard project such as `company.js`, `job.js` and `user.js`, which define the structure and methods for interacting with the database. These models encapsulate the logic for creating, reading, updating, and deleting (CRUD) records in the database. For example, the `Job` model includes methods for creating a job, finding jobs with optional filters, retrieving a job by ID, updating job data, and deleting a job. I chose to keep these files because I'm using the same authentication system as the previous project and as a reference to design my own project.

## Helpful `psql` commands

- To start the PostgreSQL service on WSL Ubuntu, use the following command: `sudo service postgresql start`.
- To list all the databases associated with your psql account, use the following command after logging into psql: `\l`.
- To connect to a specific database, such as snacris, use the following command in psql: `\c snacris`.
- Once connected to a database in psql, use the following command to list all the tables: `\dt`.
- To list all the data within a table, such as country_codes, while connected to the database, use the following SQL command: `SELECT * FROM country_codes;`

## Relevant CRUD Operations

1. Create:

- **Insert a new record**: Add a new record to the database.

2. Read:

- **Find all records**: Retrieve all records from the database.
- **Find a single record by ID**: Retrieve a specific record by its unique identifier.
- **Search records**: Retrieve records based on specific search criteria.

3. Update:

- **Update a record by ID**: Modify an existing record identified by its unique identifier.

4. Delete:

- **Delete a record by ID**: Remove a specific record from the database by its unique identifier.

## ADD NEW DOCUMENTATION HERE

## Models Folder Structure

The `models/` directory contains all database model files organized by functionality and domain. This folder follows a hierarchical structure that separates core models, ACRIS-related models, and organizational models.

### Root Level Files

- **`user.js`** - Core user model handling user authentication, profile management, and user-related CRUD operations
- **`user.test.js`** - Unit tests for the user model
- **`userWithSeededData.test.js`** - Integration tests for user model with seeded test data
- **`_testCommon.js`** - Common test utilities and setup functions shared across model tests
- **`_testCommon_seeded.js`** - Test utilities specifically for seeded data scenarios

### ACRIS Models (`acris/`)

The ACRIS (Automated City Register Information System) models handle NYC property and legal document data:

#### Code Maps (`acris/code-maps/`)

Reference models for various ACRIS code mappings:

- **`CountriesCodeMapModel.js`** - Country code mappings and lookups
- **`DocTypesCodeMapModel.js`** - Document type code mappings
- **`PropTypesCodeMapModel.js`** - Property type code mappings
- **`StatesCodeMapModel.js`** - State code mappings
- **`UccTypesCodeMapModel.js`** - UCC (Uniform Commercial Code) type mappings
- Each model includes corresponding `.test.js` files for unit testing

#### Personal Property (`acris/personal-property/`)

- **`personalProperty.js`** - Model for ACRIS personal property records and transactions
- **`personalProperty.test.js`** - Unit tests for personal property model

#### Real Property (`acris/real-property/`)

- **`realProperty.js`** - Model for ACRIS real property records, deeds, and transactions
- **`realProperty.test.js`** - Unit tests for real property model

### Organization Models (`organization/`)

- **`organization.js`** - Model for organization entities, membership management, and organization-related operations
- **`organization.test.js`** - Unit tests for organization model

### Testing Strategy

Each model follows a consistent testing pattern:

- Unit tests (`.test.js`) for individual model methods
- Integration tests for models with external dependencies
- Common test utilities to reduce code duplication
- Seeded data tests for realistic data scenarios

### File Naming Conventions

- **Models**: `camelCase.js` (e.g., `realProperty.js`)
- **Tests**: `modelName.test.js`
- **Code Maps**: `PascalCaseCodeMapModel.js`
- **README files**: Present in each subdirectory explaining domain-specific details
