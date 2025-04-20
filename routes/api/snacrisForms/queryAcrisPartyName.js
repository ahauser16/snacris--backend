"use strict";

/** Routes for ACRIS Real Property Legals API calls. */

const express = require("express");
const MasterRealPropApi = require("../../../api/acris/real-property/MasterRealPropApi");
const LegalsRealPropApi = require("../../../api/acris/real-property/LegalsRealPropApi");
const PartiesRealPropApi = require("../../../api/acris/real-property/PartiesRealPropApi");
const RemarksRealPropApi = require("../../../api/acris/real-property/RemarksRealPropApi");
const ReferencesRealPropApi = require("../../../api/acris/real-property/ReferencesRealPropApi");
const { transformForUrl } = require("../../../api/utils");

const router = new express.Router();

/**
 * Filters records to include only unique properties based on specific keys.
 *
 * @param {Array} records - The array of record objects.
 * @returns {Array} - An array of unique objects containing only the specified keys.
 */

router.get("/fetchRecord", async function (req, res, next) {
    try {
        console.log("Received request with query parameters:", req.query);

        // Extract searchTerms, primaryApiSources, and secondaryApiSources from the request query.
        const { searchTerms, primaryApiSources, secondaryApiSources } = req.query;

        // Extracting Primary Dataset Flags - `primaryDatasets` contains boolean values indicating the Master Dataset (masterDataset) and Parties Dataset (partiesDataset) should be queried if the boolean values from the Front End are `true`.
        const primaryDatasets = {
            //see queryAcrisPartyName.MD for details on the dataset flags syntax
            masterDataset: primaryApiSources?.masterDataset === "true",
            partiesDataset: primaryApiSources?.partiesDataset === "true",
        };

        // Extracting Secondary Dataset Flags - `secondaryDatasets` that contains boolean values indicating whether the Lot Dataset (`lotDataset`), References Dataset (`referencesDataset`), and Remarks Dataset (`remarksDataset`) should be queried if the boolean values from the Front End are `true`.
        const secondaryDatasets = {
            //see queryAcrisPartyName.MD for details on the dataset flags syntax
            lotDataset: secondaryApiSources?.lotDataset === "true",
            referencesDataset: secondaryApiSources?.referencesDataset === "true",
            remarksDataset: secondaryApiSources?.remarksDataset === "true",
        };

        // Validate and construct query parameters for Master and Parties datasets
        const masterQueryParams = {};
        if (searchTerms?.document_date_range)
            masterQueryParams.document_date_range = searchTerms.document_date_range;
        if (searchTerms?.document_date_start)
            masterQueryParams.document_date_start = searchTerms.document_date_start;
        if (searchTerms?.document_date_end)
            masterQueryParams.document_date_end = searchTerms.document_date_end;
        if (searchTerms?.recorded_borough)
            masterQueryParams.recorded_borough = searchTerms.recorded_borough;

        if (searchTerms?.doc_type)
            masterQueryParams.doc_type = transformForUrl(searchTerms.doc_type);
        //example of data coming in where the user wants to search for a document class:
        //party_type: '1',
        //doc_type: 'doc-type-default',
        //doc_class: 'DEEDS AND OTHER CONVEYANCES'
        //if this happens you need to query the database for all of the `doc_type` values associated with the `doc_class`

        //example of data coming in where the user wants to search for a document type:
        //party_type: '1',
        //doc_type: 'DEED',
        //doc_class: 'DEEDS AND OTHER CONVEYANCES'

        const partiesQueryParams = {};
        if (searchTerms?.name)
            partiesQueryParams.name = transformForUrl(searchTerms.name);
        if (searchTerms?.party_type)
            partiesQueryParams.party_type = searchTerms.party_type;

        // Ensure at least one valid parameter for Master and Parties datasets
        if (Object.keys(masterQueryParams).length === 0) {
            return res.status(400).json({
                error:
                    "At least one query parameter for the Master Dataset is required.",
            });
        }
        if (Object.keys(partiesQueryParams).length === 0) {
            return res.status(400).json({
                error:
                    "At least one query parameter for the Parties Dataset is required.",
            });
        }

        // Ensure at least one dataset is selected
        if (!Object.values(primaryDatasets).some((value) => value)) {
            return res
                .status(400)
                .json({ error: "At least one dataset must be selected." });
        }

        // Initialize arrays to hold records
        let masterRecords = [];
        let partyRecords = [];
        let masterRecordsDocumentIds = [];

        // Fetch data from the Master dataset and save it to `masterRecords` while initializing the `masterRecordsDocumentIds` array that contains extracted `document_id` values from the `masterRecords` array.
        if (primaryDatasets.masterDataset) {
            try {
                console.log(
                    "Fetching Master Dataset with query params:",
                    masterQueryParams
                );
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

        // Fetch data from the Parties dataset
        if (primaryDatasets.partiesDataset) {
            try {
                console.log("Fetching Parties Dataset with query params:", partiesQueryParams);
                partyRecords = await PartiesRealPropApi.fetchFromAcris(partiesQueryParams, masterRecordsDocumentIds);
                console.log("Fetched Parties Records:", partyRecords.length);
            } catch (err) {
                console.error("Error fetching Parties Dataset:", err.message);
                partyRecords.push({
                    dataFound: false,
                    dataset: "partiesDataset",
                    error: err.message,
                });
            }
        }

        // Combine Master and Parties records into primaryRecords
        const primaryRecords = [...masterRecords, ...partyRecords];

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