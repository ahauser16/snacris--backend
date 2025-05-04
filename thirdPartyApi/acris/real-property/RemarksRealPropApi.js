"use strict";

const axios = require("axios");
const { NotFoundError } = require("../../../expressError");
const API_ENDPOINTS = require("../../apiEndpoints");

/** Functions for interacting with the ACRIS Real Property Remarks API. */

class RemarksRealPropApi {



    static constructRemarksUrl({
        document_id,
        record_type,
        sequence_number,
        remark_text,
      } = {}) {
        const conditions = [];
    
        if (document_id) conditions.push(`upper(document_id)=upper('${document_id}')`);
        if (record_type) conditions.push(`record_type='${record_type}'`);
        if (sequence_number) conditions.push(`sequence_number='${sequence_number}'`); 
        if (remark_text) conditions.push(`remark_text='${remark_text}'`);
    
        const whereClause = conditions.length > 0 ? `$where=${conditions.join(" AND ")}` : "";
    
        const url = `${API_ENDPOINTS.realPropertyRemarks}?${whereClause}`;
        return url;
      }

          /** Fetch data from the ACRIS-Real Property Remarks dataset based on user-data sent from the frontend.
     *
     * `URLSearchParams` is a built-in JavaScript class that provides utility methods to work with the query string of a URL. It is part of the Web API and is available in modern browsers and Node.js environments. The URLSearchParams class allows you to create and manipulate the query string of a URL. You can add, delete, and retrieve query parameters easily. This class is useful when you need to work with query parameters in a URL.
     * 
     * Returns [{ document_id, record_type, sequence_number, remark_text, good_through_date }]
     * 
     **/


    static async fetchFromAcris(query) {
        try {
          const url = this.constructRemarksUrl(query);
    
          const {data} = await axios.get(url, {
            headers: {
              "Content-Type": "application/json",
              "X-App-Token": process.env.APP_TOKEN,
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

module.exports = RemarksRealPropApi;