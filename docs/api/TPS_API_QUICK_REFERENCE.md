# TPS API - Quick Reference Guide

> **Quick access untuk developer yang ingin menggunakan TPS API**

---

## 📦 Import yang Diperlukan

```typescript
// Services
import { 
  fetchAdminTpsList,
  fetchAdminTpsDetail,
  fetchAdminTpsOperators,
  createAdminTpsOperator,
  deleteAdminTpsOperator,
  fetchAdminTpsAllocation,
  fetchAdminTpsActivity
} from '../services/adminTps'

import {
  fetchTpsPanelDashboard,
  fetchTpsPanelQueue,
  fetchTpsPanelTimeline,
  fetchTpsPanelStatus,
  fetchCheckinDetail,
  createTpsCheckin,
  approveTpsCheckin,
  rejectTpsCheckin
} from '../services/tpsPanel'

// Hooks
import { useTPSAdminStore } from '../hooks/useTPSAdminStore'
import { useTPSPanelStore } from '../hooks/useTPSPanelStore'
import { useActiveElection } from '../hooks/useActiveElection'
import { useAdminAuth } from '../hooks/useAdminAuth'
```

---

## 🎯 Common Use Cases

### 1. **Admin - List TPS dengan Filter**

```typescript
import { useTPSAdminStore } from '../hooks/useTPSAdminStore'

function MyComponent() {
  const { tpsList, loading, refresh } = useTPSAdminStore()
  
  useEffect(() => {
    refresh() // Load semua TPS
  }, [refresh])
  
  return (
    <div>
      {loading && <p>Loading...</p>}
      {tpsList.map(tps => (
        <div key={tps.id}>{tps.nama} - {tps.kode}</div>
      ))}
    </div>
  )
}
```

### 2. **Admin - Detail TPS + Operators**

```typescript
function TPSDetailPage() {
  const { id } = useParams()
  const { loadDetail, fetchOperators } = useTPSAdminStore()
  const [tps, setTps] = useState(null)
  const [operators, setOperators] = useState([])
  
  useEffect(() => {
    const load = async () => {
      const detail = await loadDetail(id)
      if (detail) {
        setTps(detail)
        const ops = await fetchOperators(id)
        setOperators(ops)
      }
    }
    load()
  }, [id])
  
  return (
    <div>
      <h1>{tps?.nama}</h1>
      <h2>Operators:</h2>
      {operators.map(op => (
        <div key={op.userId}>{op.username} - {op.name}</div>
      ))}
    </div>
  )
}
```

### 3. **Admin - Tambah Operator TPS**

```typescript
function AddOperatorForm({ tpsId }) {
  const { addOperator } = useTPSAdminStore()
  const [form, setForm] = useState({ 
    username: '', 
    password: '', 
    name: '', 
    email: '' 
  })
  
  const handleSubmit = async () => {
    try {
      const operator = await addOperator(tpsId, form)
      console.log('Operator created:', operator)
      // Reset form
      setForm({ username: '', password: '', name: '', email: '' })
    } catch (error) {
      console.error('Failed to add operator:', error)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        placeholder="Username" 
        value={form.username}
        onChange={e => setForm(prev => ({ ...prev, username: e.target.value }))}
      />
      <input 
        type="password"
        placeholder="Password" 
        value={form.password}
        onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
      />
      <button type="submit">Add Operator</button>
    </form>
  )
}
```

### 4. **Admin - Alokasi & Aktivitas TPS**

```typescript
function TPSStats({ tpsId }) {
  const { fetchAllocation, fetchActivity } = useTPSAdminStore()
  const [stats, setStats] = useState({ allocation: null, activity: null })
  
  useEffect(() => {
    const load = async () => {
      const [allocation, activity] = await Promise.all([
        fetchAllocation(tpsId),
        fetchActivity(tpsId)
      ])
      setStats({ allocation, activity })
    }
    load()
  }, [tpsId])
  
  return (
    <div>
      <h2>Alokasi</h2>
      <p>Total: {stats.allocation?.totalTpsVoters}</p>
      <p>Alokasi ke TPS ini: {stats.allocation?.allocatedToThisTps}</p>
      <p>Voted: {stats.allocation?.voted}</p>
      
      <h2>Aktivitas Hari Ini</h2>
      <p>Check-ins: {stats.activity?.checkinsToday}</p>
      <p>Voted: {stats.activity?.voted}</p>
      
      <h3>Timeline</h3>
      {stats.activity?.timeline.map(point => (
        <div key={point.hour}>
          {new Date(point.hour).toLocaleTimeString()} - 
          CI: {point.checkins}, V: {point.voted}
        </div>
      ))}
    </div>
  )
}
```

