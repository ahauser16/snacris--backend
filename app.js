"use strict";
/** Express app for SNACRIS. */
const express = require("express");
const cors = require("cors");
const { NotFoundError } = require("./expressError");
const { authenticateJWT } = require("./middleware/auth");
const morgan = require("morgan");
const {
  authRoutes,
  usersRoutes,
  masterRealPropApiRoutes,
  legalsRealPropApiRoutes,
  partiesRealPropApiRoutes,
  remarksRealPropApiRoutes,
  referencesRealPropApiRoutes,
  masterPersPropApiRoutes,
  legalsPersPropApiRoutes,
  partiesPersPropApiRoutes,
  remarksPersPropApiRoutes,
  referencesPersPropApiRoutes,
  countriesCodeMapApiRoutes,
  statesCodeMapApiRoutes,
  docTypesCodeMapApiRoutes,
  propTypesCodeMapApiRoutes,
  uccTypesCodeMapApiRoutes,
  masterRealPropDbRoutes,
  legalsRealPropDbRoutes,
  partiesRealPropDbRoutes,
  remarksRealPropDbRoutes,
  referencesRealPropDbRoutes,
  masterPersPropDbRoutes,
  legalsPersPropDbRoutes,
  partiesPersPropDbRoutes,
  remarksPersPropDbRoutes,
  referencesPersPropDbRoutes,
  countriesCodeMapDbRoutes,
  statesCodeMapDbRoutes,
  docTypesCodeMapDbRoutes,
  uccTypesCodeMapDbRoutes,
  propTypesCodeMapDbRoutes,
} = require("./routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.get("/", (req, res) => {
  res.send("Hello, World!");
}
);
app.use(authenticateJWT);

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/api/real-property-master", masterRealPropApiRoutes);
app.use("/api/real-property-legals", legalsRealPropApiRoutes);
app.use("/api/real-property-parties", partiesRealPropApiRoutes);
app.use("/api/real-property-remarks", remarksRealPropApiRoutes);
app.use("/api/real-property-references", referencesRealPropApiRoutes);
app.use("/api/personal-property-master", masterPersPropApiRoutes);
app.use("/api/personal-property-legals", legalsPersPropApiRoutes);
app.use("/api/personal-property-parties", partiesPersPropApiRoutes);
app.use("/api/personal-property-remarks", remarksPersPropApiRoutes);
app.use("/api/personal-property-references", referencesPersPropApiRoutes);
app.use("/api/code-map-countries", countriesCodeMapApiRoutes);
app.use("/api/code-map-states", statesCodeMapApiRoutes);
app.use("/api/code-map-documents", docTypesCodeMapApiRoutes);
app.use("/api/code-map-properties", propTypesCodeMapApiRoutes);
app.use("/api/code-map-ucc", uccTypesCodeMapApiRoutes);
app.use("/db/real-property-master", masterRealPropDbRoutes);
// app.use("/db/real-property-legals", legalsRealPropDbRoutes);
// app.use("/db/real-property-parties", partiesRealPropDbRoutes);
// app.use("/db/real-property-remarks", remarksRealPropDbRoutes);
// app.use("/db/real-property-references", referencesRealPropDbRoutes);
// app.use("/db/personal-property-master", masterPersPropDbRoutes);
// app.use("/db/personal-property-legals", legalsPersPropDbRoutes);
// app.use("/db/personal-property-parties", partiesPersPropDbRoutes);
// app.use("/db/personal-property-remarks", remarksPersPropDbRoutes);
// app.use("/db/personal-property-references", referencesPersPropDbRoutes);

// app.use("/companies", companiesRoutes);
// app.use("/jobs", jobsRoutes);


/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;
