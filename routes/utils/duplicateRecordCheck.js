const { BadRequestError, NotFoundError } = require("../../expressError");
const MasterRealPropModel = require("../../models/acris/real-property/MasterRealPropModel");
const { normalizeRecord } = require("../../middleware/masterRealPropDataProcessing");

async function checkForDuplicateRecord(username, processedData) {
    try {
        const existingRecord = await MasterRealPropModel.findRecordFromUserByDocumentId(username, processedData.document_id);
        const normalizedExistingRecord = normalizeRecord(existingRecord);

        if (JSON.stringify(normalizedExistingRecord) === JSON.stringify(processedData)) {
            throw new BadRequestError("Record already exists for user.");
        }
    } catch (err) {
        if (!(err instanceof NotFoundError)) {
            throw err;
        }
    }
}

async function createRecordForUser(username, processedData) {
    return await MasterRealPropModel.createRecordForUser(username, processedData);
}

module.exports = {
    checkForDuplicateRecord,
    createRecordForUser
};