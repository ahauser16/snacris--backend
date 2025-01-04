"use strict";

const db = require("../../db");
const axios = require("axios");
const { NotFoundError, BadRequestError } = require("../../expressError");
const API_ENDPOINTS = require("../../api/apiEndpoints");

/** Related functions for ACRIS Real Property Legals. */

class RealPropertyLegals {
    /** Fetch data from the 3rd party API.
     *
     * Returns [{ document_id, record_type, borough, block, lot, easement, partial_lot, air_rights, subterranean_rights, property_type, street_number, street_name, unit_address, good_through_date }, ...]
     **/

    static async fetchFromApi(query) {
        const url = `${API_ENDPOINTS.realPropertyLegals}?${query}`;
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
     * Returns { id, document_id, record_type, borough, block, lot, easement, partial_lot, air_rights, subterranean_rights, property_type, street_number, street_name, unit_address, good_through_date }
     **/

    static async saveToDb(data) {
        const result = await db.query(
            `INSERT INTO acris_real_property_legals
       (document_id, record_type, borough, block, lot, easement, partial_lot, air_rights, subterranean_rights, property_type, street_number, street_name, unit_address, good_through_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING id, document_id, record_type, borough, block, lot, easement, partial_lot, air_rights, subterranean_rights, property_type, street_number, street_name, unit_address, good_through_date`,
            [
                data.document_id,
                data.record_type,
                data.borough,
                data.block,
                data.lot,
                data.easement,
                data.partial_lot,
                data.air_rights,
                data.subterranean_rights,
                data.property_type,
                data.street_number,
                data.street_name,
                data.unit_address,
                data.good_through_date,
            ]
        );

        return result.rows[0];
    }

    /** Find all records in the database.
     *
     * Returns [{ id, document_id, record_type, borough, block, lot, easement, partial_lot, air_rights, subterranean_rights, property_type, street_number, street_name, unit_address, good_through_date }, ...]
     **/

    static async findAll() {
        const result = await db.query(
            `SELECT id, document_id, record_type, borough, block, lot, easement, partial_lot, air_rights, subterranean_rights, property_type, street_number, street_name, unit_address, good_through_date
       FROM acris_real_property_legals
       ORDER BY id`
        );

        return result.rows;
    }

    /** Given an id, return data about the record.
     *
     * Returns { id, document_id, record_type, borough, block, lot, easement, partial_lot, air_rights, subterranean_rights, property_type, street_number, street_name, unit_address, good_through_date }
     *
     * Throws NotFoundError if record not found.
     **/

    static async get(id) {
        const result = await db.query(
            `SELECT id, document_id, record_type, borough, block, lot, easement, partial_lot, air_rights, subterranean_rights, property_type, street_number, street_name, unit_address, good_through_date
       FROM acris_real_property_legals
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
     *   { record_type, borough, block, lot, easement, partial_lot, air_rights, subterranean_rights, property_type, street_number, street_name, unit_address, good_through_date }
     *
     * Returns { id, document_id, record_type, borough, block, lot, easement, partial_lot, air_rights, subterranean_rights, property_type, street_number, street_name, unit_address, good_through_date }
     *
     * Throws NotFoundError if not found.
     */

    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(data, {});
        const idVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE acris_real_property_legals 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, document_id, record_type, borough, block, lot, easement, partial_lot, air_rights, subterranean_rights, property_type, street_number, street_name, unit_address, good_through_date`;
        const result = await db.query(querySql, [...values, id]);
        const record = result.rows[0];

        if (!record) throw new NotFoundError(`No record: ${id}`);

        return record;
    }

    /** Delete given record from database; returns undefined. */

    static async remove(id) {
        const result = await db.query(
            `DELETE
       FROM acris_real_property_legals
       WHERE id = $1
       RETURNING id`,
            [id]
        );
        const record = result.rows[0];

        if (!record) throw new NotFoundError(`No record: ${id}`);
    }
}

module.exports = RealPropertyLegals;