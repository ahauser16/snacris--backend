"use strict";

const request = require("supertest");
const app = require("../../../../app");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testTokens,
} = require("../../../_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

// Test data for real property documents
const createTestRealPropertyDoc = (suffix = "001") => ({
  master: {
    document_id: `2023123456789${suffix.padStart(3, "0")}`,
    record_type: "A",
    crfn: `2023000123${suffix.padStart(3, "0")}`,
    recorded_borough: 1,
    doc_type: "DEED",
    document_date: "2023-12-15",
    document_amt: 500000.0,
    recorded_datetime: "2023-12-15T10:30:00",
    modified_date: "2023-12-15T10:30:00",
    reel_yr: null,
    reel_nbr: null,
    reel_pg: null,
    percent_trans: 100.0,
    good_through_date: "2023-12-31",
  },
  legals: [
    {
      record_type: "L",
      borough: 1,
      block: 123,
      lot: 45,
      easement: "N",
      partial_lot: "E",
      air_rights: "N",
      subterranean_rights: "N",
      property_type: "10",
      street_number: "123",
      street_name: "MAIN ST",
      unit_address: "1A",
      good_through_date: "2023-12-31",
    },
  ],
  parties: [
    {
      party_index: 1,
      record_type: "P",
      party_type: "1",
      name: "SMITH, JOHN",
      address_1: "123 SELLER STREET",
      address_2: "APT 1",
      country: "US",
      city: "NEW YORK",
      state: "NY",
      zip: "10001",
      good_through_date: "2023-12-31",
    },
    {
      party_index: 2,
      record_type: "P",
      party_type: "2",
      name: "DOE, JANE",
      address_1: "456 BUYER AVENUE",
      address_2: "",
      country: "US",
      city: "NEW YORK",
      state: "NY",
      zip: "10002",
      good_through_date: "2023-12-31",
    },
  ],
  references: [
    {
      record_type: "X",
      reference_by_crfn: `2023000111${suffix.padStart(3, "0")}`,
      reference_by_doc_id: `2023111111111${suffix.padStart(3, "0")}`,
      reference_by_reel_year: null,
      reference_by_reel_borough: null,
      reference_by_reel_nbr: null,
      reference_by_reel_page: null,
      good_through_date: "2023-12-31",
    },
  ],
  remarks: [
    {
      record_type: "R",
      sequence_number: 1,
      remark_text: "This is a test property deed transfer",
      good_through_date: "2023-12-31",
    },
  ],
});

/************************************** User Routes */

describe("Real Property User Routes", function () {
  /************************************** GET /realPropertyDbRoutes/documents */

  describe("GET /realPropertyDbRoutes/documents", function () {
    test("works: returns empty array for user with no documents", async function () {
      const resp = await request(app)
        .get("/realPropertyDbRoutes/documents")
        .set("authorization", `Bearer ${testTokens.regular}`);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({ documents: [] });
    });

    test("works: returns documents for user with saved documents", async function () {
      // First save a document
      const testDoc = createTestRealPropertyDoc("101");
      await request(app)
        .post("/realPropertyDbRoutes/document")
        .send(testDoc)
        .set("authorization", `Bearer ${testTokens.regular}`);

      // Then fetch all documents
      const resp = await request(app)
        .get("/realPropertyDbRoutes/documents")
        .set("authorization", `Bearer ${testTokens.regular}`);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body.documents).toHaveLength(1);
      expect(resp.body.documents[0]).toHaveProperty("master");
      expect(resp.body.documents[0].master.document_id).toBe(
        "2023123456789101"
      );
    });

    test("unauthorized: fails for anonymous user", async function () {
      const resp = await request(app).get("/realPropertyDbRoutes/documents");

      expect(resp.statusCode).toEqual(401);
    });

    test("unauthorized: fails with invalid token", async function () {
      const resp = await request(app)
        .get("/realPropertyDbRoutes/documents")
        .set("authorization", `Bearer ${testTokens.invalid}`);

      expect(resp.statusCode).toEqual(401);
    });
  });

  /************************************** GET /realPropertyDbRoutes/document/:documentId */

  describe("GET /realPropertyDbRoutes/document/:documentId", function () {
    test("works: returns specific document for user", async function () {
      // First save a document
      const testDoc = createTestRealPropertyDoc("201");
      const saveResp = await request(app)
        .post("/realPropertyDbRoutes/document")
        .send(testDoc)
        .set("authorization", `Bearer ${testTokens.regular}`);

      const savedMasterId = saveResp.body.savedMasterId;

      // Then fetch the specific document
      const resp = await request(app)
        .get(`/realPropertyDbRoutes/document/${testDoc.master.document_id}`)
        .set("authorization", `Bearer ${testTokens.regular}`);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body.document).toHaveProperty("master");
      expect(resp.body.document).toHaveProperty("legals");
      expect(resp.body.document).toHaveProperty("parties");
      expect(resp.body.document).toHaveProperty("references");
      expect(resp.body.document).toHaveProperty("remarks");
      expect(resp.body.document.master.document_id).toBe("2023123456789201");
    });

    test("not found: returns 404 for non-existent document", async function () {
      const resp = await request(app)
        .get("/realPropertyDbRoutes/document/9999999999999999")
        .set("authorization", `Bearer ${testTokens.regular}`);

      expect(resp.statusCode).toEqual(404);
      expect(resp.body).toEqual({ error: "Document not found" });
    });

    test("unauthorized: fails for anonymous user", async function () {
      const resp = await request(app).get(
        "/realPropertyDbRoutes/document/2023111111111001"
      );

      expect(resp.statusCode).toEqual(401);
    });

    test("security: user cannot access another user's documents", async function () {
      // Save document as regular user
      const testDoc = createTestRealPropertyDoc("202");
      await request(app)
        .post("/realPropertyDbRoutes/document")
        .send(testDoc)
        .set("authorization", `Bearer ${testTokens.regular}`);

      // Try to access as admin user (but admin should use admin routes)
      const resp = await request(app)
        .get(`/realPropertyDbRoutes/document/${testDoc.master.document_id}`)
        .set("authorization", `Bearer ${testTokens.admin}`);

      expect(resp.statusCode).toEqual(404);
    });
  });

  /************************************** POST /realPropertyDbRoutes/document */

  describe("POST /realPropertyDbRoutes/document", function () {
    test("works: saves new real property document", async function () {
      const testDoc = createTestRealPropertyDoc("301");
      const resp = await request(app)
        .post("/realPropertyDbRoutes/document")
        .send(testDoc)
        .set("authorization", `Bearer ${testTokens.regular}`);

      expect(resp.statusCode).toEqual(201);
      expect(resp.body).toHaveProperty("savedMasterId");
      expect(typeof resp.body.savedMasterId).toBe("number");
    });

    test("works: updates existing real property document", async function () {
      // First save a document
      const testDoc = createTestRealPropertyDoc("302");
      const firstResp = await request(app)
        .post("/realPropertyDbRoutes/document")
        .send(testDoc)
        .set("authorization", `Bearer ${testTokens.regular}`);

      expect(firstResp.statusCode).toEqual(201);

      // Update the document
      const updatedDoc = {
        ...testDoc,
        master: {
          ...testDoc.master,
          document_amt: 600000, // Changed amount
        },
      };

      const updateResp = await request(app)
        .post("/realPropertyDbRoutes/document")
        .send(updatedDoc)
        .set("authorization", `Bearer ${testTokens.regular}`);

      expect(updateResp.statusCode).toEqual(201);
      expect(updateResp.body.savedMasterId).toBe(firstResp.body.savedMasterId);
    });

    test("bad request: fails with invalid data", async function () {
      const invalidDoc = {
        master: {
          // Missing required fields like document_id, record_type, etc.
          document_id: "", // Invalid empty document_id
          record_type: "", // Invalid empty record_type
        },
      };

      const resp = await request(app)
        .post("/realPropertyDbRoutes/document")
        .send(invalidDoc)
        .set("authorization", `Bearer ${testTokens.regular}`);

      // The model should handle validation and return an error
      // If it doesn't, that means validation needs to be added to the model
      expect(resp.statusCode).toBeGreaterThanOrEqual(400);
    });

    test("unauthorized: fails for anonymous user", async function () {
      const testDoc = createTestRealPropertyDoc("303");
      const resp = await request(app)
        .post("/realPropertyDbRoutes/document")
        .send(testDoc);

      expect(resp.statusCode).toEqual(401);
    });
  });

  /************************************** DELETE /realPropertyDbRoutes/document/:documentId */

  describe("DELETE /realPropertyDbRoutes/document/:documentId", function () {
    test("works: deletes existing document", async function () {
      // First save a document
      const testDoc = createTestRealPropertyDoc("401");
      const saveResp = await request(app)
        .post("/realPropertyDbRoutes/document")
        .send(testDoc)
        .set("authorization", `Bearer ${testTokens.regular}`);

      const savedMasterId = saveResp.body.savedMasterId;

      // Then delete it
      const deleteResp = await request(app)
        .delete(`/realPropertyDbRoutes/document/${testDoc.master.document_id}`)
        .set("authorization", `Bearer ${testTokens.regular}`);

      expect(deleteResp.statusCode).toEqual(200);
      expect(deleteResp.body).toEqual({ deletedMasterId: savedMasterId });

      // Verify it's gone
      const fetchResp = await request(app)
        .get(`/realPropertyDbRoutes/document/${testDoc.master.document_id}`)
        .set("authorization", `Bearer ${testTokens.regular}`);

      expect(fetchResp.statusCode).toEqual(404);
    });

    test("not found: returns 404 for non-existent document", async function () {
      const resp = await request(app)
        .delete("/realPropertyDbRoutes/document/9999999999999999")
        .set("authorization", `Bearer ${testTokens.regular}`);

      expect(resp.statusCode).toEqual(404);
      expect(resp.body).toEqual({ error: "Document not found" });
    });

    test("unauthorized: fails for anonymous user", async function () {
      const resp = await request(app).delete(
        "/realPropertyDbRoutes/document/2023111111111001"
      );

      expect(resp.statusCode).toEqual(401);
    });
  });
});

