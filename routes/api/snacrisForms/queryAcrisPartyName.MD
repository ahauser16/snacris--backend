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
     - `name` and `party_type` are *only* associated with the **Real Property Parties dataset** so we *must* send this data to the Real Property Parties API using `PartiesRealPropApi`. 
     - `document_date_range`, `document_date_start`, `document_date_end`, `recorded_borough`, `doc_type` and `doc_class` are *only* associated with the **Real Property Master dataset** so we *must* send this data to the Real Property Master API using `MasterRealPropApi`.
     - now that we know we need to send an API GET request using the data above using the `PartiesRealPropApi` and `MasterRealPropApi` modules we *may* want to cross reference the response with the other three datasets depending on the user's preference which is why we requested this data from the user using the boolean values: `masterDataset`, `lotDataset`, `partiesDataset`, `referencesDataset` and `remarksDataset`. 
     - the frontend has the Real Property Master and Real Property Parties checkboxes pre-checked because `name` and `doc_type` and other search terms are exclusive to those two datasets but the user may want the crossreferenced `lot`, `references` and `remarks` data as well.
       - TODO: you should disable these two checkboxes so they stay in the "checked state" to convey that the Search By Party Name form is associated with these two datasets
2. sort by data type 
   - should the data be used as the "search term" or should it instruct the `queryAcrisPartyName` route on *how* to use that search term?
     - `document_date_range` represents the *type* of date range chosen by the user and not the actual date range values (e.g. 'to-current-date-default', 'last-7-days', 'custom-date-range', etc.)
     - `document_date_start` and `document_date_end` represent the actual `document_date` start and end dates (e.g. '2025-04-01' & '2025-04-08' when `document_date_range` is set to 'to-current-date-default', '' & '' when `document_date_range` is set to 'last-7-days', '2025-04-01' & '2025-04-30' when `document_date_range` is set to 'custom-date-range').

## To Dos

You need to figure out the process for (1) normalizing and sorting the incoming data, (2) making the *necessary* API calls, (3) making the *supplemental* API calls, (4) cross referencing the results from the *necessary* and *supplemental* API calls, (5) normalizing and sorting the response data and (6) sending it back to the front end.