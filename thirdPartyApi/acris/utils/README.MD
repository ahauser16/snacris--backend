# Socrata Query Language & URL Construction

## Table of Contents

- [Socrata Query Language \& URL Construction](#socrata-query-language--url-construction)
  - [Table of Contents](#table-of-contents)
  - [Helpful Links](#helpful-links)
    - [Introduction to the `SoqlUrl` Class](#introduction-to-the-soqlurl-class)
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
     const conditions = SoqlUrl.setConditionsConfig(queryParams, "MasterRealPropApi");
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
     const whereClause = SoqlUrl.setWhereConfig(["doc_type='DEED'", "recorded_borough='3'"]);
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
const url = SoqlUrl.constructUrl(queryParams, "MasterRealPropApi", "document_id", 1000, 0);
// Output: "https://data.cityofnewyork.us/resource/xxxx-xxxx.json?$select=document_id&$where=upper(document_id)=upper('12345') AND doc_type='DEED'&$limit=1000&$offset=0"
```

[Back to TOC](#table-of-contents)

#### Setter Functions

1. **`setConditionsConfig`**
    - **Purpose**: Maps query parameters to filtering conditions.
    - **Example**:
      ```javascript
      const queryParams = { document_id: "12345", doc_type: "DEED" };
      const conditions = SoqlUrl.setConditionsConfig(queryParams, "MasterRealPropApi");
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
      const whereClause = SoqlUrl.setWhereConfig(["doc_type='DEED'", "recorded_borough='3'"]);
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
      const records = await MasterRealPropApi.fetchAcrisRecords(masterQueryParams, 1000);
      // Internally calls:
      // SoqlUrl.constructUrl(masterQueryParams, "MasterRealPropApi", "records", 1000, 0);
      ```

2. **Fetching `document_id` Values:**
    - **Method**: `fetchAcrisDocumentIds`
    - **Example**:
      ```javascript
      const masterQueryParams = { doc_type: "DEED", recorded_borough: "3" };
      const documentIds = await MasterRealPropApi.fetchAcrisDocumentIds(masterQueryParams, 1000);
      // Internally calls:
      // SoqlUrl.constructUrl(masterQueryParams, "MasterRealPropApi", "document_id", 1000, 0);
      ```

3. **Fetching Record Count:**
    - **Method**: `fetchAcrisRecordCount`
    - **Example**:
      ```javascript
      const masterQueryParams = { doc_type: "DEED", recorded_borough: "3" };
      const count = await MasterRealPropApi.fetchAcrisRecordCount(masterQueryParams);
      // Internally calls:
      // SoqlUrl.constructUrl(masterQueryParams, "MasterRealPropApi", "countAll");
      ```