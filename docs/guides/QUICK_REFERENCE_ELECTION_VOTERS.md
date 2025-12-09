# Quick Reference: Election Voters API

## 🎯 Ringkasan Perubahan

### Skema Baru
- **voters table**: Biodata pemilih (NIM bisa duplikat lintas tahun)
- **election_voters table**: Per-pemilu enrollment (unique: election_id + nim)
- **Primary key**: Gunakan `election_voter_id` untuk operasi update/delete

### Validasi Utama
```typescript
// NIM wajib untuk STUDENT
voter_type = 'STUDENT' → nim WAJIB
voter_type = 'LECTURER' | 'STAFF' → nim OPSIONAL

// Status enum
'PENDING' | 'VERIFIED' | 'REJECTED' | 'VOTED' | 'BLOCKED'

// Voting method
'ONLINE' | 'TPS'
```

---

## 📦 Import Services

```typescript
// Admin - Kelola pemilih
import {
  lookupVoterByNim,
  registerVoterToElection,
  listElectionVoters,
  updateElectionVoter
} from '@/services/adminElectionVoters'

// Voter - Self registration
import {
  selfRegisterToElection,
  getVoterElectionStatus
} from '@/services/voterRegistration'

// Legacy compatibility
import {
  fetchAdminDpt,
  updateAdminDptVoter,
  deleteAdminDptVoter
} from '@/services/adminDpt'

// Type definitions
import type {
  ElectionVoterStatus,
  VotingMethod,
  VoterType,
  VoterLookup,
  VoterRegistrationRequest,
  ElectionVoterItem
} from '@/types/electionVoters'
```

---

## 🔍 Admin: Lookup NIM

```typescript
// Cek NIM sudah terdaftar atau belum
const lookup = await lookupVoterByNim(token, '202012345', electionId)

// Response structure
{
  voter: {
    id: 12,
    voter_type: 'STUDENT',
    nim: '202012345',
    name: 'Budi',
    email: 'budi@kampus.ac.id'
  },
  election_voter: {
    is_enrolled: true,      // true = sudah daftar di pemilu ini
    id: 33,
    status: 'VERIFIED',
    voting_method: 'ONLINE'
  }
}
```

---

## ➕ Admin: Daftarkan Pemilih

```typescript
// Upsert voter + daftarkan ke pemilu
const result = await registerVoterToElection(token, {
  voter_type: 'STUDENT',
  nim: '202012345',        // WAJIB untuk STUDENT
  name: 'Budi Santoso',
  email: 'budi@kampus.ac.id',
  phone: '081234567890',
  faculty_code: 'FT',
  faculty_name: 'Fakultas Teknik',
  study_program_code: 'IF',
  study_program_name: 'Informatika',
  cohort_year: 2020,
  academic_status: 'ACTIVE',
  voting_method: 'ONLINE',
  tps_id: null,
  status: 'PENDING'       // Optional, default PENDING
}, electionId)

// Response
{
  voter_id: 12,
  election_voter_id: 33,
  status: 'PENDING',
  voting_method: 'ONLINE',
  tps_id: null,
  created_voter: false,           // true jika buat baru di voters
  created_election_voter: true,   // true jika baru daftar di pemilu ini
  duplicate_in_election: false    // true jika NIM sudah ada di pemilu ini
}
```

### Error Handling
```typescript
try {
  const result = await registerVoterToElection(token, data, electionId)
} catch (err) {
  if (err.status === 409) {
    alert('NIM sudah terdaftar di pemilu ini')
  } else if (err.status === 422) {
    alert('NIM wajib diisi untuk mahasiswa')
  } else if (err.status === 400) {
    alert('Data tidak valid: ' + err.message)
  }
}
```

---

## 📋 Admin: List Pemilih

