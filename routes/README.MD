# Routes Documentation

This directory contains all the route handlers for the SNACRIS backend application, organized by functionality and purpose. The routes provide API endpoints for user authentication, ACRIS data queries, organization management, and database operations.

## Table of Contents

- [Overview](#overview)
- [Main Route Files](#main-route-files)
- [Directory Structure](#directory-structure)
- [API Routes](#api-routes)
- [Database Routes](#database-routes)
- [Page Routes](#page-routes)
- [Utilities](#utilities)
- [Testing](#testing)

## Overview

The routes directory is organized into several categories:

- **Authentication & Users**: User registration, login, and user management
- **API Routes**: External API calls to ACRIS endpoints and form processing
- **Database Routes**: Direct database operations for saved ACRIS data
- **Organization Routes**: Organization-related operations
- **Page Routes**: Static page serving
- **Utilities**: Helper functions and utilities

## Main Route Files

### `index.js`

Central route aggregator that imports and exports all route modules. This file serves as the main entry point for all routes and organizes them into logical groups:

- User and authentication routes
- Organization routes
- SNACRIS form routes (external API calls)
- ACRIS API routes (real property, personal property, code maps)
- Database routes for saved data

### `auth.js`

Handles user authentication endpoints:

- `POST /auth/token` - User login and JWT token generation
- `POST /auth/register` - New user registration

### `users.js`

User management endpoints:

- User profile operations
- User data CRUD operations

## Directory Structure

```
routes/
├── index.js                    # Route aggregator
├── auth.js                     # Authentication routes
├── users.js                    # User management routes
├── _testCommon.js             # Test utilities
├── api/                       # External API routes
│   ├── acris/                 # ACRIS API endpoints
│   │   ├── code-maps/         # Code mapping API routes
│   │   ├── personal-property/ # Personal property API routes
│   │   └── real-property/     # Real property API routes
│   ├── organization/          # Organization API routes
│   └── snacrisForms/          # Form processing routes
├── db/                        # Database operation routes
│   └── acris/                 # ACRIS database routes
│       ├── code-maps/         # Code mapping database operations
│       └── real-property/     # Real property database operations
├── pages/                     # Static page routes
│   └── home.js               # Home page route
└── utils/                     # Route utilities
    ├── convertQueryParams.js.disabled
    └── convertQueryParams.test.js.disabled
```

## API Routes

### `/api/acris/`

External API calls to NYC ACRIS endpoints:

#### Real Property (`/api/acris/real-property/`)

- **Master Records**: Main property transaction data
- **Legals**: Legal descriptions and property details
- **Parties**: Involved parties (buyers, sellers, attorneys)
- **Remarks**: Additional comments and notes
- **References**: Cross-references to other documents

#### Personal Property (`/api/acris/personal-property/`)

- **Master Records**: Personal property transaction data
- **Legals**: Legal descriptions for personal property
- **Parties**: Involved parties in personal property transactions
- **Remarks**: Comments and additional information
- **References**: Document cross-references

#### Code Maps (`/api/acris/code-maps/`)

- **Countries**: Country code mappings
- **States**: US state code mappings
- **Document Types**: Document control code mappings
- **Property Types**: Property type code mappings
- **UCC Types**: UCC collateral type code mappings

### `/api/organization/`

Organization management:

- Organization CRUD operations
- Organization membership management

### `/api/snacrisForms/`

Form processing routes that handle frontend form submissions and make coordinated external API calls:

- **`queryAcrisAddressParcel.js`**: Property queries by address or BBL (Borough-Block-Lot)
- **`queryAcrisParcel.js`**: Parcel-specific queries
- **`queryAcrisDocIdCrfn.js`**: Document ID and CRFN queries
- **`queryAcrisPartyName.js`**: Party name searches
- **`queryAcrisDocumentType.js`**: Document type queries
- **`queryAcrisTransactionNumber.js`**: Transaction number lookups
- **`queryAcrisReelPage.js`**: Reel and page number queries
- **`queryAcrisUccFedLienNum.js`**: UCC and Federal lien number searches

Each form route provides:

- Data retrieval from ACRIS APIs
- Data analysis and processing
- Deduplication and filtering
- Error handling and status reporting

## Database Routes

### `/db/acris/`

Direct database operations for data previously saved from ACRIS APIs:

#### Code Maps (`/db/acris/code-maps/`)

- **Document Types**: CRUD operations for document type codes stored in database
- **Other code maps**: (Planned implementation for countries, states, property types, UCC types)

#### Real Property (`/db/acris/real-property/`)

- **Real Property Database Routes**: CRUD operations for saved real property data

#### Personal Property (`/db/acris/personal-property/`)

- **Personal Property Database Routes**: (Planned implementation for saved personal property data)

## Page Routes

### `/pages/`

Static page serving:

- **`home.js`**: Home page route handler

## Utilities

### `/utils/`

Route-related utility functions:

- **`convertQueryParams.js.disabled`**: Query parameter conversion utilities (currently disabled)
- **`README.md`**: Utilities documentation

## Testing

The routes directory includes comprehensive test files:

- **`_testCommon.js`**: Common testing utilities and setup
- **`auth.test.js`**: Authentication route tests
- **`users.test.js`**: User route tests
- **Individual route test files**: Each major route file has corresponding test files

### Test File Naming Convention

- Route files: `routeName.js`
- Test files: `routeName.test.js`

## Route Organization Principles

1. **Separation of Concerns**: External API calls, database operations, and form processing are separated into different directories
2. **Logical Grouping**: Related functionality is grouped together (e.g., all ACRIS-related routes under `/api/acris/`)
3. **Consistent Naming**: Route files follow consistent naming conventions
4. **Comprehensive Testing**: Each route module has corresponding test files
5. **Modular Design**: Routes are designed as independent modules that can be easily imported and used

## Future Development

Several route modules are marked as TODO for future implementation:

- Personal property database routes
- Additional code mapping database routes
- Enhanced query parameter conversion utilities

## Dependencies

Routes depend on:

- Express.js for routing framework
- JSONSchema for request validation
- Custom models for data operations
- Authentication middleware
- Error handling utilities
