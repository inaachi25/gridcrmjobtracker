const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express(); 
// CHANGE: Render provides the PORT dynamically. Use process.env.PORT.
const PORT = process.env.PORT || 3002; 

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- NEW: SECURE LOGIN ROUTE ---
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    // These variables will be set in your Render Dashboard
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASS = process.env.ADMIN_PASSWORD;

    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
        return res.status(200).json({ success: true, message: "Authorized" });
    } else {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});

// API ROUTES
const appsRouter = require('./routes/apps');
const contactsRouter = require('./routes/contacts');
const resourceRouter = require('./routes/resources');

app.use('/api/apps', appsRouter);
app.use('/api/contacts', contactsRouter); 
app.use('/api/resources', resourceRouter);

// SERVE STATIC FILES
// Note: Ensure your frontend folder is in the correct relative path
const frontendDir = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendDir));

// FALLBACK
app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API route not found' });
    }
    // Redirect all UI requests to login.html as the entry point
    res.sendFile(path.join(frontendDir, 'login.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});