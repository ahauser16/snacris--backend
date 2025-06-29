"use strict";

const db = require("../../db.js");
const { BadRequestError, NotFoundError } = require("../../expressError");
const Organization = require("./organization.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  seededUsers,
} = require("../_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newOrg = {
    name: "New Organization",
    description: "A brand new organization for testing",
    createdBy: "testuser",
  };

  test("works", async function () {
    let org = await Organization.create(newOrg);
    expect(org).toEqual({
      id: expect.any(Number),
      name: "New Organization",
      description: "A brand new organization for testing",
      createdBy: "testuser",
      createdAt: expect.any(Date),
      isActive: true,
    });

    const result = await db.query(
      "SELECT * FROM organizations WHERE name = 'New Organization'"
    );
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toEqual({
      id: expect.any(Number),
      name: "New Organization",
      description: "A brand new organization for testing",
      created_by: "testuser",
      created_at: expect.any(Date),
      is_active: true,
    });
  });

  test("bad request with duplicate name", async function () {
    await Organization.create(newOrg);
    try {
      await Organization.create(newOrg);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
      expect(err.message).toEqual("Duplicate organization: New Organization");
    }
  });

  test("works with minimal data", async function () {
    const minimalOrg = {
      name: "Minimal Org",
      description: null,
      createdBy: "testuser",
    };
    let org = await Organization.create(minimalOrg);
    expect(org).toEqual({
      id: expect.any(Number),
      name: "Minimal Org",
      description: null,
      createdBy: "testuser",
      createdAt: expect.any(Date),
      isActive: true,
    });
  });
});

/************************************** get */

