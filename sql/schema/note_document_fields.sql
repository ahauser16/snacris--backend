CREATE TABLE
    note_document_fields (
        note_id INTEGER NOT NULL REFERENCES notes (id) ON DELETE CASCADE,
        saved_real_property_master_id INTEGER REFERENCES saved_real_property_master (id) ON DELETE CASCADE,
        saved_personal_property_master_id INTEGER REFERENCES saved_personal_property_master (id) ON DELETE CASCADE,
        field_name VARCHAR(64) NOT NULL,
        PRIMARY KEY (
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

CREATE INDEX idx_note_document_fields_docid ON note_document_fields (
    saved_real_property_master_id,
    saved_personal_property_master_id
);