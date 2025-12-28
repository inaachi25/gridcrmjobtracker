const express = require('express');
const router = express.Router();
const resourceModel = require('../models/resources-model');

// GET all resources
router.get('/', async (req, res) => {
    try {
        const data = await resourceModel.getAll();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST a new resource
router.post('/', async (req, res) => {
    try {
        const newItem = await resourceModel.create(req.body);
        res.json(newItem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE a resource
router.delete('/:id', async (req, res) => {
    try {
        const success = await resourceModel.remove(req.params.id);
        if (success) res.json({ message: 'Deleted' });
        else res.status(404).json({ error: 'Not found' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;