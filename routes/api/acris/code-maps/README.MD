# Code Map APIs

## Purpose and Usage

These routes were used exclusively during development for Postman-based API exploration and learning purposes. They are **not intended for production use** and do not include authorization middleware.

## Development Context

The code map routes were created to:

- Facilitate direct API testing and exploration using Postman
- Learn and understand the structure of ACRIS code mapping datasets
- Test API connectivity and response formats during development
- Verify data structures before implementing production features

## Available Routes

### Countries Code Map

- **Endpoint**: `/api/acris/code-maps/countries/fetchAll`
- **Method**: GET
- **Purpose**: Fetch country code mappings from ACRIS API
- **Authorization**: None (development only)
- **Use Case**: Understanding country code structure and testing API connectivity

### Document Types Code Map

- **Endpoint**: `/api/acris/code-maps/documentTypes/fetchAll`
- **Method**: GET
- **Purpose**: Fetch document type code mappings from ACRIS API
- **Authorization**: None (development only)
- **Use Case**: Understanding document type classifications, party types, and testing API connectivity
- **Returns**: Document types with classifications, party type mappings, and descriptions

### Property Types Code Map

- **Endpoint**: `/api/acris/code-maps/propertyTypes/fetchAll`
- **Method**: GET
- **Purpose**: Fetch property type code mappings from ACRIS API
- **Authorization**: None (development only)
- **Use Case**: Understanding property type classifications and testing API connectivity
- **Returns**: Property types with codes and descriptions

### States Code Map

- **Endpoint**: `/api/acris/code-maps/states/fetchAll`
- **Method**: GET
- **Purpose**: Fetch US state code mappings from ACRIS API
- **Authorization**: None (development only)
- **Use Case**: Understanding state code structure and testing API connectivity
- **Returns**: State codes including 50 US states plus Washington D.C. and Armed Forces territories

### UCC Collateral Types Code Map

- **Endpoint**: `/api/acris/code-maps/uccTypes/fetchAll`
- **Method**: GET
- **Purpose**: Fetch UCC collateral type code mappings from ACRIS API
- **Authorization**: None (development only)
- **Use Case**: Understanding UCC collateral type classifications and testing API connectivity
- **Returns**: UCC collateral types with codes and descriptions (e.g., ACCOUNTS, CHATTEL PAPER, EQUIPMENT, INVENTORY)

## Important Notes

1. **Development Only**: These routes are for development and testing purposes only
2. **No Authorization**: No authentication or authorization is required or implemented
3. **Postman Testing**: Designed specifically for Postman-based development workflows
4. **Learning Tool**: Used to understand ACRIS API structure and data formats
5. **Not Production**: Should not be used in production applications

## Production Alternative

For production use, the application uses seeded database tables with code mappings rather than direct API calls to these endpoints. The production real property and personal property APIs handle code mapping internally through database lookups.
