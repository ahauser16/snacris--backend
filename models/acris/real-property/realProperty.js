// models/realProperty.js
const db = require("../../../db");

/** Turn any "" into null (PG treats undefined as NULL) */
function sanitize(obj = {}) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v === "" ? null : v])
  );
}

/**
 * Fetch saved real-property documents.
 * If documentId is provided, returns a single document object or null.
 * If documentId is omitted, returns an array of all documents for the user.
 */
async function getSavedRealPropertyDocument(username, documentId = null) {
  // Helper to fetch one master + its children
  async function fetchOne(master) {
    const id = master.id;
    const [legalsRes, partiesRes, refsRes, remarksRes] = await Promise.all([
      db.query(
        `SELECT * FROM saved_real_property_legals WHERE saved_master_id = $1`,
        [id]
      ),
      db.query(
        `SELECT * FROM saved_real_property_parties WHERE saved_master_id = $1`,
        [id]
      ),
      db.query(
        `SELECT * FROM saved_real_property_references WHERE saved_master_id = $1`,
        [id]
      ),
      db.query(
        `SELECT * FROM saved_real_property_remarks WHERE saved_master_id = $1`,
        [id]
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

  if (documentId) {
    // fetch single
    const mRes = await db.query(
      `SELECT * FROM saved_real_property_master
       WHERE username = $1 AND document_id = $2`,
      [username, documentId]
    );
    if (mRes.rowCount === 0) return null;
    return fetchOne(mRes.rows[0]);
  }

  // fetch all
  const allRes = await db.query(
    `SELECT * FROM saved_real_property_master WHERE username = $1`,
    [username]
  );
  const docs = await Promise.all(allRes.rows.map(fetchOne));
  return docs;
}

/**
 * Save (insert or update) a full real-property document in one transaction.
 * - Blank strings → NULL via sanitize
 * - Ensures 1 master, 1 legals, 1 references, 1 remarks, 1–3 parties
 */
async function saveRealPropertyDocument(username, docInput) {
  const client = db;
  try {
    await client.query("BEGIN");

    // sanitize all pieces
    const doc = {
      master: sanitize(docInput.master),
      legals: (docInput.legals || []).map(sanitize),
      parties: (docInput.parties || []).map(sanitize),
      references: (docInput.references || []).map(sanitize),
      remarks: (docInput.remarks || []).map(sanitize),
    };

    // 1) Upsert master
    const mRes = await client.query(
      `INSERT INTO saved_real_property_master
         (username, document_id, record_type, crfn, recorded_borough, doc_type,
          document_date, document_amt, recorded_datetime, modified_date,
          reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       ON CONFLICT (username, document_id) DO UPDATE
         SET modified_date = EXCLUDED.modified_date
       RETURNING id`,
      [
        username,
        doc.master.document_id,
        doc.master.record_type,
        doc.master.crfn,
        doc.master.recorded_borough,
        doc.master.doc_type,
        doc.master.document_date,
        doc.master.document_amt,
        doc.master.recorded_datetime,
        doc.master.modified_date,
        doc.master.reel_yr,
        doc.master.reel_nbr,
        doc.master.reel_pg,
        doc.master.percent_trans,
        doc.master.good_through_date,
      ]
    );
    const masterId = mRes.rows[0].id;

    // helper to batch-insert child arrays
    async function batchInsert(table, rows, columns, clearExisting = false) {
      console.log(`batchInsert called for table: ${table}`);
      console.log(`rows:`, JSON.stringify(rows, null, 2));
      console.log(`columns:`, columns);

      // Clear existing records for this master if specified
      if (clearExisting) {
        await client.query(`DELETE FROM ${table} WHERE saved_master_id = $1`, [
          masterId,
        ]);
      }

      if (!rows || rows.length === 0) return;

      const cols = columns.join(", ");
      const vals = [];
      const placeholders = rows
        .map((row, i) => {
          const start = i * columns.length + 1;
          columns.forEach((col) => {
            vals.push(col === "saved_master_id" ? masterId : row[col]);
          });
          return "(" + columns.map((_, j) => `$${start + j}`).join(", ") + ")";
        })
        .join(", ");

      const sql = `INSERT INTO ${table} (${cols}) VALUES ${placeholders} ON CONFLICT DO NOTHING`;

      console.log(`Generated SQL: ${sql}`);
      console.log(`Values: ${JSON.stringify(vals)}`);

      await client.query(sql, vals);
    }

    // 2) Legals (multiple rows possible)
    await batchInsert(
      "saved_real_property_legals",
      doc.legals,
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
        "unit_address",
        "good_through_date",
      ],
      true
    );

    const partiesWithIndex = doc.parties.map((party) => ({
      ...party,
      party_index: parseInt(party.party_type) || 1,
    }));

    // 3) Parties (1 - 3 rows)
    await batchInsert(
      "saved_real_property_parties",
      partiesWithIndex,
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

    // 4) References (0→1)
    await batchInsert(
      "saved_real_property_references",
      doc.references.length ? doc.references : [{}],
      [
        "saved_master_id",
        "record_type",
        "reference_by_crfn",
        "reference_by_doc_id",
        "reference_by_reel_year",
        "reference_by_reel_borough",
        "reference_by_reel_nbr",
        "reference_by_reel_page",
        "good_through_date",
      ],
      true
    );

    // 5) Remarks (0→1)
    await batchInsert(
      "saved_real_property_remarks",
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
    return masterId;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  }
}

/**
 * Delete a saved real-property document and all its children.
 * Returns the deleted document's master id, or null if not found.
 */
async function deleteRealPropertyDocument(username, documentId) {
  const res = await db.query(
    `DELETE FROM saved_real_property_master
      WHERE username = $1 AND document_id = $2
      RETURNING id`,
    [username, documentId]
  );
  return res.rowCount ? res.rows[0].id : null;
}

module.exports = {
  getSavedRealPropertyDocument,
  saveRealPropertyDocument,
  deleteRealPropertyDocument,
};
