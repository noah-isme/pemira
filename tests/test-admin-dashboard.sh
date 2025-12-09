#!/bin/bash

# =============================================================================
# TEST ADMIN DASHBOARD - PEMIRA
# =============================================================================
# Script untuk testing semua fitur di halaman dasbor admin
# Menggunakan dokumentasi dari pemira-api
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="${API_URL:-http://localhost:8080}"
ELECTION_ID="${ELECTION_ID:-1}"
ADMIN_USERNAME="${ADMIN_USERNAME:-admin}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-password}"
TOKEN=""

# Test results
PASSED=0
FAILED=0
TOTAL=0

# =============================================================================
# Helper Functions
# =============================================================================

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
    PASSED=$((PASSED + 1))
    TOTAL=$((TOTAL + 1))
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    FAILED=$((FAILED + 1))
    TOTAL=$((TOTAL + 1))
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_section() {
    echo -e "\n${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}  $1${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}\n"
}

test_api() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expect_status=${5:-200}
    
    log_info "Testing: $name"
    
    local response
    local http_code
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            "${API_URL}${endpoint}")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "${API_URL}${endpoint}")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" -eq "$expect_status" ]; then
        log_success "$name - HTTP $http_code"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
        echo ""
        return 0
    else
        log_error "$name - Expected HTTP $expect_status, got $http_code"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
        echo ""
        return 1
    fi
}

# =============================================================================
# 1. AUTHENTICATION
# =============================================================================

test_admin_login() {
    log_section "1. AUTHENTICATION - Admin Login"
    
    local response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"$ADMIN_USERNAME\",\"password\":\"$ADMIN_PASSWORD\"}" \
        "${API_URL}/api/v1/auth/login")
    
    TOKEN=$(echo "$response" | jq -r '.access_token // .data.access_token // empty')
    
    if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
        log_success "Admin login berhasil"
        echo "Token: ${TOKEN:0:50}..."
        echo ""
        return 0
    else
        log_error "Admin login gagal"
        echo "$response" | jq '.'
        exit 1
    fi
}

# =============================================================================
# 2. ELECTION MANAGEMENT
# =============================================================================

test_election_management() {
    log_section "2. ELECTION MANAGEMENT"
    
    # Get election detail
    test_api "Get Election Detail" "GET" "/api/v1/admin/elections/$ELECTION_ID"
    
    # List all elections
    test_api "List All Elections" "GET" "/api/v1/admin/elections?year=2024&page=1&limit=20"
    
    # Update election settings (toggle online/TPS)
    log_info "Testing: Update Election Settings"
    local update_payload='{"online_enabled":true,"tps_enabled":true}'
    test_api "Update Election (Enable Online + TPS)" "PUT" "/api/v1/admin/elections/$ELECTION_ID" "$update_payload"
}

# =============================================================================
# 3. CANDIDATES MANAGEMENT
# =============================================================================

test_candidates_management() {
    log_section "3. CANDIDATES MANAGEMENT"
    
    # List candidates
    test_api "List All Candidates" "GET" "/api/v1/admin/elections/$ELECTION_ID/candidates"
    
    # Get candidate detail (assuming candidate ID 1 exists)
    test_api "Get Candidate Detail" "GET" "/api/v1/admin/candidates/1?election_id=$ELECTION_ID"
}

# =============================================================================
# 4. TPS MANAGEMENT
# =============================================================================

test_tps_management() {
    log_section "4. TPS MANAGEMENT"
    
    # List all TPS
    test_api "List All TPS" "GET" "/api/v1/admin/tps?election_id=$ELECTION_ID"
    
    # Get TPS detail (assuming TPS ID 1 exists)
    test_api "Get TPS Detail" "GET" "/api/v1/admin/tps/1?election_id=$ELECTION_ID"
    
    # Get TPS QR metadata
    test_api "Get TPS QR Metadata" "GET" "/api/v1/admin/tps/1/qr"
    
    # Get TPS operators
    test_api "Get TPS Operators" "GET" "/api/v1/admin/tps/1/operators"
}

# =============================================================================
# 5. DPT (Daftar Pemilih Tetap) MANAGEMENT
# =============================================================================

test_dpt_management() {
    log_section "5. DPT MANAGEMENT"
    
    # List DPT
    test_api "List DPT" "GET" "/api/v1/admin/dpt?election_id=$ELECTION_ID&page=1&limit=20"
    
    # Get DPT statistics
    test_api "Get DPT Statistics" "GET" "/api/v1/admin/dpt/stats?election_id=$ELECTION_ID"
}

# =============================================================================
# 6. MONITORING REALTIME
# =============================================================================

test_monitoring() {
    log_section "6. MONITORING REALTIME"
    
    # Live count monitoring
    test_api "Live Vote Count" "GET" "/api/v1/admin/monitoring/live-count/$ELECTION_ID"
    
    # Get voting statistics
    test_api "Voting Statistics" "GET" "/api/v1/admin/elections/$ELECTION_ID/stats/votes"
    
    # Get participation statistics
    test_api "Participation Statistics" "GET" "/api/v1/admin/elections/$ELECTION_ID/stats/participation"
}

