# DPT Edit Bug Fix - Wrong ID Issue

## Problem Description

**Symptom:**
- Ketika edit DPT nomor 1, yang muncul adalah data ID 5
- Ketika edit DPT nomor 2, yang muncul adalah data ID 31
- ID yang digunakan tidak sesuai dengan urutan tampilan

## Root Cause Analysis

### 1. ID Mapping Issue

Di `src/services/adminDpt.ts` line 233, mapping ID menggunakan fallback:

```typescript
// OLD CODE (PROBLEMATIC):
id: item.election_voter_id?.toString() || item.voter_id?.toString() || crypto.randomUUID()
```

**Masalah:**
- API contract mensyaratkan `election_voter_id` HARUS ada dalam response
- Jika `election_voter_id` tidak ada/undefined, sistem fallback ke `voter_id`
- `voter_id` adalah ID global pemilih, BUKAN ID enrollment di pemilu tertentu
- `election_voter_id` adalah ID yang benar untuk edit/delete operations

**Contoh:**
```
Voter #1 di list:
  - election_voter_id: undefined (MISSING!)
  - voter_id: 5
  - Result: Menggunakan ID 5 (SALAH!)

Voter #2 di list:
  - election_voter_id: undefined (MISSING!)
  - voter_id: 31
  - Result: Menggunakan ID 31 (SALAH!)
```

### 2. Backend API Issue

Kemungkinan besar backend tidak mengembalikan `election_voter_id` dengan benar dari endpoint:
```
GET /api/v1/admin/elections/{electionId}/voters
```

Sesuai API contract, response HARUS include:
```json
{
  "items": [
    {
      "election_voter_id": 6,    // ← HARUS ADA!
      "voter_id": 1,
      "nim": "2021101",
      ...
    }
  ]
}
```

## Fix Applied

### 1. Enhanced ID Mapping with Prefix

**File:** `src/services/adminDpt.ts`

```typescript
// NEW CODE (FIXED):
const id = item.election_voter_id 
  ? item.election_voter_id.toString() 
  : `voter_${item.voter_id}` // Prefix to distinguish

// Warning if election_voter_id missing
if (!item.election_voter_id) {
  console.warn(`⚠️ Missing election_voter_id for voter ${item.nim} (voter_id: ${item.voter_id})`)
}
```

**Why this helps:**
- ID dengan prefix `voter_` akan membuat error lebih jelas saat edit/delete
- Console warning membantu debug masalah di backend
- Prefix membedakan antara `election_voter_id` vs `voter_id`

### 2. Debug Logging

Added logging di `fetchAdminDpt()`:

```typescript
if (rawItems.length > 0 && import.meta.env.DEV) {
  console.log('📊 DPT API Response Sample:', {
    has_election_voter_id: !!firstItem.election_voter_id,
    has_voter_id: !!firstItem.voter_id,
    election_voter_id: firstItem.election_voter_id,
    voter_id: firstItem.voter_id,
    nim: firstItem.nim,
  })
}
```

## How to Debug

### Step 1: Check Console Logs

Buka browser console (F12) dan cari log berikut:

```
📊 DPT API Response Sample: {
  has_election_voter_id: false,  // ← Jika false, ini masalahnya!
  has_voter_id: true,
  election_voter_id: undefined,   // ← Seharusnya ada nilai!
  voter_id: 5,
  nim: "2021101"
}
```

### Step 2: Check Warning Messages

Cari warning seperti ini:
```
⚠️ Missing election_voter_id for voter 2021101 (voter_id: 5)
⚠️ Missing election_voter_id for voter 2021102 (voter_id: 31)
```

Jika ada warning ini, berarti **backend tidak mengembalikan `election_voter_id`**.

### Step 3: Check Network Tab

Di browser DevTools → Network tab:

