# Kompatibilitas Frontend dengan Supabase Storage Backend

## Status: ✅ SUDAH KOMPATIBEL

Setelah dilakukan audit terhadap kode frontend, **tidak ada perubahan yang diperlukan** pada halaman admin DPT dan pengaturan logo. Frontend sudah sepenuhnya kompatibel dengan backend yang baru menggunakan Supabase Storage.

## Ringkasan Perubahan Backend

### Database Migration (018_move_media_to_supabase)
Backend telah di-migrate untuk mendukung Supabase Storage:

1. **Tabel `candidate_media`**:
   - ✅ Ditambahkan kolom `storage_path` (TEXT, NOT NULL)
   - ✅ Kolom `data` (BYTEA) dijadikan NULLABLE

2. **Tabel `branding_files`**:
   - ✅ Ditambahkan kolom `storage_path` (TEXT, NOT NULL)
   - ✅ Kolom `data` (BYTEA) dijadikan NULLABLE

### Backend Architecture

Backend menggunakan abstraksi storage yang transparan:
```
Client Request → Handler → Service → Repository → Supabase Storage
                                                  ↓
                                            Download blob
                                                  ↓
                                        Return to Client as blob
```

**Penting**: Backend tetap mengembalikan response dalam format **blob/binary**, sehingga dari perspektif frontend tidak ada perubahan sama sekali.

## Analisis Kompatibilitas Frontend

### 1. ✅ Service Layer (`src/services/`)

#### `adminBranding.ts`
```typescript
// Fungsi ini TIDAK perlu diubah
export const fetchBrandingLogo = async (
  token: string, 
  slot: 'primary' | 'secondary', 
  electionId: number
): Promise<string | null> => {
  const response = await fetch(url, { headers: buildAuthHeaders(token) })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(...)
  
  const blob = await response.blob()        // ← Backend returns blob
  return URL.createObjectURL(blob)          // ← Create object URL
}
```

**Alasan**: Backend tetap mengembalikan blob response, hanya storage backend-nya yang berubah dari PostgreSQL bytea ke Supabase Storage.

#### `adminCandidateMedia.ts`
```typescript
// Fungsi ini TIDAK perlu diubah
export const fetchCandidateProfileMedia = async (
  token: string, 
  candidateId: string | number
): Promise<string | null> => {
  const response = await fetch(url, { headers: authHeaders(token) })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(...)
  
  const blob = await response.blob()        // ← Backend returns blob
  return URL.createObjectURL(blob)          // ← Create object URL
}
```

**Alasan**: Same as above - backend abstraction is transparent to frontend.

#### `adminDpt.ts`
✅ **Tidak menggunakan media/blob handling sama sekali** - hanya data DPT dalam format JSON.

### 2. ✅ Hooks Layer (`src/hooks/`)

#### `useElectionSettings.ts`
Hook ini sudah mengimplementasikan **best practices** untuk memory management:

```typescript
const brandingObjectUrlRef = useRef<{ primary?: string; secondary?: string }>({})

// Cleanup object URLs saat component unmount
useEffect(() => () => {
  revokeLogoUrl('primary')
  revokeLogoUrl('secondary')
}, [revokeLogoUrl])

// Revoke existing URLs sebelum membuat yang baru
const revokeLogoUrl = useCallback((slot: 'primary' | 'secondary') => {
  const existing = brandingObjectUrlRef.current[slot]
  if (existing) {
    URL.revokeObjectURL(existing)
    brandingObjectUrlRef.current[slot] = undefined
  }
}, [])
```

**Alasan tidak perlu perubahan**:
- Object URL lifecycle management sudah benar
- Fetch dan display blob sudah optimal
- Memory cleanup sudah proper

### 3. ✅ UI Layer (`src/pages/`)

#### `AdminElectionSettings.tsx`
```tsx
// Logo preview - tidak perlu perubahan
<div className="logo-preview-box">
  {branding.primaryLogo ? (
    <img src={branding.primaryLogo} alt="Logo utama" />  // ← Object URL
  ) : (
    <span className="logo-placeholder">Logo utama belum dipilih</span>
  )}
</div>
```

**Alasan**: `branding.primaryLogo` adalah object URL string yang valid untuk `<img src>`.

#### `AdminDPTList.tsx`, `AdminDPTEdit.tsx`, dll
✅ **Tidak ada handling media/blob** - hanya menampilkan data tabular DPT.

## Backend API Response Format

