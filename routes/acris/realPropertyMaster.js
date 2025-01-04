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