CREATE TABLE
    notes (
        id SERIAL PRIMARY KEY,
        author_username VARCHAR(25) NOT NULL REFERENCES users (username) ON DELETE CASCADE,
        content TEXT NOT NULL,
        visibility VARCHAR(16) NOT NULL CHECK (visibility IN ('private', 'public', 'org')),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL
    );

CREATE TABLE
    note_shared_with (
        note_id INTEGER NOT NULL REFERENCES notes (id) ON DELETE CASCADE,
        username VARCHAR(25) NOT NULL REFERENCES users (username) ON DELETE CASCADE,
        PRIMARY KEY (note_id, username)
    );

CREATE TABLE
    note_document_fields (
        id SERIAL PRIMARY KEY,
        note_id INTEGER NOT NULL REFERENCES notes (id) ON DELETE CASCADE,
        saved_real_property_master_id INTEGER REFERENCES saved_real_property_master (id) ON DELETE CASCADE,
        saved_personal_property_master_id INTEGER REFERENCES saved_personal_property_master (id) ON DELETE CASCADE,
        field_name VARCHAR(64) NOT NULL,
        CONSTRAINT uq_note_document_fields UNIQUE (
            note_id,
            field_name,
            saved_real_property_master_id,
            saved_personal_property_master_id
        ),
        CONSTRAINT only_one_master CHECK (
            (
                saved_real_property_master_id IS NOT NULL
                AND saved_personal_property_master_id IS NULL
            )
            OR (
                saved_real_property_master_id IS NULL
                AND saved_personal_property_master_id IS NOT NULL
            )
        )
    );

CREATE TABLE
    note_party_contacts (
        id SERIAL PRIMARY KEY,
        note_id INTEGER NOT NULL REFERENCES notes (id) ON DELETE CASCADE,
        saved_real_property_master_id INTEGER REFERENCES saved_real_property_master (id) ON DELETE CASCADE,
        saved_personal_property_master_id INTEGER REFERENCES saved_personal_property_master (id) ON DELETE CASCADE,
        name VARCHAR(70) NOT NULL,
        address_1 VARCHAR(60),
        address_2 VARCHAR(60),
        city VARCHAR(30),
        state CHAR(2),
        zip VARCHAR(9),
        country CHAR(2),
        CONSTRAINT uq_note_party_contacts UNIQUE (
            note_id,
            name,
            address_1,
            address_2,
            city,
            state,
            zip,
            country,
            saved_real_property_master_id,
            saved_personal_property_master_id
        ),
        CONSTRAINT only_one_master CHECK (
            (
                saved_real_property_master_id IS NOT NULL
                AND saved_personal_property_master_id IS NULL
            )
            OR (
                saved_real_property_master_id IS NULL
                AND saved_personal_property_master_id IS NOT NULL
            )
        )
    );

CREATE TABLE
    note_party_names (
        id SERIAL PRIMARY KEY,
        note_id INTEGER NOT NULL REFERENCES notes (id) ON DELETE CASCADE,
        saved_real_property_master_id INTEGER REFERENCES saved_real_property_master (id) ON DELETE CASCADE,
        saved_personal_property_master_id INTEGER REFERENCES saved_personal_property_master (id) ON DELETE CASCADE,
        name VARCHAR(70) NOT NULL,
        CONSTRAINT uq_note_party_names UNIQUE (
            note_id,
            name,
            saved_real_property_master_id,
            saved_personal_property_master_id
        ),
        CONSTRAINT only_one_master CHECK (
            (
                saved_real_property_master_id IS NOT NULL
                AND saved_personal_property_master_id IS NULL
            )
            OR (
                saved_real_property_master_id IS NULL
                AND saved_personal_property_master_id IS NOT NULL
            )
        )
    );

CREATE TABLE
    note_properties (
        id SERIAL PRIMARY KEY,
        note_id INTEGER NOT NULL REFERENCES notes (id) ON DELETE CASCADE,
        saved_real_property_master_id INTEGER REFERENCES saved_real_property_master (id) ON DELETE CASCADE,
        saved_personal_property_master_id INTEGER REFERENCES saved_personal_property_master (id) ON DELETE CASCADE,
        borough INTEGER,
        block INTEGER,
        lot INTEGER,
        CONSTRAINT uq_note_properties UNIQUE (
            note_id,
            borough,
            block,
            lot,
            saved_real_property_master_id,
            saved_personal_property_master_id
        ),
        CONSTRAINT only_one_master CHECK (
            (
                saved_real_property_master_id IS NOT NULL
                AND saved_personal_property_master_id IS NULL
            )
            OR (
                saved_real_property_master_id IS NULL
                AND saved_personal_property_master_id IS NOT NULL
            )
        )
    );