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
    const keys = Object.keys(searchCriteria);

    if (keys.length === 0) throw new BadRequestError("No search criteria");

    const whereCols = keys.map((colName, idx) =>
        `"${colName}"=$${idx + 2}`,
    );

    return {
        whereClause: whereCols.join(" AND "),
        values: Object.values(searchCriteria),
    };
}

module.exports = { genSqlSetWhere };