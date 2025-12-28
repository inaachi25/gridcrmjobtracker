const pool = require('../db'); 

// Fetch all resources
exports.getAll = async () => {
    const [rows] = await pool.query('SELECT * FROM resources ORDER BY id DESC');
    return rows;
};

// Create a new resource
exports.create = async (resource) => {
    const { title, url, category, description } = resource;
    const sql = `INSERT INTO resources (title, url, category, description) VALUES (?, ?, ?, ?)`;
    const [result] = await pool.query(sql, [title, url, category, description || '']);
    return { id: result.insertId, ...resource };
};

// Delete a resource
exports.remove = async (id) => {
    const [result] = await pool.query('DELETE FROM resources WHERE id = ?', [id]);
    return result.affectedRows > 0;
};