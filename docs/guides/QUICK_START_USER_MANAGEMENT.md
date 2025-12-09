# 🚀 Quick Start: Manajemen Pengguna Admin

## ✅ Status
Implementasi selesai dan siap untuk testing dengan backend.

---

## 📦 Files Created

```
src/
├── services/
│   └── adminUsers.ts                  ✅ NEW (Service API)
└── pages/
    └── AdminUserManagement.tsx        ✅ NEW (UI Page)

Updated:
├── pages/AdminElectionSettings.tsx    ✏️ (+Tab "Manajemen Admin")
└── router/routes.ts                   ✏️ (+Route /admin/users)

Docs:
├── ADMIN_USER_MANAGEMENT_IMPLEMENTATION.md
└── QUICK_START_USER_MANAGEMENT.md (this file)
```

---

## 🎯 Akses Halaman

### Via Settings (Recommended)
```
1. Login sebagai admin
2. Buka menu "Pengaturan" → /admin/pengaturan
3. Klik tab "Manajemen Admin"
4. Klik tombol "Buka Manajemen Pengguna"
5. Redirect ke /admin/users
```

### Direct URL
```
http://localhost:5173/admin/users
```

---

## 📡 API Endpoints (Backend)

### Base URL
```
/admin/users
```

### Required Endpoints

```
GET    /admin/users                    - List users
POST   /admin/users                    - Create user
GET    /admin/users/{id}               - Get user detail
PATCH  /admin/users/{id}               - Update user
DELETE /admin/users/{id}               - Delete user
POST   /admin/users/{id}/activate      - Activate user
POST   /admin/users/{id}/deactivate    - Deactivate user
POST   /admin/users/{id}/reset-password - Reset password
```

---

## 🎨 Features Overview

### 1. List Users
- ✅ Tabel dengan pagination (20 per page)
- ✅ Search by username/email/nama
- ✅ Filter by role (10 roles)
- ✅ Filter by status (Aktif/Nonaktif)
- ✅ Sortable columns
- ✅ Role colored chips
- ✅ Status indicators

### 2. Create User
- ✅ Modal form
- ✅ Fields: username, email, full_name, password, role
- ✅ Password min 6 characters
- ✅ Role dropdown (10 options)
- ✅ Active checkbox
- ✅ Validation
- ✅ Error handling (409 duplicate, 400 invalid)

### 3. Edit User
- ✅ Modal form
- ✅ Pre-filled data
- ✅ Update email, full_name, role, tps_id, is_active
- ✅ Username immutable
- ✅ Validation

### 4. Quick Actions
- ✅ **Edit** - Buka modal edit
- ✅ **Aktifkan/Nonaktifkan** - Toggle status
- ✅ **Reset PW** - Reset password
- ✅ **Hapus** - Delete dengan konfirmasi

---

## 🔧 Usage Examples

### Import Service

```typescript
import {
  listAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  activateUser,
  deactivateUser,
  resetUserPassword,
  roleLabels,
  getRoleColor,
  type AdminUser,
  type UserRole,
} from '@/services/adminUsers'
```

### List Users with Filter

```typescript
const params = new URLSearchParams({
  search: 'admin',
  role: 'ADMIN',
  active: 'true',
  page: '1',
  limit: '20'
})

const response = await listAdminUsers(token, params)

console.log(response.items) // AdminUser[]
console.log(response.total_items) // 123
```

### Create User

```typescript
const newUser = await createAdminUser(token, {
  username: 'admin2',
  email: 'admin2@campus.ac.id',
  full_name: 'Admin Dua',
  role: 'ADMIN',
  password: 'Pass123!',
  is_active: true
})

console.log(newUser.id) // 12
```

### Update User

```typescript
const updated = await updateAdminUser(token, userId, {
  email: 'new@campus.ac.id',
  role: 'SUPER_ADMIN',
  is_active: false
})
```

### Reset Password

```typescript
await resetUserPassword(token, userId, {
  new_password: 'NewPass!234'
})
```

### Toggle Active Status

```typescript
// Activate
await activateUser(token, userId)

// Deactivate
await deactivateUser(token, userId)
```

### Delete User

```typescript
await deleteAdminUser(token, userId)
```

---

## 🎨 Role Display

### Role Labels & Colors

```typescript
import { roleLabels, getRoleColor } from '@/services/adminUsers'

// Display role
const label = roleLabels['ADMIN'] // "Admin"
const color = getRoleColor('ADMIN') // "#2563eb"

// Render chip
<span style={{ 
  backgroundColor: color + '20', 
  color: color,
  border: `1px solid ${color}`
}}>
  {label}
</span>
```

