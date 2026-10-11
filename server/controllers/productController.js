import { pool } from '../config/db.js';

// GET all master products with aggregated pricing & stock
export const getAllProducts = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.*, 
        c.name AS category_name,
        COALESCE(COUNT(DISTINCT i.store_id), 0) AS available_stores_count,
        COALESCE(MIN(i.price), 0) AS min_price,
        COALESCE(MAX(i.price), 0) AS max_price,
        COALESCE(SUM(i.stock), 0) AS total_stock
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN inventory i ON p.id = i.product_id
      GROUP BY p.id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST add master product and populate into store inventories
export const createProduct = async (req, res) => {
  try {
    const { title, description, sku, category_id, image_url } = req.body;
    const [result] = await pool.query(
      'INSERT INTO products (title, description, sku, category_id, image_url) VALUES (?, ?, ?, ?, ?)',
      [title, description, sku, category_id, image_url]
    );

    const [stores] = await pool.query('SELECT id FROM stores');
    for (const store of stores) {
      await pool.query(
        'INSERT INTO inventory (store_id, product_id, price, stock, is_available) VALUES (?, ?, 0, 0, 1)',
        [store.id, result.insertId]
      );
    }
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /:id Update master product details
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, sku, category_id, image_url } = req.body;

    // 1. Fetch current product state
    const [existing] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Product not found in database' });
    }

    const current = existing[0];

    // 2. Fallback to existing values if not provided
    const finalTitle = title !== undefined && title !== null ? String(title).trim() : current.title;
    const finalDesc = description !== undefined && description !== null ? String(description) : current.description;
    const finalSku = sku !== undefined && sku !== null ? String(sku).trim() : current.sku;
    const finalCatId = category_id !== undefined && category_id !== null ? Number(category_id) : current.category_id;
    const finalImageUrl = image_url !== undefined && image_url !== null ? String(image_url) : current.image_url;

    // 3. Clean parameter replacement
    const [result] = await pool.query(
      `UPDATE products 
       SET title = ?, 
           description = ?, 
           sku = ?, 
           category_id = ?, 
           image_url = ? 
       WHERE id = ?`,
      [finalTitle, finalDesc, finalSku, finalCatId, finalImageUrl, id]
    );

    res.json({ 
      success: true, 
      message: 'Product updated successfully in MySQL',
      affectedRows: result.affectedRows 
    });
  } catch (err) {
    console.error('Update Product Error:', err);
    res.status(500).json({ error: err.message || 'Database update failed' });
  }
};

// DELETE /:id Master product & cascade linked inventories and queries
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete linked store inventory rows first
    await pool.query('DELETE FROM inventory WHERE product_id = ?', [id]);

    // Delete linked inquiries
    await pool.query('DELETE FROM product_queries WHERE product_id = ?', [id]);

    // Delete the master product row
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ success: true, message: 'Product and associated store inventories deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST create category
export const createCategory = async (req, res) => {
  try {
    const { name, slug, icon } = req.body;
    const [result] = await pool.query(
      'INSERT INTO categories (name, slug, icon) VALUES (?, ?, ?)',
      [name, slug, icon || 'Sprout']
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST create store outlet
export const createStore = async (req, res) => {
  try {
    const { store_name, city_id, address, phone } = req.body;
    const [result] = await pool.query(
      'INSERT INTO stores (store_name, city_id, address, phone) VALUES (?, ?, ?, ?)',
      [store_name, city_id, address, phone]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET cities and their linked stores from MySQL
export const getCitiesWithStores = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        s.id AS store_id,
        s.store_name,
        s.address,
        s.phone,
        c.id AS city_id,
        c.name AS city_name,
        c.lat,
        c.lng
      FROM stores s
      JOIN cities c ON s.city_id = c.id
      ORDER BY c.name ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};