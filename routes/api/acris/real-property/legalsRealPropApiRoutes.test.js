"use strict";

/**
 * Test suite for ACRIS Real Property Legals API Routes
 *
 * NOTE: These routes were used during development with Postman for API exploration and learning purposes
 * and are NOT being used in the deployed application. However, the methods contained in the
 * LegalsRealPropApi module are used in the deployed application.
 */

const request = require("supertest");
const app = require("../../../../app");
const LegalsRealPropApi = require("../../../../thirdPartyApi/acris/real-property/LegalsRealPropApi");

// Mock the LegalsRealPropApi
jest.mock("../../../../thirdPartyApi/acris/real-property/LegalsRealPropApi");

const mockedLegalsRealPropApi = LegalsRealPropApi;

describe("Real Property Legals API Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /realPropertyLegals/fetchRecord", () => {
    test("works: returns real property legals records with query parameters", async () => {
      // Mock the API response
      const mockLegalsData = [
        {
          document_id: "2023040500001001",
          record_type: "LEGAL",
          borough: "1",
          block: "123",
          lot: "45",
          easement: "N",
          partial_lot: "N",
          air_rights: "N",
          subterranean_rights: "N",
          property_type: "RESIDENTIAL",
          street_number: "123",
          street_name: "MAIN ST",
          unit: "1A",
          good_through_date: "2024-12-31T23:59:59.000",
        },
        {
          document_id: "2023040500001002",
          record_type: "LEGAL",
          borough: "1",
          block: "456",
          lot: "78",
          easement: "N",
          partial_lot: "N",
          air_rights: "N",
          subterranean_rights: "N",
          property_type: "COMMERCIAL",
          street_number: "456",
          street_name: "BROADWAY",
          unit: "",
          good_through_date: "2024-12-31T23:59:59.000",
        },
      ];

      mockedLegalsRealPropApi.fetchAcrisRecords.mockResolvedValue(
        mockLegalsData
      );

      const queryParams = {
        borough: "1",
        block: "123",
        lot: "45",
      };

      const resp = await request(app)
        .get("/realPropertyLegals/fetchRecord")
        .query(queryParams);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        realPropLegalsRecords: mockLegalsData,
      });

      // Verify the API was called with the correct query parameters
      expect(mockedLegalsRealPropApi.fetchAcrisRecords).toHaveBeenCalledWith(
        queryParams
      );
      expect(mockedLegalsRealPropApi.fetchAcrisRecords).toHaveBeenCalledTimes(
        1
      );
    });

    test("works: returns records with no query parameters", async () => {
      const mockLegalsData = [
        {
          document_id: "2023040500001003",
          record_type: "LEGAL",
          borough: "2",
          block: "789",
          lot: "101",
          easement: "N",
          partial_lot: "N",
          air_rights: "N",
          subterranean_rights: "N",
          property_type: "RESIDENTIAL",
          street_number: "789",
          street_name: "PARK AVE",
          unit: "",
          good_through_date: "2024-12-31T23:59:59.000",
        },
      ];

      mockedLegalsRealPropApi.fetchAcrisRecords.mockResolvedValue(
        mockLegalsData
      );

      const resp = await request(app).get("/realPropertyLegals/fetchRecord");

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        realPropLegalsRecords: mockLegalsData,
      });

      // Verify the API was called with empty query object
      expect(mockedLegalsRealPropApi.fetchAcrisRecords).toHaveBeenCalledWith(
        {}
      );
      expect(mockedLegalsRealPropApi.fetchAcrisRecords).toHaveBeenCalledTimes(
        1
      );
    });

    test("works: handles multiple query parameters", async () => {
      const mockLegalsData = [
        {
          document_id: "2023040500001004",
          record_type: "LEGAL",
          borough: "3",
          block: "555",
          lot: "222",
          easement: "Y",
          partial_lot: "N",
          air_rights: "N",
          subterranean_rights: "N",
          property_type: "MIXED USE",
          street_number: "555",
          street_name: "5TH AVE",
          unit: "PENTHOUSE",
          good_through_date: "2024-12-31T23:59:59.000",
        },
      ];

      mockedLegalsRealPropApi.fetchAcrisRecords.mockResolvedValue(
        mockLegalsData
      );

      const queryParams = {
        borough: "3",
        block: "555",
        lot: "222",
        property_type: "MIXED USE",
        $limit: "100",
      };

      const resp = await request(app)
        .get("/realPropertyLegals/fetchRecord")
        .query(queryParams);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        realPropLegalsRecords: mockLegalsData,
      });

      expect(mockedLegalsRealPropApi.fetchAcrisRecords).toHaveBeenCalledWith(
        queryParams
      );
    });

    test("handles API errors gracefully", async () => {
      const errorMessage = "API service unavailable";
      mockedLegalsRealPropApi.fetchAcrisRecords.mockRejectedValue(
        new Error(errorMessage)
      );

      const resp = await request(app)
        .get("/realPropertyLegals/fetchRecord")
        .query({ borough: "1", block: "123" });

      expect(resp.statusCode).toEqual(500);
      expect(resp.body).toEqual({
        error: {
          message: errorMessage,
          status: 500,
        },
      });
    });

    test("handles NotFoundError from API", async () => {
      const { NotFoundError } = require("../../../../expressError");
      const notFoundError = new NotFoundError(
        'No records found for query: {"borough":"9","block":"999"}'
      );

      mockedLegalsRealPropApi.fetchAcrisRecords.mockRejectedValue(
        notFoundError
      );

      const resp = await request(app)
        .get("/realPropertyLegals/fetchRecord")
        .query({ borough: "9", block: "999" });

      expect(resp.statusCode).toEqual(404);
      expect(resp.body).toEqual({
        error: {
          message: 'No records found for query: {"borough":"9","block":"999"}',
          status: 404,
        },
      });
    });

    test("returns empty array when API returns empty results", async () => {
      const { NotFoundError } = require("../../../../expressError");
      mockedLegalsRealPropApi.fetchAcrisRecords.mockRejectedValue(
        new NotFoundError("No records found")
      );

      const resp = await request(app)
        .get("/realPropertyLegals/fetchRecord")
        .query({ borough: "9", block: "NONEXISTENT" });

      expect(resp.statusCode).toEqual(404);
      expect(resp.body).toHaveProperty("error");
    });

    test("development behavior: route does not require authentication", async () => {
      const mockLegalsData = [
        {
          document_id: "2023040500001005",
          record_type: "LEGAL",
          borough: "4",
          block: "888",
          lot: "999",
          easement: "N",
          partial_lot: "N",
          air_rights: "N",
          subterranean_rights: "N",
          property_type: "OFFICE",
          street_number: "888",
          street_name: "LEXINGTON AVE",
          unit: "SUITE 100",
          good_through_date: "2024-12-31T23:59:59.000",
        },
      ];

      mockedLegalsRealPropApi.fetchAcrisRecords.mockResolvedValue(
        mockLegalsData
      );

      // Test without any authorization headers
      const resp = await request(app)
        .get("/realPropertyLegals/fetchRecord")
        .query({ borough: "4", block: "888" });

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        realPropLegalsRecords: mockLegalsData,
      });
    });
  });

  describe("GET /realPropertyLegals/fetchRecordCount", () => {
    test("works: returns count of matching records", async () => {
      const mockCount = 42;
      mockedLegalsRealPropApi.fetchAcrisRecordCount.mockResolvedValue(
        mockCount
      );

      const queryParams = {
        borough: "1",
        property_type: "RESIDENTIAL",
      };

      const resp = await request(app)
        .get("/realPropertyLegals/fetchRecordCount")
        .query(queryParams);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        realPropLegalsRecordCount: mockCount,
      });

      expect(
        mockedLegalsRealPropApi.fetchAcrisRecordCount
      ).toHaveBeenCalledWith(queryParams);
      expect(
        mockedLegalsRealPropApi.fetchAcrisRecordCount
      ).toHaveBeenCalledTimes(1);
    });

    test("works: returns count with no query parameters", async () => {
      const mockCount = 1000;
      mockedLegalsRealPropApi.fetchAcrisRecordCount.mockResolvedValue(
        mockCount
      );

      const resp = await request(app).get(
        "/realPropertyLegals/fetchRecordCount"
      );

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        realPropLegalsRecordCount: mockCount,
      });

      expect(
        mockedLegalsRealPropApi.fetchAcrisRecordCount
      ).toHaveBeenCalledWith({});
    });

    test("handles API errors in count endpoint", async () => {
      const errorMessage = "Count API service unavailable";
      mockedLegalsRealPropApi.fetchAcrisRecordCount.mockRejectedValue(
        new Error(errorMessage)
      );

      const resp = await request(app)
        .get("/realPropertyLegals/fetchRecordCount")
        .query({ borough: "1" });

      expect(resp.statusCode).toEqual(500);
      expect(resp.body).toEqual({
        error: {
          message: errorMessage,
          status: 500,
        },
      });
    });
  });

  describe("GET /realPropertyLegals/fetchDocIds", () => {
    test("works: returns document IDs", async () => {
      const mockDocIds = [
        { document_id: "2023040500001001" },
        { document_id: "2023040500001002" },
        { document_id: "2023040500001003" },
      ];

      mockedLegalsRealPropApi.fetchAcrisDocumentIds.mockResolvedValue(
        mockDocIds
      );

      const queryParams = {
        recorded_borough: "1",
        doc_type: "DEED",
        $limit: "100",
      };

      const resp = await request(app)
        .get("/realPropertyLegals/fetchDocIds")
        .query(queryParams);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        realPropLegalsRecordsDocumentIds: mockDocIds,
      });

      expect(
        mockedLegalsRealPropApi.fetchAcrisDocumentIds
      ).toHaveBeenCalledWith(queryParams);
    });

    test("works: returns document IDs with no query parameters", async () => {
      const mockDocIds = [
        { document_id: "2023040500001004" },
        { document_id: "2023040500001005" },
      ];

      mockedLegalsRealPropApi.fetchAcrisDocumentIds.mockResolvedValue(
        mockDocIds
      );

      const resp = await request(app).get("/realPropertyLegals/fetchDocIds");

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        realPropLegalsRecordsDocumentIds: mockDocIds,
      });

      expect(
        mockedLegalsRealPropApi.fetchAcrisDocumentIds
      ).toHaveBeenCalledWith({});
    });

    test("handles API errors in document IDs endpoint", async () => {
      const errorMessage = "DocIDs API service unavailable";
      mockedLegalsRealPropApi.fetchAcrisDocumentIds.mockRejectedValue(
        new Error(errorMessage)
      );

      const resp = await request(app)
        .get("/realPropertyLegals/fetchDocIds")
        .query({ recorded_borough: "1", doc_type: "DEED" });

      expect(resp.statusCode).toEqual(500);
      expect(resp.body).toEqual({
        error: {
          message: errorMessage,
          status: 500,
        },
      });
    });

    test("returns empty array when no document IDs found", async () => {
      mockedLegalsRealPropApi.fetchAcrisDocumentIds.mockResolvedValue([]);

      const resp = await request(app)
        .get("/realPropertyLegals/fetchDocIds")
        .query({ recorded_borough: "9", doc_type: "NONEXISTENT" });

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        realPropLegalsRecordsDocumentIds: [],
      });
    });
  });

  describe("GET /realPropertyLegals/fetchDocIdsCrossRefPartyDocIds", () => {
    test("works: returns cross-referenced document IDs", async () => {
      const mockCrossRefDocIds = [
        { document_id: "2023040500001001" },
        { document_id: "2023040500001003" },
        { document_id: "2023040500001005" },
      ];

      // Set up the mock function if it doesn't exist
      if (!mockedLegalsRealPropApi.fetchDocIdsFromAcrisCrossRefParties) {
        mockedLegalsRealPropApi.fetchDocIdsFromAcrisCrossRefParties = jest.fn();
      }

      mockedLegalsRealPropApi.fetchDocIdsFromAcrisCrossRefParties.mockResolvedValue(
        mockCrossRefDocIds
      );

      const partiesDocIdsCrossRefMaster = [
        "2023040500001001",
        "2023040500001003",
        "2023040500001005",
      ];

      const resp = await request(app)
        .get("/realPropertyLegals/fetchDocIdsCrossRefPartyDocIds")
        .query({
          borough: "1",
          partiesDocIdsCrossRefMaster: JSON.stringify(
            partiesDocIdsCrossRefMaster
          ),
        });

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        legalsDocIdsCrossRefParties: mockCrossRefDocIds,
      });

      expect(
        mockedLegalsRealPropApi.fetchDocIdsFromAcrisCrossRefParties
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          borough: "1",
          partiesDocIdsCrossRefMaster: JSON.stringify(
            partiesDocIdsCrossRefMaster
          ),
        }),
        partiesDocIdsCrossRefMaster
      );
    });

    test("works: handles empty partiesDocIdsCrossRefMaster array", async () => {
      const mockCrossRefDocIds = [];

      // Set up the mock function if it doesn't exist
      if (!mockedLegalsRealPropApi.fetchDocIdsFromAcrisCrossRefParties) {
        mockedLegalsRealPropApi.fetchDocIdsFromAcrisCrossRefParties = jest.fn();
      }

      mockedLegalsRealPropApi.fetchDocIdsFromAcrisCrossRefParties.mockResolvedValue(
        mockCrossRefDocIds
      );

      const resp = await request(app)
        .get("/realPropertyLegals/fetchDocIdsCrossRefPartyDocIds")
        .query({ borough: "1" });

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        legalsDocIdsCrossRefParties: mockCrossRefDocIds,
      });

      expect(
        mockedLegalsRealPropApi.fetchDocIdsFromAcrisCrossRefParties
      ).toHaveBeenCalledWith(expect.objectContaining({ borough: "1" }), []);
    });

    test("handles JSON parsing errors gracefully", async () => {
      const resp = await request(app)
        .get("/realPropertyLegals/fetchDocIdsCrossRefPartyDocIds")
        .query({
          borough: "1",
          partiesDocIdsCrossRefMaster: "invalid-json",
        });

      expect(resp.statusCode).toEqual(500);
      expect(resp.body.error.message).toContain("JSON");
    });

    test("handles API errors in cross-reference endpoint", async () => {
      const errorMessage = "Cross-reference API service unavailable";

      // Set up the mock function if it doesn't exist
      if (!mockedLegalsRealPropApi.fetchDocIdsFromAcrisCrossRefParties) {
        mockedLegalsRealPropApi.fetchDocIdsFromAcrisCrossRefParties = jest.fn();
      }

      mockedLegalsRealPropApi.fetchDocIdsFromAcrisCrossRefParties.mockRejectedValue(
        new Error(errorMessage)
      );

      const partiesDocIdsCrossRefMaster = ["123", "456"];

      const resp = await request(app)
        .get("/realPropertyLegals/fetchDocIdsCrossRefPartyDocIds")
        .query({
          borough: "1",
          partiesDocIdsCrossRefMaster: JSON.stringify(
            partiesDocIdsCrossRefMaster
          ),
        });

      expect(resp.statusCode).toEqual(500);
      expect(resp.body).toEqual({
        error: {
          message: errorMessage,
          status: 500,
        },
      });
    });
  });

  describe("GET /realPropertyLegals/fetchAcrisRecordsByDocumentIds", () => {
    test("works: returns records by document IDs (JSON array)", async () => {
      const mockLegalsData = [
        {
          document_id: "2023040500001001",
          record_type: "LEGAL",
          borough: "1",
          block: "123",
          lot: "45",
          property_type: "RESIDENTIAL",
        },
        {
          document_id: "2023040500001002",
          record_type: "LEGAL",
          borough: "1",
          block: "456",
          lot: "78",
          property_type: "COMMERCIAL",
        },
      ];

      mockedLegalsRealPropApi.fetchAcrisRecordsByDocumentIds.mockResolvedValue(
        mockLegalsData
      );

      const documentIds = ["2023040500001001", "2023040500001002"];

      const resp = await request(app)
        .get("/realPropertyLegals/fetchAcrisRecordsByDocumentIds")
        .query({
          documentIds: JSON.stringify(documentIds),
        });

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        realPropLegalsRecords: mockLegalsData,
      });

      expect(
        mockedLegalsRealPropApi.fetchAcrisRecordsByDocumentIds
      ).toHaveBeenCalledWith(documentIds);
    });

    test("works: returns records by document IDs (comma-separated string)", async () => {
      const mockLegalsData = [
        {
          document_id: "2023040500001003",
          record_type: "LEGAL",
          borough: "2",
          block: "789",
          lot: "101",
          property_type: "RESIDENTIAL",
        },
        {
          document_id: "2023040500001004",
          record_type: "LEGAL",
          borough: "3",
          block: "555",
          lot: "222",
          property_type: "MIXED USE",
        },
      ];

      mockedLegalsRealPropApi.fetchAcrisRecordsByDocumentIds.mockResolvedValue(
        mockLegalsData
      );

      const resp = await request(app)
        .get("/realPropertyLegals/fetchAcrisRecordsByDocumentIds")
        .query({
          documentIds: "2023040500001003,2023040500001004",
        });

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        realPropLegalsRecords: mockLegalsData,
      });

      expect(
        mockedLegalsRealPropApi.fetchAcrisRecordsByDocumentIds
      ).toHaveBeenCalledWith(["2023040500001003", "2023040500001004"]);
    });

    test("handles API errors in fetchAcrisRecordsByDocumentIds endpoint", async () => {
      const errorMessage = "Failed to fetch records by document IDs";
      mockedLegalsRealPropApi.fetchAcrisRecordsByDocumentIds.mockRejectedValue(
        new Error(errorMessage)
      );

      const resp = await request(app)
        .get("/realPropertyLegals/fetchAcrisRecordsByDocumentIds")
        .query({
          documentIds: "2023040500001001,2023040500001002",
        });

      expect(resp.statusCode).toEqual(500);
      expect(resp.body).toEqual({
        error: {
          message: errorMessage,
          status: 500,
        },
      });
    });

    test("handles JSON parsing errors in documentIds parameter", async () => {
      mockedLegalsRealPropApi.fetchAcrisRecordsByDocumentIds.mockImplementation(
        () => {
          throw new SyntaxError("JSON parsing failed");
        }
      );

      const resp = await request(app)
        .get("/realPropertyLegals/fetchAcrisRecordsByDocumentIds")
        .query({
          documentIds: "{invalid-json",
        });

      expect(resp.statusCode).toEqual(500);
    });
  });
});
