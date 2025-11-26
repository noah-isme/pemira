# Election Voters API Integration Guide

Dokumentasi integrasi frontend dengan API baru yang menggunakan skema `election_voters` dengan partial unique NIM per pemilu.

## 📋 Perubahan Utama

### 1. Skema Database Baru
- **Tabel voters**: Menyimpan biodata pemilih (NIM bisa duplikat lintas tahun)
- **Tabel election_voters**: Junction table per pemilu dengan constraint unique (election_id, nim)
- **Primary identifier**: `election_voter_id` (bukan `voter_id` lagi untuk operasi per pemilu)

### 2. Status & Enum Baru
```typescript
// Status pemilih per pemilu
type ElectionVoterStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'VOTED' | 'BLOCKED'

// Metode voting
type VotingMethod = 'ONLINE' | 'TPS'

// Tipe pemilih
type VoterType = 'STUDENT' | 'LECTURER' | 'STAFF'
```

### 3. Validasi NIM
- **STUDENT**: NIM **wajib** diisi
- **LECTURER/STAFF**: NIM **opsional**
- Duplikat NIM dicek per pemilu (election_id, nim)
- Pemilih yang sama bisa terdaftar di multiple pemilu dengan NIM yang sama

---

## 🔧 File Service yang Dibuat/Diupdate

### 1. **New Service Files**

#### `/src/services/adminElectionVoters.ts`
Service untuk admin mengelola pemilih per pemilu:
- `lookupVoterByNim()` - Cek NIM sudah ada atau belum
- `registerVoterToElection()` - Daftarkan pemilih ke pemilu (upsert)
- `listElectionVoters()` - List pemilih dengan filter
- `updateElectionVoter()` - Update status/metode/TPS

#### `/src/services/voterRegistration.ts`
Service untuk pemilih mendaftar sendiri:
- `selfRegisterToElection()` - Self-register ke pemilu
- `getVoterElectionStatus()` - Cek status pendaftaran

### 2. **Updated Service Files**

#### `/src/services/adminDpt.ts`
Diupdate untuk kompatibilitas dengan API baru:
- Mendukung field `election_voter_id` sebagai primary ID
- Mendukung field `status`, `voting_method`, `tps_id` langsung di response
- Backward compatible dengan legacy API format
- Method signature diupdate: `voterId` → `electionVoterId`

#### `/src/services/voterStatus.ts`
Diupdate dengan fallback ke legacy endpoint:
- `fetchVoterStatus()` - Try new API first, fallback to legacy
- `fetchVoterElectionStatus()` - Pure new API endpoint

### 3. **New Type Definitions**

#### `/src/types/electionVoters.ts`
Type definitions lengkap untuk API baru dengan helper functions:
- All request/response types
- Validation helpers
- Query parameter types

---

## 📡 API Endpoints

### Admin - Lookup & Registrasi

#### 1. Lookup Voter by NIM
```typescript
GET /admin/elections/{election_id}/voters/lookup?nim=STRING

// Example usage
import { lookupVoterByNim } from '@/services/adminElectionVoters'

const result = await lookupVoterByNim(token, '202012345', electionId)

// Response
{
  "voter": {
    "id": 12,
    "voter_type": "STUDENT",
    "nim": "202012345",
    "name": "Budi",
    "email": "budi@kampus.ac.id"
  },
  "election_voter": {
    "is_enrolled": true,
    "id": 33,
    "status": "VERIFIED",
    "voting_method": "ONLINE"
  }
}

// Error: 404 jika voter tidak ditemukan
```

#### 2. Register Voter to Election
```typescript
POST /admin/elections/{election_id}/voters

// Example usage
import { registerVoterToElection } from '@/services/adminElectionVoters'

const data = {
  voter_type: 'STUDENT',
  nim: '202012345',  // Wajib untuk STUDENT
  name: 'Budi',
  email: 'budi@kampus.ac.id',
  phone: '0812345678',
  faculty_code: 'FT',
  faculty_name: 'Fakultas Teknik',
  study_program_code: 'IF',
  study_program_name: 'Informatika',
  cohort_year: 2020,
  academic_status: 'ACTIVE',
  voting_method: 'ONLINE',
  tps_id: null,
  status: 'PENDING'  // optional
}

const result = await registerVoterToElection(token, data, electionId)

// Response
{
  "voter_id": 12,
  "election_voter_id": 33,
  "status": "PENDING",
  "voting_method": "ONLINE",
  "tps_id": null,
  "created_voter": false,           // true jika buat row baru di voters
  "created_election_voter": true,   // true jika daftar baru ke pemilu ini
  "duplicate_in_election": false    // true jika NIM sudah ada di pemilu ini
}

// Errors:
// 409 - Duplicate (election_id, nim)
// 422 - NIM kosong untuk STUDENT
// 400 - Enum/voting_method invalid
```

### Admin - Listing & Update

