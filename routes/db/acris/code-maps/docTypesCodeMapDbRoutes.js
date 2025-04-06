"use strict";

/** Routes for ACRIS Real Property Master database operations. */

const jsonschema = require("jsonschema");
const express = require("express");
const { BadRequestError, NotFoundError } = require("../../../../expressError");
const DocTypesCodeMapModel = require("../../../../models/acris/code-maps/DocTypesCodeMapModel");
const docTypeSearch = require("../../../../schemas/acris/code-maps/doc-types/docTypeSearch.json");
const router = new express.Router();

router.get("/getDocTypeCodeMap", async function (req, res, next) {
    try {
        const query = req.query;

        const docControlCodes = await DocTypesCodeMapModel.findAllRecords(query);

        if (!docControlCodes || docControlCodes.length === 0) {
            throw new NotFoundError("No document type codes found.");
        }

        return res.json({ docControlCodes });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;