# SNACRIS Backend Testing Guide

This document contains comprehensive testing documentation for the SNACRIS backend application.

**TABLE OF CONTENTS**

- [SNACRIS Backend Testing Guide](#snacris-backend-testing-guide)
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

# How to run tests

## Prerequisites

Before running tests, ensure you have:

1. **Node.js** installed (version 22.x as specified in package.json)
2. **PostgreSQL** database server running
3. **Test database** created (`snacris_test`)
4. **Dependencies** installed

## Setup Test Environment

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

## Running Tests

### Run All Tests

```bash
npm test
```

This command runs all test files using Jest with the `-i` flag (serial execution).

### Run Specific Test Files

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

### Run Tests with Verbose Output

```bash
# See detailed test results
npx jest --verbose

# Run specific test with verbose output
npx jest config.test.js --verbose
```

### Run Tests in Watch Mode (for development)

```bash
# Automatically re-run tests when files change
npx jest --watch

# Watch specific test file
npx jest config.test.js --watch
```

### Generate Test Coverage Report

```bash
# Generate coverage report
npx jest --coverage

# View coverage in browser (opens coverage/lcov-report/index.html)
open coverage/lcov-report/index.html
```

## Test Configuration

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

## Environment Variables for Testing

During testing, ensure these environment variables are properly set:

```bash
# Test environment
NODE_ENV=test

# Test database (automatically used when NODE_ENV=test)
# DATABASE_URL is ignored in test mode - uses "snacris_test" database
```

## Common Test Commands Quick Reference

| Command                        | Description              |
| ------------------------------ | ------------------------ |
| `npm test`                     | Run all tests            |
| `npx jest --watch`             | Run tests in watch mode  |
| `npx jest --verbose`           | Run with detailed output |
| `npx jest --coverage`          | Generate coverage report |
| `npx jest <filename>`          | Run specific test file   |
| `npx jest --detectOpenHandles` | Debug hanging tests      |

## Test Suite Status

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

## Troubleshooting

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

# Testing Architecture

## Common Test Utility Patterns

### 1. Domain-Specific Test Commons

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

### 2. What Each Domain Typically Needs

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

## Best Practices for Different Domains

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

## When to Create Test Commons

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

## Reference/Code Mapping Data VS Application/User Data

### Two Types of Data - Two Different Strategies

1. Reference/Code Mapping Data (Assume Pre-seeded)

For testing purposes the files below are ASSUMED to be **"pre-seeded"** because they are reference data from the five ACRIS datasets which are used to query the other 10 ACRIS APIs associated with **Real Property** and **Personal Property**. These datasets rarely change and are essentially part of the "configuration" for my application. Testing them would only verify SQL insertion and not business logic so they are seeded once during test database setup.

- `seed_acris_country_codes.sql`
- `seed_acris_document_control_codes.sql`
- `seed_acris_property_type_codes.sql`
- `seed_acris_ucc_collateral_type_codes.sql`
- `seed_acris_usa_state_codes.sql`

2. Application/User Data (Create Fresh in Tests)

For testing purposes the files below are CREATED in each test suite because (i) this data is manipulated by my application, (ii) tests need predictable and isolated starting states and (iii) different test suites may need different user scenarios.

## Recommended Test Setup Strategy

| Data Type        | Example                     | Strategy         | Why                                   |
| ---------------- | --------------------------- | ---------------- | ------------------------------------- |
| Reference Data   | Country codes, State codes  | ✅ Assume exists | Static lookup data, seeded once       |
| Seeded Users     | testuser, testadmin         | ✅ Use in tests  | Realistic users with proper passwords |
| Temp Test Data   | tempnewuser                 | ✅ Create/clean  | For testing SQL operations            |
| Application Data | Saved properties, favorites | ✅ Create fresh  | Business logic data, needs isolation  |

# Testing Notes & Gotchas

## Setup Best Practices

1. **Database Isolation**: Tests use `snacris_test` database
2. **Serial Execution**: `-i` flag prevents database conflicts
3. **Proper Cleanup**: `afterAll()` closes database connections
4. **Environment Testing**: `config.test.js` verifies different environments work
5. **Integration Testing**: `app.test.js` tests actual HTTP endpoints

## Common Jest Methods

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

## `app.test.js`

This file tests the Express application.

## `db.js`

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

## `models/_testCommon.js`

This is a **shared test utility file** that provides consistent database setup and teardown for all the model tests. It's not a test file itself - it's a helper that other test files import and use.

### Why It Uses Direct SQL Instead of Model Methods

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

### How It Enables Model Testing

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

### The Transaction Pattern

The `BEGIN`/`ROLLBACK` pattern is a good practice because:

1. Before each test: Start a transaction with `BEGIN`
2. During test: Model methods can INSERT/UPDATE/DELETE data
3. After each test: `ROLLBACK` undoes ALL changes
4. Next test: Starts with the original clean data again

This means:

- Tests never affect each other
- No need to manually clean up test data
- Each test runs in complete isolation

### Why `BCRYPT_WORK_FACTOR` Is Imported

This ensures test passwords are hashed with the same settings as the application uses, making the tests realistic.

```js
const { BCRYPT_WORK_FACTOR } = require("../config");

// Used here to hash passwords for test users
await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
```

### Value and Purpose

This pattern provides:

1. **Reliable test data** - Every test knows exactly what data exists
2. **Test isolation** - Tests don't interfere with each other
3. **Performance** - Fast setup/teardown using transactions
4. **Consistency** - All model tests use the same data foundation
5. **Maintainability** - Change test data in one place affects all tests
