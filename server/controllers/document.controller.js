const { query }           = require('../config/db');
const { uploadToS3, getPresignedUrl, deleteFromS3 } = require('../utils/s3.utils');
const { generateFileKey } = require('../utils/encryption');
const { v4: uuidv4 }      = require('uuid');

exports.getDocuments = async (req, res, next) => {
  try {
    const { folder = '/', search, tag } = req.query;
    let sql = `
      SELECT d.*, u.name as owner_name,
        ARRAY(SELECT t.name FROM tags t JOIN document_tags dt ON t.id = dt.tag_id WHERE dt.document_id = d.id) as tags
      FROM documents d
      LEFT JOIN users u ON d.owner_id = u.id
      WHERE d.is_deleted = false
      AND (d.owner_id = $1 OR d.id IN (
        SELECT document_id FROM permissions WHERE user_id = $1
      ))
    `;
    const params = [req.user.id];
    let idx = 2;

    if (search) {
      sql += ` AND (d.name ILIKE $${idx} OR d.description ILIKE $${idx})`;
      params.push(`%${search}%`); idx++;
    }
    if (folder) {
      sql += ` AND d.folder = $${idx}`;
      params.push(folder); idx++;
    }
    sql += ' ORDER BY d.created_at DESC';

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
};
exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const { description = '', folder = '/' } = req.body;
    const file = req.file;

    // Local storage mein file already save ho gayi
    const s3Key = `documents/${req.user.id}/${file.filename}`;
    const s3Url = `http://localhost:5000/uploads/${file.filename}`;

    const result = await query(
      `INSERT INTO documents (name, description, file_type, file_size, s3_key, owner_id, folder, is_encrypted)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false)
       RETURNING *`,
      [file.originalname, description, file.mimetype, file.size, s3Key, req.user.id, folder]
    );
    const doc = result.rows[0];

    await query(
      `INSERT INTO versions (document_id, version_number, s3_key, file_size, uploaded_by, comment)
       VALUES ($1, 1, $2, $3, $4, 'Initial upload')`,
      [doc.id, s3Key, file.size, req.user.id]
    );

    await query(
      `INSERT INTO audit_logs (user_id, document_id, action, details, ip_address)
       VALUES ($1, $2, 'upload', $3, $4)`,
      [req.user.id, doc.id, JSON.stringify({ filename: file.originalname }), req.ip]
    );

    res.status(201).json({ success: true, data: doc });
  } catch (err) { next(err); }
};


exports.getDocument = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT d.*, u.name as owner_name FROM documents d
       LEFT JOIN users u ON d.owner_id = u.id
       WHERE d.id = $1 AND d.is_deleted = false`,
      [req.params.id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    const doc        = result.rows[0];
    const signedUrl  = await getPresignedUrl(doc.s3_key, 3600);

    await query(
      `INSERT INTO audit_logs (user_id, document_id, action, ip_address)
       VALUES ($1, $2, 'view', $3)`,
      [req.user.id, doc.id, req.ip]
    );

    res.json({ success: true, data: { ...doc, download_url: signedUrl } });
  } catch (err) { next(err); }
};

exports.deleteDocument = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM documents WHERE id = $1 AND owner_id = $2',
      [req.params.id, req.user.id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: 'Document not found or not authorized' });
    }
    await query('UPDATE documents SET is_deleted = true WHERE id = $1', [req.params.id]);
    await query(
      `INSERT INTO audit_logs (user_id, document_id, action, ip_address)
       VALUES ($1, $2, 'delete', $3)`,
      [req.user.id, req.params.id, req.ip]
    );
    res.json({ success: true, message: 'Document deleted' });
  } catch (err) { next(err); }
};