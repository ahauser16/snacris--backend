"use strict";

const db = require("../../db");
const axios = require("axios");
const { NotFoundError, BadRequestError } = require("../../expressError");
const API_ENDPOINTS = require("../../api/apiEndpoints");

/** Related functions for ACRIS Real Property Master. */

class RealPropertyMaster {
  /** The user fills out a form with input fields mapped to each of the fields associated with ACRIS-Real Property Master dataset.  The user submits the form which triggers the `sendUserDataToServer` and in response the server executes `fetchFromApi` which fetches data from the ACRIS-Real Property Master dataset based on user-data sent from the frontend.
   *
   * `URLSearchParams` is a built-in JavaScript class that provides utility methods to work with the query string of a URL. It is part of the Web API and is available in modern browsers and Node.js environments.  The URLSearchParams class allows you to create and manipulate the query string of a URL. You can add, delete, and retrieve query parameters easily. This class is useful when you need to work with query parameters in a URL.
   * 
   * Returns [{ document_id, record_type, crfn, recorded_borough, doc_type, document_date, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date }, ...]
   **/

  static async fetchFromApi(query) {
    // const url = `${API_ENDPOINTS.realPropertyMaster}?${query}`;
    const url = `${API_ENDPOINTS.realPropertyMaster}?${new URLSearchParams(query).toString()}`;
    console.log("Constructed URL:", url); // Log the constructed URL
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

  /** After the server receives data from the ACRIS-Real Property Master dataset it is sent back to the user on the front end where they will have the option of clicking a "Save Record" button which triggers the route that executes the `saveToDb` function.
   *
   * Returns { document_id, record_type, crfn, recorded_borough, doc_type, document_date, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date }
   **/

  static async saveToDb(data) {
    const result = await db.query(
      `INSERT INTO acris_real_property_master
       (document_id, record_type, crfn, recorded_borough, doc_type, document_date, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING document_id, record_type, crfn, recorded_borough, doc_type, document_date, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date`,
      [
        data.document_id,
        data.record_type,
        data.crfn,
        data.recorded_borough,
        data.doc_type,
        data.document_date,
        data.document_amt,
        data.recorded_datetime,
        data.modified_date,
        data.reel_yr,
        data.reel_nbr,
        data.reel_pg,
        data.percent_trans,
        data.good_through_date,
      ]
    );

    return result.rows[0];
  }

  /** The user has the option to view all records associated with the ACRIS-Real Property Master dataset that they saved to the database such as a `View All` button which triggers the route that executes the `findAll` function.  
   *
   * Returns [{ document_id, record_type, crfn, recorded_borough, doc_type, document_date, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date }, ...]
   **/

  static async findAll() {
    const result = await db.query(
      `SELECT document_id, record_type, crfn, recorded_borough, doc_type, document_date, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date
       FROM acris_real_property_master
       ORDER BY document_id`
    );

    return result.rows;
  }

  /** The user has the option to view a single record associated with the ACRIS-Real Property Master dataset that they saved to the database such as a `View Record` button or a short form with input field labeled `View Record By Document ID` which triggers the route that executes the `get` function with the `document_id` as its sole parameter.
   * 
   *
   * Returns { document_id, record_type, crfn, recorded_borough, doc_type, document_date, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date }
   *
   * Throws NotFoundError if record not found.
   **/

  static async get(document_id) {
    const result = await db.query(
      `SELECT document_id, record_type, crfn, recorded_borough, doc_type, document_date, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date
       FROM acris_real_property_master
       WHERE document_id = $1`,
      [document_id]
    );

    const record = result.rows[0];

    if (!record) throw new NotFoundError(`No record: ${document_id}`);

    return record;
  }

  /** Update record data with `data`.
   *
   * The code in this file is designed to retrieve data from a 3rd party dataset reachable by a specific API endpoint. The dataset contains public land records from the NYC Department of Finance. I want the user to be able to view, save and delete the data to my database associated with their account but I don't want the user to change the data.  However, there are several scenarios where having an update method could be beneficial:
   * 1. Data Correction: If the 3rd party dataset corrects a clerical error or updates its data for internal reasons, you might want to reflect those changes in your database. This ensures that your data remains accurate and up-to-date.
   * 2. Periodic Data Sync: You could implement a periodic data synchronization process that fetches the latest data from the 3rd party API and updates your database accordingly. This would help keep your data in sync with the source.
   * 3. Administrative Updates: While regular users may not have the permission to update data, administrators might need the ability to correct or update records in the database.
   * 4. Data Enrichment: If you plan to enrich the data with additional information (e.g., annotations, tags) that might change over time, the update method would be useful.
   * 5. Handling Partial Data: If you initially save partial data and later fetch more complete data, you might need to update the existing records with the new information.
   * Example Use Case: Periodic Data Sync:
   * Let's consider an example where you implement a periodic data synchronization process to keep your database in sync with the 3rd party dataset.
   * 
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { record_type, crfn, recorded_borough, doc_type, document_date, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date }
   *
   * Returns { document_id, record_type, crfn, recorded_borough, doc_type, document_date, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date }
   *
   * Throws NotFoundError if not found.
   */

  static async update(document_id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {});
    const documentIdVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE acris_real_property_master 
                      SET ${setCols} 
                      WHERE document_id = ${documentIdVarIdx} 
                      RETURNING document_id, record_type, crfn, recorded_borough, doc_type, document_date, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date`;
    const result = await db.query(querySql, [...values, document_id]);
    const record = result.rows[0];

    if (!record) throw new NotFoundError(`No record: ${document_id}`);

    return record;
  }

  /** Delete given record from database; returns undefined. */

  static async remove(document_id) {
    const result = await db.query(
      `DELETE
       FROM acris_real_property_master
       WHERE document_id = $1
       RETURNING document_id`,
      [document_id]
    );
    const record = result.rows[0];

    if (!record) throw new NotFoundError(`No record: ${document_id}`);
  }
}

module.exports = RealPropertyMaster;