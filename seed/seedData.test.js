"use strict";

const db = require("../db.js");

/**
 * Tests for seeded reference data (ACRIS code mappings)
 * These tests verify that the reference data was seeded correctly
 * and is accessible to the application
 */

// Set longer timeout for database operations
jest.setTimeout(10000);

afterAll(async function () {
  await db.end();
});

/************************************** Country Codes */

describe("Country Codes Seed Data", function () {
  test("has expected number of countries", async function () {
    const result = await db.query(
      "SELECT COUNT(*)::int as count FROM country_codes"
    );
    expect(result.rows[0].count).toBeGreaterThan(200); // Should have ~250 countries
  });

  test("contains major countries", async function () {
    const result = await db.query(`
      SELECT country_code, description 
      FROM country_codes 
      WHERE country_code IN ('US', 'CA', 'MX', 'GB', 'FR', 'DE')
      ORDER BY country_code
    `);

    expect(result.rows.length).toBeGreaterThan(0);

    // Check for US specifically
    const usCountry = result.rows.find((row) => row.country_code === "US");
    expect(usCountry).toBeDefined();
  });
});
