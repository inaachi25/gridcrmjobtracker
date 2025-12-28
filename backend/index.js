const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

// 1. INITIALIZE APP FIRST
const app = express(); 
const PORT = 3001; 

// 2. MIDDLEWARES (Must come after 'app' is initialized)
app.use(cors());
app.use(express.json());

// 3. API ROUTES
const appsRouter = require('./routes/apps');
app.use('/api/apps', appsRouter);

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
});