# Implementasi Manajemen Pengguna Admin

Dokumentasi implementasi fitur manajemen pengguna admin (user_accounts) pada panel admin.

---

## 📋 Overview

Fitur ini memungkinkan admin untuk mengelola akun pengguna sistem seperti admin, operator TPS, panitia, dan role lainnya.

### File Yang Dibuat

1. **`src/services/adminUsers.ts`** - Service untuk API manajemen user
2. **`src/pages/AdminUserManagement.tsx`** - Halaman UI manajemen user

### File Yang Diupdate

1. **`src/pages/AdminElectionSettings.tsx`** - Tambah tab "Manajemen Admin"
2. **`src/router/routes.ts`** - Tambah route `/admin/users`

---

## 🔧 Service API (`adminUsers.ts`)

### Types

```typescript
export type UserRole =
  | 'ADMIN'
  | 'SUPER_ADMIN'
  | 'TPS_OPERATOR'
  | 'STUDENT'
  | 'LECTURER'
  | 'STAFF'
  | 'PANITIA'
  | 'KETUA_TPS'
  | 'OPERATOR_PANEL'
  | 'VIEWER'

export type AdminUser = {
  id: number
  username: string
  email: string
  full_name: string
  role: UserRole
  voter_id: number | null
  tps_id: number | null
  lecturer_id: string | null
  staff_id: string | null
  is_active: boolean
  last_login_at: string | null
  login_count: number
  created_at: string
  updated_at: string
}
```

### API Functions

| Function | Endpoint | Method | Purpose |
|----------|----------|--------|---------|
| `listAdminUsers()` | `/admin/users` | GET | List users dengan filter |
| `createAdminUser()` | `/admin/users` | POST | Buat user baru |
| `getAdminUser()` | `/admin/users/{id}` | GET | Detail user |
| `updateAdminUser()` | `/admin/users/{id}` | PATCH | Update user |
| `resetUserPassword()` | `/admin/users/{id}/reset-password` | POST | Reset password |
| `activateUser()` | `/admin/users/{id}/activate` | POST | Aktifkan user |
| `deactivateUser()` | `/admin/users/{id}/deactivate` | POST | Nonaktifkan user |
| `deleteAdminUser()` | `/admin/users/{id}` | DELETE | Hapus user |

### Helper Functions

```typescript
// Label role untuk display
export const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin',
  TPS_OPERATOR: 'Operator TPS',
  // ... etc
}

// Warna role untuk chip
export const getRoleColor(role: UserRole): string
```

---

## 🎨 UI Features (`AdminUserManagement.tsx`)

### 1. List Users dengan Filter

**Filters:**
- Search (username/email/nama)
- Role filter (dropdown semua role)
- Status filter (Aktif/Nonaktif)

**Display:**
- Tabel dengan kolom:
  - No, Username, Nama Lengkap, Email, Role, Status, Login Terakhir, Total Login, Aksi
- Pagination (20 items per page)
- Status chip berwarna berdasarkan role
- Active/Inactive status chip

### 2. Tambah User

**Modal Form:**
- Username *
- Email *
- Nama Lengkap *
- Password * (min 6 karakter)
- Role * (dropdown)
- Aktif (checkbox)

**Validasi:**
- Semua field wajib
- Password min 6 karakter
- Error handling untuk duplicate username/email (409)

### 3. Edit User

**Modal Form:**
- Email *
- Nama Lengkap *
- Role *
- TPS ID (optional)
- Aktif (checkbox)

**Note:** Username tidak bisa diubah

### 4. Quick Actions di Tabel

**Per Row:**
- **Edit** - Buka modal edit
- **Aktifkan/Nonaktifkan** - Toggle status aktif
- **Reset PW** - Reset password (prompt input)
- **Hapus** - Delete user dengan konfirmasi

---

## 📊 Integration dengan Admin Settings

### Tab Baru: "Manajemen Admin"

Di halaman `/admin/pengaturan`, ditambahkan tab ke-5:

```typescript
const tabs = [
  { id: 'info', label: 'Informasi Umum' },
  { id: 'timeline', label: 'Tahapan & Jadwal' },
  { id: 'mode', label: 'Mode Pemilihan' },
  { id: 'relations', label: 'Keterkaitan Data' },
  { id: 'users', label: 'Manajemen Admin' },  // ← NEW
]
```

