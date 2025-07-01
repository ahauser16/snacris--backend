# Real Property APIs

## Purpose and Usage

These routes were used during development with Postman for API exploration and learning purposes and are NOT being used in the deployed application. However, the methods contained in the `LegalsRealPropApi`, `MasterRealPropApi`, `PartiesRealPropApi`, `ReferencesRealPropApi` and `RemarksRealPropApi` modules are used in the deployed application.

## Development Context

The Real Property API routes were created to:

- Facilitate direct API testing and exploration using Postman during development
- Learn and understand the structure of ACRIS Real Property datasets
- Test API connectivity and response formats during development
- Develop and test data retrieval patterns for cross-referencing with other datasets

## Available Routes

### Real Property Legals

#### Fetch Records

- **Endpoint**: `/api/acris/real-property/legals/fetchRecord`
- **Method**: GET
- **Purpose**: Fetch real property legal records from ACRIS API
- **Note**: Development/testing route only, not used in production
- **Use Case**: Retrieve detailed legal information for real property transactions
- **Returns**: Real property legal records with document IDs, property details, addresses, and legal descriptions

#### Fetch Record Count

- **Endpoint**: `/api/acris/real-property/legals/fetchRecordCount`
- **Method**: GET
- **Purpose**: Get count of matching real property legal records
- **Note**: Development/testing route only, not used in production
- **Use Case**: Determine the number of records that match specific search criteria before fetching full data
- **Returns**: Count of matching records

#### Fetch Document IDs

- **Endpoint**: `/api/acris/real-property/legals/fetchDocIds`
- **Method**: GET
- **Purpose**: Get document IDs from Real Property Legals dataset
- **Note**: Development/testing route only, not used in production
- **Use Case**: Retrieve document IDs for cross-referencing with other ACRIS datasets
- **Returns**: Array of document IDs that match the query criteria

#### Fetch Cross-Referenced Document IDs

- **Endpoint**: `/api/acris/real-property/legals/fetchDocIdsCrossRefPartyDocIds`
- **Method**: GET
- **Purpose**: Get document IDs from Real Property Legals dataset cross-referenced with Parties dataset
- **Note**: Development/testing route only, not used in production
- **Use Case**: Find legal records that are associated with specific parties or entities
- **Parameters**: Requires `partiesDocIdsCrossRefMaster` as JSON array in query
- **Returns**: Array of document IDs that match both datasets

#### Fetch Records By Document IDs

- **Endpoint**: `/api/acris/real-property/legals/fetchAcrisRecordsByDocumentIds`
- **Method**: GET
- **Purpose**: Fetch real property legal records by specific document IDs
- **Note**: Development/testing route only, not used in production
- **Use Case**: Retrieve detailed information for specific documents identified in previous queries
- **Parameters**: Requires `documentIds` as comma-separated string or JSON array
- **Returns**: Real property legal records matching the provided document IDs

### Real Property Master

#### Fetch Records

- **Endpoint**: `/api/acris/real-property/master/fetchRecord`
- **Method**: GET
- **Purpose**: Fetch real property master records from ACRIS API
- **Note**: Development/testing route only, not used in production
- **Use Case**: Retrieve master transaction information for real property documents
- **Returns**: Real property master records with document IDs, CRFN, document type, amounts, dates, and other transaction details

#### Fetch Record Count

- **Endpoint**: `/api/acris/real-property/master/fetchRecordCount`
- **Method**: GET
- **Purpose**: Get count of matching real property master records
- **Note**: Development/testing route only, not used in production
- **Use Case**: Determine the number of records that match specific search criteria before fetching full data
- **Returns**: Count of matching records

#### Fetch Document IDs

- **Endpoint**: `/api/acris/real-property/master/fetchDocIds`
- **Method**: GET
- **Purpose**: Get document IDs from Real Property Master dataset
- **Note**: Development/testing route only, not used in production
- **Use Case**: Retrieve document IDs for cross-referencing with other ACRIS datasets
- **Returns**: Array of document IDs that match the query criteria

#### Fetch Records By Document IDs

- **Endpoint**: `/api/acris/real-property/master/fetchAcrisRecordsByDocumentIds`
- **Method**: GET
- **Purpose**: Fetch real property master records by specific document IDs
- **Note**: Development/testing route only, not used in production
- **Use Case**: Retrieve detailed information for specific documents identified in previous queries
- **Parameters**: Requires `documentIds` as comma-separated string or JSON array
- **Returns**: Real property master records matching the provided document IDs

### Real Property References

#### Fetch Records

- **Endpoint**: `/api/acris/real-property/references/fetchRecord`
- **Method**: GET
- **Purpose**: Fetch real property reference records from ACRIS API
- **Note**: Development/testing route only, not used in production
- **Use Case**: Retrieve references between documents for real property transactions
- **Returns**: Real property reference records with document IDs, cross-reference information, and related document details

#### Fetch Record Count

- **Endpoint**: `/api/acris/real-property/references/fetchRecordCount`
- **Method**: GET
- **Purpose**: Get count of matching real property reference records
- **Note**: Development/testing route only, not used in production
- **Use Case**: Determine the number of reference records that match specific search criteria before fetching full data
- **Returns**: Count of matching reference records

#### Fetch Document IDs

- **Endpoint**: `/api/acris/real-property/references/fetchDocIds`
- **Method**: GET
- **Purpose**: Get document IDs from Real Property References dataset
- **Note**: Development/testing route only, not used in production
- **Use Case**: Retrieve document IDs for cross-referencing with other ACRIS datasets
- **Returns**: Array of document IDs that match the query criteria

