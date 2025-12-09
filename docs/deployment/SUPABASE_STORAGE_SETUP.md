# Supabase Storage Setup untuk Media Upload

## Masalah yang Ditemukan

Saat testing upload logo melalui API `/api/v1/admin/elections/{id}/branding/logo/{slot}`, terjadi error:

```json
{
  "code": "INTERNAL_ERROR",
  "message": "Gagal menyimpan logo."
}
```

**Root Cause**: Supabase Storage buckets belum dikonfigurasi atau tidak accessible dengan credentials yang ada.

## Konfigurasi Environment

File `.env` di backend sudah memiliki konfigurasi Supabase:

```env
SUPABASE_URL=https://xqzfrodnznhjstfstvyz.supabase.co
SUPABASE_SECRET_KEY=sb_secret_1iAM9xFu0EzeU2UlzEnWuA_-gfUSxWE
SUPABASE_MEDIA_BUCKET=pemira
SUPABASE_BRANDING_BUCKET=pemira
```

## Required Setup di Supabase Dashboard

### 1. Buat Storage Buckets

Login ke [Supabase Dashboard](https://app.supabase.com) untuk project: `https://xqzfrodnznhjstfstvyz.supabase.co`

#### Bucket untuk Branding (Logo):
```
Name: pemira
Public: Yes (untuk preview di frontend)
File size limit: 2MB
Allowed MIME types: image/png, image/jpeg, image/jpg, image/webp
```

**Perhatian**: Saat ini backend menggunakan bucket yang sama `pemira` untuk branding dan candidate media. Bisa dipisah jika diperlukan.

### 2. Set Bucket Policies

Untuk bucket `pemira`, set RLS policies:

#### Policy: Allow authenticated uploads
```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pemira');
```

#### Policy: Allow public read access
```sql
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'pemira');
```

#### Policy: Allow authenticated deletes
```sql
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'pemira');
```

### 3. Verifikasi Service Role Key

Pastikan `SUPABASE_SECRET_KEY` yang digunakan adalah **service_role key** (bukan anon key), karena backend perlu full access untuk upload/delete files.

Lokasi key di Supabase Dashboard:
```
Project Settings > API > Project API keys > service_role (secret)
```

## Testing Upload

### Via cURL

```bash
# 1. Login dan dapatkan token
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}' \
  | jq -r '.access_token')

# 2. Upload primary logo
curl -X POST "http://localhost:8080/api/v1/admin/elections/1/branding/logo/primary" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/logo.png"

# Expected response (sukses):
{
  "id": "uuid-string",
  "content_type": "image/png",
  "size": 12345
}

# 3. Download/preview logo
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8080/api/v1/admin/elections/1/branding/logo/primary" \
  --output downloaded-logo.png
```

### Via Frontend

1. Buka admin panel: `http://localhost:5173/admin`
2. Login dengan credentials admin
3. Navigate ke **Pengaturan Pemilu** → Tab **Branding & Logo**
4. Upload logo (PNG/JPG, max 2MB)
5. Verify preview muncul

## Backend Flow dengan Supabase

### Upload Flow:
```
Client → Backend Handler
         ↓
    Save to Supabase Storage (as: elections/{electionID}/branding/{slot}/{uuid}.ext)
         ↓
    Insert metadata ke database (table: branding_files)
         ↓
    Update branding_settings.primary_logo_id atau secondary_logo_id
         ↓
    Return success response
```

### Download Flow:
```
Client → Backend Handler
         ↓
    Query database untuk storage_path
         ↓
    Download dari Supabase Storage menggunakan storage_path
         ↓
    Stream blob ke client
```

## Troubleshooting

### Error: "Gagal menyimpan logo"

**Kemungkinan penyebab:**
1. ✗ Bucket `pemira` belum dibuat di Supabase
2. ✗ Service role key salah atau expired
3. ✗ Bucket policies tidak mengizinkan upload
4. ✗ Network issue ke Supabase API

**Solusi:**
```bash
# Check Supabase connectivity
curl -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  "https://xqzfrodnznhjstfstvyz.supabase.co/storage/v1/bucket"

# Jika bucket tidak ada, buat via dashboard atau API:
curl -X POST "https://xqzfrodnznhjstfstvyz.supabase.co/storage/v1/bucket" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "pemira",
    "name": "pemira",
    "public": true
  }'
```

### Error: "Cannot read properties of undefined (reading 'SignedURL')"

**Penyebab**: Response dari Supabase Storage tidak sesuai ekspektasi

**Solusi**: Pastikan menggunakan library Supabase Go yang compatible:
```bash
cd /home/noah/project/pemira-api
go get -u github.com/supabase-community/storage-go
go get -u github.com/supabase-community/supabase-go
```

### Frontend tidak menampilkan preview

**Debugging steps:**
1. Buka DevTools → Network tab
2. Check request ke `/api/v1/admin/elections/{id}/branding/logo/{slot}`
3. Verify response status code dan content-type
4. Check console untuk ObjectURL creation errors

**Common issues:**
- CORS policy blocking request (check backend CORS settings)
- Token expired (re-login)
- Logo belum diupload (404 response)

## Storage Path Format

Backend menggunakan path format yang organized:

```
Branding logos:
elections/{electionID}/branding/{slot}/{uuid}.{ext}

Contoh:
elections/1/branding/primary/550e8400-e29b-41d4-a716-446655440000.png
elections/1/branding/secondary/123e4567-e89b-12d3-a456-426614174000.jpg

Candidate media:
candidates/{candidateID}/{slot}/{uuid}.{ext}

Contoh:
candidates/5/profile/abc12345-1234-5678-abcd-123456789abc.png
candidates/5/poster/def67890-5678-9012-efgh-567890123def.jpg
```

## Migration Status

Pastikan migration 018 sudah applied:

```sql
SELECT version_id, is_applied, tstamp 
FROM goose_db_version 
WHERE version_id = 18;

-- Expected:
-- version_id | is_applied |           tstamp           
-- -----------+------------+----------------------------
--         18 | t          | 2025-11-24 09:18:04.165778
```

## Alternatif: Mock Storage untuk Development

Jika Supabase belum ready, bisa temporary menggunakan local file storage mock:

```go
// internal/storage/mock.go
type MockStorage struct {
    files map[string][]byte
}

func (m *MockStorage) Upload(ctx context.Context, bucket, path string, data []byte, contentType string) error {
    m.files[path] = data
    return nil
}

func (m *MockStorage) Download(ctx context.Context, bucket, path string) ([]byte, error) {
    if data, ok := m.files[path]; ok {
        return data, nil
    }
    return nil, fmt.Errorf("file not found")
}

func (m *MockStorage) Delete(ctx context.Context, bucket string, paths []string) error {
    for _, path := range paths {
        delete(m.files, path)
    }
    return nil
}

func (m *MockStorage) PublicURL(bucket, path string) string {
    return fmt.Sprintf("http://localhost:8080/mock-storage/%s", path)
}
```

## Next Steps

1. ✅ Database migration sudah applied
2. ✅ Frontend code sudah compatible
3. ⏳ **Setup Supabase buckets** ← PENDING ACTION
4. ⏳ Test upload/download via frontend
5. ⏳ Deploy to production dengan Supabase configured

## References

- Supabase Storage Docs: https://supabase.com/docs/guides/storage
- Backend storage abstraction: `/home/noah/project/pemira-api/internal/storage/supabase.go`
- Frontend compatibility docs: `/home/noah/project/pemira/SUPABASE_STORAGE_COMPATIBILITY.md`

---

**Status**: Setup Required  
**Priority**: High  
**Blocker for**: Media upload functionality dalam production
