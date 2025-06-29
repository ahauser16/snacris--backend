# ORGANIZATIONS

## Overview

The Organization feature allows users to create and manage organizations for sharing ACRIS data, custom searches, and notes with other members. This is currently a work in progress where users can create, edit, delete, and view organizations. The "share" feature for collaborative data sharing will be implemented in the future.

## Files

- **`organization.js`** - The Organization model with all CRUD operations and business logic
- **`organization.test.js`** - Comprehensive unit tests covering all model methods

## Database Schema

### Organizations Table

```sql
CREATE TABLE organizations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_by VARCHAR(25) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);
```

### Organization Memberships Table

```sql
CREATE TABLE organization_memberships (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  username VARCHAR(25) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'member',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP,
  approved_by VARCHAR(25) REFERENCES users(username),
  UNIQUE (organization_id, username)
);
```

## Organization Model (`organization.js`)

### Methods

#### Static Methods

**`create({ name, description, createdBy })`**

- Creates a new organization
- Validates that organization name is unique
- Returns: `{ id, name, description, createdBy, createdAt, isActive }`
- Throws: `BadRequestError` if duplicate name

**`get(id)`**

- Retrieves organization by ID
- Returns: `{ id, name, description, createdBy, createdAt, isActive }`
- Throws: `NotFoundError` if organization doesn't exist

**`getMembers(organizationId)`**

- Retrieves all members of an organization
- Returns: `[{ username, role, status, requestedAt, approvedAt, approvedBy }, ...]`
- Throws: `NotFoundError` if organization doesn't exist

**`update(id, data)`**

- Updates organization with partial data
- Accepts: `{ name, description, isActive }`
- Returns: `{ id, name, description, createdBy, createdAt, isActive }`
- Throws: `NotFoundError` if organization doesn't exist, `BadRequestError` if no data

**`remove(id)`**

- Deletes organization by ID
- Returns: `undefined`
- Throws: `NotFoundError` if organization doesn't exist

**`findAll(filters = {}, username = null)`**

- Finds organizations with optional filtering
- Filters: `{ name, description, isActive, createdBy }`
- If `username` provided, returns only organizations the user is a member of
- Returns: `[{ id, name, description, createdBy, createdAt, isActive }, ...]`

**`findAllForUser(username)`**

- Finds all organizations where user is creator OR member
- Removes duplicates if user is both creator and member
- Returns: `[{ id, name, description, createdBy, createdAt, isActive }, ...]`

## Unit Tests (`organization.test.js`)

### Test Coverage: 29 Tests Total ✅

The test suite provides comprehensive coverage of all Organization model methods, including edge cases and error conditions.

### Test Groups

#### **`create()` Tests - 3 tests**

- ✅ **"works"** - Creates organization with all required fields
- ✅ **"bad request with duplicate name"** - Validates unique name constraint
- ✅ **"works with minimal data"** - Handles null description field

```javascript
// Example test case
test("works", async function () {
  let org = await Organization.create({
    name: "New Organization",
    description: "A brand new organization for testing",
    createdBy: "testuser",
  });
  expect(org).toEqual({
    id: expect.any(Number),
    name: "New Organization",
    description: "A brand new organization for testing",
    createdBy: "testuser",
    createdAt: expect.any(Date),
    isActive: true,
  });
});
```

#### **`get()` Tests - 2 tests**

- ✅ **"works"** - Retrieves organization by valid ID
- ✅ **"not found if no such organization"** - Throws NotFoundError for invalid ID

#### **`getMembers()` Tests - 3 tests**

- ✅ **"works"** - Returns members with correct data structure and ordering
- ✅ **"returns empty array if no members"** - Handles organizations with no memberships
- ✅ **"not found if organization doesn't exist"** - Validates organization existence

#### **`update()` Tests - 5 tests**

- ✅ **"works"** - Updates name and description fields
- ✅ **"works: null fields"** - Handles setting fields to null
- ✅ **"works: isActive field"** - Updates boolean isActive field
- ✅ **"not found if no such organization"** - Validates organization existence
- ✅ **"bad request with no data"** - Requires at least one field to update

#### **`remove()` Tests - 2 tests**

- ✅ **"works"** - Successfully deletes organization
- ✅ **"not found if no such organization"** - Validates organization existence

#### **`findAll()` Tests - 7 tests**

- ✅ **"works: no filter"** - Returns all organizations (including seeded data)
- ✅ **"works: filter by name"** - ILIKE search on organization name
- ✅ **"works: filter by description"** - ILIKE search on description
- ✅ **"works: filter by isActive"** - Boolean filter on active status
- ✅ **"works: filter by createdBy"** - Filter by creator username
- ✅ **"works: multiple filters"** - Combines multiple filter criteria
- ✅ **"works: empty list on nothing found"** - Handles no matches gracefully

#### **`findAll()` with Username Tests - 3 tests**

- ✅ **"works: user sees organizations they belong to"** - Returns member organizations
- ✅ **"works: user sees organizations with filters"** - Applies filters to member orgs
- ✅ **"works: empty list if user not member of any"** - Handles users with no memberships

#### **`findAllForUser()` Tests - 4 tests**

- ✅ **"works: user sees orgs they created and belong to"** - Combines creator and member roles
- ✅ **"works: admin sees only orgs they created"** - Returns creator organizations (including seeded)
- ✅ **"works: no duplicate if user created and is member"** - Deduplicates results
- ✅ **"works: empty list if user has no associations"** - Handles unaffiliated users

### Test Design Principles

#### **Seeded Data Awareness**

Tests account for pre-existing seeded organizations in the database:

```javascript
// Instead of expecting exact counts
expect(orgs).toHaveLength(3);

// We check for minimum counts and specific test data
expect(orgs.length).toBeGreaterThanOrEqual(3);
expect(testOrgNames).toContain("Alpha Corp");
```

#### **Transaction Isolation**

Each test runs in a database transaction that gets rolled back:

- `beforeEach()` starts a transaction with `BEGIN`
- `afterEach()` rolls back with `ROLLBACK`
- Tests don't interfere with each other

#### **Realistic Test Data**

Tests use seeded users (`testuser`, `testadmin`) for foreign key relationships:

```javascript
const newOrg = {
  name: "New Organization",
  description: "A brand new organization for testing",
  createdBy: "testuser", // Uses seeded user
};
```

#### **Comprehensive Error Testing**

Every method tests both success and failure scenarios:

- Valid operations with expected results
- Invalid inputs with proper error types
- Edge cases like null values and empty results

### Running the Tests

```bash
# Run all organization tests
NODE_ENV=test npm test -- --testPathPattern="organization.test.js"

# Run with verbose output
NODE_ENV=test npm test -- --testPathPattern="organization.test.js" --verbose

# Run specific test group
NODE_ENV=test npm test -- --testPathPattern="organization.test.js" --testNamePattern="create"
```

### Test Dependencies

- **Jest** - Testing framework
- **Seeded Users** - `testuser` (regular) and `testadmin` (admin) from seed data
- **Database Transaction Isolation** - Each test runs in a clean transaction
- **Test Commons** - Shared setup/teardown from `models/_testCommon.js`

### Future Enhancements

When the "share" feature is implemented, additional tests will be needed for:

- Sharing ACRIS data between organization members
- Permission-based data access within organizations
- Custom search sharing functionality
- Notes and annotations sharing
