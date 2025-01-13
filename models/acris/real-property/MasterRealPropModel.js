"use strict";

const db = require("../../../db");
const { NotFoundError, BadRequestError } = require("../../../expressError");
const { genSqlSetWhere } = require("../../../helpers/genSqlSetWhere");
const { sqlForPartialUpdate } = require("../../../helpers/sql");

/** Related functions for ACRIS Real Property Master. */

class MasterRealPropModel {

  //1. Inserts a new record into the acris_real_property_master table using the provided data.
  //2. Returns the inserted record.
  static async createRecord(data) {
    const result = await db.query(
      `INSERT INTO acris_real_property_master
       (document_id, record_type, crfn, recorded_borough, doc_type, document_date, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING id, document_id, record_type, crfn, recorded_borough, doc_type, document_date, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date`,
      [
        data.document_id,
        data.record_type,
        data.crfn || null,
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
   * Explanation of `createRecordForUser` Method
   * The `createRecordForUser` method is designed to save a record to the `acris_real_property_master` table and then create an association between the user and the saved record in the `user_saved_real_property_master` join table. Here is a detailed explanation of how it works:
   * Step One - Save the record to `acris_real_property_master`: The `createRecordForUser` method first calls the `createRecord` method to insert the record into the `acris_real_property_master` table.  Upon successful execution `createRecord` returns the saved record.
  * Step Two - Create an Association in the Join Table: After saving the record, the `createRecordForUser` method inserts a new entry into the `user_saved_real_property_master` join table which associates the `username` with the `document_id` of the saved record.  Upon successful execution `createRecordForUser` returns the association record.
  **/

  static async createRecordForUser(username, data) {
    // Check if the record already exists for the user
    const existingRecord = await db.query(
      `SELECT usr.master_id
       FROM user_saved_real_property_master usr
       JOIN acris_real_property_master arm ON usr.master_id = arm.id
       WHERE usr.username = $1 AND arm.document_id = $2 AND arm.record_type = $3 AND arm.crfn = $4 AND arm.recorded_borough = $5 AND arm.doc_type = $6 AND arm.document_date = $7 AND arm.document_amt = $8 AND arm.recorded_datetime = $9 AND arm.modified_date = $10 AND arm.reel_yr = $11 AND arm.reel_nbr = $12 AND arm.reel_pg = $13 AND arm.percent_trans = $14 AND arm.good_through_date = $15`,
      [
        username,
        data.document_id,
        data.record_type,
        data.crfn || null,
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

    if (existingRecord.rows.length > 0) {
      throw new BadRequestError(`Record with document_id: ${data.document_id} already exists for user: ${username}`);
    }

    const record = await this.createRecord(data);
    const result = await db.query(
      `INSERT INTO user_saved_real_property_master (username, master_id)
       VALUES ($1, $2)
       RETURNING id, username, master_id, saved_at`,
      [username, record.id]
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

  static async findAllRecordsByUser(username) {
    const result = await db.query(
      `SELECT arm.document_id, arm.record_type, arm.crfn, arm.recorded_borough, arm.doc_type, arm.document_date, arm.document_amt, arm.recorded_datetime, arm.modified_date, arm.reel_yr, arm.reel_nbr, arm.reel_pg, arm.percent_trans, arm.good_through_date
       FROM acris_real_property_master arm
       JOIN user_saved_real_property_master usr ON arm.id = usr.master_id
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

  static async findAllRecords(username = null) {
    if (username) {
      return this.findAllRecordsByUser(username);
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

  static async findRecordFromUserByDocumentId(username, document_id) {
    const result = await db.query(
      `SELECT arm.document_id, arm.record_type, arm.crfn, arm.recorded_borough, arm.doc_type, arm.document_date, arm.document_amt, arm.recorded_datetime, arm.modified_date, arm.reel_yr, arm.reel_nbr, arm.reel_pg, arm.percent_trans, arm.good_through_date
       FROM acris_real_property_master arm
       JOIN user_saved_real_property_master usr ON arm.id = usr.master_id
       WHERE usr.username = $1 AND arm.document_id = $2`,
      [username, document_id]
    );

    const record = result.rows[0];

    if (!record) throw new NotFoundError(`No record: ${document_id} for user: ${username}`);

    return record;
  }


  /** Retrieve records by document_id (admin only).
     *
     * Returns [{ document_id, record_type, crfn, recorded_borough, doc_type, document_date, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date }, ...]
     *
     * Throws NotFoundError if no records found.
     * 
     * Use Case: This function is used when an authenticated admin wants to retrieve records from the database by referencing their document_id value, regardless of whether the records are associated with any user. For example, an admin might want to review the details of any property records in the database.
     * Access Control: Only an authenticated admin should have access to this function to ensure that sensitive data is protected and only accessible by authorized personnel.
     **/

  static async findRecordById(document_id, username = null) {
    if (username) {
      return this.findRecordFromUserByDocumentId(username, document_id);
    } else {
      const result = await db.query(
        `SELECT document_id, record_type, crfn, recorded_borough, doc_type, document_date, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date
       FROM acris_real_property_master
       WHERE document_id = $1`,
        [document_id]
      );

      const records = result.rows;

      if (records.length === 0) throw new NotFoundError(`No records found with document_id: ${document_id}`);

      return records;
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

  static async searchRecordsFromUserBySearchCriteria(username, searchCriteria) {
    if (Object.keys(searchCriteria).length === 0) {
      throw new BadRequestError("No search criteria provided");
    }

    const { whereClause, values } = genSqlSetWhere(searchCriteria);
    const querySql = `SELECT arpm.document_id, arpm.record_type, arpm.crfn, arpm.recorded_borough, arpm.doc_type, arpm.document_date, arpm.document_amt, arpm.recorded_datetime, arpm.modified_date, arpm.reel_yr, arpm.reel_nbr, arpm.reel_pg, arpm.percent_trans, arpm.good_through_date
                      FROM acris_real_property_master arpm
                      JOIN user_saved_real_property_master usrpm ON arpm.id = usrpm.master_id
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

  static async deleteRecordByUser(username, document_id) {
    // First, find the master_id associated with the document_id
    const masterResult = await db.query(
      `SELECT id FROM acris_real_property_master WHERE document_id = $1`,
      [document_id]
    );

    const masterRecord = masterResult.rows[0];

    if (!masterRecord) throw new NotFoundError(`No record: ${document_id}`);

    // Delete the record from user_saved_real_property_master
    const result = await db.query(
      `DELETE FROM user_saved_real_property_master
       WHERE username = $1 AND master_id = $2
       RETURNING master_id`,
      [username, masterRecord.id]
    );

    const record = result.rows[0];

    if (!record) throw new NotFoundError(`No record: ${document_id} for user: ${username}`);

    return { document_id };
  }

  /** Delete given record from database; returns undefined. */

  static async deleteRecord(document_id, username = null) {
    if (username) {
      return this.deleteRecordByUser(username, document_id);
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

module.exports = MasterRealPropModel;