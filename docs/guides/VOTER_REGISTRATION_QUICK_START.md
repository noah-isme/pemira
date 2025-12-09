# 🚀 Voter Registration API v1.0 - Quick Start

Quick reference for voter registration implementation.

---

## 📦 What's New?

✨ **Identity-based registration** - No need to fill academic data  
🔍 **Check availability first** - Verify identity before registration  
📝 **Simplified flow** - Just NIM/NIDN/NIP + password  
✅ **Optional contact** - Email and phone not required  
🔄 **Auto-login** - Automatically logged in after registration

---

## 🏃 Quick Start

### For Users

1. **Go to registration page**: `/register-new`
2. **Select voter type**: Mahasiswa / Dosen / Staf
3. **Enter identity**: NIM / NIDN / NIP
4. **Click check button**: Verify identity exists
5. **Set password**: Minimum 8 characters
6. **Add contact** (optional): Email and phone
7. **Agree to terms**: Check the agreement box
8. **Register**: Click "Daftar Sekarang"

### For Developers

```typescript
import {
  registerStudent,
  registerLecturer,
  registerStaff,
  checkIdentityAvailability
} from '@/services/auth'

// Check if identity exists
const check = await checkIdentityAvailability('student', '2021001')
if (check.available) {
  console.log('Can register:', check.name)
}

// Register student
const result = await registerStudent({
  nim: '2021001',
  password: 'password123',
  email: 'user@example.com',  // optional
  phone: '081234567890'        // optional
})
```

---

## 📋 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/voters/register/check/student/{nim}` | Check student |
| `GET` | `/voters/register/check/lecturer/{nidn}` | Check lecturer |
| `GET` | `/voters/register/check/staff/{nip}` | Check staff |
| `POST` | `/voters/register/student` | Register student |
| `POST` | `/voters/register/lecturer` | Register lecturer |
| `POST` | `/voters/register/staff` | Register staff |

---

## 💻 Code Examples

### Check Identity
```typescript
// Student
const check = await checkIdentityAvailability('student', '2021001')

// Lecturer
const check = await checkIdentityAvailability('lecturer', '0123456789')

// Staff
const check = await checkIdentityAvailability('staff', '198501012010121001')

// Response
{
  available: true,
  name: "Ahmad Zulfikar",
  type: "STUDENT",
  message: "Identitas ditemukan dan dapat didaftarkan."
}
```

### Register Student
```typescript
const result = await registerStudent({
  nim: '2021001',
  password: 'password123',
  email: 'student@example.com',  // optional
  phone: '081234567890'           // optional
})

// Response
{
  voter_id: 1,
  name: "Ahmad Zulfikar",
  nim: "2021001",
  email: "student@example.com",
  voter_type: "STUDENT",
  faculty_name: "Fakultas Teknologi Informasi",
  program_name: "Teknik Informatika",
  cohort_year: 2021,
  message: "Registrasi berhasil! Silakan login."
}
```

### Register Lecturer
```typescript
const result = await registerLecturer({
  nidn: '0123456789',
  password: 'password123',
  email: 'lecturer@example.com',
  phone: '+6281234567890'
})
```

### Register Staff
```typescript
const result = await registerStaff({
  nip: '198501012010121001',
  password: 'password123',
  email: 'staff@example.com',
  phone: '081234567890'
})
```

---

## ✅ Validation

### Password
- ✅ Minimum 8 characters
- ✅ Must match confirmation
- ❌ No special character requirements

### Email (Optional)
```typescript
✅ user@example.com
✅ john.doe@mail.edu
❌ invalid
❌ @example.com
```

### Phone (Optional)
```typescript
✅ 081234567890
✅ +6281234567890
❌ 08123 (too short)
❌ 1234567890 (wrong format)
```

---

## 🚨 Error Handling

```typescript
try {
  await registerStudent(payload)
} catch (error) {
  if (error.status === 404) {
    // NIM not found
    alert('NIM tidak terdaftar di sistem')
  } else if (error.status === 409) {
    // Already registered
    alert('NIM sudah terdaftar')
  } else if (error.status === 400) {
    // Validation error
    alert('Data tidak valid')
  } else {
    // Other error
    alert('Registrasi gagal')
  }
}
```

