"use strict";

const axios = require("axios");
const { NotFoundError } = require("../../../expressError");
const API_ENDPOINTS = require("../../apiEndpoints");

/** Functions for interacting with the ACRIS Real Property Parties API. */

class PartiesRealPropApi {
    /**
     * Constructs a SoQL query URL for the Real Property Parties dataset (simple query).
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

        // Add conditions from partiesQueryParams
        if (partiesQueryParams.document_id) {
            conditions.push(`document_id='${partiesQueryParams.document_id}'`);
        }
        if (partiesQueryParams.record_type) {
            conditions.push(`record_type='${partiesQueryParams.record_type}'`);
        }
        if (partiesQueryParams.party_type) {
            conditions.push(`party_type='${partiesQueryParams.party_type}'`);
        }
        if (partiesQueryParams.name) {
            conditions.push(`name LIKE '%25${partiesQueryParams.name}%25'`);
        }
        if (partiesQueryParams.address_1) {
            conditions.push(`address_1='${partiesQueryParams.address_1}'`);
        }
        if (partiesQueryParams.address_2) {
            conditions.push(`address_2='${partiesQueryParams.address_2}'`);
        }
        if (partiesQueryParams.country) {
            conditions.push(`country='${partiesQueryParams.country}'`);
        }
        if (partiesQueryParams.city) {
            conditions.push(`city='${partiesQueryParams.city}'`);
        }
        if (partiesQueryParams.state) {
            conditions.push(`state='${partiesQueryParams.state}'`);
        }
        if (partiesQueryParams.zip) {
            conditions.push(`zip='${partiesQueryParams.zip}'`);
        }
        if (partiesQueryParams.good_through_date) {
            conditions.push(`good_through_date='${partiesQueryParams.good_through_date}'`);
        }

        // Construct the $where clause
        const whereClause = conditions.length > 0 ? `$where=${conditions.join(" AND ")}` : "";

        // Construct the full URL
        const url = `${API_ENDPOINTS.realPropertyParties}?${whereClause}`;
        return url;
    }

    /**
     * Constructs a SoQL query URL for the Real Property Parties dataset (cross-referenced with Master dataset).
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
     * @param {Array<string>} masterRecordsDocumentIds - Array of document IDs to cross-reference.
     * @returns {string} - Constructed SoQL query URL.
     */
    
    static constructPartiesUrlCrossRefMaster(partiesQueryParams, masterRecordsDocumentIds) {
        const conditions = [];

        // Add conditions from partiesQueryParams
        if (partiesQueryParams.document_id) {
            conditions.push(`document_id='${partiesQueryParams.document_id}'`);
        }
        if (partiesQueryParams.record_type) {
            conditions.push(`record_type='${partiesQueryParams.record_type}'`);
        }
        if (partiesQueryParams.party_type) {
            conditions.push(`party_type='${partiesQueryParams.party_type}'`);
        }
        if (partiesQueryParams.name) {
            conditions.push(`name LIKE '%25${partiesQueryParams.name}%25'`);
        }
        if (partiesQueryParams.address_1) {
            conditions.push(`address_1='${partiesQueryParams.address_1}'`);
        }
        if (partiesQueryParams.address_2) {
            conditions.push(`address_2='${partiesQueryParams.address_2}'`);
        }
        if (partiesQueryParams.country) {
            conditions.push(`country='${partiesQueryParams.country}'`);
        }
        if (partiesQueryParams.city) {
            conditions.push(`city='${partiesQueryParams.city}'`);
        }
        if (partiesQueryParams.state) {
            conditions.push(`state='${partiesQueryParams.state}'`);
        }
        if (partiesQueryParams.zip) {
            conditions.push(`zip='${partiesQueryParams.zip}'`);
        }
        if (partiesQueryParams.good_through_date) {
            conditions.push(`good_through_date='${partiesQueryParams.good_through_date}'`);
        }

        // Add condition for masterRecordsDocumentIds
        if (masterRecordsDocumentIds && masterRecordsDocumentIds.length > 0) {
            const documentIdsCondition = `document_id IN (${masterRecordsDocumentIds.map(id => `'${id}'`).join(", ")})`;
            conditions.push(documentIdsCondition);
        }

        // Construct the $where clause
        const whereClause = conditions.length > 0 ? `$where=${conditions.join(" AND ")}` : "";

        // Construct the full URL
        const url = `${API_ENDPOINTS.realPropertyParties}?${whereClause}`;
        return url;
    }

    /**
     * Fetch data from the ACRIS Real Property Parties dataset.
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
     * @param {Array<string>|null} masterRecordsDocumentIds - Array of document IDs to cross-reference (optional).
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

            console.log("PartiesRealPropApi Constructed URL:", url);

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