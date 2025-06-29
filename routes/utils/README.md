# convertQueryParams Utility

## Overview

The `convertQueryParams` utility function provides type conversion for query parameters based on a JSON schema definition. It's specifically designed to convert string-based query parameters (as received from URL query strings) into their proper JavaScript types.

## Function Signature

```javascript
convertQueryParams(query, schema);
```

### Parameters

- **`query`** (Object): The query parameters object (typically from `req.query`)
- **`schema`** (Object): JSON schema object with a `properties` field defining expected types

### Returns

- **Object**: New object with converted values based on schema types

## Supported Type Conversions

| Schema Type | Conversion Method         | Example               |
| ----------- | ------------------------- | --------------------- |
| `"integer"` | `parseInt(value, 10)`     | `"123"` → `123`       |
| `"number"`  | `parseFloat(value)`       | `"99.99"` → `99.99`   |
| `"string"`  | No conversion (preserved) | `"hello"` → `"hello"` |
| Other types | No conversion (default)   | `value` → `value`     |

## Usage Examples

### Basic Type Conversion

```javascript
const { convertQueryParams } = require("./convertQueryParams");

const query = { page: "1", limit: "25", search: "test" };
const schema = {
  properties: {
    page: { type: "integer" },
    limit: { type: "integer" },
    search: { type: "string" },
  },
};

const converted = convertQueryParams(query, schema);
// Result: { page: 1, limit: 25, search: "test" }
```

### ACRIS Search Parameters

```javascript
const query = {
  borough: "1",
  block: "123",
  lot: "45",
  doc_type: "DEED",
  amount_min: "100000.50",
};

const schema = {
  properties: {
    borough: { type: "integer" },
    block: { type: "integer" },
    lot: { type: "integer" },
    doc_type: { type: "string" },
    amount_min: { type: "number" },
  },
};

const converted = convertQueryParams(query, schema);
// Result: { borough: 1, block: 123, lot: 45, doc_type: "DEED", amount_min: 100000.5 }
```

### Filtering Unknown Parameters

```javascript
const query = { page: "1", unknown: "ignored", limit: "10" };
const schema = {
  properties: {
    page: { type: "integer" },
    limit: { type: "integer" },
  },
};

const converted = convertQueryParams(query, schema);
// Result: { page: 1, limit: 10 }
// Note: 'unknown' parameter is filtered out
```

## Behavior Notes

### Type Conversion Edge Cases

- **Invalid integers**: `parseInt("abc")` returns `NaN`
- **Invalid numbers**: `parseFloat("xyz")` returns `NaN`
- **Empty strings**: Both `parseInt("")` and `parseFloat("")` return `NaN`
- **Whitespace**: Both parsing functions handle leading/trailing whitespace
- **Scientific notation**: `parseFloat("1.23e10")` works correctly

### Schema Handling

- Only processes parameters that exist in `schema.properties`
- Parameters not in schema are ignored (filtered out)
- Missing schema properties cause errors
- Properties without a `type` field fall through to default (no conversion)

### Error Conditions

- **Missing schema.properties**: Throws `TypeError` when trying to read properties
- **Invalid input types**: Function expects objects; other types may cause errors

## Common Use Cases

### Express.js Route Handler

```javascript
app.get("/api/search", (req, res) => {
  const searchSchema = {
    properties: {
      page: { type: "integer" },
      limit: { type: "integer" },
      category: { type: "string" },
      min_price: { type: "number" },
    },
  };

  const params = convertQueryParams(req.query, searchSchema);
  // params now has properly typed values
  const results = searchService.find(params);
  res.json(results);
});
```

### Pagination Parameters

```javascript
const paginationSchema = {
  properties: {
    page: { type: "integer" },
    limit: { type: "integer" },
    offset: { type: "integer" },
  },
};

// URL: /api/data?page=2&limit=50&offset=100
const converted = convertQueryParams(req.query, paginationSchema);
// Result: { page: 2, limit: 50, offset: 100 }
```

## Testing

The utility is comprehensively tested with 20 test cases covering:

- ✅ Basic type conversions (integer, number, string)
- ✅ Mixed type handling
- ✅ Edge cases (empty objects, invalid values)
- ✅ Error conditions
- ✅ Real-world scenarios (pagination, ACRIS searches)
- ✅ Performance with large parameter sets

### Running Tests

```bash
# Run convertQueryParams tests only
npm test -- routes/utils/convertQueryParams.test.js

# Run all tests
npm test
```

## Performance

- **Time Complexity**: O(n) where n is the number of query parameters
- **Space Complexity**: O(n) for the returned object
- **Benchmarks**: Handles 1000+ parameters in under 100ms

## Integration

This utility is designed for use in Express.js routes where query parameter type conversion is needed:

1. **API Routes**: Convert search and filter parameters
2. **Pagination**: Convert page/limit parameters to integers
3. **Data Validation**: Pre-process parameters before validation
4. **Third-party APIs**: Format parameters for external API calls

## Related Files

- **Test File**: `routes/utils/convertQueryParams.test.js`
- **Usage Example**: Used in various ACRIS and organization route handlers
- **Schema Files**: Works with JSON schemas in the `schemas/` directory

---

_This utility is part of the SNACRIS backend application's query parameter processing pipeline._
