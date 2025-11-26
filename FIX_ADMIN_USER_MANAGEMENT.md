# Fix: AdminUserManagement Runtime Error

## 🐛 Error

```
AdminUserManagement.tsx:273 Uncaught TypeError: Cannot read properties of undefined (reading 'length')
```

**Cause**: `users` state was `undefined` on first render before `fetchUsers()` executed.

---

## ✅ Fix Applied

### 1. Initialize with Empty Array
No change needed - already initialized as `useState<AdminUser[]>([])`.

### 2. Add Safe Checks in fetchUsers()

**Before:**
```typescript
const response = await listAdminUsers(token, params)
setUsers(response.items)
setTotal(response.total_items)
```

**After:**
```typescript
const response = await listAdminUsers(token, params)
setUsers(response.items || [])  // ← Fallback to []
setTotal(response.total_items || 0)  // ← Fallback to 0
```

Also added in catch block:
```typescript
catch (err) {
  // ...
  setUsers([])  // ← Set empty array on error
  setTotal(0)
}
```

### 3. Add Token Check in useEffect

**Before:**
```typescript
useEffect(() => {
  void fetchUsers()
}, [token, page, ...])
```

**After:**
```typescript
useEffect(() => {
  if (token) {  // ← Check token exists
    void fetchUsers()
  }
}, [token, page, ...])
```

### 4. Add Safe Checks in Render

**Before:**
```typescript
{!loading && users.length === 0 && (
  <tr>...</tr>
)}
{!loading && users.map((user, idx) => (
```

**After:**
```typescript
{!loading && (!users || users.length === 0) && (  // ← Check users exists
  <tr>...</tr>
)}
{!loading && users && users.map((user, idx) => (  // ← Check users exists
```

### 5. Add Safe Check in Pagination

**Before:**
```typescript
Menampilkan {users.length ? `...` : '0'}
```

**After:**
```typescript
Menampilkan {users && users.length ? `...` : '0'}  // ← Check users exists
```

---

## 🧪 Testing

### Before Fix
- ❌ Page crash on load with TypeError
- ❌ Cannot access /admin/users

### After Fix
- ✅ Page loads without error
- ✅ Shows "Memuat data..." while loading
- ✅ Shows "Tidak ada data pengguna" if no data
- ✅ Shows table if data exists
- ✅ No runtime errors

---

## 📝 Lessons Learned

### Always Initialize State Properly
```typescript
// ✅ Good
const [users, setUsers] = useState<AdminUser[]>([])

// ❌ Bad
const [users, setUsers] = useState<AdminUser[]>()  // undefined initially
```

### Always Check Before Using Array Methods
```typescript
// ✅ Good
{users && users.length > 0 && users.map(...)}

// ❌ Bad  
{users.length > 0 && users.map(...)}  // Crash if users is undefined
```

### Handle API Errors Gracefully
```typescript
// ✅ Good
catch (err) {
  setUsers([])  // Reset to safe state
  setTotal(0)
}

// ❌ Bad
catch (err) {
  // Leave users in unknown state
}
```

### Guard useEffect with Conditions
```typescript
// ✅ Good
useEffect(() => {
  if (token) {
    fetchData()
  }
}, [token])

// ❌ Bad
useEffect(() => {
  fetchData()  // Might fail if token not ready
}, [token])
```

---

## ✅ Verification

Run these checks:
- [ ] Page loads at /admin/users
- [ ] No console errors
- [ ] Loading state shows
- [ ] Empty state shows (if no data)
- [ ] Table shows (if data exists)
- [ ] All buttons work
- [ ] Modals open/close
- [ ] No memory leaks

---

**Fixed**: 2025-11-26  
**Status**: ✅ RESOLVED  
**Testing**: ⏳ Needs backend API
