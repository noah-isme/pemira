# 🧪 Admin Panel Testing Guide

## 📋 Overview
Panduan lengkap untuk testing semua fitur admin panel PEMIRA setelah perbaikan.

---

## 🔐 1. LOGIN ADMIN

### Test Steps:
1. Buka `http://localhost:5173/admin/login`
2. Masukkan credentials admin
3. Klik "Login"

### Expected Results:
- ✅ Login berhasil
- ✅ Redirect ke dashboard admin
- ✅ Token tersimpan di localStorage
- ✅ Menu navigasi muncul

### Test Credentials:
Gunakan credentials dari `/home/noah/project/pemira-api/TEST_CREDENTIALS.md`

---

## 📊 2. DASHBOARD ADMIN

### Test Steps:
1. Setelah login, cek dashboard utama
2. Perhatikan statistik yang ditampilkan

### Expected Results:
- ✅ Total pemilih ditampilkan
- ✅ Total kandidat ditampilkan
- ✅ Participation rate ditampilkan
- ✅ Chart/grafik voting (jika ada)
- ✅ Quick actions tersedia

### API Endpoint:
```bash
GET /api/v1/admin/elections/1/statistics
GET /api/v1/admin/elections/1/dashboard
```

---

## 👥 3. KANDIDAT ADMIN

### A. List Kandidat

**Test Steps:**
1. Klik menu "Kandidat" atau buka `/admin/kandidat`
2. Lihat daftar kandidat

**Expected Results:**
- ✅ Semua kandidat ditampilkan
- ✅ Foto profil muncul (bukan blob URL)
- ✅ Status kandidat terlihat
- ✅ Filter dan search berfungsi

### B. Tambah Kandidat

**Test Steps:**
1. Klik "Tambah Kandidat"
2. Isi form wizard step by step:
   - Step 1: Data Utama (nomor, nama, fakultas)
   - Step 2: Profil & Media (bio, foto)
   - Step 3: Visi & Misi
   - Step 4: Program Kerja
   - Step 5: Review & Publish

**Expected Results:**
- ✅ Wizard navigation berfungsi
- ✅ Data tersimpan antar step
- ✅ Upload foto berhasil
- ✅ Preview kandidat muncul di sidebar
- ✅ Kandidat tersimpan ke database

**API Endpoint:**
```bash
POST /api/v1/admin/elections/1/candidates
```

### C. Edit Kandidat ⭐ (FIXED)

**Test Steps:**
1. Dari list kandidat, klik "Edit" pada salah satu kandidat
2. **PERHATIKAN:** Wizard sticky header tidak menutupi form ✅
3. Edit data kandidat
4. Upload foto profil baru
5. Klik "Simpan"

**Expected Results:**
- ✅ Wizard sticky tidak menutupin form (responsive fix)
- ✅ Data kandidat ter-load dengan benar
- ✅ Foto lama muncul (bukan blob URL)
- ✅ Upload foto baru berhasil
- ✅ Setelah save, foto tetap muncul (persist)
- ✅ Redirect ke list kandidat

**Known Issues (FIXED):**
- ❌ ~~GET 404 error~~ → ✅ API path fixed
- ❌ ~~Status change not allowed~~ → ✅ Status excluded in edit
- ❌ ~~Photo blob URL error~~ → ✅ Media ID properly saved
- ❌ ~~Wizard sticky covering form~~ → ✅ Responsive CSS fixed

**API Endpoints:**
```bash
GET /api/v1/admin/candidates/1?election_id=1  # Get detail
PUT /api/v1/admin/elections/1/candidates/1    # Update
POST /api/v1/admin/candidates/1/media/profile # Upload photo
```

### D. Upload Photo Test ⭐ (CRITICAL)

**Test Steps:**
1. Edit kandidat existing
2. Upload foto profil (JPG/PNG, max 3MB)
3. Tunggu upload selesai
4. Klik "Simpan"
5. Kembali ke list kandidat
6. **Refresh halaman (F5)**
7. Cek apakah foto masih muncul

**Expected Results:**
- ✅ Upload foto berhasil
- ✅ Preview foto muncul
- ✅ Setelah save, foto tersimpan
- ✅ Setelah refresh, foto tetap muncul (BUKAN blob URL)
- ✅ Console tidak ada error "blob:http://localhost..."

**Technical Details:**
- Photo disimpan ke PostgreSQL sebagai BYTEA
- API mengembalikan `photo_media_id`
- Frontend fetch photo dari `/admin/candidates/{id}/media/profile`
- Object URL di-manage dengan proper cleanup

---

## 📝 4. DPT (DAFTAR PEMILIH) ADMIN ⭐ (NEW FEATURES)

