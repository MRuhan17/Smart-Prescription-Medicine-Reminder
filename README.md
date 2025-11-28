Project Overview
Smart Prescription & Medicine Reminder helps users (patients & caregivers) by:

Scanning a handwritten/printed prescription.

Extracting medicine names, dosages, timing (morning/noon/night) via OCR + parsing.

Creating scheduled reminders and push/voice notifications.

Letting users mark doses taken/missed and viewing history.

Sending caregiver notifications and refill alerts (post‑MVP).

MVP Features
Prescription image upload & OCR extraction (ML Kit on device; cloud Vision fallback)

Medicine parsing & prefilled reminder creation

Create / update / delete reminders (user-level)

Local + server persistence of reminders & dose history

Push notifications and “Mark as Taken” flow

Simple authentication (email / Firebase Auth)

Tech Stack
Frontend: Flutter (single codebase mobile app)
Backend: Node.js + Express OR Supabase (for speed). Deployed on Render / Vercel / Heroku.
Auth & DB: Firebase Auth + Firestore OR Supabase Postgres
OCR: Google ML Kit (on device) + Google Vision API (cloud fallback)
Push Notifications: Firebase Cloud Messaging (FCM)
Extras: Docker for backend, GitHub Actions for CI, simple nginx on deploy
