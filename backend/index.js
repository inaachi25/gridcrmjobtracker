const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve uploads statically
const uploadsDir = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

// routes
const apps = require('./routes/apps');
app.use('/api/apps', apps);

// serve frontend static files (so API + frontend can run from same server)
const frontendDir = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendDir));

// fallback to frontend/index.html for SPA-like routes (optional)
app.get('*', (req, res, next) => {
	if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) return next();
	res.sendFile(path.join(frontendDir, 'index.html'));
});

app.get('/', (req, res) => res.json({ok:true}));

app.listen(PORT, () => console.log('API server listening on port', PORT));
