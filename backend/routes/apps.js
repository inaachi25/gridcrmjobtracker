const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all applications from DB
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM applications ORDER BY id DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'db_error' });
  }
});

module.exports = router;
