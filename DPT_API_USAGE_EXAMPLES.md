# DPT API Usage Examples

## Component Integration Examples

### 1. Voter Lookup Component

```tsx
import React, { useState } from 'react'
import { lookupVoterByNim } from '../services/adminDpt'
import { useAdminAuth } from '../hooks/useAdminAuth'

const VoterLookup: React.FC = () => {
  const { token } = useAdminAuth()
  const [nim, setNim] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLookup = async () => {
    if (!nim || !token) return
    
    setLoading(true)
    setError(null)
    try {
      const data = await lookupVoterByNim(token, nim)
      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Lookup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="voter-lookup">
      <h2>Cari Pemilih</h2>
      <div className="search-box">
        <input
          type="text"
          value={nim}
          onChange={(e) => setNim(e.target.value)}
          placeholder="Masukkan NIM/NIDN/NIP"
        />
        <button onClick={handleLookup} disabled={loading}>
          {loading ? 'Mencari...' : 'Cari'}
        </button>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {result && (
        <div className="result">
          <h3>{result.voter.name}</h3>
          <p>NIM: {result.voter.nim}</p>
          <p>Email: {result.voter.email}</p>
          
          {result.election_voter ? (
            <div className="enrolled">
              <p>Status: {result.election_voter.status}</p>
              <p>Metode: {result.election_voter.voting_method}</p>
            </div>
          ) : (
            <p>Belum terdaftar di pemilu ini</p>
          )}
        </div>
      )}
    </div>
  )
}
```

### 2. Add Voter Form

```tsx
import React, { useState } from 'react'
import { upsertVoter } from '../services/adminDpt'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { useActiveElection } from '../hooks/useActiveElection'

const AddVoterForm: React.FC = () => {
  const { token } = useAdminAuth()
  const { activeElectionId } = useActiveElection()
  const [formData, setFormData] = useState({
    nim: '',
    name: '',
    email: '',
    voter_type: 'STUDENT' as const,
    faculty_code: '',
    faculty_name: '',
    study_program_code: '',
    study_program_name: '',
    cohort_year: new Date().getFullYear(),
    voting_method: 'ONLINE' as const,
    status: 'PENDING' as const,
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !activeElectionId) return

    setSubmitting(true)
    try {
      const result = await upsertVoter(token, formData, activeElectionId)
      
      if (result.created_election_voter) {
        alert('Pemilih berhasil ditambahkan!')
      } else if (result.duplicate_in_election) {
        alert('Pemilih sudah terdaftar di pemilu ini')
      }
    } catch (err: any) {
      alert('Gagal: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Tambah Pemilih</h2>
      
      <input
        type="text"
        value={formData.nim}
        onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
        placeholder="NIM"
        required
      />
      
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Nama Lengkap"
        required
      />
      
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
        required
      />
      
      <select
        value={formData.voting_method}
        onChange={(e) => setFormData({ 
          ...formData, 
          voting_method: e.target.value as 'ONLINE' | 'TPS' 
        })}
      >
        <option value="ONLINE">Online</option>
        <option value="TPS">TPS</option>
      </select>
      
      <button type="submit" disabled={submitting}>
        {submitting ? 'Menyimpan...' : 'Simpan'}
      </button>
    </form>
  )
}
```

### 3. CSV Import Component

```tsx
import React, { useState } from 'react'
import { importDptCsv } from '../services/adminDpt'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { useActiveElection } from '../hooks/useActiveElection'

const CsvImport: React.FC = () => {
  const { token } = useAdminAuth()
  const { activeElectionId } = useActiveElection()
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !token || !activeElectionId) return

    setUploading(true)
    try {
      const importResult = await importDptCsv(token, file, activeElectionId)
      setResult(importResult)
    } catch (err: any) {
      alert('Import gagal: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="csv-import">
      <h2>Import DPT dari CSV</h2>
      
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        disabled={uploading}
      />
      
      {uploading && <p>Mengupload...</p>}
      
      {result && (
        <div className="import-result">
          <h3>Hasil Import</h3>
          <p>Total: {result.total}</p>
          <p>Berhasil: {result.success}</p>
          <p>Gagal: {result.failed}</p>
          
          {result.errors.length > 0 && (
            <div className="errors">
              <h4>Error:</h4>
              <ul>
                {result.errors.map((err: any, idx: number) => (
                  <li key={idx}>
                    Baris {err.row} - {err.nim}: {err.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

### 4. CSV Export Component

```tsx
import React, { useState } from 'react'
import { exportDptCsv } from '../services/adminDpt'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { useActiveElection } from '../hooks/useActiveElection'

