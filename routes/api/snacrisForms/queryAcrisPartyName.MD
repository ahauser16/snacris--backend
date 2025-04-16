# Dev Notes 4/8/25

this is a series of notes about developing the `queryAcrisPartyName` route that receives data from the user on the front end application that allows the user to "Search By Name". This is an attempt to copy the behavior of the ACRIS website's Search By Party Name website located here: `https://a836-acris.nyc.gov/DS/DocumentSearch/PartyName`.

I got the front end behavior to a point that I'm satisfied with and now I need to handle the front end's request by deconstructing it within the `queryAcrisPartyName` route and create the url that will be sent to one or more of the Real Property API datasets.

Then I need to package or normalize the response from the Real Property ACRIS dataset(s) before sending it back to the front end.

## [Table of Contents](#table-of-contents)

- [Dev Notes 4/8/25](#dev-notes-4825)
  - [Table of Contents](#table-of-contents)
  - [Data Sent From Frontend](#data-sent-from-frontend)
  - [Data Received On Backend](#data-received-on-backend)
  - [How Do I want to "normalize" the data now that I received it?](#how-do-i-want-to-normalize-the-data-now-that-i-received-it)
  - [To Dos](#to-dos)
    - [Incoming Data Normalization](#incoming-data-normalization)
    - [Full `queryAcrisPartyName` route flow (prompt syntax)](#full-queryacrispartyname-route-flow-prompt-syntax)
    - [Full `queryAcrisPartyName` route flow (response to prompt #1)](#full-queryacrispartyname-route-flow-response-to-prompt-1)
    - [Revised Refactor Plan (prompt 2 / edited \& used as prompt 3)](#revised-refactor-plan-prompt-2--edited--used-as-prompt-3)
    - [Revised Refactor Plan (response 3)](#revised-refactor-plan-response-3)
      - [Strengths of Your Plan](#strengths-of-your-plan)
      - [Potential Issues and Suggestions](#potential-issues-and-suggestions)
      - [Steps to Accomplish the Refactor](#steps-to-accomplish-the-refactor)
  - [Front End Data received...now what (prompt 1)](#front-end-data-receivednow-what-prompt-1)
  - [Front End Data received...now what (response 1)](#front-end-data-receivednow-what-response-1)

## Data Sent From Frontend

The data sent by the `SearchByPartyNameForm` looks like this in the browser's console:

```json
{
  "name": "empire",
  "document_date_range": "last-7-days",
  "document_date_start": "2025-04-01",
  "document_date_end": "2025-04-08",
  "recorded_borough": "3",
  "party_type": "1",
  "doc_type": "DEED",
  "doc_class": "DEEDS AND OTHER CONVEYANCES"
}
```

```json
{
  "masterDataset": true,
  "lotDataset": true,
  "partiesDataset": true,
  "referencesDataset": true,
  "remarksDataset": true
}
```

[Back to TOC](#table-of-contents)

## Data Received On Backend

The data received by the server looks like this:

```bash
Received request with query parameters: {
  searchTerms: {
    name: 'empire',
    document_date_range: 'last-7-days',
    document_date_start: '2025-04-08',
    document_date_end: '2025-04-15',
    recorded_borough: '3',
    party_type: '1',
    doc_type: 'DEED',
    doc_class: 'DEEDS AND OTHER CONVEYANCES'
  },
  primaryApiSources: { masterDataset: 'true', partiesDataset: 'true' },
  secondaryApiSources: {
    lotDataset: 'true',
    referencesDataset: 'true',
    remarksDataset: 'true'
  }
}
```

The URL is being sent from the front end looks like this: `GET /queryAcrisPartyName/fetchRecord?searchTerms[name]=empire&searchTerms[document_date_range]=last-7-days&searchTerms[document_date_start]=2025-04-08&searchTerms[document_date_end]=2025-04-15&searchTerms[recorded_borough]=3&searchTerms[party_type]=1&searchTerms[doc_type]=DEED&searchTerms[doc_class]=DEEDS+AND+OTHER+CONVEYANCES&primaryApiSources[masterDataset]=true&primaryApiSources[partiesDataset]=true&secondaryApiSources[lotDataset]=true&secondaryApiSources[referencesDataset]=true&secondaryApiSources[remarksDataset]=true`

[Back to TOC](#table-of-contents)

## How Do I want to "normalize" the data now that I received it?

1. sort by dataset
   - should it be sent to the Real Property Master API or the Real Property Parties API?
     - `name` and `party_type` are _only_ associated with the **Real Property Parties dataset** so we _must_ send this data to the Real Property Parties API using `PartiesRealPropApi`.
     - `document_date_range`, `document_date_start`, `document_date_end`, `recorded_borough`, `doc_type` and `doc_class` are _only_ associated with the **Real Property Master dataset** so we _must_ send this data to the Real Property Master API using `MasterRealPropApi`.
     - now that we know we need to send an API GET request using the data above using the `PartiesRealPropApi` and `MasterRealPropApi` modules we _may_ want to cross reference the response with the other three datasets depending on the user's preference which is why we requested this data from the user using the boolean values: `masterDataset`, `lotDataset`, `partiesDataset`, `referencesDataset` and `remarksDataset`.
     - the frontend has the Real Property Master and Real Property Parties checkboxes pre-checked because `name` and `doc_type` and other search terms are exclusive to those two datasets but the user may want the crossreferenced `lot`, `references` and `remarks` data as well.
       - TODO: you should disable these two checkboxes so they stay in the "checked state" to convey that the Search By Party Name form is associated with these two datasets
2. sort by data type
   - should the data be used as the "search term" or should it instruct the `queryAcrisPartyName` route on _how_ to use that search term?
     - `document_date_range` represents the _type_ of date range chosen by the user and not the actual date range values (e.g. 'to-current-date-default', 'last-7-days', 'custom-date-range', etc.)
     - `document_date_start` and `document_date_end` represent the actual `document_date` start and end dates (e.g. '2025-04-01' & '2025-04-08' when `document_date_range` is set to 'to-current-date-default', '' & '' when `document_date_range` is set to 'last-7-days', '2025-04-01' & '2025-04-30' when `document_date_range` is set to 'custom-date-range').

[Back to TOC](#table-of-contents)

## To Dos

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
- [ ] I need to write a function that accepts the `document_date_range`, `document_date_start` and `document_date_end` as parameters and returns the appropriate values to query the `document_date` endpoint in the Query URL in the `MasterRealPropApi` component.
  - Background: `document_date` is a field that most of the time will query the Master dataset as a range which is why the Example Data contains the keys: `document_date_range`, `document_date_start` and `document_date_end`. The `document_date_start` and `document_date_end` values are received with the syntax: '2025-04-06' and '2025-04-13' and represent the actual starting and ending date range values whereas the `document_date_range` represents the type of date range that was submitted by the form such as `"last-7-days"`, `"last-30-days"`, `"last-90-days"`, `"last-1-year"`, `"last-2-years"`, `"last-5-years"`, `"custom-date-range"` and `"to-current-date-default"`.
- [x] Refactor the `queryParams` object by creating two new variables: `masterQueryParams` and `partiesQueryParams`.
- [ ] Validate and construct the query parameters for each object.
- [x] Refactor the `records` array by replacing it with five new arrays named `masterRecords`, `partiesRecords`, `lotRecords`, `referenceRecords` and `remarkRecords`.
- [ ] Refactor `fetchDataset` to push results to either the `masterRecords`, `partiesRecords`, `lotRecords`, `referenceRecords` or `remarkRecords` arrays based on the value of the `masterDataset`, `lotDataset`, `partiesDataset`, `referencesDataset` and `remarksDataset` request object.
- [ ] Refactor the `masterDataset`, `lotDataset`, `partiesDataset`, `referencesDataset` and `remarksDataset` request object to use the values "primary" and "secondary" instead of boolean values.

[Back to TOC](#table-of-contents)

### Full `queryAcrisPartyName` route flow (prompt syntax)

[INTENTIONALLY OMMITTED]

### Full `queryAcrisPartyName` route flow (response to prompt #1)

### Revised Refactor Plan (prompt 2 / edited & used as prompt 3)

@workspace I need your help by critiquing my refactor plan for my `queryAcrisPartyName`, `MasterRealPropApi`, `PartiesRealPropApi`, `LegalsRealPropApi`, `RemarksRealPropApi` and `ReferencesRealPropApi` code below based on the following behavior. Once you have reviewed my plan I want you to make suggestions if my plan does not coincide with "best practices" and to explain anything I may have missed that could break my code or cause undesireable behaviors.

As background, the front end sends a request with data in the format below which is received by the `queryAcrisPartyName` backend route. The `recorded_borough`, `doc_type`, `document_date_range`, `document_date_start` and `document_date_end` values are all associated with the Real Property Master dataset so they are passed to the `masterQueryParams` variable to be used by `MasterRealPropApi` to make an axios GET request. The `name` and `party_type` values are associated with the Real Property Parties dataset so they are passed to the `partiesQueryParams` variable to be used by `PartiesRealPropApi` to make a separate axios GET request. If `masterDataset` is equal to `true` then I want to send a HTTP GET request using `MasterRealPropApi` which takes `masterQueryParams` as its sole parameter and if `partiesDataset` is `true` then I want to send a HTTP GET request using `PartiesRealPropApi` which takes `partiesQueryParams` as its sole parameter.

I want to add a function called `constructMasterUrl` to my `MasterRealPropApi` file and a function called `constructPartiesUrl` to my `PartiesRealPropApi` file that will construct the `url` based on the values contained in `masterQueryParams` and `partiesQueryParams`, respectively, which the `fetchFromAcris` function, from each file, will then use to make its own `axios` GET request.

The `constructMasterUrl` will accept the following optional parameters: `document_id`, `crfn`, `recorded_borough` (corresponds to the value of `recorded_borough` from `masterQueryParams`), `doc_type` (corresponds to the value of `doc_type` from `masterQueryParams`), `document_date` (corresponds to the value of `document_date_range` , `document_date_start` and `document_date_end` from `masterQueryParams`), `document_amt`, `recorded_datetime`, `modified_date`, `reel_yr`, `reel_nbr`, `reel_pg` and `percent_trans`.

The `constructPartiesUrl` will accept the following optional parameters: `document_id`, `party_type` (corresponds to the value of `party_type` from `partiesQueryParams`), `name` (corresponds to the value of `name` from `partiesQueryParams`), `address_1`, `address_2`, `country`, `city`, `state` and `zip`.

The `constructMasterUrl` and `constructPartiesUrl` should construct the `url` using Socrata Query Language (SoQL) syntax and specifically use the `$where` parameter to specify multiple conditions combined with logical operators such as `AND` and `OR` such as `$where=recorded_borough='3' AND document_id between '20250401' and '20250415' AND doc_type='DEED'`. Additionally, the `constructMasterUrl` and `constructPartiesUrl` functions should use a function called "validateQueryParams" that contains logic to validate the query parameters and check the format and values of before proceeding with the API calls.

Initially, I wanted to create a function called "createDocumentDateSocrataSyntax" in the `MasterRealPropApi` file that accepts `document_date_range`, `document_date_start` and `document_date_end` parameters and returns a string of text representing a SoQL syntax that queries a range using the start date value: `document_date_start` and the end date value: `document_date_end` for the column `document_date`, however, I think it would be more efficient to have a utility function called "alterSearch" that generates SoQL syntax depending on whether the query parameters specify (i) a range of values associated with `document_date` (derived from the values of `document_date_range`, `document_date_start` and `document_date_end`) and any other column name such as `document_id`, `recorded_borough`, `doc_type`, (ii) an exact value associated with a column name, (iii) a list of values associated with a column name, (iv) wildcard queries (e.g. `name like 'empire%'`) and (v) Null/Not Null Queries (e.g., `document_amt is not null`).

The results of the `MasterRealPropApi` API call should be saved to `masterRecords` and the results of the `PartiesRealPropApi` API call should be saved to `partiesRecords`. Then I want to create a function called "combineMasterPartyRecords" which combines the `masterRecords` and `partiesRecords` records into a variable called `primaryRecords` and cross references those records so that `primaryRecords` only includes records from `masterRecords` and `partiesRecords` that contain the same `document_id` value. For example, if a record in `masterRecords` has a `document_id` that is not present in `partiesRecords`, it should be excluded from `primaryRecords`. Similarly, if a record in `partiesRecords` has a `document_id` that is not present in `masterRecords`, it should be excluded from `primaryRecords`. As part of the "combineMasterPartyRecords" function I want to populate a variable called `primaryRecordDocumentIds` which is an array of unique `document_id` values derived from the `primaryRecords` results. The `primaryRecordDocumentIds` values will be used by the `LegalsRealPropApi`, `ReferencesRealPropApi` and `RemarksRealPropApi` to make separate API GET requests for records that contain the `document_id` values from the `primaryRecordDocumentIds` array and the results of those requests will be pushed to the `lotRecords`, `referenceRecords` and `remarkRecords` arrays, respectively. In order to achieve this behavior a new function called "fetchSecondaryDataFromAcris" will need to be created in the `LegalsRealPropApi`, `ReferencesRealPropApi` and `RemarksRealPropApi` files that (1) will only accept an array of `document_id` values as its sole parameter, (2) constructs a query URL using SoQL syntax with the `$where` parameter containing the `document_id` values from the array and sends the `url` and request using axios in the same way that `fetchFromAcris` does. Alternatively it may be a good idea to create a separate utility function that constructs the `SoQL` URL based on the values in `primaryRecordDocumentIds` to be used by `LegalsRealPropApi`, `ReferencesRealPropApi` and `RemarksRealPropApi` when they make their API GET requests using the "fetchSecondaryDataFromAcris". Keep in mind if records are not received from the "fetchSecondaryDataFromAcris" function then an object should be created with a property called "search-status" with a value of "none found" such as the code snippet:

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

`queryAcrisPartyName.js`

```javascript
"use strict";

/** Routes for ACRIS Real Property Legals API calls. */

const express = require("express");
const MasterRealPropApi = require("../../../api/acris/real-property/MasterRealPropApi");
const LegalsRealPropApi = require("../../../api/acris/real-property/LegalsRealPropApi");
const PartiesRealPropApi = require("../../../api/acris/real-property/PartiesRealPropApi");
const RemarksRealPropApi = require("../../../api/acris/real-property/RemarksRealPropApi");
const ReferencesRealPropApi = require("../../../api/acris/real-property/ReferencesRealPropApi");
const { transformForUrl } = require("../../../api/utils");

const router = new express.Router();

/**
 * Filters records to include only unique properties based on specific keys.
 *
 * @param {Array} records - The array of record objects.
 * @returns {Array} - An array of unique objects containing only the specified keys.
 */

router.get("/fetchRecord", async function (req, res, next) {
  try {
    console.log("Received request with query parameters:", req.query);

    // Extract query parameters from the request
    const {
      //Master Dataset
      //document_date,
      document_date_range,
      document_date_start,
      document_date_end,
      recorded_borough,
      doc_type,
      //Parties Dataset
      name,
      party_type,
      //Primary & Secondary Dataset
      masterDataset,
      lotDataset,
      partiesDataset,
      referencesDataset,
      remarksDataset,
    } = req.query;

    // Convert Primary & Secondary Dataset flags to booleans
    const primaryDatasets = {
      masterDataset: masterDataset === "true",
      partiesDataset: partiesDataset === "true",
    };
    // Convert Primary & Secondary Dataset flags to booleans
    const secondaryDatasets = {
      lotDataset: lotDataset === "true",
      referencesDataset: referencesDataset === "true",
      remarksDataset: remarksDataset === "true",
    };

    // Validate and construct query parameters
    //const queryParams = {};
    const masterQueryParams = {};
    const partiesQueryParams = {};
    if (document_date_range)
      masterQueryParams.document_date_range = document_date_range;
    if (document_date_start)
      masterQueryParams.document_date_start = document_date_start;
    if (document_date_end)
      masterQueryParams.document_date_end = document_date_end;

    if (recorded_borough) masterQueryParams.recorded_borough = recorded_borough;
    if (doc_type) masterQueryParams.doc_type = transformForUrl(doc_type);

    if (name) partiesQueryParams.name = transformForUrl(name);
    if (party_type) partiesQueryParams.party_type = party_type;

    // Ensure at least one valid parameter associated with the Real Property Master dataset is provided
    if (Object.keys(masterQueryParams).length === 0) {
      return res.status(400).json({
        error:
          "At least one query parameter for the Master Dataset is required.",
      });
    }
    // Ensure at least one valid parameter associated with the Real Property Parties dataset is provided
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

    // Initialize empty arrays to hold the records returned from each dataset
    // let records = [];
    let masterRecords = [];
    let partiesRecords = [];

    //Fetch data from the "Primary Datasets"
    if (primaryDatasets.masterDataset) {
      masterRecords = await MasterRealPropApi.fetchFromAcris(masterQueryParams);
      if (masterRecords.length === 0) {
        console.warn("No records found for masterDataset");
        masterRecords.push({ dataFound: false, dataset: "masterDataset" });
      }
    }
    if (primaryDatasets.partiesDataset) {
      partiesRecords = await PartiesRealPropApi.fetchFromAcris(
        partiesQueryParams
      );
      if (partiesRecords.length === 0) {
        console.warn("No records found for partiesDataset");
        partiesRecords.push({ dataFound: false, dataset: "partiesDataset" });
      }
    }

    let primaryRecords = [...masterRecords, ...partiesRecords];

    let primaryRecordDocumentIds = [];

    let lotRecords = [];
    let referenceRecords = [];
    let remarkRecords = [];
    //Fetch data from the "Secondary Datasets"
    if (secondaryDatasets.lotDataset) {
      lotRecords = await LegalsRealPropApi.fetchFromAcris(masterQueryParams);
      if (lotRecords.length === 0) {
        console.warn("No records found for lotDataset");
        lotRecords.push({ dataFound: false, dataset: "lotDataset" });
      }
    }
    if (secondaryDatasets.referencesDataset) {
      referenceRecords = await ReferencesRealPropApi.fetchFromAcris(
        masterQueryParams
      );
      if (referenceRecords.length === 0) {
        console.warn("No records found for referencesDataset");
        referenceRecords.push({
          dataFound: false,
          dataset: "referencesDataset",
        });
      }
    }
    if (secondaryDatasets.remarksDataset) {
      remarkRecords = await RemarksRealPropApi.fetchFromAcris(
        masterQueryParams
      );
      if (remarkRecords.length === 0) {
        console.warn("No records found for remarksDataset");
        remarkRecords.push({ dataFound: false, dataset: "remarksDataset" });
      }
    }

    let secondaryRecords = [
      ...lotRecords,
      ...referenceRecords,
      ...remarkRecords,
    ];

    let records = [...primaryRecords, ...secondaryRecords];

    console.log(
      "Fetched master records:",
      masterRecords,
      "Fetched parties records:",
      partiesRecords
    );

    return res.json({ records });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
```

`MasterRealPropApi`

```javascript
"use strict";

const axios = require("axios");
const { NotFoundError } = require("../../../expressError");
const API_ENDPOINTS = require("../../apiEndpoints");

/** Functions for interacting with the ACRIS Real Property Master API. */

class MasterRealPropApi {
  static async fetchFromAcris(query) {
    try {
      // Construct the URL with query parameters
      const url = `${API_ENDPOINTS.realPropertyMaster}?${new URLSearchParams(
        query
      ).toString()}`;
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
        throw new NotFoundError(
          `No records found for query: ${JSON.stringify(query)}`
        );
      }

      return response.data;
    } catch (err) {
      console.error("Error fetching data from ACRIS API:", err.message);
      throw new Error("Failed to fetch data from ACRIS API");
    }
  }
}

module.exports = MasterRealPropApi;
```

`PartiesRealPropApi`

```javascript
"use strict";

const axios = require("axios");
const { NotFoundError } = require("../../../expressError");
const API_ENDPOINTS = require("../../apiEndpoints");

/** Functions for interacting with the ACRIS Real Property Parties API. */

class PartiesRealPropApi {
  static async fetchFromAcris(query) {
    try {
      // Construct the URL with query parameters
      const url = `${API_ENDPOINTS.realPropertyParties}?${new URLSearchParams(
        query
      ).toString()}`;
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
        throw new NotFoundError(
          `No records found for query: ${JSON.stringify(query)}`
        );
      }

      return response.data;
    } catch (err) {
      console.error("Error fetching data from ACRIS API:", err.message);
      throw new Error("Failed to fetch data from ACRIS API");
    }
  }
}

module.exports = PartiesRealPropApi;
```

`ReferencesRealPropApi`

```javascript
"use strict";

const axios = require("axios");
const { NotFoundError } = require("../../../expressError");
const API_ENDPOINTS = require("../../apiEndpoints");

/** Functions for interacting with the ACRIS Real Property References API. */

class ReferencesRealPropApi {
  static async fetchFromAcris(query) {
    try {
      // Construct the URL with query parameters
      const url = `${
        API_ENDPOINTS.realPropertyReferences
      }?${new URLSearchParams(query).toString()}`;
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
        throw new NotFoundError(
          `No records found for query: ${JSON.stringify(query)}`
        );
      }

      return response.data;
    } catch (err) {
      console.error("Error fetching data from ACRIS API:", err.message);
      throw new Error("Failed to fetch data from ACRIS API");
    }
  }
}

module.exports = ReferencesRealPropApi;
```

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

   - Your plan mentions validating query parameters in `constructMasterUrl` and `constructPartiesUrl`, but it does not specify how this will be done.
   - Suggestion: Create a utility function (e.g., `validateQueryParams`) that checks the format and values of query parameters. This function should:
     - Ensure required parameters are present.
     - Validate the format of dates, numbers, and strings.
     - Return an error or throw an exception if validation fails.

3. Handling `document_date` in `constructMasterUrl`

- The `document_date` parameter is derived from `document_date_range`, `document_date_start`, and `document_date_end`. Ensure that the logic for constructing this parameter is well-defined and accounts for edge cases (e.g., missing or invalid date values).
- Suggestion: Create a helper function (e.g., `createDocumentDateSocrataSyntax`) to handle this logic. This function should:
  - Accept `document_date_range`, `document_date_start`, and `document_date_end` as inputs.
  - Return a valid SoQL `$where` clause for querying the `document_date` column.

4. Utility Function for SoQL Syntax

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

6. Performance Considerations

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
     - This function was implemented by `MasterRealPropApi` and I successfully tested it using Postman.
   - [x] Create and implement `constructPartiesUrl` to encapsulate the URL construction logic.
   - [x] Update `fetchFromAcris` to use `constructMasterUrl`.
     - This function was implemented by `MasterRealPropApi` and I successfully tested it using Postman.
   - [x] Update `fetchFromAcris` to use `constructPartiesUrl`.

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

1. Create Utility Functions:

   - [ ] Implement `alterSearch` to generate SoQL syntax for different query types.
   - [ ] Implement `createDocumentDateSocrataSyntax` to handle `document_date` logic.
     - This may not be necessary because I successfully handled a range query for the `document_date` column in my `constructMasterUrl` function.

2. Refactor `LegalsRealPropApi`, `ReferencesRealPropApi`, and `RemarksRealPropApi`:

   - [ ] Add `fetchSecondaryDataFromAcris` to handle fetching data for multiple `document_id` values.
   - [ ] Optionally, use `alterSearch` to construct SoQL syntax for these APIs.

3. Update `queryAcrisPartyName` Route:

   - [ ] Use `constructMasterUrl` and `constructPartiesUrl` to construct URLs for primary datasets.
   - [ ] Use `fetchSecondaryDataFromAcris` to fetch data for secondary datasets.
   - [ ] Cross-reference `masterRecords` and `partiesRecords` to create `primaryRecords`.
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
`partiesDataset`) and `secondaryDatasets` (`lotDataset`, `referencesDataset`, `remarksDataset`) variables. These values will be used to instruct my `queryAcrisPartyName` route to make API calls, or to not make API calls, using the `MasterRealPropApi`, `LegalsRealPropApi`, `PartiesRealPropApi`, `RemarksRealPropApi` or `ReferencesRealPropApi` components. For example, referring to the User Request data below, `primaryApiSources: { masterDataset: 'true', partiesDataset: 'true' }` will instruct my `queryAcrisPartyName` route to send an API request using `MasterRealPropApi` and `PartiesRealPropApi`. Furthermore, `secondaryApiSources: { lotDataset: 'false', referencesDataset: 'false', remarksDataset: 'false' }` will instruct my `queryAcrisPartyName` route to NOT send an API request using`LegalsRealPropApi`, `RemarksRealPropApi` or `ReferencesRealPropApi`. The `searchTerms` object's key/value pairs will be used to construct the query URL for the `primaryApiSources` whose values are `true` which in this case is the `MasterRealPropApi` and `PartiesRealPropApi` because `primaryApiSources: { masterDataset: 'true', partiesDataset: 'true' }`. I want the `masterQueryParams` to be populated with query parameters: `document_date_range`, `document_date_start`, `document_date_end`, `recorded_borough` and `doc_type`. I want the `partiesQueryParams` to be populated with `name` and `party_type`. I also want to keep the validation logic below for these parameters and the conditional logic that ensures at least one valid parameter associated with the Real Property Master dataset, at least one valid parameter associated with the Real Property Parties dataset is provided and that at least one dataset is selected. Then I want to initialize the `masterRecords` array and make the API call with `MasterRealPropApi.fetchFromAcris` using the `masterQueryParams` query parameters and handle the response or any errors from the API call. Then I want to initialize the `partiesRecords` array and make the API call with `PartiesRealPropApi.fetchFromAcris` using the `partiesQueryParams` query parameters. There is more to the behavior that I want to implement in the `queryAcrisPartyName` backend route but I need your help achieving the aforementioned behavior with the code below.

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

```js
"use strict";

/** Routes for ACRIS Real Property Legals API calls. */

const express = require("express");
const MasterRealPropApi = require("../../../api/acris/real-property/MasterRealPropApi");
const LegalsRealPropApi = require("../../../api/acris/real-property/LegalsRealPropApi");
const PartiesRealPropApi = require("../../../api/acris/real-property/PartiesRealPropApi");
const RemarksRealPropApi = require("../../../api/acris/real-property/RemarksRealPropApi");
const ReferencesRealPropApi = require("../../../api/acris/real-property/ReferencesRealPropApi");
const { transformForUrl } = require("../../../api/utils");

const router = new express.Router();

/**
 * Filters records to include only unique properties based on specific keys.
 *
 * @param {Array} records - The array of record objects.
 * @returns {Array} - An array of unique objects containing only the specified keys.
 */

router.get("/fetchRecord", async function (req, res, next) {
  try {
    console.log("Received request with query parameters:", req.query);

    // Extract query parameters from the request
    const {
      //Master Dataset
      //document_date, --> the three document_date fields below are used to target the `document_date` column name at the Real Property Master API endpoint.
      document_date_range,
      document_date_start,
      document_date_end,
      recorded_borough,
      doc_type,
      //Parties Dataset
      name,
      party_type,
      //Primary & Secondary Dataset
      masterDataset,
      lotDataset,
      partiesDataset,
      referencesDataset,
      remarksDataset,
    } = req.query;

    // const datasets = {
    //     masterDataset: masterDataset === "true",
    //     partiesDataset: partiesDataset === "true",
    //     lotDataset: lotDataset === "true",
    //     referencesDataset: referencesDataset === "true",
    //     remarksDataset: remarksDataset === "true",
    // }

    // Convert Primary & Secondary Dataset flags to booleans
    const primaryDatasets = {
      masterDataset: masterDataset === "true",
      partiesDataset: partiesDataset === "true",
    };
    // Convert Primary & Secondary Dataset flags to booleans
    const secondaryDatasets = {
      lotDataset: lotDataset === "true",
      referencesDataset: referencesDataset === "true",
      remarksDataset: remarksDataset === "true",
    };

    // Validate and construct query parameters
    //const queryParams = {};
    const masterQueryParams = {};
    if (document_date_range)
      masterQueryParams.document_date_range = document_date_range;
    if (document_date_start)
      masterQueryParams.document_date_start = document_date_start;
    if (document_date_end)
      masterQueryParams.document_date_end = document_date_end;

    if (recorded_borough) masterQueryParams.recorded_borough = recorded_borough;
    if (doc_type) masterQueryParams.doc_type = transformForUrl(doc_type);

    const partiesQueryParams = {};
    if (name) partiesQueryParams.name = transformForUrl(name);
    if (party_type) partiesQueryParams.party_type = party_type;

    // Ensure at least one valid parameter associated with the Real Property Master dataset is provided
    if (Object.keys(masterQueryParams).length === 0) {
      return res
        .status(400)
        .json({
          error:
            "At least one query parameter for the Master Dataset is required.",
        });
    }
    // Ensure at least one valid parameter associated with the Real Property Parties dataset is provided
    if (Object.keys(partiesQueryParams).length === 0) {
      return res
        .status(400)
        .json({
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

    // Initialize empty arrays to hold the records returned from each dataset
    // let records = [];
    let masterRecords = [];

    //Fetch data from the "Primary Datasets"
    if (primaryDatasets.masterDataset) {
      console.log("masterQueryParams:", masterQueryParams);
      masterRecords = await MasterRealPropApi.fetchFromAcris(masterQueryParams);
      console.log("masterRecords after fetchFromAcris:", masterRecords);
      if (masterRecords.length === 0) {
        console.warn("No records found for masterDataset");
        masterRecords.push({ dataFound: false, dataset: "masterDataset" });
      }
    }

    // Initialize empty arrays to hold the records returned from each dataset
    let partiesRecords = [];
    if (primaryDatasets.partiesDataset) {
      partiesRecords = await PartiesRealPropApi.fetchFromAcris(
        partiesQueryParams
      );
      if (partiesRecords.length === 0) {
        console.warn("No records found for partiesDataset");
        partiesRecords.push({ dataFound: false, dataset: "partiesDataset" });
      }
    }

    // `primaryRecords` should only include records from `masterRecords` and `partiesRecords` that contain the same `document_id` value.  If a record in `masterRecords` has a `document_id` that is not present in `partiesRecords`, it should be excluded from `primaryRecords`. Similarly, if a record in `partiesRecords` has a `document_id` that is not present in `masterRecords`, it should be excluded from `primaryRecords`.
    let primaryRecords = [...masterRecords, ...partiesRecords];

    //extract the `document_id` values from the `primaryRecords` results.  This will be used to filter the records from the secondary datasets.
    // `primaryRecordDocumentIds` should be an array of unique `document_id` values from the `primaryRecords` results.
    let primaryRecordDocumentIds = [];

    let lotRecords = [];
    let referenceRecords = [];
    let remarkRecords = [];
    //Fetch data from the "Secondary Datasets"
    if (secondaryDatasets.lotDataset) {
      lotRecords = await LegalsRealPropApi.fetchFromAcris(masterQueryParams);
      if (lotRecords.length === 0) {
        console.warn("No records found for lotDataset");
        lotRecords.push({ dataFound: false, dataset: "lotDataset" });
      }
    }
    if (secondaryDatasets.referencesDataset) {
      referenceRecords = await ReferencesRealPropApi.fetchFromAcris(
        masterQueryParams
      );
      if (referenceRecords.length === 0) {
        console.warn("No records found for referencesDataset");
        referenceRecords.push({
          dataFound: false,
          dataset: "referencesDataset",
        });
      }
    }
    if (secondaryDatasets.remarksDataset) {
      remarkRecords = await RemarksRealPropApi.fetchFromAcris(
        masterQueryParams
      );
      if (remarkRecords.length === 0) {
        console.warn("No records found for remarksDataset");
        remarkRecords.push({ dataFound: false, dataset: "remarksDataset" });
      }
    }

    // `secondaryRecords` should only include records from `lotRecords`, `referenceRecords`, and `remarkRecords` that contain the same `document_id` values that were in the `primaryRecordDocumentIds` array.
    let secondaryRecords = [
      ...lotRecords,
      ...referenceRecords,
      ...remarkRecords,
    ];

    // records should only include records from `primaryRecords` and `secondaryRecords` that, through previous searching and filtering, contain the same `document_id` values.  The data should be combined in such a way that the final result contains all relevant information from both `primaryRecords` and `secondaryRecords` into a single record object that has a unique `document_id`.
    let records = [...primaryRecords, ...secondaryRecords];

    // Fetch data from the ACRIS API
    console.log(
      "Fetched master records:",
      masterRecords,
      "Fetched parties records:",
      partiesRecords
    );

    return res.json({ records });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
```

```js
"use strict";

const axios = require("axios");
const { NotFoundError } = require("../../../expressError");
const API_ENDPOINTS = require("../../apiEndpoints");

/** Functions for interacting with the ACRIS Real Property Master API. */

class MasterRealPropApi {
  /**
   * Constructs a SoQL query URL for the Real Property Master dataset.
   *
   * @param {Object} params - Optional query parameters.
   * @param {string} [params.document_id] - Document ID.
   * @param {string} [params.crfn] - CRFN.
   * @param {string} [params.recorded_borough] - Recorded borough.
   * @param {string} [params.doc_type] - Document type.
   * @param {string} [params.document_date_start] - Start date for document_date range.
   * @param {string} [params.document_date_end] - End date for document_date range.
   * @param {string} [params.document_amt] - Document amount.
   * @param {string} [params.recorded_datetime] - Recorded datetime.
   * @param {string} [params.modified_date] - Modified date.
   * @param {string} [params.reel_yr] - Reel year.
   * @param {string} [params.reel_nbr] - Reel number.
   * @param {string} [params.reel_pg] - Reel page.
   * @param {string} [params.percent_trans] - Percent transaction.
   * @returns {string} - Constructed SoQL query URL.
   */
  static constructMasterUrl({
    document_id,
    crfn,
    recorded_borough,
    doc_type,
    document_date_start,
    document_date_end,
    document_amt,
    recorded_datetime,
    modified_date,
    reel_yr,
    reel_nbr,
    reel_pg,
    percent_trans,
  } = {}) {
    const conditions = [];

    // Add conditions for each parameter if provided
    if (document_id)
      conditions.push(`upper(document_id)=upper('${document_id}')`);
    if (crfn) conditions.push(`crfn='${crfn}'`);
    if (recorded_borough)
      conditions.push(`recorded_borough='${recorded_borough}'`);
    if (doc_type) conditions.push(`doc_type='${doc_type}'`);

    // Format document_date_start and document_date_end to YYYYMMDD
    if (document_date_start && document_date_end) {
      // const formattedStart = document_date_start.replace(/-/g, ""); // Convert YYYY-MM-DD to YYYYMMDD
      // const formattedEnd = document_date_end.replace(/-/g, "");     // Convert YYYY-MM-DD to YYYYMMDD
      // conditions.push(`document_date between '${formattedStart}' and '${formattedEnd}'`);
      conditions.push(
        `document_date between '${document_date_start}' and '${document_date_end}'`
      );
    }

    if (document_amt) conditions.push(`document_amt='${document_amt}'`);
    if (recorded_datetime)
      conditions.push(`recorded_datetime='${recorded_datetime}'`);
    if (modified_date) conditions.push(`modified_date='${modified_date}'`);
    if (reel_yr) conditions.push(`reel_yr='${reel_yr}'`);
    if (reel_nbr) conditions.push(`reel_nbr='${reel_nbr}'`);
    if (reel_pg) conditions.push(`reel_pg='${reel_pg}'`);
    if (percent_trans) conditions.push(`percent_trans='${percent_trans}'`);

    // Construct the $where clause
    const whereClause =
      conditions.length > 0 ? `$where=${conditions.join(" AND ")}` : "";

    // Construct the full URL
    const url = `${API_ENDPOINTS.realPropertyMaster}?${whereClause}`;
    return url;
  }

  /**
   * Fetch data from the ACRIS Real Property Master dataset.
   * @param {Object} query - Query parameters.
   * @returns {Array} - Fetched records.
   */

  static async fetchFromAcris(query) {
    try {
      // Construct the URL with query parameters
      const url = this.constructMasterUrl(query);
      console.log("Constructed URL:", url);

      // Make the GET request to the NYC Open Data API
      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          "X-App-Token": process.env.APP_TOKEN, // Ensure APP_TOKEN is set in your environment
        },
      });

      // Log the full response object to inspect its structure
      //console.log("Full Response Object:", response);

      // Log the response data specifically
      // console.log("Response Data:", response.data);

      // Handle case where no records are found
      if (response.data.length === 0) {
        throw new NotFoundError(
          `No records found for query: ${JSON.stringify(query)}`
        );
      }

      return response.data;
    } catch (err) {
      console.error("Error fetching data from ACRIS API:", err.message);
      throw new Error("Failed to fetch data from ACRIS API");
    }
  }
}

module.exports = MasterRealPropApi;
```

```js
"use strict";

const axios = require("axios");
const { NotFoundError } = require("../../../expressError");
const API_ENDPOINTS = require("../../apiEndpoints");

/** Functions for interacting with the ACRIS Real Property Parties API. */

class PartiesRealPropApi {
  /**
   * Constructs a SoQL query URL for the Real Property Parties dataset.
   *
   * @param {Object} params - Optional query parameters.
   * @param {string} [params.document_id] - Document ID.
   * @param {string} [params.party_type] - Party type.
   * @param {string} [params.name] - Party name.
   * @param {string} [params.address_1] - Address line 1.
   * @param {string} [params.address_2] - Address line 2.
   * @param {string} [params.country] - Country.
   * @param {string} [params.city] - City.
   * @param {string} [params.state] - State.
   * @param {string} [params.zip] - ZIP code.
   * @returns {string} - Constructed SoQL query URL.
   */
  static constructPartiesUrl({
    document_id,
    party_type,
    name,
    address_1,
    address_2,
    country,
    city,
    state,
    zip,
  } = {}) {
    const conditions = [];
    //NB: Explanation of a "Gotcha Moment":
    //Remember to ensure that the `%` characters in the `LIKE` clause are properly URL-encoded by using `encodeURIComponent` to encode the entire `$where` clause.

    // Add conditions for each parameter if provided
    if (document_id) conditions.push(`document_id='${document_id}'`);
    if (party_type) conditions.push(`party_type='${party_type}'`);
    if (name) conditions.push(`name LIKE '%${encodeURIComponent(name)}%'`); // Properly encode the name by wrapping it in `encodeURIComponent`
    if (address_1) conditions.push(`address_1="${address_1}"`);
    if (address_2) conditions.push(`address_2="${address_2}"`);
    if (country) conditions.push(`country="${country}"`);
    if (city) conditions.push(`city="${city}"`);
    if (state) conditions.push(`state="${state}"`);
    if (zip) conditions.push(`zip='${zip}'`);

    // Construct the $where clause so that it is wrapped in `encodeURIComponent` function to ensure that all special characters (including %) are properly URL-encoded.
    const whereClause =
      conditions.length > 0
        ? `$where=${encodeURIComponent(conditions.join(" AND "))}`
        : "";

    // Construct the full URL
    const url = `${API_ENDPOINTS.realPropertyParties}?${whereClause}`;
    return url;
  }

  /**
   * Fetch data from the ACRIS Real Property Parties dataset.
   * @param {Object} query - Query parameters.
   * @returns {Array} - Fetched records.
   */
  static async fetchFromAcris(query) {
    try {
      // Construct the URL with query parameters
      const url = this.constructPartiesUrl(query);
      console.log("fetchFromAcris Constructed URL:", url);

      // Make the GET request to the NYC Open Data API
      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          "X-App-Token": process.env.APP_TOKEN, // Ensure APP_TOKEN is set in your environment
        },
      });

      // Log the response data for debugging
      console.log("Response Data:", response.data);

      // Handle case where no records are found
      if (response.data.length === 0) {
        throw new NotFoundError(
          `No records found for query: ${JSON.stringify(query)}`
        );
      }

      return response.data;
    } catch (err) {
      console.error("Error fetching data from ACRIS API:", err.message);
      throw new Error("Failed to fetch data from ACRIS API");
    }
  }
}

module.exports = PartiesRealPropApi;
```

## Front End Data received...now what (response 1)

**Here is a potential refactor plan:**

1. Extract Query Parameters:

   - Extracted `searchTerms`, `primaryApiSources`, and `secondaryApiSources` from the request query.
   - Used optional chaining (`?.`) to safely access nested properties.
   - Extracting Primary Dataset Flags and Extracting Secondary Dataset Flags
     - (A) Dataset Selection: The `primaryDatasets` and `secondaryDatasets` objects are used to decide which datasets to query.  For example, if `primaryDatasets.masterDataset` is true, the code will query the Master Dataset using the `MasterRealPropApi` component.  If `secondaryDatasets.lotDataset` is true, the code will query the Lot Dataset using the LegalsRealPropApi component.
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
    return res.status(400).json({ error: "At least one dataset must be selected." });
}
```


1. Validate Query Parameters:

- Constructed `masterQueryParams` and `partiesQueryParams` based on the `searchTerms` object.
- Added validation to ensure at least one valid parameter is provided for each dataset.

3. Fetch Data from APIs:

- Used `MasterRealPropApi.fetchFromAcris` and `PartiesRealPropApi.fetchFromAcris` to fetch data for the Master and Parties datasets.
- Handled errors gracefully by logging them and adding an error object to the records array.

4. Combine Records:

- Combined `masterRecords` and `partiesRecords` into a single `primaryRecords` array.
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
      return res
        .status(400)
        .json({
          error:
            "At least one query parameter for the Master Dataset is required.",
        });
    }
    if (Object.keys(partiesQueryParams).length === 0) {
      return res
        .status(400)
        .json({
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
    let partiesRecords = [];

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
        partiesRecords = await PartiesRealPropApi.fetchFromAcris(
          partiesQueryParams
        );
        console.log("Fetched Parties Records:", partiesRecords);
      } catch (err) {
        console.error("Error fetching Parties Dataset:", err.message);
        partiesRecords.push({
          dataFound: false,
          dataset: "partiesDataset",
          error: err.message,
        });
      }
    }

    // Combine Master and Parties records into primaryRecords
    const primaryRecords = [...masterRecords, ...partiesRecords];

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

- Restart your backend server to apply the changes.

2. Test the Route in Postman:

- Use the following URL to test the route:

```js
http://localhost:3001/queryAcrisPartyName/fetchRecord?searchTerms[name]=EMPIRE&searchTerms[document_date_range]=last-1-year&searchTerms[document_date_start]=2024-04-16&searchTerms[document_date_end]=2025-04-16&searchTerms[recorded_borough]=3&searchTerms[party_type]=1&searchTerms[doc_type]=doc-type-default&primaryApiSources[masterDataset]=true&primaryApiSources[partiesDataset]=true&secondaryApiSources[lotDataset]=false&secondaryApiSources[referencesDataset]=false&secondaryApiSources[remarksDataset]=false
```

3. Expected Behavior:

If the API calls succeed, you should receive a JSON response with the primaryRecords array.
If any API call fails, the response will include an error object in the corresponding dataset's records.

**Next Steps**

- Once this refactor is complete and tested, you can proceed to implement the logic for fetching secondary datasets (`lotDataset`, `referencesDataset`, `remarksDataset`) and cross-referencing records based on `document_id`.
