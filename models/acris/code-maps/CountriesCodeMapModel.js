"use strict";

const db = require("../../../db");
const { NotFoundError, BadRequestError } = require("../../../expressError");
const { genSqlSetWhere } = require("../../../helpers/genSqlSetWhere");
const { sqlForPartialUpdate } = require("../../../helpers/sql");

/** Related functions for managing country codes. */

class CountriesCodeMapModel {
  /** Find a record by country_code.
   *
   * country_code is the unique identifier for the record.
   *
   * Returns { id, record_type, country_code, description }
   *
   * Throws NotFoundError if not found.
   */
  static async findRecord(country_code) {
    const result = await db.query(
      `SELECT id, record_type, country_code, description
       FROM country_codes
       WHERE country_code = $1`,
      [country_code]
    );

    const record = result.rows[0];

    if (!record)
      throw new NotFoundError(
        `No record found for country_code: ${country_code}`
      );

    return record;
  }

  /** Find all records.
   *
   * Returns [{ id, record_type, country_code, description }, ...]
   * sorted by description.
   */
  static async findAllRecords() {
    const result = await db.query(
      `SELECT id, record_type, country_code, description
             FROM country_codes
             ORDER BY description`
    );

    return result.rows;
  }

  /** Get all country codes as a simple array.
   *
   * Returns an array of country_code strings, useful for validation or dropdowns.
   *
   * Returns ['US', 'CA', 'MX', ...]
   */
  static async getAllCountryCodes() {
    const result = await db.query(
      `SELECT country_code
             FROM country_codes
             ORDER BY country_code`
    );

    return result.rows.map((row) => row.country_code);
  }

  /** Create a new country code record.
   *
   * data should include: { record_type, country_code, description }
   *
   * Returns { id, record_type, country_code, description }
   *
   * Throws BadRequestError if country_code already exists.
   */
  static async createRecord({ record_type, country_code, description }) {
    const duplicateCheck = await db.query(
      `SELECT country_code FROM country_codes WHERE country_code = $1`,
      [country_code]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate country_code: ${country_code}`);
    }

    const result = await db.query(
      `INSERT INTO country_codes
             (record_type, country_code, description)
             VALUES ($1, $2, $3)
             RETURNING id, record_type, country_code, description`,
      [record_type, country_code, description]
    );

    return result.rows[0];
  }

  /** Update a record with `data`.
   *
   * This is a partial update, so only the fields provided in `data` will be updated.
   *
   * data can include: { record_type, description }
   * Note: country_code is not updatable as it's the unique identifier.
   *
   * Returns { id, record_type, country_code, description }
   *
   * Throws NotFoundError if not found.
   */
  static async updateRecord(country_code, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      record_type: "record_type",
      description: "description",
    });

    const countryCodeIdx = "$" + (values.length + 1);

    const querySql = `UPDATE country_codes
                          SET ${setCols}
                          WHERE country_code = ${countryCodeIdx}
                          RETURNING id, record_type, country_code, description`;
    const result = await db.query(querySql, [...values, country_code]);
    const record = result.rows[0];

    if (!record)
      throw new NotFoundError(
        `No record found for country_code: ${country_code}`
      );

    return record;
  }

  /** Delete a record by country_code.
   *
   * Returns undefined.
   *
   * Throws NotFoundError if not found.
   */
  static async deleteRecord(country_code) {
    const result = await db.query(
      `DELETE
       FROM country_codes
       WHERE country_code = $1
       RETURNING country_code`,
      [country_code]
    );

    const record = result.rows[0];

    if (!record)
      throw new NotFoundError(
        `No record found for country_code: ${country_code}`
      );
  }
}

module.exports = CountriesCodeMapModel;
