#!/bin/bash

echo "═══════════════════════════════════════════════════════════════"
echo "  DPT ID Mapping Test - Bug Investigation"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}LANGKAH 1: Buka aplikasi di browser${NC}"
echo "  → http://localhost:5173/admin/dpt"
echo ""

echo -e "${BLUE}LANGKAH 2: Buka Browser Console (F12)${NC}"
echo "  → Chrome: Ctrl+Shift+J (Windows/Linux) atau Cmd+Option+J (Mac)"
echo "  → Firefox: Ctrl+Shift+K (Windows/Linux) atau Cmd+Option+K (Mac)"
echo ""

echo -e "${BLUE}LANGKAH 3: Check untuk log berikut:${NC}"
echo ""
echo -e "${GREEN}✓ YANG DIHARAPKAN (BACKEND OK):${NC}"
echo "  📊 DPT API Response Sample: {"
echo "    has_election_voter_id: true,         ← TRUE"
echo "    has_voter_id: true,"
echo "    election_voter_id: 6,                ← ADA NILAI!"
echo "    voter_id: 1,"
echo "    nim: '2021101'"
echo "  }"
echo ""

echo -e "${RED}✗ YANG BERMASALAH (BACKEND ISSUE):${NC}"
echo "  📊 DPT API Response Sample: {"
echo "    has_election_voter_id: false,        ← FALSE!"
echo "    has_voter_id: true,"
echo "    election_voter_id: undefined,        ← UNDEFINED!"
echo "    voter_id: 5,"
echo "    nim: '2021101'"
echo "  }"
echo ""
echo -e "${RED}  ⚠️ Missing election_voter_id for voter 2021101 (voter_id: 5)${NC}"
echo ""

echo -e "${BLUE}LANGKAH 4: Test Edit Functionality${NC}"
echo "  1. Catat NIM dari baris pertama di list"
echo "  2. Klik tombol 'Edit' pada baris tersebut"
echo "  3. Verify NIM yang muncul di form edit SAMA dengan yang diklik"
echo ""

echo -e "${BLUE}LANGKAH 5: Check Network Tab${NC}"
echo "  1. Buka Network tab di DevTools"
echo "  2. Filter: 'voters'"
echo "  3. Klik request ke /admin/elections/1/voters"
echo "  4. Klik tab 'Response'"
echo "  5. Check apakah 'election_voter_id' ada di setiap item"
echo ""

echo -e "${YELLOW}EXPECTED RESPONSE:${NC}"
cat << 'JSONEND'
{
  "success": true,
  "data": {
    "items": [
      {
        "election_voter_id": 6,        ✓ HARUS ADA
        "election_id": 1,
        "voter_id": 1,
        "nim": "2021101",
        "name": "Agus Santoso",
        ...
      }
    ],
    "page": 1,
    "limit": 50,
    "total_items": 41
  }
}
JSONEND
echo ""

echo -e "${RED}PROBLEMATIC RESPONSE:${NC}"
cat << 'JSONEND'
{
  "items": [
    {
      "voter_id": 5,                   ✗ election_voter_id TIDAK ADA!
      "nim": "2021101",
      "name": "Agus Santoso",
      ...
    }
  ]
}
JSONEND
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo -e "${GREEN}HASIL TEST:${NC}"
echo ""
echo "□ Console log menunjukkan has_election_voter_id: true"
echo "□ Tidak ada warning 'Missing election_voter_id'"
echo "□ Edit menampilkan data yang benar"
echo "□ Network response includes election_voter_id"
echo ""
echo "Jika SEMUA checklist di atas PASS, backend sudah benar."
echo "Jika ADA yang FAIL, backend perlu diperbaiki."
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo -e "${BLUE}DOCUMENTATION:${NC}"
echo "  → DPT_EDIT_BUG_FIX.md (detail lengkap)"
echo ""
echo -e "${BLUE}NEED HELP?${NC}"
echo "  → Screenshot console logs"
echo "  → Screenshot network response"
echo "  → Share dengan backend team"
echo ""
echo "═══════════════════════════════════════════════════════════════"
