const { query } = require('../config/db');

const Document = {
  getAll: async (userId, filters = {}) => {
    let sql = `
      SELECT d.*, u.name AS owner_name,
        ARRAY(
          SELECT t.name FROM tags t
          JOIN document_tags dt ON t.id = dt.tag_id
          WHERE dt.document_id = d.id
        ) AS tags
      FROM documents d
      LEFT JOIN users u ON d.owner_id = u.id
      WHERE d.is_deleted = false
      AND (d.owner_id = $1 OR d.id IN (
        SELECT document_id FROM permissions WHERE user_id = $1
      ))
    `;
    const params = [userId];
    let   idx    = 2;

    if (filters.search) {
      sql += ` AND (d.name ILIKE $${idx} OR d.description ILIKE $${idx})`;
      params.push(`%${filters.search}%`);
      idx++;
    }
    if (filters.folder) {
      sql += ` AND d.folder = $${idx}`;
      params.push(filters.folder);
      idx++;
    }

    sql += ' ORDER BY d.created_at DESC';
    const res = await query(sql, params);
    return res.rows;
  },

  findById: async (id) => {
    const res = await query(
      `SELECT d.*, u.name AS owner_name
       FROM documents d
       LEFT JOIN users u ON d.owner_id = u.id
       WHERE d.id = $1 AND d.is_deleted = false`,
      [id]
    );
    return res.rows[0] || null;
  },

  create: async ({ name, description, fileType, fileSize, s3Key, ownerId, folder = '/' }) => {
    const res = await query(
      `INSERT INTO documents
         (name, description, file_type, file_size, s3_key, owner_id, folder, is_encrypted)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       RETURNING *`,
      [name, description, fileType, fileSize, s3Key, ownerId, folder]
    );
    return res.rows[0];
  },

  update: async (id, fields) => {
    const allowed = ['name', 'description', 's3_key', 'folder'];
    const updates = [];
    const values  = [];
    let   idx     = 1;

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        updates.push(`${key} = $${idx}`);
        values.push(fields[key]);
        idx++;
      }
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const res = await query(
      `UPDATE documents SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return res.rows[0];
  },

  softDelete: async (id) => {
    await query(
      'UPDATE documents SET is_deleted = true, updated_at = NOW() WHERE id = $1',
      [id]
    );
  },

  updateS3Key: async (id, s3Key) => {
    await query(
      'UPDATE documents SET s3_key = $1, updated_at = NOW() WHERE id = $2',
      [s3Key, id]
    );
  },
};

module.exports = Document;