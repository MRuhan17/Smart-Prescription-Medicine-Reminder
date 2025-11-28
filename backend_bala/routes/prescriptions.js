const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const fs = require('fs');

const router = express.Router();
const prisma = new PrismaClient();

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// Upload Prescription and Process OCR
router.post('/upload', authMiddleware, upload.single('prescription'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const imagePath = req.file.path;

        // Perform OCR
        const { data: { text } } = await Tesseract.recognize(imagePath, 'eng');

        // Clean up uploaded file
        fs.unlinkSync(imagePath);

        // Save to DB
        const prescription = await prisma.prescription.create({
            data: {
                imageUrl: req.file.filename, // In a real app, upload to S3/Cloudinary
                parsedData: text,
                userId: req.user.userId,
            },
        });

        res.json({ message: 'Prescription processed', text, prescriptionId: prescription.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'OCR Processing failed' });
    }
});

// Get all prescriptions
router.get('/', authMiddleware, async (req, res) => {
    try {
        const prescriptions = await prisma.prescription.findMany({
            where: { userId: req.user.userId },
        });
        res.json(prescriptions);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
