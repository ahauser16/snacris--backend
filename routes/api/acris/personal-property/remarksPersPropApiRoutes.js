"use strict";

/** Routes for ACRIS Real Property Remarks API calls. */

const express = require("express");
const RemarksPersPropApi = require("../../../../thirdPartyApi/acris/personal-property/RemarksPersPropApi");

const router = new express.Router();

/** GET /fetchRecord => { records: [...] }
 *
 * Fetch data from the ACRIS-Personal Property Remarks dataset based on user-data sent from the frontend.
 *
 * Returns [{ document_id, record_type, crfn, doc_id_ref, file_nbr, good_through_date }]
 *
 * Authorization required: logged-in user/admin
 *
 * Technical Explanation: This route was used during development with Postman for API exploration and learning purposes, and is now used in the deployed application by logged-in users. It fetches data from the ACRIS Personal Property Remarks API based on the query parameters provided.
 *
 * Use Case: This route is used to fetch data from the ACRIS Personal Property Remarks API based on user-provided query parameters. The server can then cross-reference this data with other datasets for both development testing and production functionality.
 **/

router.get("/fetchRecord", async function (req, res, next) {
  try {
    const query = req.query;
    const records = await RemarksPersPropApi.fetchFromAcris(query);
    return res.json({ records });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
