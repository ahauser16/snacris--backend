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
   * Constructs a SoQL query URL to count matching records in the Real Property Legals dataset.
   *
   * @param {Object} params - Query parameters for the Legals dataset.
   * @returns {string} - Constructed SoQL query URL for counting records.
   */
  static constructLegalsUrlCountRec(params = {}) {
    const baseUrl = this.constructLegalsUrl(params);
    return `${baseUrl}&$select=count(*)`;
  }


  /**
     * Constructs a SoQL query URL for the Real Property Legals dataset (cross-referenced with Parties dataset, selecting only `document_id` values).
     *
     * @param {Object} legalsQueryParams - Query parameters for the Legals dataset.
     * @param {Array<string>} partiesDocIdsCrossRefMaster - Array of document IDs to cross-reference.
     * @param {number} batchSize - Number of document IDs per batch.
     * @returns {Array<string>} - Array of constructed query URLs.
     */
  static constructLegalsUrlCrossRefPartiesSelectDocIds(legalsQueryParams, partiesDocIdsCrossRefMaster, batchSize = 500) {
    const baseUrl = this.constructLegalsUrl(legalsQueryParams);

    // Split `partiesDocIdsCrossRefMaster` into batches
    const batches = [];
    for (let i = 0; i < partiesDocIdsCrossRefMaster.length; i += batchSize) {
      const batch = partiesDocIdsCrossRefMaster.slice(i, i + batchSize);
      const documentIdsCondition = `document_id IN (${batch.map(id => `'${id}'`).join(", ")})`;
      const separator = baseUrl.includes("$where=") ? " AND " : "$where=";
      const url = `${baseUrl}${separator}${documentIdsCondition}&$select=document_id`;
      batches.push(url);
    }

    return batches; // Return an array of query URLs
  }


  /**
   * Fetch the count of matching records from the ACRIS Real Property Legals dataset.
   *
   * @param {Object} query - Query parameters.
   * @returns {Object} - An object containing the count of matching records.
   * @throws {Error} - If the count is not a valid number or if the API call fails.
   */
  static async fetchCountFromAcris(query) {
    try {
      // Construct the URL for counting records
      const url = this.constructLegalsUrlCountRec(query);
      console.log("constructLegalsUrlCountRec created:", url);

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

      return { legalsRecordCount: count };
    } catch (err) {
      console.error("Error fetching count from ACRIS API:", err.message);
      throw new Error("Failed to fetch count from ACRIS API");
    }
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

  /**
   * Fetch `document_id` values from the ACRIS Real Property Legals dataset (cross-referenced with Parties dataset).
   *
   * @param {Object} legalsQueryParams - Query parameters for the Legals dataset.
   * @param {Array<string>} partiesDocIdsCrossRefMaster - Array of document IDs to cross-reference.
   * @param {number} batchSize - Number of document IDs per batch.
   * @returns {Array<string>} - Fetched `document_id` values.
   */
  static async fetchDocIdsFromAcrisCrossRefParties(legalsQueryParams, partiesDocIdsCrossRefMaster, batchSize = 500) {
    try {
      // Construct query URLs in batches
      const queryUrls = this.constructLegalsUrlCrossRefPartiesSelectDocIds(legalsQueryParams, partiesDocIdsCrossRefMaster, batchSize);
      const allDocumentIds = new Set();

      for (const url of queryUrls) {
        let offset = 0;
        let hasMoreRecords = true;

        while (hasMoreRecords) {
          // Add pagination parameters
          const paginatedUrl = `${url}&$limit=1000&$offset=${offset}`;
          console.log("Fetching URL:", paginatedUrl);

          // Make the GET request
          const response = await axios.get(paginatedUrl, {
            headers: {
              "Content-Type": "application/json",
              "X-App-Token": process.env.APP_TOKEN, // Ensure APP_TOKEN is set in your environment
            },
          });

          // Add `document_id` values to the set
          const records = response.data;
          records.forEach(record => allDocumentIds.add(record.document_id));

          // Check if there are more records to fetch
          if (records.length < 1000) {
            hasMoreRecords = false;
          } else {
            offset += 1000;
          }
        }
      }

      return Array.from(allDocumentIds); // Return unique `document_id` values
    } catch (err) {
      console.error("Error fetching document IDs from ACRIS API:", err.message);
      throw new Error("Failed to fetch document IDs from ACRIS API");
    }
  }
}
module.exports = LegalsRealPropApi;