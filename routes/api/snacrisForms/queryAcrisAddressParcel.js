"use strict";
const express = require("express");
const LegalsRealPropApi = require("../../../thirdPartyApi/acris/real-property/LegalsRealPropApi");
const { transformForUrl } = require("../../../thirdPartyApi/utils");

const router = new express.Router();

/**
 * Filters records to include only unique properties based on specific keys.
 *
 * @param {Array} records - The array of record objects.
 * @returns {Array} - An array of unique objects containing only the specified keys.
 */
function findUniqueProperties(records) {
    if (!records || records.length === 0) return [];
    const uniqueRecords = [];
    const seen = new Set();

    for (let record of records) {
        // Extract only the relevant keys
        const filteredRecord = {
            borough: record.borough,
            block: record.block,
            lot: record.lot,
            street_number: record.street_number,
            street_name: record.street_name,
        };

        const identifier = JSON.stringify(filteredRecord);

        // Add the record to the result if it hasn't been seen before
        if (!seen.has(identifier)) {
            seen.add(identifier);
            uniqueRecords.push(filteredRecord);
        }
    }

    return uniqueRecords;
}


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
        console.log(records, "records from LegalsRealPropApi");

        if (!records || records.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "No records found for the provided query parameters.",
                records: [],
            });
        }

        // Find unique properties
        const uniqueRecords = findUniqueProperties(records);
        console.log(uniqueRecords, "uniqueRecords");

        return res.json({
            status: "success",
            message: `${uniqueRecords.length} unique properties found.`,
            records: uniqueRecords,
        });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;