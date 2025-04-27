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
     * Constructs a SoQL query URL to count matching records in the Real Property Parties dataset.
     *
     * @param {Object} partiesQueryParams - Query parameters for the Parties dataset.
     * @returns {string} - Constructed SoQL query URL for counting records.
     */
    static constructPartiesUrlCountRec(partiesQueryParams) {
        const baseUrl = this.constructPartiesUrl(partiesQueryParams);
        return `${baseUrl}&$select=count(*)`;
    }

    /**
     * Constructs a SoQL query URL to retrieve only `document_id` values from the Real Property Parties dataset.
     *
     * @param {Object} partiesQueryParams - Query parameters for the Parties dataset.
     * @returns {string} - Constructed SoQL query URL for selecting `document_id` values.
     */
    static constructPartiesUrlSelectDocIds(partiesQueryParams) {
        const baseUrl = this.constructPartiesUrl(partiesQueryParams);
        return `${baseUrl}&$select=document_id`;
    }

    /**
         * Constructs a SoQL query URL for the Real Property Parties dataset (cross-referenced with Master dataset, selecting only `document_id` values).
         *
         * @param {Object} partiesQueryParams - Query parameters for the Parties dataset.
         * @param {Array<string>} masterRecordsDocumentIds - Array of document IDs to cross-reference.
         * @returns {string} - Constructed SoQL query URL.
         */

    static constructPartiesUrlCrossRefMasterSelectDocIds(partiesQueryParams, masterRecordsDocumentIds) {
        const baseUrl = this.constructPartiesUrl(partiesQueryParams);

        //Add validation to ensure that masterRecordsDocumentIds is an array before constructing the query URL
        if (Array.isArray(masterRecordsDocumentIds) && masterRecordsDocumentIds.length > 0) {
            const documentIdsCondition = `document_id IN (${masterRecordsDocumentIds.map(id => `'${id}'`).join(", ")})`;
            const separator = baseUrl.includes("$where=") ? " AND " : "$where=";
            const url = `${baseUrl}${separator}${documentIdsCondition}&$select=document_id`;
            console.log("Constructed URL:", url); // Debug log
            return url;
        }

        return `${baseUrl}&$select=document_id`;
    }

    /**
     * Fetch the count of matching records from the ACRIS Real Property Parties dataset.
     *
     * @param {Object} partiesQueryParams - Query parameters for the Parties dataset.
     * @returns {Object} - An object containing the count of matching records.
     * @throws {Error} - If the count is not a valid number or if the API call fails.
     */
    static async fetchCountFromAcris(partiesQueryParams) {
        try {
            // Construct the URL for counting records
            const url = this.constructPartiesUrlCountRec(partiesQueryParams);
            console.log("constructPartiesUrlCountRec created:", url);

            // Make the GET request to the NYC Open Data API
            const response = await axios.get(url, {
                headers: {
                    "Content-Type": "application/json",
                    "X-App-Token": process.env.APP_TOKEN, // Ensure APP_TOKEN is set in your environment
                },
            });

            // Validate the response
            if (!response.data || response.data.length === 0 || !response.data[0].count) {
                throw new NotFoundError(`No count found for query: ${JSON.stringify(partiesQueryParams)}`);
            }

            // Parse and validate the count
            const count = Number(response.data[0].count);
            if (isNaN(count)) {
                throw new Error("Invalid count value received from ACRIS API");
            }

            return { partiesRecordCount: count };
        } catch (err) {
            console.error("Error fetching count from ACRIS API:", err.message);
            throw new Error("Failed to fetch count from ACRIS API");
        }
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
    /**
         * Fetch data from the ACRIS Real Property Parties dataset (simple query).
         *
         * @param {Object} partiesQueryParams - Query parameters for the Parties dataset.
         * @returns {Array} - Fetched records.
         */
    static async fetchFromAcris(partiesQueryParams) {
        try {
            // Construct the URL using constructPartiesUrl
            const url = this.constructPartiesUrl(partiesQueryParams);
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

    /**
     * Fetch `document_id` values from the ACRIS Real Property Parties dataset (cross-referenced with Master dataset).
     *
     * @param {Object} partiesQueryParams - Query parameters for the Parties dataset.
     * @param {Array<string>} masterRecordsDocumentIds - Array of document IDs to cross-reference.
     * @returns {Array} - Fetched `document_id` values.
     */

    static async fetchDocIdsFromAcrisCrossRefMaster(partiesQueryParams, masterRecordsDocumentIds) {
        try {
            // Construct the URL using constructPartiesUrlCrossRefMasterSelectDocIds
            const url = this.constructPartiesUrlCrossRefMasterSelectDocIds(partiesQueryParams, masterRecordsDocumentIds);
            console.log("PartiesRealPropApi Constructed CrossRef URL:", url);

            // Make the GET request to the NYC Open Data API
            const response = await axios.get(url, {
                headers: {
                    "Content-Type": "application/json",
                    "X-App-Token": process.env.APP_TOKEN, // Ensure APP_TOKEN is set in your environment
                },
            });

            // Handle case where no records are found
            if (response.data.length === 0) {
                throw new NotFoundError(`No document IDs found for query: ${JSON.stringify(partiesQueryParams)}`);
            }

            return response.data.map(record => record.document_id);
        } catch (err) {
            console.error("Error fetching document IDs from ACRIS API:", err.message);
            throw new Error("Failed to fetch document IDs from ACRIS API");
        }
    }

    /**
         * Fetch all `document_id` values from the ACRIS Real Property Parties dataset using pagination.
         *
         * @param {Object} partiesQueryParams - Query parameters for the Parties dataset.
         * @returns {Object} - An object containing:
         *   - `partiesRecordsDocumentIds`: Array of unique `document_id` values.
         *   - `partiesRecordsDocumentIds_Duplicates`: Array of duplicate `document_id` values.
         */
    static async fetchDocIdsFromAcris(partiesQueryParams) {
        try {
            const limit = 1000; // API record limit per request
            let offset = 0;
            let hasMoreRecords = true;
            const partiesRecordsDocumentIds = new Set(); // To store unique `document_id` values
            const partiesRecordsDocumentIds_Duplicates = []; // To store duplicate `document_id` values
            const seenDocumentIds = new Set(); // To track all `document_id` values seen so far

            while (hasMoreRecords) {
                // Construct the URL with pagination parameters
                const url = `${this.constructPartiesUrlSelectDocIds(partiesQueryParams)}&$limit=${limit}&$offset=${offset}`;
                console.log("fetchDocIdsFromAcris URL:", url);

                // Make the GET request to the NYC Open Data API
                const response = await axios.get(url, {
                    headers: {
                        "Content-Type": "application/json",
                        "X-App-Token": process.env.APP_TOKEN, // Ensure APP_TOKEN is set in your environment
                    },
                });

                // Add `document_id` values to the sets
                const records = response.data;
                records.forEach(record => {
                    const documentId = record.document_id;
                    if (seenDocumentIds.has(documentId)) {
                        partiesRecordsDocumentIds_Duplicates.push(documentId);
                    } else {
                        seenDocumentIds.add(documentId);
                        partiesRecordsDocumentIds.add(documentId);
                    }
                });

                // Check if there are more records to fetch
                if (records.length < limit) {
                    hasMoreRecords = false;
                } else {
                    offset += limit;
                }
            }

            return {
                partiesRecordsDocumentIds: Array.from(partiesRecordsDocumentIds),
                partiesRecordsDocumentIds_Duplicates,
            };
        } catch (err) {
            console.error("Error fetching document IDs from ACRIS API:", err.message);
            throw new Error("Failed to fetch document IDs from ACRIS API");
        }
    }
}

module.exports = PartiesRealPropApi;