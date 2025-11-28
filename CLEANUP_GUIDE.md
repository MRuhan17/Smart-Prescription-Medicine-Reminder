# Repository Cleanup Guide

This guide provides instructions for cleaning up unnecessary files from the repository.

## Identified Waste Files

The following directories and files should be removed as they are:
- Cache/build artifacts
- IDE-specific configurations
- Temporary test output files
- Runtime-generated uploads
- Machine-specific configurations

## Files to Delete

### 1. Directories to Remove

```bash
# Cache and IDE directories (should be in .gitignore)
.expo/           # Expo development cache
.vscode/         # VS Code settings
assets/          # Unused Expo assets  
uploads/         # Runtime-generated upload directory
```

### 2. Root-Level Test Files to Delete

```bash
test_ai_layer.py      # AI layer tests
test_db.py            # Database tests
test_debug.txt        # Debug output
test_ocr.py           # OCR tests
test_output.txt       # Test output
test_refill.py        # Refill logic tests
test_scheduler.py     # Scheduler tests
test-api.js           # API test (JavaScript)
test-debug.txt        # Debug file
output.txt            # Output file
```

### 3. Recommended Action: Create tests/ Directory

After deletion, optionally create a `tests/` directory for organized test files:

```bash
mkdir tests/
# Move actual test files here later if needed
```

## Quick Cleanup Commands (Using Git CLI)

If you have Git CLI access, run these commands from your repo root:

```bash
# Remove cache directories
git rm -r .expo
git rm -r .vscode  
git rm -r assets
git rm -r uploads

# Remove test files
git rm test_ai_layer.py test_db.py test_debug.txt test_ocr.py
git rm test_output.txt test_refill.py test_scheduler.py
git rm test-api.js output.txt

# Commit changes
git commit -m "chore: Remove waste files and cache directories"
git push origin main
```

## GitHub UI Method (Manual)

1. Navigate to each file/directory
2. Click the three dots (...) menu
3. Select "Delete file"
4. Provide commit message
5. Commit directly to main branch

## Current Repository Structure After Cleanup

```
Smart-Prescription-Medicine-Reminder/
├── ai_engine/          # AI/ML components
├── backend_bala/       # Node.js backend
├── docs/               # Documentation
├── middleware/         # Backend middleware
├── prisma/             # Database ORM schema
├── routes/             # API routes
├── src/                # React Native frontend
│   ├── context/        # React context
│   ├── screens/        # App screens
│   ├── services/       # Service layer
│   ├── types/          # TypeScript types
│   └── utils/          # Utilities
├── .env.example        # Environment template
├── .gitignore          # Git ignore rules
├── .vscode/.gitkeep    # (Keep for reference, will be deleted)
├── app.json            # Expo config
├── package.json        # npm dependencies
├── requirements.txt    # Python dependencies
├── tsconfig.json       # TypeScript config
├── babel.config.js     # Babel config
├── README.md           # Documentation
└── ...
```

## Notes

- These directories are already in `.gitignore` but were committed before being added
- Removing them won't affect development, as they regenerate as needed
- This cleanup reduces repository size and improves clarity
- Consider this a one-time cleanup for repository hygiene

## Verification

After cleanup, verify the repository is clean:

```bash
git status  # Should show no tracked cache files
ls -la      # Verify directories are removed
```
