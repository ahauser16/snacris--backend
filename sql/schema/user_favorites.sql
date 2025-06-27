-- 1) Simple list of names
CREATE TABLE saved_party_names (
  id        SERIAL PRIMARY KEY,
  username  VARCHAR(25) NOT NULL
              REFERENCES users(username) ON DELETE CASCADE,
  name      VARCHAR(70) NOT NULL,
  saved_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Prevent saving the same name twice
  CONSTRAINT uq_saved_party_names_per_user UNIQUE (username, name)
);
CREATE INDEX idx_saved_party_names_name ON saved_party_names(name);


-- 2) Full contact entries
CREATE TABLE saved_party_contacts (
  id         SERIAL PRIMARY KEY,
  username   VARCHAR(25) NOT NULL
               REFERENCES users(username) ON DELETE CASCADE,
  name       VARCHAR(70) NOT NULL,
  address_1  VARCHAR(60),
  address_2  VARCHAR(60),
  city       VARCHAR(30),
  state      CHAR(2),
  zip        VARCHAR(9),
  country    CHAR(2),
  saved_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Prevent exact duplicate contact entries
  CONSTRAINT uq_saved_party_contacts_per_user UNIQUE (
    username, name, address_1, address_2, city, state, zip, country
  )
);
CREATE INDEX idx_saved_party_contacts_name ON saved_party_contacts(name);


-- 3) Favorite BBL (borough–block–lot)
CREATE TABLE saved_properties (
  id        SERIAL PRIMARY KEY,
  username  VARCHAR(25) NOT NULL
              REFERENCES users(username) ON DELETE CASCADE,
  borough   INTEGER NOT NULL,
  block     INTEGER NOT NULL,
  lot       INTEGER NOT NULL,
  saved_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Prevent saving the same BBL twice
  CONSTRAINT uq_saved_properties_per_user UNIQUE (username, borough, block, lot)
);
CREATE INDEX idx_saved_properties_bbl ON saved_properties(borough, block, lot);
