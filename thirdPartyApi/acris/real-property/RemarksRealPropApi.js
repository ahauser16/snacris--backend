"use strict";

const axios = require("axios");
const { NotFoundError } = require("../../../expressError");
const SoqlUrl = require("../utils/SoqlUrl");
const batchArray = require("../utils/CreateUrlBatchesArray");

class RemarksRealPropApi {
  static async fetchAcrisRecords(remarksQueryParams) {
    try {
      const url = SoqlUrl.constructUrl(
        remarksQueryParams,
        "RemarksRealPropApi",
        "records"
      );
      const headers = {
        "Content-Type": "application/json",
        "X-App-Token": process.env.NYC_OPEN_DATA_APP_TOKEN,
      };
      const { data } = await axios.get(url, { headers });
      if (!data?.length) {
        throw new NotFoundError(
          "No records found for the given query from Real Property Remarks API."
        );
      }
      return data;
    } catch (err) {
      throw new Error("Failed to fetch records from Real Property Remarks API");
    }
  }

  static async fetchAcrisRecordCount(remarksQueryParams) {
    try {
      const url = SoqlUrl.constructUrl(
        remarksQueryParams,
        "RemarksRealPropApi",
        "countAll"
      );
      const headers = {
        "Content-Type": "application/json",
        "X-App-Token": process.env.NYC_OPEN_DATA_APP_TOKEN,
      };
      const { data } = await axios.get(url, { headers });
      if (!data?.length || !data[0]?.count) {
        throw new NotFoundError(
          "No count data found for the given query from Real Property Remarks API."
        );
      }
      return Number(data[0].count);
    } catch (err) {
      throw new Error(
        "Failed to fetch record count from Real Property Remarks API"
      );
    }
  }

  static async fetchAcrisDocumentIds(remarksQueryParams) {
    try {
      const url = SoqlUrl.constructUrl(
        remarksQueryParams,
        "RemarksRealPropApi",
        "document_id"
      );
      const headers = {
        "Content-Type": "application/json",
        "X-App-Token": process.env.NYC_OPEN_DATA_APP_TOKEN,
      };
      const { data } = await axios.get(url, { headers });
      if (!data?.length) {
        throw new NotFoundError(
          "No document IDs found for the given query from Real Property Remarks API."
        );
      }
      return data.map((record) => record.document_id);
    } catch (err) {
      throw new Error(
        "Failed to fetch document IDs from Real Property Remarks API"
      );
    }
  }

  static async fetchAcrisDocumentIdsCrossRef(
    remarksQueryParams,
    crossRefDocumentIds,
    batchSize = 500
  ) {
    try {
      const queryUrls = SoqlUrl.constructUrlBatches(
        remarksQueryParams,
        crossRefDocumentIds,
        "RemarksRealPropApi",
        batchSize
      );
      const allDocumentIds = new Set();
      for (const url of queryUrls) {
        let offset = 0;
        let hasMoreRecords = true;
        while (hasMoreRecords) {
          const paginatedUrl = `${url}&$limit=1000&$offset=${offset}`;
          const headers = {
            "Content-Type": "application/json",
            "X-App-Token": process.env.NYC_OPEN_DATA_APP_TOKEN,
          };
          const { data } = await axios.get(paginatedUrl, { headers });
          if (!data?.length) {
            hasMoreRecords = false;
          } else {
            data.forEach((record) => allDocumentIds.add(record.document_id));
            offset += 1000;
          }
        }
      }
      if (allDocumentIds.size === 0) {
        throw new NotFoundError(
          "No Real Property Remarks records found for the given query."
        );
      }
      return Array.from(allDocumentIds);
    } catch (err) {
      throw new Error(
        "Failed to fetch document IDs from Real Property Remarks API"
      );
    }
  }

  static async fetchAcrisRecordsByDocumentIds(
    documentIds,
    queryParams = {},
    limit = 1000
  ) {
    try {
      const BATCH_SIZE = 75; // Try 50-100, adjust if needed
      let allRecords = [];
      const batches = batchArray(documentIds, BATCH_SIZE);

      for (const batch of batches) {
        let offset = 0;
        let hasMoreRecords = true;
        while (hasMoreRecords) {
          const url = SoqlUrl.constructUrlForDocumentIds(
            queryParams,
            "RemarksRealPropApi",
            batch,
            limit,
            offset
          );

          const headers = {
            "Content-Type": "application/json",
            "X-App-Token": process.env.NYC_OPEN_DATA_APP_TOKEN,
          };
          const { data } = await axios.get(url, { headers });
          if (!data?.length) {
            hasMoreRecords = false;
          } else {
            allRecords.push(...data);
            offset += limit;
            if (data.length < limit) hasMoreRecords = false;
          }
        }
      }

      return allRecords.length ? allRecords : null;
    } catch (err) {
      return null;
    }
  }
}

module.exports = RemarksRealPropApi;
