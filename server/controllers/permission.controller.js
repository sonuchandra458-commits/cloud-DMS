const { query } = require('../config/db');

exports.shareDocument = async (req, res, next) => {
  try {
    const { userId, permission } = req.body;
    const { docId } = req.params;

    const doc = await query(
      'SELECT * FROM documents WHERE id = $1 AND owner_id = $2',
      [docId, req.user.id]
    );
    if (!doc.rows[0]) {
      return res.status(403).json({ success: false, message: 'Not authorized to share this document' });
    }

    const result = await query(
      `INSERT INTO permissions (document_id, user_id, permission, granted_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (document_id, user_id)
       DO UPDATE SET permission = $3
       RETURNING *`,
      [docId, userId, permission, req.user.id]
    );

    await query(
      `INSERT INTO audit_logs (user_id, document_id, action, details)
       VALUES ($1, $2, 'share', $3)`,
      [req.user.id, docId, JSON.stringify({ shared_with: userId, permission })]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

exports.getPermissions = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT p.*, u.name as user_name, u.email as user_email
       FROM permissions p
       JOIN users u ON p.user_id = u.id
       WHERE p.document_id = $1`,
      [req.params.docId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
};

exports.removePermission = async (req, res, next) => {
  try {
    await query(
      'DELETE FROM permissions WHERE document_id = $1 AND user_id = $2',
      [req.params.docId, req.params.userId]
    );
    res.json({ success: true, message: 'Permission removed' });
  } catch (err) { next(err); }
};