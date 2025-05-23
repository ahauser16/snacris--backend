"use strict";

const axios = require("axios");
const { NotFoundError } = require("../../../expressError");
const API_ENDPOINTS = require("../../apiEndpoints");

/** Functions for interacting with the ACRIS Personal Property Parties API. */

class PartiesPersPropApi {
  /**
   * Constructs a SoQL query URL for the Personal Property Parties dataset.
   *
   * @param {Object} partiesQueryParams - Query parameters for the Parties dataset.
   * @param {string} [partiesQueryParams.document_id] - Document ID.
   * @param {string} [partiesQueryParams.record_type] - Record type.
   * @param {string} [partiesQueryParams.party_type] - Party type.
   * @param {string} [partiesQueryParams.name] - Party name.
   * @param {string} [partiesQueryParams.address_1] - Address line 1.
   * @param {string} [partiesQueryParams.address_2] - Address line 2.
   * @param {string} [partiesQueryParams.country] - Country.
   * @param {string} [partiesQueryParams.city] - City.
   * @param {string} [partiesQueryParams.state] - State.
   * @param {string} [partiesQueryParams.zip] - ZIP code.
   * @param {string} [partiesQueryParams.good_through_date] - Good through date.
   * @returns {string} - Constructed SoQL query URL.
   */
  static constructPartiesUrl(partiesQueryParams) {
    const conditions = [];
  
    if (partiesQueryParams.document_id) {
      conditions.push(`document_id='${encodeURIComponent(partiesQueryParams.document_id)}'`);
    }
    if (partiesQueryParams.record_type) {
      conditions.push(`record_type='${encodeURIComponent(partiesQueryParams.record_type)}'`);
    }
    if (partiesQueryParams.party_type) {
      conditions.push(`party_type='${encodeURIComponent(partiesQueryParams.party_type)}'`);
    }
    if (partiesQueryParams.name) {
      conditions.push(`name LIKE '%25${encodeURIComponent(partiesQueryParams.name)}%25'`);
    }
    if (partiesQueryParams.address_1) {
      conditions.push(`address_1='${encodeURIComponent(partiesQueryParams.address_1)}'`);
    }
    if (partiesQueryParams.address_2) {
      conditions.push(`address_2='${encodeURIComponent(partiesQueryParams.address_2)}'`);
    }
    if (partiesQueryParams.country) {
      conditions.push(`country='${encodeURIComponent(partiesQueryParams.country)}'`);
    }
    if (partiesQueryParams.city) {
      conditions.push(`city='${encodeURIComponent(partiesQueryParams.city)}'`);
    }
    if (partiesQueryParams.state) {
      conditions.push(`state='${encodeURIComponent(partiesQueryParams.state)}'`);
    }
    if (partiesQueryParams.zip) {
      conditions.push(`zip='${encodeURIComponent(partiesQueryParams.zip)}'`);
    }
    if (partiesQueryParams.good_through_date) {
      conditions.push(`good_through_date='${encodeURIComponent(partiesQueryParams.good_through_date)}'`);
    }
  
    const whereClause = conditions.length > 0 ? `$where=${conditions.join(" AND ")}` : "";
    const url = `${API_ENDPOINTS.personalPropertyParties}?${whereClause}`;
    return url;
  }

  /**
   * Constructs a SoQL query URL to count matching records in the Personal Property Parties dataset.
   *
   * @param {Object} partiesQueryParams - Query parameters for the Parties dataset.
   * @returns {string} - Constructed SoQL query URL for counting records.
   */
  static constructPartiesUrlCountRec(partiesQueryParams) {
    const baseUrl = this.constructPartiesUrl(partiesQueryParams);
    return `${baseUrl}&$select=count(*)`;
  }

  /**
   * Constructs a SoQL query URL to retrieve only `document_id` values from the Personal Property Parties dataset.
   *
   * @param {Object} partiesQueryParams - Query parameters for the Parties dataset.
   * @returns {string} - Constructed SoQL query URL for selecting `document_id` values.
   */
  static constructPartiesUrlSelectDocIds(partiesQueryParams) {
    const baseUrl = this.constructPartiesUrl(partiesQueryParams);
    return `${baseUrl}&$select=document_id`;
  }

  /**
   * Constructs a SoQL query URL for the Personal Property Parties dataset (cross-referenced with Master dataset, selecting only `document_id` values).
   *
   * @param {Object} partiesQueryParams - Query parameters for the Parties dataset.
   * @param {Array<string>} masterRecordsDocumentIds - Array of document IDs to cross-reference.
   * @param {number} batchSize - Number of document IDs per batch.
   * @returns {Array<string>} - Array of constructed query URLs.
   */
  static constructPartiesUrlCrossRefMasterSelectDocIds(partiesQueryParams, masterRecordsDocumentIds, batchSize = 500) {
    const baseUrl = this.constructPartiesUrl(partiesQueryParams);

    const batches = [];
    for (let i = 0; i < masterRecordsDocumentIds.length; i += batchSize) {
      const batch = masterRecordsDocumentIds.slice(i, i + batchSize);
      const documentIdsCondition = `document_id IN (${batch.map(id => `'${id}'`).join(", ")})`;
      const separator = baseUrl.includes("$where=") ? " AND " : "$where=";
      const url = `${baseUrl}${separator}${documentIdsCondition}&$select=document_id`;
      batches.push(url);
    }

    return batches;
  }

