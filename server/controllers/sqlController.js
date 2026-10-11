import { pool } from '../config/db.js';

export const runRawSQL = async (req, res) => {
  const { query } = req.body;
  if (!query || !query.trim()) {
    return res.status(400).json({ error: 'SQL query cannot be empty.' });
  }

  try {
    const [rows, fields] = await pool.query(query);

    if (Array.isArray(rows)) {
      const columns = fields ? fields.map((f) => f.name) : (rows.length > 0 ? Object.keys(rows[0]) : []);
      return res.json({ type: 'select', columns, rows, count: rows.length });
    }

    return res.json({
      type: 'mutation',
      affectedRows: rows.affectedRows,
      insertId: rows.insertId,
      message: `Query OK, ${rows.affectedRows} row(s) affected.`,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};