"use strict";

const axios = require("axios");
const { NotFoundError } = require("../../../expressError");
const API_ENDPOINTS = require("../../apiEndpoints");

/** Functions for interacting with the ACRIS Personal Property Legals API. */

class LegalsPersPropApi {
    /**
     * Constructs a SoQL query URL for the Personal Property Legals dataset.
     *
     * @param {Object} params - Query parameters for the Legals dataset.
     * @param {string} [params.document_id] - Document ID.
     * @param {string} [params.record_type] - Record type.
     * @param {number} [params.borough] - Borough.
     * @param {number} [params.block] - Block.
     * @param {number} [params.lot] - Lot.
     * @param {string} [params.easement] - Easement.
     * @param {string} [params.partial_lot] - Partial lot.
     * @param {string} [params.air_rights] - Air rights.
     * @param {string} [params.subterranean_rights] - Subterranean rights.
     * @param {string} [params.property_type] - Property type.
     * @param {string} [params.street_number] - Street number.
     * @param {string} [params.street_name] - Street name.
     * @param {string} [params.addr_unit] - Address unit.
     * @param {string} [params.good_through_date] - Good through date.
     * @returns {string} - Constructed SoQL query URL.
     */
    static constructLegalsUrl({
        document_id,
        record_type,
        borough,
        block,
        lot,
        easement,
        partial_lot,
        air_rights,
        subterranean_rights,
        property_type,
        street_number,
        street_name,
        addr_unit,
        good_through_date,
    } = {}) {
        const conditions = [];

        if (document_id) conditions.push(`upper(document_id)=upper('${document_id}')`);
        if (record_type) conditions.push(`record_type='${record_type}'`);
        if (borough) conditions.push(`borough=${borough}`);
        if (block) conditions.push(`block=${block}`);
        if (lot) conditions.push(`lot=${lot}`);
        if (easement) conditions.push(`easement='${easement}'`);
        if (partial_lot) conditions.push(`partial_lot='${partial_lot}'`);
        if (air_rights) conditions.push(`air_rights='${air_rights}'`);
        if (subterranean_rights) conditions.push(`subterranean_rights='${subterranean_rights}'`);
        if (property_type) conditions.push(`property_type='${property_type}'`);
        if (street_number) conditions.push(`street_number='${street_number}'`);
        if (street_name) conditions.push(`street_name='${street_name}'`);
        if (addr_unit) conditions.push(`addr_unit='${addr_unit}'`);
        if (good_through_date) conditions.push(`good_through_date='${good_through_date}'`);

        const whereClause = conditions.length > 0 ? `$where=${conditions.join(" AND ")}` : "";

        const url = `${API_ENDPOINTS.personalPropertyLegals}?${whereClause}`;
        return url;
    }

    /**
     * Constructs a SoQL query URL to count matching records in the Personal Property Legals dataset.
     *
     * @param {Object} params - Query parameters for the Legals dataset.
     * @returns {string} - Constructed SoQL query URL for counting records.
     */
    static constructLegalsUrlCountRec(params = {}) {
        const baseUrl = this.constructLegalsUrl(params);
        return `${baseUrl}&$select=count(*)`;
    }

    /**
     * Constructs a SoQL query URL to retrieve only `document_id` values from the Personal Property Legals dataset.
     *
     * @param {Object} params - Query parameters for the Legals dataset.
     * @returns {string} - Constructed SoQL query URL for selecting `document_id` values.
     */
    static constructLegalsUrlSelectDocIds(params = {}) {
        const baseUrl = this.constructLegalsUrl(params);
        return `${baseUrl}&$select=document_id`;
    }

    /**
   * Constructs a SoQL query URL for the Personal Property Legals dataset (cross-referenced with Parties dataset, selecting only `document_id` values).
   *
   * @param {Object} legalsQueryParams - Query parameters for the Legals dataset.
   * @param {Array<string>} partiesDocIdsCrossRefMaster - Array of document IDs to cross-reference.
   * @param {number} batchSize - Number of document IDs per batch.
   * @returns {Array<string>} - Array of constructed query URLs.
   */
    static constructLegalsUrlCrossRefPartiesSelectDocIds(legalsQueryParams, partiesDocIdsCrossRefMaster, batchSize = 500) {
        const baseUrl = this.constructLegalsUrl(legalsQueryParams);

        const batches = [];
        for (let i = 0; i < partiesDocIdsCrossRefMaster.length; i += batchSize) {
            const batch = partiesDocIdsCrossRefMaster.slice(i, i + batchSize);
            const documentIdsCondition = `document_id IN (${batch.map(id => `'${id}'`).join(", ")})`;
            const separator = baseUrl.includes("$where=") ? " AND " : "$where=";
            const url = `${baseUrl}${separator}${documentIdsCondition}&$select=document_id`;
            batches.push(url);
        }

        return batches;
    }

