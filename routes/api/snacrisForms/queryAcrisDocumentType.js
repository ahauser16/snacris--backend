"use strict";

const express = require("express");
const MasterRealPropApi = require("../../../thirdPartyApi/acris/real-property/MasterRealPropApi");
const LegalsRealPropApi = require("../../../thirdPartyApi/acris/real-property/LegalsRealPropApi");
const PartiesRealPropApi = require("../../../thirdPartyApi/acris/real-property/PartiesRealPropApi");
const ReferencesRealPropApi = require("../../../thirdPartyApi/acris/real-property/ReferencesRealPropApi");
const RemarksRealPropApi = require("../../../thirdPartyApi/acris/real-property/RemarksRealPropApi");
const DocTypesCodeMapModel = require("../../../models/acris/code-maps/DocTypesCodeMapModel");
const { transformForUrl } = require("../../../thirdPartyApi/utils");

const router = new express.Router();

router.get("/fetchRecord", async function (req, res, next) {
  const errMsg = [];
  const { masterSearchTerms = {}, legalsSearchTerms = {} } = req.query;

  // 1) Build masterQueryParams
  const masterQueryParams = {};
  if (masterSearchTerms.recorded_date_range)
    masterQueryParams.recorded_date_range =
      masterSearchTerms.recorded_date_range;
  if (masterSearchTerms.recorded_date_start)
    masterQueryParams.recorded_date_start =
      masterSearchTerms.recorded_date_start;
  if (masterSearchTerms.recorded_date_end)
    masterQueryParams.recorded_date_end = masterSearchTerms.recorded_date_end;

  if (
    masterSearchTerms.doc_type === "doc-type-default" &&
    masterSearchTerms.doc_class &&
    masterSearchTerms.doc_class !== "all-class-default"
  ) {
    try {
      const docTypes = await DocTypesCodeMapModel.getDocTypesByClass(
        masterSearchTerms.doc_class
      );
      masterQueryParams.doc_type = docTypes;
    } catch (err) {
      errMsg.push(`Invalid doc_class: ${masterSearchTerms.doc_class}`);
    }
  } else if (masterSearchTerms.doc_type) {
    masterQueryParams.doc_type = masterSearchTerms.doc_type;
  }

  // 2) Build legalsQueryParams
  const legalsQueryParams = {};
  if (legalsSearchTerms.borough)
    legalsQueryParams.borough = legalsSearchTerms.borough;

  // 3) Fetch ID lists
  let masterIds = [];
  try {
    masterIds = await MasterRealPropApi.fetchAcrisDocumentIds(
      masterQueryParams
    );
  } catch (err) {
    errMsg.push(`Master IDs: ${err.message}`);
  }

  let legalsIds = [];
  if (masterIds.length) {
    try {
      legalsIds = await LegalsRealPropApi.fetchAcrisDocumentIdsCrossRef(
        legalsQueryParams,
        masterIds
      );
    } catch (err) {
      errMsg.push(`Legals IDs: ${err.message}`);
    }
  }

  const finalIds = legalsIds;

  // Bail if ID‐phase errors or no IDs
  if (errMsg.length || !finalIds.length) {
    return res.json({ dataFound: false, errMsg });
  }

  // 4) Fetch full records in parallel
  const [
    masterRecsRes,
    partiesRecsRes,
    legalRecsRes,
    refRecsRes,
    remarkRecsRes,
  ] = await Promise.allSettled([
    MasterRealPropApi.fetchAcrisRecordsByDocumentIds(finalIds),
    PartiesRealPropApi.fetchAcrisRecordsByDocumentIds(finalIds),
    LegalsRealPropApi.fetchAcrisRecordsByDocumentIds(finalIds),
    ReferencesRealPropApi.fetchAcrisRecordsByDocumentIds(finalIds),
    RemarksRealPropApi.fetchAcrisRecordsByDocumentIds(finalIds),
  ]);

  // 5) Collect full‐records errors
  if (masterRecsRes.status === "rejected")
    errMsg.push(`Master Records: ${masterRecsRes.reason.message}`);
  if (partiesRecsRes.status === "rejected")
    errMsg.push(`Party Records: ${partiesRecsRes.reason.message}`);
  if (legalRecsRes.status === "rejected")
    errMsg.push(`Legal Records: ${legalRecsRes.reason.message}`);
  if (refRecsRes.status === "rejected")
    errMsg.push(`Reference Records: ${refRecsRes.reason.message}`);
  if (remarkRecsRes.status === "rejected")
    errMsg.push(`Remark Records: ${remarkRecsRes.reason.message}`);

  // Bail if any full‐records errors
  if (errMsg.length) {
    return res.json({ dataFound: false, errMsg });
  }

  // 6) Unwrap and build results
  const masterRecords = masterRecsRes.value || [];
  const partiesRecords = partiesRecsRes.value || [];
  const legalsRecords = legalRecsRes.value || [];
  const referencesRecords = refRecsRes.value || [];
  const remarksRecords = remarkRecsRes.value || [];

  const results = finalIds.map((document_id) => ({
    document_id,
    masterRecords: masterRecords.filter((r) => r.document_id === document_id),
    partiesRecords: partiesRecords.filter((r) => r.document_id === document_id),
    legalsRecords: legalsRecords.filter((r) => r.document_id === document_id),
    referencesRecords: referencesRecords.filter(
      (r) => r.document_id === document_id
    ),
    remarksRecords: remarksRecords.filter((r) => r.document_id === document_id),
  }));


  return res.json({ dataFound: true, results });
});

module.exports = router;
