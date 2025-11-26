# DPT API - Quick Reference Guide

## Quick Import Guide

```typescript
// Admin DPT functions
import { 
  fetchAdminDpt,
  lookupVoterByNim,
  upsertVoter,
  updateAdminDptVoter,
  deleteAdminDptVoter,
  importDptCsv,
  exportDptCsv
} from '../services/adminDpt'

// Election voters functions (alternative)
import {
  listElectionVoters,
  lookupVoterByNim,
  registerVoterToElection,
  updateElectionVoter,
  importVotersCsv,
  exportVotersCsv
} from '../services/adminElectionVoters'

// Voter self-service
import {
  selfRegisterToElection,
  getVoterElectionStatus
} from '../services/voterRegistration'
```

## Common Use Cases

### 1. Get DPT List with Filters

```typescript
const params = new URLSearchParams({
  page: '1',
  limit: '50',
  search: '2021',
  voter_type: 'STUDENT',
  status: 'VERIFIED',
  voting_method: 'ONLINE'
})

const { items, total } = await fetchAdminDpt(token, params, electionId)
```

### 2. Lookup Voter by NIM

```typescript
const result = await lookupVoterByNim(token, '2021101', electionId)

if (result.election_voter) {
  // Already enrolled
  console.log('Status:', result.election_voter.status)
} else {
  // Not enrolled yet
  console.log('Can enroll:', result.voter.name)
}
```

### 3. Add New Voter

```typescript
const result = await upsertVoter(token, {
  voter_type: 'STUDENT',
  nim: '2021999',
  name: 'John Doe',
  email: 'john@example.com',
  faculty_code: 'FT',
  faculty_name: 'Fakultas Teknik',
  study_program_code: 'TI',
  study_program_name: 'Teknik Informatika',
  cohort_year: 2021,
  academic_status: 'ACTIVE',
  voting_method: 'ONLINE',
  status: 'PENDING',
  tps_id: null
}, electionId)

console.log('Created:', result.created_election_voter)
console.log('Election Voter ID:', result.election_voter_id)
```

### 4. Update Voter Status

```typescript
// Verify a voter
await updateAdminDptVoter(token, electionVoterId, {
  status: 'VERIFIED'
}, electionId)

// Change voting method
await updateAdminDptVoter(token, electionVoterId, {
  voting_method: 'TPS',
  tps_id: 5
}, electionId)

// Block a voter
await updateAdminDptVoter(token, electionVoterId, {
  status: 'BLOCKED'
}, electionId)
```

### 5. Import CSV

```typescript
// From file input
const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0]
  if (!file) return
  
  try {
    const result = await importDptCsv(token, file, electionId)
    console.log(`Success: ${result.success}/${result.total}`)
    
    if (result.errors.length > 0) {
      result.errors.forEach(err => {
        console.error(`Row ${err.row}: ${err.error}`)
      })
    }
  } catch (error) {
    console.error('Import failed:', error)
  }
}
```

### 6. Export CSV

```typescript
const handleExport = async () => {
  // Optional filters
  const filters = new URLSearchParams({
    voter_type: 'STUDENT',
    status: 'VERIFIED'
  })
  
  const blob = await exportDptCsv(token, filters, electionId)
  
  // Download file
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `dpt-election-${electionId}-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
```

### 7. Voter Self-Registration

```typescript
// Voter registers for online voting
const result = await selfRegisterToElection(token, electionId, {
  voting_method: 'ONLINE',
  tps_id: null
})

console.log('Status:', result.status) // Usually 'PENDING'
```

### 8. Check Voter Status

```typescript
const status = await getVoterElectionStatus(token, electionId)

