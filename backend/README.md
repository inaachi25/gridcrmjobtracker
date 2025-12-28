# CRMJobTracker Server (Express + MySQL)

This small API provides CRUD endpoints for the Application Tracker and optional file uploads.

Setup

1. Install dependencies

```bash
cd server
npm install
```

2. Configure database: copy `.env.example` to `.env` and set values.

3. Create the MySQL database and table (example SQL below):

```sql
CREATE DATABASE crmjobtracker;
USE crmjobtracker;

CREATE TABLE applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  company VARCHAR(255),
  link TEXT,
  contact VARCHAR(255),
  email VARCHAR(255),
  dateApplied DATE,
  followUp DATE,
  status VARCHAR(60),
  notes TEXT,
  attachments TEXT,
  salary VARCHAR(60),
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

4. Run the server

```bash
npm run dev
# or
npm start
```

API

- GET `/api/apps` — list
- GET `/api/apps/:id` — single
- POST `/api/apps` — create (multipart/form-data for `attachments` files)
- PUT `/api/apps/:id` — update
- DELETE `/api/apps/:id` — delete

Notes

- Uploaded attachments are stored in `server/uploads` and served at `/uploads/<filename>`.
- The frontend must call the API (CORS enabled) — example: `POST http://localhost:3000/api/apps`.
