const bcrypt = require("bcrypt");
const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

const testJobIds = [];

async function commonBeforeAll() {
  // DON'T delete reference data (country_codes, etc.) - keep seeded data
  // DON'T delete users/organizations - use the seeded ones

  // Only clean APPLICATION-SPECIFIC data that tests will create
  await db.query("DELETE FROM saved_real_property_master");
  await db.query("DELETE FROM saved_personal_property_master");
  await db.query("DELETE FROM saved_party_names");
  await db.query("DELETE FROM saved_party_contacts");
  await db.query("DELETE FROM saved_properties");
  await db.query("DELETE FROM organization_memberships");

  // Use your SEEDED users instead of creating new ones
  // testuser (regular user) and testadmin (admin user) already exist

  // Create test organizations only if needed for specific tests
  // (or use the 3 seeded organizations)
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

// Export seeded user info for tests
const seededUsers = {
  regular: {
    username: "testuser",
    password: "password", // The original password before hashing
    firstName: "Test",
    lastName: "User",
    email: "tuser@example.com",
    isAdmin: false,
  },
  admin: {
    username: "testadmin",
    password: "password", // The original password before hashing
    firstName: "Test",
    lastName: "Admin",
    email: "tadmin@example.com",
    isAdmin: true,
  },
};

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  seededUsers,
  testJobIds,
};
