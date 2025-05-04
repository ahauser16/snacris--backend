"use strict";

const axios = require("axios");
const API_ENDPOINTS = require("../../apiEndpoints");
const { BadRequestError, NotFoundError } = require("../../../expressError");

/** Functions for interacting with the ACRIS Personal Property Master API. */

class MasterPersPropApi {
  /**
   * Constructs a query URL using Socrata Query Language syntax (SoQL) for the Personal Property Master dataset.
   *
   * @param {Object} params - Optional query parameters.
   * @param {string} [params.document_id] - Document ID.
   * @param {string} [params.record_type] - Record type.
   * @param {string} [params.crfn] - City Register Filing Number.
   * @param {string} [params.recorded_borough] - Recorded borough.
   * @param {string} [params.doc_type] - Document type.
   * @param {string} [params.document_amt] - Document amount.
   * @param {string} [params.recorded_datetime] - Recorded datetime.
   * @param {string} [params.ucc_collateral] - UCC collateral.
   * @param {string} [params.fedtax_serial_nbr] - Federal tax serial number.
   * @param {string} [params.fedtax_assessment_date] - Federal tax assessment date.
   * @param {string} [params.rpttl_nbr] - RPTTL number.
   * @param {string} [params.modified_date] - Modified date.
   * @param {string} [params.reel_yr] - Reel year.
   * @param {string} [params.reel_nbr] - Reel number.
   * @param {string} [params.reel_pg] - Reel page.
   * @param {string} [params.file_nbr] - File number.
   * @param {string} [params.good_through_date] - Good through date.
   * @returns {string} - Constructed SoQL query URL.
   */
  static constructMasterUrl({
    document_id,
    record_type,
    crfn,
    recorded_borough,
    doc_type,
    document_amt,
    recorded_datetime,
    ucc_collateral,
    fedtax_serial_nbr,
    fedtax_assessment_date,
    rpttl_nbr,
    modified_date,
    reel_yr,
    reel_nbr,
    reel_pg,
    file_nbr,
    good_through_date,
  } = {}) {
    const conditions = [];

    // Normalize `doc_type` into an array if it is a comma-separated string
    if (doc_type && typeof doc_type === "string") {
      doc_type = doc_type.split(",");
    }

    if (document_id) conditions.push(`upper(document_id)=upper('${document_id}')`);
    if (record_type) conditions.push(`record_type='${record_type}'`);
    if (crfn) conditions.push(`crfn='${crfn}'`);
    if (recorded_borough) conditions.push(`recorded_borough='${recorded_borough}'`);

    if (doc_type) {
      if (Array.isArray(doc_type)) {
        const docTypeCondition = `doc_type IN (${doc_type
          .map(type => `'${encodeURIComponent(type.trim())}'`)
          .join(", ")})`;
        conditions.push(docTypeCondition);
      } else {
        conditions.push(`doc_type='${encodeURIComponent(doc_type.trim())}'`);
      }
    }

    if (document_amt) conditions.push(`document_amt='${document_amt}'`);
    if (recorded_datetime) conditions.push(`recorded_datetime='${recorded_datetime}'`);
    if (ucc_collateral) conditions.push(`ucc_collateral='${ucc_collateral}'`);
    if (fedtax_serial_nbr) conditions.push(`fedtax_serial_nbr='${fedtax_serial_nbr}'`);
    if (fedtax_assessment_date) conditions.push(`fedtax_assessment_date='${fedtax_assessment_date}'`);
    if (rpttl_nbr) conditions.push(`rpttl_nbr='${rpttl_nbr}'`);
    if (modified_date) conditions.push(`modified_date='${modified_date}'`);
    if (reel_yr) conditions.push(`reel_yr='${reel_yr}'`);
    if (reel_nbr) conditions.push(`reel_nbr='${reel_nbr}'`);
    if (reel_pg) conditions.push(`reel_pg='${reel_pg}'`);
    if (file_nbr) conditions.push(`file_nbr='${file_nbr}'`);
    if (good_through_date) conditions.push(`good_through_date='${good_through_date}'`);

    const whereClause = conditions.length > 0 ? `$where=${conditions.join(" AND ")}` : "";

    const url = `${API_ENDPOINTS.personalPropertyMaster}?${whereClause}`;
    return url;
  }

