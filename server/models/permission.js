const { query } = require('../config/db');

const Permission = {
  getByDocument: async (documentId) => {
    const res = await query(
      `SELECT p.*, u.name AS user_name, u.email AS user_email
       FROM permissions p
       JOIN users u ON p.user_id = u.id
       WHERE p.document_id = $1`,
      [documentId]
    );
    return res.rows;
  },

  getByUser: async (userId) => {
    const res = await query(
      `SELECT p.*, d.name AS document_name
       FROM permissions p
       JOIN documents d ON p.document_id = d.id
       WHERE p.user_id = $1`,
      [userId]
    );
    return res.rows;
  },

  upsert: async ({ documentId, userId, permission, grantedBy }) => {
    const res = await query(
      `INSERT INTO permissions (document_id, user_id, permission, granted_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (document_id, user_id)
       DO UPDATE SET permission = $3
       RETURNING *`,
      [documentId, userId, permission, grantedBy]
    );
    return res.rows[0];
  },

  remove: async (documentId, userId) => {
    await query(
      'DELETE FROM permissions WHERE document_id = $1 AND user_id = $2',
      [documentId, userId]
    );
  },

  check: async (documentId, userId) => {
    const res = await query(
      'SELECT * FROM permissions WHERE document_id = $1 AND user_id = $2',
      [documentId, userId]
    );
    return res.rows[0] || null;
  },
};

module.exports = Permission;