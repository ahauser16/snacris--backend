CREATE TABLE
    note_properties (
        note_id INTEGER NOT NULL REFERENCES notes (id) ON DELETE CASCADE,
        saved_real_property_master_id INTEGER REFERENCES saved_real_property_master (id) ON DELETE CASCADE,
        saved_personal_property_master_id INTEGER REFERENCES saved_personal_property_master (id) ON DELETE CASCADE,
        borough INTEGER,
        block INTEGER,
        lot INTEGER,
        PRIMARY KEY (
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

CREATE INDEX idx_note_properties_bbl ON note_properties (borough, block, lot);