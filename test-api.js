const fetch = require('node-fetch'); // You might need to install node-fetch or use built-in fetch in Node 18+

const BASE_URL = 'http://localhost:4000/api';

async function testBackend() {
    console.log('--- Starting Backend Verification ---');

    // 1. Register
    const email = `testuser_${Date.now()}@example.com`;
    const password = 'password123';
    console.log(`\n1. Registering user: ${email}`);

    let res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test User', email, password, role: 'PATIENT' })
    });
    let data = await res.json();
    console.log('Response:', data);

    // 2. Login
    console.log('\n2. Logging in...');
    res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    data = await res.json();
    console.log('Login Success:', !!data.token);
    const token = data.token;

    if (!token) {
        console.error('Failed to get token. Aborting.');
        return;
    }

    // 3. Add Medicine
    console.log('\n3. Adding Medicine...');
    res = await fetch(`${BASE_URL}/medicines`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            name: 'Paracetamol',
            dosage: '500mg',
            frequency: '1-0-1',
            stock: 10,
            expiryDate: '2025-12-31'
        })
    });
    data = await res.json();
    console.log('Medicine Added:', data.name);

    // 4. List Medicines
    console.log('\n4. Listing Medicines...');
    res = await fetch(`${BASE_URL}/medicines`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    data = await res.json();
    console.log('Medicines Count:', data.length);

    console.log('\n--- Verification Complete ---');
    console.log('Check the backend console for "Reminder Triggered" in about 1 minute.');
}

testBackend();
