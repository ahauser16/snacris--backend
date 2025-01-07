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
  realPropertyMasterApiRoutes,
  realPropertyLegalsApiRoutes,
  realPropertyPartiesApiRoutes,
  realPropertyRemarksApiRoutes,
  realPropertyReferencesApiRoutes,
  personalPropertyMasterApiRoutes,
  personalPropertyLegalsApiRoutes,
  personalPropertyPartiesApiRoutes,
  personalPropertyRemarksApiRoutes,
  personalPropertyReferencesApiRoutes,
  codeMapCountriesApiRoutes,
  codeMapStatesApiRoutes,
  codeMapDocumentsApiRoutes,
  codeMapPropertiesApiRoutes,
  codeMapUccApiRoutes,
  realPropertyMasterDbRoutes,
  realPropertyLegalsDbRoutes,
  realPropertyPartiesDbRoutes,
  realPropertyRemarksDbRoutes,
  realPropertyReferencesDbRoutes,
  personalPropertyMasterDbRoutes,
  personalPropertyLegalsDbRoutes,
  personalPropertyPartiesDbRoutes,
  personalPropertyRemarksDbRoutes,
  personalPropertyReferencesDbRoutes,
  codeMapCountriesDbRoutes,
  codeMapStatesDbRoutes,
  codeMapDocumentsDbRoutes,
  codeMapUccDbRoutes,
  codeMapPropertiesDbRoutes,
} = require("./routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(authenticateJWT);

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/api/real-property-master", realPropertyMasterApiRoutes);
app.use("/api/real-property-legals", realPropertyLegalsApiRoutes);
app.use("/api/real-property-parties", realPropertyPartiesApiRoutes);
app.use("/api/real-property-remarks", realPropertyRemarksApiRoutes);
app.use("/api/real-property-references", realPropertyReferencesApiRoutes);
app.use("/api/personal-property-master", personalPropertyMasterApiRoutes);
app.use("/api/personal-property-legals", personalPropertyLegalsApiRoutes);
app.use("/api/personal-property-parties", personalPropertyPartiesApiRoutes);
app.use("/api/personal-property-remarks", personalPropertyRemarksApiRoutes);
app.use("/api/personal-property-references", personalPropertyReferencesApiRoutes);
app.use("/api/code-map-countries", codeMapCountriesApiRoutes);
app.use("/api/code-map-states", codeMapStatesApiRoutes);
app.use("/api/code-map-documents", codeMapDocumentsApiRoutes);
app.use("/api/code-map-properties", codeMapPropertiesApiRoutes);
app.use("/api/code-map-ucc", codeMapUccApiRoutes);
// app.use("/db/real-property-master", realPropertyMasterDbRoutes);
// app.use("/db/real-property-legals", realPropertyLegalsDbRoutes);
// app.use("/db/real-property-parties", realPropertyPartiesDbRoutes);
// app.use("/db/real-property-remarks", realPropertyRemarksDbRoutes);
// app.use("/db/real-property-references", realPropertyReferencesDbRoutes);
// app.use("/db/personal-property-master", personalPropertyMasterDbRoutes);
// app.use("/db/personal-property-legals", personalPropertyLegalsDbRoutes);
// app.use("/db/personal-property-parties", personalPropertyPartiesDbRoutes);
// app.use("/db/personal-property-remarks", personalPropertyRemarksDbRoutes);
// app.use("/db/personal-property-references", personalPropertyReferencesDbRoutes);

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
