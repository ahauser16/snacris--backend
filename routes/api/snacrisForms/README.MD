# `queryAcrisPartyName` route Dev Notes

this is a series of notes about developing the `queryAcrisPartyName` route that receives data from the user on the front end application that allows the user to "Search By Name". This is an attempt to copy the behavior of the ACRIS website's Search By Party Name website located here: `https://a836-acris.nyc.gov/DS/DocumentSearch/PartyName`.

I got the front end behavior to a point that I'm satisfied with and now I need to handle the front end's request by deconstructing it within the `queryAcrisPartyName` route and create the url that will be sent to one or more of the Real Property API datasets.

Then I need to package or normalize the response from the Real Property ACRIS dataset(s) before sending it back to the front end.

## [Table of Contents](#table-of-contents)

- [`queryAcrisPartyName` route Dev Notes](#queryacrispartyname-route-dev-notes)
  - [Table of Contents](#table-of-contents)
  - [ACRIS Dataset "Gotchas"](#acris-dataset-gotchas)
  - [Search By Party Name (current focust 4/22/25)](#search-by-party-name-current-focust-42225)
    - [Background](#background)
    - [NYC Open Data - free ACRIS data](#nyc-open-data---free-acris-data)
    - [Testing Notes (as of 5/16/25)](#testing-notes-as-of-51625)
      - [query values received from frontend](#query-values-received-from-frontend)
    - [Current Architecture (ARCHIVED 5/13/25)](#current-architecture-archived-51325)
      - [test case EMPIRE](#test-case-empire)
    - [How To Send API GET Requests and Cross Reference Results](#how-to-send-api-get-requests-and-cross-reference-results)
      - [Consideration A - Retrieve All Records or Only Their `document_id` Values](#consideration-a---retrieve-all-records-or-only-their-document_id-values)
      - [Consideration B - Cross Referencing Datasets By Including `document_id` Values in subsequent GET Requests](#consideration-b---cross-referencing-datasets-by-including-document_id-values-in-subsequent-get-requests)
      - [Consideration C - Pagination VS Batching VS UNKNOWN PROCESS VS ALL THE ABOVE](#consideration-c---pagination-vs-batching-vs-unknown-process-vs-all-the-above)
      - [CHATGPT RESPONSE TO ABOVE](#chatgpt-response-to-above)
        - [**Plan for Cross-Referencing Datasets Using `document_id`**](#plan-for-cross-referencing-datasets-using-document_id)
        - [Step 1: Determine the Query Order](#step-1-determine-the-query-order)
          - [`MasterRealPropApi` Dev Notes](#masterrealpropapi-dev-notes)
          - [`PartiesRealPropApi` Dev Notes](#partiesrealpropapi-dev-notes)
          - [`LegalsRealPropApi` Dev Notes](#legalsrealpropapi-dev-notes)
          - [Notes](#notes)
        - [Step 2: Retrieve `document_id` Values](#step-2-retrieve-document_id-values)
          - [`fetchDocIdsFromAcris` Dev Notes](#fetchdocidsfromacris-dev-notes)
        - [Step 3: Cross-Reference `document_id` Values](#step-3-cross-reference-document_id-values)
        - [Step 4: Retrieve Full Records](#step-4-retrieve-full-records)
        - [Step 5: Return Results to the Frontend](#step-5-return-results-to-the-frontend)
        - [How to test query url character limit from Socrata](#how-to-test-query-url-character-limit-from-socrata)
          - [1. Determine the NYC Open Data API's Query URL Character Limit \[ARCHIVED\]](#1-determine-the-nyc-open-data-apis-query-url-character-limit-archived)
          - [2. Refactor `constructPartiesUrlCrossRefMasterSelectDocIds`](#2-refactor-constructpartiesurlcrossrefmasterselectdocids)
          - [3. Refactor `fetchDocIdsFromAcrisCrossRefMaster`](#3-refactor-fetchdocidsfromacriscrossrefmaster)
          - [4. Test the Refactored Methods](#4-test-the-refactored-methods)
          - [5. Handle Edge Cases](#5-handle-edge-cases)
          - [6. Example Workflow](#6-example-workflow)
          - [7. Next Steps](#7-next-steps)
          - [ChatGPT Digression: pagination vs batch requests vs throttling](#chatgpt-digression-pagination-vs-batch-requests-vs-throttling)
    - [Revised Refactor Plan (prompt 2 / edited \& used as prompt 3) (4/12/25) \[ARCHIVED\]](#revised-refactor-plan-prompt-2--edited--used-as-prompt-3-41225-archived)
    - [Revised Refactor Plan (response 3) \[ARCHIVED\]](#revised-refactor-plan-response-3-archived)
      - [Strengths of Your Plan](#strengths-of-your-plan)
      - [Potential Issues and Suggestions](#potential-issues-and-suggestions)
      - [Steps to Accomplish the Refactor](#steps-to-accomplish-the-refactor)
  - [techniques to think about](#techniques-to-think-about)
  - [Front End Data received...now what (prompt 1)\[ARCHIVED\]](#front-end-data-receivednow-what-prompt-1archived)
  - [Front End Data received...now what (response 1)\[ARCHIVED\]](#front-end-data-receivednow-what-response-1archived)
    - [Frontend and Backend testing notes](#frontend-and-backend-testing-notes)
      - [Background](#background-1)
      - [4/18/25 (Test A)](#41825-test-a)
      - [4/18/25 (Test B)](#41825-test-b)
      - [4/20/25 (Test C - `borough` and `limit` realizations)](#42025-test-c---borough-and-limit-realizations)
        - [`borough` vs `borough`](#borough-vs-borough)
        - [API Responses limited to 1,000 records](#api-responses-limited-to-1000-records)

## ACRIS Dataset "Gotchas"

1. The limit of records sent from the Real Property and Personal Property APIs is 1,000.
2. The Search By Party Name feature of ACRIS relies on the Real Property: Master, Parties and Legals (a/k/a Lot) datasets. Initially I thought it searched the `borough` column of the Master dataset but it is actually the `borough` column of the Legals dataset

## Search By Party Name (current focust 4/22/25)

### Background

My front end route `partyNameSearch` and my back end route `queryAcrisPartyName` are an attempt to copy a search feature provided by a website maintained by the NYC Department of Finance's Automated City Record Indexing System ("ACRIS"). The homepage for the DOF that launches ACRIS is located here: [https://www.nyc.gov/site/finance/property/acris.page#](https://www.nyc.gov/site/finance/property/acris.page#) and the **Search By Party Name** feature I'm attempting to copy is located here: [https://a836-acris.nyc.gov/DS/DocumentSearch/PartyName](https://a836-acris.nyc.gov/DS/DocumentSearch/PartyName).

ACRIS contains public land record data for all of New York City such as deeds, mortgages, leases and any other document that is directly associated with real property. One of the search feature's of ACRIS is to search for records that are associated with a property owner's `name` with the option to cross-reference `name` with: (i) a date range for `document_date` (e.g. within 7 days from the current date, within 30 days from the current date, custom range, etc.), (ii) a `document_class` representing four categories each of which contains a list of unique `document_type` (e.g. "DEEDS & OTHER CONVEYANCES", "MORTGAGES & INSTRUMENTS", "UCC & FEDERAL LIENS" & "OTHER DOCUMENTS"), (iii) a `party_type` representing the role of that party that is mapped to each `document_type` and (iv) a `borough` representing one of the five NYC Boroughs/NYS Counties where the document's associated property is located.

### NYC Open Data - free ACRIS data

ACRIS data is available for free by [NYC Open Data](https://opendata.cityofnewyork.us/) comprised of 15 API endpoints that are grouped in three major categories (5 endpoints per category): Real Property, Personal Property and Code Maps. The Real Property and Personal Property categories each represent a full dataset that follow the same schema where each of their 5 datasets are referred to as: (i) Master, (ii) Party, (iii) Legals, (iv) Remarks and (v) References and can be cross referenced with each other using the unique identifying value: `document_id`. For example, a specific deed will have its own `document_id` and if you wanted all the information associated with that deed using the NYC Open Data APIs then you would need to send a GET request to the Real Property-Master, Real Property-Party, Real Property-Legals, Real Property-Remarks and Real Property-References API endpoints. The Code Maps category's five datasets represent codes and data structures that are used to query the Real Property and Personal Property datasets such as arrays of countries and states of the U.S. and arrays of document classes, document types and party types. I've included the link to each API's NYC Open Data webpage below as a reference.

Real Property:

- [Master](http://data.cityofnewyork.us/City-Government/ACRIS-Real-Property-Master/bnx9-e6tj)
- [Legals](http://data.cityofnewyork.us/City-Government/ACRIS-Real-Property-Legals/8h5j-fqxa)
- [Parties](http://data.cityofnewyork.us/City-Government/ACRIS-Real-Property-Parties/636b-3b5g)
- [References](http://data.cityofnewyork.us/City-Government/ACRIS-Real-Property-References/pwkr-dpni)
- [Remarks](http://data.cityofnewyork.us/City-Government/ACRIS-Real-Property-Remarks/9p4w-7npp)

Personal Property:

- [Master](http://data.cityofnewyork.us/City-Government/ACRIS-Personal-Property-Master/sv7x-dduq)
- [Legals](http://data.cityofnewyork.us/City-Government/ACRIS-Personal-Property-Legals/uqqa-hym2)
- [Parties](http://data.cityofnewyork.us/City-Government/ACRIS-Personal-Property-Parties/nbbg-wtuz)
- [References](http://data.cityofnewyork.us/City-Government/ACRIS-Personal-Property-References/6y3e-jcrc)
- [Remarks](http://data.cityofnewyork.us/City-Government/ACRIS-Personal-Property-Remarks/fuzi-5ks9)

Code Maps:

- [Document Control Codes](https://data.cityofnewyork.us/City-Government/ACRIS-Document-Control-Codes/7isb-wh4c/about_data)
- [UCC Collateral Codes](https://data.cityofnewyork.us/City-Government/ACRIS-UCC-Collateral-Codes/q9kp-jvxv/about_data)
- [Property Types Codes](https://data.cityofnewyork.us/City-Government/ACRIS-Property-Types-Codes/94g4-w6xz/about_data)
- [State Codes](https://data.cityofnewyork.us/City-Government/ACRIS-State-Codes/5c9e-33xj/about_data)
- [Country Codes](https://data.cityofnewyork.us/City-Government/ACRIS-Country-Codes/j2iz-mwzu/about_data)

### Testing Notes (as of 5/16/25)

See `README.MD` files in the `/thirdPartyApi/acris/real-property` and `/thirdPartyApi/acris/utils` for documentation on the current architecture of the Axios fetch methods that make API specific GET requests and the Socrata Query Language syntax (Soql) used to generate query URLs invoked by those GET requests.

The rest of this section are my notes that test the `queryAcrisPartyName` route that is a complex search feature. The route receives the query parameters from a form on the front end and is received in the format below. Since there are too many records associated with each independent search I've decided to make the three GET requests in a sequence where the second GET request includes the `document_id` values received from the first search. In effect the results of the second GET request represent a cross reference of the two datasets. This reduces the amount of data received if I were to download the results of each search independently and then cross reference all the records using a common `document_id`, however, it makes the route's logic more complex. My testing notes below will bring me closer to achieving the desired search.

I discovered the ACRIS Search By Party Name feature I was trying to copy did not search by the `document_date` value but by the `recorded_datetime` value.  This caused one of the three `document_id` values to not appear in the results of the `MasterRealPropApi.fetchAcrisDocumentIds` GET request.  I refactored the front and backend to ensure the GET request to the Real Property Master API includes a query with values representing the `recorded_datetime` column.

I also discovered that the ACRIS Search By Party Name feature treats any user query for the `name` column (associated with the Real Property Parties dataset) as the beginning term to search for.  For example, searching for "EMPIRE" will return "EMPIRE HOLDINGS II, LLC" but not "GREAT EMPIRE BEVERLY REALTY LLC" unlike my search feature which returns both.  I've decided to keep my search feature's behavior even though this means I did not copy the ACRIS search feature exactly.  This was a good discovery and raises the question of additional search features that could be helpful to include in the future.

#### query values received from frontend
```bash
Received request with query parameters: {
  masterSearchTerms: {
    recorded_date_range: 'last-90-days',
    recorded_date_start: '2025-02-15',
    recorded_date_end: '2025-05-16',
    doc_type: 'doc-type-default',
    doc_class: 'DEEDS AND OTHER CONVEYANCES'
  },
  partySearchTerms: { name: 'EMPIRE', party_type: '1' },
  legalsSearchTerms: { borough: '3' }
}
```

Then I confirmed that these **eight** `document_id` values are included in the 3rd and final GET request via `LegalsRealPropApi.fetchAcrisDocumentIdsCrossRef` which returned **four** unique `document_id` values (see below).  The search that I'm trying to copy from the ACRIS website returned three

```bash
[
  '2025040700480001', <--this was unexpected
  '2025040900070001',
  '2025040900509001',
  '2025021800719001'
] legalsRecordsDocumentIds
```

- `2025040900070001`
  - DOC. TYPE:	DEED
  - DOC. DATE:	4/3/2025
  - RECORDED / FILED:	4/10/2025 10:40:53 AM
  - BBL: 3-1596-56
  - PARTY_TYPE: 1
  - NAME: EMPIRE HOLDINGS II, LLC
- `2025021800719001`
  - DOC. TYPE: MEMORANDUM OF LEASE
  - DOC. DATE:	1/30/2025
  - RECORDED / FILED:	2/28/2025 11:49:31 AM
  - BBL 3-3964-1001
  - PARTY_TYPE: 1
  - NAME: EMPIRE STATE DAIRY LLC
- `2025040900509001`
  - DOC. TYPE:	DEED
  - DOC. DATE:	4/3/2025
  - RECORDED / FILED:	4/14/2025 9:57:56 AM
  - BBL: 3-2105-1
  - PARTY_TYPE: 1
  - NAME: EMPIRE STATE GRAND COUNCIL ANCIENT AND ACCEPTED SC
- `2025040700480001`
  - DOC. TYPE:	DEED
  - DOC. DATE:	3/24/2025
  - RECORDED / FILED:	4/8/2025 10:17:37 AM
  - BBL: 3-6553-69, 71 & 73
  - PARTY_TYPE: 1
  - NAME: GREAT EMPIRE BEVERLY REALTY LLC

### Current Architecture (ARCHIVED 5/13/25)

In order to copy the ACRIS **Search By Party Name** feature I have a webpage (e.g. `http://localhost:3000/partyNameSearch`) with the same form that sends search terms to my Backend route (e.g. `http://localhost:3001/queryAcrisPartyName/fetchRecord?searchTerms[...]=...`).

on the frontend the `SelectDatasetsCheckboxes` component allows the user to select which datasets they want to query in the (parent) form-component. Each form-component has "Primary" datasets that it queries and "Secondary" datasets that the user can get additional data from based on the results from the "Primary" datasets. For example, the `PartyNameSearchForm` form-component queries the "Primary" datasets: **Real Property Master** (`masterDataset`), **Real Property Parties** (`partiesDataset`) and **Real Property Legals** (`legalsDataset`) datasets because the form's `doc_type`, `document_date_range`, `document_date_start` and `document_date_end` are all associated with the **Real Property Master** dataset, the `name` and `party_type` are associated with the **Real Property Parties** dataset and the `borough` is associated with the **Real Property Legals** dataset.

The results of these three API GET requests contain records that can be cross-referenced by their `document_id` on the backend (the **Cross Referenced Results**) before being sent BACK to the front end. The `SelectDatasetsCheckboxes` component allows the `PartyNameSearchForm` component to communicate to the backend that the `document_id` from the **Cross Referenced Results** should be used to query the "Secondary datasets", which in this case are the **Real Property Remarks** (`remarksDataset`) and **Real Property References** (`referencesDataset`) datasets. The parent component, and in this case `PartyNameSearchForm`, disables the input elements representing the "Primary" datasets in the `SelectDatasetsCheckboxes` component through props. For example, in this case the `masterDataset`, `partiesDataset` and `legalsDataset` inputs are disabled while in their "checked" state whereas the `remarksDataset` and `referencesDataset` can be toggled by the user. When the user toggles these "Secondary" datasets and submits the `PartyNameSearchForm` component's form they are communicating to the backend that in addition to the **Cross Referenced Results** they want additional data from the `remarksDataset` and `referencesDataset` datasets.

The data coming in looks like the object below which include `masterSearchTerms`, `partySearchTerms` and `legalsSearchTerms` which I save to the `masterQueryParams`, `partiesQueryParams` and `legalsQueryParams` variables to validate the data, respectively. Then I pass these query params objects to `MasterRealPropApi`, `LegalsRealPropApi` and `PartiesRealPropApi` which (i) construct the query URL using Socrata Query Language syntax (SoQL) and (ii) make the Axios GET requests using the constructed query URLs.

#### test case EMPIRE

```bash
Received request with query parameters: {
  masterSearchTerms: {
    document_date_range: 'custom-date-range',
    document_date_start: '2025-02-01',
    document_date_end: '2025-03-31',
    doc_type: 'DEED',
    doc_class: 'DEEDS AND OTHER CONVEYANCES'
  },
  partySearchTerms: { name: 'EMPIRE', party_type: '1' },
  legalsSearchTerms: { borough: '3' },
  primaryApiSources: { masterDataset: 'true', partiesDataset: 'true', lotDataset: 'true' },
  secondaryApiSources: { referencesDataset: 'false', remarksDataset: 'false' }
}
```

### How To Send API GET Requests and Cross Reference Results

Currently, I can make these requests for data independently but I need a plan for how to make these GET requests to the three datasets in an efficient way. For example, when I query the first [Real Property Master API](http://data.cityofnewyork.us/City-Government/ACRIS-Real-Property-Master/bnx9-e6tj) with the `masterQueryParams`: `document_date_range`, `document_date_start`, `document_date_end`, `doc_type` and `doc_class` I get 1,000 records back but after more testing using Postman (e.g. `https://data.cityofnewyork.us/resource/bnx9-e6tj.json?$select=count(*)&$where=doc_type='DEED' AND document_date between '2025-02-01' and '2025-03-31'`) I'm actually getting 5,776 records that match my query so the API has a 1,000 record limit. When I query the second [Real Property Parties API](http://data.cityofnewyork.us/City-Government/ACRIS-Real-Property-Parties/636b-3b5g) with the `partiesQueryParams`: `name` and `party_type` using the Postman route: `{{real_property_parties_base_url}}?$select=count(*)&$where=name like '%25EMPIRE%25' AND party_type='1'` I get 16,840 records back. I didn't even try to query the [Real Property Legals API](http://data.cityofnewyork.us/City-Government/ACRIS-Personal-Property-Legals/uqqa-hym2) because that would request all the records associated with properties in all of Brooklyn.

The only way I can think to perform this search is by making the first GET request to the Real Property Master API, save each record's `document_id` to a hash map and incorporate those values in my subsequent GET request to the Real Property Parties API. However, since the initial request to the Real Property Master API matched 5,776 records that means I would need to include 5,776 `document_id` values in the GET request to the Real Property Parties API both of which have a response limit of 1,000 records. This means I need to come up with a pagination or batching system that makes these requests to account for the response limits. This system will have to account for many factors and make design choices that may favor certain user experiences or resource handling that require making sacrificies in other areas. Below are design considerations that could be implemented in the API GET request processes.

#### Consideration A - Retrieve All Records or Only Their `document_id` Values

The first consideration that comes to mind is to request only the `document_id` values for each GET request which would cut down on the response size of each request. Referring to the example above, I would request the 5,776 `document_id` values associated with the records from the Real Property Master API using a pagination process instead of the records themselves. Continuing with the example, I would request the 16,840 `document_id` values associated with the records from the Real Property Parties API dataset. However, to make the third request I would still need to query the Real Property Legals API dataset for all `document_id` values associated with the whole borough of Brooklyn. I can't imagine querying the `document_id` values alone would be the solution here. Also, if I were to only request the `document_id` values until I fully cross referenced the datasets I would eventually need to make 3 subsequent API requests for the actual records to the three datasets. Meaning if it took `X` GET requests to receive all `document_id` values from `Real Property Master API` and `Y` requests from `Real Property Parties API` and `Z` requests from `Real Property Legals API` then I would be making `X + Y + Z + 3` API calls for this **Search By Party Name** feature as opposed to `X + Y + Z` API calls if I requested the records, extracted the `document_id` values, cross referenced those values, filtered out all records based on those values and returned the records to the user.

Pros: reduce size of responses from APIs and possibly response time
Cons: increase number of API calls

#### Consideration B - Cross Referencing Datasets By Including `document_id` Values in subsequent GET Requests

The next condideration is to use the `document_id` values from the initial GET requests (whether extracted from the records or retrieved by themselves from the dataset) to construct the query URL in subsequent GET requests to the datasets. Back to my example, the first request to Real Property Master API would return 5,776 `document_id` values that I need to cross reference with the Real Property Parties API and Real Property Legals API datasets. Instead of retrieving all of the `document_id` values from the other two datasets I could use the 5,776 `document_id` values in the query url to cross reference those datasets dynamically. This would still require making batch requests or pagination but it would reduce the size of the response from subsequent API calls. This could become hard to scale and use programmatically when the query parameters change and cause the results from each dataset to vary. For example, in this case the query to the Real Property Master API returns 5,776 records which is the least amount of matches compared to the other two but what if the query changes and the other datasets return a lower number of records. I would need to implement a mechanism that compares the number of matches from each dataset and orders the GET requests based on the lower number of matches. Meaning it would take an extra three API GET requests to the `Real Property Master API`, `Real Property Parties API` and `Real Property Legals API` datasets to determine which dataset to make calls to first and if it took `X` GET requests to receive all `document_id` values from `Real Property Master API` and `Y` requests from `Real Property Parties API` and `Z` requests from `Real Property Legals API` then I would be making `3 + X + Y + Z` API calls for this **Search By Party Name** feature as opposed to `X + Y + Z` API calls if I requested the records without taking the number of matches into consideration.

Pros:
Cons:

#### Consideration C - Pagination VS Batching VS UNKNOWN PROCESS VS ALL THE ABOVE

I take this moment to finish my thoughts with a question which is what is pagination and making batch requests? How can I use these techniques in combination with the other considerations I explained above. What are other techniques or processes that I'm not thinking of?

[Back to TOC](#table-of-contents)

#### CHATGPT RESPONSE TO ABOVE

##### **Plan for Cross-Referencing Datasets Using `document_id`**

To achieve the desired functionality of cross-referencing datasets using the `document_id` field, we need to design a system that balances efficiency, scalability, and user experience. Below is a detailed plan, followed by an analysis of your considerations and additional techniques.

##### Step 1: Determine the Query Order

- Goal: Minimize the number of API calls and the size of responses.
- Approach:
  - Use the dataset with the smallest number of matches as the starting point.
  - Perform a `$select=count(*)` query for each dataset to determine the number of matching records.
  - Order the datasets by the number of matches and query the smallest dataset first.

###### `MasterRealPropApi` Dev Notes

- [x] write a function called `constructMasterUrlCountRec` that accepts the same parameters as `constructMasterUrl` and creates a query URL to the same endpoint but uses SoQL syntax to return the number of matching records instead of the records themselves (e.g. `https://data.cityofnewyork.us/resource/bnx9-e6tj.json?$select=count(*)&$where=doc_type='DEED'`).
- [x] write a function called `fetchCountFromAcris` in `MasterRealPropApi` that accepts the `masterQueryParams`, uses `constructMasterUrlCountRec` to construct the query URL that finds the `count` of matching records and makes the `axios` GET request. I've constructed and tested a URL which looks like this: `https://data.cityofnewyork.us/resource/bnx9-e6tj.json?$select=count(*)&$where=doc_type='DEED'` and returns the response in the format: `[{"count": "5776"}]`. I want `fetchCountFromAcris` to handle the response by returning the key value pair: `masterRecordCount: 5776`. Keep in mind I want the data type of `count` to be tested and have error handling that checks if the string data type, when converted to a number, is in fact a number.
- Postman testing notes:
  - I tested the `constructMasterUrlCountRec` and `fetchCountFromAcris` functions above in Postman. In order to expose or integrate the API call into the backend I created the new route in `masterRealPropApiRoutes.js` called "/fetchRecordCount". I tested the Postman URL: `http://localhost:3001/api/real-property-master/fetchRecordCount?document_id=FT_3160005545216` which returned a 200 OK status code and the the json: `{ "records": { "masterRecordCount": 1 }}`.
  - Then I tested the same "/fetchRecordCount" route assuming that the `masterSearchTerms` were `document_date_range: 'custom-date-range', document_date_start: '2025-02-01',document_date_end: '2025-03-31', doc_type: 'DEED', doc_class: 'DEEDS AND OTHER CONVEYANCES'` using the Postman URL: `http://localhost:3001/api/real-property-master/fetchRecordCount?doc_type=DEED&document_date_start=2025-02-01&document_date_end=2025-03-31` and I successfully received the json: `{ "records": { "masterRecordCount": 5776 }}`.
  - I tested the original "fetchRecord" route assuming the `masterSearchTerms` were: `document_date_range: 'custom-date-range', document_date_start: '2025-02-01',document_date_end: '2025-03-31', doc_type: 'DEED', doc_class: 'DEEDS AND OTHER CONVEYANCES'` using the Postman URL: `http://localhost:3001/api/real-property-master/fetchRecord?doc_type=DEED&document_date_start=2025-02-01&document_date_end=2025-03-31` and I received 1,000 records.

###### `PartiesRealPropApi` Dev Notes

- [x] write a function called `constructPartiesUrlCountRec` that accepts the same parameters as `constructPartiesUrl` and creates a query URL to the same endpoint but uses SoQL syntax to return the number of matching records instead of the records themselves (e.g. `https://data.cityofnewyork.us/resource/636b-3b5g.json?$select=count(*)&$where=name like '%25EMPIRE%25' AND party_type='1'`).
- [x] write a function called `fetchCountFromAcris` in `PartiesRealPropApi` that accepts the `partiesQueryParams`, uses `constructPartiesUrlCountRec` to construct the query URL that finds the `count` of matching records and makes the `axios` GET request. I've constructed and tested a URL which looks like this: `https://data.cityofnewyork.us/resource/636b-3b5g.json?$select=count(*)&$where=name like '%25EMPIRE%25' AND party_type='1'` and returns the response in the format: `[{"count": "15000"}]`. I want `fetchCountFromAcris` to handle the response by returning the key value pair: `partiesRecordCount: 5776`. Keep in mind I want the data type of `count` to be tested and have error handling that checks if the string data type, when converted to a number, is in fact a number.
- Postman testing notes:
  - I tested the `constructPartiesUrlCountRec` and `fetchCountFromAcris` functions above in Postman. In order to expose or integrate the API call into the backend I created the new route in `partiesRealPropApiRoutes.js` called "/fetchRecordCount". I tested the Postman URL: `http://localhost:3001/api/real-property-parties/fetchRecordCount?party_type=1&name=EMPIRE` which returned a 200 OK status code and the the json: `{ "records": { "partiesRecordCount": 16840 }}`.
  - Then I tested the same "/fetchRecordCount" route assuming that the `partiesSearchTerms` were `{ name: 'EMPIRE', party_type: '1' },` using the Postman URL: `http://localhost:3001/api/real-property-parties/fetchRecordCount?party_type=1&name=EMPIRE` and I successfully received the json: `{ "records": { "partiesRecordCount": 16840 }}`.
  - I tested the original "fetchRecord" route with the same `partiesSearchTerms` using the Postman URL: `http://localhost:3001/api/real-property-parties/fetchRecord?party_type=1&name=EMPIRE` and I received 1,000 recor

###### `LegalsRealPropApi` Dev Notes

- [x] write a function called `constructLegalsUrl`.
- [x] write a function called `constructLegalsUrlCountRec` that accepts the same parameters as `constructLegalsUrl` and creates a query URL to the same endpoint but uses SoQL syntax to return the number of matching records instead of the records themselves (e.g. `https://data.cityofnewyork.us/resource/8h5j-fqxa.json?$select=count(*)&$where=borough='3'`).
- [x] write a function called `fetchCountFromAcris` in `LegalsRealPropApi` that accepts the `legalsQueryParams`, uses `constructLegalsUrlCountRec` to construct the query URL that finds the `count` of matching records and makes the `axios` GET request. I've constructed and tested a URL which looks like this: `https://data.cityofnewyork.us/resource/8h5j-fqxa.json?$select=count(*)&$where=borough='3'` and returns the response in the format: `[{"count": "12000"}]`. I want `fetchCountFromAcris` to handle the response by returning the key value pair: `legalsRecordCount: 12,000`. Keep in mind I want the data type of `count` to be tested and have error handling that checks if the string data type, when converted to a number, is in fact a number.
- Postman testing notes:
  - I tested the `constructLegalsUrlCountRec` and `fetchCountFromAcris` functions above in Postman. In order to expose or integrate the API call into the backend I created the new route in `legalsRealPropApiRoutes.js` called "/fetchRecordCount". I tested the Postman URL: `http://localhost:3001/api/real-property-legals/fetchRecordCount?borough=3` which returned a 200 OK status code and the the json: `{ "records": { "legalsRecordCount": 7281986 }}`.

###### Notes

The `fetchCountFromAcris` functions can be run in parallel with each other. Once `masterRecordCount`, `legalsRecordCount` and `partiesRecordCount` are received a controller function such as `determineFetchOrder` could sort them based lowest number of records. The lowest number would determine which API to make the `fetchDocIdsFromAcris` call to.

##### Step 2: Retrieve `document_id` Values

- Goal: Reduce the size of responses and focus on cross-referencing.
- Approach:
  - For each dataset, retrieve only the `document_id` values using the `$select=document_id` parameter.
  - Use pagination to handle datasets with more than 1,000 records.
  - Store the `document_id` values in a hash map or set for efficient cross-referencing.

###### `fetchDocIdsFromAcris` Dev Notes

NB: This function will run after receivng the total number of matching records from the `fetchCountFromAcris` function.

**MasterRealPropApi**

- [x] I need a function called `fetchDocIdsFromAcris` that will make an `axios` GET request similar to the `fetchFromACris` method, however, instead of defining its `url` variable as `this.constructMasterUrl(query)` I want to implement the `constructMasterUrlSelectDocIds` method with the syntax `this.constructMasterUrlSelectDocIds(query)`.
  - I tested this method with a new route called `router.get("/fetchDocIds", async function (req, res, next) {` located in my `masterRealPropApiRoutes` file in Postman with the URL `http://localhost:3001/api/real-property-master/fetchDocIds?doc_type=DEED&document_date_start=2025-02-01&document_date_end=2025-03-31`. I received a 200 status code and 5,778 `document_id` values. Keep in mind only 4,133 of these were unique and the delta represented duplicates...
  - TLDR: skip the ChatGPT Digression issue. I chose pagination approach for now.

**PartiesRealPropApi**

- [x] I need a function called `fetchDocIdsFromAcris` that will make an `axios` GET request similar to the `fetchFromACris` method, however, instead of defining its `url` variable as `this.constructPartiesUrl(query)` I want to implement the `constructPartiesUrlSelectDocIds` method with the syntax `this.constructPartiesUrlSelectDocIds(query)`.
  - I tested this method with a new route called `router.get("/fetchDocIds", async function (req, res, next) {` located in my `partiesRealPropApiRoutes` file in Postman with the URL `http://localhost:3001/api/real-property-parties/fetchDocIds?party_type=1&name=EMPIRE`. I received a 200 status code and 16,840 `document_id` values.
  - TLDR: skip the ChatGPT Digression issue. I chose pagination approach for now. I moved this digression to [HERE](#chatgpt-digression-pagination-vs-batch-requests-vs-throttling).I implemented the `fetchDocIdsFromAcris` and exposed the route `fetchDocIds` that tested in Postman. Since I'm still testing the behavior of these APIs, `fetchDocIdsFromAcris` will return `masterRecordsDocumentIds` as well as the duplicates in a variable called `masterRecordsDocumentIds_Duplicates`. At this point `masterRecordsDocumentIds` will be used in the subsequent API call using `PartiesRealPropApi.fetchDocIdsFromAcris`.
- [x] Tested `fetchCountFromAcris` function with the Postman URL: `http://localhost:3001/api/real-property-master/fetchRecordCount?doc_type=DEED&document_date_start=2025-02-01&document_date_end=2025-03-31` which returned a **200 OK** status code and the json: `{ "count": { "masterRecordCount": 57} } `.
- [x] Tested the `fetchDocIdsFromAcris` function with the Postman URL: `http://localhost:3001/api/real-property-master/fetchDocIds?doc_type=DEED&document_date_start=2025-02-01&document_date_end=2025-03-31` and received a **200 OK** status code and a json object containing 4,137 lines of code with a `document_id` on each line. I expected to receive the same number of results from both Postman tests (5,776) but there is a difference of over 1,000. This occurred because of duplicate `document_id` values being eliminated by the `Set` in `fetchDocIdsFromAcris`. When I changed the hash map variable to an array I received 5780 lines of json code as a response with four of those lines represented by a pair of `{}` and `[]`. NoW that I know how to order the API GET requests based on the lowest number of matching records from making the `fetchCountFromAcris` GET request from `MasterRealPropApi`, `PartiesRealPropApi` and `LegalsRealPropApi` I can proceed to use the resulting `document_id` values in the subsequent GET requess and cross-reference those values in the process.

##### Step 3: Cross-Reference `document_id` Values

- Goal: Narrow down the results by intersecting `document_id` values across datasets.
- Approach:

  - After retrieving `document_id` values from the first dataset, use them to construct the query for the second dataset.
  - Repeat the process for the third dataset, further narrowing down the results.

**PartiesRealPropApi**

- [x] Create a function called `constructPartiesUrlCrossRefMasterSelectDocIds` (the name is a work in progress 😉) which accepts `partiesQueryParams` and `masterRecordsDocumentIds` to construct a query URL using Socrata Query Language syntax. The example I've been testing assumes the `partiesQueryParams` search terms are: `name`: "EMPIRE" and `party_type`: "1" and `masterRecordsDocumentIds` contains 4,133 `document_id` values and 1,643 duplicates. Currently, if I were to pass 4,133 document_id values to `constructPartiesUrlCrossRefMasterSelectDocIds` and `fetchDocIdsFromAcrisCrossRefMaster` it would not work because (1) the API has a 1,000 record limit for its response and (2) the `constructPartiesUrlCrossRefMasterSelectDocIds` would add all 4,133 document_id values in one query url which I assume would cause an error. I need to figure out how to paginate the GET request and also test what the API's query url character limit is. I have to consider the following options: [TLDR: for now the limit per url is 500](#how-to-test-query-url-character-limit-from-socrata)

- [x] Create the function `fetchDocIdsFromAcrisCrossRefMaster` that retrieves the `document_id` values from the Real Prop Parties API including values from the prior API call to Real Prop Master API. This will cross reference the two sets of values to reduce the amount of records to retrieve from the Real Prop Parties API. `fetchDocIdsFromAcrisCrossRefMaster` accepts `partiesQueryParams`, `masterRecordsDocumentIds` (`document_id` values from the prior call to Real Prop Master) and `batchSize` (currently this value is 500 because I received a `431 Request Header Fields Too Large` when I tested the route with over 600 values).
  - Postman notes:
    - I added the route `/fetchDocIdsCrossRefMasterDocIds` in `partiesRealPropAPiRoutes.js` and tested the following url in Postman: `http://localhost:3001/api/real-property-parties/fetchDocIdsCrossRefMasterDocIds?party_type=1&name=EMPIRE&masterRecordsDocumentIds="2025022800270001","2025032100622001","2025022400701001","2025031800626001","2025022100710001","2025022800877002","2025022500488002","2025022600605009","2025022800770001","2025030500445001","2025030400224001","2025030700273001","2025032000231001","2025022700477001"...` which received a `200` status code and the json response: `{ "partiesDocIdsCrossRefMaster": [ "2025021800719001" ]}`
- [x] Create a function that retrieves the `document_id` values from the Real Prop Legals API including values from the prior API call to Real Prop Parties API which were cross referenced with the results from the initial Real Prop Master API call. This third API call will cross reference the two sets of values to reduce the amount of records to retrieve from the Real Prop Parties API. The function is called `fetchDocIdsFromAcrisCrossRefMaster` and accepts `partiesQueryParams`, `masterRecordsDocumentIds` (`document_id` values from the prior call to Real Prop Master) and `batchSize` (currently this value is 500 because I received a `431 Request Header Fields Too Large` when I tested the route with over 600 values).

**LegalsRealPropApi**

- [x] Create the function `fetchDocIdsFromAcrisCrossRefParties` that retrieves the `document_id` values from the Real Prop Parties API including values from the prior API call to Real Prop Master API. This will cross reference the two sets of values to reduce the amount of records to retrieve from the Real Prop Parties API. `fetchDocIdsFromAcrisCrossRefParties` accepts `legalsQueryParams`, `partiesDocIdsCrossRefMaster` (`document_id` values from the prior call to Real Prop Parties) and `batchSize` (currently this value is 500 because I received a `431 Request Header Fields Too Large` when I tested the route with over 600 values).
  - Postman notes:
    - I added the route `/fetchDocIdsCrossRefPartyDocIds` in `legalsRealPropAPiRoutes.js` and tested the following url in Postman: `http://localhost:3001/api/real-property-legals/fetchDocIdsCrossRefPartyDocIds?borough=3&partiesDocIdsCrossRefMaster=["2025022800270001", "2025032100622001", "2025022400701001", "2025031800626001", "2025022100710001", "2025022800877002", "2025022500488002", "2025022600605009", "2025022800770001", "2025030500445001", "2025030400224001", "2025030700273001", "2025032000231001", "2025022700477001", "2025031000349001","2025031200609001","2025022800170001","2025022500408006","2025030500288002","2025030401114001","2025022700110001","2025022500405001","2025022600900001","2025022500216001","2025022500468001","2025022800492001","2025022800812001","2025022800915002","2025031900187001","2025022700985001","2025022400767001","2025021400759001","2025022701016001","2025030400811001","2025022700312001","2025031800576001","2025022500008002","2025031100524001","2025022400052001","2025030600120001","2025022700499001","2025022700525002","2025030400883001","2025022300033001","2025031001008001","2025031201029001","2025030401000001","2025022600303001","2025022700887001","2025031300292001","2025022700282001","2025022400624001","2025030500624001","2025031700367001","2025022800064001","2025030500030002","2025030300471001","2025031400020001","2025021100386001","2025030600796001","2025031200470001","2025030300940001","2025021900554001","2025021900699001","2025030301042001","2025032100744001","2025022701135001","2025030600650002","2025030401071001","2025031100254001","2025031000870001","2025030700831001","2025022500409003","2025022600916001","2025030600746001","2025022800392001","2025022600218001","2025031100383001","2025022500473001","2025022600174003","2025022400903001","2025032000432001","2025030601140001","2025022400225001","2025030600103001","2025022700852001","2025031800706001","2025030300602001","2025022800886001","2025030700043002","2025022800162001","2025030400787001","2025031100604001","2025030500353001","2025030700247001","2025030700379002","2025030700328001","2025031800441001","2025022600524001","2025022700732001","2024103100310001","2025022700990001","2025021400353001","2025031000824001","2025032001124001","2025030600806002","2025022800255001","2025030300254001","2025030401075001","2025030300388002","2025030600075001","2025022600744001","2025031000225002", "2025022700172001","2025022601086001", "2025022800883001","2025031100309001", "2025032400649001","2025022800841001", "2025030100010002","2025032000045001", "2025030700799001","2025022801001001", "2025022800752002","2025032100812001", "2025030400231001","2025030300621004", "2025030500672001","2025022600313001", "2025031100988001","2025030400966001", "2025031100791001","2025030800045001", "2025021200528001","2025031001165001", "2025031001160001", "2025021800719001"]`

As part of the response I received the json below. This was surprising at first because I thought the results would represent the fully cross-referenced records, however, I forgot an additional step would be necessary. To recap, first I sent a GET request to the **Real Property Master API** using the `MasterRealPropApi.fetchDocIdsFromAcris` method that contained `masterQueryParams` query parameters. The resulting records are returned in a json array assigned to **masterRecordsDocumentIds** that, for my [test case](<(#test-case-empire)>), contained 4,133 (unique) `document_id` values. Then I included those **masterRecordsDocumentIds**, along with the `partiesQueryParams` query parameters, in the subsequent (second) GET request to the **Real Property Parties API** using the `PartiesRealPropApi.fetchDocIdsFromAcrisCrossRefMaster` method.

```json
{
  "legalsDocIdsCrossRefParties": [
    "2025032100812001",
    "2025021400759001",
    "2024103100310001",
    "2025021900554001",
    "2025022100710001",
    "2025022300033001",
    "2025022400052001",
    "2025022500409003",
    "2025022600313001",
    "2025022600605009",
    "2025022600744001",
    "2025022600916001",
    "2025022700499001",
    "2025022700887001",
    "2025022700990001",
    "2025022701016001",
    "2025022800162001",
    "2025022800752002",
    "2025022800841001",
    "2025022800883001",
    "2025022801001001",
    "2025030300254001",
    "2025030300940001",
    "2025030301042001",
    "2025030400231001",
    "2025030400811001",
    "2025030401000001",
    "2025030401071001",
    "2025030401114001",
    "2025030500030002",
    "2025030500672001",
    "2025030600650002",
    "2025030600806002",
    "2025030601140001",
    "2025030700379002",
    "2025030700831001",
    "2025031000349001",
    "2025031100309001",
    "2025031100383001",
    "2025031100604001",
    "2025031100988001",
    "2025031201029001",
    "2025031800706001",
    "2025032000432001",
    "2025032001124001",
    "2025032100622001",
    "2025021800719001"
  ]
}
```

##### Step 4: Retrieve Full Records

- Goal: Fetch the full records for the final set of `document_id` values.
- Approach:
  - Once the cross-referencing is complete, make a final batch of API calls to retrieve the full records for the remaining `document_id` values.
  - Use `$where=document_id IN (...)` to fetch records in batches.

##### Step 5: Return Results to the Frontend

- Goal: Provide the user with the final cross-referenced dataset.
- Approach:
  - Combine the records from all datasets into a single response object.
  - Ensure the response is paginated if the result set is large.

---

##### How to test query url character limit from Socrata

###### 1. Determine the NYC Open Data API's Query URL Character Limit [ARCHIVED]

Before implementing the solution, you need to test the API's query URL character limit. Here's how:

- Start with a small number of `document_id` values (e.g., 10) and gradually increase the number until the API returns an error.
- Log the constructed query URL and measure its length to determine the maximum safe character limit.
- For example:

```js
const testDocumentIds = Array.from({ length: 1000 }, (_, i) => `ID${i + 1}`);
const testUrl = `https://data.cityofnewyork.us/resource/636b-3b5g.json?$where=document_id IN (${testDocumentIds
  .map((id) => `'${id}'`)
  .join(", ")})&$select=document_id`;
console.log("Test URL length:", testUrl.length);
```

**testing notes**
`2025021800719001` is a match for the search criteria that I'm using in Postman where `party_type` is `1` and `name` is "EMPIRE" for the Parties API and is also a match for the Master API where `doc_type` is "DEED" and `document_start_date` is "2025-02-01" and `document_start_date` is "2025-03-31". I keep it at the end of the sample `document_id` values below

50: `200 OK`

```json
"2025022800270001", "2025032100622001", "2025022400701001", "2025031800626001", "2025022100710001", "2025022800877002", "2025022500488002", "2025022600605009", "2025022800770001", "2025030500445001", "2025030400224001", "2025030700273001", "2025032000231001", "2025022700477001", "2025031000349001", "2025031200609001", "2025022800170001", "2025022500408006", "2025030500288002", "2025030401114001", "2025022700110001", "2025022500405001", "2025022600900001", "2025022500216001", "2025022500468001", "2025022800492001", "2025022800812001", "2025022800915002", "2025031900187001", "2025022700985001", "2025022400767001", "2025021400759001", "2025022701016001", "2025030400811001", "2025022700312001", "2025031800576001", "2025022500008002", "2025031100524001", "2025022400052001", "2025030600120001", "2025022700499001", "2025022700525002", "2025030400883001", "2025022300033001", "2025031001008001", "2025031201029001", "2025030401000001", "2025022600303001", "2025022700887001", "2025021800719001",
```

100: `200 OK`

```json
"2025022800270001", "2025032100622001", "2025022400701001", "2025031800626001", "2025022100710001", "2025022800877002", "2025022500488002", "2025022600605009", "2025022800770001", "2025030500445001", "2025030400224001", "2025030700273001", "2025032000231001", "2025022700477001", "2025031000349001", "2025031200609001", "2025022800170001", "2025022500408006", "2025030500288002", "2025030401114001", "2025022700110001", "2025022500405001", "2025022600900001", "2025022500216001", "2025022500468001", "2025022800492001", "2025022800812001", "2025022800915002", "2025031900187001", "2025022700985001", "2025022400767001", "2025021400759001", "2025022701016001", "2025030400811001", "2025022700312001", "2025031800576001", "2025022500008002", "2025031100524001", "2025022400052001", "2025030600120001", "2025022700499001", "2025022700525002", "2025030400883001", "2025022300033001", "2025031001008001", "2025031201029001", "2025030401000001", "2025022600303001", "2025022700887001", "2025031300292001", "2025022700282001", "2025022400624001", "2025030500624001", "2025031700367001", "2025022800064001", "2025030500030002", "2025030300471001", "2025031400020001", "2025021100386001", "2025030600796001", "2025031200470001", "2025030300940001", "2025021900554001", "2025021900699001", "2025030301042001", "2025032100744001", "2025022701135001", "2025030600650002", "2025030401071001", "2025031100254001", "2025031000870001", "2025030700831001", "2025022500409003", "2025022600916001", "2025030600746001", "2025022800392001", "2025022600218001", "2025031100383001", "2025022500473001", "2025022600174003", "2025022400903001", "2025032000432001", "2025030601140001", "2025022400225001", "2025030600103001", "2025022700852001", "2025031800706001", "2025030300602001", "2025022800886001", "2025030700043002", "2025022800162001", "2025030400787001", "2025031100604001", "2025030500353001", "2025030700247001", "2025030700379002", "2025030700328001", "2025031800441001", "2025022600524001", "2025022700732001", "2025021800719001",
```

200: `200 OK`

300: `200 status`

400: status: `200 OK`

500: status: `200 OK`

600: status: `200 OK`

620: status: `431 Request Header Fields Too Large`

650: status: `431 Request Header Fields Too Large`

I found that with the query url: `http://localhost:3001/api/real-property-parties/fetchDocIdsCrossRefMasterDocIds?party_type=1&name=EMPIRE&masterRecordsDocumentIds=["2025022800270001", "2025032100622001", "2025022400701001"...]` and 620 `document_id` values the url was too large. There were 13171 characters including spaces to the right of the `?`. Since this query does not have that many parameters I think for now I will hard code the limit to be 500 `document_id` values which should leave 100 characters. Eventually I will need to create a function that populates the query url dynamically based on the remaining space by giving priority to the Party query parameters (e.g. `party_type=1`and `name=EMPIRE`) and then adding `document_id` values (e.g. `masterRecordsDocumentIds=["2025022800270001", "2025032100622001", "2025022400701001"...]`) until the max space has been reached.

###### 2. Refactor `constructPartiesUrlCrossRefMasterSelectDocIds`

- Modify this method to construct query URLs in batches based on the determined character limit or a fixed batch size (e.g., 1,000 `document_id` values per batch).
- [x] COMPLETE
- Updated Method:

```js
static constructPartiesUrlCrossRefMasterSelectDocIds(partiesQueryParams, masterRecordsDocumentIds, batchSize = 1000) {

}
```

###### 3. Refactor `fetchDocIdsFromAcrisCrossRefMaster`

- Update this method to handle multiple query URLs (batches) and make paginated GET requests for each batch.
- [x] COMPLETE
- Updated Method:

```js
static async fetchDocIdsFromAcrisCrossRefMaster(partiesQueryParams, masterRecordsDocumentIds, batchSize = 1000) {

}
```

- [x] Create

###### 4. Test the Refactored Methods

- Use Postman to test the `/fetchDocIdsCrossRefMasterDocIds` route with a large number of document_id values (e.g., 5,778).
- Verify that the API handles the batched and paginated requests correctly and returns the expected results.

###### 5. Handle Edge Cases

- Empty `masterRecordsDocumentIds`: If the array is empty, return an empty result immediately.
- API Errors: Add error handling to retry failed requests or log detailed error messages for debugging.
- Performance: Use `Promise.all` to parallelize requests for different batches if the API allows concurrent requests.

###### 6. Example Workflow

- Input:
  - `partiesQueryParams`: `{ party_type: "1", name: "EMPIRE" }`
  - `masterRecordsDocumentIds`: `[ "ID1", "ID2", ..., "ID5778" ]`
- Output:
  - A deduplicated array of `document_id` values from the ACRIS Real Property Parties dataset that match the criteria.

###### 7. Next Steps

After implementing and testing the refactored methods, you can proceed to add error handling to the `/fetchDocIdsCrossRefMasterDocIds` route as discussed earlier.

---

**Analysis of Your Considerations**
**Consideration A: Retrieve All Records or Only Their `document_id` Values**

- Pros:
  - Requesting only `document_id` values reduces the size of API responses, improving performance.
  - Cross-referencing `document_id` values first ensures that only relevant records are retrieved in subsequent steps.
- Cons:
  - Increases the number of API calls because you need to make additional requests to fetch the full records after cross-referencing.
  - Adds complexity to the implementation, as you need to manage multiple stages of API calls.

**Recommendation**: Use this approach because the reduced response size outweighs the cost of additional API calls. It is especially useful when datasets are large.

---

**Consideration B: Cross-Referencing Datasets by Including `document_id` Values in Subsequent GET Requests**

- Pros:
  - Dynamically querying datasets with `document_id` values reduces the size of responses from subsequent API calls.
  - Ensures that only relevant records are retrieved, minimizing unnecessary data processing.
- Cons:
  - Requires careful handling of query construction, especially when the number of `document_id` values exceeds the API's URL length limit.
  - May require additional API calls to determine the optimal query order based on the number of matches.
    **Recommendation**: Use this approach in combination with Consideration A. Dynamically querying datasets with `document_id` values is efficient and scalable when paired with a batching or pagination system.

---

**Consideration C: Pagination vs. Batching vs. Other Techniques**

- Pagination:
  - Definition: Dividing the results of an API query into smaller chunks (pages) and retrieving them one at a time.
  - Use Case: Ideal for datasets with a large number of records and when the API enforces a response size limit (e.g., 1,000 records).
  - Implementation:
    - Use the $limit and $offset parameters to retrieve records in pages.
    - Example:

```js
https://data.cityofnewyork.us/resource/bnx9-e6tj.json?$select=document_id&$limit=1000&$offset=0
https://data.cityofnewyork.us/resource/bnx9-e6tj.json?$select=document_id&$limit=1000&$offset=1000
```

- Batching:
  - Definition: Dividing a large set of query parameters (e.g., `document_id` values) into smaller groups and making separate API calls for each batch.
  - Use Case: Ideal when querying datasets with a large number of `document_id` values.
  - Implementation:
    - Divide the `document_id` values into batches of 1,000 (or fewer, depending on the API's URL length limit).
    - Example:

```js
https://data.cityofnewyork.us/resource/636b-3b5g.json?$where=document_id IN ('ID1', 'ID2', ..., 'ID1000')
https://data.cityofnewyork.us/resource/636b-3b5g.json?$where=document_id IN ('ID1001', 'ID1002', ..., 'ID2000')
```

- Other Techniques:
  - Parallel Requests:
    - Make multiple API calls simultaneously to reduce overall execution time.
    - Use a library like axios.all or Promise.all in JavaScript.
  - Caching: - Cache frequently queried `document_id` values or records to reduce redundant API calls. - Use a caching layer like Redis or an in-memory store.
    **Recommendation**: Use a combination of pagination and batching. Pagination is ideal for retrieving `document_id` values, while batching is effective for querying records with large sets of `document_id` values.

---

**Additional Considerations**

1. Error Handling:
   - Implement robust error handling to retry failed API calls.
   - Log errors for debugging and monitoring.
2. Rate Limiting:
   - Respect the API's rate limits to avoid being throttled or blocked.
   - Use a rate-limiting library or implement delays between API calls.
3. Scalability:
   - Design the system to handle increasing dataset sizes and user queries.
   - Use asynchronous processing to avoid blocking the server.
4. User Experience:
   - Provide progress updates to the user if the query takes a long time to complete.
   - Allow users to refine their queries to reduce the number of matches.

---

**Final Plan**

1. Determine Query Order:
   - Perform $select=count(\*) queries for each dataset to determine the number of matches.
   - Query the dataset with the smallest number of matches first.
2. Retrieve `document_id` Values:

- Use pagination to retrieve document_id values from each dataset.
- Store the document_id values in a hash map or set.

3. Cross-Reference document_id Values:
   - Intersect the document_id values from all datasets to narrow down the results.
4. Retrieve Full Records:
   - Use batching to fetch the full records for the remaining document_id values.
5. Return Results:
   - Combine the records from all datasets into a single response object.
   - Paginate the response if necessary.

**Example Workflow**
**Step 1: Query Order**

- Perform $select=count(\*) queries:
  - Real Property Master API: 5,776 matches.
  - Real Property Parties API: 16,840 matches.
  - Real Property Legals API: Unknown (assume 10,000 matches).

**Step 2: Retrieve document_id Values**

- Query the Real Property Master API first: `https://data.cityofnewyork.us/resource/bnx9-e6tj.json?$select=document_id&$limit=1000&$offset=0`
- Repeat for the other datasets.

**Step 3: Cross-Reference**

- Intersect the document_id values from all datasets.

**Step 4: Retrieve Full Records**

- Use batching to fetch the full records: `https://data.cityofnewyork.us/resource/bnx9-e6tj.json?$where=document_id IN ('ID1', 'ID2', ..., 'ID1000')`

**Step 5: Return Results**

- Combine the records and return them to the frontend.

[Back to TOC](#table-of-contents)

###### ChatGPT Digression: pagination vs batch requests vs throttling

Also, I know that the API record limit is 1,000 records and expect to always exceed that limit. I need you to help me make design decisions with respect to using pagination, batch requests, making paralell requests or a combination of these approaches to ensure that all of the matching `document_id` values will be received. As part of this process and before executing `fetchDocIdsFromAcris` I plan on running the function `constructMasterUrlCountRec` to find out how many matching records match the query criteria. Once I receive the number of records (e.g. `{ "records": { "masterRecordCount": 5776 }}`) I want to run `fetchDocIdsFromAcris` to obtain the `document_id` value for each of those 5,776 records. I could use a pagination system to obtain all of those records which would require at least 6 GET requests. I do not know how pagination works but I suspect that it involves making multiple GET requests in a specific order and that each subsequent request is not sent until the prior request's response is received. Referring back to my example of the `"masterRecordCount": 5776` number or records I assume using a pagination method would involve making the initial GET request and receive 1,000 `document_id` values, save them to a hash map variable called `masterRecordsDocumentIds` (for example), then keep making subsequent GET requests until all 5,776 `document_id` values are saved to `masterRecordsDocumentIds`. The other option could be to use a batch request system where I send out all 6 GET requests at once that run parallel (or concurrent) with each other. Since I already know from executing my `fetchDocIdsFromAcris` function that there are 5776 matching records then I could configure the first search to retrieve the first 1,000 records, the second search to retrieve the next 1,000 records, etc. However, I don't know if this is a best practice or how to do it. I'm not concerned about the order in which I receive these 5,776 `document_id` values and I would prefer to receive them as quickly as possible. Based on the aforementioned description what are my options?

**1. Pagination**
Pagination involves making sequential GET requests, where each request retrieves a fixed number of records (e.g., 1,000). Each subsequent request uses an offset to fetch the next set of records.

**How It Works:**
Use the constructMasterUrlSelectDocIds method to construct the base URL.
Add $limit=1000 and $offset=<value> to the query string.
Start with offset=0 and increment it by 1,000 for each subsequent request.
Stop when all records are fetched.

**Example:**

```js
async function fetchDocIdsWithPagination(query, totalRecords) {
  const limit = 1000;
  const totalPages = Math.ceil(totalRecords / limit);
  const documentIds = [];

  for (let page = 0; page < totalPages; page++) {
    const offset = page * limit;
    const url = `${MasterRealPropApi.constructMasterUrlSelectDocIds(
      query
    )}&$limit=${limit}&$offset=${offset}`;
    const response = await axios.get(url, {
      headers: { "X-App-Token": process.env.APP_TOKEN },
    });
    documentIds.push(...response.data.map((record) => record.document_id));
  }

  return documentIds;
}
```

**Pros:**

- Simple to implement.
- Sequential and predictable.
  **Cons:**
- Slower because each request waits for the previous one to complete.

---

**2. Batch Requests**
Batching involves sending multiple GET requests simultaneously, each configured to fetch a specific range of records.

**How It Works:**

1. Use the `constructMasterUrlSelectDocIds` method to construct the base URL.
2. Divide the total records into batches of 1,000.
3. Send all requests at once using `Promise.all`.

**Example:**

```js
async function fetchDocIdsWithBatching(query, totalRecords) {
  const limit = 1000;
  const totalPages = Math.ceil(totalRecords / limit);
  const requests = [];

  for (let page = 0; page < totalPages; page++) {
    const offset = page * limit;
    const url = `${MasterRealPropApi.constructMasterUrlSelectDocIds(
      query
    )}&$limit=${limit}&$offset=${offset}`;
    requests.push(
      axios.get(url, {
        headers: { "X-App-Token": process.env.APP_TOKEN },
      })
    );
  }

  const responses = await Promise.all(requests);
  const documentIds = responses.flatMap((response) =>
    response.data.map((record) => record.document_id)
  );
  return documentIds;
}
```

**Pros:**

- Faster because requests are sent concurrently.
- Ideal for large datasets.
  **Cons:**
- Higher memory usage.
- May overwhelm the API or network if too many requests are sent simultaneously.

---

**3. Parallel Requests with Throttling**
Parallel requests with throttling involve sending a limited number of requests concurrently to avoid overwhelming the API.

**How It Works:**

1. Use the `constructMasterUrlSelectDocIds` method to construct the base URL.
2. Divide the total records into batches of 1,000.
3. Use a library like `p-limit` or implement a custom throttling mechanism to limit the number of concurrent requests.

**Example:**

```js
const pLimit = require("p-limit");

async function fetchDocIdsWithThrottling(query, totalRecords) {
  const limit = 1000;
  const totalPages = Math.ceil(totalRecords / limit);
  const maxConcurrentRequests = 5; // Limit to 5 concurrent requests
  const limitConcurrency = pLimit(maxConcurrentRequests);

  const requests = Array.from({ length: totalPages }, (_, page) => {
    const offset = page * limit;
    const url = `${MasterRealPropApi.constructMasterUrlSelectDocIds(
      query
    )}&$limit=${limit}&$offset=${offset}`;
    return limitConcurrency(() =>
      axios.get(url, {
        headers: { "X-App-Token": process.env.APP_TOKEN },
      })
    );
  });

  const responses = await Promise.all(requests);
  const documentIds = responses.flatMap((response) =>
    response.data.map((record) => record.document_id)
  );
  return documentIds;
}
```

**Pros:**
Balances speed and resource usage.
Avoids overwhelming the API.
**Cons:**
Slightly more complex to implement.

---

**Recommendations for Your Use Case**

1. If Speed is Critical: Use Batch Requests to fetch all records as quickly as possible.
2. If API Rate Limits are a Concern: Use Parallel Requests with Throttling to balance speed and resource usage.
3. If Simplicity is Preferred: Use Pagination, as it is straightforward and predictable.

**Summary of Examples**

1. Pagination: Sequential requests, slower but simple.
2. Batch Requests: Concurrent requests, faster but resource-intensive.
3. Parallel Requests with Throttling: Concurrent requests with a limit, balances speed and resource usage.

---

- [x] I will also need to create the `constructMasterUrlSelectDocIds` method that will construct a query URL based upon the `masterQueryParams` values, however, instead of retrieving all of the records I only want to retrieve the `document_id` values from matching records. If possible I would like the `constructMasterUrlSelectDocIds` method to reuse the `constructMasterUrl` method.

[Back to TOC](#table-of-contents)

### Revised Refactor Plan (prompt 2 / edited & used as prompt 3) (4/12/25) [ARCHIVED]

@workspace I need your help by critiquing my refactor plan for my `queryAcrisPartyName`, `MasterRealPropApi`, `PartiesRealPropApi`, `LegalsRealPropApi`, `RemarksRealPropApi` and `ReferencesRealPropApi` code below based on the following behavior. Once you have reviewed my plan I want you to make suggestions if my plan does not coincide with "best practices" and to explain anything I may have missed that could break my code or cause undesireable behaviors.

As background, the front end sends a request with data in the format below which is received by the `queryAcrisPartyName` backend route. The `borough`, `doc_type`, `document_date_range`, `document_date_start` and `document_date_end` values are all associated with the Real Property Master dataset so they are passed to the `masterQueryParams` variable to be used by `MasterRealPropApi` to make an axios GET request. The `name` and `party_type` values are associated with the Real Property Parties dataset so they are passed to the `partiesQueryParams` variable to be used by `PartiesRealPropApi` to make a separate axios GET request. If `masterDataset` is equal to `true` then I want to send a HTTP GET request using `MasterRealPropApi` which takes `masterQueryParams` as its sole parameter and if `partiesDataset` is `true` then I want to send a HTTP GET request using `PartiesRealPropApi` which takes `partiesQueryParams` as its sole parameter.

I want to add a function called `constructMasterUrl` to my `MasterRealPropApi` file and a function called `constructPartiesUrl` to my `PartiesRealPropApi` file that will construct the `url` based on the values contained in `masterQueryParams` and `partiesQueryParams`, respectively, which the `fetchFromAcris` function, from each file, will then use to make its own `axios` GET request.

The `constructMasterUrl` will accept the following optional parameters: `document_id`, `crfn`, `borough` (corresponds to the value of `borough` from `masterQueryParams`), `doc_type` (corresponds to the value of `doc_type` from `masterQueryParams`), `document_date` (corresponds to the value of `document_date_range` , `document_date_start` and `document_date_end` from `masterQueryParams`), `document_amt`, `recorded_datetime`, `modified_date`, `reel_yr`, `reel_nbr`, `reel_pg` and `percent_trans`.

The `constructPartiesUrl` will accept the following optional parameters: `document_id`, `party_type` (corresponds to the value of `party_type` from `partiesQueryParams`), `name` (corresponds to the value of `name` from `partiesQueryParams`), `address_1`, `address_2`, `country`, `city`, `state` and `zip`.

The `constructMasterUrl` and `constructPartiesUrl` should construct the `url` using Socrata Query Language (SoQL) syntax and specifically use the `$where` parameter to specify multiple conditions combined with logical operators such as `AND` and `OR` such as `$where=borough='3' AND document_id between '20250401' and '20250415' AND doc_type='DEED'`. Additionally, the `constructMasterUrl` and `constructPartiesUrl` functions should use a function called "validateQueryParams" that contains logic to validate the query parameters and check the format and values of before proceeding with the API calls.

Initially, I wanted to create a function called "createDocumentDateSocrataSyntax" in the `MasterRealPropApi` file that accepts `document_date_range`, `document_date_start` and `document_date_end` parameters and returns a string of text representing a SoQL syntax that queries a range using the start date value: `document_date_start` and the end date value: `document_date_end` for the column `document_date`, however, I think it would be more efficient to have a utility function called "alterSearch" that generates SoQL syntax depending on whether the query parameters specify (i) a range of values associated with `document_date` (derived from the values of `document_date_range`, `document_date_start` and `document_date_end`) and any other column name such as `document_id`, `borough`, `doc_type`, (ii) an exact value associated with a column name, (iii) a list of values associated with a column name, (iv) wildcard queries (e.g. `name like 'empire%'`) and (v) Null/Not Null Queries (e.g., `document_amt is not null`).

The results of the `MasterRealPropApi` API call should be saved to `masterRecords` and the results of the `PartiesRealPropApi` API call should be saved to `partyRecords`. Then I want to create a function called "combineMasterPartyRecords" which combines the `masterRecords` and `partyRecords` records into a variable called `primaryRecords` and cross references those records so that `primaryRecords` only includes records from `masterRecords` and `partyRecords` that contain the same `document_id` value. For example, if a record in `masterRecords` has a `document_id` that is not present in `partyRecords`, it should be excluded from `primaryRecords`. Similarly, if a record in `partyRecords` has a `document_id` that is not present in `masterRecords`, it should be excluded from `primaryRecords`. As part of the "combineMasterPartyRecords" function I want to populate a variable called `primaryRecordDocumentIds` which is an array of unique `document_id` values derived from the `primaryRecords` results. The `primaryRecordDocumentIds` values will be used by the `LegalsRealPropApi`, `ReferencesRealPropApi` and `RemarksRealPropApi` to make separate API GET requests for records that contain the `document_id` values from the `primaryRecordDocumentIds` array and the results of those requests will be pushed to the `legalsRecords`, `referenceRecords` and `remarkRecords` arrays, respectively. In order to achieve this behavior a new function called "fetchSecondaryDataFromAcris" will need to be created in the `LegalsRealPropApi`, `ReferencesRealPropApi` and `RemarksRealPropApi` files that (1) will only accept an array of `document_id` values as its sole parameter, (2) constructs a query URL using SoQL syntax with the `$where` parameter containing the `document_id` values from the array and sends the `url` and request using axios in the same way that `fetchFromAcris` does. Alternatively it may be a good idea to create a separate utility function that constructs the `SoQL` URL based on the values in `primaryRecordDocumentIds` to be used by `LegalsRealPropApi`, `ReferencesRealPropApi` and `RemarksRealPropApi` when they make their API GET requests using the "fetchSecondaryDataFromAcris". Keep in mind if records are not received from the "fetchSecondaryDataFromAcris" function then an object should be created with a property called "search-status" with a value of "none found" such as the code snippet:

```js
if (response.data.length === 0) {
  return { searchStatus: "none found", documentIds: [...documentIds] };
}
```

The results contained in `legalsRecords`, `referenceRecords` and `remarkRecords` will then be saved in a variable called `secondaryRecords` which, should only include records that have `document_id` values that were in the `primaryRecordDocumentIds` array. Then I want to combine `primaryRecords` and `secondaryRecords` into a variable called `records` with the architecture below which uses a flatter structure where each `document_id` is a key in an object, and the associated data is grouped by type.

Based on the aforementioned refactor plan and the code below how does my plan sound and is it viable to achieve the behavior that I mentioned above? If the plan sounds viable then list the steps for how I should accomplish this and if some parts don't make sense then explain what they are. Keep in mind I do not want you to provide refactored code yet and instead want you to "refine" my refactor plan so I am more likely to achieve the behavior I described above. Also, I will eventually create tests for each of these functions but first I want to get the code working first.

example data received from frontend:

```bash
Received request with query parameters: {
  name: 'empire',
  document_date_range: 'last-7-days',
  document_date_start: '2025-04-06',
  document_date_end: '2025-04-13',
  borough: '3',
  party_type: '1',
  doc_type: 'DEED',
  doc_class: 'DEEDS AND OTHER CONVEYANCES',
  masterDataset: 'true',
  legalsDataset: 'true',
  partiesDataset: 'true',
  referencesDataset: 'true',
  remarksDataset: 'true'
}
```

example of potential structure of `records` array:

```
[
  {
    "document_id": "123456789",
    "master": [...],
    "lot": [...],
    "party": [...],
    "references": [...],
    "remarks": [...]
  },
  {
    "document_id": "987654321",
    "master": [...],
    "lot": [...],
    "party": [...],
    "references": [...],
    "remarks": [...]
  },

]
```

**see the previous file for exact code used in the above prompt**
`queryAcrisPartyName-copy-pre-refactor-4-18-24.js`

**see the same file for slightly modified code that was used in the above prompt**
`MasterRealPropApi`
`PartiesRealPropApi`
`ReferencesRealPropApi`

[Back to TOC](#table-of-contents)

### Revised Refactor Plan (response 3) [ARCHIVED]

#### Strengths of Your Plan

1. Separation of Concerns:

- Introducing `constructMasterUrl` and `constructPartiesUrl` encapsulates URL construction logic, improving modularity and reusability.
- Similarly, introducing `fetchSecondaryDataFromAcris` for secondary datasets ensures that the logic for handling multiple `document_id` values is centralized.

2. Primary and Secondary Dataset Handling:

   - Splitting datasets into "primary" and "secondary" categories is a good approach. It ensures that primary datasets are fetched first and their results are used to query secondary datasets.

3. Cross-Referencing Records:

   - Filtering `primaryRecords` to include only records with matching `document_id` values is a sound approach for ensuring data consistency.

4. Structured Output:

   - The proposed structure of the `records` array is logical and groups related data by `document_id`. This makes it easier for the front end to consume the data.

5. Error Handling:
   - Your plan includes handling cases where no records are found for a dataset, which is important for robustness.

[Back to TOC](#table-of-contents)

#### Potential Issues and Suggestions

1. Complexity of records Structure
   - The proposed records structure is nested and could become difficult to manage, especially if the number of `document_id` values or record types grows.
   - Suggestion: Instead of deeply nesting the data, consider a flatter structure where each `document_id` is a key in an object, and the associated data is grouped by type:

```json
{
  "123456789": {
    "master": [...],
    "lot": [...],
    "party": [...],
    "references": [...],
    "remarks": [...]
  },
  "987654321": {
    "master": [...],
    "lot": [...],
    "party": [...],
    "references": [...],
    "remarks": [...]
  }
}
```

2. Validation of Query Parameters

   - [x] Your plan mentions validating query parameters in `constructMasterUrl` and `constructPartiesUrl`, but it does not specify how this will be done.
   - Suggestion: Create a utility function (e.g., `validateQueryParams`) that checks the format and values of query parameters. This function should:
     - Ensure required parameters are present.
     - Validate the format of dates, numbers, and strings.
     - Return an error or throw an exception if validation fails.

3. Handling `document_date` in `constructMasterUrl`

- [x] The `document_date` parameter is derived from `document_date_range`, `document_date_start`, and `document_date_end`. Ensure that the logic for constructing this parameter is well-defined and accounts for edge cases (e.g., missing or invalid date values).

4. Utility Function for SoQL Syntax

- This won't be possible since each column of the datasets is unique, not in its data type but, in how it is used in a simple query and in more complex queries that require cross referencing each other. I've kept the idea for `laterSearch` below and will revisit it.
  - Your idea of creating a utility function (e.g., `alterSearch`) to generate SoQL syntax is excellent. This function could handle:
    - Range Queries: e.g., `document_date between '20250401' and '20250415'`.
    - Exact Value Queries: e.g., `borough = '3'`.
    - List Queries: e.g., `document_id in ('123456789', '987654321')`.
  - Additional Query Types:
    - Wildcard Queries: e.g., `name like 'empire%'`.
    - Null/Not Null Queries: e.g., `document_amt is not null`.
  - Suggestion: Implement `alterSearch` as a utility function that accepts a column name, a query type, and the corresponding value(s). It should return a valid SoQL `$where` clause.

5. Error Handling for Secondary Datasets
   - Your plan does not specify how to handle cases where some `document_id` values return results while others do not.
   - Suggestion: Include a mechanism to log or track `document_id` values that did not return results. For example:

```js
if (response.data.length === 0) {
  return { searchStatus: "none found", documentIds: [...documentIds] };
}
```

6. Performance Considerations - fetching data using pagination or batching will be absolutely necessary as it turns out since mimicing the **Search By Party Name** feature returns thousands of records that must be cross referenced with each other.

- [ ] TODO: explore how to incorporate pagination/batching into the `MasterRealPropApi` and other API modules.
  - Fetching data from multiple APIs (especially secondary datasets) could lead to performance bottlenecks if the number of `document_id` values is large.
  - Suggestion:
    - Use batching or pagination when querying secondary datasets to avoid overwhelming the APIs or your server.
    - Consider parallelizing API calls using `Promise.all` for better performance.

7. Testing

- Your plan does not mention testing. Given the complexity of the refactor, thorough testing is essential to ensure correctness.
- Suggestion:
  - Write unit tests for `constructMasterUrl`, `constructPartiesUrl`, and `alterSearch`.
  - Write integration tests for the `queryAcrisPartyName` route to verify the end-to-end behavior.

[Back to TOC](#table-of-contents)

#### Steps to Accomplish the Refactor

1. Refactor `MasterRealPropApi` and `PartiesRealPropApi`:

   - [x] Create and implement `constructMasterUrl` to encapsulate the URL construction logic.
   - [x] Create and implement `constructPartiesUrl` to encapsulate the URL construction logic.
   - [x] Update `fetchFromAcris` to use `constructMasterUrl`. **This function was implemented by `MasterRealPropApi` and I successfully tested it using Postman.**
   - [x] Update `fetchFromAcris` to use `constructPartiesUrl`. **This function was implemented by `MasterRealPropApi` and I successfully tested it using Postman.**
   - [x] Create and implement `constructPartiesUrlCrossRefMaster` to encapsulate the URL construction logic that includes the `document_id` values resulting from the first API request to Real Property Master (`masterRecordsDocumentIds`) and the query parameters from the front end associated with the Real Property Parties dataset (`partiesQueryParams`).

2. Test `MasterRealPropApi` and `PartiesRealPropApi` implementation through the Front End using the `PartyNameSearchForm`

- I found the following results using the criteria below using ACRIS' Party Name Search page. My `PartyNameSearchForm` front end component should return the same results based on the same criteria.
- **Search Criteria**:
  - `name` - "EMPIRE"
  - `document_date` - "Last 1 year" (current date is 4/16/25)
  - `party_type` - "1"
  - `borough` - "Brooklyn/Kings"
  - `document_class` - "DEEDS AND OTHER CONVEYANCES"
    - NB: `document_class` is not a column associated with the Real Property Party endpoint but the `doc_type` column is so for the purposes of my search I created a component that allows the user to choose a "Document Class" from four options, a "Document Type" from one of four lists where each list is directly associated with a "Document Class" and a "Party Type" which is unique for each "Document Type".
- **Results**:
  I found 9 records with the `document_id`, `name` and `document_date` values below. NB, that two of these records have document dates in april 2025 which did not pass my own Postman tests. I had a feeling that these failed my Postman test because the dataset was not updated yet even though the website said it was as of today's date (4/16/25). I tried a different search in an attempt to cast a "wider net" by searching for any records with a `borough` value of `3` with a `document_date` between 4/1/25 and 4/16/25 and I received a `500` status code error and `"Failed to fetch data from ACRIS API"` message. This was disappointing because I cannot create search features for my website that have access to the same "real-time" data as the ACRIS website but it does make the Chrome Extension idea to enhance ACRIS more viable.

  1. "2024051000620001", "EMPIRE ADAR LLC", 5/2/2024 || Passed My Postman Test
  2. "2024042600136001", "EMPIRE HOLDINGS I LLC", 4/18/2024 || Passed My Postman Test
  3. "2025040900070001", "EMPIRE HOLDINGS II, LLC", 4/3/2025 || Failed My Postman Test
  4. "2024112600954001", "EMPIRE REALTY HOLDINGS LLC", 11/19/2024 || Passed My Postman Test
  5. "2025021800719001", "EMPIRE STATE DAIRY LLC", 1/30/2025 || Passed My Postman Test
  6. "2024092300336001", "EMPIRE STATE DAIRYY LLC", 6/7/2023 || Passed My Postman Test
  7. "2024092300336001", "EMPIRE STATE DAIRYY LLC", 6/7/2023 || Passed My Postman Test
  8. "2024092300336001", "EMPIRE STATE DAIRYY LLC", 6/7/2023 || Passed My Postman Test
  9. "2025040900509001", "EMPIRE STATE GRAND COUNCIL ANCIENT AND ACCEPTED SC", 4/3/2025 || Failed My Postman Test

- Test Notes:

I received the request on the backend in the format below:

```bash
Received request with query parameters: {
  searchTerms: {
    name: 'EMPIRE',
    document_date_range: 'last-1-year',
    document_date_start: '2024-04-16',
    document_date_end: '2025-04-16',
    borough: '3',
    party_type: '1',
    doc_type: 'doc-type-default',
    doc_class: 'DEEDS AND OTHER CONVEYANCES'
  },
  primaryApiSources: { masterDataset: 'true', partiesDataset: 'true' },
  secondaryApiSources: {
    legalsDataset: 'false',
    referencesDataset: 'false',
    remarksDataset: 'false'
  }
}

```

The GET request from the front end looks like this:

```bash
GET /queryAcrisPartyName/fetchRecord?searchTerms[name]=EMPIRE&searchTerms[document_date_range]=last-1-year&searchTerms[document_date_start]=2024-04-16&searchTerms[document_date_end]=2025-04-16&searchTerms[borough]=3&searchTerms[party_type]=1&searchTerms[doc_type]=doc-type-default&searchTerms[doc_class]=DEEDS+AND+OTHER+CONVEYANCES&primaryApiSources[masterDataset]=true&primaryApiSources[partiesDataset]=true&secondaryApiSources[legalsDataset]=false&secondaryApiSources[referencesDataset]=false&secondaryApiSources[remarksDataset]=false
```

3. Refactor `LegalsRealPropApi`, `ReferencesRealPropApi`, and `RemarksRealPropApi`:

   - [ ] Add `fetchSecondaryDataFromAcris` to handle fetching data for multiple `document_id` values.
   - [ ] Optionally, use `alterSearch` to construct SoQL syntax for these APIs.

4. Update `queryAcrisPartyName` Route:

   - [x] Use `constructMasterUrl` and `constructPartiesUrl` to construct URLs for primary datasets.
   - [ ] Use `fetchSecondaryDataFromAcris` to fetch data for secondary datasets.
   - [ ] Cross-reference `masterRecords` and `partyRecords` to create `primaryRecords`.
   - [ ] Use `primaryRecordDocumentIds` to fetch data for secondary datasets.
   - [ ] Combine `primaryRecords` and `secondaryRecords` into records.

5. Validate Query Parameters:

   - [ ] Add validation logic to ensure that all required parameters are present and correctly formatted.

6. Optimize Performance:

   - [ ] Implement batching or pagination for secondary dataset queries if necessary.
   - [ ] Use `Promise.all` to parallelize API calls where possible.

7. Test the Implementation:
   - [ ] Write unit tests for all new functions.
   - [ ] Write integration tests for the `queryAcrisPartyName` route.

[Back to TOC](#table-of-contents)

## techniques to think about

Overengineering
GraphQL

Victor 5:09 PM
EDA (Event driven architecture)
— offloading requests from the HTTP request
Optimistic prediction (imagining ahead of time what users are searching for)

## Front End Data received...now what (prompt 1)[ARCHIVED]

@workspace I submitted my `PartyNameSearchForm` form-component from my front end application and it was received by my `queryAcrisPartyName` route with the data formatted and full route syntax below. Now I need to refactor my `queryAcrisPartyName` route's code below to interpret this data from the front end (the "User Request"), configure certain variables as explained more below and then make API calls using the `MasterRealPropApi`, `LegalsRealPropApi`, `PartiesRealPropApi`, `RemarksRealPropApi` or `ReferencesRealPropApi` components. based on those configurations. I need your help with refactoring my code below to achieve the aforementioned behavior and details below.

Background on configuration required: the values of my `primaryDatasets` values (`masterDataset` and
`partiesDataset`) and `secondaryDatasets` (`legalsDataset`, `referencesDataset`, `remarksDataset`) variables. These values will be used to instruct my `queryAcrisPartyName` route to make API calls, or to not make API calls, using the `MasterRealPropApi`, `LegalsRealPropApi`, `PartiesRealPropApi`, `RemarksRealPropApi` or `ReferencesRealPropApi` components. For example, referring to the User Request data below, `primaryApiSources: { masterDataset: 'true', partiesDataset: 'true' }` will instruct my `queryAcrisPartyName` route to send an API request using `MasterRealPropApi` and `PartiesRealPropApi`. Furthermore, `secondaryApiSources: { legalsDataset: 'false', referencesDataset: 'false', remarksDataset: 'false' }` will instruct my `queryAcrisPartyName` route to NOT send an API request using`LegalsRealPropApi`, `RemarksRealPropApi` or `ReferencesRealPropApi`. The `searchTerms` object's key/value pairs will be used to construct the query URL for the `primaryApiSources` whose values are `true` which in this case is the `MasterRealPropApi` and `PartiesRealPropApi` because `primaryApiSources: { masterDataset: 'true', partiesDataset: 'true' }`. I want the `masterQueryParams` to be populated with query parameters: `document_date_range`, `document_date_start`, `document_date_end`, `borough` and `doc_type`. I want the `partiesQueryParams` to be populated with `name` and `party_type`. I also want to keep the validation logic below for these parameters and the conditional logic that ensures at least one valid parameter associated with the Real Property Master dataset, at least one valid parameter associated with the Real Property Parties dataset is provided and that at least one dataset is selected. Then I want to initialize the `masterRecords` array and make the API call with `MasterRealPropApi.fetchFromAcris` using the `masterQueryParams` query parameters and handle the response or any errors from the API call. Then I want to initialize the `partyRecords` array and make the API call with `PartiesRealPropApi.fetchFromAcris` using the `partiesQueryParams` query parameters. There is more to the behavior that I want to implement in the `queryAcrisPartyName` backend route but I need your help achieving the aforementioned behavior with the code below.

data received from frontend:

```bash
Started on http://localhost:3001
User authenticated: { username: 'april152025', isAdmin: false, iat: 1744758092 }
Received request with query parameters: {
  searchTerms: {
    name: 'EMPIRE',
    document_date_range: 'last-1-year',
    document_date_start: '2024-04-16',
    document_date_end: '2025-04-16',
    borough: '3',
    party_type: '1',
    doc_type: 'doc-type-default',
    doc_class: 'DEEDS AND OTHER CONVEYANCES'
  },
  primaryApiSources: { masterDataset: 'true', partiesDataset: 'true' },
  secondaryApiSources: {
    legalsDataset: 'false',
    referencesDataset: 'false',
    remarksDataset: 'false'
  }
}
```

backend route:

```bash
GET /queryAcrisPartyName/fetchRecord?searchTerms[name]=EMPIRE&searchTerms[document_date_range]=last-1-year&searchTerms[document_date_start]=2024-04-16&searchTerms[document_date_end]=2025-04-16&searchTerms[borough]=3&searchTerms[party_type]=1&searchTerms[doc_type]=doc-type-default&searchTerms[doc_class]=DEEDS+AND+OTHER+CONVEYANCES&primaryApiSources[masterDataset]=true&primaryApiSources[partiesDataset]=true&secondaryApiSources[legalsDataset]=false&secondaryApiSources[referencesDataset]=false&secondaryApiSources[remarksDataset]=false 400 76 - 7.802 ms
```

**see the previous file for exact code used in the above prompt**
`queryAcrisPartyName-copy-pre-refactor-4-18-24.js`

**see the same file for slightly modified code that was used in the above prompt**
`MasterRealPropApi`
`PartiesRealPropApi`
`ReferencesRealPropApi`

[Back to TOC](#table-of-contents)

## Front End Data received...now what (response 1)[ARCHIVED]

**Here is a potential refactor plan:**

1. Extract Query Parameters:

   - Extracted `searchTerms`, `primaryApiSources`, and `secondaryApiSources` from the request query.
   - Used optional chaining (`?.`) to safely access nested properties.
   - Extracting Primary Dataset Flags and Extracting Secondary Dataset Flags
     - (A) Dataset Selection: The `primaryDatasets` and `secondaryDatasets` objects are used to decide which datasets to query. For example, if `primaryDatasets.masterDataset` is true, the code will query the Master Dataset using the `MasterRealPropApi` component. If `secondaryDatasets.legalsDataset` is true, the code will query the Lot Dataset using the LegalsRealPropApi component.
     - (B) Conditional API Calls: Later in the code, these flags are checked to conditionally make API calls. For example:

```js
if (primaryDatasets.masterDataset) {
  masterRecords = await MasterRealPropApi.fetchFromAcris(masterQueryParams);
}
if (secondaryDatasets.legalsDataset) {
  legalsRecords = await LegalsRealPropApi.fetchFromAcris(masterQueryParams);
}
```

     - (C) Error Handling: The code ensures that at least one dataset is selected by checking the values of `primaryDatasets` and `secondaryDatasets`. If none are selected, it returns an error:

```js
if (!Object.values(primaryDatasets).some((value) => value)) {
  return res
    .status(400)
    .json({ error: "At least one dataset must be selected." });
}
```

1. Validate Query Parameters:

- Constructed `masterQueryParams` and `partiesQueryParams` based on the `searchTerms` object.
- Added validation to ensure at least one valid parameter is provided for each dataset.

3. Fetch Data from APIs:

- Used `MasterRealPropApi.fetchFromAcris` and `PartiesRealPropApi.fetchFromAcris` to fetch data for the Master and Parties datasets.
- Handled errors gracefully by logging them and adding an error object to the records array.

4. Combine Records:

- Combined `masterRecords` and `partyRecords` into a single `primaryRecords` array.
- Extracted unique `document_id` values from `primaryRecords` for further processing.

5. Return Response:

- Returned the `primaryRecords` array as the response.

```js
"use strict";

/** Routes for ACRIS Real Property API calls. */

const express = require("express");
const MasterRealPropApi = require("../../../api/acris/real-property/MasterRealPropApi");
const PartiesRealPropApi = require("../../../api/acris/real-property/PartiesRealPropApi");
const { transformForUrl } = require("../../../api/utils");

const router = new express.Router();

router.get("/fetchRecord", async function (req, res, next) {
  try {
    console.log("Received request with query parameters:", req.query);

    // Extract searchTerms, primaryApiSources, and secondaryApiSources from the request query.
    const { searchTerms, primaryApiSources, secondaryApiSources } = req.query;

    // Extracting Primary Dataset Flags
    // This creates an object named primaryDatasets that contains boolean values indicating whether the Master Dataset (masterDataset) and Parties Dataset (partiesDataset) should be queried.
    const primaryDatasets = {
      //(I) `primaryApiSources?.masterDataset` explained: The `?.` is the optional chaining operator. It ensures that if `primaryApiSources` is `undefined` or `null`, the code will not throw an error and instead, it will return undefined. Conversely, if `primaryApiSources` exists, it accesses the `masterDataset` property.
      //(II) `=== "true"` explained: This checks if the value of primaryApiSources.masterDataset is the string "true".  If it is "true", the result will be true (a boolean). Otherwise, it will be false.
      //OUTCOME: primaryDatasets.masterDataset will be true if primaryApiSources.masterDataset is "true". Similarly, primaryDatasets.partiesDataset will be true if primaryApiSources.partiesDataset is "true".
      masterDataset: primaryApiSources?.masterDataset === "true",
      partiesDataset: primaryApiSources?.partiesDataset === "true",
    };

    // Extracting Secondary Dataset Flags
    //  This creates an object named `secondaryDatasets` that contains boolean values indicating whether the Lot Dataset (`legalsDataset`), References Dataset (`referencesDataset`), and Remarks Dataset (`remarksDataset`) should be queried.
    const secondaryDatasets = {
      //Similar to the primaryDatasets object, it uses optional chaining (?.) to safely access properties of secondaryApiSources.  It checks if each dataset flag is "true" and converts it to a boolean value.
      //OUTCOME: secondaryDatasets.legalsDataset will be true if secondaryApiSources.legalsDataset is "true". Similarly, secondaryDatasets.referencesDataset and secondaryDatasets.remarksDataset will be true if their respective flags are "true".
      legalsDataset: secondaryApiSources?.legalsDataset === "true",
      referencesDataset: secondaryApiSources?.referencesDataset === "true",
      remarksDataset: secondaryApiSources?.remarksDataset === "true",
    };

    // Extracting Primary Dataset Flags and Extracting Secondary Dataset Flags
    // See More Thorough Explanation Above

    // Validate and construct query parameters for Master and Parties datasets
    const masterQueryParams = {};
    if (searchTerms?.document_date_range)
      masterQueryParams.document_date_range = searchTerms.document_date_range;
    if (searchTerms?.document_date_start)
      masterQueryParams.document_date_start = searchTerms.document_date_start;
    if (searchTerms?.document_date_end)
      masterQueryParams.document_date_end = searchTerms.document_date_end;
    if (searchTerms?.borough) masterQueryParams.borough = searchTerms.borough;
    if (searchTerms?.doc_type)
      masterQueryParams.doc_type = transformForUrl(searchTerms.doc_type);

    const partiesQueryParams = {};
    if (searchTerms?.name)
      partiesQueryParams.name = transformForUrl(searchTerms.name);
    if (searchTerms?.party_type)
      partiesQueryParams.party_type = searchTerms.party_type;

    // Ensure at least one valid parameter for Master and Parties datasets
    if (Object.keys(masterQueryParams).length === 0) {
      return res.status(400).json({
        error:
          "At least one query parameter for the Master Dataset is required.",
      });
    }
    if (Object.keys(partiesQueryParams).length === 0) {
      return res.status(400).json({
        error:
          "At least one query parameter for the Parties Dataset is required.",
      });
    }

    // Ensure at least one dataset is selected
    if (!Object.values(primaryDatasets).some((value) => value)) {
      return res
        .status(400)
        .json({ error: "At least one dataset must be selected." });
    }

    // Initialize arrays to hold records
    let masterRecords = [];
    let partyRecords = [];

    // Fetch data from the Master dataset
    if (primaryDatasets.masterDataset) {
      try {
        console.log(
          "Fetching Master Dataset with query params:",
          masterQueryParams
        );
        masterRecords = await MasterRealPropApi.fetchFromAcris(
          masterQueryParams
        );
        console.log("Fetched Master Records:", masterRecords);
      } catch (err) {
        console.error("Error fetching Master Dataset:", err.message);
        masterRecords.push({
          dataFound: false,
          dataset: "masterDataset",
          error: err.message,
        });
      }
    }

    // Fetch data from the Parties dataset
    if (primaryDatasets.partiesDataset) {
      try {
        console.log(
          "Fetching Parties Dataset with query params:",
          partiesQueryParams
        );
        partyRecords = await PartiesRealPropApi.fetchFromAcris(
          partiesQueryParams
        );
        console.log("Fetched Parties Records:", partyRecords);
      } catch (err) {
        console.error("Error fetching Parties Dataset:", err.message);
        partyRecords.push({
          dataFound: false,
          dataset: "partiesDataset",
          error: err.message,
        });
      }
    }

    // Combine Master and Parties records into primaryRecords
    const primaryRecords = [...masterRecords, ...partyRecords];

    // Extract unique document IDs from primaryRecords
    const primaryRecordDocumentIds = [
      ...new Set(primaryRecords.map((record) => record.document_id)),
    ];

    // Log the results
    console.log("Primary Records:", primaryRecords);
    console.log("Primary Record Document IDs:", primaryRecordDocumentIds);

    // Return the primary records as the response
    return res.json({ primaryRecords });
  } catch (err) {
    console.error("Error in queryAcrisPartyName route:", err.message);
    return next(err);
  }
});

module.exports = router;
```

**Testing the Refactored Code**

1. Restart the Backend Server:

- [x] Restart your backend server to apply the changes.

2. Test the Route in Postman:

- [x] Use the following URL to test the route:

```bash
http://localhost:3001/queryAcrisPartyName/fetchRecord?searchTerms[name]=EMPIRE&searchTerms[document_date_range]=last-1-year&searchTerms[document_date_start]=2024-04-16&searchTerms[document_date_end]=2025-04-16&searchTerms[borough]=3&searchTerms[party_type]=1&searchTerms[doc_type]=doc-type-default&primaryApiSources[masterDataset]=true&primaryApiSources[partiesDataset]=true&secondaryApiSources[legalsDataset]=false&secondaryApiSources[referencesDataset]=false&secondaryApiSources[remarksDataset]=false
```

3. Expected Behavior:

If the API calls succeed, you should receive a JSON response with the primaryRecords array.
If any API call fails, the response will include an error object in the corresponding dataset's records.

[Back to TOC](#table-of-contents)

### Frontend and Backend testing notes

#### Background

The following test is for my Front End route called "partyNameSearch" and my Back End route called `queryAcrisPartyName` which is an attempt to copy a search feature for the NYC Department of Finance's website called "ACRIS" which stands for Automated City Record Indexing System. The homepage for the DOF that launches ACRIS is located here: [https://www.nyc.gov/site/finance/property/acris.page#](https://www.nyc.gov/site/finance/property/acris.page#) and the **Search By Party Name** feature I'm attempting to copy is located here: [https://a836-acris.nyc.gov/DS/DocumentSearch/PartyName](https://a836-acris.nyc.gov/DS/DocumentSearch/PartyName).

ACRIS contains public land record data for all of New York City such as deeds, mortgages, leases and any other document that is directly associated with real property. One of the search feature's of ACRIS is to search for records that are associated with a property owner's `name` with the option to cross-reference `name` with: (i) a date range for `document_date` (e.g. within 7 days from the current date, within 30 days from the current date, custom range, etc.), (ii) a `document_class` representing four categories each of which contains a list of unique `document_type` (e.g. "DEEDS & OTHER CONVEYANCES", "MORTGAGES & INSTRUMENTS", "UCC & FEDERAL LIENS" & "OTHER DOCUMENTS"), (iii) a `party_type` representing the role of that party that is mapped to each `document_type` and (iv) a `borough` representing one of the five NYC Boroughs/NYS Counties where the document was recorded.

The ACRIS data is available hosted by [NYC Open Data](https://opendata.cityofnewyork.us/) comprised of 15 API endpoints that are grouped in three major categories (5 endpoints per category): Real Property, Personal Property and Code Maps. The Real Property and Personal Property categories each represent a full dataset that follow the same schema where each of their 5 datasets are referred to as: (i) Master, (ii) Party, (iii) Lot, (iv) Remarks and (v) References and can be cross referenced with each other using the unique identifying value: `document_id`. For example, a specific deed will have its own `document_id` and if you wanted all the information associated with that deed using the NYC Open Data APIs then you would need to send a GET request to the Real Property-Master, Real Property-Party, Real Property-Lot, Real Property-Remarks and Real Property-References API endpoints. The Code Maps category's five datasets represent codes and data structures that are used to query the Real Property and Personal Property datasets such as arrays of countries and states of the U.S. and arrays of document classes, document types and party types. I've included the link to each API's NYC Open Data webpage below as a reference.

Real Property:

- [Master](http://data.cityofnewyork.us/City-Government/ACRIS-Real-Property-Master/bnx9-e6tj)
- [Party](http://data.cityofnewyork.us/City-Government/ACRIS-Real-Property-Legals/8h5j-fqxa)
- [Lot](http://data.cityofnewyork.us/City-Government/ACRIS-Real-Property-Parties/636b-3b5g)
- [References](http://data.cityofnewyork.us/City-Government/ACRIS-Real-Property-References/pwkr-dpni)
- [Remarks](http://data.cityofnewyork.us/City-Government/ACRIS-Real-Property-Remarks/9p4w-7npp)

Personal Property:

- [Master](http://data.cityofnewyork.us/City-Government/ACRIS-Personal-Property-Master/sv7x-dduq)
- [Party](http://data.cityofnewyork.us/City-Government/ACRIS-Personal-Property-Legals/uqqa-hym2)
- [Lot](http://data.cityofnewyork.us/City-Government/ACRIS-Personal-Property-Parties/nbbg-wtuz)
- [References](http://data.cityofnewyork.us/City-Government/ACRIS-Personal-Property-References/6y3e-jcrc)
- [Remarks](http://data.cityofnewyork.us/City-Government/ACRIS-Personal-Property-Remarks/fuzi-5ks9)

Code Maps:

- [Document Control Codes](https://data.cityofnewyork.us/City-Government/ACRIS-Document-Control-Codes/7isb-wh4c/about_data)
- [UCC Collateral Codes](https://data.cityofnewyork.us/City-Government/ACRIS-UCC-Collateral-Codes/q9kp-jvxv/about_data)
- [Property Types Codes](https://data.cityofnewyork.us/City-Government/ACRIS-Property-Types-Codes/94g4-w6xz/about_data)
- [State Codes](https://data.cityofnewyork.us/City-Government/ACRIS-State-Codes/5c9e-33xj/about_data)
- [Country Codes](https://data.cityofnewyork.us/City-Government/ACRIS-Country-Codes/j2iz-mwzu/about_data)

In order to copy the ACRIS **Search By Party Name** feature I have a Front End webpage (e.g. http://localhost:3000/partyNameSearch) sending search terms associated with the Real Property Master and Real Property Parties datasets to my Backend route (e.g. http://localhost:3001/queryAcrisPartyName/fetchRecord?searchTerms[...]=...).

- [x] I make an API GET request to the [Real Property Master API](http://data.cityofnewyork.us/City-Government/ACRIS-Real-Property-Master/bnx9-e6tj) with the `masterQueryParams`: `borough`, `doc_type`, `document_date_start` and `document_date_end` (two date type values representing a range search query of the `document_type` column).
- [x] I save the resulting records to the `masterRecords` array while creating the array-type variable `masterRecordsDocumentIds` containing the `document_id` value of each record in `masterRecords`.

**For example, I searched on the ACRIS website using the search criteria:**

- `name`: "EMPIRE"
- `document_date`: "last-1-year"
- `party_type`: "1"
- `borough`: "3" (Brooklyn)
- `document_class`: DEEDS AND OTHER CONVEYANCES
  - NB: to simulate the search on my end I must search for the `doc_type` values: "DEED", "MEMORANDUM OF LEASE" and "CONDO DECLARATION"

**and got the 9 records with the Document Ids:**

```bash
Master Records Document IDs (with names and document dates for context): [
  '2024051000620001', //(EMPIRE ADAR LLC, 5/2/2024)
  '2024042600136001', //(EMPIRE HOLDINGS I LLC, 4/18/2024)
  '2025040900070001', //(EMPIRE HOLDINGS II, LLC, 4/3/2025)<--this record will not show up in my search because the datasets are not updated for the month of April 2025 (see Test Summary below).
  '2024112600954001', //(EMPIRE REALTY HOLDINGS LLC, 11/19/2024)
  '2025021800719001', //(EMPIRE STATE DAIRY LLC, 1/30/2025)
  '2024092300336001', //(EMPIRE STATE DAIRYY LLC, 6/7/2023 <--note these three rows below refer to the same `document_id` ...)
  '2024092300336001', //(...but as it turns out they have different `lot` data (e.g. lot = 1001, 1002, 1003)...)
  '2024092300336001', //(...so you will only see one record listed in my replicated-search)
  '2025040900509001', //(EMPIRE STATE GRAND COUNCIL ANCIENT AND ACCEPTED SC, 4/3/2025) <--this record will not show up in my search because the datasets are not updated for the month of April 2025 (see Test Summary below).

]
```

**I replicated the search above using my Backend server and Postman using the query:** `https://data.cityofnewyork.us/resource/636b-3b5g.json?$where=name LIKE '%25EMPIRE%25' AND party_type='1' AND document_id IN ('2024051000620001',  '2024042600136001',  '2025040900070001',  '2024112600954001',  '2025021800719001',  '2024092300336001',  '2024092300336001',  '2024092300336001',  '2025040900509001')`

**And got the 5 results:**

- note that `2024092300336001` shows up once below but three times when I used ACRIS because it was recorded against three different properties which you would only know if you cross referenced the `lot` dataset
- note that `2025040900070001` and `2025040900509001` did not show up in my replicated-search due to the datasets not being updated for the month of April 2025 (my search date is 4/19/25)
- this means my replicated-test was "successful" even though it did not match my experience on ACRIS. It was even more helpful because it exposed how the datasets are not updated frequently backend and how a document with a unique `document_id` is displayed multiple times depending on how many properties it was recorded.

```json
[
  {
    "document_id": "2025021800719001",
    "record_type": "P",
    "party_type": "1",
    "name": "EMPIRE STATE DAIRY LLC",
    "address_1": "C/O: BUSHBURG PROPERTIES",
    "address_2": "3611 14TH AVENUE, SUITE 215",
    "country": "US",
    "city": "BROOKLYN",
    "state": "NY",
    "zip": "11218",
    "good_through_date": "2025-02-28T00:00:00.000"
  },
  {
    "document_id": "2024112600954001",
    "record_type": "P",
    "party_type": "1",
    "name": "EMPIRE REALTY HOLDINGS LLC",
    "address_1": "4003 HAHN AVE",
    "country": "US",
    "city": "BETHPAGE",
    "state": "NY",
    "zip": "11714",
    "good_through_date": "2024-12-31T00:00:00.000"
  },
  {
    "document_id": "2024092300336001",
    "record_type": "P",
    "party_type": "1",
    "name": "EMPIRE STATE DAIRYY LLC",
    "address_1": "3611 14TH AVENUE",
    "address_2": "SUITE 215",
    "country": "US",
    "city": "BROOKLYN",
    "state": "NY",
    "zip": "11218",
    "good_through_date": "2024-09-30T00:00:00.000"
  },
  {
    "document_id": "2024051000620001",
    "record_type": "P",
    "party_type": "1",
    "name": "EMPIRE ADAR LLC",
    "address_1": "C/O: ELI FIXLER, ESQ",
    "address_2": "1507 AVENUE M",
    "country": "US",
    "city": "BROOKLYN",
    "state": "NY",
    "zip": "11230",
    "good_through_date": "2024-05-31T00:00:00.000"
  },
  {
    "document_id": "2024042600136001",
    "record_type": "P",
    "party_type": "1",
    "name": "EMPIRE HOLDINGS I LLC",
    "address_1": "183 WILSON ST, SUITE 133",
    "country": "US",
    "city": "BROOKLYN",
    "state": "NY",
    "zip": "11211",
    "good_through_date": "2024-04-30T00:00:00.000"
  }
]
```

**Test Summary**
I had to create this new test due to rethinking how I want to cross reference the results of the two API calls to RP Master and RP Party datasets and given how those datasets are kept up to date, or rather, how they are **NOT** kept up to date. The former issue is when I make an API call to the RP Party dataset with minimal query data such as `name` and `party_type` I receive thousands of records so I need to first make the call to RP Master, extract their `document_id` values from each record and include them in the subsequent call to RP Party API. However, the Real Property datasets are not kept up to date on a daily basis. I find that, as of today 4/19/25, there are no records for the month of April (from 4/1/25 to 4/19/25) so I needed to run a new test that would provide enough data and not an empty dataset when I query records from the "last-7-days".

- [ ] Then I use `masterRecordsDocumentIds` and the `partiesQueryParams` values from `name` and `party_type` to make a subsequent API GET request to the [Real Property Party API](http://data.cityofnewyork.us/City-Government/ACRIS-Personal-Property-Legals/uqqa-hym2) using `PartiesRealPropApi.fetchFromAcris` and save the resulting records to `partyRecords`.
  - **PROMPT ON HOW TO PROCEED**. This poses a design decision that I'm not sure which is the best route to take. I need your help on how to best approach refactoring my code. Currently my `PartiesRealPropApi.fetchFromAcris` method only accepts `partiesQueryParams` as its parameter and calls the `constructPartiesUrl` function to construct the query URL that is used to make the API call. However, in addition to `partiesQueryParams`, now I want to pass `masterRecordsDocumentIds` to `PartiesRealPropApi.fetchFromAcris` to achieve the following search behavior. I want the query URL to be constructed in such a way so the API GET request queries the dataset for records that contain the key/value pairs contained in `partiesQueryParams` (such as `name` AND `party_type`) that also have any of the `document_id` values from `masterRecordsDocumentIds`. Since `masterRecordsDocumentIds` is an additional paraqmeter to `PartiesRealPropApi.fetchFromAcris`, I think I will need to create a new method to construct the query URL instead of `constructPartiesUrl`, which only accounts for the `partiesQueryParams`, when both `masterRecordsDocumentIds` and `partiesQueryParams` are passed to `PartiesRealPropApi.fetchFromAcris`. The new method should be named `constructPartiesUrlCrossRefMaster` that is called by `fetchFromAcris`, however, I don't know if this is a good refactor plan. I want you to review my aforementioned refactor plan based on the query url behavior and provide advise on how to proceed.
  - **AI RESPONSE ON HOW TO PROCEED**. _Your plan to create a new method constructPartiesUrlCrossRefMaster to handle the additional masterRecordsDocumentIds parameter is a good approach. It allows you to keep the existing constructPartiesUrl method focused on simpler queries while introducing a new method for more complex cross-referenced queries. This separation of concerns makes the code easier to maintain and extend._
    - Here’s a detailed review and advice on how to proceed:
      1. Create `constructPartiesUrlCrossRefMaster`:
         - This method will construct a query URL that includes both `partiesQueryParams` and `masterRecordsDocumentIds`.
         - It will use Socrata Query Language (SoQL) syntax to combine conditions with `AND` and `OR`.
      2. Update `fetchFromAcris`:
         - Modify `fetchFromAcris` to accept an optional `masterRecordsDocumentIds` parameter.
         - If `masterRecordsDocumentIds` is provided, call `constructPartiesUrlCrossRefMaster` instead of `constructPartiesUrl`.
      3. Construct the Query URL:
         - Use the `$where` parameter to combine conditions from `partiesQueryParams` and `masterRecordsDocumentIds`.
         - Use the `in` operator to match `document_id` values from `masterRecordsDocumentIds`.
      4. Example Constructed URL (given):
         - `masterRecordsDocumentIds`: `[ '2025031900711001', '2025031901074001', '2025032600533001', '2025032400772001', '2025032400882001' ]`
         - `partiesQueryParams`: `{ name: 'EMPIRE', party_type: '1' }`
      5. The constructed URL would look like this:
         - `https://data.cityofnewyork.us/resource/636b-3b5g.json?$where=name LIKE '%25EMPIRE%25' AND party_type='1' AND document_id IN ('2025031900711001', '2025031901074001', '2025032600533001', '2025032400772001', '2025032400882001')`

**Refactored Code**

1. Add `constructPartiesUrlCrossRefMaster`

```js
static constructPartiesUrlCrossRefMaster(partiesQueryParams, masterRecordsDocumentIds) {
    const conditions = [];

    // Add conditions from partiesQueryParams
    if (partiesQueryParams.name) {
        conditions.push(`name LIKE '%${encodeURIComponent(partiesQueryParams.name)}%'`);
    }
    if (partiesQueryParams.party_type) {
        conditions.push(`party_type='${partiesQueryParams.party_type}'`);
    }

    // Add condition for masterRecordsDocumentIds
    if (masterRecordsDocumentIds && masterRecordsDocumentIds.length > 0) {
        const documentIdsCondition = `document_id IN (${masterRecordsDocumentIds.map(id => `'${id}'`).join(", ")})`;
        conditions.push(documentIdsCondition);
    }

    // Construct the $where clause
    const whereClause = conditions.length > 0 ? `$where=${encodeURIComponent(conditions.join(" AND "))}` : "";

    // Construct the full URL
    const url = `${API_ENDPOINTS.realPropertyParties}?${whereClause}`;
    return url;
}
```

2. Update `fetchFromAcris`

```js
static async fetchFromAcris(partiesQueryParams, masterRecordsDocumentIds = null) {
    try {
        let url;

        // Use the appropriate URL construction method
        if (masterRecordsDocumentIds) {
            url = this.constructPartiesUrlCrossRefMaster(partiesQueryParams, masterRecordsDocumentIds);
        } else {
            url = this.constructPartiesUrl(partiesQueryParams);
        }

        console.log("Constructed URL:", url);

        // Make the GET request to the NYC Open Data API
        const response = await axios.get(url, {
            headers: {
                "Content-Type": "application/json",
                "X-App-Token": process.env.APP_TOKEN, // Ensure APP_TOKEN is set in your environment
            },
        });

        // Handle case where no records are found
        if (response.data.length === 0) {
            throw new NotFoundError(`No records found for query: ${JSON.stringify(partiesQueryParams)}`);
        }

        return response.data;
    } catch (err) {
        console.error("Error fetching data from ACRIS API:", err.message);
        throw new Error("Failed to fetch data from ACRIS API");
    }
}
```

3. Update the Route

In your `queryAcrisPartyName` route, pass both `partiesQueryParams` and `masterRecordsDocumentIds` to `fetchFromAcris`:

```js
// Fetch data from the Parties dataset
if (primaryDatasets.partiesDataset) {
  try {
    console.log(
      "Fetching Parties Dataset with query params:",
      partiesQueryParams
    );
    partyRecords = await PartiesRealPropApi.fetchFromAcris(
      partiesQueryParams,
      masterRecordsDocumentIds
    );
    console.log("Fetched Parties Records:", partyRecords.length);
  } catch (err) {
    console.error("Error fetching Parties Dataset:", err.message);
    partyRecords.push({
      dataFound: false,
      dataset: "partiesDataset",
      error: err.message,
    });
  }
}
```

- [ ] This request will return any records that have a matching `document_id` from the array of `masterRecordsDocumentIds` AND a matching search term for both `name` AND `party_type` which will be saved to the `partyRecords` array and the `document_id` values from those results will be saved to `partyRecordsDocumentIdsCrossRef`.
  - This is necessary because before I implemented the aformentioned logic in item 2 & 3 when I performed my [Test B](#41825-test-b), the `masterRecords` results contained 5 records and the `partyRecords` results contained 1,000 records. I thought I could make the two API calls independently and cross reference the results afterward but I do not think this is an efficient way to make API calls and handle the results. Also, the 2nd call may not have even contained all matching records since 1,000 is the limit to what that API can send back. TODO: Ask Ian if there is a better way to query the Real Property datasets and cross reference the results. For example, instead of returning the actual records from the [Real Property Party API](http://data.cityofnewyork.us/City-Government/ACRIS-Personal-Property-Legals/uqqa-hym2) GET request I could only handle the `document_id` values, cross reference those values with the results of the [Real Property Party API](http://data.cityofnewyork.us/City-Government/ACRIS-Personal-Property-Legals/uqqa-hym2) GET request, construct more specific query URLs, and then make another GET request to each API for the records. This approach would double the number of API requests but the size of data would be much smaller.
- [ ] Then I will need to combine `masterRecords` and `partyRecords` into a new array called `primaryRecords` and filter out any records that do not have a `document_id` value in the `masterRecordsDocumentIds` array AND the `partyRecordsDocumentIds` array.

For example, for the test below I sent a GET request to the [Real Property Master API](http://data.cityofnewyork.us/City-Government/ACRIS-Real-Property-Master/bnx9-e6tj) with the `searchTerms` and values: `borough`, `doc_type`, `document_date_start` and `document_date_end`

[Back to TOC](#table-of-contents)

#### 4/18/25 (Test A)

```bash
Started on http://localhost:3001
User authenticated: { username: 'april152025', isAdmin: false, iat: 1744758092 }
Received request with query parameters: {
  searchTerms: {
    name: 'EMPIRE',
    document_date_range: 'last-1-year',
    document_date_start: '2024-04-16',
    document_date_end: '2025-04-16',
    borough: '3',
    party_type: '1',
    doc_type: 'DEED',
    doc_class: 'DEEDS AND OTHER CONVEYANCES'
  },
  primaryApiSources: { masterDataset: 'true', partiesDataset: 'true' },
  secondaryApiSources: {
    legalsDataset: 'false',
    referencesDataset: 'false',
    remarksDataset: 'false'
  }
}
```

Then my `queryAcrisPartyName` route took the `searchTerms` data from my Front End's GET request and populated the `masterQueryParams` and `partiesQueryParams` objects which were used to make subsequent API calls to the Real Property Master and Real Property Parties API datasets using `MasterRealPropApi` and `PartiesRealPropApi` components, respectively.

Keep in mind after receiving the `searchTerms` data and sending the followup API requests I checked that at least one valid parameter was received from the front end for each of the Real Property Master and the Real Property Parties API calls. I also made sure that at least one dataset was selected from the `primaryDatasets` backend variable which is populated with configuration data from the front end's `primaryApiSources` object.

The `MasterRealPropApi` was used to fetch data with query params, and constructed the query URL, as shown below.

Console message: `MasterRealPropApi` fetched data using query params:

```bash
Fetching Master Dataset with query params: {
  document_date_range: 'last-1-year',
  document_date_start: '2024-04-16',
  document_date_end: '2025-04-16',
  borough: '3',
  doc_type: 'DEED'
}
```

Console message: `MasterRealPropApi` constructed query url (via `constructMasterUrl` utility function):

```bash
constructMasterUrl created: https://data.cityofnewyork.us/resource/bnx9-e6tj.json?$where=borough='3' AND doc_type='DEED' AND document_date between '2024-04-16' and '2025-04-16'
```

The response from the `MasterRealPropApi` call contained 1,000 records:
Console message:

```
Number of Records Returned: 1000
Fetched Master Records: 1000
```

Then, the `PartiesRealPropApi` was used to fetch data with query params, and constructed the query URL, as shown below.

Console message: `PartiesRealPropApi` fetched data using query params:

```bash
Fetching Parties Dataset with query params: {
  name: 'EMPIRE',
  party_type: '1'
}
```

Console message: `PartiesRealPropApi` constructed query url (via `constructPartiesUrl` utility function):

```bash
constructPartiesUrl created: https://data.cityofnewyork.us/resource/636b-3b5g.json?$where=party_type%3D'1'%20AND%20name%20LIKE%20'%25EMPIRE%25'
```

The response from the `PartiesRealPropApi` call contained 1,000 records:
Console message:

```
Number of Records Returned: 1000
Fetched Parties Records: 1000
```

The combined number of "Primary Records" was 2,000 and the total number of unique Document IDs was 1,992.

Due to the large amount of data I'm going to attempt another test but this time only request records from the last 30 days with the same search criteria as last time.

[Back to TOC](#table-of-contents)

#### 4/18/25 (Test B)

I successfully received the data below from my front end application using the backend route: `queryAcrisPartyName`.

```bash
User authenticated: { username: 'april152025', isAdmin: false, iat: 1744758092 }
Received request with query parameters: {
  searchTerms: {
    name: 'EMPIRE',
    document_date_range: 'last-30-days',
    document_date_start: '2025-03-19',
    document_date_end: '2025-04-18',
    borough: '3',
    party_type: '1',
    doc_type: 'DEED',
    doc_class: 'DEEDS AND OTHER CONVEYANCES'
  },
  primaryApiSources: { masterDataset: 'true', partiesDataset: 'true' },
  secondaryApiSources: {
    legalsDataset: 'false',
    referencesDataset: 'false',
    remarksDataset: 'false'
  }
}
```

Then my `queryAcrisPartyName` route took the `searchTerms` data from my Front End's GET request and populated the `masterQueryParams` and `partiesQueryParams` objects which were used to make subsequent API calls to the Real Property Master and Real Property Parties API datasets using `MasterRealPropApi` and `PartiesRealPropApi` components, respectively.

Keep in mind after receiving the `searchTerms` data and sending the followup API requests I checked that at least one valid parameter was received from the front end for each of the Real Property Master and the Real Property Parties API calls. I also made sure that at least one dataset was selected from the `primaryDatasets` backend variable which is populated with configuration data from the front end's `primaryApiSources` object.

The `MasterRealPropApi` was used to fetch data with query params, and constructed the query URL, as shown below.

Console message: `MasterRealPropApi` fetched data using query params:

```bash
Fetching Master Dataset with query params: {
  document_date_range: 'last-30-days',
  document_date_start: '2025-03-19',
  document_date_end: '2025-04-18',
  borough: '3',
  doc_type: 'DEED'
}
```

Console message: `MasterRealPropApi` constructed query url (via `constructMasterUrl` utility function):

```bash
constructMasterUrl created: https://data.cityofnewyork.us/resource/bnx9-e6tj.json?$where=borough='3' AND doc_type='DEED' AND document_date between '2025-03-19' and '2025-04-18'
```

The response from the `MasterRealPropApi` call contained 5 records:
Console message:

```
Fetched Master Records: 5
Records Returned: [
  {
    document_id: '2025031900711001',
    record_type: 'A',
    crfn: '2025000077510',
    borough: '3',
    doc_type: 'DEED',
    document_date: '2025-03-19T00:00:00.000',
    document_amt: '0',
    recorded_datetime: '2025-03-20T00:00:00.000',
    modified_date: '2025-03-20T00:00:00.000',
    reel_yr: '0',
    reel_nbr: '0',
    reel_pg: '0',
    percent_trans: '100',
    good_through_date: '2025-03-31T00:00:00.000'
  },
  {
    document_id: '2025031901074001',
    record_type: 'A',
    crfn: '2025000086181',
    borough: '3',
    doc_type: 'DEED',
    document_date: '2025-03-19T00:00:00.000',
    document_amt: '950000',
    recorded_datetime: '2025-03-31T00:00:00.000',
    modified_date: '2025-03-31T00:00:00.000',
    reel_yr: '0',
    reel_nbr: '0',
    reel_pg: '0',
    percent_trans: '100',
    good_through_date: '2025-03-31T00:00:00.000'
  },
  {
    document_id: '2025032600533001',
    record_type: 'A',
    crfn: '2025000086370',
    borough: '3',
    doc_type: 'DEED',
    document_date: '2025-03-20T00:00:00.000',
    document_amt: '0',
    recorded_datetime: '2025-03-31T00:00:00.000',
    modified_date: '2025-03-31T00:00:00.000',
    reel_yr: '0',
    reel_nbr: '0',
    reel_pg: '0',
    percent_trans: '100',
    good_through_date: '2025-03-31T00:00:00.000'
  },
  {
    document_id: '2025032400772001',
    record_type: 'A',
    crfn: '2025000081591',
    borough: '3',
    doc_type: 'DEED',
    document_date: '2025-03-24T00:00:00.000',
    document_amt: '0',
    recorded_datetime: '2025-03-25T00:00:00.000',
    modified_date: '2025-03-25T00:00:00.000',
    reel_yr: '0',
    reel_nbr: '0',
    reel_pg: '0',
    percent_trans: '100',
    good_through_date: '2025-03-31T00:00:00.000'
  },
  {
    document_id: '2025032400882001',
    record_type: 'A',
    crfn: '2025000086322',
    borough: '3',
    doc_type: 'DEED',
    document_date: '2025-03-24T00:00:00.000',
    document_amt: '0',
    recorded_datetime: '2025-03-31T00:00:00.000',
    modified_date: '2025-03-31T00:00:00.000',
    reel_yr: '0',
    reel_nbr: '0',
    reel_pg: '0',
    percent_trans: '100',
    good_through_date: '2025-03-31T00:00:00.000'
  }
]
```

Then, the `PartiesRealPropApi` was used to fetch data with query params, and constructed the query URL, as shown below.

Console message: `PartiesRealPropApi` fetched data using query params:

```bash
Fetching Parties Dataset with query params: { name: 'EMPIRE', party_type: '1' }
```

Console message: `PartiesRealPropApi` constructed query url (via `constructPartiesUrl` utility function):

```bash
constructPartiesUrl created: https://data.cityofnewyork.us/resource/636b-3b5g.json?$where=party_type%3D'1'%20AND%20name%20LIKE%20'%25EMPIRE%25'
```

The response from the `PartiesRealPropApi` call contained 1,000 records:
Console message:

```
Fetched Parties Records: 1000
```

The combined number of "Primary Records" was 1,005 and the total number of unique Document IDs was 998.

[Back to TOC](#table-of-contents)

#### 4/20/25 (Test C - `borough` and `limit` realizations)

##### `borough` vs `borough`

It turns out that **Search By Party Name** feature queries the `borough` column of the Real Property Lot dataset as opposed to the `borough` column of the Real Property Master dataset. This is a huge realization that should not have taken me this long to find out but here we are...

##### API Responses limited to 1,000 records

It turns out that if I want to replicate the **Search By Party Name** feature I will need to make API GET requests to the Real Property datasets in a specific order while including the `document_id` values from the prior response in the next GET request. For example, I used the search criteria below to query the Real Property Master dataset with the url: `https://data.cityofnewyork.us/resource/bnx9-e6tj.json?$select=count(*)&$where=doc_type='DEED' AND document_date between '2025-02-01' and '2025-03-31'`. The result was that there were 5,776 records but I only received 1,000 so, first, I need a way to add pagination so I get all 5,776 records OR at least each record's `document_id` value. Then I want to take those `document_id` values and include them in the subsequent API GET request to the Real Property Parties dataset. This way I'm cross-referencing the two datasets so the resulting records should be less than 5,776 since I only want records with, for example, `name` that contains "EMPIRE" and has a `party_type` value of '1' so let's say that reduces the cumulative search results down to 1,000. The resulting records, or `document_id` values of those records, will be included in the subsequent API GET request to the Real Property Legals (a/k/a Lot) dataset so now I'm taking 1,000 `document_id` values and sending them to the Real Property Legals API to see which of those `document_id` values also has a `borough` value of '3'. Incorporating pagination into this will be very difficult.

Then I need to cross reference the results so that I filter out records that do not share a `document_id` value with a record in the other dataset.

```bash
User authenticated: { username: 'april152025', isAdmin: false, iat: 1744758092 }
Received request with query parameters: {
  masterSearchTerms: {
    document_date_range: 'custom-date-range',
    document_date_start: '2025-02-01',
    document_date_end: '2025-03-31',
    doc_type: 'DEED',
    doc_class: 'DEEDS AND OTHER CONVEYANCES'
  },
  partySearchTerms: { name: 'EMPIRE', party_type: '1' },
  legalsSearchTerms: { borough: '3' },
  primaryApiSources: { masterDataset: 'true', partiesDataset: 'true', legalsDataset: 'true' },
  secondaryApiSources: { referencesDataset: 'false', remarksDataset: 'false' }
}
Fetching Master Dataset with query params: {
  document_date_range: 'custom-date-range',
  document_date_start: '2025-02-01',
  document_date_end: '2025-03-31',
  doc_type: 'DEED'
}
```
