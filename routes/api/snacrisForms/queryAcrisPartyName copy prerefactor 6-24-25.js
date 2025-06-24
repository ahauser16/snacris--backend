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
  const { masterSearchTerms={}, partySearchTerms={}, legalsSearchTerms={} } = req.query;

  // 1) Build query‐param objects
  const masterParams = {};
  if (masterSearchTerms.recorded_date_range)   masterParams.recorded_date_range = masterSearchTerms.recorded_date_range;
  if (masterSearchTerms.recorded_date_start)   masterParams.recorded_date_start = masterSearchTerms.recorded_date_start;
  if (masterSearchTerms.recorded_date_end)     masterParams.recorded_date_end = masterSearchTerms.recorded_date_end;
  if (masterSearchTerms.doc_type === "doc-type-default" && masterSearchTerms.doc_class) {
    if (masterSearchTerms.doc_class !== "all-class-default") {
      try {
        const docTypes = await DocTypesCodeMapModel.getDocTypesByClass(masterSearchTerms.doc_class);
        masterParams.doc_type = docTypes;
      } catch (err) {
        return res.status(400).json({ error: `Invalid doc_class: ${masterSearchTerms.doc_class}` });
      }
    }
  } else if (masterSearchTerms.doc_type) {
    masterParams.doc_type = masterSearchTerms.doc_type;
  }

  const partyParams = {};
  if (partySearchTerms.name)      partyParams.name = transformForUrl(partySearchTerms.name);
  if (partySearchTerms.party_type) partyParams.party_type = partySearchTerms.party_type;

  const legalParams = {};
  if (legalsSearchTerms.borough)  legalParams.borough = legalsSearchTerms.borough;

  // 2) Fetch master IDs
  let masterIds;
  try {
    masterIds = await MasterRealPropApi.fetchAcrisDocumentIds(masterParams);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.json({ dataFound: false, dataset: "MasterRealProp", message: err.message });
    }
    return next(err);
  }

  // 3) Cross-ref party IDs
  let partyIds;
  try {
    partyIds = await PartiesRealPropApi.fetchAcrisDocumentIdsCrossRef(partyParams, masterIds);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.json({ dataFound: false, dataset: "PartiesRealProp", message: err.message });
    }
    return next(err);
  }

  // 4) Cross-ref legal IDs
  let legalIds;
  try {
    legalIds = await LegalsRealPropApi.fetchAcrisDocumentIdsCrossRef(legalParams, partyIds);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.json({ dataFound: false, dataset: "LegalsRealProp", message: err.message });
    }
    return next(err);
  }

  const finalIds = legalIds;
  if (!finalIds || finalIds.length === 0) {
    return res.json({ dataFound: false, dataset: "FinalCrossRef", message: "No documents after full cross-reference." });
  }

  // 5) Fetch full records in parallel
  try {
    const [
      masterRecs,
      partyRecs,
      legalRecs,
      refRecs,
      remarkRecs
    ] = await Promise.all([
      MasterRealPropApi.fetchAcrisRecordsByDocumentIds(finalIds),
      PartiesRealPropApi.fetchAcrisRecordsByDocumentIds(finalIds),
      LegalsRealPropApi.fetchAcrisRecordsByDocumentIds(finalIds),
      ReferencesRealPropApi.fetchAcrisRecordsByDocumentIds(finalIds),
      RemarksRealPropApi.fetchAcrisRecordsByDocumentIds(finalIds)
    ]);

    const results = finalIds.map(id => ({
      document_id: id,
      masterRecords: masterRecs?.filter(r => r.document_id === id) || [],
      partyRecords: partyRecs?.filter(r => r.document_id === id) || [],
      legalsRecords: legalRecs?.filter(r => r.document_id === id) || [],
      referencesRecords: refRecs?.filter(r => r.document_id === id) || [],
      remarksRecords: remarkRecs?.filter(r => r.document_id === id) || [],
    }));

    console.log(results);

    return res.json({ dataFound: true, results });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;