1. Filter: `voters`
2. Klik request ke `/admin/elections/{id}/voters`
3. Lihat Response

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "election_voter_id": 6,     // ✅ HARUS ADA
        "election_id": 1,
        "voter_id": 1,
        "nim": "2021101",
        "name": "Agus Santoso",
        ...
      }
    ],
    "page": 1,
    "limit": 50,
    "total_items": 41,
    "total_pages": 1
  }
}
```

**If Missing:**
```json
{
  "items": [
    {
      "voter_id": 5,              // ❌ election_voter_id tidak ada!
      "nim": "2021101",
      ...
    }
  ]
}
```

## Solution Paths

### Option A: Fix Backend API (RECOMMENDED)

Backend harus diperbaiki untuk mengembalikan `election_voter_id` di response.

**File di Backend:** (Kemungkinan di handler endpoint `/admin/elections/{id}/voters`)

```go
// Pastikan query JOIN ke table election_voters
SELECT 
  ev.id as election_voter_id,     -- PENTING!
  ev.election_id,
  ev.voter_id,
  v.nim,
  v.name,
  ...
FROM election_voters ev
JOIN voters v ON v.id = ev.voter_id
WHERE ev.election_id = ?
```

### Option B: Temporary Workaround (Current)

Frontend sudah ditambahkan:
- ✅ Warning logging untuk debug
- ✅ Prefix `voter_` untuk ID yang salah
- ✅ Console logging untuk inspect API response

Tapi ini hanya workaround, masalah tetap ada sampai backend diperbaiki.

## Expected Behavior After Fix

### Before (BROKEN):
```
List View:
  No 1: NIM 2021101 → ID = "5" (voter_id)
  No 2: NIM 2021102 → ID = "31" (voter_id)

Edit Link:
  /admin/dpt/5/edit → Data voter_id 5 (SALAH!)
  /admin/dpt/31/edit → Data voter_id 31 (SALAH!)
```

### After (FIXED):
```
List View:
  No 1: NIM 2021101 → ID = "6" (election_voter_id)
  No 2: NIM 2021102 → ID = "7" (election_voter_id)

Edit Link:
  /admin/dpt/6/edit → Data election_voter_id 6 (BENAR!)
  /admin/dpt/7/edit → Data election_voter_id 7 (BENAR!)
```

## Testing Checklist

- [ ] Buka console browser (F12)
- [ ] Navigate ke Admin DPT List
- [ ] Check for warning messages
- [ ] Check sample log output
- [ ] Verify `has_election_voter_id: true`
- [ ] Test edit beberapa DPT entries
- [ ] Verify ID yang diedit sesuai dengan yang dipilih

## API Contract Reference

According to the API contract, the response from `GET /admin/elections/{id}/voters` MUST include:

```typescript
{
  success: true,
  data: {
    items: Array<{
      election_voter_id: number,     // ← REQUIRED
      election_id: number,
      voter_id: number,
      nim: string,
      name: string,
      ...
    }>,
    page: number,
    limit: number,
    total_items: number,
    total_pages: number
  }
}
```

**Field `election_voter_id` is REQUIRED and MUST NOT be optional.**

## Contact Backend Team

Jika setelah checking ternyata `election_voter_id` memang tidak ada di response, hubungi backend team dengan informasi:

1. **Endpoint:** `GET /api/v1/admin/elections/{electionId}/voters`
2. **Issue:** Field `election_voter_id` tidak ada di response
3. **Expected:** Sesuai API contract, field ini wajib ada
4. **Impact:** Edit/Delete DPT menggunakan ID yang salah
5. **Reference:** DPT API Contract Section "Admin Endpoints #1"

## Timeline

- **Bug Discovered:** 2025-11-26
- **Frontend Fix Applied:** 2025-11-26 (Debug logging & warnings)
- **Backend Fix Required:** PENDING
- **Status:** NEEDS BACKEND FIX

---

**Priority:** HIGH  
**Severity:** CRITICAL (Data integrity issue)  
**Next Action:** Debug backend API response
