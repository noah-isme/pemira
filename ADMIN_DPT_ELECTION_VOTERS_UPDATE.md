# Update Admin DPT untuk Election Voters API

Dokumentasi update file existing admin DPT untuk mendukung API baru dengan election_voters table.

---

## 📝 File Yang Diupdate

### 1. **src/types/dptAdmin.ts**
**Perubahan:**
- ✅ Tambah type `ElectionVoterStatus` dengan 5 status: PENDING, VERIFIED, REJECTED, VOTED, BLOCKED
- ✅ Update `DPTEntry` type dengan field baru:
  - `voterId?: number` - voter_id untuk referensi
  - `electionVoterStatus?: ElectionVoterStatus` - status verifikasi
  - `checkedInAt?: string | null` - waktu check-in
  - `votedAt?: string | null` - waktu voting
  - `updatedAt?: string` - last update

**Impact:** Backward compatible, semua existing code tetap berfungsi.

---

### 2. **src/hooks/useDPTAdminStore.tsx**
**Perubahan:**
- ✅ Tambah filter `electionVoterStatus` di state
- ✅ Update type definition context untuk include filter baru
- ✅ Tambah query param `status` saat fetch API
- ✅ Update useEffect dependencies untuk reset page saat filter berubah

**Cara Pakai:**
```typescript
const { filters, setFilters } = useDPTAdminStore()

// Set filter status
setFilters(prev => ({ 
  ...prev, 
  electionVoterStatus: 'VERIFIED' 
}))
```

---

### 3. **src/pages/AdminDPTList.tsx**
**Perubahan:**
- ✅ Import `updateElectionVoter` dari service baru
- ✅ Import `useActiveElection` hook
- ✅ Tambah `updating` state untuk loading indicator
- ✅ Tambah fungsi `handleUpdateStatus()` - update status individual
- ✅ Tambah fungsi `handleBulkVerify()` - verifikasi massal
- ✅ Tambah filter dropdown "Status Verifikasi"
- ✅ Tambah aksi massal "Verifikasi Pemilih"
- ✅ Tambah kolom "Status Verifikasi" di tabel
- ✅ Tambah tombol "Verifikasi" untuk status PENDING
- ✅ Tambah tombol "Tolak" untuk status VERIFIED
- ✅ Update disabled state untuk semua button saat updating

**UI Changes:**

#### Filter Baru
```tsx
<select value={filters.electionVoterStatus} onChange={...}>
  <option value="all">Status Verifikasi: Semua</option>
  <option value="PENDING">Menunggu Verifikasi</option>
  <option value="VERIFIED">Terverifikasi</option>
  <option value="REJECTED">Ditolak</option>
  <option value="VOTED">Sudah Memilih</option>
  <option value="BLOCKED">Diblokir</option>
</select>
```

#### Aksi Massal Baru
```tsx
<select>
  <option value="">Aksi Massal ({selected.size} dipilih)</option>
  <option value="verify">✓ Verifikasi Pemilih</option>
  <option value="delete">Hapus dari DPT</option>
</select>
```

#### Tabel: Kolom Status Baru
| Before | After |
|--------|-------|
| 12 columns | **13 columns** |
| - | **Status Verifikasi** (new) |
| Status Suara | Status Suara |

#### Tombol Aksi Dinamis
- Status **PENDING** → Tampilkan tombol "✓ Verifikasi" (hijau)
- Status **VERIFIED** → Tampilkan tombol "✗ Tolak" (merah)
- Status lain → Tidak tampilkan tombol status

---

### 4. **src/pages/AdminDPTEdit.tsx**
**Perubahan:**
- ✅ Import `useActiveElection` hook
- ✅ Import `ElectionVoterStatus` type
- ✅ Tambah field `electionVoterStatus` di formData state
- ✅ Pass `activeElectionId` ke `fetchAdminDptVoterById()` dan `updateAdminDptVoter()`
- ✅ Load `electionVoterStatus` dari API response
- ✅ Kirim `status` field ke API saat update
- ✅ Convert `voting_method` ke uppercase sesuai API contract
- ✅ Tambah dropdown "Status Verifikasi" di form

**Form Field Baru:**
```tsx
<div className="form-field">
  <label>Status Verifikasi *</label>
  <select 
    value={formData.electionVoterStatus} 
    onChange={(e) => setFormData((prev) => ({ 
      ...prev, 
      electionVoterStatus: e.target.value as ElectionVoterStatus 
    }))}
  >
    <option value="PENDING">Menunggu Verifikasi</option>
    <option value="VERIFIED">Terverifikasi</option>
    <option value="REJECTED">Ditolak</option>
    <option value="VOTED">Sudah Memilih</option>
    <option value="BLOCKED">Diblokir</option>
  </select>
  <small>💡 Ubah status verifikasi pemilih untuk pemilu ini</small>
</div>
```