describe("get", function () {
  let testOrgId;

  beforeEach(async function () {
    const result = await db.query(
      `INSERT INTO organizations (name, description, created_by) 
       VALUES ('Test Org', 'Test organization', 'testuser') 
       RETURNING id`
    );
    testOrgId = result.rows[0].id;
  });

  test("works", async function () {
    let org = await Organization.get(testOrgId);
    expect(org).toEqual({
      id: testOrgId,
      name: "Test Org",
      description: "Test organization",
      createdBy: "testuser",
      createdAt: expect.any(Date),
      isActive: true,
    });
  });

  test("not found if no such organization", async function () {
    try {
      await Organization.get(99999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
      expect(err.message).toEqual("No organization: 99999");
    }
  });
});

/************************************** getMembers */

describe("getMembers", function () {
  let testOrgId;

  beforeEach(async function () {
    // Create test organization
    const orgResult = await db.query(
      `INSERT INTO organizations (name, description, created_by) 
       VALUES ('Member Test Org', 'Test organization for members', 'testadmin') 
       RETURNING id`
    );
    testOrgId = orgResult.rows[0].id;

    // Add some memberships
    await db.query(
      `INSERT INTO organization_memberships (organization_id, username, role, status, approved_at, approved_by)
       VALUES 
       ($1, 'testuser', 'member', 'approved', CURRENT_TIMESTAMP, 'testadmin'),
       ($1, 'testadmin', 'admin', 'approved', CURRENT_TIMESTAMP, 'testadmin')`,
      [testOrgId]
    );
  });

  test("works", async function () {
    let members = await Organization.getMembers(testOrgId);
    expect(members).toHaveLength(2);
    expect(members).toEqual([
      {
        username: "testadmin",
        role: "admin",
        status: "approved",
        requestedAt: expect.any(Date),
        approvedAt: expect.any(Date),
        approvedBy: "testadmin",
      },
      {
        username: "testuser",
        role: "member",
        status: "approved",
        requestedAt: expect.any(Date),
        approvedAt: expect.any(Date),
        approvedBy: "testadmin",
      },
    ]);
  });

  test("returns empty array if no members", async function () {
    const emptyOrgResult = await db.query(
      `INSERT INTO organizations (name, description, created_by) 
       VALUES ('Empty Org', 'Organization with no members', 'testuser') 
       RETURNING id`
    );
    const emptyOrgId = emptyOrgResult.rows[0].id;

    let members = await Organization.getMembers(emptyOrgId);
    expect(members).toEqual([]);
  });

  test("not found if organization doesn't exist", async function () {
    try {
      await Organization.getMembers(99999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
      expect(err.message).toEqual("No organization: 99999");
    }
  });
});

/************************************** update */

describe("update", function () {
  let testOrgId;

  beforeEach(async function () {
    const result = await db.query(
      `INSERT INTO organizations (name, description, created_by) 
       VALUES ('Update Test Org', 'Original description', 'testuser') 
       RETURNING id`
    );
    testOrgId = result.rows[0].id;
  });

  test("works", async function () {
    let org = await Organization.update(testOrgId, {
      name: "Updated Organization",
      description: "Updated description",
    });
    expect(org).toEqual({
      id: testOrgId,
      name: "Updated Organization",
      description: "Updated description",
      createdBy: "testuser",
      createdAt: expect.any(Date),
      isActive: true,
    });
  });

  test("works: null fields", async function () {
    let org = await Organization.update(testOrgId, {
      description: null,
    });
    expect(org).toEqual({
      id: testOrgId,
      name: "Update Test Org",
      description: null,
      createdBy: "testuser",
      createdAt: expect.any(Date),
      isActive: true,
    });
  });

  test("works: isActive field", async function () {
    let org = await Organization.update(testOrgId, {
      isActive: false,
    });
    expect(org).toEqual({
      id: testOrgId,
      name: "Update Test Org",
      description: "Original description",
      createdBy: "testuser",
      createdAt: expect.any(Date),
      isActive: false,
    });
  });

  test("not found if no such organization", async function () {
    try {
      await Organization.update(99999, { name: "test" });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
      expect(err.message).toEqual("No organization: 99999");
    }
  });

  test("bad request with no data", async function () {
    try {
      await Organization.update(testOrgId, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  let testOrgId;

  beforeEach(async function () {
    const result = await db.query(
      `INSERT INTO organizations (name, description, created_by) 
       VALUES ('Delete Test Org', 'To be deleted', 'testuser') 
       RETURNING id`
    );
    testOrgId = result.rows[0].id;
  });

  test("works", async function () {
    await Organization.remove(testOrgId);
    const res = await db.query("SELECT * FROM organizations WHERE id=$1", [
      testOrgId,
    ]);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such organization", async function () {
    try {
      await Organization.remove(99999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
      expect(err.message).toEqual("No organization: 99999");
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  beforeEach(async function () {
    await db.query(`
      INSERT INTO organizations (name, description, created_by, is_active)
      VALUES 
      ('Alpha Corp', 'First organization', 'testuser', true),
      ('Beta LLC', 'Second organization', 'testadmin', true),
      ('Gamma Inc', 'Third organization', 'testuser', false)
    `);
  });

  test("works: no filter", async function () {
    let orgs = await Organization.findAll();
    expect(orgs.length).toBeGreaterThanOrEqual(3); // Include seeded orgs

    // Check that our test orgs are included
    const testOrgNames = orgs.map((o) => o.name);
    expect(testOrgNames).toContain("Alpha Corp");
    expect(testOrgNames).toContain("Beta LLC");
    expect(testOrgNames).toContain("Gamma Inc");

    // Check structure of first alphabetical org
    const alphaOrg = orgs.find((o) => o.name === "Alpha Corp");
    expect(alphaOrg).toEqual({
      id: expect.any(Number),
      name: "Alpha Corp",
      description: "First organization",
      createdBy: "testuser",
      createdAt: expect.any(Date),
      isActive: true,
    });
  });

  test("works: filter by name", async function () {
    let orgs = await Organization.findAll({ name: "Alpha" });
    expect(orgs).toHaveLength(1);
    expect(orgs[0].name).toEqual("Alpha Corp");
  });

  test("works: filter by description", async function () {
    let orgs = await Organization.findAll({ description: "Second" });
    expect(orgs).toHaveLength(1);
    expect(orgs[0].name).toEqual("Beta LLC");
  });

  test("works: filter by isActive", async function () {
    let orgs = await Organization.findAll({ isActive: false });
    expect(orgs).toHaveLength(1);
    expect(orgs[0].name).toEqual("Gamma Inc");
  });

  test("works: filter by createdBy", async function () {
    let orgs = await Organization.findAll({ createdBy: "testuser" });
    expect(orgs).toHaveLength(2);
    expect(orgs.map((o) => o.name)).toEqual(["Alpha Corp", "Gamma Inc"]);
  });

  test("works: multiple filters", async function () {
    let orgs = await Organization.findAll({
      createdBy: "testuser",
      isActive: true,
    });
    expect(orgs).toHaveLength(1);
    expect(orgs[0].name).toEqual("Alpha Corp");
  });

  test("works: empty list on nothing found", async function () {
    let orgs = await Organization.findAll({ name: "nope" });
    expect(orgs).toEqual([]);
  });
});

/************************************** findAll with username */

describe("findAll with username", function () {
  let org1Id, org2Id, org3Id;

  beforeEach(async function () {
    // Create organizations
    const org1Result = await db.query(`
      INSERT INTO organizations (name, description, created_by)
      VALUES ('User Org 1', 'First user org', 'testuser') 
      RETURNING id
    `);
    org1Id = org1Result.rows[0].id;

    const org2Result = await db.query(`
      INSERT INTO organizations (name, description, created_by)
      VALUES ('Admin Org', 'Admin created org', 'testadmin') 
      RETURNING id
    `);
    org2Id = org2Result.rows[0].id;

    const org3Result = await db.query(`
      INSERT INTO organizations (name, description, created_by)
      VALUES ('Other Org', 'Another org', 'testadmin') 
      RETURNING id
    `);
    org3Id = org3Result.rows[0].id;

    // Add testuser as member of Admin Org
    await db.query(
      `
      INSERT INTO organization_memberships (organization_id, username, role, status)
      VALUES ($1, 'testuser', 'member', 'approved')
    `,
      [org2Id]
    );
  });

  test("works: user sees organizations they belong to", async function () {
    let orgs = await Organization.findAll({}, "testuser");
    expect(orgs).toHaveLength(1);
    expect(orgs[0].name).toEqual("Admin Org");
  });

  test("works: user sees organizations with filters", async function () {
    let orgs = await Organization.findAll({ name: "Admin" }, "testuser");
    expect(orgs).toHaveLength(1);
    expect(orgs[0].name).toEqual("Admin Org");
  });

  test("works: empty list if user not member of any", async function () {
    let orgs = await Organization.findAll({}, "testadmin");
    expect(orgs).toEqual([]);
  });
});

/************************************** findAllForUser */

describe("findAllForUser", function () {
  let org1Id, org2Id, org3Id;

  beforeEach(async function () {
    // Create organizations
    const org1Result = await db.query(`
      INSERT INTO organizations (name, description, created_by)
      VALUES ('User Created Org', 'Created by testuser', 'testuser') 
      RETURNING id
    `);
    org1Id = org1Result.rows[0].id;

    const org2Result = await db.query(`
      INSERT INTO organizations (name, description, created_by)
      VALUES ('Admin Created Org', 'Created by testadmin', 'testadmin') 
      RETURNING id
    `);
    org2Id = org2Result.rows[0].id;

    const org3Result = await db.query(`
      INSERT INTO organizations (name, description, created_by)
      VALUES ('Another Org', 'Another admin org', 'testadmin') 
      RETURNING id
    `);
    org3Id = org3Result.rows[0].id;

    // Add testuser as member of Admin Created Org
    await db.query(
      `
      INSERT INTO organization_memberships (organization_id, username, role, status)
      VALUES ($1, 'testuser', 'member', 'approved')
    `,
      [org2Id]
    );
  });

  test("works: user sees orgs they created and belong to", async function () {
    let orgs = await Organization.findAllForUser("testuser");
    expect(orgs).toHaveLength(2);
    expect(orgs.map((o) => o.name).sort()).toEqual([
      "Admin Created Org",
      "User Created Org",
    ]);
  });

  test("works: admin sees only orgs they created", async function () {
    let orgs = await Organization.findAllForUser("testadmin");
    expect(orgs.length).toBeGreaterThanOrEqual(2); // Include seeded orgs

    // Check that test orgs are included
    const testOrgNames = orgs.map((o) => o.name);
    expect(testOrgNames).toContain("Admin Created Org");
    expect(testOrgNames).toContain("Another Org");

    // All should be created by testadmin
    orgs.forEach((org) => {
      expect(org.createdBy).toEqual("testadmin");
    });
  });

  test("works: no duplicate if user created and is member", async function () {
    // Add testuser as member of their own org
    await db.query(
      `
      INSERT INTO organization_memberships (organization_id, username, role, status)
      VALUES ($1, 'testuser', 'admin', 'approved')
    `,
      [org1Id]
    );

    let orgs = await Organization.findAllForUser("testuser");
    expect(orgs).toHaveLength(2); // Still only 2, no duplicate
  });

  test("works: empty list if user has no associations", async function () {
    let orgs = await Organization.findAllForUser("nonexistentuser");
    expect(orgs).toEqual([]);
  });
});
