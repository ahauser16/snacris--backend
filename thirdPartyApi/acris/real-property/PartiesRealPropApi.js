"use strict";

const axios = require("axios");
const { NotFoundError } = require("../../../expressError");
const SoqlUrl = require("../utils/SoqlUrl");
const batchArray = require("../utils/CreateUrlBatchesArray");

class PartiesRealPropApi {
  /**
   * Fetch all records from the ACRIS Real Property Parties dataset matching `partiesQueryParams` parameters.
   *
   * @param {Object} partiesQueryParams - Query parameters for the Parties dataset.
   * @returns {Array} - Fetched records.
   *
   */
  static async fetchAcrisRecords(partiesQueryParams) {
    try {
      const url = SoqlUrl.constructUrl(
        partiesQueryParams,
        "PartiesRealPropApi",
        "records"
      );

      const headers = {
        "Content-Type": "application/json",
        "X-App-Token": process.env.NYC_OPEN_DATA_APP_TOKEN,
      };

      const { data } = await axios.get(url, { headers });

      if (!Array.isArray(data) || !data.length) {
        throw new NotFoundError(
          "No records found for the given query from Real Property Parties API."
        );
      }

      return data;
    } catch (err) {
      // If it's already a NotFoundError, re-throw it as is
      if (err instanceof NotFoundError) {
        throw err;
      }
      // Otherwise, wrap other errors (network errors, etc.)

      throw new Error("Failed to fetch records from Real Property Parties API");
    }
  }

  /**
   * Fetch the count of matching records from the ACRIS Real Property Parties dataset.
   *
   * @param {Object} partiesQueryParams - Query parameters for the Parties dataset.
   * @returns {number} - Count of matching records.
   */
  static async fetchAcrisRecordCount(partiesQueryParams) {
    try {
      const url = SoqlUrl.constructUrl(
        partiesQueryParams,
        "PartiesRealPropApi",
        "countAll"
      );

      const headers = {
        "Content-Type": "application/json",
        "X-App-Token": process.env.NYC_OPEN_DATA_APP_TOKEN,
      };

      const { data } = await axios.get(url, { headers });

      if (!Array.isArray(data) || !data.length || !data[0]?.count) {
        throw new NotFoundError(
          "No count data found for the given query from Real Property Parties API."
        );
      }

      return Number(data[0].count);
    } catch (err) {
      // If it's already a NotFoundError, re-throw it as is
      if (err instanceof NotFoundError) {
        throw err;
      }
      // Otherwise, wrap other errors (network errors, etc.)

      throw new Error(
        "Failed to fetch record count from Real Property Parties API"
      );
    }
  }

  /**
   * Fetch all `document_id` values from the ACRIS Real Property Parties dataset matching `partiesQueryParams` parameters.
   *
   * @param {Object} partiesQueryParams - Query parameters for the Parties dataset.
   * @returns {Array} - Fetched `document_id` values.
   *
   */
  static async fetchAcrisDocumentIds(partiesQueryParams) {
    try {
      const url = SoqlUrl.constructUrl(
        partiesQueryParams,
        "PartiesRealPropApi",
        "document_id"
      );

      const headers = {
        "Content-Type": "application/json",
        "X-App-Token": process.env.NYC_OPEN_DATA_APP_TOKEN,
      };

      const { data } = await axios.get(url, { headers });

      if (!Array.isArray(data) || !data.length) {
        throw new NotFoundError(
          "No document IDs found for the given query from Real Property Parties API."
        );
      }

      return data.map((record) => record.document_id);
    } catch (err) {
      // If it's already a NotFoundError, re-throw it as is
      if (err instanceof NotFoundError) {
        throw err;
      }
      // Otherwise, wrap other errors (network errors, etc.)

      throw new Error(
        "Failed to fetch document IDs from PartiesRealPropApi.fetchAcrisDocumentIds"
      );
    }
  }

  /**
   * Fetch `document_id` values from the ACRIS Real Property Parties dataset (cross-referenced with Master dataset).
   *
   * @param {Object} partiesQueryParams - Query parameters for the Parties dataset.
   * @param {Array<string>} masterRecordsDocumentIds - Array of document IDs to cross-reference.
   * @returns {Array} - Fetched `document_id` values.
   *
   */
  static async fetchAcrisDocumentIdsCrossRef(
    partiesQueryParams,
    masterRecordsDocumentIds,
    batchSize = 500
  ) {
    try {
      // Construct batch query URLs
      const queryUrls = SoqlUrl.constructUrlBatches(
        partiesQueryParams,
        masterRecordsDocumentIds,
        "PartiesRealPropApi",
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
          "No Real Property Parties records found from 'fetchAcrisDocumentIdsCrossRef'."
        );
      }

      return Array.from(allDocumentIds);
    } catch (err) {
      throw new Error(
        "Failed to fetch document IDs from PartiesRealPropApi.fetchAcrisDocumentIdsCrossRef"
      );
    }
  }

  /**
   * Fetch all records from the ACRIS Real Property Parties dataset for an array of document_id values.
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
            "PartiesRealPropApi",
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

module.exports = PartiesRealPropApi;