### A. List DPT

**Test Steps:**
1. Klik menu "DPT" atau buka `/admin/dpt`
2. Lihat daftar pemilih

**Expected Results:**
- ✅ Semua pemilih ditampilkan
- ✅ Filter fakultas, angkatan, status berfungsi
- ✅ Search by NIM/nama berfungsi
- ✅ Pagination berfungsi
- ✅ Checkbox untuk select berfungsi

### B. Edit Pemilih ⭐ (NEW)

**Test Steps:**
1. Dari list DPT, klik "Edit" pada salah satu pemilih
2. Edit data pemilih:
   - Nama
   - Email
   - Fakultas
   - Program Studi
   - Angkatan
   - Status Akademik
3. Klik "Simpan Perubahan"

**Expected Results:**
- ✅ Form ter-load dengan data pemilih
- ✅ NIM tidak bisa diubah (read-only)
- ✅ Edit berhasil
- ✅ Redirect ke list DPT
- ✅ Data terupdate di list

**API Endpoint:**
```bash
GET /api/v1/admin/elections/1/voters/{id}  # Get detail
PUT /api/v1/admin/elections/1/voters/{id}  # Update
```

### C. Hapus Pemilih ⭐ (NEW)

**Individual Delete:**
1. Dari list DPT, klik "Hapus" pada salah satu pemilih
2. Konfirmasi dialog
3. Pemilih terhapus

**Bulk Delete:**
1. Centang beberapa pemilih
2. Pilih "Hapus dari DPT" di dropdown Aksi Massal
3. Konfirmasi dialog
4. Semua pemilih terpilih terhapus

**Expected Results:**
- ✅ Konfirmasi dialog muncul
- ✅ Delete berhasil
- ✅ List refresh otomatis
- ✅ Success message muncul
- ✅ Jika ada error, error message ditampilkan

**API Endpoint:**
```bash
DELETE /api/v1/admin/elections/1/voters/{id}
```

**⚠️ IMPORTANT:**
- Backend harus cek apakah pemilih sudah voting
- Jika sudah voting, hapus harus dicegah atau soft delete

### D. Import DPT

**Test Steps:**
1. Klik "Import DPT"
2. Upload file CSV/Excel
3. Mapping kolom
4. Preview data
5. Import

**Expected Results:**
- ✅ File upload berhasil
- ✅ Preview data muncul
- ✅ Import berhasil
- ✅ Error handling untuk data invalid

---

## 🏢 5. TPS ADMIN

### A. List TPS

**Test Steps:**
1. Klik menu "TPS" atau buka `/admin/tps`
2. Lihat daftar TPS

**Expected Results:**
- ✅ Semua TPS ditampilkan
- ✅ Statistik per TPS muncul
- ✅ Status TPS terlihat

### B. Tambah/Edit TPS

**Test Steps:**
1. Tambah TPS baru atau edit existing
2. Isi data TPS (nama, lokasi, kapasitas)
3. Assign operator TPS
4. Simpan

**Expected Results:**
- ✅ Form TPS berfungsi
- ✅ QR code generated
- ✅ Operator ter-assign

### C. Detail TPS

**Test Steps:**
1. Klik detail TPS
2. Lihat statistik voting TPS

**Expected Results:**
- ✅ Statistik real-time
- ✅ Daftar pemilih yang check-in
- ✅ History voting

---

## 📊 6. MONITORING & LIVE COUNT

### Test Steps:
1. Buka `/admin/monitoring`
2. Perhatikan:
   - Live vote count per kandidat
   - Participation rate
   - Chart by faculty
   - Chart by TPS
   - Voting timeline

**Expected Results:**
- ✅ Data real-time
- ✅ Auto-refresh setiap X detik
- ✅ Chart/grafik responsive
- ✅ Filter berfungsi
- ✅ Export data berfungsi

**API Endpoints:**
```bash
GET /api/v1/admin/elections/1/monitoring/live
GET /api/v1/admin/elections/1/monitoring/votes
GET /api/v1/admin/elections/1/monitoring/participation
GET /api/v1/admin/elections/1/monitoring/by-faculty
GET /api/v1/admin/elections/1/monitoring/by-tps
```

---

## ⚙️ 7. PENGATURAN PEMILU

### Test Steps:
1. Buka `/admin/pengaturan`
2. Test:
   - Ubah tanggal mulai/selesai voting
   - Ubah mode voting (online/TPS)
   - Ubah status pemilu
   - Update branding

**Expected Results:**
- ✅ Settings ter-load
- ✅ Update berhasil
- ✅ Validasi tanggal
- ✅ Preview branding

---

