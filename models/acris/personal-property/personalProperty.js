// models/personalProperty.js
const db = require("../../../db");

/** Turn "" → null */
function sanitize(obj = {}) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v === "" ? null : v])
  );
}

/**
 * Fetch one personal‐property document or all of a user’s.
 */
async function getSavedPersonalPropertyDocument(username, documentId = null) {
  if (!documentId) {
    // fetch all documents for user
    const masters = await db.query(
      `SELECT * FROM saved_personal_property_master
         WHERE username = $1`,
      [username]
    );
    const results = [];
    for (let m of masters.rows) {
      const doc = await getSavedPersonalPropertyDocument(
        username,
        m.document_id
      );
      results.push(doc);
    }
    return results;
  }

  // fetch single document
  const mRes = await db.query(
    `SELECT * FROM saved_personal_property_master
       WHERE username = $1
         AND document_id = $2`,
    [username, documentId]
  );
  if (mRes.rowCount === 0) return null;
  const master = mRes.rows[0];
  const mid = master.id;

  const [legalsRes, partiesRes, refsRes, remarksRes] = await Promise.all([
    db.query(
      `SELECT * FROM saved_personal_property_legals WHERE saved_master_id = $1`,
      [mid]
    ),
    db.query(
      `SELECT * FROM saved_personal_property_parties WHERE saved_master_id = $1`,
      [mid]
    ),
    db.query(
      `SELECT * FROM saved_personal_property_references WHERE saved_master_id = $1`,
      [mid]
    ),
    db.query(
      `SELECT * FROM saved_personal_property_remarks WHERE saved_master_id = $1`,
      [mid]
    ),
  ]);

  return {
    master,
    legals: legalsRes.rows,
    parties: partiesRes.rows,
    references: refsRes.rows,
    remarks: remarksRes.rows,
  };
}

/**
 * Save or update a personal‐property document in one transaction.
 */
async function savePersonalPropertyDocument(username, input) {
  const client = db;
  try {
    await client.query("BEGIN");

    // sanitize
    const doc = {
      master: sanitize(input.master),
      legals: (input.legals || []).map(sanitize),
      parties: (input.parties || []).map(sanitize),
      references: (input.references || []).map(sanitize),
      remarks: (input.remarks || []).map(sanitize),
    };

    // upsert master
    const mRes = await client.query(
      `INSERT INTO saved_personal_property_master
         (username, document_id, record_type, crfn, recorded_borough,
          doc_type, document_amt, recorded_datetime, ucc_collateral,
          fedtax_serial_nbr, fedtax_assessment_date, rpttl_nbr,
          modified_date, reel_yr, reel_nbr, reel_pg, file_nbr,
          good_through_date)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
       ON CONFLICT (username, document_id) DO UPDATE SET
         record_type = EXCLUDED.record_type,
         crfn = EXCLUDED.crfn,
         recorded_borough = EXCLUDED.recorded_borough,
         doc_type = EXCLUDED.doc_type,
         document_amt = EXCLUDED.document_amt,
         recorded_datetime = EXCLUDED.recorded_datetime,
         ucc_collateral = EXCLUDED.ucc_collateral,
         fedtax_serial_nbr = EXCLUDED.fedtax_serial_nbr,
         fedtax_assessment_date = EXCLUDED.fedtax_assessment_date,
         rpttl_nbr = EXCLUDED.rpttl_nbr,
         modified_date = EXCLUDED.modified_date,
         reel_yr = EXCLUDED.reel_yr,
         reel_nbr = EXCLUDED.reel_nbr,
         reel_pg = EXCLUDED.reel_pg,
         file_nbr = EXCLUDED.file_nbr,
         good_through_date = EXCLUDED.good_through_date
       RETURNING id`,
      [
        username,
        doc.master.document_id,
        doc.master.record_type,
        doc.master.crfn,
        doc.master.recorded_borough,
        doc.master.doc_type,
        doc.master.document_amt,
        doc.master.recorded_datetime,
        doc.master.ucc_collateral,
        doc.master.fedtax_serial_nbr,
        doc.master.fedtax_assessment_date,
        doc.master.rpttl_nbr,
        doc.master.modified_date,
        doc.master.reel_yr,
        doc.master.reel_nbr,
        doc.master.reel_pg,
        doc.master.file_nbr,
        doc.master.good_through_date,
      ]
    );
    const mid = mRes.rows[0].id;

    // batch helper
    async function batchInsert(table, rows, cols, clearExisting = false) {
      // Clear existing records for this master if specified
      if (clearExisting) {
        await client.query(`DELETE FROM ${table} WHERE saved_master_id = $1`, [
          mid,
        ]);
      }

      if (!rows.length) return;
      const colList = cols.join(", "),
        vals = [],
        phs = rows
          .map((r, i) => {
            const start = i * cols.length + 1;
            cols.forEach((c) =>
              vals.push(c === "saved_master_id" ? mid : r[c])
            );
            return "(" + cols.map((_, j) => `$${start + j}`).join(", ") + ")";
          })
          .join(",");
      await client.query(
        `INSERT INTO ${table} (${colList})
           VALUES ${phs}
           ON CONFLICT DO NOTHING`,
        vals
      );
    }

    // 1) legals (force 1 row)
    await batchInsert(
      "saved_personal_property_legals",
      doc.legals.length ? doc.legals : [{}],
      [
        "saved_master_id",
        "record_type",
        "borough",
        "block",
        "lot",
        "easement",
        "partial_lot",
        "air_rights",
        "subterranean_rights",
        "property_type",
        "street_number",
        "street_name",
        "addr_unit",
        "good_through_date",
      ],
      true
    );

    // 2) parties (1–3 rows)
    await batchInsert(
      "saved_personal_property_parties",
      doc.parties,
      [
        "saved_master_id",
        "party_index",
        "record_type",
        "party_type",
        "name",
        "address_1",
        "address_2",
        "country",
        "city",
        "state",
        "zip",
        "good_through_date",
      ],
      true
    );

    // 3) references (0→1 row)
    await batchInsert(
      "saved_personal_property_references",
      doc.references.length ? doc.references : [{}],
      [
        "saved_master_id",
        "record_type",
        "crfn",
        "doc_id_ref",
        "file_nbr",
        "good_through_date",
      ],
      true
    );

    // 4) remarks (0→1 row)
    await batchInsert(
      "saved_personal_property_remarks",
      doc.remarks.length ? doc.remarks : [{}],
      [
        "saved_master_id",
        "record_type",
        "sequence_number",
        "remark_text",
        "good_through_date",
      ],
      true
    );

    await client.query("COMMIT");
    return mid;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  }
}

/**
 * Delete a saved personal‐property document (cascades to all children).
 */
async function deletePersonalPropertyDocument(username, documentId) {
  const res = await db.query(
    `DELETE FROM saved_personal_property_master
      WHERE username = $1
        AND document_id = $2
      RETURNING id`,
    [username, documentId]
  );
  return res.rowCount ? res.rows[0].id : null;
}

module.exports = {
  getSavedPersonalPropertyDocument,
  savePersonalPropertyDocument,
  deletePersonalPropertyDocument,
};
