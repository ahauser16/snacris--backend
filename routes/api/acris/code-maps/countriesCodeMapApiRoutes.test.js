"use strict";

/**
 * Test suite for ACRIS Country Code Map API Routes
 *
 * NOTE: This test file is for development and learning purposes only.
 * These routes were used for Postman-based development and API exploration,
 * not for production functionality.
 */

const request = require("supertest");
const app = require("../../../../app");
const CountriesCodeMapApi = require("../../../../thirdPartyApi/acris/code-maps/CountriesCodeMapApi");

// Mock the CountriesCodeMapApi
jest.mock("../../../../thirdPartyApi/acris/code-maps/CountriesCodeMapApi");

const mockedCountriesCodeMapApi = CountriesCodeMapApi;

describe("GET /codeMapCountries/fetchAll", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("works: returns country code records with query parameters", async () => {
    // Mock the API response
    const mockCountryData = [
      {
        record_type: "COUNTRY",
        country_code: "US",
        description: "UNITED STATES",
      },
      {
        record_type: "COUNTRY",
        country_code: "CA",
        description: "CANADA",
      },
    ];

    mockedCountriesCodeMapApi.fetchFromAcris.mockResolvedValue(mockCountryData);

    const queryParams = {
      country_code: "US",
      description: "UNITED STATES",
    };

    const resp = await request(app)
      .get("/codeMapCountries/fetchAll")
      .query(queryParams);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      records: mockCountryData,
    });

    // Verify the API was called with the correct query parameters
    expect(mockedCountriesCodeMapApi.fetchFromAcris).toHaveBeenCalledWith(
      queryParams
    );
    expect(mockedCountriesCodeMapApi.fetchFromAcris).toHaveBeenCalledTimes(1);
  });

  test("works: returns records with no query parameters", async () => {
    const mockCountryData = [
      {
        record_type: "COUNTRY",
        country_code: "FR",
        description: "FRANCE",
      },
    ];

    mockedCountriesCodeMapApi.fetchFromAcris.mockResolvedValue(mockCountryData);

    const resp = await request(app).get("/codeMapCountries/fetchAll");

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      records: mockCountryData,
    });

    // Verify the API was called with empty query object
    expect(mockedCountriesCodeMapApi.fetchFromAcris).toHaveBeenCalledWith({});
    expect(mockedCountriesCodeMapApi.fetchFromAcris).toHaveBeenCalledTimes(1);
  });

  test("works: returns records with multiple query parameters", async () => {
    const mockCountryData = [
      {
        record_type: "COUNTRY",
        country_code: "MX",
        description: "MEXICO",
      },
    ];

    mockedCountriesCodeMapApi.fetchFromAcris.mockResolvedValue(mockCountryData);

    const queryParams = {
      record_type: "COUNTRY",
      country_code: "MX",
      $limit: "10",
    };

    const resp = await request(app)
      .get("/codeMapCountries/fetchAll")
      .query(queryParams);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      records: mockCountryData,
    });

    expect(mockedCountriesCodeMapApi.fetchFromAcris).toHaveBeenCalledWith(
      queryParams
    );
  });

  test("handles API errors gracefully", async () => {
    const errorMessage = "API service unavailable";
    mockedCountriesCodeMapApi.fetchFromAcris.mockRejectedValue(
      new Error(errorMessage)
    );

    const resp = await request(app)
      .get("/codeMapCountries/fetchAll")
      .query({ country_code: "US" });

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
      'No records found for query: {"country_code":"XX"}'
    );

    mockedCountriesCodeMapApi.fetchFromAcris.mockRejectedValue(notFoundError);

    const resp = await request(app)
      .get("/codeMapCountries/fetchAll")
      .query({ country_code: "XX" });

    expect(resp.statusCode).toEqual(404);
    expect(resp.body).toEqual({
      error: {
        message: 'No records found for query: {"country_code":"XX"}',
        status: 404,
      },
    });
  });

  test("returns empty array when API returns empty results", async () => {
    mockedCountriesCodeMapApi.fetchFromAcris.mockResolvedValue([]);

    const resp = await request(app)
      .get("/codeMapCountries/fetchAll")
      .query({ country_code: "NONEXISTENT" });

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      records: [],
    });
  });

  // Note: These routes were used for development and Postman testing purposes only.
  // No authorization is required as these are development/testing endpoints.
  test("development behavior: route does not require authentication", async () => {
    const mockCountryData = [
      {
        record_type: "COUNTRY",
        country_code: "UK",
        description: "UNITED KINGDOM",
      },
    ];

    mockedCountriesCodeMapApi.fetchFromAcris.mockResolvedValue(mockCountryData);

    // Test without any authorization headers
    const resp = await request(app)
      .get("/codeMapCountries/fetchAll")
      .query({ country_code: "UK" });

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      records: mockCountryData,
    });
  });
});
