-- 1) saved_personal_property_master
CREATE TABLE saved_personal_property_master (
  id                  SERIAL PRIMARY KEY,
  username            VARCHAR(25) NOT NULL
                        REFERENCES users(username) ON DELETE CASCADE,
  document_id         VARCHAR(16) NOT NULL,
  record_type         CHAR(1),
  crfn                VARCHAR(13),
  recorded_borough    INTEGER,
  doc_type            VARCHAR(8),
  document_amt        NUMERIC(16,2),
  recorded_datetime   TIMESTAMP,
  ucc_collateral      CHAR(1),
  fedtax_serial_nbr   VARCHAR(50),
  fedtax_assessment_date TIMESTAMP,
  rpttl_nbr           INTEGER,
  modified_date       TIMESTAMP,
  reel_yr             INTEGER,
  reel_nbr            INTEGER,
  reel_pg             INTEGER,
  file_nbr            VARCHAR(50),
  good_through_date   DATE,
  saved_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT uq_saved_pp_master UNIQUE (username, document_id)
);

-- 2) saved_personal_property_legals  (1:1 with master)
CREATE TABLE saved_personal_property_legals (
  id                  SERIAL PRIMARY KEY,
  saved_master_id     INTEGER NOT NULL 
                         REFERENCES saved_personal_property_master(id) ON DELETE CASCADE,
  record_type         CHAR(1),
  borough             INTEGER NOT NULL,
  block               INTEGER NOT NULL,
  lot                 INTEGER NOT NULL,
  easement            CHAR(1),
  partial_lot         CHAR(1),
  air_rights          CHAR(1),
  subterranean_rights CHAR(1),
  property_type       CHAR(2),
  street_number       VARCHAR(12),
  street_name         VARCHAR(32),
  addr_unit           VARCHAR(7),
  good_through_date   DATE,

  CONSTRAINT uq_saved_pp_legals_per_master UNIQUE (saved_master_id)
);
-- index BBL for lookups
CREATE INDEX ON saved_personal_property_legals (borough, block, lot);

-- 3) saved_personal_property_parties  (1–3 rows per master)
CREATE TABLE saved_personal_property_parties (
  id                  SERIAL PRIMARY KEY,
  saved_master_id     INTEGER NOT NULL 
                         REFERENCES saved_personal_property_master(id) ON DELETE CASCADE,
  party_index         INTEGER NOT NULL CHECK (party_index BETWEEN 1 AND 3),
  record_type         CHAR(1),
  party_type          CHAR(1),
  name                VARCHAR(70),
  address_1           VARCHAR(60),
  address_2           VARCHAR(60),
  country             CHAR(2),
  city                VARCHAR(30),
  state               CHAR(2),
  zip                 VARCHAR(9),
  good_through_date   DATE,

  CONSTRAINT uq_saved_pp_parties_per_master UNIQUE (saved_master_id, party_index)
);
-- index on name if needed
CREATE INDEX ON saved_personal_property_parties (name);

-- 4) saved_personal_property_references  (0 or 1 row per master)
CREATE TABLE saved_personal_property_references (
  id                    SERIAL PRIMARY KEY,
  saved_master_id       INTEGER NOT NULL 
                           REFERENCES saved_personal_property_master(id) ON DELETE CASCADE,
  record_type           CHAR(1),
  crfn                  VARCHAR(13),
  doc_id_ref            VARCHAR(16),
  file_nbr              VARCHAR(50),
  good_through_date     DATE,

  CONSTRAINT uq_saved_pp_references_per_master UNIQUE (saved_master_id)
);

-- 5) saved_personal_property_remarks  (0 or 1 row per master)
CREATE TABLE saved_personal_property_remarks (
  id                  SERIAL PRIMARY KEY,
  saved_master_id     INTEGER NOT NULL 
                         REFERENCES saved_personal_property_master(id) ON DELETE CASCADE,
  record_type         CHAR(1),
  sequence_number     INTEGER,
  remark_text         VARCHAR(232),
  good_through_date   DATE,

  CONSTRAINT uq_saved_pp_remarks_per_master UNIQUE (saved_master_id)
);
