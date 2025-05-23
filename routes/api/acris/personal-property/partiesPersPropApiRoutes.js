"use strict";

/** Routes for ACRIS Personal Property Parties API calls. */

const express = require("express");
const PartiesPersPropApi = require("../../../../thirdPartyApi/acris/personal-property/PartiesPersPropApi");

const router = new express.Router();

/** GET /fetchRecord => { records: [...] }
 *
 * Fetch data from the ACRIS-Personal Property Parties dataset based on user-data sent from the frontend.
 *
 * Returns [{ 
 * document_id, 
 * record_type, 
 * party_type, 
 * name, 
 * address_1, 
 * address_2, 
 * country, 
 * city, 
 * state, 
 * zip, 
 * good_through_date 
 * }]
 *
 * Authorization required: yes
 */
router.get("/fetchRecord", async function (req, res, next) {
    try {
        const query = req.query;
        const partiesRecords = await PartiesPersPropApi.fetchFromAcris(query);
        return res.json({ partiesRecords });
    } catch (err) {
        return next(err);
    }
});

/** GET /fetchDocIdsCrossRefMasterDocIds => { partiesDocIdsCrossRefMaster: [...] }
 *
 * Fetch `document_id` values from the ACRIS-Personal Property Parties dataset cross-referenced with Master dataset.
 *
 * Expects `masterRecordsDocumentIds` to be passed as a JSON array in the query.
 *
 * Returns [{ document_id }]
 *
 * Authorization required: yes
 */
router.get("/fetchDocIdsCrossRefMasterDocIds", async function (req, res, next) {
    try {
        const query = req.query;
        const masterRecordsDocumentIds = JSON.parse(query.masterRecordsDocumentIds || "[]");
        console.log("Parsed masterRecordsDocumentIds:", masterRecordsDocumentIds); // Debug log
        const partiesDocIdsCrossRefMaster = await PartiesPersPropApi.fetchDocIdsFromAcrisCrossRefMaster(query, masterRecordsDocumentIds);
        return res.json({ partiesDocIdsCrossRefMaster });
    } catch (err) {
        return next(err);
    }
});

/** GET /fetchRecordCount => { count: { partiesRecordCount: number } }
 *
 * Fetch the count of matching records from the ACRIS-Personal Property Parties dataset.
 *
 * Authorization required: yes
 */
router.get("/fetchRecordCount", async function (req, res, next) {
    try {
        const query = req.query;
        const partiesRecordCount = await PartiesPersPropApi.fetchCountFromAcris(query);
        return res.json({ partiesRecordCount });
    } catch (err) {
        return next(err);
    }
});


/** GET /fetchRecordCount => { count: { partiesRecordsDocumentIds: [...] } }
 *
 * Fetch the `document_id` values associated with the matching records from the ACRIS-Personal Property Parties dataset.
 *
 * Authorization required: yes
 */

router.get("/fetchDocIds", async function (req, res, next) {
    try {
        const query = req.query;
        const partiesRecordsDocumentIds = await PartiesPersPropApi.fetchDocIdsFromAcris(query);
        return res.json({ partiesRecordsDocumentIds });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;