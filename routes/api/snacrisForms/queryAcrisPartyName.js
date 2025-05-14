"use strict";

/** Routes for ACRIS Real Property Legals API calls. */

const express = require("express");
const MasterRealPropApi = require("../../../thirdPartyApi/acris/real-property/MasterRealPropApi");
const LegalsRealPropApi = require("../../../thirdPartyApi/acris/real-property/LegalsRealPropApi");
const PartiesRealPropApi = require("../../../thirdPartyApi/acris/real-property/PartiesRealPropApi");
const DocTypesCodeMapModel = require("../../../models/acris/code-maps/DocTypesCodeMapModel");
const { transformForUrl } = require("../../../thirdPartyApi/utils");

const router = new express.Router();

router.get("/fetchRecord", async function (req, res, next) {
    try {
        console.log("Received request with query parameters:", req.query);

        const { masterSearchTerms, partySearchTerms, legalsSearchTerms } = req.query;
        //console.log(masterSearchTerms, partySearchTerms, legalsSearchTerms)
        const masterQueryParams = {};
        if (masterSearchTerms?.document_date_range)
            masterQueryParams.document_date_range = masterSearchTerms.document_date_range;
        if (masterSearchTerms?.document_date_start)
            masterQueryParams.document_date_start = masterSearchTerms.document_date_start;
        if (masterSearchTerms?.document_date_end)
            masterQueryParams.document_date_end = masterSearchTerms.document_date_end;



        // Handle `doc_type` and `doc_class` logic
        if (masterSearchTerms?.doc_type === "doc-type-default" && masterSearchTerms?.doc_class) {
            if (masterSearchTerms.doc_class !== "all-class-default") {
                try {
                    //console.log(`Fetching doc_type values for class: ${masterSearchTerms.doc_class}`);
                    const docTypes = await DocTypesCodeMapModel.getDocTypesByClass(masterSearchTerms.doc_class);
                    masterQueryParams.doc_type = docTypes; // Pass the array of `doc_type` values
                    //console.log(`Fetched doc_type values: ${docTypes}`);
                } catch (err) {
                    //console.error(`Error fetching doc_type values for class: ${masterSearchTerms.doc_class}`, err.message);
                    return res.status(400).json({ error: `Invalid doc_class: ${masterSearchTerms.doc_class}` });
                }
            }
        } else if (masterSearchTerms?.doc_type) {
            masterQueryParams.doc_type = masterSearchTerms.doc_type;
        }

        // Construct query parameters for Parties dataset
        const partiesQueryParams = {};
        if (partySearchTerms?.name)
            partiesQueryParams.name = transformForUrl(partySearchTerms.name);
        if (partySearchTerms?.party_type)
            partiesQueryParams.party_type = partySearchTerms.party_type;

        // Construct query parameters for Legals dataset
        const legalsQueryParams = {};
        if (legalsSearchTerms?.borough)
            legalsQueryParams.borough = legalsSearchTerms.borough;

        // Fetch data from the Master dataset
        try {
            // Step 1: Fetch master records
            const masterRecordsDocumentIds = await MasterRealPropApi.fetchAcrisDocumentIds(masterQueryParams);
            //console.log(`Fetched ${masterRecordsDocumentIds.length} real property master document_id values`);
            console.log(masterRecordsDocumentIds, "masterRecordsDocumentIds");

            // Check for the presence of specific document_id values
            const documentIdsToCheck = ["2025040900070001", "2025021800719001", "2025040900509001"];
            documentIdsToCheck.forEach(id => {
                if (masterRecordsDocumentIds.includes(id)) {
                    console.log(`Document ID ${id} is present in masterRecordsDocumentIds.`);
                } else {
                    console.log(`Document ID ${id} is missing from masterRecordsDocumentIds.`);
                }
            });

            // Initialize these variables with empty arrays as defaults
            let partyRecordsDocumentIds = [];
            let legalsRecordsDocumentIds = [];

            // Step 2: Only fetch party records if we have master records
            if (masterRecordsDocumentIds && masterRecordsDocumentIds.length > 0) {
                //partyRecordsDocumentIds = await PartiesRealPropApi.fetchFromAcrisCrossRef(
                partyRecordsDocumentIds = await PartiesRealPropApi.fetchAcrisDocumentIdsCrossRef(
                    partiesQueryParams,
                    masterRecordsDocumentIds
                );
                console.log(`Fetched ${partyRecordsDocumentIds.length} real property party document_id values`, partyRecordsDocumentIds);

                // Step 3: Only fetch legal records if we have party records
                if (partyRecordsDocumentIds && partyRecordsDocumentIds.length > 0) {
                    legalsRecordsDocumentIds = await LegalsRealPropApi.fetchFromAcrisCrossRef(
                        legalsQueryParams,
                        partyRecordsDocumentIds
                    );
                    console.log(`Fetched ${legalsRecordsDocumentIds.length} legal record IDs`);
                } else {
                    console.log("No party records found, skipping legal records fetch");
                }
            } else {
                console.log("No master records found, skipping subsequent fetches");
            }

            // Return all collected data
            return {
                masterRecordsDocumentIds,
                partyRecordsDocumentIds,
                legalsRecordsDocumentIds
            };

        } catch (err) {
            console.error("Error fetching ACRIS dataset:", err.message);
            // Return structured error information
            return {
                dataFound: false,
                dataset: "acrisDataset",
                error: err.message,
                masterRecordsDocumentIds: [],
                partyRecordsDocumentIds: [],
                legalsRecordsDocumentIds: []
            };
        }

        // Return the primary records as the response
        return res.json({ primaryRecords });
    } catch (err) {
        console.error("Error in queryAcrisPartyName route:", err.message);
        return next(err);
    }
});

module.exports = router;