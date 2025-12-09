# Backend Election API - Endpoint yang Harus Diperbaiki

## 🔴 Masalah Saat Ini

**Endpoint:** `GET /api/v1/elections/current`

**Response saat ini (SALAH):**
```json
{
  "id": 2,
  "year": 2025,
  "name": "Pemilihan Raya BEM 2025",
  "slug": "PEMIRA-2025",
  "status": "VOTING_OPEN",
  "voting_start_at": "2025-11-25T12:00:00+07:00",
  "voting_end_at": "2025-12-01T23:59:59+07:00",
  "online_enabled": true,
  "tps_enabled": true
}
```

❌ **Masalah:**
- `status: "VOTING_OPEN"` → Seharusnya `"REGISTRATION"` (tanggal sekarang: 25 Nov 2025)
- `voting_start_at: "2025-11-25"` → Seharusnya `"2025-12-15T08:00:00+07:00"`
- `voting_end_at: "2025-12-01"` → Seharusnya `"2025-12-17T23:59:59+07:00"`
- **TIDAK ADA `phases`!**

---

## ✅ Response yang Benar

**Endpoint:** `GET /api/v1/elections/current`

**Response yang diharapkan:**
```json
{
  "id": 2,
  "year": 2025,
  "name": "Pemilihan Raya BEM 2025",
  "slug": "PEMIRA-2025",
  "status": "REGISTRATION",
  "voting_start_at": "2025-12-15T08:00:00+07:00",
  "voting_end_at": "2025-12-17T23:59:59+07:00",
  "online_enabled": true,
  "tps_enabled": true,
  "phases": [
    {
      "phase": "Pendaftaran",
      "start_at": "2025-11-01T00:00:00+07:00",
      "end_at": "2025-11-30T23:59:59+07:00"
    },
    {
      "phase": "Verifikasi Berkas",
      "start_at": "2025-12-01T00:00:00+07:00",
      "end_at": "2025-12-07T23:59:59+07:00"
    },
    {
      "phase": "Kampanye",
      "start_at": "2025-12-08T00:00:00+07:00",
      "end_at": "2025-12-10T23:59:59+07:00"
    },
    {
      "phase": "Masa Tenang",
      "start_at": "2025-12-11T00:00:00+07:00",
      "end_at": "2025-12-14T23:59:59+07:00"
    },
    {
      "phase": "Voting",
      "start_at": "2025-12-15T08:00:00+07:00",
      "end_at": "2025-12-17T23:59:59+07:00"
    },
    {
      "phase": "Rekapitulasi",
      "start_at": "2025-12-21T00:00:00+07:00",
      "end_at": "2025-12-22T23:59:59+07:00"
    }
  ]
}
```

---

## 🎯 Logika Status yang Harus Diimplementasi

Backend harus menghitung `status` berdasarkan **tanggal sekarang** dan **phases**:

```javascript
const now = new Date('2025-11-25T15:34:50+07:00') // Tanggal sekarang

// Cari phase yang sedang aktif
for (const phase of phases) {
  if (now >= phase.start_at && now <= phase.end_at) {
    // Set status berdasarkan phase aktif
    if (phase.phase === 'Pendaftaran') return 'REGISTRATION'
    if (phase.phase === 'Verifikasi Berkas') return 'VERIFICATION'
    if (phase.phase === 'Kampanye') return 'CAMPAIGN'
    if (phase.phase === 'Masa Tenang') return 'QUIET_PERIOD'
    if (phase.phase === 'Voting') return 'VOTING_OPEN'
    if (phase.phase === 'Rekapitulasi') return 'RECAPITULATION'
  }
}
```

### Status Mapping:
| Tanggal                | Status Yang Benar      |
|------------------------|------------------------|
| 1-30 Nov 2025         | `REGISTRATION`         |
| 1-7 Des 2025          | `VERIFICATION`         |
| 8-10 Des 2025         | `CAMPAIGN`             |
| 11-14 Des 2025        | `QUIET_PERIOD`         |
| 15-17 Des 2025        | `VOTING_OPEN`          |
| 21-22 Des 2025        | `RECAPITULATION`       |

