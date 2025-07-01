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
    const { masterSearchTerms, legalsSearchTerms } = req.query;

    // Build masterQueryParams from reel_yr, reel_nbr, reel_pg
    const masterQueryParams = {};
    if (masterSearchTerms?.ucc_lien_file_number)
      masterQueryParams.ucc_lien_file_number =
        masterSearchTerms.ucc_lien_file_number;

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

      // Step 2: Cross-reference with Legals
      let legalsRecordsDocumentIds = [];
      if (masterRecordsDocumentIds && masterRecordsDocumentIds.length > 0) {
        legalsRecordsDocumentIds =
          await LegalsPersPropApi.fetchAcrisDocumentIdsCrossRef(
            legalsQueryParams,
            masterRecordsDocumentIds
          );
      } else {
      }
      crossReferencedDocumentIds = legalsRecordsDocumentIds;
    } catch (err) {
      return res.status(500).json({
        dataFound: false,
        datasets: "Real Property: Master, Legals",
        error: err.message,
      });
    }

    // Fetch full records from all datasets in parallel using crossReferencedDocumentIds
    try {
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

      return res.json(results);
    } catch (err) {
      return res.status(500).json({
        dataFound: false,
        error: "Failed to fetch full records from all datasets",
        details: err.message,
      });
    }
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