# =============================================================================
# 7. REKAPITULASI & RESULTS
# =============================================================================

test_rekapitulasi() {
    log_section "7. REKAPITULASI & RESULTS"
    
    # Get results summary
    test_api "Get Results Summary" "GET" "/api/v1/admin/elections/$ELECTION_ID/results/summary"
    
    # Get detailed statistics
    test_api "Get Detailed Statistics" "GET" "/api/v1/admin/elections/$ELECTION_ID/results/statistics"
    
    # Get audit report
    test_api "Get Audit Report" "GET" "/api/v1/admin/elections/$ELECTION_ID/audit/report"
}

# =============================================================================
# 8. VOTER STATUS & CHECKINS
# =============================================================================

test_voter_management() {
    log_section "8. VOTER STATUS & CHECKINS"
    
    # Get voter status list
    test_api "List Voter Status" "GET" "/api/v1/admin/elections/$ELECTION_ID/voter-status?page=1&limit=20"
    
    # Get TPS checkins
    test_api "List TPS Checkins" "GET" "/api/v1/admin/tps/checkins?election_id=$ELECTION_ID&page=1&limit=20"
    
    # Get recent activities
    test_api "Recent Activities" "GET" "/api/v1/admin/elections/$ELECTION_ID/activities?limit=10"
}

# =============================================================================
# 9. BRANDING & SETTINGS
# =============================================================================

test_branding_settings() {
    log_section "9. BRANDING & SETTINGS"
    
    # Get branding settings
    test_api "Get Branding Settings" "GET" "/api/v1/admin/branding"
    
    # Get system settings
    test_api "Get System Settings" "GET" "/api/v1/admin/settings"
}

# =============================================================================
# 10. VOTING CONTROL (Open/Close)
# =============================================================================

test_voting_control() {
    log_section "10. VOTING CONTROL"
    
    log_warn "Skipping Open/Close Voting tests (to prevent affecting current voting state)"
    log_info "To test manually:"
    echo "  - Open Voting:  POST /api/v1/admin/elections/$ELECTION_ID/open-voting"
    echo "  - Close Voting: POST /api/v1/admin/elections/$ELECTION_ID/close-voting"
    echo ""
}

# =============================================================================
# 11. ANALYTICS & REPORTS
# =============================================================================

test_analytics() {
    log_section "11. ANALYTICS & REPORTS"
    
    # Get votes by faculty
    test_api "Votes by Faculty" "GET" "/api/v1/admin/elections/$ELECTION_ID/analytics/by-faculty"
    
    # Get votes by channel (Online vs TPS)
    test_api "Votes by Channel" "GET" "/api/v1/admin/elections/$ELECTION_ID/analytics/by-channel"
    
    # Get votes timeline
    test_api "Votes Timeline" "GET" "/api/v1/admin/elections/$ELECTION_ID/analytics/timeline"
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================

main() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════════╗"
    echo "║                                                                   ║"
    echo "║           PEMIRA - ADMIN DASHBOARD TESTING SUITE                 ║"
    echo "║                                                                   ║"
    echo "╚═══════════════════════════════════════════════════════════════════╝"
    echo ""
    
    log_info "API URL: $API_URL"
    log_info "Election ID: $ELECTION_ID"
    log_info "Admin Username: $ADMIN_USERNAME"
    echo ""
    
    # Check if jq is installed
    if ! command -v jq &> /dev/null; then
        log_warn "jq is not installed. JSON output will not be pretty-printed."
        echo "Install jq: sudo apt-get install jq"
        echo ""
    fi
    
    # Run all tests
    test_admin_login
    test_election_management
    test_candidates_management
    test_tps_management
    test_dpt_management
    test_monitoring
    test_rekapitulasi
    test_voter_management
    test_branding_settings
    test_voting_control
    test_analytics
    
    # Summary
    log_section "TEST SUMMARY"
    echo "Total Tests: $TOTAL"
    echo -e "${GREEN}Passed: $PASSED${NC}"
    echo -e "${RED}Failed: $FAILED${NC}"
    echo ""
    
    if [ $FAILED -eq 0 ]; then
        echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║                                                                   ║${NC}"
        echo -e "${GREEN}║                   ✅ ALL TESTS PASSED! ✅                         ║${NC}"
        echo -e "${GREEN}║                                                                   ║${NC}"
        echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════════╝${NC}"
        exit 0
    else
        echo -e "${RED}╔═══════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║                                                                   ║${NC}"
        echo -e "${RED}║                   ❌ SOME TESTS FAILED ❌                         ║${NC}"
        echo -e "${RED}║                                                                   ║${NC}"
        echo -e "${RED}╚═══════════════════════════════════════════════════════════════════╝${NC}"
        exit 1
    fi
}

# Run main function
main
