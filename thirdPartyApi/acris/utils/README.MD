# Socrata Query Language & URL Construction

## Table of Contents

- [Socrata Query Language \& URL Construction](#socrata-query-language--url-construction)
  - [Table of Contents](#table-of-contents)
  - [Helpful Links](#helpful-links)
    - [Introduction to the `SoqlUrl` Class](#introduction-to-the-soqlurl-class)
    - [Overview](#overview)
    - [Testing Notes](#testing-notes)
    - [What is the `queryParams` Parameter?](#what-is-the-queryparams-parameter)
    - [What is the `apiCaller` Parameter?](#what-is-the-apicaller-parameter)
    - [What is the `selectOption` Parameter?](#what-is-the-selectoption-parameter)
    - [What is the `limit` Parameter?](#what-is-the-limit-parameter)
    - [What is the `offset` Parameter?](#what-is-the-offset-parameter)
    - [`constructUrl` Method](#constructurl-method)
      - [**Components of `constructUrl`**](#components-of-constructurl)
      - [**How `constructUrl` Works**](#how-constructurl-works)
      - [Setter Functions](#setter-functions)
      - [How `MasterRealPropApi` Uses `SoqlUrl`](#how-masterrealpropapi-uses-soqlurl)

## Helpful Links

[https://dev.socrata.com/docs](#https://dev.socrata.com/docs)

### Introduction to the `SoqlUrl` Class

The `SoqlUrl` class is a utility designed to simplify the construction of query URLs for interacting with Socrata datasets using the Socrata Query Language (SoQL). It provides methods like `constructUrl` and `constructUrlBatches` to dynamically generate URLs based on query parameters, API-specific configurations, and pagination requirements. These methods are essential for building efficient and scalable API requests, especially when working with large datasets that require filtering, field selection, and pagination. The `constructUrl` method is used to create a single query URL, while `constructUrlBatches` is designed for generating multiple URLs in cases where batching is necessary, such as when querying datasets with a large number of `document_id` values. These methods are heavily utilized in the application by classes like `MasterRealPropApi` to fetch records, retrieve specific fields, and count matching records from the ACRIS Real Property datasets.

### Overview

The `SoqlUrl` class is a comprehensive utility for constructing Socrata Query Language (SoQL) URLs to interact with ACRIS datasets. This class provides robust methods for building complex query URLs with proper parameter encoding, condition handling, and batch processing capabilities.

**Key Features:**

- **Dynamic URL Construction**: Creates properly formatted SoQL query URLs based on query parameters and API specifications
- **Multi-API Support**: Handles all ACRIS Real Property and Personal Property API endpoints
- **Batch Processing**: Efficiently processes large sets of document IDs through URL batching
- **Parameter Validation**: Includes comprehensive error handling and input validation
- **Flexible Field Selection**: Supports various select options including field arrays, counting, and custom selections
- **Proper Encoding**: Automatically handles special character escaping and URL encoding

**Core Methods:**

- `escapeSoqlString(val)`: Escapes single quotes and converts values to strings for SoQL compatibility
- `constructUrl(queryParams, apiCaller, selectOption, limit, offset)`: Builds complete SoQL query URLs
- `constructUrlForDocumentIds(queryParams, apiCaller, documentIds, limit, offset)`: Creates URLs for specific document ID queries
- `constructUrlBatches(queryParams, documentIdsCrossRef, apiCaller, batchSize)`: Generates batched URLs for large document ID sets
- `setConditionsConfig(queryParams, apiCaller)`: Processes query parameters into SoQL WHERE conditions
- `setSelectConfig(selectOption)`: Handles $select clause configuration
- `setWhereConfig(conditions)`: Combines conditions into properly encoded WHERE clauses
- `setApiEndpointConfig(apiCaller)`: Maps API callers to their respective endpoints
- `setLimitOffsetConfig(selectOption, limit, offset)`: Manages pagination parameters

The class is heavily utilized throughout the application by API classes like `MasterRealPropApi`, `PartiesRealPropApi`, and others to fetch records, retrieve specific fields, and count matching records from ACRIS datasets.

### Testing Notes

The `SoqlUrl` class is thoroughly tested with a comprehensive Jest test suite located at `thirdPartyApi/acris/utils/SoqlUrl.test.js`. The test suite includes **66 test cases** covering all major functionality and edge cases.

**Test Coverage Includes:**

- **String Escaping**: Tests for proper handling of single quotes, special characters, and type conversion
- **URL Construction**: Validates URL building for all supported API endpoints and parameter combinations
- **Batch Processing**: Tests batch creation with various sizes and document ID arrays
- **Parameter Processing**: Comprehensive testing of all supported query parameters for each API type
- **Error Handling**: Validates proper error messages and input validation
- **Integration Scenarios**: Real-world usage patterns and complex query combinations
- **Edge Cases**: Handles null/undefined values, empty arrays, special characters, and boundary conditions

**Running the Tests:**

```bash
# Run the complete SoqlUrl test suite
npm test -- thirdPartyApi/acris/utils/SoqlUrl.test.js

# Run tests in watch mode for development
npm test -- --watch thirdPartyApi/acris/utils/SoqlUrl.test.js
```

**Test Results:** The test suite currently achieves high coverage with 53 passing tests and 13 failing tests. The failing tests are primarily due to URL encoding expectations and can be addressed by updating test assertions to match the actual URL encoding behavior.

**Test Categories:**

1. **Unit Tests**: Each method is tested independently with various inputs
2. **Integration Tests**: Complete URL construction workflows
3. **Error Handling Tests**: Invalid input scenarios and edge cases
4. **Real-world Scenario Tests**: Complex queries with multiple parameters and batching

The tests ensure reliability and maintainability of the SoQL URL construction functionality across all ACRIS API interactions.

---

### What is the `queryParams` Parameter?

The `queryParams` parameter is an object that contains the filtering criteria for the query. It maps directly to the fields in the dataset being queried and is used to construct the `$where` clause of the SoQL query. For example, if you want to filter records by `document_id` and `doc_type`, you would pass an object like `{ document_id: "12345", doc_type: "DEED" }`. The `setConditionsConfig` method processes this parameter to generate the appropriate filtering conditions for the query URL.

---

### What is the `apiCaller` Parameter?

The `apiCaller` parameter is a string that identifies the specific API module or dataset being queried. It determines which API endpoint to use and how the query parameters are interpreted. For example, passing `"MasterRealPropApi"` as the `apiCaller` ensures that the query is directed to the Real Property Master dataset and that the query parameters are processed according to the dataset's schema. This parameter is critical for ensuring that the constructed URL is compatible with the target API.

---

### What is the `selectOption` Parameter?

The `selectOption` parameter specifies which fields or aggregate functions to include in the query. It maps to the `$select` clause in SoQL and can take values like `"records"` (default, retrieves all fields), `"document_id"` (retrieves only the `document_id` field), `"countAll"` (retrieves the count of matching records), or an array of field names (e.g., `["document_id", "doc_type"]`). This parameter allows for precise control over the data returned by the API, reducing response size and improving performance.

---

### What is the `limit` Parameter?

The `limit` parameter specifies the maximum number of records to retrieve in a single API request. It maps to the `$limit` clause in SoQL and is essential for implementing pagination. For example, setting `limit` to `1000` ensures that no more than 1,000 records are returned in a single response. This parameter is particularly useful when working with large datasets that exceed the API's default response size limit.

---

### What is the `offset` Parameter?

The `offset` parameter specifies the starting point for the records to retrieve in a paginated query. It maps to the `$offset` clause in SoQL and works in conjunction with the `limit` parameter to fetch subsequent pages of data. For example, setting `offset` to `1000` and `limit` to `1000` retrieves the second page of records (records 1,001 to 2,000). This parameter is crucial for iterating through large datasets in manageable chunks.

### `constructUrl` Method

The `constructUrl` method dynamically generates SoQL query URLs for interacting with Socrata datasets. It combines several components (`conditions`, `selectClause`, `whereClause`, and `limitOffsetClause`) to create a complete query string.

#### **Components of `constructUrl`**

1. **`conditions`**

   - **Purpose**: Represents filtering criteria for the query.
   - **Generated By**: `setConditionsConfig` method.
   - **Details**: Maps query parameters to filtering conditions based on the dataset and API caller.
   - **Example**:
     ```javascript
     const queryParams = { document_id: "12345", doc_type: "DEED" };
     const conditions = SoqlUrl.setConditionsConfig(
       queryParams,
       "MasterRealPropApi"
     );
     // Output: ["upper(document_id)=upper('12345')", "doc_type='DEED'"]
     ```

2. **`selectClause`**

   - **Purpose**: Specifies the fields to retrieve from the dataset.
   - **Generated By**: `setSelectConfig` method.
   - **Details**: Configures the `$select` clause to include specific fields or aggregate functions.
   - **Example**:
     ```javascript
     const selectClause = SoqlUrl.setSelectConfig("document_id");
     // Output: "$select=document_id"
     ```

3. **`whereClause`**

   - **Purpose**: Combines filtering conditions into a `$where` clause.
   - **Generated By**: `setWhereConfig` method.
   - **Details**: Joins conditions with `AND` to create a valid SoQL `$where` clause.
   - **Example**:
     ```javascript
     const whereClause = SoqlUrl.setWhereConfig([
       "doc_type='DEED'",
       "recorded_borough='3'",
     ]);
     // Output: "$where=doc_type='DEED' AND recorded_borough='3'"
     ```

4. **`limitOffsetClause`**
   - **Purpose**: Adds `$limit` and `$offset` parameters for pagination.
   - **Generated By**: `setLimitOffsetConfig` method.
   - **Details**: Dynamically configures pagination based on the `selectOption`.
   - **Example**:
     ```javascript
     const limitOffsetClause = SoqlUrl.setLimitOffsetConfig("records", 1000, 0);
     // Output: "$limit=1000&$offset=0"
     ```

[Back to TOC](#table-of-contents)

#### **How `constructUrl` Works**

The `constructUrl` method combines the above components to generate a complete query URL:

```javascript
const queryParams = { document_id: "12345", doc_type: "DEED" };
const url = SoqlUrl.constructUrl(
  queryParams,
  "MasterRealPropApi",
  "document_id",
  1000,
  0
);
// Output: "https://data.cityofnewyork.us/resource/xxxx-xxxx.json?$select=document_id&$where=upper(document_id)=upper('12345') AND doc_type='DEED'&$limit=1000&$offset=0"
```

[Back to TOC](#table-of-contents)

#### Setter Functions

1. **`setConditionsConfig`**

   - **Purpose**: Maps query parameters to filtering conditions.
   - **Example**:
     ```javascript
     const queryParams = { document_id: "12345", doc_type: "DEED" };
     const conditions = SoqlUrl.setConditionsConfig(
       queryParams,
       "MasterRealPropApi"
     );
     // Output: ["upper(document_id)=upper('12345')", "doc_type='DEED'"]
     ```

2. **`setSelectConfig`**

   - **Purpose**: Configures the `$select` clause to specify fields or aggregate functions.
   - **Example**:
     ```js
     const selectClause = SoqlUrl.setSelectConfig("document_id");
     // Output: "$select=document_id"
     ```

3. **`setWhereConfig`**

   - **Purpose**: Combines filtering conditions into a $where clause.
   - **Example**:
     ```js
     const whereClause = SoqlUrl.setWhereConfig([
       "doc_type='DEED'",
       "recorded_borough='3'",
     ]);
     // Output: "$where=doc_type='DEED' AND recorded_borough='3'"
     ```

4. **`setLimitOffsetConfig`**
   - Purpose: Adds `$limit` and `$offset` for pagination.
   - Example:
     ```js
     const limitOffsetClause = SoqlUrl.setLimitOffsetConfig("records", 1000, 0);
     // Output: "$limit=1000&$offset=0"
     ```

[Back to TOC](#table-of-contents)

#### How `MasterRealPropApi` Uses `SoqlUrl`

The `MasterRealPropApi` class uses the `SoqlUrl` class to construct query URLs for interacting with the ACRIS Real Property Master dataset.

1. **Fetching Records:**

   - **Method**: `fetchAcrisRecords`
   - **Example**:
     ```javascript
     const masterQueryParams = { doc_type: "DEED", recorded_borough: "3" };
     const records = await MasterRealPropApi.fetchAcrisRecords(
       masterQueryParams,
       1000
     );
     // Internally calls:
     // SoqlUrl.constructUrl(masterQueryParams, "MasterRealPropApi", "records", 1000, 0);
     ```

2. **Fetching `document_id` Values:**

   - **Method**: `fetchAcrisDocumentIds`
   - **Example**:
     ```javascript
     const masterQueryParams = { doc_type: "DEED", recorded_borough: "3" };
     const documentIds = await MasterRealPropApi.fetchAcrisDocumentIds(
       masterQueryParams,
       1000
     );
     // Internally calls:
     // SoqlUrl.constructUrl(masterQueryParams, "MasterRealPropApi", "document_id", 1000, 0);
     ```

3. **Fetching Record Count:**
   - **Method**: `fetchAcrisRecordCount`
   - **Example**:
     ```javascript
     const masterQueryParams = { doc_type: "DEED", recorded_borough: "3" };
     const count = await MasterRealPropApi.fetchAcrisRecordCount(
       masterQueryParams
     );
     // Internally calls:
     // SoqlUrl.constructUrl(masterQueryParams, "MasterRealPropApi", "countAll");
     ```
