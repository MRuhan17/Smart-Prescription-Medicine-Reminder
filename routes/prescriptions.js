const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const prisma = new PrismaClient();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer setup with file type and size validation
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    // Only allow image files
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
});

// Upload Prescription and Process OCR
router.post('/upload', authMiddleware, upload.single('prescription'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const imagePath = req.file.path;

    try {
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
        // Clean up file on error
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
        console.error('OCR Processing error:', error);
        res.status(500).json({ message: 'OCR Processing failed' });
    }
});

// Get all prescriptions
router.get('/', authMiddleware, async (req, res) => {
    try {
        const prescriptions = await prisma.prescription.findMany({
            where: { userId: req.user.userId },
            orderBy: { createdAt: 'desc' },
        });
        res.json(prescriptions);
    } catch (error) {
        console.error('Error fetching prescriptions:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Error handling middleware for multer errors
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File too large. Maximum size is 10MB.' });
        }
        return res.status(400).json({ message: error.message });
    }
    if (error.message) {
        return res.status(400).json({ message: error.message });
    }
    next(error);
});

module.exports = router;
