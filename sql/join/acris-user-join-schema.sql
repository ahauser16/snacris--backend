CREATE TABLE user_saved_real_property_master (
    id SERIAL PRIMARY KEY,
    username VARCHAR(25) REFERENCES users(username) ON DELETE CASCADE,
    master_id INTEGER REFERENCES acris_real_property_master(id) ON DELETE CASCADE,  -- Use the primary key for reference
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Add the saved_at column
    UNIQUE (username, master_id)  -- Composite unique constraint to prevent duplicate entries for the same user and document
);

CREATE TABLE admin_saved_real_property_master (
    id SERIAL PRIMARY KEY,
    admin_username VARCHAR(25) REFERENCES users(username) ON DELETE CASCADE,
    master_id INTEGER REFERENCES acris_real_property_master(id) ON DELETE CASCADE,
    visibility VARCHAR(10) NOT NULL CHECK (visibility IN ('admin', 'user', 'all')), -- This defines a column named visibility with a data type of VARCHAR(10) which cannot have `null` values and has the CHECK constraint that restricts values to `admin`, `user`, or `all`.
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (admin_username, master_id)
);

CREATE TABLE user_saved_real_property_legals (
    id SERIAL PRIMARY KEY,
    username VARCHAR(25) REFERENCES users(username) ON DELETE CASCADE,
    legals_id INTEGER REFERENCES acris_real_property_legals(id) ON DELETE CASCADE,  -- Use the primary key for reference
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Add the saved_at column
    UNIQUE (username, legals_id)
);

CREATE TABLE user_saved_real_property_parties (
    id SERIAL PRIMARY KEY,
    username VARCHAR(25) REFERENCES users(username) ON DELETE CASCADE,
    parties_id INTEGER REFERENCES acris_real_property_parties(id) ON DELETE CASCADE,  -- Use the primary key for reference
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Add the saved_at column
    UNIQUE (username, parties_id)
);

CREATE TABLE user_saved_real_property_references (
    id SERIAL PRIMARY KEY,
    username VARCHAR(25) REFERENCES users(username) ON DELETE CASCADE,
    references_id INTEGER REFERENCES acris_real_property_references(id) ON DELETE CASCADE,  -- Use the primary key for reference
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Add the saved_at column
    UNIQUE (username, references_id)
);

CREATE TABLE user_saved_real_property_remarks (
    id SERIAL PRIMARY KEY,
    username VARCHAR(25) REFERENCES users(username) ON DELETE CASCADE,
    remarks_id INTEGER REFERENCES acris_real_property_remarks(id) ON DELETE CASCADE,  -- Use the primary key for reference
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Add the saved_at column
    UNIQUE (username, remarks_id)
);

CREATE TABLE user_saved_personal_property_master (
    id SERIAL PRIMARY KEY,
    username VARCHAR(25) REFERENCES users(username) ON DELETE CASCADE,
    master_id INTEGER REFERENCES acris_personal_property_master(id) ON DELETE CASCADE,  -- Use the primary key for reference
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Add the saved_at column
    UNIQUE (username, master_id)
);

CREATE TABLE user_saved_personal_property_legals (
    id SERIAL PRIMARY KEY,
    username VARCHAR(25) REFERENCES users(username) ON DELETE CASCADE,
    legals_id INTEGER REFERENCES acris_personal_property_legals(id) ON DELETE CASCADE,  -- Use the primary key for reference
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Add the saved_at column
    UNIQUE (username, legals_id)
);

CREATE TABLE user_saved_personal_property_parties (
    id SERIAL PRIMARY KEY,
    username VARCHAR(25) REFERENCES users(username) ON DELETE CASCADE,
    parties_id INTEGER REFERENCES acris_personal_property_parties(id) ON DELETE CASCADE,  -- Use the primary key for reference
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Add the saved_at column
    UNIQUE (username, parties_id)
);

CREATE TABLE user_saved_personal_property_references (
    id SERIAL PRIMARY KEY,
    username VARCHAR(25) REFERENCES users(username) ON DELETE CASCADE,
    references_id INTEGER REFERENCES acris_personal_property_references(id) ON DELETE CASCADE,  -- Use the primary key for reference
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Add the saved_at column
    UNIQUE (username, references_id)
);

CREATE TABLE user_saved_personal_property_remarks (
    id SERIAL PRIMARY KEY,
    username VARCHAR(25) REFERENCES users(username) ON DELETE CASCADE,
    remarks_id INTEGER REFERENCES acris_personal_property_remarks(id) ON DELETE CASCADE,  -- Use the primary key for reference
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Add the saved_at column
    UNIQUE (username, remarks_id)
);