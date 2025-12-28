const pool = require('../db');

exports.getStats = async () => {
    // 1. Get Job Status Counts (Matching jobs.html categories)
    const [jobStats] = await pool.query(
        'SELECT status, COUNT(*) as count FROM apps GROUP BY status'
    );

    // 2. Get Contact Status Counts (Matching contacts.html categories)
    const [contactStats] = await pool.query(
        'SELECT relationship_status as status, COUNT(*) as count FROM contacts GROUP BY relationship_status'
    );

    // 3. Totals for the Top Row
    const [[{ totalApps }]] = await pool.query('SELECT COUNT(*) as totalApps FROM apps');
    const [[{ totalContacts }]] = await pool.query('SELECT COUNT(*) as totalContacts FROM contacts');
    const [[{ totalResources }]] = await pool.query('SELECT COUNT(*) as totalResources FROM resources');

    // 4. Recent Activity
    const [recentJobs] = await pool.query(
        'SELECT company, role, status, created_at FROM apps ORDER BY created_at DESC LIMIT 5'
    );

    return {
        jobStats,      // Used for Job Breakdown
        contactStats,  // Used for Contact Breakdown
        totalApps,
        totalContacts,
        totalResources,
        recentJobs
    };
};