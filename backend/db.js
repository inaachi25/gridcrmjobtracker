const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = process.env.DATABASE_URL 
  ? mysql.createPool({
      uri: process.env.DATABASE_URL,
      ssl: {
        // This is the "Magic Fix" for cloud handshakes
        rejectUnauthorized: false 
      },
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    }) 
  : mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'crmjobtracker',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

module.exports = pool;