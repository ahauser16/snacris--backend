# JSON Schema Documentation

This directory contains JSON Schema definitions used for request validation throughout the SNACRIS backend application. These schemas ensure data integrity and provide clear API contracts for all endpoints.

## Table of Contents

- [Overview](#overview)
- [Schema Organization](#schema-organization)
- [User Schemas](#user-schemas)
- [Organization Schemas](#organization-schemas)
- [ACRIS Schemas](#acris-schemas)
- [Schema Structure](#schema-structure)
- [Usage Examples](#usage-examples)
- [Validation Patterns](#validation-patterns)

## Overview

JSON Schema is used throughout the application to validate incoming request data before processing. This provides:

- **Data Validation**: Ensures required fields are present and data types are correct
- **Security**: Prevents injection attacks and malformed data
- **API Documentation**: Schemas serve as living documentation of expected request formats
- **Error Prevention**: Catches data issues early in the request lifecycle
- **Consistency**: Standardizes data formats across all endpoints

## Schema Organization

```
schemas/
├── README.MD                          # This documentation
├── userAuth.json                      # User authentication validation
├── userNew.json                       # New user registration validation
├── userRegister.json                  # User registration validation
├── userUpdate.json                    # User profile update validation
├── organization/                      # Organization-related schemas
│   ├── organizationNew.json          # New organization creation
│   ├── organizationSearch.json       # Organization search parameters
│   └── organizationUpdate.json       # Organization update validation
└── acris/                            # ACRIS data schemas
    ├── code-maps/                    # Code mapping schemas
    │   └── doc-types/               # Document type schemas
    │       └── docTypeSearch.json   # Document type search validation
    └── real-property/               # Real property schemas
        └── master/                  # Master record schemas
            ├── masterRealPropNew.json    # New real property record
            ├── masterRealPropUpdate.json # Update real property record
            ├── masterRealPropSearch.json # Search real property records
            └── masterRealPropDelete.json # Delete real property record
```

## User Schemas

### `userAuth.json`

Validates user authentication requests for login endpoints.

**Required Fields:**

- `username` (string): User's username
- `password` (string): User's password

**Usage:** POST `/auth/token` endpoint

### `userNew.json`

Validates new user creation requests with comprehensive field validation.

**Required Fields:**

- `username` (string, 1-30 chars): Unique username
- `firstName` (string, 1-30 chars): User's first name
- `lastName` (string, 1-30 chars): User's last name
- `password` (string, 5-20 chars): User's password
- `email` (string, 6-60 chars, email format): Valid email address

**Optional Fields:**

- `isAdmin` (boolean): Administrative privileges flag

**Usage:** User creation and admin user management

### `userRegister.json`

Validates user self-registration requests.

**Purpose:** Similar to `userNew.json` but specifically for public registration endpoints with potentially different validation rules.

### `userUpdate.json`

Validates user profile update requests.

**Optional Fields (all updatable):**

- `password` (string, 5-20 chars): New password
- `firstName` (string, 1-30 chars): Updated first name
- `lastName` (string, 1-30 chars): Updated last name
- `email` (string, 6-60 chars, email format): Updated email

**Usage:** PUT/PATCH `/users/:username` endpoints

## Organization Schemas

### `organizationNew.json`

Validates new organization creation requests.

**Required Fields:**

- `name` (string, 1-100 chars): Organization name
- `createdBy` (string, 1-25 chars): Username of creator

**Optional Fields:**

- `description` (string or null, max 1000 chars): Organization description

### `organizationSearch.json`

Validates organization search and filtering parameters.

**Purpose:** Ensures search queries are properly formatted and within acceptable ranges.

### `organizationUpdate.json`

Validates organization update requests.

**Purpose:** Validates partial updates to existing organization records with appropriate field constraints.

## ACRIS Schemas

### Code Maps Schemas

#### `acris/code-maps/doc-types/docTypeSearch.json`

Validates searches against ACRIS document type code mappings.

**Key Fields:**

- `record_type` (string, max 1 char): Record type identifier (typically 'D')
- `doc__type` (string, max 8 chars): Document type code
- `doc__type_description` (string): Document type description

**Purpose:** Ensures document type queries conform to ACRIS API specifications.

### Real Property Schemas

#### `acris/real-property/master/`

Contains schemas for ACRIS Real Property Master record operations:

**`masterRealPropNew.json`**

- Validates new real property record creation
- Includes extensive field validation for ACRIS document structure
- **Key Required Fields:**
  - `document_id` (string, exactly 16 chars): Unique document identifier
  - `record_type` (enum): Must be "A" for master records
  - `crfn` (string or null): Control reference number

**`masterRealPropUpdate.json`**

- Validates updates to existing real property records
- Allows partial updates with appropriate field validation

**`masterRealPropSearch.json`**

- Validates search parameters for real property queries
- Ensures search criteria meet ACRIS API requirements

**`masterRealPropDelete.json`**

- Validates deletion requests for real property records
- Ensures proper identification of records to be deleted

## Schema Structure

All schemas follow JSON Schema Draft 7 specification and include:

### Standard Properties

- **`$schema`**: JSON Schema version declaration
- **`$id`**: Unique identifier for the schema
- **`type`**: Data type (typically "object" for request bodies)
- **`properties`**: Field definitions with validation rules
- **`required`**: Array of mandatory fields
- **`additionalProperties`**: Set to `false` to prevent extra fields

### Validation Rules

- **String Length**: `minLength` and `maxLength` constraints
- **Data Types**: Strict type enforcement
- **Format Validation**: Email format, date formats, etc.
- **Enums**: Restricted value sets for categorical data
- **Nullable Fields**: Support for `null` values where appropriate

## Usage Examples

### In Route Handlers

```javascript
const jsonschema = require("jsonschema");
const userNewSchema = require("../schemas/userNew.json");

router.post("/users", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    // Process valid request...
  } catch (err) {
    return next(err);
  }
});
```

### Validation Error Handling

When validation fails, the application returns structured error messages indicating:

- Which fields failed validation
- What validation rules were violated
- Expected data formats and constraints

## Validation Patterns

### Common Patterns Used

1. **String Length Constraints**: Prevent buffer overflow and ensure reasonable data sizes
2. **Email Format Validation**: Ensures valid email addresses using JSON Schema format validation
3. **Required Field Enforcement**: Critical fields must be present in requests
4. **Type Safety**: Strict type checking prevents type-related errors
5. **Additional Properties Prevention**: Blocks unexpected fields to maintain API contracts
6. **Enum Validation**: Restricts categorical fields to predefined values
7. **Null Handling**: Explicit support for nullable fields where business logic allows

### Security Considerations

- **Input Sanitization**: Schemas prevent oversized inputs that could cause DoS
- **Type Safety**: Prevents type confusion attacks
- **Field Restriction**: `additionalProperties: false` prevents parameter pollution
- **Length Limits**: Reasonable string length limits prevent memory exhaustion

### Best Practices

1. **Descriptive Field Names**: Schema property names match database column names
2. **Consistent Validation**: Similar fields across schemas use consistent validation rules
3. **Clear Error Messages**: Validation errors provide actionable feedback
4. **Documentation**: Each schema serves as API documentation
5. **Version Control**: Schema changes are tracked and versioned with the codebase

## Integration with Application

These schemas are imported and used throughout the application in:

- **Route Handlers**: Validate incoming request bodies
- **API Documentation**: Serve as specification for expected request formats
- **Testing**: Ensure test data conforms to expected formats
- **Client Libraries**: Can be used to generate client-side validation

The schemas ensure data integrity at the API boundary and provide a clear contract between the frontend and backend systems.