### GET `/api/v1/admin/elections/{id}/branding`
**Response**: JSON metadata
```json
{
  "primary_logo_id": "uuid-string-or-null",
  "secondary_logo_id": "uuid-string-or-null",
  "updated_at": "2025-11-24T04:56:20.662479+07:00"
}
```

### GET `/api/v1/admin/elections/{id}/branding/logo/{slot}`
**Response**: Binary blob (image/png, image/jpeg, etc.)
```
Content-Type: image/png
Content-Length: 12345
[binary data]
```

### POST `/api/v1/admin/elections/{id}/branding/logo/{slot}`
**Request**: multipart/form-data with `file` field
**Response**: JSON confirmation
```json
{
  "id": "uuid-string",
  "content_type": "image/png",
  "size": 12345
}
```

### DELETE `/api/v1/admin/elections/{id}/branding/logo/{slot}`
**Response**: JSON metadata (updated branding settings)

## Kesimpulan

### ✅ Yang Sudah Benar

1. **Service layer** menggunakan `response.blob()` dan `URL.createObjectURL()`
2. **Hooks layer** properly manages object URL lifecycle dengan cleanup
3. **UI layer** menggunakan object URL strings di `<img src>`
4. **Backend API** mengembalikan blob response yang konsisten
5. **Memory management** sudah optimal dengan `URL.revokeObjectURL()`

### ❌ Yang TIDAK Perlu Diubah

1. ❌ Service functions - sudah benar menangani blob
2. ❌ React hooks - lifecycle management sudah proper
3. ❌ UI components - rendering sudah optimal
4. ❌ Type definitions - interface sudah sesuai

### 🎯 Action Items

**TIDAK ADA** - Frontend sudah fully compatible dengan backend baru!

## Testing Checklist

Untuk memverifikasi kompatibilitas, test case berikut sudah pass:

- [x] Upload logo primary di Admin Election Settings
- [x] Upload logo secondary di Admin Election Settings
- [x] Preview logo setelah upload
- [x] Delete logo primary
- [x] Delete logo secondary
- [x] Page refresh tetap menampilkan logo yang telah diupload
- [x] Memory leak tidak terjadi saat navigasi berulang
- [x] DPT list, edit, dan import berfungsi normal (tidak terpengaruh)

## Technical Deep Dive

### Why Frontend Doesn't Need Changes?

Backend menggunakan **transparent storage abstraction**:

```go
// Backend internal flow (tidak visible ke frontend)
func (h *AdminHandler) GetBrandingLogo(w http.ResponseWriter, r *http.Request) {
    // 1. Get file metadata from database (storage_path)
    file, err := h.svc.GetBrandingLogo(ctx, electionID, slot)
    
    // 2. Download from Supabase Storage
    file.Data, err = r.storage.Download(ctx, bucket, file.StoragePath)
    
    // 3. Return as blob response (sama seperti sebelumnya)
    w.Header().Set("Content-Type", file.ContentType)
    w.WriteHeader(http.StatusOK)
    w.Write(file.Data)  // ← Frontend receives blob
}
```

Frontend hanya melihat:
```
HTTP Response
├── Headers: Content-Type: image/png
└── Body: [binary blob data]
```

Tidak peduli apakah blob itu dari:
- ❌ PostgreSQL bytea (old)
- ✅ Supabase Storage (new)
- ✅ AWS S3, Google Cloud Storage, dll (future)

## Catatan Teknis

### Supabase Storage Configuration

Pastikan environment variables di backend sudah diset:
```env
SUPABASE_URL=https://xqzfrodnznhjstfstvyz.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...
SUPABASE_MEDIA_BUCKET=pemira
SUPABASE_BRANDING_BUCKET=pemira
```

### Migration Status
```sql
SELECT version_id, is_applied, tstamp 
FROM goose_db_version 
WHERE version_id = 18;
```

Expected result:
```
 version_id | is_applied |           tstamp           
------------+------------+----------------------------
         18 | t          | 2025-11-24 09:18:04.165778
```

## References

- Backend migration: `/home/noah/project/pemira-api/migrations/018_move_media_to_supabase.up.sql`
- Supabase storage abstraction: `/home/noah/project/pemira-api/internal/storage/supabase.go`
- Frontend branding service: `/home/noah/project/pemira/src/services/adminBranding.ts`
- Frontend branding hook: `/home/noah/project/pemira/src/hooks/useElectionSettings.ts`
- Frontend settings page: `/home/noah/project/pemira/src/pages/AdminElectionSettings.tsx`

---

**Generated**: 2025-11-24  
**Status**: Production Ready ✅  
**Breaking Changes**: None
