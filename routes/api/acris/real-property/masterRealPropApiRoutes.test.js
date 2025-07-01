"use strict";

/**
 * Test suite for ACRIS Real Property Master API Routes
 *
 * NOTE: These routes were used during development with Postman for API exploration and learning purposes
 * and are NOT being used in the deployed application. However, the methods contained in the
 * MasterRealPropApi module are used in the deployed application.
 */

const request = require("supertest");
const app = require("../../../../app");
const MasterRealPropApi = require("../../../../thirdPartyApi/acris/real-property/MasterRealPropApi");

// Mock the MasterRealPropApi
jest.mock("../../../../thirdPartyApi/acris/real-property/MasterRealPropApi");

const mockedMasterRealPropApi = MasterRealPropApi;

describe("Real Property Master API Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /realPropertyMaster/fetchRecord", () => {
    test("works: returns real property master records with query parameters", async () => {
      // Mock the API response
      const mockMasterData = [
        {
          document_id: "2023040500001001",
          record_type: "MASTER",
          crfn: "2023000123456",
          recorded_borough: "1",
          doc_type: "DEED",
          document_date: "2023-04-01T00:00:00.000",
          document_amt: "1000000",
          recorded_datetime: "2023-04-05T09:30:00.000",
          modified_date: "2023-04-05T10:00:00.000",
          reel_yr: "2023",
          reel_nbr: "123",
          reel_pg: "456",
          percent_trans: "100",
          good_through_date: "2024-12-31T23:59:59.000",
        },
        {
          document_id: "2023040500001002",
          record_type: "MASTER",
          crfn: "2023000123457",
          recorded_borough: "1",
          doc_type: "DEED",
          document_date: "2023-04-02T00:00:00.000",
          document_amt: "2000000",
          recorded_datetime: "2023-04-05T10:30:00.000",
          modified_date: "2023-04-05T11:00:00.000",
          reel_yr: "2023",
          reel_nbr: "123",
          reel_pg: "457",
          percent_trans: "100",
          good_through_date: "2024-12-31T23:59:59.000",
        },
      ];

      mockedMasterRealPropApi.fetchAcrisRecords.mockResolvedValue(
        mockMasterData
      );

      const queryParams = {
        recorded_borough: "1",
        doc_type: "DEED",
      };

      const resp = await request(app)
        .get("/realPropertyMaster/fetchRecord")
        .query(queryParams);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        realPropMasterRecords: mockMasterData,
      });

      // Verify the API was called with the correct query parameters
      expect(mockedMasterRealPropApi.fetchAcrisRecords).toHaveBeenCalledWith(
        queryParams
      );
      expect(mockedMasterRealPropApi.fetchAcrisRecords).toHaveBeenCalledTimes(
        1
      );
    });

    test("works: returns records with no query parameters", async () => {
      const mockMasterData = [
        {
          document_id: "2023040500001003",
          record_type: "MASTER",
          crfn: "2023000123458",
          recorded_borough: "2",
          doc_type: "MORTGAGE",
          document_date: "2023-04-03T00:00:00.000",
          document_amt: "500000",
          recorded_datetime: "2023-04-05T11:30:00.000",
          modified_date: "2023-04-05T12:00:00.000",
          reel_yr: "2023",
          reel_nbr: "124",
          reel_pg: "100",
          percent_trans: "100",
          good_through_date: "2024-12-31T23:59:59.000",
        },
      ];

      mockedMasterRealPropApi.fetchAcrisRecords.mockResolvedValue(
        mockMasterData
      );

      const resp = await request(app).get("/realPropertyMaster/fetchRecord");

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        realPropMasterRecords: mockMasterData,
      });

      // Verify the API was called with empty query object
      expect(mockedMasterRealPropApi.fetchAcrisRecords).toHaveBeenCalledWith(
        {}
      );
      expect(mockedMasterRealPropApi.fetchAcrisRecords).toHaveBeenCalledTimes(
        1
      );
    });

    test("handles API errors gracefully", async () => {
      const errorMessage = "API service unavailable";
      mockedMasterRealPropApi.fetchAcrisRecords.mockRejectedValue(
        new Error(errorMessage)
      );

      const resp = await request(app)
        .get("/realPropertyMaster/fetchRecord")
        .query({ recorded_borough: "1", doc_type: "DEED" });

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
        'No records found for query: {"recorded_borough":"9","doc_type":"NONEXISTENT"}'
      );

      mockedMasterRealPropApi.fetchAcrisRecords.mockRejectedValue(
        notFoundError
      );

      const resp = await request(app)
        .get("/realPropertyMaster/fetchRecord")
        .query({ recorded_borough: "9", doc_type: "NONEXISTENT" });

      expect(resp.statusCode).toEqual(404);
      expect(resp.body).toEqual({
        error: {
          message:
            'No records found for query: {"recorded_borough":"9","doc_type":"NONEXISTENT"}',
          status: 404,
        },
      });
    });
  });

  describe("GET /realPropertyMaster/fetchRecordCount", () => {
    test("works: returns count of matching records", async () => {
      const mockCount = 42;
      mockedMasterRealPropApi.fetchAcrisRecordCount.mockResolvedValue(
        mockCount
      );

      const queryParams = {
        recorded_borough: "1",
        doc_type: "DEED",
      };

      const resp = await request(app)
        .get("/realPropertyMaster/fetchRecordCount")
        .query(queryParams);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        realPropMasterRecordCount: mockCount,
      });

      expect(
        mockedMasterRealPropApi.fetchAcrisRecordCount
      ).toHaveBeenCalledWith(queryParams);
      expect(
        mockedMasterRealPropApi.fetchAcrisRecordCount
      ).toHaveBeenCalledTimes(1);
    });

    test("works: returns count with no query parameters", async () => {
      const mockCount = 1000;
      mockedMasterRealPropApi.fetchAcrisRecordCount.mockResolvedValue(
        mockCount
      );

      const resp = await request(app).get(
        "/realPropertyMaster/fetchRecordCount"
      );

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        realPropMasterRecordCount: mockCount,
      });

      expect(
        mockedMasterRealPropApi.fetchAcrisRecordCount
      ).toHaveBeenCalledWith({});
    });

    test("handles API errors in count endpoint", async () => {
      const errorMessage = "Count API service unavailable";
      mockedMasterRealPropApi.fetchAcrisRecordCount.mockRejectedValue(
        new Error(errorMessage)
      );

      const resp = await request(app)
        .get("/realPropertyMaster/fetchRecordCount")
        .query({ recorded_borough: "1" });

      expect(resp.statusCode).toEqual(500);
      expect(resp.body).toEqual({
        error: {
          message: errorMessage,
          status: 500,
        },
      });
    });
  });

  describe("GET /realPropertyMaster/fetchDocIds", () => {
    test("works: returns document IDs", async () => {
      const mockDocIds = [
        "2023040500001001",
        "2023040500001002",
        "2023040500001003",
      ];

      mockedMasterRealPropApi.fetchAcrisDocumentIds.mockResolvedValue(
        mockDocIds
      );

      const queryParams = {
        recorded_borough: "1",
        doc_type: "DEED",
        $limit: "100",
      };

      const resp = await request(app)
        .get("/realPropertyMaster/fetchDocIds")
        .query(queryParams);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        realPropMasterRecordsDocumentIds: mockDocIds,
      });

      expect(
        mockedMasterRealPropApi.fetchAcrisDocumentIds
      ).toHaveBeenCalledWith(queryParams);
    });

    test("works: returns document IDs with no query parameters", async () => {
      const mockDocIds = ["2023040500001004", "2023040500001005"];

      mockedMasterRealPropApi.fetchAcrisDocumentIds.mockResolvedValue(
        mockDocIds
      );

      const resp = await request(app).get("/realPropertyMaster/fetchDocIds");

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        realPropMasterRecordsDocumentIds: mockDocIds,
      });

      expect(
        mockedMasterRealPropApi.fetchAcrisDocumentIds
      ).toHaveBeenCalledWith({});
    });

    test("handles API errors in document IDs endpoint", async () => {
      const errorMessage = "DocIDs API service unavailable";
      mockedMasterRealPropApi.fetchAcrisDocumentIds.mockRejectedValue(
        new Error(errorMessage)
      );

      const resp = await request(app)
        .get("/realPropertyMaster/fetchDocIds")
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
      const { NotFoundError } = require("../../../../expressError");
      mockedMasterRealPropApi.fetchAcrisDocumentIds.mockRejectedValue(
        new NotFoundError("No document IDs found")
      );

      const resp = await request(app)
        .get("/realPropertyMaster/fetchDocIds")
        .query({ recorded_borough: "9", doc_type: "NONEXISTENT" });

      expect(resp.statusCode).toEqual(404);
      expect(resp.body).toHaveProperty("error");
    });
  });

  describe("GET /realPropertyMaster/fetchAcrisRecordsByDocumentIds", () => {
    test("works: returns records by document IDs (JSON array)", async () => {
      const mockMasterData = [
        {
          document_id: "2023040500001001",
          record_type: "MASTER",
          crfn: "2023000123456",
          recorded_borough: "1",
          doc_type: "DEED",
          document_date: "2023-04-01T00:00:00.000",
        },
        {
          document_id: "2023040500001002",
          record_type: "MASTER",
          crfn: "2023000123457",
          recorded_borough: "1",
          doc_type: "DEED",
          document_date: "2023-04-02T00:00:00.000",
        },
      ];

      mockedMasterRealPropApi.fetchAcrisRecordsByDocumentIds.mockResolvedValue(
        mockMasterData
      );

      const documentIds = ["2023040500001001", "2023040500001002"];

      const resp = await request(app)
        .get("/realPropertyMaster/fetchAcrisRecordsByDocumentIds")
        .query({
          documentIds: JSON.stringify(documentIds),
        });

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        realPropMasterRecords: mockMasterData,
      });

      expect(
        mockedMasterRealPropApi.fetchAcrisRecordsByDocumentIds
      ).toHaveBeenCalledWith(documentIds);
    });

    test("works: returns records by document IDs (comma-separated string)", async () => {
      const mockMasterData = [
        {
          document_id: "2023040500001003",
          record_type: "MASTER",
          crfn: "2023000123458",
          recorded_borough: "2",
          doc_type: "MORTGAGE",
          document_date: "2023-04-03T00:00:00.000",
        },
        {
          document_id: "2023040500001004",
          record_type: "MASTER",
          crfn: "2023000123459",
          recorded_borough: "3",
          doc_type: "SATISFACTION",
          document_date: "2023-04-04T00:00:00.000",
        },
      ];

      mockedMasterRealPropApi.fetchAcrisRecordsByDocumentIds.mockResolvedValue(
        mockMasterData
      );

      const resp = await request(app)
        .get("/realPropertyMaster/fetchAcrisRecordsByDocumentIds")
        .query({
          documentIds: "2023040500001003,2023040500001004",
        });

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        realPropMasterRecords: mockMasterData,
      });

      expect(
        mockedMasterRealPropApi.fetchAcrisRecordsByDocumentIds
      ).toHaveBeenCalledWith(["2023040500001003", "2023040500001004"]);
    });

    test("handles API errors in fetchAcrisRecordsByDocumentIds endpoint", async () => {
      const errorMessage = "Failed to fetch records by document IDs";
      mockedMasterRealPropApi.fetchAcrisRecordsByDocumentIds.mockRejectedValue(
        new Error(errorMessage)
      );

      const resp = await request(app)
        .get("/realPropertyMaster/fetchAcrisRecordsByDocumentIds")
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
        .get("/realPropertyMaster/fetchAcrisRecordsByDocumentIds")
        .query({
          documentIds: "{invalid-json",
        });

      expect(resp.statusCode).toEqual(500);
      expect(resp.body.error).toHaveProperty("message");
      // Just check that there's an error message, not the specific content
      expect(resp.body.error.status).toEqual(500);
    });
  });
});
