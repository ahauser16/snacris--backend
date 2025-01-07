"use strict";

/*
* user and authentication routes
*/

const authRoutes = require("./auth");
const usersRoutes = require("./users");

/*
* routes associated with making external API calls to the ACRIS Real Property API endpoints.
*/

const realPropertyMasterApiRoutes = require("./api/acris/real-property/master");
const realPropertyLegalsApiRoutes = require("./api/acris/real-property/legals");
const realPropertyPartiesApiRoutes = require("./api/acris/real-property/parties");
const realPropertyRemarksApiRoutes = require("./api/acris/real-property/remarks");
const realPropertyReferencesApiRoutes = require("./api/acris/real-property/references");

/*
* routes associated with making external API calls to the ACRIS Personal Property API endpoints
*/

const personalPropertyMasterApiRoutes = require("./api/acris/personal-property/master");
const personalPropertyLegalsApiRoutes = require("./api/acris/personal-property/legals");
const personalPropertyPartiesApiRoutes = require("./api/acris/personal-property/parties");
const personalPropertyRemarksApiRoutes = require("./api/acris/personal-property/remarks");
const personalPropertyReferencesApiRoutes = require("./api/acris/personal-property/references");

/*
* routes associated with making external API calls to the ACRIS Code Mapping API endpoints
*/

const codeMapCountriesApiRoutes = require("./api/acris/code-mappings/countries");
const codeMapStatesApiRoutes = require("./api/acris/code-mappings/states");
const codeMapDocumentsApiRoutes = require("./api/acris/code-mappings/documents");
const codeMapPropertiesApiRoutes = require("./api/acris/code-mappings/properties");
const codeMapUccApiRoutes = require("./api/acris/code-mappings/ucc");

/*
* routes associated with implementing javascript models that perform CRUD operations using database data that was saved by the user (or admin) from the ACRIS-Real Property API endpoints
*/

const realPropertyMasterDbRoutes = require("./db/acris/real-property/master");
const realPropertyLegalsDbRoutes = require("./db/acris/real-property/legals");
const realPropertyPartiesDbRoutes = require("./db/acris/real-property/parties");
const realPropertyRemarksDbRoutes = require("./db/acris/real-property/remarks");
const realPropertyReferencesDbRoutes = require("./db/acris/real-property/references");

/*
* routes associated with implementing javascript models that perform CRUD operations using database data that was saved by the user (or admin) from the ACRIS-Personal Property API endpoints
*/

const personalPropertyMasterDbRoutes = require("./db/acris/personal-property/master");
const personalPropertyLegalsDbRoutes = require("./db/acris/personal-property/legals");
const personalPropertyPartiesDbRoutes = require("./db/acris/personal-property/parties");
const personalPropertyRemarksDbRoutes = require("./db/acris/personal-property/remarks");
const personalPropertyReferencesDbRoutes = require("./db/acris/personal-property/references");

/*
* routes associated with implementing javascript models that perform CRUD operations using database data that was seeded at the start of the application from the ACRIS Code Mapping API endpoints.
*/

const codeMapCountriesDbRoutes = require("./db/acris/code-mappings/countries");
const codeMapStatesDbRoutes = require("./db/acris/code-mappings/states");
const codeMapDocumentsDbRoutes = require("./db/acris/code-mappings/documents");
const codeMapUccDbRoutes = require("./db/acris/code-mappings/ucc");
const codeMapPropertiesDbRoutes = require("./db/acris/code-mappings/properties");

module.exports = {
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
};