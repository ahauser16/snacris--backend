"use strict";

const request = require("supertest");
const app = require("../../../app");
const LegalsRealPropApi = require("../../../thirdPartyApi/acris/real-property/LegalsRealPropApi");
const { transformForUrl } = require("../../../thirdPartyApi/utils");

// Mock dependencies
jest.mock("../../../thirdPartyApi/acris/real-property/LegalsRealPropApi");
jest.mock("../../../thirdPartyApi/utils");

const mockedLegalsRealPropApi = LegalsRealPropApi;
const mockedTransformForUrl = transformForUrl;

// Mock DB connection
jest.mock("../../../db.js", () => ({
  query: jest.fn(),
}));

describe("GET /queryAcrisAddressParcel/fetchRecord", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock behavior
    mockedLegalsRealPropApi.fetchAcrisRecords.mockResolvedValue([]);
    mockedTransformForUrl.mockImplementation((str) => str);
  });

  describe("Parameter Validation", () => {
    it("should return 400 error when no query parameters provided", async () => {
      const response = await request(app).get(
        "/queryAcrisAddressParcel/fetchRecord"
      );

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("error");
      expect(response.body.message).toContain(
        "At least one query parameter is required"
      );
    });

    it("should accept valid BBL parameters", async () => {
      mockedLegalsRealPropApi.fetchAcrisRecords.mockResolvedValue([
        {
          document_id: "DOC123",
          borough: "1",
          block: "123",
          lot: "456",
          street_number: "123",
          street_name: "MAIN ST",
          unit: null,
          year: "2023",
          easement: "N",
          partial_lot: "N",
          air_rights: "N",
          subterranean_rights: "N",
          property_type: "01",
        },
      ]);

      const response = await request(app)
        .get("/queryAcrisAddressParcel/fetchRecord")
        .query({ borough: "1", block: "123", lot: "456" });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(mockedLegalsRealPropApi.fetchAcrisRecords).toHaveBeenCalledWith({
        borough: "1",
        block: "123",
        lot: "456",
      });
    });

    it("should accept valid address parameters", async () => {
      mockedLegalsRealPropApi.fetchAcrisRecords.mockResolvedValue([
        {
          document_id: "DOC456",
          borough: "1",
          block: "789",
          lot: "101",
          street_number: "123",
          street_name: "MAIN ST",
          unit: "2A",
          year: "2023",
          easement: "N",
          partial_lot: "N",
          air_rights: "N",
          subterranean_rights: "N",
          property_type: "01",
        },
      ]);

      const response = await request(app)
        .get("/queryAcrisAddressParcel/fetchRecord")
        .query({
          borough: "1",
          street_number: "123",
          street_name: "MAIN ST",
          unit: "2A",
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
    });

    it("should handle partial parameters correctly", async () => {
      mockedLegalsRealPropApi.fetchAcrisRecords.mockResolvedValue([]);

      const response = await request(app)
        .get("/queryAcrisAddressParcel/fetchRecord")
        .query({ borough: "2", block: "456" });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("failed");
      expect(response.body.message).toContain("No records found");
    });
  });

  describe("API Integration", () => {
    it("should handle API errors gracefully", async () => {
      mockedLegalsRealPropApi.fetchAcrisRecords.mockRejectedValue(
        new Error("API Error")
      );

      const response = await request(app)
        .get("/queryAcrisAddressParcel/fetchRecord")
        .query({ borough: "1", block: "123", lot: "456" });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("failed");
      expect(response.body.message).toContain("Error fetching records");
    });

    it("should handle empty results from API", async () => {
      mockedLegalsRealPropApi.fetchAcrisRecords.mockResolvedValue([]);

      const response = await request(app)
        .get("/queryAcrisAddressParcel/fetchRecord")
        .query({ borough: "1", block: "123", lot: "456" });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("failed");
      expect(response.body.message).toBe(
        "No records found for the provided query parameters."
      );
    });

    it("should handle null results from API", async () => {
      mockedLegalsRealPropApi.fetchAcrisRecords.mockResolvedValue(null);

      const response = await request(app)
        .get("/queryAcrisAddressParcel/fetchRecord")
        .query({ borough: "1", block: "123", lot: "456" });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("failed");
      expect(response.body.message).toBe(
        "No records found for the provided query parameters."
      );
    });
  });

  describe("Data Analysis", () => {
    it("should analyze single record correctly", async () => {
      const mockRecords = [
        {
          document_id: "DOC123",
          borough: "1",
          block: "123",
          lot: "456",
          street_number: "123",
          street_name: "MAIN ST",
          unit: null,
          year: "2023",
          easement: "N",
          partial_lot: "N",
          air_rights: "N",
          subterranean_rights: "N",
          property_type: "01",
        },
      ];

      mockedLegalsRealPropApi.fetchAcrisRecords.mockResolvedValue(mockRecords);

      const response = await request(app)
        .get("/queryAcrisAddressParcel/fetchRecord")
        .query({ borough: "1", block: "123", lot: "456" });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe("Analysis complete for 1 records.");
      expect(response.body.analysis).toBeDefined();
      expect(response.body.analysis.borough).toEqual(["1"]);
      expect(response.body.analysis.borough_consistency).toBe("1/1");
      expect(response.body.analysis.borough_exceptions).toEqual([]);
    });

    it("should analyze multiple records with consistency", async () => {
      const mockRecords = [
        {
          document_id: "DOC123",
          borough: "1",
          block: "123",
          lot: "456",
          street_number: "123",
          street_name: "MAIN ST",
          unit: null,
          year: "2023",
          easement: "N",
          partial_lot: "N",
          air_rights: "N",
          subterranean_rights: "N",
          property_type: "01",
        },
        {
          document_id: "DOC124",
          borough: "1",
          block: "123",
          lot: "456",
          street_number: "123",
          street_name: "MAIN ST",
          unit: null,
          year: "2022",
          easement: "N",
          partial_lot: "N",
          air_rights: "N",
          subterranean_rights: "N",
          property_type: "01",
        },
        {
          document_id: "DOC125",
          borough: "1",
          block: "123",
          lot: "456",
          street_number: "123",
          street_name: "MAIN ST",
          unit: null,
          year: "2021",
          easement: "N",
          partial_lot: "N",
          air_rights: "N",
          subterranean_rights: "N",
          property_type: "01",
        },
      ];

      mockedLegalsRealPropApi.fetchAcrisRecords.mockResolvedValue(mockRecords);

      const response = await request(app)
        .get("/queryAcrisAddressParcel/fetchRecord")
        .query({ borough: "1", block: "123", lot: "456" });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.analysis.borough).toEqual(["1"]);
      expect(response.body.analysis.borough_consistency).toBe("3/3");
      expect(response.body.analysis.borough_exceptions).toEqual([]);
    });

    it("should handle null and undefined values in analysis", async () => {
      const mockRecords = [
        {
          document_id: "DOC123",
          borough: "1",
          block: "123",
          lot: "456",
          street_number: null,
          street_name: null,
          unit: undefined,
          year: "2023",
          easement: "N",
          partial_lot: "N",
          air_rights: "N",
          subterranean_rights: "N",
          property_type: "01",
        },
      ];

      mockedLegalsRealPropApi.fetchAcrisRecords.mockResolvedValue(mockRecords);

      const response = await request(app)
        .get("/queryAcrisAddressParcel/fetchRecord")
        .query({ borough: "1", block: "123", lot: "456" });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.analysis.street_number).toContain(null);
      expect(response.body.analysis.street_name).toContain(null);
    });
  });

  describe("URL Parameter Transformation", () => {
    it("should call transformForUrl for string parameters", async () => {
      mockedLegalsRealPropApi.fetchAcrisRecords.mockResolvedValue([]);

      await request(app).get("/queryAcrisAddressParcel/fetchRecord").query({
        borough: "1",
        street_number: "123A",
        street_name: "EAST 42ND STREET",
        unit: "SUITE 100",
      });

      expect(mockedTransformForUrl).toHaveBeenCalledTimes(3);
      expect(mockedTransformForUrl).toHaveBeenCalledWith("123A");
      expect(mockedTransformForUrl).toHaveBeenCalledWith("EAST 42ND STREET");
      expect(mockedTransformForUrl).toHaveBeenCalledWith("SUITE 100");
    });

    it("should not call transformForUrl for numeric parameters", async () => {
      mockedLegalsRealPropApi.fetchAcrisRecords.mockResolvedValue([]);

      await request(app)
        .get("/queryAcrisAddressParcel/fetchRecord")
        .query({ borough: "1", block: "123", lot: "456" });

      // transformForUrl should not be called for borough, block, lot
      expect(mockedTransformForUrl).not.toHaveBeenCalled();
    });
  });

  describe("Response Format", () => {
    it("should return correct success response format", async () => {
      const mockRecords = [
        {
          document_id: "DOC123",
          borough: "1",
          block: "123",
          lot: "456",
          street_number: "123",
          street_name: "MAIN ST",
          unit: null,
          year: "2023",
          easement: "N",
          partial_lot: "N",
          air_rights: "N",
          subterranean_rights: "N",
          property_type: "01",
        },
      ];

      mockedLegalsRealPropApi.fetchAcrisRecords.mockResolvedValue(mockRecords);

      const response = await request(app)
        .get("/queryAcrisAddressParcel/fetchRecord")
        .query({ borough: "1", block: "123", lot: "456" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", "success");
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("analysis");
    });

    it("should return correct error response format", async () => {
      const response = await request(app).get(
        "/queryAcrisAddressParcel/fetchRecord"
      );

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("status", "error");
      expect(response.body).toHaveProperty("message");
    });

    it("should return correct failed response format", async () => {
      mockedLegalsRealPropApi.fetchAcrisRecords.mockResolvedValue([]);

      const response = await request(app)
        .get("/queryAcrisAddressParcel/fetchRecord")
        .query({ borough: "1", block: "123", lot: "456" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", "failed");
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("Edge Cases", () => {
    it("should handle very large datasets", async () => {
      const largeDataset = Array(1000)
        .fill(null)
        .map((_, index) => ({
          document_id: `DOC${index}`,
          borough: "1",
          block: "123",
          lot: "456",
          street_number: "123",
          street_name: "MAIN ST",
          unit: null,
          year: "2023",
          easement: "N",
          partial_lot: "N",
          air_rights: "N",
          subterranean_rights: "N",
          property_type: "01",
        }));

      mockedLegalsRealPropApi.fetchAcrisRecords.mockResolvedValue(largeDataset);

      const response = await request(app)
        .get("/queryAcrisAddressParcel/fetchRecord")
        .query({ borough: "1", block: "123", lot: "456" });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe("Analysis complete for 1000 records.");
    });

    it("should handle special characters in parameters", async () => {
      mockedLegalsRealPropApi.fetchAcrisRecords.mockResolvedValue([]);

      const response = await request(app)
        .get("/queryAcrisAddressParcel/fetchRecord")
        .query({
          borough: "1",
          street_name: "ST. JOHN'S PLACE",
          unit: "APT #1A",
        });

      expect(response.status).toBe(200);
      expect(mockedTransformForUrl).toHaveBeenCalledWith("ST. JOHN'S PLACE");
      expect(mockedTransformForUrl).toHaveBeenCalledWith("APT #1A");
    });

    it("should handle empty string parameters", async () => {
      const response = await request(app)
        .get("/queryAcrisAddressParcel/fetchRecord")
        .query({ borough: "", block: "", lot: "" });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("error");
    });
  });
});
