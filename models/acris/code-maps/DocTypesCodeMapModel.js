"use strict";

const db = require("../../../db");
const { NotFoundError, BadRequestError } = require("../../../expressError");
const { genSqlSetWhere } = require("../../../helpers/genSqlSetWhere");
const { sqlForPartialUpdate } = require("../../../helpers/sql");

/** Related functions for managing document control codes. */

class DocTypesCodeMapModel {
    /** Create a new record in the document_control_codes table.
     *
     * data should be { record_type, doc_type, doc_type_description, class_code_description, party1_type, party2_type, party3_type }
     *
     * Returns { id, record_type, doc_type, doc_type_description, class_code_description, party1_type, party2_type, party3_type }
     */
    static async createRecord(data) {
        const result = await db.query(
            `INSERT INTO document_control_codes
       (record_type, doc_type, doc_type_description, class_code_description, party1_type, party2_type, party3_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, record_type, doc_type, doc_type_description, class_code_description, party1_type, party2_type, party3_type`,
            [
                data.record_type,
                data.doc_type,
                data.doc_type_description,
                data.class_code_description,
                data.party1_type,
                data.party2_type,
                data.party3_type,
            ]
        );

        return result.rows[0];
    }

    /** Find a record by doc_type.
     *
     * doc_type is the unique identifier for the record.
     *
     * Returns { id, record_type, doc_type, doc_type_description, class_code_description, party1_type, party2_type, party3_type }
     *
     * Throws NotFoundError if not found.
     */
    static async findRecord(doc_type) {
        const result = await db.query(
            `SELECT id, record_type, doc_type, doc_type_description, class_code_description, party1_type, party2_type, party3_type
       FROM document_control_codes
       WHERE doc_type = $1`,
            [doc_type]
        );

        const record = result.rows[0];

        if (!record) throw new NotFoundError(`No record found for doc_type: ${doc_type}`);

        return record;
    }

    /** Find all records.
     *
     * Returns [{ id, record_type, doc_type, doc_type_description, class_code_description, party1_type, party2_type, party3_type }, ...]
     * sorted by class_code_description and then by doc_type_description.
     */
    static async findAllRecords() {
        const result = await db.query(
            `SELECT id, record_type, doc_type, doc_type_description, class_code_description, party1_type, party2_type, party3_type
             FROM document_control_codes
             ORDER BY class_code_description, doc_type_description`
        );

        return result.rows;
    }

    /**
     * Retrieve all `doc_type` values for a given `class_code_description`.
     *
     * @param {string} doc_class - The class_code_description value.
     * @returns {Array<string>} - An array of `doc_type` values.
     * @throws {NotFoundError} - If no `doc_type` values are found for the given `doc_class`.
     */
    static async getDocTypesByClass(doc_class) {
        const result = await db.query(
            `SELECT doc_type
             FROM document_control_codes
             WHERE class_code_description = $1`,
            [doc_class]
        );

        if (result.rows.length === 0) {
            throw new NotFoundError(`No doc_type values found for class: ${doc_class}`);
        }

        return result.rows.map(row => row.doc_type);
    }

    /** Update a record with `data`.
     *
     * This is a partial update, so only the fields provided in `data` will be updated.
     *
     * data can include: { record_type, doc_type_description, class_code_description, party1_type, party2_type, party3_type }
     *
     * Returns { id, record_type, doc_type, doc_type_description, class_code_description, party1_type, party2_type, party3_type }
     *
     * Throws NotFoundError if not found.
     */
    static async updateRecord(doc_type, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
        doc_type_description: "doc_type_description",
        class_code_description: "class_code_description",
        party1_type: "party1_type",
        party2_type: "party2_type",
        party3_type: "party3_type",
    });

    const docTypeIdx = "$" + (values.length + 1);

    const querySql = `UPDATE document_control_codes
                      SET ${setCols}
                      WHERE doc_type = ${docTypeIdx}
                      RETURNING id, record_type, doc_type, doc_type_description, class_code_description, party1_type, party2_type, party3_type`;
    const result = await db.query(querySql, [...values, doc_type]);
    const record = result.rows[0];

    if (!record) throw new NotFoundError(`No record found for doc_type: ${doc_type}`);

    return record;
}

    /** Delete a record by doc_type.
     *
     * Returns undefined.
     *
     * Throws NotFoundError if not found.
     */
    static async deleteRecord(doc_type) {
    const result = await db.query(
        `DELETE
       FROM document_control_codes
       WHERE doc_type = $1
       RETURNING doc_type`,
        [doc_type]
    );

    const record = result.rows[0];

    if (!record) throw new NotFoundError(`No record found for doc_type: ${doc_type}`);
}
}

module.exports = DocTypesCodeMapModel;