const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Simple email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Valid roles
const VALID_ROLES = ['PATIENT', 'CAREGIVER', 'DOCTOR'];

// Register
router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;

    // Input validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ message: 'Name is required' });
    }
    
    if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
        return res.status(400).json({ message: 'Valid email is required' });
    }
    
    if (!password || typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    const userRole = role || 'PATIENT';
    if (!VALID_ROLES.includes(userRole)) {
        return res.status(400).json({ message: 'Invalid role' });
    }

    try {
        const normalizedEmail = email.toLowerCase().trim();
        
        const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name: name.trim(),
                email: normalizedEmail,
                password: hashedPassword,
                role: userRole,
            },
        });

        res.status(201).json({ message: 'User created successfully', userId: user.id });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Input validation
    if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
        return res.status(400).json({ message: 'Valid email is required' });
    }
    
    if (!password || typeof password !== 'string') {
        return res.status(400).json({ message: 'Password is required' });
    }

    try {
        const normalizedEmail = email.toLowerCase().trim();
        
        const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
