# 🚀 Voter Profile v3.1 - Getting Started

Quick guide to get up and running with the new Voter Profile implementation.

---

## 📦 What's New in v3.1?

✨ **Editable Identity Fields** - Users can now update faculty codes, program codes, cohort year, and class labels  
🔄 **Auto-Sync** - Identity changes automatically sync to respective tables  
📝 **Better UX** - Clear separation of read-only and editable fields  
✅ **Enhanced Validation** - Client-side validation before API calls  
💬 **Detailed Feedback** - Success messages show exactly what changed

---

## 🏃 Quick Start

### For Developers

1. **Check the implementation:**
   ```bash
   # View modified files
   git diff src/services/voterProfile.ts
   git diff src/pages/VoterProfile.tsx
   ```

2. **Verify it compiles:**
   ```bash
   npm run build
   # Should complete without errors
   ```

3. **Test locally:**
   ```bash
   npm run dev
   # Navigate to /dashboard/profile
   ```

### For Testers

1. **Set up test environment:**
   ```bash
   export VOTER_TOKEN="your_test_voter_token"
   ```

2. **Run automated tests:**
   ```bash
   ./test-voter-profile.sh
   ```

3. **Manual testing checklist:**
   - [ ] View profile page
   - [ ] Click "Edit Profil"
   - [ ] Update email and phone
   - [ ] Update identity fields (codes)
   - [ ] Verify validation works
   - [ ] Check success notification
   - [ ] Verify profile refreshes

### For Backend Developers

1. **Review API contract:**
   - Read the full API specification in the original contract
   - Focus on Section 2: "Profile Endpoints"

2. **Key endpoints to implement:**
   ```
   GET  /api/v1/voters/me/complete-profile
   PUT  /api/v1/voters/me/profile
   POST /api/v1/voters/me/change-password
   PUT  /api/v1/voters/me/voting-method
   GET  /api/v1/voters/me/participation-stats
   DELETE /api/v1/voters/me/photo
   ```

3. **Database setup:**
   ```sql
   -- Ensure identity tables exist
   students (id, nim, faculty_code, program_code, cohort_year, class_label)
   lecturers (id, nidn, faculty_code, department_code, position)
   staff_members (id, nip, unit_code, position)
   
   -- Create triggers for auto-sync (example for students)
   CREATE TRIGGER sync_student_identity
   AFTER UPDATE ON voters
   FOR EACH ROW
   WHEN (NEW.student_id IS NOT NULL)
   BEGIN
     UPDATE students 
     SET faculty_code = NEW.faculty_code,
         program_code = NEW.study_program_code,
         cohort_year = NEW.cohort_year,
         class_label = NEW.class_label
     WHERE id = NEW.student_id;
   END;
   ```

4. **Test with frontend:**
   ```bash
   # Frontend team provides test script
   ./test-voter-profile.sh
   ```

---

## 📚 Documentation Structure

```
VOTER_PROFILE_*.md files:

├── GETTING_STARTED.md (this file)
│   └── Quick start guide for all team members
│
├── IMPLEMENTATION.md
│   └── High-level overview and user experience
│
├── UPDATE_SUMMARY.md
│   └── Technical implementation details
│
├── QUICK_REFERENCE.md
│   └── Developer guide with code examples
│
├── CHECKLIST.md
│   └── Comprehensive testing and deployment checklist
│
└── test-voter-profile.sh
    └── Automated API test script
```

**Start here:** `GETTING_STARTED.md` (this file)  
**Then read:** `IMPLEMENTATION.md` for overview  
**For coding:** `QUICK_REFERENCE.md` for examples  
**For testing:** `CHECKLIST.md` + run `test-voter-profile.sh`

---

## 🎯 Common Tasks

### Update Email and Phone
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

### Fetch Complete Profile
```typescript
import { fetchCompleteProfile } from '@/services/voterProfile'

const profile = await fetchCompleteProfile(token)
console.log(profile.personal_info.name)
console.log(profile.voting_info.preferred_method)
```

---

## 🔍 Understanding the Changes

### Before v3.1 (v3.0)
```typescript
// Request used name-based fields
{
  faculty_name: "Fakultas Teknologi Informasi",
  study_program_name: "Teknik Informatika",
  semester: "7"
}
```

