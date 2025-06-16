"use strict";

const axios = require("axios");
const SoqlUrl = require("../utils/SoqlUrl");
const { BadRequestError, NotFoundError } = require("../../../expressError");
const batchArray = require("../utils/CreateUrlBatchesArray");

/** Functions for interacting with the ACRIS Personal Property Master API. */

class MasterPersPropApi {
  /**
   * Fetch all records from the ACRIS Personal Property Master dataset using pagination.
   *
   * @param {Object} masterQueryParams - Query parameters for the Master dataset.
   * @param {number} [limit=1000] - Maximum number of records to fetch per request.
   * @returns {Array} - Fetched records.
   */
  static async fetchAcrisRecords(masterQueryParams, limit = 1000) {
    try {
      let offset = 0;
      let hasMoreRecords = true;
      const allRecords = [];

      while (hasMoreRecords) {
        const url = SoqlUrl.constructUrl(masterQueryParams, "MasterPersPropApi", "records", limit, offset);
        console.log("'/fetchAcrisRecords(masterQueryParams)' calls 'SoqlUrl.constructUrl' creating:", url);
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
          if (data.length < limit) {
            hasMoreRecords = false;
          }
        }
      }

      if (!allRecords.length) {
        console.warn(`No records found for masterQueryParams: ${JSON.stringify(masterQueryParams)} from Personal Property Master API`);
        throw new NotFoundError("No records found for the given query from Personal Property Master API.");
      }

      return allRecords;
    } catch (err) {
      console.error("Error fetching records from Personal Property Master API:", err.message);
      throw new Error("Failed to fetch records from Personal Property Master API");
    }
  }

  /**
   * Fetch the count of matching records from the ACRIS Personal Property Master dataset.
   *
   * @param {Object} masterQueryParams - Query parameters for the Master dataset.
   * @returns {number} - Count of matching records.
   */
  static async fetchAcrisRecordCount(masterQueryParams) {
    try {
      const url = SoqlUrl.constructUrl(masterQueryParams, "MasterPersPropApi", "countAll");
      console.log("'/fetchAcrisRecordCount(masterQueryParams)' calls 'SoqlUrl.constructUrl' creating:", url);
      const headers = {
        "Content-Type": "application/json",
        "X-App-Token": process.env.APP_TOKEN,
      };

      const { data } = await axios.get(url, { headers });

      if (!data?.length || !data[0]?.count) {
        console.warn(`No count data found for masterQueryParams: ${JSON.stringify(masterQueryParams)} from Personal Property Master API`);
        throw new NotFoundError("No count data found for the given query from Personal Property Master API.");
      }

      return Number(data[0].count);
    } catch (err) {
      console.error("Error fetching record count from Personal Property Master API:", err.message);
      throw new Error("Failed to fetch record count from Personal Property Master API");
    }
  }

  /**
   * Fetch all `document_id` values from the ACRIS Personal Property Master dataset using pagination.
   *
   * @param {Object} masterQueryParams - Query parameters for the Master dataset.
   * @param {number} [limit=1000] - Maximum number of records to fetch per request.
   * @returns {Array} - Array of unique `document_id` values.
   */
  static async fetchAcrisDocumentIds(masterQueryParams, limit = 1000) {
    try {
      let offset = 0;
      let hasMoreRecords = true;
      const documentIds = new Set();

      while (hasMoreRecords) {
        const url = SoqlUrl.constructUrl(masterQueryParams, "MasterPersPropApi", "document_id", limit, offset);
        console.log("'/fetchAcrisDocumentIds(masterQueryParams)' calls 'SoqlUrl.constructUrl' creating:", url);
        const headers = {
          "Content-Type": "application/json",
          "X-App-Token": process.env.APP_TOKEN,
        };

        const { data } = await axios.get(url, { headers });

        if (!data?.length) {
          hasMoreRecords = false;
        } else {
          data.forEach(record => documentIds.add(record.document_id));
          offset += limit;
          if (data.length < limit) {
            hasMoreRecords = false;
          }
        }
      }

      if (!documentIds.size) {
        console.warn(`No document IDs found for query: ${JSON.stringify(masterQueryParams)} from Personal Property Master API`);
        throw new NotFoundError("No document IDs found for the given query from Personal Property Master API.");
      }

      return Array.from(documentIds);
    } catch (err) {
      console.error("Error fetching document IDs from Personal Property Master API:", err.message);
      throw new Error("Failed to fetch document IDs from Personal Property Master API");
    }
  }

  /**
   * Fetch all records from the ACRIS Personal Property Master dataset for an array of document_id values.
   * @param {Array<string>} documentIds - Array of document_id values.
   * @param {Object} [queryParams={}] - Additional query parameters.
   * @param {number} [limit=1000] - Pagination limit.
   * @returns {Array} - Fetched records.
   */
  static async fetchAcrisRecordsByDocumentIds(documentIds, queryParams = {}, limit = 1000) {
    try {
      const BATCH_SIZE = 75;
      let allRecords = [];
      const batches = batchArray(documentIds, BATCH_SIZE);

      for (const batch of batches) {
        let offset = 0;
        let hasMoreRecords = true;
        while (hasMoreRecords) {
          const url = SoqlUrl.constructUrlForDocumentIds(queryParams, "MasterPersPropApi", batch, limit, offset);
          console.log(url, "MasterPersPropApi.fetchAcrisRecordsByDocumentIds url");
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
      console.error("Error fetching records by document IDs:", err.message);
      return null;
    }
  }

  /**
   * Fetch `document_id` values from the ACRIS Personal Property Master dataset (cross-referenced with Legals dataset).
   *
   * @param {Object} masterQueryParams - Query parameters for the Master dataset.
   * @param {Array<string>} legalsRecordsDocumentIds - Array of document IDs to cross-reference.
   * @param {number} [batchSize=500] - Number of document IDs per batch.
   * @returns {Array<string>} - Fetched `document_id` values.
   */
  static async fetchAcrisDocumentIdsCrossRef(masterQueryParams, legalsRecordsDocumentIds, batchSize = 500) {
    try {
      console.log("fetchAcrisDocumentIdsCrossRef called with masterQueryParams:", masterQueryParams);
      console.log("fetchAcrisDocumentIdsCrossRef called with legalsRecordsDocumentIds (first 10):", legalsRecordsDocumentIds.slice(0, 10));
      console.log("fetchAcrisDocumentIdsCrossRef batchSize:", batchSize);

      const queryUrls = SoqlUrl.constructUrlBatches(masterQueryParams, legalsRecordsDocumentIds, "MasterPersPropApi", batchSize);
      console.log("Constructed queryUrls (count):", queryUrls.length);
      if (queryUrls.length > 0) {
        console.log("First queryUrl:", queryUrls[0]);
      }

      const allDocumentIds = new Set();

      for (const url of queryUrls) {
        let offset = 0;
        let hasMoreRecords = true;

        while (hasMoreRecords) {
          const paginatedUrl = `${url}&$limit=1000&$offset=${offset}`;
          console.log("About to fetch:", paginatedUrl);
          const headers = {
            "Content-Type": "application/json",
            "X-App-Token": process.env.APP_TOKEN,
          };

          const { data } = await axios.get(paginatedUrl, { headers });

          if (!data?.length) {
            hasMoreRecords = false;
          } else {
            data.forEach(record => allDocumentIds.add(record.document_id));
            offset += 1000;
          }
        }
      }

      console.log("Total unique document_ids found:", allDocumentIds.size);

      if (allDocumentIds.size === 0) {
        throw new NotFoundError("No Personal Property Master records found from 'MasterPersPropApi.fetchAcrisDocumentIdsCrossRef'.");
      }

      return Array.from(allDocumentIds);
    } catch (err) {
      console.error("Error fetching document IDs from Personal Property Master API (cross-ref):", err.message);
      throw new Error("Failed to fetch document IDs from Personal Property Master API (cross-ref)");
    }
  }
}

module.exports = MasterPersPropApi;