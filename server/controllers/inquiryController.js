import { pool } from '../config/db.js';

// GET all customer queries with store & product details
export const getAllInquiries = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        pq.*,
        p.title AS product_title,
        p.sku AS product_sku,
        s.store_name,
        s.phone AS store_phone,
        ct.name AS city_name
      FROM product_queries pq
      JOIN products p ON pq.product_id = p.id
      JOIN stores s ON pq.store_id = s.id
      JOIN cities ct ON s.city_id = ct.id
      ORDER BY pq.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST create inquiry from storefront
export const createInquiry = async (req, res) => {
  try {
    const { customer_name, customer_phone, product_id, store_id, message } = req.body;
    const [result] = await pool.query(
      `INSERT INTO product_queries (customer_name, customer_phone, product_id, store_id, message) 
       VALUES (?, ?, ?, ?, ?)`,
      [customer_name, customer_phone, product_id, store_id, message]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH update inquiry status (New -> Contacted -> Quoted -> Closed)
export const updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.query('UPDATE product_queries SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true, message: `Inquiry #${id} updated to ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE an inquiry
export const deleteInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM product_queries WHERE id = ?', [id]);
    res.json({ success: true, message: `Inquiry #${id} deleted` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};