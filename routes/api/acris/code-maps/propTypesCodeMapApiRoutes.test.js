"use strict";

/**
 * Test suite for ACRIS Property Types Code Map API Routes
 *
 * NOTE: This test file is for development and learning purposes only.
 * These routes were used for Postman-based development and API exploration,
 * not for production functionality.
 */

const request = require("supertest");
const app = require("../../../../app");
const PropTypesCodeMapApi = require("../../../../thirdPartyApi/acris/code-maps/PropTypesCodeMapApi");

// Mock the PropTypesCodeMapApi
jest.mock("../../../../thirdPartyApi/acris/code-maps/PropTypesCodeMapApi");

const mockedPropTypesCodeMapApi = PropTypesCodeMapApi;

describe("GET /codeMapPropertyTypes/fetchAll", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("works: returns property type code records with query parameters", async () => {
    // Mock the API response
    const mockPropTypeData = [
      {
        record_type: "PROPERTY_TYPE",
        property_type: "10",
        description: "VACANT LAND",
      },
      {
        record_type: "PROPERTY_TYPE",
        property_type: "11",
        description: "OFFICE BUILDING",
      },
    ];

    mockedPropTypesCodeMapApi.fetchFromAcris.mockResolvedValue(
      mockPropTypeData
    );

    const queryParams = {
      property_type: "10",
      description: "VACANT LAND",
    };

    const resp = await request(app)
      .get("/codeMapPropertyTypes/fetchAll")
      .query(queryParams);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      records: mockPropTypeData,
    });

    // Verify the API was called with the correct query parameters
    expect(mockedPropTypesCodeMapApi.fetchFromAcris).toHaveBeenCalledWith(
      queryParams
    );
    expect(mockedPropTypesCodeMapApi.fetchFromAcris).toHaveBeenCalledTimes(1);
  });

  test("works: returns records with no query parameters", async () => {
    const mockPropTypeData = [
      {
        record_type: "PROPERTY_TYPE",
        property_type: "21",
        description: "OFFICE CONDOMINIUM",
      },
    ];

    mockedPropTypesCodeMapApi.fetchFromAcris.mockResolvedValue(
      mockPropTypeData
    );

    const resp = await request(app).get("/codeMapPropertyTypes/fetchAll");

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      records: mockPropTypeData,
    });

    // Verify the API was called with empty query object
    expect(mockedPropTypesCodeMapApi.fetchFromAcris).toHaveBeenCalledWith({});
    expect(mockedPropTypesCodeMapApi.fetchFromAcris).toHaveBeenCalledTimes(1);
  });

  test("works: returns records with multiple query parameters", async () => {
    const mockPropTypeData = [
      {
        record_type: "PROPERTY_TYPE",
        property_type: "12",
        description: "STORE BUILDING",
      },
    ];

    mockedPropTypesCodeMapApi.fetchFromAcris.mockResolvedValue(
      mockPropTypeData
    );

    const queryParams = {
      record_type: "PROPERTY_TYPE",
      property_type: "12",
      $limit: "10",
    };

    const resp = await request(app)
      .get("/codeMapPropertyTypes/fetchAll")
      .query(queryParams);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      records: mockPropTypeData,
    });

    expect(mockedPropTypesCodeMapApi.fetchFromAcris).toHaveBeenCalledWith(
      queryParams
    );
  });

  test("handles API errors gracefully", async () => {
    const errorMessage = "API service unavailable";
    mockedPropTypesCodeMapApi.fetchFromAcris.mockRejectedValue(
      new Error(errorMessage)
    );

    const resp = await request(app)
      .get("/codeMapPropertyTypes/fetchAll")
      .query({ property_type: "10" });

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
      'No records found for query: {"property_type":"99"}'
    );

    mockedPropTypesCodeMapApi.fetchFromAcris.mockRejectedValue(notFoundError);

    const resp = await request(app)
      .get("/codeMapPropertyTypes/fetchAll")
      .query({ property_type: "99" });

    expect(resp.statusCode).toEqual(404);
    expect(resp.body).toEqual({
      error: {
        message: 'No records found for query: {"property_type":"99"}',
        status: 404,
      },
    });
  });

  test("returns empty array when API returns empty results", async () => {
    mockedPropTypesCodeMapApi.fetchFromAcris.mockResolvedValue([]);

    const resp = await request(app)
      .get("/codeMapPropertyTypes/fetchAll")
      .query({ property_type: "NONEXISTENT" });

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      records: [],
    });
  });

  // Note: These routes were used for development and Postman testing purposes only.
  // No authorization is required as these are development/testing endpoints.
  test("development behavior: route does not require authentication", async () => {
    const mockPropTypeData = [
      {
        record_type: "PROPERTY_TYPE",
        property_type: "13",
        description: "LOFT BUILDING",
      },
    ];

    mockedPropTypesCodeMapApi.fetchFromAcris.mockResolvedValue(
      mockPropTypeData
    );

    // Test without any authorization headers
    const resp = await request(app)
      .get("/codeMapPropertyTypes/fetchAll")
      .query({ property_type: "13" });

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      records: mockPropTypeData,
    });
  });

  test("works: handles different property type codes", async () => {
    const mockPropTypeData = [
      {
        record_type: "PROPERTY_TYPE",
        property_type: "01",
        description: "ONE FAMILY DWELLING",
      },
    ];

    mockedPropTypesCodeMapApi.fetchFromAcris.mockResolvedValue(
      mockPropTypeData
    );

    const resp = await request(app)
      .get("/codeMapPropertyTypes/fetchAll")
      .query({ property_type: "01" });

    expect(resp.statusCode).toEqual(200);
    expect(resp.body.records[0]).toHaveProperty("property_type", "01");
    expect(resp.body.records[0]).toHaveProperty(
      "description",
      "ONE FAMILY DWELLING"
    );
    expect(resp.body.records[0]).toHaveProperty("record_type", "PROPERTY_TYPE");
  });

  test("works: handles description-based queries", async () => {
    const mockPropTypeData = [
      {
        record_type: "PROPERTY_TYPE",
        property_type: "02",
        description: "TWO FAMILY DWELLING",
      },
    ];

    mockedPropTypesCodeMapApi.fetchFromAcris.mockResolvedValue(
      mockPropTypeData
    );

    const resp = await request(app)
      .get("/codeMapPropertyTypes/fetchAll")
      .query({ description: "TWO FAMILY DWELLING" });

    expect(resp.statusCode).toEqual(200);
    expect(resp.body.records[0]).toHaveProperty(
      "description",
      "TWO FAMILY DWELLING"
    );
    expect(resp.body.records[0]).toHaveProperty("property_type", "02");
  });
});
