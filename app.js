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
  queryAcrisAddressParcel,
  queryAcrisParcel,
  queryAcrisDocIdCrfn,
  queryAcrisPartyName,
  queryAcrisDocumentType,
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
  legalsRealPropDbRoutes, // remove unused imports by creating a separate branch and call it "Code Review".
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
const origin = ["https://react-snacris-frontend-web.onrender.com"]
if (process.env.NODE_ENV === "development") {
  origin.push("http://localhost:3000");
}
app.use(cors({
  origin,
}));

app.use(express.json());
app.use(morgan("tiny"));

app.get("/", (req, res) => { res.send("Hello, World!") });

app.use(authenticateJWT);
app.use("/auth", authRoutes);
app.use("/users", usersRoutes); 
app.use("/queryAcrisAddressParcel", queryAcrisAddressParcel); 
app.use("/queryAcrisParcel", queryAcrisParcel);
app.use("/queryAcrisDocIdCrfn", queryAcrisDocIdCrfn);
app.use("/queryAcrisPartyName", queryAcrisPartyName);
app.use("/queryAcrisDocumentType", queryAcrisDocumentType);
app.use("/realPropertyMaster", masterRealPropApiRoutes); 
app.use("/realPropertyLegals", legalsRealPropApiRoutes);
app.use("/realPropertyParties", partiesRealPropApiRoutes);
app.use("/realPropertyRemarks", remarksRealPropApiRoutes);
app.use("/realPropertyReferences", referencesRealPropApiRoutes);
app.use("/persPropertyMaster", masterPersPropApiRoutes);
app.use("/persPropertyLegals", legalsPersPropApiRoutes);
app.use("/persPropertyParties", partiesPersPropApiRoutes);
app.use("/persPropertyRemarks", remarksPersPropApiRoutes);
app.use("/persPropertyReferences", referencesPersPropApiRoutes);
app.use("/codeMapCountries", countriesCodeMapApiRoutes);
app.use("/codeMapStates", statesCodeMapApiRoutes);
app.use("/codeMapDocumentTypes", docTypesCodeMapApiRoutes);
app.use("/codeMapPropertyTypes", propTypesCodeMapApiRoutes);
app.use("/codeMapUccLiens", uccTypesCodeMapApiRoutes);
app.use("/db/real-property-master", masterRealPropDbRoutes);
// app.use("/db/real-propersRealPropDbRoutes);
// app.use("/db/real-property-references", referencesRealPropDbRoutes);
// app.use("/db/personal-property-masterty-legals", legalsRealPropDbRoutes);
// app.use("/db/real-property-parties", partiesRealPropDbRoutes);
// app.use("/db/real-property-remarks", remark", masterPersPropDbRoutes);
// app.use("/db/personal-property-legals", legalsPersPropDbRoutes);
// app.use("/db/personal-property-parties", partiesPersPropDbRoutes);
// app.use("/db/personal-property-remarks", remarksPersPropDbRoutes);
// app.use("/db/personal-property-references", referencesPersPropDbRoutes);
// app.use("/db/personal-property-references", referencesPersPropDbRoutes);
// app.use("/db/code-map-countries", countriesCodeMapDbRoutes);
// app.use("/db/code-map-states", statesCodeMapDbRoutes);
app.use("/db/code-map-documents", docTypesCodeMapDbRoutes);
// app.use("/db/code-map-properties", propTypesCodeMapDbRoutes);
// app.use("/db/code-map-ucc", uccTypesCodeMapDbRoutes);

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
