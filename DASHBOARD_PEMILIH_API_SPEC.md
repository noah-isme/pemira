# 📋 API Requirements - Dashboard Pemilih Hi-Fi

## Overview
Dashboard pemilih membutuhkan data real-time dari backend untuk menampilkan status PEMIRA, informasi voter, dan timeline tahapan.

---

## 🎯 REQUIRED ENDPOINTS

### 1. Get Current Election Status
**Endpoint:** `GET /api/v1/elections/current`

**Purpose:** Mendapatkan status PEMIRA saat ini dan konfigurasi voting

**Response:**
```json
{
  "id": 1,
  "year": 2025,
  "name": "PEMIRA UNIWA 2025",
  "slug": "pemira-uniwa-2025",
  "status": "CAMPAIGN",
  "voting_start_at": "2025-01-15T08:00:00Z",
  "voting_end_at": "2025-01-15T16:00:00Z",
  "online_enabled": true,
  "tps_enabled": true,
  "current_stage": "campaign"
}
```

**Status Values:**
- `DRAFT` - Belum dimulai
- `REGISTRATION` - Pendaftaran kandidat
- `CAMPAIGN` - Masa kampanye
- `SILENCE` - Masa tenang
- `VOTING_OPEN` - Voting berlangsung
- `VOTING_CLOSED` - Voting selesai
- `CLOSED` - Pemilu selesai

**Usage:**
- Menentukan stage timeline mana yang aktif
- Menentukan content panel utama (campaign/silence/voting)
- Enable/disable tombol voting

---

### 2. Get Voter Profile & Status
**Endpoint:** `GET /api/v1/voters/me`

**Purpose:** Mendapatkan informasi voter yang login dan status voting

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 123,
  "voter_id": "21034567",
  "name": "Roni Saputra",
  "nim": "21034567",
  "faculty_name": "Fakultas Teknik Informatika",
  "study_program_name": "Teknik Informatika",
  "voter_type": "STUDENT",
  "voting_mode": "ONLINE",
  "voting_status": "NOT_VOTED",
  "checked_in": false,
  "voted_at": null,
  "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "qr_id": "OLF-98S7A1"
}
```

**voting_mode Values:**
- `ONLINE` - Voter memilih via web
- `OFFLINE` - Voter memilih via TPS

**voting_status Values:**
- `NOT_VOTED` - Belum memilih
- `CHECKED_IN` - Sudah check-in di TPS (OFFLINE only)
- `VOTED` - Sudah memilih

**Usage:**
- Tampilkan nama & NIM di header
- Tampilkan mode badge (ONLINE/OFFLINE)
- Conditional panel (online flow vs offline flow)
- QR code untuk TPS
- Disable voting button jika sudah voted

---

### 3. Get Voting Timeline
**Endpoint:** `GET /api/v1/elections/current/timeline`

**Purpose:** Mendapatkan detail timeline tahapan PEMIRA

**Response:**
```json
{
  "stages": [
    {
      "id": "registration",
      "name": "Pendaftaran",
      "start_at": "2024-12-01T00:00:00Z",
      "end_at": "2024-12-10T23:59:59Z",
      "status": "completed"
    },
    {
      "id": "verification",
      "name": "Verifikasi Berkas",
      "start_at": "2024-12-11T00:00:00Z",
      "end_at": "2024-12-15T23:59:59Z",
      "status": "completed"
    },
    {
      "id": "campaign",
      "name": "Masa Kampanye",
      "start_at": "2024-12-16T00:00:00Z",
      "end_at": "2025-01-10T23:59:59Z",
      "status": "active"
    },
    {
      "id": "silence",
      "name": "Masa Tenang",
      "start_at": "2025-01-11T00:00:00Z",
      "end_at": "2025-01-14T23:59:59Z",
      "status": "upcoming"
    },
    {
      "id": "voting",
      "name": "Pemungutan Suara",
      "start_at": "2025-01-15T08:00:00Z",
      "end_at": "2025-01-15T16:00:00Z",
      "status": "upcoming"
    },
    {
      "id": "rekapitulasi",
      "name": "Rekapitulasi",
      "start_at": "2025-01-15T16:00:00Z",
      "end_at": "2025-01-16T23:59:59Z",
      "status": "upcoming"
    }
  ],
  "current_stage": "campaign"
}
```

**stage.status Values:**
- `completed` - Tahap selesai (hijau, checkmark)
- `active` - Tahap berlangsung (biru, pulse glow)
- `upcoming` - Tahap belum dimulai (abu-abu)

**Usage:**
- Render timeline dengan 6 stages
- Visual indicator (completed/active/upcoming)
- Countdown timer untuk next stage

---

### 4. Get Notifications
**Endpoint:** `GET /api/v1/voters/me/notifications`

**Purpose:** Mendapatkan notifikasi untuk voter

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
?limit=10
```

