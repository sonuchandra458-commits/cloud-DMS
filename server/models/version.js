const { query } = require('../config/db');

const Version = {
  getByDocument: async (documentId) => {
    const res = await query(
      `SELECT v.*, u.name AS uploaded_by_name
       FROM versions v
       LEFT JOIN users u ON v.uploaded_by = u.id
       WHERE v.document_id = $1
       ORDER BY v.version_number DESC`,
      [documentId]
    );
    return res.rows;
  },

  getLatestNumber: async (documentId) => {
    const res = await query(
      'SELECT MAX(version_number) AS max_version FROM versions WHERE document_id = $1',
      [documentId]
    );
    return res.rows[0].max_version || 0;
  },

  create: async ({ documentId, versionNumber, s3Key, fileSize, uploadedBy, comment = 'New version' }) => {
    const res = await query(
      `INSERT INTO versions
         (document_id, version_number, s3_key, file_size, uploaded_by, comment)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [documentId, versionNumber, s3Key, fileSize, uploadedBy, comment]
    );
    return res.rows[0];
  },

  findById: async (id) => {
    const res = await query('SELECT * FROM versions WHERE id = $1', [id]);
    return res.rows[0] || null;
  },

  deleteByDocument: async (documentId) => {
    await query('DELETE FROM versions WHERE document_id = $1', [documentId]);
  },
};

module.exports = Version;