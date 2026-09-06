import express from 'express';
import { query } from '../db/index.js';

const router = express.Router();

// Get all clients
router.get('/', async (req, res) => {
    try {
        const result = await query(
            'SELECT * FROM clients ORDER BY client_name ASC'
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ error: 'Failed to fetch clients' });
    }
});

// Get single client
router.get('/:id', async (req, res) => {
    try {
        const result = await query(
            'SELECT * FROM clients WHERE id = $1',
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Client not found'
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching client:', error);
        res.status(500).json({
            error: 'Failed to fetch client'
        });
    }
});

// Add new client
router.post('/', async (req, res) => {
    try {
        const {
            client_name,
            client_gstin,
            client_phone,
            client_address
        } = req.body;

        if (!client_name || !client_name.trim()) {
            return res.status(400).json({
                error: 'Client name is required'
            });
        }

        const result = await query(
            `INSERT INTO clients
            (client_name, client_gstin, client_phone, client_address)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [
                client_name.trim(),
                client_gstin || '',
                client_phone || '',
                client_address || ''
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating client:', error);
        res.status(500).json({
            error: 'Failed to create client'
        });
    }
});

// Update client
router.put('/:id', async (req, res) => {
    try {
        const {
            client_name,
            client_gstin,
            client_phone,
            client_address
        } = req.body;

        if (!client_name || !client_name.trim()) {
            return res.status(400).json({
                error: 'Client name is required'
            });
        }

        const result = await query(
            `UPDATE clients
             SET client_name = $1,
                 client_gstin = $2,
                 client_phone = $3,
                 client_address = $4
             WHERE id = $5
             RETURNING *`,
            [
                client_name.trim(),
                client_gstin || '',
                client_phone || '',
                client_address || '',
                req.params.id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Client not found'
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating client:', error);
        res.status(500).json({
            error: 'Failed to update client'
        });
    }
});

// Delete client
router.delete('/:id', async (req, res) => {
    try {
        const result = await query(
            'DELETE FROM clients WHERE id = $1 RETURNING *',
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Client not found'
            });
        }

        res.json({
            message: 'Client deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({
            error: 'Failed to delete client'
        });
    }
});

export default router;