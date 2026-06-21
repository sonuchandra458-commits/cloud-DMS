const buildSearchQuery = ({
  userId,
  searchText,
  tags,
  fileType,
  from,
  to,
  folder,
  page  = 1,
  limit = 20,
}) => {
  let sql = `
    SELECT DISTINCT
      d.*,
      u.name AS owner_name,
      ARRAY(
        SELECT t.name
        FROM tags t
        JOIN document_tags dt ON t.id = dt.tag_id
        WHERE dt.document_id = d.id
      ) AS tags
    FROM documents d
    LEFT JOIN users u ON d.owner_id = u.id
    WHERE d.is_deleted = false
    AND (
      d.owner_id = $1
      OR d.id IN (
        SELECT document_id FROM permissions WHERE user_id = $1
      )
    )
  `;

  const params = [userId];
  let idx = 2;

  if (searchText) {
    sql += `
      AND (
        to_tsvector('english', d.name || ' ' || COALESCE(d.description, ''))
        @@ plainto_tsquery('english', $${idx})
        OR d.name ILIKE $${idx + 1}
      )
    `;
    params.push(searchText, `%${searchText}%`);
    idx += 2;
  }

  if (fileType) {
    sql += ` AND d.file_type ILIKE $${idx}`;
    params.push(`%${fileType}%`);
    idx++;
  }

  if (folder) {
    sql += ` AND d.folder = $${idx}`;
    params.push(folder);
    idx++;
  }

  if (from) {
    sql += ` AND d.created_at >= $${idx}`;
    params.push(new Date(from));
    idx++;
  }

  if (to) {
    sql += ` AND d.created_at <= $${idx}`;
    params.push(new Date(to));
    idx++;
  }

  if (tags && tags.length > 0) {
    sql += `
      AND d.id IN (
        SELECT dt.document_id
        FROM document_tags dt
        JOIN tags t ON dt.tag_id = t.id
        WHERE t.name = ANY($${idx})
      )
    `;
    params.push(tags);
    idx++;
  }

  sql += ` ORDER BY d.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
  params.push(Number(limit), (Number(page) - 1) * Number(limit));

  return { sql, params };
};

const buildTagQuery = (name) => {
  if (name) {
    return {
      sql:    'SELECT * FROM tags WHERE name ILIKE $1 ORDER BY name',
      params: [`%${name}%`],
    };
  }
  return {
    sql:    'SELECT * FROM tags ORDER BY name',
    params: [],
  };
};

module.exports = { buildSearchQuery, buildTagQuery };