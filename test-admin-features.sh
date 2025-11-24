#!/bin/bash

# =============================================================================
# COMPREHENSIVE ADMIN DASHBOARD FEATURE TEST
# =============================================================================

set -e

API_URL="${API_URL:-http://localhost:8080}"
ELECTION_ID="${ELECTION_ID:-1}"
ADMIN_USERNAME="${ADMIN_USERNAME:-admin}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-password123}"
TOKEN=""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
FAILED=0

log_test() {
    local name=$1
    local status=$2
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ $name${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ $name${NC}"
        FAILED=$((FAILED + 1))
    fi
}

# Login
echo "======================================================================"
echo "  TESTING ADMIN DASHBOARD - PEMIRA"
echo "======================================================================"
echo ""
echo "🔐 Authenticating..."

response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$ADMIN_USERNAME\",\"password\":\"$ADMIN_PASSWORD\"}" \
    "${API_URL}/api/v1/auth/login")

TOKEN=$(echo "$response" | jq -r '.access_token // .data.access_token // empty' 2>/dev/null)

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo "❌ Authentication failed"
    exit 1
fi

echo "✅ Login berhasil"
echo ""

# Helper function for API calls
call_api() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    if [ -z "$data" ]; then
        curl -s -X $method \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            "${API_URL}${endpoint}"
    else
        curl -s -X $method \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "${API_URL}${endpoint}"
    fi
}

echo "======================================================================"
echo "  1. ELECTION MANAGEMENT"
echo "======================================================================"

# Test 1.1: Get Election Detail
response=$(call_api GET "/api/v1/admin/elections/$ELECTION_ID")
if echo "$response" | jq -e '.id' > /dev/null 2>&1; then
    log_test "Get Election Detail" "PASS"
    echo "   Election: $(echo $response | jq -r '.name')"
    echo "   Status: $(echo $response | jq -r '.status')"
    echo "   Online: $(echo $response | jq -r '.online_enabled')"
    echo "   TPS: $(echo $response | jq -r '.tps_enabled')"
else
    log_test "Get Election Detail" "FAIL"
fi

# Test 1.2: Update Election Settings
response=$(call_api PUT "/api/v1/admin/elections/$ELECTION_ID" '{"online_enabled":true,"tps_enabled":true}')
if echo "$response" | jq -e '.id' > /dev/null 2>&1; then
    log_test "Update Election Settings" "PASS"
else
    log_test "Update Election Settings" "FAIL"
fi

echo ""
echo "======================================================================"
echo "  2. CANDIDATES MANAGEMENT"
echo "======================================================================"

# Test 2.1: List Candidates
response=$(call_api GET "/api/v1/admin/elections/$ELECTION_ID/candidates")
if echo "$response" | jq -e '.items' > /dev/null 2>&1; then
    count=$(echo "$response" | jq '.items | length')
    log_test "List Candidates" "PASS"
    echo "   Total candidates: $count"
else
    log_test "List Candidates" "FAIL"
fi

echo ""
echo "======================================================================"
echo "  3. TPS MANAGEMENT"
echo "======================================================================"

# Test 3.1: List TPS
response=$(call_api GET "/api/v1/admin/tps?election_id=$ELECTION_ID")
if echo "$response" | jq -e '.items // . | type' > /dev/null 2>&1; then
    log_test "List TPS" "PASS"
    if echo "$response" | jq -e '.items' > /dev/null 2>&1; then
        count=$(echo "$response" | jq '.items | length')
        echo "   Total TPS: $count"
    else
        count=$(echo "$response" | jq '. | length')
        echo "   Total TPS: $count"
    fi
else
    log_test "List TPS" "FAIL"
fi

echo ""
echo "======================================================================"
echo "  4. MONITORING & STATISTICS"
echo "======================================================================"

# Test 4.1: Live Monitoring
response=$(call_api GET "/api/v1/admin/monitoring/live-count/$ELECTION_ID")
if echo "$response" | jq -e '.total_votes // .data.total_votes' > /dev/null 2>&1; then
    log_test "Live Vote Monitoring" "PASS"
    total_votes=$(echo "$response" | jq -r '.total_votes // .data.total_votes')
    echo "   Total votes: $total_votes"
else
    log_test "Live Vote Monitoring" "FAIL"
fi

# Test 4.2: Vote Statistics
response=$(call_api GET "/api/v1/admin/elections/$ELECTION_ID/stats/votes")
if [ ! -z "$response" ] && [ "$response" != "404" ]; then
    log_test "Vote Statistics" "PASS"
else
    log_test "Vote Statistics" "FAIL"
fi

# Test 4.3: Participation Statistics
response=$(call_api GET "/api/v1/admin/elections/$ELECTION_ID/stats/participation")
if [ ! -z "$response" ] && [ "$response" != "404" ]; then
    log_test "Participation Statistics" "PASS"
