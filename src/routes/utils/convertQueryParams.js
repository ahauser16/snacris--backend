//The convertQueryParams function is specifically designed to convert query parameters to their expected types based on a schema. For the addRecordByUser, fetchRecordFromUserByDocumentId/:document_id, and deleteRecordByUser/:document_id routes, the data being handled is either in the request body or URL parameters, not query parameters. Therefore, the convertQueryParams function is not applicable to these routes.

function convertQueryParams(query, schema) {
    const convertedQuery = {};
  
    for (const key in query) {
      if (schema.properties[key]) {
        const type = schema.properties[key].type;
        const value = query[key];
  
        switch (type) {
          case 'integer':
            convertedQuery[key] = parseInt(value, 10);
            break;
          case 'number':
            convertedQuery[key] = parseFloat(value);
            break;
          case 'string':
            convertedQuery[key] = value;
            break;
          default:
            convertedQuery[key] = value;
        }
      }
    }
  
    return convertedQuery;
  }
  
  module.exports = { convertQueryParams };