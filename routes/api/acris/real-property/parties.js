"use strict";

/** Routes for ACRIS Real Property Parties API calls. */

const express = require("express");
const RealPropertyPartiesApi = require("../../../../api/acris/real-property/partiesApi");

const router = new express.Router();

/** GET /fetchRecord => { records: [...] }
 *
 * Fetch data from the ACRIS-Real Property Parties dataset based on user-data sent from the frontend.
 *
 * * Returns [{ document_id,record_type,party_type,name,address_1,address_2,country,city,state,zip,good_through_date }]
 *
 * Authorization required: none
 * 
 * Technical Explanation: This route fetches data from the ACRIS-Real Property Parties API based on the query parameters provided.  It constructs the URL using URLSearchParams and makes a GET request to the API.  It returns the fetched records.
 * 
 * Use Case: This route is used to fetch data from the the ACRIS-Real Property Parties API based on user-provided query parameters. The server can then cross-reference this data with other datasets.
 **/

router.get("/fetchRecord", async function (req, res, next) {
    try {
        const query = req.query;
        const records = await RealPropertyPartiesApi.fetchFromAcris(query);
        return res.json({ records });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;