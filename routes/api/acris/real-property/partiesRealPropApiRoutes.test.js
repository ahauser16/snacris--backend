"use strict";

/**
 * Test suite for ACRIS Real Property Parties API Routes
 *
 * NOTE: These routes were used during development with Postman for API exploration and learning purposes
 * and are NOT being used in the deployed application. However, the methods contained in the
 * PartiesRealPropApi module are used in the deployed application.
 */

const request = require("supertest");
const app = require("../../../../app");
const PartiesRealPropApi = require("../../../../thirdPartyApi/acris/real-property/PartiesRealPropApi");

// Mock the PartiesRealPropApi
jest.mock("../../../../thirdPartyApi/acris/real-property/PartiesRealPropApi");

const mockedPartiesRealPropApi = PartiesRealPropApi;

describe("Real Property Parties API Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /realPropertyParties/fetchRecord", () => {
    test("works: returns real property parties records with query parameters", async () => {
      // Mock the API response
      const mockPartiesData = [
        {
          document_id: "2023040500001001",
          record_type: "PARTY",
          party_type: "1",
          name: "DOE JOHN",
          address_1: "123 MAIN ST",
          address_2: "APT 1A",
          country: "US",
          city: "NEW YORK",
          state: "NY",
          zip: "10001",
          good_through_date: "2024-12-31T23:59:59.000",
        },
        {
          document_id: "2023040500001002",
          record_type: "PARTY",
          party_type: "2",
          name: "SMITH JANE",
          address_1: "456 PARK AVE",
          address_2: "",
          country: "US",
          city: "NEW YORK",
          state: "NY",
          zip: "10022",
          good_through_date: "2024-12-31T23:59:59.000",
        },
      ];

      // Setup the mock
      mockedPartiesRealPropApi.fetchAcrisRecords.mockResolvedValue(
        mockPartiesData
      );

      // Make the request
      const response = await request(app)
        .get("/realPropertyParties/fetchRecord")
        .query({
          document_id: "2023040500001001",
        });

      // Assertions
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        realPropPartiesRecords: mockPartiesData,
      });
      expect(mockedPartiesRealPropApi.fetchAcrisRecords).toHaveBeenCalledTimes(
        1
      );
      expect(mockedPartiesRealPropApi.fetchAcrisRecords).toHaveBeenCalledWith({
        document_id: "2023040500001001",
      });
    });

    test("handles error when API call fails", async () => {
      // Setup the mock to throw an error
      mockedPartiesRealPropApi.fetchAcrisRecords.mockRejectedValue(
        new Error("Failed to fetch records from Real Property Parties API")
      );

      // Make the request
      const response = await request(app)
        .get("/realPropertyParties/fetchRecord")
        .query({
          document_id: "invalid_id",
        });

      // Assertions
      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({
        error: {
          message: "Failed to fetch records from Real Property Parties API",
          status: 500,
        },
      });
      expect(mockedPartiesRealPropApi.fetchAcrisRecords).toHaveBeenCalledTimes(
        1
      );
    });
  });

  describe("GET /realPropertyParties/fetchDocIdsCrossRefMasterDocIds", () => {
    test("works: returns cross-referenced document IDs", async () => {
      // Mock the API response
      const mockCrossRefData = [
        { document_id: "2023040500001001" },
        { document_id: "2023040500001002" },
      ];

      // Setup the mock
      mockedPartiesRealPropApi.fetchAcrisDocumentIdsCrossRef.mockResolvedValue(
        mockCrossRefData
      );

      // Make the request with JSON array in query
      const response = await request(app)
        .get("/realPropertyParties/fetchDocIdsCrossRefMasterDocIds")
        .query({
          masterRecordsDocumentIds: JSON.stringify([
            "2023040500001001",
            "2023040500001002",
          ]),
        });

      // Assertions
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        partiesDocIdsCrossRefMaster: mockCrossRefData,
      });
      expect(
        mockedPartiesRealPropApi.fetchAcrisDocumentIdsCrossRef
      ).toHaveBeenCalledTimes(1);
      expect(
        mockedPartiesRealPropApi.fetchAcrisDocumentIdsCrossRef
      ).toHaveBeenCalledWith(
        {
          masterRecordsDocumentIds: JSON.stringify([
            "2023040500001001",
            "2023040500001002",
          ]),
        },
        ["2023040500001001", "2023040500001002"]
      );
    });

    test("handles empty masterRecordsDocumentIds array", async () => {
      // Mock the API response
      const mockCrossRefData = [];

      // Setup the mock
      mockedPartiesRealPropApi.fetchAcrisDocumentIdsCrossRef.mockResolvedValue(
        mockCrossRefData
      );

      // Make the request with empty array
      const response = await request(app)
        .get("/realPropertyParties/fetchDocIdsCrossRefMasterDocIds")
        .query({
          masterRecordsDocumentIds: "[]",
        });

      // Assertions
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        partiesDocIdsCrossRefMaster: mockCrossRefData,
      });
      expect(
        mockedPartiesRealPropApi.fetchAcrisDocumentIdsCrossRef
      ).toHaveBeenCalledTimes(1);
      expect(
        mockedPartiesRealPropApi.fetchAcrisDocumentIdsCrossRef
      ).toHaveBeenCalledWith({ masterRecordsDocumentIds: "[]" }, []);
    });

    test("handles JSON parse error", async () => {
      // Make the request with invalid JSON
      const response = await request(app)
        .get("/realPropertyParties/fetchDocIdsCrossRefMasterDocIds")
        .query({
          masterRecordsDocumentIds: "{invalid-json",
        });

      // Assertions
      expect(response.statusCode).toBe(500);
      expect(response.body.error.message).toBeTruthy();
    });
  });

  describe("GET /realPropertyParties/fetchRecordCount", () => {
    test("works: returns record count", async () => {
      // Mock the API response
      const mockCountData = 42;

      // Setup the mock
      mockedPartiesRealPropApi.fetchAcrisRecordCount.mockResolvedValue(
        mockCountData
      );

      // Make the request
      const response = await request(app)
        .get("/realPropertyParties/fetchRecordCount")
        .query({
          borough: "1",
        });

      // Assertions
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        realPropPartiesRecordCount: mockCountData,
      });
      expect(
        mockedPartiesRealPropApi.fetchAcrisRecordCount
      ).toHaveBeenCalledTimes(1);
      expect(
        mockedPartiesRealPropApi.fetchAcrisRecordCount
      ).toHaveBeenCalledWith({
        borough: "1",
      });
    });

    test("handles error when API call fails", async () => {
      // Setup the mock to throw an error
      mockedPartiesRealPropApi.fetchAcrisRecordCount.mockRejectedValue(
        new Error("Failed to fetch record count from Real Property Parties API")
      );

      // Make the request
      const response = await request(app)
        .get("/realPropertyParties/fetchRecordCount")
        .query({
          borough: "invalid",
        });

      // Assertions
      expect(response.statusCode).toBe(500);
      expect(response.body.error.message).toContain(
        "Failed to fetch record count from Real Property Parties API"
      );
    });
  });

  describe("GET /realPropertyParties/fetchDocIds", () => {
    test("works: returns document IDs", async () => {
      // Mock the API response
      const mockDocIdsData = [
        { document_id: "2023040500001001" },
        { document_id: "2023040500001002" },
      ];

      // Setup the mock
      mockedPartiesRealPropApi.fetchAcrisDocumentIds.mockResolvedValue(
        mockDocIdsData
      );

      // Make the request
      const response = await request(app)
        .get("/realPropertyParties/fetchDocIds")
        .query({
          borough: "1",
        });

      // Assertions
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        realPropPartiesRecordsDocumentIds: mockDocIdsData,
      });
      expect(
        mockedPartiesRealPropApi.fetchAcrisDocumentIds
      ).toHaveBeenCalledTimes(1);
      expect(
        mockedPartiesRealPropApi.fetchAcrisDocumentIds
      ).toHaveBeenCalledWith({
        borough: "1",
      });
    });

    test("handles error when API call fails", async () => {
      // Setup the mock to throw an error
      mockedPartiesRealPropApi.fetchAcrisDocumentIds.mockRejectedValue(
        new Error("Failed to fetch document IDs from Real Property Parties API")
      );

      // Make the request
      const response = await request(app)
        .get("/realPropertyParties/fetchDocIds")
        .query({
          borough: "invalid",
        });

      // Assertions
      expect(response.statusCode).toBe(500);
      expect(response.body.error.message).toContain(
        "Failed to fetch document IDs from Real Property Parties API"
      );
    });
  });

  describe("GET /realPropertyParties/fetchAcrisRecordsByDocumentIds", () => {
    test("works: returns records for document IDs as JSON array", async () => {
      // Mock the API response
      const mockRecordsData = [
        {
          document_id: "2023040500001001",
          record_type: "PARTY",
          party_type: "1",
          name: "DOE JOHN",
          address_1: "123 MAIN ST",
          address_2: "APT 1A",
          country: "US",
          city: "NEW YORK",
          state: "NY",
          zip: "10001",
          good_through_date: "2024-12-31T23:59:59.000",
        },
        {
          document_id: "2023040500001002",
          record_type: "PARTY",
          party_type: "2",
          name: "SMITH JANE",
          address_1: "456 PARK AVE",
          address_2: "",
          country: "US",
          city: "NEW YORK",
          state: "NY",
          zip: "10022",
          good_through_date: "2024-12-31T23:59:59.000",
        },
      ];

      // Setup the mock
      mockedPartiesRealPropApi.fetchAcrisRecordsByDocumentIds.mockResolvedValue(
        mockRecordsData
      );

      // Make the request with JSON array
      const response = await request(app)
        .get("/realPropertyParties/fetchAcrisRecordsByDocumentIds")
        .query({
          documentIds: JSON.stringify(["2023040500001001", "2023040500001002"]),
        });

      // Assertions
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        realPropPartiesRecords: mockRecordsData,
      });
      expect(
        mockedPartiesRealPropApi.fetchAcrisRecordsByDocumentIds
      ).toHaveBeenCalledTimes(1);
      expect(
        mockedPartiesRealPropApi.fetchAcrisRecordsByDocumentIds
      ).toHaveBeenCalledWith(["2023040500001001", "2023040500001002"]);
    });

    test("works: returns records for document IDs as comma-separated string", async () => {
      // Mock the API response
      const mockRecordsData = [
        {
          document_id: "2023040500001001",
          record_type: "PARTY",
          party_type: "1",
          name: "DOE JOHN",
        },
        {
          document_id: "2023040500001002",
          record_type: "PARTY",
          party_type: "2",
          name: "SMITH JANE",
        },
      ];

      // Setup the mock
      mockedPartiesRealPropApi.fetchAcrisRecordsByDocumentIds.mockResolvedValue(
        mockRecordsData
      );

      // Make the request with comma-separated string
      const response = await request(app)
        .get("/realPropertyParties/fetchAcrisRecordsByDocumentIds")
        .query({
          documentIds: "2023040500001001,2023040500001002",
        });

      // Assertions
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        realPropPartiesRecords: mockRecordsData,
      });
      expect(
        mockedPartiesRealPropApi.fetchAcrisRecordsByDocumentIds
      ).toHaveBeenCalledTimes(1);
      expect(
        mockedPartiesRealPropApi.fetchAcrisRecordsByDocumentIds
      ).toHaveBeenCalledWith(["2023040500001001", "2023040500001002"]);
    });

    test("handles JSON parse error", async () => {
      // Setup the mock to throw an error for invalid JSON
      mockedPartiesRealPropApi.fetchAcrisRecordsByDocumentIds.mockRejectedValue(
        new Error("Invalid JSON")
      );

      // Make the request with invalid JSON
      const response = await request(app)
        .get("/realPropertyParties/fetchAcrisRecordsByDocumentIds")
        .query({
          documentIds: "{invalid-json",
        });

      // Assertions
      expect(response.statusCode).toBe(500);
      expect(response.body.error).toBeTruthy();
    });

    test("handles error when API call fails", async () => {
      // Setup the mock to throw an error
      mockedPartiesRealPropApi.fetchAcrisRecordsByDocumentIds.mockRejectedValue(
        new Error(
          "Failed to fetch records by document IDs from Real Property Parties API"
        )
      );

      // Make the request
      const response = await request(app)
        .get("/realPropertyParties/fetchAcrisRecordsByDocumentIds")
        .query({
          documentIds: "invalid_id",
        });

      // Assertions
      expect(response.statusCode).toBe(500);
      expect(response.body.error.message).toContain(
        "Failed to fetch records by document IDs from Real Property Parties API"
      );
    });
  });
});
