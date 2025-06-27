-- Supabase Database Reset Script
-- This script drops and recreates all tables and data for your Supabase database
-- Run this with: psql "your-connection-string" -f supabase-reset.sql

-- WARNING: This will drop all existing tables and data!
-- Make sure you have a backup if needed

\echo 'This will drop and recreate all tables in your Supabase database.'
\echo 'Press Ctrl+C to cancel, or Enter to continue...'
\prompt 'Continue? ' confirm

-- Drop all tables in reverse dependency order to avoid foreign key conflicts
DROP TABLE IF EXISTS organization_memberships CASCADE;
DROP TABLE IF EXISTS saved_user_data CASCADE;
DROP TABLE IF EXISTS saved_party_names CASCADE;
DROP TABLE IF EXISTS saved_party_contacts CASCADE;
DROP TABLE IF EXISTS saved_properties CASCADE;
DROP TABLE IF EXISTS saved_personal_property_records CASCADE;
DROP TABLE IF EXISTS saved_real_property_records CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS acris_country_codes CASCADE;
DROP TABLE IF EXISTS acris_usa_state_codes CASCADE;
DROP TABLE IF EXISTS acris_property_type_codes CASCADE;
DROP TABLE IF EXISTS acris_ucc_collateral_type_codes CASCADE;
DROP TABLE IF EXISTS acris_document_control_codes CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS users CASCADE;

\echo 'Dropped existing tables. Creating schema...'

-- 1. Core user and organization tables
\i schema/users.sql
\i schema/organizations.sql
\i schema/organization_memberships.sql

-- 2. Code mapping tables
\i schema/acris_code_mappings_schema.sql

-- 3. Saved property and party tables
\i schema/saved_real_property_records.sql
\i schema/saved_personal_property_records.sql
\i schema/saved_properties.sql
\i schema/saved_party_contacts.sql
\i schema/saved_party_names.sql

-- 4. Notes and note-related tables
\i schema/notes.sql

\echo 'Schema created. Inserting seed data...'

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

\echo 'Database reset complete!'
