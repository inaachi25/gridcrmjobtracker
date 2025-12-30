const pool = require('../db'); // Import your MySQL pool

exports.getAll = async () => {
    const [rows] = await pool.query('SELECT * FROM applications ORDER BY id DESC');
    return rows;
};

exports.create = async (job) => {
    const { jobtitle, company, location, contactperson, email, status, dateApplied, notes } = job;
    const sql = `INSERT INTO applications (jobtitle, company, location, contactperson, email, status, dateApplied, notes) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await pool.query(sql, [jobtitle, company, location, contactperson, email, status, dateApplied, notes]);
    return { id: result.insertId, ...job };
};

exports.remove = async (id) => {
    const [result] = await pool.query('DELETE FROM applications WHERE id = ?', [id]);
    return result.affectedRows > 0;
};

exports.updateStatus = async (id, status) => {
    try {
        const sql = `UPDATE applications SET status = ? WHERE id = ?`;
        const [result] = await pool.query(sql, [status, id]);
        
        // Return true if at least one row was updated
        return result.affectedRows > 0;
    } catch (err) {
        console.error("Database Error in updateStatus:", err);
        throw err;
    }
};
