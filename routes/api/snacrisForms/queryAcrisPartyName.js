"use strict";

const express = require("express");
const MasterRealPropApi = require("../../../thirdPartyApi/acris/real-property/MasterRealPropApi");
const PartiesRealPropApi = require("../../../thirdPartyApi/acris/real-property/PartiesRealPropApi");
const LegalsRealPropApi = require("../../../thirdPartyApi/acris/real-property/LegalsRealPropApi");
const ReferencesRealPropApi = require("../../../thirdPartyApi/acris/real-property/ReferencesRealPropApi");
const RemarksRealPropApi = require("../../../thirdPartyApi/acris/real-property/RemarksRealPropApi");
const DocTypesCodeMapModel = require("../../../models/acris/code-maps/DocTypesCodeMapModel");
const { transformForUrl } = require("../../../thirdPartyApi/utils");
const { NotFoundError } = require("../../../expressError");

const router = new express.Router();

router.get("/fetchRecord", async function (req, res, next) {
  const errMsg = [];
  const { masterSearchTerms = {}, partySearchTerms = {}, legalsSearchTerms = {} } = req.query;

  // 1) Build query‐param objects (unchanged)
  const masterParams = {};
  if (masterSearchTerms.recorded_date_range)
    masterParams.recorded_date_range = masterSearchTerms.recorded_date_range;
  if (masterSearchTerms.recorded_date_start)
    masterParams.recorded_date_start = masterSearchTerms.recorded_date_start;
  if (masterSearchTerms.recorded_date_end)
    masterParams.recorded_date_end = masterSearchTerms.recorded_date_end;
  if (
    masterSearchTerms.doc_type === "doc-type-default" &&
    masterSearchTerms.doc_class &&
    masterSearchTerms.doc_class !== "all-class-default"
  ) {
    try {
      const docTypes = await DocTypesCodeMapModel.getDocTypesByClass(masterSearchTerms.doc_class);
      masterParams.doc_type = docTypes;
    } catch (err) {
      errMsg.push(`Invalid doc_class: ${masterSearchTerms.doc_class}`);
    }
  } else if (masterSearchTerms.doc_type) {
    masterParams.doc_type = masterSearchTerms.doc_type;
  }

  const partyParams = {};
  if (partySearchTerms.name) partyParams.name = transformForUrl(partySearchTerms.name);
  if (partySearchTerms.party_type) partyParams.party_type = partySearchTerms.party_type;

  const legalParams = {};
  if (legalsSearchTerms.borough) legalParams.borough = legalsSearchTerms.borough;

  // 2) Fetch master IDs
  let masterIds = [];
  try {
    masterIds = await MasterRealPropApi.fetchAcrisDocumentIds(masterParams);
  } catch (err) {
    errMsg.push(`Master IDs: ${err.message}`);
  }

  // 3) Cross‐ref party IDs
  let partyIds = [];
  if (masterIds.length) {
    try {
      partyIds = await PartiesRealPropApi.fetchAcrisDocumentIdsCrossRef(partyParams, masterIds);
    } catch (err) {
      errMsg.push(`Party IDs: ${err.message}`);
    }
  }

  // 4) Cross‐ref legal IDs
  let legalIds = [];
  if (partyIds.length) {
    try {
      legalIds = await LegalsRealPropApi.fetchAcrisDocumentIdsCrossRef(legalParams, partyIds);
    } catch (err) {
      errMsg.push(`Legal IDs: ${err.message}`);
    }
  }

  const finalIds = legalIds;

  // If any ID‐phase errors or no IDs found, bail out
  if (errMsg.length || !finalIds.length) {
    return res.json({ dataFound: false, errMsg });
  }

  // 5) Fetch full records in parallel
  const [masterRecsRes, partyRecsRes, legalRecsRes, refRecsRes, remarkRecsRes] =
    await Promise.allSettled([
      MasterRealPropApi.fetchAcrisRecordsByDocumentIds(finalIds),
      PartiesRealPropApi.fetchAcrisRecordsByDocumentIds(finalIds),
      LegalsRealPropApi.fetchAcrisRecordsByDocumentIds(finalIds),
      ReferencesRealPropApi.fetchAcrisRecordsByDocumentIds(finalIds),
      RemarksRealPropApi.fetchAcrisRecordsByDocumentIds(finalIds),
    ]);

  // Collect any full‐records errors
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

  // If any full‐records errors, return them
  if (errMsg.length) {
    return res.json({ dataFound: false, errMsg });
  }

  // 6) All succeeded → unwrap values and build results
const masterRecs = masterRecsRes.value || [];
const partyRecs  = partyRecsRes.value || [];
const legalRecs  = legalRecsRes.value || [];
const refRecs    = refRecsRes.value   || [];
const remarkRecs = remarkRecsRes.value|| [];

  const results = finalIds.map(id => ({
    document_id: id,
    masterRecords: masterRecs.filter(r => r.document_id === id),
    partyRecords: partyRecs.filter(r => r.document_id === id),
    legalsRecords: legalRecs.filter(r => r.document_id === id),
    referencesRecords: refRecs.filter(r => r.document_id === id),
    remarksRecords: remarkRecs.filter(r => r.document_id === id),
  }));

  return res.json({ dataFound: true, results });
});

module.exports = router;
