"use strict";

const axios = require("axios");
const { NotFoundError } = require("../../../expressError");
const API_ENDPOINTS = require("../../apiEndpoints");

/** Functions for interacting with the ACRIS Real Property Parties API. */

class PartiesRealPropApi {
    /**
     * Constructs a SoQL query URL for the Real Property Parties dataset.
     *
     * @param {Object} partiesQueryParams - Query parameters for the Parties dataset.
     * @param {Array} masterRecordsDocumentIds - Array of document IDs to cross-reference.
     * @returns {string} - Constructed SoQL query URL.
     */
    static constructPartiesUrlCrossRefMaster(partiesQueryParams, masterRecordsDocumentIds) {
        const conditions = [];

        // Add conditions from partiesQueryParams
        if (partiesQueryParams.name) {
            conditions.push(`name LIKE '%${encodeURIComponent(partiesQueryParams.name)}%'`);
        }
        if (partiesQueryParams.party_type) {
            conditions.push(`party_type='${partiesQueryParams.party_type}'`);
        }

        // Add condition for masterRecordsDocumentIds
        if (masterRecordsDocumentIds && masterRecordsDocumentIds.length > 0) {
            const documentIdsCondition = `document_id IN (${masterRecordsDocumentIds.map(id => `'${id}'`).join(", ")})`;
            conditions.push(documentIdsCondition);
        }

        // Construct the $where clause
        const whereClause = conditions.length > 0 ? `$where=${encodeURIComponent(conditions.join(" AND "))}` : "";

        // Construct the full URL
        const url = `${API_ENDPOINTS.realPropertyParties}?${whereClause}`;
        return url;
    }

    /**
     * Constructs a SoQL query URL for the Real Property Parties dataset (simple query).
     *
     * @param {Object} partiesQueryParams - Query parameters for the Parties dataset.
     * @returns {string} - Constructed SoQL query URL.
     */
    static constructPartiesUrl(partiesQueryParams) {
        const conditions = [];

        // Add conditions from partiesQueryParams
        if (partiesQueryParams.name) {
            conditions.push(`name LIKE '%${encodeURIComponent(partiesQueryParams.name)}%'`);
        }
        if (partiesQueryParams.party_type) {
            conditions.push(`party_type='${partiesQueryParams.party_type}'`);
        }

        // Construct the $where clause
        const whereClause = conditions.length > 0 ? `$where=${encodeURIComponent(conditions.join(" AND "))}` : "";

        // Construct the full URL
        const url = `${API_ENDPOINTS.realPropertyParties}?${whereClause}`;
        return url;
    }

    /**
     * Fetch data from the ACRIS Real Property Parties dataset.
     * @param {Object} partiesQueryParams - Query parameters for the Parties dataset.
     * @param {Array|null} masterRecordsDocumentIds - Array of document IDs to cross-reference (optional).
     * @returns {Array} - Fetched records.
     */
    static async fetchFromAcris(partiesQueryParams, masterRecordsDocumentIds = null) {
        try {
            let url;

            // Use the appropriate URL construction method
            if (masterRecordsDocumentIds) {
                url = this.constructPartiesUrlCrossRefMaster(partiesQueryParams, masterRecordsDocumentIds);
            } else {
                url = this.constructPartiesUrl(partiesQueryParams);
            }

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
                throw new NotFoundError(`No records found for query: ${JSON.stringify(partiesQueryParams)}`);
            }

            return response.data;
        } catch (err) {
            console.error("Error fetching data from ACRIS API:", err.message);
            throw new Error("Failed to fetch data from ACRIS API");
        }
    }
}

module.exports = PartiesRealPropApi;