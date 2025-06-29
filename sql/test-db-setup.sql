-- This creates test database with ONLY reference data, no application data
\echo 'Delete and recreate snacris_test_clean db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE IF EXISTS snacris_test_clean;
CREATE DATABASE snacris_test_clean;
\connect snacris_test_clean

-- 1. Core user and organization tables (schema only)
\i schema/users.sql
\i schema/organizations.sql
\i schema/organization_memberships.sql

-- 2. Code mapping tables
\i schema/acris_code_mappings_schema.sql

-- 4. Saved property and party tables
\i schema/saved_real_property_records.sql
\i schema/saved_personal_property_records.sql
\i schema/saved_properties.sql
\i schema/saved_party_contacts.sql
\i schema/saved_party_names.sql

-- 3. Notes and note-related tables
\i schema/notes.sql

-- ONLY seed reference data (not users/organizations)
\i seed/seed_acris_document_control_codes.sql
\i seed/seed_acris_ucc_collateral_type_codes.sql
\i seed/seed_acris_property_type_codes.sql
\i seed/seed_acris_usa_state_codes.sql
\i seed/seed_acris_country_codes.sql

-- Do NOT seed users, organizations, or user_data
-- Tests will create this data fresh
