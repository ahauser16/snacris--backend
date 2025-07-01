const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

// Export info about seeded users that tests can rely on
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

async function commonBeforeAll() {
  // Clean APPLICATION data only (not reference data or seeded users)
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

  // Create a temporary user specifically for testing SQL insertion
  await db.query(
    `
    INSERT INTO users(username, password, first_name, last_name, email, is_admin)
    VALUES ($1, $2, 'Temp', 'User', 'temp@test.com', false)`,
    ["tempnewuser", await bcrypt.hash("temppassword", BCRYPT_WORK_FACTOR)]
  );
}

async function commonBeforeEach() {
  await db.query("BEGIN"); // Start a database transaction
}

async function commonAfterEach() {
  await db.query("ROLLBACK"); // Undo any changes made during the test
}

async function commonAfterAll() {
  // Clean up temporary test user before closing connection
  try {
    await db.query("DELETE FROM users WHERE username = 'tempnewuser'");
  } catch (error) {
    // Ignore errors if pool is already closed
  }

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
  seededUsers, // Export seeded user info for tests to use
};
