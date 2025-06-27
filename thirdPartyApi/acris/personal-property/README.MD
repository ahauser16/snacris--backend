# ACRIS PERSONAL PROPERTY DATASET API 

## Table of Contents

- [Personal Property (Overview)](#personal-property-overview)
    - [PERSONAL_PROPERTY_MASTER](#personal_property_master)
    - [PERSONAL_PROPERTY_LEGALS](#personal_property_legals)
    - [PERSONAL_PROPERTY_PARTIES](#personal_property_parties)
    - [PERSONAL_PROPERTY_REFERENCES](#personal_property_references)
    - [PERSONAL_PROPERTY_REMARKS](#personal_property_remarks)

## Personal Property (Overview)

```mermaid
erDiagram
        PERSONAL_PROPERTY_MASTER {
                TEXT document_id "primary key"
        }
        PERSONAL_PROPERTY_LEGALS {
                TEXT document_id "foreign key"
        }
        PERSONAL_PROPERTY_PARTIES {
                TEXT document_id "foreign key"
        }
        PERSONAL_PROPERTY_REFERENCES {
                TEXT document_id "foreign key"
        }
        PERSONAL_PROPERTY_REMARKS {
                TEXT document_id "foreign key"
        }
        PERSONAL_PROPERTY_MASTER ||--|| PERSONAL_PROPERTY_LEGALS : "document_id"
        PERSONAL_PROPERTY_MASTER ||--|| PERSONAL_PROPERTY_PARTIES : "document_id"
        PERSONAL_PROPERTY_MASTER ||--|| PERSONAL_PROPERTY_REFERENCES : "document_id"
        PERSONAL_PROPERTY_MASTER ||--|| PERSONAL_PROPERTY_REMARKS : "document_id"
```

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