### After v3.1
```typescript
// Request uses code-based fields
{
  faculty_code: "FTI",
  study_program_code: "IF",
  cohort_year: 2021,
  class_label: "IF-A"
}
```

**Why?** Code-based fields ensure referential integrity and enable auto-sync to identity tables.

---

## ✅ Verification Checklist

### Frontend Ready? ✅
- [x] Code implemented
- [x] TypeScript compiles
- [x] Build successful
- [x] No runtime errors
- [x] Documentation complete

### Backend Ready? ⏳
- [ ] API endpoints implemented
- [ ] Database schema updated
- [ ] Triggers created for auto-sync
- [ ] Validation logic in place
- [ ] Test script passes

### Integration Ready? ⏳
- [ ] Frontend + Backend tested together
- [ ] All test cases pass
- [ ] Edge cases handled
- [ ] Error scenarios tested

---

## 🐛 Troubleshooting

### "Invalid email format" error
```typescript
// Email must match: user@domain.com
✅ valid@example.com
❌ invalid
❌ @example.com
```

### "Invalid phone format" error
```typescript
// Phone must be: 08xxx or +62xxx
✅ 081234567890
✅ +6281234567890
❌ 08123
❌ 1234567890
```

### Profile not updating
1. Check network tab for API response
2. Verify token is valid
3. Check backend logs for errors
4. Ensure field names match API contract

### Auto-sync not working
- Backend must have database triggers set up
- Check `synced_to_identity` flag in response
- Verify identity tables exist

---

## 📞 Need Help?

1. **Check documentation first:**
   - `QUICK_REFERENCE.md` for code examples
   - `CHECKLIST.md` for testing guidance
   - `UPDATE_SUMMARY.md` for technical details

2. **Run tests:**
   ```bash
   ./test-voter-profile.sh
   ```

3. **Check console:**
   - Browser console for frontend errors
   - Server logs for backend errors

4. **Review API contract:**
   - All endpoints documented
   - Request/response examples provided
   - Error codes listed

---

## 🎓 Learning Path

### Day 1: Understand the Changes
- Read `IMPLEMENTATION.md`
- Review API contract
- Understand old vs new field names

### Day 2: Explore the Code
- Read `UPDATE_SUMMARY.md`
- Review `src/services/voterProfile.ts`
- Review `src/pages/VoterProfile.tsx`

### Day 3: Practice
- Read `QUICK_REFERENCE.md`
- Try code examples locally
- Test in development environment

### Day 4: Test
- Run `test-voter-profile.sh`
- Manual testing checklist
- Edge case testing

### Day 5: Deploy
- Follow `CHECKLIST.md`
- Deploy to staging
- Verify integration
- Deploy to production

---

## 🚀 Ready to Deploy?

### Pre-Deployment
```bash
# 1. Verify code quality
npm run build

# 2. Run tests
./test-voter-profile.sh

# 3. Check documentation
ls -la VOTER_PROFILE_*.md
```

### Deployment
```bash
# 1. Deploy frontend
npm run build
# Copy dist/ to web server

# 2. Deploy backend
# (Backend deployment process)

# 3. Verify
curl -H "Authorization: Bearer $TOKEN" \
  https://api.example.com/api/v1/voters/me/complete-profile
```

### Post-Deployment
```bash
# Monitor logs
tail -f /var/log/app.log

# Check metrics
# (Monitoring dashboard)

# Gather feedback
# (User feedback channels)
```

---

## 🎉 Success Criteria

You'll know the implementation is successful when:

✅ Users can view their complete profile  
✅ Users can edit email and phone  
✅ Users can edit identity fields (codes)  
✅ Validation prevents invalid input  
✅ Success messages show what changed  
✅ Profile auto-refreshes after update  
✅ Identity changes sync to database  
✅ All 16 automated tests pass  
✅ No console errors in production  
✅ Users report improved experience

---

## 📈 What's Next?

After v3.1 is stable, consider:

1. **Photo Upload**: Replace URL input with file upload
2. **Profile Verification**: Add verification badge system
3. **Activity Log**: Show profile change history
4. **Bulk Import**: Admin tool to import/update profiles
5. **Enhanced Stats**: More detailed participation analytics

---

**Version:** 3.1  
**Status:** ✅ Ready for Integration Testing  
**Last Updated:** 2025-11-26

Happy coding! 🎉
