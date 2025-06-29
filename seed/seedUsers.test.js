"use strict";

const db = require("../db.js");

/**
 * Tests for seeded application data (users, organizations)
 * These tests verify that the application data was seeded correctly
 */

afterAll(function () {
  // Close the database pool only if it hasn't been closed already
  if (db && db.end && !db.ended) {
    db.end();
  }
});

/************************************** Users */

describe("Seeded Users", function () {
  test("has expected test users", async function () {
    const result = await db.query(`
      SELECT username, first_name, last_name, email, is_admin 
      FROM users 
      WHERE username IN ('testuser', 'testadmin')
      ORDER BY username
    `);

    expect(result.rows).toHaveLength(2);
    expect(result.rows).toEqual([
      {
        username: "testadmin",
        first_name: "Test",
        last_name: "Admin",
        email: "tadmin@example.com",
        is_admin: true,
      },
      {
        username: "testuser",
        first_name: "Test",
        last_name: "User",
        email: "tuser@example.com",
        is_admin: false,
      },
    ]);
  });

  test("passwords are properly hashed", async function () {
    const result = await db.query("SELECT username, password FROM users");

    for (let user of result.rows) {
      expect(user.password).toMatch(/^\$2b\$\d+\$/); // bcrypt hash format
      expect(user.password).not.toBe("password"); // Not plain text
    }
  });

  test("emails are unique", async function () {
    const result = await db.query(`
      SELECT email, COUNT(*) as count 
      FROM users 
      GROUP BY email 
      HAVING COUNT(*) > 1
    `);

    expect(result.rows).toHaveLength(0); // No duplicate emails
  });
});

/************************************** Organizations */

describe("Seeded Organizations", function () {
  test("has expected organizations", async function () {
    const result = await db.query(
      "SELECT COUNT(*) as count FROM organizations"
    );
    expect(parseInt(result.rows[0].count)).toBe(3);
  });

  test("organizations have required fields", async function () {
    const result = await db.query(`
      SELECT id, name, description 
      FROM organizations 
      WHERE name IS NULL OR name = ''
    `);

    expect(result.rows).toHaveLength(0); // All orgs should have names
  });
});

/************************************** Data Integrity */

describe("Seeded Data Integrity", function () {
  test("saved tables start empty", async function () {
    const tables = [
      "saved_real_property_master",
      "saved_personal_property_master",
      "saved_party_names",
      "saved_party_contacts",
      "saved_properties",
    ];

    for (let table of tables) {
      const result = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
      expect(parseInt(result.rows[0].count)).toBe(0);
    }
  });

  test("reference tables are populated", async function () {
    const referenceTables = [
      "country_codes",
      "state_codes",
      "document_control_codes",
      "property_type_codes",
      "ucc_collateral_codes",
    ];

    for (let table of referenceTables) {
      const result = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
      expect(parseInt(result.rows[0].count)).toBeGreaterThan(0);
    }
  });
});
