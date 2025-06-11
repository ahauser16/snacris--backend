"use strict";

/** Routes for ACRIS Real Property Legals API calls. */

const express = require("express");
const MasterRealPropApi = require("../../../thirdPartyApi/acris/real-property/MasterRealPropApi");
const LegalsRealPropApi = require("../../../thirdPartyApi/acris/real-property/LegalsRealPropApi");
const PartiesRealPropApi = require("../../../thirdPartyApi/acris/real-property/PartiesRealPropApi");
const ReferencesRealPropApi = require("../../../thirdPartyApi/acris/real-property/ReferencesRealPropApi");
const RemarksRealPropApi = require("../../../thirdPartyApi/acris/real-property/RemarksRealPropApi");
const DocTypesCodeMapModel = require("../../../models/acris/code-maps/DocTypesCodeMapModel");
const { transformForUrl } = require("../../../thirdPartyApi/utils");

const router = new express.Router();

router.get("/fetchRecord", async function (req, res, next) {
    try {
        console.log("Received request with query parameters:", req.query);

        const { masterSearchTerms, partySearchTerms, legalsSearchTerms } = req.query;
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

        const partiesQueryParams = {};
        if (partySearchTerms?.name)
            partiesQueryParams.name = transformForUrl(partySearchTerms.name);
        if (partySearchTerms?.party_type)
            partiesQueryParams.party_type = partySearchTerms.party_type;

        const legalsQueryParams = {};
        if (legalsSearchTerms?.borough)
            legalsQueryParams.borough = legalsSearchTerms.borough;

        let crossReferencedDocumentIds = [];
        // Fetch data from the Master, Parties and Legals datasets
        try {
            // Step 1: Fetch master records
            const masterRecordsDocumentIds = await MasterRealPropApi.fetchAcrisDocumentIds(masterQueryParams);
            console.log(masterRecordsDocumentIds.length, "'masterRecordsDocumentIds' count is: ");

            let partyRecordsDocumentIds = [];
            let legalsRecordsDocumentIds = [];

            // Step 2: Fetch Party records while including results from the Master dataset
            if (masterRecordsDocumentIds && masterRecordsDocumentIds.length > 0) {
                partyRecordsDocumentIds = await PartiesRealPropApi.fetchAcrisDocumentIdsCrossRef(
                    partiesQueryParams,
                    masterRecordsDocumentIds
                );

                // Step 3: Only fetch legal records if we have party records
                if (partyRecordsDocumentIds && partyRecordsDocumentIds.length > 0) {
                    legalsRecordsDocumentIds = await LegalsRealPropApi.fetchAcrisDocumentIdsCrossRef(
                        legalsQueryParams,
                        partyRecordsDocumentIds
                    );
                } else {
                    console.log("No party records found, skipping legal records fetch");
                }
            } else {
                console.log("No master records found, skipping subsequent fetches");
            }

            crossReferencedDocumentIds = legalsRecordsDocumentIds;

        } catch (err) {
            console.error("Error fetching ACRIS dataset:", err.message);
            return res.status(500).json({
                dataFound: false,
                datasets: "Real Property: Master, Parties, Legals",
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

            //console.log(results);

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