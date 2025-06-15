"use strict";

const express = require("express");
const MasterRealPropApi = require("../../../thirdPartyApi/acris/real-property/MasterRealPropApi");
const LegalsRealPropApi = require("../../../thirdPartyApi/acris/real-property/LegalsRealPropApi");
const PartiesRealPropApi = require("../../../thirdPartyApi/acris/real-property/PartiesRealPropApi");
const RemarksRealPropApi = require("../../../thirdPartyApi/acris/real-property/RemarksRealPropApi");
const ReferencesRealPropApi = require("../../../thirdPartyApi/acris/real-property/ReferencesRealPropApi");

const router = new express.Router();

router.get("/fetchRecord", async function (req, res, next) {
    try {
        console.log("'queryAcristransaction_number' received request with query parameters:", req.query);

        const { masterSearchTerms } = req.query;
        const masterQueryParams = {};
        let transactionNumberToQuery = null;

        if (masterSearchTerms?.transaction_number) {
            masterQueryParams.transaction_number = masterSearchTerms.transaction_number;
            transactionNumberToQuery = masterSearchTerms.transaction_number;
        } else {
            return res.status(400).json({ error: "Must provide a transaction number." });
        }

        try {
            const [
                masterResult,
                partiesResult,
                legalsResult,
                referencesResult,
                remarksResult
            ] = await Promise.allSettled([
                MasterRealPropApi.fetchAcrisRecords(masterQueryParams),
                PartiesRealPropApi.fetchAcrisRecords(masterQueryParams),
                LegalsRealPropApi.fetchAcrisRecords(masterQueryParams),
                ReferencesRealPropApi.fetchAcrisRecords(masterQueryParams),
                RemarksRealPropApi.fetchAcrisRecords(masterQueryParams)
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
        console.error("Error in queryAcristransaction_number route:", err.message);
        return next(err);
    }
});

module.exports = router;