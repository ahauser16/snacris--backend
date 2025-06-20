-- 1. Saved Real Property Record #1 for testadmin
INSERT INTO saved_real_property_master (
    username, document_id, record_type, recorded_borough, doc_type, document_amt, recorded_datetime, modified_date, reel_yr, reel_nbr, reel_pg, percent_trans, good_through_date
) VALUES (
    'testadmin', 'FT_1940007464394', 'A', 1, 'DECL', 0, '2000-12-22 00:00:00', '2001-01-08 00:00:00', 2000, 3211, 419, 0, '2015-07-31'
);

-- 2. Saved Personal Property Record #1 for testadmin
INSERT INTO saved_personal_property_master (
    username, document_id, record_type, recorded_borough, doc_type, document_amt, recorded_datetime, ucc_collateral, rpttl_nbr, modified_date, reel_yr, reel_nbr, reel_pg, file_nbr, good_through_date
) VALUES (
    'testadmin', 'FT_1010007992401', 'A', 1, 'AMND', 0, '2002-02-06 00:00:00', 'C', 0, '2002-02-06 00:00:00', 0, 0, 0, '02PN03283', '2015-07-31'
);

-- 3. Saved Properties for testadmin (associate with real property master_id 1)
INSERT INTO saved_properties (username, borough, block, lot, saved_real_property_master_id)
VALUES
  ('testadmin', 1, 62, 1, 1),
  ('testadmin', 1, 835, 41, 1),
  ('testadmin', 1, 1134, 1, 1);

-- 4. Saved Party Contacts for testadmin (associate with real property master_id 1)
INSERT INTO saved_party_contacts (username, name, address_1, address_2, city, state, country, zip, saved_real_property_master_id)
VALUES
  ('testadmin', 'AMERICAN INTERNATIONAL GROUP, INC.', '70 PINE STREET', '', 'New York', 'NY', 'US', '10270', 1),
  ('testadmin', 'NEW YORK CITY ECONOMIC DEVELOPMENT CORPORATION', 'ONE LIBERTY PLAZA', '', 'New York', 'NY', 'US', '10006', 1),
  ('testadmin', 'NEW YORK CITY ECONOMIC DEVELOPMENT CORPORATION', '110 WILLIAM STREET', '', 'New York', 'NY', 'US', '10038', 1);

-- 5. Saved Party Names for testadmin (associate with real property master_id 1)
INSERT INTO saved_party_names (username, name, saved_real_property_master_id)
VALUES
  ('testadmin', 'AMERICAN INTERNATIONAL GROUP, INC.', 1),
  ('testadmin', 'AMERICAN INTERNATIONAL GROUP', 1),
  ('testadmin', 'NEW YORK CITY ECONOMIC DEVELOPMENT CORPORATION', 1),
  ('testadmin', 'NEW YORK CITY LAND DEVELOPMENT CORPORATION', 1),
  ('testadmin', 'THE CITY OF NEW YORK', 1);

-- 6. Saved Real Property Legals for master_id 1
INSERT INTO saved_real_property_legals (
    saved_master_id, record_type, borough, block, lot, easement, partial_lot, air_rights, subterranean_rights, property_type, good_through_date
) VALUES
  (1, 'L', 1, 62, 1012, 'N', 'E', 'N', 'N', 'PA', '2015-07-31'),
  (1, 'L', 1, 62, 1009, 'N', 'E', 'N', 'N', 'PA', '2015-07-31'),
  (1, 'L', 1, 62, 1,    'N', 'E', 'N', 'N', 'PA', '2015-07-31'),
  (1, 'L', 1, 62, 1014, 'N', 'E', 'N', 'N', 'PA', '2015-07-31'),
  (1, 'L', 1, 62, 1007, 'N', 'E', 'N', 'N', 'PA', '2015-07-31'),
  (1, 'L', 1, 62, 1001, 'N', 'E', 'N', 'N', 'PA', '2015-07-31'),
  (1, 'L', 1, 62, 1013, 'N', 'E', 'N', 'N', 'PA', '2015-07-31'),
  (1, 'L', 1, 62, 1006, 'N', 'E', 'N', 'N', 'PA', '2015-07-31'),
  (1, 'L', 1, 62, 1015, 'N', 'E', 'N', 'N', 'PA', '2015-07-31'),
  (1, 'L', 1, 62, 1010, 'N', 'E', 'N', 'N', 'PA', '2015-07-31'),
  (1, 'L', 1, 62, 1011, 'N', 'E', 'N', 'N', 'PA', '2015-07-31'),
  (1, 'L', 1, 62, 1003, 'N', 'E', 'N', 'N', 'PA', '2015-07-31'),
  (1, 'L', 1, 62, 1008, 'N', 'E', 'N', 'N', 'PA', '2015-07-31'),
  (1, 'L', 1, 62, 1005, 'N', 'E', 'N', 'N', 'PA', '2015-07-31'),
  (1, 'L', 1, 62, 1004, 'N', 'E', 'N', 'N', 'PA', '2015-07-31'),
  (1, 'L', 1, 62, 1002, 'N', 'E', 'N', 'N', 'PA', '2015-07-31');

