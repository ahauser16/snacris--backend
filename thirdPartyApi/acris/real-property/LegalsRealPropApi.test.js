"use strict";

const LegalsRealPropApi = require("./LegalsRealPropApi");
const axios = require("axios");
const SoqlUrl = require("../utils/SoqlUrl");
const batchArray = require("../utils/CreateUrlBatchesArray");
const { NotFoundError } = require("../../../expressError");

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

describe("LegalsRealPropApi", () => {
  let mockAxios;
  let mockSoqlUrl;
  let mockBatchArray;
  let consoleWarnSpy;
  let consoleErrorSpy;
  let consoleLogSpy;

  beforeEach(() => {
    mockAxios = axios;
    mockSoqlUrl = SoqlUrl;
    mockBatchArray = batchArray;

    // Setup console spies
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    // Set up environment variable
    process.env.NYC_OPEN_DATA_APP_TOKEN = "test-token";

    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
    delete process.env.NYC_OPEN_DATA_APP_TOKEN;
  });

  describe("fetchAcrisRecords", () => {
    const mockLegalsQueryParams = { borough: "1", block: "123" };
    const mockRecords = [
      {
        document_id: "2023123456789001",
        record_type: "L",
        borough: "1",
        block: "123",
        lot: "45",
        street_name: "BROADWAY",
      },
      {
        document_id: "2023123456789002",
        record_type: "L",
        borough: "1",
        block: "123",
        lot: "46",
        street_name: "BROADWAY",
      },
    ];

    it("should fetch records successfully", async () => {
      const mockUrl =
        "https://data.cityofnewyork.us/resource/8h5j-fqxa.json?borough=1&block=123";

      mockSoqlUrl.constructUrl.mockReturnValue(mockUrl);
      mockAxios.get.mockResolvedValue({ data: mockRecords });

      const result = await LegalsRealPropApi.fetchAcrisRecords(
        mockLegalsQueryParams
      );

      expect(mockSoqlUrl.constructUrl).toHaveBeenCalledWith(
        mockLegalsQueryParams,
        "LegalsRealPropApi",
        "records"
      );
      expect(mockAxios.get).toHaveBeenCalledWith(mockUrl, {
        headers: {
          "Content-Type": "application/json",
          "X-App-Token": "test-token",
        },
      });
      expect(result).toEqual(mockRecords);
    });

    it("should throw NotFoundError when no records are found", async () => {
      const mockUrl =
        "https://data.cityofnewyork.us/resource/8h5j-fqxa.json?borough=1&block=123";

      mockSoqlUrl.constructUrl.mockReturnValue(mockUrl);
      mockAxios.get.mockResolvedValue({ data: [] });

      await expect(
        LegalsRealPropApi.fetchAcrisRecords(mockLegalsQueryParams)
      ).rejects.toThrow(NotFoundError);
      await expect(
        LegalsRealPropApi.fetchAcrisRecords(mockLegalsQueryParams)
      ).rejects.toThrow(
        "No records found for the given query from Real Property Legals API."
      );

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        `No records found for query: ${JSON.stringify(
          mockLegalsQueryParams
        )} from Real Property Legals API`
      );
    });

    it("should throw NotFoundError when data is null or undefined", async () => {
      const mockUrl =
        "https://data.cityofnewyork.us/resource/8h5j-fqxa.json?borough=1&block=123";

      mockSoqlUrl.constructUrl.mockReturnValue(mockUrl);
      mockAxios.get.mockResolvedValue({ data: null });

      await expect(
        LegalsRealPropApi.fetchAcrisRecords(mockLegalsQueryParams)
      ).rejects.toThrow(NotFoundError);
    });

    it("should handle axios errors and throw generic Error", async () => {
      const mockUrl =
        "https://data.cityofnewyork.us/resource/8h5j-fqxa.json?borough=1&block=123";
      const axiosError = new Error("Network error");

      mockSoqlUrl.constructUrl.mockReturnValue(mockUrl);
      mockAxios.get.mockRejectedValue(axiosError);

      await expect(
        LegalsRealPropApi.fetchAcrisRecords(mockLegalsQueryParams)
      ).rejects.toThrow(
        "Failed to fetch records from Real Property Legals API"
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching records from Real Property Legals API:",
        "Network error"
      );
    });

    it("should use correct headers with environment token", async () => {
      const mockUrl =
        "https://data.cityofnewyork.us/resource/8h5j-fqxa.json?borough=1&block=123";

      mockSoqlUrl.constructUrl.mockReturnValue(mockUrl);
      mockAxios.get.mockResolvedValue({ data: mockRecords });

      await LegalsRealPropApi.fetchAcrisRecords(mockLegalsQueryParams);

      expect(mockAxios.get).toHaveBeenCalledWith(mockUrl, {
        headers: {
          "Content-Type": "application/json",
          "X-App-Token": "test-token",
        },
      });
    });
  });

  describe("fetchAcrisRecordCount", () => {
    const mockLegalsQueryParams = { borough: "1", block: "123" };

    it("should fetch record count successfully", async () => {
      const mockUrl =
        "https://data.cityofnewyork.us/resource/8h5j-fqxa.json?$select=count(*)&borough=1&block=123";
      const mockCountData = [{ count: "25" }];

      mockSoqlUrl.constructUrl.mockReturnValue(mockUrl);
      mockAxios.get.mockResolvedValue({ data: mockCountData });

      const result = await LegalsRealPropApi.fetchAcrisRecordCount(
        mockLegalsQueryParams
      );

      expect(mockSoqlUrl.constructUrl).toHaveBeenCalledWith(
        mockLegalsQueryParams,
        "LegalsRealPropApi",
        "countAll"
      );
      expect(mockAxios.get).toHaveBeenCalledWith(mockUrl, {
        headers: {
          "Content-Type": "application/json",
          "X-App-Token": "test-token",
        },
      });
      expect(result).toBe(25);
    });

    it("should return number when count is provided as string", async () => {
      const mockUrl =
        "https://data.cityofnewyork.us/resource/8h5j-fqxa.json?$select=count(*)&borough=1&block=123";
      const mockCountData = [{ count: "100" }];

      mockSoqlUrl.constructUrl.mockReturnValue(mockUrl);
      mockAxios.get.mockResolvedValue({ data: mockCountData });

      const result = await LegalsRealPropApi.fetchAcrisRecordCount(
        mockLegalsQueryParams
      );

      expect(result).toBe(100);
      expect(typeof result).toBe("number");
    });

    it("should throw NotFoundError when no count data is found", async () => {
      const mockUrl =
        "https://data.cityofnewyork.us/resource/8h5j-fqxa.json?$select=count(*)&borough=1&block=123";

      mockSoqlUrl.constructUrl.mockReturnValue(mockUrl);
      mockAxios.get.mockResolvedValue({ data: [] });

      await expect(
        LegalsRealPropApi.fetchAcrisRecordCount(mockLegalsQueryParams)
      ).rejects.toThrow(NotFoundError);
      await expect(
        LegalsRealPropApi.fetchAcrisRecordCount(mockLegalsQueryParams)
      ).rejects.toThrow(
        "No count data found for the given query from Real Property Legals API."
      );

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        `No count data found for query: ${JSON.stringify(
          mockLegalsQueryParams
        )} from Real Property Legals API`
      );
    });

    it("should throw NotFoundError when count property is missing", async () => {
      const mockUrl =
        "https://data.cityofnewyork.us/resource/8h5j-fqxa.json?$select=count(*)&borough=1&block=123";
      const mockCountData = [{}];

      mockSoqlUrl.constructUrl.mockReturnValue(mockUrl);
      mockAxios.get.mockResolvedValue({ data: mockCountData });

      await expect(
        LegalsRealPropApi.fetchAcrisRecordCount(mockLegalsQueryParams)
      ).rejects.toThrow(NotFoundError);
    });

    it("should handle axios errors and throw generic Error", async () => {
      const mockUrl =
        "https://data.cityofnewyork.us/resource/8h5j-fqxa.json?$select=count(*)&borough=1&block=123";
      const axiosError = new Error("Network timeout");

      mockSoqlUrl.constructUrl.mockReturnValue(mockUrl);
      mockAxios.get.mockRejectedValue(axiosError);

      await expect(
        LegalsRealPropApi.fetchAcrisRecordCount(mockLegalsQueryParams)
      ).rejects.toThrow(
        "Failed to fetch record count from Real Property Legals API"
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching record count from Real Property Legals API:",
        "Network timeout"
      );
    });
  });

  describe("fetchAcrisDocumentIds", () => {
    const mockLegalsQueryParams = { borough: "1", block: "123" };
    const mockDocumentIdData = [
      { document_id: "2023123456789001" },
      { document_id: "2023123456789002" },
      { document_id: "2023123456789003" },
    ];

    it("should fetch document IDs successfully", async () => {
      const mockUrl =
        "https://data.cityofnewyork.us/resource/8h5j-fqxa.json?$select=document_id&borough=1&block=123";

      mockSoqlUrl.constructUrl.mockReturnValue(mockUrl);
      mockAxios.get.mockResolvedValue({ data: mockDocumentIdData });

      const result = await LegalsRealPropApi.fetchAcrisDocumentIds(
        mockLegalsQueryParams
      );

      expect(mockSoqlUrl.constructUrl).toHaveBeenCalledWith(
        mockLegalsQueryParams,
        "LegalsRealPropApi",
        "document_id"
      );
      expect(mockAxios.get).toHaveBeenCalledWith(mockUrl, {
        headers: {
          "Content-Type": "application/json",
          "X-App-Token": "test-token",
        },
      });
      expect(result).toEqual([
        "2023123456789001",
        "2023123456789002",
        "2023123456789003",
      ]);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        mockUrl,
        "LegalsRealPropApi.fetchAcrisDocumentIds url"
      );
    });

    it("should extract document_id values from response objects", async () => {
      const mockUrl =
        "https://data.cityofnewyork.us/resource/8h5j-fqxa.json?$select=document_id&borough=1&block=123";

      mockSoqlUrl.constructUrl.mockReturnValue(mockUrl);
      mockAxios.get.mockResolvedValue({ data: mockDocumentIdData });

      const result = await LegalsRealPropApi.fetchAcrisDocumentIds(
        mockLegalsQueryParams
      );

      expect(result).toHaveLength(3);
      expect(result.every((id) => typeof id === "string")).toBe(true);
    });

    it("should throw NotFoundError when no document IDs are found", async () => {
      const mockUrl =
        "https://data.cityofnewyork.us/resource/8h5j-fqxa.json?$select=document_id&borough=1&block=123";

      mockSoqlUrl.constructUrl.mockReturnValue(mockUrl);
      mockAxios.get.mockResolvedValue({ data: [] });

      await expect(
        LegalsRealPropApi.fetchAcrisDocumentIds(mockLegalsQueryParams)
      ).rejects.toThrow(NotFoundError);
      await expect(
        LegalsRealPropApi.fetchAcrisDocumentIds(mockLegalsQueryParams)
      ).rejects.toThrow(
        "No document IDs found for the given query from Real Property Legals API."
      );

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        `No document IDs found for query: ${JSON.stringify(
          mockLegalsQueryParams
        )} from Real Property Legals API`
      );
    });

    it("should throw NotFoundError when data is null", async () => {
      const mockUrl =
        "https://data.cityofnewyork.us/resource/8h5j-fqxa.json?$select=document_id&borough=1&block=123";

      mockSoqlUrl.constructUrl.mockReturnValue(mockUrl);
      mockAxios.get.mockResolvedValue({ data: null });

      await expect(
        LegalsRealPropApi.fetchAcrisDocumentIds(mockLegalsQueryParams)
      ).rejects.toThrow(NotFoundError);
    });

    it("should handle axios errors and throw generic Error", async () => {
      const mockUrl =
        "https://data.cityofnewyork.us/resource/8h5j-fqxa.json?$select=document_id&borough=1&block=123";
      const axiosError = new Error("API rate limit exceeded");

      mockSoqlUrl.constructUrl.mockReturnValue(mockUrl);
      mockAxios.get.mockRejectedValue(axiosError);

      await expect(
        LegalsRealPropApi.fetchAcrisDocumentIds(mockLegalsQueryParams)
      ).rejects.toThrow(
        "Failed to fetch document IDs from Real Property Legals API"
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching document IDs from Real Property Legals API:",
        "API rate limit exceeded"
      );
    });
  });

  describe.skip("fetchAcrisDocumentIdsCrossRef", () => {
    const mockLegalsQueryParams = { borough: "1" };
    const mockPartyDocumentIds = [
      "2023123456789001",
      "2023123456789002",
      "2023123456789003",
    ];

    it("should fetch cross-referenced document IDs successfully", async () => {
      // Limit to 1 URL to prevent memory issues and infinite loops
      const mockBatchUrls = [
        "https://data.cityofnewyork.us/resource/8h5j-fqxa.json?$select=document_id&borough=1&document_id IN ('2023123456789001','2023123456789002','2023123456789003')",
      ];
      const mockResponseData = [
        { document_id: "2023123456789001" },
        { document_id: "2023123456789002" },
      ];

      // Don't override the module-level mock, just set up axios
      mockAxios.get.mockImplementation(() => {
        return Promise.resolve({ data: mockResponseData });
      });

      const result = await LegalsRealPropApi.fetchAcrisDocumentIdsCrossRef(
        mockLegalsQueryParams,
        mockPartyDocumentIds,
        500
      );

      expect(mockSoqlUrl.constructUrlBatches).toHaveBeenCalledWith(
        mockLegalsQueryParams,
        mockPartyDocumentIds,
        "LegalsRealPropApi",
        500
      );
      expect(mockAxios.get).toHaveBeenCalledWith(
        `${mockBatchUrls[0]}&$limit=1000&$offset=0`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-App-Token": "test-token",
          },
        }
      );
      expect(result).toEqual(["2023123456789001", "2023123456789002"]);
    });

    it("should handle object inputs and extract document_id values", async () => {
      const mockPartyObjectIds = [
        { document_id: "2023123456789001", name: "John Doe" },
        { document_id: "2023123456789002", name: "Jane Smith" },
        "2023123456789003", // Mixed array with string
      ];
      // Limit to 1 URL to prevent memory issues
      const mockBatchUrls = ["https://example.com/batch1"];
      const mockResponseData = [{ document_id: "2023123456789001" }];

      safeMockConstructUrlBatches(mockBatchUrls);
      mockAxios.get.mockImplementation(() => {
        return Promise.resolve({ data: mockResponseData });
      });

      const result = await LegalsRealPropApi.fetchAcrisDocumentIdsCrossRef(
        mockLegalsQueryParams,
        mockPartyObjectIds
      );

      expect(mockSoqlUrl.constructUrlBatches).toHaveBeenCalledWith(
        mockLegalsQueryParams,
        ["2023123456789001", "2023123456789002", "2023123456789003"],
        "LegalsRealPropApi",
        500
      );
      expect(result).toEqual(["2023123456789001"]);
    });

    it("should handle pagination with multiple pages", async () => {
      // Limit to 1 URL to prevent memory issues
      const mockBatchUrls = ["https://example.com/batch1"];
      const firstPageData = Array.from({ length: 1000 }, (_, i) => ({
        document_id: `202312345678900${i.toString().padStart(2, "0")}`,
      }));
      const secondPageData = [{ document_id: "2023123456789999" }];

      safeMockConstructUrlBatches(mockBatchUrls);

      // Mock axios to handle pagination correctly - first call returns 1000 records, second call returns fewer to stop pagination
      let callCount = 0;
      mockAxios.get.mockImplementation((url) => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({ data: firstPageData });
        } else {
          return Promise.resolve({ data: secondPageData });
        }
      });

      const result = await LegalsRealPropApi.fetchAcrisDocumentIdsCrossRef(
        mockLegalsQueryParams,
        mockPartyDocumentIds
      );

      expect(mockAxios.get).toHaveBeenCalledTimes(2);
      expect(mockAxios.get).toHaveBeenNthCalledWith(
        1,
        `${mockBatchUrls[0]}&$limit=1000&$offset=0`,
        expect.any(Object)
      );
      expect(mockAxios.get).toHaveBeenNthCalledWith(
        2,
        `${mockBatchUrls[0]}&$limit=1000&$offset=1000`,
        expect.any(Object)
      );
      expect(result).toHaveLength(1001); // 1000 from first page + 1 from second page
    });

    it("should deduplicate document IDs using Set", async () => {
      // Limit to 1 URL to prevent memory issues
      const mockBatchUrls = ["https://example.com/batch1"];
      const mockResponseDataWithDuplicates = [
        { document_id: "2023123456789001" },
        { document_id: "2023123456789002" },
        { document_id: "2023123456789001" }, // Duplicate
        { document_id: "2023123456789002" }, // Duplicate
      ];

      safeMockConstructUrlBatches(mockBatchUrls);
      mockAxios.get.mockImplementation(() => {
        return Promise.resolve({ data: mockResponseDataWithDuplicates });
      });

      const result = await LegalsRealPropApi.fetchAcrisDocumentIdsCrossRef(
        mockLegalsQueryParams,
        mockPartyDocumentIds
      );

      expect(result).toEqual(["2023123456789001", "2023123456789002"]);
      expect(result).toHaveLength(2); // Duplicates removed
    });

    it("should process multiple batch URLs", async () => {
      // Limit to 2 URLs maximum to prevent memory issues
      const mockBatchUrls = [
        "https://example.com/batch1",
        "https://example.com/batch2",
      ];
      const batch1Data = [{ document_id: "2023123456789001" }];
      const batch2Data = [{ document_id: "2023123456789002" }];

      safeMockConstructUrlBatches(mockBatchUrls);
      mockAxios.get.mockImplementation((url) => {
        if (url.includes("batch1")) {
          return Promise.resolve({ data: batch1Data });
        } else if (url.includes("batch2")) {
          return Promise.resolve({ data: batch2Data });
        }
        return Promise.resolve({ data: [] }); // Stop pagination
      });

      const result = await LegalsRealPropApi.fetchAcrisDocumentIdsCrossRef(
        mockLegalsQueryParams,
        mockPartyDocumentIds
      );

      expect(mockAxios.get).toHaveBeenCalledTimes(2);
      expect(result).toEqual(["2023123456789001", "2023123456789002"]);
    });

    it("should throw NotFoundError when no matching records are found", async () => {
      // Limit to 1 URL to prevent memory issues
      const mockBatchUrls = ["https://example.com/batch1"];

      safeMockConstructUrlBatches(mockBatchUrls);
      mockAxios.get.mockImplementation(() => {
        return Promise.resolve({ data: [] });
      });

      await expect(
        LegalsRealPropApi.fetchAcrisDocumentIdsCrossRef(
          mockLegalsQueryParams,
          mockPartyDocumentIds
        )
      ).rejects.toThrow(NotFoundError);
      await expect(
        LegalsRealPropApi.fetchAcrisDocumentIdsCrossRef(
          mockLegalsQueryParams,
          mockPartyDocumentIds
        )
      ).rejects.toThrow(
        "No Real Property Legals records found for the given query."
      );
    });

    it("should handle axios errors and throw generic Error", async () => {
      // Limit to 1 URL to prevent memory issues
      const mockBatchUrls = ["https://example.com/batch1"];
      const axiosError = new Error("Server error");

      safeMockConstructUrlBatches(mockBatchUrls);
      mockAxios.get.mockImplementation(() => {
        return Promise.reject(axiosError);
      });

      await expect(
        LegalsRealPropApi.fetchAcrisDocumentIdsCrossRef(
          mockLegalsQueryParams,
          mockPartyDocumentIds
        )
      ).rejects.toThrow(
        "Failed to fetch document IDs from Real Property Legals API"
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching document IDs from Real Property Legals API:",
        "Server error"
      );
    });

    it("should use default batch size when not provided", async () => {
      // Limit to 1 URL to prevent memory issues
      const mockBatchUrls = ["https://example.com/batch1"];
      const mockResponseData = [{ document_id: "2023123456789001" }];

      safeMockConstructUrlBatches(mockBatchUrls);
      mockAxios.get.mockImplementation(() => {
        return Promise.resolve({ data: mockResponseData });
      });

      await LegalsRealPropApi.fetchAcrisDocumentIdsCrossRef(
        mockLegalsQueryParams,
        mockPartyDocumentIds
        // No batch size provided - should default to 500
      );

      expect(mockSoqlUrl.constructUrlBatches).toHaveBeenCalledWith(
        mockLegalsQueryParams,
        mockPartyDocumentIds,
        "LegalsRealPropApi",
        500
      );
    });
  });

  describe("fetchAcrisRecordsByDocumentIds", () => {
    const mockDocumentIds = [
      "2023123456789001",
      "2023123456789002",
      "2023123456789003",
    ];
    const mockQueryParams = { borough: "1" };

    it("should fetch records by document IDs successfully", async () => {
      const mockBatches = [
        ["2023123456789001", "2023123456789002", "2023123456789003"],
      ];
      const mockUrl = "https://data.cityofnewyork.us/resource/8h5j-fqxa.json";
      const mockRecords = [
        {
          document_id: "2023123456789001",
          borough: "1",
          block: "123",
          lot: "45",
        },
        {
          document_id: "2023123456789002",
          borough: "1",
          block: "123",
          lot: "46",
        },
      ];

      mockBatchArray.mockReturnValue(mockBatches);
      mockSoqlUrl.constructUrlForDocumentIds.mockReturnValue(mockUrl);
      mockAxios.get.mockResolvedValue({ data: mockRecords });

      const result = await LegalsRealPropApi.fetchAcrisRecordsByDocumentIds(
        mockDocumentIds,
        mockQueryParams,
        1000
      );

      expect(mockBatchArray).toHaveBeenCalledWith(mockDocumentIds, 75);
      expect(mockSoqlUrl.constructUrlForDocumentIds).toHaveBeenCalledWith(
        mockQueryParams,
        "LegalsRealPropApi",
        mockBatches[0],
        1000,
        0
      );
      expect(mockAxios.get).toHaveBeenCalledWith(mockUrl, {
        headers: {
          "Content-Type": "application/json",
          "X-App-Token": "test-token",
        },
      });
      expect(result).toEqual(mockRecords);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        mockUrl,
        "LegalsRealPropApi.fetchAcrisRecordsByDocumentIds url"
      );
    });

    it("should handle multiple batches", async () => {
      const mockBatches = [["2023123456789001"], ["2023123456789002"]];
      const mockUrl1 = "https://example.com/batch1";
      const mockUrl2 = "https://example.com/batch2";
      const mockRecords1 = [{ document_id: "2023123456789001", borough: "1" }];
      const mockRecords2 = [{ document_id: "2023123456789002", borough: "1" }];

      mockBatchArray.mockReturnValue(mockBatches);
      mockSoqlUrl.constructUrlForDocumentIds
        .mockReturnValueOnce(mockUrl1)
        .mockReturnValueOnce(mockUrl2);
      mockAxios.get
        .mockResolvedValueOnce({ data: mockRecords1 })
        .mockResolvedValueOnce({ data: mockRecords2 });

      const result = await LegalsRealPropApi.fetchAcrisRecordsByDocumentIds(
        mockDocumentIds,
        mockQueryParams
      );

      expect(mockAxios.get).toHaveBeenCalledTimes(2);
      expect(result).toEqual([...mockRecords1, ...mockRecords2]);
    });

    it("should handle pagination within batches", async () => {
      const mockBatches = [["2023123456789001"]];
      const mockUrl = "https://example.com/batch1";
      const firstPageRecords = Array.from({ length: 1000 }, (_, i) => ({
        document_id: "2023123456789001",
        sequence: i,
      }));
      const secondPageRecords = [
        { document_id: "2023123456789001", sequence: 1000 },
      ];

      mockBatchArray.mockReturnValue(mockBatches);
      mockSoqlUrl.constructUrlForDocumentIds
        .mockReturnValueOnce(mockUrl)
        .mockReturnValueOnce(mockUrl);
      mockAxios.get
        .mockResolvedValueOnce({ data: firstPageRecords })
        .mockResolvedValueOnce({ data: secondPageRecords });

      const result = await LegalsRealPropApi.fetchAcrisRecordsByDocumentIds(
        mockDocumentIds,
        mockQueryParams,
        1000
      );

      expect(mockSoqlUrl.constructUrlForDocumentIds).toHaveBeenCalledTimes(2);
      expect(mockSoqlUrl.constructUrlForDocumentIds).toHaveBeenNthCalledWith(
        1,
        mockQueryParams,
        "LegalsRealPropApi",
        mockBatches[0],
        1000,
        0
      );
      expect(mockSoqlUrl.constructUrlForDocumentIds).toHaveBeenNthCalledWith(
        2,
        mockQueryParams,
        "LegalsRealPropApi",
        mockBatches[0],
        1000,
        1000
      );
      expect(result).toHaveLength(1001);
    });

    it("should return null when no records are found", async () => {
      const mockBatches = [["2023123456789001"]];
      const mockUrl = "https://example.com/batch1";

      mockBatchArray.mockReturnValue(mockBatches);
      mockSoqlUrl.constructUrlForDocumentIds.mockReturnValue(mockUrl);
      mockAxios.get.mockResolvedValue({ data: [] });

      const result = await LegalsRealPropApi.fetchAcrisRecordsByDocumentIds(
        mockDocumentIds,
        mockQueryParams
      );

      expect(result).toBeNull();
    });

    it("should use default parameters when not provided", async () => {
      const mockBatches = [["2023123456789001"]];
      const mockUrl = "https://example.com/batch1";
      const mockRecords = [{ document_id: "2023123456789001" }];

      mockBatchArray.mockReturnValue(mockBatches);
      mockSoqlUrl.constructUrlForDocumentIds.mockReturnValue(mockUrl);
      mockAxios.get.mockResolvedValue({ data: mockRecords });

      const result = await LegalsRealPropApi.fetchAcrisRecordsByDocumentIds(
        mockDocumentIds
      );

      expect(mockSoqlUrl.constructUrlForDocumentIds).toHaveBeenCalledWith(
        {}, // Default queryParams
        "LegalsRealPropApi",
        mockBatches[0],
        1000, // Default limit
        0
      );
      expect(result).toEqual(mockRecords);
    });

    it("should handle axios errors and return null", async () => {
      const mockBatches = [["2023123456789001"]];
      const mockUrl = "https://example.com/batch1";
      const axiosError = new Error("Connection timeout");

      mockBatchArray.mockReturnValue(mockBatches);
      mockSoqlUrl.constructUrlForDocumentIds.mockReturnValue(mockUrl);
      mockAxios.get.mockRejectedValue(axiosError);

      const result = await LegalsRealPropApi.fetchAcrisRecordsByDocumentIds(
        mockDocumentIds,
        mockQueryParams
      );

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching records by document IDs:",
        "Connection timeout"
      );
    });

    it("should use correct batch size constant", async () => {
      const mockBatches = [["2023123456789001"]];
      const mockUrl = "https://example.com/batch1";
      const mockRecords = [{ document_id: "2023123456789001" }];

      mockBatchArray.mockReturnValue(mockBatches);
      mockSoqlUrl.constructUrlForDocumentIds.mockReturnValue(mockUrl);
      mockAxios.get.mockResolvedValue({ data: mockRecords });

      await LegalsRealPropApi.fetchAcrisRecordsByDocumentIds(mockDocumentIds);

      expect(mockBatchArray).toHaveBeenCalledWith(mockDocumentIds, 75);
    });
  });

  describe("Environment variable handling", () => {
    it("should work with missing environment variable", async () => {
      delete process.env.NYC_OPEN_DATA_APP_TOKEN;

      const mockUrl = "https://example.com/api";
      mockSoqlUrl.constructUrl.mockReturnValue(mockUrl);
      mockAxios.get.mockResolvedValue({ data: [{ document_id: "test" }] });

      await LegalsRealPropApi.fetchAcrisRecords({ borough: "1" });

      expect(mockAxios.get).toHaveBeenCalledWith(mockUrl, {
        headers: {
          "Content-Type": "application/json",
          "X-App-Token": undefined,
        },
      });
    });
  });

  describe("Error edge cases", () => {
    it("should handle malformed response data gracefully", async () => {
      const mockUrl = "https://example.com/api";
      mockSoqlUrl.constructUrl.mockReturnValue(mockUrl);
      mockAxios.get.mockResolvedValue({ data: [{ malformed: "data" }] });

      const result = await LegalsRealPropApi.fetchAcrisDocumentIds({
        borough: "1",
      });

      expect(result).toEqual([undefined]); // document_id is undefined but mapped
    });

    it("should handle non-array response data", async () => {
      const mockUrl = "https://example.com/api";
      mockSoqlUrl.constructUrl.mockReturnValue(mockUrl);
      mockAxios.get.mockResolvedValue({ data: "not an array" });

      await expect(
        LegalsRealPropApi.fetchAcrisRecords({ borough: "1" })
      ).rejects.toThrow(NotFoundError);
    });
  });
});
