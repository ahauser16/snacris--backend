"use strict";

/** Routes for ACRIS Real Property Parcel (Master + Legals) API calls. */

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
        console.log("Received request with query parameters:", req.query);

        const { masterSearchTerms, legalsSearchTerms } = req.query;
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
                    masterQueryParams.doc_type = docTypes;
                } catch (err) {
                    return res.status(400).json({ error: `Invalid doc_class: ${masterSearchTerms.doc_class}` });
                }
            }
        } else if (masterSearchTerms?.doc_type) {
            masterQueryParams.doc_type = masterSearchTerms.doc_type;
        }

        //console.log("doc_type array for doc_class", masterSearchTerms.doc_class, docTypes); //Check if any value contains ', &, or other problematic characters.

        // Legals: borough, block, lot (required), unit (optional)
        const legalsQueryParams = {};
        if (legalsSearchTerms?.borough)
            legalsQueryParams.borough = legalsSearchTerms.borough;
        if (legalsSearchTerms?.block)
            legalsQueryParams.block = legalsSearchTerms.block;
        if (legalsSearchTerms?.lot)
            legalsQueryParams.lot = legalsSearchTerms.lot;
        if (legalsSearchTerms?.unit)
            legalsQueryParams.unit = legalsSearchTerms.unit;

        // Validate required fields for legals
        if (!legalsQueryParams.borough || !legalsQueryParams.block || !legalsQueryParams.lot) {
            return res.status(400).json({ error: "borough, block, and lot are required in legalsSearchTerms." });
        }

        let crossReferencedDocumentIds = [];
        // Fetch data from the Legals and Master datasets
        try {
            // Step 1: Fetch legals document IDs
            const legalsRecordsDocumentIds = await LegalsRealPropApi.fetchAcrisDocumentIds(legalsQueryParams);
            //console.log('queryAcrisParcel executes "LegalsRealPropApi.fetchAcrisDocumentIds" which returns: ', legalsRecordsDocumentIds);

            // Step 2: Fetch master document IDs cross-referenced with legals
            let masterRecordsDocumentIds = [];
            if (legalsRecordsDocumentIds && legalsRecordsDocumentIds.length > 0) {
                masterRecordsDocumentIds = await MasterRealPropApi.fetchAcrisDocumentIdsCrossRef(
                    masterQueryParams,
                    legalsRecordsDocumentIds
                );
                console.log(masterRecordsDocumentIds, "masterRecordsDocumentIds");
            } else {
                console.log("No master records found, skipping master records fetch");
            }
            crossReferencedDocumentIds = masterRecordsDocumentIds;
            console.log(crossReferencedDocumentIds, "crossReferencedDocumentIds");

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

            // Build newResults array
            const results = crossReferencedDocumentIds.map(document_id => ({
                document_id,
                masterRecords: (masterRecords || []).filter(r => r.document_id === document_id),
                partiesRecords: (partiesRecords || []).filter(r => r.document_id === document_id),
                legalsRecords: (legalsRecords || []).filter(r => r.document_id === document_id),
                referencesRecords: (referencesRecords || []).filter(r => r.document_id === document_id),
                remarksRecords: (remarksRecords || []).filter(r => r.document_id === document_id)
            }));

            console.log(results, "queryAcrisParcel");

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
        console.error("Error in queryAcrisParcel route:", err.message);
        return next(err);
    }
});

module.exports = router;