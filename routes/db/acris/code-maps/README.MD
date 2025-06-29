# ACRIS Code Mappings Routes

## Overview

The Code Mappings routes provide access to **reference data** used throughout the ACRIS (Automated City Register Information System) database. This reference data is **critical** for querying and understanding the five Real Property datasets and five Personal Property datasets in the SNACRIS application.

**⚠️ IMPLEMENTATION STATUS**: Currently, only `docTypesCodeMapDbRoutes.js` is implemented. The other four code mapping routes are planned for future development.

## Reference Data Importance

The code mappings serve as lookup tables that:

- **Enable filtering**: Users can filter Real and Personal Property records by document types, property types, states, countries, and UCC collateral types
- **Provide human-readable descriptions**: Convert coded values (like "DEED") into descriptive text ("Deed")
- **Support data validation**: Ensure that document types and other codes used in property records are valid
- **Facilitate search functionality**: Allow users to search by meaningful categories rather than cryptic codes

### Relationship to Property Data

These code mappings are essential for:

- **Real Property Datasets** (5 datasets):
  - Master records, legals, parties, remarks, references
- **Personal Property Datasets** (5 datasets):
  - Master records, legals, parties, remarks, references

## Implemented Routes

### 1. Document Types Code Map (`docTypesCodeMapDbRoutes.js`) ✅ IMPLEMENTED

**Endpoint**: `GET /db/code-map-documents/getDocTypeCodeMap`

**Purpose**: Retrieves all document control codes organized by category for easy filtering and display.

**Response Structure**:

```json
{
  "docControlCodes": {
    "deedsAndOtherConveyances": [
      {
        "id": 1,
        "record_type": "D",
        "doc_type": "DEED",
        "doc_type_description": "Deed",
        "class_code_description": "DEEDS AND OTHER CONVEYANCES",
        "party1_type": "GRANTOR",
        "party2_type": "GRANTEE",
        "party3_type": null
      }
    ],
    "mortgagesAndInstruments": [...],
    "uccAndFederalLiens": [...],
    "otherDocuments": [...]
  }
}
```

**Categories**:

- `deedsAndOtherConveyances`: Property transfers, deeds, assignments
- `mortgagesAndInstruments`: Mortgages, satisfactions, modifications
- `uccAndFederalLiens`: UCC filings, federal tax liens
- `otherDocuments`: Other miscellaneous document types

**Database Table**: `document_control_codes`

**Model**: `DocTypesCodeMapModel`

**Test Coverage**: Comprehensive test suite in `docTypesCodeMapDbRoutes.test.js`

- Response structure validation
- Category organization verification
- Data integrity checks
- Performance testing
- Consistency validation

**Usage Example**:

```javascript
// Frontend can use this to populate document type filter dropdowns
const response = await fetch("/db/code-map-documents/getDocTypeCodeMap");
const { docControlCodes } = await response.json();

// Populate a "Deeds" filter section
const deedOptions = docControlCodes.deedsAndOtherConveyances.map((doc) => ({
  value: doc.doc_type,
  label: doc.doc_type_description,
}));
```

## Planned Routes (Not Yet Implemented)

### 2. Countries Code Map (`countriesCodeMapDbRoutes.js`) 🔄 PLANNED

**Purpose**: Country codes for international property records
**Database Table**: `country_codes`
**Endpoint**: `GET /db/code-map-countries/getCountryCodeMap`

### 3. Property Types Code Map (`propTypesCodeMapDbRoutes.js`) 🔄 PLANNED

**Purpose**: Property classification codes (residential, commercial, etc.)
**Database Table**: `property_type_codes`
**Endpoint**: `GET /db/code-map-property-types/getPropertyTypeCodeMap`

### 4. States Code Map (`statesCodeMapDbRoutes.js`) 🔄 PLANNED

**Purpose**: US state codes for property locations
**Database Table**: `state_codes`
**Endpoint**: `GET /db/code-map-states/getStateCodeMap`

### 5. UCC Collateral Types Code Map (`uccTypesCodeMapDbRoutes.js`) 🔄 PLANNED

**Purpose**: UCC (Uniform Commercial Code) collateral type classifications
**Database Table**: `ucc_collateral_codes`
**Endpoint**: `GET /db/code-map-ucc-types/getUccTypeCodeMap`

## Integration Points

### Frontend Integration

These routes are designed to support frontend filtering interfaces:

```javascript
// Example: Building a comprehensive search form
const [docTypes, propTypes, states, countries, uccTypes] = await Promise.all([
  fetch("/db/code-map-documents/getDocTypeCodeMap").then((r) => r.json()),
  // fetch('/db/code-map-property-types/getPropertyTypeCodeMap').then(r => r.json()), // Future
  // fetch('/db/code-map-states/getStateCodeMap').then(r => r.json()), // Future
  // fetch('/db/code-map-countries/getCountryCodeMap').then(r => r.json()), // Future
  // fetch('/db/code-map-ucc-types/getUccTypeCodeMap').then(r => r.json()) // Future
]);
```

### Property Data Filtering

Property records can be filtered using these codes:

```sql
-- Example: Finding all deed records
SELECT * FROM real_property_master
WHERE doc_type IN ('DEED', 'DEED1', 'DEED2');

-- Example: Finding records by property type
SELECT * FROM real_property_master
WHERE property_type = 'CONDO';
```

## Development Notes

### Testing Strategy

- Each implemented route has comprehensive test coverage
- Tests verify response structure, data integrity, and performance
- Future routes should follow the same testing pattern established in `docTypesCodeMapDbRoutes.test.js`

### Error Handling

All routes implement consistent error handling:

- `404 NotFoundError` when no data is found
- Proper error propagation through Express middleware
- Structured error responses

### Performance Considerations

- Code mapping data is relatively static (infrequently updated)
- Consider caching strategies for production
- Current response times are < 100ms for document types route

### Security

- No authentication required (reference data is public)
- No user-specific data filtering needed
- Read-only operations only

## Future Development

### Priority Order for Implementation

1. ✅ **Document Types** (Completed)
2. 🔄 **Property Types** (High priority - needed for property filtering)
3. 🔄 **States** (Medium priority - location filtering)
4. 🔄 **Countries** (Medium priority - international records)
5. 🔄 **UCC Types** (Lower priority - specialized use cases)

### Recommended Implementation Pattern

When implementing the remaining routes:

1. Follow the same structure as `docTypesCodeMapDbRoutes.js`
2. Create corresponding test files following `docTypesCodeMapDbRoutes.test.js` pattern
3. Organize data logically (by category/type when applicable)
4. Update this README with implementation details
5. Add integration points to main application routes

### Enhancement Opportunities

- **Caching**: Implement Redis caching for frequently accessed reference data
- **Versioning**: Add version endpoints to track reference data changes
- **Bulk endpoint**: Create single endpoint that returns all code mappings
- **Search**: Add search/filter capabilities within code mappings
- **Admin routes**: Add CRUD operations for managing reference data

## Change Log

### 2025-06-29

- ✅ Implemented `docTypesCodeMapDbRoutes.js` with full categorization
- ✅ Created comprehensive test suite `docTypesCodeMapDbRoutes.test.js`
- ✅ Added complete documentation for implemented route
- ✅ Documented planned routes and implementation strategy
- ✅ Established testing and development patterns for future routes

---

_This README will be updated as additional code mapping routes are implemented._
