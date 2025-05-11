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
        // const masterRecords = await MasterRealPropApi.fetchFromAcris(query); //OLD CODE THAT WORKS BUT IS BEING REPLACED
        const realPropMasterRecords = await MasterRealPropApi.fetchAcrisRecords(query); //NEW CODE TO TEST - success
        // fetchAcrisRecords
        return res.json({ realPropMasterRecords });
    } catch (err) {
        return next(err);
    }
});


router.get("/fetchRecordCount", async function (req, res, next) {
    try {
        const query = req.query;
        //const masterRecordCount = await MasterRealPropApi.fetchCountFromAcris(query); //OLD CODE THAT WORKS BUT IS BEING REPLACED
        const realPropMasterRecordCount = await MasterRealPropApi.fetchAcrisRecordCount(query); //NEW CODE TO TEST - success
        return res.json({ realPropMasterRecordCount });
    } catch (err) {
        return next(err);
    }
});

router.get("/fetchDocIds", async function (req, res, next) {
    try {
        const query = req.query;
        //const masterRecordsDocumentIds = await MasterRealPropApi.fetchDocIdsFromAcris(query); //OLD CODE THAT WORKS BUT IS BEING REPLACED
        const realPropMasterRecordsDocumentIds = await MasterRealPropApi.fetchAcrisDocumentIds(query); //NEW CODE TO TEST 

        return res.json({ realPropMasterRecordsDocumentIds });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;