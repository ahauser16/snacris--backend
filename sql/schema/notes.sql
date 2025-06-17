CREATE TABLE
    notes (
        id SERIAL PRIMARY KEY,
        author_username VARCHAR(25) NOT NULL REFERENCES users (username) ON DELETE CASCADE,
        content TEXT NOT NULL,
        visibility VARCHAR(16) NOT NULL CHECK (visibility IN ('private', 'public', 'org')),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL
    );