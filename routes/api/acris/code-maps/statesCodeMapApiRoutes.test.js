"use strict";

/**
 * Test suite for ACRIS States Code Map API Routes
 *
 * NOTE: This test file is for development and learning purposes only.
 * These routes were used for Postman-based development and API exploration,
 * not for production functionality.
 */

const request = require("supertest");
const app = require("../../../../app");
const StatesCodeMapApi = require("../../../../thirdPartyApi/acris/code-maps/StatesCodeMapApi");

// Mock the StatesCodeMapApi
jest.mock("../../../../thirdPartyApi/acris/code-maps/StatesCodeMapApi");

const mockedStatesCodeMapApi = StatesCodeMapApi;

describe("GET /codeMapStates/fetchAll", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("works: returns state code records with query parameters", async () => {
    // Mock the API response
    const mockStateData = [
      {
        record_type: "STATE",
        state_code: "NY",
        description: "NEW YORK",
      },
      {
        record_type: "STATE",
        state_code: "CA",
        description: "CALIFORNIA",
      },
    ];

    mockedStatesCodeMapApi.fetchFromAcris.mockResolvedValue(mockStateData);

    const queryParams = {
      state_code: "NY",
      description: "NEW YORK",
    };

    const resp = await request(app)
      .get("/codeMapStates/fetchAll")
      .query(queryParams);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      records: mockStateData,
    });

    // Verify the API was called with the correct query parameters
    expect(mockedStatesCodeMapApi.fetchFromAcris).toHaveBeenCalledWith(
      queryParams
    );
    expect(mockedStatesCodeMapApi.fetchFromAcris).toHaveBeenCalledTimes(1);
  });

  test("works: returns records with no query parameters", async () => {
    const mockStateData = [
      {
        record_type: "STATE",
        state_code: "TX",
        description: "TEXAS",
      },
    ];

    mockedStatesCodeMapApi.fetchFromAcris.mockResolvedValue(mockStateData);

    const resp = await request(app).get("/codeMapStates/fetchAll");

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      records: mockStateData,
    });

    // Verify the API was called with empty query object
    expect(mockedStatesCodeMapApi.fetchFromAcris).toHaveBeenCalledWith({});
    expect(mockedStatesCodeMapApi.fetchFromAcris).toHaveBeenCalledTimes(1);
  });

  test("works: returns records with multiple query parameters", async () => {
    const mockStateData = [
      {
        record_type: "STATE",
        state_code: "FL",
        description: "FLORIDA",
      },
    ];

    mockedStatesCodeMapApi.fetchFromAcris.mockResolvedValue(mockStateData);

    const queryParams = {
      record_type: "STATE",
      state_code: "FL",
      $limit: "10",
    };

    const resp = await request(app)
      .get("/codeMapStates/fetchAll")
      .query(queryParams);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      records: mockStateData,
    });

    expect(mockedStatesCodeMapApi.fetchFromAcris).toHaveBeenCalledWith(
      queryParams
    );
  });

  test("handles API errors gracefully", async () => {
    const errorMessage = "API service unavailable";
    mockedStatesCodeMapApi.fetchFromAcris.mockRejectedValue(
      new Error(errorMessage)
    );

    const resp = await request(app)
      .get("/codeMapStates/fetchAll")
      .query({ state_code: "NY" });

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
      'No records found for query: {"state_code":"XX"}'
    );

    mockedStatesCodeMapApi.fetchFromAcris.mockRejectedValue(notFoundError);

    const resp = await request(app)
      .get("/codeMapStates/fetchAll")
      .query({ state_code: "XX" });

    expect(resp.statusCode).toEqual(404);
    expect(resp.body).toEqual({
      error: {
        message: 'No records found for query: {"state_code":"XX"}',
        status: 404,
      },
    });
  });

  test("returns empty array when API returns empty results", async () => {
    mockedStatesCodeMapApi.fetchFromAcris.mockResolvedValue([]);

    const resp = await request(app)
      .get("/codeMapStates/fetchAll")
      .query({ state_code: "NONEXISTENT" });

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      records: [],
    });
  });

  // Note: These routes were used for development and Postman testing purposes only.
  // No authorization is required as these are development/testing endpoints.
  test("development behavior: route does not require authentication", async () => {
    const mockStateData = [
      {
        record_type: "STATE",
        state_code: "WA",
        description: "WASHINGTON",
      },
    ];

    mockedStatesCodeMapApi.fetchFromAcris.mockResolvedValue(mockStateData);

    // Test without any authorization headers
    const resp = await request(app)
      .get("/codeMapStates/fetchAll")
      .query({ state_code: "WA" });

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      records: mockStateData,
    });
  });

  test("works: handles standard US states", async () => {
    const mockStateData = [
      {
        record_type: "STATE",
        state_code: "IL",
        description: "ILLINOIS",
      },
    ];

    mockedStatesCodeMapApi.fetchFromAcris.mockResolvedValue(mockStateData);

    const resp = await request(app)
      .get("/codeMapStates/fetchAll")
      .query({ state_code: "IL" });

    expect(resp.statusCode).toEqual(200);
    expect(resp.body.records[0]).toHaveProperty("state_code", "IL");
    expect(resp.body.records[0]).toHaveProperty("description", "ILLINOIS");
    expect(resp.body.records[0]).toHaveProperty("record_type", "STATE");
  });

  test("works: handles special territories and armed forces", async () => {
    const mockSpecialData = [
      {
        record_type: "STATE",
        state_code: "DC",
        description: "WASHINGTON D.C.",
      },
      {
        record_type: "STATE",
        state_code: "AA",
        description: "ARMED FORCES AMERICAS",
      },
    ];

    mockedStatesCodeMapApi.fetchFromAcris.mockResolvedValue(mockSpecialData);

    const resp = await request(app)
      .get("/codeMapStates/fetchAll")
      .query({ record_type: "STATE" });

    expect(resp.statusCode).toEqual(200);
    expect(resp.body.records).toHaveLength(2);
    expect(resp.body.records[0]).toHaveProperty("state_code", "DC");
    expect(resp.body.records[1]).toHaveProperty("state_code", "AA");
  });

  test("works: handles description-based queries", async () => {
    const mockStateData = [
      {
        record_type: "STATE",
        state_code: "AK",
        description: "ALASKA",
      },
    ];

    mockedStatesCodeMapApi.fetchFromAcris.mockResolvedValue(mockStateData);

    const resp = await request(app)
      .get("/codeMapStates/fetchAll")
      .query({ description: "ALASKA" });

    expect(resp.statusCode).toEqual(200);
    expect(resp.body.records[0]).toHaveProperty("description", "ALASKA");
    expect(resp.body.records[0]).toHaveProperty("state_code", "AK");
  });
});
