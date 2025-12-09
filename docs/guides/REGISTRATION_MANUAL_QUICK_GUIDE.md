# 🚀 Registration Manual Input - Quick Guide

**Mode:** Manual Input (No Identity Verification)  
**Reason:** Campus system under development  
**Status:** ✅ Active

---

## 📝 Quick Overview

Registration now requires users to **manually enter all information** including:
- NIM/NIDN/NIP (identifier)
- Name (full name)
- Password
- Email (optional)
- Phone (optional)

**No pre-verification** with campus database required.

---

## 🎯 User Flow

```
1. Navigate to /register
   ↓
2. Select voter type (Mahasiswa/Dosen/Staf)
   ↓
3. Enter NIM/NIDN/NIP
   ↓
4. Enter full name
   ↓
5. Enter password (min 8 chars)
   ↓
6. Confirm password
   ↓
7. Optionally enter email
   ↓
8. Optionally enter phone
   ↓
9. Check agreement
   ↓
10. Click "Daftar Sekarang"
   ↓
11. Success → Auto-login → Redirect to login page
```

---

## 💻 Code Example

### Register Student
```typescript
import { registerStudent } from '@/services/auth'

const result = await registerStudent({
  nim: '2021001',
  name: 'Ahmad Zulfikar',          // ← Required now
  password: 'password123',
  email: 'ahmad@example.com',      // Optional
  phone: '081234567890'            // Optional
})
```

### Register Lecturer
```typescript
import { registerLecturer } from '@/services/auth'

const result = await registerLecturer({
  nidn: '0123456789',
  name: 'Dr. Budi Santoso',        // ← Required now
  password: 'password123',
  email: 'budi@example.com',
  phone: '+6281234567890'
})
```

### Register Staff
```typescript
import { registerStaff } from '@/services/auth'

const result = await registerStaff({
  nip: '198501012010121001',
  name: 'Siti Aminah',             // ← Required now
  password: 'password123',
  email: 'siti@example.com',
  phone: '081234567890'
})
```

---

## ✅ Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `identifier` | string | NIM/NIDN/NIP | `2021001` |
| `name` | string | Full name | `Ahmad Zulfikar` |
| `password` | string | Min 8 chars | `password123` |
| `confirmPassword` | string | Must match password | `password123` |
| `agree` | boolean | Terms agreement | `true` |

---

## ⭕ Optional Fields

| Field | Type | Validation | Example |
|-------|------|------------|---------|
| `email` | string | Email format | `user@example.com` |
| `phone` | string | 08xxx or +62xxx | `081234567890` |

---

## 🚨 Validation

### Client-Side
```typescript
// Submit button enabled when:
agree === true &&
identifier.trim() !== '' &&
name.trim() !== '' &&
password.length >= 8 &&
password === confirmPassword
```

### Server-Side (Expected)
- Check for duplicate NIM/NIDN/NIP (409 if exists)
- Validate password length
- Validate email format (if provided)
- Validate phone format (if provided)

---

## 📦 API Endpoints

| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| `POST` | `/voters/register/student` | `{nim, name, password, email?, phone?}` | `{voter_id, name, nim, ...}` |
| `POST` | `/voters/register/lecturer` | `{nidn, name, password, email?, phone?}` | `{voter_id, name, nidn, ...}` |
| `POST` | `/voters/register/staff` | `{nip, name, password, email?, phone?}` | `{voter_id, name, nip, ...}` |

---

## 🎨 Form Fields

### Student Form
```typescript
<form>
  <input name="nim" placeholder="Contoh: 2021001" required />
  <input name="name" placeholder="Nama lengkap" required />
  <input type="password" minLength={8} required />
  <input type="password" placeholder="Konfirmasi" required />
  <input type="email" placeholder="Email (opsional)" />
  <input type="tel" placeholder="Telepon (opsional)" />
  <checkbox>Saya setuju...</checkbox>
  <button type="submit">Daftar Sekarang</button>
</form>
```

---

## 🔍 Key Differences from Verification Mode

| Aspect | Verification Mode | Manual Mode (Current) |
|--------|------------------|----------------------|
| Name input | ❌ Auto from DB | ✅ Manual input |
| Identity check | ✅ Pre-check | ❌ No pre-check |
| API calls | 2 (check + register) | 1 (register) |
| Speed | Slower | Faster |
| Database dependency | High | None |

---

## 🧪 Testing

### Test Registration
```bash
# 1. Start dev server
npm run dev

# 2. Navigate to
http://localhost:3000/register

# 3. Fill form:
# - Select Mahasiswa
# - NIM: 2021001
# - Nama: Test User
# - Password: password123
# - Confirm: password123
# - Email: test@example.com (optional)
# - Phone: 081234567890 (optional)
# - Check agreement
# - Submit

# 4. Should see success screen
# 5. Should auto-login
# 6. Click to login page
```

---

## 💡 Best Practices

### For Users
1. ✅ Enter NIM/NIDN/NIP carefully (will be used as username)
2. ✅ Use full official name
3. ✅ Choose strong password
4. ✅ Add email for password recovery
5. ✅ Add phone for notifications

### For Developers
1. ✅ Validate all fields on submit
2. ✅ Show clear error messages
3. ✅ Handle 409 duplicate errors gracefully
4. ✅ Auto-login after success
5. ✅ Log registration events

---

## 🚨 Common Errors

### 409 - Already Registered
```json
{
  "error": {
    "code": "ALREADY_REGISTERED",
    "message": "NIM sudah terdaftar sebagai voter."
  }
}
```

**Solution:** User already registered, redirect to login.

### 400 - Validation Error
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Password minimal 8 karakter."
  }
}
```

**Solution:** Fix validation issue and retry.

---

## 📊 Success Response

```json
{
  "success": true,
  "data": {
    "voter_id": 1,
    "name": "Ahmad Zulfikar",
    "nim": "2021001",
    "email": "ahmad@example.com",
    "phone": "081234567890",
    "voter_type": "STUDENT",
    "message": "Registrasi berhasil! Silakan login."
  }
}
```

---

## 🔄 Future: Migration to Verification Mode

When campus system is ready, migration steps:

1. **Backend:** Populate identity tables
2. **Backend:** Add check availability endpoint
3. **Frontend:** Add identity verification step
4. **Frontend:** Remove manual name input
5. **Testing:** Verify end-to-end flow
6. **Deploy:** Switch to verification mode

---

## 📚 Related Files

- **Component:** `src/pages/RegisterNew.tsx`
- **Service:** `src/services/auth.ts`
- **Styles:** `src/styles/LoginMahasiswa.css`
- **Documentation:** `REGISTRATION_MANUAL_INPUT_UPDATE.md`

---

## ✅ Checklist

- [x] Manual name input added
- [x] Identity verification removed
- [x] API updated with name field
- [x] Form validation updated
- [x] Error handling updated
- [x] Documentation updated
- [x] TypeScript compilation OK
- [x] Build successful

---

**Version:** 2.0 (Manual Input)  
**Date:** 2025-11-26  
**Status:** ✅ Production Ready

Quick, simple, and effective registration for development phase! 🚀
