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

        // Extract query parameters from the request
        const {
            //Master Dataset
            //document_date, --> the three document_date fields below are used to target the `document_date` column name at the Real Property Master API endpoint.
            document_date_range,
            document_date_start,
            document_date_end,
            recorded_borough,
            doc_type,
            //Parties Dataset
            name,
            party_type,
            //Primary & Secondary Dataset 
            masterDataset,
            lotDataset,
            partiesDataset,
            referencesDataset,
            remarksDataset
        } = req.query;

        // const datasets = {
        //     masterDataset: masterDataset === "true",
        //     partiesDataset: partiesDataset === "true",
        //     lotDataset: lotDataset === "true",
        //     referencesDataset: referencesDataset === "true",
        //     remarksDataset: remarksDataset === "true",
        // }

        // Convert Primary & Secondary Dataset flags to booleans
        const primaryDatasets = {
            masterDataset: masterDataset === "true",
            partiesDataset: partiesDataset === "true",
        };
        // Convert Primary & Secondary Dataset flags to booleans
        const secondaryDatasets = {
            lotDataset: lotDataset === "true",
            referencesDataset: referencesDataset === "true",
            remarksDataset: remarksDataset === "true",
        };

        // Validate and construct query parameters
        //const queryParams = {};
        const masterQueryParams = {};
        if (document_date_range) masterQueryParams.document_date_range = (document_date_range);
        if (document_date_start) masterQueryParams.document_date_start = (document_date_start);
        if (document_date_end) masterQueryParams.document_date_end = (document_date_end);

        if (recorded_borough) masterQueryParams.recorded_borough = recorded_borough;
        if (doc_type) masterQueryParams.doc_type = transformForUrl(doc_type);

        const partiesQueryParams = {};
        if (name) partiesQueryParams.name = transformForUrl(name);
        if (party_type) partiesQueryParams.party_type = (party_type);

        // Ensure at least one valid parameter associated with the Real Property Master dataset is provided
        if (Object.keys(masterQueryParams).length === 0) {
            return res.status(400).json({ error: "At least one query parameter for the Master Dataset is required." });
        }
        // Ensure at least one valid parameter associated with the Real Property Parties dataset is provided
        if (Object.keys(partiesQueryParams).length === 0) {
            return res.status(400).json({ error: "At least one query parameter for the Parties Dataset is required." });
        }

        // Ensure at least one dataset is selected
        if (!Object.values(primaryDatasets).some((value) => value)) {
            return res.status(400).json({ error: "At least one dataset must be selected." });
        }

        // Initialize empty arrays to hold the records returned from each dataset
        // let records = [];
        let masterRecords = [];

        //Fetch data from the "Primary Datasets"
        if (primaryDatasets.masterDataset) {
            console.log("masterQueryParams:", masterQueryParams);
            masterRecords = await MasterRealPropApi.fetchFromAcris(masterQueryParams);
            console.log("masterRecords after fetchFromAcris:", masterRecords);
            if (masterRecords.length === 0) {
                console.warn("No records found for masterDataset");
                masterRecords.push({ dataFound: false, dataset: "masterDataset" });
            }
        }

        // Initialize empty arrays to hold the records returned from each dataset
        let partiesRecords = [];
        if (primaryDatasets.partiesDataset) {
            partiesRecords = await PartiesRealPropApi.fetchFromAcris(partiesQueryParams);
            if (partiesRecords.length === 0) {
                console.warn("No records found for partiesDataset");
                partiesRecords.push({ dataFound: false, dataset: "partiesDataset" });
            }
        }

        // `primaryRecords` should only include records from `masterRecords` and `partiesRecords` that contain the same `document_id` value.  If a record in `masterRecords` has a `document_id` that is not present in `partiesRecords`, it should be excluded from `primaryRecords`. Similarly, if a record in `partiesRecords` has a `document_id` that is not present in `masterRecords`, it should be excluded from `primaryRecords`.
        let primaryRecords = [...masterRecords, ...partiesRecords];

        //extract the `document_id` values from the `primaryRecords` results.  This will be used to filter the records from the secondary datasets.
        // `primaryRecordDocumentIds` should be an array of unique `document_id` values from the `primaryRecords` results.
        let primaryRecordDocumentIds = [];

        let lotRecords = [];
        let referenceRecords = [];
        let remarkRecords = [];
        //Fetch data from the "Secondary Datasets"
        if (secondaryDatasets.lotDataset) {
            lotRecords = await LegalsRealPropApi.fetchFromAcris(masterQueryParams);
            if (lotRecords.length === 0) {
                console.warn("No records found for lotDataset");
                lotRecords.push({ dataFound: false, dataset: "lotDataset" });
            }
        }
        if (secondaryDatasets.referencesDataset) {
            referenceRecords = await ReferencesRealPropApi.fetchFromAcris(masterQueryParams);
            if (referenceRecords.length === 0) {
                console.warn("No records found for referencesDataset");
                referenceRecords.push({ dataFound: false, dataset: "referencesDataset" });
            }
        }
        if (secondaryDatasets.remarksDataset) {
            remarkRecords = await RemarksRealPropApi.fetchFromAcris(masterQueryParams);
            if (remarkRecords.length === 0) {
                console.warn("No records found for remarksDataset");
                remarkRecords.push({ dataFound: false, dataset: "remarksDataset" });
            }
        }

        // `secondaryRecords` should only include records from `lotRecords`, `referenceRecords`, and `remarkRecords` that contain the same `document_id` values that were in the `primaryRecordDocumentIds` array.  
        let secondaryRecords = [...lotRecords, ...referenceRecords, ...remarkRecords];

        // records should only include records from `primaryRecords` and `secondaryRecords` that, through previous searching and filtering, contain the same `document_id` values.  The data should be combined in such a way that the final result contains all relevant information from both `primaryRecords` and `secondaryRecords` into a single record object that has a unique `document_id`.
        let records = [...primaryRecords, ...secondaryRecords];


        // Fetch data from the ACRIS API
        console.log("Fetched master records:", masterRecords, "Fetched parties records:", partiesRecords);

        return res.json({ records });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;