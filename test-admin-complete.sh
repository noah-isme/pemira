#!/bin/bash

# Admin Panel Complete Feature Test Script
# Tests all admin panel features with API calls

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_URL="http://localhost:8080/api/v1"
ADMIN_TOKEN=""
ELECTION_ID=1

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🧪 ADMIN PANEL COMPLETE FEATURE TEST               ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo ""

# Function to print test section
print_section() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}🔹 $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Function to make API call and show result
api_call() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "${YELLOW}📡 $description${NC}"
    echo -e "   ${method} ${endpoint}"
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X ${method} \
            "${API_URL}${endpoint}" \
            -H "Authorization: Bearer ${ADMIN_TOKEN}" \
            -H "Content-Type: application/json")
    else
        response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X ${method} \
            "${API_URL}${endpoint}" \
            -H "Authorization: Bearer ${ADMIN_TOKEN}" \
            -H "Content-Type: application/json" \
            -d "${data}")
    fi
    
    http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
    body=$(echo "$response" | sed '/HTTP_CODE:/d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "   ${GREEN}✅ Success (HTTP $http_code)${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo -e "   ${RED}❌ Failed (HTTP $http_code)${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    fi
    echo ""
}

# ============================================================================
# 1. AUTHENTICATION
# ============================================================================
print_section "1️⃣  ADMIN AUTHENTICATION"

echo -e "${YELLOW}Please enter admin credentials:${NC}"
read -p "Username: " ADMIN_USERNAME
read -s -p "Password: " ADMIN_PASSWORD
echo ""

login_response=$(curl -s -X POST "${API_URL}/auth/admin/login" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"${ADMIN_USERNAME}\",\"password\":\"${ADMIN_PASSWORD}\"}")

ADMIN_TOKEN=$(echo "$login_response" | jq -r '.access_token // .token // .data.access_token // .data.token' 2>/dev/null)

if [ -n "$ADMIN_TOKEN" ] && [ "$ADMIN_TOKEN" != "null" ]; then
    echo -e "${GREEN}✅ Login successful!${NC}"
    echo "Token: ${ADMIN_TOKEN:0:20}..."
else
    echo -e "${RED}❌ Login failed. Please check credentials.${NC}"
    echo "Response: $login_response"
    exit 1
fi

# ============================================================================
# 2. DASHBOARD
# ============================================================================
print_section "2️⃣  DASHBOARD & STATISTICS"

api_call "GET" "/admin/elections/${ELECTION_ID}/statistics" "" "Get Election Statistics"
api_call "GET" "/admin/elections/${ELECTION_ID}/dashboard" "" "Get Dashboard Data"

# ============================================================================
# 3. KANDIDAT ADMIN
# ============================================================================
print_section "3️⃣  KANDIDAT MANAGEMENT"

api_call "GET" "/admin/elections/${ELECTION_ID}/candidates" "" "List All Candidates"
api_call "GET" "/admin/candidates/1?election_id=${ELECTION_ID}" "" "Get Candidate Detail (ID: 1)"

# Test create candidate
echo -e "${YELLOW}📝 Testing Create Candidate...${NC}"
create_data='{
  "election_id": '${ELECTION_ID}',
  "number": 99,
  "name": "Test Candidate - API Test",
  "faculty_name": "Fakultas Test",
  "study_program_name": "Program Test",
  "cohort_year": 2023,
  "tagline": "Test tagline",
  "short_bio": "Test bio singkat",
  "long_bio": "Test bio panjang untuk testing API",
  "vision": "Test visi untuk masa depan",
  "missions": ["Misi 1", "Misi 2", "Misi 3"],
  "main_programs": [
    {"title": "Program 1", "description": "Deskripsi program 1"}
  ],
  "status": "PENDING"
}'

api_call "POST" "/admin/elections/${ELECTION_ID}/candidates" "$create_data" "Create Test Candidate"

# ============================================================================
# 4. DPT ADMIN
# ============================================================================
print_section "4️⃣  DPT (DAFTAR PEMILIH) MANAGEMENT"

api_call "GET" "/admin/elections/${ELECTION_ID}/voters?page=1&limit=10" "" "List Voters (Page 1)"
api_call "GET" "/admin/elections/${ELECTION_ID}/voters?search=TEST" "" "Search Voters (keyword: TEST)"
api_call "GET" "/admin/elections/${ELECTION_ID}/voters?faculty=Fakultas%20Teknik" "" "Filter by Faculty"

