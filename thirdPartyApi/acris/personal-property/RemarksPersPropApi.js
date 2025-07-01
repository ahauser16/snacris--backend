"use strict";

const axios = require("axios");
const { NotFoundError } = require("../../../expressError");
const SoqlUrl = require("../utils/SoqlUrl");
const batchArray = require("../utils/CreateUrlBatchesArray");

/** Functions for interacting with the ACRIS Personal Property Remarks API. */
class RemarksPersPropApi {
  static async fetchAcrisRecords(remarksQueryParams) {
    try {
      const url = SoqlUrl.constructUrl(
        remarksQueryParams,
        "RemarksPersPropApi",
        "records"
      );
      const headers = {
        "Content-Type": "application/json",
        "X-App-Token": process.env.APP_TOKEN,
      };
      const { data } = await axios.get(url, { headers });
      if (!data?.length) {
        throw new NotFoundError(
          "No records found for the given query from Personal Property Remarks API."
        );
      }
      return data;
    } catch (err) {
      throw new Error(
        "Failed to fetch records from Personal Property Remarks API"
      );
    }
  }

  static async fetchAcrisRecordCount(remarksQueryParams) {
    try {
      const url = SoqlUrl.constructUrl(
        remarksQueryParams,
        "RemarksPersPropApi",
        "countAll"
      );
      const headers = {
        "Content-Type": "application/json",
        "X-App-Token": process.env.APP_TOKEN,
      };
      const { data } = await axios.get(url, { headers });
      if (!data?.length || !data[0]?.count) {
        throw new NotFoundError(
          "No count data found for the given query from Personal Property Remarks API."
        );
      }
      return Number(data[0].count);
    } catch (err) {
      throw new Error(
        "Failed to fetch record count from Personal Property Remarks API"
      );
    }
  }

  static async fetchAcrisDocumentIds(remarksQueryParams) {
    try {
      const url = SoqlUrl.constructUrl(
        remarksQueryParams,
        "RemarksPersPropApi",
        "document_id"
      );
      const headers = {
        "Content-Type": "application/json",
        "X-App-Token": process.env.APP_TOKEN,
      };
      const { data } = await axios.get(url, { headers });
      if (!data?.length) {
        throw new NotFoundError(
          "No document IDs found for the given query from Personal Property Remarks API."
        );
      }
      return data.map((record) => record.document_id);
    } catch (err) {
      throw new Error(
        "Failed to fetch document IDs from Personal Property Remarks API"
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
        "RemarksPersPropApi",
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
            "X-App-Token": process.env.APP_TOKEN,
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
          "No Personal Property Remarks records found for the given query."
        );
      }
      return Array.from(allDocumentIds);
    } catch (err) {
      throw new Error(
        "Failed to fetch document IDs from Personal Property Remarks API"
      );
    }
  }

  static async fetchAcrisRecordsByDocumentIds(
    documentIds,
    queryParams = {},
    limit = 1000
  ) {
    try {
      const BATCH_SIZE = 75;
      let allRecords = [];
      const batches = batchArray(documentIds, BATCH_SIZE);

      for (const batch of batches) {
        let offset = 0;
        let hasMoreRecords = true;
        while (hasMoreRecords) {
          const url = SoqlUrl.constructUrlForDocumentIds(
            queryParams,
            "RemarksPersPropApi",
            batch,
            limit,
            offset
          );

          const headers = {
            "Content-Type": "application/json",
            "X-App-Token": process.env.APP_TOKEN,
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

module.exports = RemarksPersPropApi;
