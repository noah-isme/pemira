# Voter Profile API v3.1 - Quick Reference

## 🎯 Quick Start

### Update Profile (Email & Phone)
```typescript
import { updateProfile } from '@/services/voterProfile'

await updateProfile(token, {
  email: 'new@example.com',
  phone: '081234567890'
})
```

### Update Student Identity
```typescript
await updateProfile(token, {
  faculty_code: 'FTI',
  study_program_code: 'IF',
  cohort_year: 2021,
  class_label: 'IF-A'
})
```

### Update Lecturer Identity
```typescript
await updateProfile(token, {
  faculty_code: 'FTI',
  study_program_code: 'Informatika',
  class_label: 'Lektor Kepala'
})
```

### Update Staff Identity
```typescript
await updateProfile(token, {
  faculty_code: 'BAU',
  class_label: 'Koordinator'
})
```

## 📋 Field Reference

### Editable Fields

| Field | Type | Voters | Description | Example |
|-------|------|--------|-------------|---------|
| `email` | string | ALL | Email address | `user@example.com` |
| `phone` | string | ALL | Phone (08xxx/+62xxx) | `081234567890` |
| `photo_url` | string | ALL | Profile photo URL | `https://...` |
| `faculty_code` | string | ALL | Faculty/unit code | `FTI`, `BAU` |
| `study_program_code` | string | STUDENT, LECTURER | Program/dept code | `IF`, `SI` |
| `cohort_year` | number | STUDENT | Enrollment year | `2021` |
| `class_label` | string | ALL | Class/position | `IF-A`, `Koordinator` |

### Read-Only Fields

| Field | Description |
|-------|-------------|
| `voter_id` | Unique voter ID |
| `name` | Full name |
| `username` | NIM/NIDN/NIP |
| `voter_type` | STUDENT/LECTURER/STAFF |
| `faculty_name` | Faculty name (from code) |
| `study_program_name` | Program name (from code) |
| `semester` | Calculated semester |
| `department` | Department name |
| `unit` | Unit name |
| `position` | Position name |

## ✅ Validation Rules

### Email
```typescript
// Format: user@domain.com
// Regex: ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$

✅ Valid: ahmad@example.com, test.user@mail.com
❌ Invalid: invalid, @example.com, user@
```

### Phone
```typescript
// Format: 08xxx or +62xxx
// Regex: ^(08\d{8,11}|\+628\d{8,12})$

✅ Valid: 081234567890, +6281234567890
❌ Invalid: 08123, 1234567890, 123
```

### Cohort Year
```typescript
// Range: 2000 to current year

✅ Valid: 2021, 2022, 2023
❌ Invalid: 1999, 2050
```

## 🔄 Auto-Sync Behavior

When you update these fields:
- `faculty_code`
- `study_program_code`
- `cohort_year`
- `class_label`

They automatically sync to identity tables via database triggers:

| Voter Type | Syncs To | Fields Updated |
|------------|----------|----------------|
| STUDENT | `students` table | faculty_code, program_code, cohort_year, class_label |
| LECTURER | `lecturers` table | faculty_code, department_code, position |
| STAFF | `staff_members` table | unit_code, unit_name, position |

## 📦 Response Format

### Success
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Profil berhasil diperbarui",
    "updated_fields": ["email", "faculty_code"],
    "synced_to_identity": true
  }
}
```

### Error (Validation)
```json
{
  "success": false,
  "error": {
    "code": "INVALID_EMAIL",
    "message": "Format email tidak valid."
  }
}
```

## 🎨 Component Usage

### Access Profile Service
```typescript
import {
  fetchCompleteProfile,
  updateProfile,
  changePassword,
  updateVotingMethod,
  fetchParticipationStats,
  deletePhoto
} from '@/services/voterProfile'
```

### Fetch Complete Profile
```typescript
const profile = await fetchCompleteProfile(token)

console.log(profile.personal_info.name)
console.log(profile.voting_info.preferred_method)
console.log(profile.participation.participation_rate)
```

### Update Profile with Partial Data
```typescript
// Only send changed fields
await updateProfile(token, {
  email: 'new@example.com'  // Only update email
})

