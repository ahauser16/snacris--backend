"use strict";

/**
 * Test suite for ACRIS Real Property References API Routes
 *
 * NOTE: These routes were used during development with Postman for API exploration and learning purposes
 * and are NOT being used in the deployed application. However, the methods contained in the
 * ReferencesRealPropApi module are used in the deployed application.
 */

const request = require("supertest");
const app = require("../../../../app");
const ReferencesRealPropApi = require("../../../../thirdPartyApi/acris/real-property/ReferencesRealPropApi");

// Mock the ReferencesRealPropApi
jest.mock(
  "../../../../thirdPartyApi/acris/real-property/ReferencesRealPropApi"
);

const mockedReferencesRealPropApi = ReferencesRealPropApi;

describe("Real Property References API Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /realPropertyReferences/fetchRecord", () => {
    test("works: returns real property references records with query parameters", async () => {
      // Mock the API response
      const mockReferencesData = [
        {
          document_id: "2023040500001001",
          record_type: "REFERENCE",
          reference_by_crfn_: "2023000123456",
          reference_by_doc_id: "2022030100001001",
          reference_by_reel_year: "2022",
          reference_by_reel_borough: "1",
          reference_by_reel_nbr: "100",
          reference_by_reel_page: "50",
          good_through_date: "2024-12-31T23:59:59.000",
        },
        {
          document_id: "2023040500001002",
          record_type: "REFERENCE",
          reference_by_crfn_: "2023000123457",
          reference_by_doc_id: "2022030100001002",
          reference_by_reel_year: "2022",
          reference_by_reel_borough: "1",
          reference_by_reel_nbr: "101",
          reference_by_reel_page: "75",
          good_through_date: "2024-12-31T23:59:59.000",
        },
      ];

      mockedReferencesRealPropApi.fetchAcrisRecords.mockResolvedValue(
        mockReferencesData
      );

      const queryParams = {
        reference_by_reel_borough: "1",
        reference_by_reel_year: "2022",
      };

      const resp = await request(app)
        .get("/realPropertyReferences/fetchRecord")
        .query(queryParams);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        realPropReferencesRecords: mockReferencesData,
      });

      // Verify the API was called with the correct query parameters
      expect(
        mockedReferencesRealPropApi.fetchAcrisRecords
      ).toHaveBeenCalledWith(queryParams);
      expect(
        mockedReferencesRealPropApi.fetchAcrisRecords
      ).toHaveBeenCalledTimes(1);
    });

    test("works: returns records with no query parameters", async () => {
      const mockReferencesData = [
        {
          document_id: "2023040500001003",
          record_type: "REFERENCE",
          reference_by_crfn_: "2023000123458",
          reference_by_doc_id: "2022030100001003",
          reference_by_reel_year: "2022",
          reference_by_reel_borough: "2",
          reference_by_reel_nbr: "200",
          reference_by_reel_page: "25",
          good_through_date: "2024-12-31T23:59:59.000",
        },
      ];

      mockedReferencesRealPropApi.fetchAcrisRecords.mockResolvedValue(
        mockReferencesData
      );

      const resp = await request(app).get(
        "/realPropertyReferences/fetchRecord"
      );

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        realPropReferencesRecords: mockReferencesData,
      });

      // Verify the API was called with empty query object
      expect(
        mockedReferencesRealPropApi.fetchAcrisRecords
      ).toHaveBeenCalledWith({});
      expect(
        mockedReferencesRealPropApi.fetchAcrisRecords
      ).toHaveBeenCalledTimes(1);
    });

    test("handles API errors gracefully", async () => {
      const errorMessage = "API service unavailable";
      mockedReferencesRealPropApi.fetchAcrisRecords.mockRejectedValue(
        new Error(errorMessage)
      );

      const resp = await request(app)
        .get("/realPropertyReferences/fetchRecord")
        .query({
          reference_by_reel_borough: "1",
          reference_by_reel_year: "2022",
        });

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
        'No records found for query: {"reference_by_reel_borough":"9","reference_by_reel_year":"9999"}'
      );

      mockedReferencesRealPropApi.fetchAcrisRecords.mockRejectedValue(
        notFoundError
      );

      const resp = await request(app)
        .get("/realPropertyReferences/fetchRecord")
        .query({
          reference_by_reel_borough: "9",
          reference_by_reel_year: "9999",
        });

      expect(resp.statusCode).toEqual(404);
      expect(resp.body).toEqual({
        error: {
          message:
            'No records found for query: {"reference_by_reel_borough":"9","reference_by_reel_year":"9999"}',
          status: 404,
        },
      });
    });
  });

  describe("GET /realPropertyReferences/fetchRecordCount", () => {
    test("works: returns count of matching records", async () => {
      const mockCount = 42;
      mockedReferencesRealPropApi.fetchAcrisRecordCount.mockResolvedValue(
        mockCount
      );

      const queryParams = {
        reference_by_reel_borough: "1",
        reference_by_reel_year: "2022",
      };

      const resp = await request(app)
        .get("/realPropertyReferences/fetchRecordCount")
        .query(queryParams);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        realPropReferencesRecordCount: mockCount,
      });

      expect(
        mockedReferencesRealPropApi.fetchAcrisRecordCount
      ).toHaveBeenCalledWith(queryParams);
      expect(
        mockedReferencesRealPropApi.fetchAcrisRecordCount
      ).toHaveBeenCalledTimes(1);
    });

    test("works: returns count with no query parameters", async () => {
      const mockCount = 1000;
      mockedReferencesRealPropApi.fetchAcrisRecordCount.mockResolvedValue(
        mockCount
      );

      const resp = await request(app).get(
        "/realPropertyReferences/fetchRecordCount"
      );

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        realPropReferencesRecordCount: mockCount,
      });

      expect(
        mockedReferencesRealPropApi.fetchAcrisRecordCount
      ).toHaveBeenCalledWith({});
    });

    test("handles API errors in count endpoint", async () => {
      const errorMessage = "Count API service unavailable";
      mockedReferencesRealPropApi.fetchAcrisRecordCount.mockRejectedValue(
        new Error(errorMessage)
      );

      const resp = await request(app)
        .get("/realPropertyReferences/fetchRecordCount")
        .query({ reference_by_reel_borough: "1" });

      expect(resp.statusCode).toEqual(500);
      expect(resp.body).toEqual({
        error: {
          message: errorMessage,
          status: 500,
        },
      });
    });
  });

  describe("GET /realPropertyReferences/fetchDocIds", () => {
    test("works: returns document IDs", async () => {
      const mockDocIds = [
        "2023040500001001",
        "2023040500001002",
        "2023040500001003",
      ];

      mockedReferencesRealPropApi.fetchAcrisDocumentIds.mockResolvedValue(
        mockDocIds
      );

      const queryParams = {
        reference_by_reel_borough: "1",
        reference_by_reel_year: "2022",
        $limit: "100",
      };

      const resp = await request(app)
        .get("/realPropertyReferences/fetchDocIds")
        .query(queryParams);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        realPropReferencesRecordsDocumentIds: mockDocIds,
      });

      expect(
        mockedReferencesRealPropApi.fetchAcrisDocumentIds
      ).toHaveBeenCalledWith(queryParams);
    });

    test("works: returns document IDs with no query parameters", async () => {
      const mockDocIds = ["2023040500001004", "2023040500001005"];

      mockedReferencesRealPropApi.fetchAcrisDocumentIds.mockResolvedValue(
        mockDocIds
      );

      const resp = await request(app).get(
        "/realPropertyReferences/fetchDocIds"
      );

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        realPropReferencesRecordsDocumentIds: mockDocIds,
      });

      expect(
        mockedReferencesRealPropApi.fetchAcrisDocumentIds
      ).toHaveBeenCalledWith({});
    });

    test("handles API errors in document IDs endpoint", async () => {
      const errorMessage = "DocIDs API service unavailable";
      mockedReferencesRealPropApi.fetchAcrisDocumentIds.mockRejectedValue(
        new Error(errorMessage)
      );

      const resp = await request(app)
        .get("/realPropertyReferences/fetchDocIds")
        .query({
          reference_by_reel_borough: "1",
          reference_by_reel_year: "2022",
        });

      expect(resp.statusCode).toEqual(500);
      expect(resp.body).toEqual({
        error: {
          message: errorMessage,
          status: 500,
        },
      });
    });

    test("returns empty array when no document IDs found", async () => {
      const { NotFoundError } = require("../../../../expressError");
      mockedReferencesRealPropApi.fetchAcrisDocumentIds.mockRejectedValue(
        new NotFoundError("No document IDs found")
      );

      const resp = await request(app)
        .get("/realPropertyReferences/fetchDocIds")
        .query({
          reference_by_reel_borough: "9",
          reference_by_reel_year: "9999",
        });

      expect(resp.statusCode).toEqual(404);
      expect(resp.body).toHaveProperty("error");
    });
  });

  describe("GET /realPropertyReferences/fetchAcrisRecordsByDocumentIds", () => {
    test("works: returns records by document IDs (JSON array)", async () => {
      const mockReferencesData = [
        {
          document_id: "2023040500001001",
          record_type: "REFERENCE",
          reference_by_crfn_: "2023000123456",
          reference_by_doc_id: "2022030100001001",
          reference_by_reel_year: "2022",
          reference_by_reel_borough: "1",
        },
        {
          document_id: "2023040500001002",
          record_type: "REFERENCE",
          reference_by_crfn_: "2023000123457",
          reference_by_doc_id: "2022030100001002",
          reference_by_reel_year: "2022",
          reference_by_reel_borough: "1",
        },
      ];

      mockedReferencesRealPropApi.fetchAcrisRecordsByDocumentIds.mockResolvedValue(
        mockReferencesData
      );

      const documentIds = ["2023040500001001", "2023040500001002"];

      const resp = await request(app)
        .get("/realPropertyReferences/fetchAcrisRecordsByDocumentIds")
        .query({
          documentIds: JSON.stringify(documentIds),
        });

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        realPropReferencesRecords: mockReferencesData,
      });

      expect(
        mockedReferencesRealPropApi.fetchAcrisRecordsByDocumentIds
      ).toHaveBeenCalledWith(documentIds);
    });

    test("works: returns records by document IDs (comma-separated string)", async () => {
      const mockReferencesData = [
        {
          document_id: "2023040500001003",
          record_type: "REFERENCE",
          reference_by_crfn_: "2023000123458",
          reference_by_doc_id: "2022030100001003",
          reference_by_reel_year: "2022",
          reference_by_reel_borough: "2",
        },
        {
          document_id: "2023040500001004",
          record_type: "REFERENCE",
          reference_by_crfn_: "2023000123459",
          reference_by_doc_id: "2022030100001004",
          reference_by_reel_year: "2022",
          reference_by_reel_borough: "3",
        },
      ];

      mockedReferencesRealPropApi.fetchAcrisRecordsByDocumentIds.mockResolvedValue(
        mockReferencesData
      );

      const resp = await request(app)
        .get("/realPropertyReferences/fetchAcrisRecordsByDocumentIds")
        .query({
          documentIds: "2023040500001003,2023040500001004",
        });

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        realPropReferencesRecords: mockReferencesData,
      });

      expect(
        mockedReferencesRealPropApi.fetchAcrisRecordsByDocumentIds
      ).toHaveBeenCalledWith(["2023040500001003", "2023040500001004"]);
    });

    test("handles API errors in fetchAcrisRecordsByDocumentIds endpoint", async () => {
      const errorMessage = "Failed to fetch records by document IDs";
      mockedReferencesRealPropApi.fetchAcrisRecordsByDocumentIds.mockRejectedValue(
        new Error(errorMessage)
      );

      const resp = await request(app)
        .get("/realPropertyReferences/fetchAcrisRecordsByDocumentIds")
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
      const resp = await request(app)
        .get("/realPropertyReferences/fetchAcrisRecordsByDocumentIds")
        .query({
          documentIds: "{invalid-json",
        });

      expect(resp.statusCode).toEqual(500);
      expect(resp.body.error).toHaveProperty("message");
      expect(resp.body.error.status).toEqual(500);
    });
  });
});
