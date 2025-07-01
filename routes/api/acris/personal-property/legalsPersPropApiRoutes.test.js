"use strict";

/**
 * Test suite for ACRIS Personal Property Legals API Routes
 *
 * NOTE: These routes were used for both Postman-based development and are deployed
 * in the production application for logged-in users.
 */

const request = require("supertest");
const app = require("../../../../app");
const LegalsPersPropApi = require("../../../../thirdPartyApi/acris/personal-property/LegalsPersPropApi");

// Mock the LegalsPersPropApi
jest.mock(
  "../../../../thirdPartyApi/acris/personal-property/LegalsPersPropApi"
);

const mockedLegalsPersPropApi = LegalsPersPropApi;

describe("Personal Property Legals API Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /persPropertyLegals/fetchRecord", () => {
    test("works: returns personal property legals records with query parameters", async () => {
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

      mockedLegalsPersPropApi.fetchFromAcris.mockResolvedValue(mockLegalsData);

      const queryParams = {
        borough: "1",
        block: "123",
        lot: "45",
      };

      const resp = await request(app)
        .get("/persPropertyLegals/fetchRecord")
        .query(queryParams);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        records: mockLegalsData,
      });

      // Verify the API was called with the correct query parameters
      expect(mockedLegalsPersPropApi.fetchFromAcris).toHaveBeenCalledWith(
        queryParams
      );
      expect(mockedLegalsPersPropApi.fetchFromAcris).toHaveBeenCalledTimes(1);
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

      mockedLegalsPersPropApi.fetchFromAcris.mockResolvedValue(mockLegalsData);

      const resp = await request(app).get("/persPropertyLegals/fetchRecord");

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        records: mockLegalsData,
      });

      // Verify the API was called with empty query object
      expect(mockedLegalsPersPropApi.fetchFromAcris).toHaveBeenCalledWith({});
      expect(mockedLegalsPersPropApi.fetchFromAcris).toHaveBeenCalledTimes(1);
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

      mockedLegalsPersPropApi.fetchFromAcris.mockResolvedValue(mockLegalsData);

      const queryParams = {
        borough: "3",
        block: "555",
        lot: "222",
        property_type: "MIXED USE",
        $limit: "100",
      };

      const resp = await request(app)
        .get("/persPropertyLegals/fetchRecord")
        .query(queryParams);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        records: mockLegalsData,
      });

      expect(mockedLegalsPersPropApi.fetchFromAcris).toHaveBeenCalledWith(
        queryParams
      );
    });

    test("handles API errors gracefully", async () => {
      const errorMessage = "API service unavailable";
      mockedLegalsPersPropApi.fetchFromAcris.mockRejectedValue(
        new Error(errorMessage)
      );

      const resp = await request(app)
        .get("/persPropertyLegals/fetchRecord")
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

      mockedLegalsPersPropApi.fetchFromAcris.mockRejectedValue(notFoundError);

      const resp = await request(app)
        .get("/persPropertyLegals/fetchRecord")
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
      mockedLegalsPersPropApi.fetchFromAcris.mockResolvedValue([]);

      const resp = await request(app)
        .get("/persPropertyLegals/fetchRecord")
        .query({ borough: "9", block: "NONEXISTENT" });

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        records: [],
      });
    });

    test("production behavior: route does not require authentication for development/testing", async () => {
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

      mockedLegalsPersPropApi.fetchFromAcris.mockResolvedValue(mockLegalsData);

      // Test without any authorization headers
      const resp = await request(app)
        .get("/persPropertyLegals/fetchRecord")
        .query({ borough: "4", block: "888" });

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        records: mockLegalsData,
      });
    });
  });

  describe("GET /persPropertyLegals/fetchRecordCount", () => {
    test("works: returns count of matching records", async () => {
      const mockCount = 42;
      mockedLegalsPersPropApi.fetchCountFromAcris.mockResolvedValue(mockCount);

      const queryParams = {
        borough: "1",
        property_type: "RESIDENTIAL",
      };

      const resp = await request(app)
        .get("/persPropertyLegals/fetchRecordCount")
        .query(queryParams);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        legalsRecordCount: mockCount,
      });

      expect(mockedLegalsPersPropApi.fetchCountFromAcris).toHaveBeenCalledWith(
        queryParams
      );
      expect(mockedLegalsPersPropApi.fetchCountFromAcris).toHaveBeenCalledTimes(
        1
      );
    });

    test("works: returns count with no query parameters", async () => {
      const mockCount = 1000;
      mockedLegalsPersPropApi.fetchCountFromAcris.mockResolvedValue(mockCount);

      const resp = await request(app).get(
        "/persPropertyLegals/fetchRecordCount"
      );

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        legalsRecordCount: mockCount,
      });

      expect(mockedLegalsPersPropApi.fetchCountFromAcris).toHaveBeenCalledWith(
        {}
      );
    });

    test("handles API errors in count endpoint", async () => {
      const errorMessage = "Count API service unavailable";
      mockedLegalsPersPropApi.fetchCountFromAcris.mockRejectedValue(
        new Error(errorMessage)
      );

      const resp = await request(app)
        .get("/persPropertyLegals/fetchRecordCount")
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

  describe("GET /persPropertyLegals/fetchDocIdsCrossRefPartyDocIds", () => {
    test("works: returns cross-referenced document IDs", async () => {
      const mockCrossRefData = [
        { document_id: "2023040500001001" },
        { document_id: "2023040500001003" },
        { document_id: "2023040500001005" },
      ];

      mockedLegalsPersPropApi.fetchDocIdsFromAcrisCrossRefParties.mockResolvedValue(
        mockCrossRefData
      );

      const partiesDocIds = [
        "2023040500001001",
        "2023040500001003",
        "2023040500001005",
      ];
      const queryParams = {
        borough: "1",
        partiesDocIdsCrossRefMaster: JSON.stringify(partiesDocIds),
      };

      const resp = await request(app)
        .get("/persPropertyLegals/fetchDocIdsCrossRefPartyDocIds")
        .query(queryParams);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        legalsDocIdsCrossRefParties: mockCrossRefData,
      });

      expect(
        mockedLegalsPersPropApi.fetchDocIdsFromAcrisCrossRefParties
      ).toHaveBeenCalledWith(
        {
          borough: "1",
          partiesDocIdsCrossRefMaster: JSON.stringify(partiesDocIds),
        },
        partiesDocIds
      );
    });

    test("works: handles empty partiesDocIdsCrossRefMaster array", async () => {
      const mockCrossRefData = [];
      mockedLegalsPersPropApi.fetchDocIdsFromAcrisCrossRefParties.mockResolvedValue(
        mockCrossRefData
      );

      const resp = await request(app)
        .get("/persPropertyLegals/fetchDocIdsCrossRefPartyDocIds")
        .query({ borough: "1" });

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        legalsDocIdsCrossRefParties: mockCrossRefData,
      });

      expect(
        mockedLegalsPersPropApi.fetchDocIdsFromAcrisCrossRefParties
      ).toHaveBeenCalledWith({ borough: "1" }, []);
    });

    test("handles JSON parsing errors gracefully", async () => {
      const resp = await request(app)
        .get("/persPropertyLegals/fetchDocIdsCrossRefPartyDocIds")
        .query({
          borough: "1",
          partiesDocIdsCrossRefMaster: "invalid-json",
        });

      expect(resp.statusCode).toEqual(500);
      expect(resp.body.error).toHaveProperty("message");
      expect(resp.body.error.status).toEqual(500);
    });

    test("handles API errors in cross-reference endpoint", async () => {
      const errorMessage = "Cross-reference API service unavailable";
      mockedLegalsPersPropApi.fetchDocIdsFromAcrisCrossRefParties.mockRejectedValue(
        new Error(errorMessage)
      );

      const resp = await request(app)
        .get("/persPropertyLegals/fetchDocIdsCrossRefPartyDocIds")
        .query({
          borough: "1",
          partiesDocIdsCrossRefMaster: JSON.stringify(["123", "456"]),
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
});
