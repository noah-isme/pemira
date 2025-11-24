# Perbaikan Masalah Foto Kandidat Hilang Setelah Refresh

## Masalah yang Diperbaiki

1. **Foto kandidat hilang setelah refresh halaman**
   - Blob URL yang temporary disimpan ke database
   - Setelah refresh, blob URL menjadi tidak valid

2. **Error "Cannot read properties of undefined (reading 'id')"**
   - transformCandidateFromApi tidak robust terhadap data yang null/undefined
   - Tidak ada default values untuk field yang optional

3. **Error "Perubahan status kandidat tidak diizinkan"**
   - Status selalu dikirim ke API meskipun tidak berubah
   - Saat masa voting, perubahan status tidak diperbolehkan

## Solusi yang Diterapkan

### 1. Perbaikan di `adminCandidates.ts`

#### a. Transform Candidate - Lebih Robust
```typescript
export const transformCandidateFromApi = (payload: AdminCandidateResponse | null | undefined): CandidateAdmin => {
  // Validasi payload dengan pesan error yang jelas
  if (!payload) {
    throw new Error('Invalid candidate data from API: payload is null or undefined')
  }
  
  if (!payload.id) {
    throw new Error('Invalid candidate data from API: missing id')
  }
  
  return {
    id: payload.id.toString(),
    number: payload.number ?? 0,  // Default value
    name: payload.name ?? '',     // Default value
    // ... semua field dengan default values
  }
}
```

#### b. Build Payload - Filter Blob URL
```typescript
export const buildCandidatePayload = (candidate: CandidateAdmin, excludeStatus = false) => {
  // Jangan kirim blob URL ke API - mereka temporary
  const photoUrl = candidate.photoUrl?.startsWith('blob:') ? undefined : candidate.photoUrl

  const payload: any = {
    number: candidate.number,
    name: candidate.name,
    photo_url: photoUrl,  // Hanya kirim URL yang valid
    // ... field lainnya
  }

  // Excludes status by default untuk update
  if (!excludeStatus) {
    payload.status = mapStatusToApi(candidate.status)
  }

  return payload
}
```

#### c. Update Candidate - Exclude Status by Default
```typescript
export const updateAdminCandidate = async (
  token: string, 
  id: string, 
  candidate: Partial<CandidateAdmin>, 
  excludeStatus = true  // Default tidak kirim status
): Promise<CandidateAdmin> => {
  const payload = buildCandidatePayload(candidate as CandidateAdmin, excludeStatus)
  const response = await apiRequest<AdminCandidateResponse>(
    `/admin/elections/${ACTIVE_ELECTION_ID}/candidates/${id}`, 
    {
      method: 'PUT',
      token,
      body: payload,
    }
  )
  return transformCandidateFromApi(response)
}
```

## Flow Penyimpanan dan Pengambilan Foto

### Upload Flow:
1. User pilih file foto → `handleFileChange()`
2. Buat preview dengan blob URL sementara
3. Upload ke API → `uploadCandidateProfileMedia()`
4. API simpan file ke database (bytea) dan return `photo_media_id`
5. Update form data dengan `photo_media_id`
6. Save candidate → API simpan `photo_media_id` di table candidates

### Load Flow (setelah refresh):
1. Fetch candidate detail dari API
2. Dapat data dengan `photo_media_id` tapi tanpa `photo_url` (atau blob URL lama)
3. `useEffect` deteksi ada `photo_media_id` tapi tidak ada valid `photo_url`
4. Fetch foto dari API → `fetchCandidateProfileMedia(token, candidateId)`
5. API ambil bytea dari database, convert ke blob
6. Frontend buat blob URL baru dan simpan di state (temporary)
7. Foto ditampilkan

### Penyimpanan di Database:
- `candidate_media` table: menyimpan file sebagai bytea (binary data)
- `candidates` table: menyimpan `photo_media_id` (reference ke candidate_media)
- `photo_url` field: **TIDAK** digunakan untuk menyimpan blob URL

## Testing

### Test Case 1: Upload Foto Baru
1. ✅ Login sebagai admin
2. ✅ Edit kandidat
3. ✅ Upload foto profil
4. ✅ Save kandidat
5. ✅ Foto tersimpan dan ditampilkan
6. ✅ Refresh halaman
7. ✅ Foto masih ditampilkan (diambil dari API)

### Test Case 2: Edit Kandidat Saat Masa Voting
1. ✅ Login sebagai admin
2. ✅ Edit kandidat (saat masa voting aktif)
3. ✅ Ubah data kandidat (tanpa ubah status)
4. ✅ Save kandidat
5. ✅ Berhasil tanpa error "Perubahan status tidak diizinkan"

### Test Case 3: Edit dan Upload Foto
1. ✅ Login sebagai admin
2. ✅ Edit kandidat
3. ✅ Upload foto baru
4. ✅ Edit data kandidat lainnya
5. ✅ Save
6. ✅ Foto dan data tersimpan dengan benar

## File yang Dimodifikasi

1. `/src/services/adminCandidates.ts`
   - transformCandidateFromApi: Tambah validasi dan default values
   - buildCandidatePayload: Filter blob URL
   - updateAdminCandidate: Default excludeStatus = true

## Catatan Penting

1. **Blob URL adalah temporary**: Hanya valid dalam session browser yang sama
2. **Photo storage**: File foto disimpan sebagai bytea di PostgreSQL
3. **Photo reference**: `photo_media_id` adalah kunci untuk mengambil foto dari database
4. **Status change restriction**: Saat masa voting, status kandidat tidak boleh diubah oleh API backend

## Kesimpulan

Foto kandidat sekarang:
- ✅ Tidak hilang setelah refresh
- ✅ Disimpan dengan benar di database sebagai binary data
- ✅ Diambil kembali dari API saat diperlukan
- ✅ Tidak mengirim blob URL yang invalid ke API
- ✅ Tidak memicu error perubahan status saat update kandidat