// Update multiple fields
await updateProfile(token, {
  email: 'new@example.com',
  phone: '081234567890',
  faculty_code: 'FTI'
})
```

### Change Password
```typescript
await changePassword(token, {
  current_password: 'oldpass123',
  new_password: 'newpass123',
  confirm_password: 'newpass123'
})
```

### Update Voting Method
```typescript
await updateVotingMethod(token, {
  election_id: 1,
  preferred_method: 'ONLINE'  // or 'TPS'
})
```

### Delete Profile Photo
```typescript
await deletePhoto(token)
```

## 🚨 Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `UNAUTHORIZED` | 401 | Invalid/missing token |
| `FORBIDDEN` | 403 | Not a voter account |
| `VOTER_NOT_FOUND` | 404 | Voter not found |
| `INVALID_EMAIL` | 400 | Invalid email format |
| `INVALID_PHONE` | 400 | Invalid phone format |
| `INVALID_METHOD` | 400 | Invalid voting method |
| `PASSWORD_MISMATCH` | 400 | Password confirmation mismatch |
| `PASSWORD_TOO_SHORT` | 400 | Password < 8 characters |
| `PASSWORD_SAME` | 400 | New password = old password |
| `INVALID_PASSWORD` | 401 | Wrong current password |
| `ALREADY_VOTED` | 400 | Cannot change after voting |
| `ALREADY_CHECKED_IN` | 400 | Cannot change after TPS check-in |

## 💡 Common Patterns

### Update Contact Info Only
```typescript
const handleUpdateContact = async () => {
  await updateProfile(token, {
    email: formData.email,
    phone: formData.phone
  })
}
```

### Update Student Academic Info
```typescript
const handleUpdateAcademic = async () => {
  await updateProfile(token, {
    faculty_code: 'FTI',
    study_program_code: 'IF',
    cohort_year: 2021,
    class_label: 'IF-A'
  })
}
```

### Handle Validation Errors
```typescript
try {
  await updateProfile(token, data)
} catch (error: any) {
  if (error.code === 'INVALID_EMAIL') {
    showError('Format email tidak valid')
  } else if (error.code === 'INVALID_PHONE') {
    showError('Format nomor telepon tidak valid')
  } else {
    showError(error.message)
  }
}
```

### Progressive Enhancement
```typescript
const handleSave = async () => {
  // Build payload with only changed fields
  const payload: any = {}
  
  if (email !== original.email) {
    payload.email = email
  }
  
  if (phone !== original.phone) {
    payload.phone = phone
  }
  
  if (Object.keys(payload).length > 0) {
    await updateProfile(token, payload)
  }
}
```

## 🔒 Security Notes

1. **Authentication Required**: All endpoints require valid JWT token
2. **Role Check**: Server verifies user is a voter
3. **Data Validation**: Both client and server validate input
4. **Password Security**: Current password required for changes
5. **Partial Updates**: Only send necessary fields
6. **Auto-Sync**: Identity changes trigger database updates

## 📱 Mobile-First Design

The profile component is mobile-optimized:
- Responsive grid layout
- Touch-friendly buttons
- Bottom navigation bar
- Smooth animations
- Form validation feedback

## 🧪 Testing

```typescript
// Mock profile update
jest.mock('@/services/voterProfile')

test('should update email', async () => {
  updateProfile.mockResolvedValue({
    success: true,
    message: 'Success',
    updated_fields: ['email']
  })
  
  await updateProfile('token', { email: 'new@example.com' })
  
  expect(updateProfile).toHaveBeenCalledWith('token', {
    email: 'new@example.com'
  })
})
```

## 📚 Related Documentation

- [API Contract (Full)](VOTER_PROFILE_API_SPEC.md) - Complete API specification
- [Implementation Summary](VOTER_PROFILE_UPDATE_SUMMARY.md) - Technical details
- [Database Schema](docs/database-schema.md) - Identity tables structure
- [Validation Rules](docs/validation.md) - Detailed validation logic

---

**Version**: 3.1  
**Last Updated**: 2025-11-26  
**Status**: ✅ Production Ready
