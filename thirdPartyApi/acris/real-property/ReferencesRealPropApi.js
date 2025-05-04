"use strict";

const axios = require("axios");
const { NotFoundError } = require("../../../expressError");
const API_ENDPOINTS = require("../../apiEndpoints");

/** Functions for interacting with the ACRIS Real Property References API. */

class ReferencesRealPropApi {

  static constructReferencesUrl({
    document_id,
    record_type,
    reference_by_crfn_,
    reference_by_doc_id,
    reference_by_reel_year,
    reference_by_reel_borough,
    reference_by_reel_nbr,
    reference_by_reel_page,
    good_through_date,
  } = {}) {
    const conditions = [];

    if (document_id) conditions.push(`upper(document_id)=upper('${document_id}')`);
    if (record_type) conditions.push(`record_type='${record_type}'`);
    if (reference_by_crfn_) conditions.push(`reference_by_crfn_='${reference_by_crfn_}'`);
    if (reference_by_doc_id) conditions.push(`reference_by_doc_id='${reference_by_doc_id}'`);
    if (reference_by_reel_year) conditions.push(`reference_by_reel_year='${reference_by_reel_year}'`);
    if (reference_by_reel_borough) conditions.push(`reference_by_reel_borough='${reference_by_reel_borough}'`);
    if (reference_by_reel_nbr) conditions.push(`reference_by_reel_nbr='${reference_by_reel_nbr}'`);
    if (reference_by_reel_page) conditions.push(`reference_by_reel_page='${reference_by_reel_page}'`);
    if (good_through_date) conditions.push(`good_through_date='${good_through_date}'`);

    const whereClause = conditions.length > 0 ? `$where=${conditions.join(" AND ")}` : "";

    const url = `${API_ENDPOINTS.realPropertyRemarks}?${whereClause}`;
    return url;
  }

  /** Fetch data from the ACRIS-Real Property References dataset based on user-data sent from the frontend.
   *
   * `URLSearchParams` is a built-in JavaScript class that provides utility methods to work with the query string of a URL. It is part of the Web API and is available in modern browsers and Node.js environments. The URLSearchParams class allows you to create and manipulate the query string of a URL. You can add, delete, and retrieve query parameters easily. This class is useful when you need to work with query parameters in a URL.
   * 
   * Returns [{ document_id, record_type, reference_by_crfn_, reference_by_doc_id, reference_by_reel_year, reference_by_reel_borough, reference_by_reel_nbr, reference_by_reel_page, good_through_date }]
   * 
   **/

  static async fetchFromAcris(query) {
    try {
      const url = this.constructReferencesUrl(query);

      const { data } = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          "X-App-Token": process.env.APP_TOKEN, // Ensure APP_TOKEN is set in your environment
        },
      });

      if (!data?.length) {
        console.warn(`No records found for query: ${JSON.stringify(query)}`);
        return []; 
      }

      return data;
    } catch (err) {
      throw new Error("Failed to fetch data from ACRIS API");
    }
  }
}

module.exports = ReferencesRealPropApi;