#### 3. List Election Voters
```typescript
GET /admin/elections/{election_id}/voters

// Query params
const params = new URLSearchParams({
  page: '1',
  limit: '50',
  search: '202012345',  // NIM or name
  voter_type: 'STUDENT',
  status: 'VERIFIED',
  voting_method: 'ONLINE',
  faculty_code: 'FT',
  study_program_code: 'IF',
  cohort_year: '2020',
  tps_id: '7'
})

// Example usage
import { listElectionVoters } from '@/services/adminElectionVoters'

const result = await listElectionVoters(token, params, electionId)

// Response
{
  "items": [
    {
      "election_voter_id": 33,
      "voter_id": 12,
      "nim": "202012345",
      "name": "Budi",
      "voter_type": "STUDENT",
      "status": "VERIFIED",
      "voting_method": "ONLINE",
      "tps_id": null,
      "checked_in_at": null,
      "voted_at": null,
      "updated_at": "2025-12-01T10:00:00Z"
    }
  ],
  "page": 1,
  "limit": 50,
  "total_items": 1234,
  "total_pages": 25
}
```

#### 4. Update Election Voter
```typescript
PATCH /admin/elections/{election_id}/voters/{election_voter_id}

// Example usage
import { updateElectionVoter } from '@/services/adminElectionVoters'

const updates = {
  status: 'VERIFIED',
  voting_method: 'TPS',
  tps_id: 7
}

const result = await updateElectionVoter(token, electionVoterId, updates, electionId)

// Response: sama seperti item di list
```

### Voter - Self Registration

#### 5. Self Register to Election
```typescript
POST /voters/me/elections/{election_id}/register

// Example usage
import { selfRegisterToElection } from '@/services/voterRegistration'

const data = {
  voting_method: 'ONLINE',
  tps_id: null
}

const result = await selfRegisterToElection(token, electionId, data)

// Response
{
  "election_voter_id": 33,
  "status": "PENDING",
  "voting_method": "ONLINE",
  "tps_id": null
}

// Error: 409 jika sudah terdaftar
```

#### 6. Get Voter Election Status
```typescript
GET /voters/me/elections/{election_id}/status

// Example usage
import { getVoterElectionStatus } from '@/services/voterRegistration'

const status = await getVoterElectionStatus(token, electionId)

// Response
{
  "election_voter_id": 33,
  "status": "VERIFIED",
  "voting_method": "TPS",
  "tps": {
    "id": 7,
    "name": "TPS AULA",
    "location": "Aula Utama"
  },
  "checked_in_at": null,
  "voted_at": null
}

// Error: 404 jika belum terdaftar
```

---

## 🔄 Migration Guide

### Existing Code Changes

#### 1. Update DPT List Component
```typescript
// Before
const { items } = await fetchAdminDpt(token, params, electionId)

// After (no change needed - backward compatible)
const { items } = await fetchAdminDpt(token, params, electionId)

// But note: item.id is now election_voter_id, not voter_id
```

#### 2. Update DPT Edit/Delete
```typescript
// Before
await updateAdminDptVoter(token, voterId, updates, electionId)
await deleteAdminDptVoter(token, voterId, electionId)

// After (use election_voter_id)
await updateAdminDptVoter(token, electionVoterId, updates, electionId)
await deleteAdminDptVoter(token, electionVoterId, electionId)

// New updates now support status/voting_method/tps_id
const updates = {
  status: 'VERIFIED',
  voting_method: 'ONLINE',
  tps_id: null
}
```

#### 3. Voter Registration Flow
```typescript
// Step 1: Check if NIM exists
try {
  const lookup = await lookupVoterByNim(token, nim, electionId)
  
  if (lookup.election_voter.is_enrolled) {
    // Already enrolled in this election
    console.log('Sudah terdaftar:', lookup.election_voter)
  } else {
    // Voter exists but not enrolled in this election
    console.log('Voter ditemukan:', lookup.voter)
  }
} catch (err) {
  if (err.status === 404) {
    // NIM not found, can register as new
  }
}

// Step 2: Register
const result = await registerVoterToElection(token, {
  voter_type: 'STUDENT',
  nim: '202012345',
  name: 'Budi',
  email: 'budi@kampus.ac.id',
  // ... other fields
  voting_method: 'ONLINE'
}, electionId)

if (result.duplicate_in_election) {
  alert('NIM sudah terdaftar di pemilu ini')
}
```

#### 4. Voter Self Registration UI
```typescript
import { selfRegisterToElection } from '@/services/voterRegistration'

const handleRegister = async () => {
  try {
    const result = await selfRegisterToElection(token, electionId, {
      voting_method: selectedMethod,
      tps_id: selectedMethod === 'TPS' ? selectedTpsId : null
    })
    
    alert(`Berhasil daftar! Status: ${result.status}`)
  } catch (err) {
    if (err.status === 409) {
      alert('Anda sudah terdaftar di pemilu ini')
    } else {
      alert('Gagal mendaftar: ' + err.message)
    }
  }
}
```