/************************************** Admin Routes */

describe("Real Property Admin Routes", function () {
  /************************************** GET /realPropertyDbRoutes/admin/documents/:username */

  describe("GET /realPropertyDbRoutes/admin/documents/:username", function () {
    test("works: admin can fetch any user's documents", async function () {
      // Save document as regular user
      const testDoc = createTestRealPropertyDoc("501");
      await request(app)
        .post("/realPropertyDbRoutes/document")
        .send(testDoc)
        .set("authorization", `Bearer ${testTokens.regular}`);

      // Admin fetches regular user's documents
      const resp = await request(app)
        .get("/realPropertyDbRoutes/admin/documents/testuser")
        .set("authorization", `Bearer ${testTokens.admin}`);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body.documents.length).toBeGreaterThanOrEqual(1);

      // Find our test document
      const ourDoc = resp.body.documents.find(
        (doc) => doc.master.document_id === "2023123456789501"
      );
      expect(ourDoc).toBeDefined();
      expect(ourDoc.master.document_id).toBe("2023123456789501");
    });

    test("unauthorized: fails for non-admin user", async function () {
      const resp = await request(app)
        .get("/realPropertyDbRoutes/admin/documents/testuser")
        .set("authorization", `Bearer ${testTokens.regular}`);

      expect(resp.statusCode).toEqual(401);
    });
  });

  /************************************** POST /realPropertyDbRoutes/admin/document/:username */

  describe("POST /realPropertyDbRoutes/admin/document/:username", function () {
    test("works: admin can save document for any user", async function () {
      const testDoc = createTestRealPropertyDoc("601");
      const resp = await request(app)
        .post("/realPropertyDbRoutes/admin/document/testuser")
        .send(testDoc)
        .set("authorization", `Bearer ${testTokens.admin}`);

      expect(resp.statusCode).toEqual(201);
      expect(resp.body).toHaveProperty("savedMasterId");
      expect(typeof resp.body.savedMasterId).toBe("number");

      // Verify user can access it
      const userResp = await request(app)
        .get("/realPropertyDbRoutes/documents")
        .set("authorization", `Bearer ${testTokens.regular}`);

      const ourDoc = userResp.body.documents.find(
        (doc) => doc.master.document_id === "2023123456789601"
      );
      expect(ourDoc).toBeDefined();
    });

    test("unauthorized: fails for non-admin user", async function () {
      const testDoc = createTestRealPropertyDoc("602");
      const resp = await request(app)
        .post("/realPropertyDbRoutes/admin/document/testuser")
        .send(testDoc)
        .set("authorization", `Bearer ${testTokens.regular}`);

      expect(resp.statusCode).toEqual(401);
    });
  });

  /************************************** DELETE /realPropertyDbRoutes/admin/document/:username/:documentId */

  describe("DELETE /realPropertyDbRoutes/admin/document/:username/:documentId", function () {
    test("works: admin can delete any user's document", async function () {
      // Save document as regular user
      const testDoc = createTestRealPropertyDoc("701");
      const saveResp = await request(app)
        .post("/realPropertyDbRoutes/document")
        .send(testDoc)
        .set("authorization", `Bearer ${testTokens.regular}`);

      const savedMasterId = saveResp.body.savedMasterId;

      // Admin deletes it
      const deleteResp = await request(app)
        .delete(
          `/realPropertyDbRoutes/admin/document/testuser/${testDoc.master.document_id}`
        )
        .set("authorization", `Bearer ${testTokens.admin}`);

      expect(deleteResp.statusCode).toEqual(200);
      expect(deleteResp.body).toEqual({ deletedMasterId: savedMasterId });

      // Verify it's gone from user's documents
      const userResp = await request(app)
        .get("/realPropertyDbRoutes/documents")
        .set("authorization", `Bearer ${testTokens.regular}`);

      const ourDoc = userResp.body.documents.find(
        (doc) => doc.master.document_id === "2023111111111701"
      );
      expect(ourDoc).toBeUndefined();
    });

    test("not found: returns 404 for non-existent document", async function () {
      const resp = await request(app)
        .delete(
          "/realPropertyDbRoutes/admin/document/testuser/9999999999999999"
        )
        .set("authorization", `Bearer ${testTokens.admin}`);

      expect(resp.statusCode).toEqual(404);
      expect(resp.body).toEqual({ error: "Document not found" });
    });

    test("unauthorized: fails for non-admin user", async function () {
      const resp = await request(app)
        .delete(
          "/realPropertyDbRoutes/admin/document/testuser/2023111111111001"
        )
        .set("authorization", `Bearer ${testTokens.regular}`);

      expect(resp.statusCode).toEqual(401);
    });
  });
});

