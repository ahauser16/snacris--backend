# Dev Notes 4/8/25

this is a series of notes about developing the `queryAcrisPartyName` route that receives data from the user on the front end application that allows the user to "Search By Name". This is an attempt to copy the behavior of the ACRIS website's Search By Party Name website located here: `https://a836-acris.nyc.gov/DS/DocumentSearch/PartyName`.

I got the front end behavior to a point that I'm satisfied with and now I need to handle the front end's request by deconstructing it within the `queryAcrisPartyName` route and create the url that will be sent to one or more of the Real Property API datasets.

Then I need to package or normalize the response from the Real Property ACRIS dataset(s) before sending it back to the front end.

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

## Data Received On Backend

The data received by the server looks like this:

```bash
Received request with query parameters: {
  name: 'empire',
  document_date_range: 'last-7-days',
  document_date_start: '2025-04-01',
  document_date_end: '2025-04-08',
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

### Making Primary & Secondary API Calls

### Handling Results from All API Calls

### Sending Results To Front End

### Full `queryAcrisPartyName` route flow (prompt syntax)

@workspace I need your help by critiquing my refactor plan for my `queryAcrisPartyName`, `MasterRealPropApi`, `PartiesRealPropApi`, `LegalsRealPropApi`, `RemarksRealPropApi` and `ReferencesRealPropApi` code below based on the following behavior. Once you have reviewed my plan I want you to make suggestions if my plan does not coincide with "best practices" and to explain anything I may have missed that could break my code or cause undesireable behaviors.  

As background, the front end sends a request with data in the format below which is received by the `queryAcrisPartyName` backend route. The `recorded_borough`, `doc_type`, `document_date_range`, `document_date_start` and `document_date_end` values are all associated with the Real Property Master dataset so they are passed to the `masterQueryParams` variable to be used by `MasterRealPropApi` to make an axios GET request. The `name` and `party_type` values are associated with the Real Property Parties dataset so they are passed to the `partiesQueryParams` variable to be used by `PartiesRealPropApi` to make a separate axios GET request. If `masterDataset` is equal to `true` then I want to send a HTTP GET request using `MasterRealPropApi` which takes `masterQueryParams` as its sole parameter and if `partiesDataset` is `true` then I want to send a HTTP GET request using `PartiesRealPropApi` which takes `partiesQueryParams` as its sole parameter. Also, I want to add a function called `constructMasterUrl` to my `MasterRealPropApi` file and a function called `constructPartiesUrl` to my `PartiesRealPropApi` file that will construct the `url` based on the values contained in `masterQueryParams` and `partiesQueryParams`, respectively, which the `fetchFromAcris` function, from each file, will then use to make its own `axios` GET request. The `constructMasterUrl` will accept the following optional parameters: `document_id`, `crfn`, `recorded_borough` (corresponds to the value of `recorded_borough` from `masterQueryParams`), `doc_type` (corresponds to the value of `doc_type` from `masterQueryParams`), `document_date` (corresponds to the value of `document_date_range` , `document_date_start` and `document_date_end` from `masterQueryParams`), `document_amt`, `recorded_datetime`, `modified_date`, `reel_yr`, `reel_nbr`, `reel_pg` and `percent_trans`. The `constructPartiesUrl` will accept the following optional parameters: `document_id`, `party_type` (corresponds to the value of `party_type` from `partiesQueryParams`), `name` (corresponds to the value of `name` from `partiesQueryParams`), `address_1`, `address_2`, `country`, `city`, `state` and `zip`. Both the `constructMasterUrl` and `constructPartiesUrl` will construct query URLs using Socrata Query Language syntax which I will most likely need to fine tune, however, for now I want you to create the functions with the aforementioned criteria without refactoring unneccessary parts of the code. 

The results of the `MasterRealPropApi` API call should be saved to `masterRecords` and the results of the `PartiesRealPropApi` API call should be saved to `partiesRecords`. Then I want to combine the `masterRecords` and `partiesRecords` records into a variable called `primaryRecords` and cross reference those records so that `primaryRecords` only includes records from `masterRecords` and `partiesRecords` that contain the same `document_id` value. For example, if a record in `masterRecords` has a `document_id` that is not present in `partiesRecords`, it should be excluded from `primaryRecords`. Similarly, if a record in `partiesRecords` has a `document_id` that is not present in `masterRecords`, it should be excluded from `primaryRecords`. As part of this filtering process I want to populate a variable called `primaryRecordDocumentIds` which should be an array of unique `document_id` values derived from the `primaryRecords` results. The `primaryRecordDocumentIds` values will be used by the `LegalsRealPropApi`, `ReferencesRealPropApi` and `RemarksRealPropApi` to make separate API GET requests for records that contain the `document_id` values from the `primaryRecordDocumentIds` array and the results of those requests will be pushed to the `lotRecords`, `referenceRecords` and `remarkRecords` arrays, respectively. In order to achieve this behavior a new function called "constructUrlMultipleDocIds" will need to be created in the `LegalsRealPropApi`, `ReferencesRealPropApi` and `RemarksRealPropApi` files that will only accept an array of `document_id` values as its sole parameter, constructs a query URL using Socrata Query Language and returns a query URL to be used by each file's `fetchFromAcris` method.  It might be necessary to create a new method to replace `fetchFromAcris` to be called by  `LegalsRealPropApi`, `ReferencesRealPropApi` and `RemarksRealPropApi` such as "fetchSecondaryDataFromAcris" but I'm not sure if this is necessary and I need your advice about this.

The results contained in `lotRecords`, `referenceRecords` and `remarkRecords` will then be saved in a variable called `secondaryRecords` which, should only include records that have `document_id` values that were in the `primaryRecordDocumentIds` array. Then I want to combine `primaryRecords` and `secondaryRecords` into a variable called `records`, however, I'm not sure how `records` should be structured so I will need your help and advise on how to structure it. For background, `records` will have five types of records: "master" (contains the property `record_type` with a value of 'A'), "lot" (contains the property `record_type` with a value of 'L'), "party" (contains the property `record_type` with a value of 'P'), "references" (contains the property `record_type` with a value of 'X') and "remarks" (contains the property `record_type` with a value of 'R'). Each of these records contains the key `document_id` which can be used to group the "master", "lot", "party", "references" and "remarks" type records with each other. As a starting point, I think I want the `records` variable to be structured based on these record types and their mutual `document_id` value which could look like my example below.

Based on the aforementioned refactor plan and the code below how does my plan sound and is it viable to achieve the behavior that I mentioned above?  If the plan sounds viable then list the steps for how I should accomplish this and if some parts don't make sense then explain what they are.  Keep in mind I do not want you to provide refactored code yet and instead want you to "refine" my refactor plan so I am more likely to achieve the behavior I described above.

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
  "123456789":[
    "master":[
      {
        document_id: '123456789',
        record_type: 'A',
        crfn: '...',
        recorded_borough: '...',
        doc_type: '...',
        document_date: '...',
        document_amt: '...',
        recorded_datetime: '...',
        modified_date: '...',
        reel_yr: '...',
        reel_nbr: '...',
        reel_pg: '...',
        percent_trans: '...',
        good_through_date: '...'
      },
      {...}
    ], 
    "lot":[
      {
        document_id: '123456789',
        record_type: 'L',
        borough: '...',
        block: '...',
        lot: '...',
        easement: '...',
        partial_lot: '...',
        air_rights: '...',
        subterranean_rights: '...',
        property_type: '...',
        street_number: '...',
        street_name: '...',
        unit_address: '...',
        good_through_date: '...',
      },
      {...}
    ], 
    "party":[
      {
        document_id: '123456789',
        record_type: 'P',
        party_type: '...',
        name: '...',
        address_1: '...',
        address_2: '...',
        country: '...',
        city: '...',
        state: '...',
        zip: '...',
        good_through_date: '...',
      },
      {...}
    ], 
    "references":[
      {
        document_id: '123456789',
        record_type: 'X',
        reference_by_crfn_: '...',
        reference_by_doc_id: '...',
        reference_by_reel_year: '...',
        reference_by_reel_borough: '...',
        reference_by_reel_nbr: '...',
        reference_by_reel_page: '...',
        good_through_date: '...',
      },
      {...}
    ], 
    "remarks":[
      {
        document_id: '123456789',
        record_type: 'R',
        sequence_number:'...',
        remark_text:'...',
        good_through_date:'...',
      },
      {...}
    ]
  ]
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
            remarksDataset
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
        if (document_date_range) masterQueryParams.document_date_range = (document_date_range);
        if (document_date_start) masterQueryParams.document_date_start = (document_date_start);
        if (document_date_end) masterQueryParams.document_date_end = (document_date_end);
        
        if (recorded_borough) masterQueryParams.recorded_borough = recorded_borough;
        if (doc_type) masterQueryParams.doc_type = transformForUrl(doc_type);

        if (name) partiesQueryParams.name = transformForUrl(name);
        if (party_type) partiesQueryParams.party_type = (party_type);

        // Ensure at least one valid parameter associated with the Real Property Master dataset is provided
        if (Object.keys(masterQueryParams).length === 0) {
            return res.status(400).json({ error: "At least one query parameter for the Master Dataset is required." });
        }
        // Ensure at least one valid parameter associated with the Real Property Parties dataset is provided
        if (Object.keys(partiesQueryParams).length === 0) {
            return res.status(400).json({ error: "At least one query parameter for the Parties Dataset is required." });
        }

        // Ensure at least one dataset is selected
        if (!Object.values(primaryDatasets).some((value) => value)) {
            return res.status(400).json({ error: "At least one dataset must be selected." });
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
            partiesRecords = await PartiesRealPropApi.fetchFromAcris(partiesQueryParams);
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
            referenceRecords = await ReferencesRealPropApi.fetchFromAcris(masterQueryParams);
            if (referenceRecords.length === 0) {
                console.warn("No records found for referencesDataset");
                referenceRecords.push({ dataFound: false, dataset: "referencesDataset" });
            }
        }
        if (secondaryDatasets.remarksDataset) {
            remarkRecords = await RemarksRealPropApi.fetchFromAcris(masterQueryParams);
            if (remarkRecords.length === 0) {
                console.warn("No records found for remarksDataset");
                remarkRecords.push({ dataFound: false, dataset: "remarksDataset" });
            }
        }

        let secondaryRecords = [...lotRecords, ...referenceRecords, ...remarkRecords];

        let records = [...primaryRecords, ...secondaryRecords];

        console.log("Fetched master records:", masterRecords, "Fetched parties records:", partiesRecords);

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
          const url = `${API_ENDPOINTS.realPropertyMaster}?${new URLSearchParams(query).toString()}`;
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
            throw new NotFoundError(`No records found for query: ${JSON.stringify(query)}`);
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
          const url = `${API_ENDPOINTS.realPropertyParties}?${new URLSearchParams(query).toString()}`;
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
            throw new NotFoundError(`No records found for query: ${JSON.stringify(query)}`);
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
          const url = `${API_ENDPOINTS.realPropertyReferences}?${new URLSearchParams(query).toString()}`;
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
            throw new NotFoundError(`No records found for query: ${JSON.stringify(query)}`);
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

### Full `queryAcrisPartyName` route flow (response to prompt)

Your refactor plan is well thought out and addresses the key requirements for handling the `queryAcrisPartyName` route and its associated APIs. Below, I will critique your plan, highlight potential issues, and suggest refinements to ensure the implementation aligns with best practices and avoids undesirable behaviors.

#### Strengths of Your Plan

1. Separation of Concerns:
   - By introducing `constructMasterUrl` and `constructPartiesUrl`, you are encapsulating the logic for constructing URLs, which improves modularity and reusability.
   - Similarly, introducing `constructUrlMultipleDocIds` for secondary datasets ensures that the logic for handling multiple `document_id` values is centralized.
2. Primary and Secondary Dataset Handling:
   - Splitting the datasets into "primary" and "secondary" categories is a good approach. It ensures that the primary datasets are fetched first and their results are used to query the secondary datasets.
3. Cross-Referencing Records:
   - Filtering `primaryRecords` to include only records with matching `document_id` values is a sound approach for ensuring data consistency.
4. Structured Output:
   - The proposed structure of the `records` array is logical and groups related data by `document_id`. This makes it easier for the front end to consume the data.
5. Error Handling:
   - Your plan includes handling cases where no records are found for a dataset, which is important for robustness.

#### Potential Issues and Suggestions

1. Complexity of `records` Structure:
   - The proposed `records` structure is nested and could become difficult to manage, especially if the number of `document_id` values or record types grows. Consider whether this level of nesting is necessary or if a flatter structure (e.g., an array of objects where each object contains all related data for a `document_id`) would suffice.
   - **Suggestion**: 
     - Instead of deeply nesting the data, consider a structure like this:

```json
[
  {
    "document_id": "123456789",
    "master": [...],
    "lot": [...],
    "party": [...],
    "references": [...],
    "remarks": [...]
  },
  ...
]
```

2. Handling of `document_date` in `constructMasterUrl`:
  - The `document_date` parameter is derived from `document_date_range`, `document_date_start`, and `document_date_end`. Ensure that the logic for constructing this parameter is well-defined and accounts for edge cases (e.g., missing or invalid date values).
  - **Suggestion**:
    - Create a helper function to handle the logic for constructing `document_date` based on the provided inputs.

3. Potential Redundancy in Secondary Dataset Fetching:
  - If `constructUrlMultipleDocIds` is introduced, it might make sense to create a new method (e.g., `fetchSecondaryDataFromAcris`) to handle the fetching logic for secondary datasets. This would avoid duplicating code across `LegalsRealPropApi`, `ReferencesRealPropApi`, and `RemarksRealPropApi`.
  - **Suggestion**:
    - Introduce `fetchSecondaryDataFromAcris` in each secondary dataset API class to encapsulate the logic for fetching data using `constructUrlMultipleDocIds`.

4. Error Handling for Secondary Datasets:
   - Your plan does not specify how to handle cases where some `document_id` values return results while others do not. Ensure that partial results are handled gracefully.
   - **Suggestion**:
     - Include a mechanism to log or track `document_id` values that did not return results, so this information can be communicated to the user if necessary.

5. Performance Considerations:
   - Fetching data from multiple APIs (especially secondary datasets) could lead to performance bottlenecks if the number of `document_id` values is large.
   - **Suggestion**:
     - Use batching or pagination when querying secondary datasets to avoid overwhelming the APIs or your server.

6. Validation of Query Parameters:
   - Ensure that all query parameters are validated before constructing URLs or making API requests. This will prevent issues caused by invalid or unexpected input.
   - **Suggestion**:
     - Add a validation layer to check the format and values of query parameters before proceeding with the API calls.

7. Testing:
   - Your plan does not mention testing. Given the complexity of the refactor, thorough testing is essential to ensure correctness.
   - **Suggestion**:
     - Write unit tests for `constructMasterUrl`, `constructPartiesUrl`, and `constructUrlMultipleDocIds`.
     - Write integration tests for the `queryAcrisPartyName` route to verify the end-to-end behavior.

#### Steps to Accomplish the Refactor

1. Refactor `MasterRealPropApi` and `PartiesRealPropApi`:
  - Add `constructMasterUrl` and `constructPartiesUrl` to encapsulate the URL construction logic.
  - Update `fetchFromAcris` to use these functions.
2. Refactor `LegalsRealPropApi`, `ReferencesRealPropApi`, and `RemarksRealPropApi`:
   - Add `constructUrlMultipleDocIds` to handle multiple `document_id` values.
   - Optionally, introduce `fetchSecondaryDataFromAcris` to encapsulate the fetching logic.
3. Update `queryAcrisPartyName` Route:
   - Use `constructMasterUrl` and `constructPartiesUrl` to construct URLs for primary datasets.
   - Use `constructUrlMultipleDocIds` to construct URLs for secondary datasets.
   - Cross-reference `masterRecords` and `partiesRecords` to create `primaryRecords`.
   - Use `primaryRecordDocumentIds` to fetch data for secondary datasets.
   - Combine `primaryRecords` and `secondaryRecords` into `records`.
4. Validate Query Parameters:
   - Add validation logic to ensure that all required parameters are present and correctly formatted.
5. Optimize Performance:
   - Implement batching or pagination for secondary dataset queries if necessary.
6. Test the Implementation:
   - Write unit tests for all new functions.
   - Write integration tests for the `queryAcrisPartyName` route.

#### Summary
Your plan is viable and aligns with best practices in many areas, such as modularity, separation of concerns, and error handling. However, there are some areas that could be refined to improve maintainability, performance, and robustness:

1. Simplify the `records` structure if possible.
2. Ensure that `document_date` is constructed correctly in `constructMasterUrl`.
3. Consider introducing `fetchSecondaryDataFromAcris` for secondary datasets.
4. Add validation for query parameters.
5. Optimize performance for secondary dataset queries.
6. Write comprehensive tests to ensure correctness.

**By addressing these points, you will be better positioned to achieve the desired behavior while maintaining a clean and maintainable codebase.**

### Revised Refactor Plan (prompt 2 & edited to be prompt 3)

@workspace I need your help by critiquing my refactor plan for my `queryAcrisPartyName`, `MasterRealPropApi`, `PartiesRealPropApi`, `LegalsRealPropApi`, `RemarksRealPropApi` and `ReferencesRealPropApi` code below based on the following behavior. Once you have reviewed my plan I want you to make suggestions if my plan does not coincide with "best practices" and to explain anything I may have missed that could break my code or cause undesireable behaviors.  

As background, the front end sends a request with data in the format below which is received by the `queryAcrisPartyName` backend route. The `recorded_borough`, `doc_type`, `document_date_range`, `document_date_start` and `document_date_end` values are all associated with the Real Property Master dataset so they are passed to the `masterQueryParams` variable to be used by `MasterRealPropApi` to make an axios GET request. The `name` and `party_type` values are associated with the Real Property Parties dataset so they are passed to the `partiesQueryParams` variable to be used by `PartiesRealPropApi` to make a separate axios GET request. If `masterDataset` is equal to `true` then I want to send a HTTP GET request using `MasterRealPropApi` which takes `masterQueryParams` as its sole parameter and if `partiesDataset` is `true` then I want to send a HTTP GET request using `PartiesRealPropApi` which takes `partiesQueryParams` as its sole parameter. 

I want to add a function called `constructMasterUrl` to my `MasterRealPropApi` file and a function called `constructPartiesUrl` to my `PartiesRealPropApi` file that will construct the `url` based on the values contained in `masterQueryParams` and `partiesQueryParams`, respectively, which the `fetchFromAcris` function, from each file, will then use to make its own `axios` GET request. 

The `constructMasterUrl` will accept the following optional parameters: `document_id`, `crfn`, `recorded_borough` (corresponds to the value of `recorded_borough` from `masterQueryParams`), `doc_type` (corresponds to the value of `doc_type` from `masterQueryParams`), `document_date` (corresponds to the value of `document_date_range` , `document_date_start` and `document_date_end` from `masterQueryParams`), `document_amt`, `recorded_datetime`, `modified_date`, `reel_yr`, `reel_nbr`, `reel_pg` and `percent_trans`. The `constructPartiesUrl` will accept the following optional parameters: `document_id`, `party_type` (corresponds to the value of `party_type` from `partiesQueryParams`), `name` (corresponds to the value of `name` from `partiesQueryParams`), `address_1`, `address_2`, `country`, `city`, `state` and `zip`.

The `constructMasterUrl` and `constructPartiesUrl` should construct the `url` using Socrata Query Language (SoQL) syntax and specifically use the `$where` parameter to specify multiple conditions combined with logical operators such as `AND` and `OR` such as `$where=recorded_borough='3' AND document_id between '20250401' and '20250415' AND doc_type='DEED'`.  Additionally, the `constructMasterUrl` and `constructPartiesUrl` functions should use a function called "validateQueryParams" that contains logic to validate the query parameters and check the format and values of before proceeding with the API calls.

Initially, I wanted to create a function called "createDocumentDateSocrataSyntax" in the `MasterRealPropApi` file that accepts `document_date_range`, `document_date_start` and `document_date_end` parameters and returns a string of text representing a SoQL syntax that queries a range using the start date value: `document_date_start` and the end date value: `document_date_end` for the column `document_date`, however, I think it would be more efficient to have a utility function called "alterSearch" that generates SoQL syntax depending on whether the query parameters specify (i) a range of values associated with `document_date` (derived from the values of `document_date_range`, `document_date_start` and `document_date_end`) and any other column name such as `document_id`, `recorded_borough`, `doc_type`, (ii) an exact value associated with a column name, (iii) a list of values associated with a column name, (iv) wildcard queries (e.g. `name like 'empire%'`) and (v) Null/Not Null Queries (e.g., `document_amt is not null`).  

The results of the `MasterRealPropApi` API call should be saved to `masterRecords` and the results of the `PartiesRealPropApi` API call should be saved to `partiesRecords`. Then I want to create a function called "combineMasterPartyRecords" which combines the `masterRecords` and `partiesRecords` records into a variable called `primaryRecords` and cross references those records so that `primaryRecords` only includes records from `masterRecords` and `partiesRecords` that contain the same `document_id` value. For example, if a record in `masterRecords` has a `document_id` that is not present in `partiesRecords`, it should be excluded from `primaryRecords`. Similarly, if a record in `partiesRecords` has a `document_id` that is not present in `masterRecords`, it should be excluded from `primaryRecords`. As part of the "combineMasterPartyRecords" function I want to populate a variable called `primaryRecordDocumentIds` which is an array of unique `document_id` values derived from the `primaryRecords` results. The `primaryRecordDocumentIds` values will be used by the `LegalsRealPropApi`, `ReferencesRealPropApi` and `RemarksRealPropApi` to make separate API GET requests for records that contain the `document_id` values from the `primaryRecordDocumentIds` array and the results of those requests will be pushed to the `lotRecords`, `referenceRecords` and `remarkRecords` arrays, respectively. In order to achieve this behavior a new function called "fetchSecondaryDataFromAcris" will need to be created in the `LegalsRealPropApi`, `ReferencesRealPropApi` and `RemarksRealPropApi` files that (1) will only accept an array of `document_id` values as its sole parameter, (2) constructs a query URL using SoQL syntax with the `$where` parameter containing the `document_id` values from the array and sends the `url` and request using axios in the same way that `fetchFromAcris` does.  Alternatively it may be a good idea to create a separate utility function that constructs the `SoQL` URL based on the values in `primaryRecordDocumentIds` to be used by `LegalsRealPropApi`, `ReferencesRealPropApi` and `RemarksRealPropApi` when they make their API GET requests using the "fetchSecondaryDataFromAcris". Keep in mind if records are not received from the "fetchSecondaryDataFromAcris" function then an object should be created with a property called "search-status" with a value of "none found" such as the code snippet:

```js
if (response.data.length === 0) {
  return { searchStatus: "none found", documentIds: [...documentIds] };
}
```

The results contained in `lotRecords`, `referenceRecords` and `remarkRecords` will then be saved in a variable called `secondaryRecords` which, should only include records that have `document_id` values that were in the `primaryRecordDocumentIds` array. Then I want to combine `primaryRecords` and `secondaryRecords` into a variable called `records` with the architecture below which uses a flatter structure where each `document_id` is a key in an object, and the associated data is grouped by type.

Based on the aforementioned refactor plan and the code below how does my plan sound and is it viable to achieve the behavior that I mentioned above?  If the plan sounds viable then list the steps for how I should accomplish this and if some parts don't make sense then explain what they are.  Keep in mind I do not want you to provide refactored code yet and instead want you to "refine" my refactor plan so I am more likely to achieve the behavior I described above.  Also, I will eventually create tests for each of these functions but first I want to get the code working first.


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
            remarksDataset
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
        if (document_date_range) masterQueryParams.document_date_range = (document_date_range);
        if (document_date_start) masterQueryParams.document_date_start = (document_date_start);
        if (document_date_end) masterQueryParams.document_date_end = (document_date_end);
        
        if (recorded_borough) masterQueryParams.recorded_borough = recorded_borough;
        if (doc_type) masterQueryParams.doc_type = transformForUrl(doc_type);

        if (name) partiesQueryParams.name = transformForUrl(name);
        if (party_type) partiesQueryParams.party_type = (party_type);

        // Ensure at least one valid parameter associated with the Real Property Master dataset is provided
        if (Object.keys(masterQueryParams).length === 0) {
            return res.status(400).json({ error: "At least one query parameter for the Master Dataset is required." });
        }
        // Ensure at least one valid parameter associated with the Real Property Parties dataset is provided
        if (Object.keys(partiesQueryParams).length === 0) {
            return res.status(400).json({ error: "At least one query parameter for the Parties Dataset is required." });
        }

        // Ensure at least one dataset is selected
        if (!Object.values(primaryDatasets).some((value) => value)) {
            return res.status(400).json({ error: "At least one dataset must be selected." });
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
            partiesRecords = await PartiesRealPropApi.fetchFromAcris(partiesQueryParams);
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
            referenceRecords = await ReferencesRealPropApi.fetchFromAcris(masterQueryParams);
            if (referenceRecords.length === 0) {
                console.warn("No records found for referencesDataset");
                referenceRecords.push({ dataFound: false, dataset: "referencesDataset" });
            }
        }
        if (secondaryDatasets.remarksDataset) {
            remarkRecords = await RemarksRealPropApi.fetchFromAcris(masterQueryParams);
            if (remarkRecords.length === 0) {
                console.warn("No records found for remarksDataset");
                remarkRecords.push({ dataFound: false, dataset: "remarksDataset" });
            }
        }

        let secondaryRecords = [...lotRecords, ...referenceRecords, ...remarkRecords];

        let records = [...primaryRecords, ...secondaryRecords];

        console.log("Fetched master records:", masterRecords, "Fetched parties records:", partiesRecords);

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
          const url = `${API_ENDPOINTS.realPropertyMaster}?${new URLSearchParams(query).toString()}`;
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
            throw new NotFoundError(`No records found for query: ${JSON.stringify(query)}`);
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
          const url = `${API_ENDPOINTS.realPropertyParties}?${new URLSearchParams(query).toString()}`;
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
            throw new NotFoundError(`No records found for query: ${JSON.stringify(query)}`);
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
          const url = `${API_ENDPOINTS.realPropertyReferences}?${new URLSearchParams(query).toString()}`;
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
            throw new NotFoundError(`No records found for query: ${JSON.stringify(query)}`);
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

### Revised Refactor Plan (response 2)

Your refactor plan is well thought out and addresses many key aspects of the desired behavior. However, there are areas where improvements can be made to align with best practices, ensure maintainability, and avoid potential pitfalls. Below, I will critique your plan, highlight potential issues, and provide suggestions for refinement.

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

#### Potential Issues and Suggestions
1. Complexity of `records` Structure
- The proposed `records` structure is nested and could become difficult to manage, especially if the number of `document_id` values or record types grows.
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

#### Steps to Accomplish the Refactor
1. Refactor `MasterRealPropApi` and `PartiesRealPropApi`:
   - Add constructMasterUrl and constructPartiesUrl to encapsulate the URL construction logic.
   - Update fetchFromAcris to use these functions.

2. Create Utility Functions:
   - Implement `alterSearch` to generate SoQL syntax for different query types.
   - Implement `createDocumentDateSocrataSyntax` to handle `document_date` logic.

3. Refactor `LegalsRealPropApi`, `ReferencesRealPropApi`, and `RemarksRealPropApi`:
   - Add fetchSecondaryDataFromAcris to handle fetching data for multiple document_id values.
   - Optionally, use `alterSearch` to construct SoQL syntax for these APIs.

4. Update `queryAcrisPartyName` Route:
   - Use `constructMasterUrl` and `constructPartiesUrl` to construct URLs for primary datasets.
   - Use `fetchSecondaryDataFromAcris` to fetch data for secondary datasets.
   - Cross-reference `masterRecords` and `partiesRecords` to create `primaryRecords`.
   - Use `primaryRecordDocumentIds` to fetch data for secondary datasets.
   - Combine `primaryRecords` and `secondaryRecords` into `records`.

5. Validate Query Parameters:
   - Add validation logic to ensure that all required parameters are present and correctly formatted.

6. Optimize Performance:
   - Implement batching or pagination for secondary dataset queries if necessary.
   - Use Promise.all to parallelize API calls where possible.

7. Test the Implementation:
   - Write unit tests for all new functions.
   - Write integration tests for the queryAcrisPartyName route.

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

#### Potential Issues and Suggestions
1. Complexity of records Structure
   - The proposed records structure is nested and could become difficult to manage, especially if the number of document_id values or record types grows.
   - Suggestion: Instead of deeply nesting the data, consider a flatter structure where each document_id is a key in an object, and the associated data is grouped by type:

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
   - Your plan does not specify how to handle cases where some document_id values return results while others do not.
   - Suggestion: Include a mechanism to log or track document_id values that did not return results. For example:

```js
if (response.data.length === 0) {
  return { searchStatus: "none found", documentIds: [...documentIds] };
}
```

6. Performance Considerations
   - Fetching data from multiple APIs (especially secondary datasets) could lead to performance bottlenecks if the number of `document_id` values is large.
   - Suggestion:
     - Use batching or pagination when querying secondary datasets to avoid overwhelming the APIs or your server.
     - Consider parallelizing API calls using Promise.all for better performance.

7. Testing
- Your plan does not mention testing. Given the complexity of the refactor, thorough testing is essential to ensure correctness.
- Suggestion:
  - Write unit tests for `constructMasterUrl`, `constructPartiesUrl`, and `alterSearch`.
  - Write integration tests for the `queryAcrisPartyName` route to verify the end-to-end behavior.

#### Steps to Accomplish the Refactor
1. Refactor `MasterRealPropApi` and `PartiesRealPropApi`:
   - Add `constructMasterUrl` and `constructPartiesUrl` to encapsulate the URL construction logic.
   - Update `fetchFromAcris` to use these functions.

2. Create Utility Functions:
   - Implement `alterSearch` to generate SoQL syntax for different query types.
   - Implement `createDocumentDateSocrataSyntax` to handle `document_date` logic.

3. Refactor `LegalsRealPropApi`, `ReferencesRealPropApi`, and `RemarksRealPropApi`:
   - Add `fetchSecondaryDataFromAcris` to handle fetching data for multiple `document_id` values.
   - Optionally, use `alterSearch` to construct SoQL syntax for these APIs.

4. Update `queryAcrisPartyName` Route:
   - Use `constructMasterUrl` and `constructPartiesUrl` to construct URLs for primary datasets.
   - Use `fetchSecondaryDataFromAcris` to fetch data for secondary datasets.
   - Cross-reference `masterRecords` and `partiesRecords` to create `primaryRecords`.
   - Use `primaryRecordDocumentIds` to fetch data for secondary datasets.
   - Combine `primaryRecords` and `secondaryRecords` into records.

5. Validate Query Parameters:
   - Add validation logic to ensure that all required parameters are present and correctly formatted.

6. Optimize Performance:
   - Implement batching or pagination for secondary dataset queries if necessary.
   - Use `Promise.all` to parallelize API calls where possible.

7. Test the Implementation:
   - Write unit tests for all new functions.
   - Write integration tests for the `queryAcrisPartyName` route.