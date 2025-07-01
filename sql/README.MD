# SNACRIS sql, database and dataset notes

The following are notes associated with how the `snacris.sql` and related files in the `sql` folder were created, how they are organized and should be maintained as well as notes about how to seed the database.

## Datasets Overview

SNACRIS relies on data from 15 datasets hosted by the NYC Open Data API which is powered by Socrata. These datasets can be divided into 3 groups: **Real Property**, **Personal Property** and **Code Mappings** (each referred to as a "dataset-group" or collectively as the "dataset-groups"). The **Code Mappings** dataset-group contains datasets that provide necessary data to query the other **Real Property** and **Personal Property** datasets. The **Code Mappings** dataset-group contains the following datasets: **Document Type Codes**, **Property Type Codes**, **UCC Collateral Codes**, **USA State Codes** and **Country Codes**. Note Well: the **UCC Collateral Codes** are only associated with the **Personal Property** dataset-group.

The **Real Property** and **Personal Property** dataset-groups each follow the same schema of having the following dataset names: **Master**, **LEGALS**, **PARTIES**, **REFERENCES** and **REMARKS**. Within each dataset-group each dataset can be cross-referenced with another dataset using the `document_id` field which represents a document that was recorded with the NYC Department of Finance such as a "deed" or "mortgage". For example, the **Real Property - Master** dataset provides an overview of a document whereas the **Real Property - Legals** dataset provides geographical data associated with a document with unique `document_id`. Furthermore, to extend this example in order for the user to find this document they would be given the search option of "DOCUMENT TYPE" from a select dropdown menu that contains all the values from the **Document Type Codes** dataset. Since the **Document Type Codes** are used on the front-end and have not changed in years it is more efficient to seed the database and test database with these values. This will reduce the number of API calls from my application. I've included entity relational diagrams below for each dataset that contain the schema which I copied directly into my own `sql` schema files.

### Dataset Index

Each dataset and its schema can be found below:

