"use strict";

const axios = require("axios");
const { NotFoundError } = require("../../../expressError");
const API_ENDPOINTS = require("../../apiEndpoints");

/** Functions for interacting with the ACRIS Real Property References API. */

class ReferencesRealPropApi {
    /** Fetch data from the ACRIS-Real Property References dataset based on user-data sent from the frontend.
     *
     * `URLSearchParams` is a built-in JavaScript class that provides utility methods to work with the query string of a URL. It is part of the Web API and is available in modern browsers and Node.js environments. The URLSearchParams class allows you to create and manipulate the query string of a URL. You can add, delete, and retrieve query parameters easily. This class is useful when you need to work with query parameters in a URL.
     * 
     * Returns [{ document_id, record_type, reference_by_crfn_, reference_by_doc_id, reference_by_reel_year, reference_by_reel_borough, reference_by_reel_nbr, reference_by_reel_page, good_through_date }]
     * 
     **/

    static async fetchFromAcris(query) {
        try {
          // Construct the URL with query parameters
          const url = `${API_ENDPOINTS.realPropertyReferences}?${new URLSearchParams(query).toString()}`;
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

module.exports = ReferencesRealPropApi;