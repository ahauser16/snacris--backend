"use strict";

/** Routes for ACRIS Real Property Legals API calls. */

const express = require("express");
const MasterRealPropApi = require("../../../thirdPartyApi/acris/real-property/MasterRealPropApi");
const LegalsRealPropApi = require("../../../thirdPartyApi/acris/real-property/LegalsRealPropApi");
const PartiesRealPropApi = require("../../../thirdPartyApi/acris/real-property/PartiesRealPropApi");
const ReferencesRealPropApi = require("../../../thirdPartyApi/acris/real-property/ReferencesRealPropApi");
const RemarksRealPropApi = require("../../../thirdPartyApi/acris/real-property/RemarksRealPropApi");
const DocTypesCodeMapModel = require("../../../models/acris/code-maps/DocTypesCodeMapModel");

const router = new express.Router();

router.get("/fetchRecord", async function (req, res, next) {
    try {
        console.log("'queryAcrisDocumentType' received request with query parameters:", req.query);

        // Extract search terms and dataset flags from the request query
        const { masterSearchTerms, legalsSearchTerms } = req.query;

        // Construct query parameters for Master dataset
        const masterQueryParams = {};
        if (masterSearchTerms?.recorded_date_range)
            masterQueryParams.recorded_date_range = masterSearchTerms.recorded_date_range;
        if (masterSearchTerms?.recorded_date_start)
            masterQueryParams.recorded_date_start = masterSearchTerms.recorded_date_start;
        if (masterSearchTerms?.recorded_date_end)
            masterQueryParams.recorded_date_end = masterSearchTerms.recorded_date_end;
        if (masterSearchTerms?.doc_type === "doc-type-default" && masterSearchTerms?.doc_class) {
            if (masterSearchTerms.doc_class !== "all-class-default") {
                try {
                    const docTypes = await DocTypesCodeMapModel.getDocTypesByClass(masterSearchTerms.doc_class);
                    masterQueryParams.doc_type = docTypes; // Pass the array of `doc_type` values
                } catch (err) {
                    return res.status(400).json({ error: `Invalid doc_class: ${masterSearchTerms.doc_class}` });
                }
            }
        } else if (masterSearchTerms?.doc_type) {
            masterQueryParams.doc_type = masterSearchTerms.doc_type;
        }

        // Construct query parameters for Legals dataset
        const legalsQueryParams = {};
        if (legalsSearchTerms?.borough)
            legalsQueryParams.borough = legalsSearchTerms.borough;

        let crossReferencedDocumentIds = [];

        try {
            // Step 1: Fetch master records
            const masterRecordsDocumentIds = await MasterRealPropApi.fetchAcrisDocumentIds(masterQueryParams);
            console.log("'masterRecordsDocumentIds' count is: ", masterRecordsDocumentIds.length);

            let legalsRecordsDocumentIds = [];

            // Step 2: Fetch Party records while including results from the Master dataset
            if (masterRecordsDocumentIds && masterRecordsDocumentIds.length > 0) {
                legalsRecordsDocumentIds = await LegalsRealPropApi.fetchAcrisDocumentIdsCrossRef(
                    legalsQueryParams,
                    masterRecordsDocumentIds
                );
                console.log("'legalsRecordsDocumentIds' count is: ", legalsRecordsDocumentIds.length);
            } else {
                console.log("No master records found, skipping subsequent fetches");
            }

            crossReferencedDocumentIds = legalsRecordsDocumentIds;
            console.log("'crossReferencedDocumentIds' count is: ", crossReferencedDocumentIds.length);
            console.log("the first document_id within 'crossReferencedDocumentIds' is: ", crossReferencedDocumentIds[0]);

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

            //console.log(masterRecords, "masterRecords");

            // Build newResults array
            const results = crossReferencedDocumentIds.map(document_id => ({
                document_id,
                masterRecords: (masterRecords || []).filter(r => r.document_id === document_id),
                partiesRecords: (partiesRecords || []).filter(r => r.document_id === document_id),
                legalsRecords: (legalsRecords || []).filter(r => r.document_id === document_id),
                referencesRecords: (referencesRecords || []).filter(r => r.document_id === document_id),
                remarksRecords: (remarksRecords || []).filter(r => r.document_id === document_id)
            }));

            //console.log(results, "queryAcrisDocumentType results");

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
        console.error("Error in queryAcrisPartyName route:", err.message);
        return next(err);
    }
});

module.exports = router;