"use strict";

const request = require("supertest");
const app = require("../../../../app");
const PartiesPersPropApi = require("../../../../thirdPartyApi/acris/personal-property/PartiesPersPropApi");
const { createToken } = require("../../../../helpers/tokens");
const { NotFoundError } = require("../../../../expressError");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
} = require("../../../_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

// Mock the PartiesPersPropApi
jest.mock("../../../../thirdPartyApi/acris/personal-property/PartiesPersPropApi");

describe("Personal Property Parties API Routes", function () {
  describe("GET /persPropertyParties/fetchRecord", function () {
    test("works: returns personal property parties records with query parameters", async function () {
      const mockParties = [
        {
          document_id: "2023040500001001",
          record_type: "D",
          party_type: "GRANTOR",
          name: "JOHN DOE",
          address_1: "123 MAIN ST",
          address_2: "APT 1",
          country: "US",
          city: "NEW YORK",
          state: "NY",
          zip: "10001",
          good_through_date: "2024-12-31T23:59:59.000"
        },
        {
          document_id: "2023040500001002",
          record_type: "D",
          party_type: "GRANTEE",
          name: "JANE SMITH",
          address_1: "456 BROADWAY",
          address_2: "",
          country: "US",
          city: "NEW YORK",
          state: "NY",
          zip: "10002",
          good_through_date: "2024-12-31T23:59:59.000"
        }
      ];

      PartiesPersPropApi.fetchFromAcris.mockResolvedValue(mockParties);

      const resp = await request(app)
        .get("/persPropertyParties/fetchRecord?document_id=2023040500001001&party_type=GRANTOR")
        .set("authorization", `Bearer ${u1Token}`);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        partiesRecords: mockParties
      });
      expect(PartiesPersPropApi.fetchFromAcris).toHaveBeenCalledWith({
        document_id: "2023040500001001",
        party_type: "GRANTOR"
      });
    });

    test("works: returns records with no query parameters", async function () {
      const mockParties = [
        {
          document_id: "2023040500001003",
          record_type: "M",
          party_type: "SECURED PARTY",
          name: "ABC BANK",
          address_1: "789 FINANCE BLVD",
          address_2: "SUITE 100",
          country: "US",
          city: "NEW YORK",
          state: "NY",
          zip: "10003",
          good_through_date: "2024-12-31T23:59:59.000"
        }
      ];

      PartiesPersPropApi.fetchFromAcris.mockResolvedValue(mockParties);

      const resp = await request(app)
        .get("/persPropertyParties/fetchRecord")
        .set("authorization", `Bearer ${u1Token}`);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        partiesRecords: mockParties
      });
      expect(PartiesPersPropApi.fetchFromAcris).toHaveBeenCalledWith({});
    });

    test("works: handles multiple query parameters", async function () {
      const mockParties = [
        {
          document_id: "2023040500001004",
          record_type: "A",
          party_type: "DEBTOR",
          name: "EXAMPLE CORP",
          address_1: "321 BUSINESS AVE",
          address_2: "",
          country: "US",
          city: "BROOKLYN",
          state: "NY",
          zip: "11201",
          good_through_date: "2024-12-31T23:59:59.000"
        }
      ];

      PartiesPersPropApi.fetchFromAcris.mockResolvedValue(mockParties);

      const resp = await request(app)
        .get("/persPropertyParties/fetchRecord")
        .query({
          document_id: "2023040500001004",
          party_type: "DEBTOR",
          name: "EXAMPLE CORP",
          state: "NY",
          $limit: 100,
          $offset: 0
        })
        .set("authorization", `Bearer ${u1Token}`);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        partiesRecords: mockParties
      });
      expect(PartiesPersPropApi.fetchFromAcris).toHaveBeenCalledWith({
        document_id: "2023040500001004",
        party_type: "DEBTOR",
        name: "EXAMPLE CORP",
        state: "NY",
        $limit: "100",
        $offset: "0"
      });
    });

    test("works: handles party type specific queries", async function () {
      const mockParties = [
        {
          document_id: "2023040500001005",
          record_type: "L",
          party_type: "ASSIGNEE",
          name: "LEGAL FIRM LLC",
          address_1: "555 LAW ST",
          address_2: "FLOOR 20",
          country: "US",
          city: "MANHATTAN",
          state: "NY",
          zip: "10005",
          good_through_date: "2024-12-31T23:59:59.000"
        }
      ];

      PartiesPersPropApi.fetchFromAcris.mockResolvedValue(mockParties);

      const resp = await request(app)
        .get("/persPropertyParties/fetchRecord?party_type=ASSIGNEE")
        .set("authorization", `Bearer ${u1Token}`);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        partiesRecords: mockParties
      });
      expect(PartiesPersPropApi.fetchFromAcris).toHaveBeenCalledWith({
        party_type: "ASSIGNEE"
      });
    });

    test("handles API errors gracefully", async function () {
      PartiesPersPropApi.fetchFromAcris.mockRejectedValue(
        new Error("API connection failed")
      );

      const resp = await request(app)
        .get("/persPropertyParties/fetchRecord?document_id=2023040500001001")
        .set("authorization", `Bearer ${u1Token}`);

      expect(resp.statusCode).toEqual(500);
      expect(resp.body).toEqual({
        error: {
          message: "API connection failed",
          status: 500
        }
      });
    });

    test("handles NotFoundError from API", async function () {
      PartiesPersPropApi.fetchFromAcris.mockRejectedValue(
        new NotFoundError("No records found for the given query from Personal Property Parties API.")
      );

      const resp = await request(app)
        .get("/persPropertyParties/fetchRecord?document_id=INVALID123")
        .set("authorization", `Bearer ${u1Token}`);

      expect(resp.statusCode).toEqual(404);
      expect(resp.body).toEqual({
        error: {
          message: "No records found for the given query from Personal Property Parties API.",
          status: 404
        }
      });
    });

    test("returns empty array when API returns empty results", async function () {
      PartiesPersPropApi.fetchFromAcris.mockResolvedValue([]);

      const resp = await request(app)
        .get("/persPropertyParties/fetchRecord?document_id=NONEXISTENT")
        .set("authorization", `Bearer ${u1Token}`);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        partiesRecords: []
      });
    });

    test("production behavior: route does not require authentication for development/testing", async function () {
      const mockParties = [
        {
          document_id: "2023040500001007",
          record_type: "T",
          party_type: "TRANSFEREE",
          name: "TEST ENTITY",
          address_1: "999 TEST ST",
          address_2: "",
          country: "US",
          city: "QUEENS",
          state: "NY",
          zip: "11365",
          good_through_date: "2024-12-31T23:59:59.000"
        }
      ];

      PartiesPersPropApi.fetchFromAcris.mockResolvedValue(mockParties);

      const resp = await request(app)
        .get("/persPropertyParties/fetchRecord?document_id=2023040500001007");

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        partiesRecords: mockParties
      });
    });

    test("works: validates parties data structure", async function () {
      const mockParties = [
        {
          document_id: "2023040500001008",
          record_type: "R",
          party_type: "GRANTOR",
          name: "VALIDATION TEST",
          address_1: "123 VALIDATION AVE",
          address_2: "UNIT B",
          country: "US",
          city: "BRONX",
          state: "NY",
          zip: "10456",
          good_through_date: "2024-12-31T23:59:59.000"
        }
      ];

      PartiesPersPropApi.fetchFromAcris.mockResolvedValue(mockParties);

      const resp = await request(app)
        .get("/persPropertyParties/fetchRecord?name=VALIDATION TEST")
        .set("authorization", `Bearer ${u1Token}`);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body.partiesRecords[0]).toHaveProperty('document_id');
      expect(resp.body.partiesRecords[0]).toHaveProperty('record_type');
      expect(resp.body.partiesRecords[0]).toHaveProperty('party_type');
      expect(resp.body.partiesRecords[0]).toHaveProperty('name');
      expect(resp.body.partiesRecords[0]).toHaveProperty('address_1');
      expect(resp.body.partiesRecords[0]).toHaveProperty('country');
      expect(resp.body.partiesRecords[0]).toHaveProperty('city');
      expect(resp.body.partiesRecords[0]).toHaveProperty('state');
      expect(resp.body.partiesRecords[0]).toHaveProperty('zip');
    });
  });

  describe("GET /persPropertyParties/fetchRecordCount", function () {
    test("works: returns count of matching records", async function () {
      const mockCount = 42;

      PartiesPersPropApi.fetchCountFromAcris.mockResolvedValue(mockCount);

      const resp = await request(app)
        .get("/persPropertyParties/fetchRecordCount?party_type=GRANTOR&state=NY")
        .set("authorization", `Bearer ${u1Token}`);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        partiesRecordCount: mockCount
      });
      expect(PartiesPersPropApi.fetchCountFromAcris).toHaveBeenCalledWith({
        party_type: "GRANTOR",
        state: "NY"
      });
    });

    test("works: returns count with no query parameters", async function () {
      const mockCount = 100;

      PartiesPersPropApi.fetchCountFromAcris.mockResolvedValue(mockCount);

      const resp = await request(app)
        .get("/persPropertyParties/fetchRecordCount")
        .set("authorization", `Bearer ${u1Token}`);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        partiesRecordCount: mockCount
      });
      expect(PartiesPersPropApi.fetchCountFromAcris).toHaveBeenCalledWith({});
    });

    test("handles API errors in count endpoint", async function () {
      PartiesPersPropApi.fetchCountFromAcris.mockRejectedValue(
        new Error("Count API failed")
      );

      const resp = await request(app)
        .get("/persPropertyParties/fetchRecordCount?party_type=INVALID")
        .set("authorization", `Bearer ${u1Token}`);

      expect(resp.statusCode).toEqual(500);
      expect(resp.body).toEqual({
        error: {
          message: "Count API failed",
          status: 500
        }
      });
    });
  });

  describe("GET /persPropertyParties/fetchDocIds", function () {
    test("works: returns document IDs", async function () {
      const mockDocIds = ["2023040500001001", "2023040500001002", "2023040500001003"];

      PartiesPersPropApi.fetchDocIdsFromAcris.mockResolvedValue(mockDocIds);

      const resp = await request(app)
        .get("/persPropertyParties/fetchDocIds?party_type=GRANTOR&state=NY")
        .set("authorization", `Bearer ${u1Token}`);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        partiesRecordsDocumentIds: mockDocIds
      });
      expect(PartiesPersPropApi.fetchDocIdsFromAcris).toHaveBeenCalledWith({
        party_type: "GRANTOR",
        state: "NY"
      });
    });

    test("works: returns document IDs with no query parameters", async function () {
      const mockDocIds = ["2023040500001004", "2023040500001005"];

      PartiesPersPropApi.fetchDocIdsFromAcris.mockResolvedValue(mockDocIds);

      const resp = await request(app)
        .get("/persPropertyParties/fetchDocIds")
        .set("authorization", `Bearer ${u1Token}`);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        partiesRecordsDocumentIds: mockDocIds
      });
      expect(PartiesPersPropApi.fetchDocIdsFromAcris).toHaveBeenCalledWith({});
    });

    test("handles API errors in document IDs endpoint", async function () {
      PartiesPersPropApi.fetchDocIdsFromAcris.mockRejectedValue(
        new Error("DocIds API failed")
      );

      const resp = await request(app)
        .get("/persPropertyParties/fetchDocIds?party_type=INVALID")
        .set("authorization", `Bearer ${u1Token}`);

      expect(resp.statusCode).toEqual(500);
      expect(resp.body).toEqual({
        error: {
          message: "DocIds API failed",
          status: 500
        }
      });
    });

    test("returns empty array when no document IDs found", async function () {
      PartiesPersPropApi.fetchDocIdsFromAcris.mockResolvedValue([]);

      const resp = await request(app)
        .get("/persPropertyParties/fetchDocIds?party_type=NONEXISTENT")
        .set("authorization", `Bearer ${u1Token}`);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        partiesRecordsDocumentIds: []
      });
    });
  });

  describe("GET /persPropertyParties/fetchDocIdsCrossRefMasterDocIds", function () {
    test("works: returns cross-referenced document IDs", async function () {
      const mockCrossRefDocIds = ["2023040500001001", "2023040500001003"];
      const masterDocIds = ["2023040500001001", "2023040500001002", "2023040500001003"];

      PartiesPersPropApi.fetchDocIdsFromAcrisCrossRefMaster.mockResolvedValue(mockCrossRefDocIds);

      const resp = await request(app)
        .get("/persPropertyParties/fetchDocIdsCrossRefMasterDocIds")
        .query({
          party_type: "GRANTOR",
          masterRecordsDocumentIds: JSON.stringify(masterDocIds)
        })
        .set("authorization", `Bearer ${u1Token}`);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        partiesDocIdsCrossRefMaster: mockCrossRefDocIds
      });
      expect(PartiesPersPropApi.fetchDocIdsFromAcrisCrossRefMaster).toHaveBeenCalledWith({
        party_type: "GRANTOR",
        masterRecordsDocumentIds: JSON.stringify(masterDocIds)
      }, masterDocIds);
    });

    test("works: handles empty masterRecordsDocumentIds array", async function () {
      const mockCrossRefDocIds = [];

      PartiesPersPropApi.fetchDocIdsFromAcrisCrossRefMaster.mockResolvedValue(mockCrossRefDocIds);

      const resp = await request(app)
        .get("/persPropertyParties/fetchDocIdsCrossRefMasterDocIds?party_type=GRANTOR")
        .set("authorization", `Bearer ${u1Token}`);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        partiesDocIdsCrossRefMaster: mockCrossRefDocIds
      });
      expect(PartiesPersPropApi.fetchDocIdsFromAcrisCrossRefMaster).toHaveBeenCalledWith({
        party_type: "GRANTOR"
      }, []);
    });

    test("handles JSON parsing errors gracefully", async function () {
      const resp = await request(app)
        .get("/persPropertyParties/fetchDocIdsCrossRefMasterDocIds")
        .query({
          party_type: "GRANTOR",
          masterRecordsDocumentIds: "invalid-json"
        })
        .set("authorization", `Bearer ${u1Token}`);

      expect(resp.statusCode).toEqual(500);
      expect(resp.body.error).toBeDefined();
      expect(resp.body.error.status).toEqual(500);
    });

    test("handles API errors in cross-reference endpoint", async function () {
      PartiesPersPropApi.fetchDocIdsFromAcrisCrossRefMaster.mockRejectedValue(
        new Error("CrossRef API failed")
      );

      const resp = await request(app)
        .get("/persPropertyParties/fetchDocIdsCrossRefMasterDocIds")
        .query({
          party_type: "GRANTOR",
          masterRecordsDocumentIds: JSON.stringify(["123", "456"])
        })
        .set("authorization", `Bearer ${u1Token}`);

      expect(resp.statusCode).toEqual(500);
      expect(resp.body).toEqual({
        error: {
          message: "CrossRef API failed",
          status: 500
        }
      });
    });
  });
});
