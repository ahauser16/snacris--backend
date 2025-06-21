"use strict";

const express = require("express");
const MasterPersPropApi = require("../../../thirdPartyApi/acris/personal-property/MasterPersPropApi");
const LegalsPersPropApi = require("../../../thirdPartyApi/acris/personal-property/LegalsPersPropApi");
const PartiesPersPropApi = require("../../../thirdPartyApi/acris/personal-property/PartiesPersPropApi");
const ReferencesPersPropApi = require("../../../thirdPartyApi/acris/personal-property/ReferencesPersPropApi");
const RemarksPersPropApi = require("../../../thirdPartyApi/acris/personal-property/RemarksPersPropApi");

const router = new express.Router();

router.get("/fetchRecord", async function (req, res, next) {
  try {
    console.log(
      "'queryAcrisUccFedLienNum' received request with query parameters:",
      req.query
    );

    const { masterSearchTerms, legalsSearchTerms } = req.query;

    // Build masterQueryParams from reel_yr, reel_nbr, reel_pg
    const masterQueryParams = {};
    if (masterSearchTerms?.ucc_lien_file_number)
      masterQueryParams.ucc_lien_file_number =
        masterSearchTerms.ucc_lien_file_number;
    console.log("masterQueryParams:", masterQueryParams);

    // Validate required master params
    if (!masterQueryParams.ucc_lien_file_number) {
      return res.status(400).json({
        error: "ucc_lien_file_number is required in masterSearchTerms.",
      });
    }

    // Build legalsQueryParams from borough
    const legalsQueryParams = {};
    if (legalsSearchTerms?.borough)
      legalsQueryParams.borough = legalsSearchTerms.borough;
    console.log("legalsQueryParams:", legalsQueryParams);

    // Validate required legals param
    if (!legalsQueryParams.borough) {
      return res
        .status(400)
        .json({ error: "borough is required in legalsSearchTerms." });
    }

    let crossReferencedDocumentIds = [];
    try {
      // Step 1: Fetch master document IDs
      const masterRecordsDocumentIds =
        await MasterPersPropApi.fetchAcrisDocumentIds(masterQueryParams);
      console.log("masterRecordsDocumentIds:", masterRecordsDocumentIds);

      // Step 2: Cross-reference with Legals
      let legalsRecordsDocumentIds = [];
      if (masterRecordsDocumentIds && masterRecordsDocumentIds.length > 0) {
        legalsRecordsDocumentIds =
          await LegalsPersPropApi.fetchAcrisDocumentIdsCrossRef(
            legalsQueryParams,
            masterRecordsDocumentIds
          );
      } else {
        console.log("No master records found, skipping legals cross-reference");
      }
      crossReferencedDocumentIds = legalsRecordsDocumentIds;
      console.log("crossReferencedDocumentIds:", crossReferencedDocumentIds);
    } catch (err) {
      console.error("Error fetching ACRIS dataset:", err.message);
      return res.status(500).json({
        dataFound: false,
        datasets: "Real Property: Master, Legals",
        error: err.message,
      });
    }

    // Fetch full records from all datasets in parallel using crossReferencedDocumentIds
    try {
      console.log(
        "Fetching full records for document IDs:",
        crossReferencedDocumentIds
      );
      const [
        masterRecords,
        partiesRecords,
        legalsRecords,
        referencesRecords,
        remarksRecords,
      ] = await Promise.all([
        MasterPersPropApi.fetchAcrisRecordsByDocumentIds(
          crossReferencedDocumentIds
        ),
        PartiesPersPropApi.fetchAcrisRecordsByDocumentIds(
          crossReferencedDocumentIds
        ),
        LegalsPersPropApi.fetchAcrisRecordsByDocumentIds(
          crossReferencedDocumentIds
        ),
        ReferencesPersPropApi.fetchAcrisRecordsByDocumentIds(
          crossReferencedDocumentIds
        ),
        RemarksPersPropApi.fetchAcrisRecordsByDocumentIds(
          crossReferencedDocumentIds
        ),
      ]);

      // Build results array
      const results = crossReferencedDocumentIds.map((document_id) => ({
        document_id,
        masterRecords: (masterRecords || []).filter(
          (r) => r.document_id === document_id
        ),
        partiesRecords: (partiesRecords || []).filter(
          (r) => r.document_id === document_id
        ),
        legalsRecords: (legalsRecords || []).filter(
          (r) => r.document_id === document_id
        ),
        referencesRecords: (referencesRecords || []).filter(
          (r) => r.document_id === document_id
        ),
        remarksRecords: (remarksRecords || []).filter(
          (r) => r.document_id === document_id
        ),
      }));

      console.log("Final results:", results);

      return res.json(results);
    } catch (err) {
      console.error("Error fetching full records from datasets:", err.message);
      return res.status(500).json({
        dataFound: false,
        error: "Failed to fetch full records from all datasets",
        details: err.message,
      });
    }
  } catch (err) {
    console.error("Error in queryAcrisUccFedLienNum route:", err.message);
    return next(err);
  }
});

module.exports = router;
