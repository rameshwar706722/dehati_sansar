import { pool } from '../config/db.js';

export const getAllServiceBookings = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        b.*,
        s.store_name,
        s.phone AS store_phone,
        ct.name AS city_name
      FROM service_bookings b
      LEFT JOIN stores s ON b.store_id = s.id
      LEFT JOIN cities ct ON s.city_id = ct.id
      ORDER BY b.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createServiceBooking = async (req, res) => {
  try {
    const body = req.body || {};

    const {
      service_name,
      model_name,
      farmer_name,
      farmer_phone,
      start_date,
      end_date,
      farm_acres,
      crop_type,
      village_address,
      store_id,
      requires_operator,
      estimated_cost,
      notes,
    } = body;

    if (!service_name || !farmer_name || !farmer_phone || !start_date || !end_date) {
      return res.status(400).json({ 
        error: 'Missing required booking details (service_name, farmer_name, farmer_phone, dates).' 
      });
    }

    const [result] = await pool.query(
      `INSERT INTO service_bookings (
        service_name, model_name, farmer_name, farmer_phone,
        start_date, end_date, farm_acres, crop_type,
        village_address, store_id, requires_operator, estimated_cost, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        String(service_name),
        model_name ? String(model_name) : null,
        String(farmer_name).trim(),
        String(farmer_phone).trim(),
        start_date,
        end_date,
        Number(farm_acres) || 1,
        crop_type ? String(crop_type) : 'General',
        village_address ? String(village_address) : '',
        store_id ? Number(store_id) : 1,
        requires_operator ? 1 : 0,
        Number(estimated_cost) || 0,
        notes ? String(notes) : '',
      ]
    );

    res.status(201).json({
      success: true,
      booking_id: result.insertId,
      message: 'Rental booking registered successfully.',
    });
  } catch (err) {
    console.error('Service Booking Insert Error:', err);
    res.status(500).json({ error: err.message || 'Failed to save booking' });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    await pool.query('UPDATE service_bookings SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteServiceBooking = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM service_bookings WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};