### 5. **TPS Panel - Dashboard dengan Stats**

```typescript
function TPSPanelDashboard() {
  const { token } = useAdminAuth()
  const { activeElectionId } = useActiveElection()
  const { syncFromApi, panelInfo, panelStats, queue } = useTPSPanelStore()
  const [searchParams] = useSearchParams()
  const tpsId = searchParams.get('tpsId')
  
  useEffect(() => {
    if (token && tpsId) {
      syncFromApi(token, tpsId, activeElectionId)
    }
  }, [token, tpsId, activeElectionId])
  
  return (
    <div>
      <h1>{panelInfo.tpsName} - {panelInfo.tpsCode}</h1>
      <p>Status: {panelInfo.status}</p>
      
      <h2>Stats</h2>
      <p>Total Pemilih: {panelStats?.totalRegisteredTpsVoters}</p>
      <p>Checked In: {panelStats?.totalCheckedIn}</p>
      <p>Voted: {panelStats?.totalVoted}</p>
      
      <h2>Queue ({queue.length})</h2>
      {queue.map(entry => (
        <div key={entry.id}>
          {entry.nama} ({entry.nim}) - {entry.status}
        </div>
      ))}
    </div>
  )
}
```

### 6. **TPS Panel - Check-in via QR**

```typescript
function CheckInScanner() {
  const { token } = useAdminAuth()
  const { activeElectionId } = useActiveElection()
  const { addQueueEntry } = useTPSPanelStore()
  const [tpsId] = useState('4') // atau dari params
  
  const handleQRScan = async (qrPayload: string) => {
    try {
      const entry = await createTpsCheckin(token, tpsId, {
        qr_payload: qrPayload
      }, activeElectionId)
      
      // Add to local queue
      addQueueEntry({
        nim: entry.nim,
        nama: entry.nama,
        fakultas: entry.fakultas,
        prodi: entry.prodi,
        angkatan: entry.angkatan,
        statusMahasiswa: entry.statusMahasiswa,
        mode: entry.mode
      })
      
      alert(`Check-in berhasil: ${entry.nama}`)
    } catch (error) {
      console.error('Check-in failed:', error)
      alert('Check-in gagal: ' + error.message)
    }
  }
  
  return <QRScanner onScan={handleQRScan} />
}
```

### 7. **TPS Panel - Check-in Manual (NIM/NIDN/NIP)**

```typescript
function ManualCheckIn() {
  const { token } = useAdminAuth()
  const { activeElectionId } = useActiveElection()
  const { addQueueEntry } = useTPSPanelStore()
  const [code, setCode] = useState('')
  const [tpsId] = useState('4')
  
  const handleSubmit = async () => {
    try {
      const entry = await createTpsCheckin(token, tpsId, {
        registration_code: code
      }, activeElectionId)
      
      addQueueEntry({
        nim: entry.nim,
        nama: entry.nama,
        fakultas: entry.fakultas,
        prodi: entry.prodi,
        angkatan: '-',
        statusMahasiswa: '-',
        mode: 'mobile'
      })
      
      setCode('')
      alert(`Check-in berhasil: ${entry.nama}`)
    } catch (error) {
      alert('Check-in gagal: ' + error.message)
    }
  }
  
  return (
    <div>
      <input 
        placeholder="NIM/NIDN/NIP"
        value={code}
        onChange={e => setCode(e.target.value)}
      />
      <button onClick={handleSubmit}>Check In</button>
    </div>
  )
}
```

### 8. **Direct API Call - Fetch Dashboard**

```typescript
async function loadDashboard(token: string, tpsId: string, electionId: number) {
  const { info, stats } = await fetchTpsPanelDashboard(token, tpsId, electionId)
  
  console.log('TPS:', info.tpsName)
  console.log('Status:', info.status)
  console.log('Total Voters:', stats.totalRegisteredTpsVoters)
  console.log('Checked In:', stats.totalCheckedIn)
  console.log('Voted:', stats.totalVoted)
}
```

### 9. **Direct API Call - Fetch Check-ins dengan Filter**

```typescript
async function loadCheckins(
  token: string, 
  tpsId: string, 
  electionId: number,
  status: 'ALL' | 'PENDING' | 'CHECKED_IN' | 'VOTED' = 'ALL'
) {
  const queue = await fetchTpsPanelQueue(token, tpsId, electionId, status)
  
  console.log(`Found ${queue.length} check-ins with status: ${status}`)
  queue.forEach(entry => {
    console.log(`- ${entry.nama} (${entry.nim}): ${entry.status}`)
  })
}
```