  /**
   * Constructs a SoQL query URL to count matching records in the Personal Property Master dataset.
   *
   * @param {Object} params - Optional query parameters (same as constructMasterUrl).
   * @returns {string} - Constructed SoQL query URL for counting records.
   */
  static constructMasterUrlCountRec(params = {}) {
    const baseUrl = this.constructMasterUrl(params);
    return `${baseUrl}&$select=count(*)`;
  }

  /**
   * Constructs a SoQL query URL to retrieve only `document_id` values from the Personal Property Master dataset.
   *
   * @param {Object} params - Optional query parameters (same as constructMasterUrl).
   * @returns {string} - Constructed SoQL query URL for selecting `document_id` values.
   */
  static constructMasterUrlSelectDocIds(params = {}) {
    const baseUrl = this.constructMasterUrl(params);
    return `${baseUrl}&$select=document_id`;
  }

  /**
   * Fetch data from the ACRIS Personal Property Master dataset.
   * @param {Object} query - Query parameters.
   * @returns {Array} - Fetched records.
   */
  static async fetchFromAcris(query) {
    try {
      const url = this.constructMasterUrl(query);
      console.log("Constructed URL:", url);

      const headers = {
        "Content-Type": "application/json",
        "X-App-Token": process.env.APP_TOKEN,
      };

      const { data } = await axios.get(url, { headers });

      if (!data?.length) {
        console.warn(`No records found for query: ${JSON.stringify(query)}`);
        throw new NotFoundError("No records found for the given query.");
      }

      return data;
    } catch (err) {
      console.error("Error fetching data from ACRIS API:", err.message);
      throw new Error("Failed to fetch data from ACRIS API.");
    }
  }

  /**
   * Fetch the count of matching records from the ACRIS Personal Property Master dataset.
   *
   * @param {Object} query - Query parameters.
   * @returns {number} - Count of matching records.
   */
  static async fetchCountFromAcris(query) {
    try {
      const url = this.constructMasterUrlCountRec(query);
      console.log("constructMasterUrlCountRec output:", url);

      const headers = {
        "Content-Type": "application/json",
        "X-App-Token": process.env.APP_TOKEN,
      };

      const { data } = await axios.get(url, { headers });

      if (!data?.length || !data[0]?.count) {
        console.warn(`No count data found for query: ${JSON.stringify(query)}`);
        throw new NotFoundError("No count data found for the given query.");
      }

      return Number(data[0].count);
    } catch (err) {
      if (err.response?.status === 400) {
        console.error("Malformed query:", err.response.data);
        throw new BadRequestError("Bad Request: Malformed query to the ACRIS API.");
      }

      console.error("Error fetching count from ACRIS API:", err.message);
      throw new Error("Failed to fetch count from ACRIS API.");
    }
  }

  /**
   * Fetch all `document_id` values from the ACRIS Personal Property Master dataset using pagination.
   *
   * @param {Object} query - Query parameters.
   * @returns {Array} - Array of unique `document_id` values.
   */
  static async fetchDocIdsFromAcris(query) {
    try {
      const limit = 1000;
      let offset = 0;
      let hasMoreRecords = true;
      const documentIds = new Set();

      while (hasMoreRecords) {
        const url = `${this.constructMasterUrlSelectDocIds(query)}&$limit=${limit}&$offset=${offset}`;
        console.log("fetchDocIdsFromAcris URL:", url);

        const headers = {
          "Content-Type": "application/json",
          "X-App-Token": process.env.APP_TOKEN,
        };

        const { data } = await axios.get(url, { headers });

        if (!data?.length) {
          console.warn(`No document IDs found for query: ${JSON.stringify(query)}`);
          throw new NotFoundError("No document IDs found for the given query.");
        }

        data.forEach(record => {
          documentIds.add(record.document_id);
        });

        if (data.length < limit) {
          hasMoreRecords = false;
        } else {
          offset += limit;
        }
      }

      return Array.from(documentIds);
    } catch (err) {
      if (err.response?.status === 400) {
        console.error("Malformed query:", err.response.data);
        throw new BadRequestError("Bad Request: Malformed query to the ACRIS API.");
      }

      console.error("Error fetching document IDs from ACRIS API:", err.message);
      throw new Error("Failed to fetch document IDs from ACRIS API.");
    }
  }
}

module.exports = MasterPersPropApi;