const CsvExport: React.FC = () => {
  const { token } = useAdminAuth()
  const { activeElectionId } = useActiveElection()
  const [exporting, setExporting] = useState(false)
  const [filters, setFilters] = useState({
    voter_type: '',
    status: '',
  })

  const handleExport = async () => {
    if (!token || !activeElectionId) return

    setExporting(true)
    try {
      const params = new URLSearchParams()
      if (filters.voter_type) params.append('voter_type', filters.voter_type)
      if (filters.status) params.append('status', filters.status)
      
      const blob = await exportDptCsv(token, params, activeElectionId)
      
      // Download file
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dpt-election-${activeElectionId}-${Date.now()}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err: any) {
      alert('Export gagal: ' + err.message)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="csv-export">
      <h2>Export DPT ke CSV</h2>
      
      <div className="filters">
        <select
          value={filters.voter_type}
          onChange={(e) => setFilters({ ...filters, voter_type: e.target.value })}
        >
          <option value="">Semua Tipe</option>
          <option value="STUDENT">Mahasiswa</option>
          <option value="LECTURER">Dosen</option>
          <option value="STAFF">Staff</option>
        </select>
        
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">Semua Status</option>
          <option value="PENDING">Pending</option>
          <option value="VERIFIED">Verified</option>
          <option value="VOTED">Sudah Memilih</option>
        </select>
      </div>
      
      <button onClick={handleExport} disabled={exporting}>
        {exporting ? 'Mengexport...' : 'Export CSV'}
      </button>
    </div>
  )
}
```

### 5. Voter Status Update Component

```tsx
import React, { useState } from 'react'
import { updateAdminDptVoter } from '../services/adminDpt'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { useActiveElection } from '../hooks/useActiveElection'
import type { ElectionVoterStatus } from '../types/dptAdmin'

interface Props {
  electionVoterId: string
  currentStatus: ElectionVoterStatus
  voterName: string
  onUpdate: () => void
}

const VoterStatusUpdate: React.FC<Props> = ({
  electionVoterId,
  currentStatus,
  voterName,
  onUpdate,
}) => {
  const { token } = useAdminAuth()
  const { activeElectionId } = useActiveElection()
  const [updating, setUpdating] = useState(false)

  const updateStatus = async (newStatus: ElectionVoterStatus) => {
    if (!token || !activeElectionId) return
    
    const confirmed = confirm(
      `Ubah status ${voterName} menjadi ${newStatus}?`
    )
    if (!confirmed) return

    setUpdating(true)
    try {
      await updateAdminDptVoter(
        token,
        electionVoterId,
        { status: newStatus },
        activeElectionId
      )
      onUpdate()
      alert('Status berhasil diupdate')
    } catch (err: any) {
      alert('Gagal update: ' + err.message)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="status-buttons">
      <button
        onClick={() => updateStatus('VERIFIED')}
        disabled={updating || currentStatus === 'VERIFIED'}
        className="btn-success"
      >
        Verifikasi
      </button>
      
      <button
        onClick={() => updateStatus('REJECTED')}
        disabled={updating || currentStatus === 'REJECTED'}
        className="btn-danger"
      >
        Tolak
      </button>
      
      <button
        onClick={() => updateStatus('BLOCKED')}
        disabled={updating || currentStatus === 'BLOCKED'}
        className="btn-warning"
      >
        Blokir
      </button>
    </div>
  )
}
```

### 6. Voter Self-Registration Component

```tsx
import React, { useState, useEffect } from 'react'
import { 
  selfRegisterToElection, 
  getVoterElectionStatus 
} from '../services/voterRegistration'
import { useAuth } from '../hooks/useAuth'

const VoterRegistration: React.FC<{ electionId: number }> = ({ electionId }) => {
  const { token } = useAuth()
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [votingMethod, setVotingMethod] = useState<'ONLINE' | 'TPS'>('ONLINE')

  useEffect(() => {
    loadStatus()
  }, [])

  const loadStatus = async () => {
    if (!token) return
    
    setLoading(true)
    try {
      const data = await getVoterElectionStatus(token, electionId)
      setStatus(data)
    } catch (err: any) {
      if (err.status === 404) {
        // Not registered yet
        setStatus(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!token) return
    
    setRegistering(true)
    try {
      await selfRegisterToElection(token, electionId, {
        voting_method: votingMethod,
        tps_id: votingMethod === 'TPS' ? 1 : null, // TODO: Select TPS
      })
      await loadStatus()
      alert('Pendaftaran berhasil!')
    } catch (err: any) {
      alert('Pendaftaran gagal: ' + err.message)
    } finally {
      setRegistering(false)
    }
  }

  if (loading) return <div>Loading...</div>

  if (status) {
    return (
      <div className="registration-status">
        <h3>Status Pendaftaran</h3>
        <p>Status: {status.status}</p>
        <p>Metode Voting: {status.voting_method}</p>
        {status.voted_at && (
          <p>Sudah memilih pada: {new Date(status.voted_at).toLocaleString()}</p>
        )}
      </div>
    )
  }

  return (
    <div className="voter-registration">
      <h3>Daftar Pemilu</h3>
      
      <div className="voting-method">
        <label>
          <input
            type="radio"
            value="ONLINE"
            checked={votingMethod === 'ONLINE'}
            onChange={(e) => setVotingMethod(e.target.value as 'ONLINE')}
          />
          Voting Online
        </label>
        
        <label>
          <input
            type="radio"
            value="TPS"
            checked={votingMethod === 'TPS'}
            onChange={(e) => setVotingMethod(e.target.value as 'TPS')}
          />
          Voting di TPS
        </label>
      </div>
      
      <button onClick={handleRegister} disabled={registering}>
        {registering ? 'Mendaftar...' : 'Daftar'}
      </button>
    </div>
  )
}
```

### 7. Bulk Operations Component

```tsx
import React, { useState } from 'react'
import { updateElectionVoter } from '../services/adminElectionVoters'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { useActiveElection } from '../hooks/useActiveElection'

interface Props {
  selectedVoterIds: number[]
  onComplete: () => void
}

const BulkOperations: React.FC<Props> = ({ selectedVoterIds, onComplete }) => {
  const { token } = useAdminAuth()
  const { activeElectionId } = useActiveElection()
  const [processing, setProcessing] = useState(false)

  const bulkVerify = async () => {
    if (!token || !activeElectionId || selectedVoterIds.length === 0) return
    
    const confirmed = confirm(
      `Verifikasi ${selectedVoterIds.length} pemilih?`
    )
    if (!confirmed) return

    setProcessing(true)
    let success = 0
    let failed = 0

    for (const voterId of selectedVoterIds) {
      try {
        await updateElectionVoter(
          token,
          voterId,
          { status: 'VERIFIED' },
          activeElectionId
        )
        success++
      } catch {
        failed++
      }
    }

    setProcessing(false)
    alert(`Selesai: ${success} berhasil, ${failed} gagal`)
    onComplete()
  }

  const bulkReject = async () => {
    if (!token || !activeElectionId || selectedVoterIds.length === 0) return
    
    const confirmed = confirm(
      `Tolak ${selectedVoterIds.length} pemilih?`
    )
    if (!confirmed) return

    setProcessing(true)
    let success = 0
    let failed = 0

    for (const voterId of selectedVoterIds) {
      try {
        await updateElectionVoter(
          token,
          voterId,
          { status: 'REJECTED' },
          activeElectionId
        )
        success++
      } catch {
        failed++
      }
    }

    setProcessing(false)
    alert(`Selesai: ${success} berhasil, ${failed} gagal`)
    onComplete()
  }

  return (
    <div className="bulk-operations">
      <p>{selectedVoterIds.length} pemilih dipilih</p>
      
      <button 
        onClick={bulkVerify} 
        disabled={processing || selectedVoterIds.length === 0}
      >
        Verifikasi Semua
      </button>
      
      <button 
        onClick={bulkReject} 
        disabled={processing || selectedVoterIds.length === 0}
        className="btn-danger"
      >
        Tolak Semua
      </button>
    </div>
  )
}
```

## Hook Examples

### Custom Hook for DPT Management

```tsx
import { useState, useCallback } from 'react'
import { 
  fetchAdminDpt,
  lookupVoterByNim,
  upsertVoter,
  updateAdminDptVoter,
  deleteAdminDptVoter
} from '../services/adminDpt'
import type { DPTEntry, UpsertVoterRequest } from '../services/adminDpt'

export const useDptManagement = (token: string, electionId: number) => {
  const [voters, setVoters] = useState<DPTEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadVoters = useCallback(async (params?: URLSearchParams) => {
    setLoading(true)
    setError(null)
    try {
      const { items } = await fetchAdminDpt(
        token, 
        params || new URLSearchParams(), 
        electionId
      )
      setVoters(items)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token, electionId])

  const lookup = useCallback(async (nim: string) => {
    return lookupVoterByNim(token, nim, electionId)
  }, [token, electionId])

  const addVoter = useCallback(async (data: UpsertVoterRequest) => {
    const result = await upsertVoter(token, data, electionId)
    await loadVoters()
    return result
  }, [token, electionId, loadVoters])

  const updateVoter = useCallback(async (
    voterId: string, 
    updates: any
  ) => {
    await updateAdminDptVoter(token, voterId, updates, electionId)
    await loadVoters()
  }, [token, electionId, loadVoters])

  const deleteVoter = useCallback(async (voterId: string) => {
    await deleteAdminDptVoter(token, voterId, electionId)
    await loadVoters()
  }, [token, electionId, loadVoters])

  return {
    voters,
    loading,
    error,
    loadVoters,
    lookup,
    addVoter,
    updateVoter,
    deleteVoter,
  }
}
```

---

**Last Updated:** 2025-11-26  
**Version:** 2.0
