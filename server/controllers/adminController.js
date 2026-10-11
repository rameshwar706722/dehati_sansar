import { pool } from '../config/db.js';

export const getDBStatus = async (req, res) => {
  try {
    const conn = await pool.getConnection();
    conn.release();
    res.json({
      isRealMySQL: true,
      database: process.env.MYSQL_DATABASE || 'dehati_sansar',
      host: process.env.MYSQL_HOST || '127.0.0.1',
      port: 3306,
      user: process.env.MYSQL_USER || 'root',
      lastConnectedAt: new Date().toISOString(),
      envDetected: {
        hasHost: !!process.env.MYSQL_HOST,
        hasUser: !!process.env.MYSQL_USER,
        hasPassword: process.env.MYSQL_PASSWORD !== undefined,
        hasDatabase: !!process.env.MYSQL_DATABASE,
        hasDatabaseUrl: false,
      },
    });
  } catch (err) {
    res.json({ isRealMySQL: false, errorMessage: err.message });
  }
};

export const getAllData = async (req, res) => {
  try {
    const [products] = await pool.query(`
      SELECT p.*, c.name AS category_name,
        COALESCE(COUNT(DISTINCT i.store_id), 0) AS available_stores_count,
        COALESCE(MIN(i.price), 0) AS min_price,
        COALESCE(MAX(i.price), 0) AS max_price,
        COALESCE(SUM(i.stock), 0) AS total_stock
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN inventory i ON p.id = i.product_id
      GROUP BY p.id
    `);

    const [inventory] = await pool.query(`
      SELECT i.*, s.store_name, s.phone AS store_phone, ct.name AS city_name,
             p.title AS product_title, p.sku AS product_sku, c.name AS category_name
      FROM inventory i
      JOIN stores s ON i.store_id = s.id
      JOIN cities ct ON s.city_id = ct.id
      JOIN products p ON i.product_id = p.id
      JOIN categories c ON p.category_id = c.id
    `);

    const [queries] = await pool.query(`
      SELECT pq.*, p.title AS product_title, p.sku AS product_sku,
             s.store_name, s.phone AS store_phone, ct.name AS city_name
      FROM product_queries pq
      JOIN products p ON pq.product_id = p.id
      JOIN stores s ON pq.store_id = s.id
      JOIN cities ct ON s.city_id = ct.id
      ORDER BY pq.created_at DESC
    `);

    const [categories] = await pool.query(`
      SELECT c.*, COUNT(p.id) AS product_count 
      FROM categories c 
      LEFT JOIN products p ON c.id = p.category_id 
      GROUP BY c.id
    `);

    const [stores] = await pool.query(`
      SELECT s.*, ct.name AS city_name, COUNT(i.id) AS in_stock_count
      FROM stores s
      JOIN cities ct ON s.city_id = ct.id
      LEFT JOIN inventory i ON s.id = i.store_id
      GROUP BY s.id
    `);

    const [cities] = await pool.query('SELECT * FROM cities');

    res.json({
      counts: {
        products: products.length,
        inventory: inventory.length,
        queries: queries.length,
        stores: stores.length,
        categories: categories.length,
        cities: cities.length,
      },
      data: { products, inventory, queries, categories, stores, cities },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};