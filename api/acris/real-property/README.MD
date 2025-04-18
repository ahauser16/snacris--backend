# ACRIS REAL PROPERTY DATASET API NOTES

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