### 10. **Approve/Reject Check-in**

```typescript
async function handleApproval(
  action: 'approve' | 'reject',
  token: string,
  tpsId: string,
  checkinId: string,
  electionId: number
) {
  try {
    if (action === 'approve') {
      await approveTpsCheckin(token, tpsId, checkinId, electionId)
      console.log('Check-in approved')
    } else {
      await rejectTpsCheckin(token, tpsId, checkinId, 'Data tidak sesuai', electionId)
      console.log('Check-in rejected')
    }
  } catch (error) {
    console.error('Action failed:', error)
  }
}
```

---

## 🔑 Error Handling

```typescript
try {
  const tps = await fetchAdminTpsDetail(token, tpsId, electionId)
} catch (error: any) {
  const code = error?.code
  const message = error?.message || 'Unknown error'
  
  switch (code) {
    case 'TPS_NOT_FOUND':
      alert('TPS tidak ditemukan')
      break
    case 'UNAUTHORIZED':
      alert('Token tidak valid atau expired')
      break
    case 'FORBIDDEN':
      alert('Tidak memiliki akses')
      break
    case 'INVALID_REGISTRATION_QR':
      alert('QR tidak valid')
      break
    case 'ALREADY_CHECKED_IN':
      alert('Pemilih sudah check-in')
      break
    case 'ALREADY_VOTED':
      alert('Pemilih sudah voting')
      break
    default:
      alert(message)
  }
}
```

---

## 📊 Response Data Structures

### TPS Detail
```typescript
{
  id: "4",
  kode: "TPS-07",
  nama: "TPS Aula Barat",
  lokasi: "Aula Barat Lt.1",
  kapasitas: 200,
  status: "active",
  jamBuka: "08:00",
  jamTutup: "16:00",
  picNama: "Panitia A",
  picKontak: "0812345678",
  catatan: "Lokasi mudah diakses",
  qrAktif: false
}
```

### TPS Operator
```typescript
{
  userId: 82,
  username: "tps07.op1",
  name: "Operator 1",
  email: "op1@kampus.ac.id"
}
```

### Check-in Entry
```typescript
{
  id: "10",
  nim: "202012345",
  nama: "Budi Santoso",
  fakultas: "Teknik",
  prodi: "Informatika",
  angkatan: "2020",
  status: "CHECKED_IN",
  waktuCheckIn: "2025-11-27T06:31:46Z",
  hasVoted: false
}
```

### Panel Stats
```typescript
{
  totalRegisteredTpsVoters: 100,
  totalCheckedIn: 50,
  totalVoted: 30,
  totalNotVoted: 20
}
```

---

## 🎨 Status Values Reference

### TPS Status
- `ACTIVE` / `active` - TPS aktif dan operasional
- `INACTIVE` / `inactive` - TPS tidak aktif

### Check-in Status
- `PENDING` - Menunggu approval operator
- `CHECKED_IN` - Sudah check-in, belum approved
- `APPROVED` - Sudah approved, siap voting
- `REJECTED` - Check-in ditolak
- `VOTED` - Sudah voting

### Panel Status (dari Dashboard)
- `NOT_STARTED` - Voting belum dimulai
- `OPEN` - TPS buka, voting berlangsung
- `CLOSED` - Voting sudah selesai

---

## 🚀 Tips & Best Practices

1. **Always use hooks** untuk state management: `useTPSAdminStore`, `useTPSPanelStore`
2. **Include electionId** di semua API calls untuk election-scoped data
3. **Handle errors** dengan proper error messages untuk UX yang baik
4. **Use loading states** untuk feedback visual saat fetch data
5. **Refresh data** secara periodik untuk real-time monitoring (every 5-10s)
6. **Cache data** di store untuk menghindari fetch berulang
7. **Validate input** sebelum call API (username, password, nim, dll)

---

## 🔗 Related Files

- **Services**: `src/services/adminTps.ts`, `src/services/tpsPanel.ts`
- **Hooks**: `src/hooks/useTPSAdminStore.tsx`, `src/hooks/useTPSPanelStore.tsx`
- **Pages**: `src/pages/AdminTPSDetail.tsx`, `src/pages/AdminTPSPanel.tsx`, `src/pages/TPSPanelDashboard.tsx`
- **Types**: `src/types/tpsAdmin.ts`, `src/types/tpsPanel.ts`

---

**Full API Documentation**: See `TPS_API_INTEGRATION.md` for complete details.
