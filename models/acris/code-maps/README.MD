# ACRIS CODE MAPPING DATASETS

### Code Mappings - Document Control Codes

```mermaid
erDiagram
    DOCUMENT_CONTROL {
        TEXT record_type "‘D’ for Document control type record"
        TEXT doc__type "Doc type code (≤8 characters)"
        TEXT doc__type_description "Document type description (≤30 characters)"
        TEXT class_code_description "Document class description (≤30 characters)"
        TEXT party1_type "Party type 1 (≤20 characters)"
        TEXT party2_type "Party type 2 (≤20 characters)"
        TEXT party3_type "Party type 3 (≤20 characters)"
    }
    REAL_PROPERTY_MASTER {
        TEXT document_id "Primary key (16 characters)"
        TEXT doc_type "Foreign key to DOCUMENT_CONTROL"
    }
    PERSONAL_PROPERTY_MASTER {
        TEXT document_id "Primary key (16 characters)"
        TEXT doc_type "Foreign key to DOCUMENT_CONTROL"
    }
    REAL_PROPERTY_PARTIES {
        TEXT document_id "Foreign key to REAL_PROPERTY_MASTER"
        TEXT party_type "Indicates party role (1=party1, 2=party2, 3=party3)"
    }
    PERSONAL_PROPERTY_PARTIES {
        TEXT document_id "Foreign key to PERSONAL_PROPERTY_MASTER"
        TEXT party_type "Indicates party role (1=party1, 2=party2, 3=party3)"
    }
    DOCUMENT_CONTROL ||--|| REAL_PROPERTY_MASTER : "doc_type"
    DOCUMENT_CONTROL ||--|| PERSONAL_PROPERTY_MASTER : "doc_type"
    DOCUMENT_CONTROL ||--o| REAL_PROPERTY_PARTIES : "party1_type, party2_type, party3_type"
    DOCUMENT_CONTROL ||--o| PERSONAL_PROPERTY_PARTIES : "party1_type, party2_type, party3_type"
    REAL_PROPERTY_MASTER ||--|| REAL_PROPERTY_PARTIES : "document_id"
    PERSONAL_PROPERTY_MASTER ||--|| PERSONAL_PROPERTY_PARTIES : "document_id"
```

### Code Mappings - UCC Collateral Codes

```mermaid
erDiagram
    PERSONAL_PROPERTY_MASTER {
        TEXT document_id "Primary Key - Document Identifier"
        TEXT record_type "Record type (A = Master Record)"
        TEXT doc_type "Specific type of instrument"
        NUMBER document_amt "Principal debt or obligation"
        DATETIME recorded_datetime "Date instrument was recorded"
        TEXT ucc_collateral "Foreign Key - UCC Collateral Code"
    }
    UCC_COLLATERAL {
        TEXT record_type "Record type (U = Collateral codes record)"
        TEXT ucc_collateral_code "Primary Key - UCC Collateral Code"
        TEXT description "UCC Collateral description (≤50 characters)"
    }
    PERSONAL_PROPERTY_MASTER ||--|| UCC_COLLATERAL : "ucc_collateral"
```

### Code Mappings - Property Type Codes

