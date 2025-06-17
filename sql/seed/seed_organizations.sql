-- Insert organizations
INSERT INTO
    organizations (name, description, created_by)
VALUES
    (
        'NEW YORK CITY ECONOMIC DEVELOPMENT CORPORATION',
        NULL,
        'testadmin'
    ),
    (
        'BUILD NYC RESOURCE CORPORATION',
        NULL,
        'testadmin'
    ),
    (
        'NEW YORK CITY INDUSTRIAL DEVELOPMENT AGENCY',
        NULL,
        'testadmin'
    );

-- Insert memberships (assuming organization IDs are 1, 2, 3 and 'testadmin' exists)
INSERT INTO
    organization_memberships (
        organization_id,
        username,
        role,
        status,
        approved_at,
        approved_by
    )
VALUES
    (
        1,
        'testadmin',
        'officer',
        'approved',
        CURRENT_TIMESTAMP,
        'testadmin'
    ),
    (
        2,
        'testadmin',
        'officer',
        'approved',
        CURRENT_TIMESTAMP,
        'testadmin'
    ),
    (
        3,
        'testadmin',
        'officer',
        'approved',
        CURRENT_TIMESTAMP,
        'testadmin'
    );