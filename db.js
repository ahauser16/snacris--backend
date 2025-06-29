"use strict";
/** Database setup for SNACRIS. */
const { Pool } = require("pg");
const { getDatabaseUri } = require("./config");

let db;

if (process.env.NODE_ENV === "production") {
  db = new Pool({
    connectionString: getDatabaseUri(),
    ssl: {
      rejectUnauthorized: false,
    },
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  });
} else {
  // For development/test, check if we got a full URL or just a database name
  const dbUri = getDatabaseUri();

  if (dbUri.startsWith("postgresql://") || dbUri.startsWith("postgres://")) {
    // It's a full connection string (production)
    db = new Pool({
      connectionString: dbUri,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  } else {
    // It's just a database name (development/test)
    db = new Pool({
      host: "localhost",
      port: 5432,
      database: dbUri,
      user: process.env.PGUSER || process.env.USER,
      password: process.env.PGPASSWORD || "",
      max: process.env.NODE_ENV === "test" ? 5 : 10, // Fewer connections for tests
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
}

module.exports = db;