```mermaid
erDiagram
    PROPERTY_TYPE {
        TEXT record_type "‘G’ for Property type record"
        TEXT property_type "Primary Key - Property type code (≤2 characters)"
        TEXT description "Property type description (≤40 characters)"
    }

    REAL_PROPERTY_LEGALS {
        TEXT document_id "Primary Key - Document Identifier"
        TEXT record_type "‘L’ for Lot Record"
        NUMBER borough "Borough Code (1-5)"
        NUMBER block "Block number"
        NUMBER lot "Lot number"
        TEXT easement "Y=yes, N=no"
        TEXT partial_lot "P=partial, E=entire, N=N/A"
        TEXT air_rights "Y=yes, N=no"
        TEXT subterranean_rights "Y=yes, N=no"
        TEXT property_type "Foreign Key - Property type code"
        TEXT street_number "Street number"
        TEXT street_name "Street name"
        TEXT unit "Unit number"
        TEXT good_through_date "Record validity date"
    }

    PERSONAL_PROPERTY_LEGALS {
        TEXT document_id "Primary Key - Document Identifier"
        TEXT record_type "‘L’ for Legals Record"
        NUMBER borough "Borough Code (1-5)"
        NUMBER block "Block number"
        NUMBER lot "Lot number"
        TEXT easement "Y=yes, N=no"
        TEXT partial_lot "P=partial, E=entire"
        TEXT air_rights "Y=yes, N=no"
        TEXT subterranean_rights "Y=yes, N=no"
        TEXT property_type "Foreign Key - Property type code"
        TEXT street_number "Street number"
        TEXT street_name "Street name"
        TEXT addr_unit "Unit number"
        DATETIME good_through_date "Record validity date"
    }

    %% Relationships based on shared property_type field
    PROPERTY_TYPE ||--|| REAL_PROPERTY_LEGALS : "property_type"
    PROPERTY_TYPE ||--|| PERSONAL_PROPERTY_LEGALS : "property_type"
```

### Code Mappings - State (USA) Codes

```mermaid
erDiagram
    STATE_CODES {
        TEXT record_type "‘S’ for State codes type record"
        TEXT state_code "Primary Key - State code (≤2 characters)"
        TEXT description "State name (≤20 characters)"
    }
    REAL_PROPERTY_PARTIES {
        TEXT document_id "Primary Key - Document Identifier"
        TEXT record_type "‘P’ for Party Record"
        TEXT party_type "Party type code"
        TEXT name "Name of party"
        TEXT address_1 "Attention/address of party"
        TEXT address_2 "Street address of party"
        TEXT country "Country code"
        TEXT city "City name"
        TEXT state "Foreign Key - State code"
        TEXT zip "Zip code"
        TEXT good_through_date "Record validity date"
    }
    PERSONAL_PROPERTY_PARTIES {
        TEXT document_id "Primary Key - Document Identifier"
        TEXT record_type "‘P’ for Party Record"
        TEXT party_type "Party type code"
        TEXT name "Name of party"
        TEXT address_1 "Attention/address of party"
        TEXT address_2 "Street address of party"
        TEXT country "Country code"
        TEXT city "City name"
        TEXT state "Foreign Key - State code"
        TEXT zip "Zip code"
        DATETIME good_through_date "Record validity date"
    }
    STATE_CODES ||--|| REAL_PROPERTY_PARTIES : "state"
    STATE_CODES ||--|| PERSONAL_PROPERTY_PARTIES : "state"
```

### Code Mappings - Country Codes

```mermaid
erDiagram
    COUNTRY_CODES {
        TEXT record_type "‘T’ for Country type record"
        TEXT country_code "Primary Key - Country code (≤2 characters)"
        TEXT description "Country name (≤20 characters)"
    }
    REAL_PROPERTY_PARTIES {
        TEXT document_id "Primary Key - Document Identifier"
        TEXT record_type "‘P’ for Party Record"
        TEXT party_type "Party type code"
        TEXT name "Name of party"
        TEXT address_1 "Attention/address of party"
        TEXT address_2 "Street address of party"
        TEXT country "Foreign Key - Country code"
        TEXT city "City name"
        TEXT state "State code"
        TEXT zip "Zip code"
        TEXT good_through_date "Record validity date"
    }
    PERSONAL_PROPERTY_PARTIES {
        TEXT document_id "Primary Key - Document Identifier"
        TEXT record_type "‘P’ for Party Record"
        TEXT party_type "Party type code"
        TEXT name "Name of party"
        TEXT address_1 "Attention/address of party"
        TEXT address_2 "Street address of party"
        TEXT country "Foreign Key - Country code"
        TEXT city "City name"
        TEXT state "State code"
        TEXT zip "Zip code"
        DATETIME good_through_date "Record validity date"
    }
    COUNTRY_CODES ||--|| REAL_PROPERTY_PARTIES : "country"
    COUNTRY_CODES ||--|| PERSONAL_PROPERTY_PARTIES : "country"
```