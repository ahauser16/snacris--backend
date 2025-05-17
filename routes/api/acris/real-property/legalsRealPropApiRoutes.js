"use strict";

/** Routes for ACRIS Real Property Legals API calls. */

const express = require("express");
const LegalsRealPropApi = require("../../../../thirdPartyApi/acris/real-property/LegalsRealPropApi");

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
        console.log("Received query parameters:", req.query);
        const query = req.query;
        const realPropLegalsRecords = await LegalsRealPropApi.fetchAcrisRecords(query);
        return res.json({ realPropLegalsRecords });
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
        const realPropLegalsRecordCount = await LegalsRealPropApi.fetchAcrisRecordCount(query);
        return res.json({ realPropLegalsRecordCount });
    } catch (err) {
        return next(err);
    }
});

router.get("/fetchDocIds", async function (req, res, next) {
    try {
        const query = req.query;
        const realPropLegalsRecordsDocumentIds = await LegalsRealPropApi.fetchAcrisDocumentIds(query); // <-- old code
        return res.json({ realPropLegalsRecordsDocumentIds });
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
        const legalsDocIdsCrossRefParties = await LegalsRealPropApi.fetchDocIdsFromAcrisCrossRefParties(query, partiesDocIdsCrossRefMaster);
        return res.json({ legalsDocIdsCrossRefParties });
    } catch (err) {
        return next(err);
    }
});


router.get("/fetchAcrisRecordsByDocumentIds", async function (req, res, next) {
    try {
        let { documentIds } = req.query;
        // Support both comma-separated and JSON array
        if (typeof documentIds === "string") {
            if (documentIds.startsWith("[")) {
                documentIds = JSON.parse(documentIds);
            } else {
                documentIds = documentIds.split(",");
            }
        }
        const realPropLegalsRecords = await LegalsRealPropApi.fetchAcrisRecordsByDocumentIds(documentIds);  
        return res.json({ realPropLegalsRecords });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;