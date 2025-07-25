"use strict";

const axios = require("axios");
const { NotFoundError } = require("../../../expressError");
const SoqlUrl = require("../utils/SoqlUrl");
const batchArray = require("../utils/CreateUrlBatchesArray");

/** Functions for interacting with the ACRIS Personal Property Parties API. */
class PartiesPersPropApi {
  /**
   * Fetch all records from the ACRIS Personal Property Parties dataset matching `partiesQueryParams` parameters.
   *
   * @param {Object} partiesQueryParams - Query parameters for the Parties dataset.
   * @returns {Array} - Fetched records.
   */
  static async fetchAcrisRecords(partiesQueryParams) {
    try {
      const url = SoqlUrl.constructUrl(
        partiesQueryParams,
        "PartiesPersPropApi",
        "records"
      );
      const headers = {
        "Content-Type": "application/json",
        "X-App-Token": process.env.APP_TOKEN,
      };

      const { data } = await axios.get(url, { headers });

      if (!data?.length) {
        throw new NotFoundError(
          "No records found for the given query from Personal Property Parties API."
        );
      }

      return data;
    } catch (err) {
      throw new Error(
        "Failed to fetch records from Personal Property Parties API"
      );
    }
  }

  /**
   * Fetch the count of matching records from the ACRIS Personal Property Parties dataset.
   *
   * @param {Object} partiesQueryParams - Query parameters for the Parties dataset.
   * @returns {number} - Count of matching records.
   */
  static async fetchAcrisRecordCount(partiesQueryParams) {
    try {
      const url = SoqlUrl.constructUrl(
        partiesQueryParams,
        "PartiesPersPropApi",
        "countAll"
      );
      const headers = {
        "Content-Type": "application/json",
        "X-App-Token": process.env.APP_TOKEN,
      };

      const { data } = await axios.get(url, { headers });

      if (!data?.length || !data[0]?.count) {
        throw new NotFoundError(
          "No count data found for the given query from Personal Property Parties API."
        );
      }

      return Number(data[0].count);
    } catch (err) {
      throw new Error(
        "Failed to fetch record count from Personal Property Parties API"
      );
    }
  }

  /**
   * Fetch all `document_id` values from the ACRIS Personal Property Parties dataset matching `partiesQueryParams` parameters.
   *
   * @param {Object} partiesQueryParams - Query parameters for the Parties dataset.
   * @returns {Array} - Fetched `document_id` values.
   */
  static async fetchAcrisDocumentIds(partiesQueryParams) {
    try {
      const url = SoqlUrl.constructUrl(
        partiesQueryParams,
        "PartiesPersPropApi",
        "document_id"
      );
      const headers = {
        "Content-Type": "application/json",
        "X-App-Token": process.env.APP_TOKEN,
      };

      const { data } = await axios.get(url, { headers });

      if (!data?.length) {
        throw new NotFoundError(
          "No document IDs found for the given query from Personal Property Parties API."
        );
      }

      return data.map((record) => record.document_id);
    } catch (err) {
      throw new Error(
        "Failed to fetch document IDs from PartiesPersPropApi.fetchAcrisDocumentIds"
      );
    }
  }

  /**
   * Fetch `document_id` values from the ACRIS Personal Property Parties dataset (cross-referenced with Master dataset).
   *
   * @param {Object} partiesQueryParams - Query parameters for the Parties dataset.
   * @param {Array<string>} masterRecordsDocumentIds - Array of document IDs to cross-reference.
   * @param {number} batchSize - Number of document IDs per batch.
   * @returns {Array} - Fetched `document_id` values.
   */
  static async fetchAcrisDocumentIdsCrossRef(
    partiesQueryParams,
    masterRecordsDocumentIds,
    batchSize = 500
  ) {
    try {
      const queryUrls = SoqlUrl.constructUrlBatches(
        partiesQueryParams,
        masterRecordsDocumentIds,
        "PartiesPersPropApi",
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
          "No Personal Property Parties records found from 'fetchAcrisDocumentIdsCrossRef'."
        );
      }

      return Array.from(allDocumentIds);
    } catch (err) {
      throw new Error(
        "Failed to fetch document IDs from PartiesPersPropApi.fetchAcrisDocumentIdsCrossRef"
      );
    }
  }

  /**
   * Fetch all records from the ACRIS Personal Property Parties dataset for an array of document_id values.
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
            "PartiesPersPropApi",
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

  // Alias methods for consistency with route expectations
  static async fetchFromAcris(queryParams) {
    return await this.fetchAcrisRecords(queryParams);
  }

  static async fetchCountFromAcris(queryParams) {
    return await this.fetchAcrisRecordCount(queryParams);
  }

  static async fetchDocIdsFromAcris(queryParams) {
    return await this.fetchAcrisDocumentIds(queryParams);
  }

  static async fetchDocIdsFromAcrisCrossRefMaster(
    queryParams,
    masterRecordsDocumentIds,
    batchSize = 500
  ) {
    return await this.fetchAcrisDocumentIdsCrossRef(
      queryParams,
      masterRecordsDocumentIds,
      batchSize
    );
  }
}

module.exports = PartiesPersPropApi;
