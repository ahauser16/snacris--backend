"use strict";

const request = require("supertest");
const app = require("../../../../app");
const RemarksPersPropApi = require("../../../../thirdPartyApi/acris/personal-property/RemarksPersPropApi");
const { createToken } = require("../../../../helpers/tokens");
const { NotFoundError } = require("../../../../expressError");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
} = require("../../../_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

// Mock the RemarksPersPropApi
jest.mock(
  "../../../../thirdPartyApi/acris/personal-property/RemarksPersPropApi"
);

describe("Personal Property Remarks API Routes", function () {
  describe("GET /persPropertyRemarks/fetchRecord", function () {
    test("works: returns personal property remarks records with query parameters", async function () {
      const mockRemarks = [
        {
          document_id: "2023040500001001",
          record_type: "D",
          crfn: "2023000012345",
          doc_id_ref: "2023040500000501",
          file_nbr: "890123",
          good_through_date: "2024-12-31T23:59:59.000",
        },
        {
          document_id: "2023040500001002",
          record_type: "M",
          crfn: "2023000012346",
          doc_id_ref: "2023040500000502",
          file_nbr: "890124",
          good_through_date: "2024-12-31T23:59:59.000",
        },
      ];

      RemarksPersPropApi.fetchFromAcris.mockResolvedValue(mockRemarks);

      const resp = await request(app)
        .get(
          "/persPropertyRemarks/fetchRecord?document_id=2023040500001001&crfn=2023000012345"
        )
        .set("authorization", `Bearer ${u1Token}`);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        records: mockRemarks,
      });
      expect(RemarksPersPropApi.fetchFromAcris).toHaveBeenCalledWith({
        document_id: "2023040500001001",
        crfn: "2023000012345",
      });
    });

    test("works: returns records with no query parameters", async function () {
      const mockRemarks = [
        {
          document_id: "2023040500001003",
          record_type: "A",
          crfn: "2023000012347",
          doc_id_ref: "2023040500000503",
          file_nbr: "890125",
          good_through_date: "2024-12-31T23:59:59.000",
        },
      ];

      RemarksPersPropApi.fetchFromAcris.mockResolvedValue(mockRemarks);

      const resp = await request(app)
        .get("/persPropertyRemarks/fetchRecord")
        .set("authorization", `Bearer ${u1Token}`);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        records: mockRemarks,
      });
      expect(RemarksPersPropApi.fetchFromAcris).toHaveBeenCalledWith({});
    });

    test("works: handles multiple query parameters", async function () {
      const mockRemarks = [
        {
          document_id: "2023040500001004",
          record_type: "L",
          crfn: "2023000012348",
          doc_id_ref: "2023040500000504",
          file_nbr: "890126",
          good_through_date: "2024-12-31T23:59:59.000",
        },
      ];

      RemarksPersPropApi.fetchFromAcris.mockResolvedValue(mockRemarks);

      const resp = await request(app)
        .get("/persPropertyRemarks/fetchRecord")
        .query({
          document_id: "2023040500001004",
          crfn: "2023000012348",
          file_nbr: "890126",
          $limit: 100,
          $offset: 0,
        })
        .set("authorization", `Bearer ${u1Token}`);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        records: mockRemarks,
      });
      expect(RemarksPersPropApi.fetchFromAcris).toHaveBeenCalledWith({
        document_id: "2023040500001004",
        crfn: "2023000012348",
        file_nbr: "890126",
        $limit: "100",
        $offset: "0",
      });
    });

    test("works: handles doc_id_ref specific queries", async function () {
      const mockRemarks = [
        {
          document_id: "2023040500001005",
          record_type: "F",
          crfn: "2023000012349",
          doc_id_ref: "2023040500000505",
          file_nbr: "890127",
          good_through_date: "2024-12-31T23:59:59.000",
        },
      ];

      RemarksPersPropApi.fetchFromAcris.mockResolvedValue(mockRemarks);

      const resp = await request(app)
        .get("/persPropertyRemarks/fetchRecord?doc_id_ref=2023040500000505")
        .set("authorization", `Bearer ${u1Token}`);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        records: mockRemarks,
      });
      expect(RemarksPersPropApi.fetchFromAcris).toHaveBeenCalledWith({
        doc_id_ref: "2023040500000505",
      });
    });

    test("handles API errors gracefully", async function () {
      RemarksPersPropApi.fetchFromAcris.mockRejectedValue(
        new Error("API connection failed")
      );

      const resp = await request(app)
        .get("/persPropertyRemarks/fetchRecord?document_id=2023040500001001")
        .set("authorization", `Bearer ${u1Token}`);

      expect(resp.statusCode).toEqual(500);
      expect(resp.body).toEqual({
        error: {
          message: "API connection failed",
          status: 500,
        },
      });
    });

    test("handles NotFoundError from API", async function () {
      RemarksPersPropApi.fetchFromAcris.mockRejectedValue(
        new NotFoundError(
          "No records found for the given query from Personal Property Remarks API."
        )
      );

      const resp = await request(app)
        .get("/persPropertyRemarks/fetchRecord?document_id=INVALID123")
        .set("authorization", `Bearer ${u1Token}`);

      expect(resp.statusCode).toEqual(404);
      expect(resp.body).toEqual({
        error: {
          message:
            "No records found for the given query from Personal Property Remarks API.",
          status: 404,
        },
      });
    });

    test("returns empty array when API returns empty results", async function () {
      RemarksPersPropApi.fetchFromAcris.mockResolvedValue([]);

      const resp = await request(app)
        .get("/persPropertyRemarks/fetchRecord?document_id=NONEXISTENT")
        .set("authorization", `Bearer ${u1Token}`);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        records: [],
      });
    });

    test("production behavior: route does not require authentication for development/testing", async function () {
      const mockRemarks = [
        {
          document_id: "2023040500001007",
          record_type: "T",
          crfn: "2023000012351",
          doc_id_ref: "2023040500000507",
          file_nbr: "890129",
          good_through_date: "2024-12-31T23:59:59.000",
        },
      ];

      RemarksPersPropApi.fetchFromAcris.mockResolvedValue(mockRemarks);

      const resp = await request(app).get(
        "/persPropertyRemarks/fetchRecord?document_id=2023040500001007"
      );

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        records: mockRemarks,
      });
    });

    test("works: validates remarks data structure", async function () {
      const mockRemarks = [
        {
          document_id: "2023040500001008",
          record_type: "R",
          crfn: "2023000012352",
          doc_id_ref: "2023040500000508",
          file_nbr: "890130",
          good_through_date: "2024-12-31T23:59:59.000",
        },
      ];

      RemarksPersPropApi.fetchFromAcris.mockResolvedValue(mockRemarks);

      const resp = await request(app)
        .get("/persPropertyRemarks/fetchRecord?crfn=2023000012352")
        .set("authorization", `Bearer ${u1Token}`);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body.records[0]).toHaveProperty("document_id");
      expect(resp.body.records[0]).toHaveProperty("record_type");
      expect(resp.body.records[0]).toHaveProperty("crfn");
      expect(resp.body.records[0]).toHaveProperty("doc_id_ref");
      expect(resp.body.records[0]).toHaveProperty("file_nbr");
      expect(resp.body.records[0]).toHaveProperty("good_through_date");
    });

    test("works: handles file number-based queries", async function () {
      const mockRemarks = [
        {
          document_id: "2023040500001009",
          record_type: "N",
          crfn: "2023000012353",
          doc_id_ref: "2023040500000509",
          file_nbr: "890131",
          good_through_date: "2024-12-31T23:59:59.000",
        },
      ];

      RemarksPersPropApi.fetchFromAcris.mockResolvedValue(mockRemarks);

      const resp = await request(app)
        .get("/persPropertyRemarks/fetchRecord?file_nbr=890131")
        .set("authorization", `Bearer ${u1Token}`);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        records: mockRemarks,
      });
      expect(RemarksPersPropApi.fetchFromAcris).toHaveBeenCalledWith({
        file_nbr: "890131",
      });
    });

    test("works: handles date range queries", async function () {
      const mockRemarks = [
        {
          document_id: "2023040500001010",
          record_type: "S",
          crfn: "2023000012354",
          doc_id_ref: "2023040500000510",
          file_nbr: "890132",
          good_through_date: "2024-12-31T23:59:59.000",
        },
      ];

      RemarksPersPropApi.fetchFromAcris.mockResolvedValue(mockRemarks);

      const resp = await request(app)
        .get("/persPropertyRemarks/fetchRecord")
        .query({
          good_through_date: "2024-12-31T23:59:59.000",
          $where: "good_through_date >= '2024-01-01T00:00:00.000'",
        })
        .set("authorization", `Bearer ${u1Token}`);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        records: mockRemarks,
      });
    });
  });
});
