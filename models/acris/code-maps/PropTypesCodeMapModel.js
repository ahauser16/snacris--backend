"use strict";

const db = require("../../../db");
const { NotFoundError, BadRequestError } = require("../../../expressError");
const { genSqlSetWhere } = require("../../../helpers/genSqlSetWhere");
const { sqlForPartialUpdate } = require("../../../helpers/sql");

/** Related functions for managing property type codes. */

class PropTypesCodeMapModel {
  /** Find a record by property_type.
   *
   * property_type is the unique identifier for the record.
   *
   * Returns { id, record_type, property_type, description }
   *
   * Throws NotFoundError if not found.
   */
  static async findRecord(property_type) {
    const result = await db.query(
      `SELECT id, record_type, property_type, description
       FROM property_type_codes
       WHERE property_type = $1`,
      [property_type]
    );

    const record = result.rows[0];

    if (!record)
      throw new NotFoundError(
        `No record found for property_type: ${property_type}`
      );

    return record;
  }

  /** Find all records.
   *
   * Returns [{ id, record_type, property_type, description }, ...]
   * sorted by description.
   */
  static async findAllRecords() {
    const result = await db.query(
      `SELECT id, record_type, property_type, description
             FROM property_type_codes
             ORDER BY description`
    );

    return result.rows;
  }

  /** Get all property type codes as a simple array.
   *
   * Returns an array of property_type strings, useful for validation or dropdowns.
   *
   * Returns ['01', '02', '03', ...]
   */
  static async getAllPropertyTypes() {
    const result = await db.query(
      `SELECT property_type
             FROM property_type_codes
             ORDER BY property_type`
    );

    return result.rows.map((row) => row.property_type);
  }

  /** Create a new property type code record.
   *
   * data should include: { record_type, property_type, description }
   *
   * Returns { id, record_type, property_type, description }
   *
   * Throws BadRequestError if property_type already exists.
   */
  static async createRecord({ record_type, property_type, description }) {
    const duplicateCheck = await db.query(
      `SELECT property_type FROM property_type_codes WHERE property_type = $1`,
      [property_type]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate property_type: ${property_type}`);
    }

    const result = await db.query(
      `INSERT INTO property_type_codes
             (record_type, property_type, description)
             VALUES ($1, $2, $3)
             RETURNING id, record_type, property_type, description`,
      [record_type, property_type, description]
    );

    return result.rows[0];
  }

  /** Update a record with `data`.
   *
   * This is a partial update, so only the fields provided in `data` will be updated.
   *
   * data can include: { record_type, description }
   * Note: property_type is not updatable as it's the unique identifier.
   *
   * Returns { id, record_type, property_type, description }
   *
   * Throws NotFoundError if not found.
   */
  static async updateRecord(property_type, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      record_type: "record_type",
      description: "description",
    });

    const propertyTypeIdx = "$" + (values.length + 1);

    const querySql = `UPDATE property_type_codes
                          SET ${setCols}
                          WHERE property_type = ${propertyTypeIdx}
                          RETURNING id, record_type, property_type, description`;
    const result = await db.query(querySql, [...values, property_type]);
    const record = result.rows[0];

    if (!record)
      throw new NotFoundError(
        `No record found for property_type: ${property_type}`
      );

    return record;
  }

  /** Delete a record by property_type.
   *
   * Returns undefined.
   *
   * Throws NotFoundError if not found.
   */
  static async deleteRecord(property_type) {
    const result = await db.query(
      `DELETE
       FROM property_type_codes
       WHERE property_type = $1
       RETURNING property_type`,
      [property_type]
    );

    const record = result.rows[0];

    if (!record)
      throw new NotFoundError(
        `No record found for property_type: ${property_type}`
      );
  }
}

module.exports = PropTypesCodeMapModel;
