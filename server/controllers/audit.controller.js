const { query } = require('../config/db');

exports.getAuditLogs = async (req, res, next) => {
  try {
    const { docId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const result = await query(
      `SELECT al.*, u.name as user_name, u.email as user_email
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.document_id = $1
       ORDER BY al.created_at DESC
       LIMIT $2 OFFSET $3`,
      [docId, Number(limit), (Number(page) - 1) * Number(limit)]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
};

exports.getAllAuditLogs = async (req, res, next) => {
  try {
    const { action, page = 1, limit = 50 } = req.query;
    let sql = `
      SELECT al.*, u.name as user_name, d.name as document_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      LEFT JOIN documents d ON al.document_id = d.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (action) {
      sql += ` AND al.action = $${idx}`;
      params.push(action); idx++;
    }

    sql += ` ORDER BY al.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(Number(limit), (Number(page) - 1) * Number(limit));

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
};