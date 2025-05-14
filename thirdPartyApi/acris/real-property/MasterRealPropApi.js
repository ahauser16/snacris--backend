"use strict";

const axios = require("axios");
const SoqlUrl = require("../utils/SoqlUrl");
const API_ENDPOINTS = require("../../apiEndpoints");
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





  //OLD CODE BELOW

  /**
     * Constructs a query URL using Socrata Query Language syntax (SoQL) for the Real Property Master dataset.
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

    // Normalize `doc_type` into an array if it is a comma-separated string
    if (doc_type && typeof doc_type === "string") {
      doc_type = doc_type.split(",");
    }

    if (document_id) conditions.push(`upper(document_id)=upper('${document_id}')`);
    if (crfn) conditions.push(`crfn='${crfn}'`);
    if (recorded_borough) conditions.push(`recorded_borough='${recorded_borough}'`);

    if (doc_type.length) {
      const docTypeCondition = `doc_type IN (${doc_type
        .map(type => `'${encodeURIComponent(type.trim())}'`)
        .join(", ")})`;
      conditions.push(docTypeCondition);
    } else {
      conditions.push(`doc_type='${encodeURIComponent(doc_type.trim())}'`);
    }

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

    const whereClause = conditions.length > 0 ? `$where=${conditions.join(" AND ")}` : "";

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
    // Use `$select` to count unique `document_id` values
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

      // const url = this.constructMasterUrl(query);
      const url = this.constructMasterUrlSelectDocIds(query);
      console.log("MasterRealPropAPI constructed url select 'document_id' values:", url);

      const headers = {
        "Content-Type": "application/json",
        "X-App-Token": process.env.NYC_OPEN_DATA_APP_TOKEN,
      };

      const { data } = await axios.get(url, { headers });

      if (!data?.length) {
        console.warn(`No records found for query: ${JSON.stringify(query)}`);
        throw new NotFoundError("No records found for the given query.");
      }
      //console.log(data, "data from Master Real Property API");
      return data;
    } catch (err) {
      console.error("Error fetching data from Real Property Master ACRIS API:", err.message);
      throw handleThirdPartyApiError(err);
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
      const url = this.constructMasterUrlCountRec(query);
      //console.log("constructMasterUrlCountRec output:", url);

      const headers = {
        "Content-Type": "application/json",
        "X-App-Token": process.env.NYC_OPEN_DATA_APP_TOKEN,
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
   * Fetch all `document_id` values from the ACRIS Real Property Master dataset using pagination.
   *
   * @param {Object} query - Query parameters.
   * @returns {Object} - An object containing:
   *   - `masterRecordsDocumentIds`: Array of unique `document_id` values.
   */
  static async fetchDocIdsFromAcris(query) {
    try {
      const limit = 1000;
      let offset = 0;
      let hasMoreRecords = true;
      const masterRecordsDocumentIds = new Set();

      while (hasMoreRecords) {
        const url = `${this.constructMasterUrlSelectDocIds(query)}&$limit=${limit}&$offset=${offset}`;
        //console.log("fetchDocIdsFromAcris URL:", url);

        const headers = {
          "Content-Type": "application/json",
          "X-App-Token": process.env.NYC_OPEN_DATA_APP_TOKEN,
        };

        const { data } = await axios.get(url, { headers });

        if (!data?.length) {
          console.warn(`No document IDs found for query: ${JSON.stringify(query)}`);
          throw new NotFoundError("No document IDs found for the given query.");
        }

        data.forEach(record => {
          masterRecordsDocumentIds.add(record.document_id);
        });

        if (data.length < limit) {
          hasMoreRecords = false;
        } else {
          offset += limit;
        }
      }

      return Array.from(masterRecordsDocumentIds);
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

module.exports = MasterRealPropApi;