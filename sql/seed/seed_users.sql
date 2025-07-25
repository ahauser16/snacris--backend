-- snacris-seed-users.sql
-- both test users have the password "password"
INSERT INTO
    users (
        username,
        password,
        first_name,
        last_name,
        email,
        is_admin
    )
VALUES
    (
        'testuser',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test',
        'User',
        'tuser@example.com',
        FALSE
    ),
    (
        'testadmin',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test',
        'Admin',
        'tadmin@example.com',
        TRUE
    );