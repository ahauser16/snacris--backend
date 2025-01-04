"use strict";

const db = require("../../db");
const axios = require("axios");
const { NotFoundError, BadRequestError } = require("../../expressError");
const API_ENDPOINTS = require("../../api/apiEndpoints");

/** Related functions for ACRIS Real Property References. */

class RealPropertyReferences {
  /** Fetch data from the 3rd party API.
   *
   * Returns [{ document_id, record_type, reference_by_crfn_, reference_by_doc_id, reference_by_reel_year, reference_by_reel_borough, reference_by_reel_nbr, reference_by_reel_page, good_through_date }, ...]
   **/

  static async fetchFromApi(query) {
    const url = `${API_ENDPOINTS.realPropertyReferences}?${query}`;
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-App-Token': process.env.APP_TOKEN,
      },
    });

    if (response.data.length === 0) {
      throw new NotFoundError(`No records found for query: ${query}`);
    }

    return response.data;
  }

  /** Save data to the database.
   *
   * Returns { id, document_id, record_type, reference_by_crfn_, reference_by_doc_id, reference_by_reel_year, reference_by_reel_borough, reference_by_reel_nbr, reference_by_reel_page, good_through_date }
   **/

  static async saveToDb(data) {
    const result = await db.query(
      `INSERT INTO acris_real_property_references
       (document_id, record_type, reference_by_crfn_, reference_by_doc_id, reference_by_reel_year, reference_by_reel_borough, reference_by_reel_nbr, reference_by_reel_page, good_through_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, document_id, record_type, reference_by_crfn_, reference_by_doc_id, reference_by_reel_year, reference_by_reel_borough, reference_by_reel_nbr, reference_by_reel_page, good_through_date`,
      [
        data.document_id,
        data.record_type,
        data.reference_by_crfn_,
        data.reference_by_doc_id,
        data.reference_by_reel_year,
        data.reference_by_reel_borough,
        data.reference_by_reel_nbr,
        data.reference_by_reel_page,
        data.good_through_date,
      ]
    );

    return result.rows[0];
  }

  /** Find all records in the database.
   *
   * Returns [{ id, document_id, record_type, reference_by_crfn_, reference_by_doc_id, reference_by_reel_year, reference_by_reel_borough, reference_by_reel_nbr, reference_by_reel_page, good_through_date }, ...]
   **/

  static async findAll() {
    const result = await db.query(
      `SELECT id, document_id, record_type, reference_by_crfn_, reference_by_doc_id, reference_by_reel_year, reference_by_reel_borough, reference_by_reel_nbr, reference_by_reel_page, good_through_date
       FROM acris_real_property_references
       ORDER BY id`
    );

    return result.rows;
  }

  /** Given an id, return data about the record.
   *
   * Returns { id, document_id, record_type, reference_by_crfn_, reference_by_doc_id, reference_by_reel_year, reference_by_reel_borough, reference_by_reel_nbr, reference_by_reel_page, good_through_date }
   *
   * Throws NotFoundError if record not found.
   **/

  static async get(id) {
    const result = await db.query(
      `SELECT id, document_id, record_type, reference_by_crfn_, reference_by_doc_id, reference_by_reel_year, reference_by_reel_borough, reference_by_reel_nbr, reference_by_reel_page, good_through_date
       FROM acris_real_property_references
       WHERE id = $1`,
      [id]
    );

    const record = result.rows[0];

    if (!record) throw new NotFoundError(`No record: ${id}`);

    return record;
  }

  /** Update record data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { record_type, reference_by_crfn_, reference_by_doc_id, reference_by_reel_year, reference_by_reel_borough, reference_by_reel_nbr, reference_by_reel_page, good_through_date }
   *
   * Returns { id, document_id, record_type, reference_by_crfn_, reference_by_doc_id, reference_by_reel_year, reference_by_reel_borough, reference_by_reel_nbr, reference_by_reel_page, good_through_date }
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {});
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE acris_real_property_references 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, document_id, record_type, reference_by_crfn_, reference_by_doc_id, reference_by_reel_year, reference_by_reel_borough, reference_by_reel_nbr, reference_by_reel_page, good_through_date`;
    const result = await db.query(querySql, [...values, id]);
    const record = result.rows[0];

    if (!record) throw new NotFoundError(`No record: ${id}`);

    return record;
  }

  /** Delete given record from database; returns undefined. */

  static async remove(id) {
    const result = await db.query(
      `DELETE
       FROM acris_real_property_references
       WHERE id = $1
       RETURNING id`,
      [id]
    );
    const record = result.rows[0];

    if (!record) throw new NotFoundError(`No record: ${id}`);
  }
}

module.exports = RealPropertyReferences;