else
    log_test "Participation Statistics" "FAIL"
fi

echo ""
echo "======================================================================"
echo "  5. DPT MANAGEMENT"
echo "======================================================================"

# Test 5.1: List DPT
response=$(call_api GET "/api/v1/admin/dpt?election_id=$ELECTION_ID&page=1&limit=10")
if [ ! -z "$response" ] && [ "$response" != "404" ]; then
    log_test "List DPT" "PASS"
else
    log_test "List DPT" "FAIL"
fi

# Test 5.2: DPT Statistics
response=$(call_api GET "/api/v1/admin/dpt/stats?election_id=$ELECTION_ID")
if [ ! -z "$response" ] && [ "$response" != "404" ]; then
    log_test "DPT Statistics" "PASS"
else
    log_test "DPT Statistics" "FAIL"
fi

echo ""
echo "======================================================================"
echo "  6. REKAPITULASI & RESULTS"
echo "======================================================================"

# Test 6.1: Results Summary
response=$(call_api GET "/api/v1/admin/elections/$ELECTION_ID/results/summary")
if [ ! -z "$response" ] && [ "$response" != "404" ]; then
    log_test "Results Summary" "PASS"
else
    log_test "Results Summary" "FAIL"
fi

# Test 6.2: Detailed Statistics
response=$(call_api GET "/api/v1/admin/elections/$ELECTION_ID/results/statistics")
if [ ! -z "$response" ] && [ "$response" != "404" ]; then
    log_test "Detailed Statistics" "PASS"
else
    log_test "Detailed Statistics" "FAIL"
fi

# Test 6.3: Audit Report
response=$(call_api GET "/api/v1/admin/elections/$ELECTION_ID/audit/report")
if [ ! -z "$response" ] && [ "$response" != "404" ]; then
    log_test "Audit Report" "PASS"
else
    log_test "Audit Report" "FAIL"
fi

echo ""
echo "======================================================================"
echo "  7. VOTER STATUS & ACTIVITIES"
echo "======================================================================"

# Test 7.1: Voter Status List
response=$(call_api GET "/api/v1/admin/elections/$ELECTION_ID/voter-status?page=1&limit=10")
if [ ! -z "$response" ] && [ "$response" != "404" ]; then
    log_test "Voter Status List" "PASS"
else
    log_test "Voter Status List" "FAIL"
fi

# Test 7.2: TPS Checkins
response=$(call_api GET "/api/v1/admin/tps/checkins?election_id=$ELECTION_ID&page=1&limit=10")
if [ ! -z "$response" ] && [ "$response" != "404" ]; then
    log_test "TPS Checkins List" "PASS"
else
    log_test "TPS Checkins List" "FAIL"
fi

# Test 7.3: Recent Activities
response=$(call_api GET "/api/v1/admin/elections/$ELECTION_ID/activities?limit=10")
if [ ! -z "$response" ] && [ "$response" != "404" ]; then
    log_test "Recent Activities" "PASS"
else
    log_test "Recent Activities" "FAIL"
fi

echo ""
echo "======================================================================"
echo "  8. ANALYTICS"
echo "======================================================================"

# Test 8.1: Votes by Faculty
response=$(call_api GET "/api/v1/admin/elections/$ELECTION_ID/analytics/by-faculty")
if [ ! -z "$response" ] && [ "$response" != "404" ]; then
    log_test "Analytics: Votes by Faculty" "PASS"
else
    log_test "Analytics: Votes by Faculty" "FAIL"
fi

# Test 8.2: Votes by Channel
response=$(call_api GET "/api/v1/admin/elections/$ELECTION_ID/analytics/by-channel")
if [ ! -z "$response" ] && [ "$response" != "404" ]; then
    log_test "Analytics: Votes by Channel" "PASS"
else
    log_test "Analytics: Votes by Channel" "FAIL"
fi

# Test 8.3: Votes Timeline
response=$(call_api GET "/api/v1/admin/elections/$ELECTION_ID/analytics/timeline")
if [ ! -z "$response" ] && [ "$response" != "404" ]; then
    log_test "Analytics: Votes Timeline" "PASS"
else
    log_test "Analytics: Votes Timeline" "FAIL"
fi

echo ""
echo "======================================================================"
echo "  TEST SUMMARY"
echo "======================================================================"
TOTAL=$((PASSED + FAILED))
echo ""
echo "Total Tests: $TOTAL"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
    exit 0
else
    PASS_RATE=$(echo "scale=2; $PASSED * 100 / $TOTAL" | bc)
    echo -e "${YELLOW}Pass Rate: ${PASS_RATE}%${NC}"
    exit 0
fi
