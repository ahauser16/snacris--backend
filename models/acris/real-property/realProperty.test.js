"use strict";

const {
  getSavedRealPropertyDocument,
  saveRealPropertyDocument,
  deleteRealPropertyDocument,
} = require("./realProperty");

const {
  commonBeforeAll,
  commonAfterAll,
  seededUsers,
} = require("../../_testCommon");

beforeAll(commonBeforeAll);
afterAll(commonAfterAll);

// Clean up any test data before each test
beforeEach(async () => {
  // Clean up any saved real property records from previous tests
  await require("../../../db").query(
    "DELETE FROM saved_real_property_master WHERE username IN ($1, $2)",
    [seededUsers.regular.username, seededUsers.admin.username]
  );
});

// Test data for real property documents
const createTestRealPropertyDoc = (suffix = "1") => ({
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

const createTestRealPropertyDoc2 = (suffix = "2") => ({
  master: {
    document_id: `2023987654321${suffix.padStart(3, "0")}`,
    record_type: "A",
    crfn: `2023000987${suffix.padStart(3, "0")}`,
    recorded_borough: 2,
    doc_type: "MTGE",
    document_date: "2023-11-20",
    document_amt: 400000.0,
    recorded_datetime: "2023-11-20T14:15:00",
    modified_date: "2023-11-20T14:15:00",
    reel_yr: null,
    reel_nbr: null,
    reel_pg: null,
    percent_trans: null,
    good_through_date: "2023-12-31",
  },
  legals: [
    {
      record_type: "L",
      borough: 2,
      block: 456,
      lot: 78,
      easement: "N",
      partial_lot: "E",
      air_rights: "N",
      subterranean_rights: "N",
      property_type: "11",
      street_number: "789",
      street_name: "BROADWAY",
      unit_address: "",
      good_through_date: "2023-12-31",
    },
  ],
  parties: [
    {
      party_index: 1,
      record_type: "P",
      party_type: "1",
      name: "JOHNSON, ROBERT",
      address_1: "789 BORROWER LANE",
      address_2: "",
      country: "US",
      city: "BRONX",
      state: "NY",
      zip: "10451",
      good_through_date: "2023-12-31",
    },
    {
      party_index: 2,
      record_type: "P",
      party_type: "2",
      name: "FIRST NATIONAL BANK",
      address_1: "100 BANK PLAZA",
      address_2: "SUITE 500",
      country: "US",
      city: "NEW YORK",
      state: "NY",
      zip: "10005",
      good_through_date: "2023-12-31",
    },
  ],
  references: [],
  remarks: [],
});

describe("Real Property Model", function () {
  describe("getSavedRealPropertyDocument", function () {
    test("returns null when no document exists", async function () {
      const result = await getSavedRealPropertyDocument(
        seededUsers.regular.username,
        "nonexistent"
      );
      expect(result).toBeNull();
    });

    test("returns empty array when user has no saved documents", async function () {
      const result = await getSavedRealPropertyDocument(
        seededUsers.regular.username
      );
      expect(result).toEqual([]);
    });

    test("returns single document by document_id", async function () {
      const testDoc = createTestRealPropertyDoc("001");

      // First save a document
      await saveRealPropertyDocument(seededUsers.regular.username, testDoc);

      // Then retrieve it
      const result = await getSavedRealPropertyDocument(
        seededUsers.regular.username,
        testDoc.master.document_id
      );

      expect(result).not.toBeNull();
      expect(result.master.document_id).toBe(testDoc.master.document_id);
      expect(result.master.username).toBe(seededUsers.regular.username);
      expect(result.legals).toHaveLength(1);
      expect(result.parties).toHaveLength(2);
      expect(result.references).toHaveLength(1);
      expect(result.remarks).toHaveLength(1);

      // Check specific data
      expect(result.master.crfn).toBe(testDoc.master.crfn);
      expect(result.legals[0].borough).toBe(testDoc.legals[0].borough);
      expect(result.parties[0].name).toBe(testDoc.parties[0].name);
    });

    test("returns all documents for user", async function () {
      const testDoc1 = createTestRealPropertyDoc("002");
      const testDoc2 = createTestRealPropertyDoc2("002");

      // Save two documents
      await saveRealPropertyDocument(seededUsers.regular.username, testDoc1);
      await saveRealPropertyDocument(seededUsers.regular.username, testDoc2);

      // Retrieve all
      const result = await getSavedRealPropertyDocument(
        seededUsers.regular.username
      );

      expect(result).toHaveLength(2);
      expect(result[0].master.document_id).toBe(testDoc1.master.document_id);
      expect(result[1].master.document_id).toBe(testDoc2.master.document_id);
    });

    test("returns only documents for the specified user", async function () {
      const testDoc1 = createTestRealPropertyDoc("003");
      const testDoc2 = createTestRealPropertyDoc2("003");

      // Save document for regular user
      await saveRealPropertyDocument(seededUsers.regular.username, testDoc1);

      // Save document for admin user
      await saveRealPropertyDocument(seededUsers.admin.username, testDoc2);

      // Check regular user only gets their document
      const regularResult = await getSavedRealPropertyDocument(
        seededUsers.regular.username
      );
      expect(regularResult).toHaveLength(1);
      expect(regularResult[0].master.document_id).toBe(
        testDoc1.master.document_id
      );

      // Check admin user only gets their document
      const adminResult = await getSavedRealPropertyDocument(
        seededUsers.admin.username
      );
      expect(adminResult).toHaveLength(1);
      expect(adminResult[0].master.document_id).toBe(
        testDoc2.master.document_id
      );
    });
  });

  describe("saveRealPropertyDocument", function () {
    test("saves a complete real property document", async function () {
      const testDoc = createTestRealPropertyDoc("004");

      const masterId = await saveRealPropertyDocument(
        seededUsers.regular.username,
        testDoc
      );

      expect(typeof masterId).toBe("number");
      expect(masterId).toBeGreaterThan(0);

      // Verify document was saved by retrieving it
      const saved = await getSavedRealPropertyDocument(
        seededUsers.regular.username,
        testDoc.master.document_id
      );

      expect(saved).not.toBeNull();
      expect(saved.master.document_id).toBe(testDoc.master.document_id);
    });

    test("handles document with empty strings (sanitizes to null)", async function () {
      const testDoc = createTestRealPropertyDoc("005");
      const docWithEmptyStrings = {
        ...testDoc,
        master: {
          ...testDoc.master,
          reel_yr: "",
          reel_nbr: "",
          reel_pg: "",
        },
        parties: [
          {
            ...testDoc.parties[0],
            address_2: "",
          },
        ],
      };

      await saveRealPropertyDocument(
        seededUsers.regular.username,
        docWithEmptyStrings
      );

      const saved = await getSavedRealPropertyDocument(
        seededUsers.regular.username,
        docWithEmptyStrings.master.document_id
      );

      // Empty strings should be converted to null
      expect(saved.master.reel_yr).toBeNull();
      expect(saved.master.reel_nbr).toBeNull();
      expect(saved.master.reel_pg).toBeNull();
      expect(saved.parties[0].address_2).toBeNull();
    });

    test("handles document with missing optional arrays", async function () {
      const testDoc = createTestRealPropertyDoc("006");
      const minimalDoc = {
        master: testDoc.master,
        legals: testDoc.legals,
        parties: testDoc.parties,
        // references and remarks are optional
      };

      const masterId = await saveRealPropertyDocument(
        seededUsers.regular.username,
        minimalDoc
      );
      expect(typeof masterId).toBe("number");

      const saved = await getSavedRealPropertyDocument(
        seededUsers.regular.username,
        minimalDoc.master.document_id
      );

      expect(saved).not.toBeNull();
      expect(saved.legals).toHaveLength(1);
      expect(saved.parties).toHaveLength(2);
      // Should create empty records for missing references/remarks
      expect(saved.references).toHaveLength(1);
      expect(saved.remarks).toHaveLength(1);
      // The empty records should have null values
      expect(saved.references[0].record_type).toBeNull();
      expect(saved.remarks[0].record_type).toBeNull();
    });

    test("updates existing document (upsert functionality)", async function () {
      const testDoc = createTestRealPropertyDoc("007");

      // Save initial document
      await saveRealPropertyDocument(seededUsers.regular.username, testDoc);

      // Modify and save again
      const modifiedDoc = {
        ...testDoc,
        master: {
          ...testDoc.master,
          document_amt: 600000.0,
          modified_date: "2023-12-16T15:45:00",
        },
      };

      const masterId = await saveRealPropertyDocument(
        seededUsers.regular.username,
        modifiedDoc
      );
      expect(typeof masterId).toBe("number");

      // Should still have only one document for this user with this document_id
      const allDocs = await getSavedRealPropertyDocument(
        seededUsers.regular.username
      );
      const thisDoc = allDocs.filter(
        (doc) => doc.master.document_id === testDoc.master.document_id
      );
      expect(thisDoc).toHaveLength(1);

      // Should have updated amount
      expect(thisDoc[0].master.document_amt).toBe("600000.00");
    });

    test("handles multiple parties correctly", async function () {
      const testDoc = createTestRealPropertyDoc("008");

      await saveRealPropertyDocument(seededUsers.regular.username, testDoc);

      const saved = await getSavedRealPropertyDocument(
        seededUsers.regular.username,
        testDoc.master.document_id
      );

      expect(saved.parties).toHaveLength(2);
      expect(saved.parties[0].party_type).toBe("1");
      expect(saved.parties[1].party_type).toBe("2");
      expect(saved.parties[0].name).toBe("SMITH, JOHN");
      expect(saved.parties[1].name).toBe("DOE, JANE");
    });
  });

  describe("deleteRealPropertyDocument", function () {
    test("deletes existing document and returns master id", async function () {
      const testDoc = createTestRealPropertyDoc("009");

      // Save a document first
      await saveRealPropertyDocument(seededUsers.regular.username, testDoc);

      // Delete it
      const deletedId = await deleteRealPropertyDocument(
        seededUsers.regular.username,
        testDoc.master.document_id
      );

      expect(typeof deletedId).toBe("number");
      expect(deletedId).toBeGreaterThan(0);

      // Verify it's gone
      const result = await getSavedRealPropertyDocument(
        seededUsers.regular.username,
        testDoc.master.document_id
      );
      expect(result).toBeNull();
    });

    test("returns null when trying to delete non-existent document", async function () {
      const result = await deleteRealPropertyDocument(
        seededUsers.regular.username,
        "nonexistent123"
      );
      expect(result).toBeNull();
    });

    test("only deletes document for correct user", async function () {
      const testDoc = createTestRealPropertyDoc("010");

      // Save document for regular user
      await saveRealPropertyDocument(seededUsers.regular.username, testDoc);

      // Try to delete with admin user credentials
      const deletedId = await deleteRealPropertyDocument(
        seededUsers.admin.username,
        testDoc.master.document_id
      );

      expect(deletedId).toBeNull();

      // Document should still exist for regular user
      const result = await getSavedRealPropertyDocument(
        seededUsers.regular.username,
        testDoc.master.document_id
      );
      expect(result).not.toBeNull();
    });

    test("cascades delete to all related tables", async function () {
      const testDoc = createTestRealPropertyDoc("011");

      // Save a complete document
      await saveRealPropertyDocument(seededUsers.regular.username, testDoc);

      // Verify all parts exist
      let saved = await getSavedRealPropertyDocument(
        seededUsers.regular.username,
        testDoc.master.document_id
      );
      expect(saved.legals).toHaveLength(1);
      expect(saved.parties).toHaveLength(2);
      expect(saved.references).toHaveLength(1);
      expect(saved.remarks).toHaveLength(1);

      // Delete the document
      await deleteRealPropertyDocument(
        seededUsers.regular.username,
        testDoc.master.document_id
      );

      // Verify complete deletion
      saved = await getSavedRealPropertyDocument(
        seededUsers.regular.username,
        testDoc.master.document_id
      );
      expect(saved).toBeNull();
    });
  });

  describe("error handling", function () {
    test("saveRealPropertyDocument handles database errors gracefully", async function () {
      // Test with invalid data that would cause a constraint violation
      // Using an extremely long document_id that exceeds database column limits
      const invalidDoc = {
        master: {
          document_id: "a".repeat(200), // Too long for varchar constraints
          record_type: "A",
          crfn: "2023000123456",
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
        ],
        references: [],
        remarks: [],
      };

      await expect(
        saveRealPropertyDocument(seededUsers.regular.username, invalidDoc)
      ).rejects.toThrow();
    });

    test("handles invalid username gracefully", async function () {
      const testDoc = createTestRealPropertyDoc("012");

      await expect(
        saveRealPropertyDocument("nonexistentuser", testDoc)
      ).rejects.toThrow();
    });
  });
});
