"use strict";

/**
 * Test suite for ACRIS Personal Property Master API Routes
 *
 * NOTE: These routes were used for both Postman-based development and are deployed
 * in the production application for logged-in users.
 */

const request = require("supertest");
const app = require("../../../../app");
const MasterPersPropApi = require("../../../../thirdPartyApi/acris/personal-property/MasterPersPropApi");

// Mock the MasterPersPropApi
jest.mock(
  "../../../../thirdPartyApi/acris/personal-property/MasterPersPropApi"
);

const mockedMasterPersPropApi = MasterPersPropApi;

describe("Personal Property Master API Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /persPropertyMaster/fetchRecord", () => {
    test("works: returns personal property master records with query parameters", async () => {
      // Mock the API response
      const mockMasterData = [
        {
          document_id: "2023040500001001",
          record_type: "MASTER",
          crfn: "2023000012345",
          recorded_borough: "1",
          doc_type: "DEED",
          document_amt: "500000",
          recorded_datetime: "2023-04-05T10:30:00.000",
          ucc_collateral: "",
          fedtax_serial_nbr: "",
          fedtax_assessment_date: "",
          rpttl_nbr: "",
          modified_date: "2023-04-05T10:35:00.000",
          reel_yr: "2023",
          reel_nbr: "1234",
          reel_pg: "567",
          file_nbr: "890123",
          good_through_date: "2024-12-31T23:59:59.000",
        },
        {
          document_id: "2023040500001002",
          record_type: "MASTER",
          crfn: "2023000012346",
          recorded_borough: "2",
          doc_type: "MTGE",
          document_amt: "750000",
          recorded_datetime: "2023-04-05T11:00:00.000",
          ucc_collateral: "EQUIPMENT",
          fedtax_serial_nbr: "FED123456",
          fedtax_assessment_date: "2023-04-01T00:00:00.000",
          rpttl_nbr: "RPT789",
          modified_date: "2023-04-05T11:05:00.000",
          reel_yr: "2023",
          reel_nbr: "1235",
          reel_pg: "100",
          file_nbr: "890124",
          good_through_date: "2024-12-31T23:59:59.000",
        },
      ];

      mockedMasterPersPropApi.fetchFromAcris.mockResolvedValue(mockMasterData);

      const queryParams = {
        recorded_borough: "1",
        doc_type: "DEED",
        document_amt: "500000",
      };

      const resp = await request(app)
        .get("/persPropertyMaster/fetchRecord")
        .query(queryParams);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        masterRecords: mockMasterData,
      });

      // Verify the API was called with the correct query parameters
      expect(mockedMasterPersPropApi.fetchFromAcris).toHaveBeenCalledWith(
        queryParams
      );
      expect(mockedMasterPersPropApi.fetchFromAcris).toHaveBeenCalledTimes(1);
    });

    test("works: returns records with no query parameters", async () => {
      const mockMasterData = [
        {
          document_id: "2023040500001003",
          record_type: "MASTER",
          crfn: "2023000012347",
          recorded_borough: "3",
          doc_type: "ASMT",
          document_amt: "0",
          recorded_datetime: "2023-04-05T12:00:00.000",
          ucc_collateral: "",
          fedtax_serial_nbr: "",
          fedtax_assessment_date: "",
          rpttl_nbr: "",
          modified_date: "2023-04-05T12:05:00.000",
          reel_yr: "2023",
          reel_nbr: "1236",
          reel_pg: "200",
          file_nbr: "890125",
          good_through_date: "2024-12-31T23:59:59.000",
        },
      ];

      mockedMasterPersPropApi.fetchFromAcris.mockResolvedValue(mockMasterData);

      const resp = await request(app).get("/persPropertyMaster/fetchRecord");

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        masterRecords: mockMasterData,
      });

      // Verify the API was called with empty query object
      expect(mockedMasterPersPropApi.fetchFromAcris).toHaveBeenCalledWith({});
      expect(mockedMasterPersPropApi.fetchFromAcris).toHaveBeenCalledTimes(1);
    });

    test("works: handles multiple query parameters", async () => {
      const mockMasterData = [
        {
          document_id: "2023040500001004",
          record_type: "MASTER",
          crfn: "2023000012348",
          recorded_borough: "4",
          doc_type: "UCC",
          document_amt: "1000000",
          recorded_datetime: "2023-04-05T13:00:00.000",
          ucc_collateral: "INVENTORY",
          fedtax_serial_nbr: "FED654321",
          fedtax_assessment_date: "2023-04-02T00:00:00.000",
          rpttl_nbr: "RPT456",
          modified_date: "2023-04-05T13:05:00.000",
          reel_yr: "2023",
          reel_nbr: "1237",
          reel_pg: "300",
          file_nbr: "890126",
          good_through_date: "2024-12-31T23:59:59.000",
        },
      ];

      mockedMasterPersPropApi.fetchFromAcris.mockResolvedValue(mockMasterData);

      const queryParams = {
        recorded_borough: "4",
        doc_type: "UCC",
        ucc_collateral: "INVENTORY",
        $limit: "100",
        $offset: "0",
      };

      const resp = await request(app)
        .get("/persPropertyMaster/fetchRecord")
        .query(queryParams);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        masterRecords: mockMasterData,
      });

      expect(mockedMasterPersPropApi.fetchFromAcris).toHaveBeenCalledWith(
        queryParams
      );
    });

    test("handles API errors gracefully", async () => {
      const errorMessage = "API service unavailable";
      mockedMasterPersPropApi.fetchFromAcris.mockRejectedValue(
        new Error(errorMessage)
      );

      const resp = await request(app)
        .get("/persPropertyMaster/fetchRecord")
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
        'No records found for query: {"recorded_borough":"9","doc_type":"INVALID"}'
      );

      mockedMasterPersPropApi.fetchFromAcris.mockRejectedValue(notFoundError);

      const resp = await request(app)
        .get("/persPropertyMaster/fetchRecord")
        .query({ recorded_borough: "9", doc_type: "INVALID" });

      expect(resp.statusCode).toEqual(404);
      expect(resp.body).toEqual({
        error: {
          message:
            'No records found for query: {"recorded_borough":"9","doc_type":"INVALID"}',
          status: 404,
        },
      });
    });

    test("returns empty array when API returns empty results", async () => {
      mockedMasterPersPropApi.fetchFromAcris.mockResolvedValue([]);

      const resp = await request(app)
        .get("/persPropertyMaster/fetchRecord")
        .query({ recorded_borough: "9", doc_type: "NONEXISTENT" });

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        masterRecords: [],
      });
    });

    test("production behavior: route does not require authentication for development/testing", async () => {
      const mockMasterData = [
        {
          document_id: "2023040500001005",
          record_type: "MASTER",
          crfn: "2023000012349",
          recorded_borough: "5",
          doc_type: "CORRECTIVE",
          document_amt: "0",
          recorded_datetime: "2023-04-05T14:00:00.000",
          ucc_collateral: "",
          fedtax_serial_nbr: "",
          fedtax_assessment_date: "",
          rpttl_nbr: "",
          modified_date: "2023-04-05T14:05:00.000",
          reel_yr: "2023",
          reel_nbr: "1238",
          reel_pg: "400",
          file_nbr: "890127",
          good_through_date: "2024-12-31T23:59:59.000",
        },
      ];

      mockedMasterPersPropApi.fetchFromAcris.mockResolvedValue(mockMasterData);

      // Test without any authorization headers
      const resp = await request(app)
        .get("/persPropertyMaster/fetchRecord")
        .query({ recorded_borough: "5", doc_type: "CORRECTIVE" });

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        masterRecords: mockMasterData,
      });
    });
  });

  describe("GET /persPropertyMaster/fetchRecordCount", () => {
    test("works: returns count of matching records", async () => {
      const mockCount = 156;
      mockedMasterPersPropApi.fetchCountFromAcris.mockResolvedValue(mockCount);

      const queryParams = {
        recorded_borough: "1",
        doc_type: "DEED",
      };

      const resp = await request(app)
        .get("/persPropertyMaster/fetchRecordCount")
        .query(queryParams);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        masterRecordCount: mockCount,
      });

      expect(mockedMasterPersPropApi.fetchCountFromAcris).toHaveBeenCalledWith(
        queryParams
      );
      expect(mockedMasterPersPropApi.fetchCountFromAcris).toHaveBeenCalledTimes(
        1
      );
    });

    test("works: returns count with no query parameters", async () => {
      const mockCount = 50000;
      mockedMasterPersPropApi.fetchCountFromAcris.mockResolvedValue(mockCount);

      const resp = await request(app).get(
        "/persPropertyMaster/fetchRecordCount"
      );

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        masterRecordCount: mockCount,
      });

      expect(mockedMasterPersPropApi.fetchCountFromAcris).toHaveBeenCalledWith(
        {}
      );
    });

    test("handles API errors in count endpoint", async () => {
      const errorMessage = "Count API service unavailable";
      mockedMasterPersPropApi.fetchCountFromAcris.mockRejectedValue(
        new Error(errorMessage)
      );

      const resp = await request(app)
        .get("/persPropertyMaster/fetchRecordCount")
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

  describe("GET /persPropertyMaster/fetchDocIds", () => {
    test("works: returns document IDs", async () => {
      const mockDocIds = [
        "2023040500001001",
        "2023040500001002",
        "2023040500001003",
        "2023040500001004",
        "2023040500001005",
      ];

      mockedMasterPersPropApi.fetchDocIdsFromAcris.mockResolvedValue(
        mockDocIds
      );

      const queryParams = {
        recorded_borough: "1",
        doc_type: "DEED",
        $limit: "100",
      };

      const resp = await request(app)
        .get("/persPropertyMaster/fetchDocIds")
        .query(queryParams);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        masterRecordsDocumentIds: mockDocIds,
      });

      expect(mockedMasterPersPropApi.fetchDocIdsFromAcris).toHaveBeenCalledWith(
        queryParams
      );
      expect(
        mockedMasterPersPropApi.fetchDocIdsFromAcris
      ).toHaveBeenCalledTimes(1);
    });

    test("works: returns document IDs with no query parameters", async () => {
      const mockDocIds = ["2023040500001001", "2023040500001002"];

      mockedMasterPersPropApi.fetchDocIdsFromAcris.mockResolvedValue(
        mockDocIds
      );

      const resp = await request(app).get("/persPropertyMaster/fetchDocIds");

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        masterRecordsDocumentIds: mockDocIds,
      });

      expect(mockedMasterPersPropApi.fetchDocIdsFromAcris).toHaveBeenCalledWith(
        {}
      );
    });

    test("handles UCC-specific document ID queries", async () => {
      const mockDocIds = ["2023040500002001", "2023040500002002"];

      mockedMasterPersPropApi.fetchDocIdsFromAcris.mockResolvedValue(
        mockDocIds
      );

      const queryParams = {
        doc_type: "UCC",
        ucc_collateral: "EQUIPMENT",
        recorded_borough: "1",
      };

      const resp = await request(app)
        .get("/persPropertyMaster/fetchDocIds")
        .query(queryParams);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body.masterRecordsDocumentIds).toHaveLength(2);
      expect(resp.body.masterRecordsDocumentIds).toEqual(mockDocIds);
    });

    test("handles API errors in document IDs endpoint", async () => {
      const errorMessage = "Document IDs API service unavailable";
      mockedMasterPersPropApi.fetchDocIdsFromAcris.mockRejectedValue(
        new Error(errorMessage)
      );

      const resp = await request(app)
        .get("/persPropertyMaster/fetchDocIds")
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
      mockedMasterPersPropApi.fetchDocIdsFromAcris.mockResolvedValue([]);

      const resp = await request(app)
        .get("/persPropertyMaster/fetchDocIds")
        .query({ recorded_borough: "9", doc_type: "NONEXISTENT" });

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        masterRecordsDocumentIds: [],
      });
    });
  });
});