---

### 5. **src/styles/AdminDPT.css**
**Perubahan:**
- ✅ Tambah CSS untuk 5 status chips baru:
  - `.status-chip.status-pending` - Kuning (warning)
  - `.status-chip.status-verified` - Hijau (success)
  - `.status-chip.status-rejected` - Merah (danger)
  - `.status-chip.status-voted` - Biru (info)
  - `.status-chip.status-blocked` - Abu-abu (neutral)

**CSS:**
```css
.status-chip.status-pending {
  background: #fef3c7;
  color: #f59e0b;
  border: 1px solid #fbbf24;
}

.status-chip.status-verified {
  background: #dcfce7;
  color: #16a34a;
  border: 1px solid #22c55e;
}

.status-chip.status-rejected {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #ef4444;
}

.status-chip.status-voted {
  background: #dbeafe;
  color: #2563eb;
  border: 1px solid #3b82f6;
}

.status-chip.status-blocked {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #9ca3af;
}
```

---

## 🎯 Fitur Baru

### 1. Filter Status Verifikasi
Admin dapat filter pemilih berdasarkan status:
- Semua
- Menunggu Verifikasi (PENDING)
- Terverifikasi (VERIFIED)
- Ditolak (REJECTED)
- Sudah Memilih (VOTED)
- Diblokir (BLOCKED)

### 2. Verifikasi Individual
Admin dapat klik tombol "Verifikasi" langsung dari tabel untuk pemilih dengan status PENDING.

### 3. Tolak Individual
Admin dapat klik tombol "Tolak" langsung dari tabel untuk pemilih dengan status VERIFIED.

### 4. Verifikasi Massal
Admin dapat:
1. Pilih multiple pemilih (checkbox)
2. Pilih aksi "Verifikasi Pemilih" dari dropdown
3. Konfirmasi
4. Semua pemilih terpilih akan diverifikasi sekaligus

### 5. Edit Status Manual
Admin dapat edit status pemilih di halaman edit:
- Buka form edit pemilih
- Ubah dropdown "Status Verifikasi"
- Simpan perubahan

---

## 🔄 Alur Kerja Baru

### Skenario 1: Verifikasi Pemilih Baru
```
1. Admin buka /admin/dpt
2. Filter "Status Verifikasi" → pilih "Menunggu Verifikasi"
3. List hanya tampilkan pemilih PENDING
4. Admin klik tombol "✓ Verifikasi" di masing-masing row
   ATAU
   Admin centang semua → pilih "Verifikasi Pemilih" → konfirmasi
5. Status berubah menjadi VERIFIED
6. Pemilih sudah bisa voting
```

### Skenario 2: Tolak Pemilih Tidak Valid
```
1. Admin buka /admin/dpt
2. Filter "Status Verifikasi" → pilih "Terverifikasi"
3. Temukan pemilih yang tidak valid
4. Klik tombol "✗ Tolak"
5. Konfirmasi
6. Status berubah menjadi REJECTED
7. Pemilih tidak bisa voting
```

### Skenario 3: Edit Status Manual
```
1. Admin buka /admin/dpt
2. Klik "Edit" pada pemilih tertentu
3. Di form edit, ubah dropdown "Status Verifikasi"
4. Klik "Simpan Perubahan"
5. Status diupdate di database
```

---

## 📊 Perbedaan Visual

### Tabel DPT - Before
```
┌─────┬─────┬────────────┬───────┬─────────┐
│ No  │ NIM │ Nama       │ ...   │ Status  │
├─────┼─────┼────────────┼───────┼─────────┤
│ 1   │ 001 │ Budi       │ ...   │ Belum   │
│ 2   │ 002 │ Ani        │ ...   │ Sudah   │
└─────┴─────┴────────────┴───────┴─────────┘
```

### Tabel DPT - After
```
┌─────┬─────┬────────────┬───────────────────┬───────────┬─────────┐
│ No  │ NIM │ Nama       │ Status Verifikasi │ Status    │ Aksi    │
├─────┼─────┼────────────┼───────────────────┼───────────┼─────────┤
│ 1   │ 001 │ Budi       │ [PENDING]         │ Belum     │ ✓ ✎ 🗑  │
│ 2   │ 002 │ Ani        │ [VERIFIED]        │ Sudah     │ ✗ ✎ 🗑  │
└─────┴─────┴────────────┴───────────────────┴───────────┴─────────┘

Legend:
✓ = Verifikasi
✗ = Tolak
✎ = Edit
🗑 = Hapus
```

---

