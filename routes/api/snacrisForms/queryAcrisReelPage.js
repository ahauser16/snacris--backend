"use strict";

const express = require("express");
const MasterRealPropApi = require("../../../thirdPartyApi/acris/real-property/MasterRealPropApi");
const LegalsRealPropApi = require("../../../thirdPartyApi/acris/real-property/LegalsRealPropApi");
const PartiesRealPropApi = require("../../../thirdPartyApi/acris/real-property/PartiesRealPropApi");
const ReferencesRealPropApi = require("../../../thirdPartyApi/acris/real-property/ReferencesRealPropApi");
const RemarksRealPropApi = require("../../../thirdPartyApi/acris/real-property/RemarksRealPropApi");

const router = new express.Router();

router.get("/fetchRecord", async function (req, res, next) {
  const errMsg = [];
  const { masterSearchTerms, legalsSearchTerms } = req.query;

  // Build masterQueryParams from reel_yr, reel_nbr, reel_pg
  const masterQueryParams = {};
  if (masterSearchTerms?.reel_yr)
    masterQueryParams.reel_yr = masterSearchTerms.reel_yr;
  if (masterSearchTerms?.reel_nbr)
    masterQueryParams.reel_nbr = masterSearchTerms.reel_nbr;
  if (masterSearchTerms?.reel_pg)
    masterQueryParams.reel_pg = masterSearchTerms.reel_pg;

  // Validate required master params
  if (
    !masterQueryParams.reel_yr ||
    !masterQueryParams.reel_nbr ||
    !masterQueryParams.reel_pg
  ) {
    errMsg.push(
      "reel_yr, reel_nbr, and reel_pg are required in masterSearchTerms."
    );
  }

  // Build legalsQueryParams from borough
  const legalsQueryParams = {};
  if (legalsSearchTerms?.borough)
    legalsQueryParams.borough = legalsSearchTerms.borough;

  // Validate required legals param
  if (!legalsQueryParams.borough) {
    errMsg.push("borough is required in legalsSearchTerms.");
  }

  if (errMsg.length > 0) {
    return res.json({ dataFound: false, errMsg });
  }

  if (errMsg.length > 0) {
    return res.json({ dataFound: false, errMsg });
  }

  // Step 1: Fetch master document IDs and cross-reference with Legals
  let crossReferencedDocumentIds = [];
  try {
    const masterRecordsDocumentIds =
      await MasterRealPropApi.fetchAcrisDocumentIds(masterQueryParams);

    if (masterRecordsDocumentIds && masterRecordsDocumentIds.length > 0) {
      crossReferencedDocumentIds =
        await LegalsRealPropApi.fetchAcrisDocumentIdsCrossRef(
          legalsQueryParams,
          masterRecordsDocumentIds
        );
    } else {
      errMsg.push("No master records found for the provided reel parameters.");
    }
  } catch (err) {
    errMsg.push(`Error fetching document IDs: ${err.message}`);
  }

  if (errMsg.length > 0 || crossReferencedDocumentIds.length === 0) {
    return res.json({ dataFound: false, errMsg });
  }

  // Step 2: Fetch full records from all datasets in parallel
  const [
    masterRecsRes,
    partiesRecsRes,
    legalRecsRes,
    refRecsRes,
    remarkRecsRes,
  ] = await Promise.allSettled([
    MasterRealPropApi.fetchAcrisRecordsByDocumentIds(
      crossReferencedDocumentIds
    ),
    PartiesRealPropApi.fetchAcrisRecordsByDocumentIds(
      crossReferencedDocumentIds
    ),
    LegalsRealPropApi.fetchAcrisRecordsByDocumentIds(
      crossReferencedDocumentIds
    ),
    ReferencesRealPropApi.fetchAcrisRecordsByDocumentIds(
      crossReferencedDocumentIds
    ),
    RemarksRealPropApi.fetchAcrisRecordsByDocumentIds(
      crossReferencedDocumentIds
    ),
  ]);

  // Step 3: Collect any full-records errors
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

  if (errMsg.length > 0) {
    return res.json({ dataFound: false, errMsg });
  }

  // Step 4: Unwrap and build results
  const masterRecords = masterRecsRes.value || [];
  const partyRecords = partiesRecsRes.value || [];
  const legalRecords = legalRecsRes.value || [];
  const referencesRecords = refRecsRes.value || [];
  const remarksRecords = remarkRecsRes.value || [];

  const results = crossReferencedDocumentIds.map((document_id) => ({
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
