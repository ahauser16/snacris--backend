"use strict";
/** Routes for ACRIS Real Property Master API calls. */
const express = require("express");
const MasterRealPropApi = require("../../../../thirdPartyApi/acris/real-property/MasterRealPropApi");
const router = new express.Router();

/** GET /fetchRecord => { records: [...] }
 *
 * Fetch data from the 3rd party API.
 *
 * Returns [{ document_id, record_type, crfn, recorded_borough, doc_type, document_date, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date }, ...]
 *
 * Authorization required: none
 * 
 * Technical Explanation: This route fetches data from the ACRIS-Real Property Master API based on the query parameters provided.  It constructs the URL using URLSearchParams and makes a GET request to the API.  It returns the fetched records.
 * 
 * Use Case: This route is used to fetch data from the the ACRIS-Real Property Master API based on user-provided query parameters. The server can then cross-reference this data with other datasets.
 **/

router.get("/fetchRecord", async function (req, res, next) {
    try {
        const query = req.query;
        const realPropMasterRecords = await MasterRealPropApi.fetchAcrisRecords(query); 
        return res.json({ realPropMasterRecords });
    } catch (err) {
        return next(err);
    }
});


router.get("/fetchRecordCount", async function (req, res, next) {
    try {
        const query = req.query;
        const realPropMasterRecordCount = await MasterRealPropApi.fetchAcrisRecordCount(query); 
        return res.json({ realPropMasterRecordCount });
    } catch (err) {
        return next(err);
    }
});

router.get("/fetchDocIds", async function (req, res, next) {
    try {
        const query = req.query;
        const realPropMasterRecordsDocumentIds = await MasterRealPropApi.fetchAcrisDocumentIds(query); 

        return res.json({ realPropMasterRecordsDocumentIds });
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
        const realPropMasterRecords = await MasterRealPropApi.fetchAcrisRecordsByDocumentIds(documentIds);  
        return res.json({ realPropMasterRecords });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;