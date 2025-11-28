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
        console.error('Error fetching medicines:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add a new medicine
router.post('/', authMiddleware, async (req, res) => {
    const { name, dosage, frequency, stock, expiryDate } = req.body;

    // Input validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ message: 'Medicine name is required' });
    }
    
    if (!dosage || typeof dosage !== 'string') {
        return res.status(400).json({ message: 'Dosage is required' });
    }
    
    if (!frequency || typeof frequency !== 'string') {
        return res.status(400).json({ message: 'Frequency is required' });
    }
    
    const stockNum = parseInt(stock);
    if (isNaN(stockNum) || stockNum < 0) {
        return res.status(400).json({ message: 'Valid stock number is required' });
    }

    try {
        const medicine = await prisma.medicine.create({
            data: {
                name: name.trim(),
                dosage: dosage.trim(),
                frequency: frequency.trim(),
                stock: stockNum,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
                userId: req.user.userId,
            },
        });

        // Create a schedule for 1 minute from now for testing
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
        console.error('Error creating medicine:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update medicine (e.g., refill)
router.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { stock } = req.body;

    const medicineId = parseInt(id);
    if (isNaN(medicineId)) {
        return res.status(400).json({ message: 'Invalid medicine ID' });
    }

    const stockNum = parseInt(stock);
    if (isNaN(stockNum) || stockNum < 0) {
        return res.status(400).json({ message: 'Valid stock number is required' });
    }

    try {
        // Verify the medicine belongs to the user
        const existingMedicine = await prisma.medicine.findFirst({
            where: { id: medicineId, userId: req.user.userId },
        });
        
        if (!existingMedicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }

        const medicine = await prisma.medicine.update({
            where: { id: medicineId },
            data: { stock: stockNum },
        });
        res.json(medicine);
    } catch (error) {
        console.error('Error updating medicine:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete medicine
router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    const medicineId = parseInt(id);
    if (isNaN(medicineId)) {
        return res.status(400).json({ message: 'Invalid medicine ID' });
    }

    try {
        // Verify the medicine belongs to the user
        const existingMedicine = await prisma.medicine.findFirst({
            where: { id: medicineId, userId: req.user.userId },
        });
        
        if (!existingMedicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }

        // Delete associated schedules first
        await prisma.schedule.deleteMany({
            where: { medicineId: medicineId },
        });

        await prisma.medicine.delete({
            where: { id: medicineId },
        });
        res.json({ message: 'Medicine deleted' });
    } catch (error) {
        console.error('Error deleting medicine:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