# Test get specific voter
echo -e "${YELLOW}📝 Testing Get Voter Detail...${NC}"
echo "Getting voter list to find a valid voter ID..."
voters_response=$(curl -s -X GET "${API_URL}/admin/elections/${ELECTION_ID}/voters?limit=1" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}")
voter_id=$(echo "$voters_response" | jq -r '.items[0].voter_id // .data.items[0].voter_id' 2>/dev/null)

if [ -n "$voter_id" ] && [ "$voter_id" != "null" ]; then
    api_call "GET" "/admin/elections/${ELECTION_ID}/voters/${voter_id}" "" "Get Voter Detail (ID: ${voter_id})"
    
    # Test update voter
    update_data='{
      "name": "Updated Test Name",
      "email": "updated.test@example.com"
    }'
    echo -e "${YELLOW}📝 Testing Update Voter...${NC}"
    api_call "PUT" "/admin/elections/${ELECTION_ID}/voters/${voter_id}" "$update_data" "Update Voter (ID: ${voter_id})"
else
    echo -e "${RED}⚠️  No voters found to test detail/update${NC}"
fi

# ============================================================================
# 5. TPS MANAGEMENT
# ============================================================================
print_section "5️⃣  TPS MANAGEMENT"

api_call "GET" "/admin/elections/${ELECTION_ID}/tps" "" "List All TPS"

# Get first TPS for detail test
tps_response=$(curl -s -X GET "${API_URL}/admin/elections/${ELECTION_ID}/tps" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}")
tps_id=$(echo "$tps_response" | jq -r '.items[0].id // .data.items[0].id // .tps[0].id' 2>/dev/null)

if [ -n "$tps_id" ] && [ "$tps_id" != "null" ]; then
    api_call "GET" "/admin/elections/${ELECTION_ID}/tps/${tps_id}" "" "Get TPS Detail (ID: ${tps_id})"
    api_call "GET" "/admin/elections/${ELECTION_ID}/tps/${tps_id}/statistics" "" "Get TPS Statistics"
else
    echo -e "${RED}⚠️  No TPS found to test${NC}"
fi

# ============================================================================
# 6. MONITORING & LIVE COUNT
# ============================================================================
print_section "6️⃣  MONITORING & LIVE COUNT"

api_call "GET" "/admin/elections/${ELECTION_ID}/monitoring/live" "" "Get Live Count"
api_call "GET" "/admin/elections/${ELECTION_ID}/monitoring/votes" "" "Get Vote Statistics"
api_call "GET" "/admin/elections/${ELECTION_ID}/monitoring/participation" "" "Get Participation Rate"
api_call "GET" "/admin/elections/${ELECTION_ID}/monitoring/by-faculty" "" "Get Votes by Faculty"
api_call "GET" "/admin/elections/${ELECTION_ID}/monitoring/by-tps" "" "Get Votes by TPS"
api_call "GET" "/admin/elections/${ELECTION_ID}/monitoring/timeline" "" "Get Voting Timeline"

# ============================================================================
# 7. ELECTION SETTINGS
# ============================================================================
print_section "7️⃣  ELECTION SETTINGS"

api_call "GET" "/admin/elections/${ELECTION_ID}" "" "Get Election Settings"
api_call "GET" "/admin/elections/${ELECTION_ID}/status" "" "Get Election Status"

# ============================================================================
# 8. REKAPITULASI (if voting is closed)
# ============================================================================
print_section "8️⃣  REKAPITULASI & RESULTS"

api_call "GET" "/admin/elections/${ELECTION_ID}/results/summary" "" "Get Results Summary"
api_call "GET" "/admin/elections/${ELECTION_ID}/results/statistics" "" "Get Results Statistics"
api_call "GET" "/admin/elections/${ELECTION_ID}/audit/report" "" "Get Audit Report"

# ============================================================================
# SUMMARY
# ============================================================================
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   ✅ TEST COMPLETE                                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}All API endpoints have been tested.${NC}"
echo -e "${YELLOW}Review the results above to verify each feature works correctly.${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Test the UI in browser at http://localhost:5173/admin"
echo "2. Verify photo upload functionality"
echo "3. Test DPT edit and delete features"
echo "4. Check wizard navigation on candidate form"
echo "5. Test all filters and search functions"
echo ""
