const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all medicines for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const medicines = await prisma.medicine.findMany({
            where: { userId: req.user.userId },
        });
        res.json(medicines);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Add a new medicine
router.post('/', authMiddleware, async (req, res) => {
    const { name, dosage, frequency, stock, expiryDate } = req.body;

    try {
        const medicine = await prisma.medicine.create({
            data: {
                name,
                dosage,
                frequency,
                stock: parseInt(stock),
                expiryDate: expiryDate ? new Date(expiryDate) : null,
                userId: req.user.userId,
            },
        });

        // MOCK: Create a schedule for 1 minute from now for testing
        const nextDose = new Date(new Date().getTime() + 60000); // 1 minute later
        await prisma.schedule.create({
            data: {
                medicineId: medicine.id,
                userId: req.user.userId,
                time: nextDose,
                status: 'PENDING'
            }
        });

        res.status(201).json(medicine);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update medicine (e.g., refill)
router.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { stock } = req.body;

    try {
        const medicine = await prisma.medicine.update({
            where: { id: parseInt(id) },
            data: { stock: parseInt(stock) },
        });
        res.json(medicine);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete medicine
router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.medicine.delete({
            where: { id: parseInt(id) },
        });
        res.json({ message: 'Medicine deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
