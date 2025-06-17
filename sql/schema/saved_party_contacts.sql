CREATE TABLE
    saved_party_contacts (
        id SERIAL PRIMARY KEY,
        username VARCHAR(25) NOT NULL REFERENCES users (username) ON DELETE CASCADE,
        -- Polymorphic association
        saved_real_property_master_id INTEGER REFERENCES saved_real_property_master (id) ON DELETE CASCADE,
        saved_personal_property_master_id INTEGER REFERENCES saved_personal_property_master (id) ON DELETE CASCADE,
        name VARCHAR(70) NOT NULL,
        address_1 VARCHAR(60),
        address_2 VARCHAR(60),
        city VARCHAR(30),
        state CHAR(2),
        zip VARCHAR(9),
        country CHAR(2),
        saved_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_saved_party_contact_per_user UNIQUE (
            username,
            name,
            address_1,
            address_2,
            city,
            state,
            zip,
            country
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

CREATE INDEX idx_saved_party_contacts_name ON saved_party_contacts (name);