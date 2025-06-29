"use strict";

const db = require("../db.js");
const User = require("./user.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  seededUsers,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** Test with Seeded Users */

describe("Using Seeded Users", function () {
  test("can authenticate seeded regular user", async function () {
    const user = await User.authenticate(
      seededUsers.regular.username,
      seededUsers.regular.password
    );

    expect(user).toEqual({
      username: "testuser",
      firstName: "Test",
      lastName: "User",
      email: "tuser@example.com",
      isAdmin: false,
    });
  });

  test("can authenticate seeded admin user", async function () {
    const user = await User.authenticate(
      seededUsers.admin.username,
      seededUsers.admin.password
    );

    expect(user).toEqual({
      username: "testadmin",
      firstName: "Test",
      lastName: "Admin",
      email: "tadmin@example.com",
      isAdmin: true,
    });
  });

  test("seeded users exist in database", async function () {
    const result = await db.query(`
      SELECT username, first_name, last_name, email, is_admin 
      FROM users 
      WHERE username IN ('testuser', 'testadmin')
      ORDER BY username
    `);

    expect(result.rows).toHaveLength(2);
    expect(result.rows[0].username).toBe("testadmin");
    expect(result.rows[1].username).toBe("testuser");
  });
});

/************************************** Test SQL Insertion with Temp User */

describe("Testing SQL Insertion", function () {
  test("tempnewuser was created for testing", async function () {
    const result = await db.query(`
      SELECT username, first_name, last_name, email, is_admin 
      FROM users 
      WHERE username = 'tempnewuser'
    `);

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toEqual({
      username: "tempnewuser",
      first_name: "Temp",
      last_name: "User",
      email: "temp@test.com",
      is_admin: false,
    });
  });

  test("can authenticate temp user", async function () {
    const user = await User.authenticate("tempnewuser", "temppassword");

    expect(user).toEqual({
      username: "tempnewuser",
      firstName: "Temp",
      lastName: "User",
      email: "temp@test.com",
      isAdmin: false,
    });
  });

  test("temp user password is properly hashed", async function () {
    const result = await db.query(`
      SELECT password FROM users WHERE username = 'tempnewuser'
    `);

    expect(result.rows[0].password).toMatch(/^\$2b\$\d+\$/); // bcrypt hash format
    expect(result.rows[0].password).not.toBe("temppassword"); // Not plain text
  });
});

/************************************** Test User Model Methods */

describe("User Model Integration", function () {
  test("User.register creates new user", async function () {
    const newUser = await User.register({
      username: "brandnew",
      firstName: "Brand",
      lastName: "New",
      password: "password123",
      email: "brand@new.com",
      isAdmin: false,
    });

    expect(newUser).toEqual({
      username: "brandnew",
      firstName: "Brand",
      lastName: "New",
      email: "brand@new.com",
      isAdmin: false,
    });

    // Verify in database
    const found = await db.query(
      "SELECT * FROM users WHERE username = 'brandnew'"
    );
    expect(found.rows).toHaveLength(1);
    expect(found.rows[0].username).toBe("brandnew");
  });

  test("User.get works with seeded users", async function () {
    const user = await User.get("testuser");

    expect(user).toEqual({
      username: "testuser",
      firstName: "Test",
      lastName: "User",
      email: "tuser@example.com",
      isAdmin: false,
    });
  });
});
