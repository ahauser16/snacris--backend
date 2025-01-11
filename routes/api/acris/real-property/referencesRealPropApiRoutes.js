"use strict";

/** Routes for ACRIS Real Property References API calls. */

const express = require("express");
const ReferencesRealPropApi = require("../../../../api/acris/real-property/ReferencesRealPropApi");

const router = new express.Router();

/** GET /fetchRecord => { records: [...] }
 *
 * Fetch data from the ACRIS-Real Property References dataset based on user-data sent from the frontend.
 *
 * * Returns [{ document_id, record_type, reference_by_crfn_, reference_by_doc_id, reference_by_reel_year, reference_by_reel_borough, reference_by_reel_nbr, reference_by_reel_page, good_through_date }]
 *
 * Authorization required: none
 * 
 * Technical Explanation: This route fetches data from the ACRIS-Real Property References API based on the query parameters provided.  It constructs the URL using URLSearchParams and makes a GET request to the API.  It returns the fetched records.
 * 
 * Use Case: This route is used to fetch data from the the ACRIS-Real Property References API based on user-provided query parameters. The server can then cross-reference this data with other datasets.
 **/

router.get("/fetchRecord", async function (req, res, next) {
    try {
        const query = req.query;
        const records = await ReferencesRealPropApi.fetchFromAcris(query);
        return res.json({ records });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;