const { query } = require('../config/db');

const Tag = {
  getAll: async (name) => {
    if (name) {
      const res = await query(
        'SELECT * FROM tags WHERE name ILIKE $1 ORDER BY name',
        [`%${name}%`]
      );
      return res.rows;
    }
    const res = await query('SELECT * FROM tags ORDER BY name');
    return res.rows;
  },

  findByName: async (name) => {
    const res = await query(
      'SELECT * FROM tags WHERE name = $1',
      [name]
    );
    return res.rows[0] || null;
  },

  create: async ({ name, color = '#3b82f6', createdBy }) => {
    const res = await query(
      'INSERT INTO tags (name, color, created_by) VALUES ($1, $2, $3) RETURNING *',
      [name, color, createdBy]
    );
    return res.rows[0];
  },

  addToDocument: async (documentId, tagId) => {
    await query(
      `INSERT INTO document_tags (document_id, tag_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [documentId, tagId]
    );
  },

  removeFromDocument: async (documentId, tagId) => {
    await query(
      'DELETE FROM document_tags WHERE document_id = $1 AND tag_id = $2',
      [documentId, tagId]
    );
  },

  getByDocument: async (documentId) => {
    const res = await query(
      `SELECT t.* FROM tags t
       JOIN document_tags dt ON t.id = dt.tag_id
       WHERE dt.document_id = $1`,
      [documentId]
    );
    return res.rows;
  },

  delete: async (id) => {
    await query('DELETE FROM tags WHERE id = $1', [id]);
  },
};

module.exports = Tag;