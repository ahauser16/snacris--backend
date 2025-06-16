"use strict";

const express = require("express");
const MasterRealPropApi = require("../../../thirdPartyApi/acris/real-property/MasterRealPropApi");
const LegalsRealPropApi = require("../../../thirdPartyApi/acris/real-property/LegalsRealPropApi");
const PartiesRealPropApi = require("../../../thirdPartyApi/acris/real-property/PartiesRealPropApi");
const ReferencesRealPropApi = require("../../../thirdPartyApi/acris/real-property/ReferencesRealPropApi");
const RemarksRealPropApi = require("../../../thirdPartyApi/acris/real-property/RemarksRealPropApi");

const router = new express.Router();

router.get("/fetchRecord", async function (req, res, next) {
    try {
        console.log("'queryAcrisReelPage' received request with query parameters:", req.query);

        const { masterSearchTerms, legalsSearchTerms } = req.query;

        // Build masterQueryParams from reel_yr, reel_nbr, reel_pg
        const masterQueryParams = {};
        if (masterSearchTerms?.reel_yr) masterQueryParams.reel_yr = masterSearchTerms.reel_yr;
        if (masterSearchTerms?.reel_nbr) masterQueryParams.reel_nbr = masterSearchTerms.reel_nbr;
        if (masterSearchTerms?.reel_pg) masterQueryParams.reel_pg = masterSearchTerms.reel_pg;

        // Validate required master params
        if (!masterQueryParams.reel_yr || !masterQueryParams.reel_nbr || !masterQueryParams.reel_pg) {
            return res.status(400).json({ error: "reel_yr, reel_nbr, and reel_pg are required in masterSearchTerms." });
        }

        // Build legalsQueryParams from borough
        const legalsQueryParams = {};
        if (legalsSearchTerms?.borough) legalsQueryParams.borough = legalsSearchTerms.borough;

        // Validate required legals param
        if (!legalsQueryParams.borough) {
            return res.status(400).json({ error: "borough is required in legalsSearchTerms." });
        }

        let crossReferencedDocumentIds = [];
        try {
            // Step 1: Fetch master document IDs
            const masterRecordsDocumentIds = await MasterRealPropApi.fetchAcrisDocumentIds(masterQueryParams);

            // Step 2: Cross-reference with Legals
            let legalsRecordsDocumentIds = [];
            if (masterRecordsDocumentIds && masterRecordsDocumentIds.length > 0) {
                legalsRecordsDocumentIds = await LegalsRealPropApi.fetchAcrisDocumentIdsCrossRef(
                    legalsQueryParams,
                    masterRecordsDocumentIds
                );
            } else {
                console.log("No master records found, skipping legals cross-reference");
            }
            crossReferencedDocumentIds = legalsRecordsDocumentIds;

        } catch (err) {
            console.error("Error fetching ACRIS dataset:", err.message);
            return res.status(500).json({
                dataFound: false,
                datasets: "Real Property: Master, Legals",
                error: err.message
            });
        }

        // Fetch full records from all datasets in parallel using crossReferencedDocumentIds
        try {
            const [
                masterRecords,
                partiesRecords,
                legalsRecords,
                referencesRecords,
                remarksRecords
            ] = await Promise.all([
                MasterRealPropApi.fetchAcrisRecordsByDocumentIds(crossReferencedDocumentIds),
                PartiesRealPropApi.fetchAcrisRecordsByDocumentIds(crossReferencedDocumentIds),
                LegalsRealPropApi.fetchAcrisRecordsByDocumentIds(crossReferencedDocumentIds),
                ReferencesRealPropApi.fetchAcrisRecordsByDocumentIds(crossReferencedDocumentIds),
                RemarksRealPropApi.fetchAcrisRecordsByDocumentIds(crossReferencedDocumentIds)
            ]);

            // Build results array
            const results = crossReferencedDocumentIds.map(document_id => ({
                document_id,
                masterRecords: (masterRecords || []).filter(r => r.document_id === document_id),
                partiesRecords: (partiesRecords || []).filter(r => r.document_id === document_id),
                legalsRecords: (legalsRecords || []).filter(r => r.document_id === document_id),
                referencesRecords: (referencesRecords || []).filter(r => r.document_id === document_id),
                remarksRecords: (remarksRecords || []).filter(r => r.document_id === document_id)
            }));

            console.log(results, "queryAcrisReelPage");

            return res.json(results);
        } catch (err) {
            console.error("Error fetching full records from datasets:", err.message);
            return res.status(500).json({
                dataFound: false,
                error: "Failed to fetch full records from all datasets",
                details: err.message
            });
        }
    } catch (err) {
        console.error("Error in queryAcrisReelPage route:", err.message);
        return next(err);
    }
});

module.exports = router;