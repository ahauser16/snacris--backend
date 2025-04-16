"use strict";

const axios = require("axios");
const { NotFoundError } = require("../../../expressError");
const API_ENDPOINTS = require("../../apiEndpoints");

/** Functions for interacting with the ACRIS Real Property Parties API. */

class PartiesRealPropApi {
  /**
   * Constructs a SoQL query URL for the Real Property Parties dataset.
   *
   * @param {Object} params - Optional query parameters.
   * @param {string} [params.document_id] - Document ID.
   * @param {string} [params.party_type] - Party type.
   * @param {string} [params.name] - Party name.
   * @param {string} [params.address_1] - Address line 1.
   * @param {string} [params.address_2] - Address line 2.
   * @param {string} [params.country] - Country.
   * @param {string} [params.city] - City.
   * @param {string} [params.state] - State.
   * @param {string} [params.zip] - ZIP code.
   * @returns {string} - Constructed SoQL query URL.
   */
  static constructPartiesUrl({
    document_id,
    party_type,
    name,
    address_1,
    address_2,
    country,
    city,
    state,
    zip,
  } = {}) {
    const conditions = [];
    //NB: Explanation of a "Gotcha Moment":
    //Remember to ensure that the `%` characters in the `LIKE` clause are properly URL-encoded by using `encodeURIComponent` to encode the entire `$where` clause.

    // Add conditions for each parameter if provided
    if (document_id) conditions.push(`document_id='${document_id}'`);
    if (party_type) conditions.push(`party_type='${party_type}'`);
    if (name) conditions.push(`name LIKE '%${encodeURIComponent(name)}%'`); // Properly encode the name by wrapping it in `encodeURIComponent`
    if (address_1) conditions.push(`address_1="${address_1}"`);
    if (address_2) conditions.push(`address_2="${address_2}"`);
    if (country) conditions.push(`country="${country}"`);
    if (city) conditions.push(`city="${city}"`);
    if (state) conditions.push(`state="${state}"`);
    if (zip) conditions.push(`zip='${zip}'`);

    // Construct the $where clause so that it is wrapped in `encodeURIComponent` function to ensure that all special characters (including %) are properly URL-encoded.
    const whereClause = conditions.length > 0 ? `$where=${encodeURIComponent(conditions.join(" AND "))}` : "";

    // Construct the full URL
    const url = `${API_ENDPOINTS.realPropertyParties}?${whereClause}`;
    return url;
  }

  /**
   * Fetch data from the ACRIS Real Property Parties dataset.
   * @param {Object} query - Query parameters.
   * @returns {Array} - Fetched records.
   */
  static async fetchFromAcris(query) {
    try {
      // Construct the URL with query parameters
      const url = this.constructPartiesUrl(query);
      console.log("fetchFromAcris Constructed URL:", url);

      // Make the GET request to the NYC Open Data API
      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          "X-App-Token": process.env.APP_TOKEN, // Ensure APP_TOKEN is set in your environment
        },
      });

      // Log the response data for debugging
      console.log("Response Data:", response.data);

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

module.exports = PartiesRealPropApi;