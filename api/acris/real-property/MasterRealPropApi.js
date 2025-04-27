"use strict";

const axios = require("axios");
const { NotFoundError } = require("../../../expressError");
const API_ENDPOINTS = require("../../apiEndpoints");

/** Functions for interacting with the ACRIS Real Property Master API. */

class MasterRealPropApi {

  /**
     * Constructs a SoQL query URL for the Real Property Master dataset.
     *
     * @param {Object} params - Optional query parameters.
     * @param {string} [params.document_id] - Document ID.
     * @param {string} [params.crfn] - City Register Filing Number.
     * @param {string} [params.recorded_borough] - Recorded borough.
     * @param {string} [params.doc_type] - Document type.
     * @param {string} [params.document_date_start] - Start date for document_date range.
     * @param {string} [params.document_date_end] - End date for document_date range.
     * @param {string} [params.document_amt] - Document amount.
     * @param {string} [params.recorded_datetime] - Recorded datetime.
     * @param {string} [params.modified_date] - Modified date.
     * @param {string} [params.reel_yr] - Reel year.
     * @param {string} [params.reel_nbr] - Reel number.
     * @param {string} [params.reel_pg] - Reel page.
     * @param {string} [params.percent_trans] - Percent transaction.
     * @returns {string} - Constructed SoQL query URL.
     */
  static constructMasterUrl({
    document_id,
    crfn,
    recorded_borough,
    doc_type,
    document_date_start,
    document_date_end,
    document_amt,
    recorded_datetime,
    modified_date,
    reel_yr,
    reel_nbr,
    reel_pg,
    percent_trans,
  } = {}) {
    const conditions = [];

    // Add conditions for each parameter if provided
    if (document_id) conditions.push(`upper(document_id)=upper('${document_id}')`);
    if (crfn) conditions.push(`crfn='${crfn}'`);
    if (recorded_borough) conditions.push(`recorded_borough='${recorded_borough}'`);

    // Handle `doc_type` as a single value or an array
    if (doc_type) {
      if (Array.isArray(doc_type)) {
        const docTypeCondition = `doc_type IN (${doc_type.map(type => `'${type}'`).join(", ")})`;
        conditions.push(docTypeCondition);
      } else {
        conditions.push(`doc_type='${doc_type}'`);
      }
    }

    // Format document_date_start and document_date_end to YYYYMMDD
    if (document_date_start && document_date_end) {
      conditions.push(`document_date between '${document_date_start}' and '${document_date_end}'`);
    }

    if (document_amt) conditions.push(`document_amt='${document_amt}'`);
    if (recorded_datetime) conditions.push(`recorded_datetime='${recorded_datetime}'`);
    if (modified_date) conditions.push(`modified_date='${modified_date}'`);
    if (reel_yr) conditions.push(`reel_yr='${reel_yr}'`);
    if (reel_nbr) conditions.push(`reel_nbr='${reel_nbr}'`);
    if (reel_pg) conditions.push(`reel_pg='${reel_pg}'`);
    if (percent_trans) conditions.push(`percent_trans='${percent_trans}'`);

    // Construct the $where clause
    const whereClause = conditions.length > 0 ? `$where=${conditions.join(" AND ")}` : "";

    // Construct the full URL
    const url = `${API_ENDPOINTS.realPropertyMaster}?${whereClause}`;
    return url;
  }

  /**
   * Constructs a SoQL query URL to count matching records in the Real Property Master dataset.
   *
   * @param {Object} params - Optional query parameters (same as constructMasterUrl).
   * @returns {string} - Constructed SoQL query URL for counting records.
   */
  static constructMasterUrlCountRec(params = {}) {
    const baseUrl = this.constructMasterUrl(params);
    return `${baseUrl}&$select=count(*)`;
  }

  /**
   * Constructs a SoQL query URL to retrieve only `document_id` values from the Real Property Master dataset.
   *
   * @param {Object} params - Optional query parameters (same as constructMasterUrl).
   * @returns {string} - Constructed SoQL query URL for selecting `document_id` values.
   */
  static constructMasterUrlSelectDocIds(params = {}) {
    const baseUrl = this.constructMasterUrl(params);
    return `${baseUrl}&$select=document_id`;
  }


  /**
   * Fetch data from the ACRIS Real Property Master dataset.
   * @param {Object} query - Query parameters.
   * @returns {Array} - Fetched records.
   */

