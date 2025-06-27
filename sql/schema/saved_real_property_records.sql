-- 1) saved_real_property_master
CREATE TABLE
  saved_real_property_master (
    id SERIAL PRIMARY KEY,
    username VARCHAR(25) NOT NULL REFERENCES users (username) ON DELETE CASCADE,
    document_id VARCHAR(16) NOT NULL,
    record_type CHAR(1),
    crfn VARCHAR(13),
    recorded_borough INTEGER,
    doc_type VARCHAR(8),
    document_date DATE,
    document_amt NUMERIC(16, 2),
    recorded_datetime TIMESTAMP,
    modified_date TIMESTAMP,
    reel_yr INTEGER,
    reel_nbr INTEGER,
    reel_pg INTEGER,
    percent_trans NUMERIC(9, 6),
    good_through_date DATE,
    saved_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_saved_rp_master UNIQUE (username, document_id)
  );

-- 2) saved_real_property_legals  (1:many → multiple records per document_id)
CREATE TABLE
  saved_real_property_legals (
    id SERIAL PRIMARY KEY,
    saved_master_id INTEGER NOT NULL REFERENCES saved_real_property_master (id) ON DELETE CASCADE,
    record_type CHAR(1),
    borough INTEGER NOT NULL,
    block INTEGER NOT NULL,
    lot INTEGER NOT NULL,
    easement CHAR(1),
    partial_lot CHAR(1),
    air_rights CHAR(1),
    subterranean_rights CHAR(1),
    property_type CHAR(2),
    street_number VARCHAR(12),
    street_name VARCHAR(32),
    unit_address VARCHAR(7),
    good_through_date DATE
  );

-- Keep an index on BBL for lookups:
CREATE INDEX ON saved_real_property_legals (borough, block, lot);

-- 3) saved_real_property_parties  (1–3 rows per master, same document_id)
CREATE TABLE
  saved_real_property_parties (
    id SERIAL PRIMARY KEY,
    saved_master_id INTEGER NOT NULL REFERENCES saved_real_property_master (id) ON DELETE CASCADE,
    party_index INTEGER NOT NULL CHECK (party_index BETWEEN 1 AND 3),
    record_type CHAR(1),
    party_type CHAR(1),
    name VARCHAR(70),
    address_1 VARCHAR(60),
    address_2 VARCHAR(60),
    country CHAR(2),
    city VARCHAR(30),
    state CHAR(2),
    zip VARCHAR(9),
    good_through_date DATE,
    CONSTRAINT uq_saved_rp_parties_per_master UNIQUE (saved_master_id, party_index)
  );

-- If you frequently search by name:
CREATE INDEX ON saved_real_property_parties (name);

-- 4) saved_real_property_references  (0 or 1 row per master)
CREATE TABLE
  saved_real_property_references (
    id SERIAL PRIMARY KEY,
    saved_master_id INTEGER NOT NULL REFERENCES saved_real_property_master (id) ON DELETE CASCADE,
    record_type CHAR(1),
    reference_by_crfn VARCHAR(13),
    reference_by_doc_id VARCHAR(16),
    reference_by_reel_year INTEGER,
    reference_by_reel_borough INTEGER,
    reference_by_reel_nbr INTEGER,
    reference_by_reel_page INTEGER,
    good_through_date DATE,
    CONSTRAINT uq_saved_rp_references_per_master UNIQUE (saved_master_id)
  );

-- 5) saved_real_property_remarks  (0 or 1 row per master)
CREATE TABLE
  saved_real_property_remarks (
    id SERIAL PRIMARY KEY,
    saved_master_id INTEGER NOT NULL REFERENCES saved_real_property_master (id) ON DELETE CASCADE,
    record_type CHAR(1),
    sequence_number INTEGER,
    remark_text VARCHAR(232),
    good_through_date DATE,
    CONSTRAINT uq_saved_rp_remarks_per_master UNIQUE (saved_master_id)
  );