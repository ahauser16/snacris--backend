const { BadRequestError } = require("../expressError");

/**
 * The `genSqlSetWhere` function is a helper function designed to generate the `WHERE` clause of an SQL `SELECT` statement based on the provided search criteria. It transforms the search criteria object into a SQL-compatible format.
 *
 * @param searchCriteria {Object} {field1: value1, field2: value2, ...}
 *
 * @returns {Object} {whereClause, values}
 *
 * @example {doc_type: 'deed', recorded_borough: 'Manhattan'} =>
 *   { whereClause: '"doc_type"=$1 AND "recorded_borough"=$2',
 *     values: ['deed', 'Manhattan'] }
 */

function genSqlSetWhere(searchCriteria) {
    //Extracts the keys from the `searchCriteria` object and stores them in the keys array. For example, if `searchCriteria` is { doc_type: 'deed', recorded_borough: '1' }, keys will be ['doc_type', 'recorded_borough'].
    const keys = Object.keys(searchCriteria);

    //Checks if the keys array is empty. If it is, it throws a BadRequestError with the message "No search criteria".
    if (keys.length === 0) throw new BadRequestError("No search criteria");

    // Maps over the `keys` array to create an array of SQL conditions. Each condition is a string in the format `"column_name"=$index`, where `column_name` is the key from `searchCriteria` and `index` is the position of the key in the array (starting from 1). For example, if `keys` is `['doc_type', 'recorded_borough']`, `whereCols` will be `['"doc_type"=$1', '"recorded_borough"=$2']`.
    const whereCols = keys.map((colName, idx) =>
        `"${colName}"=$${idx + 1}`,
    );

    //Returns an object with two properties: `whereClause` and `values`
    //--> `whereClause`: A string that joins the elements of `whereCols` with " AND ". For example, `"doc_type"=$1 AND "recorded_borough"=$2`.  
    //--> `values`: An array of values from the `searchCriteria` object. For example, ['deed', 'Manhattan'].
    return {
        whereClause: whereCols.join(" AND "),
        values: Object.values(searchCriteria),
    };
}

module.exports = { genSqlSetWhere };