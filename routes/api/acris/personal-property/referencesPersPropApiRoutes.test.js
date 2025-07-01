"use strict";

/**
 * Test suite for ACRIS Personal Property References API Routes
 *
 * NOTE: These routes were used for both Postman-based development and are deployed
 * in the production application for logged-in users.
 */

const request = require("supertest");
const app = require("../../../../app");
const ReferencesPersPropApi = require("../../../../thirdPartyApi/acris/personal-property/ReferencesPersPropApi");

// Mock the ReferencesPersPropApi
jest.mock(
  "../../../../thirdPartyApi/acris/personal-property/ReferencesPersPropApi"
);

const mockedReferencesPersPropApi = ReferencesPersPropApi;

describe("Personal Property References API Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /persPropertyReferences/fetchRecord", () => {
    test("works: returns personal property references records with query parameters", async () => {
      // Mock the API response
      const mockReferencesData = [
        {
          document_id: "2023040500001001",
          record_type: "REFERENCE",
          crfn: "2023000012345",
          doc_id_ref: "2023040500000500",
          file_nbr: "890123",
          good_through_date: "2024-12-31T23:59:59.000",
        },
        {
          document_id: "2023040500001002",
          record_type: "REFERENCE",
          crfn: "2023000012346",
          doc_id_ref: "2023040500000501",
          file_nbr: "890124",
          good_through_date: "2024-12-31T23:59:59.000",
        },
      ];

      mockedReferencesPersPropApi.fetchFromAcris.mockResolvedValue(
        mockReferencesData
      );

      const queryParams = {
        document_id: "2023040500001001",
        crfn: "2023000012345",
      };

      const resp = await request(app)
        .get("/persPropertyReferences/fetchRecord")
        .query(queryParams);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        records: mockReferencesData,
      });

      // Verify the API was called with the correct query parameters
      expect(mockedReferencesPersPropApi.fetchFromAcris).toHaveBeenCalledWith(
        queryParams
      );
      expect(mockedReferencesPersPropApi.fetchFromAcris).toHaveBeenCalledTimes(
        1
      );
    });

    test("works: returns records with no query parameters", async () => {
      const mockReferencesData = [
        {
          document_id: "2023040500001003",
          record_type: "REFERENCE",
          crfn: "2023000012347",
          doc_id_ref: "2023040500000502",
          file_nbr: "890125",
          good_through_date: "2024-12-31T23:59:59.000",
        },
      ];

      mockedReferencesPersPropApi.fetchFromAcris.mockResolvedValue(
        mockReferencesData
      );

      const resp = await request(app).get(
        "/persPropertyReferences/fetchRecord"
      );

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        records: mockReferencesData,
      });

      // Verify the API was called with empty query object
      expect(mockedReferencesPersPropApi.fetchFromAcris).toHaveBeenCalledWith(
        {}
      );
      expect(mockedReferencesPersPropApi.fetchFromAcris).toHaveBeenCalledTimes(
        1
      );
    });

    test("works: handles multiple query parameters", async () => {
      const mockReferencesData = [
        {
          document_id: "2023040500001004",
          record_type: "REFERENCE",
          crfn: "2023000012348",
          doc_id_ref: "2023040500000503",
          file_nbr: "890126",
          good_through_date: "2024-12-31T23:59:59.000",
        },
      ];

      mockedReferencesPersPropApi.fetchFromAcris.mockResolvedValue(
        mockReferencesData
      );

      const queryParams = {
        document_id: "2023040500001004",
        crfn: "2023000012348",
        file_nbr: "890126",
        $limit: "100",
        $offset: "0",
      };

      const resp = await request(app)
        .get("/persPropertyReferences/fetchRecord")
        .query(queryParams);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        records: mockReferencesData,
      });

      expect(mockedReferencesPersPropApi.fetchFromAcris).toHaveBeenCalledWith(
        queryParams
      );
    });

    test("works: handles doc_id_ref specific queries", async () => {
      const mockReferencesData = [
        {
          document_id: "2023040500001005",
          record_type: "REFERENCE",
          crfn: "2023000012349",
          doc_id_ref: "2023040500000504",
          file_nbr: "890127",
          good_through_date: "2024-12-31T23:59:59.000",
        },
        {
          document_id: "2023040500001006",
          record_type: "REFERENCE",
          crfn: "2023000012350",
          doc_id_ref: "2023040500000504",
          file_nbr: "890128",
          good_through_date: "2024-12-31T23:59:59.000",
        },
      ];

      mockedReferencesPersPropApi.fetchFromAcris.mockResolvedValue(
        mockReferencesData
      );

      const queryParams = {
        doc_id_ref: "2023040500000504",
      };

      const resp = await request(app)
        .get("/persPropertyReferences/fetchRecord")
        .query(queryParams);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body.records).toHaveLength(2);
      expect(resp.body.records).toEqual(mockReferencesData);
      expect(resp.body.records[0]).toHaveProperty(
        "doc_id_ref",
        "2023040500000504"
      );
      expect(resp.body.records[1]).toHaveProperty(
        "doc_id_ref",
        "2023040500000504"
      );
    });

    test("handles API errors gracefully", async () => {
      const errorMessage = "API service unavailable";
      mockedReferencesPersPropApi.fetchFromAcris.mockRejectedValue(
        new Error(errorMessage)
      );

      const resp = await request(app)
        .get("/persPropertyReferences/fetchRecord")
        .query({ document_id: "2023040500001001" });

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
        'No records found for query: {"document_id":"INVALID123"}'
      );

      mockedReferencesPersPropApi.fetchFromAcris.mockRejectedValue(
        notFoundError
      );

      const resp = await request(app)
        .get("/persPropertyReferences/fetchRecord")
        .query({ document_id: "INVALID123" });

      expect(resp.statusCode).toEqual(404);
      expect(resp.body).toEqual({
        error: {
          message: 'No records found for query: {"document_id":"INVALID123"}',
          status: 404,
        },
      });
    });

    test("returns empty array when API returns empty results", async () => {
      mockedReferencesPersPropApi.fetchFromAcris.mockResolvedValue([]);

      const resp = await request(app)
        .get("/persPropertyReferences/fetchRecord")
        .query({ document_id: "NONEXISTENT" });

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        records: [],
      });
    });

    test("production behavior: route does not require authentication for development/testing", async () => {
      const mockReferencesData = [
        {
          document_id: "2023040500001007",
          record_type: "REFERENCE",
          crfn: "2023000012351",
          doc_id_ref: "2023040500000505",
          file_nbr: "890129",
          good_through_date: "2024-12-31T23:59:59.000",
        },
      ];

      mockedReferencesPersPropApi.fetchFromAcris.mockResolvedValue(
        mockReferencesData
      );

      // Test without any authorization headers
      const resp = await request(app)
        .get("/persPropertyReferences/fetchRecord")
        .query({ document_id: "2023040500001007" });

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        records: mockReferencesData,
      });
    });

    test("works: validates reference relationship data", async () => {
      const mockReferencesData = [
        {
          document_id: "2023040500001008",
          record_type: "REFERENCE",
          crfn: "2023000012352",
          doc_id_ref: "2023040500000506",
          file_nbr: "890130",
          good_through_date: "2024-12-31T23:59:59.000",
        },
      ];

      mockedReferencesPersPropApi.fetchFromAcris.mockResolvedValue(
        mockReferencesData
      );

      const resp = await request(app)
        .get("/persPropertyReferences/fetchRecord")
        .query({ crfn: "2023000012352" });

      expect(resp.statusCode).toEqual(200);
      expect(resp.body.records[0]).toHaveProperty("document_id");
      expect(resp.body.records[0]).toHaveProperty("doc_id_ref");
      expect(resp.body.records[0]).toHaveProperty("crfn");
      expect(resp.body.records[0]).toHaveProperty("file_nbr");
      expect(resp.body.records[0]).toHaveProperty("good_through_date");
      expect(resp.body.records[0]).toHaveProperty("record_type", "REFERENCE");
    });

    test("works: handles file number-based queries", async () => {
      const mockReferencesData = [
        {
          document_id: "2023040500001009",
          record_type: "REFERENCE",
          crfn: "2023000012353",
          doc_id_ref: "2023040500000507",
          file_nbr: "890131",
          good_through_date: "2024-12-31T23:59:59.000",
        },
      ];

      mockedReferencesPersPropApi.fetchFromAcris.mockResolvedValue(
        mockReferencesData
      );

      const resp = await request(app)
        .get("/persPropertyReferences/fetchRecord")
        .query({ file_nbr: "890131" });

      expect(resp.statusCode).toEqual(200);
      expect(resp.body.records[0]).toHaveProperty("file_nbr", "890131");
      expect(resp.body.records[0]).toHaveProperty(
        "document_id",
        "2023040500001009"
      );
    });

    test("works: handles date range queries", async () => {
      const mockReferencesData = [
        {
          document_id: "2023040500001010",
          record_type: "REFERENCE",
          crfn: "2023000012354",
          doc_id_ref: "2023040500000508",
          file_nbr: "890132",
          good_through_date: "2024-12-31T23:59:59.000",
        },
      ];

      mockedReferencesPersPropApi.fetchFromAcris.mockResolvedValue(
        mockReferencesData
      );

      const queryParams = {
        good_through_date: "2024-12-31T23:59:59.000",
        $where: "good_through_date >= '2024-01-01T00:00:00.000'",
      };

      const resp = await request(app)
        .get("/persPropertyReferences/fetchRecord")
        .query(queryParams);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body.records[0]).toHaveProperty(
        "good_through_date",
        "2024-12-31T23:59:59.000"
      );
    });
  });
});
