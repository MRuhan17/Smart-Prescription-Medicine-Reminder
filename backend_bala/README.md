# Smart Medicine Reminder - Backend API

A Node.js/Express backend for the Smart Prescription & Medicine Reminder System.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm

### Installation

```bash
cd backend
npm install
```

### Environment Setup

The `.env` file is already configured with:
```
DATABASE_URL="file:./dev.db"
PORT=4000
JWT_SECRET="supersecretkey_hackathon_mode"
```

### Database Setup

```bash
npx prisma generate
npx prisma db push
```

### Run the Server

```bash
npm run dev
```

The server will start on `http://localhost:4000`

## 📁 Project Structure

```
backend/
├── index.js                 # Main server entry point
├── scheduler.js             # Background cron job for reminders
├── package.json
├── .env
├── prisma/
│   └── schema.prisma       # Database schema
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── medicines.js        # Medicine CRUD routes
│   └── prescriptions.js    # Prescription upload & OCR
├── middleware/
│   └── auth.js             # JWT authentication middleware
└── uploads/                # Temporary storage for uploaded images
```

## 🔌 API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "PATIENT"  // or "CAREGIVER"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "role": "PATIENT"
  }
}
```

### Medicines (Protected Routes)

**Note:** All medicine routes require `Authorization: Bearer <token>` header

#### Get All Medicines
```http
GET /api/medicines
Authorization: Bearer <token>
```

#### Add Medicine
```http
POST /api/medicines
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Paracetamol",
  "dosage": "500mg",
  "frequency": "1-0-1",
  "stock": 10,
  "expiryDate": "2025-12-31"
}
```

#### Update Medicine Stock (Refill)
```http
PUT /api/medicines/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "stock": 20
}
```

#### Delete Medicine
```http
DELETE /api/medicines/:id
Authorization: Bearer <token>
```

### Prescriptions (Protected Routes)

#### Upload Prescription (OCR)
```http
POST /api/prescriptions/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- prescription: <image file>

Response:
{
  "message": "Prescription processed",
  "text": "extracted text from image",
  "prescriptionId": 1
}
```

#### Get All Prescriptions
```http
GET /api/prescriptions
Authorization: Bearer <token>
```

## 🗄️ Database Schema

### User
- `id`: Integer (Primary Key)
- `name`: String
- `email`: String (Unique)
- `password`: String (Hashed)
- `role`: String (PATIENT/CAREGIVER/DOCTOR)
- `createdAt`: DateTime

### Medicine
- `id`: Integer (Primary Key)
- `name`: String
- `dosage`: String
- `frequency`: String (e.g., "1-0-1" for morning-afternoon-evening)
- `stock`: Integer
- `expiryDate`: DateTime (Optional)
- `userId`: Integer (Foreign Key)

### Schedule
- `id`: Integer (Primary Key)
- `medicineId`: Integer (Foreign Key)
- `userId`: Integer (Foreign Key)
- `time`: DateTime (When the dose is due)
- `status`: String (PENDING/TAKEN/MISSED)
- `takenAt`: DateTime (Optional)

### Prescription
- `id`: Integer (Primary Key)
- `imageUrl`: String
- `parsedData`: String (OCR extracted text)
- `userId`: Integer (Foreign Key)
- `createdAt`: DateTime

### Log
- `id`: Integer (Primary Key)
- `action`: String
- `details`: String (Optional)
- `userId`: Integer (Foreign Key)
- `createdAt`: DateTime

## ⏰ Background Scheduler

The backend includes a cron job that runs **every minute** to check for due medicines:

- Checks for schedules with status `PENDING` and time in the past 5 minutes
- Logs reminder messages to console
- In production, this would trigger actual notifications (SMS/Email/Push)

Example console output:
```
[REMINDER] Hey John Doe, it's time to take your Paracetamol (500mg)!
```

## 🔐 Authentication Flow

1. User registers via `/api/auth/register`
2. User logs in via `/api/auth/login` and receives a JWT token
3. Include the token in all subsequent requests:
   ```
   Authorization: Bearer <your_jwt_token>
   ```
4. The `authMiddleware` validates the token and attaches user info to `req.user`

## 🧪 Testing

A test script is included to verify the API:

```bash
node test-api.js
```

This will:
1. Register a new user
2. Login and get a JWT token
3. Add a medicine
4. List all medicines
5. Create a schedule (automatically created 1 minute in the future)

## 🛠️ Technologies Used

- **Express.js** - Web framework
- **Prisma** - ORM for database management
- **SQLite** - Database (file-based, no installation needed)
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **Tesseract.js** - OCR for prescription scanning
- **Multer** - File upload handling
- **node-cron** - Background job scheduling
- **CORS** - Cross-origin resource sharing

## 📝 Frontend Integration

Your frontend should:

1. **Store the JWT token** after login (localStorage/sessionStorage)
2. **Include the token** in all API requests:
   ```javascript
   fetch('http://localhost:4000/api/medicines', {
     headers: {
       'Authorization': `Bearer ${token}`
     }
   })
   ```
3. **Handle token expiration** (tokens expire in 1 hour)

## 🔄 CORS Configuration

The backend is configured to accept requests from any origin. In production, update this in `index.js`:

```javascript
app.use(cors({
  origin: 'https://your-frontend-domain.com'
}));
```

## 📦 Dependencies

```json
{
  "dependencies": {
    "@prisma/client": "^6.0.1",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.21.1",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "node-cron": "^3.0.3",
    "tesseract.js": "^5.1.1"
  }
}
```

## 🚨 Important Notes

- **JWT Secret**: Change `JWT_SECRET` in `.env` before deploying to production
- **Database**: Currently using SQLite (file-based). For production, consider PostgreSQL or MongoDB
- **File Uploads**: Prescription images are temporarily stored in `uploads/` and deleted after OCR processing
- **Scheduler**: The cron job creates a mock schedule 1 minute in the future when you add a medicine (for testing purposes)

## 🎯 Future Enhancements

- [ ] Implement actual SMS/Email/Push notifications
- [ ] Add caregiver linking functionality
- [ ] Implement refill alerts
- [ ] Add dose history tracking and reports
- [ ] Emergency contact alerts
- [ ] Doctor dashboard for viewing patient adherence

## 📞 Support

For questions or issues, contact your backend developer.

---

**Happy Coding! 🚀**