**Content Tab:**
- Deskripsi singkat
- Tombol "Buka Manajemen Pengguna" → navigate ke `/admin/users`

---

## 🔄 User Flows

### Flow 1: Admin Menambah User Baru

```
1. Admin buka Pengaturan → tab "Manajemen Admin"
2. Klik "Buka Manajemen Pengguna"
3. Di halaman users, klik "+ Tambah Pengguna"
4. Modal muncul
5. Isi form:
   - Username: admin2
   - Email: admin2@campus.ac.id
   - Nama: Admin Dua
   - Password: Pass123!
   - Role: ADMIN
6. Klik "Simpan"
7. User dibuat → toast success
8. Tabel refresh, user baru muncul
```

### Flow 2: Admin Reset Password User

```
1. Di list users, cari user yang mau direset
2. Klik tombol "Reset PW"
3. Prompt muncul, masukkan password baru
4. Password direset → toast success
```

### Flow 3: Admin Nonaktifkan User

```
1. Di list users, cari user yang mau dinonaktifkan
2. Klik tombol "Nonaktifkan" (kuning)
3. Status berubah jadi "Nonaktif"
4. User tidak bisa login
5. Untuk aktifkan lagi, klik tombol "Aktifkan" (hijau)
```

### Flow 4: Admin Edit Role User

```
1. Klik tombol "Edit" di row user
2. Modal edit muncul
3. Ubah role dari "TPS_OPERATOR" → "ADMIN"
4. Klik "Simpan"
5. Role terupdate
```

---

## 🎨 Visual Design

### Role Colors

| Role | Color | Hex |
|------|-------|-----|
| SUPER_ADMIN | Red | #dc2626 |
| ADMIN | Blue | #2563eb |
| TPS_OPERATOR | Purple | #7c3aed |
| KETUA_TPS | Purple | #7c3aed |
| OPERATOR_PANEL | Purple | #7c3aed |
| PANITIA | Green | #059669 |
| VIEWER | Gray | #6b7280 |
| Others | Orange | #f59e0b |

### Status Colors

