"use strict";

const axios = require("axios");
const { NotFoundError } = require("../../../expressError");
const API_ENDPOINTS = require("../../apiEndpoints");

/** Functions for interacting with the ACRIS Country Codes API. */

class CountriesCodeMapApi {
    /**  These codes are already seeded in the database which the server will use to query the Real Property and Personal Property datasets.  This file will be used to periodically check that the ACRIS Country codes in the database match the current codes provided by the ACRIS API.  If the codes do not match, the server will update the database with the new codes. 
     *
     * `URLSearchParams` is a built-in JavaScript class that provides utility methods to work with the query string of a URL. It is part of the Web API and is available in modern browsers and Node.js environments. The URLSearchParams class allows you to create and manipulate the query string of a URL. You can add, delete, and retrieve query parameters easily. This class is useful when you need to work with query parameters in a URL.
     * 
     * Returns [{ record_type, country_code, description }]
     **/

    static async fetchFromAcris(query) {
        const url = `${API_ENDPOINTS.countryCodes}?${new URLSearchParams(query).toString()}`;
        // const url = 'https://data.cityofnewyork.us/resource/j2iz-mwzu.json';
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

module.exports = CountriesCodeMapApi;