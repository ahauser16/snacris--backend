"use strict";

const express = require("express");
const MasterRealPropApi = require("../../../thirdPartyApi/acris/real-property/MasterRealPropApi");
const PartiesRealPropApi = require("../../../thirdPartyApi/acris/real-property/PartiesRealPropApi");
const LegalsRealPropApi = require("../../../thirdPartyApi/acris/real-property/LegalsRealPropApi");
const ReferencesRealPropApi = require("../../../thirdPartyApi/acris/real-property/ReferencesRealPropApi");
const RemarksRealPropApi = require("../../../thirdPartyApi/acris/real-property/RemarksRealPropApi");

const router = new express.Router();

router.get("/fetchRecord", async function (req, res, next) {
  const errMsg = [];
  const { masterSearchTerms = {} } = req.query;

  // 1) Determine document_id (direct or via CRFN)
  let documentIdToQuery = null;
  if (masterSearchTerms.document_id) {
    documentIdToQuery = masterSearchTerms.document_id;
  } else if (masterSearchTerms.crfn) {
    try {
      const recs = await MasterRealPropApi.fetchAcrisRecords({
        crfn: masterSearchTerms.crfn,
      });
      if (!Array.isArray(recs) || recs.length === 0) {
        errMsg.push(
          `No master record found for crfn: ${masterSearchTerms.crfn}`
        );
      } else {
        documentIdToQuery = recs[0].document_id;
      }
    } catch (err) {
      errMsg.push(`Master Records: ${err.message}`);
    }
  } else {
    errMsg.push("Must provide either document_id or crfn.");
  }

  if (errMsg.length || !documentIdToQuery) {
    return res.json({ dataFound: false, errMsg });
  }

  const finalIds = [documentIdToQuery];
  console.log(`finalIds is equal to: `, finalIds);

  // 2) Fetch full records in parallel
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

  // 3) Collect any full-records errors
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

  if (errMsg.length) {
    return res.json({ dataFound: false, errMsg });
  }

  // 4) Unwrap and build results
  const masterRecords = masterRecsRes.value || [];
  const partyRecords = partiesRecsRes.value || [];
  const legalRecords = legalRecsRes.value || [];
  const referencesRecords = refRecsRes.value || [];
  const remarksRecords = remarkRecsRes.value || [];

  const results = finalIds.map((document_id) => ({
    document_id,
    masterRecords: masterRecords.filter((r) => r.document_id === document_id),
    partiesRecords: partyRecords.filter((r) => r.document_id === document_id),
    legalsRecords: legalRecords.filter((r) => r.document_id === document_id),
    referencesRecords: referencesRecords.filter(
      (r) => r.document_id === document_id
    ),
    remarksRecords: remarksRecords.filter((r) => r.document_id === document_id),
  }));

  return res.json({ dataFound: true, results });
});

module.exports = router;
