"use strict";

/** Routes for ACRIS Real Property Master database operations. */

const jsonschema = require("jsonschema");
const express = require("express");
const moment = require("moment-timezone");

const { BadRequestError, NotFoundError } = require("../../../../../expressError");
const { ensureAdmin, ensureLoggedIn } = require("../../../../../middleware/auth");
// const { processIncomingData, validateData } = require("../../../../middleware/masterRealPropDataProcessing");
// const { checkForDuplicateRecord, createRecordForUser } = require("../../../utils/duplicateRecordCheck");

const MasterRealPropModel = require("../../../../../models/acris/real-property/MasterRealPropModel");
const { convertQueryParams } = require("../../../../utils/convertQueryParams");

const masterRealPropNewSchema = require("../../../../../schemas/acris/real-property/master/masterRealPropNew.json");
const masterRealPropSearchSchema = require("../../../../../schemas/acris/real-property/master/masterRealPropSearch.json");
const masterRealPropUpdateSchema = require("../../../../../schemas/acris/real-property/master/masterRealPropUpdate.json");

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
 */

router.post("/saveDataByUser", ensureLoggedIn, async function (req, res, next) {
    try {
        // Log the incoming data before normalization
        console.log("Incoming data:", req.body);

        // Process the incoming data
        const processedData = {
            document_id: req.body.document_id,
            record_type: req.body.record_type,
            crfn: req.body.crfn || null,
            recorded_borough: parseInt(req.body.recorded_borough, 10),
            doc_type: req.body.doc_type,
            document_date: moment.tz(req.body.document_date, 'America/New_York').format(),
            document_amt: parseFloat(req.body.document_amt),
            recorded_datetime: moment.tz(req.body.recorded_datetime, 'America/New_York').format(),
            modified_date: moment.tz(req.body.modified_date, 'America/New_York').format(),
            reel_yr: parseInt(req.body.reel_yr, 10),
            reel_nbr: parseInt(req.body.reel_nbr, 10),
            reel_pg: parseInt(req.body.reel_pg, 10),
            percent_trans: parseFloat(req.body.percent_trans),
            good_through_date: moment.tz(req.body.good_through_date, 'America/New_York').format()
        };

        // Log the processed data before validation
        console.log("processed data:", processedData);

        // Validate the processed data
        const validator = jsonschema.validate(processedData, masterRealPropNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            console.log("Validation errors:", errs);
            throw new BadRequestError(errs);
        }

        // Log the data after validation
        console.log("Data after validation:", processedData);

        // Check for duplicate record
        try {
            const existingRecord = await MasterRealPropModel.findRecordFromUserByDocumentId(res.locals.user.username, processedData.document_id);
            // Log the existing record
            console.log("Existing record:", existingRecord);

            // Normalize the existing record for comparison
            const normalizedExistingRecord = {
                document_id: existingRecord.document_id,
                record_type: existingRecord.record_type,
                crfn: existingRecord.crfn,
                recorded_borough: existingRecord.recorded_borough,
                doc_type: existingRecord.doc_type,
                document_date: moment.tz(existingRecord.document_date, 'America/New_York').format(),
                document_amt: parseFloat(existingRecord.document_amt),
                recorded_datetime: moment.tz(existingRecord.recorded_datetime, 'America/New_York').format(),
                modified_date: moment.tz(existingRecord.modified_date, 'America/New_York').format(),
                reel_yr: parseInt(existingRecord.reel_yr, 10),
                reel_nbr: parseInt(existingRecord.reel_nbr, 10),
                reel_pg: parseInt(existingRecord.reel_pg, 10),
                percent_trans: parseFloat(existingRecord.percent_trans),
                good_through_date: moment.tz(existingRecord.good_through_date, 'America/New_York').format()
            };

            // Log the normalized existing record
            console.log("Normalized existing record:", normalizedExistingRecord);

            // Compare the existing record with the processed data
            if (JSON.stringify(normalizedExistingRecord) === JSON.stringify(processedData)) {
                throw new BadRequestError("Record already exists for user.");
            }
        } catch (err) {
            if (err instanceof NotFoundError) {
                // No existing record found, proceed to save the new record
                const record = await MasterRealPropModel.createRecordForUser(res.locals.user.username, processedData);

                // Log the data after successfully being saved to the database
                console.log("Saved record:", record);

                return res.status(201).json({ record });
            } else {
                throw err;
            }
        }
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