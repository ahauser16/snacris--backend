"use strict";

const db = require("../../../db.js");
const { BadRequestError, NotFoundError } = require("../../../expressError");
const UccTypesCodeMapModel = require("./UccTypesCodeMapModel.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("../../_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** findRecord */

describe("findRecord", function () {
  test("works with seeded data", async function () {
    // Use a UCC collateral code that should exist in seeded data
    const record = await UccTypesCodeMapModel.findRecord("C");
    expect(record).toEqual({
      id: expect.any(Number),
      record_type: expect.any(String),
      ucc_collateral_code: "C",
      description: expect.any(String),
    });
  });

  test("works with custom test data", async function () {
    // Insert a test UCC collateral code that won't conflict with seeded data
    await db.query(`
      INSERT INTO ucc_collateral_codes (record_type, ucc_collateral_code, description)
      VALUES ('U', 'Z', 'Test UCC Collateral Type')
    `);

    const record = await UccTypesCodeMapModel.findRecord("Z");
    expect(record).toEqual({
      id: expect.any(Number),
      record_type: "U",
      ucc_collateral_code: "Z",
      description: "Test UCC Collateral Type",
    });
  });

  test("not found if no such ucc_collateral_code", async function () {
    try {
      await UccTypesCodeMapModel.findRecord("X");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** findAllRecords */

describe("findAllRecords", function () {
  test("works: returns records with seeded data present", async function () {
    const records = await UccTypesCodeMapModel.findAllRecords();

    // Should have seeded data - at least some basic UCC collateral types
    expect(records.length).toBeGreaterThan(0);
    expect(records[0]).toHaveProperty("id");
    expect(records[0]).toHaveProperty("record_type");
    expect(records[0]).toHaveProperty("ucc_collateral_code");
    expect(records[0]).toHaveProperty("description");

    // Should be sorted by description
    const descriptions = records.map((r) => r.description);
    const sortedDescriptions = [...descriptions].sort();
    expect(descriptions).toEqual(sortedDescriptions);
  });

  test("works: includes custom test data sorted properly", async function () {
    // Insert test UCC codes that should sort at specific positions
    await db.query(`
      INSERT INTO ucc_collateral_codes (record_type, ucc_collateral_code, description)
      VALUES 
        ('U', 'Z', 'ZZTEST UCC TYPE'),
        ('U', 'Y', 'AATEST UCC TYPE')
    `);

    const records = await UccTypesCodeMapModel.findAllRecords();

    // Find our test records
    const aaTest = records.find((r) => r.ucc_collateral_code === "Y");
    const zzTest = records.find((r) => r.ucc_collateral_code === "Z");

    expect(aaTest).toEqual({
      id: expect.any(Number),
      record_type: "U",
      ucc_collateral_code: "Y",
      description: "AATEST UCC TYPE",
    });

    expect(zzTest).toEqual({
      id: expect.any(Number),
      record_type: "U",
      ucc_collateral_code: "Z",
      description: "ZZTEST UCC TYPE",
    });

    // Verify sorting: AA should come first, ZZ should come last
    const aaIndex = records.findIndex((r) => r.ucc_collateral_code === "Y");
    const zzIndex = records.findIndex((r) => r.ucc_collateral_code === "Z");
    expect(aaIndex).toBe(0); // Should be first due to "AATEST UCC TYPE"
    expect(zzIndex).toBe(records.length - 1); // Should be last due to "ZZTEST UCC TYPE"
  });
});

/************************************** createRecord */

describe("createRecord", function () {
  test("works", async function () {
    const newRecord = {
      record_type: "U",
      ucc_collateral_code: "Z",
      description: "Test UCC Collateral Type",
    };

    const record = await UccTypesCodeMapModel.createRecord(newRecord);
    expect(record).toEqual({
      id: expect.any(Number),
      record_type: "U",
      ucc_collateral_code: "Z",
      description: "Test UCC Collateral Type",
    });

    // Verify record was actually created
    const found = await UccTypesCodeMapModel.findRecord("Z");
    expect(found).toEqual(record);
  });

  test("bad request with duplicate ucc_collateral_code", async function () {
    // Use a UCC collateral code that already exists in seeded data
    const duplicateRecord = {
      record_type: "U",
      ucc_collateral_code: "C",
      description: "Duplicate Cooperative Type",
    };

    try {
      await UccTypesCodeMapModel.createRecord(duplicateRecord);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
      expect(err.message).toContain("Duplicate ucc_collateral_code: C");
    }
  });
});

/************************************** updateRecord */

describe("updateRecord", function () {
  test("works", async function () {
    // Insert initial record
    await db.query(`
      INSERT INTO ucc_collateral_codes (record_type, ucc_collateral_code, description)
      VALUES ('U', 'Z', 'Test UCC Collateral Type')
    `);

    const updateData = {
      record_type: "T",
      description: "Updated Test UCC Collateral Type",
    };

    const record = await UccTypesCodeMapModel.updateRecord("Z", updateData);
    expect(record).toEqual({
      id: expect.any(Number),
      record_type: "T",
      ucc_collateral_code: "Z",
      description: "Updated Test UCC Collateral Type",
    });
  });

  test("works: partial update (description only)", async function () {
    // Insert initial record
    await db.query(`
      INSERT INTO ucc_collateral_codes (record_type, ucc_collateral_code, description)
      VALUES ('U', 'Z', 'Test UCC Collateral Type')
    `);

    const updateData = {
      description: "New Description",
    };

    const record = await UccTypesCodeMapModel.updateRecord("Z", updateData);
    expect(record).toEqual({
      id: expect.any(Number),
      record_type: "U", // unchanged
      ucc_collateral_code: "Z",
      description: "New Description", // updated
    });
  });

  test("works: partial update (record_type only)", async function () {
    // Insert initial record
    await db.query(`
      INSERT INTO ucc_collateral_codes (record_type, ucc_collateral_code, description)
      VALUES ('U', 'Z', 'Test UCC Collateral Type')
    `);

    const updateData = {
      record_type: "T",
    };

    const record = await UccTypesCodeMapModel.updateRecord("Z", updateData);
    expect(record).toEqual({
      id: expect.any(Number),
      record_type: "T", // updated
      ucc_collateral_code: "Z",
      description: "Test UCC Collateral Type", // unchanged
    });
  });

  test("not found if no such ucc_collateral_code", async function () {
    const updateData = {
      description: "Not Found UCC Type",
    };

    try {
      await UccTypesCodeMapModel.updateRecord("X", updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** deleteRecord */

describe("deleteRecord", function () {
  test("works", async function () {
    // Insert initial record
    await db.query(`
      INSERT INTO ucc_collateral_codes (record_type, ucc_collateral_code, description)
      VALUES ('U', 'Z', 'Test UCC Collateral Type')
    `);

    await UccTypesCodeMapModel.deleteRecord("Z");

    // Verify record was deleted
    try {
      await UccTypesCodeMapModel.findRecord("Z");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("not found if no such ucc_collateral_code", async function () {
    try {
      await UccTypesCodeMapModel.deleteRecord("X");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
