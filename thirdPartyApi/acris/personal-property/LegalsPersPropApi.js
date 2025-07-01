"use strict";

const axios = require("axios");
const { NotFoundError } = require("../../../expressError");
const SoqlUrl = require("../utils/SoqlUrl");
const batchArray = require("../utils/CreateUrlBatchesArray");

/** Functions for interacting with the ACRIS Personal Property Legals API. */
class LegalsPersPropApi {
  /**
   * Fetch all records from the ACRIS Personal Property Legals dataset matching `legalsQueryParams` parameters.
   *
   * @param {Object} legalsQueryParams - Query parameters for the Legals dataset.
   * @returns {Array} - Fetched records.
   */
  static async fetchAcrisRecords(legalsQueryParams) {
    try {
      const url = SoqlUrl.constructUrl(
        legalsQueryParams,
        "LegalsPersPropApi",
        "records"
      );
      const headers = {
        "Content-Type": "application/json",
        "X-App-Token": process.env.APP_TOKEN,
      };

      const { data } = await axios.get(url, { headers });

      if (!data?.length) {
        throw new NotFoundError(
          "No records found for the given query from Personal Property Legals API."
        );
      }

      return data;
    } catch (err) {
      throw new Error(
        "Failed to fetch records from Personal Property Legals API"
      );
    }
  }

  /**
   * Fetch the count of matching records from the ACRIS Personal Property Legals dataset.
   *
   * @param {Object} legalsQueryParams - Query parameters for the Legals dataset.
   * @returns {number} - Count of matching records.
   */
  static async fetchAcrisRecordCount(legalsQueryParams) {
    try {
      const url = SoqlUrl.constructUrl(
        legalsQueryParams,
        "LegalsPersPropApi",
        "countAll"
      );
      const headers = {
        "Content-Type": "application/json",
        "X-App-Token": process.env.APP_TOKEN,
      };

      const { data } = await axios.get(url, { headers });

      if (!data?.length || !data[0]?.count) {
        throw new NotFoundError(
          "No count data found for the given query from Personal Property Legals API."
        );
      }

      return Number(data[0].count);
    } catch (err) {
      throw new Error(
        "Failed to fetch record count from Personal Property Legals API"
      );
    }
  }

  /**
   * Fetch all `document_id` values from the ACRIS Personal Property Legals dataset matching `legalsQueryParams` parameters.
   *
   * @param {Object} legalsQueryParams - Query parameters for the Legals dataset.
   * @returns {Array} - Fetched `document_id` values.
   */
  static async fetchAcrisDocumentIds(legalsQueryParams) {
    try {
      const url = SoqlUrl.constructUrl(
        legalsQueryParams,
        "LegalsPersPropApi",
        "document_id"
      );
      const headers = {
        "Content-Type": "application/json",
        "X-App-Token": process.env.APP_TOKEN,
      };

      const { data } = await axios.get(url, { headers });

      if (!data?.length) {
        throw new NotFoundError(
          "No document IDs found for the given query from Personal Property Legals API."
        );
      }

      return data.map((record) => record.document_id);
    } catch (err) {
      throw new Error(
        "Failed to fetch document IDs from Personal Property Legals API"
      );
    }
  }

  /**
   * Fetch `document_id` values from the ACRIS Personal Property Legals dataset (cross-referenced with Parties dataset).
   *
   * @param {Object} legalsQueryParams - Query parameters for the Legals dataset.
   * @param {Array<string>} partiesRecordsDocumentIds - Array of document IDs to cross-reference.
   * @param {number} batchSize - Number of document IDs per batch.
   * @returns {Array<string>} - Fetched `document_id` values.
   */
  static async fetchAcrisDocumentIdsCrossRef(
    legalsQueryParams,
    partiesRecordsDocumentIds,
    batchSize = 500
  ) {
    try {
      const documentIds = partiesRecordsDocumentIds.map((record) =>
        typeof record === "object" && record.document_id
          ? record.document_id
          : record
      );

      const queryUrls = SoqlUrl.constructUrlBatches(
        legalsQueryParams,
        documentIds,
        "LegalsPersPropApi",
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
          "No Personal Property Legals records found for the given query."
        );
      }

      return Array.from(allDocumentIds);
    } catch (err) {
      throw new Error(
        "Failed to fetch document IDs from Personal Property Legals API"
      );
    }
  }

  /**
   * Fetch all records from the ACRIS Personal Property Legals dataset for an array of document_id values.
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
      const BATCH_SIZE = 75;
      let allRecords = [];
      const batches = batchArray(documentIds, BATCH_SIZE);

      for (const batch of batches) {
        let offset = 0;
        let hasMoreRecords = true;
        while (hasMoreRecords) {
          const url = SoqlUrl.constructUrlForDocumentIds(
            queryParams,
            "LegalsPersPropApi",
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

  // Alias methods for route compatibility
  static async fetchFromAcris(query) {
    return this.fetchAcrisRecords(query);
  }

  static async fetchCountFromAcris(query) {
    return this.fetchAcrisRecordCount(query);
  }

  static async fetchDocIdsFromAcrisCrossRefParties(query, partiesDocIds) {
    return this.fetchAcrisDocumentIdsCrossRef(query, partiesDocIds);
  }
}

module.exports = LegalsPersPropApi;