```typescript
// Build query params
const params = new URLSearchParams({
  page: '1',
  limit: '50',
  search: '202012',           // NIM atau nama
  voter_type: 'STUDENT',
  status: 'VERIFIED',
  voting_method: 'ONLINE',
  faculty_code: 'FT',
  study_program_code: 'IF',
  cohort_year: '2020',
  tps_id: '7'
})

const response = await listElectionVoters(token, params, electionId)

// Response
{
  items: [
    {
      election_voter_id: 33,   // IMPORTANT: gunakan ini untuk update/delete
      voter_id: 12,
      nim: '202012345',
      name: 'Budi',
      voter_type: 'STUDENT',
      status: 'VERIFIED',
      voting_method: 'ONLINE',
      tps_id: null,
      checked_in_at: null,
      voted_at: null,
      updated_at: '2025-12-01T10:00:00Z'
    }
  ],
  page: 1,
  limit: 50,
  total_items: 1234,
  total_pages: 25
}
```

---

## ✏️ Admin: Update Status/Method/TPS

```typescript
// Update pemilih (PATCH, bukan PUT)
const updated = await updateElectionVoter(
  token,
  electionVoterId,  // IMPORTANT: election_voter_id, bukan voter_id
  {
    status: 'VERIFIED',
    voting_method: 'TPS',
    tps_id: 7
  },
  electionId
)

// Semua field optional - hanya kirim yang mau diupdate
await updateElectionVoter(token, electionVoterId, {
  status: 'VERIFIED'  // update status saja
}, electionId)

await updateElectionVoter(token, electionVoterId, {
  voting_method: 'ONLINE',
  tps_id: null  // unset TPS
}, electionId)
```

---

## 👤 Voter: Self Registration

```typescript
// Daftar sendiri ke pemilu
const result = await selfRegisterToElection(token, electionId, {
  voting_method: 'ONLINE',  // atau 'TPS'
  tps_id: null              // required jika method='TPS'
})

// Response
{
  election_voter_id: 33,
  status: 'PENDING',
  voting_method: 'ONLINE',
  tps_id: null
}

// Error handling
try {
  const result = await selfRegisterToElection(token, electionId, data)
  alert(`Berhasil! Status: ${result.status}`)
} catch (err) {
  if (err.status === 409) {
    alert('Anda sudah terdaftar di pemilu ini')
  }
}
```

---

## 📊 Voter: Cek Status

```typescript
// Cek status pendaftaran
const status = await getVoterElectionStatus(token, electionId)

// Response
{
  election_voter_id: 33,
  status: 'VERIFIED',
  voting_method: 'TPS',
  tps: {
    id: 7,
    name: 'TPS Aula Utama',
    location: 'Gedung Rektorat Lantai 1'
  },
  checked_in_at: null,
  voted_at: null
}

// Error handling
try {
  const status = await getVoterElectionStatus(token, electionId)
  
  if (status.status === 'VERIFIED') {
    console.log('Sudah diverifikasi, bisa voting')
  } else if (status.status === 'PENDING') {
    console.log('Menunggu verifikasi admin')
  }
} catch (err) {
  if (err.status === 404) {
    console.log('Belum terdaftar')
  }
}
```

---

## 🔄 Legacy Compatibility

```typescript
// fetchAdminDpt tetap berfungsi, tapi...
const { items } = await fetchAdminDpt(token, params, electionId)

// PENTING: item.id sekarang adalah election_voter_id
items.forEach(item => {
  console.log(item.id)  // election_voter_id (bukan voter_id lagi)
})

// Update/delete gunakan election_voter_id
await updateAdminDptVoter(token, item.id, updates, electionId)
await deleteAdminDptVoter(token, item.id, electionId)
```

---

## ✅ Validation Helper

```typescript
import { validateVoterRegistration, isNimRequired } from '@/types/electionVoters'

// Validasi form sebelum submit
const errors = validateVoterRegistration(formData)
if (errors.length > 0) {
  alert(errors.join('\n'))
  return
}

// Check NIM requirement dynamically
if (isNimRequired(voterType)) {
  // NIM field is required
  setNimRequired(true)
}
```

---

