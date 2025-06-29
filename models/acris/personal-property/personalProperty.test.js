"use strict";

const {
  getSavedPersonalPropertyDocument,
  savePersonalPropertyDocument,
  deletePersonalPropertyDocument,
} = require("./personalProperty");

const {
  commonBeforeAll,
  commonAfterAll,
  seededUsers,
} = require("../../_testCommon");

beforeAll(commonBeforeAll);
afterAll(commonAfterAll);

// Clean up any test data before each test
beforeEach(async () => {
  // Clean up any saved personal property records from previous tests
  await require("../../../db").query(
    "DELETE FROM saved_personal_property_master WHERE username IN ($1, $2)",
    [seededUsers.regular.username, seededUsers.admin.username]
  );
});

// Test data for personal property documents
const createTestPersonalPropertyDoc = (suffix = "1") => ({
  master: {
    document_id: `2023456789012${suffix.padStart(3, "0")}`,
    record_type: "A",
    crfn: `2023000456${suffix.padStart(3, "0")}`,
    recorded_borough: 1,
    doc_type: "UCC",
    document_amt: 250000.0,
    recorded_datetime: "2023-11-10T14:30:00",
    ucc_collateral: "Y",
    fedtax_serial_nbr: null,
    fedtax_assessment_date: null,
    rpttl_nbr: null,
    modified_date: "2023-11-10T14:30:00",
    reel_yr: null,
    reel_nbr: null,
    reel_pg: null,
    file_nbr: `PP${suffix.padStart(8, "0")}`,
    good_through_date: "2023-12-31",
  },
  legals: [
    {
      record_type: "L",
      borough: 1,
      block: 456,
      lot: 78,
      easement: "N",
      partial_lot: "E",
      air_rights: "N",
      subterranean_rights: "N",
      property_type: "15",
      street_number: "456",
      street_name: "BUSINESS BLVD",
      addr_unit: "2B",
      good_through_date: "2023-12-31",
    },
  ],
  parties: [
    {
      party_index: 1,
      record_type: "P",
      party_type: "1",
      name: "ACME CORPORATION",
      address_1: "123 CORPORATE WAY",
      address_2: "SUITE 100",
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
      name: "FIRST NATIONAL BANK",
      address_1: "789 FINANCE STREET",
      address_2: "",
      country: "US",
      city: "NEW YORK",
      state: "NY",
      zip: "10005",
      good_through_date: "2023-12-31",
    },
  ],
  references: [
    {
      record_type: "X",
      crfn: `2023000333${suffix.padStart(3, "0")}`,
      doc_id_ref: `2023333333333${suffix.padStart(3, "0")}`,
      file_nbr: `REF${suffix.padStart(7, "0")}`,
      good_through_date: "2023-12-31",
    },
  ],
  remarks: [
    {
      record_type: "R",
      sequence_number: 1,
      remark_text: "UCC filing for business equipment financing",
      good_through_date: "2023-12-31",
    },
  ],
});

const createTestPersonalPropertyDoc2 = (suffix = "2") => ({
  master: {
    document_id: `2023987654321${suffix.padStart(3, "0")}`,
    record_type: "A",
    crfn: `2023000987${suffix.padStart(3, "0")}`,
    recorded_borough: 2,
    doc_type: "FXTAX",
    document_amt: 150000.0,
    recorded_datetime: "2023-10-15T09:45:00",
    ucc_collateral: "N",
    fedtax_serial_nbr: "FT2023001234",
    fedtax_assessment_date: "2023-10-01T00:00:00",
    rpttl_nbr: 987654,
    modified_date: "2023-10-15T09:45:00",
    reel_yr: 2023,
    reel_nbr: 100,
    reel_pg: 250,
    file_nbr: `FT${suffix.padStart(8, "0")}`,
    good_through_date: "2023-12-31",
  },
  legals: [
    {
      record_type: "L",
      borough: 2,
      block: 789,
      lot: 123,
      easement: "N",
      partial_lot: "E",
      air_rights: "N",
      subterranean_rights: "N",
      property_type: "20",
      street_number: "789",
      street_name: "TAX AVENUE",
      addr_unit: "",
      good_through_date: "2023-12-31",
    },
  ],
  parties: [
    {
      party_index: 1,
      record_type: "P",
      party_type: "1",
      name: "TAXPAYER LLC",
      address_1: "456 TAXPAYER ROAD",
      address_2: "",
      country: "US",
      city: "BRONX",
      state: "NY",
      zip: "10451",
      good_through_date: "2023-12-31",
    },
  ],
  references: [],
  remarks: [],
});

