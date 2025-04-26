"use strict";

const axios = require("axios");
const { NotFoundError } = require("../../../expressError");
const API_ENDPOINTS = require("../../apiEndpoints");

/** Functions for interacting with the ACRIS Real Property Legals API. */

class LegalsRealPropApi {
  /**
   * Constructs a SoQL query URL for the Real Property Legals dataset.
   *
   * @param {Object} params - Query parameters for the Legals dataset.
   * @param {string} [params.document_id] - Document ID.
   * @param {string} [params.record_type] - Record type.
   * @param {string} [params.easement] - Easement.
   * @param {string} [params.partial_lot] - Partial lot.
   * @param {string} [params.air_rights] - Air rights.
   * @param {string} [params.subterranean_rights] - Subterranean rights.
   * @param {string} [params.property_type] - Property type.
   * @param {string} [params.street_number] - Street number.
   * @param {string} [params.street_name] - Street name.
   * @param {string} [params.unit] - Unit.
   * @param {string} [params.good_through_date] - Good through date.
   * @param {number} [params.borough] - Borough.
   * @param {number} [params.block] - Block.
   * @param {number} [params.lot] - Lot.
   * @returns {string} - Constructed SoQL query URL.
   */
  static constructLegalsUrl({
    document_id,
    record_type,
    easement,
    partial_lot,
    air_rights,
    subterranean_rights,
    property_type,
    street_number,
    street_name,
    unit,
    good_through_date,
    borough,
    block,
    lot,
  } = {}) {
    const conditions = [];

    // Add conditions for text fields
    if (document_id) conditions.push(`upper(document_id)=upper('${document_id}')`);
    if (record_type) conditions.push(`record_type='${record_type}'`);
    if (easement) conditions.push(`easement='${easement}'`);
    if (partial_lot) conditions.push(`partial_lot='${partial_lot}'`);
    if (air_rights) conditions.push(`air_rights='${air_rights}'`);
    if (subterranean_rights) conditions.push(`subterranean_rights='${subterranean_rights}'`);
    if (property_type) conditions.push(`property_type='${property_type}'`);
    if (street_number) conditions.push(`street_number='${street_number}'`);
    if (street_name) conditions.push(`street_name='${street_name}'`);
    if (unit) conditions.push(`unit='${unit}'`);
    if (good_through_date) conditions.push(`good_through_date='${good_through_date}'`);

    // Add conditions for number fields
    if (borough) conditions.push(`borough=${borough}`);
    if (block) conditions.push(`block=${block}`);
    if (lot) conditions.push(`lot=${lot}`);

    // Construct the $where clause
    const whereClause = conditions.length > 0 ? `$where=${conditions.join(" AND ")}` : "";

    // Construct the full URL
    const url = `${API_ENDPOINTS.realPropertyLegals}?${whereClause}`;
    return url;
  }

  /**
   * Fetch data from the ACRIS Real Property Legals dataset.
   * @param {Object} query - Query parameters.
   * @returns {Array} - Fetched records.
   */
  static async fetchFromAcris(query) {
    try {
      // Construct the URL with query parameters
      const url = this.constructLegalsUrl(query);
      console.log("Constructed URL:", url);

      // Make the GET request to the NYC Open Data API
      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          "X-App-Token": process.env.APP_TOKEN, // Ensure APP_TOKEN is set in your environment
        },
      });

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

module.exports = LegalsRealPropApi;