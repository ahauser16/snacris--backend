# CODE MAPS OF ACRIS DATASET API NOTES

The Code Maps APIs provide data that is used to query the ACRIS-Real Property and ACRIS-Personal Property datasets.  Each of the datasets below has been downloaded and seeded into the SNACRIS and SNACRIS_TEST databases.  The purpose of making GET requests to these five APIs is to regularly check that each dataset has not been changed or updated.  The goal of this `code-mappings` folder is to create tests that test not just the success of making a GET request but to compare the API response object against the following psql tables which are located in the `sql` > `schema` folder: `document_control_codes`, `ucc_collateral_codes`, `property_type_codes`, `state_codes` and `country_codes`.

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