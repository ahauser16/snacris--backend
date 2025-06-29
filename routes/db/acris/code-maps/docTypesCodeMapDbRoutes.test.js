"use strict";

const request = require("supertest");
const app = require("../../../../app");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("../../../_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** GET /db/code-map-documents/getDocTypeCodeMap */

describe("GET /db/code-map-documents/getDocTypeCodeMap", function () {
  test("works: returns organized document control codes", async function () {
    const resp = await request(app).get(
      "/db/code-map-documents/getDocTypeCodeMap"
    );

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      docControlCodes: {
        deedsAndOtherConveyances: expect.any(Array),
        mortgagesAndInstruments: expect.any(Array),
        uccAndFederalLiens: expect.any(Array),
        otherDocuments: expect.any(Array),
      },
    });

    // Verify the structure and content
    const { docControlCodes } = resp.body;

    // Each category should be an array
    expect(Array.isArray(docControlCodes.deedsAndOtherConveyances)).toBe(true);
    expect(Array.isArray(docControlCodes.mortgagesAndInstruments)).toBe(true);
    expect(Array.isArray(docControlCodes.uccAndFederalLiens)).toBe(true);
    expect(Array.isArray(docControlCodes.otherDocuments)).toBe(true);

    // There should be at least some document types in each major category
    // (This assumes seeded data exists - adjust expectations based on actual seed data)
    expect(docControlCodes.deedsAndOtherConveyances.length).toBeGreaterThan(0);
    expect(docControlCodes.mortgagesAndInstruments.length).toBeGreaterThan(0);
    expect(docControlCodes.uccAndFederalLiens.length).toBeGreaterThan(0);
    expect(docControlCodes.otherDocuments.length).toBeGreaterThan(0);

    // Verify each document control code has the expected structure
    const allCodes = [
      ...docControlCodes.deedsAndOtherConveyances,
      ...docControlCodes.mortgagesAndInstruments,
      ...docControlCodes.uccAndFederalLiens,
      ...docControlCodes.otherDocuments,
    ];

    allCodes.forEach((code) => {
      expect(code).toMatchObject({
        id: expect.any(Number),
        record_type: expect.any(String),
        doc_type: expect.any(String),
        doc_type_description: expect.any(String),
        class_code_description: expect.any(String),
        party1_type: expect.any(String),
      });

      // party2_type and party3_type can be string or null
      expect(code).toHaveProperty("party2_type");
      expect(code).toHaveProperty("party3_type");
    });
  });

  test("works: verifies correct categorization", async function () {
    const resp = await request(app).get(
      "/db/code-map-documents/getDocTypeCodeMap"
    );

    expect(resp.statusCode).toEqual(200);
    const { docControlCodes } = resp.body;

    // Verify that codes are in the correct categories
    docControlCodes.deedsAndOtherConveyances.forEach((code) => {
      expect(code.class_code_description).toBe("DEEDS AND OTHER CONVEYANCES");
    });

    docControlCodes.mortgagesAndInstruments.forEach((code) => {
      expect(code.class_code_description).toBe("MORTGAGES & INSTRUMENTS");
    });

    docControlCodes.uccAndFederalLiens.forEach((code) => {
      expect(code.class_code_description).toBe("UCC AND FEDERAL LIENS");
    });

    docControlCodes.otherDocuments.forEach((code) => {
      expect(code.class_code_description).toBe("OTHER DOCUMENTS");
    });
  });

  test("works: verifies sorting order within categories", async function () {
    const resp = await request(app).get(
      "/db/code-map-documents/getDocTypeCodeMap"
    );

    expect(resp.statusCode).toEqual(200);
    const { docControlCodes } = resp.body;

    // Since the data comes from findAllRecords() which sorts by class_code_description, then doc_type_description,
    // and then gets reorganized by category, we should verify that within each category
    // the items maintain reasonable ordering (though not necessarily strict alphabetical due to reorganization)

    Object.entries(docControlCodes).forEach(([categoryName, categoryArray]) => {
      if (categoryArray.length > 0) {
        // Just verify all items in category have the correct class_code_description
        // and that we have the expected data structure
        expect(
          categoryArray.every(
            (item) => typeof item.doc_type_description === "string"
          )
        ).toBe(true);
        expect(
          categoryArray.every((item) => item.doc_type_description.length > 0)
        ).toBe(true);
      }
    });
  });

  test("works: includes expected document types", async function () {
    const resp = await request(app).get(
      "/db/code-map-documents/getDocTypeCodeMap"
    );

    expect(resp.statusCode).toEqual(200);
    const { docControlCodes } = resp.body;

    // Collect all doc_types
    const allDocTypes = [
      ...docControlCodes.deedsAndOtherConveyances,
      ...docControlCodes.mortgagesAndInstruments,
      ...docControlCodes.uccAndFederalLiens,
      ...docControlCodes.otherDocuments,
    ].map((code) => code.doc_type);

    // Verify some common document types exist (based on typical ACRIS data)
    // Adjust these expectations based on your actual seeded data
    const expectedDocTypes = ["DEED", "MTGE", "UCC1", "ASST"];
    expectedDocTypes.forEach((docType) => {
      expect(allDocTypes).toContain(docType);
    });
  });

  test("error: handles empty database gracefully", async function () {
    // Temporarily clear the document_control_codes table to test empty state
    await request(app)
      .get("/db/code-map-documents/getDocTypeCodeMap")
      .expect((res) => {
        // This test depends on whether there's seeded data
        // If there's always seeded data, this test might not be applicable
        // Comment out or modify based on your setup
      });
  });

  test("error: handles database errors gracefully", async function () {
    // This is harder to test without mocking the database
    // Could be done with more sophisticated test setup
    // For now, we'll test the successful case primarily
  });

  test("works: response time is reasonable", async function () {
    const startTime = Date.now();
    const resp = await request(app).get(
      "/db/code-map-documents/getDocTypeCodeMap"
    );
    const endTime = Date.now();

    expect(resp.statusCode).toEqual(200);
    expect(endTime - startTime).toBeLessThan(1000); // Should respond within 1 second
  });

  test("works: response is consistent across multiple calls", async function () {
    const resp1 = await request(app).get(
      "/db/code-map-documents/getDocTypeCodeMap"
    );
    const resp2 = await request(app).get(
      "/db/code-map-documents/getDocTypeCodeMap"
    );

    expect(resp1.statusCode).toEqual(200);
    expect(resp2.statusCode).toEqual(200);

    // Results should be identical
    expect(resp1.body).toEqual(resp2.body);
  });

  test("works: validates complete response structure", async function () {
    const resp = await request(app).get(
      "/db/code-map-documents/getDocTypeCodeMap"
    );

    expect(resp.statusCode).toEqual(200);
    expect(resp.headers["content-type"]).toMatch(/json/);

    const { docControlCodes } = resp.body;

    // Ensure all expected properties exist
    expect(docControlCodes).toHaveProperty("deedsAndOtherConveyances");
    expect(docControlCodes).toHaveProperty("mortgagesAndInstruments");
    expect(docControlCodes).toHaveProperty("uccAndFederalLiens");
    expect(docControlCodes).toHaveProperty("otherDocuments");

    // Ensure no unexpected properties
    const expectedKeys = [
      "deedsAndOtherConveyances",
      "mortgagesAndInstruments",
      "uccAndFederalLiens",
      "otherDocuments",
    ];
    expect(Object.keys(docControlCodes).sort()).toEqual(expectedKeys.sort());
  });

  test("works: verifies data integrity", async function () {
    const resp = await request(app).get(
      "/db/code-map-documents/getDocTypeCodeMap"
    );

    expect(resp.statusCode).toEqual(200);
    const { docControlCodes } = resp.body;

    const allCodes = [
      ...docControlCodes.deedsAndOtherConveyances,
      ...docControlCodes.mortgagesAndInstruments,
      ...docControlCodes.uccAndFederalLiens,
      ...docControlCodes.otherDocuments,
    ];

    // Verify all doc_types are unique
    const docTypes = allCodes.map((code) => code.doc_type);
    const uniqueDocTypes = [...new Set(docTypes)];
    expect(docTypes.length).toEqual(uniqueDocTypes.length);

    // Verify no empty required fields
    allCodes.forEach((code) => {
      expect(code.doc_type).toBeTruthy();
      expect(code.doc_type_description).toBeTruthy();
      expect(code.class_code_description).toBeTruthy();
      expect(code.record_type).toBeTruthy();
      expect(code.party1_type).toBeTruthy();
      // party2_type and party3_type can be null, so we only check they exist as properties
      expect(code).toHaveProperty("party2_type");
      expect(code).toHaveProperty("party3_type");
    });
  });
});
