const express = require('express');
const router = express.Router();
const jobs = require('../models/jobs-model');

// 1. LIST ALL JOBS
router.get('/', async (req, res) => {
    try {
        const data = await jobs.getAll();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Database fetch failed' });
    }
});

// 2. CREATE A JOB
router.post('/', async (req, res) => {
    try {
        const newJob = await jobs.create(req.body);
        res.status(201).json(newJob);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 3. DELETE A JOB
router.delete('/:id', async (req, res) => {
    try {
        const success = await jobs.remove(req.params.id);
        if (success) {
            res.json({ message: 'Deleted successfully' });
        } else {
            res.status(404).json({ message: 'Job not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Delete operation failed' });
    }
});

// 4. UPDATE JOB STATUS (With Debugging)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // --- DEBUG LOGS ---
    console.log(`[Backend] PUT Request received for ID: ${id}`);
    console.log(`[Backend] New Status: ${status}`);
    // ------------------

    try {
        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        const success = await jobs.updateStatus(id, status);
        
        if (success) {
            console.log(`[Backend] Successfully updated ID: ${id}`);
            res.json({ message: 'Status updated successfully' });
        } else {
            console.warn(`[Backend] No job found with ID: ${id}`);
            res.status(404).json({ error: 'Job not found in database' });
        }
    } catch (err) {
        console.error(`[Backend] ERROR during update:`, err.message);
        res.status(500).json({ error: 'Update operation failed' });
    }
});

module.exports = router;