// *
// *
// To run the script, use the following command in the terminal: `node convertJsonToSql.js <inputJsonFile> <outputSqlFile>`
// For example:
// --> node convertJsonToSql.js acris-doc-control-codes.json acris-doc-control-codes-output.sql
// --> node convertJsonToSql.js acris-property-type-codes.json acris-property-type-codes-output.sql
// --> node convertJsonToSql.js acris-ucc-collateral-codes.json acris-ucc-collateral-codes-output.sql
// --> node convertJsonToSql.js acris-usa-state-codes.json acris-usa-state-codes-output.sql
// --> node convertJsonToSql.js acris-country-codes.json acris-country-codes-output.sql
// --> node convertJsonToSql.js acris-real-property-legals.json acris-real-property-legals-output.sql
// --> node convertJsonToSql.js acris-real-property-references.json acris-real-property-references-output.sql
// *
// *

const fs = require("fs");

// Function to convert ACRIS Document Control Codes JSON to SQL
function convertDocControlCodesToSql(jsonArray) {
  let sql =
    "INSERT INTO document_control (record_type, doc_type, doc_type_description, class_code_description, party1_type, party2_type, party3_type)\nVALUES\n";

  const values = jsonArray.map((item) => {
    const party2Type = item.party2_type ? `'${item.party2_type}'` : "NULL";
    const party3Type = item.party3_type ? `'${item.party3_type}'` : "NULL";

    return `('${item.record_type}', '${item.doc__type}', '${item.doc__type_description}', '${item.class_code_description}', '${item.party1_type}', ${party2Type}, ${party3Type})`;
  });

  sql += values.join(",\n") + ";";
  return sql;
}

// Function to convert ACRIS Property Type Codes JSON to SQL
function convertPropTypeCodesToSql(jsonArray) {
  let sql =
    "INSERT INTO property_type_codes (record_type, property_type, description)\nVALUES\n";

  const values = jsonArray.map((item) => {
    return `('${item.record_type}', '${item.property_type}', '${item.description}')`;
  });

  sql += values.join(",\n") + ";";
  return sql;
}

// Function to convert ACRIS UCC Collateral Codes JSON to SQL
function convertUccCollateralCodesToSql(jsonArray) {
  let sql =
    "INSERT INTO ucc_collateral_codes (record_type, ucc_collateral_code, description)\nVALUES\n";

  const values = jsonArray.map((item) => {
    return `('${item.record_type}', '${item.ucc_collateral_code}', '${item.description}')`;
  });

  sql += values.join(",\n") + ";";
  return sql;
}

// Function to convert ACRIS State Codes JSON to SQL
function convertStateCodesToSql(jsonArray) {
  let sql =
    "INSERT INTO state_codes (record_type, state_code, description)\nVALUES\n";

  const values = jsonArray.map((item) => {
    return `('${item.record_type}', '${item.state_code}', '${item.description}')`;
  });

  sql += values.join(",\n") + ";";
  return sql;
}

// Function to convert ACRIS Country Codes JSON to SQL
function convertCountryCodesToSql(jsonArray) {
  let sql =
    "INSERT INTO country_codes (record_type, country_code, description)\nVALUES\n";

  const values = jsonArray.map((item) => {
    return `('${item.record_type}', '${item.country_code}', '${item.description}')`;
  });

  sql += values.join(",\n") + ";";
  return sql;
}

// Function to convert ACRIS Real Property Legals JSON to SQL
function convertRealPropertyLegalsDataToSql(jsonArray) {
  let sql =
    "INSERT INTO acris_real_property_legals (document_id, record_type, borough, block, lot, easement, partial_lot, air_rights, subterranean_rights, property_type, street_number, street_name, good_through_date)\nVALUES\n";

  const values = jsonArray.map((item) => {
    const streetNumber = item.street_number
      ? `'${item.street_number}'`
      : "NULL";
    const streetName = item.street_name ? `'${item.street_name}'` : "NULL";

    return `('${item.document_id}', '${item.record_type}', ${item.borough}, ${item.block}, ${item.lot}, '${item.easement}', '${item.partial_lot}', '${item.air_rights}', '${item.subterranean_rights}', '${item.property_type}', ${streetNumber}, ${streetName}, '${item.good_through_date}')`;
  });

  sql += values.join(",\n") + ";";
  return sql;
}

// Function to convert ACRIS Real Property References JSON to SQL
function convertRealPropertyReferencesDataToSql(jsonArray) {
  let sql =
    "INSERT INTO acris_real_property_references (document_id, record_type, reference_by_crfn_, reference_by_doc_id, reference_by_reel_year, reference_by_reel_borough, reference_by_reel_nbr, reference_by_reel_page, good_through_date)\nVALUES\n";

  const values = jsonArray.map((item) => {
    const referenceByCrfn = item.reference_by_crfn_
      ? `'${item.reference_by_crfn_}'`
      : "NULL";
    const referenceByDocId = item.reference_by_doc_id
      ? `'${item.reference_by_doc_id}'`
      : "NULL";

    return `('${item.document_id}', '${item.record_type}', ${referenceByCrfn}, ${referenceByDocId}, ${item.reference_by_reel_year}, ${item.reference_by_reel_borough}, ${item.reference_by_reel_nbr}, ${item.reference_by_reel_page}, '${item.good_through_date}')`;
  });

  sql += values.join(",\n") + ";";
  return sql;
}

// Main function to handle the conversion based on the input file
function convertJsonToSql(inputFile, outputFile) {
  const jsonData = JSON.parse(fs.readFileSync(inputFile, "utf8"));
  let sqlData;

  if (inputFile.includes("acris-doc-control")) {
    sqlData = convertDocControlCodesToSql(jsonData);
  } else if (inputFile.includes("acris-property-type-codes")) {
    sqlData = convertPropTypeCodesToSql(jsonData);
  } else if (inputFile.includes("acris-ucc-collateral-codes")) {
    sqlData = convertUccCollateralCodesToSql(jsonData);
  } else if (inputFile.includes("acris-usa-state-codes")) {
    sqlData = convertStateCodesToSql(jsonData);
  } else if (inputFile.includes("acris-country-codes")) {
    sqlData = convertCountryCodesToSql(jsonData);
  } else if (inputFile.includes("acris-real-property-legals")) {
    sqlData = convertRealPropertyLegalsDataToSql(jsonData);
  } else if (inputFile.includes("acris-real-property-references")) {
    sqlData = convertRealPropertyReferencesDataToSql(jsonData);
  } else {
    throw new Error("Unsupported JSON file format");
  }

  fs.writeFileSync(outputFile, sqlData);
}

// Get input and output file names from command line arguments
const inputFile = process.argv[2];
const outputFile = process.argv[3];

if (!inputFile || !outputFile) {
  console.error(
    "Usage: node convertJsonToSql.js <inputJsonFile> <outputSqlFile>"
  );
  process.exit(1);
}

// Convert JSON to SQL
convertJsonToSql(inputFile, outputFile);
