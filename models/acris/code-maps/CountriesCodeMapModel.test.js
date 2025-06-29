"use strict";

const db = require("../../../db.js");
const { BadRequestError, NotFoundError } = require("../../../expressError");
const CountriesCodeMapModel = require("./CountriesCodeMapModel.js");
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
    // Use a country code that should exist in seeded data
    const record = await CountriesCodeMapModel.findRecord("US");
    expect(record).toEqual({
      id: expect.any(Number),
      record_type: expect.any(String),
      country_code: "US",
      description: expect.any(String),
    });
  });

  test("works with custom test data", async function () {
    // Insert a test country code that won't conflict with seeded data
    await db.query(`
      INSERT INTO country_codes (record_type, country_code, description)
      VALUES ('1', 'ZZ', 'Test Country')
    `);

    const record = await CountriesCodeMapModel.findRecord("ZZ");
    expect(record).toEqual({
      id: expect.any(Number),
      record_type: "1",
      country_code: "ZZ",
      description: "Test Country",
    });
  });

  test("not found if no such country code", async function () {
    try {
      await CountriesCodeMapModel.findRecord("XX");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** findAllRecords */

describe("findAllRecords", function () {
  test("works: returns records with seeded data present", async function () {
    const records = await CountriesCodeMapModel.findAllRecords();

    // Should have seeded data - at least some basic countries
    expect(records.length).toBeGreaterThan(0);
    expect(records[0]).toHaveProperty("id");
    expect(records[0]).toHaveProperty("record_type");
    expect(records[0]).toHaveProperty("country_code");
    expect(records[0]).toHaveProperty("description");

    // Should be sorted by description (seeded data should be alphabetical)
    const descriptions = records.map((r) => r.description);
    const sortedDescriptions = [...descriptions].sort();
    expect(descriptions).toEqual(sortedDescriptions);
  });

  test("works: includes custom test data sorted properly", async function () {
    // Insert test country codes that should sort at specific positions
    await db.query(`
      INSERT INTO country_codes (record_type, country_code, description)
      VALUES 
        ('1', 'ZZ', 'ZZTEST COUNTRY'),
        ('1', 'AA', 'AATEST COUNTRY')
    `);

    const records = await CountriesCodeMapModel.findAllRecords();

    // Find our test records
    const aaTest = records.find((r) => r.country_code === "AA");
    const zzTest = records.find((r) => r.country_code === "ZZ");

    expect(aaTest).toEqual({
      id: expect.any(Number),
      record_type: "1",
      country_code: "AA",
      description: "AATEST COUNTRY",
    });

    expect(zzTest).toEqual({
      id: expect.any(Number),
      record_type: "1",
      country_code: "ZZ",
      description: "ZZTEST COUNTRY",
    });

    // Verify sorting: AA should come first, ZZ should come last
    const aaIndex = records.findIndex((r) => r.country_code === "AA");
    const zzIndex = records.findIndex((r) => r.country_code === "ZZ");
    expect(aaIndex).toBe(0); // Should be first due to "AATEST COUNTRY"
    expect(zzIndex).toBe(records.length - 1); // Should be last due to "ZZTEST COUNTRY"
  });
});

/************************************** getAllCountryCodes */

describe("getAllCountryCodes", function () {
  test("works: returns array of country codes with seeded data", async function () {
    const codes = await CountriesCodeMapModel.getAllCountryCodes();

    // Should have seeded data
    expect(codes.length).toBeGreaterThan(0);
    expect(codes).toContain("US");
    expect(codes).toContain("CA");

    // Should be sorted alphabetically
    const sortedCodes = [...codes].sort();
    expect(codes).toEqual(sortedCodes);
  });

  test("works: includes custom test data", async function () {
    // Insert test country codes
    await db.query(`
      INSERT INTO country_codes (record_type, country_code, description)
      VALUES 
        ('1', 'ZZ', 'Test Country'),
        ('1', 'AA', 'Another Test')
    `);

    const codes = await CountriesCodeMapModel.getAllCountryCodes();
    expect(codes).toContain("ZZ");
    expect(codes).toContain("AA");

    // Should still be sorted
    const sortedCodes = [...codes].sort();
    expect(codes).toEqual(sortedCodes);
  });
});

/************************************** createRecord */

describe("createRecord", function () {
  test("works", async function () {
    const newRecord = {
      record_type: "1",
      country_code: "ZZ",
      description: "Test Country",
    };

    const record = await CountriesCodeMapModel.createRecord(newRecord);
    expect(record).toEqual({
      id: expect.any(Number),
      record_type: "1",
      country_code: "ZZ",
      description: "Test Country",
    });

    // Verify record was actually created
    const found = await CountriesCodeMapModel.findRecord("ZZ");
    expect(found).toEqual(record);
  });

  test("bad request with duplicate country code", async function () {
    // Use a country code that already exists in seeded data
    const duplicateRecord = {
      record_type: "1",
      country_code: "US",
      description: "United States Again",
    };

    try {
      await CountriesCodeMapModel.createRecord(duplicateRecord);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
      expect(err.message).toContain("Duplicate country_code: US");
    }
  });
});

/************************************** updateRecord */

describe("updateRecord", function () {
  test("works", async function () {
    // Insert initial record
    await db.query(`
      INSERT INTO country_codes (record_type, country_code, description)
      VALUES ('1', 'ZZ', 'Test Country')
    `);

    const updateData = {
      record_type: "2",
      description: "Updated Test Country",
    };

    const record = await CountriesCodeMapModel.updateRecord("ZZ", updateData);
    expect(record).toEqual({
      id: expect.any(Number),
      record_type: "2",
      country_code: "ZZ",
      description: "Updated Test Country",
    });
  });

  test("works: partial update (description only)", async function () {
    // Insert initial record
    await db.query(`
      INSERT INTO country_codes (record_type, country_code, description)
      VALUES ('1', 'ZZ', 'Test Country')
    `);

    const updateData = {
      description: "New Description",
    };

    const record = await CountriesCodeMapModel.updateRecord("ZZ", updateData);
    expect(record).toEqual({
      id: expect.any(Number),
      record_type: "1", // unchanged
      country_code: "ZZ",
      description: "New Description", // updated
    });
  });

  test("works: partial update (record_type only)", async function () {
    // Insert initial record
    await db.query(`
      INSERT INTO country_codes (record_type, country_code, description)
      VALUES ('1', 'ZZ', 'Test Country')
    `);

    const updateData = {
      record_type: "2",
    };

    const record = await CountriesCodeMapModel.updateRecord("ZZ", updateData);
    expect(record).toEqual({
      id: expect.any(Number),
      record_type: "2", // updated
      country_code: "ZZ",
      description: "Test Country", // unchanged
    });
  });

  test("not found if no such country code", async function () {
    const updateData = {
      description: "Not Found Country",
    };

    try {
      await CountriesCodeMapModel.updateRecord("XX", updateData);
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
      INSERT INTO country_codes (record_type, country_code, description)
      VALUES ('1', 'ZZ', 'Test Country')
    `);

    await CountriesCodeMapModel.deleteRecord("ZZ");

    // Verify record was deleted
    try {
      await CountriesCodeMapModel.findRecord("ZZ");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("not found if no such country code", async function () {
    try {
      await CountriesCodeMapModel.deleteRecord("XX");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
