// middleware/validateSchema.js
const jsonschema = require("jsonschema");
const { BadRequestError } = require("../expressError");

/**
 * Middleware to validate request payloads against a schema.
 * @param {Object} schema - The JSON schema to validate against.
 */
function validateSchema(schema) {
  return (req, res, next) => {
    const validator = jsonschema.validate(req.body, schema);
    if (!validator.valid) {
      const errors = validator.errors.map((err) => err.stack);
      return next(new BadRequestError(errors));
    }
    next();
  };
}

module.exports = validateSchema;