#### Fetch Records By Document IDs

- **Endpoint**: `/api/acris/real-property/references/fetchAcrisRecordsByDocumentIds`
- **Method**: GET
- **Purpose**: Fetch real property reference records by specific document IDs
- **Note**: Development/testing route only, not used in production
- **Use Case**: Retrieve reference information for specific documents identified in previous queries
- **Parameters**: Requires `documentIds` as comma-separated string or JSON array
- **Returns**: Real property reference records matching the provided document IDs

### Real Property Parties

#### Fetch Records

- **Endpoint**: `/api/acris/real-property/parties/fetchRecord`
- **Method**: GET
- **Purpose**: Fetch real property party records from ACRIS API
- **Note**: Development/testing route only, not used in production
- **Use Case**: Retrieve information about parties involved in real property transactions
- **Returns**: Real property party records with document IDs, party types, names, addresses, and contact information

#### Fetch Document IDs Cross-Referenced with Master Document IDs

- **Endpoint**: `/api/acris/real-property/parties/fetchDocIdsCrossRefMasterDocIds`
- **Method**: GET
- **Purpose**: Get document IDs from Real Property Parties dataset cross-referenced with Master dataset
- **Note**: Development/testing route only, not used in production
- **Use Case**: Find party records that are associated with specific master document records
- **Parameters**: Requires `masterRecordsDocumentIds` as JSON array in query
- **Returns**: Array of document IDs that match both datasets

#### Fetch Record Count

- **Endpoint**: `/api/acris/real-property/parties/fetchRecordCount`
- **Method**: GET
- **Purpose**: Get count of matching real property party records
- **Note**: Development/testing route only, not used in production
- **Use Case**: Determine the number of party records that match specific search criteria before fetching full data
- **Returns**: Count of matching party records

#### Fetch Document IDs

- **Endpoint**: `/api/acris/real-property/parties/fetchDocIds`
- **Method**: GET
- **Purpose**: Get document IDs from Real Property Parties dataset
- **Note**: Development/testing route only, not used in production
- **Use Case**: Retrieve document IDs for cross-referencing with other ACRIS datasets
- **Returns**: Array of document IDs that match the query criteria

#### Fetch Records By Document IDs

- **Endpoint**: `/api/acris/real-property/parties/fetchAcrisRecordsByDocumentIds`
- **Method**: GET
- **Purpose**: Fetch real property party records by specific document IDs
- **Note**: Development/testing route only, not used in production
- **Use Case**: Retrieve party information for specific documents identified in previous queries
- **Parameters**: Requires `documentIds` as comma-separated string or JSON array
- **Returns**: Real property party records matching the provided document IDs

### Real Property Remarks

#### Fetch Records

- **Endpoint**: `/api/acris/real-property/remarks/fetchRecord`
- **Method**: GET
- **Purpose**: Fetch real property remark records from ACRIS API
- **Note**: Development/testing route only, not used in production
- **Use Case**: Retrieve remark text and additional information for real property documents
- **Returns**: Real property remark records with document IDs, sequence numbers, and remark text

#### Fetch Record Count

- **Endpoint**: `/api/acris/real-property/remarks/fetchRecordCount`
- **Method**: GET
- **Purpose**: Get count of matching real property remark records
- **Note**: Development/testing route only, not used in production
- **Use Case**: Determine the number of remark records that match specific search criteria before fetching full data
- **Returns**: Count of matching remark records

#### Fetch Document IDs

- **Endpoint**: `/api/acris/real-property/remarks/fetchDocIds`
- **Method**: GET
- **Purpose**: Get document IDs from Real Property Remarks dataset
- **Note**: Development/testing route only, not used in production
- **Use Case**: Retrieve document IDs for cross-referencing with other ACRIS datasets
- **Returns**: Array of document IDs that match the query criteria

#### Fetch Records By Document IDs

- **Endpoint**: `/api/acris/real-property/remarks/fetchAcrisRecordsByDocumentIds`
- **Method**: GET
- **Purpose**: Fetch real property remark records by specific document IDs
- **Note**: Development/testing route only, not used in production
- **Use Case**: Retrieve remark information for specific documents identified in previous queries
- **Parameters**: Requires `documentIds` as comma-separated string or JSON array
- **Returns**: Real property remark records matching the provided document IDs

## Technical Details

- All routes support query parameters for filtering and pagination
- Error handling includes proper HTTP status codes and descriptive messages
- JSON parsing is handled gracefully for complex query parameters
- Cross-referencing capabilities allow for sophisticated data analysis
- These routes were used during development with Postman but are NOT used in the deployed application
- The underlying API methods from the `LegalsRealPropApi`, `MasterRealPropApi`, `PartiesRealPropApi`, `ReferencesRealPropApi` and `RemarksRealPropApi` modules ARE used in the deployed application

## Important Notes

1. **Development Only**: These routes were only used during development and are NOT used in the deployed application
2. **API Modules In Production**: The methods contained in the `LegalsRealPropApi`, `MasterRealPropApi`, `PartiesRealPropApi`, `ReferencesRealPropApi` and `RemarksRealPropApi` modules ARE used in the deployed application
3. **Postman Testing**: Used during development for API exploration and learning purposes
4. **Cross-Referencing**: Supports complex queries across multiple ACRIS datasets