- **Aktif**: Hijau (#10b981)
- **Nonaktif**: Abu-abu (#6b7280)

### Button Colors

- **Edit**: Default (blue)
- **Aktifkan**: Green (#10b981)
- **Nonaktifkan**: Orange (#f59e0b)
- **Reset PW**: Default
- **Hapus**: Red (danger)

---

## 🔒 Security & Validation

### Frontend Validation

1. **Create User:**
   - Username tidak boleh kosong
   - Email harus valid
   - Password min 6 karakter
   - Role harus valid

2. **Update User:**
   - Email harus valid
   - Role harus valid

3. **Reset Password:**
   - Password baru min 6 karakter

### Backend Contract

1. **Duplicate Prevention:**
   - Username unique → 409 error
   - Email unique → 409 error

2. **Password Security:**
   - Min 6 characters (frontend)
   - Bcrypt hash (backend)

3. **Role Validation:**
   - Must be in enum list → 400 error

---

## 📡 API Contract Summary

### Base Path
```
/admin/users
```

### Authentication
- **Required**: Bearer JWT
- **Roles**: ADMIN, SUPER_ADMIN

### Endpoints

#### 1. List Users
```
GET /admin/users?search=admin&role=ADMIN&active=true&page=1&limit=50
```

**Response 200:**
```json
{
  "items": [
    {
      "id": 12,
      "username": "admin1",
      "email": "admin1@campus.ac.id",
      "full_name": "Admin Satu",
      "role": "ADMIN",
      "is_active": true,
      "last_login_at": "2025-12-02T03:00:00Z",
      "login_count": 42
    }
  ],
  "page": 1,
  "limit": 50,
  "total_items": 123,
  "total_pages": 3
}
```

#### 2. Create User
```
POST /admin/users
```

**Request:**
```json
{
  "username": "admin2",
  "email": "admin2@campus.ac.id",
  "full_name": "Admin Dua",
  "role": "ADMIN",
  "password": "StrongPass!23",
  "is_active": true
}
```

**Response 201:** User detail (tanpa password)

**Errors:**
- 400: Validation error / invalid role
- 409: Username or email already exists

#### 3. Update User
```
PATCH /admin/users/{userID}
```

**Request:**
```json
{
  "email": "new@campus.ac.id",
  "full_name": "Nama Baru",
  "role": "PANITIA",
  "is_active": true
}
```

**Response 200:** User detail updated

#### 4. Reset Password
```
POST /admin/users/{userID}/reset-password
```

**Request:**
```json
{
  "new_password": "NewPass!234"
}
```

**Response 200:**
```json
{
  "success": true
}
```

#### 5. Activate/Deactivate
```
POST /admin/users/{userID}/activate
POST /admin/users/{userID}/deactivate
```

**Response 200:** User detail with updated `is_active`

#### 6. Delete User
```
DELETE /admin/users/{userID}
```

**Response 204:** No Content

---

## ✅ Testing Checklist

### List & Filter
- [ ] List users tampil dengan benar
- [ ] Search by username works
- [ ] Search by email works
- [ ] Search by full name works
- [ ] Filter by role works
- [ ] Filter by active status works
- [ ] Pagination works
- [ ] Role chips berwarna sesuai
- [ ] Status chips tampil benar

### Create User
- [ ] Modal create muncul
- [ ] Form validation works
- [ ] Password min 6 enforced
- [ ] Success creates user
- [ ] Duplicate username → 409 error → toast
- [ ] Duplicate email → 409 error → toast
- [ ] Invalid role → 400 error → toast
- [ ] Table refresh after create

### Edit User
- [ ] Modal edit muncul dengan data pre-filled
- [ ] Email update works
- [ ] Full name update works
- [ ] Role update works
- [ ] TPS ID update works (optional)
- [ ] Active status toggle works
- [ ] Table refresh after edit

### Reset Password
- [ ] Prompt muncul
- [ ] Min 6 char enforced
- [ ] Success resets password
- [ ] User bisa login dengan password baru
- [ ] Error handling works

### Activate/Deactivate
- [ ] Toggle dari aktif → nonaktif works
- [ ] Toggle dari nonaktif → aktif works
- [ ] Status chip berubah
- [ ] User nonaktif tidak bisa login
- [ ] User aktif bisa login

### Delete User
- [ ] Confirmation popup muncul
- [ ] Delete succeeds
- [ ] User hilang dari list
- [ ] Toast success muncul
- [ ] Error handling works

### UI/UX
- [ ] Loading states tampil
- [ ] Error messages clear
- [ ] Buttons disabled saat loading
- [ ] Modals bisa di-close
- [ ] Responsive di mobile
- [ ] Keyboard navigation works

---

## 🚀 Deployment Notes

### Prerequisites
1. Backend harus sudah implement API `/admin/users`
2. Database table `user_accounts` ready
3. Authentication middleware ready

### Environment Variables
Tidak ada env var baru yang diperlukan.

### Feature Flag (Optional)
```typescript
const ENABLE_USER_MANAGEMENT = import.meta.env.VITE_ENABLE_USER_MANAGEMENT !== 'false'

// Hide tab if not enabled
{ENABLE_USER_MANAGEMENT && (
  <Tab id="users" label="Manajemen Admin" />
)}
```

---

## 📈 Future Enhancements

1. **Bulk Operations**
   - Activate/deactivate multiple users
   - Delete multiple users

2. **Advanced Filters**
   - Filter by last login date
   - Filter by TPS assignment

3. **User Activity Log**
   - View user login history
   - View user actions

4. **Role Permissions Matrix**
   - Define custom permissions per role
   - Visual permission editor

5. **User Groups**
   - Group users by team
   - Bulk assign to group

6. **Export Users**
   - Export to CSV
   - Export to Excel

---

## 🔗 Related Documentation

- **API Contract**: See top of this document
- **Backend Implementation**: (Backend repo)
- **Authentication**: `src/hooks/useAdminAuth.tsx`

---

## 📝 Notes

1. **Username Immutability**: Username tidak bisa diubah setelah dibuat untuk menjaga konsistensi referensi
2. **Password Security**: Password tidak pernah ditampilkan/dikirim ke frontend setelah dibuat
3. **Role Hierarchy**: Frontend tidak enforce hierarchy, bergantung pada backend
4. **Soft Delete**: Jika backend implement soft delete, frontend perlu adjust
5. **Audit Trail**: Consider logging admin actions untuk compliance

---

**Created**: 2025-11-26  
**Version**: 1.0  
**Status**: ✅ Ready for Integration  
**Backend Status**: ⏳ Pending
