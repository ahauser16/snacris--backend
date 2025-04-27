"use strict";

/** Routes for ACRIS Real Property Legals API calls. */

const express = require("express");
const LegalsRealPropApi = require("../../../../api/acris/real-property/LegalsRealPropApi");

const router = new express.Router();

/** GET /fetchRecord => { records: [...] }
 *
 * Fetch data from the ACRIS-Real Property Legals dataset based on user-data sent from the frontend.
 *
 * * Returns [{ document_id, record_type, borough, block, lot, easement, partial_lot, air_rights, subterranean_rights, property_type, street_number, street_name, unit, good_through_date }]
 *
 * Authorization required: none
 * 
 * Technical Explanation: This route fetches data from the ACRIS-Real Property Legals API based on the query parameters provided.  It constructs the URL using URLSearchParams and makes a GET request to the API.  It returns the fetched records.
 * 
 * Use Case: This route is used to fetch data from the the ACRIS-Real Property Legals API based on user-provided query parameters. The server can then cross-reference this data with other datasets.
 **/

router.get("/fetchRecord", async function (req, res, next) {
    try {
        const query = req.query;
        const records = await LegalsRealPropApi.fetchFromAcris(query);
        return res.json({ records });
    } catch (err) {
        return next(err);
    }
});

router.get("/fetchRecordCount", async function (req, res, next) {
    try {
        const query = req.query;
        const count = await LegalsRealPropApi.fetchCountFromAcris(query);
        return res.json({ count });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;