## ✅ Testing Checklist

### Filter
- [ ] Filter "Status Verifikasi" → pilih PENDING → tampilkan hanya PENDING
- [ ] Filter "Status Verifikasi" → pilih VERIFIED → tampilkan hanya VERIFIED
- [ ] Filter "Status Verifikasi" → pilih REJECTED → tampilkan hanya REJECTED
- [ ] Filter "Status Verifikasi" → pilih VOTED → tampilkan hanya VOTED
- [ ] Filter "Status Verifikasi" → pilih BLOCKED → tampilkan hanya BLOCKED
- [ ] Filter kombinasi (status + fakultas + angkatan) berfungsi

### Verifikasi Individual
- [ ] Tombol "Verifikasi" muncul untuk status PENDING
- [ ] Klik "Verifikasi" → popup konfirmasi muncul
- [ ] Konfirmasi → status berubah jadi VERIFIED
- [ ] Toast success muncul
- [ ] Tabel refresh otomatis

### Tolak Individual
- [ ] Tombol "Tolak" muncul untuk status VERIFIED
- [ ] Klik "Tolak" → popup konfirmasi muncul
- [ ] Konfirmasi → status berubah jadi REJECTED
- [ ] Toast success muncul
- [ ] Tabel refresh otomatis

### Verifikasi Massal
- [ ] Centang 5 pemilih PENDING
- [ ] Pilih "Verifikasi Pemilih" dari dropdown
- [ ] Popup konfirmasi menampilkan jumlah yang benar
- [ ] Konfirmasi → semua 5 pemilih jadi VERIFIED
- [ ] Toast menampilkan "5 berhasil diverifikasi"
- [ ] Checkbox ter-uncheck otomatis

### Edit Form
- [ ] Buka edit pemilih
- [ ] Dropdown "Status Verifikasi" tampil dengan benar
- [ ] Value awal sesuai dengan status pemilih
- [ ] Ubah status → simpan → berhasil
- [ ] Redirect ke list → status di tabel sudah berubah

### Error Handling
- [ ] Update status saat backend error → toast error muncul
- [ ] Update status saat network error → toast error muncul
- [ ] Bulk verify dengan beberapa yang gagal → toast menampilkan count yang tepat

### UI/UX
- [ ] Status chip warna sesuai (PENDING=kuning, VERIFIED=hijau, dll)
- [ ] Button disabled saat loading
- [ ] Loading indicator muncul saat proses
- [ ] Responsive di mobile

---

## 🚀 Deployment Notes

### 1. Database Migration Required
Backend harus sudah deploy tabel `election_voters` sebelum deploy frontend update ini.

### 2. API Endpoints Required
Pastikan backend sudah implement:
- `GET /admin/elections/{id}/voters?status=PENDING` (with filter)
- `PATCH /admin/elections/{id}/voters/{election_voter_id}` (update status)

### 3. Backward Compatibility
✅ Update ini backward compatible. Jika backend belum ready:
- Filter status akan diabaikan
- Tombol verifikasi tidak muncul (karena `electionVoterStatus` undefined)
- Existing functionality tetap berfungsi normal

### 4. Feature Flag (Optional)
Bisa tambahkan feature flag untuk enable/disable fitur baru:
```typescript
const ENABLE_ELECTION_VOTER_STATUS = import.meta.env.VITE_ENABLE_ELECTION_VOTER_STATUS === 'true'

// Di component
{ENABLE_ELECTION_VOTER_STATUS && (
  <select value={filters.electionVoterStatus} ...>
)}
```

---

## 📈 Metrics to Track

1. **Verifikasi Rate**
   - Berapa % pemilih yang diverifikasi per hari
   - Avg time dari register ke verified

2. **Rejection Rate**
   - Berapa % pemilih yang ditolak
   - Alasan utama rejection

3. **Admin Activity**
   - Jumlah verifikasi per admin
   - Peak hours untuk verifikasi

---

## 🔗 Related Files

### Services (New - Keep Them)
- `src/services/adminElectionVoters.ts` - Service helper baru
- `src/services/voterRegistration.ts` - Voter self-registration

### Types (New - Keep Them)
- `src/types/electionVoters.ts` - Type definitions lengkap

### Documentation (New - Keep Them)
- `ELECTION_VOTERS_API_INTEGRATION.md` - Full API guide
- `QUICK_REFERENCE_ELECTION_VOTERS.md` - Quick snippets
- `ELECTION_VOTERS_IMPLEMENTATION_SUMMARY.md` - Tech summary

---

**Last Updated**: 2025-11-26  
**Version**: 1.0  
**Status**: ✅ Ready for Testing  
**Breaking Changes**: None (Backward Compatible)
