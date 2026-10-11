import { pool } from '../config/db.js';

// GET all master services with linked hub availability
export const getAllServices = async (req, res) => {
  try {
    // 1. Fetch all services
    const [services] = await pool.query(`
      SELECT * FROM services ORDER BY id DESC
    `);

    if (services.length === 0) {
      return res.json([]);
    }

    // 2. Fetch all hub availability rows with joined store and city data
    const [allocations] = await pool.query(`
      SELECT 
        sha.service_id,
        sha.store_id,
        sha.is_available,
        sha.custom_rate,
        st.store_name,
        ct.name AS city_name,
        ct.id AS city_id
      FROM service_hub_availability sha
      JOIN stores st ON sha.store_id = st.id
      JOIN cities ct ON st.city_id = ct.id
    `);

    // 3. Map allocations cleanly to each service without complex GROUP BY queries
    const result = services.map((srv) => {
      let parsedSpecs = [];
      try {
        parsedSpecs = typeof srv.specs === 'string' ? JSON.parse(srv.specs) : (srv.specs || []);
      } catch {
        parsedSpecs = [];
      }

      const hubAllocations = allocations
        .filter((a) => a.service_id === srv.id)
        .map((a) => ({
          store_id: a.store_id,
          store_name: a.store_name,
          city_name: a.city_name,
          city_id: a.city_id,
          is_available: a.is_available,
          custom_rate: a.custom_rate,
        }));

      return {
        ...srv,
        specs: parsedSpecs,
        hub_allocations: hubAllocations,
      };
    });

    res.json(result);
  } catch (err) {
    console.error('Error in getAllServices:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET a single service by ID or Slug
export const getServiceById = async (req, res) => {
  try {
    const { identifier } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM services WHERE id = ? OR slug = ? LIMIT 1',
      [identifier, identifier]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const service = rows[0];
    const [hubs] = await pool.query(
      `SELECT 
        sha.*, 
        st.store_name, 
        ct.name AS city_name 
       FROM service_hub_availability sha
       JOIN stores st ON sha.store_id = st.id
       JOIN cities ct ON st.city_id = ct.id
       WHERE sha.service_id = ?`,
      [service.id]
    );

    let parsedSpecs = [];
    try {
      parsedSpecs = typeof service.specs === 'string' ? JSON.parse(service.specs) : (service.specs || []);
    } catch {
      parsedSpecs = [];
    }

    res.json({
      ...service,
      specs: parsedSpecs,
      hubs,
    });
  } catch (err) {
    console.error('Error in getServiceById:', err);
    res.status(500).json({ error: err.message });
  }
};

// POST Create new Service with custom hub allocations & coverage mode
export const createService = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const body = req.body || {};
    const {
      title,
      slug,
      model,
      description,
      rate_per_acre,
      rate_unit,
      coverage_mode,
      max_distance_km,
      image_url,
      tag,
      specs,
      is_active,
      selected_store_ids,
      custom_rates,
    } = body;

    if (!title || rate_per_acre === undefined) {
      return res.status(400).json({ error: 'Title and base rate are required.' });
    }

    const autoSlug = (slug || title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const [result] = await connection.query(
      `INSERT INTO services (
        title, slug, model, description, rate_per_acre, rate_unit,
        coverage_mode, max_distance_km, image_url, tag, specs, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        String(title).trim(),
        autoSlug,
        model ? String(model) : null,
        description ? String(description) : '',
        Number(rate_per_acre) || 0,
        rate_unit || 'per acre',
        coverage_mode || 'ALL_HUBS',
        Number(max_distance_km) || 30.0,
        image_url || '',
        tag || 'Available',
        JSON.stringify(Array.isArray(specs) ? specs : []),
        is_active === 0 || is_active === false ? 0 : 1,
      ]
    );

    const serviceId = result.insertId;

    // Attach Hub allocations across all stores
    const [stores] = await connection.query('SELECT id FROM stores');
    for (const store of stores) {
      let isAvailable = 0;
      if (coverage_mode === 'ALL_HUBS') {
        isAvailable = 1;
      } else if (Array.isArray(selected_store_ids)) {
        isAvailable = selected_store_ids.includes(store.id) ? 1 : 0;
      }

      const customRate = custom_rates && custom_rates[store.id] ? Number(custom_rates[store.id]) : null;

      await connection.query(
        `INSERT INTO service_hub_availability (service_id, store_id, is_available, custom_rate)
         VALUES (?, ?, ?, ?)`,
        [serviceId, store.id, isAvailable, customRate]
      );
    }

    await connection.commit();
    res.status(201).json({ success: true, service_id: serviceId, message: 'Service created successfully' });
  } catch (err) {
    await connection.rollback();
    console.error('Error creating service:', err);
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
};

// PUT /:id Update service details, rates, and hub availability
export const updateService = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const body = req.body || {};
    const {
      title,
      model,
      description,
      rate_per_acre,
      rate_unit,
      coverage_mode,
      max_distance_km,
      image_url,
      tag,
      specs,
      is_active,
      selected_store_ids,
      custom_rates,
    } = body;

    const [existing] = await connection.query('SELECT * FROM services WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    const current = existing[0];

    await connection.query(
      `UPDATE services 
       SET title = ?,
           model = ?,
           description = ?,
           rate_per_acre = ?,
           rate_unit = ?,
           coverage_mode = ?,
           max_distance_km = ?,
           image_url = ?,
           tag = ?,
           specs = ?,
           is_active = ?
       WHERE id = ?`,
      [
        title !== undefined && title !== null ? String(title).trim() : current.title,
        model !== undefined ? model : current.model,
        description !== undefined ? description : current.description,
        rate_per_acre !== undefined ? Number(rate_per_acre) : current.rate_per_acre,
        rate_unit !== undefined ? rate_unit : current.rate_unit,
        coverage_mode !== undefined ? coverage_mode : current.coverage_mode,
        max_distance_km !== undefined ? Number(max_distance_km) : current.max_distance_km,
        image_url !== undefined ? image_url : current.image_url,
        tag !== undefined ? tag : current.tag,
        specs !== undefined ? JSON.stringify(specs) : current.specs,
        is_active !== undefined ? (is_active ? 1 : 0) : current.is_active,
        id,
      ]
    );

    // Sync Hub Allocations
    if (selected_store_ids !== undefined || coverage_mode !== undefined) {
      const [allStores] = await connection.query('SELECT id FROM stores');
      for (const st of allStores) {
        let isAvailable = 0;
        const currentMode = coverage_mode || current.coverage_mode;

        if (currentMode === 'ALL_HUBS') {
          isAvailable = 1;
        } else if (Array.isArray(selected_store_ids)) {
          isAvailable = selected_store_ids.includes(st.id) ? 1 : 0;
        }

        const customRate = custom_rates && custom_rates[st.id] ? Number(custom_rates[st.id]) : null;

        await connection.query(
          `INSERT INTO service_hub_availability (service_id, store_id, is_available, custom_rate)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE is_available = VALUES(is_available), custom_rate = VALUES(custom_rate)`,
          [id, st.id, isAvailable, customRate]
        );
      }
    }

    await connection.commit();
    res.json({ success: true, message: 'Service and hub allocations updated successfully.' });
  } catch (err) {
    await connection.rollback();
    console.error('Error updating service:', err);
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
};

// DELETE /:id Remove service and associated hub mappings
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM service_hub_availability WHERE service_id = ?', [id]);
    const [result] = await pool.query('DELETE FROM services WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    res.json({ success: true, message: 'Service deleted successfully.' });
  } catch (err) {
    console.error('Error deleting service:', err);
    res.status(500).json({ error: err.message });
  }
};