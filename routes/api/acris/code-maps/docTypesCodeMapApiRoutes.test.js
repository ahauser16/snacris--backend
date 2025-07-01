"use strict";

/**
 * Test suite for ACRIS Document Types Code Map API Routes
 *
 * NOTE: This test file is for development and learning purposes only.
 * These routes were used for Postman-based development and API exploration,
 * not for production functionality.
 */

const request = require("supertest");
const app = require("../../../../app");
const DocTypesCodeMapApi = require("../../../../thirdPartyApi/acris/code-maps/DocTypesCodeMapApi");

// Mock the DocTypesCodeMapApi
jest.mock("../../../../thirdPartyApi/acris/code-maps/DocTypesCodeMapApi");

const mockedDocTypesCodeMapApi = DocTypesCodeMapApi;

describe("GET /codeMapDocumentTypes/fetchAll", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("works: returns document type code records with query parameters", async () => {
    // Mock the API response
    const mockDocTypeData = [
      {
        record_type: "DOCUMENT_TYPE",
        doc__type: "DEED",
        doc__type_description: "DEED",
        class_code_description: "CONVEYANCE",
        party1_type: "GRANTOR",
        party2_type: "GRANTEE",
        party3_type: null,
      },
      {
        record_type: "DOCUMENT_TYPE",
        doc__type: "MTGE",
        doc__type_description: "MORTGAGE",
        class_code_description: "MORTGAGE",
        party1_type: "MORTGAGOR",
        party2_type: "MORTGAGEE",
        party3_type: null,
      },
    ];

    mockedDocTypesCodeMapApi.fetchFromAcris.mockResolvedValue(mockDocTypeData);

    const queryParams = {
      doc__type: "DEED",
      class_code_description: "CONVEYANCE",
    };

    const resp = await request(app)
      .get("/codeMapDocumentTypes/fetchAll")
      .query(queryParams);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      records: mockDocTypeData,
    });

    // Verify the API was called with the correct query parameters
    expect(mockedDocTypesCodeMapApi.fetchFromAcris).toHaveBeenCalledWith(
      queryParams
    );
    expect(mockedDocTypesCodeMapApi.fetchFromAcris).toHaveBeenCalledTimes(1);
  });

  test("works: returns records with no query parameters", async () => {
    const mockDocTypeData = [
      {
        record_type: "DOCUMENT_TYPE",
        doc__type: "AGMT",
        doc__type_description: "AGREEMENT",
        class_code_description: "OTHER",
        party1_type: "PARTY1",
        party2_type: "PARTY2",
        party3_type: null,
      },
    ];

    mockedDocTypesCodeMapApi.fetchFromAcris.mockResolvedValue(mockDocTypeData);

    const resp = await request(app).get("/codeMapDocumentTypes/fetchAll");

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      records: mockDocTypeData,
    });

    // Verify the API was called with empty query object
    expect(mockedDocTypesCodeMapApi.fetchFromAcris).toHaveBeenCalledWith({});
    expect(mockedDocTypesCodeMapApi.fetchFromAcris).toHaveBeenCalledTimes(1);
  });

  test("works: returns records with multiple query parameters", async () => {
    const mockDocTypeData = [
      {
        record_type: "DOCUMENT_TYPE",
        doc__type: "LEAS",
        doc__type_description: "LEASE",
        class_code_description: "LEASE",
        party1_type: "LESSOR",
        party2_type: "LESSEE",
        party3_type: null,
      },
    ];

    mockedDocTypesCodeMapApi.fetchFromAcris.mockResolvedValue(mockDocTypeData);

    const queryParams = {
      record_type: "DOCUMENT_TYPE",
      doc__type: "LEAS",
      $limit: "10",
    };

    const resp = await request(app)
      .get("/codeMapDocumentTypes/fetchAll")
      .query(queryParams);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      records: mockDocTypeData,
    });

    expect(mockedDocTypesCodeMapApi.fetchFromAcris).toHaveBeenCalledWith(
      queryParams
    );
  });

  test("handles API errors gracefully", async () => {
    const errorMessage = "API service unavailable";
    mockedDocTypesCodeMapApi.fetchFromAcris.mockRejectedValue(
      new Error(errorMessage)
    );

    const resp = await request(app)
      .get("/codeMapDocumentTypes/fetchAll")
      .query({ doc__type: "DEED" });

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
      'No records found for query: {"doc__type":"XXXX"}'
    );

    mockedDocTypesCodeMapApi.fetchFromAcris.mockRejectedValue(notFoundError);

    const resp = await request(app)
      .get("/codeMapDocumentTypes/fetchAll")
      .query({ doc__type: "XXXX" });

    expect(resp.statusCode).toEqual(404);
    expect(resp.body).toEqual({
      error: {
        message: 'No records found for query: {"doc__type":"XXXX"}',
        status: 404,
      },
    });
  });

  test("returns empty array when API returns empty results", async () => {
    mockedDocTypesCodeMapApi.fetchFromAcris.mockResolvedValue([]);

    const resp = await request(app)
      .get("/codeMapDocumentTypes/fetchAll")
      .query({ doc__type: "NONEXISTENT" });

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      records: [],
    });
  });

  // Note: These routes were used for development and Postman testing purposes only.
  // No authorization is required as these are development/testing endpoints.
  test("development behavior: route does not require authentication", async () => {
    const mockDocTypeData = [
      {
        record_type: "DOCUMENT_TYPE",
        doc__type: "CNTR",
        doc__type_description: "CONTRACT",
        class_code_description: "OTHER",
        party1_type: "BUYER",
        party2_type: "SELLER",
        party3_type: null,
      },
    ];

    mockedDocTypesCodeMapApi.fetchFromAcris.mockResolvedValue(mockDocTypeData);

    // Test without any authorization headers
    const resp = await request(app)
      .get("/codeMapDocumentTypes/fetchAll")
      .query({ doc__type: "CNTR" });

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      records: mockDocTypeData,
    });
  });

  test("works: handles party type mappings correctly", async () => {
    const mockDocTypeData = [
      {
        record_type: "DOCUMENT_TYPE",
        doc__type: "DEED",
        doc__type_description: "DEED",
        class_code_description: "CONVEYANCE",
        party1_type: "GRANTOR",
        party2_type: "GRANTEE",
        party3_type: null,
      },
    ];

    mockedDocTypesCodeMapApi.fetchFromAcris.mockResolvedValue(mockDocTypeData);

    const resp = await request(app)
      .get("/codeMapDocumentTypes/fetchAll")
      .query({ party1_type: "GRANTOR" });

    expect(resp.statusCode).toEqual(200);
    expect(resp.body.records[0]).toHaveProperty("party1_type", "GRANTOR");
    expect(resp.body.records[0]).toHaveProperty("party2_type", "GRANTEE");
    expect(resp.body.records[0]).toHaveProperty("party3_type", null);
  });

  test("works: handles class code descriptions", async () => {
    const mockDocTypeData = [
      {
        record_type: "DOCUMENT_TYPE",
        doc__type: "MTGE",
        doc__type_description: "MORTGAGE",
        class_code_description: "MORTGAGE",
        party1_type: "MORTGAGOR",
        party2_type: "MORTGAGEE",
        party3_type: null,
      },
    ];

    mockedDocTypesCodeMapApi.fetchFromAcris.mockResolvedValue(mockDocTypeData);

    const resp = await request(app)
      .get("/codeMapDocumentTypes/fetchAll")
      .query({ class_code_description: "MORTGAGE" });

    expect(resp.statusCode).toEqual(200);
    expect(resp.body.records[0]).toHaveProperty(
      "class_code_description",
      "MORTGAGE"
    );
    expect(resp.body.records[0]).toHaveProperty("doc__type", "MTGE");
  });
});
