const express = require('express');
const router = express.Router();
// IMPORTANT: Ensure this path points to wherever you define your database connection
const db = require('../db'); 

router.get('/summary', async (req, res) => {
    try {
        // Fetch top-level counts
        const totalApps = await db.get("SELECT COUNT(*) as count FROM jobs");
        const totalContacts = await db.get("SELECT COUNT(*) as count FROM contacts");
        const totalResources = await db.get("SELECT COUNT(*) as count FROM resources");

        // Fetch Job status breakdown
        const jobStats = await db.all(
            "SELECT status, COUNT(*) as count FROM jobs GROUP BY status"
        );

        // Fetch Contact status breakdown (mapping relationship_status to 'status')
        const contactStats = await db.all(
            "SELECT relationship_status AS status, COUNT(*) as count FROM contacts GROUP BY relationship_status"
        );

        // Fetch Recent Activity
        const recentJobs = await db.all(
            "SELECT role, company, status, created_at FROM jobs ORDER BY created_at DESC LIMIT 5"
        );

        // Return the structured JSON
        res.json({
            totalApps: totalApps ? totalApps.count : 0,
            totalContacts: totalContacts ? totalContacts.count : 0,
            totalResources: totalResources ? totalResources.count : 0,
            jobStats: jobStats || [],
            contactStats: contactStats || [],
            recentJobs: recentJobs || []
        });
    } catch (err) {
        console.error("Dashboard API Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;