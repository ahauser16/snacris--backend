# REAL PROPERTY API NOTES

## Table of Contents

- [REAL PROPERTY API NOTES](#real-property-api-notes)
  - [Table of Contents](#table-of-contents)
  - [API File Architecture](#api-file-architecture)
    - [`fetchAcrisRecords`](#fetchacrisrecords)
      - [Purpose](#purpose)
      - [How It Works](#how-it-works)
      - [Pagination Logic](#pagination-logic)
      - [Examples](#examples)
      - [Behavior](#behavior)
    - [`fetchAcrisRecordCount`](#fetchacrisrecordcount)
      - [Purpose](#purpose-1)
      - [How It Works](#how-it-works-1)
      - [Examples](#examples-1)
      - [Behavior](#behavior-1)
    - [`fetchAcrisDocumentIds`](#fetchacrisdocumentids)
      - [Purpose](#purpose-2)
      - [How It Works](#how-it-works-2)
      - [Pagination Logic](#pagination-logic-1)
      - [Example:](#example)
      - [Behavior](#behavior-2)
    - [Search By Parcel \& `fetchAcrisDocumentIdsCrossRef`](#search-by-parcel--fetchacrisdocumentidscrossref)
      - [refactor notes on 6/10/25](#refactor-notes-on-61025)
        - [TEST 1 - SUCCESS - BBL + recorded\_date\_range: 'to-current-date-default' + doc\_class: 'DEEDS AND OTHER CONVEYANCES'](#test-1---success---bbl--recorded_date_range-to-current-date-default--doc_class-deeds-and-other-conveyances)
        - [TEST 2 - FAILED - BBL + recorded\_date\_range: 'to-current-date-default' + doc\_class: 'MORTGAGES \& INSTRUMENTS'/'UCC AND FEDERAL LIENS'/'OTHER DOCUMENTS'](#test-2---failed---bbl--recorded_date_range-to-current-date-default--doc_class-mortgages--instrumentsucc-and-federal-liensother-documents)
      - [Purpose](#purpose-3)
      - [How It Works](#how-it-works-3)
      - [Pagination Logic](#pagination-logic-2)
      - [Example](#example-1)
      - [Behavior](#behavior-3)
      - [Combined Example: Using `MasterRealPropApi` and `PartiesRealPropApi`](#combined-example-using-masterrealpropapi-and-partiesrealpropapi)
  - [`MasterRealPropApi`](#masterrealpropapi)
    - [NYC Open Data URL: http://data.cityofnewyork.us/City-Government/ACRIS-Real-Property-Master/bnx9-e6tj](#nyc-open-data-url-httpdatacityofnewyorkuscity-governmentacris-real-property-masterbnx9-e6tj)
    - [NYS OPEN DATA Name: ACRIS - Real Property Master](#nys-open-data-name-acris---real-property-master)
    - [NYS OPEN DATA Description: Master document Details for Real Property Related Documents Recorded in ACRIS](#nys-open-data-description-master-document-details-for-real-property-related-documents-recorded-in-acris)
    - [API Endpoint URL: https://data.cityofnewyork.us/resource/bnx9-e6tj.json](#api-endpoint-url-httpsdatacityofnewyorkusresourcebnx9-e6tjjson)
  - [`LegalsRealPropApi`](#legalsrealpropapi)
    - [NYC Open Data URL: https://data.cityofnewyork.us/City-Government/ACRIS-Real-Property-Legals/8h5j-fqxa/about\_data](#nyc-open-data-url-httpsdatacityofnewyorkuscity-governmentacris-real-property-legals8h5j-fqxaabout_data)
    - [NYS OPEN DATA Name: ACRIS - Real Property Legals](#nys-open-data-name-acris---real-property-legals)
    - [NYS OPEN DATA Description: Property Details for Real Property Related Documents Recorded in ACRIS](#nys-open-data-description-property-details-for-real-property-related-documents-recorded-in-acris)
    - [API Endpoint URL: https://data.cityofnewyork.us/resource/8h5j-fqxa.json](#api-endpoint-url-httpsdatacityofnewyorkusresource8h5j-fqxajson)
  - [`PartiesRealPropApi`](#partiesrealpropapi)
    - [NYC Open Data URL: https://data.cityofnewyork.us/City-Government/ACRIS-Real-Property-Parties/636b-3b5g/about\_data](#nyc-open-data-url-httpsdatacityofnewyorkuscity-governmentacris-real-property-parties636b-3b5gabout_data)
    - [NYS OPEN DATA Name: ACRIS - Real Property Parties](#nys-open-data-name-acris---real-property-parties)
    - [NYS OPEN DATA Description: Party Names for Real Property Related Documents Recorded in ACRIS](#nys-open-data-description-party-names-for-real-property-related-documents-recorded-in-acris)
    - [API Endpoint URL: https://data.cityofnewyork.us/resource/636b-3b5g.json](#api-endpoint-url-httpsdatacityofnewyorkusresource636b-3b5gjson)
  - [`ReferencesRealPropApi`](#referencesrealpropapi)
    - [NYC Open Data URL: https://data.cityofnewyork.us/City-Government/ACRIS-Real-Property-References/pwkr-dpni/about\_data](#nyc-open-data-url-httpsdatacityofnewyorkuscity-governmentacris-real-property-referencespwkr-dpniabout_data)
    - [NYS OPEN DATA Name: ACRIS - Real Property References](#nys-open-data-name-acris---real-property-references)
    - [NYS OPEN DATA Description: Document Cross References for Real Property Related Documents Recorded in ACRIS](#nys-open-data-description-document-cross-references-for-real-property-related-documents-recorded-in-acris)
    - [API Endpoint URL: https://data.cityofnewyork.us/resource/pwkr-dpni.json](#api-endpoint-url-httpsdatacityofnewyorkusresourcepwkr-dpnijson)
  - [`RemarksRealPropApi`](#remarksrealpropapi)
    - [NYC Open Data URL: https://data.cityofnewyork.us/City-Government/ACRIS-Real-Property-Remarks/9p4w-7npp/about\_data](#nyc-open-data-url-httpsdatacityofnewyorkuscity-governmentacris-real-property-remarks9p4w-7nppabout_data)
    - [NYS OPEN DATA Name: ACRIS - Real Property Remarks](#nys-open-data-name-acris---real-property-remarks)
    - [NYS OPEN DATA Description: Document Remarks for Real Property Related Documents Recorded in ACRIS](#nys-open-data-description-document-remarks-for-real-property-related-documents-recorded-in-acris)
    - [API Endpoint URL: https://data.cityofnewyork.us/resource/9p4w-7npp.json](#api-endpoint-url-httpsdatacityofnewyorkusresource9p4w-7nppjson)

## API File Architecture

The Real Property API files: `MasterRealPropApi.js`, `PartiesRealPropApi.js`, `LegalsRealPropApi.js`, `ReferencesRealPropApi.js` and `RemarksRealPropApi.js` located in `/real-property` are all constructed according to the same class based architecture.  Each class has the same methods `fetchAcrisRecords`, `fetchAcrisRecordCount`, `fetchAcrisDocumentIds` and `fetchAcrisDocumentIdsCrossRef` (this function is the exception and only exists in `PartiesRealPropApi.js` and `LegalsRealPropApi.js` until further testing is complete).  Each of these methods are structured the same and invoke methods from the `SoqlUrl` class to dynamically generate Socrata Query Language syntax (Soql) URLs based on query parameters, API-specific configurations, and pagination.

### `fetchAcrisRecords`

#### Purpose

- Fetches all records from the ACRIS Real Property Master dataset that match the provided query parameters.

#### How It Works
- Constructs a URL using `SoqlUrl.constructUrl` with the `selectOption` set to `"records"`.
- Implements pagination using the `limit` and `offset` parameters.
- Iteratively fetches records until all matching records are retrieved.

#### Pagination Logic

- Starts with `offset = 0` and increments it by `limit` after each request.
- Stops fetching when the number of records returned is less than the `limit`.

#### Examples

```js
const masterQueryParams = { doc_type: "DEED", recorded_borough: "3" };
const records = await MasterRealPropApi.fetchAcrisRecords(masterQueryParams, 1000);
console.log(records.length); // Total number of records fetched
```

```js
const partiesQueryParams = { party_type: "1", city: "NEW YORK" };
const records = await PartiesRealPropApi.fetchAcrisRecords(partiesQueryParams);
console.log(records); // Array of matching records
```

#### Behavior

- Returns an array of all matching records.
- If no records are found, throws a `NotFoundError`.

[Back to TOC](#table-of-contents)

### `fetchAcrisRecordCount`

#### Purpose
- Fetches the count of records that match the provided query parameters.

#### How It Works
- Constructs a URL using `SoqlUrl.constructUrl` with the `selectOption` set to `"countAll"`.
- Makes a single GET request to retrieve the count.

#### Examples

```js
const masterQueryParams = { doc_type: "DEED", recorded_borough: "3" };
const count = await MasterRealPropApi.fetchAcrisRecordCount(masterQueryParams);
console.log(count); // Total count of matching records
```

```js
const partiesQueryParams = { party_type: "1", city: "NEW YORK" };
const count = await PartiesRealPropApi.fetchAcrisRecordCount(partiesQueryParams);
console.log(count); // Total count of matching records
```

#### Behavior
- Returns the count as a number.
- If no count is found, throws a `NotFoundError`.

[Back to TOC](#table-of-contents)

### `fetchAcrisDocumentIds`

#### Purpose
- Fetches all unique document_id values from the ACRIS Real Property Master dataset that match the provided query parameters.

#### How It Works
- Constructs a URL using `SoqlUrl.constructUrl` with the `selectOption` set to `"document_id"`.
- Implements pagination using the `limit` and `offset` parameters.
- Iteratively fetches `document_id` values until all are retrieved.

#### Pagination Logic
Starts with `offset = 0` and increments it by `limit` after each request.
Stops fetching when the number of records returned is less than the `limit`.

#### Example:

```js
const masterQueryParams = { doc_type: "DEED", recorded_borough: "3" };
const documentIds = await MasterRealPropApi.fetchAcrisDocumentIds(masterQueryParams, 1000);
console.log(documentIds); // Array of unique document IDs
```

```js
const partiesQueryParams = { party_type: "1", city: "NEW YORK" };
const documentIds = await PartiesRealPropApi.fetchAcrisDocumentIds(partiesQueryParams);
console.log(documentIds); // Array of unique document IDs
```

#### Behavior

- Returns an array of unique `document_id` values.
- If no `document_id` values are found, throws a `NotFoundError`.

[Back to TOC](#table-of-contents)

### Search By Parcel & `fetchAcrisDocumentIdsCrossRef`

http://localhost:3000/ParcelIdentifierSearch


#### refactor notes on 6/10/25

The `MasterRealPropApi.fetchAcrisDocumentIdsCrossRef` is behaving strangely.  I was able to successfully submit a search request from the frontend via the `queryAcrisParcel` route with the query parameters below and returned 9 records (with `document_id` values: 'BK_6830029501877', 'BK_6830029501879', 'BK_7230060101439', 'BK_7230060101441', 'BK_7730091601981', 'BK_7730091601987', 'FT_3030001026203', 'FT_3150000953315' and 'FT_3160005545216') which displayed correctly without any issue on the website.  

##### TEST 1 - SUCCESS - BBL + recorded_date_range: 'to-current-date-default' + doc_class: 'DEEDS AND OTHER CONVEYANCES'

```bash
Received request with query parameters: {
  masterSearchTerms: {
    recorded_date_range: 'to-current-date-default',
    recorded_date_start: '',
    recorded_date_end: '',
    doc_type: 'doc-type-default',
    doc_class: 'DEEDS AND OTHER CONVEYANCES'
  },
  legalsSearchTerms: { borough: '3', block: '05159', lot: '47', unit: '' }
}
```

##### TEST 2 - FAILED - BBL + recorded_date_range: 'to-current-date-default' + doc_class: 'MORTGAGES & INSTRUMENTS'/'UCC AND FEDERAL LIENS'/'OTHER DOCUMENTS'

```bash
Received request with query parameters: {
  masterSearchTerms: {
    recorded_date_range: 'to-current-date-default',
    recorded_date_start: '',
    recorded_date_end: '',
    doc_type: 'doc-type-default',
    doc_class: 'MORTGAGES & INSTRUMENTS'
  },
  legalsSearchTerms: { borough: '3', block: '05159', lot: '47', unit: '' }
}
```


It accepts `masterQueryParams`, `legalsRecordsDocumentIds` and `batchSize` and should return the two `document_id` values: '2020100700809001' and '2020100700809002' after cross referencing the results against the `document_id` values contained in `legalsRecordsDocumentIds`.

- `queryAcrisParcel` receives the query parameters below.
- `MasterRealPropApi.fetchAcrisDocumentIdsCrossRef` creates a query URL that does NOT return any records when it should.
- 

query parameters sent by frontend:
```bash
Received request with query parameters: {
  masterSearchTerms: {
    recorded_date_range: 'last-5-years',
    recorded_date_start: '2020-06-11',
    recorded_date_end: '2025-06-10',
    doc_type: 'doc-type-default',
    doc_class: 'MORTGAGES & INSTRUMENTS'
  },
  legalsSearchTerms: { borough: '3', block: '05159', lot: '47', unit: '' }
}
```

URL Criteria to check:
- [x] Each function is referencing the correct API.  
  - `MasterRealPropApi` references "https://data.cityofnewyork.us/resource/bnx9-e6tj.json"
  - `PartiesRealPropApi` references "https://data.cityofnewyork.us/resource/636b-3b5g.json"
  - `LegalsRealPropApi` references "https://data.cityofnewyork.us/resource/8h5j-fqxa.json"

`MasterRealPropApi.fetchAcrisDocumentIdsCrossRef` UNsuccessfully creates the query URL below.  Also, the query url is missing the `&$limit=1000` at the end.  
```bash
https://data.cityofnewyork.us/resource/bnx9-e6tj.json?$select=document_id&$where=doc_type IN ('AGMT', 'ASPM', 'ASST', 'CERR', 'DEMM', 'MMTG', 'MTGE', 'PSAT', 'REL', 'SAT', 'SMTG', 'WSAT', 'AL&R', 'AMTX', 'AALR', 'M&CON', 'SPRD', 'SUBM', 'PREL', 'CORRM', 'XXXX', 'CMTG', 'APPRT') AND recorded_datetime between '2023-06-11' and '2025-06-10' AND document_id IN ('2020100700809001', '2020100700809002', '2017062800007002', '2017062800007001', 'FT_3210005545221', 'BK_7230060101447', 'FT_3720005010972', 'BK_8030116700912', 'FT_3160000953316', 'BK_7530078101736', 'FT_3290005545229', 'FT_3390001095739', '2013053000805003', '2005010600534002', 'FT_3030001026203', 'BK_7230060101439', 'FT_3840001246684', 'FT_3260005545226', 'FT_3810001502381', 'FT_3280005545228', '2005010600534004', 'BK_7730091601983', 'FT_3220005545222', '2013053000805002', 'FT_3810001246681', 'FT_3150000953315', 'BK_6830029501885', 'FT_3400001002240', 'FT_3530004500253', 'FT_3820001502382', 'BK_6830029501879', 'FT_3450001247145', '2005010600534001', 'BK_6830029501881', 'FT_3850001246685', 'FT_3830001246683', 'FT_3400001095740', 'FT_3820001246682', 'BK_7530078101731', 'FT_3800001246680', 'FT_3160005545216', '2013053000805005', 'FT_3170005545217', 'BK_7230060101443', 'FT_3270005545227', '2005010600534003', 'FT_3910000966591', 'BK_7730090900605', 'FT_3860001246686', 'BK_6830029501877', '2013053000805001', 'BK_7730091601981', 'BK_7730091601987', 'BK_7230060101441', 'FT_3520001266352', 'BK_7730090900603')
```

`'/fetchAcrisDocumentIds(masterQueryParams)' calls 'SoqlUrl.constructUrl' creates:`
```bash
https://data.cityofnewyork.us/resource/8h5j-fqxa.json?$select=document_id&$where=borough=1 AND document_id IN ('2025040900070001', '2025040900509001', '2025032500301001', '2025021800719001', '2025021801206001', '2024092300336001', '2024081600122002', '2024071700353001', '2024071700810001', '2024061800801001') 1 LegalsRealPropApi queryUrls
```

#### Purpose
- Fetches `document_id` values from the ACRIS Real Property Parties dataset that match the provided query parameters and are cross-referenced with a list of `document_id` values from another dataset (e.g., Master dataset).

#### How It Works
- Constructs batch URLs using `SoqlUrl.constructUrlBatches` with the `document_id` values from the Master dataset.
- Iteratively fetches `document_id` values for each batch, implementing pagination for each batch.

#### Pagination Logic
- For each batch URL, starts with `offset = 0` and increments it by **1,000** after each request.
- Stops fetching for a batch when the number of records returned is less than **1,000**.

#### Example

```js
const partiesQueryParams = { party_type: "BUYER", city: "NEW YORK" };
const masterRecordsDocumentIds = ["12345", "67890", "11223"];
const documentIds = await PartiesRealPropApi.fetchAcrisDocumentIdsCrossRef(partiesQueryParams, masterRecordsDocumentIds);
console.log(documentIds); // Array of unique document IDs cross-referenced with Master dataset
```

#### Behavior

- Returns an array of unique `document_id` values that match the query parameters and are cross-referenced with the provided `masterRecordsDocumentIds`.
- If no `document_id` values are found, throws a `NotFoundError`.

#### Combined Example: Using `MasterRealPropApi` and `PartiesRealPropApi`

```js
const masterQueryParams = { doc_type: "DEED", recorded_borough: "3" };
const partiesQueryParams = { party_type: "1", city: "NEW YORK" };

try {
  // Step 1: Fetch document IDs from the Master dataset
  const masterRecordsDocumentIds = await MasterRealPropApi.fetchAcrisDocumentIds(masterQueryParams);
  console.log(`Fetched ${masterRecordsDocumentIds.length} document IDs from Master dataset`);

  // Step 2: Use the Master document IDs to fetch cross-referenced document IDs from the Parties dataset
  const partyRecordsDocumentIds = await PartiesRealPropApi.fetchAcrisDocumentIdsCrossRef(partiesQueryParams, masterRecordsDocumentIds);
  console.log(`Fetched ${partyRecordsDocumentIds.length} document IDs from Parties dataset cross-referenced with Master dataset`);
} catch (err) {
  console.error("Error:", err.message);
}
```

[Back to TOC](#table-of-contents)

## `MasterRealPropApi`
### NYC Open Data URL: http://data.cityofnewyork.us/City-Government/ACRIS-Real-Property-Master/bnx9-e6tj
### NYS OPEN DATA Name: ACRIS - Real Property Master
### NYS OPEN DATA Description: Master document Details for Real Property Related Documents Recorded in ACRIS
### API Endpoint URL: https://data.cityofnewyork.us/resource/bnx9-e6tj.json

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

[Back to TOC](#table-of-contents)

---

## `LegalsRealPropApi`
### NYC Open Data URL: https://data.cityofnewyork.us/City-Government/ACRIS-Real-Property-Legals/8h5j-fqxa/about_data
### NYS OPEN DATA Name: ACRIS - Real Property Legals
### NYS OPEN DATA Description: Property Details for Real Property Related Documents Recorded in ACRIS
### API Endpoint URL: https://data.cityofnewyork.us/resource/8h5j-fqxa.json

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

[Back to TOC](#table-of-contents)

---

## `PartiesRealPropApi`
### NYC Open Data URL: https://data.cityofnewyork.us/City-Government/ACRIS-Real-Property-Parties/636b-3b5g/about_data
### NYS OPEN DATA Name: ACRIS - Real Property Parties
### NYS OPEN DATA Description: Party Names for Real Property Related Documents Recorded in ACRIS
### API Endpoint URL: https://data.cityofnewyork.us/resource/636b-3b5g.json

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

[Back to TOC](#table-of-contents)

---

## `ReferencesRealPropApi`
### NYC Open Data URL: https://data.cityofnewyork.us/City-Government/ACRIS-Real-Property-References/pwkr-dpni/about_data
### NYS OPEN DATA Name: ACRIS - Real Property References
### NYS OPEN DATA Description: Document Cross References for Real Property Related Documents Recorded in ACRIS
### API Endpoint URL: https://data.cityofnewyork.us/resource/pwkr-dpni.json

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

[Back to TOC](#table-of-contents)

---

## `RemarksRealPropApi`
### NYC Open Data URL: https://data.cityofnewyork.us/City-Government/ACRIS-Real-Property-Remarks/9p4w-7npp/about_data
### NYS OPEN DATA Name: ACRIS - Real Property Remarks
### NYS OPEN DATA Description: Document Remarks for Real Property Related Documents Recorded in ACRIS
### API Endpoint URL: https://data.cityofnewyork.us/resource/9p4w-7npp.json

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

[Back to TOC](#table-of-contents)