---

## 🧪 Cara Test Endpoint

### 1. Test dengan curl:
```bash
curl -X GET http://localhost:8080/api/v1/elections/current | jq '.'
```

### 2. Verifikasi response:
```bash
curl -s http://localhost:8080/api/v1/elections/current | jq '{
  status: .status,
  voting_start: .voting_start_at,
  voting_end: .voting_end_at,
  has_phases: (.phases != null),
  phase_count: (.phases | length)
}'
```

**Output yang diharapkan:**
```json
{
  "status": "REGISTRATION",
  "voting_start": "2025-12-15T08:00:00+07:00",
  "voting_end": "2025-12-17T23:59:59+07:00",
  "has_phases": true,
  "phase_count": 6
}
```

### 3. Test dari browser DevTools:
```javascript
fetch('http://localhost:8080/api/v1/elections/current')
  .then(r => r.json())
  .then(data => {
    console.log('Status:', data.status)
    console.log('Voting Start:', data.voting_start_at)
    console.log('Voting End:', data.voting_end_at)
    console.log('Phases:', data.phases)
  })
```

---

## 📝 Update Database (Jika Perlu)

Jika data di database masih salah, update manual dulu:

```sql
-- Update election data
UPDATE elections 
SET 
  status = 'REGISTRATION',
  voting_start_at = '2025-12-15 08:00:00+07',
  voting_end_at = '2025-12-17 23:59:59+07'
WHERE id = 2;

-- Cek apakah ada tabel phases atau election_phases
SELECT * FROM election_phases WHERE election_id = 2;

-- Jika tidak ada, insert phases
INSERT INTO election_phases (election_id, phase_name, start_at, end_at) VALUES
(2, 'Pendaftaran', '2025-11-01 00:00:00+07', '2025-11-30 23:59:59+07'),
(2, 'Verifikasi Berkas', '2025-12-01 00:00:00+07', '2025-12-07 23:59:59+07'),
(2, 'Kampanye', '2025-12-08 00:00:00+07', '2025-12-10 23:59:59+07'),
(2, 'Masa Tenang', '2025-12-11 00:00:00+07', '2025-12-14 23:59:59+07'),
(2, 'Voting', '2025-12-15 08:00:00+07', '2025-12-17 23:59:59+07'),
(2, 'Rekapitulasi', '2025-12-21 00:00:00+07', '2025-12-22 23:59:59+07');
```

---

## ✅ Checklist Backend

- [ ] Endpoint `/api/v1/elections/current` mengembalikan `phases` array
- [ ] `status` dihitung dari current date vs phases timeline
- [ ] `voting_start_at` adalah `2025-12-15T08:00:00+07:00`
- [ ] `voting_end_at` adalah `2025-12-17T23:59:59+07:00`
- [ ] Status saat ini (25 Nov) adalah `REGISTRATION` bukan `VOTING_OPEN`
- [ ] Frontend dapat membaca phases dan menampilkan countdown yang benar

---

## 🔧 Implementasi di Backend (Pseudocode)

```go
func buildGeneralInfoResponse(election Election) ElectionResponse {
    // Get phases from database or schedule config
    phases := getElectionPhases(election.ID)
    
    // Calculate current phase and status
    now := time.Now()
    currentStatus := election.Status // Default dari DB
    
    for _, phase := range phases {
        if now.After(phase.StartAt) && now.Before(phase.EndAt) {
            // Override status based on active phase
            currentStatus = mapPhaseToStatus(phase.Name)
            break
        }
    }
    
    return ElectionResponse{
        ID: election.ID,
        Status: currentStatus,  // Dynamic status
        VotingStartAt: election.VotingStartAt,
        VotingEndAt: election.VotingEndAt,
        Phases: phases,  // Include phases!
    }
}
```

---

## 📞 Contact

Setelah backend diperbaiki, test dengan:
```bash
curl http://localhost:8080/api/v1/elections/current | jq '.status, .phases'
```

Harusnya muncul:
```
"REGISTRATION"
[...]  # Array phases
```
