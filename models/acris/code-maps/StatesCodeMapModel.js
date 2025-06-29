"use strict";

const db = require("../../../db");
const { NotFoundError, BadRequestError } = require("../../../expressError");
const { genSqlSetWhere } = require("../../../helpers/genSqlSetWhere");
const { sqlForPartialUpdate } = require("../../../helpers/sql");

/** Related functions for managing state codes. */

class StatesCodeMapModel {
  /** Find a record by state_code.
   *
   * state_code is the unique identifier for the record.
   *
   * Returns { id, record_type, state_code, description }
   *
   * Throws NotFoundError if not found.
   */
  static async findRecord(state_code) {
    const result = await db.query(
      `SELECT id, record_type, state_code, description
       FROM state_codes
       WHERE state_code = $1`,
      [state_code]
    );

    const record = result.rows[0];

    if (!record)
      throw new NotFoundError(`No record found for state_code: ${state_code}`);

    return record;
  }

  /** Find all records.
   *
   * Returns [{ id, record_type, state_code, description }, ...]
   * sorted by description.
   */
  static async findAllRecords() {
    const result = await db.query(
      `SELECT id, record_type, state_code, description
             FROM state_codes
             ORDER BY description`
    );

    return result.rows;
  }

  /** Get all state codes as a simple array.
   *
   * Returns an array of state_code strings, useful for validation or dropdowns.
   *
   * Returns ['NY', 'CA', 'TX', ...]
   */
  static async getAllStateCodes() {
    const result = await db.query(
      `SELECT state_code
             FROM state_codes
             ORDER BY state_code`
    );

    return result.rows.map((row) => row.state_code);
  }

  /** Create a new state code record.
   *
   * data should include: { record_type, state_code, description }
   *
   * Returns { id, record_type, state_code, description }
   *
   * Throws BadRequestError if state_code already exists.
   */
  static async createRecord({ record_type, state_code, description }) {
    const duplicateCheck = await db.query(
      `SELECT state_code FROM state_codes WHERE state_code = $1`,
      [state_code]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate state_code: ${state_code}`);
    }

    const result = await db.query(
      `INSERT INTO state_codes
             (record_type, state_code, description)
             VALUES ($1, $2, $3)
             RETURNING id, record_type, state_code, description`,
      [record_type, state_code, description]
    );

    return result.rows[0];
  }

  /** Update a record with `data`.
   *
   * This is a partial update, so only the fields provided in `data` will be updated.
   *
   * data can include: { record_type, description }
   * Note: state_code is not updatable as it's the unique identifier.
   *
   * Returns { id, record_type, state_code, description }
   *
   * Throws NotFoundError if not found.
   */
  static async updateRecord(state_code, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      record_type: "record_type",
      description: "description",
    });

    const stateCodeIdx = "$" + (values.length + 1);

    const querySql = `UPDATE state_codes
                          SET ${setCols}
                          WHERE state_code = ${stateCodeIdx}
                          RETURNING id, record_type, state_code, description`;
    const result = await db.query(querySql, [...values, state_code]);
    const record = result.rows[0];

    if (!record)
      throw new NotFoundError(`No record found for state_code: ${state_code}`);

    return record;
  }

  /** Delete a record by state_code.
   *
   * Returns undefined.
   *
   * Throws NotFoundError if not found.
   */
  static async deleteRecord(state_code) {
    const result = await db.query(
      `DELETE
       FROM state_codes
       WHERE state_code = $1
       RETURNING state_code`,
      [state_code]
    );

    const record = result.rows[0];

    if (!record)
      throw new NotFoundError(`No record found for state_code: ${state_code}`);
  }
}

module.exports = StatesCodeMapModel;
