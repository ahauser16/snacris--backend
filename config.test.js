"use strict";

describe("config can come from env", function () {
  test("works", function() {
    // Set environment variables
    process.env.SECRET_KEY = "abc";
    process.env.PORT = "5000";
    process.env.DATABASE_URL = "other";
    process.env.NODE_ENV = "other";

    const config = require("./config");

    // Test that config picks up environment variables
    expect(config.SECRET_KEY).toEqual("abc");
    expect(config.PORT).toEqual(5000);
    expect(config.getDatabaseUri()).toEqual("other");
    expect(config.BCRYPT_WORK_FACTOR).toEqual(12);

    // Clean up environment variables
    delete process.env.SECRET_KEY;
    delete process.env.PORT;
    delete process.env.BCRYPT_WORK_FACTOR;
    delete process.env.DATABASE_URL;

    // Test fallback behavior
    expect(config.getDatabaseUri()).toEqual("snacris");

    // Test test environment behavior
    process.env.NODE_ENV = "test";
    expect(config.getDatabaseUri()).toEqual("snacris_test");
  });
})

