"use strict";

const axios = require("axios");
const SoqlUrl = require("../utils/SoqlUrl");
const { BadRequestError, NotFoundError } = require("../../../expressError");

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
        const url = SoqlUrl.constructUrl(masterQueryParams, "MasterRealPropApi", "records", limit, offset);
        console.log("'/fetchAcrisRecords(masterQueryParams)' calls 'SoqlUrl.constructUrl' creating:", url);
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
          if (data.length < limit) {
            hasMoreRecords = false;
          }
        }
      }

      if (!allRecords.length) {
        console.warn(`No records found for masterQueryParams: ${JSON.stringify(masterQueryParams)} from Real Property Master API`);
        throw new NotFoundError("No records found for the given query from Real Property Master API.");
      }

      return allRecords;
    } catch (err) {
      console.error("Error fetching records from Real Property Master API:", err.message);
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
      const url = SoqlUrl.constructUrl(masterQueryParams, "MasterRealPropApi", "countAll");
      console.log("'/fetchAcrisRecordCount(masterQueryParams)' calls 'SoqlUrl.constructUrl' creating:", url);
      const headers = {
        "Content-Type": "application/json",
        "X-App-Token": process.env.NYC_OPEN_DATA_APP_TOKEN,
      };

      const { data } = await axios.get(url, { headers });

      if (!data?.length || !data[0]?.count) {
        console.warn(`No count data found for masterQueryParams: ${JSON.stringify(masterQueryParams)} from Real Property Master API`);
        throw new NotFoundError("No count data found for the given query from Real Property Master API.");
      }

      return Number(data[0].count);
    } catch (err) {
      console.error("Error fetching record count from Real Property Master API:", err.message);
      throw new Error("Failed to fetch record count from Real Property Master API");
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
        const url = SoqlUrl.constructUrl(masterQueryParams, "MasterRealPropApi", "document_id", limit, offset);
        console.log("'/fetchAcrisDocumentIds(masterQueryParams)' calls 'SoqlUrl.constructUrl' creating:", url);
        const headers = {
          "Content-Type": "application/json",
          "X-App-Token": process.env.NYC_OPEN_DATA_APP_TOKEN,
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
        console.warn(`No document IDs found for query: ${JSON.stringify(masterQueryParams)} from Real Property Master API`);
        throw new NotFoundError("No document IDs found for the given query from Real Property Master API.");
      }

      return Array.from(documentIds);
    } catch (err) {
      console.error("Error fetching document IDs from Real Property Master API:", err.message);
      throw new Error("Failed to fetch document IDs from Real Property Master API");
    }
  }

  /**
   * Fetch all records from the ACRIS Real Property Master dataset for an array of document_id values.
   * @param {Array<string>} documentIds - Array of document_id values.
   * @param {Object} [queryParams={}] - Additional query parameters.
   * @param {number} [limit=1000] - Pagination limit.
   * @returns {Array} - Fetched records.
   */
  static async fetchAcrisRecordsByDocumentIds(documentIds, queryParams = {}, limit = 1000) {
    try {
      let offset = 0;
      let hasMoreRecords = true;
      const allRecords = [];
      while (hasMoreRecords) {
        const url = SoqlUrl.constructUrlForDocumentIds(queryParams, "MasterRealPropApi", documentIds, limit, offset);
        console.log(url, "MasterRealPropApi.fetchAcrisRecordsByDocumentIds url");
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
      return allRecords.length ? allRecords : null;
    } catch (err) {
      console.error("Error fetching records by document IDs:", err.message);
      return null;
    }
  }
}

module.exports = MasterRealPropApi;