"use strict";

/** Routes for ACRIS Real Property Remarks API calls. */

const express = require("express");
const RemarksRealPropApi = require("../../../../thirdPartyApi/acris/real-property/RemarksRealPropApi");

const router = new express.Router();

/** GET /fetchRecord => { records: [...] }
 *
 * Fetch data from the ACRIS-Real Property Remarks dataset based on user-data sent from the frontend.
 *
 * Returns [{ document_id, record_type, sequence_number, remark_text, good_through_date }]
 *
 * Authorization required: none
 * 
 * Technical Explanation: This route fetches data from the ACRIS-Real Property Remarks API based on the query parameters provided.  It constructs the URL using URLSearchParams and makes a GET request to the API.  It returns the fetched records.
 * 
 * Use Case: This route is used to fetch data from the the ACRIS-Real Property Remarks API based on user-provided query parameters. The server can then cross-reference this data with other datasets.
 **/

router.get("/fetchRecord", async function (req, res, next) {
    try {
        const query = req.query;
        const realPropRemarksRecords = await RemarksRealPropApi.fetchAcrisRecords(query); 
        return res.json({ realPropRemarksRecords });
    } catch (err) {
        return next(err);
    }
});


/** GET /fetchRecordCount => { count: { partiesRecordCount: number } }
 *
 * Fetch the count of matching records from the ACRIS-Real Property Parties dataset.
 *
 * Authorization required: yes
 */
router.get("/fetchRecordCount", async function (req, res, next) {
    try {
        const query = req.query;
        const realPropRemarksRecordCount = await RemarksRealPropApi.fetchAcrisRecordCount(query);
        return res.json({ realPropRemarksRecordCount });
    } catch (err) {
        return next(err);
    }
});

/** GET /fetchRecordCount => { count: { partiesRecordsDocumentIds: [...] } }
 *
 * Fetch the `document_id` values associated with the matching records from the ACRIS-Real Property Parties dataset.
 *
 * Authorization required: yes
 */

router.get("/fetchDocIds", async function (req, res, next) {
    try {
        const query = req.query;
        const realPropRemarksRecordsDocumentIds = await RemarksRealPropApi.fetchAcrisDocumentIds(query); // <-- old code
        return res.json({ realPropRemarksRecordsDocumentIds });
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
        const realPropRemarksRecords = await RemarksRealPropApi.fetchAcrisRecordsByDocumentIds(documentIds);  
        return res.json({ realPropRemarksRecords });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;