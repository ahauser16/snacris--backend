"use strict";

/** Routes for ACRIS Real Property Parties API calls. */

const express = require("express");
const PartiesRealPropApi = require("../../../../api/acris/real-property/PartiesRealPropApi");

const router = new express.Router();

/** GET /fetchRecord => { records: [...] }
 *
 * Fetch data from the ACRIS-Real Property Parties dataset based on user-data sent from the frontend.
 *
 * Returns [{ document_id, record_type, party_type, name, address_1, address_2, country, city, state, zip, good_through_date }]
 *
 * Authorization required: none
 */
router.get("/fetchRecord", async function (req, res, next) {
    try {
        const query = req.query;
        const records = await PartiesRealPropApi.fetchFromAcris(query);
        return res.json({ records });
    } catch (err) {
        return next(err);
    }
});

/** GET /fetchDocIdsCrossRefMasterDocIds => { partiesDocIdsCrossRefMaster: [...] }
 *
 * Fetch `document_id` values from the ACRIS-Real Property Parties dataset cross-referenced with Master dataset.
 *
 * Expects `masterRecordsDocumentIds` to be passed as a JSON array in the query.
 *
 * Returns [{ document_id }]
 *
 * Authorization required: none
 */
router.get("/fetchDocIdsCrossRefMasterDocIds", async function (req, res, next) {
    try {
        const query = req.query;
        const masterRecordsDocumentIds = JSON.parse(query.masterRecordsDocumentIds || "[]"); 
        console.log("Parsed masterRecordsDocumentIds:", masterRecordsDocumentIds); // Debug log
        const partiesDocIdsCrossRefMaster = await PartiesRealPropApi.fetchDocIdsFromAcrisCrossRefMaster(query, masterRecordsDocumentIds);
        return res.json({ partiesDocIdsCrossRefMaster });
    } catch (err) {
        return next(err);
    }
});

/** GET /fetchRecordCount => { count: { partiesRecordCount: number } }
 *
 * Fetch the count of matching records from the ACRIS-Real Property Parties dataset.
 *
 * Authorization required: none
 */
router.get("/fetchRecordCount", async function (req, res, next) {
    try {
        const query = req.query;
        const count = await PartiesRealPropApi.fetchCountFromAcris(query);
        return res.json({ count });
    } catch (err) {
        return next(err);
    }
});

router.get("/fetchDocIds", async function (req, res, next) {
    try {
        const query = req.query;
        const { partiesRecordsDocumentIds, partiesRecordsDocumentIds_Duplicates } = await PartiesRealPropApi.fetchDocIdsFromAcris(query);
        return res.json({ partiesRecordsDocumentIds, partiesRecordsDocumentIds_Duplicates });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;