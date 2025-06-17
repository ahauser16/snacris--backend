CREATE TABLE
  saved_party_names (
    id SERIAL PRIMARY KEY,
    username VARCHAR(25) NOT NULL REFERENCES users (username) ON DELETE CASCADE,
    name VARCHAR(70) NOT NULL,
    saved_real_property_master_id INTEGER REFERENCES saved_real_property_master (id) ON DELETE CASCADE,
    saved_personal_property_master_id INTEGER REFERENCES saved_personal_property_master (id) ON DELETE CASCADE,
    saved_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_saved_party_name_per_user UNIQUE (
      username,
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

CREATE INDEX idx_saved_party_names_name ON saved_party_names (name);