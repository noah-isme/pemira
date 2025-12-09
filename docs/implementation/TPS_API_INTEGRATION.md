# Integrasi API TPS - Summary

**Tanggal:** 2025-11-27  
**Status:** ✅ Selesai Diintegrasikan

---

## 📋 Yang Sudah Diintegrasikan

### 1. **Service Layer Updates** (`src/services/adminTps.ts`)

#### Endpoint yang Diperbarui:
- ✅ **List TPS Operators** - Mendukung endpoint per-election
  - Global: `GET /admin/tps/{id}/operators`
  - Per-Election: `GET /admin/elections/{electionID}/tps/{id}/operators`
  - Response mapping: `ID`, `Username`, `Name`, `Email` (capital format dari API)

- ✅ **Create TPS Operator** - Mendukung endpoint per-election
  - Global: `POST /admin/tps/{id}/operators`
  - Per-Election: `POST /admin/elections/{electionID}/tps/{id}/operators`
  - Response mapping: `user_id`, `username`, `name`, `email`

- ✅ **Delete TPS Operator** - Mendukung endpoint per-election
  - Global: `DELETE /admin/tps/{id}/operators/{userID}`
  - Per-Election: `DELETE /admin/elections/{electionID}/tps/{id}/operators/{userID}`

- ✅ **TPS Allocation** - Mendukung endpoint per-election
  - Global: `GET /admin/tps/{id}/allocation`
  - Per-Election: `GET /admin/elections/{electionID}/tps/{id}/allocation`
  - Data: `total_tps_voters`, `allocated_to_this_tps`, `voted`, `not_voted`, `voters[]`

- ✅ **TPS Activity** - Mendukung endpoint per-election
  - Global: `GET /admin/tps/{id}/activity`
  - Per-Election: `GET /admin/elections/{electionID}/tps/{id}/activity`
  - Timeline: `hour`, `checked_in`, `voted`

### 2. **TPS Panel Service Updates** (`src/services/tpsPanel.ts`)

#### Endpoint yang Diperbarui:
- ✅ **Dashboard** - `GET /admin/elections/{electionID}/tps/{tpsID}/dashboard`
  - Returns: `election_id`, `tps`, `status`, `stats`, `last_activity_at`

- ✅ **Queue/Check-ins** - `GET /admin/elections/{electionID}/tps/{tpsID}/checkins`
  - Query params: `status` (ALL, PENDING, CHECKED_IN, APPROVED, REJECTED, VOTED)
  - Returns: `items[]` dengan `checkin_id`, `voter_id`, `name`, `nim`, `status`

- ✅ **Timeline** - `GET /admin/elections/{electionID}/tps/{tpsID}/stats/timeline`
  - Returns: `points[]` dengan `hour`, `checked_in`, `voted`

- ✅ **Check-in Scan (QR)** - `POST /admin/elections/{electionID}/tps/{tpsID}/checkin/scan`
  - Body: `{ qr_token, registration_qr_payload }`
  - Mendukung multiple field names untuk backward compatibility

- ✅ **Check-in Manual (NIM/NIDN/NIP)** - `POST /admin/elections/{electionID}/tps/{tpsID}/checkin/manual`
  - Body: `{ nim, registration_code }`
  - Mendukung Mahasiswa (NIM), Dosen (NIDN), Staff (NIP)

- ✅ **Approve Check-in** - `POST /admin/elections/{electionID}/tps/{tpsID}/checkins/{checkinID}/approve`

- ✅ **Reject Check-in** - `POST /admin/elections/{electionID}/tps/{tpsID}/checkins/{checkinID}/reject`
  - Body: `{ reason }`

#### Endpoint Baru Ditambahkan:
- ✅ **TPS Status** - `GET /admin/elections/{electionID}/tps/{tpsID}/status`
  - Returns: `status`, `voting_window` (start_at, end_at), `now`

- ✅ **Check-in Detail** - `GET /admin/elections/{electionID}/tps/{tpsID}/checkins/{checkinID}`
  - Returns: Detail check-in dan voter info

### 3. **Halaman yang Sudah Terintegrasi**

#### ✅ **AdminTPSDetail** (`src/pages/AdminTPSDetail.tsx`)
Fitur yang sudah menggunakan API:
- Menampilkan daftar operator TPS (dengan mapping field `ID`, `Username`, dll)
- Menambah operator TPS
- Menghapus operator TPS
- Menampilkan alokasi pemilih TPS
- Menampilkan aktivitas TPS dengan timeline

#### ✅ **AdminTPSPanel** (`src/pages/AdminTPSPanel.tsx`)
Fitur yang sudah menggunakan API:
- Sinkronisasi data dashboard dari API
- Queue/daftar check-in real-time
- Check-in via QR scan
- Check-in manual via NIM/NIDN/NIP
- Filter dan search di queue

#### ✅ **TPSPanelDashboard** (`src/pages/TPSPanelDashboard.tsx`)
Fitur yang sudah menggunakan API:
- Sinkronisasi data panel dengan election ID
- Menampilkan daftar kehadiran real-time
- Refresh data dari API

