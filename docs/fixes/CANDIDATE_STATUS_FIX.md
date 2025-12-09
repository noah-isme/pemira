# ✅ FIX: Candidate Status Type Mismatch

## 🐛 Problem

Error saat save/edit kandidat:
```
AdminCandidateForm.tsx:467 Failed to save candidate 
{status: 400, code: 'INVALID_REQUEST', message: 'Perubahan status kandidat tidak diizinkan.'}
```

**Root Cause:** Frontend & Backend menggunakan **status values yang berbeda**!

---

## 🔍 Analysis

### Before Fix (MISMATCH ❌)

| Layer | Status Values |
|-------|--------------|
| **Backend DB** | `PENDING`, `APPROVED`, `REJECTED`, `WITHDRAWN` |
| **Backend API** | `PENDING`, `APPROVED`, `REJECTED`, `WITHDRAWN` (same) |
| **Frontend Type** | `'draft'`, `'active'`, `'hidden'`, `'archived'` ❌ |
| **Frontend Send** | `'draft'`, `'active'` ❌ |

### Backend Validation

**File:** `internal/candidate/model.go`
```go
const (
    CandidateStatusPending   CandidateStatus = "PENDING"
    CandidateStatusApproved  CandidateStatus = "APPROVED"
    CandidateStatusRejected  CandidateStatus = "REJECTED"
    CandidateStatusWithdrawn CandidateStatus = "WITHDRAWN"
)

func (s CandidateStatus) IsValid() bool {
    switch s {
    case CandidateStatusPending,
        CandidateStatusApproved,
        CandidateStatusRejected,
        CandidateStatusWithdrawn:
        return true
    }
    return false  // ❌ Frontend kirim 'active' / 'draft'
}
```

**Error Triggered:** Line 470 in `service.go`
```go
if !newStatus.IsValid() {
    return nil, ErrCandidateStatusInvalid  // ❌
}
```

---

## ✅ Solution

### Changed Files

1. **`src/types/candidateAdmin.ts`**
   ```typescript
   // Before
   export type CandidateStatus = 'draft' | 'active' | 'hidden' | 'archived'
   
   // After
   export type CandidateStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN'
   ```

2. **`src/pages/AdminCandidateForm.tsx`**
   ```typescript
   // Status labels
   const statusLabels: Record<CandidateStatus, string> = {
     PENDING: 'Menunggu Review',
     APPROVED: 'Disetujui',
     REJECTED: 'Ditolak',
     WITHDRAWN: 'Ditarik',
   }
   
   // Submit handlers
   - void handleSubmit('draft')      // ❌ Before
   + void handleSubmit('PENDING')    // ✅ After
   
   - void handleSubmit('active')     // ❌ Before
   + void handleSubmit('APPROVED')   // ✅ After
   ```

3. **`src/pages/AdminCandidatesList.tsx`**
   ```typescript
   // Status display
   {candidate.status === 'APPROVED' ? 'Disetujui'
     : candidate.status === 'PENDING' ? 'Menunggu Review'
     : candidate.status === 'REJECTED' ? 'Ditolak'
     : 'Ditarik'}
   ```

4. **`src/hooks/useCandidateAdminStore.tsx`**
   ```typescript
   // Default status
   - status: 'draft'           // ❌ Before
   + status: 'PENDING'         // ✅ After
   
   // Archive action
   - status: 'hidden'          // ❌ Before
   + status: 'WITHDRAWN'       // ✅ After
   ```

5. **`src/services/adminCandidates.ts`**
   ```typescript
   // API Response type
   export type AdminCandidateResponse = {
     // ...
     status: CandidateStatus  // Direct type, no mapping needed
   }
   
   // Removed incorrect mapping functions
   - mapStatusFromApi(status === 'PUBLISHED') return 'active'
   + mapStatusFromApi(status) return status  // Pass-through
   ```

6. **`src/styles/AdminCandidates.css`**
   ```css
   /* Status chip styles */
   .status-chip.APPROVED { ... }    /* Green */
   .status-chip.PENDING { ... }     /* Yellow */
   .status-chip.REJECTED { ... }    /* Red */
   .status-chip.WITHDRAWN { ... }   /* Gray */
   ```

---

## 📊 Status Mapping (ALIGNED ✅)

### After Fix

| Frontend | Backend DB | Backend API | Label (ID) |
|----------|-----------|-------------|------------|
| `PENDING` | `PENDING` | `PENDING` | Menunggu Review |
| `APPROVED` | `APPROVED` | `APPROVED` | Disetujui |
| `REJECTED` | `REJECTED` | `REJECTED` | Ditolak |
| `WITHDRAWN` | `WITHDRAWN` | `WITHDRAWN` | Ditarik |

**Status:** ✅ FULLY ALIGNED - No conversion needed!

---

## 🎯 Status Workflow

```
┌─────────────┐
│   PENDING   │ ← Kandidat baru / draft
└──────┬──────┘
       │
       ├────→ APPROVED   ← Admin setujui → Muncul di voting
       │
       ├────→ REJECTED   ← Admin tolak
       │
       └────→ WITHDRAWN  ← Kandidat/Admin tarik
```

---

## ✅ Testing

### Test 1: Create New Candidate
```
1. Klik "Tambah Kandidat"
2. Isi form
3. Klik "Simpan Draft"
   → Backend receive: status = "PENDING" ✅
```

### Test 2: Publish Candidate
```
1. Edit kandidat
2. Lengkapi semua data
3. Klik "Publikasikan"
   → Backend receive: status = "APPROVED" ✅
   → Kandidat muncul di halaman public
```

### Test 3: List Display
```
Status badge colors:
- APPROVED → Green (Disetujui)
- PENDING → Yellow (Menunggu Review)
- REJECTED → Red (Ditolak)
- WITHDRAWN → Gray (Ditarik)
```

---

## 📝 Notes

1. **No Backend Changes** - Backend sudah benar
2. **Frontend Only** - Fix type definitions & labels
3. **CSS Updated** - Status chip styles for new values
4. **No Migration** - Existing data di DB tetap valid

---

## ✅ Result

- ✅ Status validation berhasil
- ✅ Edit kandidat berhasil
- ✅ Create kandidat berhasil
- ✅ Status badge tampil benar
- ✅ No more 400 error "Perubahan status kandidat tidak diizinkan"

---

**Date:** 24 November 2024  
**Issue:** Frontend-Backend status type mismatch  
**Fix:** Align frontend types with backend enums  
**Status:** ✅ RESOLVED
