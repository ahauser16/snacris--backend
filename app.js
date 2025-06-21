"use strict";
/** Express app for SNACRIS. */
const express = require("express");
const cors = require("cors");
const { NotFoundError } = require("./expressError");
const { authenticateJWT } = require("./middleware/auth");
const morgan = require("morgan");
const routes = require("./routes");

const app = express();
const origin = [
  "https://react-snacris-frontend-web.onrender.com",
  "https://snacris.nyc"
];
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
app.use("/auth", routes.authRoutes);
app.use("/users", routes.usersRoutes); 
app.use("/organizations", routes.organizationRoutes); 
app.use("/queryAcrisAddressParcel", routes.queryAcrisAddressParcel); 
app.use("/queryAcrisParcel", routes.queryAcrisParcel);
app.use("/queryAcrisDocIdCrfn", routes.queryAcrisDocIdCrfn);
app.use("/queryAcrisPartyName", routes.queryAcrisPartyName);
app.use("/queryAcrisDocumentType", routes.queryAcrisDocumentType);
app.use("/queryAcrisTransactionNumber", routes.queryAcrisTransactionNumber);
app.use("/queryAcrisReelPage", routes.queryAcrisReelPage);
app.use("/queryAcrisUccFedLienNum", routes.queryAcrisUccFedLienNum);
app.use("/realPropertyMaster", routes.masterRealPropApiRoutes); 
app.use("/realPropertyLegals", routes.legalsRealPropApiRoutes);
app.use("/realPropertyParties", routes.partiesRealPropApiRoutes);
app.use("/realPropertyRemarks", routes.remarksRealPropApiRoutes);
app.use("/realPropertyReferences", routes.referencesRealPropApiRoutes);
app.use("/persPropertyMaster", routes.masterPersPropApiRoutes);
app.use("/persPropertyLegals", routes.legalsPersPropApiRoutes);
app.use("/persPropertyParties", routes.partiesPersPropApiRoutes);
app.use("/persPropertyRemarks", routes.remarksPersPropApiRoutes);
app.use("/persPropertyReferences", routes.referencesPersPropApiRoutes);
app.use("/codeMapCountries", routes.countriesCodeMapApiRoutes);
app.use("/codeMapStates", routes.statesCodeMapApiRoutes);
app.use("/codeMapDocumentTypes", routes.docTypesCodeMapApiRoutes);
app.use("/codeMapPropertyTypes", routes.propTypesCodeMapApiRoutes);
app.use("/codeMapUccLiens", routes.uccTypesCodeMapApiRoutes);
app.use("/db/real-property-master", routes.masterRealPropDbRoutes);
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
app.use("/db/code-map-documents", routes.docTypesCodeMapDbRoutes);
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