  static async fetchFromAcris(query) {
    try {
      // Construct the URL with query parameters
      const url = this.constructMasterUrl(query);
      console.log("constructMasterUrl created:", url);

      // Make the GET request to the NYC Open Data API
      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          "X-App-Token": process.env.APP_TOKEN, // Ensure APP_TOKEN is set in your environment
        },
      });

      // Log the full response object to inspect its structure
      //console.log("Full Response Object:", response);

      // Log the response data specifically
      //console.log("Records Returned from MasterRealPropApi:", response.data);

      // Handle case where no records are found
      if (response.data.length === 0) {
        throw new NotFoundError(`No records found for query: ${JSON.stringify(query)}`);
      }

      return response.data;
    } catch (err) {
      console.error("Error fetching data from ACRIS API:", err.message);
      throw new Error("Failed to fetch data from ACRIS API");
    }
  }

  /**
 * Fetch the count of matching records from the ACRIS Real Property Master dataset.
 *
 * @param {Object} query - Query parameters.
 * @returns {Object} - An object containing the count of matching records.
 * @throws {Error} - If the count is not a valid number or if the API call fails.
 */
  static async fetchCountFromAcris(query) {
    try {
      // Construct the URL for counting records
      const url = this.constructMasterUrlCountRec(query);
      console.log("constructMasterUrlCountRec created:", url);

      // Make the GET request to the NYC Open Data API
      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          "X-App-Token": process.env.APP_TOKEN, // Ensure APP_TOKEN is set in your environment
        },
      });

      // Validate the response
      if (!response.data || response.data.length === 0 || !response.data[0].count) {
        throw new NotFoundError(`No count found for query: ${JSON.stringify(query)}`);
      }

      // Parse and validate the count
      const count = Number(response.data[0].count);
      if (isNaN(count)) {
        throw new Error("Invalid count value received from ACRIS API");
      }

      return { masterRecordCount: count };
    } catch (err) {
      console.error("Error fetching count from ACRIS API:", err.message);
      throw new Error("Failed to fetch count from ACRIS API");
    }
  }
  
  /**
   * Fetch all `document_id` values from the ACRIS Real Property Master dataset using pagination.
   *
   * @param {Object} query - Query parameters.
   * @returns {Object} - An object containing:
   *   - `masterRecordsDocumentIds`: Array of unique `document_id` values.
   *   - `masterRecordsDocumentIds_Duplicates`: Array of duplicate `document_id` values.
   */
  static async fetchDocIdsFromAcris(query) {
    try {
      const limit = 1000; // API record limit per request
      let offset = 0;
      let hasMoreRecords = true;
      // const masterRecordsDocumentIds = new Set(); 
      const masterRecordsDocumentIds = []; // Use an array to store all `document_id` values
      const masterRecordsDocumentIds_Duplicates = []; // To store duplicate `document_id` values
      const seenDocumentIds = new Set(); // To track all `document_id` values seen so far

      while (hasMoreRecords) {
        // Construct the URL with pagination parameters
        const url = `${this.constructMasterUrlSelectDocIds(query)}&$limit=${limit}&$offset=${offset}`;
        console.log("fetchDocIdsFromAcris URL:", url);

        // Make the GET request to the NYC Open Data API
        const response = await axios.get(url, {
          headers: {
            "Content-Type": "application/json",
            "X-App-Token": process.env.APP_TOKEN, // Ensure APP_TOKEN is set in your environment
          },
        });

        // Add `document_id` values to the sets
        const records = response.data;
        records.forEach(record => {
          const documentId = record.document_id;
          if (seenDocumentIds.has(documentId)) {
            // If already seen, add to duplicates
            masterRecordsDocumentIds_Duplicates.push(documentId);
          } else {
            // Otherwise, add to seen and unique IDs
            seenDocumentIds.add(documentId);
            // masterRecordsDocumentIds.add(documentId);
            masterRecordsDocumentIds.push(documentId);
          }
        });

        // Check if there are more records to fetch
        if (records.length < limit) {
          hasMoreRecords = false;
        } else {
          offset += limit;
        }
      }

      // Debugging logs
      // console.log("Unique Document IDs:", Array.from(masterRecordsDocumentIds));
      console.log("Unique Document IDs:", Array.from(seenDocumentIds));
      console.log("Duplicate Document IDs:", masterRecordsDocumentIds_Duplicates);

      return {
        // masterRecordsDocumentIds: Array.from(masterRecordsDocumentIds),
        // masterRecordsDocumentIds_Duplicates: masterRecordsDocumentIds_Duplicates || [],
        masterRecordsDocumentIds,
        masterRecordsDocumentIds_Duplicates,
      };
    } catch (err) {
      console.error("Error fetching document IDs from ACRIS API:", err.message);
      throw new Error("Failed to fetch document IDs from ACRIS API");
    }
  }

}

module.exports = MasterRealPropApi;