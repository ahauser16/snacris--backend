# snacris server (backend)

## Recent Changes (June 2025)

**Database Connection Pooling & Test Suite Improvements:**

- **RESOLVED: Intermittent SASL connection errors** - Migrated from `pg.Client` to `pg.Pool` for reliable database connections
- **Enhanced test reliability** - All 194 tests now pass consistently across 17 test suites
- **Environment-aware pooling** - Optimized connection settings for test (5), development (10), and production (20 connections)
- **Supabase compatibility** - Connection pooling works seamlessly with hosted database environments
- **Updated documentation** - Removed outdated troubleshooting workarounds and updated all test-related instructions

**TABLE OF CONTENTS**

- [snacris server (backend)](#snacris-server-backend)
  - [Recent Changes (June 2025)](#recent-changes-june-2025)
- [How to run the application](#how-to-run-the-application)
- [Testing](#testing)
  - [How to run tests](#how-to-run-tests)
    - [Prerequisites](#prerequisites)
    - [Setup Test Environment](#setup-test-environment)
    - [Running Tests](#running-tests)
      - [Run All Tests](#run-all-tests)
      - [Run Specific Test Files](#run-specific-test-files)
      - [Run Tests with Verbose Output](#run-tests-with-verbose-output)
      - [Run Tests in Watch Mode (for development)](#run-tests-in-watch-mode-for-development)
      - [Generate Test Coverage Report](#generate-test-coverage-report)
    - [Test Configuration](#test-configuration)
    - [Environment Variables for Testing](#environment-variables-for-testing)
    - [Common Test Commands Quick Reference](#common-test-commands-quick-reference)
    - [Test Suite Status](#test-suite-status)
    - [Troubleshooting](#troubleshooting)
  - [Testing Architecture](#testing-architecture)
    - [Common Test Utility Patterns](#common-test-utility-patterns)
      - [1. Domain-Specific Test Commons](#1-domain-specific-test-commons)
      - [2. What Each Domain Typically Needs](#2-what-each-domain-typically-needs)
    - [Best Practices for Different Domains](#best-practices-for-different-domains)
    - [When to Create Test Commons](#when-to-create-test-commons)
    - [Reference/Code Mapping Data VS Application/User Data](#referencecode-mapping-data-vs-applicationuser-data)
      - [Two Types of Data - Two Different Strategies](#two-types-of-data---two-different-strategies)
    - [Recommended Test Setup Strategy](#recommended-test-setup-strategy)
  - [Testing Notes \& Gotchas](#testing-notes--gotchas)
    - [Setup Best Practices](#setup-best-practices)
    - [Common Jest Methods](#common-jest-methods)
    - [`app.test.js`](#apptestjs)
    - [`db.js`](#dbjs)
    - [`models/_testCommon.js`](#models_testcommonjs)
      - [Why It Uses Direct SQL Instead of Model Methods](#why-it-uses-direct-sql-instead-of-model-methods)
      - [How It Enables Model Testing](#how-it-enables-model-testing)
      - [The Transaction Pattern](#the-transaction-pattern)
      - [Why `BCRYPT_WORK_FACTOR` Is Imported](#why-bcrypt_work_factor-is-imported)
      - [Value and Purpose](#value-and-purpose)
- [Overview of SNACRIS](#overview-of-snacris)
  - [Features Implemented](#features-implemented)
  - [Technology Stack](#technology-stack)
  - [DATABASE SCHEMA \& THIRD PARTY API DIAGRAMS (ACRIS)](#database-schema--third-party-api-diagrams-acris)
    - [DATABASE SCHEMA](#database-schema)
      - [Users \& Real Property](#users--real-property)
      - [Users \& Personal Property](#users--personal-property)
      - [Users \& Favorites](#users--favorites)
    - [ACRIS DATASETS (THIRD PARTY API)](#acris-datasets-third-party-api)
      - [Real Property (Overview)](#real-property-overview)
      - [Real Property - Master](#real-property---master)
      - [Real Property - Legals](#real-property---legals)
      - [Real Property - Parties](#real-property---parties)
      - [Real Property - References](#real-property---references)
      - [Real Property - Remarks](#real-property---remarks)
      - [Personal Property (Overview)](#personal-property-overview)
      - [Personal Property - Master](#personal-property---master)
      - [Personal Property - Legals](#personal-property---legals)
      - [Personal Property - Parties](#personal-property---parties)
      - [Personal Property - References](#personal-property---references)
      - [Personal Property - Remarks](#personal-property---remarks)
      - [Code Mappings - Document Control Codes](#code-mappings---document-control-codes)
      - [Code Mappings - UCC Collateral Codes](#code-mappings---ucc-collateral-codes)
      - [Code Mappings - Property Type Codes](#code-mappings---property-type-codes)
      - [Code Mappings - State (USA) Codes](#code-mappings---state-usa-codes)
      - [Code Mappings - Country Codes](#code-mappings---country-codes)
    - [Data Flow - User Perspective](#data-flow---user-perspective)
    - [Real Property \& Personal Property APIs](#real-property--personal-property-apis)
      - [Fetches from the Real Property Master ACRIS dataset using Socrata Query Language (SoQL) syntax.](#fetches-from-the-real-property-master-acris-dataset-using-socrata-query-language-soql-syntax)
      - [Fetches from the Personal Property Master ACRIS dataset using Socrata Query Language (SoQL) syntax.](#fetches-from-the-personal-property-master-acris-dataset-using-socrata-query-language-soql-syntax)
      - [Methods](#methods)
    - [Socrata Query Language (SoQL) Utility Class - `SoqlUrl.js`](#socrata-query-language-soql-utility-class---soqlurljs)
      - [Internal Helpers](#internal-helpers)
  - [`snacrisForms` routes](#snacrisforms-routes)
    - [Summary](#summary)
      - [`queryAcrisAddressParcel.js`](#queryacrisaddressparceljs)
        - [Purpose](#purpose)
        - [Helpers: `findUniqueFullRecords(records: object[]): object[]`](#helpers-finduniquefullrecordsrecords-object-object)
        - [`analyzeResults(records: object[]): object`](#analyzeresultsrecords-object-object)
        - [Route: `GET /fetchRecord`](#route-get-fetchrecord)
        - [Response](#response)
      - [`queryAcrisPartyName.js`](#queryacrispartynamejs)
        - [Route: `GET /fetchRecord`](#route-get-fetchrecord-1)
        - [URL: `/snacrisForms/party-name/fetchRecord`](#url-snacrisformsparty-namefetchrecord)
        - [Query Parameters](#query-parameters)
        - [Response](#response-1)

# How to run the application

## Prerequisites

Before running the SNACRIS backend server, ensure you have:

1. **Node.js** installed (version 22.x as specified in package.json)
2. **PostgreSQL** database server running
3. **Database** created (`snacris` for development, `snacris_test` for testing)
4. **Dependencies** installed

## Environment Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

#### Create Development Database

```bash
# Connect to PostgreSQL and create development database
createdb snacris
```

#### Set Up Database Schema

```bash
# Navigate to the sql directory and run schema setup
psql -d snacris -f sql/snacris.sql
```

#### Optional: Set Up Test Database

```bash
# Create test database for running tests
createdb snacris_test
psql -d snacris_test -f sql/snacris.sql
```

### 3. Environment Variables

Create a `.env` file in the root directory (optional - the application has sensible defaults):

```bash
# .env file (optional)
SECRET_KEY=your-secret-key-here
PORT=3001
DATABASE_URL=postgresql://username:password@localhost/snacris

# For production deployment (e.g., Supabase)
# DATABASE_URL=postgresql://user:password@host:port/database

# Optional: Override bcrypt work factor (default: 12 for production, 1 for tests)
# BCRYPT_WORK_FACTOR=12
```

**Default Configuration (if no .env file is provided):**

- `SECRET_KEY`: "secret-dev"
- `PORT`: 3001
- `DATABASE_URL`: "snacris" (local PostgreSQL database)
- `BCRYPT_WORK_FACTOR`: 12 (production), 1 (tests)

## Running the Application

### Development Mode

```bash
# Start the server in development mode with auto-restart
npm run dev
```

This uses `nodemon` to automatically restart the server when files change.

### Production Mode

```bash
# Start the server in production mode
npm start
```

### Verify the Server is Running

Once started, you should see output similar to:

```bash
Snacris Config:
SECRET_KEY: secret-dev
PORT: 3001
BCRYPT_WORK_FACTOR: 12
Database: snacris
---
Started on http://localhost:3001
```

The server will be available at: `http://localhost:3001`

## API Endpoints

Once running, the following main endpoints are available:

### Authentication Routes

- `POST /auth/register` - User registration
- `POST /auth/token` - User login

### User Management Routes

- `GET /users` - List users (admin only)
- `GET /users/:username` - Get user details
- `PATCH /users/:username` - Update user
- `DELETE /users/:username` - Delete user

### Organization Routes

- `/organizations/*` - Organization management endpoints

### ACRIS Query Routes (Search Forms)

- `/queryAcrisAddressParcel` - Search by address/parcel
- `/queryAcrisParcel` - Search by parcel (BBL)
- `/queryAcrisDocIdCrfn` - Search by Document ID or CRFN
- `/queryAcrisPartyName` - Search by party name
- `/queryAcrisDocumentType` - Search by document type
- `/queryAcrisTransactionNumber` - Search by transaction number
- `/queryAcrisReelPage` - Search legacy reel/page records
- `/queryAcrisUccFedLienNum` - Search UCC/Federal lien numbers

### ACRIS Data API Routes (Direct Data Access)

#### Real Property APIs

- `/realPropertyMaster` - Real property master records
- `/realPropertyLegals` - Real property legal descriptions
- `/realPropertyParties` - Real property parties (buyers/sellers)
- `/realPropertyRemarks` - Real property remarks
- `/realPropertyReferences` - Real property references

#### Personal Property APIs

- `/persPropertyMaster` - Personal property master records
- `/persPropertyLegals` - Personal property legal descriptions
- `/persPropertyParties` - Personal property parties
- `/persPropertyRemarks` - Personal property remarks
- `/persPropertyReferences` - Personal property references

#### Code Mapping APIs

- Code mapping endpoints for document types, property types, etc.

### Database/Saved Records Routes

- Database routes for managing user's saved property records and favorites

**Note:** Most API endpoints require authentication via JWT token. Include the token in the Authorization header:

```
Authorization: Bearer your-jwt-token-here
```

## Database Connection Architecture

The application uses **PostgreSQL connection pooling** (`pg.Pool`) for reliable database connections:

- **Development**: Up to 10 concurrent connections
- **Production**: Up to 20 concurrent connections with SSL
- **Automatic cleanup**: Pool manages connection lifecycle
- **Environment-aware**: Automatically detects local vs. hosted databases (e.g., Supabase)

## Common Issues & Solutions

### Port Already in Use

If port 3001 is already in use:

```bash
# Kill process using port 3001
sudo lsof -ti:3001 | xargs kill -9

# Or use a different port
PORT=3002 npm start
```

### Database Connection Issues

1. **Ensure PostgreSQL is running:**

   ```bash
   # Check if PostgreSQL is running
   sudo systemctl status postgresql

   # Start PostgreSQL if needed
   sudo systemctl start postgresql
   ```

2. **Verify database exists:**

   ```bash
   psql -l | grep snacris
   ```

3. **Check database permissions:**
   ```bash
   # Connect to test database access
   psql -d snacris -c "SELECT 1;"
   ```

### Environment Variables Not Loading

1. Ensure `.env` file is in the root directory (same level as `package.json`)
2. Check that `.env` is not in `.gitignore` if you want to commit it
3. Restart the server after making `.env` changes

## Production Deployment

### Supabase/Hosted Database

For hosted databases (like Supabase), use the full connection string:

```bash
DATABASE_URL=postgresql://user:password@host:port/database?option=value
```

### Heroku/Vercel Deployment

The application is configured for deployment on platforms like Heroku or Vercel:

- `Procfile` is included for Heroku deployment
- `vercel.json` is included for Vercel deployment
- Environment variables should be set in the platform's configuration

# Testing

## How to run tests

### Prerequisites

Before running tests, ensure you have:

1. **Node.js** installed (version 22.x as specified in package.json)
2. **PostgreSQL** database server running
3. **Test database** created (`snacris_test`)
4. **Dependencies** installed

### Setup Test Environment

1. **Install dependencies** (if not already done):

   ```bash
   npm install
   ```

2. **Create test database**:

   ```bash
   # Connect to PostgreSQL and create test database
   createdb snacris_test
   ```

3. **Set up test database schema** (run the SQL schema files):
   ```bash
   # Navigate to the sql directory and run schema setup
   psql -d snacris_test -f sql/snacris.sql
   ```

### Running Tests

#### Run All Tests

```bash
npm test
```

This command runs all test files using Jest with the `-i` flag (serial execution).

#### Run Specific Test Files

```bash
# Run a specific test file
npx jest config.test.js

# Run app tests
npx jest app.test.js

# Run user model tests
npx jest models/user.test.js

# Run authentication tests
npx jest middleware/auth.test.js
```

#### Run Tests with Verbose Output

```bash
# See detailed test results
npx jest --verbose

# Run specific test with verbose output
npx jest config.test.js --verbose
```

#### Run Tests in Watch Mode (for development)

```bash
# Automatically re-run tests when files change
npx jest --watch

# Watch specific test file
npx jest config.test.js --watch
```

#### Generate Test Coverage Report

```bash
# Generate coverage report
npx jest --coverage

# View coverage in browser (opens coverage/lcov-report/index.html)
open coverage/lcov-report/index.html
```

### Test Configuration

The Jest configuration in `package.json`:

```json
{
  "scripts": {
    "test": "NODE_ENV=test jest -i"
  },
  "jest": {
    "testPathIgnorePatterns": ["/node_modules/", "config.js"],
    "setupFilesAfterEnv": ["<rootDir>/jest.setup.js"]
  }
}
```

**Key Points:**

- **`NODE_ENV=test`**: Ensures test environment configuration and test database usage
- **`-i` flag**: Runs tests serially (one at a time) to prevent database conflicts
- **`testPathIgnorePatterns`**: Excludes `config.js` from being treated as a test file
- **`setupFilesAfterEnv`**: Uses Jest setup file for global test configuration
- **Test files**: Must end with `.test.js` to be automatically detected

**Database Connection Pooling:**
The application uses PostgreSQL connection pooling (`pg.Pool`) for reliable database connections:

- **Test environment**: Limited to 5 connections maximum for efficiency
- **Development environment**: Uses up to 10 connections
- **Production environment**: Supports up to 20 connections with SSL configuration
- **Automatic cleanup**: Pool connections are properly managed and cleaned up after tests

### Environment Variables for Testing

During testing, ensure these environment variables are properly set:

```bash
# Test environment
NODE_ENV=test

# Test database (automatically used when NODE_ENV=test)
# DATABASE_URL is ignored in test mode - uses "snacris_test" database
```

### Common Test Commands Quick Reference

| Command                        | Description              |
| ------------------------------ | ------------------------ |
| `npm test`                     | Run all tests            |
| `npx jest --watch`             | Run tests in watch mode  |
| `npx jest --verbose`           | Run with detailed output |
| `npx jest --coverage`          | Generate coverage report |
| `npx jest <filename>`          | Run specific test file   |
| `npx jest --detectOpenHandles` | Debug hanging tests      |

### Test Suite Status

**Test Suite Modernization & Database Connection Pooling (December 2024):**

The SNACRIS backend test suite has been fully modernized and cleaned up:

✅ **All legacy references removed** - No more job/application logic from previous projects
✅ **Standardized test data** - All tests use seeded users (`testuser`, `testadmin`)
✅ **Consistent patterns** - All model and route tests follow the same structure
✅ **Proper environment configuration** - `NODE_ENV=test` ensures test database usage
✅ **Clean output** - Removed debug noise for better test readability
✅ **Robust database connection pooling** - Switched from single Client to Pool for reliable connections
✅ **All tests pass reliably** - 17/17 test suites, 194/194 tests pass consistently

**Database Connection Improvements:**

- Migrated from `pg.Client` to `pg.Pool` for all environments (test, development, production)
- Added proper connection pooling configuration with timeouts and connection limits
- Eliminated intermittent SASL connection errors that previously affected test reliability
- Enhanced compatibility with Supabase-hosted database environments

### Troubleshooting

**Tests hanging or not completing:**

```bash
# Debug hanging tests
npx jest --detectOpenHandles

# Force exit after tests
npx jest --forceExit
```

**Database connection issues:**

- Ensure PostgreSQL is running
- Verify `snacris_test` database exists
- Check database permissions
- Confirm environment variables are properly set

**Database Connection Pooling:**

The application now uses robust PostgreSQL connection pooling (`pg.Pool`) instead of single client connections. This provides:

- **Reliable connections**: Eliminates previous intermittent connection errors
- **Better resource management**: Automatic connection cleanup and reuse
- **Environment-aware configuration**: Optimized settings for test, development, and production
- **Supabase compatibility**: Works seamlessly with hosted database environments

**Previous Connection Issues (Resolved):**
Earlier versions experienced intermittent "expected SASL response, got message type 88" errors due to improper connection management. This has been completely resolved with the new pooling implementation.

**Port conflicts:**

- Tests may start a server on port 3001
- Ensure the port is available

**Test Environment Setup:**

If tests fail to run, verify:

1. `NODE_ENV=test` is set (handled automatically by npm test script)
2. Test database `snacris_test` exists and is accessible
3. Jest setup file (`jest.setup.js`) is configured correctly
4. All dependencies are installed: `npm install`

## Testing Architecture

### Common Test Utility Patterns

#### 1. Domain-Specific Test Commons

Different parts of your application often need different test setups:

tests/
├── \_testCommon.js # Global utilities (app-wide)
├── models/
│ └── \_testCommon.js # Database setup & test data
├── routes/
│ └── \_testCommon.js # Express app & request helpers
├── middleware/
│ └── \_testCommon.js # Auth tokens & middleware setup
└── schemas/
└── \_testCommon.js # Schema validation helpers

#### 2. What Each Domain Typically Needs

Routes Testing (`_testCommon.js`):

```js
const request = require("supertest");
const app = require("../app");
const { createToken } = require("../helpers/tokens");

// Create test users with different permission levels
const testUsers = {
  admin: { username: "admin", isAdmin: true },
  user: { username: "testuser", isAdmin: false },
  anon: null,
};

// Generate auth tokens for testing
const testTokens = {
  admin: createToken(testUsers.admin),
  user: createToken(testUsers.user),
  invalid: "invalid-jwt-token",
};

// Helper for authenticated requests
function authenticatedRequest(app, token) {
  return request(app).set("authorization", `Bearer ${token}`);
}

module.exports = {
  testUsers,
  testTokens,
  authenticatedRequest,
};
```

Schemas Testing (`schemas/_testCommon.js`):

```js
// Valid test data objects
const validUserData = {
  username: "testuser",
  password: "password123",
  firstName: "Test",
  lastName: "User",
  email: "test@test.com",
};

// Invalid test data for error testing
const invalidUserData = {
  missingUsername: { password: "test", firstName: "Test" },
  invalidEmail: { username: "test", email: "not-an-email" },
  shortPassword: { username: "test", password: "abc" },
};

module.exports = {
  validUserData,
  invalidUserData,
};
```

Middleware Testing (`middleware/_testCommon.js`):

```js
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

// Create mock request/response objects
function createMockReq(token = null) {
  return {
    headers: token ? { authorization: `Bearer ${token}` } : {},
    body: {},
    params: {},
  };
}

function createMockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.locals = {};
  return res;
}

// Create test tokens
const validToken = jwt.sign({ username: "testuser" }, SECRET_KEY);
const expiredToken = jwt.sign({ username: "testuser" }, SECRET_KEY, {
  expiresIn: "-1h",
});

module.exports = {
  createMockReq,
  createMockRes,
  validToken,
  expiredToken,
};
```

### Best Practices for Different Domains

1. Schema Testing

For testing JSON schemas, you'd typically create:

```js
// schemas/_testCommon.js
const validData = {
  userRegister: {
    username: "newuser",
    password: "password123",
    firstName: "New",
    lastName: "User",
    email: "new@user.com",
  },
  userAuth: {
    username: "testuser",
    password: "password123",
  },
};

const invalidData = {
  userRegister: {
    missingUsername: { password: "test", firstName: "Test" },
    invalidEmail: { username: "test", email: "not-email" },
    shortPassword: { username: "test", password: "ab" },
  },
};

module.exports = { validData, invalidData };
```

2. API/Third-Party Testing

For testing external API integrations:

```js
// thirdPartyApi/_testCommon.js
const nock = require("nock"); // For mocking HTTP requests

function mockAcrisApi() {
  return nock("https://data.cityofnewyork.us")
    .get("/resource/bnx9-e6tj.json")
    .query(true)
    .reply(200, mockAcrisResponse);
}

const mockAcrisResponse = [
  { document_id: "2022123456789", crfn: "2022000123456" },
];

module.exports = { mockAcrisApi, mockAcrisResponse };
```

3. Middleware Testing

Your middleware tests would benefit from:

```js
// middleware/_testCommon.js
const { createToken } = require("../helpers/tokens");

const mockNext = jest.fn();

function createMockReq(overrides = {}) {
  return {
    headers: {},
    body: {},
    params: {},
    ...overrides,
  };
}

function createMockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.locals = {};
  return res;
}

// Test tokens for different scenarios
const testTokens = {
  valid: createToken({ username: "testuser", isAdmin: false }),
  admin: createToken({ username: "admin", isAdmin: true }),
  expired: "expired.jwt.token",
  malformed: "not.a.jwt",
};

module.exports = {
  mockNext,
  createMockReq,
  createMockRes,
  testTokens,
};
```

### When to Create Test Commons

✅ **DO create when you have:**

- Repeated setup/teardown logic
- Common test data structures
- Shared utilities across multiple test files
- Domain-specific mocking needs

❌ **DON'T create when:**

- Only one test file needs the utilities
- Setup is very simple (1-2 lines)
- Test data is highly specific to individual tests

**Professional Benefits**

1. DRY Principle: Avoid repeating setup code
2. Consistency: Same test data across related tests
3. Maintainability: Change test data in one place
4. Readability: Tests focus on behavior, not setup
5. Performance: Shared utilities can be optimized once

### Reference/Code Mapping Data VS Application/User Data

#### Two Types of Data - Two Different Strategies

1. Reference/Code Mapping Data (Assume Pre-seeded)

For testing purposes the files below are ASSUMED to be **"pre-seeded"** because they are reference data from the five ACRIS datasets which are used to query the other 10 ACRIS APIs associated with **Real Property** and **Personal Property**. These datasets rarely change and are essentially part of the "configuration" for my application. Testing them would only verify SQL insertion and not business logic so they are seeded once during test database setup.

- `seed_acris_country_codes.sql`
- `seed_acris_document_control_codes.sql`
- `seed_acris_property_type_codes.sql`
- `seed_acris_ucc_collateral_type_codes.sql`
- `seed_acris_usa_state_codes.sql`

2. Application/User Data (Create Fresh in Tests)

For testing purposes the files below are CREATED in each test suite because (i) this data is manipulated by my application, (ii) tests need predictable and isolated starting states and (iii) different test suites may need different user scenarios.

### Recommended Test Setup Strategy

| Data Type        | Example                     | Strategy         | Why                                   |
| ---------------- | --------------------------- | ---------------- | ------------------------------------- |
| Reference Data   | Country codes, State codes  | ✅ Assume exists | Static lookup data, seeded once       |
| Seeded Users     | testuser, testadmin         | ✅ Use in tests  | Realistic users with proper passwords |
| Temp Test Data   | tempnewuser                 | ✅ Create/clean  | For testing SQL operations            |
| Application Data | Saved properties, favorites | ✅ Create fresh  | Business logic data, needs isolation  |

## Testing Notes & Gotchas

### Setup Best Practices

1. **Database Isolation**: Tests use `snacris_test` database
2. **Serial Execution**: `-i` flag prevents database conflicts
3. **Proper Cleanup**: `afterAll()` closes database connections
4. **Environment Testing**: `config.test.js` verifies different environments work
5. **Integration Testing**: `app.test.js` tests actual HTTP endpoints

### Common Jest Methods

```js
// Grouping tests
describe("User model", () => {
  // Individual test
  test("can create user", async () => {
    // Assertions
    expect(result).toEqual(expectedValue);
    expect(result).toBe(exactValue);
    expect(result).toBeNull();
    expect(result).toBeTruthy();
    expect(array).toContain(item);
    expect(() => badFunction()).toThrow();
  });
});

// Setup and teardown
beforeAll(() => {
  /* runs once before all tests */
});
afterAll(() => {
  /* runs once after all tests */
});
beforeEach(() => {
  /* runs before each test */
});
afterEach(() => {
  /* runs after each test */
});
```

### `app.test.js`

This file tests the Express application.

### `db.js`

The `db.js` file creates a database connection pool that's environment-aware. In the **Testing Context**:

1. When tests run, `NODE_ENV` is typically set to **"test"**.
2. When `getDatabaseUri()` returns **"snacris_test"** (separate test database).
3. Tests use the test database to avoid affecting production/development data.
4. **Connection pooling** ensures reliable database connections with automatic cleanup.
5. Test environment uses a smaller connection pool (max 5 connections) for efficiency.
6. Pool connections are properly managed and cleaned up after tests complete.

**Database Connection Architecture:**

- **Production**: Uses `pg.Pool` with SSL and up to 20 connections
- **Development**: Uses `pg.Pool` with up to 10 connections
- **Test**: Uses `pg.Pool` with up to 5 connections for optimal test performance
- **Automatic cleanup**: Pool handles connection lifecycle and prevents connection leaks

### `models/_testCommon.js`

This is a **shared test utility file** that provides consistent database setup and teardown for all the model tests. It's not a test file itself - it's a helper that other test files import and use.

#### Why It Uses Direct SQL Instead of Model Methods

This is a **strong** testing strategy! Here's why:

1. Test Data Isolation

- Problem: If you used model methods to set up test data, and those model methods have bugs, your test setup would be unreliable
- Solution: Use direct SQL to ensure test data is inserted correctly, regardless of model bugs

2. Known State Guarantee

- Every test starts with exactly the same data
- Tests don't interfere with each other because of the transaction rollback pattern

3. Performance

- Direct SQL is faster than going through model methods
- Transaction rollback is much faster than deleting/recreating data

#### How It Enables Model Testing

`user.test.js` uses this setup:

```js
describe("authenticate", function () {
  test("works", async function () {
    // This test can rely on user 'u1' existing with password 'password1'
    // because _testCommon.js created it
    const user = await User.authenticate("u1", "password1");
    expect(user).toEqual({
      username: "u1",
      firstName: "U1F",
      // ... etc
    });
  });
});
```

#### The Transaction Pattern

The `BEGIN`/`ROLLBACK` pattern is a good practice because:

1. Before each test: Start a transaction with `BEGIN`
2. During test: Model methods can INSERT/UPDATE/DELETE data
3. After each test: `ROLLBACK` undoes ALL changes
4. Next test: Starts with the original clean data again

This means:

- Tests never affect each other
- No need to manually clean up test data
- Each test runs in complete isolation

#### Why `BCRYPT_WORK_FACTOR` Is Imported

This ensures test passwords are hashed with the same settings as the application uses, making the tests realistic.

```js
const { BCRYPT_WORK_FACTOR } = require("../config");

// Used here to hash passwords for test users
await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
```

#### Value and Purpose

This pattern provides:

1. **Reliable test data** - Every test knows exactly what data exists
2. **Test isolation** - Tests don't interfere with each other
3. **Performance** - Fast setup/teardown using transactions
4. **Consistency** - All model tests use the same data foundation
5. **Maintainability** - Change test data in one place affects all tests

# Overview of SNACRIS

- Unified Data Layer
  15 APIs under the hood:

Real-Property (master, legals, parties, references, remarks)

Personal-Property (master, legals, parties, references, remarks)

Code Mappings (document classes, document types, boroughs, party types, UCC codes, etc.)

Code Mappings tables are pre-seeded from JSON key/value pairs to drive dropdowns and validate inputs when querying the Real- and Personal-Property endpoints.

- Search By Party Name
  Mirrors ACRIS’s “Name” search:

Free-form individual (Last, First, MI, Suffix) or business name entry (all-caps).

Partial match on leading substrings (e.g. “SMI” returns SMITH, SMILEY, etc.).

Date range, Party type (Grantor/Grantee, Borrower/Lender…), and Borough filters.

Dropdowns populated dynamically from Code Mappings (party roles, borough list).

- Search By Parcel Identifier (BBL)
  Borough–Block–Lot (+ unit):

Exact BBL → returns all records for that parcel.

BBL + unit → returns matching unit-level records.

Block only (lot=0000) → returns all lots in block.

Date range & Document class filters via Code Mappings.

- Search By Document Type & Class
  Document Class dropdown (e.g. Deeds, Mortgages, Liens)

Document Type dropdown, filtered by chosen class

Date range (max 30 days) and Borough qualifiers

- Search By Document ID / CRFN
  Enter either the 16-char Document ID or City Register File Number.

Returns the single cover‐page record with full metadata.

- Search By Transaction Number
  Returns all docs sharing the same Transaction Number (grouping of related filings).

- Legacy Searches
  Reel & Page (pre-ACRIS records, by Borough + Year + Reel + Page).

UCC / Federal Lien File Number (pre-2003 lien docs, by Borough + File Number).

## Features Implemented

- “Favorite” & “Save” Workflows
  After any search, users can bookmark:

Entire document (all five sub-tables)

Single Party Name or Party Contact

Parcel Identifier (BBL)

Favorites persist via user-scoped tables (saved_party_names, saved_party_contacts, saved_properties) and reload automatically as dropdown/autocomplete options.

## Technology Stack

Front End: React + TypeScript, dynamic forms & results tables

Back End: Node.js/Express + PostgreSQL, with REST endpoints for each of the 15 APIs

Data Modeling: 10 relational tables for Real & Personal Property, plus 3 “favorites” tables and Code Mappings

Authentication: JWT Authentication with per-user favorites and CRUD

SNACRIS brings ACRIS’s full power to a modern web stack, enriched with code-driven dropdowns, “save for later” workflows, and a unified developer-friendly API layer.

## DATABASE SCHEMA & THIRD PARTY API DIAGRAMS (ACRIS)

### DATABASE SCHEMA

#### Users & Real Property

```mermaid
erDiagram
    USERS {
        VARCHAR username PK "Primary Key"
        TEXT password
        TEXT first_name
        TEXT last_name
        TEXT email
        BOOLEAN is_admin
    }
    SAVED_REAL_PROPERTY_MASTER {
        SERIAL id PK
        VARCHAR username FK "references USERS.username"
        VARCHAR document_id
        CHAR record_type
        VARCHAR crfn
        INT recorded_borough
        VARCHAR doc_type
        DATE document_date
        DECIMAL document_amt
        TIMESTAMP recorded_datetime
        TIMESTAMP modified_date
        INT reel_yr
        INT reel_nbr
        INT reel_pg
        DECIMAL percent_trans
        DATE good_through_date
        TIMESTAMP saved_at
    }
    SAVED_REAL_PROPERTY_LEGALS {
        SERIAL id PK
        INT saved_master_id FK "references SAVED_REAL_PROPERTY_MASTER.id"
        CHAR record_type
        INT borough
        INT block
        INT lot
        CHAR easement
        CHAR partial_lot
        CHAR air_rights
        CHAR subterranean_rights
        CHAR property_type
        VARCHAR street_number
        VARCHAR street_name
        VARCHAR unit_address
        DATE good_through_date
    }
    SAVED_REAL_PROPERTY_PARTIES {
        SERIAL id PK
        INT saved_master_id FK "references SAVED_REAL_PROPERTY_MASTER.id"
        INT party_index
        CHAR record_type
        CHAR party_type
        VARCHAR name
        VARCHAR address_1
        VARCHAR address_2
        CHAR country
        VARCHAR city
        CHAR state
        VARCHAR zip
        DATE good_through_date
    }
    SAVED_REAL_PROPERTY_REFERENCES {
        SERIAL id PK
        INT saved_master_id FK "references SAVED_REAL_PROPERTY_MASTER.id"
        CHAR record_type
        VARCHAR reference_by_crfn
        VARCHAR reference_by_doc_id
        INT reference_by_reel_year
        INT reference_by_reel_borough
        INT reference_by_reel_nbr
        INT reference_by_reel_page
        DATE good_through_date
    }
    SAVED_REAL_PROPERTY_REMARKS {
        SERIAL id PK
        INT saved_master_id FK "references SAVED_REAL_PROPERTY_MASTER.id"
        CHAR record_type
        INT sequence_number
        VARCHAR remark_text
        DATE good_through_date
    }

    USERS ||--o{ SAVED_REAL_PROPERTY_MASTER : "owns"
    SAVED_REAL_PROPERTY_MASTER ||--|{ SAVED_REAL_PROPERTY_LEGALS : "has one"
    SAVED_REAL_PROPERTY_MASTER ||--|{ SAVED_REAL_PROPERTY_PARTIES : "has many"
    SAVED_REAL_PROPERTY_MASTER ||--o{ SAVED_REAL_PROPERTY_REFERENCES : "has zero or one"
    SAVED_REAL_PROPERTY_MASTER ||--o{ SAVED_REAL_PROPERTY_REMARKS : "has zero or one"
```

#### Users & Personal Property

```mermaid
erDiagram
    USERS {
        VARCHAR username PK "Primary Key"
        TEXT password
        TEXT first_name
        TEXT last_name
        TEXT email
        BOOLEAN is_admin
    }
    SAVED_PERSONAL_PROPERTY_MASTER {
        SERIAL id PK
        VARCHAR username FK "references USERS.username"
        VARCHAR document_id
        CHAR record_type
        VARCHAR crfn
        INT recorded_borough
        VARCHAR doc_type
        DECIMAL document_amt
        TIMESTAMP recorded_datetime
        CHAR ucc_collateral
        VARCHAR fedtax_serial_nbr
        TIMESTAMP fedtax_assessment_date
        INT rpttl_nbr
        TIMESTAMP modified_date
        INT reel_yr
        INT reel_nbr
        INT reel_pg
        VARCHAR file_nbr
        DATE good_through_date
        TIMESTAMP saved_at
    }
    SAVED_PERSONAL_PROPERTY_LEGALS {
        SERIAL id PK
        INT saved_master_id FK "references SAVED_PERSONAL_PROPERTY_MASTER.id"
        CHAR record_type
        INT borough
        INT block
        INT lot
        CHAR easement
        CHAR partial_lot
        CHAR air_rights
        CHAR subterranean_rights
        CHAR property_type
        VARCHAR street_number
        VARCHAR street_name
        VARCHAR addr_unit
        DATE good_through_date
    }
    SAVED_PERSONAL_PROPERTY_PARTIES {
        SERIAL id PK
        INT saved_master_id FK "references SAVED_PERSONAL_PROPERTY_MASTER.id"
        INT party_index
        CHAR record_type
        CHAR party_type
        VARCHAR name
        VARCHAR address_1
        VARCHAR address_2
        CHAR country
        VARCHAR city
        CHAR state
        VARCHAR zip
        DATE good_through_date
    }
    SAVED_PERSONAL_PROPERTY_REFERENCES {
        SERIAL id PK
        INT saved_master_id FK "references SAVED_PERSONAL_PROPERTY_MASTER.id"
        CHAR record_type
        VARCHAR crfn
        VARCHAR doc_id_ref
        VARCHAR file_nbr
        DATE good_through_date
    }
    SAVED_PERSONAL_PROPERTY_REMARKS {
        SERIAL id PK
        INT saved_master_id FK "references SAVED_PERSONAL_PROPERTY_MASTER.id"
        CHAR record_type
        INT sequence_number
        VARCHAR remark_text
        DATE good_through_date
    }

    USERS ||--o{ SAVED_PERSONAL_PROPERTY_MASTER : "owns"
    SAVED_PERSONAL_PROPERTY_MASTER ||--|{ SAVED_PERSONAL_PROPERTY_LEGALS : "has one"
    SAVED_PERSONAL_PROPERTY_MASTER ||--|{ SAVED_PERSONAL_PROPERTY_PARTIES : "has many"
    SAVED_PERSONAL_PROPERTY_MASTER ||--o{ SAVED_PERSONAL_PROPERTY_REFERENCES : "has zero or one"
    SAVED_PERSONAL_PROPERTY_MASTER ||--o{ SAVED_PERSONAL_PROPERTY_REMARKS : "has zero or one"
```

#### Users & Favorites

```mermaid
erDiagram
    USERS {
        VARCHAR username PK "Primary Key"
        TEXT password
        TEXT first_name
        TEXT last_name
        TEXT email
        BOOLEAN is_admin
    }
    SAVED_PARTY_NAMES {
        SERIAL id PK
        VARCHAR username FK "references USERS.username"
        VARCHAR name
        TIMESTAMP saved_at
    }
    SAVED_PARTY_CONTACTS {
        SERIAL id PK
        VARCHAR username FK "references USERS.username"
        VARCHAR name
        VARCHAR address_1
        VARCHAR address_2
        VARCHAR city
        CHAR state
        VARCHAR zip
        CHAR country
        TIMESTAMP saved_at
    }
    SAVED_PROPERTIES {
        SERIAL id PK
        VARCHAR username FK "references USERS.username"
        INTEGER borough
        INTEGER block
        INTEGER lot
        TIMESTAMP saved_at
    }

    USERS ||--o{ SAVED_PARTY_NAMES    : "saves"
    USERS ||--o{ SAVED_PARTY_CONTACTS : "saves"
    USERS ||--o{ SAVED_PROPERTIES     : "saves"
```

### ACRIS DATASETS (THIRD PARTY API)

#### Real Property (Overview)

NB--> Include this overview in the backend folder located here `snacris--backend/thirdPartyApi/acris/real-property/`

```mermaid
erDiagram
    REAL_PROPERTY_MASTER {
        TEXT document_id "primary key"
    }
    REAL_PROPERTY_LEGALS {
        TEXT document_id "foreign key"
    }
    REAL_PROPERTY_PARTIES {
        TEXT document_id "foreign key"
    }
    REAL_PROPERTY_REFERENCES {
        TEXT document_id "foreign key"
    }
    REAL_PROPERTY_REMARKS {
        TEXT document_id "foreign key"
    }
    REAL_PROPERTY_MASTER ||--|| REAL_PROPERTY_LEGALS : "document_id"
    REAL_PROPERTY_MASTER ||--|| REAL_PROPERTY_PARTIES : "document_id"
    REAL_PROPERTY_MASTER ||--|| REAL_PROPERTY_REFERENCES : "document_id"
    REAL_PROPERTY_MASTER ||--|| REAL_PROPERTY_REMARKS : "document_id"
```

#### Real Property - Master

```mermaid
erDiagram
    ACRIS_REAL_PROPERTY_MASTER {
        TEXT document_id "16 characters, Format: CCCNNNNNNNNNNNNN"
        TEXT record_type "1 character, Format: ‘A’ for master record"
        TEXT crfn "13 characters, Format: YYYYNNNNNNNNN"
        NUMBER recorded_borough "1 character, 1=Manhattan, 2=Bronx, 3=Brooklyn, 4=Queens, 5=Staten Island"
        TEXT doc_type "8 characters, Specific type of instrument"
        TEXT document_date "10 characters, Format: MM/DD/YYYY"
        NUMBER document_amt "16 digits with 2 decimal places, Total consideration for transfers"
        TEXT recorded_datetime "10 characters, Format: MM/DD/YYYY"
        TEXT modified_date "10 characters, Format: MM/DD/YYYY"
        NUMBER reel_yr "4 digits, Pre-ACRIS reel year"
        NUMBER reel_nbr "5 digits, Pre-ACRIS reel number"
        NUMBER reel_pg "5 digits, Pre-ACRIS reel page"
        NUMBER percent_trans "9 digits with 6 decimal places, Percentage of interest transferred"
        TEXT good_through_date "10 characters, Format: MM/DD/YYYY"
    }
```

#### Real Property - Legals

```mermaid
erDiagram
    REAL_PROPERTY_LEGALS {
        TEXT document_id "16 characters, Format: CCCNNNNNNNNNNNNN"
        TEXT record_type "1 character,  ‘L’ for lot record"
        NUMBER borough "1 digit, 1=Manhattan, 2=Bronx, 3=Brooklyn, 4=Queens, 5=Staten Island"
        NUMBER block "5 digits, Block number of instrument"
        NUMBER lot "4 digits, Lot number of instrument"
        TEXT easement "1 character, Y=yes, N=no"
        TEXT partial_lot "1 character, P=partial, E=entire, N=not applicable"
        TEXT air_rights "1 character, Y=yes, N=no"
        TEXT subterranean_rights "1 character, Y=yes, N=no"
        TEXT property_type "2 characters, Code defined in property codes record"
        TEXT street_number "12 characters, Street / House Number for BBL"
        TEXT street_name "32 characters, Street Name for BBL"
        TEXT unit "7 characters, Unit Number for BBL"
        TEXT good_through_date "10 characters, Format: MM/DD/YYYY"
    }
```

#### Real Property - Parties

```mermaid
erDiagram
    REAL_PROPERTY_PARTIES {
        TEXT document_id "16 characters, Format: CCCNNNNNNNNNNNNN"
        TEXT record_type "1 character, ‘P’ for party record"
        TEXT party_type "1 character, Party type code"
        TEXT name "70 characters, Name of party (typically last name, first name, middle initial suffix for individuals)"
        TEXT address_1 "60 characters, Name attention/address of party"
        TEXT address_2 "60 characters, Street address of party"
        TEXT country "2 characters, Country location of party"
        TEXT city "30 characters, City location of party"
        TEXT state "2 characters, State location of party"
        TEXT zip "9 characters, Zip code of party"
        TEXT good_through_date "10 characters, Format: MM/DD/YYYY"
    }
```

#### Real Property - References

```mermaid
erDiagram
    REAL_PROPERTY_REFERENCES {
        TEXT document_id "16 characters, Format: CCCNNNNNNNNNNNN - Document ID of Document making the Reference"
        TEXT record_type "1 character, ‘X’ for cross reference record"
        TEXT reference_by_crfn_ "13 characters, CRFN of Referenced Document"
        TEXT reference_by_doc_id "16 characters, Document ID of Referenced Document"
        NUMBER reference_by_reel_year "4 digits, Year of reel/page reference"
        NUMBER reference_by_reel_borough "1 digit, Borough of reel/page reference"
        NUMBER reference_by_reel_nbr "5 digits, Reel of reel/page reference"
        NUMBER reference_by_reel_page "5 digits, Page of reel/page reference"
        TEXT good_through_date "10 characters, Format: MM/DD/YYYY"
    }
```

#### Real Property - Remarks

```mermaid
erDiagram
    ACRIS_REAL_PROPERTY_REMARKS {
        TEXT document_id "16 characters, Format: CCCNNNNNNNNNNNN - Document ID of Document making the Reference"
        TEXT record_type "1 character, ‘R’ for remarks record"
        NUMBER sequence_number "2 digits, Number from 1-20"
        TEXT remark_text "232 characters, Portion of Remark for Given Sequence"
        TEXT good_through_date "10 characters, Format: MM/DD/YYYY"
    }
```

#### Personal Property (Overview)

NB --> Include this overview in the backend folder located here: `snacris--backend/thirdPartyApi/acris/personal-property`

```mermaid

erDiagram
    PERSONAL_PROPERTY_MASTER {
        TEXT document_id "primary key"
    }
    PERSONAL_PROPERTY_LEGALS {
        TEXT document_id "foreign key"
    }
    PERSONAL_PROPERTY_PARTIES {
        TEXT document_id "foreign key"
    }
    PERSONAL_PROPERTY_REFERENCES {
        TEXT document_id "foreign key"
    }
    PERSONAL_PROPERTY_REMARKS {
        TEXT document_id "foreign key"
    }
    PERSONAL_PROPERTY_MASTER ||--|| PERSONAL_PROPERTY_LEGALS : "document_id"
    PERSONAL_PROPERTY_MASTER ||--|| PERSONAL_PROPERTY_PARTIES : "document_id"
    PERSONAL_PROPERTY_MASTER ||--|| PERSONAL_PROPERTY_REFERENCES : "document_id"
    PERSONAL_PROPERTY_MASTER ||--|| PERSONAL_PROPERTY_REMARKS : "document_id"
```

#### Personal Property - Master

```mermaid
erDiagram
    PERSONAL_PROPERTY_MASTER {
        TEXT document_id "Document Identifier"
        TEXT record_type "A for Master Record"
        TEXT crfn "City Register File Number (CRFN)"
        NUMBER recorded_borough "Borough where document was recorded"
        TEXT doc_type "Specific type of instrument"
        NUMBER document_amt "Principal debt or obligation"
        DATETIME recorded_datetime "Legal date instrument was recorded"
        TEXT ucc_collateral "UCC Collateral code"
        TEXT fedtax_serial_nbr "Federal Tax Lien Serial Number"
        DATETIME fedtax_assessment_date "Federal tax Lien Assessment Date"
        NUMBER rpttl_nbr "Real Property Transfer Tax Return Number (RPTT #)"
        DATETIME modified_date "Date document was modified"
        NUMBER reel_yr "Pre-ACRIS reel year"
        NUMBER reel_nbr "Pre-ACRIS reel number"
        NUMBER reel_pg "Pre-ACRIS reel page"
        TEXT file_nbr "Pre-ACRIS file number"
        DATETIME good_through_date "Date of latest recording or correction included with this extract"
    }
```

#### Personal Property - Legals

```mermaid
erDiagram
    PERSONAL_PROPERTY_LEGALS {
        TEXT document_id "Document identifier"
        TEXT record_type "L for Legals Record"
        NUMBER borough "Borough Code: 1 = Manhattan, 2 = Bronx, 3 = Brooklyn, 4 = Queens"
        NUMBER block "Block number of instrument"
        NUMBER lot "Lot number of instrument"
        TEXT easement "Y = yes, N = no"
        TEXT partial_lot "P = partial, E = entire"
        TEXT air_rights "Y = yes, N = no"
        TEXT subterranean_rights "Y = yes, N = no"
        TEXT property_type "Code defined in property table"
        TEXT street_number "Street number for BBL"
        TEXT street_name "Street name for BBL"
        TEXT addr_unit "Unit number for BBL"
        DATETIME good_through_date "Date of latest recording or correction"
    }
```

#### Personal Property - Parties

```mermaid
erDiagram
    PERSONAL_PROPERTY_PARTIES {
        TEXT document_id "Document Identifier"
        TEXT record_type "P for Parties Record"
        TEXT party_type "Party type code"
        TEXT name "Name of party (last name, first name, middle initial suffix)"
        TEXT address_1 "Name attention/address of party"
        TEXT address_2 "Street address of party"
        TEXT country "Country location of party"
        TEXT city "City location of party"
        TEXT state "State location of party"
        TEXT zip "Zip code of party"
        DATETIME good_through_date "Date of latest recording or correction included with this extract"
    }
```

#### Personal Property - References

```mermaid
erDiagram
    PERSONAL_PROPERTY_REFERENCES {
        TEXT document_id "Document Identifier"
        TEXT record_type "X for Cross Reference Record"
        TEXT crfn "City Register File Number"
        TEXT doc_id_ref "Doc ID of reference"
        TEXT file_nbr "File number of reference"
        DATETIME good_through_date "Date of latest recording or correction included with this extract"
    }
```

#### Personal Property - Remarks

```mermaid
erDiagram
    PERSONAL_PROPERTY_REMARKS {
        TEXT document_id "Document Identifier"
        TEXT record_type "R for Remarks Record"
        NUMBER sequence_number "Number from 1-20"
        TEXT remark_text "Remarks"
        DATETIME good_through_date "Date of latest recording or correction included with this extract"
    }
```

#### Code Mappings - Document Control Codes

NB --> Include these relational ERD diagrams in the backend folder located here: `thirdPartyApi/acris/code-maps`

```mermaid
erDiagram
    DOCUMENT_CONTROL {
        TEXT record_type "‘D’ for Document control type record"
        TEXT doc__type "Doc type code (≤8 characters)"
        TEXT doc__type_description "Document type description (≤30 characters)"
        TEXT class_code_description "Document class description (≤30 characters)"
        TEXT party1_type "Party type 1 (≤20 characters)"
        TEXT party2_type "Party type 2 (≤20 characters)"
        TEXT party3_type "Party type 3 (≤20 characters)"
    }
    REAL_PROPERTY_MASTER {
        TEXT document_id "Primary key (16 characters)"
        TEXT doc_type "Foreign key to DOCUMENT_CONTROL"
    }
    PERSONAL_PROPERTY_MASTER {
        TEXT document_id "Primary key (16 characters)"
        TEXT doc_type "Foreign key to DOCUMENT_CONTROL"
    }
    REAL_PROPERTY_PARTIES {
        TEXT document_id "Foreign key to REAL_PROPERTY_MASTER"
        TEXT party_type "Indicates party role (1=party1, 2=party2, 3=party3)"
    }
    PERSONAL_PROPERTY_PARTIES {
        TEXT document_id "Foreign key to PERSONAL_PROPERTY_MASTER"
        TEXT party_type "Indicates party role (1=party1, 2=party2, 3=party3)"
    }
    DOCUMENT_CONTROL ||--|| REAL_PROPERTY_MASTER : "doc_type"
    DOCUMENT_CONTROL ||--|| PERSONAL_PROPERTY_MASTER : "doc_type"
    DOCUMENT_CONTROL ||--o| REAL_PROPERTY_PARTIES : "party1_type, party2_type, party3_type"
    DOCUMENT_CONTROL ||--o| PERSONAL_PROPERTY_PARTIES : "party1_type, party2_type, party3_type"
    REAL_PROPERTY_MASTER ||--|| REAL_PROPERTY_PARTIES : "document_id"
    PERSONAL_PROPERTY_MASTER ||--|| PERSONAL_PROPERTY_PARTIES : "document_id"
```

#### Code Mappings - UCC Collateral Codes

```mermaid
erDiagram
    PERSONAL_PROPERTY_MASTER {
        TEXT document_id "Primary Key - Document Identifier"
        TEXT record_type "Record type (A = Master Record)"
        TEXT doc_type "Specific type of instrument"
        NUMBER document_amt "Principal debt or obligation"
        DATETIME recorded_datetime "Date instrument was recorded"
        TEXT ucc_collateral "Foreign Key - UCC Collateral Code"
    }
    UCC_COLLATERAL {
        TEXT record_type "Record type (U = Collateral codes record)"
        TEXT ucc_collateral_code "Primary Key - UCC Collateral Code"
        TEXT description "UCC Collateral description (≤50 characters)"
    }
    PERSONAL_PROPERTY_MASTER ||--|| UCC_COLLATERAL : "ucc_collateral"
```

#### Code Mappings - Property Type Codes

```mermaid
erDiagram
    PROPERTY_TYPE {
        TEXT record_type "‘G’ for Property type record"
        TEXT property_type "Primary Key - Property type code (≤2 characters)"
        TEXT description "Property type description (≤40 characters)"
    }

    REAL_PROPERTY_LEGALS {
        TEXT document_id "Primary Key - Document Identifier"
        TEXT record_type "‘L’ for Lot Record"
        NUMBER borough "Borough Code (1-5)"
        NUMBER block "Block number"
        NUMBER lot "Lot number"
        TEXT easement "Y=yes, N=no"
        TEXT partial_lot "P=partial, E=entire, N=N/A"
        TEXT air_rights "Y=yes, N=no"
        TEXT subterranean_rights "Y=yes, N=no"
        TEXT property_type "Foreign Key - Property type code"
        TEXT street_number "Street number"
        TEXT street_name "Street name"
        TEXT unit "Unit number"
        TEXT good_through_date "Record validity date"
    }

    PERSONAL_PROPERTY_LEGALS {
        TEXT document_id "Primary Key - Document Identifier"
        TEXT record_type "‘L’ for Legals Record"
        NUMBER borough "Borough Code (1-5)"
        NUMBER block "Block number"
        NUMBER lot "Lot number"
        TEXT easement "Y=yes, N=no"
        TEXT partial_lot "P=partial, E=entire"
        TEXT air_rights "Y=yes, N=no"
        TEXT subterranean_rights "Y=yes, N=no"
        TEXT property_type "Foreign Key - Property type code"
        TEXT street_number "Street number"
        TEXT street_name "Street name"
        TEXT addr_unit "Unit number"
        DATETIME good_through_date "Record validity date"
    }

    %% Relationships based on shared property_type field
    PROPERTY_TYPE ||--|| REAL_PROPERTY_LEGALS : "property_type"
    PROPERTY_TYPE ||--|| PERSONAL_PROPERTY_LEGALS : "property_type"
```

#### Code Mappings - State (USA) Codes

```mermaid
erDiagram
    STATE_CODES {
        TEXT record_type "‘S’ for State codes type record"
        TEXT state_code "Primary Key - State code (≤2 characters)"
        TEXT description "State name (≤20 characters)"
    }
    REAL_PROPERTY_PARTIES {
        TEXT document_id "Primary Key - Document Identifier"
        TEXT record_type "‘P’ for Party Record"
        TEXT party_type "Party type code"
        TEXT name "Name of party"
        TEXT address_1 "Attention/address of party"
        TEXT address_2 "Street address of party"
        TEXT country "Country code"
        TEXT city "City name"
        TEXT state "Foreign Key - State code"
        TEXT zip "Zip code"
        TEXT good_through_date "Record validity date"
    }
    PERSONAL_PROPERTY_PARTIES {
        TEXT document_id "Primary Key - Document Identifier"
        TEXT record_type "‘P’ for Party Record"
        TEXT party_type "Party type code"
        TEXT name "Name of party"
        TEXT address_1 "Attention/address of party"
        TEXT address_2 "Street address of party"
        TEXT country "Country code"
        TEXT city "City name"
        TEXT state "Foreign Key - State code"
        TEXT zip "Zip code"
        DATETIME good_through_date "Record validity date"
    }
    STATE_CODES ||--|| REAL_PROPERTY_PARTIES : "state"
    STATE_CODES ||--|| PERSONAL_PROPERTY_PARTIES : "state"
```

#### Code Mappings - Country Codes

```mermaid
erDiagram
    COUNTRY_CODES {
        TEXT record_type "‘T’ for Country type record"
        TEXT country_code "Primary Key - Country code (≤2 characters)"
        TEXT description "Country name (≤20 characters)"
    }
    REAL_PROPERTY_PARTIES {
        TEXT document_id "Primary Key - Document Identifier"
        TEXT record_type "‘P’ for Party Record"
        TEXT party_type "Party type code"
        TEXT name "Name of party"
        TEXT address_1 "Attention/address of party"
        TEXT address_2 "Street address of party"
        TEXT country "Foreign Key - Country code"
        TEXT city "City name"
        TEXT state "State code"
        TEXT zip "Zip code"
        TEXT good_through_date "Record validity date"
    }
    PERSONAL_PROPERTY_PARTIES {
        TEXT document_id "Primary Key - Document Identifier"
        TEXT record_type "‘P’ for Party Record"
        TEXT party_type "Party type code"
        TEXT name "Name of party"
        TEXT address_1 "Attention/address of party"
        TEXT address_2 "Street address of party"
        TEXT country "Foreign Key - Country code"
        TEXT city "City name"
        TEXT state "State code"
        TEXT zip "Zip code"
        DATETIME good_through_date "Record validity date"
    }
    COUNTRY_CODES ||--|| REAL_PROPERTY_PARTIES : "country"
    COUNTRY_CODES ||--|| PERSONAL_PROPERTY_PARTIES : "country"
```

### Data Flow - User Perspective

When a user interacts with the front end of the SNACRIS application, the data flow involves several key files: `app.js`, `config.js`, `db.js`, and `server.js`. These files work together with the route files, schema files, and model files to handle user registration, authentication, and other interactions.

When a user registers, they submit a registration form on the front end. This form data is sent as a POST request to the `/auth/register` endpoint. The `authRoutes` in `app.js` handles this request. The `app.js` file sets up the Express application and configures middleware for handling CORS, JSON parsing, logging, and JWT authentication. It defines routes for authentication, users, and ACRIS data access. The `authRoutes` validate the input data using the `userRegisterSchema` from the `schemas` folder. This validation ensures that the data conforms to the expected format before it is processed.

If the data is valid, the `User.register` method from the `user.js` model is called to create a new user in the database. The `user.js` model contains methods for interacting with the `users` table in the database. It handles hashing passwords and validating user data. The model inserts the user data into the database, and a JWT token is generated and returned to the front end.

For user authentication, the user submits a login form on the front end. This form data is sent as a POST request to the `/auth/token` endpoint. The `authRoutes` in `app.js` handle this request, validating the input data using the `userAuthSchema` from the `schemas` folder. If the data is valid, the `User.authenticate` method from the `user.js` model is called to verify the user's credentials. If the credentials are correct, a JWT token is generated and returned to the front end.

When the user interacts with various features on the front end, such as searching for real property records, personal property records, or updating their profile, the front end sends requests to the corresponding endpoints (`/api/acris`, `/users`). The routes in `app.js` handle these requests, validating the input data using the appropriate schemas from the `schemas` folder. The routes call the corresponding methods from the models to interact with the database or third-party ACRIS APIs. The models perform the necessary database operations and return the results to the routes. The routes then send the results back to the front end as responses.

The `config.js` file contains configuration settings for the application. It loads environment variables using `dotenv`, sets up constants like `SECRET_KEY` and `PORT`, and defines a function to get the database URI based on the environment. It also configures the bcrypt work factor for password hashing. This configuration is essential for setting up the environment and ensuring secure operations.

The `db.js` file sets up the connection pool to the PostgreSQL database using the `pg` library. It determines the database URI based on the environment and configures SSL for production. It uses connection pooling for reliable database access and exports the pool for use in other parts of the application. This database connection is crucial for storing and retrieving user data and saved records.

Finally, the `server.js` file is the entry point for the backend server. It imports the Express application from `app.js` and starts the server on the specified port. The port number is retrieved from the configuration file. This file ensures that the server is running and listening for incoming requests.

In summary, the backend server application for SNACRIS handles user registration, authentication, and interactions with the ACRIS data system through a well-structured flow of data. The `app.js`, `config.js`, `db.js`, and `server.js` files work together with the route files, schema files, and model files to ensure that data is validated, processed, and stored correctly, providing a seamless experience for users accessing NYC property records.

[BACK TO TOC](#snacris-server-backend)

### Real Property & Personal Property APIs

#### Fetches from the Real Property Master ACRIS dataset using Socrata Query Language (SoQL) syntax.

MasterRealPropApi.js - Real Property Master Dataset
LegalsRealPropApi.js - Real Property Legals Dataset
PartiesRealPropApi.js - Real Property Parties Dataset
ReferencesRealPropApi.js - Real Property References Dataset
RemarksRealPropApi.js - Real Property Remarks Dataset

#### Fetches from the Personal Property Master ACRIS dataset using Socrata Query Language (SoQL) syntax.

MasterPersPropApi.js - Personal Property Master Dataset
LegalsPersPropApi.js - Personal Property Legals Dataset
PartiesPersPropApi.js - Personal Property Parties Dataset
ReferencesPersPropApi.js - Personal Property References Dataset
RemarksPersPropApi.js - Personal Property Remarks Dataset

#### Methods

Each class exposes five core methods (`fetchAcrisRecords`, `fetchAcrisRecordCount`, `fetchAcrisDocumentIds`, `fetchAcrisDocumentIdsCrossRef`, and `fetchAcrisRecordsByDocumentIds`) to (1) page through full record sets, (2) count matches, (3) retrieve IDs only, (4) cross-reference against another ID list in batches, and (5) fetch full records by batches of document IDs. Under the hood they all delegate URL construction to your `SoqlUrl` utility, which composes the appropriate Socrata `$select`, `$where`, `$limit`, and `$offset` clauses for each data domain, keeping your API clients perfectly DRY and consistent.

`fetchAcrisRecords(masterQueryParams: object, limit?: number = 1000): Promise<object[]>`

- Purpose: Paginate through all matching master records.
- Params:
  - masterQueryParams – filter fields (e.g. document_id, crfn, recorded_borough, doc_type, date ranges, etc.).
  - limit – page size (default 1000).
- Returns: Promise of an array of record objects.
- Errors:
  - Throws NotFoundError if the first page returns no data.
  - Throws generic Error on HTTP or parsing failure.

`fetchAcrisRecordCount(masterQueryParams: object): Promise<number>`

- Purpose: Retrieve count(\*) of matching master records.
- Returns: record count as number.
- Errors:
  - Throws NotFoundError if count missing.
  - Throws generic Error otherwise.

`fetchAcrisDocumentIds(masterQueryParams: object, limit?: number = 1000): Promise<string[]>`

- Purpose: Paginate through $select=document_id only, collecting unique IDs.
- Returns: Deduplicated string[] of document_id.
- Errors:
  - Throws NotFoundError if none found.
  - Throws generic Error on HTTP issues.

`fetchAcrisDocumentIdsCrossRef(masterQueryParams: object, crossRefIds: string[], batchSize?: number = 500): Promise<string[]>`

- Purpose: Given another set of IDs (e.g. from Legals), batch‐query master for intersecting document_id.
- Params:
  - crossRefIds – IDs to filter by in document_id IN (…).
  - batchSize – number of IDs per batch.
- Returns: Array of matching master document_id.
- Errors:
  - Throws NotFoundError if no matches across all batches.
  - Throws generic Error on failure.

`fetchAcrisRecordsByDocumentIds(documentIds: string[], queryParams?: object, limit?: number = 1000): Promise<object[]\|null>`

- Purpose: Retrieve full master records for a given list of document_id.
- Behavior: Batches into chunks of ~75 IDs, paginates each batch.
- Returns: Array of record objects or null if no data.
- Errors:
  - Returns null (rather than throwing) if nothing found.
  - Logs and throws no further errors on HTTP failures.

### Socrata Query Language (SoQL) Utility Class - `SoqlUrl.js`

Central utility for building Socrata (SoQL) URLs across all ACRIS‐wrapper modules.

`escapeSoqlString(val: any): string`

- Purpose: Safely escape single quotes in arbitrary values so they can be safely interpolated into SoQL string literals.
- Signature: `static escapeSoqlString(val: any): string`
- Parameters:
  - `val`: any JavaScript value (string, number, null, undefined).
- Returns:
  - A string with all single-quotes (') doubled ('').
  - If val is null or undefined, returns the empty string "".
- Errors:
  - Never throws.

`constructUrl(queryParams, apiCaller, selectOption, limit, offset): string`

- Purpose: Build a complete SoQL request URL including `$select`, `$where`, `$limit` and `$offset`, based on the parameters for a given dataset.
- Signature:

```js
static constructUrl(
  queryParams: object,
  apiCaller: string,
  selectOption?: string | string[] | null,
  limit?: number,
  offset?: number
): string
```

- Parameters:
  - `queryParams` (object): key/value pairs corresponding to filterable fields for the target dataset (e.g. `{ document_id: "ABC123", borough: 1 }`).
  - `apiCaller` (string): name of caller class (e.g. "`MasterRealPropApi`") used to select the correct base endpoint.
  - `selectOption` (string | string[] | null, default `"records"`):
    - `"records"`: no `$select`—return full rows
    - `"document_id"`: `$select=document_id`
    - `"countAll"`: `$select=count(*)`
    - `string[]`: array of field names to include in `$select=…`
  - `limit` (number, optional): value for `$limit`.
  - `offset` (number, optional): value for `$offset`.
- Returns:
  - A `string` URL pointing at the configured Socrata endpoint, with the assembled query string.
- Errors:
  - Throws `Error` if `queryParams` is not an object.
  - Throws `Error` if `apiCaller` is not a non-empty string or not recognized.
  - Throws `Error` if `selectOption` is invalid (not one of the allowed values).

`constructUrlForDocumentIds(queryParams, apiCaller, documentIds, limit, offset): string`

- Purpose: Like `constructUrl`, but forcibly injects a `document_id IN (…)` condition into the `$where` clause for direct lookup by a batch of IDs.
- Signature:

```
static constructUrlForDocumentIds(
  queryParams: object,
  apiCaller: string,
  documentIds: string[],
  limit?: number,
  offset?: number
): string
```

- Parameters:
  - `queryParams` (object): same as above.
  - `apiCaller` (string): as above.
  - `documentIds` (string[]): non-empty array of document IDs to match.
  - `limit` (number, optional) and `offset` (number, optional): for pagination.
- Returns:
  - A `string` URL including both the usual `$where` conditions and `document_id IN ('ID1','ID2',…)`.
- Errors:
  - Throws `Error` if `documentIds` is not a non-empty array.
  - Propagates errors from `constructUrl` for invalid callers or params.

`constructUrlBatches(queryParams, documentIds, apiCaller, batchSize): string[]`

- Purpose: Break a large array of `documentIds` into batches and return an array of SoQL URLs—one per batch—using `constructUrlForDocumentIds`.
- Signature:

```js
static constructUrlBatches(
  queryParams: object,
  documentIds: string[],
  apiCaller: string,
  batchSize?: number
): string[]
```

- Parameters:
  - `queryParams` (object) and `apiCaller` (string): passed through to `constructUrlForDocumentIds`.
  - `documentIds` (string[]): full list of IDs to batch.
  - `batchSize` (number, default 500): max IDs per URL.
- Returns:
  - An array of `string` URLs, each filtering on a slice of up to `batchSize` IDs.
- Errors:
  - Throws `Error` if `documentIds` is not an array or `batchSize` is not a positive number.

#### Internal Helpers

These methods are used by the above but can be considered private implementation details:

- `setConditionsConfig(queryParams: object, apiCaller: string): string[]`

  - Builds the array of individual `field = 'value'` or `field IN (…)` conditions.

- `setSelectConfig(selectOption: string | string[] | null): string`

  - Returns the `$select=…` clause or empty string for `"records"`.

- `setWhereConfig(conditions: string[]): string`

  - URL-encodes and joins the conditions with `AND` into a `$where=…` clause.

- `setApiEndpointConfig(apiCaller: string): string`
  - Maps `apiCaller` names to the base Socrata endpoint URLs you’ve defined.

`setLimitOffsetConfig(selectOption: string | string[] | null, limit?: number, offset?: number): string` - Builds the `$limit`/`$offset` clause (skipped for `countAll`).

`batchArray(array, batchSize): any[][]` - Divide an input array into sub-arrays (“batches”) of a given maximum size, preserving order.

All of these helpers throw if given invalid arguments (e.g. unknown caller, malformed params).

## `snacrisForms` routes

### Summary

All files under snacrisForms/ are Express route modules that:

- Accept query parameters from the frontend's React forms (e.g. address/parcel inputs or party-name inputs).
- Invoke the appropriate ACRIS-wrapper API classes (via `SoqlUrl`) to fetch IDs, full records, or both.
- Post-process the raw JSON results (dedupe, summarize, collate).
- Return JSON responses shaped for your front-end components (tables, dropdowns, analysis panels).

Every external fetch uses the shared SoqlUrl utility to assemble Socrata URLs, ensuring a consistent `$select`/`$where`/`$limit`/`$offset` strategy across all 10 Real Property & Personal Property API modules.

#### `queryAcrisAddressParcel.js`

##### Purpose

Power your “Search by Parcel Identifier” form, fetching Real-Property Legals records for a given BBL (and optional co-op unit), then analyzing consistency and exceptions across the result set.

##### Helpers: `findUniqueFullRecords(records: object[]): object[]`

- What it does: Removes duplicate rows except for `document_id`. Internally strips out `document_id`, stringifies the rest as an identifier, and then re-attaches the original `document_id` to the first occurrence.
- Inputs:
  - records – an array of raw Socrata record objects.
- Outputs:
  - A deduplicated array, preserving the full original objects (including one document_id per unique “content”).

##### `analyzeResults(records: object[]): object`

- What it does:
  For each key in `["borough","block","lot","street_number","street_name","record_type","easement","partial_lot","air_rights","subterranean_rights","property_type"]`, it: - Counts how many times each distinct value appears. - Sorts values by descending frequency. - Computes a consistency metric (“most‐common count/total”). - Lists all “exceptions” (less‐common values with their own doc IDs).
- Inputs:
  - `records` – the (optionally deduped) array of full Legals records.
- Outputs:
  - An object mapping each key to its sorted value list, plus `key_consistency` and `key_exceptions` arrays.

##### Route: `GET /fetchRecord`

- URL `/snacrisForms/address-parcel/fetchRecord`
- Query Parameters
  - Group A (parcel search):
    - borough (integer, required if no street lookup)
    - block (integer)
    - lot (integer)
  - Group B (address search):
    - borough (integer)
    - street_number (string)
    - street_name (string)
    - unit (string, optional—co-op unit)

Must supply at least one of Group A or Group B parameters; all values are URL-escaped via `transformForUrl()`.

##### Response

- Success (HTTP 200)

```json
{
  "status": "success",
  "message": "Analysis complete for X records.",
  "analysis": {
    /* as returned by analyzeResults() */
  }
}
```

- No Matches (HTTP 200)

```json
{
  "status": "failed",
  "message": "No records found for the provided query parameters.",
  "records": []
}
```

- Bad Request (HTTP 400)

```json
{
  "status": "error",
  "message": "At least one query parameter is required.",
  "records": []
}
```

- Unexpected Error is forwarded to your global error handler.

#### `queryAcrisPartyName.js`

Purpose: Power your “Search by Party Name” form, cross‐referencing Master → Parties → Legals to produce a full suite of Real-Property records (master, parties, legals, references, remarks) for each matching `document_id`.

##### Route: `GET /fetchRecord`

##### URL: `/snacrisForms/party-name/fetchRecord`

##### Query Parameters

```js
req.query = {
  masterSearchTerms: {
    recorded_date_range?, recorded_date_start?, recorded_date_end?,
    doc_class?, doc_type?
  },
  partySearchTerms: {
    name?, party_type?
  },
  legalsSearchTerms: {
    borough?
  }
}

```

- Date filtering and doc-class → doc-type lookups via DocTypesCodeMapModel.

- Name is wildcard-matched (LIKE '%…%'), party_type filters, and borough refines legals.

**Processing Steps**

1. Fetch master IDs matching masterSearchTerms.
2. Cross-ref those IDs against the Parties API to further narrow by name/type.
3. Cross-ref party IDs against the Legals API for borough filter.
4. If any step fails or yields zero IDs, return { dataFound: false, errMsg: […] }.
5. Otherwise parallel‐fetch full records for each of the five sub-datasets by document_id.
6. Collate into an array of { document_id, masterRecords, partyRecords, legalsRecords, referencesRecords, remarksRecords }.
7. Respond { dataFound: true, results: […] }.

##### Response

- Success

```json
{
  "dataFound": true,
  "results": [
    {
      "document_id": "ABC123",
      "masterRecords": [
        /* … */
      ],
      "partyRecords": [
        /* … */
      ],
      "legalsRecords": [
        /* … */
      ],
      "referencesRecords": [
        /* … */
      ],
      "remarksRecords": [
        /* … */
      ]
    }
    /* more docs… */
  ]
}
```

- No IDs or Errors

```json
{
  "dataFound": false,
  "errMsg": [
    "Master IDs: …",
    "Party IDs: …"
    /* etc. */
  ]
}
```
