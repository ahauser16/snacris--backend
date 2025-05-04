"use strict";

/** Routes for ACRIS Real Property Master API calls. */

const express = require("express");
const MasterPersPropApi = require("../../../../thirdPartyApi/acris/personal-property/MasterPersPropApi");

const router = new express.Router();

/** GET /fetchRecord => { records: [...] }
 *
 * Fetch data from the ACRIS-Personal Property Master dataset based on user-data sent from the frontend.
 *
 * Returns [{ document_id, record_type, crfn, recorded_borough, doc_type, document_amt, recorded_datetime, ucc_collateral, fedtax_serial_nbr, fedtax_assessment_date, rpttl_nbr, modified_date, reel_yr, reel_nbr, reel_pg, file_nbr, good_through_date }]
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
      const masterRecords = await MasterPersPropApi.fetchFromAcris(query);
      return res.json({ masterRecords });
    } catch (err) {
      return next(err);
    }
  });

  
router.get("/fetchRecordCount", async function (req, res, next) {
    try {
        const query = req.query;
        const masterRecordCount = await MasterPersPropApi.fetchCountFromAcris(query);
        return res.json({ masterRecordCount });
    } catch (err) {
        return next(err);
    }
});

router.get("/fetchDocIds", async function (req, res, next) {
    try {
        const query = req.query;
        const masterRecordsDocumentIds = await MasterPersPropApi.fetchDocIdsFromAcris(query);

        return res.json({ masterRecordsDocumentIds });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;