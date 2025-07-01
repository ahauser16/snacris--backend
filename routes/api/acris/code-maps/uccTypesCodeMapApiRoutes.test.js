"use strict";

/**
 * Test suite for ACRIS UCC Types Code Map API Routes
 *
 * NOTE: This test file is for development and learning purposes only.
 * These routes were used for Postman-based development and API exploration,
 * not for production functionality.
 */

const request = require("supertest");
const app = require("../../../../app");
const UccTypesCodeMapApi = require("../../../../thirdPartyApi/acris/code-maps/UccTypesCodeMapApi");

// Mock the UccTypesCodeMapApi
jest.mock("../../../../thirdPartyApi/acris/code-maps/UccTypesCodeMapApi");

const mockedUccTypesCodeMapApi = UccTypesCodeMapApi;

describe("GET /codeMapUccLiens/fetchAll", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("works: returns UCC collateral code records with query parameters", async () => {
    // Mock the API response
    const mockUccData = [
      {
        record_type: "UCC_COLLATERAL",
        ucc_collateral_code: "01",
        description: "ACCOUNTS",
      },
      {
        record_type: "UCC_COLLATERAL",
        ucc_collateral_code: "02",
        description: "CHATTEL PAPER",
      },
    ];

    mockedUccTypesCodeMapApi.fetchFromAcris.mockResolvedValue(mockUccData);

    const queryParams = {
      ucc_collateral_code: "01",
      description: "ACCOUNTS",
    };

    const resp = await request(app)
      .get("/codeMapUccLiens/fetchAll")
      .query(queryParams);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      records: mockUccData,
    });

    // Verify the API was called with the correct query parameters
    expect(mockedUccTypesCodeMapApi.fetchFromAcris).toHaveBeenCalledWith(
      queryParams
    );
    expect(mockedUccTypesCodeMapApi.fetchFromAcris).toHaveBeenCalledTimes(1);
  });

  test("works: returns records with no query parameters", async () => {
    const mockUccData = [
      {
        record_type: "UCC_COLLATERAL",
        ucc_collateral_code: "03",
        description: "EQUIPMENT",
      },
    ];

    mockedUccTypesCodeMapApi.fetchFromAcris.mockResolvedValue(mockUccData);

    const resp = await request(app).get("/codeMapUccLiens/fetchAll");

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      records: mockUccData,
    });

    // Verify the API was called with empty query object
    expect(mockedUccTypesCodeMapApi.fetchFromAcris).toHaveBeenCalledWith({});
    expect(mockedUccTypesCodeMapApi.fetchFromAcris).toHaveBeenCalledTimes(1);
  });

  test("works: returns records with multiple query parameters", async () => {
    const mockUccData = [
      {
        record_type: "UCC_COLLATERAL",
        ucc_collateral_code: "04",
        description: "INVENTORY",
      },
    ];

    mockedUccTypesCodeMapApi.fetchFromAcris.mockResolvedValue(mockUccData);

    const queryParams = {
      record_type: "UCC_COLLATERAL",
      ucc_collateral_code: "04",
      $limit: "10",
    };

    const resp = await request(app)
      .get("/codeMapUccLiens/fetchAll")
      .query(queryParams);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      records: mockUccData,
    });

    expect(mockedUccTypesCodeMapApi.fetchFromAcris).toHaveBeenCalledWith(
      queryParams
    );
  });

  test("handles API errors gracefully", async () => {
    const errorMessage = "API service unavailable";
    mockedUccTypesCodeMapApi.fetchFromAcris.mockRejectedValue(
      new Error(errorMessage)
    );

    const resp = await request(app)
      .get("/codeMapUccLiens/fetchAll")
      .query({ ucc_collateral_code: "01" });

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
      'No records found for query: {"ucc_collateral_code":"99"}'
    );

    mockedUccTypesCodeMapApi.fetchFromAcris.mockRejectedValue(notFoundError);

    const resp = await request(app)
      .get("/codeMapUccLiens/fetchAll")
      .query({ ucc_collateral_code: "99" });

    expect(resp.statusCode).toEqual(404);
    expect(resp.body).toEqual({
      error: {
        message: 'No records found for query: {"ucc_collateral_code":"99"}',
        status: 404,
      },
    });
  });

  test("returns empty array when API returns empty results", async () => {
    mockedUccTypesCodeMapApi.fetchFromAcris.mockResolvedValue([]);

    const resp = await request(app)
      .get("/codeMapUccLiens/fetchAll")
      .query({ ucc_collateral_code: "NONEXISTENT" });

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      records: [],
    });
  });

  // Note: These routes were used for development and Postman testing purposes only.
  // No authorization is required as these are development/testing endpoints.
  test("development behavior: route does not require authentication", async () => {
    const mockUccData = [
      {
        record_type: "UCC_COLLATERAL",
        ucc_collateral_code: "05",
        description: "GENERAL INTANGIBLES",
      },
    ];

    mockedUccTypesCodeMapApi.fetchFromAcris.mockResolvedValue(mockUccData);

    // Test without any authorization headers
    const resp = await request(app)
      .get("/codeMapUccLiens/fetchAll")
      .query({ ucc_collateral_code: "05" });

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      records: mockUccData,
    });
  });

  test("works: handles specific UCC collateral types", async () => {
    const mockUccData = [
      {
        record_type: "UCC_COLLATERAL",
        ucc_collateral_code: "06",
        description: "DOCUMENTS",
      },
    ];

    mockedUccTypesCodeMapApi.fetchFromAcris.mockResolvedValue(mockUccData);

    const resp = await request(app)
      .get("/codeMapUccLiens/fetchAll")
      .query({ ucc_collateral_code: "06" });

    expect(resp.statusCode).toEqual(200);
    expect(resp.body.records[0]).toHaveProperty("ucc_collateral_code", "06");
    expect(resp.body.records[0]).toHaveProperty("description", "DOCUMENTS");
    expect(resp.body.records[0]).toHaveProperty(
      "record_type",
      "UCC_COLLATERAL"
    );
  });

  test("works: handles description-based queries", async () => {
    const mockUccData = [
      {
        record_type: "UCC_COLLATERAL",
        ucc_collateral_code: "07",
        description: "INSTRUMENTS",
      },
    ];

    mockedUccTypesCodeMapApi.fetchFromAcris.mockResolvedValue(mockUccData);

    const resp = await request(app)
      .get("/codeMapUccLiens/fetchAll")
      .query({ description: "INSTRUMENTS" });

    expect(resp.statusCode).toEqual(200);
    expect(resp.body.records[0]).toHaveProperty("description", "INSTRUMENTS");
    expect(resp.body.records[0]).toHaveProperty("ucc_collateral_code", "07");
  });

  test("works: handles record type filtering", async () => {
    const mockUccData = [
      {
        record_type: "UCC_COLLATERAL",
        ucc_collateral_code: "08",
        description: "INVESTMENT PROPERTY",
      },
    ];

    mockedUccTypesCodeMapApi.fetchFromAcris.mockResolvedValue(mockUccData);

    const resp = await request(app)
      .get("/codeMapUccLiens/fetchAll")
      .query({ record_type: "UCC_COLLATERAL" });

    expect(resp.statusCode).toEqual(200);
    expect(resp.body.records[0]).toHaveProperty(
      "record_type",
      "UCC_COLLATERAL"
    );
    expect(resp.body.records[0]).toHaveProperty("ucc_collateral_code", "08");
    expect(resp.body.records[0]).toHaveProperty(
      "description",
      "INVESTMENT PROPERTY"
    );
  });
});
