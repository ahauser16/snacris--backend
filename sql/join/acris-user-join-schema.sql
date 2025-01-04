CREATE TABLE user_saved_real_property_master (
    id SERIAL PRIMARY KEY,
    username VARCHAR(25) REFERENCES users(username),
    document_id VARCHAR(16) REFERENCES acris_real_property_master(document_id),
    UNIQUE (username, document_id)
);

CREATE TABLE user_saved_real_property_legals (
    id SERIAL PRIMARY KEY,
    username VARCHAR(25) REFERENCES users(username),
    document_id VARCHAR(16) REFERENCES acris_real_property_legals(document_id),
    UNIQUE (username, document_id)
);

CREATE TABLE user_saved_real_property_parties (
    id SERIAL PRIMARY KEY,
    username VARCHAR(25) REFERENCES users(username),
    document_id VARCHAR(16) REFERENCES acris_real_property_parties(document_id),
    UNIQUE (username, document_id)
);

CREATE TABLE user_saved_real_property_references (
    id SERIAL PRIMARY KEY,
    username VARCHAR(25) REFERENCES users(username),
    document_id VARCHAR(16) REFERENCES acris_real_property_references(document_id),
    UNIQUE (username, document_id)
);

CREATE TABLE user_saved_real_property_remarks (
    id SERIAL PRIMARY KEY,
    username VARCHAR(25) REFERENCES users(username),
    document_id VARCHAR(16) REFERENCES acris_real_property_remarks(document_id),
    UNIQUE (username, document_id)
);

CREATE TABLE user_saved_personal_property_master (
    id SERIAL PRIMARY KEY,
    username VARCHAR(25) REFERENCES users(username),
    document_id VARCHAR(16) REFERENCES acris_personal_property_master(document_id),
    UNIQUE (username, document_id)
);

CREATE TABLE user_saved_personal_property_legals (
    id SERIAL PRIMARY KEY,
    username VARCHAR(25) REFERENCES users(username),
    document_id VARCHAR(16) REFERENCES acris_personal_property_legals(document_id),
    UNIQUE (username, document_id)
);

CREATE TABLE user_saved_personal_property_parties (
    id SERIAL PRIMARY KEY,
    username VARCHAR(25) REFERENCES users(username),
    document_id VARCHAR(16) REFERENCES acris_personal_property_parties(document_id),
    UNIQUE (username, document_id)
);

CREATE TABLE user_saved_personal_property_references (
    id SERIAL PRIMARY KEY,
    username VARCHAR(25) REFERENCES users(username),
    document_id VARCHAR(16) REFERENCES acris_personal_property_references(document_id),
    UNIQUE (username, document_id)
);

CREATE TABLE user_saved_personal_property_remarks (
    id SERIAL PRIMARY KEY,
    username VARCHAR(25) REFERENCES users(username),
    document_id VARCHAR(16) REFERENCES acris_personal_property_remarks(document_id),
    UNIQUE (username, document_id)
);