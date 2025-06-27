-- Supabase Migration Script
-- This script recreates all tables and seeds data for Supabase
-- Run this in the Supabase SQL Editor
-- WARNING: This will drop all existing tables and data!
-- Make sure to backup your data before running this script
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

-- Note: You'll need to copy and paste the contents of each schema and seed file below
-- The \i commands don't work in Supabase, so all SQL must be inline
-- 1. SCHEMA FILES (copy contents from each file):
-- Copy contents from schema/users.sql here
-- Copy contents from schema/organizations.sql here
-- Copy contents from schema/organization_memberships.sql here
-- Copy contents from schema/acris_code_mappings_schema.sql here
-- Copy contents from schema/saved_real_property_records.sql here
-- Copy contents from schema/saved_personal_property_records.sql here
-- Copy contents from schema/saved_properties.sql here
-- Copy contents from schema/saved_party_contacts.sql here
-- Copy contents from schema/saved_party_names.sql here
-- Copy contents from schema/notes.sql here
-- 2. SEED FILES (copy contents from each file):
-- Copy contents from seed/seed_users.sql here
-- Copy contents from seed/seed_organizations.sql here
-- Copy contents from seed/seed_acris_document_control_codes.sql here
-- Copy contents from seed/seed_acris_ucc_collateral_type_codes.sql here
-- Copy contents from seed/seed_acris_property_type_codes.sql here
-- Copy contents from seed/seed_acris_usa_state_codes.sql here
-- Copy contents from seed/seed_acris_country_codes.sql here
-- Copy contents from seed/seed_user_data.sql here