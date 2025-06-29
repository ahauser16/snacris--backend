"use strict";

const db = require("../../../db.js");
const { BadRequestError, NotFoundError } = require("../../../expressError");
const StatesCodeMapModel = require("./StatesCodeMapModel.js");
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
    // Use a state code that should exist in seeded data
    const record = await StatesCodeMapModel.findRecord("NY");
    expect(record).toEqual({
      id: expect.any(Number),
      record_type: expect.any(String),
      state_code: "NY",
      description: expect.any(String),
    });
  });

  test("works with custom test data", async function () {
    // Insert a test state code that won't conflict with seeded data
    await db.query(`
      INSERT INTO state_codes (record_type, state_code, description)
      VALUES ('T', 'ZZ', 'Test State')
    `);

    const record = await StatesCodeMapModel.findRecord("ZZ");
    expect(record).toEqual({
      id: expect.any(Number),
      record_type: "T",
      state_code: "ZZ",
      description: "Test State",
    });
  });

  test("not found if no such state code", async function () {
    try {
      await StatesCodeMapModel.findRecord("XX");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** findAllRecords */

describe("findAllRecords", function () {
  test("works: returns all state codes", async function () {
    const records = await StatesCodeMapModel.findAllRecords();
    expect(records.length).toBeGreaterThan(0);
    expect(records[0]).toEqual({
      id: expect.any(Number),
      record_type: expect.any(String),
      state_code: expect.any(String),
      description: expect.any(String),
    });
  });

  test("ordered by description", async function () {
    const records = await StatesCodeMapModel.findAllRecords();
    // Verify that the results are ordered by description
    for (let i = 1; i < records.length; i++) {
      expect(records[i].description >= records[i - 1].description).toBeTruthy();
    }
  });
});

/************************************** getAllStateCodes */

describe("getAllStateCodes", function () {
  test("works: returns array of state codes", async function () {
    const stateCodes = await StatesCodeMapModel.getAllStateCodes();
    expect(Array.isArray(stateCodes)).toBeTruthy();
    expect(stateCodes.length).toBeGreaterThan(0);
    expect(typeof stateCodes[0]).toBe("string");
  });

  test("contains expected state codes", async function () {
    const stateCodes = await StatesCodeMapModel.getAllStateCodes();
    expect(stateCodes).toContain("NY");
    expect(stateCodes).toContain("CA");
    expect(stateCodes).toContain("TX");
  });

  test("ordered by state code", async function () {
    const stateCodes = await StatesCodeMapModel.getAllStateCodes();
    // Verify that the results are ordered by state_code
    for (let i = 1; i < stateCodes.length; i++) {
      expect(stateCodes[i] >= stateCodes[i - 1]).toBeTruthy();
    }
  });
});

/************************************** createRecord */

describe("createRecord", function () {
  const newRecord = {
    record_type: "T",
    state_code: "ZY",
    description: "Test State Cr",
  };

  test("works", async function () {
    const record = await StatesCodeMapModel.createRecord(newRecord);
    expect(record).toEqual({
      id: expect.any(Number),
      ...newRecord,
    });
  });

  test("bad request with duplicate state code", async function () {
    try {
      await StatesCodeMapModel.createRecord(newRecord);
      await StatesCodeMapModel.createRecord(newRecord);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("bad request with existing seeded state code", async function () {
    try {
      await StatesCodeMapModel.createRecord({
        record_type: "T",
        state_code: "NY", // This should already exist in seeded data
        description: "Duplicate New York",
      });
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** updateRecord */

describe("updateRecord", function () {
  let testStateCode;

  beforeEach(async function () {
    // Create a test record for updating
    const result = await db.query(`
      INSERT INTO state_codes (record_type, state_code, description)
      VALUES ('T', 'ZX', 'Test State')
      RETURNING state_code
    `);
    testStateCode = result.rows[0].state_code;
  });

  test("works", async function () {
    const updateData = {
      record_type: "U",
      description: "Updated Test State",
    };
    const record = await StatesCodeMapModel.updateRecord(
      testStateCode,
      updateData
    );
    expect(record).toEqual({
      id: expect.any(Number),
      state_code: testStateCode,
      ...updateData,
    });
  });

  test("works: partial update", async function () {
    const updateData = {
      description: "Updated State",
    };
    const record = await StatesCodeMapModel.updateRecord(
      testStateCode,
      updateData
    );
    expect(record).toEqual({
      id: expect.any(Number),
      record_type: "T", // Should remain unchanged
      state_code: testStateCode,
      description: "Updated State",
    });
  });

  test("not found if no such state code", async function () {
    try {
      await StatesCodeMapModel.updateRecord("XX", {
        description: "Updated Description",
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request if no data", async function () {
    try {
      await StatesCodeMapModel.updateRecord(testStateCode, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** deleteRecord */

describe("deleteRecord", function () {
  let testStateCode;

  beforeEach(async function () {
    // Create a test record for deletion
    const result = await db.query(`
      INSERT INTO state_codes (record_type, state_code, description)
      VALUES ('T', 'ZW', 'Test State Del')
      RETURNING state_code
    `);
    testStateCode = result.rows[0].state_code;
  });

  test("works", async function () {
    await StatesCodeMapModel.deleteRecord(testStateCode);
    try {
      await StatesCodeMapModel.findRecord(testStateCode);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("not found if no such state code", async function () {
    try {
      await StatesCodeMapModel.deleteRecord("XX");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** Integration Tests */

describe("integration tests", function () {
  test("full CRUD lifecycle", async function () {
    const newRecord = {
      record_type: "I",
      state_code: "ZV",
      description: "Int Test State",
    };

    // Create
    const created = await StatesCodeMapModel.createRecord(newRecord);
    expect(created.state_code).toBe("ZV");

    // Read
    const found = await StatesCodeMapModel.findRecord("ZV");
    expect(found.description).toBe("Int Test State");

    // Update
    const updated = await StatesCodeMapModel.updateRecord("ZV", {
      description: "Updated Int Test",
    });
    expect(updated.description).toBe("Updated Int Test");

    // Verify update
    const foundUpdated = await StatesCodeMapModel.findRecord("ZV");
    expect(foundUpdated.description).toBe("Updated Int Test");

    // Delete
    await StatesCodeMapModel.deleteRecord("ZV");

    // Verify deletion
    try {
      await StatesCodeMapModel.findRecord("ZV");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("utility method returns consistent data", async function () {
    const allRecords = await StatesCodeMapModel.findAllRecords();
    const allCodes = await StatesCodeMapModel.getAllStateCodes();

    expect(allCodes.length).toBeLessThanOrEqual(allRecords.length);

    // Verify each code from utility method exists in full records
    const recordCodes = allRecords.map((r) => r.state_code);
    allCodes.forEach((code) => {
      expect(recordCodes).toContain(code);
    });
  });
});
