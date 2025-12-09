# ✅ FIX: Candidate API Response Structure Mismatch

## 🐛 Problem

Error saat save/update kandidat setelah upload photo:
```javascript
AdminCandidateForm.tsx:467 Failed to save candidate 
TypeError: Cannot read properties of undefined (reading 'id')
    at transformCandidateFromApi (adminCandidates.ts:86:15)
    at updateAdminCandidate (adminCandidates.ts:192:10)
```

**Root Cause:** Frontend expect wrapped response `{data: ...}` tapi backend return **langsung object**!

---

## 🔍 Analysis

### Backend Response Structure

**File:** `internal/candidate/admin_http_handler.go`
```go
func (h *AdminHandler) Update(w http.ResponseWriter, r *http.Request) {
    // ...
    dto, err := h.svc.AdminUpdateCandidate(ctx, electionID, candidateID, req)
    if err != nil {
        h.handleError(w, err)
        return
    }
    
    // ✅ Return DTO directly (no wrapper)
    response.JSON(w, http.StatusOK, dto)
}
```

**Type:** `CandidateDetailDTO`
```go
type CandidateDetailDTO struct {
    ID               int64                `json:"id"`
    ElectionID       int64                `json:"election_id"`
    Number           int                  `json:"number"`
    Name             string               `json:"name"`
    PhotoURL         string               `json:"photo_url"`
    PhotoMediaID     *string              `json:"photo_media_id,omitempty"`
    // ...
    Status           string               `json:"status"`
    Stats            CandidateStats       `json:"stats"`
}
```

**Actual Backend Response:**
```json
{
  "id": 1,
  "election_id": 1,
  "number": 1,
  "name": "John Doe",
  "status": "APPROVED",
  ...
}
```

**NO WRAPPER!** Just plain object ✅

---

### Frontend Expectation (WRONG ❌)

**Before Fix:**
```typescript
// Line 185-192 in adminCandidates.ts
export const updateAdminCandidate = async (...) => {
  const payload = buildCandidatePayload(candidate as CandidateAdmin)
  const response = await apiRequest<{ data: AdminCandidateResponse }>(
    `/admin/elections/${ACTIVE_ELECTION_ID}/candidates/${id}`, {
    method: 'PUT',
    token,
    body: payload,
  })
  return transformCandidateFromApi(response.data)  // ❌ response.data is UNDEFINED!
}
```

**Error Flow:**
1. Backend return: `{ id: 1, name: "...", ... }`
2. Frontend expect: `{ data: { id: 1, name: "...", ... } }`
3. Access `response.data` → **undefined**
4. Call `transformCandidateFromApi(undefined)` → **TypeError: Cannot read 'id' of undefined**

---

## ✅ Solution

### Changed Files

**File:** `src/services/adminCandidates.ts`

#### 1. updateAdminCandidate (Line 185-192)
```typescript
// Before (WRONG ❌)
const response = await apiRequest<{ data: AdminCandidateResponse }>(...)
return transformCandidateFromApi(response.data)  // ❌ undefined

// After (CORRECT ✅)
const response = await apiRequest<AdminCandidateResponse>(...)
return transformCandidateFromApi(response)  // ✅ Direct object
```

#### 2. createAdminCandidate (Line 175-182)
```typescript
// Before (WRONG ❌)
const response = await apiRequest<{ data: AdminCandidateResponse }>(...)
return transformCandidateFromApi(response.data)  // ❌ undefined

// After (CORRECT ✅)
const response = await apiRequest<AdminCandidateResponse>(...)
return transformCandidateFromApi(response)  // ✅ Direct object
```

---

## 📊 API Response Patterns

### Pattern 1: Direct Object (Most Endpoints)
```typescript
// ✅ CORRECT for: POST, PUT, GET /admin/elections/{id}/candidates/{id}
const response = await apiRequest<CandidateDetailDTO>(...)
return transformCandidateFromApi(response)
```

**Backend:**
```json
{
  "id": 1,
  "name": "John Doe",
  ...
}
```

### Pattern 2: Paginated List (LIST Endpoint)
```typescript
// ✅ CORRECT for: GET /admin/elections/{id}/candidates
const response = await apiRequest<{
  items: CandidateDetailDTO[]
  pagination: { page, limit, total_items, total_pages }
}>(...)
```

**Backend:**
```json
{
  "items": [{ "id": 1, ... }, { "id": 2, ... }],
  "pagination": { "page": 1, "limit": 10, "total_items": 25, "total_pages": 3 }
}
```

### Pattern 3: Fallback Handling (Already Correct)
```typescript
// fetchAdminCandidateDetail already has fallback ✅
const payload = (response as any)?.data ?? response
return transformCandidateFromApi(payload as AdminCandidateResponse)
```

---

## 🧪 Testing

### Test 1: Create New Candidate
```bash
# Request
POST /admin/elections/1/candidates
{
  "number": 1,
  "name": "Test Candidate",
  "status": "PENDING"
}

# Response (Direct object ✅)
{
  "id": 5,
  "election_id": 1,
  "number": 1,
  "name": "Test Candidate",
  "status": "PENDING",
  ...
}
```

### Test 2: Update Candidate
```bash
# Request
PUT /admin/elections/1/candidates/5
{
  "name": "Updated Name",
  "status": "APPROVED"
}

# Response (Direct object ✅)
{
  "id": 5,
  "election_id": 1,
  "number": 1,
  "name": "Updated Name",
  "status": "APPROVED",
  ...
}
```

### Test 3: Frontend Transform
```typescript
// Backend response
const backendResponse = {
  id: 1,
  election_id: 1,
  number: 1,
  name: "John Doe",
  status: "APPROVED",
  ...
}

// Frontend transform
const transformed = transformCandidateFromApi(backendResponse)
// ✅ SUCCESS:
// {
//   id: "1",
//   number: 1,
//   name: "John Doe",
//   status: "APPROVED",
//   ...
// }
```

---

## 📝 Notes

### apiRequest Function Behavior

**File:** `src/utils/apiClient.ts`
```typescript
export const apiRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const response = await fetch(url, { ... })
  const payload = isJson ? await response.json() : await response.text()
  
  if (!response.ok) {
    throw error
  }
  
  return payload as T  // ✅ Return RAW payload from backend
}
```

**Key Point:** `apiRequest` returns **exactly what backend sends**. No wrapping, no unwrapping.

---

## ✅ Result

- ✅ Create candidate berhasil
- ✅ Update candidate berhasil
- ✅ Save dengan photo upload berhasil
- ✅ No more TypeError "Cannot read 'id' of undefined"
- ✅ Transform function works correctly

---

## 🔗 Related Issues

1. **CANDIDATE_STATUS_FIX.md** - Status type mismatch fix
2. **CANDIDATE_API_PATH_FIX.md** - API path mismatch fix
3. **PHOTO_UPLOAD_ANALYSIS.md** - Photo upload backend verification

---

**Date:** 24 November 2024  
**Issue:** Response structure mismatch between frontend expectation and backend  
**Fix:** Remove incorrect wrapper expectation, use direct object  
**Status:** ✅ RESOLVED
