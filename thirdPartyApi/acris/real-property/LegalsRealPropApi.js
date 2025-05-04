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
    if (borough) conditions.push(`borough=${borough}`);
    if (block) conditions.push(`block=${block}`);
    if (lot) conditions.push(`lot=${lot}`);

    const whereClause = conditions.length > 0 ? `$where=${conditions.join(" AND ")}` : "";

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

    const batches = [];
    for (let i = 0; i < partiesDocIdsCrossRefMaster.length; i += batchSize) {
      const batch = partiesDocIdsCrossRefMaster.slice(i, i + batchSize);
      const documentIdsCondition = `document_id IN (${batch.map(id => `'${id}'`).join(", ")})`;
      const separator = baseUrl.includes("$where=") ? " AND " : "$where=";
      const url = `${baseUrl}${separator}${documentIdsCondition}&$select=document_id`;
      batches.push(url);
    }

    return batches;
  }


  /**
   * Fetch data from the ACRIS Real Property Legals dataset.
   * @param {Object} query - Query parameters.
   * @returns {Array} - Fetched records.
   */
  static async fetchFromAcris(query) {
    try {
      const url = this.constructLegalsUrl(query);

      // Define the headers object
      const headers = {
        "Content-Type": "application/json",
        "X-App-Token": process.env.NYC_OPEN_DATA_APP_TOKEN,
      };

      // Make the GET request
      const { data } = await axios.get(url, { headers });

      if (!data?.length) {
        console.warn(`No records found for query: ${JSON.stringify(query)}`);
        throw new NotFoundError("No records found for the given query.");
      }

      return data;
    } catch (err) {
      throw new NotFoundError(`No records found for query: ${JSON.stringify(query)}`);
    }
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
      const url = this.constructLegalsUrlCountRec(query);

      const headers = {
        "Content-Type": "application/json",
        "X-App-Token": process.env.NYC_OPEN_DATA_APP_TOKEN,
      };

      const { data } = await axios.get(url, { headers });

      if (!data?.length || !data[0]?.count) {
        console.warn(`No count data found for query: ${JSON.stringify(query)}`);
        throw new NotFoundError("No count data found for the given query.");
      }

      // Return the count of unique `document_id` values
      return Number(data[0].count);
    } catch (err) {
      throw new Error("Failed to fetch count from ACRIS API");
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
          const paginatedUrl = `${url}&$limit=1000&$offset=${offset}`;
          console.log("Fetching URL:", paginatedUrl);

          const headers = {
            "Content-Type": "application/json",
            "X-App-Token": process.env.NYC_OPEN_DATA_APP_TOKEN,
          };

          const { data } = await axios.get(paginatedUrl, { headers });

          if (!data?.length) {
            console.warn(`No records found for query: ${JSON.stringify(query)}`);
            throw new NotFoundError("No records found for the given query.");
          }

          data.forEach(record => allDocumentIds.add(record.document_id));

          if (records.length < 1000) {
            hasMoreRecords = false;
          } else {
            offset += 1000;
          }
        }
      }

      return Array.from(allDocumentIds); 
    } catch (err) {
      console.error("Error fetching document IDs from ACRIS API:", err.message);
      throw new Error("Failed to fetch document IDs from ACRIS API");
    }
  }
}
module.exports = LegalsRealPropApi;