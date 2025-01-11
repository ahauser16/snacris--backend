# Javascript Models Notes

The models folder contains files from the last Springboard project such as `company.js`, `job.js` and `user.js`, which define the structure and methods for interacting with the database. These models encapsulate the logic for creating, reading, updating, and deleting (CRUD) records in the database. For example, the `Job` model includes methods for creating a job, finding jobs with optional filters, retrieving a job by ID, updating job data, and deleting a job.  I chose to keep these files because I'm using the same authentication system as the previous project and as a reference to design my own project.

## Relevant CRUD Operations
1. Create:
- **Insert a new record**: Add a new record to the database.

2. Read:
- **Find all records**: Retrieve all records from the database.
- **Find a single record by ID**: Retrieve a specific record by its unique identifier.
- **Search records**: Retrieve records based on specific search criteria.

3. Update:
- **Update a record by ID**: Modify an existing record identified by its unique identifier.

4. Delete:
- **Delete a record by ID**: Remove a specific record from the database by its unique identifier.

## Folder Structure

Within the `models` folder is the `acris` folder which contains all the models associated with the 15 ACRIS datasets divided into three sub-folders: `real-property`, `personal-property` and `code-maps` which contain the files listed below. 

`real-property` models
- `MasterRealPropModel.js`
- `LegalsRealPropModel.js`
- `PartiesRealPropModel.js`
- `ReferencesRealPropModel.js`
- `RemarksRealPropModel.js`

`personal-property` models
- `MasterPersPropModel.js`
- `LegalsPersPropModel.js`
- `PartiesPersPropModel.js`
- `ReferencesPersPropModel.js`
- `RemarksPersPropModel.js`

`code-maps` models
- `CountriesCodeMapModel.js`
- `DocTypesCodeMapModel.js`
- `PropTypesCodeMapModel.js`
- `StatesCodeMapModel.js`
- `UccTypesCodeMapModel.js`

All the data from the `code-map` datasets is already seeded in the `SNACRIS` database so the `code-map` models will contain CRUD methods associated with updating the seeded data that will not be accessible by users or admins but rather functions synced to the monthly updates to the `code-map` datasets reachable by API endpoints.

The `real-property` and `personal-property` models in **SNACRIS** contain CRUD methods for interacting with the database using ACRIS data received from the API endpoints hosted by NYC Open Data and powered by Socrata (see `Backend/api/` folder for more information on the ACRIS API endpoints). The integrity of ACRIS data is maintained by restricting users and admins from modifying these records directly. Therefore, any `update` methods should be used programmatically rather than through routes.

For example, a user can make a GET request to the Real Property Master endpoint via the `api` route, view the data, and then decide to save it to the database. This is a crucial use case for **SNACRIS** users because once the data is saved, users gain access to features not available on the ACRIS website, such as notifications if the record changes. **SNACRIS** will make daily GET requests to check for changes in saved records, notify users of any changes, and update the database accordingly.

Users can save ACRIS data to the database but can only view the data they saved. Admins, however, can view any user's data and save data viewable by all users. For example, the database is seeded with ACRIS data associated with the Empire State Building, which is useful for testing and providing users with an example experience upon first login.

### `create` methods 

#### `saveRecord` and `saveRecordByUser`

Given this structure, there must be a `create` method for programmatic use (or by an admin-protected route) and a `create` method exclusive to individual users. The `saveRecord` method inserts a record into the `acris_real_property_master` table, while `saveRecordByUser` invokes the `saveRecord` method, inserts a record into the `acris_real_property_master` table, and creates a reference in the `user_saved_real_property_master` join table. Note Well: the `saveRecord` method is only invoked programmatically or by an admin-protected route.

In the context the application, it makes sense to associate the `username` with the `document_id` in the `user_saved_real_property_master` join table. This is because the `document_id` is a unique identifier within the ACRIS dataset, and it is the key piece of information that identifies a specific record.  However, if two users save the same record, there will be multiple entries with the same `document_id` in the `acris_real_property_master` table. To handle this scenario the `user_saved_real_property_master` join table must accommodate multiple users saving the same `document_id`.

### `read` methods

#### `findAllRecords ` and `findAllRecordsByUser`

The `findAllRecords` and `findAllRecordsByUser` methods are designed to retrieve records from the `acris_real_property_master` table based on the user's role and context. The `findAllRecordsByUser` method fetches all records associated with a specific user by joining the `acris_real_property_master` table with the `user_saved_real_property_master` join table, ensuring that only records saved by the logged-in user are retrieved. This method is invoked by a protected route, allowing only authenticated users to access their own records. On the other hand, the `findAllRecords` method can retrieve all records in the database or all records associated with a specific user if a username is provided. This method is intended for use by an admin-protected route or programmatically, enabling admins to view all records or investigate records saved by a particular user. This structure ensures that users can only access their own data while admins have the flexibility to manage and review all records in the database.

#### `findRecordByIdAndUser` and `findRecordById`

The `findRecordByIdAndUser` and `findRecordById` methods are designed to retrieve specific records from the `acris_real_property_master` table based on the user's role and context. The `findRecordByIdAndUser` method fetches a single record associated with a specific user by joining the `acris_real_property_master` table with the `user_saved_real_property_master` join table, ensuring that only the record saved by the logged-in user is retrieved. This method is invoked by a protected route, allowing only authenticated users to access their own records based on the provided `document_id`. On the other hand, the `findRecordById` method can retrieve a specific record from the database based on the provided `document_id`, regardless of the user who saved it. This method can optionally retrieve a record associated with a specific user if a username is provided. It is intended for use by an admin-protected route or programmatically, enabling admins to view any record in the database or investigate records saved by a particular user. This structure ensures that users can only access their own data while admins have the flexibility to manage and review all records in the database.

#### `searchRecords` and `searchRecordsByUser`

### `update` methods

#### `update` (programmatic use only)

### `delete` methods

#### `deleteRecord` and `deleteRecordByUser`


## ToDos

- [x] In the `snacris--backend/models/acris` folder create three subfolders: `real-property`, `personal-property` and `code-maps`.

- [x] In the `snacris--backend/models/acris` folder rename the files `realPropertyMasterModel.js`, `realPropertyLegals.js`, `realPropertyParties.js`, `realPropertyReferences.js` and `realPropertyRemarks.js` to `MasterRealPropModel.js`, `LegalsRealPropModel.js`, `PartiesRealPropModel.js`, `ReferencesRealPropModel.js` and `RemarksRealPropModel.js`.  Then move the renamed files into the `snacris--backend/models/acris/real-property` subfolder.

- NB--> The `master` dataset (and subsequently the `master.js` model) for the Real Property and Personal Property datasets is structured in that the `document_id` is a unique identifier.  If you query the Real Property Master API (or Personal Property Master API) for the `document_id` value of "2013100700087001" you will [should!] receive a single record back.  However, this is not the case for the other four datasets and so I had to refactor each of the `legals`, `parties`, `remarks` and `references` models based on this discovery.

- [x] In the `snacris--backend/models/acris/personal-property` subfolder create the following five files: `MasterPersPropModel.js`, `LegalsPersPropModel.js`, `PartiesPersPropModel.js`, `ReferencesPersPropModel.js` and `RemarksPersPropModel.js`.  

- [x] In the `snacris--backend/models/acris/code-maps` subfolder create the following five files: `CountriesCodeMapModel.js`, `DocTypesCodeMapModel.js`, `PropTypesCodeMapModel.js`, `StatesCodeMapModel.js` and `UccTypesCodeMapModel.js`.
- [ ] Spend time designing these functions.


