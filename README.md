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
- Expo Go app on your mobile device (for testing)

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Scan the QR code with the Expo Go app (Android) or Camera app (iOS).

## Project Structure
- `src/screens`: Application screens
- `src/components`: Reusable UI components
- `src/services`: API, Auth, OCR, and Notification services
- `src/context`: Global state management (Auth)
- `src/utils`: Helper functions and configuration

## Tech Stack
- React Native (Expo)
- React Navigation
- React Native Paper (UI)
- Expo Camera & Image Picker
- Axios (API)
