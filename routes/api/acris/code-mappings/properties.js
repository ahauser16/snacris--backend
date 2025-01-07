"use strict";

/** Routes for ACRIS Property Types API calls. */

const express = require("express");
const PropertyTypesApi = require("../../../../api/acris/code-maps/codeMapPropertyTypesApi");

const router = new express.Router();

/** GET /fetchRecord => { records: [...] }
 *
 * Returns [{ record_type, property_type, description }]
 *
 * Authorization required: Admin or higher
 * 
 * Technical Explanation: This route fetches data from the ACRIS-Property Type Codes API based on the query parameters provided.  It constructs the URL using URLSearchParams and makes a GET request to the API.  It returns the fetched records.
 * 
 * Use Case: These codes are already seeded in the database which the server will use to query the Real Property and Personal Property datasets.  This file will be used to periodically check that the ACRIS Property Type codes in the database match the current codes provided by the ACRIS API.  If the codes do not match, the server will update the database with the new codes. 
 **/

router.get("/fetchAll", async function (req, res, next) {
    try {
        const query = req.query;
        const records = await PropertyTypesApi.fetchFromAcris(query);
        return res.json({ records });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;