## 📈 8. REKAPITULASI (Setelah Voting Ditutup)

### Test Steps:
1. Tutup voting dari pengaturan
2. Buka menu Rekapitulasi
3. Test:
   - Lihat hasil akhir
   - Export data
   - Generate report
   - Publish results

**Expected Results:**
- ✅ Hasil voting akurat
- ✅ Audit trail lengkap
- ✅ No duplicate votes
- ✅ Export CSV berfungsi
- ✅ PDF report generated

**API Endpoints:**
```bash
POST /api/v1/admin/elections/1/close-voting
GET /api/v1/admin/elections/1/results/summary
GET /api/v1/admin/elections/1/results/statistics
GET /api/v1/admin/elections/1/audit/report
POST /api/v1/admin/elections/1/results/publish
```

---

## 🔧 TROUBLESHOOTING

### Issue 1: Foto tidak muncul setelah refresh
**Solution:** 
- Clear browser cache
- Check API response has `photo_media_id`
- Verify backend storing BLOB properly

### Issue 2: Wizard sticky menutupin form
**Solution:** 
- ✅ FIXED: Responsive CSS added
- Only sticky on desktop (>1024px)

### Issue 3: Candidate detail 404
**Solution:**
- ✅ FIXED: API path corrected
- Use `/admin/candidates/{id}?election_id=1`

### Issue 4: Status change not allowed
**Solution:**
- ✅ FIXED: Status excluded in edit mode
- Don't send status when editing

### Issue 5: DPT delete gagal
**Possible causes:**
- Voter sudah voting
- Permission denied
- Network error

**Check:**
- Console error
- API response
- Backend logs

---

## 📝 TEST CHECKLIST

### Pre-Test
- [ ] Backend API running
- [ ] Database seeded with test data
- [ ] Frontend dev server running
- [ ] Browser console open (F12)
- [ ] Network tab open untuk monitor API calls

### Dashboard
- [ ] Statistics displayed
- [ ] Quick actions work
- [ ] Navigation menu complete

### Kandidat
- [ ] ✅ List loaded
- [ ] ✅ Add new candidate
- [ ] ✅ Edit existing (wizard tidak overlap)
- [ ] ✅ Upload photo (persist after save)
- [ ] ✅ Delete candidate
- [ ] ✅ Preview works
- [ ] ✅ Status change works

### DPT
- [ ] ✅ List loaded
- [ ] ✅ Filter/search works
- [ ] ✅ **Edit voter** (NEW)
- [ ] ✅ **Delete voter** (NEW)
- [ ] ✅ **Bulk delete** (NEW)
- [ ] Import DPT
- [ ] Export DPT

### TPS
- [ ] List loaded
- [ ] Add/Edit TPS
- [ ] View statistics
- [ ] QR code generated

### Monitoring
- [ ] Live count real-time
- [ ] Charts displayed
- [ ] Export works
- [ ] Filter works

### Settings
- [ ] Load settings
- [ ] Update settings
- [ ] Validation works
- [ ] Branding update

### Rekapitulasi
- [ ] Close voting
- [ ] View results
- [ ] Audit report
- [ ] Export data
- [ ] Publish results

---

## 🚀 QUICK START

**1. Start Backend:**
```bash
cd /home/noah/project/pemira-api
make run
```

**2. Start Frontend:**
```bash
cd /home/noah/project/pemira
npm run dev
```

**3. Run Test Script:**
```bash
cd /home/noah/project/pemira
./test-admin-complete.sh
```

**4. Open Browser:**
```
http://localhost:5173/admin/login
```

---

## 📚 DOCUMENTATION

**API Documentation:**
- `/home/noah/project/pemira-api/REKAPITULASI_TEST_GUIDE.md`
- `/home/noah/project/pemira-api/VOTING_ONLINE_TEST_GUIDE.md`
- `/home/noah/project/pemira-api/VOTING_TPS_TEST_GUIDE.md`

**Test Credentials:**
- `/home/noah/project/pemira-api/TEST_CREDENTIALS.md`

**Fix Summary:**
- `/home/noah/project/pemira/ADMIN_PANEL_FIXES_SUMMARY.md`

---

## ✅ COMPLETION CRITERIA

Test dianggap selesai dan sukses jika:
1. ✅ Semua checklist tercentang
2. ✅ Tidak ada console error
3. ✅ Semua API call berhasil (200-299)
4. ✅ Data persist setelah refresh
5. ✅ UI responsive di berbagai screen size
6. ✅ Photo upload berfungsi dan persist
7. ✅ DPT edit/delete berfungsi
8. ✅ Wizard tidak overlap dengan form

---

**Happy Testing! 🎉**
