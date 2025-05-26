"use strict";

const express = require("express");
const MasterRealPropApi = require("../../../thirdPartyApi/acris/real-property/MasterRealPropApi");
const LegalsRealPropApi = require("../../../thirdPartyApi/acris/real-property/LegalsRealPropApi");
const PartiesRealPropApi = require("../../../thirdPartyApi/acris/real-property/PartiesRealPropApi");
const RemarksRealPropApi = require("../../../thirdPartyApi/acris/real-property/RemarksRealPropApi");
const ReferencesRealPropApi = require("../../../thirdPartyApi/acris/real-property/ReferencesRealPropApi");
const { transformForUrl } = require("../../../thirdPartyApi/utils");

const router = new express.Router();

router.get("/fetchRecord", async function (req, res, next) {
    try {
        console.log("'queryAcrisDocIdCrfn' received request with query parameters:", req.query);

        const { masterSearchTerms } = req.query;
        const masterQueryParams = {};
        let documentIdToQuery = null;

        if (masterSearchTerms?.document_id) {
            masterQueryParams.document_id = masterSearchTerms.document_id;
            documentIdToQuery = masterSearchTerms.document_id;
        } else if (masterSearchTerms?.crfn) {
            masterQueryParams.crfn = masterSearchTerms.crfn;
            // Fetch the master record to get the document_id
            const masterRecords = await MasterRealPropApi.fetchAcrisRecords(masterQueryParams);
            if (!masterRecords.length) {
                return res.status(404).json({ error: "No master record found for the given crfn." });
            }
            documentIdToQuery = masterRecords[0].document_id;
            // Overwrite masterRecords for later use
            masterQueryParams.document_id = documentIdToQuery;
        } else {
            return res.status(400).json({ error: "Must provide either document_id or crfn." });
        }

        // Now fetch all datasets using the document_id
        try {
            const [
                masterResult,
                partiesResult,
                legalsResult,
                referencesResult,
                remarksResult
            ] = await Promise.allSettled([
                MasterRealPropApi.fetchAcrisRecords({ document_id: documentIdToQuery }),
                PartiesRealPropApi.fetchAcrisRecords({ document_id: documentIdToQuery }),
                LegalsRealPropApi.fetchAcrisRecords({ document_id: documentIdToQuery }),
                ReferencesRealPropApi.fetchAcrisRecords({ document_id: documentIdToQuery }),
                RemarksRealPropApi.fetchAcrisRecords({ document_id: documentIdToQuery })
            ]);

            const masterRecords = masterResult.status === "fulfilled" ? masterResult.value : [];
            const partiesRecords = partiesResult.status === "fulfilled" ? partiesResult.value : [];
            const legalsRecords = legalsResult.status === "fulfilled" ? legalsResult.value : [];
            const referencesRecords = referencesResult.status === "fulfilled" ? referencesResult.value : [];
            const remarksRecords = remarksResult.status === "fulfilled" ? remarksResult.value : [];

            const allDocumentIds = new Set([
                ...(masterRecords || []).map(r => r.document_id),
                ...(partiesRecords || []).map(r => r.document_id),
                ...(legalsRecords || []).map(r => r.document_id),
                ...(referencesRecords || []).map(r => r.document_id),
                ...(remarksRecords || []).map(r => r.document_id)
            ]);

            const results = Array.from(allDocumentIds).map(document_id => ({
                document_id,
                masterRecords: (masterRecords || []).filter(r => r.document_id === document_id),
                partiesRecords: (partiesRecords || []).filter(r => r.document_id === document_id),
                legalsRecords: (legalsRecords || []).filter(r => r.document_id === document_id),
                referencesRecords: (referencesRecords || []).filter(r => r.document_id === document_id),
                remarksRecords: (remarksRecords || []).filter(r => r.document_id === document_id)
            }));
            console.log(results.length, "number of results from all datasets");

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
        console.error("Error in queryAcrisDocIdCrfn route:", err.message);
        return next(err);
    }
});

module.exports = router;