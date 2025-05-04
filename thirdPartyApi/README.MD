# Socrata & ACRIS API Notes

This is a notepad for Socrata's simple filter and more complex SoQL Queries and the ACRIS datasets.

## API Folder - ToDos



## Socrata APIs - filters versus SoQL queries

### Simple Filters

#### Advantages:

1. **Ease of Use:** Simple filters are straightforward and easy to use. You can directly append them to the URL as query parameters.
2. **Readability:** The resulting URL is often more readable and easier to understand.
3. **Basic Filtering:** Ideal for basic equality comparisons and straightforward filtering.

#### Limitations:

1. **Limited Functionality:** Simple filters are limited to basic equality comparisons and cannot handle complex queries.
2. **No Aggregation:** You cannot perform aggregations, grouping, or ordering with simple filters.

#### Example:
```
https://data.cityofnewyork.us/resource/bnx9-e6tj.json?document_id=2024061800496001&record_type=A
```

### SoQL Queries

#### Advantages:

1. **Advanced Querying:** SoQL supports advanced querying capabilities similar to SQL, including `SELECT`, `WHERE`, `ORDER BY`, `GROUP BY`, `HAVING`, and more.
2. **Aggregations and Functions:** You can perform aggregations (e.g., `SUM`, `AVG`, `COUNT`) and use various functions (e.g., `date_extract_y`, `max`, `min`).
3. **Complex Filtering:** Allows for complex filtering conditions, including logical operators (`AND`, `OR`), range queries (`BETWEEN`), and pattern matching (`LIKE`).

#### Limitations:

1. **Complexity:** SoQL queries can be more complex to construct and understand, especially for users unfamiliar with SQL-like syntax.
2. **URL Length:** Complex queries can result in long URLs, which might be harder to manage and debug.

Example:
```
https://data.cityofnewyork.us/resource/bnx9-e6tj.json?$where=document_id='2024061800496001' AND record_type='A'
```

### Comparison
1. Simple Filters are best for straightforward, basic filtering where you only need to match specific field values.
2. SoQL Queries are more powerful and flexible, allowing for complex querying, aggregations, and advanced filtering.

### What you cannot do with Simple Filters
1. Perform aggregations (e.g., `SUM`, `AVG`, `COUNT`).
2. Use advanced functions (e.g., `date_extract_y`, `max`, `min`).
3. Apply complex logical conditions (e.g., combining multiple conditions with `AND`/`OR`).
4. Order or group results.

### What You Cannot Do with SoQL Queries
1. SoQL queries can handle everything that simple filters can, but they require more complex syntax and understanding of the SoQL language.
