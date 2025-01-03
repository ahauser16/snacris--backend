# SNACRIS sql, database and dataset notes

The following are notes associated with how the `snacris.sql` and related files in the `sql` folder were created, how they are organized and should be maintained as well as notes about how to seed the database.

## Datasets Overview

SNACRIS relies on data from 15 datasets hosted by the NYC Open Data API which is powered by Socrata.  These datasets can be divided into 3 groups: **Real Property**, **Personal Property** and **Code Mappings** (each referred to as a "dataset-group" or collectively as the "dataset-groups").  The **Code Mappings** dataset-group contains datasets that provide necessary data to query the other **Real Property** and **Personal Property** datasets.  The **Code Mappings** dataset-group contains the following datasets: **Document Type Codes**, **Property Type Codes**, **UCC Collateral Codes**, **USA State Codes** and **Country Codes**.  Note Well: the **UCC Collateral Codes** are only associated with the **Personal Property** dataset-group.  

The **Real Property** and **Personal Property** dataset-groups each follow the same schema of having the following dataset names: **Master**, **LEGALS**, **PARTIES**, **REFERENCES** and **REMARKS**.  Within each dataset-group each dataset can be cross-referenced with another dataset using the `document_id` field which represents a document that was recorded with the NYC Department of Finance such as a "deed" or "mortgage".  For example, the **Real Property - Master** dataset provides an overview of a document whereas the **Real Property - Legals** dataset provides geographical data associated with a document with unique `document_id`.  Furthermore, to extend this example in order for the user to find this document they would be given the search option of "DOCUMENT TYPE" from a select dropdown menu that contains all the values from the **Document Type Codes** dataset.  Since the **Document Type Codes** are used on the front-end and have not changed in years it is more efficient to seed the database and test database with these values.  This will reduce the number of API calls from my application.  I've included entity relational diagrams below for each dataset that contain the schema which I copied directly into my own `sql` schema files. 

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

Any `sql` file created from running the script will appear in the `utils` folder and replace any `sql` file with the same name.  For example, running the command `node convertJsonToSql.js acris-doc-control-codes.json acris-doc-control-codes-output.sql` will overwrite an existing file named `acris-doc-control-codes-output.sql`.  If such a file does not exist it will create it. 

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

### REAL_PROPERTY_MASTER
#### NYC Open Data URL: http://data.cityofnewyork.us/City-Government/ACRIS-Real-Property-Master/bnx9-e6tj
#### NYS OPEN DATA Name: ACRIS - Real Property Master
#### NYS OPEN DATA Description: Document Details for Real Property Related Documents Recorded in ACRIS
#### API Endpoint URL: https://data.cityofnewyork.us/resource/bnx9-e6tj.json

```mermaid
erDiagram
    ACRIS_REAL_PROPERTY_MASTER {
        TEXT document_id "16 characters, Format: CCCNNNNNNNNNNNNN"
        TEXT record_type "1 character, Format: ‘A’ for master record"
        TEXT crfn "13 characters, Format: YYYYNNNNNNNNN"
        NUMBER recorded_borough "1 character, 1=Manhattan, 2=Bronx, 3=Brooklyn, 4=Queens, 5=Staten Island"
        TEXT doc_type "8 characters, Specific type of instrument"
        TEXT document_date "10 characters, Format: MM/DD/YYYY"
        NUMBER document_amt "16 digits with 2 decimal places, Total consideration for transfers"
        TEXT recorded_datetime "10 characters, Format: MM/DD/YYYY"
        TEXT modified_date "10 characters, Format: MM/DD/YYYY"
        NUMBER reel_yr "4 digits, Pre-ACRIS reel year"
        NUMBER reel_nbr "5 digits, Pre-ACRIS reel number"
        NUMBER reel_pg "5 digits, Pre-ACRIS reel page"
        NUMBER percent_trans "9 digits with 6 decimal places, Percentage of interest transferred"
        TEXT good_through_date "10 characters, Format: MM/DD/YYYY"
    }
```

