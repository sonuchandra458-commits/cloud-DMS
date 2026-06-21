const { query } = require('../config/db');

exports.search = async (req, res, next) => {
  try {
    const { q, tags, fileType, from, to, page = 1, limit = 20 } = req.query;
    let sql = `
      SELECT DISTINCT d.*, u.name as owner_name,
        ARRAY(SELECT t.name FROM tags t JOIN document_tags dt ON t.id = dt.tag_id WHERE dt.document_id = d.id) as tags
      FROM documents d
      LEFT JOIN users u ON d.owner_id = u.id
      WHERE d.is_deleted = false
      AND (d.owner_id = $1 OR d.id IN (SELECT document_id FROM permissions WHERE user_id = $1))
    `;
    const params = [req.user.id];
    let idx = 2;

    if (q) {
      sql += ` AND (to_tsvector('english', d.name || ' ' || COALESCE(d.description,'')) @@ plainto_tsquery('english', $${idx}) OR d.name ILIKE $${idx + 1})`;
      params.push(q, `%${q}%`); idx += 2;
    }
    if (fileType) {
      sql += ` AND d.file_type ILIKE $${idx}`;
      params.push(`%${fileType}%`); idx++;
    }
    if (from) {
      sql += ` AND d.created_at >= $${idx}`;
      params.push(new Date(from)); idx++;
    }
    if (to) {
      sql += ` AND d.created_at <= $${idx}`;
      params.push(new Date(to)); idx++;
    }
    if (tags) {
      const tagList = tags.split(',');
      sql += ` AND d.id IN (
        SELECT dt.document_id FROM document_tags dt
        JOIN tags t ON dt.tag_id = t.id
        WHERE t.name = ANY($${idx})
      )`;
      params.push(tagList); idx++;
    }

    sql += ` ORDER BY d.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(Number(limit), (Number(page) - 1) * Number(limit));

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows, page: Number(page) });
  } catch (err) { next(err); }
};

exports.getTags = async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM tags ORDER BY name');
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
};

exports.createTag = async (req, res, next) => {
  try {
    const { name, color = '#3b82f6' } = req.body;
    const result = await query(
      'INSERT INTO tags (name, color, created_by) VALUES ($1, $2, $3) RETURNING *',
      [name, color, req.user.id]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};