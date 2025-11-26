# DPT Bug - Detailed Investigation Report

## Backend Test Results (From User)

Backend mengembalikan response dengan benar:

```json
{
  "data": {
    "items": [
      {
        "election_voter_id": 33,  // ✅ FIELD ADA!
        "election_id": 1,
        "voter_id": 31,
        "nim": "0101018901",
        ...
      }
    ]
  }
}
```

## User Symptom

> "Edit DPT No 2 → Muncul data ID 31"

## Analysis

### Data dari Backend:
- `election_voter_id` = 33 (CORRECT ID untuk edit)
- `voter_id` = 31 (WRONG ID, tapi ini yang muncul!)

### Kesimpulan:
**Frontend menggunakan `voter_id` (31) bukan `election_voter_id` (33)!**

## Possible Causes

### 1. ❌ Response Format Issue (DISMISSED)
Backend sudah return dengan benar. `extractItems()` juga sudah benar.

### 2. ❌ Mapping Issue (ALREADY FIXED)
Code mapping sudah benar:
```typescript
const id = item.election_voter_id 
  ? item.election_voter_id.toString() 
  : `voter_${item.voter_id}`
```

### 3. ✅ LIKELY CAUSE: Multiple API Calls atau Fallback

Kemungkinan:
1. Primary endpoint gagal, fallback ke endpoint lama
2. Endpoint lama tidak punya `election_voter_id`
3. Data dari endpoint lama yang digunakan

Code di `fetchAdminDpt()`:
```typescript
try {
  // Primary endpoint
  const primary = await apiRequest(`/admin/elections/${electionId}/voters`, { token })
  // ...
} catch (err) {
  if (err?.status === 404 || err?.status === 500) {
    // FALLBACK ke endpoint lama!
    const fallback = await apiRequest(`/admin/voters`, { token })
    // ...
  }
}
```

**SUSPECT:** Endpoint `/admin/voters` (tanpa election ID) tidak punya `election_voter_id`!

### 4. ✅ LIKELY CAUSE: Cache atau State Issue

Browser bisa jadi:
1. Menggunakan cached data lama
2. State management menyimpan data lama
3. Re-render menggunakan data sebelum API call selesai

## Debug Plan

### Step 1: Check Console Logs
Dengan logging yang sudah ditambahkan, check:

```
📊 DPT API Response Debug
  First Item Raw: { ... }
  First Item Analysis: {
    has_election_voter_id: ???
    election_voter_id: ???
    voter_id: ???
  }

🔍 DPT Mapped IDs
  Item 1: { id: ???, voterId: ???, nim: ??? }
  Item 2: { id: ???, voterId: ???, nim: ??? }
```

### Step 2: Check Network Tab
1. Clear browser cache
2. Hard reload (Ctrl+Shift+R)
3. Check Network tab:
   - Which endpoint is called?
   - `/admin/elections/1/voters` atau `/admin/voters`?
   - Response body nya apa?

### Step 3: Check State Management
File: `src/hooks/useDPTAdminStore.tsx`
- Apakah ada caching?
- Apakah data di-update dengan benar?

## Expected Behavior After Debug Logging

### If Backend Response is Correct:
```
📊 DPT API Response Sample:
  has_election_voter_id: true
  election_voter_id: 33
  voter_id: 31

🔍 DPT Mapped IDs
  Item 2: { id: "33", voterId: 31, nim: "0101018901" }
```

Edit link: `/admin/dpt/33/edit` ✅ CORRECT

### If Fallback Endpoint is Used:
```
⚠️ Primary endpoint failed, using fallback /admin/voters

📊 DPT API Response Sample:
  has_election_voter_id: false
  election_voter_id: undefined
  voter_id: 31

⚠️ Missing election_voter_id for voter 0101018901 (voter_id: 31)

🔍 DPT Mapped IDs
  Item 2: { id: "voter_31", voterId: 31, nim: "0101018901" }
```

Edit link: `/admin/dpt/voter_31/edit` ❌ WRONG (prefix added)

### If Old Cached Data:
```
📊 DPT API Response Sample:
  has_election_voter_id: false
  election_voter_id: undefined
  voter_id: 31

🔍 DPT Mapped IDs
  Item 2: { id: "31", voterId: 31, nim: "0101018901" }
```

Edit link: `/admin/dpt/31/edit` ❌ WRONG (using voter_id directly)

## Next Actions

1. **Clear Browser Cache**
   ```
   Ctrl+Shift+Delete → Clear cache
   OR
   Hard Reload: Ctrl+Shift+R
   ```

2. **Run App in Dev Mode**
   ```bash
   npm run dev
   ```

3. **Navigate to Admin DPT**
   ```
   http://localhost:5173/admin/dpt
   ```

4. **Open Console (F12)**
   - Check for debug logs
   - Check for warnings
   - Screenshot the logs

5. **Check Network Tab**
   - Filter: "voters"
   - Check which endpoint is called
   - Check response body
   - Screenshot the network request

6. **Test Edit**
   - Note NIM dari row 2: "0101018901"
   - Click "Edit" button
   - Verify NIM in edit form
   - If NIM berbeda = BUG CONFIRMED

## Hypothesis Ranking

1. **HIGH PROBABILITY: Fallback Endpoint Issue**
   - Primary endpoint error
   - Fallback to `/admin/voters` (no election_voter_id)
   - Using voter_id as ID

2. **MEDIUM PROBABILITY: Browser Cache**
   - Old data di cache
   - State tidak refresh
   - Need hard reload

3. **LOW PROBABILITY: Zustand State Issue**
   - Store menyimpan data lama
   - Refresh tidak clear state

4. **VERY LOW PROBABILITY: Mapping Bug**
   - Code sudah benar
   - Unlikely to be the issue

## Verification Checklist

After implementing debug logging:

- [ ] Console shows `has_election_voter_id: true`
- [ ] Console shows `election_voter_id: 33` (not undefined)
- [ ] Console shows mapped `id: "33"` (not "31")
- [ ] No warning "Missing election_voter_id"
- [ ] Network shows primary endpoint called (not fallback)
- [ ] Edit button uses correct ID

If ALL checkboxes = ✅, then bug is fixed.
If ANY checkbox = ❌, continue debugging.

---

**Status:** Enhanced Debug Logging Implemented  
**Next:** User needs to test and share console logs  
**Priority:** HIGH - Data Integrity Issue
