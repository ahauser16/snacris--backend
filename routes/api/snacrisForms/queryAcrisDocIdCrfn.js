"use strict";

/** Routes for ACRIS Real Property Legals API calls. */

const express = require("express");
const MasterRealPropApi = require("../../../thirdPartyApi/acris/real-property/MasterRealPropApi");
const LegalsRealPropApi = require("../../../thirdPartyApi/acris/real-property/LegalsRealPropApi");
const PartiesRealPropApi = require("../../../thirdPartyApi/acris/real-property/PartiesRealPropApi");
const RemarksRealPropApi = require("../../../thirdPartyApi/acris/real-property/RemarksRealPropApi");
const ReferencesRealPropApi = require("../../../thirdPartyApi/acris/real-property/ReferencesRealPropApi");
const { transformForUrl } = require("../../../thirdPartyApi/utils");

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
        const { document_id, crfn, masterDataset, lotDataset, partiesDataset, referencesDataset, remarksDataset } = req.query;

        // Convert dataset flags to booleans
        const datasets = {
            masterDataset: masterDataset === "true",
            lotDataset: lotDataset === "true",
            partiesDataset: partiesDataset === "true",
            referencesDataset: referencesDataset === "true",
            remarksDataset: remarksDataset === "true",
        };

        // Validate and construct query parameters
        const queryParams = {};
        if (document_id) queryParams.document_id = transformForUrl(document_id);
        if (crfn) queryParams.crfn = transformForUrl(crfn);

        // Ensure at least one valid parameter is provided
        if (Object.keys(queryParams).length === 0) {
            return res.status(400).json({ error: "At least one query parameter is required." });
        }

        // Ensure at least one dataset is selected
        if (!Object.values(datasets).some((value) => value)) {
            return res.status(400).json({ error: "At least one dataset must be selected." });
        }

        // Initialize an empty array to hold the records
        let records = [];

        // Helper function to fetch data and handle errors
        async function fetchDataset(apiMethod, datasetName) {
            try {
                const datasetRecords = await apiMethod(queryParams);
                if (datasetRecords.length === 0) {
                    console.warn(`No records found for ${datasetName}`);
                    records.push({ dataFound: false, dataset: datasetName });
                } else {
                    records.push(...datasetRecords);
                }
            } catch (err) {
                console.error(`Error fetching data from ${datasetName}:`, err.message);
                records.push({ dataFound: false, dataset: datasetName, error: err.message });
            }
        }

        // Fetch data from the ACRIS API based on the selected datasets
        if (datasets.masterDataset) {
            await fetchDataset(MasterRealPropApi.fetchFromAcris, "masterDataset");
        }
        if (datasets.lotDataset) {
            await fetchDataset(LegalsRealPropApi.fetchFromAcris, "lotDataset");
        }
        if (datasets.partiesDataset) {
            await fetchDataset(PartiesRealPropApi.fetchFromAcris, "partiesDataset");
        }
        if (datasets.referencesDataset) {
            await fetchDataset(ReferencesRealPropApi.fetchFromAcris, "referencesDataset");
        }
        if (datasets.remarksDataset) {
            await fetchDataset(RemarksRealPropApi.fetchFromAcris, "remarksDataset");
        }

        // Fetch data from the ACRIS API
        console.log("Fetched records:", records);

        return res.json({ records });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;