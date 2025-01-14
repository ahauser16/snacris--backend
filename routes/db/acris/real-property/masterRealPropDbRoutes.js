"use strict";

/** Routes for ACRIS Real Property Master database operations. */

const jsonschema = require("jsonschema");
const express = require("express");
// const moment = require('moment-timezone');

const { BadRequestError, NotFoundError } = require("../../../../expressError");
const { ensureAdmin, ensureLoggedIn } = require("../../../../middleware/auth");
const { processIncomingData, validateData } = require("../../../../middleware/masterRealPropDataProcessing");
const { checkForDuplicateRecord, createRecordForUser } = require("../../../utils/duplicateRecordCheck");


const MasterRealPropModel = require("../../../../models/acris/real-property/MasterRealPropModel");
const { convertQueryParams } = require("../../../utils/convertQueryParams");

// const masterRealPropNewSchema = require("../../../../schemas/acris/real-property/master/masterRealPropNew.json");
// const masterRealPropSearchSchema = require("../../../../schemas/acris/real-property/master/masterRealPropSearch.json");
// const masterRealPropUpdateSchema = require("../../../../schemas/acris/real-property/master/masterRealPropUpdate.json");

const router = new express.Router();

/** POST /addRecordByAdmin { record } =>  { record }
 *
 * record should be { document_id, record_type, crfn, recorded_borough, doc_type, document_date, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date }
 *
 * Returns { document_id, record_type, crfn, recorded_borough, doc_type, document_date, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date }
 *
 * Authorization required: admin
 * 
 * Technical Explanation: 
 * This route allows an admin user to add a new record to the acris_real_property_master table.  It validates the request body against masterRealPropNewSchema.  If validation passes, it saves the record to the database and returns the saved record.
 * 
 * Use Case: This route can be used by an admin to manually add a new record to the acris_real_property_master table. This might be useful for data correction or adding missing records.
 */

router.post("/addRecordByAdmin", ensureAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, masterRealPropNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const record = await MasterRealPropModel.saveRecord(req.body);
        return res.status(201).json({ record });
    } catch (err) {
        return next(err);
    }
});

/** POST /saveDataByUser { record } =>  { record }
 *
 * record should be { document_id, record_type, crfn, recorded_borough, doc_type, document_date, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date }
 *
 * Returns { id, username, document_id, saved_at }
 *
 * Authorization required: logged-in user
 * 
 * Technical Explanation: 
 * This route allows a user to add a new record to the acris_real_property_master table and associate it with their account. It validates the request body against masterRealPropNewSchema. If validation passes, it saves the record to the database and associates it with the user.
 * 
 * Use Case: This route can be used by a user to manually add a new record to the acris_real_property_master table and associate it with their account.
 * 
 * Middleware Functions:
 *
 * processIncomingData: Processes the incoming data and attaches it to req.processedData.
 * validateData: Validates the processed data and proceeds if valid.
 * normalizeRecord: Normalizes the existing record for comparison.
 * 
 * Utility Functions:
 * checkForDuplicateRecord: Checks for duplicate records and throws an error if a duplicate is found.
 * createRecordForUser: Creates a new record for the user.

 * Route Handler:
 * The route handler uses the middleware functions to process and validate the data before checking for duplicates and saving the record.
 */

router.post("/saveDataByUser", ensureLoggedIn, processIncomingData, validateData, async function (req, res, next) {
    try {
        const processedData = req.processedData;
        const username = res.locals.user.username;
        await checkForDuplicateRecord(username, processedData);
        const record = await createRecordForUser(username, processedData);
        return res.status(201).json({ record });
    } catch (err) {
        return next(err);
    }
});

/** GET /fetchAllRecordsByUser => { records: [...] }
 *
 * Fetch all records saved by the logged-in user.
 *
 * Returns [{ document_id, record_type, crfn, recorded_borough, doc_type, document_date, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date }, ...]
 *
 * Authorization required: logged-in user
 * 
 * Technical Explanation: This route retrieves all records saved by the logged-in user from the acris_real_property_master table. It fetches the records from the database and returns them.
 * 
 * Use Case: This route can be used by a user to view all the property records they have saved.
 */

router.get("/fetchAllRecordsByUser", ensureLoggedIn, async function (req, res, next) {
    try {
        const records = await MasterRealPropModel.findAllRecordsByUser(res.locals.user.username);
        return res.json({ records });
    } catch (err) {
        return next(err);
    }
});

/** GET /findAllRecordsByAdmin => { records: [...] }
 *
 * Fetch all records in the database.
 *
 * Returns [{ document_id, record_type, crfn, recorded_borough, doc_type, document_date, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date }, ...]
 *
 * Authorization required: admin
 * 
 * Technical Explanation: This route retrieves all records from the acris_real_property_master table in the database. It fetches the records from the database and returns them.
 * 
 * Use Case: This route can be used by an admin to view all the property records in the database.
 */

