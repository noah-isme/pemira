# Test Scripts

Kumpulan test scripts untuk menguji berbagai fitur aplikasi Pemira.

## Admin Tests
- `test-admin-complete.sh` - Complete admin functionality tests
- `test-admin-dashboard.sh` - Admin dashboard tests
- `test-admin-features.sh` - General admin features tests
- `test-admin-users-api.sh` - Admin user management API tests

## Feature Tests
- `test-candidate-admin.sh` - Candidate administration tests
- `test-candidate-fixes.sh` - Candidate fixes verification
- `test-dpt-admin.sh` - DPT (Daftar Pemilih Tetap) admin tests
- `test-dpt-edit-delete.sh` - DPT edit and delete functionality tests
- `test-dpt-id-mapping.sh` - DPT ID mapping tests
- `test-tps-admin.sh` - TPS (Tempat Pemungutan Suara) admin tests
- `test-monitoring-admin.sh` - Monitoring admin tests

## Voter Tests
- `test-voter-profile.sh` - Voter profile tests

## Voting Tests
- `test-voting-method.sh` - Voting method tests
- `test-voting-pages.sh` - Voting pages tests

## Backend Tests
- `test-backend-election-api.sh` - Backend election API tests

## Election Settings
- `test-election-settings.sh` - Election settings tests

## Demo
- `demo-admin-features.sh` - Demo script for admin features

## Usage

Run any test script:
```bash
cd tests
bash test-admin-dashboard.sh
```

Or make executable and run:
```bash
chmod +x tests/test-admin-dashboard.sh
./tests/test-admin-dashboard.sh
```
