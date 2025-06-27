const express = require("express");
const {
  getSavedRealPropertyDocument,
  saveRealPropertyDocument,
  deleteRealPropertyDocument
} = require("../../../../models/acris/real-property/realProperty");
const { ensureLoggedIn, ensureAdmin } = require("../../../../middleware/auth");

const router = new express.Router();

/** GET /documents => { documents: [...] }
 *  Fetch all saved real‐property docs for current user
 */
router.get(
  "/documents",
  ensureLoggedIn,
  async function (req, res, next) {
    try {
      const documents = await getSavedRealPropertyDocument(res.locals.user.username);
      return res.json({ documents });
    } catch (err) {
      return next(err);
    }
  }
);

/** GET /document/:documentId => { document }
 *  Fetch one saved real‐property doc by document_id for current user
 */
router.get(
  "/document/:documentId",
  ensureLoggedIn,
  async function (req, res, next) {
    try {
      const document = await getSavedRealPropertyDocument(
        res.locals.user.username,
        req.params.documentId
      );
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      return res.json({ document });
    } catch (err) {
      return next(err);
    }
  }
);

/** POST /document => { savedMasterId }
 *  Save (insert or update) a full real‐property doc for current user
 */
router.post(
  "/document",
  ensureLoggedIn,
  async function (req, res, next) {
    try {
      const savedMasterId = await saveRealPropertyDocument(
        res.locals.user.username,
        req.body
      );
      return res.status(201).json({ savedMasterId });
    } catch (err) {
      return next(err);
    }
  }
);

/** DELETE /document/:documentId => { deletedMasterId }
 *  Delete a saved real‐property doc for current user
 */
router.delete(
  "/document/:documentId",
  ensureLoggedIn,
  async function (req, res, next) {
    try {
      const deletedMasterId = await deleteRealPropertyDocument(
        res.locals.user.username,
        req.params.documentId
      );
      if (!deletedMasterId) {
        return res.status(404).json({ error: "Document not found" });
      }
      return res.json({ deletedMasterId });
    } catch (err) {
      return next(err);
    }
  }
);

/** GET /admin/documents/:username => { documents: [...] }
 *  Admin fetch all saved real‐property docs for any user
 */
router.get(
  "/admin/documents/:username",
  ensureAdmin,
  async function (req, res, next) {
    try {
      const documents = await getSavedRealPropertyDocument(req.params.username);
      return res.json({ documents });
    } catch (err) {
      return next(err);
    }
  }
);

/** GET /admin/document/:username/:documentId => { document }
 *  Admin fetch one saved real‐property doc by document_id for any user
 */
router.get(
  "/admin/document/:username/:documentId",
  ensureAdmin,
  async function (req, res, next) {
    try {
      const document = await getSavedRealPropertyDocument(
        req.params.username,
        req.params.documentId
      );
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      return res.json({ document });
    } catch (err) {
      return next(err);
    }
  }
);

/** POST /admin/document/:username => { savedMasterId }
 *  Admin save (insert or update) a full real‐property doc for any user
 */
router.post(
  "/admin/document/:username",
  ensureAdmin,
  async function (req, res, next) {
    try {
      const savedMasterId = await saveRealPropertyDocument(
        req.params.username,
        req.body
      );
      return res.status(201).json({ savedMasterId });
    } catch (err) {
      return next(err);
    }
  }
);

/** DELETE /admin/document/:username/:documentId => { deletedMasterId }
 *  Admin delete a saved real‐property doc for any user
 */
router.delete(
  "/admin/document/:username/:documentId",
  ensureAdmin,
  async function (req, res, next) {
    try {
      const deletedMasterId = await deleteRealPropertyDocument(
        req.params.username,
        req.params.documentId
      );
      if (!deletedMasterId) {
        return res.status(404).json({ error: "Document not found" });
      }
      return res.json({ deletedMasterId });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;

