"use strict";

const db = require("../../../db");
const { NotFoundError, BadRequestError } = require("../../../expressError");
const { genSqlSetWhere } = require("../../../helpers/genSqlSetWhere");
const { sqlForPartialUpdate } = require("../../../helpers/sql");

/** Related functions for managing UCC collateral codes. */

class UccTypesCodeMapModel {
  /** Create a new record in the ucc_collateral_codes table.
   *
   * data should be { record_type, ucc_collateral_code, description }
   *
   * Returns { id, record_type, ucc_collateral_code, description }
   *
   * Throws BadRequestError if ucc_collateral_code already exists.
   */
  static async createRecord(data) {
    const duplicateCheck = await db.query(
      `SELECT ucc_collateral_code FROM ucc_collateral_codes WHERE ucc_collateral_code = $1`,
      [data.ucc_collateral_code]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(
        `Duplicate ucc_collateral_code: ${data.ucc_collateral_code}`
      );
    }

    const result = await db.query(
      `INSERT INTO ucc_collateral_codes
       (record_type, ucc_collateral_code, description)
       VALUES ($1, $2, $3)
       RETURNING id, record_type, ucc_collateral_code, description`,
      [data.record_type, data.ucc_collateral_code, data.description]
    );

    return result.rows[0];
  }

  /** Find a record by ucc_collateral_code.
   *
   * ucc_collateral_code is the unique identifier for the record.
   *
   * Returns { id, record_type, ucc_collateral_code, description }
   *
   * Throws NotFoundError if not found.
   */
  static async findRecord(ucc_collateral_code) {
    const result = await db.query(
      `SELECT id, record_type, ucc_collateral_code, description
       FROM ucc_collateral_codes
       WHERE ucc_collateral_code = $1`,
      [ucc_collateral_code]
    );

    const record = result.rows[0];

    if (!record)
      throw new NotFoundError(
        `No record found for ucc_collateral_code: ${ucc_collateral_code}`
      );

    return record;
  }

  /** Find all records.
   *
   * Returns [{ id, record_type, ucc_collateral_code, description }, ...]
   * sorted by description.
   */
  static async findAllRecords() {
    const result = await db.query(
      `SELECT id, record_type, ucc_collateral_code, description
             FROM ucc_collateral_codes
             ORDER BY description`
    );

    return result.rows;
  }

  /** Update a record with `data`.
   *
   * This is a partial update, so only the fields provided in `data` will be updated.
   *
   * data can include: { record_type, description }
   * Note: ucc_collateral_code is not updatable as it's the unique identifier
   *
   * Returns { id, record_type, ucc_collateral_code, description }
   *
   * Throws NotFoundError if not found.
   */
  static async updateRecord(ucc_collateral_code, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      record_type: "record_type",
      description: "description",
    });

    const uccCodeIdx = "$" + (values.length + 1);

    const querySql = `UPDATE ucc_collateral_codes
                          SET ${setCols}
                          WHERE ucc_collateral_code = ${uccCodeIdx}
                          RETURNING id, record_type, ucc_collateral_code, description`;
    const result = await db.query(querySql, [...values, ucc_collateral_code]);
    const record = result.rows[0];

    if (!record)
      throw new NotFoundError(
        `No record found for ucc_collateral_code: ${ucc_collateral_code}`
      );

    return record;
  }

  /** Delete a record by ucc_collateral_code.
   *
   * Returns undefined.
   *
   * Throws NotFoundError if not found.
   */
  static async deleteRecord(ucc_collateral_code) {
    const result = await db.query(
      `DELETE
       FROM ucc_collateral_codes
       WHERE ucc_collateral_code = $1
       RETURNING ucc_collateral_code`,
      [ucc_collateral_code]
    );

    const record = result.rows[0];

    if (!record)
      throw new NotFoundError(
        `No record found for ucc_collateral_code: ${ucc_collateral_code}`
      );
  }
}

module.exports = UccTypesCodeMapModel;