## 🎨 UI Examples

### Admin: Verification UI
```typescript
const handleVerify = async (electionVoterId: number) => {
  await updateElectionVoter(token, electionVoterId, {
    status: 'VERIFIED'
  }, electionId)
  
  toast.success('Pemilih berhasil diverifikasi')
  refreshList()
}

const handleReject = async (electionVoterId: number) => {
  await updateElectionVoter(token, electionVoterId, {
    status: 'REJECTED'
  }, electionId)
  
  toast.error('Pemilih ditolak')
  refreshList()
}
```

### Admin: Assign TPS
```typescript
const handleAssignTPS = async (electionVoterId: number, tpsId: number) => {
  await updateElectionVoter(token, electionVoterId, {
    voting_method: 'TPS',
    tps_id: tpsId
  }, electionId)
  
  toast.success('TPS berhasil di-assign')
}
```

### Voter: Registration Form
```typescript
const handleSubmit = async () => {
  try {
    // Check if already registered
    try {
      const status = await getVoterElectionStatus(token, electionId)
      alert(`Anda sudah terdaftar dengan status: ${status.status}`)
      return
    } catch (err) {
      if (err.status !== 404) throw err
      // Not registered, proceed
    }
    
    // Register
    const result = await selfRegisterToElection(token, electionId, {
      voting_method: selectedMethod,
      tps_id: selectedMethod === 'TPS' ? selectedTpsId : null
    })
    
    alert(`Pendaftaran berhasil! Status: ${result.status}`)
    navigate('/pemilih/status')
  } catch (err) {
    alert('Gagal: ' + err.message)
  }
}
```

---

## 🐛 Common Issues

### Issue: 422 Error pada registration
**Cause**: NIM kosong untuk voter_type=STUDENT  
**Fix**: Validasi NIM required jika voter_type === 'STUDENT'

### Issue: 409 Conflict
**Cause**: NIM sudah terdaftar di pemilu yang sama  
**Fix**: Gunakan lookup endpoint untuk cek sebelum register

### Issue: Update gagal 404
**Cause**: Menggunakan voter_id instead of election_voter_id  
**Fix**: Gunakan election_voter_id dari response list

### Issue: TPS null tapi method=TPS
**Cause**: TPS tidak di-assign  
**Fix**: Update dengan tps_id yang valid

---

## 📚 Complete Flow Example

### Admin: Full Registration Flow
```typescript
async function fullRegistrationFlow(nim: string) {
  // 1. Lookup
  let existingVoter = null
  try {
    const lookup = await lookupVoterByNim(token, nim, electionId)
    
    if (lookup.election_voter.is_enrolled) {
      return {
        success: false,
        message: 'NIM sudah terdaftar di pemilu ini'
      }
    }
    
    existingVoter = lookup.voter
  } catch (err) {
    if (err.status !== 404) throw err
    // NIM not found, will create new
  }
  
  // 2. Register
  const data = existingVoter ? {
    // Use existing data
    voter_type: existingVoter.voter_type,
    nim: existingVoter.nim,
    name: existingVoter.name,
    email: existingVoter.email,
    voting_method: 'ONLINE',
    status: 'PENDING'
  } : {
    // New voter
    voter_type: 'STUDENT',
    nim: nim,
    name: formData.name,
    email: formData.email,
    faculty_code: formData.faculty_code,
    faculty_name: formData.faculty_name,
    voting_method: 'ONLINE',
    status: 'PENDING'
  }
  
  const result = await registerVoterToElection(token, data, electionId)
  
  // 3. Verify immediately (optional)
  if (autoVerify) {
    await updateElectionVoter(token, result.election_voter_id, {
      status: 'VERIFIED'
    }, electionId)
  }
  
  return {
    success: true,
    electionVoterId: result.election_voter_id,
    created: result.created_voter
  }
}
```

---

**Dibuat**: 2025-11-26  
**Status**: ✅ Siap Digunakan  
**Tested**: Compilation ✅