---

## 🎯 Common Patterns

### Full Registration Flow
```typescript
const handleRegister = async () => {
  // Step 1: Check identity
  const check = await checkIdentityAvailability('student', nim)
  
  if (!check.available) {
    alert(check.message)
    return
  }
  
  // Step 2: Register
  const result = await registerStudent({
    nim,
    password,
    email: email || undefined,
    phone: phone || undefined
  })
  
  // Step 3: Auto-login
  const login = await loginUser(nim, password)
  setSession(login)
  
  // Step 4: Redirect
  navigate('/login')
}
```

### Identity Checker Component
```typescript
const IdentityChecker = ({ type, value, onVerified }) => {
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState(null)

  const handleCheck = async () => {
    setChecking(true)
    try {
      const res = await checkIdentityAvailability(type, value)
      setResult(res)
      if (res.available) onVerified(res.name)
    } catch (error) {
      setResult({ available: false, message: error.message })
    } finally {
      setChecking(false)
    }
  }

  return (
    <div>
      <input value={value} onChange={...} />
      <button onClick={handleCheck} disabled={checking}>
        {checking ? 'Checking...' : 'Check'}
      </button>
      {result && (
        <div className={result.available ? 'success' : 'error'}>
          {result.message}
        </div>
      )}
    </div>
  )
}
```

---

## 🧪 Testing

### Manual Test Checklist
- [ ] Select student type
- [ ] Enter valid NIM
- [ ] Click check button
- [ ] Verify name appears
- [ ] Enter password (8+ chars)
- [ ] Confirm password matches
- [ ] Enter email (optional)
- [ ] Enter phone (optional)
- [ ] Check agreement
- [ ] Click register
- [ ] Verify success message
- [ ] Verify redirect to login

### Test with cURL
```bash
# Check student
curl "http://localhost:8080/api/v1/voters/register/check/student/2021001"

# Register student
curl -X POST "http://localhost:8080/api/v1/voters/register/student" \
  -H "Content-Type: application/json" \
  -d '{
    "nim": "2021001",
    "password": "password123",
    "email": "student@example.com",
    "phone": "081234567890"
  }'
```

---

## 📱 Router Setup

```typescript
// src/router/index.tsx
import RegisterNew from '../pages/RegisterNew'

// Add new route
<Route path="/register-new" element={<RegisterNew />} />

// Or replace old route
<Route path="/register" element={<RegisterNew />} />
```

---

## 💡 Tips

1. **Check identity first** - Always verify before showing registration form
2. **Show user's name** - Display the name from check result for confirmation
3. **Make contact optional** - Don't require email/phone
4. **Auto-login after** - Better UX than manual login
5. **Clear error messages** - Help users understand what went wrong

---

## 🎓 TypeScript Types

```typescript
// Request
interface StudentRegistrationRequest {
  nim: string
  password: string
  email?: string
  phone?: string
  photo_url?: string
}

// Response
interface StudentRegistrationResponse {
  voter_id: number
  name: string
  nim: string
  email?: string
  phone?: string
  voter_type: 'STUDENT'
  faculty_name?: string
  program_name?: string
  cohort_year?: number
  message: string
}

// Check
interface CheckAvailabilityResponse {
  available: boolean
  name?: string
  type?: 'STUDENT' | 'LECTURER' | 'STAFF'
  reason?: string
  message: string
}
```

---

## 🔗 Related Documentation

- [Full Implementation Guide](VOTER_REGISTRATION_IMPLEMENTATION.md)
- [API Contract](API_CONTRACT_VOTER_REGISTRATION.md)
- [Profile API Quick Reference](VOTER_PROFILE_QUICK_REFERENCE.md)

---

**Version**: 1.0  
**Status**: ✅ Production Ready  
**Last Updated**: 2025-11-26

Happy coding! 🎉
