# JSON schema related notes

## ToDos

- [x] Create `json` schema folder and file system located here: `snaris--backend/schemas/acris/` with three subfolders: `code-maps`, `personal-property` and `real-property`.  
- [x] `code-maps` will have a subfolder for the following datasets: `countries`, `states`, `ucc`, `document-types` and `property-types`.  
- [x] `personal-property` will have a subfolder for the following datasets: `master`, `legals`, `parties`, `references` and `remarks`.  
- [x] `real-property` will have a subfolder for the following datasets: `master`, `legals`, `parties`, `references` and `remarks`.  
- [ ] All fifteen subfolders will have `json` files that will validate the following database CRUD operations: `search`, `update`, `new` and `delete`.  Each `json` file will be named: "shortform dataset name" + "dataset category" + "the CRUD operation" (e.g. `masterRealPropDelete.json`, `masterRealPropNew.json`, `masterRealPropSearch.json`, `masterRealPropUpdate.json`, etc).

- NB --> The ACRIS API response objects typically don't have the value `null` assigned to any fields so I may want to avoid saving data to the database with `null` values if I want to treat my database as a copy of the ACRIS dataset.  This will require going back to the `seed` files and reviewing that data.

### Real Property Schemas
The following files have been created and populated with the `json` validation syntax:
#### Master
- [x] `masterRealPropNew.json`
- [x] `masterRealPropSearch.json`
- [x] `masterRealPropUpdate.json`
- [x] `masterRealPropDelete.json`
#### Legals
- [ ] `legalsRealPropNew.json`
- [ ] `legalsRealPropSearch.json`
- [ ] `legalsRealPropUpdate.json`
- [ ] `legalsRealPropDelete.json`
#### Parties
- [ ] `partiesRealPropNew.json`
- [ ] `partiesRealPropSearch.json`
- [ ] `partiesRealPropUpdate.json`
- [ ] `partiesRealPropDelete.json`
#### Remarks
- [ ] `remarksRealPropNew.json`
- [ ] `remarksRealPropSearch.json`
- [ ] `remarksRealPropUpdate.json`
- [ ] `remarksRealPropDelete.json`
#### References
- [ ] `referencesRealPropNew.json`
- [ ] `referencesRealPropSearch.json`
- [ ] `referencesRealPropUpdate.json`
- [ ] `referencesRealPropDelete.json`

### Personal Property Schemas

#### Master
- [ ] `masterRealPropNew.json`
- [ ] `masterRealPropSearch.json`
- [ ] `masterRealPropUpdate.json`
- [ ] `masterRealPropDelete.json`
#### Legals
- [ ] `legalsRealPropNew.json`
- [ ] `legalsRealPropSearch.json`
- [ ] `legalsRealPropUpdate.json`
- [ ] `legalsRealPropDelete.json`
#### Parties
- [ ] `partiesRealPropNew.json`
- [ ] `partiesRealPropSearch.json`
- [ ] `partiesRealPropUpdate.json`
- [ ] `partiesRealPropDelete.json`
#### Remarks
- [ ] `remarksRealPropNew.json`
- [ ] `remarksRealPropSearch.json`
- [ ] `remarksRealPropUpdate.json`
- [ ] `remarksRealPropDelete.json`
#### References
- [ ] `referencesRealPropNew.json`
- [ ] `referencesRealPropSearch.json`
- [ ] `referencesRealPropUpdate.json`
- [ ] `referencesRealPropDelete.json`

### Code Map Schemas

#### Countries
- [ ] `countriesCodeMapNew.json`
- [ ] `countriesCodeMapSearch.json`
- [ ] `countriesCodeMapUpdate.json`
- [ ] `countriesCodeMapDelete.json`
#### States
- [ ] `statesCodeMapNew.json`
- [ ] `statesCodeMapSearch.json`
- [ ] `statesCodeMapUpdate.json`
- [ ] `statesCodeMapDelete.json`
#### Ucc Collateral Types
- [ ] `uccTypesCodeMapNew.json`
- [ ] `uccTypesCodeMapSearch.json`
- [ ] `uccTypesCodeMapUpdate.json`
- [ ] `uccTypesCodeMapDelete.json`
#### Document Types
- [ ] `docTypesCodeMapNew.json`
- [ ] `docTypesCodeMapSearch.json`
- [ ] `docTypesCodeMapUpdate.json`
- [ ] `docTypesCodeMapDelete.json`
#### Property Types
- [ ] `propTypesCodeMapNew.json`
- [ ] `propTypesCodeMapSearch.json`
- [ ] `propTypesCodeMapUpdate.json`
- [ ] `propTypesCodeMapDelete.json`

### Middleware

Since the code map datasets are seeded in the database it is possible to create a middleware function that validates certain fields of the Real Property and Personal Property datasets.  For example, the Real Property Master dataset has a `doc_type` field which should only accept values that correspond to the Document Types Code Map field `doc__type` (the double `_` is intentional).  This has not been implemented into the codebase but I created the `validateDocType` function in the middleware folder.  This may not be worth implementing since the `code map` datasets are static and so it might add an unnecessary strain on the database to validate the schema for every CRUD operation.  However, it would be a useful learning experience so I may try implementing the `validateDocType` function and then hard-code the other Code Map dataset values into the `json` files.

Furthermore, it was recommended to me that the schema validation logic for each route could be extracted into its own middleware function `validateSchema`, however, I am not ready to implement this yet so I created the `validateSchema` function in the middleware folder.

- [x] Create a new file called `validateSchema.js` in the `middleware` folder.
- [ ] create tests for `validateSchema` function
- [x] Create a new file called `validateDocType.js` in the `middleware` folder.
- [ ] create tests for `validateDocType` function