---

## ✅ Validasi & Error Handling

### Validasi Client-Side
```typescript
import { validateVoterRegistration, isNimRequired } from '@/types/electionVoters'

const errors = validateVoterRegistration(formData)
if (errors.length > 0) {
  console.error('Validation errors:', errors)
  return
}

// Check NIM requirement
if (isNimRequired(formData.voter_type) && !formData.nim) {
  alert('NIM wajib diisi untuk mahasiswa')
}
```

### Error Codes
```typescript
// 400 - Bad Request (invalid enum/data)
// 404 - Not Found (voter/election not found)
// 409 - Conflict (duplicate NIM in election)
// 422 - Unprocessable Entity (NIM kosong untuk STUDENT)
```

---

## 🧪 Testing Checklist

### Admin Features
- [ ] Lookup NIM yang belum ada (404)
- [ ] Lookup NIM yang sudah ada tapi belum di-enroll
- [ ] Lookup NIM yang sudah enrolled
- [ ] Register STUDENT tanpa NIM (422 error)
- [ ] Register STUDENT dengan NIM duplikat (409 error)
- [ ] Register LECTURER tanpa NIM (success)
- [ ] Update status pemilih (PENDING → VERIFIED)
- [ ] Update voting method (ONLINE → TPS)
- [ ] Assign TPS ke pemilih
- [ ] Filter list by status, voting_method, faculty, etc.

### Voter Features
- [ ] Self-register dengan method ONLINE
- [ ] Self-register dengan method TPS
- [ ] Register ulang (409 error)
- [ ] Check status sebelum terdaftar (404)
- [ ] Check status setelah terdaftar
- [ ] View TPS assignment jika method=TPS

### Backward Compatibility
- [ ] Existing DPT list masih berfungsi
- [ ] Existing DPT edit masih berfungsi
- [ ] Existing voter status check masih berfungsi
- [ ] Legacy API fallback works

---

## 📚 Additional Resources

### Key Files
- `/src/services/adminElectionVoters.ts` - Admin voter management
- `/src/services/voterRegistration.ts` - Voter self-registration
- `/src/services/adminDpt.ts` - Legacy DPT compatibility
- `/src/services/voterStatus.ts` - Voter status with fallback
- `/src/types/electionVoters.ts` - Type definitions & validators

### API Base URL
All endpoints assume base URL: `/api/v1`

### Authentication
All endpoints require Bearer JWT token with appropriate role:
- Admin endpoints: `ADMIN` or `SUPER_ADMIN`
- Voter endpoints: `STUDENT`, `LECTURER`, or `STAFF`

---

## 🚀 Quick Start Example

### Admin: Add New Voter
```typescript
import { lookupVoterByNim, registerVoterToElection } from '@/services/adminElectionVoters'

async function addVoter(nim: string) {
  // 1. Check if exists
  try {
    const lookup = await lookupVoterByNim(token, nim, electionId)
    if (lookup.election_voter.is_enrolled) {
      return { success: false, message: 'Sudah terdaftar' }
    }
  } catch (err) {
    // NIM not found, proceed to register
  }
  
  // 2. Register
  const result = await registerVoterToElection(token, {
    voter_type: 'STUDENT',
    nim,
    name: 'John Doe',
    email: 'john@example.com',
    faculty_code: 'FT',
    faculty_name: 'Teknik',
    voting_method: 'ONLINE',
    status: 'PENDING'
  }, electionId)
  
  return { success: true, data: result }
}
```

### Voter: Self Register
```typescript
import { selfRegisterToElection, getVoterElectionStatus } from '@/services/voterRegistration'

async function registerMe() {
  try {
    // Check current status first
    const status = await getVoterElectionStatus(token, electionId)
    return { alreadyRegistered: true, status }
  } catch (err) {
    if (err.status === 404) {
      // Not registered yet, proceed
      const result = await selfRegisterToElection(token, electionId, {
        voting_method: 'ONLINE'
      })
      return { alreadyRegistered: false, result }
    }
    throw err
  }
}
```

---

## 📝 Notes

1. **Primary Key Change**: Gunakan `election_voter_id` untuk operasi update/delete, bukan `voter_id`
2. **NIM Validation**: Selalu validasi NIM wajib untuk `voter_type=STUDENT`
3. **Duplicate Handling**: Frontend harus handle 409 error dengan user-friendly message
4. **Status Enum**: UI harus support semua status: PENDING, VERIFIED, REJECTED, VOTED, BLOCKED
5. **Backward Compatibility**: Existing features tetap berfungsi dengan fallback mechanism
6. **Testing**: Test dengan multiple elections untuk memastikan NIM bisa duplikat lintas pemilu

---

**Last Updated**: 2025-11-26
**API Version**: v1
**Contract Status**: ✅ Implemented
