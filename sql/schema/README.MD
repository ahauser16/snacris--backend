# Schema Notes

## Save a Note (Private, Public and Hybrid visibility options)
Below is one way to fold “Notes” (with field-level attachments) and per-note visibility rules into your existing schema. You’ll see:

1. Allowing a note to exist without “saving” the associated record first.
2. Supporting three visibility modes + ad-hoc sharing with any user
3. A minimal `organizations` table + organization_id on users
4. A `notes` table, with an enum-style visibility column
5. A `note_shared_with` table for “private/shared-with”
6. Four small join-tables that let one note attach to any combination of:
   - `note_document_fields` table - used to create a note associated with a record’s specific field (e.g. recorded_datetime)
   - `note_properties` table - a saved property
   - `note_party_names` table - a saved party name
   - `note_party_contacts` table - a saved party contact

### How it all fits together

1. Creating a note
   - Insert into notes with `author_username`, `content`, and `chosen visibility`.
   - If `visibility = 'shared-with'`, INSERT into `note_shared_with` one row per target username.
2. Attaching it
   - For a document-field note: insert one row into `note_saved_document_fields` with the `field_name` (e.g. '`recorded_datetime`').
   - For a property note: insert into `note_properties`.
   - For a party-name or party-contact note: insert into `note_party_names` or `note_party_contacts`.
3. Enforcing visibility on SELECT: This single WHERE clause covers all four visibility modes.

```sql
--
-- 4. Visibility‐enforcement SELECT
--
-- :current_user and :my_org_id are your session variables.

SELECT n.*
  FROM notes            AS n
  LEFT JOIN note_shared_with sw
    ON sw.note_id = n.id
   AND sw.username = :current_user
  JOIN users author
    ON author.username = n.author_username
 WHERE
     -- I wrote it
     n.author_username = :current_user

  OR -- It's explicitly public
     n.visibility = 'public'

  OR -- It's org-wide and I'm in that org
     ( n.visibility = 'org'
       AND author.organization_id = :my_org_id
     )

  OR -- It's privately shared with me
     sw.username IS NOT NULL
;
```