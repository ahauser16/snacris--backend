CREATE TABLE document_control_codes (
    id SERIAL PRIMARY KEY,
    record_type CHAR(1) NOT NULL,
    doc_type VARCHAR(8) UNIQUE NOT NULL,
    doc_type_description VARCHAR(30),
    class_code_description VARCHAR(30),
    party1_type VARCHAR(20),
    party2_type VARCHAR(20),
    party3_type VARCHAR(20)
);

CREATE TABLE ucc_collateral_codes (
    id SERIAL PRIMARY KEY,
    record_type CHAR(1) NOT NULL,
    ucc_collateral_code CHAR(1) UNIQUE NOT NULL,
    description VARCHAR(50)
);

CREATE TABLE property_type_codes (
    id SERIAL PRIMARY KEY,
    record_type CHAR(1) NOT NULL,
    property_type CHAR(2) UNIQUE NOT NULL,
    description VARCHAR(40)
);

CREATE TABLE state_codes (
    id SERIAL PRIMARY KEY,
    record_type CHAR(1) NOT NULL,
    state_code CHAR(2) UNIQUE NOT NULL,
    description VARCHAR(20)
);

CREATE TABLE country_codes (
    id SERIAL PRIMARY KEY,
    record_type CHAR(1) NOT NULL,
    country_code CHAR(2) UNIQUE NOT NULL,
    description VARCHAR(20)
);