---

## 🔑 Key Features dari API Contract

### **Authentication**
- Semua endpoint memerlukan JWT Bearer token
- Roles: `ADMIN`, `SUPER_ADMIN`, `OPERATOR_PANEL`

### **TPS Management (Admin)**
- List semua TPS dengan pagination dan search
- Detail TPS dengan informasi lengkap
- Create, update, delete TPS
- Manage operator per TPS
- View alokasi dan aktivitas TPS

### **TPS Panel (Operator)**
- Dashboard dengan statistik real-time
- Check-in pemilih via QR atau manual
- Support untuk multiple voter types (Mahasiswa/Dosen/Staff)
- Timeline aktivitas per jam
- Activity logs

### **Voter Types Support**
| Type | Identifier | Field |
|------|-----------|-------|
| Mahasiswa | NIM | `voters.nim` |
| Dosen | NIDN | `lecturers.nidn` |
| Staff | NIP | `staff_members.nip` |

---

## 📊 Data Models yang Digunakan

### **TPS Model** (dari API)
```typescript
{
  id: number
  code: string              // e.g., "TPS-07"
  name: string
  location: string
  capacity: number
  status: 'ACTIVE' | 'INACTIVE'
  voting_date: string       // ISO date
  open_time: string         // "08:00:00"
  close_time: string        // "16:00:00"
  pic_name: string
  pic_phone: string
  notes?: string
  has_active_qr: boolean
}
```

### **TPS Operator Model** (dari API)
```typescript
{
  ID: number              // Capital in response
  Username: string        // Capital in response
  Name: string           // Capital in response
  Email: string          // Capital in response
  TPSID: number          // Capital in response
}
```

### **Check-in Model** (dari API)
```typescript
{
  checkin_id: number
  voter_id: number
  name: string
  nim: string           // Can be NIM/NIDN/NIP
  faculty: string
  program: string
  status: 'PENDING' | 'CHECKED_IN' | 'APPROVED' | 'REJECTED' | 'VOTED'
  checkin_time: string  // ISO 8601
  voted_time?: string   // ISO 8601
}
```

---

## 🔄 Backward Compatibility

Service layer mendukung multiple field names untuk kompatibilitas:
- `qr_token` dan `registration_qr_payload` untuk QR scan
- `nim` dan `registration_code` untuk manual check-in
- Response fields dengan lowercase dan Capital format (API inconsistency)

---

## 🚀 Cara Menggunakan

### **Admin - Kelola TPS**
1. Buka `/admin/tps` untuk list TPS
2. Klik TPS untuk detail di `/admin/tps/{id}`
3. Kelola operator, lihat alokasi, dan aktivitas di halaman detail

### **Admin - Buka Panel TPS**
1. Dari detail TPS, klik "Buka Panel TPS"
2. URL: `/admin/tps/panel?tpsId={id}`
3. Scan QR pemilih atau input manual NIM/NIDN/NIP

### **Operator TPS - Dashboard**
1. Login sebagai operator TPS
2. Akses dashboard TPS yang assigned
3. Check-in pemilih dan monitor aktivitas real-time

---

## ⚠️ Catatan Penting

1. **Election ID**: Semua endpoint kini support election scoping via `election_id` parameter
2. **Field Naming**: API menggunakan Capital letters untuk beberapa field (ID, Username, Name, Email)
3. **Status Values**: Check-in status: PENDING → CHECKED_IN → APPROVED → VOTED
4. **Timeline**: Grouped by hour, empty array jika tidak ada aktivitas
5. **Pagination**: Default limit 20-50 items, max 100

---

## 📝 Testing

**Test Credentials** (dari API contract):
```
Admin:
  username: admin
  password: password123

TPS Operator:
  username: tps07.op1
  password: password123

Test Election: election_id: 15, tps_id: 4
```

**Test Voters**:
- Mahasiswa: 202012345, 202012346, 202012347
- Dosen: 1234567890 (NIDN)
- Staff: 198501012010 (NIP)

---

## ✅ Status Integrasi

| Komponen | Status | Catatan |
|----------|--------|---------|
| adminTps.ts | ✅ Done | Semua endpoint terintegrasi |
| tpsPanel.ts | ✅ Done | Semua endpoint + 2 endpoint baru |
| AdminTPSDetail | ✅ Done | Operators, allocation, activity |
| AdminTPSPanel | ✅ Done | Check-in scan & manual |
| TPSPanelDashboard | ✅ Done | Real-time monitoring |
| useTPSAdminStore | ✅ Ready | Hook sudah support API baru |
| useTPSPanelStore | ✅ Ready | Hook sudah support API baru |

---

## 🎯 Next Steps (Opsional)

1. Tambahkan export CSV/PDF untuk daftar hadir TPS
2. Implementasi real-time WebSocket untuk live updates
3. Tambahkan charts untuk timeline visualization
4. Implementasi TPS status endpoint di UI
5. Testing lengkap dengan backend production

---

**Dokumentasi Lengkap**: Lihat API Contract lengkap di message user sebelumnya.
