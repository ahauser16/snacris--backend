const moment = require("moment-timezone");
const jsonschema = require("jsonschema");
const { BadRequestError } = require("../expressError");
const masterRealPropNewSchema = require("../../schemas/acris/real-property/master/masterRealPropNew.json");

function processIncomingData(req, res, next) {
    try {
        req.processedData = {
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
        next();
    } catch (err) {
        return next(err);
    }
}

function validateData(req, res, next) {
    const validator = jsonschema.validate(req.processedData, masterRealPropNewSchema);
    if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        console.log("Validation errors:", errs);
        return next(new BadRequestError(errs));
    }
    next();
}

function normalizeRecord(record) {
    return {
        document_id: record.document_id,
        record_type: record.record_type,
        crfn: record.crfn,
        recorded_borough: record.recorded_borough,
        doc_type: record.doc_type,
        document_date: moment.tz(record.document_date, 'America/New_York').format(),
        document_amt: parseFloat(record.document_amt),
        recorded_datetime: moment.tz(record.recorded_datetime, 'America/New_York').format(),
        modified_date: moment.tz(record.modified_date, 'America/New_York').format(),
        reel_yr: parseInt(record.reel_yr, 10),
        reel_nbr: parseInt(record.reel_nbr, 10),
        reel_pg: parseInt(record.reel_pg, 10),
        percent_trans: parseFloat(record.percent_trans),
        good_through_date: moment.tz(record.good_through_date, 'America/New_York').format()
    };
}

module.exports = {
    processIncomingData,
    validateData,
    normalizeRecord
};