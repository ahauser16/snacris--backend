"use strict";

/** Routes for ACRIS Real Property References API calls. */

const express = require("express");
const ReferencesPersPropApi = require("../../../../thirdPartyApi/acris/personal-property/ReferencesPersPropApi");

const router = new express.Router();

/** GET /fetchRecord => { records: [...] }
 *
 * Fetch data from the ACRIS-Personal Property References dataset based on user-data sent from the frontend.
 *
 * Returns [{ document_id, record_type, crfn, doc_id_ref, file_nbr, good_through_date }]
 *
 * Authorization required: logged-in user/admin
 *
 * Technical Explanation: This route fetches data from the ACRIS-Personal Property References API based on the query parameters provided. It constructs the URL using URLSearchParams and makes a GET request to the API. It returns the fetched records. This route was used during development for Postman-based API exploration and is deployed in the production application.
 *
 * Use Case: This route is used to fetch data from the ACRIS-Personal Property References API based on user-provided query parameters. The server can then cross-reference this data with other datasets.
 **/

router.get("/fetchRecord", async function (req, res, next) {
  try {
    const query = req.query;
    const records = await ReferencesPersPropApi.fetchFromAcris(query);
    return res.json({ records });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
