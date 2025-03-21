# Route related notes

## Context

**Best Practices**
1. Use URL Parameters for Identifiers:
- URL parameters are typically used for resource identifiers. This makes the URL more descriptive and aligns with RESTful principles.
- Example: `GET /records/:document_id` to fetch a specific record by its `document_id`.

2. Use Request Body for Data:
- The request body is used to send data to the server, especially for `POST`, `PUT`, and `PATCH` requests.
- Example: `POST /records` with a JSON body containing the record data to create a new record.

**GET Requests and Request Body**
- **GET Requests**: According to the HTTP specification, GET requests should not have a body. The parameters for GET requests should be included in the URL, either as path parameters or query parameters.
- **Path Parameters**: Use path parameters for mandatory identifiers.
- **Query Parameters**: Use query parameters for optional filters or search criteria.

## ToDos:

- [x] Update the route folder and file names and their contents located here: `snacris--backend/routes/db/acris/` with three two subfolders: `db` and `api` and within each should contain a subfolder `acris`.  
- [x] Within each `acris` subfolder there should be three subfolders named `code-maps`, `personal-property` and `real-property`.  

### ACRIS API related routes

- [ ] Refactor the Real Property and Personal Property API files to allow the user to search by more robust search criteria and not just by the `document_id`.
- [ ] Create a module that takes the search criteria and search modifiers used by the user and returns `Socrata Query Language` syntax that is used to make the GET request.

- [x] `api/acris/code-maps` will have a `js` file for the following datasets: `countriesCodeMapApiRoutes`, `statesCodeMapApiRoutes`, `uccTypesCodeMapApiRoutes`, `docTypesCodeMapApiRoutes` and `propTypesCodeMapApiRoutes`.  

- NB --> These code-map api routes won't be made by the user on the front end.  Instead these datasets are rather static and have not changed in years so they were downloaded and seeded into the database. The tests should include the use case where the full dataset is downloaded, compared to the values in the database.  If an update has been made to a dataset then the corresponding sql table should be updated to reflect the update.
- [ ] Create tests for `countriesCodeMapApiRoutes`
- [ ] Create tests for `statesCodeMapApiRoutes`
- [ ] Create tests for `uccTypesCodeMapApiRoutes`
- [ ] Create tests for `docTypesCodeMapApiRoutes`
- [ ] Create tests for `propTypesCodeMapApiRoutes`
  
- [x] `api/acris/personal-property` will have a `js` file for the following datasets: `masterPersPropApiRoutes`, `legalsPersPropApiRoutes`, `partiesPersPropApiRoutes`, `referencesPersPropApiRoutes` and `remarksPersPropApiRoutes`.
- [ ] Create tests for `masterPersPropApiRoutes`
- [ ] Create tests for `legalsPersPropApiRoutes`
- [ ] Create tests for `partiesPersPropApiRoutes`
- [ ] Create tests for `referencesPersPropApiRoutes`
- [ ] Create tests for `remarksPersPropApiRoutes`

- [x] `api/acris/real-property` will have a `js` file for the following datasets: `masterRealPropApiRoutes`, `legalsRealPropApiRoutes`, `partiesRealPropApiRoutes`, `referencesRealPropApiRoutes` and `remarksRealPropApiRoutes`.  
- [ ] Create tests for `masterRealPropApiRoutes`
- [ ] Create tests for `legalsRealPropApiRoutes`
- [ ] Create tests for `partiesRealPropApiRoutes`
- [ ] Create tests for `referencesRealPropApiRoutes`
- [ ] Create tests for `remarksRealPropApiRoutes`

### database related routes

- [x] `db/acris/code-maps` will have a `js` file for the following datasets: `countriesCodeMapDbRoutes`, `statesCodeMapDbRoutes`, `uccCodeMapDbRoutes`, `docTypesCodeMapDbRoutes` and `propTypesCodeMapDbRoutes`.  
- [ ] Design `countriesCodeMapDbRoutes.js`
- [ ] Design `statesCodeMapDbRoutes.js`
- [ ] Design `uccCodeMapDbRoutes.js`
- [ ] Design `docTypesCodeMapDbRoutes.js`
- [ ] Design `propTypesCodeMapDbRoutes.js`

- [x] `db/acris/personal-property` will have a `js` file for the following datasets: `masterPersPropDbRoutes`, `legalsPersPropDbRoutes`, `partiesPersPropDbRoutes`, `referencesPersPropDbRoutes` and `remarksPersPropDbRoutes`.  
- [ ] Design `masterPersPropDbRoutes.js`
- [ ] Design `legalsPersPropDbRoutes.js`
- [ ] Design `partiesPersPropDbRoutes.js`
- [ ] Design `referencesPersPropDbRoutes.js`
- [ ] Design `remarksPersPropDbRoutes.js`

- [x] `db/acris/real-property` will have a `js` file for the following datasets: `masterRealPropDbRoutes`, `legalsRealPropDbRoutes`, `partiesRealPropDbRoutes`, `referencesRealPropDbRoutes` and `remarksRealPropDbRoutes`.  
- [x] Design `masterRealPropDbRoutes.js` by analyzing the routes to ensure they meet best practices.  This route file will serve as a template for the `masterPersPropDbRoutes.js` file, however, each other dataset in the Real Property category have different data flow and structure so don't plan on using this as a template for the others.  NB the checklist for the routes below means they were successfully tested using Postman.
  - [x] `saveDataByAdmin`
  - [x] `saveDataByUser`
  - [x] `getAllRecordsByUser`
  - [x] `getRecordsByAdmin`
  - [x] `getRecordFromUserByDocumentId/:document_id`
  - [ ] `fetchRecordByAdmin/:document_id`
  - [x] `searchSavedUserRecords`
  - [ ] `updateRecordByAdmin/:document_id`
  - [x] `deleteRecordByUser/:document_id`
  - [ ] `deleteRecordByAdmin/:document_id`
- [ ] Design `legalsRealPropDbRoutes.js`
- [ ] Design `partiesRealPropDbRoutes.js`
- [ ] Design `referencesRealPropDbRoutes.js`
- [ ] Design `remarksRealPropDbRoutes.js`

**index.js & app.js**

- [x]  update the `index.js` file within the `routes` folder to use the updated file names listed above as well as the import names in `app.js`