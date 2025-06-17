CREATE TABLE
    note_shared_with (
        note_id INTEGER NOT NULL REFERENCES notes (id) ON DELETE CASCADE,
        username VARCHAR(25) NOT NULL REFERENCES users (username) ON DELETE CASCADE,
        PRIMARY KEY (note_id, username)
    );