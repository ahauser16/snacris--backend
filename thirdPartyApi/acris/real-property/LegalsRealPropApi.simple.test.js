// Minimal test to check if our mocks work
const LegalsRealPropApi = require("./LegalsRealPropApi");
const axios = require("axios");
const SoqlUrl = require("../utils/SoqlUrl");

// Mock dependencies
jest.mock("axios");
jest.mock("../utils/SoqlUrl");

describe("LegalsRealPropApi - Simple Test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NYC_OPEN_DATA_APP_TOKEN = "test-token";
  });

  afterEach(() => {
    delete process.env.NYC_OPEN_DATA_APP_TOKEN;
  });

  it("should run a simple test without memory issues", async () => {
    // Mock the SoqlUrl.constructUrl method only (not constructUrlBatches)
    SoqlUrl.constructUrl.mockReturnValue("https://api.test/simple");
    axios.get.mockResolvedValue({
      data: [{ document_id: "test123", borough: "1" }],
    });

    const result = await LegalsRealPropApi.fetchAcrisRecords({ borough: "1" });

    expect(result).toEqual([{ document_id: "test123", borough: "1" }]);
    expect(axios.get).toHaveBeenCalledTimes(1);
  });
});
