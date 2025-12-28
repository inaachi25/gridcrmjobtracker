const pool = require('../db'); 

// 1. Fetch all
exports.getAll = async () => {
    const [rows] = await pool.query('SELECT * FROM contacts ORDER BY id DESC');
    return rows;
};

// 2. Create
exports.create = async (contact) => {
    const { firstname, lastname, jobtitle, company, relationship, email, phone, linkedin, notes } = contact;
    const sql = `INSERT INTO contacts 
                 (firstname, lastname, jobtitle, company, relationship_status, email, phone, linkedin_url, notes) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await pool.query(sql, [
        firstname, lastname, jobtitle || '', company || '', relationship || 'New', email || '', phone || '', linkedin || '', notes || ''
    ]);
    return { id: result.insertId, ...contact };
};

// 3. Update (The missing piece for your Edit button)
exports.update = async (id, contact) => {
    const { firstname, lastname, jobtitle, company, relationship, email, phone, linkedin, notes } = contact;
    const sql = `UPDATE contacts 
                 SET firstname=?, lastname=?, jobtitle=?, company=?, relationship_status=?, email=?, phone=?, linkedin_url=?, notes=? 
                 WHERE id=?`;
    const [result] = await pool.query(sql, [
        firstname, lastname, jobtitle, company, relationship, email, phone, linkedin, notes, id
    ]);
    return result.affectedRows > 0;
};

// 4. Delete
exports.remove = async (id) => {
    const [result] = await pool.query('DELETE FROM contacts WHERE id = ?', [id]);
    return result.affectedRows > 0;
};