### Available Roles

| Role | Label | Color |
|------|-------|-------|
| SUPER_ADMIN | Super Admin | Red |
| ADMIN | Admin | Blue |
| TPS_OPERATOR | Operator TPS | Purple |
| KETUA_TPS | Ketua TPS | Purple |
| OPERATOR_PANEL | Operator Panel | Purple |
| PANITIA | Panitia | Green |
| STUDENT | Mahasiswa | Orange |
| LECTURER | Dosen | Orange |
| STAFF | Staf | Orange |
| VIEWER | Viewer | Gray |

---

## 🧪 Quick Test Scenarios

### Test 1: Create Admin
```
1. Buka /admin/users
2. Klik "+ Tambah Pengguna"
3. Isi:
   - Username: testadmin
   - Email: test@campus.ac.id
   - Nama: Test Admin
   - Password: Pass123!
   - Role: ADMIN
4. Klik "Simpan"
✓ User muncul di list
```

### Test 2: Edit User
```
1. Klik "Edit" di row user
2. Ubah email → newemail@campus.ac.id
3. Ubah role → SUPER_ADMIN
4. Klik "Simpan"
✓ Data terupdate
```

### Test 3: Reset Password
```
1. Klik "Reset PW"
2. Input: NewPass456!
3. Klik OK
✓ Password berhasil direset
✓ User bisa login dengan password baru
```

### Test 4: Deactivate User
```
1. Klik "Nonaktifkan" (tombol kuning)
✓ Status berubah "Nonaktif"
✓ User tidak bisa login
```

### Test 5: Delete User
```
1. Klik "Hapus"
2. Konfirmasi
✓ User hilang dari list
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: 409 Duplicate Username
**Cause**: Username sudah digunakan  
**Solution**: Gunakan username yang berbeda

### Issue 2: 422 Password Too Short
**Cause**: Password kurang dari 6 karakter  
**Solution**: Gunakan password min 6 karakter

### Issue 3: 401 Unauthorized
**Cause**: Token expired atau tidak ada  
**Solution**: Login ulang

### Issue 4: 404 User Not Found
**Cause**: User ID tidak valid  
**Solution**: Refresh list dan coba lagi

### Issue 5: Modal Tidak Muncul
**Cause**: State management issue  
**Solution**: Reload page

---

## 🔒 Security Notes

1. **Password**: Tidak pernah ditampilkan setelah dibuat
2. **Token**: Harus valid dan memiliki role ADMIN/SUPER_ADMIN
3. **Validation**: Frontend + Backend validation
4. **Audit**: Consider logging admin actions

---

## 📊 API Request/Response Examples

### Create User Request
```json
POST /admin/users

{
  "username": "admin2",
  "email": "admin2@campus.ac.id",
  "full_name": "Admin Dua",
  "role": "ADMIN",
  "password": "Pass123!",
  "is_active": true
}
```

### Create User Response (201)
```json
{
  "id": 12,
  "username": "admin2",
  "email": "admin2@campus.ac.id",
  "full_name": "Admin Dua",
  "role": "ADMIN",
  "is_active": true,
  "last_login_at": null,
  "login_count": 0,
  "created_at": "2025-11-26T12:00:00Z",
  "updated_at": "2025-11-26T12:00:00Z"
}
```

### List Users Response (200)
```json
{
  "items": [
    {
      "id": 1,
      "username": "admin1",
      "email": "admin1@campus.ac.id",
      "full_name": "Admin Satu",
      "role": "SUPER_ADMIN",
      "is_active": true,
      "last_login_at": "2025-11-26T10:00:00Z",
      "login_count": 42
    }
  ],
  "page": 1,
  "limit": 20,
  "total_items": 1,
  "total_pages": 1
}
```

---

## 🎉 Summary

### ✅ Implemented
- Service API (`adminUsers.ts`)
- UI Page (`AdminUserManagement.tsx`)
- Tab di Settings
- Route `/admin/users`
- CRUD operations
- Filter & search
- Pagination
- Role management
- Active/inactive toggle
- Password reset
- Delete dengan konfirmasi

### ⏳ Pending
- Backend API implementation
- Integration testing
- Production deployment

### 📚 Documentation
- Implementation guide: `ADMIN_USER_MANAGEMENT_IMPLEMENTATION.md`
- Quick start: `QUICK_START_USER_MANAGEMENT.md` (this)

---

**Created**: 2025-11-26  
**Status**: ✅ READY FOR TESTING  
**Backend**: ⏳ Pending Implementation  
**Tested**: Compilation ✅
