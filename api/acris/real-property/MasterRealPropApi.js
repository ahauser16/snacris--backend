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
     * @param {string} [params.crfn] - CRFN.
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
    if (document_id) conditions.push(`document_id='${document_id}'`);
    if (crfn) conditions.push(`crfn='${crfn}'`);
    if (recorded_borough) conditions.push(`recorded_borough='${recorded_borough}'`);
    if (doc_type) conditions.push(`doc_type='${doc_type}'`);

    // Format document_date_start and document_date_end to YYYYMMDD
    if (document_date_start && document_date_end) {
      // const formattedStart = document_date_start.replace(/-/g, ""); // Convert YYYY-MM-DD to YYYYMMDD
      // const formattedEnd = document_date_end.replace(/-/g, "");     // Convert YYYY-MM-DD to YYYYMMDD
      // conditions.push(`document_date between '${formattedStart}' and '${formattedEnd}'`);
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
   * Fetch data from the ACRIS Real Property Master dataset.
   * @param {Object} query - Query parameters.
   * @returns {Array} - Fetched records.
   */

  static async fetchFromAcris(query) {
    try {
      // Construct the URL with query parameters
      const url = this.constructMasterUrl(query);
      console.log("Constructed URL:", url);

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
      // console.log("Response Data:", response.data);

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
}

module.exports = MasterRealPropApi;