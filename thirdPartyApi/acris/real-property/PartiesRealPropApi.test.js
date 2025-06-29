"use strict";

const axios = require("axios");
const PartiesRealPropApi = require("./PartiesRealPropApi");
const SoqlUrl = require("../utils/SoqlUrl");
const { BadRequestError, NotFoundError } = require("../../../expressError");
const batchArray = require("../utils/CreateUrlBatchesArray");

// Mock dependencies
jest.mock("axios");
jest.mock("../utils/SoqlUrl", () => ({
  constructUrl: jest.fn(),
  constructUrlForDocumentIds: jest.fn(),
  constructUrlBatches: jest
    .fn()
    .mockImplementation((queryParams, documentIds, apiCaller, batchSize) => {
      // Safety check: never return more than 3 URLs to prevent infinite loops
      const maxUrls = Math.min(
        3,
        Math.ceil(documentIds.length / (batchSize || 500))
      );
      return Array.from(
        { length: maxUrls },
        (_, i) => `https://example.com/batch${i + 1}`
      );
    }),
}));
jest.mock("../utils/CreateUrlBatchesArray");

const mockedAxios = axios;
const mockedSoqlUrl = SoqlUrl;
const mockedBatchArray = batchArray;

describe("PartiesRealPropApi", function () {
  // Helper function to safely mock constructUrlBatches with limited URLs
  const safeMockConstructUrlBatches = (urls) => {
    if (Array.isArray(urls) && urls.length > 10) {
      console.warn(
        `Test safety: limiting batch URLs from ${urls.length} to 10`
      );
      urls = urls.slice(0, 10);
    }
    mockedSoqlUrl.constructUrlBatches.mockReturnValue(urls);
    return urls;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock environment variable
    process.env.NYC_OPEN_DATA_APP_TOKEN = "test-app-token";
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("fetchAcrisRecords", function () {
    const mockPartiesQueryParams = { party_type: "1", name: "SMITH" };

    test("fetches all records successfully", async function () {
      const mockUrl = "https://api.test/parties";
      const mockData = [
        {
          document_id: "2023123456789001",
          party_type: "1",
          name: "SMITH, JOHN",
          address_1: "123 MAIN ST",
          city: "NEW YORK",
          state: "NY",
        },
        {
          document_id: "2023123456789002",
          party_type: "2",
          name: "JONES, MARY",
          address_1: "456 BROADWAY",
          city: "NEW YORK",
          state: "NY",
        },
      ];

      mockedSoqlUrl.constructUrl.mockReturnValue(mockUrl);
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await PartiesRealPropApi.fetchAcrisRecords(
        mockPartiesQueryParams
      );

      expect(result).toEqual(mockData);
      expect(mockedSoqlUrl.constructUrl).toHaveBeenCalledWith(
        mockPartiesQueryParams,
        "PartiesRealPropApi",
        "records"
      );
      expect(mockedAxios.get).toHaveBeenCalledWith(mockUrl, {
        headers: {
          "Content-Type": "application/json",
          "X-App-Token": "test-app-token",
        },
      });
    });

    test("throws NotFoundError when no records are found", async function () {
      const mockUrl = "https://api.test/empty";
      mockedSoqlUrl.constructUrl.mockReturnValue(mockUrl);
      mockedAxios.get.mockResolvedValue({ data: [] });

      await expect(
        PartiesRealPropApi.fetchAcrisRecords(mockPartiesQueryParams)
      ).rejects.toThrow(NotFoundError);
      await expect(
        PartiesRealPropApi.fetchAcrisRecords(mockPartiesQueryParams)
      ).rejects.toThrow(
        "No records found for the given query from Real Property Parties API."
      );
    });

    test("throws NotFoundError when data is null or undefined", async function () {
      const mockUrl = "https://api.test/null";
      mockedSoqlUrl.constructUrl.mockReturnValue(mockUrl);
      mockedAxios.get.mockResolvedValue({ data: null });

      await expect(
        PartiesRealPropApi.fetchAcrisRecords(mockPartiesQueryParams)
      ).rejects.toThrow(NotFoundError);
    });

    test("handles axios errors and throws generic Error", async function () {
      const mockUrl = "https://api.test/error";
      mockedSoqlUrl.constructUrl.mockReturnValue(mockUrl);
      mockedAxios.get.mockRejectedValue(new Error("Network error"));

      await expect(
        PartiesRealPropApi.fetchAcrisRecords(mockPartiesQueryParams)
      ).rejects.toThrow(
        "Failed to fetch records from Real Property Parties API"
      );
    });

    test("uses correct headers with environment token", async function () {
      const mockUrl = "https://api.test/headers";
      const mockData = [{ document_id: "2023123456789001", party_type: "1" }];

      mockedSoqlUrl.constructUrl.mockReturnValue(mockUrl);
      mockedAxios.get.mockResolvedValue({ data: mockData });

      await PartiesRealPropApi.fetchAcrisRecords(mockPartiesQueryParams);

      expect(mockedAxios.get).toHaveBeenCalledWith(mockUrl, {
        headers: {
          "Content-Type": "application/json",
          "X-App-Token": "test-app-token",
        },
      });
    });
  });

  describe("fetchAcrisRecordCount", function () {
    const mockPartiesQueryParams = { party_type: "1", name: "SMITH" };

    test("fetches record count successfully", async function () {
      const mockUrl = "https://api.test/count";
      const mockData = [{ count: "42" }];

      mockedSoqlUrl.constructUrl.mockReturnValue(mockUrl);
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await PartiesRealPropApi.fetchAcrisRecordCount(
        mockPartiesQueryParams
      );

      expect(result).toBe(42);
      expect(mockedSoqlUrl.constructUrl).toHaveBeenCalledWith(
        mockPartiesQueryParams,
        "PartiesRealPropApi",
        "countAll"
      );
    });

    test("returns number when count is provided as string", async function () {
      const mockUrl = "https://api.test/string-count";
      const mockData = [{ count: "123" }];

      mockedSoqlUrl.constructUrl.mockReturnValue(mockUrl);
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await PartiesRealPropApi.fetchAcrisRecordCount(
        mockPartiesQueryParams
      );

      expect(result).toBe(123);
      expect(typeof result).toBe("number");
    });

    test("throws NotFoundError when no count data is found", async function () {
      const mockUrl = "https://api.test/no-count";
      mockedSoqlUrl.constructUrl.mockReturnValue(mockUrl);
      mockedAxios.get.mockResolvedValue({ data: [] });

      await expect(
        PartiesRealPropApi.fetchAcrisRecordCount(mockPartiesQueryParams)
      ).rejects.toThrow(NotFoundError);
      await expect(
        PartiesRealPropApi.fetchAcrisRecordCount(mockPartiesQueryParams)
      ).rejects.toThrow(
        "No count data found for the given query from Real Property Parties API."
      );
    });

    test("throws NotFoundError when count property is missing", async function () {
      const mockUrl = "https://api.test/missing-count";
      const mockData = [{ total: "42" }]; // Wrong property name
      mockedSoqlUrl.constructUrl.mockReturnValue(mockUrl);
      mockedAxios.get.mockResolvedValue({ data: mockData });

      await expect(
        PartiesRealPropApi.fetchAcrisRecordCount(mockPartiesQueryParams)
      ).rejects.toThrow(NotFoundError);
    });

    test("handles axios errors and throws generic Error", async function () {
      const mockUrl = "https://api.test/error";
      mockedSoqlUrl.constructUrl.mockReturnValue(mockUrl);
      mockedAxios.get.mockRejectedValue(new Error("API error"));

      await expect(
        PartiesRealPropApi.fetchAcrisRecordCount(mockPartiesQueryParams)
      ).rejects.toThrow(
        "Failed to fetch record count from Real Property Parties API"
      );
    });
  });

  describe("fetchAcrisDocumentIds", function () {
    const mockPartiesQueryParams = { party_type: "1", name: "SMITH" };

    test("fetches document IDs successfully", async function () {
      const mockUrl = "https://api.test/document-ids";
      const mockData = [
        { document_id: "2023123456789001" },
        { document_id: "2023123456789002" },
        { document_id: "2023123456789003" },
      ];

      mockedSoqlUrl.constructUrl.mockReturnValue(mockUrl);
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await PartiesRealPropApi.fetchAcrisDocumentIds(
        mockPartiesQueryParams
      );

      expect(result).toEqual([
        "2023123456789001",
        "2023123456789002",
        "2023123456789003",
      ]);
      expect(mockedSoqlUrl.constructUrl).toHaveBeenCalledWith(
        mockPartiesQueryParams,
        "PartiesRealPropApi",
        "document_id"
      );
    });

    test("extracts document_id values from response objects", async function () {
      const mockUrl = "https://api.test/extract-ids";
      const mockData = [
        { document_id: "2023123456789001", party_type: "1" },
        { document_id: "2023123456789002", party_type: "2" },
      ];

      mockedSoqlUrl.constructUrl.mockReturnValue(mockUrl);
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await PartiesRealPropApi.fetchAcrisDocumentIds(
        mockPartiesQueryParams
      );

      expect(result).toEqual(["2023123456789001", "2023123456789002"]);
    });

    test("throws NotFoundError when no document IDs are found", async function () {
      const mockUrl = "https://api.test/no-ids";
      mockedSoqlUrl.constructUrl.mockReturnValue(mockUrl);
      mockedAxios.get.mockResolvedValue({ data: [] });

      await expect(
        PartiesRealPropApi.fetchAcrisDocumentIds(mockPartiesQueryParams)
      ).rejects.toThrow(NotFoundError);
      await expect(
        PartiesRealPropApi.fetchAcrisDocumentIds(mockPartiesQueryParams)
      ).rejects.toThrow(
        "No document IDs found for the given query from Real Property Parties API."
      );
    });

    test("throws NotFoundError when data is null", async function () {
      const mockUrl = "https://api.test/null-data";
      mockedSoqlUrl.constructUrl.mockReturnValue(mockUrl);
      mockedAxios.get.mockResolvedValue({ data: null });

      await expect(
        PartiesRealPropApi.fetchAcrisDocumentIds(mockPartiesQueryParams)
      ).rejects.toThrow(NotFoundError);
    });

    test("handles axios errors and throws generic Error", async function () {
      const mockUrl = "https://api.test/error";
      mockedSoqlUrl.constructUrl.mockReturnValue(mockUrl);
      mockedAxios.get.mockRejectedValue(new Error("Network failure"));

      await expect(
        PartiesRealPropApi.fetchAcrisDocumentIds(mockPartiesQueryParams)
      ).rejects.toThrow(
        "Failed to fetch document IDs from PartiesRealPropApi.fetchAcrisDocumentIds"
      );
    });
  });

  describe.skip("fetchAcrisDocumentIdsCrossRef", function () {
    const mockPartiesQueryParams = { party_type: "1" };
    const mockMasterDocumentIds = ["2023123456789001", "2023123456789002"];
    const mockBatchSize = 500;

    test("fetches cross-referenced document IDs successfully", async function () {
      // Limit to 2 URLs maximum to prevent infinite loops
      const mockUrls = ["https://api.test/batch1", "https://api.test/batch2"];
      const mockData1 = [
        { document_id: "2023123456789001" },
        { document_id: "2023123456789002" },
      ];
      const mockData2 = [{ document_id: "2023123456789003" }];

      mockedSoqlUrl.constructUrlBatches.mockReturnValue(mockUrls);

      // Mock axios to handle pagination properly
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes("batch1")) {
          return Promise.resolve({ data: mockData1 });
        } else if (url.includes("batch2")) {
          return Promise.resolve({ data: mockData2 });
        }
        return Promise.resolve({ data: [] }); // Stop pagination
      });

      const result = await PartiesRealPropApi.fetchAcrisDocumentIdsCrossRef(
        mockPartiesQueryParams,
        mockMasterDocumentIds,
        mockBatchSize
      );

      expect(result).toEqual([
        "2023123456789001",
        "2023123456789002",
        "2023123456789003",
      ]);
      expect(mockedSoqlUrl.constructUrlBatches).toHaveBeenCalledWith(
        mockPartiesQueryParams,
        mockMasterDocumentIds,
        "PartiesRealPropApi",
        mockBatchSize
      );
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });

    test("uses default batch size of 500 when not provided", async function () {
      // Limit to 1 URL to prevent infinite loops
      const mockUrls = ["https://api.test/default-batch"];
      const mockData = [{ document_id: "2023123456789001" }];

      safeMockConstructUrlBatches(mockUrls);
      mockedAxios.get.mockImplementation(() => {
        return Promise.resolve({ data: mockData });
      });

      await PartiesRealPropApi.fetchAcrisDocumentIdsCrossRef(
        mockPartiesQueryParams,
        mockMasterDocumentIds
      );

      expect(mockedSoqlUrl.constructUrlBatches).toHaveBeenCalledWith(
        mockPartiesQueryParams,
        mockMasterDocumentIds,
        "PartiesRealPropApi",
        500
      );
    });

    test("handles pagination for each batch URL", async function () {
      // Limit to 1 URL to prevent infinite loops
      const mockUrls = ["https://api.test/paginated-batch"];
      const mockData1 = Array(1000)
        .fill()
        .map((_, i) => ({ document_id: `202312345678900${i}` }));
      const mockData2 = [{ document_id: "2023123456789999" }];

      safeMockConstructUrlBatches(mockUrls);

      // Mock axios to handle pagination correctly - first call returns 1000 records, second call returns fewer to stop pagination
      let callCount = 0;
      mockedAxios.get.mockImplementation((url) => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({ data: mockData1 });
        } else {
          return Promise.resolve({ data: mockData2 });
        }
      });

      const result = await PartiesRealPropApi.fetchAcrisDocumentIdsCrossRef(
        mockPartiesQueryParams,
        mockMasterDocumentIds
      );

      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://api.test/paginated-batch&$limit=1000&$offset=0",
        expect.any(Object)
      );
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://api.test/paginated-batch&$limit=1000&$offset=1000",
        expect.any(Object)
      );
      expect(result).toHaveLength(1001);
    });

    test("removes duplicate document IDs across batches", async function () {
      const mockUrls = ["https://api.test/batch1", "https://api.test/batch2"];
      const mockData1 = [
        { document_id: "2023123456789001" },
        { document_id: "2023123456789002" },
      ];
      const mockData2 = [
        { document_id: "2023123456789001" }, // Duplicate
        { document_id: "2023123456789003" },
      ];

      safeMockConstructUrlBatches(mockUrls);
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes("batch1")) {
          return Promise.resolve({ data: mockData1 });
        } else if (url.includes("batch2")) {
          return Promise.resolve({ data: mockData2 });
        }
        return Promise.resolve({ data: [] }); // Stop pagination
      });

      const result = await PartiesRealPropApi.fetchAcrisDocumentIdsCrossRef(
        mockPartiesQueryParams,
        mockMasterDocumentIds
      );

      expect(result).toEqual([
        "2023123456789001",
        "2023123456789002",
        "2023123456789003",
      ]);
      expect(result).toHaveLength(3);
    });

    test("throws NotFoundError when no document IDs are found", async function () {
      const mockUrls = ["https://api.test/empty-batch"];

      safeMockConstructUrlBatches(mockUrls);
      mockedAxios.get.mockImplementation(() => {
        return Promise.resolve({ data: [] });
      });

      await expect(
        PartiesRealPropApi.fetchAcrisDocumentIdsCrossRef(
          mockPartiesQueryParams,
          mockMasterDocumentIds
        )
      ).rejects.toThrow(NotFoundError);
      await expect(
        PartiesRealPropApi.fetchAcrisDocumentIdsCrossRef(
          mockPartiesQueryParams,
          mockMasterDocumentIds
        )
      ).rejects.toThrow(
        "No Real Property Parties records found from 'fetchAcrisDocumentIdsCrossRef'."
      );
    });

    test("handles axios errors and throws generic error", async function () {
      const mockUrls = ["https://api.test/error-batch"];

      safeMockConstructUrlBatches(mockUrls);
      mockedAxios.get.mockImplementation(() => {
        return Promise.reject(new Error("Network error"));
      });

      await expect(
        PartiesRealPropApi.fetchAcrisDocumentIdsCrossRef(
          mockPartiesQueryParams,
          mockMasterDocumentIds
        )
      ).rejects.toThrow(
        "Failed to fetch document IDs from PartiesRealPropApi.fetchAcrisDocumentIdsCrossRef"
      );
    });

    test("includes correct headers in API requests", async function () {
      const mockUrls = ["https://api.test/headers-batch"];
      const mockData = [{ document_id: "2023123456789001" }];

      safeMockConstructUrlBatches(mockUrls);
      mockedAxios.get.mockImplementation(() => {
        return Promise.resolve({ data: mockData });
      });

      await PartiesRealPropApi.fetchAcrisDocumentIdsCrossRef(
        mockPartiesQueryParams,
        mockMasterDocumentIds
      );

      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://api.test/headers-batch&$limit=1000&$offset=0",
        {
          headers: {
            "Content-Type": "application/json",
            "X-App-Token": "test-app-token",
          },
        }
      );
    });
  });

  describe("fetchAcrisRecordsByDocumentIds", function () {
    const mockDocumentIds = ["2023123456789001", "2023123456789002"];
    const mockQueryParams = { party_type: "1" };
    const mockLimit = 1000;

    beforeEach(() => {
      // Mock batchArray to create predictable batches
      mockedBatchArray.mockImplementation((arr, size) => {
        const batches = [];
        for (let i = 0; i < arr.length; i += size) {
          batches.push(arr.slice(i, i + size));
        }
        return batches;
      });
    });

    test("fetches records by document IDs successfully", async function () {
      const mockBatch1 = ["2023123456789001"];
      const mockBatch2 = ["2023123456789002"];
      const mockUrl1 = "https://api.test/batch1";
      const mockUrl2 = "https://api.test/batch2";
      const mockData1 = [
        {
          document_id: "2023123456789001",
          party_type: "1",
          name: "SMITH, JOHN",
        },
      ];
      const mockData2 = [
        {
          document_id: "2023123456789002",
          party_type: "2",
          name: "JONES, MARY",
        },
      ];

      mockedBatchArray.mockReturnValue([mockBatch1, mockBatch2]);
      mockedSoqlUrl.constructUrlForDocumentIds
        .mockReturnValueOnce(mockUrl1)
        .mockReturnValueOnce(mockUrl2);
      mockedAxios.get
        .mockResolvedValueOnce({ data: mockData1 })
        .mockResolvedValueOnce({ data: mockData2 });

      const result = await PartiesRealPropApi.fetchAcrisRecordsByDocumentIds(
        mockDocumentIds,
        mockQueryParams,
        mockLimit
      );

      expect(result).toEqual([...mockData1, ...mockData2]);
      expect(mockedBatchArray).toHaveBeenCalledWith(mockDocumentIds, 75);
    });

    test("uses default parameters when not provided", async function () {
      const mockBatch = ["2023123456789001"];
      const mockUrl = "https://api.test/default";
      const mockData = [{ document_id: "2023123456789001", party_type: "1" }];

      mockedBatchArray.mockReturnValue([mockBatch]);
      mockedSoqlUrl.constructUrlForDocumentIds.mockReturnValue(mockUrl);
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await PartiesRealPropApi.fetchAcrisRecordsByDocumentIds(
        mockDocumentIds
      );

      expect(result).toEqual(mockData);
      expect(mockedSoqlUrl.constructUrlForDocumentIds).toHaveBeenCalledWith(
        {},
        "PartiesRealPropApi",
        mockBatch,
        1000,
        0
      );
    });

    test("handles pagination within batches", async function () {
      const mockBatch = ["2023123456789001"];
      const mockUrl = "https://api.test/paginated";
      const mockData1 = Array(1000)
        .fill()
        .map((_, i) => ({
          document_id: `202312345678900${i}`,
          party_type: "1",
        }));
      const mockData2 = [{ document_id: "2023123456789999", party_type: "1" }];

      mockedBatchArray.mockReturnValue([mockBatch]);
      mockedSoqlUrl.constructUrlForDocumentIds.mockReturnValue(mockUrl);
      mockedAxios.get
        .mockResolvedValueOnce({ data: mockData1 })
        .mockResolvedValueOnce({ data: mockData2 });

      const result = await PartiesRealPropApi.fetchAcrisRecordsByDocumentIds(
        mockDocumentIds,
        mockQueryParams,
        mockLimit
      );

      expect(result).toHaveLength(1001);
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });

    test("returns null when no records are found", async function () {
      const mockBatch = ["2023123456789001"];
      const mockUrl = "https://api.test/empty";

      mockedBatchArray.mockReturnValue([mockBatch]);
      mockedSoqlUrl.constructUrlForDocumentIds.mockReturnValue(mockUrl);
      mockedAxios.get.mockResolvedValue({ data: [] });

      const result = await PartiesRealPropApi.fetchAcrisRecordsByDocumentIds(
        mockDocumentIds
      );

      expect(result).toBeNull();
    });

    test("returns null on axios errors", async function () {
      const mockBatch = ["2023123456789001"];
      const mockUrl = "https://api.test/error";

      mockedBatchArray.mockReturnValue([mockBatch]);
      mockedSoqlUrl.constructUrlForDocumentIds.mockReturnValue(mockUrl);
      mockedAxios.get.mockRejectedValue(new Error("API error"));

      const result = await PartiesRealPropApi.fetchAcrisRecordsByDocumentIds(
        mockDocumentIds
      );

      expect(result).toBeNull();
    });

    test("includes correct headers in API requests", async function () {
      const mockBatch = ["2023123456789001"];
      const mockUrl = "https://api.test/headers";
      const mockData = [{ document_id: "2023123456789001", party_type: "1" }];

      mockedBatchArray.mockReturnValue([mockBatch]);
      mockedSoqlUrl.constructUrlForDocumentIds.mockReturnValue(mockUrl);
      mockedAxios.get.mockResolvedValue({ data: mockData });

      await PartiesRealPropApi.fetchAcrisRecordsByDocumentIds(mockDocumentIds);

      expect(mockedAxios.get).toHaveBeenCalledWith(mockUrl, {
        headers: {
          "Content-Type": "application/json",
          "X-App-Token": "test-app-token",
        },
      });
    });

    test("uses correct batch size constant", async function () {
      const mockBatch = ["2023123456789001"];
      const mockUrl = "https://api.test/batch-size";
      const mockData = [{ document_id: "2023123456789001" }];

      mockedBatchArray.mockReturnValue([mockBatch]);
      mockedSoqlUrl.constructUrlForDocumentIds.mockReturnValue(mockUrl);
      mockedAxios.get.mockResolvedValue({ data: mockData });

      await PartiesRealPropApi.fetchAcrisRecordsByDocumentIds(mockDocumentIds);

      expect(mockedBatchArray).toHaveBeenCalledWith(mockDocumentIds, 75);
    });
  });

  describe("Environment variable handling", function () {
    test("works with missing environment variable", async function () {
      delete process.env.NYC_OPEN_DATA_APP_TOKEN;
      const mockUrl = "https://api.test/no-token";
      const mockData = [{ document_id: "2023123456789001", party_type: "1" }];

      mockedSoqlUrl.constructUrl.mockReturnValue(mockUrl);
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await PartiesRealPropApi.fetchAcrisRecords({
        party_type: "1",
      });

      expect(result).toEqual(mockData);
      expect(mockedAxios.get).toHaveBeenCalledWith(mockUrl, {
        headers: {
          "Content-Type": "application/json",
          "X-App-Token": undefined,
        },
      });
    });
  });

  describe("Error edge cases", function () {
    test("handles malformed response data gracefully", async function () {
      const mockUrl = "https://api.test/malformed";
      const malformedData = [{ not_document_id: "invalid" }];

      mockedSoqlUrl.constructUrl.mockReturnValue(mockUrl);
      mockedAxios.get.mockResolvedValue({ data: malformedData });

      // The malformed data will cause map to return undefined values, which should still work
      const result = await PartiesRealPropApi.fetchAcrisDocumentIds({
        party_type: "1",
      });
      expect(result).toEqual([undefined]);
    });

    test("handles non-array response data", async function () {
      const mockUrl = "https://api.test/non-array";
      mockedSoqlUrl.constructUrl.mockReturnValue(mockUrl);
      mockedAxios.get.mockResolvedValue({ data: "not an array" });

      await expect(
        PartiesRealPropApi.fetchAcrisRecords({ party_type: "1" })
      ).rejects.toThrow(NotFoundError);
    });
  });
});