**Response:**
```json
{
  "notifications": [
    {
      "id": 1,
      "message": "Verifikasi berkas Anda telah disetujui.",
      "created_at": "2024-12-11T10:12:00Z",
      "is_read": true
    },
    {
      "id": 2,
      "message": "Masa kampanye resmi dimulai.",
      "created_at": "2024-12-16T00:00:00Z",
      "is_read": true
    },
    {
      "id": 3,
      "message": "Tahap voting akan dibuka besok pukul 08.00 WIB.",
      "created_at": "2025-01-14T12:00:00Z",
      "is_read": false
    }
  ]
}
```

**Usage:**
- Tampilkan di notification section
- Format waktu relatif (10:12, Hari ini, Besok)
- Badge untuk unread count

---

### 5. Get Voting Countdown
**Endpoint:** `GET /api/v1/elections/current/countdown`

**Purpose:** Mendapatkan countdown untuk tahap berikutnya

**Response:**
```json
{
  "next_stage": "voting",
  "next_stage_name": "Pemungutan Suara",
  "starts_at": "2025-01-15T08:00:00Z",
  "countdown": {
    "days": 1,
    "hours": 3,
    "minutes": 24,
    "seconds": 18
  }
}
```

**Usage:**
- Countdown timer di silence period
- "Voting dibuka dalam: X hari Y jam Z menit"
- Real-time update setiap detik

---

## 📊 DATA FLOW DIAGRAM

```
Dashboard Load
    ↓
1. GET /elections/current
    → currentStage = "campaign"
    → voting_start_at, voting_end_at
    ↓
2. GET /voters/me (with token)
    → voter info (nama, nim, mode, status)
    → qr_code jika mode = OFFLINE
    ↓
3. GET /elections/current/timeline
    → 6 stages dengan status
    → active stage untuk visual
    ↓
4. GET /voters/me/notifications
    → notifikasi terbaru
    ↓
5. IF currentStage = "silence":
       GET /elections/current/countdown
       → countdown timer
```

---

## 🔄 REAL-TIME UPDATES

### Polling Strategy:
```typescript
// Poll every 30 seconds for status changes
useEffect(() => {
  const interval = setInterval(() => {
    fetchCurrentElection()
    fetchVoterProfile()
  }, 30000)
  return () => clearInterval(interval)
}, [])
```

### WebSocket (Optional - untuk future):
```
WS /api/v1/elections/current/subscribe
← { "type": "stage_changed", "stage": "voting" }
← { "type": "voter_status_changed", "status": "VOTED" }
```

---

## 🔐 AUTHENTICATION

Semua endpoint kecuali `/elections/current` membutuhkan auth token:

```typescript
const token = session?.access_token

fetch('/api/v1/voters/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

---

## 🎨 FRONTEND INTEGRATION

### Create Service File:
**File:** `src/services/voterDashboard.ts`

```typescript
import { apiRequest } from '../utils/apiClient'

export interface VoterProfile {
  id: number
  voter_id: string
  name: string
  nim: string
  faculty_name: string
  study_program_name: string
  voter_type: 'STUDENT' | 'LECTURER' | 'STAFF'
  voting_mode: 'ONLINE' | 'OFFLINE'
  voting_status: 'NOT_VOTED' | 'CHECKED_IN' | 'VOTED'
  checked_in: boolean
  voted_at: string | null
  qr_code: string
  qr_id: string
}

