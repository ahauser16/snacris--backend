"use strict";

/** Routes for ACRIS Real Property Legals API calls. */

const express = require("express");
const LegalsPersPropApi = require("../../../../thirdPartyApi/acris/personal-property/LegalsPersPropApi");

const router = new express.Router();

/** GET /fetchRecord => { records: [...] }
 *
 * Fetch data from the ACRIS-Personal Property Legals dataset based on user-data sent from the frontend.
 *
 * * Returns [{ 
 * document_id, 
 * record_type, 
 * borough, 
 * block, 
 * lot, 
 * easement, 
 * partial_lot, 
 * air_rights, 
 * subterranean_rights, 
 * property_type, 
 * street_number, 
 * street_name, 
 * unit, 
 * good_through_date }]
 *
 * Authorization required: none
 * 
 * Technical Explanation: This route fetches data from the ACRIS-Personal Property Legals API based on the query parameters provided.  It constructs the URL using URLSearchParams and makes a GET request to the API.  It returns the fetched records.
 * 
 * Use Case: This route is used to fetch data from the the ACRIS-Personal Property Legals API based on user-provided query parameters. The server can then cross-reference this data with other datasets.
 **/

router.get("/fetchRecord", async function (req, res, next) {
    try {
        console.log("Received query parameters:", req.query);
        const query = req.query;
        const records = await LegalsPersPropApi.fetchFromAcris(query);
        return res.json({ records });
    } catch (err) {
        console.error("Error in /fetchRecord route:", err.message);
        return next(err);
    }
});

/** GET /fetchRecordCount => { count: { legalsRecordCount: number } }
 *
 * Fetch the count of matching records from the ACRIS-Real Property Legals dataset.
 *
 * Authorization required: none
 */

router.get("/fetchRecordCount", async function (req, res, next) {
    try {
        const query = req.query;
        const legalsRecordCount = await LegalsPersPropApi.fetchCountFromAcris(query);
        return res.json({ legalsRecordCount });
    } catch (err) {
        return next(err);
    }
});

/** GET /fetchDocIdsCrossRefPartyDocIds => { legalsDocIdsCrossRefParties: [...] }
 *
 * Fetch `document_id` values from the ACRIS-Real Property Legals dataset cross-referenced with Parties dataset.
 *
 * Expects `partiesDocIdsCrossRefMaster` to be passed as a JSON array in the query.
 *
 * Returns [{ document_id }]
 *
 * Authorization required: none
 */
router.get("/fetchDocIdsCrossRefPartyDocIds", async function (req, res, next) {
    try {
        const query = req.query;
        const partiesDocIdsCrossRefMaster = JSON.parse(query.partiesDocIdsCrossRefMaster || "[]");
        console.log("Parsed partiesDocIdsCrossRefMaster:", partiesDocIdsCrossRefMaster); // Debug log
        const legalsDocIdsCrossRefParties = await LegalsPersPropApi.fetchDocIdsFromAcrisCrossRefParties(query, partiesDocIdsCrossRefMaster);
        return res.json({ legalsDocIdsCrossRefParties });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;