console.log('Enrollment status:', status.status)
console.log('Voting method:', status.voting_method)
console.log('Has voted:', status.voted_at !== null)
```

## CSV Format for Import

```csv
nim,name,faculty,study_program,cohort_year
2021101,Agus Santoso,Fakultas Teknik,Teknik Informatika,2021
2021102,Budi Pratama,Fakultas Teknik,Teknik Elektro,2021
```

**Required columns:**
- `nim` - NIM/NIDN/NIP
- `name` - Full name
- `faculty` - Faculty name
- `study_program` - Study program name
- `cohort_year` - Year (number)

## Status Enum Values

### Election Voter Status
```typescript
type ElectionVoterStatus = 
  | 'PENDING'    // Awaiting verification
  | 'VERIFIED'   // Approved, can vote
  | 'REJECTED'   // Registration rejected
  | 'VOTED'      // Already voted
  | 'BLOCKED'    // Blocked from voting
```

### Voting Method
```typescript
type VotingMethod = 
  | 'ONLINE'     // Vote online
  | 'TPS'        // Vote at polling station
```

### Voter Type
```typescript
type VoterType = 
  | 'STUDENT'    // Mahasiswa (has NIM)
  | 'LECTURER'   // Dosen (has NIDN)
  | 'STAFF'      // Staf (has NIP)
```

### Academic Status
```typescript
type AcademicStatus = 
  | 'ACTIVE'     // Currently active
  | 'GRADUATED'  // Already graduated
  | 'ON_LEAVE'   // On leave (cuti)
  | 'DROPPED'    // Dropped out (DO)
  | 'INACTIVE'   // Inactive
```

## Error Handling

```typescript
try {
  const result = await lookupVoterByNim(token, nim, electionId)
  // Success
} catch (error: any) {
  switch (error.status) {
    case 400:
      // Validation error
      console.error('Invalid input:', error.message)
      break
    case 401:
      // Unauthorized
      console.error('Token expired or invalid')
      break
    case 403:
      // Forbidden
      console.error('Insufficient permissions')
      break
    case 404:
      // Not found
      console.error('Voter not found')
      break
    case 409:
      // Duplicate
      console.error('Already registered')
      break
    default:
      console.error('Server error:', error.message)
  }
}
```

## React Hook Example

```typescript
import { useState } from 'react'
import { lookupVoterByNim, type VoterLookupResponse } from '../services/adminDpt'

export const useVoterLookup = (token: string, electionId: number) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<VoterLookupResponse | null>(null)
  
  const lookup = async (nim: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await lookupVoterByNim(token, nim, electionId)
      setResult(data)
      return data
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }
  
  return { lookup, loading, error, result }
}
```

## Bulk Operations

```typescript
// Bulk verify voters
const verifyMultiple = async (voterIds: number[]) => {
  const results = await Promise.allSettled(
    voterIds.map(id => 
      updateAdminDptVoter(token, id.toString(), {
        status: 'VERIFIED'
      }, electionId)
    )
  )
  
  const succeeded = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length
  
  return { succeeded, failed }
}
```

## Query Parameters Reference

```typescript
// All available filters for GET /admin/elections/{id}/voters
const params = new URLSearchParams({
  page: '1',                          // Page number (default: 1)
  limit: '50',                        // Items per page (default: 50, max: 100)
  search: 'keyword',                  // Search NIM or name
  voter_type: 'STUDENT',              // STUDENT | LECTURER | STAFF
  status: 'VERIFIED',                 // PENDING | VERIFIED | REJECTED | VOTED | BLOCKED
  voting_method: 'ONLINE',            // ONLINE | TPS
  faculty_code: 'FT',                 // Faculty code filter
  study_program_code: 'TI',           // Study program code filter
  cohort_year: '2021',                // Cohort year filter
  tps_id: '5'                         // TPS ID filter
})
```

## Tips & Best Practices

1. **Always handle errors** - All API calls can fail
2. **Use pagination** - Don't load all voters at once
3. **Validate before API call** - Check required fields first
4. **Cache lookup results** - Avoid repeated lookups
5. **Batch updates** - Use `Promise.allSettled()` for bulk operations
6. **Show loading states** - API calls may take time
7. **CSV validation** - Check file format before import
8. **Export with filters** - Apply same filters as current view

---

**Last Updated:** 2025-11-26  
**Version:** 2.0
