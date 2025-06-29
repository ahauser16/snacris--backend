"use strict";

const db = require("../../../db.js");
const { BadRequestError, NotFoundError } = require("../../../expressError");
const DocTypesCodeMapModel = require("./DocTypesCodeMapModel.js");
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
    // Use a doc_type that should exist in seeded data
    const record = await DocTypesCodeMapModel.findRecord("DEED");
    expect(record).toEqual({
      id: expect.any(Number),
      record_type: expect.any(String),
      doc_type: "DEED",
      doc_type_description: expect.any(String),
      class_code_description: expect.any(String),
      party1_type: expect.any(String),
      party2_type: expect.any(String),
      party3_type: null, // Explicitly expect null since DEED has null for party3_type
    });
  });

  test("works with custom test data", async function () {
    // Insert a test doc_type that won't conflict with seeded data
    await db.query(`
      INSERT INTO document_control_codes (record_type, doc_type, doc_type_description, class_code_description, party1_type, party2_type, party3_type)
      VALUES ('D', 'ZZZZ', 'Test Document Type', 'TEST CLASS', 'TEST PARTY 1', 'TEST PARTY 2', 'TEST PARTY 3')
    `);

    const record = await DocTypesCodeMapModel.findRecord("ZZZZ");
    expect(record).toEqual({
      id: expect.any(Number),
      record_type: "D",
      doc_type: "ZZZZ",
      doc_type_description: "Test Document Type",
      class_code_description: "TEST CLASS",
      party1_type: "TEST PARTY 1",
      party2_type: "TEST PARTY 2",
      party3_type: "TEST PARTY 3",
    });
  });

  test("not found if no such doc_type", async function () {
    try {
      await DocTypesCodeMapModel.findRecord("NONEXIST");
      throw new Error("Expected NotFoundError");
    } catch (err) {
      if (err.message === "Expected NotFoundError") {
        throw err; // Re-throw if it's our custom error, meaning no exception was thrown
      }
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** findAllRecords */

describe("findAllRecords", function () {
  test("works: returns records with seeded data present", async function () {
    const records = await DocTypesCodeMapModel.findAllRecords();

    // Should have seeded data - at least some basic document types
    expect(records.length).toBeGreaterThan(0);
    expect(records[0]).toHaveProperty("id");
    expect(records[0]).toHaveProperty("record_type");
    expect(records[0]).toHaveProperty("doc_type");
    expect(records[0]).toHaveProperty("doc_type_description");
    expect(records[0]).toHaveProperty("class_code_description");
    expect(records[0]).toHaveProperty("party1_type");
    expect(records[0]).toHaveProperty("party2_type");
    expect(records[0]).toHaveProperty("party3_type");

    // Should be sorted by class_code_description, then doc_type_description
    for (let i = 1; i < records.length; i++) {
      const prev = records[i - 1];
      const curr = records[i];

      if (prev.class_code_description === curr.class_code_description) {
        expect(
          curr.doc_type_description >= prev.doc_type_description
        ).toBeTruthy();
      } else {
        expect(
          curr.class_code_description >= prev.class_code_description
        ).toBeTruthy();
      }
    }
  });

  test("works: includes custom test data sorted properly", async function () {
    // Insert test doc types that should sort at specific positions
    await db.query(`
      INSERT INTO document_control_codes (record_type, doc_type, doc_type_description, class_code_description, party1_type, party2_type, party3_type)
      VALUES 
        ('D', 'ZZZZ', 'ZZTEST DOC TYPE', 'ZZTEST CLASS', 'PARTY 1', 'PARTY 2', NULL),
        ('D', 'AAAA', 'AATEST DOC TYPE', 'AATEST CLASS', 'PARTY 1', 'PARTY 2', NULL)
    `);

    const records = await DocTypesCodeMapModel.findAllRecords();

    // Find our test records
    const aaTest = records.find((r) => r.doc_type === "AAAA");
    const zzTest = records.find((r) => r.doc_type === "ZZZZ");

    expect(aaTest).toEqual({
      id: expect.any(Number),
      record_type: "D",
      doc_type: "AAAA",
      doc_type_description: "AATEST DOC TYPE",
      class_code_description: "AATEST CLASS",
      party1_type: "PARTY 1",
      party2_type: "PARTY 2",
      party3_type: null,
    });

    expect(zzTest).toEqual({
      id: expect.any(Number),
      record_type: "D",
      doc_type: "ZZZZ",
      doc_type_description: "ZZTEST DOC TYPE",
      class_code_description: "ZZTEST CLASS",
      party1_type: "PARTY 1",
      party2_type: "PARTY 2",
      party3_type: null,
    });

    // Verify sorting: AA should come first, ZZ should come last
    const aaIndex = records.findIndex((r) => r.doc_type === "AAAA");
    const zzIndex = records.findIndex((r) => r.doc_type === "ZZZZ");
    expect(aaIndex).toBe(0); // Should be first due to "AATEST CLASS"
    expect(zzIndex).toBe(records.length - 1); // Should be last due to "ZZTEST CLASS"
  });
});

/************************************** getDocTypesByClass */

describe("getDocTypesByClass", function () {
  test("works: returns array of doc_types for given class with seeded data", async function () {
    const docTypes = await DocTypesCodeMapModel.getDocTypesByClass(
      "DEEDS AND OTHER CONVEYANCES"
    );

    // Should have seeded data
    expect(docTypes.length).toBeGreaterThan(0);
    expect(docTypes).toContain("DEED");
    expect(docTypes).toContain("EASE");

    // All should be strings
    docTypes.forEach((type) => {
      expect(typeof type).toBe("string");
    });
  });

  test("works: includes custom test data", async function () {
    // Insert test doc types for a custom class
    await db.query(`
      INSERT INTO document_control_codes (record_type, doc_type, doc_type_description, class_code_description, party1_type, party2_type, party3_type)
      VALUES 
        ('D', 'TEST1', 'Test Doc Type 1', 'CUSTOM TEST CLASS', 'PARTY 1', 'PARTY 2', NULL),
        ('D', 'TEST2', 'Test Doc Type 2', 'CUSTOM TEST CLASS', 'PARTY 1', 'PARTY 2', NULL)
    `);

    const docTypes = await DocTypesCodeMapModel.getDocTypesByClass(
      "CUSTOM TEST CLASS"
    );
    expect(docTypes).toContain("TEST1");
    expect(docTypes).toContain("TEST2");
    expect(docTypes.length).toBe(2);
  });

  test("throws NotFoundError for non-existent class", async function () {
    try {
      await DocTypesCodeMapModel.getDocTypesByClass("NON EXISTENT CLASS");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
      expect(err.message).toContain(
        "No doc_type values found for class: NON EXISTENT CLASS"
      );
    }
  });
});

/************************************** createRecord */

describe("createRecord", function () {
  test("works", async function () {
    const newRecord = {
      record_type: "D",
      doc_type: "ZZZZ",
      doc_type_description: "Test Document Type",
      class_code_description: "TEST CLASS",
      party1_type: "TEST PARTY 1",
      party2_type: "TEST PARTY 2",
      party3_type: "TEST PARTY 3",
    };

    const record = await DocTypesCodeMapModel.createRecord(newRecord);
    expect(record).toEqual({
      id: expect.any(Number),
      record_type: "D",
      doc_type: "ZZZZ",
      doc_type_description: "Test Document Type",
      class_code_description: "TEST CLASS",
      party1_type: "TEST PARTY 1",
      party2_type: "TEST PARTY 2",
      party3_type: "TEST PARTY 3",
    });

    // Verify record was actually created
    const found = await DocTypesCodeMapModel.findRecord("ZZZZ");
    expect(found).toEqual(record);
  });

  test("bad request with duplicate doc_type", async function () {
    // Use a doc_type that already exists in seeded data
    const duplicateRecord = {
      record_type: "D",
      doc_type: "DEED",
      doc_type_description: "Duplicate Deed Type",
      class_code_description: "TEST CLASS",
      party1_type: "PARTY 1",
      party2_type: "PARTY 2",
      party3_type: null,
    };

    try {
      await DocTypesCodeMapModel.createRecord(duplicateRecord);
      throw new Error("Expected BadRequestError");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
      expect(err.message).toContain("Duplicate doc_type: DEED");
    }
  });
});

/************************************** updateRecord */

describe("updateRecord", function () {
  test("works", async function () {
    // Insert initial record
    await db.query(`
      INSERT INTO document_control_codes (record_type, doc_type, doc_type_description, class_code_description, party1_type, party2_type, party3_type)
      VALUES ('D', 'ZZZZ', 'Test Document Type', 'TEST CLASS', 'PARTY 1', 'PARTY 2', 'PARTY 3')
    `);

    const updateData = {
      record_type: "U",
      doc_type_description: "Updated Test Document Type",
      class_code_description: "UPDATED TEST CLASS",
      party1_type: "UPDATED PARTY 1",
      party2_type: "UPDATED PARTY 2",
      party3_type: "UPDATED PARTY 3",
    };

    const record = await DocTypesCodeMapModel.updateRecord("ZZZZ", updateData);
    expect(record).toEqual({
      id: expect.any(Number),
      record_type: "U",
      doc_type: "ZZZZ",
      doc_type_description: "Updated Test Document Type",
      class_code_description: "UPDATED TEST CLASS",
      party1_type: "UPDATED PARTY 1",
      party2_type: "UPDATED PARTY 2",
      party3_type: "UPDATED PARTY 3",
    });
  });

  test("works: partial update (description only)", async function () {
    // Insert initial record
    await db.query(`
      INSERT INTO document_control_codes (record_type, doc_type, doc_type_description, class_code_description, party1_type, party2_type, party3_type)
      VALUES ('D', 'ZZZZ', 'Test Document Type', 'TEST CLASS', 'PARTY 1', 'PARTY 2', 'PARTY 3')
    `);

    const updateData = {
      doc_type_description: "New Description Only",
    };

    const record = await DocTypesCodeMapModel.updateRecord("ZZZZ", updateData);
    expect(record).toEqual({
      id: expect.any(Number),
      record_type: "D", // unchanged
      doc_type: "ZZZZ",
      doc_type_description: "New Description Only", // updated
      class_code_description: "TEST CLASS", // unchanged
      party1_type: "PARTY 1", // unchanged
      party2_type: "PARTY 2", // unchanged
      party3_type: "PARTY 3", // unchanged
    });
  });

  test("works: partial update (party types only)", async function () {
    // Insert initial record
    await db.query(`
      INSERT INTO document_control_codes (record_type, doc_type, doc_type_description, class_code_description, party1_type, party2_type, party3_type)
      VALUES ('D', 'ZZZZ', 'Test Document Type', 'TEST CLASS', 'PARTY 1', 'PARTY 2', 'PARTY 3')
    `);

    const updateData = {
      party1_type: "NEW PARTY 1",
      party3_type: null,
    };

    const record = await DocTypesCodeMapModel.updateRecord("ZZZZ", updateData);
    expect(record).toEqual({
      id: expect.any(Number),
      record_type: "D", // unchanged
      doc_type: "ZZZZ",
      doc_type_description: "Test Document Type", // unchanged
      class_code_description: "TEST CLASS", // unchanged
      party1_type: "NEW PARTY 1", // updated
      party2_type: "PARTY 2", // unchanged
      party3_type: null, // updated
    });
  });

  test("not found if no such doc_type", async function () {
    const updateData = {
      doc_type_description: "Not Found Document Type",
    };

    try {
      await DocTypesCodeMapModel.updateRecord("NONEXIST", updateData);
      throw new Error("Expected NotFoundError");
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
      INSERT INTO document_control_codes (record_type, doc_type, doc_type_description, class_code_description, party1_type, party2_type, party3_type)
      VALUES ('D', 'ZZZZ', 'Test Document Type', 'TEST CLASS', 'PARTY 1', 'PARTY 2', 'PARTY 3')
    `);

    await DocTypesCodeMapModel.deleteRecord("ZZZZ");

    // Verify record was deleted
    try {
      await DocTypesCodeMapModel.findRecord("ZZZZ");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("not found if no such doc_type", async function () {
    try {
      await DocTypesCodeMapModel.deleteRecord("NONEXIST");
      throw new Error("Expected NotFoundError");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
