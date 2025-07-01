"use strict";

/** Routes for ACRIS Personal Property Parties API calls. */

const express = require("express");
const PartiesPersPropApi = require("../../../../thirdPartyApi/acris/personal-property/PartiesPersPropApi");

const router = new express.Router();

/** GET /fetchRecord => { records: [...] }
 *
 * Fetch data from the ACRIS-Personal Property Parties dataset based on user-data sent from the frontend.
 *
 * Returns [{
 * document_id,
 * record_type,
 * party_type,
 * name,
 * address_1,
 * address_2,
 * country,
 * city,
 * state,
 * zip,
 * good_through_date
 * }]
 *
 * Authorization required: logged-in user/admin
 *
 * Technical Explanation: This route was used during development with Postman for API exploration and learning purposes, and is now used in the deployed application by logged-in users. It fetches data from the ACRIS Personal Property Parties API based on the query parameters provided.
 *
 * Use Case: This route is used to fetch data from the ACRIS Personal Property Parties API based on user-provided query parameters. The server can then cross-reference this data with other datasets for both development testing and production functionality.
 */
router.get("/fetchRecord", async function (req, res, next) {
  try {
    const query = req.query;
    const partiesRecords = await PartiesPersPropApi.fetchFromAcris(query);
    return res.json({ partiesRecords });
  } catch (err) {
    return next(err);
  }
});

/** GET /fetchDocIdsCrossRefMasterDocIds => { partiesDocIdsCrossRefMaster: [...] }
 *
 * Fetch `document_id` values from the ACRIS-Personal Property Parties dataset cross-referenced with Master dataset.
 *
 * Expects `masterRecordsDocumentIds` to be passed as a JSON array in the query.
 *
 * Returns [{ document_id }]
 *
 * Authorization required: logged-in user/admin
 *
 * Technical Explanation: This route was used during development with Postman for API exploration and learning purposes, and is now used in the deployed application by logged-in users. It fetches cross-referenced document IDs from the ACRIS Personal Property Parties API.
 *
 * Use Case: This route enables cross-referencing between Personal Property Parties and Master datasets for both development testing and production functionality.
 */
router.get("/fetchDocIdsCrossRefMasterDocIds", async function (req, res, next) {
  try {
    const query = req.query;
    const masterRecordsDocumentIds = JSON.parse(
      query.masterRecordsDocumentIds || "[]"
    );
    const partiesDocIdsCrossRefMaster =
      await PartiesPersPropApi.fetchDocIdsFromAcrisCrossRefMaster(
        query,
        masterRecordsDocumentIds
      );
    return res.json({ partiesDocIdsCrossRefMaster });
  } catch (err) {
    return next(err);
  }
});

/** GET /fetchRecordCount => { count: { partiesRecordCount: number } }
 *
 * Fetch the count of matching records from the ACRIS-Personal Property Parties dataset.
 *
 * Authorization required: logged-in user/admin
 *
 * Technical Explanation: This route was used during development with Postman for API exploration and learning purposes, and is now used in the deployed application by logged-in users. It fetches the count of matching records from the ACRIS Personal Property Parties API.
 *
 * Use Case: This route is used to determine the number of records that match specific search criteria before fetching full data for both development testing and production functionality.
 */
router.get("/fetchRecordCount", async function (req, res, next) {
  try {
    const query = req.query;
    const partiesRecordCount = await PartiesPersPropApi.fetchCountFromAcris(
      query
    );
    return res.json({ partiesRecordCount });
  } catch (err) {
    return next(err);
  }
});

/** GET /fetchRecordCount => { count: { partiesRecordsDocumentIds: [...] } }
 *
 * Fetch the `document_id` values associated with the matching records from the ACRIS-Personal Property Parties dataset.
 *
 * Authorization required: logged-in user/admin
 *
 * Technical Explanation: This route was used during development with Postman for API exploration and learning purposes, and is now used in the deployed application by logged-in users. It fetches document IDs from the ACRIS Personal Property Parties API.
 *
 * Use Case: This route is used to retrieve document IDs for cross-referencing with other ACRIS datasets for both development testing and production functionality.
 */

router.get("/fetchDocIds", async function (req, res, next) {
  try {
    const query = req.query;
    const partiesRecordsDocumentIds =
      await PartiesPersPropApi.fetchDocIdsFromAcris(query);
    return res.json({ partiesRecordsDocumentIds });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
