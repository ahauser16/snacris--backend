CREATE TABLE acris_real_property_master (
    document_id VARCHAR(16) PRIMARY KEY,
    record_type CHAR(1) NOT NULL,
    crfn VARCHAR(13),
    recorded_borough INTEGER,
    doc_type VARCHAR(8) REFERENCES document_control(doc_type),
    document_date DATE,
    document_amt NUMERIC(16, 2),
    recorded_datetime TIMESTAMP,
    modified_date DATE,
    reel_yr INTEGER,
    reel_nbr INTEGER,
    reel_pg INTEGER,
    percent_trans NUMERIC(9, 6),
    good_through_date DATE
);

CREATE TABLE acris_real_property_legals (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(16) REFERENCES acris_real_property_master(document_id),
    record_type CHAR(1) NOT NULL,
    borough INTEGER,
    block INTEGER,
    lot INTEGER,
    easement CHAR(1),
    partial_lot CHAR(1),
    air_rights CHAR(1),
    subterranean_rights CHAR(1),
    property_type CHAR(2) REFERENCES property_type_record(property_type),
    street_number VARCHAR(12),
    street_name VARCHAR(32),
    unit_address VARCHAR(7),
    good_through_date DATE
);

CREATE TABLE acris_real_property_parties (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(16) REFERENCES acris_real_property_master(document_id),
    record_type CHAR(1) NOT NULL,
    party_type CHAR(1),
    name VARCHAR(70),
    address_1 VARCHAR(60),
    address_2 VARCHAR(60),
    country CHAR(2) REFERENCES country_type_record(country_code),
    city VARCHAR(30),
    state CHAR(2) REFERENCES state_codes(state_code),
    zip VARCHAR(9),
    good_through_date DATE
);

CREATE TABLE acris_real_property_references (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(16) REFERENCES acris_real_property_master(document_id),
    record_type CHAR(1) NOT NULL,
    reference_by_crfn VARCHAR(13),
    reference_by_doc_id VARCHAR(16),
    reference_by_reel_year INTEGER,
    reference_by_reel_borough INTEGER,
    reference_by_reel_nbr INTEGER,
    reference_by_reel_page INTEGER,
    good_through_date DATE
);

CREATE TABLE acris_real_property_remarks (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(16) REFERENCES acris_real_property_master(document_id),
    record_type CHAR(1) NOT NULL,
    sequence_number INTEGER,
    remark_text VARCHAR(232),
    good_through_date DATE
);

CREATE INDEX idx_acris_real_property_legals_document_id ON acris_real_property_legals(document_id);
CREATE INDEX idx_acris_real_property_parties_document_id ON acris_real_property_parties(document_id);
CREATE INDEX idx_acris_real_property_references_document_id ON acris_real_property_references(document_id);
CREATE INDEX idx_acris_real_property_remarks_document_id ON acris_real_property_remarks(document_id);