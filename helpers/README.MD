# helper function notes

### `genSqlSetWhere`

```js
const { BadRequestError } = require("../expressError");

function genSqlSetWhere(searchCriteria) {
  const keys = Object.keys(searchCriteria);
  if (keys.length === 0) throw new BadRequestError("No search criteria");
  const whereCols = keys.map((colName, idx) => `"${colName}"=$${idx + 1}`);
  return {
    whereClause: whereCols.join(" AND "),
    values: Object.values(searchCriteria),
  };
}

module.exports = { genSqlSetWhere };
```

#### Example Usage of `genSqlSetWhere`

Given the `searchCriteria` object:
```js
const searchCriteria = { doc_type: 'deed', recorded_borough: 'Manhattan' };
```

The `genSqlSetWhere` function will transform it into:
```js
{
  whereClause: '"doc_type"=$1 AND "recorded_borough"=$2',
  values: ['deed', 'Manhattan']
}
```

### `searchByUser` from `models` folder

```js
static async searchByUser(username, searchCriteria) {
    const { whereClause, values } = genSqlSetWhere(searchCriteria);
    const querySql = `SELECT arm.document_id, arm.record_type, arm.crfn, arm.recorded_borough, arm.doc_type, arm.document_date, arm.document_amt, arm.recorded_datetime, arm.modified_date, arm.reel_yr, arm.reel_nbr, arm.reel_pg, arm.percent_trans, arm.good_through_date
                      FROM acris_real_property_master arm
                      JOIN user_saved_real_property_master usr ON arm.document_id = usr.document_id
                      WHERE usr.username = $1 AND ${whereClause}
                      ORDER BY arm.document_id`;
    const result = await db.query(querySql, [username, ...values]);

    if (result.rows.length === 0) {
      throw new NotFoundError(`No records found for user: ${username} with criteria: ${JSON.stringify(searchCriteria)}`);
    }

    return result.rows;
  }
```


#### Explanation of `searchByUser` function (from `realPropertyMaster.js` within the `models` folder) that implements `genSqlSetWhere`

The `searchByUser` function allows a user to search for records they have saved based on various search criteria. It constructs a dynamic SQL query using the provided search criteria and returns the matching records.

The code below defines a static asynchronous method named `searchByUser` that takes two parameters:
- `username`: The username of the user performing the search.
- `searchCriteria`: An object containing the search criteria.

```js
static async searchByUser(username, searchCriteria) {
```

---

The code below calls the `genSqlSetWhere` function with `searchCriteria` as an argument. The function returns an object with `whereClause` and `values` properties. These are destructured into `whereClause` and `values` variables.

```js
const { whereClause, values } = genSqlSetWhere(searchCriteria);
```

---

The code block below constructs the SQL query string `querySql` using template literals. The query performs the following operations:
- `SELECT`: Specifies the columns to retrieve from the `acris_real_property_master` table (aliased as `arm`).
- `FROM`: Specifies the `acris_real_property_master` table (aliased as `arm`).
- `JOIN`: Joins the `user_saved_real_property_master` table (aliased as `usr`) on the `document_id` column.
- `WHERE`: Filters the results to include only records where `usr.username` matches the provided username (`$1` is a placeholder for the username) and the conditions specified in `whereClause`.
- `ORDER BY`: Orders the results by `document_id`.

```js
const querySql = `SELECT arm.document_id, arm.record_type, arm.crfn, arm.recorded_borough, arm.doc_type, arm.document_date, arm.document_amt, arm.recorded_datetime, arm.modified_date, arm.reel_yr, arm.reel_nbr, arm.reel_pg, arm.percent_trans, arm.good_through_date
                  FROM acris_real_property_master arm
                  JOIN user_saved_real_property_master usr ON arm.document_id = usr.document_id
                  WHERE usr.username = $1 AND ${whereClause}
                  ORDER BY arm.document_id`;
```

---

The code below executes the SQL query using the `db.query` method. It passes the `querySql` string and an array of values `[username, ...values]` as arguments. The `...values` syntax spreads the `values` array into individual elements. The `await` keyword ensures that the method waits for the query to complete before proceeding.  The result of the query is stored in the `result` variable.

```js
const result = await db.query(querySql, [username, ...values]);
```