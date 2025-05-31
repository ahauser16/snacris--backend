"use strict";
const express = require("express");
const LegalsRealPropApi = require("../../../thirdPartyApi/acris/real-property/LegalsRealPropApi");
const { transformForUrl } = require("../../../thirdPartyApi/utils");

const router = new express.Router();

/**
 * Filters records to include only unique records based on all key/value pairs except document_id.
 *
 * @param {Array} records - The array of record objects.
 * @returns {Array} - An array of unique full record objects.
 */
function findUniqueFullRecords(records) {
    if (!records || records.length === 0) return [];
    const uniqueRecords = [];
    const seen = new Set();

    for (let record of records) {
        // Create a shallow copy of the record without document_id
        const { document_id, ...rest } = record;
        // Use JSON.stringify to create a unique identifier for the rest of the record
        const identifier = JSON.stringify(rest);

        if (!seen.has(identifier)) {
            seen.add(identifier);
            uniqueRecords.push(record); // Push the full record, including document_id
        }
    }

    return uniqueRecords;
}

////////////////////////////////////////////////
// ...existing code...
function analyzeResults(records) {
    if (!records || records.length === 0) return {};

    const keysToCheck = [
        'borough', 'block', 'lot',
        'street_number', 'street_name',
        'record_type', 'easement', 'partial_lot',
        'air_rights', 'subterranean_rights', 'property_type'
    ];

    const summary = {};

    keysToCheck.forEach(key => {
        const valueCounts = {};
        const valueToDocs = {};

        for (const rec of records) {
            const val = rec[key] === undefined ? null : rec[key];
            valueCounts[val] = (valueCounts[val] || 0) + 1;
            if (!valueToDocs[val]) valueToDocs[val] = [];
            valueToDocs[val].push(rec.document_id);
        }

        // Sort values by count descending
        const sortedValues = Object.entries(valueCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([val]) => val === "null" ? null : val);

        summary[key] = sortedValues;

        // Consistency: count of most common value / total
        const mostCommonCount = valueCounts[sortedValues[0] === null ? "null" : sortedValues[0]] || 0;
        summary[`${key}_consistency`] = `${mostCommonCount}/${records.length}`;

        // Exceptions: all values except the most common, with doc_ids and count
        summary[`${key}_exceptions`] = sortedValues.slice(1).map(val => ({
            [key]: val,
            count: valueCounts[val === null ? "null" : val],
            document_ids: valueToDocs[val === null ? "null" : val]
        }));
    });

    return summary;
}
// ...existing code...
////////////////////////////////////////////////

/** GET /fetchRecord => { records: [...] }
 *
 * Fetch data from the NYC Open Data Real Property Legals dataset based on query parameters.
 *
 * Query Parameters:
 * GROUP A:
 * - borough
 * - block
 * - lot
 * GROUP B:
 * - borough
 * - street_number
 * - street_name
 * - unit
 *
 * * Returns records with the structure:
 * [{ 
 * - document_id, 
 * - record_type, 
 * - borough, 
 * - block, 
 * - lot, 
 * - easement, 
 * - partial_lot, 
 * - air_rights, 
 * - subterranean_rights, 
 * - property_type, 
 * - street_number, 
 * - street_name, 
 * - unit, 
 * - good_through_date 
 * }]
 *
 * Authorization required: registered user
 * 
 * Technical Explanation: This route fetches data from the ACRIS-Real Property Legals API based on the query parameters provided.  It constructs the URL using URLSearchParams and makes a GET request to the API.  It returns the fetched records.
 * 
 * Use Case: This route is used to fetch data from the the ACRIS-Real Property Legals API based on user-provided query parameters. The server can then cross-reference this data with other datasets.
 **/

router.get("/fetchRecord", async function (req, res, next) {
    try {
        // Extract query parameters from the request
        const { borough, block, lot, street_number, street_name, unit } = req.query;

        // Validate and construct query parameters
        const queryParams = {};
        if (borough) queryParams.borough = borough;
        if (block) queryParams.block = block;
        if (lot) queryParams.lot = lot;
        if (street_number) queryParams.street_number = transformForUrl(street_number);
        if (street_name) queryParams.street_name = transformForUrl(street_name);
        if (unit) queryParams.unit = transformForUrl(unit);

        // Ensure at least one valid parameter is provided
        if (Object.keys(queryParams).length === 0) {
            return res.status(400).json({
                status: "error",
                message: "At least one query parameter is required.",
                records: [],
            });
        }

        // Fetch data from the ACRIS API
        const records = await LegalsRealPropApi.fetchAcrisRecords(queryParams);
        console.log(records.length, records[0], "records from 'LegalsRealPropApi.fetchAcrisRecords'");

        if (!records || records.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "No records found for the provided query parameters.",
                records: [],
            });
        }

        // Analyze the results (snapshot/summary and groupings)
        const analysis = analyzeResults(records);
        console.log(analysis, "analysis");

        return res.json({
            status: "success",
            message: `Analysis complete for ${records.length} records.`,
            analysis
        });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;