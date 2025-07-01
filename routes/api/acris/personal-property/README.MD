# Personal Property APIs

## Purpose and Usage

These routes were used during development with Postman for API exploration and learning purposes and are NOT being used in the deployed application. However, the methods contained in the `LegalsPersPropApi`, `MasterPersPropApi`, `PartiesPersPropApi`, `ReferencesPersPropApi` and `RemarksPersPropApi` modules are used in the deployed application.

## Development Context

The Personal Property API routes were created to:

- Facilitate direct API testing and exploration using Postman during development
- Learn and understand the structure of ACRIS Personal Property datasets
- Test API connectivity and response formats during development
- Enable cross-referencing of Personal Property data with other ACRIS datasets

## Available Routes

### Personal Property Legals

#### Fetch Records

- **Endpoint**: `/api/acris/personal-property/legals/fetchRecord`
- **Method**: GET
- **Purpose**: Fetch personal property legal records from ACRIS API
- **Note**: Development/testing route only, not used in production
- **Use Case**: Retrieve detailed legal information for personal property transactions
- **Returns**: Personal property legal records with document IDs, property details, addresses, and legal descriptions

#### Fetch Record Count

- **Endpoint**: `/api/acris/personal-property/legals/fetchRecordCount`
- **Method**: GET
- **Purpose**: Get count of matching personal property legal records
- **Note**: Development/testing route only, not used in production
- **Use Case**: Determine the number of records that match specific search criteria before fetching full data
- **Returns**: Count of matching records

#### Fetch Cross-Referenced Document IDs

- **Endpoint**: `/api/acris/personal-property/legals/fetchDocIdsCrossRefPartyDocIds`
- **Method**: GET
- **Purpose**: Get document IDs from Personal Property Legals dataset cross-referenced with Parties dataset
- **Note**: Development/testing route only, not used in production
- **Use Case**: Find legal records that are associated with specific parties or entities
- **Parameters**: Requires `partiesDocIdsCrossRefMaster` as JSON array in query
- **Returns**: Array of document IDs that match both datasets

### Personal Property Master

#### Fetch Records

- **Endpoint**: `/api/acris/personal-property/master/fetchRecord`
- **Method**: GET
- **Purpose**: Fetch personal property master records from ACRIS API
- **Note**: Development/testing route only, not used in production
- **Use Case**: Retrieve comprehensive master data for personal property transactions including document details, recording information, and financial data
- **Returns**: Master records with document IDs, recording details, document amounts, UCC collateral information, and administrative data

#### Fetch Record Count

- **Endpoint**: `/api/acris/personal-property/master/fetchRecordCount`
- **Method**: GET
- **Purpose**: Get count of matching personal property master records
- **Note**: Development/testing route only, not used in production
- **Use Case**: Determine the number of master records that match specific search criteria before fetching full data
- **Returns**: Count of matching master records

#### Fetch Document IDs

- **Endpoint**: `/api/acris/personal-property/master/fetchDocIds`
- **Method**: GET
- **Purpose**: Get document IDs from Personal Property Master dataset
- **Note**: Development/testing route only, not used in production
- **Use Case**: Retrieve document IDs for cross-referencing with other ACRIS datasets (Legals, Parties, etc.)
- **Returns**: Array of document IDs that match the query criteria

### Personal Property Remarks

#### Fetch Records

- **Endpoint**: `/api/acris/personal-property/remarks/fetchRecord`
- **Method**: GET
- **Purpose**: Fetch personal property remarks records from ACRIS API
- **Note**: Development/testing route only, not used in production
- **Use Case**: Retrieve detailed remarks and annotation data for personal property transactions
- **Returns**: Remarks records with document IDs, record types, file numbers, and reference information

### Personal Property Parties

#### Fetch Records

- **Endpoint**: `/api/acris/personal-property/parties/fetchRecord`
- **Method**: GET
- **Purpose**: Fetch personal property parties records from ACRIS API
- **Note**: Development/testing route only, not used in production
- **Use Case**: Retrieve party information for personal property transactions
- **Returns**: Parties records with document IDs, party types, names, addresses, and role information

#### Fetch Record Count

- **Endpoint**: `/api/acris/personal-property/parties/fetchRecordCount`
- **Method**: GET
- **Purpose**: Get count of matching personal property parties records
- **Note**: Development/testing route only, not used in production
- **Use Case**: Determine the number of party records that match specific search criteria
- **Returns**: Count of matching parties records

#### Fetch Document IDs

- **Endpoint**: `/api/acris/personal-property/parties/fetchDocIds`
- **Method**: GET
- **Purpose**: Get document IDs from Personal Property Parties dataset
- **Note**: Development/testing route only, not used in production
- **Use Case**: Retrieve document IDs for cross-referencing with other ACRIS datasets
- **Returns**: Array of document IDs that match the query criteria

#### Fetch Cross-Referenced Document IDs

- **Endpoint**: `/api/acris/personal-property/parties/fetchDocIdsCrossRefMasterDocIds`
- **Method**: GET
- **Purpose**: Get document IDs from Personal Property Parties dataset cross-referenced with Master dataset
- **Note**: Development/testing route only, not used in production
- **Use Case**: Find party records that are associated with specific master records
- **Parameters**: Requires `masterRecordsDocumentIds` as JSON array in query
- **Returns**: Array of document IDs that match both datasets

### Personal Property References

#### Fetch Records

- **Endpoint**: `/api/acris/personal-property/references/fetchRecord`
- **Method**: GET
- **Purpose**: Fetch personal property references records from ACRIS API
- **Note**: Development/testing route only, not used in production
- **Use Case**: Retrieve reference information for personal property transactions
- **Returns**: References records with document IDs, record types, file numbers, and reference information

## Important Notes

1. **Development Only**: These routes were only used during development and are NOT used in the deployed application
2. **API Modules In Production**: The methods contained in the `LegalsPersPropApi`, `MasterPersPropApi`, `PartiesPersPropApi`, `ReferencesPersPropApi` and `RemarksPersPropApi` modules ARE used in the deployed application
3. **Development Tool**: Used during development for Postman-based workflows
4. **Cross-Referencing**: Supports complex queries across multiple ACRIS datasets
5. **Data Integration**: Enables comprehensive analysis of personal property transactions

## Technical Details

- All routes support query parameters for filtering and pagination
- Error handling includes proper HTTP status codes and descriptive messages
- JSON parsing is handled gracefully for complex query parameters
- Cross-referencing capabilities allow for sophisticated data analysis
- Routes are optimized for both development testing and production performance