  /**
   * Fetch data from the ACRIS Personal Property Parties dataset.
   *
   * @param {Object} partiesQueryParams - Query parameters for the Parties dataset.
   * @returns {Array} - Fetched records.
   */
  static async fetchFromAcris(partiesQueryParams) {
    try {
      const url = this.constructPartiesUrl(partiesQueryParams);
      console.log("PartiesPersPropApi Constructed URL:", url);

      const headers = {
        "Content-Type": "application/json",
        "X-App-Token": process.env.APP_TOKEN,
      };

      const { data } = await axios.get(url, { headers });

      if (!data?.length) {
        console.warn(`No records found for query: ${JSON.stringify(partiesQueryParams)}`);
        throw new NotFoundError("No records found for the given query.");
      }

      return data;
    } catch (err) {
      console.error("Error fetching data from ACRIS API:", err.message);
      throw new Error("Failed to fetch data from ACRIS API.");
    }
  }

  /**
   * Fetch the count of matching records from the ACRIS Personal Property Parties dataset.
   *
   * @param {Object} partiesQueryParams - Query parameters for the Parties dataset.
   * @returns {number} - Count of matching records.
   */
  static async fetchCountFromAcris(partiesQueryParams) {
    try {
      const url = this.constructPartiesUrlCountRec(partiesQueryParams);
      console.log("constructPartiesUrlCountRec created:", url);

      const headers = {
        "Content-Type": "application/json",
        "X-App-Token": process.env.APP_TOKEN,
      };

      const { data } = await axios.get(url, { headers });

      if (!data?.length || !data[0]?.count) {
        console.warn(`No count data found for query: ${JSON.stringify(partiesQueryParams)}`);
        throw new NotFoundError("No count data found for the given query.");
      }

      return Number(data[0].count);
    } catch (err) {
      console.error("Error fetching count from ACRIS API:", err.message);
      throw new Error("Failed to fetch count from ACRIS API.");
    }
  }

  /**
   * Fetch all `document_id` values from the ACRIS Personal Property Parties dataset using pagination.
   *
   * @param {Object} partiesQueryParams - Query parameters for the Parties dataset.
   * @returns {Array} - Array of unique `document_id` values.
   */
  static async fetchDocIdsFromAcris(partiesQueryParams) {
    try {
      const limit = 1000;
      let offset = 0;
      let hasMoreRecords = true;
      const documentIds = new Set();
  
      while (hasMoreRecords) {
        const url = `${this.constructPartiesUrlSelectDocIds(partiesQueryParams)}&$limit=${limit}&$offset=${offset}`;
        console.log("fetchDocIdsFromAcris URL:", url);
  
        const headers = {
          "Content-Type": "application/json",
          "X-App-Token": process.env.APP_TOKEN,
        };
  
        const { data } = await axios.get(url, { headers });
    
        // Add document IDs to the set
        data.forEach(record => documentIds.add(record.document_id));
  
        // Check if there are more records to fetch
        if (data.length < limit) {
          hasMoreRecords = false;
        } else {
          offset += limit;
        }
      }
  
      return Array.from(documentIds);
    } catch (err) {
      console.error("Error fetching document IDs from ACRIS API:", err.message);
      throw new Error("Failed to fetch document IDs from ACRIS API.");
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
  static async fetchDocIdsFromAcrisCrossRefMaster(partiesQueryParams, masterRecordsDocumentIds, batchSize = 500) {
    try {
      const queryUrls = this.constructPartiesUrlCrossRefMasterSelectDocIds(partiesQueryParams, masterRecordsDocumentIds, batchSize);
      const allDocumentIds = new Set();

      for (const url of queryUrls) {
        let offset = 0;
        let hasMoreRecords = true;

        while (hasMoreRecords) {
          const paginatedUrl = `${url}&$limit=1000&$offset=${offset}`;
          console.log("Fetching URL:", paginatedUrl);

          const headers = {
            "Content-Type": "application/json",
            "X-App-Token": process.env.APP_TOKEN,
          };

          const { data } = await axios.get(paginatedUrl, { headers });

          if (!data?.length) {
            console.warn(`No records found for query: ${JSON.stringify(partiesQueryParams)}`);
            throw new NotFoundError("No records found for the given query.");
          }

          data.forEach(record => allDocumentIds.add(record.document_id));

          if (data.length < 1000) {
            hasMoreRecords = false;
          } else {
            offset += 1000;
          }
        }
      }

      return Array.from(allDocumentIds);
    } catch (err) {
      console.error("Error fetching document IDs from ACRIS API:", err.message);
      throw new Error("Failed to fetch document IDs from ACRIS API.");
    }
  }
}

module.exports = PartiesPersPropApi;