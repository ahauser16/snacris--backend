"use strict";

/**
 * Test suite for ACRIS Real Property Remarks API Routes
 *
 * NOTE: These routes were used during development with Postman for API exploration and learning purposes
 * and are NOT being used in the deployed application. However, the methods contained in the
 * RemarksRealPropApi module are used in the deployed application.
 */

const request = require("supertest");
const app = require("../../../../app");
const RemarksRealPropApi = require("../../../../thirdPartyApi/acris/real-property/RemarksRealPropApi");

// Mock the RemarksRealPropApi
jest.mock("../../../../thirdPartyApi/acris/real-property/RemarksRealPropApi");

const mockedRemarksRealPropApi = RemarksRealPropApi;

describe("Real Property Remarks API Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /realPropertyRemarks/fetchRecord", () => {
    test("works: returns real property remarks records with query parameters", async () => {
      // Mock the API response
      const mockRemarksData = [
        {
          document_id: "2023040500001001",
          record_type: "REMARK",
          sequence_number: "1",
          remark_text: "SAMPLE REMARK TEXT 1",
          good_through_date: "2024-12-31T23:59:59.000",
        },
        {
          document_id: "2023040500001001",
          record_type: "REMARK",
          sequence_number: "2",
          remark_text: "SAMPLE REMARK TEXT 2",
          good_through_date: "2024-12-31T23:59:59.000",
        },
      ];

      // Setup the mock
      mockedRemarksRealPropApi.fetchAcrisRecords.mockResolvedValue(
        mockRemarksData
      );

      // Make the request
      const response = await request(app)
        .get("/realPropertyRemarks/fetchRecord")
        .query({
          document_id: "2023040500001001",
        });

      // Assertions
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        realPropRemarksRecords: mockRemarksData,
      });
      expect(mockedRemarksRealPropApi.fetchAcrisRecords).toHaveBeenCalledTimes(
        1
      );
      expect(mockedRemarksRealPropApi.fetchAcrisRecords).toHaveBeenCalledWith({
        document_id: "2023040500001001",
      });
    });

    test("handles error when API call fails", async () => {
      // Setup the mock to throw an error
      mockedRemarksRealPropApi.fetchAcrisRecords.mockRejectedValue(
        new Error("Failed to fetch records from Real Property Remarks API")
      );

      // Make the request
      const response = await request(app)
        .get("/realPropertyRemarks/fetchRecord")
        .query({
          document_id: "invalid_id",
        });

      // Assertions
      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({
        error: {
          message: "Failed to fetch records from Real Property Remarks API",
          status: 500,
        },
      });
      expect(mockedRemarksRealPropApi.fetchAcrisRecords).toHaveBeenCalledTimes(
        1
      );
    });
  });

  describe("GET /realPropertyRemarks/fetchRecordCount", () => {
    test("works: returns record count", async () => {
      // Mock the API response
      const mockCountData = 42;

      // Setup the mock
      mockedRemarksRealPropApi.fetchAcrisRecordCount.mockResolvedValue(
        mockCountData
      );

      // Make the request
      const response = await request(app)
        .get("/realPropertyRemarks/fetchRecordCount")
        .query({
          document_id: "2023040500001001",
        });

      // Assertions
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        realPropRemarksRecordCount: mockCountData,
      });
      expect(
        mockedRemarksRealPropApi.fetchAcrisRecordCount
      ).toHaveBeenCalledTimes(1);
      expect(
        mockedRemarksRealPropApi.fetchAcrisRecordCount
      ).toHaveBeenCalledWith({
        document_id: "2023040500001001",
      });
    });

    test("handles error when API call fails", async () => {
      // Setup the mock to throw an error
      mockedRemarksRealPropApi.fetchAcrisRecordCount.mockRejectedValue(
        new Error("Failed to fetch record count from Real Property Remarks API")
      );

      // Make the request
      const response = await request(app)
        .get("/realPropertyRemarks/fetchRecordCount")
        .query({
          document_id: "invalid_id",
        });

      // Assertions
      expect(response.statusCode).toBe(500);
      expect(response.body.error.message).toContain(
        "Failed to fetch record count from Real Property Remarks API"
      );
    });
  });

  describe("GET /realPropertyRemarks/fetchDocIds", () => {
    test("works: returns document IDs", async () => {
      // Mock the API response
      const mockDocIdsData = [
        { document_id: "2023040500001001" },
        { document_id: "2023040500001002" },
      ];

      // Setup the mock
      mockedRemarksRealPropApi.fetchAcrisDocumentIds.mockResolvedValue(
        mockDocIdsData
      );

      // Make the request
      const response = await request(app)
        .get("/realPropertyRemarks/fetchDocIds")
        .query({
          document_id: "2023040500001001",
        });

      // Assertions
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        realPropRemarksRecordsDocumentIds: mockDocIdsData,
      });
      expect(
        mockedRemarksRealPropApi.fetchAcrisDocumentIds
      ).toHaveBeenCalledTimes(1);
      expect(
        mockedRemarksRealPropApi.fetchAcrisDocumentIds
      ).toHaveBeenCalledWith({
        document_id: "2023040500001001",
      });
    });

    test("handles error when API call fails", async () => {
      // Setup the mock to throw an error
      mockedRemarksRealPropApi.fetchAcrisDocumentIds.mockRejectedValue(
        new Error("Failed to fetch document IDs from Real Property Remarks API")
      );

      // Make the request
      const response = await request(app)
        .get("/realPropertyRemarks/fetchDocIds")
        .query({
          document_id: "invalid_id",
        });

      // Assertions
      expect(response.statusCode).toBe(500);
      expect(response.body.error.message).toContain(
        "Failed to fetch document IDs from Real Property Remarks API"
      );
    });
  });

  describe("GET /realPropertyRemarks/fetchAcrisRecordsByDocumentIds", () => {
    test("works: returns records for document IDs as JSON array", async () => {
      // Mock the API response
      const mockRecordsData = [
        {
          document_id: "2023040500001001",
          record_type: "REMARK",
          sequence_number: "1",
          remark_text: "SAMPLE REMARK TEXT 1",
          good_through_date: "2024-12-31T23:59:59.000",
        },
        {
          document_id: "2023040500001002",
          record_type: "REMARK",
          sequence_number: "1",
          remark_text: "SAMPLE REMARK TEXT FOR DOC 2",
          good_through_date: "2024-12-31T23:59:59.000",
        },
      ];

      // Setup the mock
      mockedRemarksRealPropApi.fetchAcrisRecordsByDocumentIds.mockResolvedValue(
        mockRecordsData
      );

      // Make the request with JSON array
      const response = await request(app)
        .get("/realPropertyRemarks/fetchAcrisRecordsByDocumentIds")
        .query({
          documentIds: JSON.stringify(["2023040500001001", "2023040500001002"]),
        });

      // Assertions
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        realPropRemarksRecords: mockRecordsData,
      });
      expect(
        mockedRemarksRealPropApi.fetchAcrisRecordsByDocumentIds
      ).toHaveBeenCalledTimes(1);
      expect(
        mockedRemarksRealPropApi.fetchAcrisRecordsByDocumentIds
      ).toHaveBeenCalledWith(["2023040500001001", "2023040500001002"]);
    });

    test("works: returns records for document IDs as comma-separated string", async () => {
      // Mock the API response
      const mockRecordsData = [
        {
          document_id: "2023040500001001",
          record_type: "REMARK",
          sequence_number: "1",
          remark_text: "SAMPLE REMARK TEXT 1",
        },
        {
          document_id: "2023040500001002",
          record_type: "REMARK",
          sequence_number: "1",
          remark_text: "SAMPLE REMARK TEXT FOR DOC 2",
        },
      ];

      // Setup the mock
      mockedRemarksRealPropApi.fetchAcrisRecordsByDocumentIds.mockResolvedValue(
        mockRecordsData
      );

      // Make the request with comma-separated string
      const response = await request(app)
        .get("/realPropertyRemarks/fetchAcrisRecordsByDocumentIds")
        .query({
          documentIds: "2023040500001001,2023040500001002",
        });

      // Assertions
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        realPropRemarksRecords: mockRecordsData,
      });
      expect(
        mockedRemarksRealPropApi.fetchAcrisRecordsByDocumentIds
      ).toHaveBeenCalledTimes(1);
      expect(
        mockedRemarksRealPropApi.fetchAcrisRecordsByDocumentIds
      ).toHaveBeenCalledWith(["2023040500001001", "2023040500001002"]);
    });

    test("handles JSON parse error", async () => {
      // Setup the mock to throw an error for invalid JSON
      mockedRemarksRealPropApi.fetchAcrisRecordsByDocumentIds.mockRejectedValue(
        new Error("Invalid JSON")
      );

      // Make the request with invalid JSON
      const response = await request(app)
        .get("/realPropertyRemarks/fetchAcrisRecordsByDocumentIds")
        .query({
          documentIds: "{invalid-json",
        });

      // Assertions
      expect(response.statusCode).toBe(500);
      expect(response.body.error).toBeTruthy();
    });

    test("handles error when API call fails", async () => {
      // Setup the mock to throw an error
      mockedRemarksRealPropApi.fetchAcrisRecordsByDocumentIds.mockRejectedValue(
        new Error(
          "Failed to fetch records by document IDs from Real Property Remarks API"
        )
      );

      // Make the request
      const response = await request(app)
        .get("/realPropertyRemarks/fetchAcrisRecordsByDocumentIds")
        .query({
          documentIds: "invalid_id",
        });

      // Assertions
      expect(response.statusCode).toBe(500);
      expect(response.body.error.message).toContain(
        "Failed to fetch records by document IDs from Real Property Remarks API"
      );
    });
  });
});
