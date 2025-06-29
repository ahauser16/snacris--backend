"use strict";

const db = require("../../../db.js");
const { BadRequestError, NotFoundError } = require("../../../expressError");
const PropTypesCodeMapModel = require("./PropTypesCodeMapModel.js");
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
    // Use a property type that should exist in seeded data
    const record = await PropTypesCodeMapModel.findRecord("AP");
    expect(record).toEqual({
      id: expect.any(Number),
      record_type: expect.any(String),
      property_type: "AP",
      description: expect.any(String),
    });
  });

  test("works with custom test data", async function () {
    // Insert a test property type that won't conflict with seeded data
    await db.query(`
      INSERT INTO property_type_codes (record_type, property_type, description)
      VALUES ('1', 'ZZ', 'Test Property Type')
    `);

    const record = await PropTypesCodeMapModel.findRecord("ZZ");
    expect(record).toEqual({
      id: expect.any(Number),
      record_type: "1",
      property_type: "ZZ",
      description: "Test Property Type",
    });
  });

  test("not found if no such property type", async function () {
    try {
      await PropTypesCodeMapModel.findRecord("XX");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** findAllRecords */

describe("findAllRecords", function () {
  test("works: returns records with seeded data present", async function () {
    const records = await PropTypesCodeMapModel.findAllRecords();

    // Should have seeded data - at least some basic property types
    expect(records.length).toBeGreaterThan(0);
    expect(records[0]).toHaveProperty("id");
    expect(records[0]).toHaveProperty("record_type");
    expect(records[0]).toHaveProperty("property_type");
    expect(records[0]).toHaveProperty("description");

    // Should be sorted by description
    const descriptions = records.map((r) => r.description);
    const sortedDescriptions = [...descriptions].sort();
    expect(descriptions).toEqual(sortedDescriptions);
  });

  test("works: includes custom test data sorted properly", async function () {
    // Insert test property codes that should sort at specific positions
    await db.query(`
      INSERT INTO property_type_codes (record_type, property_type, description)
      VALUES 
        ('1', 'ZZ', 'ZZTEST PROPERTY'),
        ('1', 'AA', 'AATEST PROPERTY')
    `);

    const records = await PropTypesCodeMapModel.findAllRecords();

    // Find our test records
    const aaTest = records.find((r) => r.property_type === "AA");
    const zzTest = records.find((r) => r.property_type === "ZZ");

    expect(aaTest).toEqual({
      id: expect.any(Number),
      record_type: "1",
      property_type: "AA",
      description: "AATEST PROPERTY",
    });

    expect(zzTest).toEqual({
      id: expect.any(Number),
      record_type: "1",
      property_type: "ZZ",
      description: "ZZTEST PROPERTY",
    });

    // Verify sorting: AA should come first, ZZ should come last
    const aaIndex = records.findIndex((r) => r.property_type === "AA");
    const zzIndex = records.findIndex((r) => r.property_type === "ZZ");
    expect(aaIndex).toBeGreaterThan(-1); // Should exist
    expect(zzIndex).toBeGreaterThan(-1); // Should exist
    expect(aaIndex).toBeLessThan(zzIndex); // AA should come before ZZ
  });
});

/************************************** getAllPropertyTypes */

describe("getAllPropertyTypes", function () {
  test("works: returns array of property types with seeded data", async function () {
    const types = await PropTypesCodeMapModel.getAllPropertyTypes();

    // Should have seeded data
    expect(types.length).toBeGreaterThan(0);
    expect(types).toContain("AP");
    expect(types).toContain("D1");

    // Should be sorted alphabetically
    const sortedTypes = [...types].sort();
    expect(types).toEqual(sortedTypes);
  });

  test("works: includes custom test data", async function () {
    // Insert test property type codes
    await db.query(`
      INSERT INTO property_type_codes (record_type, property_type, description)
      VALUES 
        ('1', 'ZZ', 'Test Property Type'),
        ('1', 'AA', 'Another Test Property')
    `);

    const types = await PropTypesCodeMapModel.getAllPropertyTypes();
    expect(types).toContain("ZZ");
    expect(types).toContain("AA");

    // Should still be sorted
    const sortedTypes = [...types].sort();
    expect(types).toEqual(sortedTypes);
  });
});

/************************************** createRecord */

describe("createRecord", function () {
  test("works", async function () {
    const newRecord = {
      record_type: "1",
      property_type: "ZZ",
      description: "Test Property Type",
    };

    const record = await PropTypesCodeMapModel.createRecord(newRecord);
    expect(record).toEqual({
      id: expect.any(Number),
      record_type: "1",
      property_type: "ZZ",
      description: "Test Property Type",
    });

    // Verify record was actually created
    const found = await PropTypesCodeMapModel.findRecord("ZZ");
    expect(found).toEqual(record);
  });

  test("bad request with duplicate property type", async function () {
    // Use a property type that already exists in seeded data
    const duplicateRecord = {
      record_type: "G",
      property_type: "AP",
      description: "Duplicate Property Type",
    };

    try {
      await PropTypesCodeMapModel.createRecord(duplicateRecord);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
      expect(err.message).toContain("Duplicate property_type: AP");
    }
  });
});

/************************************** updateRecord */

describe("updateRecord", function () {
  test("works", async function () {
    // Insert initial record
    await db.query(`
      INSERT INTO property_type_codes (record_type, property_type, description)
      VALUES ('1', 'ZZ', 'Test Property Type')
    `);

    const updateData = {
      record_type: "2",
      description: "Updated Test Property Type",
    };

    const record = await PropTypesCodeMapModel.updateRecord("ZZ", updateData);
    expect(record).toEqual({
      id: expect.any(Number),
      record_type: "2",
      property_type: "ZZ",
      description: "Updated Test Property Type",
    });
  });

  test("works: partial update (description only)", async function () {
    // Insert initial record
    await db.query(`
      INSERT INTO property_type_codes (record_type, property_type, description)
      VALUES ('1', 'ZZ', 'Test Property Type')
    `);

    const updateData = {
      description: "New Description",
    };

    const record = await PropTypesCodeMapModel.updateRecord("ZZ", updateData);
    expect(record).toEqual({
      id: expect.any(Number),
      record_type: "1", // unchanged
      property_type: "ZZ",
      description: "New Description", // updated
    });
  });

  test("works: partial update (record_type only)", async function () {
    // Insert initial record
    await db.query(`
      INSERT INTO property_type_codes (record_type, property_type, description)
      VALUES ('1', 'ZZ', 'Test Property Type')
    `);

    const updateData = {
      record_type: "2",
    };

    const record = await PropTypesCodeMapModel.updateRecord("ZZ", updateData);
    expect(record).toEqual({
      id: expect.any(Number),
      record_type: "2", // updated
      property_type: "ZZ",
      description: "Test Property Type", // unchanged
    });
  });

  test("not found if no such property type", async function () {
    const updateData = {
      description: "Not Found Property Type",
    };

    try {
      await PropTypesCodeMapModel.updateRecord("XX", updateData);
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
      INSERT INTO property_type_codes (record_type, property_type, description)
      VALUES ('1', 'ZZ', 'Test Property Type')
    `);

    await PropTypesCodeMapModel.deleteRecord("ZZ");

    // Verify record was deleted
    try {
      await PropTypesCodeMapModel.findRecord("ZZ");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("not found if no such property type", async function () {
    try {
      await PropTypesCodeMapModel.deleteRecord("XX");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
