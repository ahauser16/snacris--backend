"use strict";

const axios = require("axios");
const { NotFoundError } = require("../../../expressError");
const SoqlUrl = require("../utils/SoqlUrl");

/** Functions for interacting with the ACRIS Real Property Legals API. */
class LegalsRealPropApi {
    /**
     * Fetch all records from the ACRIS Real Property Legals dataset matching `legalsQueryParams` parameters.
     *
     * @param {Object} legalsQueryParams - Query parameters for the Legals dataset.
     * @returns {Array} - Fetched records.
     */
    static async fetchAcrisRecords(legalsQueryParams) {
        try {
            const url = SoqlUrl.constructUrl(legalsQueryParams, "LegalsRealPropApi", "records");
            const headers = {
                "Content-Type": "application/json",
                "X-App-Token": process.env.NYC_OPEN_DATA_APP_TOKEN,
            };

            const { data } = await axios.get(url, { headers });

            if (!data?.length) {
                console.warn(`No records found for query: ${JSON.stringify(legalsQueryParams)} from Real Property Legals API`);
                throw new NotFoundError("No records found for the given query from Real Property Legals API.");
            }

            return data;
        } catch (err) {
            console.error("Error fetching records from Real Property Legals API:", err.message);
            throw new Error("Failed to fetch records from Real Property Legals API");
        }
    }

    /**
     * Fetch the count of matching records from the ACRIS Real Property Legals dataset.
     *
     * @param {Object} legalsQueryParams - Query parameters for the Legals dataset.
     * @returns {number} - Count of matching records.
     */
    static async fetchAcrisRecordCount(legalsQueryParams) {
        try {
            const url = SoqlUrl.constructUrl(legalsQueryParams, "LegalsRealPropApi", "countAll");
            const headers = {
                "Content-Type": "application/json",
                "X-App-Token": process.env.NYC_OPEN_DATA_APP_TOKEN,
            };

            const { data } = await axios.get(url, { headers });

            if (!data?.length || !data[0]?.count) {
                console.warn(`No count data found for query: ${JSON.stringify(legalsQueryParams)} from Real Property Legals API`);
                throw new NotFoundError("No count data found for the given query from Real Property Legals API.");
            }

            return Number(data[0].count);
        } catch (err) {
            console.error("Error fetching record count from Real Property Legals API:", err.message);
            throw new Error("Failed to fetch record count from Real Property Legals API");
        }
    }

    /**
     * Fetch all `document_id` values from the ACRIS Real Property Legals dataset matching `legalsQueryParams` parameters.
     *
     * @param {Object} legalsQueryParams - Query parameters for the Legals dataset.
     * @returns {Array} - Fetched `document_id` values.
     */
    static async fetchAcrisDocumentIds(legalsQueryParams) {
        try {
            const url = SoqlUrl.constructUrl(legalsQueryParams, "LegalsRealPropApi", "document_id");
            const headers = {
                "Content-Type": "application/json",
                "X-App-Token": process.env.NYC_OPEN_DATA_APP_TOKEN,
            };

            const { data } = await axios.get(url, { headers });

            if (!data?.length) {
                console.warn(`No document IDs found for query: ${JSON.stringify(legalsQueryParams)} from Real Property Legals API`);
                throw new NotFoundError("No document IDs found for the given query from Real Property Legals API.");
            }

            return data.map(record => record.document_id);
        } catch (err) {
            console.error("Error fetching document IDs from Real Property Legals API:", err.message);
            throw new Error("Failed to fetch document IDs from Real Property Legals API");
        }
    }

    /**
     * Fetch `document_id` values from the ACRIS Real Property Legals dataset (cross-referenced with Parties dataset).
     *
     * @param {Object} legalsQueryParams - Query parameters for the Legals dataset.
     * @param {Array<string>} partyRecordsDocumentIds - Array of document IDs to cross-reference.
     * @param {number} batchSize - Number of document IDs per batch.
     * @returns {Array<string>} - Fetched `document_id` values.
     */
    static async fetchAcrisDocumentIdsCrossRef(legalsQueryParams, partyRecordsDocumentIds, batchSize = 500) {
        try {
            // Extract document_id values if partyRecordsDocumentIds contains objects
            const documentIds = partyRecordsDocumentIds.map(record =>
                typeof record === "object" && record.document_id ? record.document_id : record
            );

            const queryUrls = SoqlUrl.constructUrlBatches(legalsQueryParams, documentIds, "LegalsRealPropApi", batchSize);
            console.log(queryUrls[0], "LegalsRealPropApi queryUrls");

            const allDocumentIds = new Set();

            for (const url of queryUrls) {
                let offset = 0;
                let hasMoreRecords = true;

                while (hasMoreRecords) {
                    const paginatedUrl = `${url}&$limit=1000&$offset=${offset}`;
                    const headers = {
                        "Content-Type": "application/json",
                        "X-App-Token": process.env.NYC_OPEN_DATA_APP_TOKEN,
                    };

                    const { data } = await axios.get(paginatedUrl, { headers });

                    if (!data?.length) {
                        hasMoreRecords = false;
                    } else {
                        data.forEach(record => allDocumentIds.add(record.document_id));
                        offset += 1000;
                    }
                }
            }

            if (allDocumentIds.size === 0) {
                throw new NotFoundError("No Real Property Legals records found for the given query.");
            }

            return Array.from(allDocumentIds);
        } catch (err) {
            console.error("Error fetching document IDs from Real Property Legals API:", err.message);
            throw new Error("Failed to fetch document IDs from Real Property Legals API");
        }
    }
}

module.exports = LegalsRealPropApi;