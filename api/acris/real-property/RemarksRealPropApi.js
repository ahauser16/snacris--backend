"use strict";

const axios = require("axios");
const { NotFoundError } = require("../../../expressError");
const API_ENDPOINTS = require("../../apiEndpoints");

/** Functions for interacting with the ACRIS Real Property Remarks API. */

class RemarksRealPropApi {
    /** Fetch data from the ACRIS-Real Property Remarks dataset based on user-data sent from the frontend.
     *
     * `URLSearchParams` is a built-in JavaScript class that provides utility methods to work with the query string of a URL. It is part of the Web API and is available in modern browsers and Node.js environments. The URLSearchParams class allows you to create and manipulate the query string of a URL. You can add, delete, and retrieve query parameters easily. This class is useful when you need to work with query parameters in a URL.
     * 
     * Returns [{ document_id, record_type, sequence_number, remark_text, good_through_date }]
     * 
     **/

    static async fetchFromAcris(query) {
        const url = `${API_ENDPOINTS.realPropertyRemarks}?${new URLSearchParams(query).toString()}`;
        console.log("Constructed URL:", url);
        const response = await axios.get(url, {
            headers: {
                'Content-Type': 'application/json',
                'X-App-Token': process.env.APP_TOKEN,
            },
        });

        if (response.data.length === 0) {
            throw new NotFoundError(`No records found for query: ${JSON.stringify(query)}`);
        }

        return response.data;
    }
}

module.exports = RemarksRealPropApi;