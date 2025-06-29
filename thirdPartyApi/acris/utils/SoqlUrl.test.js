"use strict";

const SoqlUrl = require("./SoqlUrl");
const API_ENDPOINTS = require("../../apiEndpoints");

describe("SoqlUrl", function () {
  describe("escapeSoqlString", function () {
    test("escapes single quotes correctly", function () {
      expect(SoqlUrl.escapeSoqlString("O'Brien")).toBe("O''Brien");
      expect(SoqlUrl.escapeSoqlString("Don't")).toBe("Don''t");
      expect(SoqlUrl.escapeSoqlString("It's a test")).toBe("It''s a test");
    });

    test("handles values without quotes", function () {
      expect(SoqlUrl.escapeSoqlString("Simple text")).toBe("Simple text");
      expect(SoqlUrl.escapeSoqlString("123456")).toBe("123456");
      expect(SoqlUrl.escapeSoqlString("TEST")).toBe("TEST");
    });

    test("handles null and undefined values", function () {
      expect(SoqlUrl.escapeSoqlString(null)).toBe("");
      expect(SoqlUrl.escapeSoqlString(undefined)).toBe("");
    });

    test("converts non-string values to strings", function () {
      expect(SoqlUrl.escapeSoqlString(123)).toBe("123");
      expect(SoqlUrl.escapeSoqlString(true)).toBe("true");
      expect(SoqlUrl.escapeSoqlString(false)).toBe("false");
    });

    test("handles multiple single quotes", function () {
      expect(SoqlUrl.escapeSoqlString("''")).toBe("''''");
      expect(SoqlUrl.escapeSoqlString("'''")).toBe("''''''");
    });
  });

  describe("constructUrl", function () {
    test("constructs basic URL for MasterRealPropApi", function () {
      const queryParams = { document_id: "2023123456789" };
      const url = SoqlUrl.constructUrl(
        queryParams,
        "MasterRealPropApi",
        "records"
      );

      expect(url).toContain(API_ENDPOINTS.realPropertyMaster);
      expect(url).toContain("document_id%3D'2023123456789'");
    });

    test("constructs URL with select option", function () {
      const queryParams = { document_id: "123" };
      const url = SoqlUrl.constructUrl(
        queryParams,
        "MasterRealPropApi",
        "document_id"
      );

      expect(url).toContain("$select=document_id");
    });

    test("constructs URL with count option", function () {
      const queryParams = { doc_type: "DEED" };
      const url = SoqlUrl.constructUrl(
        queryParams,
        "MasterRealPropApi",
        "countAll"
      );

      expect(url).toContain("$select=count(*)");
    });

    test("constructs URL with limit and offset", function () {
      const queryParams = { doc_type: "DEED" };
      const url = SoqlUrl.constructUrl(
        queryParams,
        "MasterRealPropApi",
        "records",
        1000,
        500
      );

      expect(url).toContain("$limit=1000");
      expect(url).toContain("$offset=500");
    });

    test("constructs URL with array select option", function () {
      const queryParams = { document_id: "123" };
      const url = SoqlUrl.constructUrl(queryParams, "MasterRealPropApi", [
        "document_id",
        "doc_type",
      ]);

      expect(url).toContain("$select=document_id,doc_type");
    });

    test("throws error for invalid queryParams", function () {
      expect(() => {
        SoqlUrl.constructUrl(null, "MasterRealPropApi");
      }).toThrow(
        "'constructUrl' received invalid 'queryParams' parameter: Expected an object."
      );

      expect(() => {
        SoqlUrl.constructUrl("invalid", "MasterRealPropApi");
      }).toThrow(
        "'constructUrl' received invalid 'queryParams' parameter: Expected an object."
      );
    });

    test("throws error for invalid apiCaller", function () {
      expect(() => {
        SoqlUrl.constructUrl({}, null);
      }).toThrow(
        "'constructUrl' received invalid 'apiCaller' parameter: Expected a non-empty string."
      );

      expect(() => {
        SoqlUrl.constructUrl({}, "");
      }).toThrow(
        "'constructUrl' received invalid 'apiCaller' parameter: Expected a non-empty string."
      );
    });

    test("throws error for unknown apiCaller", function () {
      expect(() => {
        SoqlUrl.constructUrl({}, "UnknownApi");
      }).toThrow(
        "'setApiEndpointConfig' received unknown 'apiCaller' parameter: UnknownApi"
      );
    });

    test("handles complex query parameters", function () {
      const queryParams = {
        document_id: "123",
        doc_type: "DEED",
        recorded_borough: "1",
        document_date_start: "2023-01-01",
        document_date_end: "2023-12-31",
      };
      const url = SoqlUrl.constructUrl(
        queryParams,
        "MasterRealPropApi",
        "records"
      );

      expect(url).toContain("document_id%3D'123'");
      expect(url).toContain("doc_type%20IN%20('DEED')");
      expect(url).toContain("recorded_borough%3D'1'");
      expect(url).toContain("document_date%20between");
    });
  });

  describe("constructUrlForDocumentIds", function () {
    test("constructs URL with single document ID", function () {
      const queryParams = {};
      const documentIds = ["2023123456789"];
      const url = SoqlUrl.constructUrlForDocumentIds(
        queryParams,
        "MasterRealPropApi",
        documentIds
      );

      expect(url).toContain("document_id%20IN%20(");
      expect(url).toContain("2023123456789");
    });

    test("constructs URL with multiple document IDs", function () {
      const queryParams = {};
      const documentIds = ["123", "456", "789"];
      const url = SoqlUrl.constructUrlForDocumentIds(
        queryParams,
        "MasterRealPropApi",
        documentIds
      );

      expect(url).toContain("document_id%20IN%20(");
      expect(url).toContain("123");
      expect(url).toContain("456");
      expect(url).toContain("789");
    });

    test("combines additional query params with document IDs", function () {
      const queryParams = { doc_type: "DEED" };
      const documentIds = ["123", "456"];
      const url = SoqlUrl.constructUrlForDocumentIds(
        queryParams,
        "MasterRealPropApi",
        documentIds
      );

      expect(url).toContain("doc_type%20IN%20('DEED')");
      expect(url).toContain("document_id%20IN%20(");
    });

    test("handles document IDs with quotes", function () {
      const queryParams = {};
      const documentIds = ["123'456", "789"];
      const url = SoqlUrl.constructUrlForDocumentIds(
        queryParams,
        "MasterRealPropApi",
        documentIds
      );

      expect(url).toContain("123''456");
    });

    test("throws error for empty document IDs array", function () {
      expect(() => {
        SoqlUrl.constructUrlForDocumentIds({}, "MasterRealPropApi", []);
      }).toThrow(
        "'constructUrlForDocumentIds' requires a non-empty array of documentIds."
      );
    });

    test("throws error for non-array document IDs", function () {
      expect(() => {
        SoqlUrl.constructUrlForDocumentIds(
          {},
          "MasterRealPropApi",
          "not-an-array"
        );
      }).toThrow(
        "'constructUrlForDocumentIds' requires a non-empty array of documentIds."
      );
    });
  });

  describe("constructUrlBatches", function () {
    test("creates single batch for small array", function () {
      const queryParams = { doc_type: "DEED" };
      const documentIds = ["123", "456", "789"];
      const batches = SoqlUrl.constructUrlBatches(
        queryParams,
        documentIds,
        "MasterRealPropApi",
        500
      );

      expect(batches).toHaveLength(1);
      expect(batches[0]).toContain("document_id%20IN%20(");
    });

    test("creates multiple batches for large array", function () {
      const queryParams = {};
      const documentIds = Array.from({ length: 1500 }, (_, i) => `doc_${i}`);
      const batches = SoqlUrl.constructUrlBatches(
        queryParams,
        documentIds,
        "MasterRealPropApi",
        500
      );

      expect(batches).toHaveLength(3); // 1500 / 500 = 3 batches
      batches.forEach((batch) => {
        expect(batch).toContain("document_id%20IN%20(");
      });
    });

    test("uses custom batch size", function () {
      const queryParams = {};
      const documentIds = Array.from({ length: 250 }, (_, i) => `doc_${i}`);
      const batches = SoqlUrl.constructUrlBatches(
        queryParams,
        documentIds,
        "MasterRealPropApi",
        100
      );

      expect(batches).toHaveLength(3); // 250 / 100 = 3 batches (rounded up)
    });

    test("throws error for invalid documentIdsCrossRef", function () {
      expect(() => {
        SoqlUrl.constructUrlBatches({}, "not-an-array", "MasterRealPropApi");
      }).toThrow(
        "'constructUrlBatches' received invalid 'documentIdsCrossRef' parameter: Expected an array."
      );
    });

    test("throws error for invalid batch size", function () {
      expect(() => {
        SoqlUrl.constructUrlBatches({}, [], "MasterRealPropApi", 0);
      }).toThrow(
        "'constructUrlBatches' received invalid 'batchSize' parameter: Expected a positive number."
      );

      expect(() => {
        SoqlUrl.constructUrlBatches({}, [], "MasterRealPropApi", -5);
      }).toThrow(
        "'constructUrlBatches' received invalid 'batchSize' parameter: Expected a positive number."
      );
    });

    test("does not mutate original queryParams", function () {
      const queryParams = { doc_type: "DEED" };
      const originalParams = { ...queryParams };
      const documentIds = ["123", "456"];

      SoqlUrl.constructUrlBatches(
        queryParams,
        documentIds,
        "MasterRealPropApi",
        500
      );

      expect(queryParams).toEqual(originalParams);
    });
  });

  describe("setConditionsConfig", function () {
    test("handles MasterRealPropApi conditions", function () {
      const queryParams = {
        document_id: "123",
        crfn: "2023000111001",
        doc_type: "DEED",
        recorded_borough: "1",
      };
      const conditions = SoqlUrl.setConditionsConfig(
        queryParams,
        "MasterRealPropApi"
      );

      expect(conditions).toContain("document_id='123'");
      expect(conditions).toContain("crfn='2023000111001'");
      expect(conditions).toContain("doc_type IN ('DEED')");
      expect(conditions).toContain("recorded_borough='1'");
    });

    test("handles PartiesRealPropApi conditions", function () {
      const queryParams = {
        document_id: "123",
        name: "Smith",
        party_type: "1",
        address_1: "123 Main St",
      };
      const conditions = SoqlUrl.setConditionsConfig(
        queryParams,
        "PartiesRealPropApi"
      );

      expect(conditions).toContain("document_id='123'");
      expect(conditions).toContain("name like '%Smith%'");
      expect(conditions).toContain("party_type='1'");
      expect(conditions).toContain("address_1='123 Main St'");
    });

    test("handles LegalsRealPropApi conditions", function () {
      const queryParams = {
        document_id: "123",
        borough: "1",
        block: "123",
        lot: "45",
      };
      const conditions = SoqlUrl.setConditionsConfig(
        queryParams,
        "LegalsRealPropApi"
      );

      expect(conditions).toContain("document_id='123'");
      expect(conditions).toContain("borough=1");
      expect(conditions).toContain("block=123");
      expect(conditions).toContain("lot=45");
    });

    test("handles date range conditions", function () {
      const queryParams = {
        document_date_start: "2023-01-01",
        document_date_end: "2023-12-31",
      };
      const conditions = SoqlUrl.setConditionsConfig(
        queryParams,
        "MasterRealPropApi"
      );

      expect(conditions).toContain(
        "document_date between '2023-01-01' and '2023-12-31'"
      );
    });

    test("handles doc_type array", function () {
      const queryParams = {
        doc_type: ["DEED", "AGMT", "MTGE"],
      };
      const conditions = SoqlUrl.setConditionsConfig(
        queryParams,
        "MasterRealPropApi"
      );

      expect(conditions).toContain("doc_type IN ('DEED', 'AGMT', 'MTGE')");
    });

    test("handles doc_type comma-separated string", function () {
      const queryParams = {
        doc_type: "DEED,AGMT,MTGE",
      };
      const conditions = SoqlUrl.setConditionsConfig(
        queryParams,
        "MasterRealPropApi"
      );

      expect(conditions).toContain("doc_type IN ('DEED', 'AGMT', 'MTGE')");
    });

    test("handles transaction_number prefix match", function () {
      const queryParams = {
        transaction_number: "2023",
      };
      const conditions = SoqlUrl.setConditionsConfig(
        queryParams,
        "MasterRealPropApi"
      );

      expect(conditions).toContain("document_id LIKE '2023%'");
    });

    test("handles Personal Property APIs", function () {
      const queryParams = {
        document_id: "123",
        ucc_collateral: "VEHICLE",
        fedtax_serial_nbr: "ABC123",
      };
      const conditions = SoqlUrl.setConditionsConfig(
        queryParams,
        "MasterPersPropApi"
      );

      expect(conditions).toContain("document_id='123'");
      expect(conditions).toContain("ucc_collateral='VEHICLE'");
      expect(conditions).toContain("fedtax_serial_nbr='ABC123'");
    });

    test("escapes single quotes in parameters", function () {
      const queryParams = {
        name: "O'Brien",
        address_1: "123 O'Malley St",
      };
      const conditions = SoqlUrl.setConditionsConfig(
        queryParams,
        "PartiesRealPropApi"
      );

      expect(conditions).toContain("name like '%O''Brien%'");
      expect(conditions).toContain("address_1='123 O''Malley St'");
    });

    test("returns empty array for no matching parameters", function () {
      const queryParams = {
        unknown_param: "value",
      };
      const conditions = SoqlUrl.setConditionsConfig(
        queryParams,
        "MasterRealPropApi"
      );

      expect(conditions).toEqual([]);
    });

    test("throws error for invalid apiCaller", function () {
      expect(() => {
        SoqlUrl.setConditionsConfig({}, null);
      }).toThrow(
        "'setConditionsConfig' received invalid 'apiCaller' parameter: Expected a non-empty string."
      );

      expect(() => {
        SoqlUrl.setConditionsConfig({}, "");
      }).toThrow(
        "'setConditionsConfig' received invalid 'apiCaller' parameter: Expected a non-empty string."
      );
    });
  });

  describe("setSelectConfig", function () {
    test("returns empty string for 'records' option", function () {
      expect(SoqlUrl.setSelectConfig("records")).toBe("");
      expect(SoqlUrl.setSelectConfig()).toBe(""); // default
    });

    test("returns count clause for 'countAll' option", function () {
      expect(SoqlUrl.setSelectConfig("countAll")).toBe("$select=count(*)");
    });

    test("returns document_id clause for 'document_id' option", function () {
      expect(SoqlUrl.setSelectConfig("document_id")).toBe(
        "$select=document_id"
      );
    });

    test("handles array of fields", function () {
      expect(
        SoqlUrl.setSelectConfig(["document_id", "doc_type", "recorded_borough"])
      ).toBe("$select=document_id,doc_type,recorded_borough");
    });

    test("handles single field array", function () {
      expect(SoqlUrl.setSelectConfig(["document_id"])).toBe(
        "$select=document_id"
      );
    });

    test("handles empty array", function () {
      expect(SoqlUrl.setSelectConfig([])).toBe("$select=");
    });

    test("throws error for invalid selectOption", function () {
      expect(() => {
        SoqlUrl.setSelectConfig("invalid_option");
      }).toThrow(
        "'setSelectConfig' received invalid 'selectOption' parameter: invalid_option"
      );

      expect(() => {
        SoqlUrl.setSelectConfig(123);
      }).toThrow(
        "'setSelectConfig' received invalid 'selectOption' parameter: 123"
      );
    });
  });

  describe("setWhereConfig", function () {
    test("creates where clause with single condition", function () {
      const conditions = ["document_id='123'"];
      const whereClause = SoqlUrl.setWhereConfig(conditions);

      expect(whereClause).toBe("$where=document_id%3D'123'");
    });

    test("creates where clause with multiple conditions", function () {
      const conditions = [
        "document_id='123'",
        "doc_type='DEED'",
        "recorded_borough='1'",
      ];
      const whereClause = SoqlUrl.setWhereConfig(conditions);

      expect(whereClause).toContain("$where=");
      expect(whereClause).toContain("document_id");
      expect(whereClause).toContain("doc_type");
      expect(whereClause).toContain("recorded_borough");
      expect(whereClause).toContain("AND");
    });

    test("returns empty string for no conditions", function () {
      const whereClause = SoqlUrl.setWhereConfig([]);
      expect(whereClause).toBe("");
    });

    test("properly encodes special characters", function () {
      const conditions = ["name like '%O'Brien%'"];
      const whereClause = SoqlUrl.setWhereConfig(conditions);

      expect(whereClause).toContain("$where=");
      expect(whereClause).toContain("O'Brien"); // single quotes are not double-encoded in WHERE clause
    });
  });

  describe("setApiEndpointConfig", function () {
    test("returns correct endpoint for Real Property APIs", function () {
      expect(SoqlUrl.setApiEndpointConfig("MasterRealPropApi")).toBe(
        API_ENDPOINTS.realPropertyMaster
      );
      expect(SoqlUrl.setApiEndpointConfig("PartiesRealPropApi")).toBe(
        API_ENDPOINTS.realPropertyParties
      );
      expect(SoqlUrl.setApiEndpointConfig("LegalsRealPropApi")).toBe(
        API_ENDPOINTS.realPropertyLegals
      );
      expect(SoqlUrl.setApiEndpointConfig("ReferencesRealPropApi")).toBe(
        API_ENDPOINTS.realPropertyReferences
      );
      expect(SoqlUrl.setApiEndpointConfig("RemarksRealPropApi")).toBe(
        API_ENDPOINTS.realPropertyRemarks
      );
    });

    test("returns correct endpoint for Personal Property APIs", function () {
      expect(SoqlUrl.setApiEndpointConfig("MasterPersPropApi")).toBe(
        API_ENDPOINTS.personalPropertyMaster
      );
      expect(SoqlUrl.setApiEndpointConfig("PartiesPersPropApi")).toBe(
        API_ENDPOINTS.personalPropertyParties
      );
      expect(SoqlUrl.setApiEndpointConfig("LegalsPersPropApi")).toBe(
        API_ENDPOINTS.personalPropertyLegals
      );
      expect(SoqlUrl.setApiEndpointConfig("ReferencesPersPropApi")).toBe(
        API_ENDPOINTS.personalPropertyReferences
      );
      expect(SoqlUrl.setApiEndpointConfig("RemarksPersPropApi")).toBe(
        API_ENDPOINTS.personalPropertyRemarks
      );
    });

    test("throws error for unknown API caller", function () {
      expect(() => {
        SoqlUrl.setApiEndpointConfig("UnknownApi");
      }).toThrow(
        "'setApiEndpointConfig' received unknown 'apiCaller' parameter: UnknownApi"
      );
    });
  });

  describe("setLimitOffsetConfig", function () {
    test("returns empty string for countAll select option", function () {
      expect(SoqlUrl.setLimitOffsetConfig("countAll", 1000, 500)).toBe("");
    });

    test("includes limit when provided", function () {
      expect(SoqlUrl.setLimitOffsetConfig("records", 1000)).toBe("$limit=1000");
    });

    test("includes offset when provided", function () {
      expect(SoqlUrl.setLimitOffsetConfig("records", null, 500)).toBe(
        "$offset=500"
      );
    });

    test("includes both limit and offset when provided", function () {
      expect(SoqlUrl.setLimitOffsetConfig("records", 1000, 500)).toBe(
        "$limit=1000&$offset=500"
      );
    });

    test("returns empty string when no limit or offset", function () {
      expect(SoqlUrl.setLimitOffsetConfig("records")).toBe("");
      expect(SoqlUrl.setLimitOffsetConfig("records", null, null)).toBe("");
    });

    test("handles zero values correctly", function () {
      expect(SoqlUrl.setLimitOffsetConfig("records", 0, 0)).toBe("");
      expect(SoqlUrl.setLimitOffsetConfig("records", 1000, 0)).toBe(
        "$limit=1000"
      );
    });
  });

  describe("Integration Tests", function () {
    test("constructs complete URL with all components", function () {
      const queryParams = {
        document_id: "2023123456789",
        doc_type: "DEED",
        recorded_borough: "1",
      };
      const url = SoqlUrl.constructUrl(
        queryParams,
        "MasterRealPropApi",
        "records",
        1000,
        500
      );

      expect(url).toContain(API_ENDPOINTS.realPropertyMaster);
      expect(url).toContain("$where=");
      expect(url).toContain("document_id");
      expect(url).toContain("doc_type");
      expect(url).toContain("recorded_borough");
      expect(url).toContain("$limit=1000");
      expect(url).toContain("$offset=500");
    });

    test("constructs URL for document count query", function () {
      const queryParams = { doc_type: "DEED" };
      const url = SoqlUrl.constructUrl(
        queryParams,
        "MasterRealPropApi",
        "countAll"
      );

      expect(url).toContain("$select=count(*)");
      expect(url).not.toContain("$limit");
      expect(url).not.toContain("$offset");
    });

    test("constructs URL for specific field selection", function () {
      const queryParams = { recorded_borough: "1" };
      const url = SoqlUrl.constructUrl(queryParams, "MasterRealPropApi", [
        "document_id",
        "doc_type",
      ]);

      expect(url).toContain("$select=document_id,doc_type");
      expect(url).toContain("recorded_borough%3D'1'");
    });

    test("handles complex real-world scenario", function () {
      const queryParams = {
        doc_type: "DEED,MTGE",
        recorded_borough: "1",
        document_date_start: "2023-01-01",
        document_date_end: "2023-12-31",
        transaction_number: "2023",
      };
      const url = SoqlUrl.constructUrl(
        queryParams,
        "MasterRealPropApi",
        "records",
        5000,
        10000
      );

      expect(url).toContain("doc_type%20IN%20('DEED'%2C%20'MTGE')");
      expect(url).toContain("recorded_borough%3D'1'");
      expect(url).toContain("document_date%20between");
      expect(url).toContain("document_id%20LIKE%20'2023%25'");
      expect(url).toContain("$limit=5000");
      expect(url).toContain("$offset=10000");
    });

    test("creates batches for large document ID lists", function () {
      const queryParams = { doc_type: "DEED" };
      const documentIds = Array.from(
        { length: 1200 },
        (_, i) => `2023${String(i).padStart(6, "0")}`
      );
      const batches = SoqlUrl.constructUrlBatches(
        queryParams,
        documentIds,
        "MasterRealPropApi",
        500
      );

      expect(batches).toHaveLength(3); // 1200 / 500 = 2.4, rounded up to 3
      batches.forEach((batch, index) => {
        expect(batch).toContain("doc_type%20IN%20('DEED')");
        expect(batch).toContain("document_id%20IN%20(");

        // Verify each batch has the right content
        if (index < 2) {
          // First two batches should have 500 IDs each
          const idMatches = batch.match(/2023\d{6}/g);
          expect(idMatches).toHaveLength(500);
        } else {
          // Last batch should have remaining 200 IDs
          const idMatches = batch.match(/2023\d{6}/g);
          expect(idMatches).toHaveLength(200);
        }
      });
    });
  });

  describe("Edge Cases and Error Handling", function () {
    test("handles empty queryParams object", function () {
      const url = SoqlUrl.constructUrl({}, "MasterRealPropApi", "records");
      expect(url).toContain(API_ENDPOINTS.realPropertyMaster);
      expect(url).not.toContain("$where");
    });

    test("handles queryParams with null/undefined values", function () {
      const queryParams = {
        document_id: "123",
        doc_type: null,
        recorded_borough: undefined,
        crfn: "",
      };
      const conditions = SoqlUrl.setConditionsConfig(
        queryParams,
        "MasterRealPropApi"
      );

      expect(conditions).toContain("document_id='123'");
      expect(conditions).not.toContain("doc_type");
      expect(conditions).not.toContain("recorded_borough");
      // Empty string parameters are filtered out by the actual implementation
      expect(conditions.some((c) => c.includes("crfn"))).toBe(false);
    });

    test("handles very long document ID arrays in batches", function () {
      const queryParams = {};
      const documentIds = Array.from({ length: 10000 }, (_, i) => `doc_${i}`);
      const batches = SoqlUrl.constructUrlBatches(
        queryParams,
        documentIds,
        "MasterRealPropApi",
        1000
      );

      expect(batches).toHaveLength(10);
      batches.forEach((batch) => {
        expect(batch.length).toBeLessThan(25000); // Adjust threshold for realistic URL length limits
      });
    });

    test("preserves parameter order in conditions", function () {
      const queryParams = {
        document_id: "123",
        doc_type: "DEED",
        recorded_borough: "1",
      };
      const conditions = SoqlUrl.setConditionsConfig(
        queryParams,
        "MasterRealPropApi"
      );
      const whereClause = SoqlUrl.setWhereConfig(conditions);

      // Check that conditions appear in a consistent order
      expect(whereClause.indexOf("document_id")).toBeLessThan(
        whereClause.indexOf("doc_type")
      );
    });
  });
});
