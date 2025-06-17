CREATE TABLE
    organization_memberships (
        id SERIAL PRIMARY KEY,
        organization_id INTEGER NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
        username VARCHAR(25) NOT NULL REFERENCES users (username) ON DELETE CASCADE,
        role VARCHAR(20) NOT NULL DEFAULT 'member', -- 'officer', 'admin', 'member', etc.
        status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
        requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        approved_at TIMESTAMP,
        approved_by VARCHAR(25) REFERENCES users (username),
        UNIQUE (organization_id, username)
    );