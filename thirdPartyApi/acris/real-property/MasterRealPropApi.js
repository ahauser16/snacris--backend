"use strict";

const axios = require("axios");
const SoqlUrl = require("../utils/SoqlUrl");
const { BadRequestError, NotFoundError } = require("../../../expressError");
const batchArray = require("../utils/CreateUrlBatchesArray");

/** Functions for interacting with the ACRIS Real Property Master API. */

class MasterRealPropApi {
  /**
   * Fetch all records from the ACRIS Real Property Master dataset using pagination.
   *
   * @param {Object} masterQueryParams - Query parameters for the Master dataset.
   * @param {number} [limit=5000] - Maximum number of records to fetch per request.
   * @returns {Array} - Fetched records.
   */
  static async fetchAcrisRecords(masterQueryParams, limit = 1000) {
    try {
      let offset = 0;
      let hasMoreRecords = true;
      const allRecords = [];

      while (hasMoreRecords) {
        const url = SoqlUrl.constructUrl(
          masterQueryParams,
          "MasterRealPropApi",
          "records",
          limit,
          offset
        );

        const headers = {
          "Content-Type": "application/json",
          "X-App-Token": process.env.NYC_OPEN_DATA_APP_TOKEN,
        };

        const { data } = await axios.get(url, { headers });

        if (!Array.isArray(data) || !data.length) {
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
        throw new NotFoundError(
          "No records found for the given query from Real Property Master API."
        );
      }

      return allRecords;
    } catch (err) {
      // Re-throw NotFoundError as-is, wrap other errors
      if (err instanceof NotFoundError) {
        throw err;
      }

      throw new Error("Failed to fetch records from Real Property Master API");
    }
  }

  /**
   * Fetch the count of matching records from the ACRIS Real Property Master dataset.
   *
   * @param {Object} masterQueryParams - Query parameters for the Master dataset.
   * @returns {number} - Count of matching records.
   */
  static async fetchAcrisRecordCount(masterQueryParams) {
    try {
      const url = SoqlUrl.constructUrl(
        masterQueryParams,
        "MasterRealPropApi",
        "countAll"
      );

      const headers = {
        "Content-Type": "application/json",
        "X-App-Token": process.env.NYC_OPEN_DATA_APP_TOKEN,
      };

      const { data } = await axios.get(url, { headers });

      if (!Array.isArray(data) || !data.length || !data[0]?.count) {
        throw new NotFoundError(
          "No count data found for the given query from Real Property Master API."
        );
      }

      return Number(data[0].count);
    } catch (err) {
      // Re-throw NotFoundError as-is, wrap other errors
      if (err instanceof NotFoundError) {
        throw err;
      }

      throw new Error(
        "Failed to fetch record count from Real Property Master API"
      );
    }
  }

  /**
   * Fetch all `document_id` values from the ACRIS Real Property Master dataset using pagination.
   *
   * @param {Object} masterQueryParams - Query parameters for the Master dataset.
   * @param {number} [limit=5000] - Maximum number of records to fetch per request.
   * @returns {Array} - Array of unique `document_id` values.
   */
  static async fetchAcrisDocumentIds(masterQueryParams, limit = 1000) {
    try {
      let offset = 0;
      let hasMoreRecords = true;
      const documentIds = new Set();

      while (hasMoreRecords) {
        const url = SoqlUrl.constructUrl(
          masterQueryParams,
          "MasterRealPropApi",
          "document_id",
          limit,
          offset
        );

        const headers = {
          "Content-Type": "application/json",
          "X-App-Token": process.env.NYC_OPEN_DATA_APP_TOKEN,
        };

        const { data } = await axios.get(url, { headers });

        if (!Array.isArray(data) || !data.length) {
          hasMoreRecords = false;
        } else {
          data.forEach((record) => documentIds.add(record.document_id));
          offset += limit;
          if (data.length < limit) {
            hasMoreRecords = false;
          }
        }
      }

      if (!documentIds.size) {
        throw new NotFoundError(
          "No document IDs found for the given query from Real Property Master API."
        );
      }

      return Array.from(documentIds);
    } catch (err) {
      // Re-throw NotFoundError as-is, wrap other errors
      if (err instanceof NotFoundError) {
        throw err;
      }

      throw new Error(
        "Failed to fetch document IDs from Real Property Master API"
      );
    }
  }

  /**
   * Fetch all records from the ACRIS Real Property Master dataset for an array of document_id values.
   * @param {Array<string>} documentIds - Array of document_id values.
   * @param {Object} [queryParams={}] - Additional query parameters.
   * @param {number} [limit=1000] - Pagination limit.
   * @returns {Array} - Fetched records.
   */
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
            "MasterRealPropApi",
            batch,
            limit,
            offset
          );

          const headers = {
            "Content-Type": "application/json",
            "X-App-Token": process.env.NYC_OPEN_DATA_APP_TOKEN,
          };
          const { data } = await axios.get(url, { headers });
          if (!Array.isArray(data) || !data.length) {
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

  /**
   * Fetch `document_id` values from the ACRIS Real Property Master dataset (cross-referenced with Legals dataset).
   *
   * @param {Object} masterQueryParams - Query parameters for the Master dataset.
   * @param {Array<string>} legalsRecordsDocumentIds - Array of document IDs to cross-reference.
   * @param {number} [batchSize=500] - Number of document IDs per batch.
   * @returns {Array<string>} - Fetched `document_id` values.
   */
  static async fetchAcrisDocumentIdsCrossRef(
    masterQueryParams,
    legalsRecordsDocumentIds,
    batchSize = 500
  ) {
    try {
      // 2. Build batch URLs for querying the API with document_id IN (...)
      const queryUrls = SoqlUrl.constructUrlBatches(
        masterQueryParams,
        legalsRecordsDocumentIds,
        "MasterRealPropApi",
        batchSize
      );

      // 3. Prepare a set to collect unique document_ids from all batches
      const allDocumentIds = new Set();

      // 4. For each batch URL
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

          if (!Array.isArray(data) || !data.length) {
            hasMoreRecords = false;
          } else {
            data.forEach((record) => allDocumentIds.add(record.document_id));
            offset += 1000;
          }
        }
      }

      // 9. If no document_ids found, throw error
      if (allDocumentIds.size === 0) {
        throw new NotFoundError(
          "No Real Property Master records found from 'MasterRealPropApi.fetchAcrisDocumentIdsCrossRef'."
        );
      }

      // 10. Return array of unique document_ids
      return Array.from(allDocumentIds);
    } catch (err) {
      throw new Error(
        "Failed to fetch document IDs from Real Property Master API (cross-ref)"
      );
    }
  }
}

module.exports = MasterRealPropApi;
