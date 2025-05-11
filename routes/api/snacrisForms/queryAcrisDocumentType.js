"use strict";

/** Routes for ACRIS Real Property Legals API calls. */

const express = require("express");
const MasterRealPropApi = require("../../../thirdPartyApi/acris/real-property/MasterRealPropApi");
const LegalsRealPropApi = require("../../../thirdPartyApi/acris/real-property/LegalsRealPropApi");
const DocTypesCodeMapModel = require("../../../models/acris/code-maps/DocTypesCodeMapModel");

const router = new express.Router();

router.get("/fetchRecord", async function (req, res, next) {
    try {
        console.log("Received request with query parameters:", req.query);

        // Extract search terms and dataset flags from the request query
        const { masterSearchTerms, legalsSearchTerms} = req.query;

        // Construct query parameters for Master dataset
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
                    console.log(`Fetching doc_type values for class: ${masterSearchTerms.doc_class}`);
                    const docTypes = await DocTypesCodeMapModel.getDocTypesByClass(masterSearchTerms.doc_class);
                    masterQueryParams.doc_type = docTypes; // Pass the array of `doc_type` values
                    console.log(`Fetched doc_type values: ${docTypes}`);
                } catch (err) {
                    console.error(`Error fetching doc_type values for class: ${masterSearchTerms.doc_class}`, err.message);
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

        // Initialize arrays to hold records
        let masterRecords = [];
        let legalsRecords = [];

        // Fetch data from the Master dataset
        if (primaryDatasets.masterDataset) {
            try {
                console.log("Fetching Master Dataset with query params:", masterQueryParams);
                masterRecords = await MasterRealPropApi.fetchFromAcris(masterQueryParams);
                console.log("Fetched Master Records:", masterRecords.length);

                // Extract document_id values from masterRecords
                masterRecordsDocumentIds = masterRecords.map(record => record.document_id);
                console.log("Master Records Document IDs:", masterRecordsDocumentIds);
            } catch (err) {
                console.error("Error fetching Master Dataset:", err.message);
                masterRecords.push({
                    dataFound: false,
                    dataset: "masterDataset",
                    error: err.message,
                });
            }
        }

        // Fetch data from the Legals dataset
        if (primaryDatasets.legalsDataset) {
            try {
                console.log("Fetching Legals Dataset with query params:", legalsQueryParams);
                legalsRecords = await LegalsRealPropApi.fetchFromAcris(legalsQueryParams);
                console.log("Fetched Legals Records:", legalsRecords.length);
            } catch (err) {
                console.error("Error fetching Legals Dataset:", err.message);
                legalsRecords.push({
                    dataFound: false,
                    dataset: "legalsDataset",
                    error: err.message,
                });
            }
        }

        // Combine Master, Parties, and Legals records into primaryRecords
        const primaryRecords = [...masterRecords, ...legalsRecords];

        // Extract unique document IDs from primaryRecords
        const primaryRecordDocumentIds = [
            ...new Set(primaryRecords.map((record) => record.document_id)),
        ];

        // Log the results
        console.log("Primary Records:", primaryRecords.length);
        console.log("Primary Record Document IDs:", primaryRecordDocumentIds.length);

        // Return the primary records as the response
        return res.json({ primaryRecords });
    } catch (err) {
        console.error("Error in queryAcrisPartyName route:", err.message);
        return next(err);
    }
});

module.exports = router;