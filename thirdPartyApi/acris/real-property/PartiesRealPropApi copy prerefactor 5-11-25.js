"use strict";

const axios = require("axios");
const { NotFoundError } = require("../../../expressError");
const API_ENDPOINTS = require("../../apiEndpoints");

/* Functions for interacting with the ACRIS Real Property Parties API. */

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
     * 
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
            conditions.push(`name like '%25${partiesQueryParams.name}%25'`);
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
        const whereClause = conditions.length > 0 ? `$select=document_id&$where=${conditions.join(" AND ")}` : "";

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

    static constructPartiesUrlCrRefMasSelDocIds(partiesQueryParams, masterRecordsDocumentIds, batchSize = 500) {
        const baseUrl = this.constructPartiesUrl(partiesQueryParams);

        // Split `masterRecordsDocumentIds` into batches
        const batches = [];
        for (let i = 0; i < masterRecordsDocumentIds.length; i += batchSize) {
            // if (i == 0) {  //--> uncomment this line to only get the first batch
            const batch = masterRecordsDocumentIds.slice(i, i + batchSize);
            //console.log(batch, "batch");
            const documentIdsCondition = ` AND document_id IN (${batch.map(id => `'${id.document_id}'`).join(", ")})`;
            const url = `${baseUrl}${documentIdsCondition}`;
            batches.push(url);
            //  }  //--> uncomment this line to only get the first batch
        }
        return batches; // Return an array of query URLs
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
         * @param {Object} partiesQueryParams - Query parameters for the Parties dataset.
         * @returns {Array} - Fetched records.
         */
    static async fetchFromAcris(partiesQueryParams) {
        try {
            const url = this.constructPartiesUrl(partiesQueryParams);
            // const url = this.constructPartiesUrlCrRefMasSelDocIds(partiesQueryParams, masterRecordsDocumentIds);
            console.log(url, "PartiesRealPropApi URL");
            //console.log("PartiesRealPropApi Constructed URL:", url);

            const headers = {
                "Content-Type": "application/json",
                "X-App-Token": process.env.NYC_OPEN_DATA_APP_TOKEN,
            };

            const { data } = await axios.get(url, { headers }); //Add FOR LOOP HERE to iterate through the array of urls

            if (!data?.length) {
                console.warn(`No records found for query: ${JSON.stringify(partiesQueryParams)}`);
                throw new NotFoundError("No records found for the given query.");
            }

            return data;
        } catch (err) {
            console.error("Error fetching data from ACRIS API:", err.message);
            throw new Error("Failed to fetch data from ACRIS API");
        }
    }

    /**
     * Fetch data from the ACRIS Real Property Parties dataset (simple query).
         * @param {Object} partiesQueryParams - Query parameters for the Parties dataset.
         * @returns {Array} - Fetched records.
         */
    static async fetchFromAcrisCrossRef(partiesQueryParams, masterRecordsDocumentIds) {
        try {
            // const url = this.constructPartiesUrl(partiesQueryParams);
            const url = this.constructPartiesUrlCrRefMasSelDocIds(partiesQueryParams, masterRecordsDocumentIds);
            console.log(url, "PartiesRealPropApi URL");
            //console.log("PartiesRealPropApi Constructed URL:", url);

            const headers = {
                "Content-Type": "application/json",
                "X-App-Token": process.env.NYC_OPEN_DATA_APP_TOKEN,
            };

            const { data } = await axios.get(url, { headers }); //Add FOR LOOP HERE to iterate through the array of urls

            if (!data?.length) {
                console.warn(`No records found for query: ${JSON.stringify(partiesQueryParams)}`);
                throw new NotFoundError("No records found for the given query.");
            }

            return data;
        } catch (err) {
            console.error("Error fetching data from ACRIS API:", err.message);
            throw new Error("Failed to fetch data from ACRIS API");
        }
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
            const url = this.constructPartiesUrlCountRec(partiesQueryParams);
            //console.log("constructPartiesUrlCountRec created:", url);

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
            console.error("Error fetching count from ACRIS API:", err.message);
            throw new Error("Failed to fetch count from ACRIS API");
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
            const limit = 1000;
            let offset = 0;
            let hasMoreRecords = true;
            const partiesRecordsDocumentIds = new Set();

            while (hasMoreRecords) {
                const url = `${this.constructPartiesUrlSelectDocIds(partiesQueryParams)}&$limit=${limit}&$offset=${offset}`;
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
                    partiesRecordsDocumentIds.add(record.document_id);
                });

                if (data.length < limit) {
                    hasMoreRecords = false;
                } else {
                    offset += limit;
                }
            }

            return Array.from(partiesRecordsDocumentIds);
        } catch (err) {
            console.error("Error fetching document IDs from ACRIS API:", err.message);
            throw new Error("Failed to fetch document IDs from ACRIS API");
        }
    }

    /**
     * Fetch `document_id` values from the ACRIS Real Property Parties dataset (cross-referenced with Master dataset).
     *
     * @param {Object} partiesQueryParams - Query parameters for the Parties dataset.
     * @param {Array<string>} masterRecordsDocumentIds - Array of document IDs to cross-reference.
     * @returns {Array} - Fetched `document_id` values.
     */

    static async fetchDocIdsFromAcrisCrossRefMaster(partiesQueryParams, masterRecordsDocumentIds, batchSize = 500) {
        try {
            // Construct query URLs in batches
            const queryUrls = this.constructPartiesUrlCrossRefMasterSelectDocIds(partiesQueryParams, masterRecordsDocumentIds, batchSize);
            const allDocumentIds = new Set();

            for (const url of queryUrls) {
                let offset = 0;
                let hasMoreRecords = true;

                while (hasMoreRecords) {
                    const paginatedUrl = `${url}&$limit=1000&$offset=${offset}`;
                    //console.log("Fetching URL:", paginatedUrl);

                    // Define the headers object
                    const headers = {
                        "Content-Type": "application/json",
                        "X-App-Token": process.env.NYC_OPEN_DATA_APP_TOKEN,
                    };

                    const { data } = await axios.get(paginatedUrl, { headers });

                    if (!data?.length) {
                        console.warn(`No records found for query: ${JSON.stringify(partiesQueryParams)}`);
                        throw new NotFoundError("No records found for the given query.");
                    }

                    data.forEach(record => allDocumentIds.add(record.document_id));

                    if (records.length < 1000) {
                        hasMoreRecords = false;
                    } else {
                        offset += 1000;
                    }
                }
            }
            return Array.from(allDocumentIds);
        } catch (err) {
            console.error("Error fetching document IDs from ACRIS API:", err.message);
            throw new Error("Failed to fetch document IDs from ACRIS API");
        }
    }
}

module.exports = PartiesRealPropApi;