router.get("/fetchAllRecordsByAdmin", ensureAdmin, async function (req, res, next) {
    try {
        const username = req.query.username || null;
        const records = await MasterRealPropModel.findAllRecords(username);
        return res.json({ records });
    } catch (err) {
        return next(err);
    }
});

/** GET /fetchRecord/:document_id => { record }
 *
 * Fetch a single record saved by the logged-in user based on document_id.
 *
 * Returns { document_id, record_type, crfn, recorded_borough, doc_type, document_date, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date }
 *
 * Authorization required: logged-in user
 * 
 * Technical Explanation: This route retrieves a single record saved by the logged-in user from the acris_real_property_master table based on the provided document_id. It fetches the record from the database and returns it.
 * 
 * Use Case: This route can be used by a user to view the details of a specific record they have saved based on its document_id.
 */

router.get("/fetchRecordFromUserByDocumentId/:document_id", ensureLoggedIn, async function (req, res, next) {
    try {
        const record = await MasterRealPropModel.findRecordFromUserByDocumentId(res.locals.user.username, req.params.document_id);
        return res.json({ record });
    } catch (err) {
        return next(err);
    }
});

/** GET /fetchRecordWithDocIdByAdmin/:document_id => { record }
 *
 * Fetch a single record from the database based on document_id.
 *
 * Returns { document_id, record_type, crfn, recorded_borough, doc_type, document_date, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date }
 *
 * Authorization required: admin
 * 
 * Technical Explanation: This route retrieves a single record from the acris_real_property_master table in the database based on the provided document_id. It fetches the record from the database and returns it.
 * 
 * Use Case: This route can be used by an admin to view the details of a specific record based on its document_id.
 */

router.get("/fetchRecordByAdmin/:document_id", ensureAdmin, async function (req, res, next) {
    try {
        const record = await MasterRealPropModel.findRecordById(req.params.document_id);
        return res.json({ record });
    } catch (err) {
        return next(err);
    }
});

/** GET /searchSavedUserRecords => { records: [...] }
 *
 * Search records saved by the logged-in user based on search criteria.
 *
 * Returns [{ document_id, record_type, crfn, recorded_borough, doc_type, document_date, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date }, ...]
 *
 * Authorization required: logged-in user
 * 
 * Technical Explanation: This route allows a logged-in user to search for records they have saved based on various search criteria. It fetches the matching records from the database and returns them.
 * 
 * Use Case: This route can be used by a user to search for specific property records they have saved based on search criteria.
 */

router.get("/searchSavedUserRecords", ensureLoggedIn, async function (req, res, next) {
    const q = req.query;

    // Convert query parameters to their expected types
    const convertedQuery = convertQueryParams(q, masterRealPropSearchSchema);

    try {
        const validator = jsonschema.validate(convertedQuery, masterRealPropSearchSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const records = await MasterRealPropModel.searchRecordsFromUserBySearchCriteria(res.locals.user.username, convertedQuery);
        return res.json({ records });
    } catch (err) {
        return next(err);
    }
});

/** PATCH /updateRecordByAdmin/:document_id { fld1, fld2, ... } => { record }
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

router.patch("/updateRecordByAdmin/:document_id", ensureAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, realPropertyMasterUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const record = await MasterRealPropModel.update(req.params.document_id, req.body);
        return res.json({ record });
    } catch (err) {
        return next(err);
    }
});

/** DELETE /deleteRecordByUser/:document_id  =>  { deleted: document_id }
 *
 * Authorization: logged-in user
 * 
 * Technical Explanation:
 * This route allows a logged-in user to delete a record they have saved to the acris_real_property_master table based on the provided document_id. It deletes the record from the database and returns the document_id of the deleted record.
 * Use Case:
 * This route can be used by a user to delete a record they have saved. This might be useful for removing records that are no longer needed.
 */

router.delete("/deleteRecordByUser/:document_id", ensureLoggedIn, async function (req, res, next) {
    try {
        await MasterRealPropModel.deleteRecordByUser(res.locals.user.username, req.params.document_id);
        return res.json({ deleted: req.params.document_id });
    } catch (err) {
        return next(err);
    }
});

/** DELETE /deleteRecordByAdmin/:document_id  =>  { deleted: document_id }
 *
 * Authorization: admin
 * 
 * Technical Explanation:
 * This route allows an admin user to delete a record from the acris_real_property_master table based on the provided document_id. It deletes the record from the database and returns the document_id of the deleted record.
 * Use Case:
 * This route can be used by an admin to delete a record. This might be useful for removing incorrect or duplicate records.
 */

router.delete("/deleteRecordByAdmin/:document_id", ensureAdmin, async function (req, res, next) {
    try {
        await MasterRealPropModel.deleteRecord(req.params.document_id);
        return res.json({ deleted: req.params.document_id });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;