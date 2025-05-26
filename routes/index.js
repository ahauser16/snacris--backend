"use strict";

/*
* user and authentication routes
*/

const authRoutes = require("./auth");
const usersRoutes = require("./users");

/*
* routes associated with specific webpages that make single/multiple external API calls to the ACRIS Real Property or Personal Property.
*/
const queryAcrisAddressParcel = require("./api/snacrisForms/queryAcrisAddressParcel");
const queryAcrisParcel = require("./api/snacrisForms/queryAcrisParcel");
const queryAcrisDocIdCrfn = require("./api/snacrisForms/queryAcrisDocIdCrfn");
const queryAcrisPartyName = require("./api/snacrisForms/queryAcrisPartyName");
const queryAcrisDocumentType = require("./api/snacrisForms/queryAcrisDocumentType");

/*
* routes associated with specific webpages that make single calls to the SNACRIS database for code maps associated with the Document Control Codes, Property Type Codes, UCC Codes, State (USA) Codes and Country Code datasets that I seeded the database from the original ACRIS datasets.
*/

const getDocTypeCodeMap = require("./db/acris/code-maps/docTypesCodeMapDbRoutes");

/*
* routes associated with making external API calls to the ACRIS Real Property API endpoints.
*/

const masterRealPropApiRoutes = require("./api/acris/real-property/masterRealPropApiRoutes");
const legalsRealPropApiRoutes = require("./api/acris/real-property/legalsRealPropApiRoutes");
const partiesRealPropApiRoutes = require("./api/acris/real-property/partiesRealPropApiRoutes");
const remarksRealPropApiRoutes = require("./api/acris/real-property/remarksRealPropApiRoutes");
const referencesRealPropApiRoutes = require("./api/acris/real-property/referencesRealPropApiRoutes");

/*
* routes associated with making external API calls to the ACRIS Personal Property API endpoints
*/

const masterPersPropApiRoutes = require("./api/acris/personal-property/masterPersPropApiRoutes");
const legalsPersPropApiRoutes = require("./api/acris/personal-property/legalsPersPropApiRoutes");
const partiesPersPropApiRoutes = require("./api/acris/personal-property/partiesPersPropApiRoutes");
const remarksPersPropApiRoutes = require("./api/acris/personal-property/remarksPersPropApiRoutes");
const referencesPersPropApiRoutes = require("./api/acris/personal-property/referencesPersPropApiRoutes");

/*
* routes associated with making external API calls to the ACRIS Code Mapping API endpoints
*/

const countriesCodeMapApiRoutes = require("./api/acris/code-maps/countriesCodeMapApiRoutes");
const statesCodeMapApiRoutes = require("./api/acris/code-maps/statesCodeMapApiRoutes");
const docTypesCodeMapApiRoutes = require("./api/acris/code-maps/docTypesCodeMapApiRoutes");
const propTypesCodeMapApiRoutes = require("./api/acris/code-maps/propTypesCodeMapApiRoutes");
const uccTypesCodeMapApiRoutes = require("./api/acris/code-maps/uccTypesCodeMapApiRoutes");

/*
* routes associated with implementing javascript models that perform CRUD operations using database data that was saved by the user (or admin) from the ACRIS-Real Property API endpoints
*/

const masterRealPropDbRoutes = require("./db/acris/real-property/masterRealPropDbRoutes");
const legalsRealPropDbRoutes = require("./db/acris/real-property/legalsRealPropDbRoutes");
const partiesRealPropDbRoutes = require("./db/acris/real-property/partiesRealPropDbRoutes");
const remarksRealPropDbRoutes = require("./db/acris/real-property/remarksRealPropDbRoutes");
const referencesRealPropDbRoutes = require("./db/acris/real-property/referencesRealPropDbRoutes");

/*
* routes associated with implementing javascript models that perform CRUD operations using database data that was saved by the user (or admin) from the ACRIS-Personal Property API endpoints
*/

const masterPersPropDbRoutes = require("./db/acris/personal-property/masterPersPropDbRoutes");
const legalsPersPropDbRoutes = require("./db/acris/personal-property/legalsPersPropDbRoutes");
const partiesPersPropDbRoutes = require("./db/acris/personal-property/partiesPersPropDbRoutes");
const remarksPersPropDbRoutes = require("./db/acris/personal-property/remarksPersPropDbRoutes");
const referencesPersPropDbRoutes = require("./db/acris/personal-property/referencesPersPropDbRoutes");

/*
* routes associated with implementing javascript models that perform CRUD operations using database data that was seeded at the start of the application from the ACRIS Code Mapping API endpoints.
*/

const countriesCodeMapDbRoutes = require("./db/acris/code-maps/countriesCodeMapDbRoutes");
const statesCodeMapDbRoutes = require("./db/acris/code-maps/statesCodeMapDbRoutes");
const docTypesCodeMapDbRoutes = require("./db/acris/code-maps/docTypesCodeMapDbRoutes");
const uccTypesCodeMapDbRoutes = require("./db/acris/code-maps/uccTypesCodeMapDbRoutes");
const propTypesCodeMapDbRoutes = require("./db/acris/code-maps/propTypesCodeMapDbRoutes");

module.exports = {
    authRoutes,
    usersRoutes,
    queryAcrisAddressParcel,
    queryAcrisParcel,
    queryAcrisDocIdCrfn,
    queryAcrisPartyName,
    queryAcrisDocumentType,
    getDocTypeCodeMap,
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
};