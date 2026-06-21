const { query } = require('../config/db');

const AuditLog = {
  create: async ({ userId, documentId, action, details = {}, ipAddress, userAgent }) => {
    const res = await query(
      `INSERT INTO audit_logs
         (user_id, document_id, action, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, documentId, action, JSON.stringify(details), ipAddress, userAgent]
    );
    return res.rows[0];
  },

  getByDocument: async (documentId, { page = 1, limit = 50 } = {}) => {
    const res = await query(
      `SELECT al.*, u.name AS user_name, u.email AS user_email
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.document_id = $1
       ORDER BY al.created_at DESC
       LIMIT $2 OFFSET $3`,
      [documentId, Number(limit), (Number(page) - 1) * Number(limit)]
    );
    return res.rows;
  },

  getAll: async ({ action, page = 1, limit = 50 } = {}) => {
    let sql = `
      SELECT al.*, u.name AS user_name, d.name AS document_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      LEFT JOIN documents d ON al.document_id = d.id
      WHERE 1=1
    `;
    const params = [];
    let   idx    = 1;

    if (action) {
      sql += ` AND al.action = $${idx}`;
      params.push(action);
      idx++;
    }

    sql += ` ORDER BY al.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(Number(limit), (Number(page) - 1) * Number(limit));

    const res = await query(sql, params);
    return res.rows;
  },
};

module.exports = AuditLog;