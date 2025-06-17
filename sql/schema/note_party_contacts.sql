CREATE TABLE
    note_party_contacts (
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
        PRIMARY KEY (
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

CREATE INDEX idx_note_party_contacts_name ON note_party_contacts (name);