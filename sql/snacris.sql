\echo 'Delete and recreate snacris db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE IF EXISTS snacris;
CREATE DATABASE snacris;
\connect snacris

-- 1. Core user and organization tables
\i schema/users.sql
\i schema/organizations.sql
\i schema/organization_memberships.sql

-- 2. Notes and note-related tables
\i schema/notes.sql
\i schema/note_shared_with.sql
\i schema/note_document_fields.sql
\i schema/note_party_contacts.sql
\i schema/note_party_names.sql
\i schema/note_properties.sql

-- 3. Code mapping tables
\i schema/acris_code_mappings_schema.sql

-- 4. Saved property and party tables
\i schema/saved_real_property_records.sql
\i schema/saved_personal_property_records.sql
\i schema/saved_properties.sql
\i schema/saved_party_contacts.sql
\i schema/saved_party_names.sql

-- 5. Seed users and organizations (must come before memberships)
\i seed/seed_users.sql
\i seed/seed_organizations.sql

-- 6. Code mapping seed data
\i seed/seed_acris_document_control_codes.sql
\i seed/seed_acris_ucc_collateral_type_codes.sql
\i seed/seed_acris_property_type_codes.sql
\i seed/seed_acris_usa_state_codes.sql
\i seed/seed_acris_country_codes.sql

-- 7. User data seed (saved properties, party contacts, etc.)
\i seed/seed_user_data.sql

\echo 'Delete and recreate snacris_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE IF EXISTS snacris_test;
CREATE DATABASE snacris_test;
\connect snacris_test

-- Repeat the same order for the test database
\i schema/users.sql
\i schema/organizations.sql
\i schema/organization_memberships.sql

\i schema/notes.sql
\i schema/note_shared_with.sql
\i schema/note_document_fields.sql
\i schema/note_party_contacts.sql
\i schema/note_party_names.sql
\i schema/note_properties.sql

\i schema/acris_code_mappings_schema.sql

\i schema/saved_real_property_records.sql
\i schema/saved_personal_property_records.sql
\i schema/saved_properties.sql
\i schema/saved_party_contacts.sql
\i schema/saved_party_names.sql

\i seed/seed_users.sql
\i seed/seed_organizations.sql

\i seed/seed_acris_document_control_codes.sql
\i seed/seed_acris_ucc_collateral_type_codes.sql
\i seed/seed_acris_property_type_codes.sql
\i seed/seed_acris_usa_state_codes.sql
\i seed/seed_acris_country_codes.sql

\i seed/seed_user_data.sql