describe("Personal Property Model", function () {
  describe("getSavedPersonalPropertyDocument", function () {
    test("returns null when no document exists", async function () {
      const result = await getSavedPersonalPropertyDocument(
        seededUsers.regular.username,
        "nonexistent"
      );
      expect(result).toBeNull();
    });

    test("returns empty array when user has no saved documents", async function () {
      const result = await getSavedPersonalPropertyDocument(
        seededUsers.regular.username
      );
      expect(result).toEqual([]);
    });

    test("returns single document by document_id", async function () {
      const testDoc = createTestPersonalPropertyDoc("001");

      // First save a document
      await savePersonalPropertyDocument(seededUsers.regular.username, testDoc);

      // Then retrieve it
      const result = await getSavedPersonalPropertyDocument(
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
      expect(result.master.doc_type).toBe("UCC");
      expect(result.legals[0].borough).toBe(testDoc.legals[0].borough);
      expect(result.parties[0].name).toBe(testDoc.parties[0].name);
      expect(result.references[0].crfn).toBe(testDoc.references[0].crfn);
      expect(result.remarks[0].remark_text).toBe(
        testDoc.remarks[0].remark_text
      );
    });

    test("returns all documents for user", async function () {
      const testDoc1 = createTestPersonalPropertyDoc("002");
      const testDoc2 = createTestPersonalPropertyDoc2("002");

      // Save two documents
      await savePersonalPropertyDocument(
        seededUsers.regular.username,
        testDoc1
      );
      await savePersonalPropertyDocument(
        seededUsers.regular.username,
        testDoc2
      );

      // Retrieve all
      const result = await getSavedPersonalPropertyDocument(
        seededUsers.regular.username
      );

      expect(result).toHaveLength(2);
      const docIds = result.map((doc) => doc.master.document_id).sort();
      expect(docIds).toContain(testDoc1.master.document_id);
      expect(docIds).toContain(testDoc2.master.document_id);
    });

    test("returns only documents for the specified user", async function () {
      const testDoc1 = createTestPersonalPropertyDoc("003");
      const testDoc2 = createTestPersonalPropertyDoc2("003");

      // Save document for regular user
      await savePersonalPropertyDocument(
        seededUsers.regular.username,
        testDoc1
      );

      // Save document for admin user
      await savePersonalPropertyDocument(seededUsers.admin.username, testDoc2);

      // Check regular user only gets their document
      const regularResult = await getSavedPersonalPropertyDocument(
        seededUsers.regular.username
      );
      expect(regularResult).toHaveLength(1);
      expect(regularResult[0].master.document_id).toBe(
        testDoc1.master.document_id
      );

      // Check admin user only gets their document
      const adminResult = await getSavedPersonalPropertyDocument(
        seededUsers.admin.username
      );
      expect(adminResult).toHaveLength(1);
      expect(adminResult[0].master.document_id).toBe(
        testDoc2.master.document_id
      );
    });
  });

  describe("savePersonalPropertyDocument", function () {
    test("saves a complete personal property document", async function () {
      const testDoc = createTestPersonalPropertyDoc("004");

      const masterId = await savePersonalPropertyDocument(
        seededUsers.regular.username,
        testDoc
      );

      expect(typeof masterId).toBe("number");
      expect(masterId).toBeGreaterThan(0);

      // Verify document was saved by retrieving it
      const saved = await getSavedPersonalPropertyDocument(
        seededUsers.regular.username,
        testDoc.master.document_id
      );

      expect(saved).not.toBeNull();
      expect(saved.master.document_id).toBe(testDoc.master.document_id);
      expect(saved.master.doc_type).toBe("UCC");
      expect(saved.master.ucc_collateral).toBe("Y");
    });

    test("handles document with empty strings (sanitizes to null)", async function () {
      const testDoc = createTestPersonalPropertyDoc("005");
      const docWithEmptyStrings = {
        ...testDoc,
        master: {
          ...testDoc.master,
          reel_yr: "",
          reel_nbr: "",
          reel_pg: "",
          fedtax_serial_nbr: "",
        },
        parties: [
          {
            ...testDoc.parties[0],
            address_2: "",
          },
        ],
      };

      await savePersonalPropertyDocument(
        seededUsers.regular.username,
        docWithEmptyStrings
      );

      const saved = await getSavedPersonalPropertyDocument(
        seededUsers.regular.username,
        docWithEmptyStrings.master.document_id
      );

      // Empty strings should be converted to null
      expect(saved.master.reel_yr).toBeNull();
      expect(saved.master.reel_nbr).toBeNull();
      expect(saved.master.reel_pg).toBeNull();
      expect(saved.master.fedtax_serial_nbr).toBeNull();
      expect(saved.parties[0].address_2).toBeNull();
    });

    test("handles document with missing optional arrays", async function () {
      const testDoc = createTestPersonalPropertyDoc("006");
      const minimalDoc = {
        master: testDoc.master,
        legals: testDoc.legals,
        parties: testDoc.parties,
        // references and remarks are optional
      };

      const masterId = await savePersonalPropertyDocument(
        seededUsers.regular.username,
        minimalDoc
      );
      expect(typeof masterId).toBe("number");

      const saved = await getSavedPersonalPropertyDocument(
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
      const testDoc = createTestPersonalPropertyDoc("007");

      // Save initial document
      await savePersonalPropertyDocument(seededUsers.regular.username, testDoc);

      // Modify and save again
      const modifiedDoc = {
        ...testDoc,
        master: {
          ...testDoc.master,
          document_amt: 300000.0,
          modified_date: "2023-11-12T16:45:00",
        },
      };

      const masterId = await savePersonalPropertyDocument(
        seededUsers.regular.username,
        modifiedDoc
      );
      expect(typeof masterId).toBe("number");

      // Should still have only one document for this user with this document_id
      const allDocs = await getSavedPersonalPropertyDocument(
        seededUsers.regular.username
      );
      const thisDoc = allDocs.filter(
        (doc) => doc.master.document_id === testDoc.master.document_id
      );
      expect(thisDoc).toHaveLength(1);

      // Should have updated amount
      expect(thisDoc[0].master.document_amt).toBe("300000.00");
    });

    test("handles multiple parties correctly", async function () {
      const testDoc = createTestPersonalPropertyDoc("008");

      await savePersonalPropertyDocument(seededUsers.regular.username, testDoc);

      const saved = await getSavedPersonalPropertyDocument(
        seededUsers.regular.username,
        testDoc.master.document_id
      );

      expect(saved.parties).toHaveLength(2);
      expect(saved.parties[0].party_index).toBe(1);
      expect(saved.parties[1].party_index).toBe(2);
      expect(saved.parties[0].name).toBe("ACME CORPORATION");
      expect(saved.parties[1].name).toBe("FIRST NATIONAL BANK");
    });

    test("handles UCC collateral flag properly", async function () {
      const testDoc = createTestPersonalPropertyDoc("009");
      testDoc.master.ucc_collateral = "Y";

      await savePersonalPropertyDocument(seededUsers.regular.username, testDoc);

      const saved = await getSavedPersonalPropertyDocument(
        seededUsers.regular.username,
        testDoc.master.document_id
      );

      expect(saved.master.ucc_collateral).toBe("Y");
    });

    test("handles federal tax documents properly", async function () {
      const testDoc = createTestPersonalPropertyDoc2("010");

      await savePersonalPropertyDocument(seededUsers.regular.username, testDoc);

      const saved = await getSavedPersonalPropertyDocument(
        seededUsers.regular.username,
        testDoc.master.document_id
      );

      expect(saved.master.doc_type).toBe("FXTAX");
      expect(saved.master.fedtax_serial_nbr).toBe("FT2023001234");
      expect(saved.master.rpttl_nbr).toBe(987654);
    });
  });

  describe("deletePersonalPropertyDocument", function () {
    test("deletes existing document and returns master id", async function () {
      const testDoc = createTestPersonalPropertyDoc("011");

      // Save a document first
      await savePersonalPropertyDocument(seededUsers.regular.username, testDoc);

      // Delete it
      const deletedId = await deletePersonalPropertyDocument(
        seededUsers.regular.username,
        testDoc.master.document_id
      );

      expect(typeof deletedId).toBe("number");
      expect(deletedId).toBeGreaterThan(0);

      // Verify it's gone
      const result = await getSavedPersonalPropertyDocument(
        seededUsers.regular.username,
        testDoc.master.document_id
      );
      expect(result).toBeNull();
    });

    test("returns null when trying to delete non-existent document", async function () {
      const result = await deletePersonalPropertyDocument(
        seededUsers.regular.username,
        "nonexistent123"
      );
      expect(result).toBeNull();
    });

    test("only deletes document for correct user", async function () {
      const testDoc = createTestPersonalPropertyDoc("012");

      // Save document for regular user
      await savePersonalPropertyDocument(seededUsers.regular.username, testDoc);

      // Try to delete with admin user credentials
      const deletedId = await deletePersonalPropertyDocument(
        seededUsers.admin.username,
        testDoc.master.document_id
      );

      expect(deletedId).toBeNull();

      // Document should still exist for regular user
      const result = await getSavedPersonalPropertyDocument(
        seededUsers.regular.username,
        testDoc.master.document_id
      );
      expect(result).not.toBeNull();
    });

    test("cascades delete to all related tables", async function () {
      const testDoc = createTestPersonalPropertyDoc("013");

      // Save a complete document
      await savePersonalPropertyDocument(seededUsers.regular.username, testDoc);

      // Verify all parts exist
      let saved = await getSavedPersonalPropertyDocument(
        seededUsers.regular.username,
        testDoc.master.document_id
      );
      expect(saved.legals).toHaveLength(1);
      expect(saved.parties).toHaveLength(2);
      expect(saved.references).toHaveLength(1);
      expect(saved.remarks).toHaveLength(1);

      // Delete the document
      await deletePersonalPropertyDocument(
        seededUsers.regular.username,
        testDoc.master.document_id
      );

      // Verify complete deletion
      saved = await getSavedPersonalPropertyDocument(
        seededUsers.regular.username,
        testDoc.master.document_id
      );
      expect(saved).toBeNull();
    });
  });

  describe("error handling", function () {
    test("savePersonalPropertyDocument handles database errors gracefully", async function () {
      // Test with invalid data that would cause a constraint violation
      // Using an extremely long document_id that exceeds database column limits
      const invalidDoc = {
        master: {
          document_id: "a".repeat(200), // Too long for varchar constraints
          record_type: "A",
          crfn: "2023000123456",
          recorded_borough: 1,
          doc_type: "UCC",
          document_amt: 250000.0,
          recorded_datetime: "2023-11-10T14:30:00",
          ucc_collateral: "Y",
          fedtax_serial_nbr: null,
          fedtax_assessment_date: null,
          rpttl_nbr: null,
          modified_date: "2023-11-10T14:30:00",
          reel_yr: null,
          reel_nbr: null,
          reel_pg: null,
          file_nbr: "PP00000001",
          good_through_date: "2023-12-31",
        },
        legals: [
          {
            record_type: "L",
            borough: 1,
            block: 456,
            lot: 78,
            easement: "N",
            partial_lot: "E",
            air_rights: "N",
            subterranean_rights: "N",
            property_type: "15",
            street_number: "456",
            street_name: "BUSINESS BLVD",
            addr_unit: "2B",
            good_through_date: "2023-12-31",
          },
        ],
        parties: [
          {
            party_index: 1,
            record_type: "P",
            party_type: "1",
            name: "ACME CORPORATION",
            address_1: "123 CORPORATE WAY",
            address_2: "SUITE 100",
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
        savePersonalPropertyDocument(seededUsers.regular.username, invalidDoc)
      ).rejects.toThrow();
    });

    test("handles invalid username gracefully", async function () {
      const testDoc = createTestPersonalPropertyDoc("014");

      await expect(
        savePersonalPropertyDocument("nonexistentuser", testDoc)
      ).rejects.toThrow();
    });
  });
});
