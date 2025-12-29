const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

// 1. INITIALIZE APP FIRST
const app = express(); 
const PORT = 3002; 

// 2. MIDDLEWARES (Essential for reading form data)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Added to help parse form data

// 3. API ROUTES
const appsRouter = require('./routes/apps');
const contactsRouter = require('./routes/contacts');
const resourceRouter = require('./routes/resources');

app.use('/api/apps', appsRouter);
app.use('/api/contacts', contactsRouter); 
app.use('/api/resources', resourceRouter);

// 4. SERVE STATIC FILES
const frontendDir = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendDir));

// 5. FALLBACK
app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API route not found' });
    }
    res.sendFile(path.join(frontendDir, 'index.html'));
});

// START SERVER
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log(`Jobs API: http://localhost:${PORT}/api/apps`);
    console.log(`Contacts API: http://localhost:${PORT}/api/contacts`);
    console.log(`Resources API: http://localhost:${PORT}/api/resources`);
});