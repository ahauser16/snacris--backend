"use strict";

/** Routes for ACRIS Real Property Master. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../../expressError");
const { ensureAdmin } = require("../../middleware/auth");
const RealPropertyMaster = require("../../models/acris/realPropertyMaster");

const realPropertyMasterNewSchema = require("../../schemas/acris/realPropertyMaster/realPropertyMasterNew.json");
const realPropertyMasterSearchSchema = require("../../schemas/acris/realPropertyMaster/realPropertyMasterSearch.json");
const realPropertyMasterUpdateSchema = require("../../schemas/acris/realPropertyMaster/realPropertyMasterUpdate.json");

const router = new express.Router();

/** POST / { record } =>  { record }
 *
 * record should be { document_id, record_type, crfn, recorded_borough, doc_type, document_date, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date }
 *
 * Returns { document_id, record_type, crfn, recorded_borough, doc_type, document_date, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date }
 *
 * Authorization required: admin
 * 
 * Technical Explanation: 
 * This route allows an admin user to add a new record to the acris_real_property_master table.  It validates the request body against realPropertyMasterNewSchema.  If validation passes, it saves the record to the database and returns the saved record.
 * 
 * Use Case: This route can be used by an admin to manually add a new record to the acris_real_property_master table. This might be useful for data correction or adding missing records.
 */

router.post("/", ensureAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, realPropertyMasterNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const record = await RealPropertyMaster.saveToDb(req.body);
        return res.status(201).json({ record });
    } catch (err) {
        return next(err);
    }
});


/** GET /api => { records: [...] }
 *
 * Fetch data from the 3rd party API.
 *
 * Returns [{ document_id, record_type, crfn, recorded_borough, doc_type, document_date, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date }, ...]
 *
 * Authorization required: none
 * 
 * Technical Explanation: This route fetches data from the ACRIS-Real Property Master API based on the query parameters provided.  It constructs the URL using URLSearchParams and makes a GET request to the API.  It returns the fetched records.
 * 
 * Use Case: This route is used to fetch data from the the ACRIS-Real Property Master API based on user-provided query parameters. The server can then cross-reference this data with other datasets.
 **/

router.get("/api", async function (req, res, next) {
    try {
        const query = req.query;
        const records = await RealPropertyMaster.fetchFromApi(query);
        return res.json({ records });
    } catch (err) {
        return next(err);
    }
});

/** GET /  =>
 *   { records: [ { document_id, record_type, crfn, recorded_borough, doc_type, document_date, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date }, ...] }
 *
 * Can filter on provided search filters.
 *
 * Authorization required: none
 * 
 * Technical Explanation: This route retrieves all records from the acris_real_property_master table in the snacris database that match the provided query parameters.  It validates the query parameters against realPropertyMasterSearchSchema.  If validation passes, it fetches the records from the database and returns them.
 * 
 * Use Case: This route can be used to retrieve records from the acris_real_property_master table based on user-provided search criteria.
 * 
 * ToDo: Since this route retrieves records from the database I need to consider the following 2 scenarios. There are records in the database that are saved by, and associated with, the user and there are records in the database that are accessible by all users.
 */

router.get("/", async function (req, res, next) {
    const q = req.query;

    try {
        const validator = jsonschema.validate(q, realPropertyMasterSearchSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const records = await RealPropertyMaster.findAll(q);
        return res.json({ records });
    } catch (err) {
        return next(err);
    }
});

/** GET /[document_id]  =>  { record }
 *
 *  Record is { document_id, record_type, crfn, recorded_borough, doc_type, document_date, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date }
 *
 * Authorization required: none
 * 
 * Technical Explanation:
 * This route retrieves a single record from the acris_real_property_master table in my sncaris database based on the provided document_id.  It fetches the record from the database and returns it.
 * Use Case:
 * This route can be used to view the details of a specific record based on its document_id.
 */

router.get("/:document_id", async function (req, res, next) {
    try {
        const record = await RealPropertyMaster.get(req.params.document_id);
        return res.json({ record });
    } catch (err) {
        return next(err);
    }
});

/** PATCH /[document_id] { fld1, fld2, ... } => { record }
 *
 * Patches record data.
 *
 * fields can be: { record_type, crfn, recorded_borough, doc_type, document_date, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date }
 *
 * Returns { document_id, record_type, crfn, recorded_borough, doc_type, document_date, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date }
 *
 * Authorization required: admin
 * 
 * Technical Explanation:
 * This route allows an admin user to update a record in the acris_real_property_master table based on the provided document_id.  It validates the request body against realPropertyMasterUpdateSchema.  If validation passes, it updates the record in the database and returns the updated record.
 * Use Case:
 * This route can be used by an admin to update an existing record. This might be useful for correcting data or updating records based on new information.
 * 
 */

router.patch("/:document_id", ensureAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, realPropertyMasterUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const record = await RealPropertyMaster.update(req.params.document_id, req.body);
        return res.json({ record });
    } catch (err) {
        return next(err);
    }
});

/** DELETE /[document_id]  =>  { deleted: document_id }
 *
 * Authorization: admin
 * 
 * Technical Explanation:
 * This route allows an admin user to delete a record from the acris_real_property_master table based on the provided document_id.  It deletes the record from the database and returns the document_id of the deleted record.
 * Use Case:
 * This route can be used by an admin to delete a record. This might be useful for removing incorrect or duplicate records.
 * 
 * ToDo: In addition to this route there should be a route that allows the user to delete records that they have saved to the database which should be protected so that only the user who saved the record can delete it.
 */

router.delete("/:document_id", ensureAdmin, async function (req, res, next) {
    try {
        await RealPropertyMaster.remove(req.params.document_id);
        return res.json({ deleted: req.params.document_id });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;