    /**
     * Fetch data from the ACRIS Personal Property Legals dataset.
     * @param {Object} query - Query parameters.
     * @returns {Array} - Fetched records.
     */
    static async fetchFromAcris(query) {
        try {
            const url = this.constructLegalsUrl(query);
            console.log("Constructed URL:", url);

            const headers = {
                "Content-Type": "application/json",
                "X-App-Token": process.env.APP_TOKEN,
            };

            const { data } = await axios.get(url, { headers });

            if (!data?.length) {
                console.warn(`No records found for query: ${JSON.stringify(query)}`);
                throw new NotFoundError("No records found for the given query.");
            }

            return data;
        } catch (err) {
            console.error("Error fetching data from ACRIS API:", err.message);
            throw new Error("Failed to fetch data from ACRIS API.");
        }
    }

    /**
     * Fetch the count of matching records from the ACRIS Personal Property Legals dataset.
     *
     * @param {Object} query - Query parameters.
     * @returns {number} - Count of matching records.
     */
    static async fetchCountFromAcris(query) {
        try {
            const url = this.constructLegalsUrlCountRec(query);
            console.log("constructLegalsUrlCountRec output:", url);

            const headers = {
                "Content-Type": "application/json",
                "X-App-Token": process.env.APP_TOKEN,
            };

            const { data } = await axios.get(url, { headers });

            if (!data?.length || !data[0]?.count) {
                console.warn(`No count data found for query: ${JSON.stringify(query)}`);
                throw new NotFoundError("No count data found for the given query.");
            }

            return Number(data[0].count);
        } catch (err) {
            console.error("Error fetching count from ACRIS API:", err.message);
            throw new Error("Failed to fetch count from ACRIS API.");
        }
    }

    /**
     * Fetch all `document_id` values from the ACRIS Personal Property Legals dataset using pagination.
     *
     * @param {Object} query - Query parameters.
     * @returns {Array} - Array of unique `document_id` values.
     */
    static async fetchDocIdsFromAcris(query) {
        try {
            const limit = 1000;
            let offset = 0;
            let hasMoreRecords = true;
            const documentIds = new Set();

            while (hasMoreRecords) {
                const url = `${this.constructLegalsUrlSelectDocIds(query)}&$limit=${limit}&$offset=${offset}`;
                console.log("fetchDocIdsFromAcris URL:", url);

                const headers = {
                    "Content-Type": "application/json",
                    "X-App-Token": process.env.APP_TOKEN,
                };

                const { data } = await axios.get(url, { headers });

                if (!data?.length) {
                    console.warn(`No document IDs found for query: ${JSON.stringify(query)}`);
                    throw new NotFoundError("No document IDs found for the given query.");
                }

                data.forEach(record => {
                    documentIds.add(record.document_id);
                });

                if (data.length < limit) {
                    hasMoreRecords = false;
                } else {
                    offset += limit;
                }
            }

            return Array.from(documentIds);
        } catch (err) {
            console.error("Error fetching document IDs from ACRIS API:", err.message);
            throw new Error("Failed to fetch document IDs from ACRIS API.");
        }
    }

    /**
       * Fetch `document_id` values from the ACRIS Personal Property Legals dataset (cross-referenced with Parties dataset).
       *
       * @param {Object} legalsQueryParams - Query parameters for the Legals dataset.
       * @param {Array<string>} partiesDocIdsCrossRefMaster - Array of document IDs to cross-reference.
       * @param {number} batchSize - Number of document IDs per batch.
       * @returns {Array<string>} - Fetched `document_id` values.
       */
    static async fetchDocIdsFromAcrisCrossRefParties(legalsQueryParams, partiesDocIdsCrossRefMaster, batchSize = 500) {
        try {
            // Construct query URLs in batches
            const queryUrls = this.constructLegalsUrlCrossRefPartiesSelectDocIds(legalsQueryParams, partiesDocIdsCrossRefMaster, batchSize);
            const allDocumentIds = new Set();

            for (const url of queryUrls) {
                let offset = 0;
                let hasMoreRecords = true;

                while (hasMoreRecords) {
                    const paginatedUrl = `${url}&$limit=1000&$offset=${offset}`;
                    console.log("Fetching URL:", paginatedUrl);

                    const headers = {
                        "Content-Type": "application/json",
                        "X-App-Token": process.env.APP_TOKEN,
                    };

                    const { data } = await axios.get(paginatedUrl, { headers });

                    if (!data?.length) {
                        console.warn(`No records found for query: ${JSON.stringify(legalsQueryParams)}`);
                        throw new NotFoundError("No records found for the given query.");
                    }

                    data.forEach(record => allDocumentIds.add(record.document_id));

                    if (data.length < 1000) {
                        hasMoreRecords = false;
                    } else {
                        offset += 1000;
                    }
                }
            }

            return Array.from(allDocumentIds);
        } catch (err) {
            console.error("Error fetching document IDs from ACRIS API:", err.message);
            throw new Error("Failed to fetch document IDs from ACRIS API.");
        }
    }
}

module.exports = LegalsPersPropApi;