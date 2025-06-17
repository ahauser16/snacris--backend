CREATE TABLE
    saved_properties (
        id SERIAL PRIMARY KEY,
        username VARCHAR(25) NOT NULL REFERENCES users (username) ON DELETE CASCADE,
        borough INTEGER,
        block INTEGER,
        lot INTEGER,
        saved_real_property_master_id INTEGER REFERENCES saved_real_property_master (id) ON DELETE CASCADE,
        saved_personal_property_master_id INTEGER REFERENCES saved_personal_property_master (id) ON DELETE CASCADE,
        saved_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_saved_property_per_user UNIQUE (
            username,
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

CREATE INDEX idx_saved_locations_bbl ON saved_properties (borough, block, lot);