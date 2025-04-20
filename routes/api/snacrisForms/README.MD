# `queryAcrisPartyName` route Dev Notes

this is a series of notes about developing the `queryAcrisPartyName` route that receives data from the user on the front end application that allows the user to "Search By Name". This is an attempt to copy the behavior of the ACRIS website's Search By Party Name website located here: `https://a836-acris.nyc.gov/DS/DocumentSearch/PartyName`.

I got the front end behavior to a point that I'm satisfied with and now I need to handle the front end's request by deconstructing it within the `queryAcrisPartyName` route and create the url that will be sent to one or more of the Real Property API datasets.

Then I need to package or normalize the response from the Real Property ACRIS dataset(s) before sending it back to the front end.

## [Table of Contents](#table-of-contents)

- [`queryAcrisPartyName` route Dev Notes](#queryacrispartyname-route-dev-notes)
  - [Table of Contents](#table-of-contents)
  - [ACRIS Dataset "Gotchas"](#acris-dataset-gotchas)
  - [Data Sent From Frontend](#data-sent-from-frontend)
  - [Data Received On Backend](#data-received-on-backend)
  - [How Do I want to "normalize" the data now that I received it?](#how-do-i-want-to-normalize-the-data-now-that-i-received-it)
  - [Overall Plan](#overall-plan)
    - [Incoming Data Normalization](#incoming-data-normalization)
    - [Revised Refactor Plan (prompt 2 / edited \& used as prompt 3)](#revised-refactor-plan-prompt-2--edited--used-as-prompt-3)
    - [Revised Refactor Plan (response 3)](#revised-refactor-plan-response-3)
      - [Strengths of Your Plan](#strengths-of-your-plan)
      - [Potential Issues and Suggestions](#potential-issues-and-suggestions)
      - [Steps to Accomplish the Refactor](#steps-to-accomplish-the-refactor)
  - [Front End Data received...now what (prompt 1)](#front-end-data-receivednow-what-prompt-1)
  - [Front End Data received...now what (response 1)](#front-end-data-receivednow-what-response-1)
    - [Frontend and Backend testing notes](#frontend-and-backend-testing-notes)
      - [Background](#background)
      - [4/18/25 (Test A)](#41825-test-a)
      - [4/18/25 (Test B)](#41825-test-b)
      - [4/20/25 (Test C - `borough` and `limit` realizations)](#42025-test-c---borough-and-limit-realizations)
        - [`borough` vs `recorded_borough`](#borough-vs-recorded_borough)
        - [API Responses limited to 1,000 records](#api-responses-limited-to-1000-records)

## ACRIS Dataset "Gotchas"

The limit of records sent from the Real Property and Personal Property APIs is 1,000.  
The Search By Party Name feature of ACRIS relies on the Real Property: Master, Parties and Legals (a/k/a Lot) datasets.  Initially I thought it searched the `recorded_borough` column of the Master dataset but it is actually the `borough` column of the Legals dataset

## Data Sent From Frontend

The data sent by the `SearchByPartyNameForm` looks like this in the browser's console:

```json
{
  "name": "empire",
  "document_date_range": "last-1-year",
  "document_date_start": "2024-04-16",
  "document_date_end": "2025-04-16",
  "recorded_borough": "3",
  "party_type": "1",
  "doc_type": "DEED",
  "doc_class": "DEEDS AND OTHER CONVEYANCES"
}
```

```json
{
  "primaryApiSources": { "masterDataset": "true", "partiesDataset": "true" },
  "secondaryApiSources": {
    "lotDataset": "false",
    "referencesDataset": "false",
    "remarksDataset": "false"
  }
}
```

[Back to TOC](#table-of-contents)

## Data Received On Backend

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
    recorded_borough: '3',
    party_type: '1',
    doc_type: 'doc-type-default',
    doc_class: 'DEEDS AND OTHER CONVEYANCES'
  },
  primaryApiSources: { masterDataset: 'true', partiesDataset: 'true' },
  secondaryApiSources: {
    lotDataset: 'false',
    referencesDataset: 'false',
    remarksDataset: 'false'
  }
}
```

backend route:

```bash
GET /queryAcrisPartyName/fetchRecord?searchTerms[name]=EMPIRE&searchTerms[document_date_range]=last-1-year&searchTerms[document_date_start]=2024-04-16&searchTerms[document_date_end]=2025-04-16&searchTerms[recorded_borough]=3&searchTerms[party_type]=1&searchTerms[doc_type]=doc-type-default&searchTerms[doc_class]=DEEDS+AND+OTHER+CONVEYANCES&primaryApiSources[masterDataset]=true&primaryApiSources[partiesDataset]=true&secondaryApiSources[lotDataset]=false&secondaryApiSources[referencesDataset]=false&secondaryApiSources[remarksDataset]=false 400 76 - 7.802 ms
```

[Back to TOC](#table-of-contents)

## How Do I want to "normalize" the data now that I received it?

1. sort by dataset:  should it be sent to the Real Property Master API or the Real Property Parties API?
  - `name` and `party_type` are _only_ associated with the **Real Property Parties dataset** so we _must_ send this data to the Real Property Parties API using `PartiesRealPropApi`.
    - [ ] TODO: better to restructure the `searchTerms` state object sent to the backend so the search terms are divided up by dataset (e.g. `masterSearchTerms`, `partySearchTerms`, `lotSearchTerms`)
  - `document_date_range`, `document_date_start`, `document_date_end`, `recorded_borough`, `doc_type` and `doc_class` are _only_ associated with the **Real Property Master dataset** so we _must_ send this data to the Real Property Master API using `MasterRealPropApi`.
  - the `recorded_borough` is the wrong column to use in the Search By Party Name feature.  The correct column is the `borough` column of the **Real Property Legals** dataset.  
    - [ ] TODO: refactor the front end by changing the key reference from `recorded_borough` to `borough`.
    - [ ] TODO: refactor the back end by adding implementing the `LotRealPropApi.js` to make a follow up API call using the `document_id` values returned from the first GET request to **Real Property Master dataset** and the follow up GET request to **Real Property Master dataset**.
  - in order to obtain a "complete" dataset of Real Property records I need to:
     1. send API GET requests using the `MasterRealPropApi`, `PartiesRealPropApi` and `LotRealPropApi` modules (the "Primary Datasets), 
     2. cross reference their results based on their shared `document_id` value and
     3. retrieve data using `RemarksRealPropApi` and `ReferenceRealPropApi` (the "Secondary Datasets"),
     4. configure which datasets are Primary and Secondary using the stateful objects `primaryApiSources` and `secondaryApiSources` from the front end in the initial request to the backend route `queryAcrisPartyName`: `masterDataset`, `lotDataset`, `partiesDataset`, `referencesDataset` and `remarksDataset`.
     5. the frontend has the Real Property Master,  and Real Property Lot checkboxes pre-checked because `doc_type` and `document_date` are unique to RPMaster, `name` and `party_type` are unique to RPParty and `borough` is unique to RPLot but the user may want the crossreferenced RPReferences and RPRemarks data as well.
       - [x] TODO: you should disable these three checkboxes so they stay in the "checked state" to convey that the Search By Party Name form is associated with these three datasets
       - [ ] TODO: you should change the primary checkboxes to include `lot` since `borough` is used to query the RPLot dataset.

[Back to TOC](#table-of-contents)

## Overall Plan

You need to figure out the process for (1) normalizing and sorting the incoming data, (2) making the _primary_ API calls, (3) making the _secondary_ API calls, (4) cross referencing the results from the _primary_ and _secondary_ API calls, (5) normalizing and sorting the response data and (6) sending it back to the front end.

### Incoming Data Normalization

The data below is an example of what is being sent from the front end and is successfully received by the `queryAcrisPartyName` backend route. The `recorded_borough`, `doc_type`, `document_date_range`, `document_date_start` and `document_date_end` are all associated with the Real Property Master dataset. The `name` and `party_type` are associated with the Real Property Parties dataset. The `masterDataset`, `lotDataset`, `partiesDataset`, `referencesDataset` and `remarksDataset` boolean values represent the Primary and Secondary datasets that are queried and crossreferenced with each other so the resulting records are sent back to the user.

"Example Data":

```bash
Received request with query parameters: {
  name: 'empire',
  document_date_range: 'last-7-days',
  document_date_start: '2025-04-06',
  document_date_end: '2025-04-13',
  recorded_borough: '3',
  party_type: '1',
  doc_type: 'DEED',
  doc_class: 'DEEDS AND OTHER CONVEYANCES',
  masterDataset: 'true',
  lotDataset: 'true',
  partiesDataset: 'true',
  referencesDataset: 'true',
  remarksDataset: 'true'
}
```

As background, on the frontend the `SelectDatasetsCheckboxes` component allows the user to select which datasets they want to query in the (parent) form-component. Each form-component has "necessary" datasets that it queries and "supplemental" datasets that the user can get additional data from based on the results from the "necessary" datasets. For example, the `PartyNameSearchForm` form-component queries the "necessary" datasets: **Real Property Master** (`masterDataset`) and **Real Property Parties** (`partiesDataset`) datasets because the form's `recorded_borough`, `doc_type`, `document_date_range`, `document_date_start` and `document_date_end` are all associated with the **Real Property Master** dataset and the `name` and `party_type` are associated with the **Real Property Parties** dataset.

The results of these two API GET requests contain records that can be cross-referenced by their `document_id` and "normalized" on the backend (the "**Cross Referenced Results**") before being sent to the front end user. The `SelectDatasetsCheckboxes` component allows the `PartyNameSearchForm` component to communicate to the backend that the `document_id` from the **Cross Referenced Results** should be used to query the "supplemental datasets", which in this case are the **Real Property Lot** (`lotDataset`), **Real Property Remarks** (`remarksDataset`) and **Real Property References** (`referencesDataset`) datasets. The parent component, and in this case `PartyNameSearchForm`, disables the input elements representing the "necessary" datasets in the `SelectDatasetsCheckboxes` component through props. For example, in this case the `masterDataset` and `partiesDataset` inputs are disabled while in their "checked" state whereas the `lotDataset`, `remarksDataset` and `referencesDataset` can be toggled by the user. When the user toggles these three "supplemental" datasets and submits the `PartyNameSearchForm` component's form they are communicating to the backend that in addition to the **Cross Referenced Results** (from the **Real Property Master** (`masterDataset`) and **Real Property Parties** (`partiesDataset`) datasets) they want all the data associated with those results from the `lotDataset`, `remarksDataset` and `referencesDataset` datasets.

So referring to our Example Data above I need to refactor the code that validates and constructs the query parameters to achieve the following:

- [x] Refactor the `datasets` object into two objects named `primaryDatasets` and `secondaryDatasets` which will be used in the `fetchDataset` function. The Primary Datasets will be retrieved, cross referenced using their `document_id` values and then the Secondary Datasets will be queried using those cross-referenced `document_id` values, the response will be normalized and sent back to the user.
- [x] I need to write a refactor my code so it accepts the `document_date_range`, `document_date_start` and `document_date_end` as parameters and returns the appropriate values to query the `document_date` endpoint in the Query URL in the `MasterRealPropApi` component.
  - Background: `document_date` is a field that most of the time will query the Master dataset as a range which is why the Example Data contains the keys: `document_date_range`, `document_date_start` and `document_date_end`. The `document_date_start` and `document_date_end` values are received with the syntax: '2025-04-06' and '2025-04-13' and represent the actual starting and ending date range values whereas the `document_date_range` represents the type of date range that was submitted by the form such as `"last-7-days"`, `"last-30-days"`, `"last-90-days"`, `"last-1-year"`, `"last-2-years"`, `"last-5-years"`, `"custom-date-range"` and `"to-current-date-default"`.
- [x] Refactor the `queryParams` object by creating two new variables: `masterQueryParams` and `partiesQueryParams`.
- [x] Validate and construct the query parameters for each object.
- [x] Refactor the `records` array by replacing it with five new arrays named `masterRecords`, `partyRecords`, `lotRecords`, `referenceRecords` and `remarkRecords`.
- [x] Refactor `fetchDataset` to push results to either the `masterRecords`, `partyRecords`, `lotRecords`, `referenceRecords` or `remarkRecords` arrays based on the value of the `masterDataset`, `lotDataset`, `partiesDataset`, `referencesDataset` and `remarksDataset` request object.

[Back to TOC](#table-of-contents)

### Revised Refactor Plan (prompt 2 / edited & used as prompt 3)

@workspace I need your help by critiquing my refactor plan for my `queryAcrisPartyName`, `MasterRealPropApi`, `PartiesRealPropApi`, `LegalsRealPropApi`, `RemarksRealPropApi` and `ReferencesRealPropApi` code below based on the following behavior. Once you have reviewed my plan I want you to make suggestions if my plan does not coincide with "best practices" and to explain anything I may have missed that could break my code or cause undesireable behaviors.

As background, the front end sends a request with data in the format below which is received by the `queryAcrisPartyName` backend route. The `recorded_borough`, `doc_type`, `document_date_range`, `document_date_start` and `document_date_end` values are all associated with the Real Property Master dataset so they are passed to the `masterQueryParams` variable to be used by `MasterRealPropApi` to make an axios GET request. The `name` and `party_type` values are associated with the Real Property Parties dataset so they are passed to the `partiesQueryParams` variable to be used by `PartiesRealPropApi` to make a separate axios GET request. If `masterDataset` is equal to `true` then I want to send a HTTP GET request using `MasterRealPropApi` which takes `masterQueryParams` as its sole parameter and if `partiesDataset` is `true` then I want to send a HTTP GET request using `PartiesRealPropApi` which takes `partiesQueryParams` as its sole parameter.

I want to add a function called `constructMasterUrl` to my `MasterRealPropApi` file and a function called `constructPartiesUrl` to my `PartiesRealPropApi` file that will construct the `url` based on the values contained in `masterQueryParams` and `partiesQueryParams`, respectively, which the `fetchFromAcris` function, from each file, will then use to make its own `axios` GET request.

The `constructMasterUrl` will accept the following optional parameters: `document_id`, `crfn`, `recorded_borough` (corresponds to the value of `recorded_borough` from `masterQueryParams`), `doc_type` (corresponds to the value of `doc_type` from `masterQueryParams`), `document_date` (corresponds to the value of `document_date_range` , `document_date_start` and `document_date_end` from `masterQueryParams`), `document_amt`, `recorded_datetime`, `modified_date`, `reel_yr`, `reel_nbr`, `reel_pg` and `percent_trans`.

The `constructPartiesUrl` will accept the following optional parameters: `document_id`, `party_type` (corresponds to the value of `party_type` from `partiesQueryParams`), `name` (corresponds to the value of `name` from `partiesQueryParams`), `address_1`, `address_2`, `country`, `city`, `state` and `zip`.

The `constructMasterUrl` and `constructPartiesUrl` should construct the `url` using Socrata Query Language (SoQL) syntax and specifically use the `$where` parameter to specify multiple conditions combined with logical operators such as `AND` and `OR` such as `$where=recorded_borough='3' AND document_id between '20250401' and '20250415' AND doc_type='DEED'`. Additionally, the `constructMasterUrl` and `constructPartiesUrl` functions should use a function called "validateQueryParams" that contains logic to validate the query parameters and check the format and values of before proceeding with the API calls.

Initially, I wanted to create a function called "createDocumentDateSocrataSyntax" in the `MasterRealPropApi` file that accepts `document_date_range`, `document_date_start` and `document_date_end` parameters and returns a string of text representing a SoQL syntax that queries a range using the start date value: `document_date_start` and the end date value: `document_date_end` for the column `document_date`, however, I think it would be more efficient to have a utility function called "alterSearch" that generates SoQL syntax depending on whether the query parameters specify (i) a range of values associated with `document_date` (derived from the values of `document_date_range`, `document_date_start` and `document_date_end`) and any other column name such as `document_id`, `recorded_borough`, `doc_type`, (ii) an exact value associated with a column name, (iii) a list of values associated with a column name, (iv) wildcard queries (e.g. `name like 'empire%'`) and (v) Null/Not Null Queries (e.g., `document_amt is not null`).

The results of the `MasterRealPropApi` API call should be saved to `masterRecords` and the results of the `PartiesRealPropApi` API call should be saved to `partyRecords`. Then I want to create a function called "combineMasterPartyRecords" which combines the `masterRecords` and `partyRecords` records into a variable called `primaryRecords` and cross references those records so that `primaryRecords` only includes records from `masterRecords` and `partyRecords` that contain the same `document_id` value. For example, if a record in `masterRecords` has a `document_id` that is not present in `partyRecords`, it should be excluded from `primaryRecords`. Similarly, if a record in `partyRecords` has a `document_id` that is not present in `masterRecords`, it should be excluded from `primaryRecords`. As part of the "combineMasterPartyRecords" function I want to populate a variable called `primaryRecordDocumentIds` which is an array of unique `document_id` values derived from the `primaryRecords` results. The `primaryRecordDocumentIds` values will be used by the `LegalsRealPropApi`, `ReferencesRealPropApi` and `RemarksRealPropApi` to make separate API GET requests for records that contain the `document_id` values from the `primaryRecordDocumentIds` array and the results of those requests will be pushed to the `lotRecords`, `referenceRecords` and `remarkRecords` arrays, respectively. In order to achieve this behavior a new function called "fetchSecondaryDataFromAcris" will need to be created in the `LegalsRealPropApi`, `ReferencesRealPropApi` and `RemarksRealPropApi` files that (1) will only accept an array of `document_id` values as its sole parameter, (2) constructs a query URL using SoQL syntax with the `$where` parameter containing the `document_id` values from the array and sends the `url` and request using axios in the same way that `fetchFromAcris` does. Alternatively it may be a good idea to create a separate utility function that constructs the `SoQL` URL based on the values in `primaryRecordDocumentIds` to be used by `LegalsRealPropApi`, `ReferencesRealPropApi` and `RemarksRealPropApi` when they make their API GET requests using the "fetchSecondaryDataFromAcris". Keep in mind if records are not received from the "fetchSecondaryDataFromAcris" function then an object should be created with a property called "search-status" with a value of "none found" such as the code snippet:

```js
if (response.data.length === 0) {
  return { searchStatus: "none found", documentIds: [...documentIds] };
}
```

The results contained in `lotRecords`, `referenceRecords` and `remarkRecords` will then be saved in a variable called `secondaryRecords` which, should only include records that have `document_id` values that were in the `primaryRecordDocumentIds` array. Then I want to combine `primaryRecords` and `secondaryRecords` into a variable called `records` with the architecture below which uses a flatter structure where each `document_id` is a key in an object, and the associated data is grouped by type.

Based on the aforementioned refactor plan and the code below how does my plan sound and is it viable to achieve the behavior that I mentioned above? If the plan sounds viable then list the steps for how I should accomplish this and if some parts don't make sense then explain what they are. Keep in mind I do not want you to provide refactored code yet and instead want you to "refine" my refactor plan so I am more likely to achieve the behavior I described above. Also, I will eventually create tests for each of these functions but first I want to get the code working first.

example data received from frontend:

```bash
Received request with query parameters: {
  name: 'empire',
  document_date_range: 'last-7-days',
  document_date_start: '2025-04-06',
  document_date_end: '2025-04-13',
  recorded_borough: '3',
  party_type: '1',
  doc_type: 'DEED',
  doc_class: 'DEEDS AND OTHER CONVEYANCES',
  masterDataset: 'true',
  lotDataset: 'true',
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

### Revised Refactor Plan (response 3)

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
- This won't be possible since each column of the datasets is unique, not in its data type but, in how it is used in a simple query and in more complex queries that require cross referencing each other.  I've kept the idea for `laterSearch` below and will revisit it.
   - Your idea of creating a utility function (e.g., `alterSearch`) to generate SoQL syntax is excellent. This function could handle:
     - Range Queries: e.g., `document_date between '20250401' and '20250415'`.
     - Exact Value Queries: e.g., `recorded_borough = '3'`.
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
   - [x] Update `fetchFromAcris` to use `constructMasterUrl`.  **This function was implemented by `MasterRealPropApi` and I successfully tested it using Postman.**
   - [x] Update `fetchFromAcris` to use `constructPartiesUrl`.  **This function was implemented by `MasterRealPropApi` and I successfully tested it using Postman.**
   - [ ] Create and implement `constructPartiesUrlCrossRefMaster` to encapsulate the URL construction logic that includes the `document_id` values resulting from the first API request to Real Property Master (`masterRecordsDocumentIds`) and the query parameters from the front end associated with the Real Property Parties dataset (`partiesQueryParams`).

2. Test `MasterRealPropApi` and `PartiesRealPropApi` implementation through the Front End using the `PartyNameSearchForm`

- I found the following results using the criteria below using ACRIS' Party Name Search page. My `PartyNameSearchForm` front end component should return the same results based on the same criteria.
- **Search Criteria**:
  - `name` - "EMPIRE"
  - `document_date` - "Last 1 year" (current date is 4/16/25)
  - `party_type` - "1"
  - `recorded_borough` - "Brooklyn/Kings"
  - `document_class` - "DEEDS AND OTHER CONVEYANCES"
    - NB: `document_class` is not a column associated with the Real Property Party endpoint but the `doc_type` column is so for the purposes of my search I created a component that allows the user to choose a "Document Class" from four options, a "Document Type" from one of four lists where each list is directly associated with a "Document Class" and a "Party Type" which is unique for each "Document Type".
- **Results**:
  I found 9 records with the `document_id`, `name` and `document_date` values below. NB, that two of these records have document dates in april 2025 which did not pass my own Postman tests. I had a feeling that these failed my Postman test because the dataset was not updated yet even though the website said it was as of today's date (4/16/25). I tried a different search in an attempt to cast a "wider net" by searching for any records with a `recorded_borough` value of `3` with a `document_date` between 4/1/25 and 4/16/25 and I received a `500` status code error and `"Failed to fetch data from ACRIS API"` message. This was disappointing because I cannot create search features for my website that have access to the same "real-time" data as the ACRIS website but it does make the Chrome Extension idea to enhance ACRIS more viable.

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
    recorded_borough: '3',
    party_type: '1',
    doc_type: 'doc-type-default',
    doc_class: 'DEEDS AND OTHER CONVEYANCES'
  },
  primaryApiSources: { masterDataset: 'true', partiesDataset: 'true' },
  secondaryApiSources: {
    lotDataset: 'false',
    referencesDataset: 'false',
    remarksDataset: 'false'
  }
}

```

The GET request from the front end looks like this:

```bash
GET /queryAcrisPartyName/fetchRecord?searchTerms[name]=EMPIRE&searchTerms[document_date_range]=last-1-year&searchTerms[document_date_start]=2024-04-16&searchTerms[document_date_end]=2025-04-16&searchTerms[recorded_borough]=3&searchTerms[party_type]=1&searchTerms[doc_type]=doc-type-default&searchTerms[doc_class]=DEEDS+AND+OTHER+CONVEYANCES&primaryApiSources[masterDataset]=true&primaryApiSources[partiesDataset]=true&secondaryApiSources[lotDataset]=false&secondaryApiSources[referencesDataset]=false&secondaryApiSources[remarksDataset]=false
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

4. Validate Query Parameters:

   - [ ] Add validation logic to ensure that all required parameters are present and correctly formatted.

5. Optimize Performance:

   - [ ] Implement batching or pagination for secondary dataset queries if necessary.
   - [ ] Use `Promise.all` to parallelize API calls where possible.

6. Test the Implementation:
   - [ ] Write unit tests for all new functions.
   - [ ] Write integration tests for the `queryAcrisPartyName` route.

[Back to TOC](#table-of-contents)

## Front End Data received...now what (prompt 1)

@workspace I submitted my `PartyNameSearchForm` form-component from my front end application and it was received by my `queryAcrisPartyName` route with the data formatted and full route syntax below. Now I need to refactor my `queryAcrisPartyName` route's code below to interpret this data from the front end (the "User Request"), configure certain variables as explained more below and then make API calls using the `MasterRealPropApi`, `LegalsRealPropApi`, `PartiesRealPropApi`, `RemarksRealPropApi` or `ReferencesRealPropApi` components. based on those configurations. I need your help with refactoring my code below to achieve the aforementioned behavior and details below.

Background on configuration required: the values of my `primaryDatasets` values (`masterDataset` and
`partiesDataset`) and `secondaryDatasets` (`lotDataset`, `referencesDataset`, `remarksDataset`) variables. These values will be used to instruct my `queryAcrisPartyName` route to make API calls, or to not make API calls, using the `MasterRealPropApi`, `LegalsRealPropApi`, `PartiesRealPropApi`, `RemarksRealPropApi` or `ReferencesRealPropApi` components. For example, referring to the User Request data below, `primaryApiSources: { masterDataset: 'true', partiesDataset: 'true' }` will instruct my `queryAcrisPartyName` route to send an API request using `MasterRealPropApi` and `PartiesRealPropApi`. Furthermore, `secondaryApiSources: { lotDataset: 'false', referencesDataset: 'false', remarksDataset: 'false' }` will instruct my `queryAcrisPartyName` route to NOT send an API request using`LegalsRealPropApi`, `RemarksRealPropApi` or `ReferencesRealPropApi`. The `searchTerms` object's key/value pairs will be used to construct the query URL for the `primaryApiSources` whose values are `true` which in this case is the `MasterRealPropApi` and `PartiesRealPropApi` because `primaryApiSources: { masterDataset: 'true', partiesDataset: 'true' }`. I want the `masterQueryParams` to be populated with query parameters: `document_date_range`, `document_date_start`, `document_date_end`, `recorded_borough` and `doc_type`. I want the `partiesQueryParams` to be populated with `name` and `party_type`. I also want to keep the validation logic below for these parameters and the conditional logic that ensures at least one valid parameter associated with the Real Property Master dataset, at least one valid parameter associated with the Real Property Parties dataset is provided and that at least one dataset is selected. Then I want to initialize the `masterRecords` array and make the API call with `MasterRealPropApi.fetchFromAcris` using the `masterQueryParams` query parameters and handle the response or any errors from the API call. Then I want to initialize the `partyRecords` array and make the API call with `PartiesRealPropApi.fetchFromAcris` using the `partiesQueryParams` query parameters. There is more to the behavior that I want to implement in the `queryAcrisPartyName` backend route but I need your help achieving the aforementioned behavior with the code below.

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
    recorded_borough: '3',
    party_type: '1',
    doc_type: 'doc-type-default',
    doc_class: 'DEEDS AND OTHER CONVEYANCES'
  },
  primaryApiSources: { masterDataset: 'true', partiesDataset: 'true' },
  secondaryApiSources: {
    lotDataset: 'false',
    referencesDataset: 'false',
    remarksDataset: 'false'
  }
}
```

backend route:

```bash
GET /queryAcrisPartyName/fetchRecord?searchTerms[name]=EMPIRE&searchTerms[document_date_range]=last-1-year&searchTerms[document_date_start]=2024-04-16&searchTerms[document_date_end]=2025-04-16&searchTerms[recorded_borough]=3&searchTerms[party_type]=1&searchTerms[doc_type]=doc-type-default&searchTerms[doc_class]=DEEDS+AND+OTHER+CONVEYANCES&primaryApiSources[masterDataset]=true&primaryApiSources[partiesDataset]=true&secondaryApiSources[lotDataset]=false&secondaryApiSources[referencesDataset]=false&secondaryApiSources[remarksDataset]=false 400 76 - 7.802 ms
```

**see the previous file for exact code used in the above prompt**
`queryAcrisPartyName-copy-pre-refactor-4-18-24.js`

**see the same file for slightly modified code that was used in the above prompt**
`MasterRealPropApi`
`PartiesRealPropApi`
`ReferencesRealPropApi`

[Back to TOC](#table-of-contents)

## Front End Data received...now what (response 1)

**Here is a potential refactor plan:**

1. Extract Query Parameters:

   - Extracted `searchTerms`, `primaryApiSources`, and `secondaryApiSources` from the request query.
   - Used optional chaining (`?.`) to safely access nested properties.
   - Extracting Primary Dataset Flags and Extracting Secondary Dataset Flags
     - (A) Dataset Selection: The `primaryDatasets` and `secondaryDatasets` objects are used to decide which datasets to query. For example, if `primaryDatasets.masterDataset` is true, the code will query the Master Dataset using the `MasterRealPropApi` component. If `secondaryDatasets.lotDataset` is true, the code will query the Lot Dataset using the LegalsRealPropApi component.
     - (B) Conditional API Calls: Later in the code, these flags are checked to conditionally make API calls. For example:

```js
if (primaryDatasets.masterDataset) {
  masterRecords = await MasterRealPropApi.fetchFromAcris(masterQueryParams);
}
if (secondaryDatasets.lotDataset) {
  lotRecords = await LegalsRealPropApi.fetchFromAcris(masterQueryParams);
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
    //  This creates an object named `secondaryDatasets` that contains boolean values indicating whether the Lot Dataset (`lotDataset`), References Dataset (`referencesDataset`), and Remarks Dataset (`remarksDataset`) should be queried.
    const secondaryDatasets = {
      //Similar to the primaryDatasets object, it uses optional chaining (?.) to safely access properties of secondaryApiSources.  It checks if each dataset flag is "true" and converts it to a boolean value.
      //OUTCOME: secondaryDatasets.lotDataset will be true if secondaryApiSources.lotDataset is "true". Similarly, secondaryDatasets.referencesDataset and secondaryDatasets.remarksDataset will be true if their respective flags are "true".
      lotDataset: secondaryApiSources?.lotDataset === "true",
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
    if (searchTerms?.recorded_borough)
      masterQueryParams.recorded_borough = searchTerms.recorded_borough;
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
http://localhost:3001/queryAcrisPartyName/fetchRecord?searchTerms[name]=EMPIRE&searchTerms[document_date_range]=last-1-year&searchTerms[document_date_start]=2024-04-16&searchTerms[document_date_end]=2025-04-16&searchTerms[recorded_borough]=3&searchTerms[party_type]=1&searchTerms[doc_type]=doc-type-default&primaryApiSources[masterDataset]=true&primaryApiSources[partiesDataset]=true&secondaryApiSources[lotDataset]=false&secondaryApiSources[referencesDataset]=false&secondaryApiSources[remarksDataset]=false
```

3. Expected Behavior:

If the API calls succeed, you should receive a JSON response with the primaryRecords array.
If any API call fails, the response will include an error object in the corresponding dataset's records.

[Back to TOC](#table-of-contents)

### Frontend and Backend testing notes 

#### Background

The following test is for my Front End route called "partyNameSearch" and my Back End route called `queryAcrisPartyName` which is an attempt to copy a search feature for the NYC Department of Finance's website called "ACRIS" which stands for Automated City Record Indexing System.  The homepage for the DOF that launches ACRIS is located here: [https://www.nyc.gov/site/finance/property/acris.page#](https://www.nyc.gov/site/finance/property/acris.page#) and the **Search By Party Name** feature I'm attempting to copy is located here: [https://a836-acris.nyc.gov/DS/DocumentSearch/PartyName](https://a836-acris.nyc.gov/DS/DocumentSearch/PartyName).  

ACRIS contains public land record data for all of New York City such as deeds, mortgages, leases and any other document that is directly associated with real property.  One of the search feature's of ACRIS is to search for records that are associated with a property owner's `name` with the option to cross-reference `name` with: (i) a date range for `document_date` (e.g. within 7 days from the current date, within 30 days from the current date, custom range, etc.), (ii) a `document_class` representing four categories each of which contains a list of unique `document_type` (e.g. "DEEDS & OTHER CONVEYANCES", "MORTGAGES & INSTRUMENTS", "UCC & FEDERAL LIENS" & "OTHER DOCUMENTS"), (iii) a `party_type` representing the role of that party that is mapped to each `document_type` and (iv) a `recorded_borough` representing one of the five NYC Boroughs/NYS Counties where the document was recorded.  

The ACRIS data is available hosted by [NYC Open Data](https://opendata.cityofnewyork.us/) comprised of 15 API endpoints that are grouped in three major categories (5 endpoints per category): Real Property, Personal Property and Code Maps.  The Real Property and Personal Property categories each represent a full dataset that follow the same schema where each of their 5 datasets are referred to as: (i) Master, (ii) Party, (iii) Lot, (iv) Remarks and (v) References and can be cross referenced with each other using the unique identifying value: `document_id`.  For example, a specific deed will have its own `document_id` and if you wanted all the information associated with that deed using the NYC Open Data APIs then you would need to send a GET request to the Real Property-Master, Real Property-Party, Real Property-Lot, Real Property-Remarks and Real Property-References API endpoints.  The Code Maps category's five datasets represent codes and data structures that are used to query the Real Property and Personal Property datasets such as arrays of countries and states of the U.S. and arrays of document classes, document types and party types.  I've included the link to each API's NYC Open Data webpage below as a reference.

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

- [x] I make an API GET request to the [Real Property Master API](http://data.cityofnewyork.us/City-Government/ACRIS-Real-Property-Master/bnx9-e6tj) with the `masterQueryParams`: `recorded_borough`, `doc_type`, `document_date_start` and `document_date_end` (two date type values representing a range search query of the `document_type` column).
- [x] I save the resulting records to the `masterRecords` array while creating the array-type variable `masterRecordsDocumentIds` containing the `document_id` value of each record in `masterRecords`.  

**For example, I searched on the ACRIS website using the search criteria:**
- `name`: "EMPIRE"
- `document_date`: "last-1-year"
- `party_type`: "1"
- `recorded_borough`: "3" (Brooklyn)
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
- this means my replicated-test was "successful" even though it did not match my experience on ACRIS.  It was even more helpful because it exposed how the datasets are not updated frequently backend and how a document with a unique `document_id` is displayed multiple times depending on how many properties it was recorded.
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
I had to create this new test due to rethinking how I want to cross reference the results of the two API calls to RP Master and RP Party datasets and given how those datasets are kept up to date, or rather, how they are **NOT** kept up to date.  The former issue is when I make an API call to the RP Party dataset with minimal query data such as `name` and `party_type` I receive thousands of records so I need to first make the call to RP Master, extract their `document_id` values from each record and include them in the subsequent call to RP Party API.  However, the Real Property datasets are not kept up to date on a daily basis.  I find that, as of today 4/19/25, there are no records for the month of April (from 4/1/25 to 4/19/25) so I needed to run a new test that would provide enough data and not an empty dataset when I query records from the "last-7-days".


- [ ] Then I use `masterRecordsDocumentIds` and the `partiesQueryParams` values from `name` and `party_type` to make a subsequent API GET request to the [Real Property Party API](http://data.cityofnewyork.us/City-Government/ACRIS-Personal-Property-Legals/uqqa-hym2) using `PartiesRealPropApi.fetchFromAcris` and save the resulting records to `partyRecords`.
  - **PROMPT ON HOW TO PROCEED**.  This poses a design decision that I'm not sure which is the best route to take.  I need your help on how to best approach refactoring my code.  Currently my `PartiesRealPropApi.fetchFromAcris` method only accepts `partiesQueryParams` as its parameter and calls the `constructPartiesUrl` function to construct the query URL that is used to make the API call.  However, in addition to `partiesQueryParams`, now I want to pass `masterRecordsDocumentIds` to `PartiesRealPropApi.fetchFromAcris` to achieve the following search behavior.  I want the query URL to be constructed in such a way so the API GET request queries the dataset for records that contain the key/value pairs contained in `partiesQueryParams` (such as `name` AND `party_type`) that also have any of the `document_id` values from `masterRecordsDocumentIds`. Since `masterRecordsDocumentIds` is an additional paraqmeter to `PartiesRealPropApi.fetchFromAcris`, I think I will need to create a new method to construct the query URL instead of `constructPartiesUrl`, which only accounts for the `partiesQueryParams`, when both `masterRecordsDocumentIds` and `partiesQueryParams` are passed to `PartiesRealPropApi.fetchFromAcris`.  The new method should be named `constructPartiesUrlCrossRefMaster` that is called by `fetchFromAcris`, however, I don't know if this is a good refactor plan.  I want you to review my aforementioned refactor plan based on the query url behavior and provide advise on how to proceed.
  - **AI RESPONSE ON HOW TO PROCEED**.  *Your plan to create a new method constructPartiesUrlCrossRefMaster to handle the additional masterRecordsDocumentIds parameter is a good approach. It allows you to keep the existing constructPartiesUrl method focused on simpler queries while introducing a new method for more complex cross-referenced queries. This separation of concerns makes the code easier to maintain and extend.*
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
        console.log("Fetching Parties Dataset with query params:", partiesQueryParams);
        partyRecords = await PartiesRealPropApi.fetchFromAcris(partiesQueryParams, masterRecordsDocumentIds);
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
   - This is necessary because before I implemented the aformentioned logic in item 2 & 3 when I performed my [Test B](#41825-test-b), the `masterRecords` results contained 5 records and the `partyRecords` results contained 1,000 records.  I thought I could make the two API calls independently and cross reference the results afterward but I do not think this is an efficient way to make API calls and handle the results.  Also, the 2nd call may not have even contained all matching records since 1,000 is the limit to what that API can send back.  TODO: Ask Ian if there is a better way to query the Real Property datasets and cross reference the results.  For example, instead of returning the actual records from the [Real Property Party API](http://data.cityofnewyork.us/City-Government/ACRIS-Personal-Property-Legals/uqqa-hym2) GET request I could only handle the `document_id` values, cross reference those values with the results of the [Real Property Party API](http://data.cityofnewyork.us/City-Government/ACRIS-Personal-Property-Legals/uqqa-hym2) GET request, construct more specific query URLs, and then make another GET request to each API for the records.  This approach would double the number of API requests but the size of data would be much smaller.
- [ ] Then I will need to combine `masterRecords` and `partyRecords` into a new array called `primaryRecords` and filter out any records that do not have a `document_id` value in the `masterRecordsDocumentIds` array AND the `partyRecordsDocumentIds` array.  

For example, for the test below I sent a GET request to the [Real Property Master API](http://data.cityofnewyork.us/City-Government/ACRIS-Real-Property-Master/bnx9-e6tj) with the `searchTerms` and values: `recorded_borough`, `doc_type`, `document_date_start` and `document_date_end`

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
    recorded_borough: '3',
    party_type: '1',
    doc_type: 'DEED',
    doc_class: 'DEEDS AND OTHER CONVEYANCES'
  },
  primaryApiSources: { masterDataset: 'true', partiesDataset: 'true' },
  secondaryApiSources: {
    lotDataset: 'false',
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
  recorded_borough: '3',
  doc_type: 'DEED'
}
```

Console message: `MasterRealPropApi` constructed query url (via `constructMasterUrl` utility function):

```bash
constructMasterUrl created: https://data.cityofnewyork.us/resource/bnx9-e6tj.json?$where=recorded_borough='3' AND doc_type='DEED' AND document_date between '2024-04-16' and '2025-04-16'
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
    recorded_borough: '3',
    party_type: '1',
    doc_type: 'DEED',
    doc_class: 'DEEDS AND OTHER CONVEYANCES'
  },
  primaryApiSources: { masterDataset: 'true', partiesDataset: 'true' },
  secondaryApiSources: {
    lotDataset: 'false',
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
  recorded_borough: '3',
  doc_type: 'DEED'
}
```

Console message: `MasterRealPropApi` constructed query url (via `constructMasterUrl` utility function):

```bash
constructMasterUrl created: https://data.cityofnewyork.us/resource/bnx9-e6tj.json?$where=recorded_borough='3' AND doc_type='DEED' AND document_date between '2025-03-19' and '2025-04-18'
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
    recorded_borough: '3',
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
    recorded_borough: '3',
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
    recorded_borough: '3',
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
    recorded_borough: '3',
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
    recorded_borough: '3',
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

##### `borough` vs `recorded_borough`
It turns out that **Search By Party Name** feature queries the `borough` column of the Real Property Lot dataset as opposed to the `recorded_borough` column of the Real Property Master dataset.  This is a huge realization that should not have taken me this long to find out but here we are...

##### API Responses limited to 1,000 records
It turns out that if I want to replicate the **Search By Party Name** feature I will need to make API GET requests to the Real Property datasets in a specific order while including the `document_id` values from the prior response in the next GET request.  For example, I used the search criteria below to query the Real Property Master dataset with the url: `https://data.cityofnewyork.us/resource/bnx9-e6tj.json?$select=count(*)&$where=doc_type='DEED' AND document_date between '2025-02-01' and '2025-03-31'`.  The result was that there were 5,776 records but I only received 1,000 so, first, I need a way to add pagination so I get all 5,776 records OR at least each record's `document_id` value.  Then I want to take those `document_id` values and include them in the subsequent API GET request to the Real Property Parties dataset.  This way I'm cross-referencing the two datasets so the resulting records should be less than 5,776 since I only want records with, for example, `name` that contains "EMPIRE" and has a `party_type` value of '1' so let's say that reduces the cumulative search results down to 1,000.  The resulting records, or `document_id` values of those records, will be included in the subsequent API GET request to the Real Property Legals (a/k/a Lot) dataset so now I'm taking 1,000 `document_id` values and sending them to the Real Property Legals API to see which of those `document_id` values also has a `borough` value of '3'.  Incorporating pagination into this will be very difficult.



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
  lotSearchTerms: { borough: '3' },
  primaryApiSources: { masterDataset: 'true', partiesDataset: 'true', lotDataset: 'true' },
  secondaryApiSources: { referencesDataset: 'false', remarksDataset: 'false' }
}
Fetching Master Dataset with query params: {
  document_date_range: 'custom-date-range',
  document_date_start: '2025-02-01',
  document_date_end: '2025-03-31',
  doc_type: 'DEED'
}
```