"use strict";

const express = require("express");
const jsonschema = require("jsonschema");
const { ensureAdmin, ensureLoggedIn } = require("../../../middleware/auth");
const Organization = require("../../../models/organization/organization");
const { BadRequestError } = require("../../../expressError");

const organizationNewSchema = require("../../../schemas/organization/organizationNew.json");
const organizationUpdateSchema = require("../../../schemas/organization/organizationUpdate.json");

const router = new express.Router();

/** POST / { organization } => { organization }
 * Authorization: admin
 */
router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, organizationNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    const org = await Organization.create(req.body);
    return res.status(201).json({ organization: org });
  } catch (err) {
    return next(err);
  }
});


router.get("/my", ensureLoggedIn, async function (req, res, next) {
  try {
    const username = res.locals.user.username;
    const orgs = await Organization.findAllForUser(username);
    return res.json({ organizations: orgs });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id] => { organization }
 * Authorization: logged in
 */
router.get("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const org = await Organization.get(Number(req.params.id));
    return res.json({ organization: org });
  } catch (err) {
    return next(err);
  }
});

/** GET /:id/members => { members: [...] }
 * Returns all members of the organization.
 * Authorization: logged in
 */
router.get("/:id/members", ensureLoggedIn, async function (req, res, next) {
  try {
    const members = await Organization.getMembers(Number(req.params.id));
    return res.json({ members });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[id] { data } => { organization }
 * Authorization: admin
 */
router.patch("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const org = await Organization.get(Number(req.params.id));
    if (org.createdBy !== res.locals.user.username) {
      throw new UnauthorizedError("Only the creator can update this organization.");
    }

    // Add this validation:
    const validator = jsonschema.validate(req.body, organizationUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const updated = await Organization.update(Number(req.params.id), req.body);
    return res.json({ organization: updated });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[id] => { deleted: id }
 * Authorization: admin
 */
router.delete("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const org = await Organization.get(Number(req.params.id));
    if (org.createdBy !== res.locals.user.username) {
      throw new UnauthorizedError("Only the creator can delete this organization.");
    }
    await Organization.remove(Number(req.params.id));
    return res.json({ deleted: Number(req.params.id) });
  } catch (err) {
    return next(err);
  }
});

/** GET / => { organizations: [...] }
 * Optionally filter by ?username=...
 * Authorization: logged in
 */
router.get("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const username = req.query.username || req.user?.username;
    const orgs = await Organization.findAll(username);
    return res.json({ organizations: orgs });
  } catch (err) {
    return next(err);
  }
});



module.exports = router;