[BACK TO TOC](#dataset-index)

---

### REAL_PROPERTY_LEGALS
#### NYC Open Data URL: https://data.cityofnewyork.us/City-Government/ACRIS-Real-Property-Legals/8h5j-fqxa/about_data
#### NYS OPEN DATA Name: ACRIS - Real Property Legals
#### NYS OPEN DATA Description: Property Details for Real Property Related Documents Recorded in ACRIS
#### API Endpoint URL: https://data.cityofnewyork.us/resource/8h5j-fqxa.json

```mermaid
erDiagram
    ACRIS_REAL_PROPERTY_LEGALS {
        TEXT document_id "16 characters, Format: CCCNNNNNNNNNNNNN"
        TEXT record_type "1 character,  ‘L’ for lot record"
        NUMBER borough "1 digit, 1=Manhattan, 2=Bronx, 3=Brooklyn, 4=Queens, 5=Staten Island"
        NUMBER block "5 digits, Block number of instrument"
        NUMBER lot "4 digits, Lot number of instrument"
        TEXT easement "1 character, Y=yes, N=no"
        TEXT partial_lot "1 character, P=partial, E=entire, N=not applicable"
        TEXT air_rights "1 character, Y=yes, N=no"
        TEXT subterranean_rights "1 character, Y=yes, N=no"
        TEXT property_type "2 characters, Code defined in property codes record"
        TEXT street_number "12 characters, Street / House Number for BBL"
        TEXT street_name "32 characters, Street Name for BBL"
        TEXT unit "7 characters, Unit Number for BBL"
        TEXT good_through_date "10 characters, Format: MM/DD/YYYY"
    }
```

[BACK TO TOC](#dataset-index)

---

### REAL_PROPERTY_PARTIES

#### NYC Open Data URL: https://data.cityofnewyork.us/City-Government/ACRIS-Real-Property-Parties/636b-3b5g/about_data
#### NYS OPEN DATA Name: ACRIS - Real Property Parties
#### NYS OPEN DATA Description: Party Names for Real Property Related Documents Recorded in ACRIS
#### API Endpoint URL: https://data.cityofnewyork.us/resource/636b-3b5g.json

```mermaid
erDiagram
    ACRIS_REAL_PROPERTY_PARTIES {
        TEXT document_id "16 characters, Format: CCCNNNNNNNNNNNNN"
        TEXT record_type "1 character, ‘P’ for party record"
        TEXT party_type "1 character, Party type code"
        TEXT name "70 characters, Name of party (typically last name, first name, middle initial suffix for individuals)"
        TEXT address_1 "60 characters, Name attention/address of party"
        TEXT address_2 "60 characters, Street address of party"
        TEXT country "2 characters, Country location of party"
        TEXT city "30 characters, City location of party"
        TEXT state "2 characters, State location of party"
        TEXT zip "9 characters, Zip code of party"
        TEXT good_through_date "10 characters, Format: MM/DD/YYYY"
    }
```
[BACK TO TOC](#dataset-index)
---

### REAL_PROPERTY_REFERENCES
#### NYC Open Data URL: https://data.cityofnewyork.us/City-Government/ACRIS-Real-Property-References/pwkr-dpni/about_data
#### NYS OPEN DATA Name: ACRIS - Real Property References
#### NYS OPEN DATA Description: Document Cross References for Real Property Related Documents Recorded in ACRIS
#### API Endpoint URL: https://data.cityofnewyork.us/resource/pwkr-dpni.json

```mermaid
erDiagram
    ACRIS_REAL_PROPERTY_REFERENCES {
        TEXT document_id "16 characters, Format: CCCNNNNNNNNNNNN - Document ID of Document making the Reference"
        TEXT record_type "1 character, ‘X’ for cross reference record"
        TEXT reference_by_crfn_ "13 characters, CRFN of Referenced Document"
        TEXT reference_by_doc_id "16 characters, Document ID of Referenced Document"
        NUMBER reference_by_reel_year "4 digits, Year of reel/page reference"
        NUMBER reference_by_reel_borough "1 digit, Borough of reel/page reference"
        NUMBER reference_by_reel_nbr "5 digits, Reel of reel/page reference"
        NUMBER reference_by_reel_page "5 digits, Page of reel/page reference"
        TEXT good_through_date "10 characters, Format: MM/DD/YYYY"
    }
```
[BACK TO TOC](#dataset-index)
---

### REAL_PROPERTY_REMARKS
#### NYC Open Data URL: https://data.cityofnewyork.us/City-Government/ACRIS-Real-Property-Remarks/9p4w-7npp/about_data
#### NYS OPEN DATA Name: ACRIS - Real Property Remarks
#### NYS OPEN DATA Description: Document Remarks for Real Property Related Documents Recorded in ACRIS
#### API Endpoint URL: https://data.cityofnewyork.us/resource/9p4w-7npp.json

```mermaid
erDiagram
    ACRIS_REAL_PROPERTY_REMARKS {
        TEXT document_id "16 characters, Format: CCCNNNNNNNNNNNN - Document ID of Document making the Reference"
        TEXT record_type "1 character, ‘R’ for remarks record"
        NUMBER sequence_number "2 digits, Number from 1-20"
        TEXT remark_text "232 characters, Portion of Remark for Given Sequence"
        TEXT good_through_date "10 characters, Format: MM/DD/YYYY"
    }
```
[BACK TO TOC](#dataset-index)
---

### PERSONAL_PROPERTY_MASTER
#### NYC Open Data URL: https://data.cityofnewyork.us/City-Government/ACRIS-Personal-Property-Master/sv7x-dduq/about_data
#### NYS OPEN DATA Name: ACRIS - Personal Property Master
#### NYS OPEN DATA Description: Document Details for Personal Property Related Documents Recorded in ACRIS
#### API Endpoint URL: https://data.cityofnewyork.us/resource/sv7x-dduq.json

```mermaid
erDiagram
    ACRIS_PERSONAL_PROPERTY_MASTER {
        TEXT document_id "Document Identifier"
        TEXT record_type "A for Master Record"
        TEXT crfn "City Register File Number (CRFN)"
        NUMBER recorded_borough "Borough where document was recorded"
        TEXT doc_type "Specific type of instrument"
        NUMBER document_amt "Principal debt or obligation"
        DATETIME recorded_datetime "Legal date instrument was recorded"
        TEXT ucc_collateral "UCC Collateral code"
        TEXT fedtax_serial_nbr "Federal Tax Lien Serial Number"
        DATETIME fedtax_assessment_date "Federal tax Lien Assessment Date"
        NUMBER rpttl_nbr "Real Property Transfer Tax Return Number (RPTT #)"
        DATETIME modified_date "Date document was modified"
        NUMBER reel_yr "Pre-ACRIS reel year"
        NUMBER reel_nbr "Pre-ACRIS reel number"
        NUMBER reel_pg "Pre-ACRIS reel page"
        TEXT file_nbr "Pre-ACRIS file number"
        DATETIME good_through_date "Date of latest recording or correction included with this extract"
    }
```
[BACK TO TOC](#dataset-index)
---

### PERSONAL_PROPERTY_LEGALS
#### NYC Open Data URL: https://data.cityofnewyork.us/City-Government/ACRIS-Personal-Property-Legals/uqqa-hym2/about_data
#### NYS OPEN DATA Name: ACRIS - Personal Property Legals
#### NYS OPEN DATA Description: Property Details for Personal Property Related Documents Recorded in ACRIS
#### API Endpoint URL: https://data.cityofnewyork.us/resource/uqqa-hym2.json

```mermaid
erDiagram
    ACRIS_PERSONAL_PROPERTY_LEGALS {
        TEXT document_id "Document identifier"
        TEXT record_type "L for Legals Record"
        NUMBER borough "Borough Code: 1 = Manhattan, 2 = Bronx, 3 = Brooklyn, 4 = Queens"
        NUMBER block "Block number of instrument"
        NUMBER lot "Lot number of instrument"
        TEXT easement "Y = yes, N = no"
        TEXT partial_lot "P = partial, E = entire"
        TEXT air_rights "Y = yes, N = no"
        TEXT subterranean_rights "Y = yes, N = no"
        TEXT property_type "Code defined in property table"
        TEXT street_number "Street number for BBL"
        TEXT street_name "Street name for BBL"
        TEXT addr_unit "Unit number for BBL"
        DATETIME good_through_date "Date of latest recording or correction"
    }

```
[BACK TO TOC](#dataset-index)
---

### PERSONAL_PROPERTY_PARTIES
#### NYC Open Data URL: https://data.cityofnewyork.us/City-Government/ACRIS-Personal-Property-Parties/nbbg-wtuz/about_data
#### NYS OPEN DATA Name: ACRIS - Personal Property Parties
#### NYS OPEN DATA Description: Party Names for Personal Property Related Documents Recorded in ACRIS
#### API Endpoint URL: https://data.cityofnewyork.us/resource/nbbg-wtuz.json

```mermaid
erDiagram
    ACRIS_PERSONAL_PROPERTY_PARTIES {
        TEXT document_id "Document Identifier"
        TEXT record_type "P for Parties Record"
        TEXT party_type "Party type code"
        TEXT name "Name of party (last name, first name MI)"
        TEXT address_1 "Name attention/address of party"
        TEXT address_2 "Street address of party"
        TEXT country "Country location of party"
        TEXT city "City location of party"
        TEXT state "State location of party"
        TEXT zip "Zip code of party"
        DATETIME good_through_date "Date of latest recording or correction included with this extract"
    }
```
[BACK TO TOC](#dataset-index)
---

### PERSONAL_PROPERTY_REFERENCES
#### NYC Open Data URL: https://data.cityofnewyork.us/City-Government/ACRIS-Personal-Property-References/6y3e-jcrc/about_data
#### NYS OPEN DATA Name: ACRIS - Personal Property References
#### NYS OPEN DATA Description: Document Remarks for Personal Property Related Documents Recorded in ACRIS
#### API Endpoint URL: https://data.cityofnewyork.us/resource/6y3e-jcrc.json

```mermaid
erDiagram
    ACRIS_PERSONAL_PROPERTY_REFERENCES {
        TEXT document_id "Document Identifier"
        TEXT record_type "X for Cross Reference Record"
        TEXT crfn "City Register File Number"
        TEXT doc_id_ref "Doc ID of reference"
        TEXT file_nbr "File number of reference"
        DATETIME good_through_date "Date of latest recording or correction included with this extract"
    }
```
[BACK TO TOC](#dataset-index)
---

### PERSONAL_PROPERTY_REMARKS
#### NYC Open Data URL: https://data.cityofnewyork.us/City-Government/ACRIS-Personal-Property-Remarks/fuzi-5ks9/about_data
#### NYS OPEN DATA Name: ACRIS - Personal Property Remarks
#### NYS OPEN DATA Description: Document Remarks for Personal Property Related Documents Recorded in ACRIS
#### API Endpoint URL: https://data.cityofnewyork.us/resource/fuzi-5ks9.json

```mermaid
erDiagram
    ACRIS_PERSONAL_PROPERTY_REMARKS {
        TEXT document_id "Document Identifier"
        TEXT record_type "R for Remarks Record"
        NUMBER sequence_number "Number from 1-20"
        TEXT remark_text "Remarks"
        DATETIME good_through_date "Date of latest recording or correction included with this extract"
    }
```
[BACK TO TOC](#dataset-index)
---

### DOCUMENT_TYPE_CODES
#### NYC Open Data URL: https://data.cityofnewyork.us/City-Government/ACRIS-Document-Control-Codes/7isb-wh4c/about_data
#### NYS OPEN DATA Name: ACRIS - Document Control Codes
#### NYS OPEN DATA Description: ACRIS Document Type and Class Code mappings for Codes in the ACRIS Real and Personal Property Master Datasets
#### API Endpoint URL: https://data.cityofnewyork.us/resource/7isb-wh4c.json

```mermaid
erDiagram
    DOCUMENT_CONTROL {
        TEXT record_type "‘D’ for Document control type record"
        TEXT doc__type "Doc_type code is 8 characters or less"
        TEXT doc__type_description "Document type description is 30 characters or less"
        TEXT class_code_description "Document class description is 30 characters or less"
        TEXT party1_type "Party type 1 name for this document type and is 20 characters or less"
        TEXT party2_type "Party type 2 name for this document type and is 20 characters or less"
        TEXT party3_type "Party type 3 name for this document type and is 20 characters or less"
    }
```
[BACK TO TOC](#dataset-index)
---

### UCC_COLLATERAL_CODES
#### NYC Open Data URL: https://data.cityofnewyork.us/City-Government/ACRIS-UCC-Collateral-Codes/q9kp-jvxv/about_data
#### NYS OPEN DATA Name: ACRIS - UCC Collateral Codes
#### NYS OPEN DATA Description: ACRIS Collateral Type mapping for Codes in the ACRIS Personal Property Master Dataset
#### API Endpoint URL: https://data.cityofnewyork.us/resource/q9kp-jvxv.json
```mermaid
erDiagram
    UCC_COLLATERAL {
        TEXT record_type "‘U’ for Collateral codes record"
        TEXT ucc_collateral_code "UCC Collateral code is 1 character"
        TEXT description "UCC Collateral description is 50 characters or less"
    }
```
[BACK TO TOC](#dataset-index)
---

### PROPERTY_TYPE_CODES
#### NYC Open Data URL: https://data.cityofnewyork.us/City-Government/ACRIS-Property-Types-Codes/94g4-w6xz/about_data
#### NYS OPEN DATA Name: ACRIS - Property Types Codes
#### NYS OPEN DATA Description: ACRIS State mapping for Codes in the ACRIS Real and Personal Property Legals Datasets
#### API Endpoint URL: https://data.cityofnewyork.us/resource/94g4-w6xz.json
```mermaid
erDiagram
    PROPERTY_TYPE_RECORD {
        TEXT record_type "‘G’ for Property type record"
        TEXT property_type "Property_type code is 2 characters or less"
        TEXT description "Property type description is 40 characters or less"
    }
```
[BACK TO TOC](#dataset-index)
---

### STATE_CODES
#### NYC Open Data URL: https://data.cityofnewyork.us/City-Government/ACRIS-State-Codes/5c9e-33xj/about_data
#### NYS OPEN DATA Name: ACRIS - State Codes
#### NYS OPEN DATA Description: ACRIS State mapping for Codes in the ACRIS Real and Personal Parties Property Datasets
#### API Endpoint URL: https://data.cityofnewyork.us/resource/5c9e-33xj.json
```mermaid
erDiagram
    STATE_CODES {
        TEXT record_type "‘S’ for State codes type record"
        TEXT state_code "State code is 2 characters or less"
        TEXT description "State name is 20 characters or less"
    }
```
[BACK TO TOC](#dataset-index)
---

### COUNTRY_CODES
#### NYC Open Data URL: https://data.cityofnewyork.us/City-Government/ACRIS-Country-Codes/j2iz-mwzu/about_data
#### NYS OPEN DATA Name: ACRIS - Country Codes
#### NYS OPEN DATA Description: ACRIS Countries mapping for Codes in the ACRIS Real and Personal Parties Property Datasets
#### API Endpoint URL: https://data.cityofnewyork.us/resource/j2iz-mwzu.json
```mermaid
erDiagram
    COUNTRY_TYPE_RECORD {
        TEXT record_type "‘T’ for Country type record"
        TEXT country_code "Country code is 2 characters or less"
        TEXT description "Country name is 20 characters or less"
    }
```
[BACK TO TOC](#dataset-index)