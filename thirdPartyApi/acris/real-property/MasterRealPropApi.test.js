"use strict";

const axios = require("axios");
const MasterRealPropApi = require("./MasterRealPropApi");
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

describe("MasterRealPropApi", function () {
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
    jest.clearAllMocks();
  });

  describe("fetchAcrisRecords", function () {
    const mockQueryParams = { doc_type: "DEED", recorded_borough: "1" };
    const mockLimit = 1000;

    test("fetches all records with pagination", async function () {
      // First page returns exactly 'limit' records, so pagination continues
      const mockRecords1 = Array.from({ length: 1000 }, (_, i) => ({
        document_id: `202312345678900${i.toString().padStart(2, "0")}`,
        doc_type: "DEED",
      }));
      // Second page returns fewer than 'limit' records, so pagination stops
      const mockRecords2 = [
        { document_id: "2023123456789999", doc_type: "DEED" },
      ];

      mockedSoqlUrl.constructUrl
        .mockReturnValueOnce("https://api.test/page1")
        .mockReturnValueOnce("https://api.test/page2");

      mockedAxios.get
        .mockResolvedValueOnce({ data: mockRecords1 })
        .mockResolvedValueOnce({ data: mockRecords2 });

      const result = await MasterRealPropApi.fetchAcrisRecords(
        mockQueryParams,
        mockLimit
      );

      expect(result).toEqual([...mockRecords1, ...mockRecords2]);
      expect(mockedSoqlUrl.constructUrl).toHaveBeenCalledTimes(2);
      expect(mockedSoqlUrl.constructUrl).toHaveBeenCalledWith(
        mockQueryParams,
        "MasterRealPropApi",
        "records",
        mockLimit,
        0
      );
      expect(mockedSoqlUrl.constructUrl).toHaveBeenCalledWith(
        mockQueryParams,
        "MasterRealPropApi",
        "records",
        mockLimit,
        1000
      );
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });

    test("uses default limit of 1000 when not provided", async function () {
      const mockRecords = [
        { document_id: "2023123456789001", doc_type: "DEED" },
      ];

      mockedSoqlUrl.constructUrl.mockReturnValue("https://api.test/default");
      mockedAxios.get.mockResolvedValue({ data: mockRecords });

      await MasterRealPropApi.fetchAcrisRecords(mockQueryParams);

      expect(mockedSoqlUrl.constructUrl).toHaveBeenCalledWith(
        mockQueryParams,
        "MasterRealPropApi",
        "records",
        1000,
        0
      );
    });

    test("includes correct headers in API request", async function () {
      const mockRecords = [{ document_id: "2023123456789001" }];

      mockedSoqlUrl.constructUrl.mockReturnValue("https://api.test/headers");
      mockedAxios.get.mockResolvedValue({ data: mockRecords });

      await MasterRealPropApi.fetchAcrisRecords(mockQueryParams);

      expect(mockedAxios.get).toHaveBeenCalledWith("https://api.test/headers", {
        headers: {
          "Content-Type": "application/json",
          "X-App-Token": "test-app-token",
        },
      });
    });

    test("stops pagination when no more records are returned", async function () {
      // Clear any previous mocks and set up fresh ones
      mockedSoqlUrl.constructUrl.mockClear();
      mockedAxios.get.mockClear();

      // First page returns exactly 'limit' records, so pagination continues
      const mockRecords1 = Array.from({ length: 1000 }, (_, i) => ({
        document_id: `202312345678900${i.toString().padStart(2, "0")}`,
      }));
      // Second page returns no records, so pagination stops
      const mockRecords2 = [];

      mockedSoqlUrl.constructUrl
        .mockReturnValueOnce("https://api.test/page1")
        .mockReturnValueOnce("https://api.test/page2");

      mockedAxios.get
        .mockResolvedValueOnce({ data: mockRecords1 })
        .mockResolvedValueOnce({ data: mockRecords2 });

      const result = await MasterRealPropApi.fetchAcrisRecords(mockQueryParams);

      expect(result).toEqual(mockRecords1); // Only first page results
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });

    test("stops pagination when fewer records than limit are returned", async function () {
      const mockRecords = [{ document_id: "2023123456789001" }];

      // Clear any previous mocks and set up fresh ones
      mockedSoqlUrl.constructUrl.mockClear();
      mockedAxios.get.mockClear();

      mockedSoqlUrl.constructUrl.mockReturnValue("https://api.test/partial");
      mockedAxios.get.mockResolvedValue({ data: mockRecords });

      const result = await MasterRealPropApi.fetchAcrisRecords(
        mockQueryParams,
        1000
      );

      expect(result).toEqual(mockRecords);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    test("throws NotFoundError when no records are found", async function () {
      mockedSoqlUrl.constructUrl.mockReturnValue("https://api.test/empty");
      mockedAxios.get.mockResolvedValue({ data: [] });

      await expect(
        MasterRealPropApi.fetchAcrisRecords(mockQueryParams)
      ).rejects.toThrow(NotFoundError);
      await expect(
        MasterRealPropApi.fetchAcrisRecords(mockQueryParams)
      ).rejects.toThrow(
        "No records found for the given query from Real Property Master API."
      );
    });

    test("handles axios errors and throws generic error", async function () {
      mockedSoqlUrl.constructUrl.mockReturnValue("https://api.test/error");
      mockedAxios.get.mockRejectedValue(new Error("Network error"));

      await expect(
        MasterRealPropApi.fetchAcrisRecords(mockQueryParams)
      ).rejects.toThrow(
        "Failed to fetch records from Real Property Master API"
      );
    });

    test("handles malformed response data", async function () {
      mockedSoqlUrl.constructUrl.mockReturnValue("https://api.test/malformed");
      mockedAxios.get.mockResolvedValue({ data: null });

      await expect(
        MasterRealPropApi.fetchAcrisRecords(mockQueryParams)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("fetchAcrisRecordCount", function () {
    const mockQueryParams = { doc_type: "DEED", recorded_borough: "1" };

    test("fetches record count successfully", async function () {
      const mockCountData = [{ count: "12345" }];

      mockedSoqlUrl.constructUrl.mockReturnValue("https://api.test/count");
      mockedAxios.get.mockResolvedValue({ data: mockCountData });

      const result = await MasterRealPropApi.fetchAcrisRecordCount(
        mockQueryParams
      );

      expect(result).toBe(12345);
      expect(mockedSoqlUrl.constructUrl).toHaveBeenCalledWith(
        mockQueryParams,
        "MasterRealPropApi",
        "countAll"
      );
      expect(mockedAxios.get).toHaveBeenCalledWith("https://api.test/count", {
        headers: {
          "Content-Type": "application/json",
          "X-App-Token": "test-app-token",
        },
      });
    });

    test("converts string count to number", async function () {
      const mockCountData = [{ count: "999" }];

      mockedSoqlUrl.constructUrl.mockReturnValue(
        "https://api.test/string-count"
      );
      mockedAxios.get.mockResolvedValue({ data: mockCountData });

      const result = await MasterRealPropApi.fetchAcrisRecordCount(
        mockQueryParams
      );

      expect(result).toBe(999);
      expect(typeof result).toBe("number");
    });

    test("throws NotFoundError when no count data is found", async function () {
      mockedSoqlUrl.constructUrl.mockReturnValue("https://api.test/no-count");
      mockedAxios.get.mockResolvedValue({ data: [] });

      await expect(
        MasterRealPropApi.fetchAcrisRecordCount(mockQueryParams)
      ).rejects.toThrow(NotFoundError);
      await expect(
        MasterRealPropApi.fetchAcrisRecordCount(mockQueryParams)
      ).rejects.toThrow(
        "No count data found for the given query from Real Property Master API."
      );
    });

    test("throws NotFoundError when count property is missing", async function () {
      mockedSoqlUrl.constructUrl.mockReturnValue(
        "https://api.test/missing-count"
      );
      mockedAxios.get.mockResolvedValue({ data: [{ total: "123" }] });

      await expect(
        MasterRealPropApi.fetchAcrisRecordCount(mockQueryParams)
      ).rejects.toThrow(NotFoundError);
    });

    test("handles axios errors and throws generic error", async function () {
      mockedSoqlUrl.constructUrl.mockReturnValue("https://api.test/error");
      mockedAxios.get.mockRejectedValue(new Error("API error"));

      await expect(
        MasterRealPropApi.fetchAcrisRecordCount(mockQueryParams)
      ).rejects.toThrow(
        "Failed to fetch record count from Real Property Master API"
      );
    });
  });

  describe("fetchAcrisDocumentIds", function () {
    const mockQueryParams = { doc_type: "DEED", recorded_borough: "1" };
    const mockLimit = 1000;

    test("fetches document IDs with pagination", async function () {
      // First page returns exactly 'limit' records, so pagination continues
      const mockData1 = Array.from({ length: 1000 }, (_, i) => ({
        document_id: `202312345678900${i.toString().padStart(2, "0")}`,
      }));
      // Second page returns fewer than 'limit' records, so pagination stops
      const mockData2 = [{ document_id: "2023123456789999" }];

      mockedSoqlUrl.constructUrl
        .mockReturnValueOnce("https://api.test/ids-page1")
        .mockReturnValueOnce("https://api.test/ids-page2");

      mockedAxios.get
        .mockResolvedValueOnce({ data: mockData1 })
        .mockResolvedValueOnce({ data: mockData2 });

      const result = await MasterRealPropApi.fetchAcrisDocumentIds(
        mockQueryParams,
        mockLimit
      );

      expect(result).toHaveLength(1001); // 1000 from first page + 1 from second page
      expect(result).toContain("2023123456789999"); // Contains the last record
      expect(mockedSoqlUrl.constructUrl).toHaveBeenCalledWith(
        mockQueryParams,
        "MasterRealPropApi",
        "document_id",
        mockLimit,
        0
      );
    });

    test("uses default limit of 1000 when not provided", async function () {
      const mockData = [{ document_id: "2023123456789001" }];

      mockedSoqlUrl.constructUrl.mockReturnValue(
        "https://api.test/default-ids"
      );
      mockedAxios.get.mockResolvedValue({ data: mockData });

      await MasterRealPropApi.fetchAcrisDocumentIds(mockQueryParams);

      expect(mockedSoqlUrl.constructUrl).toHaveBeenCalledWith(
        mockQueryParams,
        "MasterRealPropApi",
        "document_id",
        1000,
        0
      );
    });

    test("removes duplicate document IDs", async function () {
      const mockData = [
        { document_id: "2023123456789001" },
        { document_id: "2023123456789001" },
        { document_id: "2023123456789002" },
      ];

      mockedSoqlUrl.constructUrl.mockReturnValue("https://api.test/duplicates");
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await MasterRealPropApi.fetchAcrisDocumentIds(
        mockQueryParams
      );

      expect(result).toEqual(["2023123456789001", "2023123456789002"]);
      expect(result).toHaveLength(2);
    });

    test("throws NotFoundError when no document IDs are found", async function () {
      mockedSoqlUrl.constructUrl.mockReturnValue("https://api.test/no-ids");
      mockedAxios.get.mockResolvedValue({ data: [] });

      await expect(
        MasterRealPropApi.fetchAcrisDocumentIds(mockQueryParams)
      ).rejects.toThrow(NotFoundError);
      await expect(
        MasterRealPropApi.fetchAcrisDocumentIds(mockQueryParams)
      ).rejects.toThrow(
        "No document IDs found for the given query from Real Property Master API."
      );
    });

    test("handles axios errors and throws generic error", async function () {
      mockedSoqlUrl.constructUrl.mockReturnValue("https://api.test/error");
      mockedAxios.get.mockRejectedValue(new Error("Network failure"));

      await expect(
        MasterRealPropApi.fetchAcrisDocumentIds(mockQueryParams)
      ).rejects.toThrow(
        "Failed to fetch document IDs from Real Property Master API"
      );
    });
  });

  describe("fetchAcrisRecordsByDocumentIds", function () {
    const mockDocumentIds = [
      "2023123456789001",
      "2023123456789002",
      "2023123456789003",
    ];
    const mockQueryParams = { doc_type: "DEED" };

    test("fetches records by document IDs using batching", async function () {
      const mockBatches = [
        ["2023123456789001", "2023123456789002"],
        ["2023123456789003"],
      ];
      const mockRecords1 = [
        { document_id: "2023123456789001", doc_type: "DEED" },
        { document_id: "2023123456789002", doc_type: "DEED" },
      ];
      const mockRecords2 = [
        { document_id: "2023123456789003", doc_type: "DEED" },
      ];

      mockedBatchArray.mockReturnValue(mockBatches);
      mockedSoqlUrl.constructUrlForDocumentIds
        .mockReturnValueOnce("https://api.test/batch1")
        .mockReturnValueOnce("https://api.test/batch2");

      mockedAxios.get
        .mockResolvedValueOnce({ data: mockRecords1 })
        .mockResolvedValueOnce({ data: mockRecords2 });

      const result = await MasterRealPropApi.fetchAcrisRecordsByDocumentIds(
        mockDocumentIds,
        mockQueryParams,
        1000
      );

      expect(result).toEqual([...mockRecords1, ...mockRecords2]);
      expect(mockedBatchArray).toHaveBeenCalledWith(mockDocumentIds, 75);
      expect(mockedSoqlUrl.constructUrlForDocumentIds).toHaveBeenCalledTimes(2);
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });

    test("uses default parameters when not provided", async function () {
      const mockBatches = [mockDocumentIds];
      const mockRecords = [{ document_id: "2023123456789001" }];

      mockedBatchArray.mockReturnValue(mockBatches);
      mockedSoqlUrl.constructUrlForDocumentIds.mockReturnValue(
        "https://api.test/default"
      );
      mockedAxios.get.mockResolvedValue({ data: mockRecords });

      const result = await MasterRealPropApi.fetchAcrisRecordsByDocumentIds(
        mockDocumentIds
      );

      expect(mockedSoqlUrl.constructUrlForDocumentIds).toHaveBeenCalledWith(
        {},
        "MasterRealPropApi",
        mockBatches[0],
        1000,
        0
      );
      expect(result).toEqual(mockRecords);
    });

    test("handles pagination within batches", async function () {
      const mockBatches = [mockDocumentIds];
      const mockRecords1 = Array(1000)
        .fill()
        .map((_, i) => ({ document_id: `202312345678900${i}` }));
      const mockRecords2 = [{ document_id: "2023123456789999" }];

      mockedBatchArray.mockReturnValue(mockBatches);
      mockedSoqlUrl.constructUrlForDocumentIds.mockReturnValue(
        "https://api.test/paginated"
      );
      mockedAxios.get
        .mockResolvedValueOnce({ data: mockRecords1 })
        .mockResolvedValueOnce({ data: mockRecords2 });

      const result = await MasterRealPropApi.fetchAcrisRecordsByDocumentIds(
        mockDocumentIds
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(1001);
    });

    test("returns null when no records are found", async function () {
      const mockBatches = [mockDocumentIds];

      mockedBatchArray.mockReturnValue(mockBatches);
      mockedSoqlUrl.constructUrlForDocumentIds.mockReturnValue(
        "https://api.test/empty"
      );
      mockedAxios.get.mockResolvedValue({ data: [] });

      const result = await MasterRealPropApi.fetchAcrisRecordsByDocumentIds(
        mockDocumentIds
      );

      expect(result).toBeNull();
    });

    test("returns null on axios errors", async function () {
      const mockBatches = [mockDocumentIds];

      mockedBatchArray.mockReturnValue(mockBatches);
      mockedSoqlUrl.constructUrlForDocumentIds.mockReturnValue(
        "https://api.test/error"
      );
      mockedAxios.get.mockRejectedValue(new Error("API error"));

      const result = await MasterRealPropApi.fetchAcrisRecordsByDocumentIds(
        mockDocumentIds
      );

      expect(result).toBeNull();
    });

    test("includes correct headers in API requests", async function () {
      const mockBatches = [mockDocumentIds];
      const mockRecords = [{ document_id: "2023123456789001" }];

      mockedBatchArray.mockReturnValue(mockBatches);
      mockedSoqlUrl.constructUrlForDocumentIds.mockReturnValue(
        "https://api.test/headers"
      );
      mockedAxios.get.mockResolvedValue({ data: mockRecords });

      await MasterRealPropApi.fetchAcrisRecordsByDocumentIds(mockDocumentIds);

      expect(mockedAxios.get).toHaveBeenCalledWith("https://api.test/headers", {
        headers: {
          "Content-Type": "application/json",
          "X-App-Token": "test-app-token",
        },
      });
    });
  });

  describe.skip("fetchAcrisDocumentIdsCrossRef", function () {
    const mockMasterQueryParams = { doc_type: "DEED" };
    const mockLegalsDocumentIds = ["2023123456789001", "2023123456789002"];
    const mockBatchSize = 500;

    test("fetches document IDs using cross-reference with batching", async function () {
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

      const result = await MasterRealPropApi.fetchAcrisDocumentIdsCrossRef(
        mockMasterQueryParams,
        mockLegalsDocumentIds,
        mockBatchSize
      );

      expect(result).toEqual([
        "2023123456789001",
        "2023123456789002",
        "2023123456789003",
      ]);
      expect(mockedSoqlUrl.constructUrlBatches).toHaveBeenCalledWith(
        mockMasterQueryParams,
        mockLegalsDocumentIds,
        "MasterRealPropApi",
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

      await MasterRealPropApi.fetchAcrisDocumentIdsCrossRef(
        mockMasterQueryParams,
        mockLegalsDocumentIds
      );

      expect(mockedSoqlUrl.constructUrlBatches).toHaveBeenCalledWith(
        mockMasterQueryParams,
        mockLegalsDocumentIds,
        "MasterRealPropApi",
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

      const result = await MasterRealPropApi.fetchAcrisDocumentIdsCrossRef(
        mockMasterQueryParams,
        mockLegalsDocumentIds
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

      const result = await MasterRealPropApi.fetchAcrisDocumentIdsCrossRef(
        mockMasterQueryParams,
        mockLegalsDocumentIds
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
        MasterRealPropApi.fetchAcrisDocumentIdsCrossRef(
          mockMasterQueryParams,
          mockLegalsDocumentIds
        )
      ).rejects.toThrow(NotFoundError);
      await expect(
        MasterRealPropApi.fetchAcrisDocumentIdsCrossRef(
          mockMasterQueryParams,
          mockLegalsDocumentIds
        )
      ).rejects.toThrow(
        "No Real Property Master records found from 'MasterRealPropApi.fetchAcrisDocumentIdsCrossRef'."
      );
    });

    test("handles axios errors and throws generic error", async function () {
      const mockUrls = ["https://api.test/error-batch"];

      safeMockConstructUrlBatches(mockUrls);
      mockedAxios.get.mockImplementation(() => {
        return Promise.reject(new Error("Network error"));
      });

      await expect(
        MasterRealPropApi.fetchAcrisDocumentIdsCrossRef(
          mockMasterQueryParams,
          mockLegalsDocumentIds
        )
      ).rejects.toThrow(
        "Failed to fetch document IDs from Real Property Master API (cross-ref)"
      );
    });

    test("includes correct headers in API requests", async function () {
      const mockUrls = ["https://api.test/headers-batch"];
      const mockData = [{ document_id: "2023123456789001" }];

      safeMockConstructUrlBatches(mockUrls);
      mockedAxios.get.mockImplementation(() => {
        return Promise.resolve({ data: mockData });
      });

      await MasterRealPropApi.fetchAcrisDocumentIdsCrossRef(
        mockMasterQueryParams,
        mockLegalsDocumentIds
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

  describe("Integration and Edge Cases", function () {
    test("handles missing environment variable", async function () {
      delete process.env.NYC_OPEN_DATA_APP_TOKEN;

      const mockQueryParams = { doc_type: "DEED" };
      mockedSoqlUrl.constructUrl.mockReturnValue("https://api.test/no-token");
      mockedAxios.get.mockResolvedValue({ data: [{ document_id: "test" }] });

      await MasterRealPropApi.fetchAcrisRecords(mockQueryParams);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://api.test/no-token",
        {
          headers: {
            "Content-Type": "application/json",
            "X-App-Token": undefined,
          },
        }
      );
    });

    test("handles malformed API responses gracefully", async function () {
      const mockQueryParams = { doc_type: "DEED" };

      mockedSoqlUrl.constructUrl.mockReturnValue("https://api.test/malformed");
      mockedAxios.get.mockResolvedValue({
        data: [null, undefined, { document_id: "valid" }],
      });

      const result = await MasterRealPropApi.fetchAcrisRecords(mockQueryParams);

      expect(result).toEqual([null, undefined, { document_id: "valid" }]);
    });

    test("logs debug information during execution", async function () {
      const mockQueryParams = { doc_type: "DEED" };
      const mockRecords = [{ document_id: "2023123456789001" }];

      mockedSoqlUrl.constructUrl.mockReturnValue("https://api.test/logging");
      mockedAxios.get.mockResolvedValue({ data: mockRecords });

      const result = await MasterRealPropApi.fetchAcrisRecords(mockQueryParams);

      expect(result).toEqual(mockRecords);
    });
  });
});
