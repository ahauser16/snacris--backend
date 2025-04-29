\echo 'Delete and recreate snacris db?'
\prompt 'Return for yes or control-C to cancel > ' foo

CREATE DATABASE snacris;
\connect snacris

\i schema/snacris-users-schema.sql
\i schema/snacris-acris-code-mappings-schema.sql
\i schema/snacris-acris-real-property-schema.sql
\i schema/snacris-acris-personal-property-schema.sql
\i join/acris-user-join-schema.sql
\i seed/snacris-seed-users.sql
\i seed/snacris-seed-acris-document-control-codes.sql
\i seed/snacris-seed-acris-ucc-collateral-type-codes.sql
\i seed/snacris-seed-acris-property-type-codes.sql
\i seed/snacris-seed-acris-usa-state-codes.sql
\i seed/snacris-seed-acris-country-codes.sql
\i seed/snacris-seed-acris-real-property.sql



