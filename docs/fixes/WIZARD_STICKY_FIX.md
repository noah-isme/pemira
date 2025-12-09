# 🔧 FIX: Wizard Sticky Navigation Menutupi Form

## ❌ MASALAH

**Issue:** Saat edit kandidat, wizard navigation sticky menutupi form ketika scroll ke bawah

**Lokasi:** Halaman Admin Candidate Form (Edit Kandidat)

**Penyebab:**
```css
.wizard-sticky {
  position: sticky;
  top: 64px;  /* ← Menempel di atas, menutupi form */
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.9) 20%, rgba(255, 255, 255, 0));
  padding-bottom: 0.25rem;
}
```

**Screenshot/Description:**
- Wizard navigation (steps 1-5) tetap menempel di atas saat scroll
- Menutupi input form yang sedang diisi
- Membuat UX tidak nyaman

---

## ✅ SOLUSI

### 1. **Hapus Sticky Positioning pada Wizard Navigation**

**File:** `src/styles/AdminCandidates.css`

**Before:**
```css
.wizard-sticky {
  position: sticky;
  top: 64px;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.9) 20%, rgba(255, 255, 255, 0));
  padding-bottom: 0.25rem;
}
```

**After:**
```css
.wizard-sticky {
  position: relative;  /* ← Changed from sticky to relative */
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: var(--admin-color-bg-page, #f3f5fb);  /* ← Solid background */
  padding-bottom: 1rem;  /* ← More padding */
  margin-bottom: 1rem;  /* ← Added margin */
}
```

**Changes:**
- ✅ `position: sticky` → `position: relative`
- ✅ Removed gradient background, use solid color
- ✅ Increased padding and added margin for better spacing
- ✅ Wizard navigation sekarang scroll normal dengan konten

---

### 2. **Improve Sticky Preview Sidebar**

**File:** `src/styles/AdminCandidates.css`

**Before:**
```css
.wizard-aside .sticky-preview {
  position: sticky;
  top: 120px;
}
```

**After:**
```css
.wizard-aside .sticky-preview {
  position: sticky;
  top: 80px;  /* ← Lower top position */
  max-height: calc(100vh - 100px);  /* ← Max height */
  overflow-y: auto;  /* ← Scrollable if content too long */
}
```

**Changes:**
- ✅ Lower `top` value (120px → 80px)
- ✅ Added `max-height` untuk prevent terlalu tinggi
- ✅ Added `overflow-y: auto` untuk scroll jika preview panjang
- ✅ Preview sidebar tetap sticky tapi tidak menutupi form

---

## 📊 HASIL

### ✅ Fixed Issues

| Issue | Status | Solution |
|-------|--------|----------|
| Wizard navigation menutupi form | ✅ Fixed | Changed to `position: relative` |
| Form tidak terlihat saat scroll | ✅ Fixed | Navigation scroll dengan konten |
| Preview sidebar terlalu tinggi | ✅ Improved | Added max-height + scroll |
| Background gradient aneh | ✅ Fixed | Use solid background |

---

## 🎨 UX IMPROVEMENTS

### Before:
```
┌─────────────────────────────┐
│ [Sticky Wizard Navigation]  │ ← Menempel, menutupi form
├─────────────────────────────┤
│ Form Input (tertutup) ❌    │
│ ...                          │
```

### After:
```
┌─────────────────────────────┐
│ [Wizard Navigation]          │ ← Scroll normal
├─────────────────────────────┤
│ Form Input (visible) ✅      │
│ User bisa input dengan nyaman│
│ ...                          │
```

---

## 🚀 BENEFITS

1. **Better UX**
   - Form selalu terlihat penuh
   - Tidak ada element yang menutupi input
   - User bisa scroll dengan nyaman

2. **Better Layout**
   - Navigation tetap di atas saat pertama load
   - Scroll natural dengan konten
   - Preview sidebar tetap sticky (berguna)

3. **Responsive**
   - Mobile: Wizard sudah `position: static`
   - Desktop: Improved spacing
   - Preview: Scrollable jika terlalu panjang

---

## 📱 RESPONSIVE BEHAVIOR

### Desktop (> 900px)
- Wizard navigation: `position: relative` (scroll dengan konten)
- Preview sidebar: `position: sticky` (tetap visible)
- Layout: 2 kolom (form + preview)

### Mobile (< 900px)
- Wizard navigation: `position: static` (already handled)
- Preview sidebar: Block (tidak sticky)
- Layout: 1 kolom (stacked)

---

## 🧪 TESTING

### Test Scenarios:
1. ✅ Buka halaman edit kandidat
2. ✅ Scroll ke bawah untuk isi form
3. ✅ Verify wizard navigation tidak menutupi form
4. ✅ Preview sidebar tetap sticky dan scrollable
5. ✅ Test pada mobile view

### Browser Compatibility:
- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

---

## 📝 FILES CHANGED

### 1. `src/styles/AdminCandidates.css`
**Lines Changed:**
- Line 165-174: `.wizard-sticky` - Changed positioning
- Line 735-738: `.wizard-aside .sticky-preview` - Improved sticky preview

**Total Changes:** 2 CSS rules modified

---

## ✨ SUMMARY

**Problem:** Wizard navigation sticky menutupi form saat scroll  
**Solution:** Changed `position: sticky` to `position: relative`  
**Result:** Form selalu terlihat, UX lebih baik  
**Status:** ✅ Fixed & Tested

---

*Fix applied: 24 November 2024*  
*Issue: Wizard sticky navigation covering form*  
*Solution: Changed positioning strategy*
