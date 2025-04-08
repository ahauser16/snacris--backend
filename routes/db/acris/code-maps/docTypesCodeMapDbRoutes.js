"use strict";

/** Routes for ACRIS Real Property Master database operations. */

const express = require("express");
const { NotFoundError } = require("../../../../expressError");
const DocTypesCodeMapModel = require("../../../../models/acris/code-maps/DocTypesCodeMapModel");
const router = new express.Router();

router.get("/getDocTypeCodeMap", async function (req, res, next) {
    try {
        // Fetch all document control codes
        const docControlCodes = await DocTypesCodeMapModel.findAllRecords();

        if (!docControlCodes || docControlCodes.length === 0) {
            throw new NotFoundError("No document type codes found.");
        }

        // Organize the data into four arrays based on class_code_description
        const organizedDocControlCodes = {
            deedsAndOtherConveyances: [],
            mortgagesAndInstruments: [],
            uccAndFederalLiens: [],
            otherDocuments: [],
        };

        for (const code of docControlCodes) {
            switch (code.class_code_description) {
                case "DEEDS AND OTHER CONVEYANCES":
                    organizedDocControlCodes.deedsAndOtherConveyances.push(code);
                    break;
                case "MORTGAGES & INSTRUMENTS":
                    organizedDocControlCodes.mortgagesAndInstruments.push(code);
                    break;
                case "UCC AND FEDERAL LIENS":
                    organizedDocControlCodes.uccAndFederalLiens.push(code);
                    break;
                case "OTHER DOCUMENTS":
                    organizedDocControlCodes.otherDocuments.push(code);
                    break;
                default:
                    break;
            }
        }

        return res.json({ docControlCodes: organizedDocControlCodes });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;