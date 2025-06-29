# Middleware related notes

Since the code map datasets are seeded in the database it is possible to create a middleware function that validates certain fields of the Real Property and Personal Property datasets.  For example, the Real Property Master dataset has a `doc_type` field which should only accept values that correspond to the Document Types Code Map field `doc__type` (the double `_` is intentional).  This has not been implemented into the codebase but I created the `validateDocType` function in the middleware folder.  This may not be worth implementing since the `code map` datasets are static and so it might add an unnecessary strain on the database to validate the schema for every CRUD operation.  However, it would be a useful learning experience so I may try implementing the `validateDocType` function and then hard-code the other Code Map dataset values into the `json` files.

Furthermore, it was recommended to me that the schema validation logic for each route could be extracted into its own middleware function `validateSchema`, however, I am not ready to implement this yet so I created the `validateSchema` function in the middleware folder.

