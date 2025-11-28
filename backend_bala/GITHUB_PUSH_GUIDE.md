# How to Push Backend to GitHub

## Option 1: Install Git and Push (Recommended)

### Step 1: Install Git
1. Download Git from: https://git-scm.com/download/win
2. Run the installer and follow the setup wizard
3. Restart your terminal after installation

### Step 2: Configure Git (First Time Only)
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 3: Navigate to Backend Directory
```bash
cd C:\Users\balaa\.gemini\antigravity\scratch\smart-med-reminder\backend
```

### Step 4: Initialize Git Repository
```bash
git init
```

### Step 5: Add All Files
```bash
git add .
```

### Step 6: Commit Changes
```bash
git commit -m "Initial commit: Smart Medicine Reminder Backend"
```

### Step 7: Add Remote Repository
```bash
git remote add origin https://github.com/MRuhan17/Smart-Prescription-Medicine-Reminder.git
```

### Step 8: Push to GitHub
```bash
git branch -M main
git push -u origin main
```

If the repository already has content, you may need to force push:
```bash
git push -u origin main --force
```

---

## Option 2: Upload via GitHub Web Interface

### Step 1: Prepare Backend Folder
The backend folder is located at:
```
C:\Users\balaa\.gemini\antigravity\scratch\smart-med-reminder\backend
```

### Step 2: Create a ZIP File
1. Navigate to the backend folder
2. Select all files EXCEPT:
   - `node_modules` folder
   - `dev.db` file (if exists)
   - Any `.db` files
3. Right-click → Send to → Compressed (zipped) folder

### Step 3: Upload to GitHub
1. Go to: https://github.com/MRuhan17/Smart-Prescription-Medicine-Reminder
2. Click "Add file" → "Upload files"
3. Drag and drop the contents (or extract the ZIP first)
4. Add commit message: "Add backend API"
5. Click "Commit changes"

---

## Option 3: Use GitHub Desktop

### Step 1: Install GitHub Desktop
Download from: https://desktop.github.com/

### Step 2: Clone Repository
1. Open GitHub Desktop
2. File → Clone Repository
3. Enter: `MRuhan17/Smart-Prescription-Medicine-Reminder`

### Step 3: Copy Backend Files
1. Copy all files from:
   ```
   C:\Users\balaa\.gemini\antigravity\scratch\smart-med-reminder\backend
   ```
2. Paste into the cloned repository folder
3. EXCLUDE: `node_modules`, `*.db` files

### Step 4: Commit and Push
1. GitHub Desktop will show all changes
2. Add commit message: "Add backend API"
3. Click "Commit to main"
4. Click "Push origin"

---

## Important Notes

### Files to EXCLUDE (already in .gitignore):
- `node_modules/` - Dependencies (will be installed via `npm install`)
- `*.db` - Database files
- `.env` - Environment variables (contains secrets)
- `uploads/*` - Uploaded files

### Files to INCLUDE:
- All `.js` files
- `package.json` and `package-lock.json`
- `prisma/schema.prisma`
- `README.md`
- `.gitignore`
- `.env.example` (if you create one)

### After Pushing

Anyone cloning the repository should:
1. `cd backend`
2. `npm install`
3. Create `.env` file with required variables
4. `npx prisma generate`
5. `npx prisma db push`
6. `npm run dev`

---

## Quick Command Summary (If Git is Installed)

```bash
cd C:\Users\balaa\.gemini\antigravity\scratch\smart-med-reminder\backend
git init
git add .
git commit -m "Initial commit: Backend API"
git remote add origin https://github.com/MRuhan17/Smart-Prescription-Medicine-Reminder.git
git branch -M main
git push -u origin main
```
