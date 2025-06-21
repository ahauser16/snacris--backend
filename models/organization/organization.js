"use strict";

const db = require("../../db");
const { sqlForPartialUpdate } = require("../../helpers/sql");
const { NotFoundError, BadRequestError } = require("../../expressError");

class Organization {
    /** Create a new organization.
     * data: { name, description, createdBy }
     * Returns: { id, name, description, createdBy, createdAt, isActive }
     */
    static async create({ name, description, createdBy }) {
        const duplicateCheck = await db.query(
            `SELECT id FROM organizations WHERE name = $1`,
            [name]
        );
        if (duplicateCheck.rows[0]) {
            throw new BadRequestError(`Duplicate organization: ${name}`);
        }

        const result = await db.query(
            `INSERT INTO organizations
         (name, description, created_by)
       VALUES ($1, $2, $3)
       RETURNING id, name, description, created_by AS "createdBy", created_at AS "createdAt", is_active AS "isActive"`,
            [name, description, createdBy]
        );
        return result.rows[0];
    }

    /** Find organization by id.
     * Returns: { id, name, description, createdBy, createdAt, isActive }
     * Throws NotFoundError if not found.
     */
    static async get(id) {
        const result = await db.query(
            `SELECT id, name, description, created_by AS "createdBy", created_at AS "createdAt", is_active AS "isActive"
       FROM organizations
       WHERE id = $1`,
            [id]
        );
        const org = result.rows[0];
        if (!org) throw new NotFoundError(`No organization: ${id}`);
        return org;
    }

    /** Get all members of an organization.
     * Returns: [{ username, role, status, requestedAt, approvedAt, approvedBy }, ...]
     * Throws NotFoundError if organization does not exist.
     */
    static async getMembers(organizationId) {
        // Optionally, check if the organization exists
        const orgCheck = await db.query(
            `SELECT id FROM organizations WHERE id = $1`,
            [organizationId]
        );
        if (!orgCheck.rows[0])
            throw new NotFoundError(`No organization: ${organizationId}`);

        const result = await db.query(
            `SELECT username, role, status, requested_at AS "requestedAt", approved_at AS "approvedAt", approved_by AS "approvedBy"
       FROM organization_memberships
       WHERE organization_id = $1
       ORDER BY username`,
            [organizationId]
        );
        return result.rows;
    }

    /** Update organization data with `data`.
     * Data can include: { name, description, isActive }
     * Returns: { id, name, description, createdBy, createdAt, isActive }
     * Throws NotFoundError if not found.
     */
    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(data, {
            isActive: "is_active",
            createdBy: "created_by",
            createdAt: "created_at",
        });
        const idVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE organizations
                      SET ${setCols}
                      WHERE id = ${idVarIdx}
                      RETURNING id, name, description, created_by AS "createdBy", created_at AS "createdAt", is_active AS "isActive"`;
        const result = await db.query(querySql, [...values, id]);
        const org = result.rows[0];
        if (!org) throw new NotFoundError(`No organization: ${id}`);
        return org;
    }

    /** Delete organization by id. Returns undefined.
     * Throws NotFoundError if not found.
     */
    static async remove(id) {
        const result = await db.query(
            `DELETE FROM organizations
       WHERE id = $1
       RETURNING id`,
            [id]
        );
        const org = result.rows[0];
        if (!org) throw new NotFoundError(`No organization: ${id}`);
    }

    /** Find all organizations, or all for a given user.
     * If username is provided, returns only organizations the user is a member of.
     * Returns: [{ id, name, description, createdBy, createdAt, isActive }, ...]
     */
    static async findAll(filters = {}, username = null) {
        let baseQuery,
            whereExpressions = [],
            queryValues = [];

        // Build WHERE clauses for filters
        if (filters.name) {
            queryValues.push(`%${filters.name}%`);
            whereExpressions.push(`o.name ILIKE $${queryValues.length}`);
        }
        if (filters.description) {
            queryValues.push(`%${filters.description}%`);
            whereExpressions.push(`o.description ILIKE $${queryValues.length}`);
        }
        if (filters.isActive !== undefined) {
            queryValues.push(filters.isActive);
            whereExpressions.push(`o.is_active = $${queryValues.length}`);
        }
        if (filters.createdBy) {
            queryValues.push(filters.createdBy);
            whereExpressions.push(`o.created_by = $${queryValues.length}`);
        }

        if (username) {
            // User-specific organizations
            baseQuery = `
      SELECT o.id, o.name, o.description, o.created_by AS "createdBy", o.created_at AS "createdAt", o.is_active AS "isActive"
      FROM organizations o
      JOIN organization_memberships m ON o.id = m.organization_id
      WHERE m.username = $${queryValues.length + 1}
    `;
            queryValues.push(username);
        } else {
            // All organizations
            baseQuery = `
      SELECT o.id, o.name, o.description, o.created_by AS "createdBy", o.created_at AS "createdAt", o.is_active AS "isActive"
      FROM organizations o
    `;
        }

        // Combine WHERE clauses
        let whereClause = "";
        if (whereExpressions.length > 0) {
            whereClause = username
                ? " AND " + whereExpressions.join(" AND ")
                : " WHERE " + whereExpressions.join(" AND ");
        }

        const finalQuery = baseQuery + whereClause + " ORDER BY o.name";
        const result = await db.query(finalQuery, queryValues);
        return result.rows;
    }


    static async findAllForUser(username) {
        // Organizations where user is a member OR creator
        const result = await db.query(
            `
    SELECT DISTINCT o.id, o.name, o.description, o.created_by AS "createdBy", o.created_at AS "createdAt", o.is_active AS "isActive"
    FROM organizations o
    LEFT JOIN organization_memberships m ON o.id = m.organization_id
    WHERE o.created_by = $1 OR m.username = $1
    ORDER BY o.name
    `,
            [username]
        );
        return result.rows;
    }

}

module.exports = Organization;
