const { query }      = require('../config/db');
const { uploadToS3, getPresignedUrl } = require('../utils/s3.utils');
const { generateFileKey } = require('../utils/encryption');

exports.getVersions = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT v.*, u.name as uploaded_by_name
       FROM versions v
       LEFT JOIN users u ON v.uploaded_by = u.id
       WHERE v.document_id = $1
       ORDER BY v.version_number DESC`,
      [req.params.docId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
};

exports.uploadVersion = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const { comment = 'New version' } = req.body;
    const docResult = await query('SELECT * FROM documents WHERE id = $1', [req.params.docId]);
    if (!docResult.rows[0]) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    const doc = docResult.rows[0];
    const versionResult = await query(
      'SELECT MAX(version_number) as max_version FROM versions WHERE document_id = $1',
      [doc.id]
    );
    const nextVersion = (versionResult.rows[0].max_version || 0) + 1;
    const s3Key = generateFileKey(req.user.id, req.file.originalname);

    await uploadToS3(req.file.buffer, s3Key, req.file.mimetype);

    const version = await query(
      `INSERT INTO versions (document_id, version_number, s3_key, file_size, uploaded_by, comment)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [doc.id, nextVersion, s3Key, req.file.size, req.user.id, comment]
    );

    await query('UPDATE documents SET s3_key = $1, updated_at = NOW() WHERE id = $2', [s3Key, doc.id]);
    await query(
      `INSERT INTO audit_logs (user_id, document_id, action, details)
       VALUES ($1, $2, 'upload', $3)`,
      [req.user.id, doc.id, JSON.stringify({ version: nextVersion, comment })]
    );

    res.status(201).json({ success: true, data: version.rows[0] });
  } catch (err) { next(err); }
};

exports.restoreVersion = async (req, res, next) => {
  try {
    const version = await query('SELECT * FROM versions WHERE id = $1', [req.params.versionId]);
    if (!version.rows[0]) {
      return res.status(404).json({ success: false, message: 'Version not found' });
    }
    await query(
      'UPDATE documents SET s3_key = $1, updated_at = NOW() WHERE id = $2',
      [version.rows[0].s3_key, req.params.docId]
    );
    await query(
      `INSERT INTO audit_logs (user_id, document_id, action, details)
       VALUES ($1, $2, 'restore', $3)`,
      [req.user.id, req.params.docId, JSON.stringify({ restored_version: version.rows[0].version_number })]
    );
    res.json({ success: true, message: `Restored to version ${version.rows[0].version_number}` });
  } catch (err) { next(err); }
};