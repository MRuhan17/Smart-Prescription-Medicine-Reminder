# Smart Prescription & Medicine Reminder

A mobile-first healthcare solution designed to help patients manage complex medication schedules.

## Features
- **Authentication**: Login and Signup
- **Dashboard**: Quick access to all features
- **Prescription Scanning**: OCR integration to extract medicines from images
- **Medicine Management**: Add, edit, and delete medicines
- **Reminders**: Schedule notifications for doses
- **History**: Track taken and missed doses

## Prerequisites
- Node.js (v14 or later)
- npm or yarn
- Python 3.8+ (for FastAPI backend)
- Expo Go app on your mobile device (for testing)

## Project Structure
```
├── src/                    # React Native frontend
│   ├── screens/           # Application screens
│   ├── components/        # Reusable UI components
│   ├── services/          # API, Auth, OCR, and Notification services
│   ├── context/           # Global state management (Auth)
│   └── utils/             # Helper functions and configuration
├── routes/                # Node.js Express routes
├── middleware/            # Express middleware (auth)
├── prisma/               # Prisma schema and migrations
├── ai_engine/            # Python AI/OCR processing
├── main.py               # FastAPI backend
├── index.js              # Node.js Express backend
└── scheduler.js          # Cron scheduler for reminders
```

## Setup

### Mobile App (React Native / Expo)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Scan the QR code with the Expo Go app (Android) or Camera app (iOS).

### Node.js Backend

1. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

2. Configure the `.env` file with your settings:
   - `JWT_SECRET`: Generate a secure random string
   - `DATABASE_URL`: Database connection string
   - `PORT`: Server port (default: 4000)

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Start the server:
   ```bash
   npm start
   ```

### Python FastAPI Backend (OCR/AI)

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## Production Deployment

### Environment Variables

Ensure the following environment variables are set in production:

**Node.js Backend:**
- `NODE_ENV=production`
- `JWT_SECRET`: Strong, random secret key
- `DATABASE_URL`: Production database URL (PostgreSQL recommended)
- `CORS_ORIGIN`: Your frontend URL

**FastAPI Backend:**
- `DATABASE_URL`: Production database URL
- `CORS_ORIGINS`: Comma-separated list of allowed origins

**Mobile App:**
- Update `app.json` with production `apiBaseUrl` in `extra` field

### Security Considerations

1. **JWT Secret**: Use a strong, randomly generated secret (min 32 characters)
2. **CORS**: Restrict allowed origins to your domain in production
3. **HTTPS**: Always use HTTPS in production
4. **Database**: Use PostgreSQL or similar for production
5. **File Uploads**: Configure proper file storage (S3, Cloudinary) for prescription images

## Tech Stack

- **Frontend**: React Native (Expo), React Navigation, React Native Paper
- **Node.js Backend**: Express.js, Prisma ORM, JWT Authentication
- **Python Backend**: FastAPI, SQLAlchemy, Tesseract OCR
- **Database**: SQLite (development), PostgreSQL (production)
- **Mobile**: Expo Camera, Image Picker, Notifications
