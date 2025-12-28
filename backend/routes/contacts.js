const express = require('express');
const router = express.Router();
const contactModel = require('../models/contacts-model');

// Get all
router.get('/', async (req, res) => {
    const contacts = await contactModel.getAll();
    res.json(contacts);
});

// Create
router.post('/', async (req, res) => {
    const newContact = await contactModel.create(req.body);
    res.json(newContact);
});

// Edit
router.put('/:id', async (req, res) => {
    const success = await contactModel.update(req.params.id, req.body);
    if (success) res.json({ message: 'Updated' });
    else res.status(404).json({ error: 'Not found' });
});

// Delete
router.delete('/:id', async (req, res) => {
    const success = await contactModel.remove(req.params.id);
    if (success) res.json({ message: 'Deleted' });
    else res.status(404).json({ error: 'Not found' });
});

module.exports = router;