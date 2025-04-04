"use strict";

/** Routes for ACRIS Real Property Legals API calls. */

const express = require("express");
const MasterRealPropApi = require("../../../api/acris/real-property/MasterRealPropApi");
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
        // Extract query parameters from the request
        const { document_id, crfn } = req.query;

        // Validate and construct query parameters
        const queryParams = {};
        if (document_id) queryParams.document_id = transformForUrl(document_id);
        if (crfn) queryParams.crfn = transformForUrl(crfn);

        // Ensure at least one valid parameter is provided
        if (Object.keys(queryParams).length === 0) {
            return res.status(400).json({ error: "At least one query parameter is required." });
        }

        // Fetch data from the ACRIS API
        const records = await MasterRealPropApi.fetchFromAcris(queryParams);

        return res.json({ records });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;