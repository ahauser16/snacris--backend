"use strict";

/** Routes for ACRIS Real Property Legals API calls. */

const express = require("express");
const LegalsRealPropApi = require("../../../api/acris/real-property/LegalsRealPropApi");

const router = new express.Router();

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
        if (street_number) queryParams.street_number = street_number;
        if (street_name) queryParams.street_name = street_name;
        if (unit) queryParams.unit = unit;

        // Ensure at least one valid parameter is provided
        if (Object.keys(queryParams).length === 0) {
            return res.status(400).json({ error: "At least one query parameter is required." });
        }

        // Fetch data from the ACRIS API
        const records = await LegalsRealPropApi.fetchFromAcris(queryParams);
        return res.json({ records });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;