- [REAL_PROPERTY_MASTER](#real_property_master)
- [REAL_PROPERTY_LEGALS](#real_property_legals)
- [REAL_PROPERTY_PARTIES](#real_property_parties)
- [REAL_PROPERTY_REFERENCES](#real_property_references)
- [REAL_PROPERTY_REMARKS](#real_property_remarks)
- [PERSONAL_PROPERTY_MASTER](#real_property_master)
- [PERSONAL_PROPERTY_LEGALS](#real_property_legals)
- [PERSONAL_PROPERTY_PARTIES](#real_property_parties)
- [PERSONAL_PROPERTY_REFERENCES](#real_property_references)
- [PERSONAL_PROPERTY_REMARKS](#real_property_remarks)
- [DOCUMENT_TYPE_CODES](#document_type_codes)
- [UCC_COLLATERAL_CODES](#ucc_collateral_codes)
- [PROPERTY_TYPE_CODES](#property_type_codes)
- [STATE_CODES](#state_codes)
- [COUNTRY_CODES](#country_codes)

## Database Setup & SQL

### `snacris.sql` Overview

The `snacris.sql` file is a comprehensive script designed to set up and initialize the `snacris` and `snacris_test` databases. This script is essential for preparing the database environment for the project, ensuring that both the main and test databases are correctly configured with the necessary schema and seed data.

#### Key Functions of `snacris.sql`

**1. Database Creation and Connection:**

- The script begins by prompting the user to confirm the deletion and recreation of the `snacris` database.
- It then drops the existing `snacris` database (if it exists) and creates a new one.
- The script connects to the newly created `snacris` database.

**2. Schema Setup:**

- The script includes several schema files to define the structure of the database tables and relationships:
  - `snacris-users-schema.sql`: Defines the schema for user-related tables.
  - `schema/snacris-acris-real-property-schema.sql`: Defines the schema for real property-related tables.
  - `schema/snacris-acris-personal-property-schema.sql`: Defines the schema for personal property-related tables.
  - `schema/snacris-acris-code-mappings-schema.sql`: Defines the schema for code mappings used in the project.

**3. Data Seeding:**

- After setting up the schema, the script seeds the database with initial data using several seed files:
  - `seed/snacris-seed-users.sql`: Seeds the users table with initial data.
  - `seed/snacris-seed-acris-document-control-codes.sql`: Seeds the document control codes table.
  - `seed/snacris-seed-acris-ucc-collateral-type-codes.sql`: Seeds the UCC collateral type codes table.
  - `seed/snacris-seed-acris-property-type-codes.sql`: Seeds the property type codes table.
  - `seed/snacris-seed-acris-usa-state-codes.sql`: Seeds the USA state codes table.
  - `seed/snacris-seed-acris-country-codes.sql`: Seeds the country codes table.

**4. Test Database Setup:**

- The script repeats the process for the `snacris_test` database, ensuring that a separate test environment is available.
- It drops the existing `snacris_test` database (if it exists) and creates a new one.
- The script connects to the newly created `snacris_test` database.
- It includes the same schema and seed files to set up the test database identically to the main database.

#### Folder Structure

- **Schema Files:** Located in the `schema` folder, these files define the structure of the database tables.
- **Seed Files:** Located in the `seed` folder, these files contain the initial data to populate the database tables.
- **Utility Files:** Located in the `utils` folder, these files include json files associated with the **Code Mapping** dataset-group and their `sql` equivalent.

##### `convertJsonToSql.js` Overview

The `convertJsonToSql.js` file is a utility script designed to convert JSON data associated with the **Code Mapping** dataset-group into SQL insert statements. This script is particularly useful for preparing data to be inserted into a PostgreSQL database.

**Purpose**

The primary purpose of this script is to read JSON files containing ACRIS data, convert the data into SQL `INSERT` statements, and write the resulting SQL to an output file. This allows for easy and automated population of database tables with the provided data.

**Supported JSON Files:**

- Document Control Codes
- Property Type Codes
- UCC Collateral Codes
- USA State Codes
- Country Codes

**How to Execute the Script**

To run the script, use the following command in the terminal:

```bash
node convertJsonToSql.js <inputJsonFile> <outputSqlFile>
```

For example:

```bash
node convertJsonToSql.js acris-doc-control-codes.json acris-doc-control-codes-output.sql
node convertJsonToSql.js acris-property-type-codes.json acris-property-type-codes-output.sql
node convertJsonToSql.js acris-ucc-collateral-codes.json acris-ucc-collateral-codes-output.sql
node convertJsonToSql.js acris-usa-state-codes.json acris-usa-state-codes-output.sql
node convertJsonToSql.js acris-country-codes.json acris-country-codes-output.sql
```

Any `sql` file created from running the script will appear in the `utils` folder and replace any `sql` file with the same name. For example, running the command `node convertJsonToSql.js acris-doc-control-codes.json acris-doc-control-codes-output.sql` will overwrite an existing file named `acris-doc-control-codes-output.sql`. If such a file does not exist it will create it.

### Database Setup Instructions

- Create the **snacris** database using the `snacris.sql` file.

1. To set up the databases using the `snacris.sql` file, follow these steps:

- Open your terminal in Visual Studio Code (VSC) using WSL/Ubuntu.
- Ensure you have PostgreSQL installed and running. You can start PostgreSQL with the following command:

```bash
sudo service postgresql start
```

- Navigate to the directory containing the `snacris.sql file`. For example:

```bash
cd path/to/your/project
```

- Run the `snacris.sql` file using the `psql` command-line tool. This will execute the SQL commands in the file to set up your databases:

```
psql -U your_username -f snacris.sql
```

Remember to Replace `your_username` with your PostgreSQL username. You may be prompted to enter your password.

Follow the prompts in the terminal. Press Enter to proceed with deleting and recreating the databases or Control-C to cancel.

- After completing these steps, you should have both the **snacris** and **snacris_test** databases set up with the necessary schema and initial data.

## SQL Table Architecture Notes

The SQL folder contains a comprehensive database architecture designed to support the SNACRIS application's data requirements. The structure is organized into several key areas: schema definitions, seed data, utility scripts, and database management files.

### Folder Structure Overview

```
sql/
├── README.MD                           # This documentation
├── snacris.sql                         # Main database setup script
├── snacris-production.sql              # Production database setup
├── test-db-setup.sql                   # Test database configuration
├── supabase-migration.sql              # Supabase migration script
├── supabase-reset.sql                  # Supabase reset script
├── connect-to-supabase.sh             # Supabase connection utility
├── schema/                             # Table schema definitions
│   ├── README.MD                       # Schema documentation
│   ├── users.sql                       # User account tables
│   ├── organizations.sql               # Organization management tables
│   ├── organization_memberships.sql    # User-organization relationships
│   ├── user_favorites.sql             # User saved favorites
│   ├── acris_code_mappings_schema.sql # ACRIS code mapping tables
│   ├── saved_real_property_records.sql # Saved real property data
│   ├── saved_personal_property_records.sql # Saved personal property data
│   └── notes.sql                       # Additional notes
├── seed/                               # Initial data population
│   ├── seed_users.sql                  # User seed data
│   ├── seed_user_data.sql             # Additional user data
│   ├── seed_organizations.sql          # Organization seed data
│   ├── seed_acris_document_control_codes.sql
│   ├── seed_acris_property_type_codes.sql
│   ├── seed_acris_ucc_collateral_type_codes.sql
│   ├── seed_acris_usa_state_codes.sql
│   └── seed_acris_country_codes.sql
└── utils/                              # Utility scripts and data
    ├── convertJsonToSql.js            # JSON to SQL conversion utility
    ├── acris-*.json                   # Source JSON data files
    └── acris-*-output.sql             # Generated SQL files
```

### Core Database Tables

#### 1. User Management Tables

**`users`** - Core user account information

- Primary Key: `username` (VARCHAR(25))
- Fields: `password`, `first_name`, `last_name`, `email`, `is_admin`
- Email validation with position check for '@' symbol
- Admin flag for elevated permissions

**`organizations`** - Organization/company entities

- Primary Key: `id` (SERIAL)
- Fields: `name`, `description`, `created_by`, `created_at`, `is_active`
- Foreign Key: `created_by` references `users(username)`
- Unique constraint on organization name

**`organization_memberships`** - Many-to-many user-organization relationships

- Links users to organizations with membership details
- Supports role-based access within organizations

#### 2. User Preferences & Saved Data

**`user_favorites`** - User-saved information including:

- **`saved_party_names`**: Frequently searched party names
- **`saved_party_contacts`**: Complete contact information for parties
- Unique constraints prevent duplicate saves per user
- Optimized with indexes for name-based searches

#### 3. ACRIS Code Mapping Tables

**`document_control_codes`** - Document type classifications

- Fields: `doc_type`, `doc_type_description`, `class_code_description`
- Party type classifications (party1_type, party2_type, party3_type)

**`property_type_codes`** - Property classification codes

- Maps 2-character codes to property descriptions

**`ucc_collateral_codes`** - UCC collateral type classifications

- Single character codes for personal property collateral types

**`state_codes`** - US state abbreviations and names

- 2-character state codes with full state names

**`country_codes`** - International country classifications

- Country codes used in ACRIS address data

#### 4. Saved ACRIS Data Tables

**Real Property Records:**

- **`saved_real_property_master`**: Core document information

  - Document ID, recording details, financial amounts
  - User-specific saves with cascade deletion
  - Unique constraint per user-document combination

- **`saved_real_property_legals`**: Property geographic details

  - Borough-Block-Lot (BBL) information
  - Property addresses and legal descriptions
  - Indexed on BBL for efficient lookups

- **`saved_real_property_parties`**: Transaction participants

  - Buyer, seller, and attorney information
  - Contact details and party types

- **`saved_real_property_references`**: Document cross-references

  - Links to related documents and transactions

- **`saved_real_property_remarks`**: Additional document notes
  - Free-form text remarks and comments

**Personal Property Records:**

- Similar structure to real property but for personal property transactions
- Includes UCC filings and personal property liens

### Database Architecture Principles

#### 1. Data Integrity

- **Foreign Key Constraints**: Enforce referential integrity across tables
- **Cascade Deletions**: User data cleanup when accounts are deleted
- **Unique Constraints**: Prevent duplicate records where appropriate
- **Check Constraints**: Validate data formats (e.g., email validation)

#### 2. Performance Optimization

- **Strategic Indexing**: BBL lookups, name searches, date ranges
- **Serial Primary Keys**: Efficient joins and lookups
- **Appropriate Data Types**: Optimized storage for each field type

#### 3. User Data Isolation

- **User-Scoped Data**: Most tables include username foreign keys
- **Unique Constraints**: Prevent duplicate user-specific records
- **Cascade Operations**: Clean data removal when users are deleted

#### 4. ACRIS Data Integration

- **Normalized Code Tables**: Separate tables for lookup values
- **Document Relationships**: Maintain ACRIS document structure
- **Flexible Schema**: Accommodate varying ACRIS data formats

### Data Flow Architecture

1. **Code Mappings**: Seeded once from NYC Open Data
2. **User Data**: Created and managed through application
3. **ACRIS Saves**: User-initiated saves from external API data
4. **Relationships**: Maintained through foreign key constraints

### Utility Scripts

#### `convertJsonToSql.js`

- Converts NYC Open Data JSON to SQL INSERT statements
- Processes all ACRIS code mapping datasets
- Generates seed files for database initialization

#### Database Management Scripts

- **`snacris.sql`**: Complete database setup (development)
- **`test-db-setup.sql`**: Test environment configuration
- **`supabase-*.sql`**: Cloud database management
- **`connect-to-supabase.sh`**: Cloud connection utility

### Seed Data Strategy

#### Code Mappings (Static Data)

- Document control codes
- Property type codes
- UCC collateral codes
- State and country codes
- Seeded once during database initialization

#### Test Data

- Sample users and organizations
- Representative ACRIS data for testing
- Maintained separately from production data

### Production Considerations

#### Security

- Password hashing (handled at application level)
- SQL injection prevention through parameterized queries
- User data isolation and access controls

#### Scalability

- Indexed columns for common query patterns
- Efficient relationship modeling
- Partitioning considerations for large ACRIS datasets

#### Backup & Recovery

- Schema versioning through SQL files
- Seed data preservation
- Migration scripts for schema updates

This architecture provides a robust foundation for the SNACRIS application, supporting both user management and complex ACRIS data operations while maintaining data integrity and performance.
