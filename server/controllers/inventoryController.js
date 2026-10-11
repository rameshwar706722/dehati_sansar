import { pool } from '../config/db.js';

// GET all store inventory with joined product, city, and image details
export const getAllInventory = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        i.id,
        i.store_id,
        i.product_id,
        i.price,
        i.stock,
        i.is_available,
        p.title AS product_title,
        p.sku AS product_sku,
        p.description,
        p.image_url,
        c.name AS category_name,
        s.store_name,
        s.phone AS store_phone,
        ct.name AS city_name
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      JOIN stores s ON i.store_id = s.id
      JOIN cities ct ON s.city_id = ct.id
      ORDER BY p.title ASC
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH / PUT update inventory item price, stock, and availability
export const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, stock, is_available } = req.body;

    const [result] = await pool.query(
      `UPDATE inventory 
       SET price = COALESCE(?, price), 
           stock = COALESCE(?, stock), 
           is_available = COALESCE(?, is_available) 
       WHERE id = ?`,
      [price, stock, is_available, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Inventory record not found' });
    }

    res.json({ success: true, message: 'Inventory item updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};