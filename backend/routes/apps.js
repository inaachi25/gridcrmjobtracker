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

// 4. UPDATE JOB STATUS
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }
        const success = await jobs.updateStatus(id, status);
        if (success) {
            res.json({ message: 'Status updated successfully' });
        } else {
            res.status(404).json({ error: 'Job not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Update failed' });
    }
});

module.exports = router;