export interface TimelineStage {
  id: string
  name: string
  start_at: string
  end_at: string
  status: 'completed' | 'active' | 'upcoming'
}

export interface Timeline {
  stages: TimelineStage[]
  current_stage: string
}

export interface Notification {
  id: number
  message: string
  created_at: string
  is_read: boolean
}

export interface CountdownData {
  next_stage: string
  next_stage_name: string
  starts_at: string
  countdown: {
    days: number
    hours: number
    minutes: number
    seconds: number
  }
}

export const fetchVoterProfile = async (token: string): Promise<VoterProfile> => {
  return apiRequest<VoterProfile>('/voters/me', { token })
}

export const fetchTimeline = async (): Promise<Timeline> => {
  return apiRequest<Timeline>('/elections/current/timeline')
}

export const fetchNotifications = async (token: string, limit = 10): Promise<{ notifications: Notification[] }> => {
  return apiRequest(`/voters/me/notifications?limit=${limit}`, { token })
}

export const fetchCountdown = async (): Promise<CountdownData> => {
  return apiRequest<CountdownData>('/elections/current/countdown')
}
```

---

## 🧪 TESTING ENDPOINTS

### Test with curl:

```bash
# 1. Get current election
curl http://localhost:3000/api/v1/elections/current

# 2. Get voter profile (need token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/v1/voters/me

# 3. Get timeline
curl http://localhost:3000/api/v1/elections/current/timeline

# 4. Get notifications
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/v1/voters/me/notifications?limit=10

# 5. Get countdown
curl http://localhost:3000/api/v1/elections/current/countdown
```

---

## ❌ FALLBACK BEHAVIOR

Jika endpoint belum ready, gunakan mock data:

```typescript
const [voterData, setVoterData] = useState<VoterProfile | null>(null)

useEffect(() => {
  if (session?.access_token) {
    fetchVoterProfile(session.access_token)
      .then(setVoterData)
      .catch(() => {
        // Fallback to mock data
        setVoterData({
          name: mahasiswa?.nama || 'Roni Saputra',
          nim: mahasiswa?.nim || '21034567',
          voting_mode: 'ONLINE',
          voting_status: 'NOT_VOTED',
          // ... mock data
        })
      })
  }
}, [session, mahasiswa])
```

---

## 🚀 IMPLEMENTATION PRIORITY

1. **Priority 1 (Critical):**
   - ✅ `/elections/current` - Already exists
   - 🔲 `/voters/me` - Voter profile & status

2. **Priority 2 (Important):**
   - 🔲 `/elections/current/timeline` - Timeline stages
   - 🔲 `/voters/me/notifications` - Notifications

3. **Priority 3 (Nice to have):**
   - 🔲 `/elections/current/countdown` - Countdown timer

---

## 📝 BACKEND DEVELOPER NOTES

### Suggested Database Schema:

```sql
-- Add voting mode & status to voters table
ALTER TABLE voters ADD COLUMN voting_mode VARCHAR(20) DEFAULT 'ONLINE';
ALTER TABLE voters ADD COLUMN voting_status VARCHAR(20) DEFAULT 'NOT_VOTED';
ALTER TABLE voters ADD COLUMN qr_code TEXT;
ALTER TABLE voters ADD COLUMN qr_id VARCHAR(50);

-- Timeline stages table
CREATE TABLE timeline_stages (
  id SERIAL PRIMARY KEY,
  election_id INTEGER REFERENCES elections(id),
  stage_name VARCHAR(50),
  stage_order INTEGER,
  start_at TIMESTAMP,
  end_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Voter notifications
CREATE TABLE voter_notifications (
  id SERIAL PRIMARY KEY,
  voter_id INTEGER REFERENCES voters(id),
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

**Last Updated:** 2024-11-25  
**Status:** Specification Ready  
**Frontend:** Ready to integrate once endpoints available
