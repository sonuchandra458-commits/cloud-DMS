const { query } = require('../config/db');
const bcrypt    = require('bcryptjs');

const User = {
  findByEmail: async (email) => {
    const res = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return res.rows[0] || null;
  },

  findById: async (id) => {
    const res = await query(
      'SELECT id, name, email, role, avatar, is_active, last_login, created_at FROM users WHERE id = $1',
      [id]
    );
    return res.rows[0] || null;
  },

  create: async ({ name, email, password, role = 'viewer' }) => {
    const hashed = await bcrypt.hash(password, 12);
    const res = await query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email, hashed, role]
    );
    return res.rows[0];
  },

  update: async (id, fields) => {
    const allowed = ['name', 'email', 'avatar', 'is_active'];
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

    if (fields.password) {
      const hashed = await bcrypt.hash(fields.password, 12);
      updates.push(`password = $${idx}`);
      values.push(hashed);
      idx++;
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const res = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx}
       RETURNING id, name, email, role, is_active`,
      values
    );
    return res.rows[0];
  },

  updateLastLogin: async (id) => {
    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [id]);
  },

  comparePassword: async (plain, hashed) => {
    return bcrypt.compare(plain, hashed);
  },

  getAll: async () => {
    const res = await query(
      'SELECT id, name, email, role, is_active, last_login, created_at FROM users ORDER BY created_at DESC'
    );
    return res.rows;
  },

  delete: async (id) => {
    await query('DELETE FROM users WHERE id = $1', [id]);
  },
};

module.exports = User;