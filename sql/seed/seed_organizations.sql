-- Insert organizations
INSERT INTO
    organizations (name, description, created_by)
VALUES
    (
        'NEW YORK CITY ECONOMIC DEVELOPMENT CORPORATION',
        'NEW YORK CITY ECONOMIC DEVELOPMENT CORPORATION is looking for new members! This entity is involved in economic development on all levels. This is a test update.',
        'testadmin'
    ),
    (
        'BUILD NYC RESOURCE CORPORATION',
        'BUILD NYC RESOURCE CORPORATION is looking for new members! This entity provides tax exempt financing for not-for-profits such as charter schools and hospitals.',
        'testadmin'
    ),
    (
        'NEW YORK CITY INDUSTRIAL DEVELOPMENT AGENCY',
        'NEW YORK CITY INDUSTRIAL DEVELOPMENT AGENCY is looking for new members! This entity provides tax exempt financing for industrial companies.',
        'testadmin'
    ),
    (
        'Brooklyn Bondsmen',
        'Brooklyn Bondsmen is looking for new members!',
        'testadmin'
    ),
    (
        'Queens Quitclaimers',
        'Queens Quitclaimers is looking for new members!',
        'testadmin'
    ),
    (
        'Manhattan Mortgagors',
        'Manhattan Mortgagors is looking for new members!',
        'testadmin'
    ),
    (
        'Staten Island Deed Collective',
        'Staten Island Deed Collective is looking for new members!',
        'testadmin'
    ),
    (
        'Bronx Easement Collective',
        'Bronx Easement Collective is looking for new members!',
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