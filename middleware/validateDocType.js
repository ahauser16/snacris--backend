const { BadRequestError } = require("../expressError");
const db = require("../db");

async function validateDocType(req, res, next) {
  try {
    const docType = req.body.doc_type || req.query.doc_type;

    // If no doc_type is provided, skip validation (optional)
    if (!docType) return next();

    // Validate doc_type against the database
    const result = await db.query(
      "SELECT doc_type FROM document_control_codes WHERE doc_type = $1",
      [docType]
    );

    if (result.rows.length === 0) {
      throw new BadRequestError(`Invalid doc_type: ${docType}`);
    }

    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = validateDocType;
