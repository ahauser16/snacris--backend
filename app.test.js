const request = require("supertest");

const app = require("./app");
const db = require("./db");

// supertest: Library for testing HTTP requests
// request(app): Creates test requests to your Express app
// afterAll(): Cleanup function that runs after all tests
// db.end(): Closes database connection to prevent hanging tests

test("not found for site 404", async function () {
  const resp = await request(app).get("/no-such-path");
  expect(resp.statusCode).toEqual(404);
});

test("not found for site 404 (test stack print)", async function () {
  process.env.NODE_ENV = "";
  const resp = await request(app).get("/no-such-path");
  expect(resp.statusCode).toEqual(404);
  delete process.env.NODE_ENV;
});

afterAll(function () {
  // Close the database pool only if it hasn't been closed already
  if (db && db.end && !db.ended) {
    db.end();
  }
});