-- 7. Saved Real Property Parties for master_id 1
INSERT INTO saved_real_property_parties (
    saved_master_id, party_index, record_type, party_type, name, good_through_date
) VALUES
  (1, 1, 'P', '1', 'ONE LIBERTY PLAZA CONDOMINIUM', '2015-07-31');

-- 8. Saved Real Property Remarks for master_id 1
INSERT INTO saved_real_property_remarks (
    saved_master_id, record_type, sequence_number, remark_text, good_through_date
) VALUES
  (1, 'R', 1, 'DECLARATION CONDO NO. 1178 MAP #5770 BLOCK 62 FKA LOT 1 NKA LOTS 1001-1015', '2015-07-31');

-- 9. Saved Personal Property Legals for master_id 1
INSERT INTO saved_personal_property_legals (
    saved_master_id, record_type, borough, block, lot, easement, partial_lot, air_rights, subterranean_rights, property_type, street_number, street_name, good_through_date
) VALUES
  (1, 'L', 1, 548, 24, 'N', 'E', 'N', 'N', 'PA', '258', 'WAVERLY PLACE', '2015-07-31');

-- 10. Saved Personal Property Parties for master_id 1
INSERT INTO saved_personal_property_parties (
    saved_master_id, party_index, record_type, party_type, name, address_1, country, city, state, zip, good_through_date
) VALUES
  (1, 1, 'P', '2', 'U.S. TRUST MORTGAGESERVICE COMPANY', '190  CONGRESS PARK DRIVE', 'US', 'DELRAY BEACH', 'FL', '33445', '2015-07-31'),
  (1, 2, 'P', '1', 'MCMURRY, MELONEY LAMBERT', '303  MERCER ST', 'US', 'NY', 'NY', '10013', '2015-07-31'),
  (1, 3, 'P', '1', 'MCMURRY, DAVID ANDREW', '303  MERCER ST', 'US', 'NY', 'NY', '10013', '2015-07-31');

-- 11. Saved Personal Property References for master_id 1
INSERT INTO saved_personal_property_references (
    saved_master_id, record_type, doc_id_ref, file_nbr, good_through_date
) VALUES
  (1, 'X', 'FT_1660007932766', '01PN44948', '2015-07-31'),
  (1, 'X', 'FT_1770007992377', '02PN03280', '2015-07-31'),
  (1, 'X', 'FT_1840007992384', '02PN03281', '2015-07-31'),
  (1, 'X', 'FT_1620008088162', '02PN08865', '2015-07-31');

-- 12. Notes for testadmin's saved data
INSERT INTO notes (author_username, content, visibility)
VALUES
  ('testadmin', 'NYCEDC HQ', 'private'),                    -- 1
  ('testadmin', 'Empire State Building', 'private'),        -- 2
  ('testadmin', 'Lincoln Center For The Performing Arts', 'private'), -- 3
  ('testadmin', 'My first job', 'private'),                 -- 4
  ('testadmin', 'Current Address', 'private'),              -- 5
  ('testadmin', 'Prior Address', 'private'),                -- 6
  ('testadmin', 'Conduit Fee Title Issuer', 'private'),     -- 7
  ('testadmin', 'Original Fee Title Holder', 'private'),    -- 8
  ('testadmin', '13th floor is included in this tax lot', 'private'), -- 9
  ('testadmin', 'this is just an example', 'private');      -- 10

-- 13. Associate notes with saved_properties
INSERT INTO note_properties (note_id, borough, block, lot, saved_real_property_master_id)
VALUES
  (1, 1, 62, 1, 1),      -- NYCEDC HQ
  (2, 1, 835, 41, 1),    -- Empire State Building
  (3, 1, 1134, 1, 1);    -- Lincoln Center For The Performing Arts

-- 14. Associate notes with saved_party_contacts
INSERT INTO note_party_contacts (note_id, name, address_1, address_2, city, state, zip, country, saved_real_property_master_id)
VALUES
  (4, 'AMERICAN INTERNATIONAL GROUP, INC.', '70 PINE STREET', '', 'New York', 'NY', '10270', 'US', 1), -- My first job
  (5, 'NEW YORK CITY ECONOMIC DEVELOPMENT CORPORATION', 'ONE LIBERTY PLAZA', '', 'New York', 'NY', '10006', 'US', 1), -- Current Address
  (6, 'NEW YORK CITY ECONOMIC DEVELOPMENT CORPORATION', '110 WILLIAM STREET', '', 'New York', 'NY', '10038', 'US', 1); -- Prior Address

-- 15. Associate notes with saved_party_names
INSERT INTO note_party_names (note_id, name, saved_real_property_master_id)
VALUES
  (7, 'NEW YORK CITY LAND DEVELOPMENT CORPORATION', 1), -- Conduit Fee Title Issuer
  (8, 'THE CITY OF NEW YORK', 1);                      -- Original Fee Title Holder

-- 16. Associate note with a specific real property legal (lot 1001, master_id 1)
INSERT INTO note_properties (note_id, borough, block, lot, saved_real_property_master_id)
VALUES
  (9, 1, 62, 1001, 1);

-- 17. Associate note with a specific personal property master record (master_id 1)
INSERT INTO note_document_fields (note_id, saved_personal_property_master_id, field_name)
VALUES
  (10, 1, 'document_id');