const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
    res.send('Smart Med Reminder Backend is Running!');
});

// Routes
const authRoutes = require('./routes/auth');
const medicineRoutes = require('./routes/medicines');
const prescriptionRoutes = require('./routes/prescriptions');
const initScheduler = require('./scheduler');

app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

// Start Scheduler
initScheduler();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
