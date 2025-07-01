"use strict";

/** Routes for ACRIS UCC Collateral Codes API calls. */

const express = require("express");
const UccTypesCodeMapApi = require("../../../../thirdPartyApi/acris/code-maps/UccTypesCodeMapApi");

const router = new express.Router();

/** GET /fetchRecord => { records: [...] }
 *
 * Returns [{ record_type, ucc_collateral_code, description }]
 *
 * Authorization required: none
 *
 * Technical Explanation: This route fetches data from the ACRIS-UCC Collateral Codes API based on the query parameters provided. It constructs the URL using URLSearchParams and makes a GET request to the API. It returns the fetched records. This route was used exclusively during development for Postman-based API exploration and testing.
 *
 * Use Case: These codes are already seeded in the database which the server will use to query the Real Property and Personal Property datasets. This file was used during development to periodically check that the ACRIS UCC Collateral codes in the database match the current codes provided by the ACRIS API. If the codes do not match, the server will update the database with the new codes.
 *
 **/

router.get("/fetchAll", async function (req, res, next) {
  try {
    const query = req.query;
    const records = await UccTypesCodeMapApi.fetchFromAcris(query);
    return res.json({ records });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
