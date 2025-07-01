"use strict";

const db = require("../db.js");
const { createToken } = require("../helpers/tokens");

// Info about seeded users for route testing
const seededUsers = {
  regular: {
    username: "testuser",
    password: "password",
    firstName: "Test",
    lastName: "User",
    email: "tuser@example.com",
    isAdmin: false,
  },
  admin: {
    username: "testadmin",
    password: "password",
    firstName: "Test",
    lastName: "Admin",
    email: "tadmin@example.com",
    isAdmin: true,
  },
};

// Create tokens for seeded users
const testTokens = {
  regular: createToken(seededUsers.regular),
  admin: createToken(seededUsers.admin),
  invalid: "invalid.jwt.token",
};

async function commonBeforeAll() {
  // Clean APPLICATION data only (keep seeded users and reference data)
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM saved_real_property_master");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM saved_personal_property_master");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM saved_party_names");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM saved_party_contacts");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM saved_properties");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM organization_memberships");

  // Clean any temporary test users (but keep seeded testuser/testadmin)
  await db.query(
    "DELETE FROM users WHERE username NOT IN ('testuser', 'testadmin')"
  );

}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  // Close the database pool only if it hasn't been closed already
  if (db && db.end && !db.ended) {
    await db.end();
  }
}

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  seededUsers,
  testTokens,
};
