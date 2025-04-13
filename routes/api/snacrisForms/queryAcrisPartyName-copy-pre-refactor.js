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
            //document_date,
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
        const partiesQueryParams = {};
        if (document_date_range) masterQueryParams.document_date_range = (document_date_range);
        if (document_date_start) masterQueryParams.document_date_start = (document_date_start);
        if (document_date_end) masterQueryParams.document_date_end = (document_date_end);
        
        if (recorded_borough) masterQueryParams.recorded_borough = recorded_borough;
        if (doc_type) masterQueryParams.doc_type = transformForUrl(doc_type);

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
        let partiesRecords = [];
        let lotRecords = [];
        let referenceRecords = [];
        let remarkRecords = [];

        // Helper function to fetch data and handle errors
        // async function fetchDataset(apiMethod, datasetName) {
        //     try {
        //         const datasetRecords = await apiMethod(queryParams);
        //         if (datasetRecords.length === 0) {
        //             console.warn(`No records found for ${datasetName}`);
        //             records.push({ dataFound: false, dataset: datasetName });
        //         } else {
        //             records.push(...datasetRecords);
        //         }
        //     } catch (err) {
        //         console.error(`Error fetching data from ${datasetName}:`, err.message);
        //         records.push({ dataFound: false, dataset: datasetName, error: err.message });
        //     }
        // }

        // Fetch data from the ACRIS API based on the selected datasets
        // if (datasets.masterDataset) {
        //     await fetchDataset(MasterRealPropApi.fetchFromAcris, "masterDataset");
        // }
        // if (datasets.lotDataset) {
        //     await fetchDataset(LegalsRealPropApi.fetchFromAcris, "lotDataset");
        // }
        // if (datasets.partiesDataset) {
        //     await fetchDataset(PartiesRealPropApi.fetchFromAcris, "partiesDataset");
        // }
        // if (datasets.referencesDataset) {
        //     await fetchDataset(ReferencesRealPropApi.fetchFromAcris, "referencesDataset");
        // }
        // if (datasets.remarksDataset) {
        //     await fetchDataset(RemarksRealPropApi.fetchFromAcris, "remarksDataset");
        // }

        //Fetch data from the "Primary Datasets"
        if (primaryDatasets.masterDataset) {
            masterRecords = await MasterRealPropApi.fetchFromAcris(masterQueryParams);
            if (masterRecords.length === 0) {
                console.warn("No records found for masterDataset");
                masterRecords.push({ dataFound: false, dataset: "masterDataset" });
            }
        }
        if (primaryDatasets.partiesDataset) {
            partiesRecords = await PartiesRealPropApi.fetchFromAcris(partiesQueryParams);
            if (partiesRecords.length === 0) {
                console.warn("No records found for partiesDataset");
                partiesRecords.push({ dataFound: false, dataset: "partiesDataset" });
            }
        }
        //Fetch data from the "Secondary Datasets"
        // if (secondaryDatasets.lotDataset) {
        //     lotRecords = await LegalsRealPropApi.fetchFromAcris(masterQueryParams);
        //     if (lotRecords.length === 0) {
        //         console.warn("No records found for lotDataset");
        //         lotRecords.push({ dataFound: false, dataset: "lotDataset" });
        //     }
        // }
        // if (secondaryDatasets.referencesDataset) {
        //     referenceRecords = await ReferencesRealPropApi.fetchFromAcris(masterQueryParams);
        //     if (referenceRecords.length === 0) {
        //         console.warn("No records found for referencesDataset");
        //         referenceRecords.push({ dataFound: false, dataset: "referencesDataset" });
        //     }
        // }
        // if (secondaryDatasets.remarksDataset) {
        //     remarkRecords = await RemarksRealPropApi.fetchFromAcris(masterQueryParams);
        //     if (remarkRecords.length === 0) {
        //         console.warn("No records found for remarksDataset");
        //         remarkRecords.push({ dataFound: false, dataset: "remarksDataset" });
        //     }
        // }


        // Fetch data from the ACRIS API
        console.log("Fetched master records:", masterRecords, "Fetched parties records:", partiesRecords);

        return res.json({ records });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;