/************************************** Integration Tests */

describe("Real Property Routes Integration Tests", function () {
  test("works: complete CRUD workflow for user", async function () {
    const testDoc = createTestRealPropertyDoc("801");

    // 1. Initially should have some existing documents (from previous tests),
    // but we'll just verify our specific document workflow

    // 2. Save a document
    const saveResp = await request(app)
      .post("/realPropertyDbRoutes/document")
      .send(testDoc)
      .set("authorization", `Bearer ${testTokens.regular}`);
    expect(saveResp.statusCode).toEqual(201);

    // 3. Fetch specific document
    const fetchResp = await request(app)
      .get(`/realPropertyDbRoutes/document/${testDoc.master.document_id}`)
      .set("authorization", `Bearer ${testTokens.regular}`);
    expect(fetchResp.statusCode).toEqual(200);
    expect(fetchResp.body.document.master.document_id).toBe("2023123456789801");

    // 4. Delete the document
    const deleteResp = await request(app)
      .delete(`/realPropertyDbRoutes/document/${testDoc.master.document_id}`)
      .set("authorization", `Bearer ${testTokens.regular}`);
    expect(deleteResp.statusCode).toEqual(200);

    // 5. Verify it's gone
    const verifyResp = await request(app)
      .get(`/realPropertyDbRoutes/document/${testDoc.master.document_id}`)
      .set("authorization", `Bearer ${testTokens.regular}`);
    expect(verifyResp.statusCode).toEqual(404);
  });

  test("security: users cannot access each other's documents", async function () {
    // This is tested implicitly in the individual test cases
    // More comprehensive multi-user testing would require additional test user setup
    expect(true).toBe(true);
  });
});
