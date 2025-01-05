"use strict";

const db = require("../../db");
const axios = require("axios");
const { NotFoundError, BadRequestError } = require("../../expressError");
const API_ENDPOINTS = require("../../api/apiEndpoints");
const { genSqlSetWhere } = require("../../helpers/genSqlSetWhere");
const { sqlForPartialUpdate } = require("../../helpers/sql");

/** Related functions for ACRIS Real Property Master. */

class RealPropertyMaster {
  /** The user fills out a form with input fields mapped to each of the fields associated with ACRIS-Real Property Master dataset.  The user submits the form which triggers the `sendUserDataToServer` and in response the server executes `fetchFromAcris` which fetches data from the ACRIS-Real Property Master dataset based on user-data sent from the frontend.
   *
   * `URLSearchParams` is a built-in JavaScript class that provides utility methods to work with the query string of a URL. It is part of the Web API and is available in modern browsers and Node.js environments.  The URLSearchParams class allows you to create and manipulate the query string of a URL. You can add, delete, and retrieve query parameters easily. This class is useful when you need to work with query parameters in a URL.
   * 
   * Returns [{ document_id, record_type, crfn, recorded_borough, doc_type, document_date, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date }, ...]
   **/

  static async fetchFromAcris(query) {
    const url = `${API_ENDPOINTS.realPropertyMaster}?${new URLSearchParams(query).toString()}`;
    console.log("Constructed URL:", url);
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

  /** After the server receives data from the ACRIS-Real Property Master dataset it is sent back to the user on the front end where they will have the option of clicking a "Save Record" button which triggers the route that executes the `saveUserRecord` function which calls the `saveToDb` function.  The `saveToDb` function saves the record data to the database whereas the `saveUserRecord` function saves the record data to the user-specific record data table.  The `saveToDb` function would be executed alone in cases where an admin user is adding a new record to the database which is not associated with a particular user.
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

  /** 
   * Save user-specific record data.
   *
   * Returns { id, username, document_id, saved_at }
   * 
   * Explanation of saveUserRecord Method
   * The `saveUserRecord` method is designed to save a record to the `acris_real_property_master` table and then create an association between the user and the saved record in the `user_saved_real_property_master` join table. Here is a detailed explanation of how it works:
   * 1. Save the Record to `acris_real_property_master`:
   * - The `saveUserRecord` method first calls the saveToDb method to save the record to the `acris_real_property_master` table.
   * - The saveToDb method inserts the record into the `acris_real_property_master` table and returns the saved record.
   * 2. Create an Association in the Join Table:
   * - After saving the record, the `saveUserRecord` method inserts a new entry into the `user_saved_real_property_master` join table.
   * - This entry associates the `username` with the `document_id` of the saved record.
  **/

  static async saveUserRecord(username, data) {
    const record = await this.saveToDb(data);
    const result = await db.query(
      `INSERT INTO user_saved_real_property_master (username, document_id)
       VALUES ($1, $2)
       RETURNING id, username, document_id, saved_at`,
      [username, record.document_id]
    );

    return result.rows[0];
  }

  /** Find all records saved by a specific user.
   *
   * Returns [{ document_id, record_type, crfn, recorded_borough, doc_type, document_date, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date }, ...]
   * 
   * Use Case: This function is used when an authenticated user wants to retrieve all records from the database that are associated with their account. For example, a user might want to view all the property records they have saved.
   * 
   * Access Control: Only the authenticated user should have access to this function to ensure that users can only view their own records.
   **/

  static async findAllByUser(username) {
    const result = await db.query(
      `SELECT arm.document_id, arm.record_type, arm.crfn, arm.recorded_borough, arm.doc_type, arm.document_date, arm.document_amt, arm.recorded_datetime, arm.modified_date, arm.reel_yr, arm.reel_nbr, arm.reel_pg, arm.percent_trans, arm.good_through_date
       FROM acris_real_property_master arm
       JOIN user_saved_real_property_master usr ON arm.document_id = usr.document_id
       WHERE usr.username = $1
       ORDER BY arm.document_id`,
      [username]
    );

    return result.rows;
  }

  /** Find all records in the database or all records saved by a specific user (admin only).
   *
   * Returns [{ document_id, record_type, crfn, recorded_borough, doc_type, document_date, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date }, ...]
   * 
   * Use Case: This function is used when an authenticated admin wants to retrieve all records from the database or optionally retrieve all records saved by a particular user. For example, an admin might want to review all property records saved by all users or investigate the records saved by a specific user.
   * Access Control: Only an authenticated admin should have access to this function to ensure that sensitive data is protected and only accessible by authorized personnel.
   **/

  static async findAll(username = null) {
    if (username) {
      return this.findAllByUser(username);
    } else {
      const result = await db.query(
        `SELECT document_id, record_type, crfn, recorded_borough, doc_type, document_date, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date
         FROM acris_real_property_master
         ORDER BY document_id`
      );
      return result.rows;
    }
  }

  /** Retrieve a single record associated with a specific user.
     *
     * Returns { document_id, record_type, crfn, recorded_borough, doc_type, document_date, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date }
     *
     * Throws NotFoundError if record not found.
     * 
     * Use Case: This function is used when an authenticated user wants to retrieve a single record from the database by referencing the record's document_id value, ensuring that the record is associated with that particular user. For example, a user might want to view the details of a specific property record they have saved.
     * Access Control: Only the authenticated user should have access to this function to ensure that users can only view their own records.
     **/

  static async getRecordByUser(username, document_id) {
    const result = await db.query(
      `SELECT arm.document_id, arm.record_type, arm.crfn, arm.recorded_borough, arm.doc_type, arm.document_date, arm.document_amt, arm.recorded_datetime, arm.modified_date, arm.reel_yr, arm.reel_nbr, arm.reel_pg, arm.percent_trans, arm.good_through_date
     FROM acris_real_property_master arm
     JOIN user_saved_real_property_master usr ON arm.document_id = usr.document_id
     WHERE usr.username = $1 AND arm.document_id = $2`,
      [username, document_id]
    );

    const record = result.rows[0];

    if (!record) throw new NotFoundError(`No record: ${document_id} for user: ${username}`);

    return record;
  }


  /** Retrieve a single record by document_id (admin only).
     *
     * Returns { document_id, record_type, crfn, recorded_borough, doc_type, document_date, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date }
     *
     * Throws NotFoundError if record not found.
     * 
     * Use Case: This function is used when an authenticated admin wants to retrieve a single record from the database by referencing its document_id value, regardless of whether the record is associated with any user. For example, an admin might want to review the details of any property record in the database.
     * Access Control: Only an authenticated admin should have access to this function to ensure that sensitive data is protected and only accessible by authorized personnel.
     **/

  static async getRecordByAdmin(document_id, username = null) {
    if (username) {
      return this.getByUser(username, document_id);
    } else {
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
  }

  /** Search records saved by a specific user based on search criteria.
    *
    * Returns [{ document_id, record_type, crfn, recorded_borough, doc_type, document_date, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date }, ...]
    *
    * Throws NotFoundError if no records match the search criteria.
    * 
    * This method allows users to search for records they have saved based on various search criteria. It constructs a dynamic SQL query using the provided search criteria and returns the matching records.
    * 
    * The alias `arpm` refers to the `acris_real_property_master` table.
    * The alias `usrpm` refers to the `user_saved_real_property_master` join table.
    **/

  static async searchRecordsByUser(username, searchCriteria) {
    const { whereClause, values } = genSqlSetWhere(searchCriteria);
    const querySql = `SELECT arpm.document_id, arpm.record_type, arpm.crfn, arpm.recorded_borough, arpm.doc_type, arpm.document_date, arpm.document_amt, arpm.recorded_datetime, arpm.modified_date, arpm.reel_yr, arpm.reel_nbr, arpm.reel_pg, arpm.percent_trans, arpm.good_through_date
                      FROM acris_real_property_master arpm
                      JOIN user_saved_real_property_master usrpm ON arpm.document_id = usrpm.document_id
                      WHERE usrpm.username = $1 AND ${whereClause}
                      ORDER BY arpm.document_id`;
    const result = await db.query(querySql, [username, ...values]);

    if (result.rows.length === 0) {
      throw new NotFoundError(`No records found for user: ${username} with criteria: ${JSON.stringify(searchCriteria)}`);
    }

    return result.rows;
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

  /** Delete a single record associated with a specific user.
   *
   * Returns { document_id }
   *
   * Throws NotFoundError if record not found.
   **/

  static async removeByUser(username, document_id) {
    const result = await db.query(
      `DELETE FROM user_saved_real_property_master
       WHERE username = $1 AND document_id = $2
       RETURNING document_id`,
      [username, document_id]
    );

    const record = result.rows[0];

    if (!record) throw new NotFoundError(`No record: ${document_id} for user: ${username}`);

    return record;
  }

  /** Delete given record from database; returns undefined. */

  static async remove(document_id, username = null) {
    if (username) {
      return this.removeByUser(username, document_id);
    } else {
      const result = await db.query(
        `DELETE
         FROM acris_real_property_master
         WHERE document_id = $1
         RETURNING document_id`,
        [document_id]
      );
      const record = result.rows[0];

      if (!record) throw new NotFoundError(`No record: ${document_id}`);

      return record;
    }
  }
}

module.exports = RealPropertyMaster;