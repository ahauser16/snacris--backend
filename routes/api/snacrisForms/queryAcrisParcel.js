"use strict";

const express = require("express");
const MasterRealPropApi = require("../../../thirdPartyApi/acris/real-property/MasterRealPropApi");
const LegalsRealPropApi = require("../../../thirdPartyApi/acris/real-property/LegalsRealPropApi");
const PartiesRealPropApi = require("../../../thirdPartyApi/acris/real-property/PartiesRealPropApi");
const ReferencesRealPropApi = require("../../../thirdPartyApi/acris/real-property/ReferencesRealPropApi");
const RemarksRealPropApi = require("../../../thirdPartyApi/acris/real-property/RemarksRealPropApi");
const DocTypesCodeMapModel = require("../../../models/acris/code-maps/DocTypesCodeMapModel");

const router = new express.Router();

router.get("/fetchRecord", async function (req, res, next) {
  const errMsg = [];
  const { masterSearchTerms = {}, legalsSearchTerms = {} } = req.query;

  // 1) Build query‐param objects
  const masterQueryParams = {};
  if (masterSearchTerms.recorded_date_range)
    masterQueryParams.recorded_date_range = masterSearchTerms.recorded_date_range;
  if (masterSearchTerms.recorded_date_start)
    masterQueryParams.recorded_date_start = masterSearchTerms.recorded_date_start;
  if (masterSearchTerms.recorded_date_end)
    masterQueryParams.recorded_date_end = masterSearchTerms.recorded_date_end;
  if (
    masterSearchTerms.doc_type === "doc-type-default" &&
    masterSearchTerms.doc_class &&
    masterSearchTerms.doc_class !== "all-classes-default"
  ) {
    try {
      const docTypes = await DocTypesCodeMapModel.getDocTypesByClass(masterSearchTerms.doc_class);
      masterQueryParams.doc_type = docTypes;
    } catch (err) {
      errMsg.push(`Invalid doc_class: ${masterSearchTerms.doc_class}`);
    }
  } else if (masterSearchTerms.doc_type && masterSearchTerms.doc_type !== "doc-type-default") {
    masterQueryParams.doc_type = masterSearchTerms.doc_type;
  }

  const legalsQueryParams = {};
  if (legalsSearchTerms.borough) legalsQueryParams.borough = legalsSearchTerms.borough;
  if (legalsSearchTerms.block)   legalsQueryParams.block   = legalsSearchTerms.block;
  if (legalsSearchTerms.lot)     legalsQueryParams.lot     = legalsSearchTerms.lot;
  if (legalsSearchTerms.unit)    legalsQueryParams.unit    = legalsSearchTerms.unit;

  // Validate required legals params
  if (!legalsQueryParams.borough || !legalsQueryParams.block || !legalsQueryParams.lot) {
    return res.status(400).json({
      dataFound: false,
      errMsg: ["borough, block, and lot are required in legalsSearchTerms."]
    });
  }

  // 2) Fetch legals IDs
  let legalsIds = [];
  try {
    legalsIds = await LegalsRealPropApi.fetchAcrisDocumentIds(legalsQueryParams);
  } catch (err) {
    errMsg.push(`Legals IDs: ${err.message}`);
  }

  // 3) Cross‐ref master IDs
  let masterIds = [];
  if (legalsIds.length) {
    try {
      masterIds = await MasterRealPropApi.fetchAcrisDocumentIdsCrossRef(
        masterQueryParams,
        legalsIds
      );
    } catch (err) {
      errMsg.push(`Master IDs: ${err.message}`);
    }
  }

  const finalIds = masterIds;

  // Bail out if any ID‐phase errors or no IDs
  if (errMsg.length || !finalIds.length) {
    return res.json({ dataFound: false, errMsg });
  }

  // 4) Fetch full records in parallel
  const [
    masterRecsRes,
    partyRecsRes,
    legalRecsRes,
    refRecsRes,
    remarkRecsRes
  ] = await Promise.allSettled([
    MasterRealPropApi.fetchAcrisRecordsByDocumentIds(finalIds),
    PartiesRealPropApi.fetchAcrisRecordsByDocumentIds(finalIds),
    LegalsRealPropApi.fetchAcrisRecordsByDocumentIds(finalIds),
    ReferencesRealPropApi.fetchAcrisRecordsByDocumentIds(finalIds),
    RemarksRealPropApi.fetchAcrisRecordsByDocumentIds(finalIds),
  ]);

  // Collect any full-records errors
  if (masterRecsRes.status === "rejected")
    errMsg.push(`Master Records: ${masterRecsRes.reason.message}`);
  if (partyRecsRes.status === "rejected")
    errMsg.push(`Party Records: ${partyRecsRes.reason.message}`);
  if (legalRecsRes.status === "rejected")
    errMsg.push(`Legal Records: ${legalRecsRes.reason.message}`);
  if (refRecsRes.status === "rejected")
    errMsg.push(`Reference Records: ${refRecsRes.reason.message}`);
  if (remarkRecsRes.status === "rejected")
    errMsg.push(`Remark Records: ${remarkRecsRes.reason.message}`);

  if (errMsg.length) {
    return res.json({ dataFound: false, errMsg });
  }

  // 5) All succeeded → unwrap and build results
  const masterRecs = masterRecsRes.value || [];
  const partyRecs  = partyRecsRes.value  || [];
  const legalRecs  = legalRecsRes.value  || [];
  const refRecs    = refRecsRes.value    || [];
  const remarkRecs = remarkRecsRes.value || [];

  const results = finalIds.map(id => ({
    document_id:      id,
    masterRecords:    masterRecs.filter(r => r.document_id === id),
    partyRecords:     partyRecs.filter(r => r.document_id === id),
    legalsRecords:    legalRecs.filter(r => r.document_id === id),
    referencesRecords: refRecs.filter(r => r.document_id === id),
    remarksRecords:   remarkRecs.filter(r => r.document_id === id),
  }));

  return res.json({ dataFound: true, results });
});

module.exports = router;