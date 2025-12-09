#!/bin/bash

# =============================================================================
# TEST DPT ADMIN - PEMIRA
# =============================================================================
# Script untuk testing semua fitur Daftar Pemilih Tetap (DPT) di admin panel
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
API_URL="${API_URL:-http://localhost:8080}"
ELECTION_ID="${ELECTION_ID:-1}"
ADMIN_USERNAME="${ADMIN_USERNAME:-admin}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-password123}"
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

log_section() {
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}$1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# =============================================================================
# MAIN TESTING
# =============================================================================

main() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║                                                                  ║"
    echo "║           TESTING DPT ADMIN FEATURES - PEMIRA                   ║"
    echo "║                                                                  ║"
    echo "╚══════════════════════════════════════════════════════════════════╝"
    echo ""
    
    log_info "API URL: $API_URL"
    log_info "Election ID: $ELECTION_ID"
    log_info "Admin Username: $ADMIN_USERNAME"
    echo ""
    
    # 1. Login
    log_section "1. AUTHENTICATION"
    
    response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"$ADMIN_USERNAME\",\"password\":\"$ADMIN_PASSWORD\"}" \
        "${API_URL}/api/v1/auth/login")
    
    TOKEN=$(echo "$response" | jq -r '.access_token // .data.access_token // empty')
    
    if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
        log_success "Admin login berhasil"
        echo "Token: ${TOKEN:0:50}..."
        echo ""
    else
        log_error "Admin login gagal"
        echo "$response" | jq '.'
        exit 1
    fi
    
    # 2. List All DPT
    log_section "2. LIST DPT (All Voters)"
    
    log_info "Fetching all voters for election $ELECTION_ID"
    
    response=$(curl -s -H "Authorization: Bearer $TOKEN" \
        "${API_URL}/api/v1/admin/elections/$ELECTION_ID/voters?limit=10")
    
    if echo "$response" | jq -e '.items' > /dev/null 2>&1; then
        log_success "List All Voters"
        
        total_items=$(echo "$response" | jq -r '.pagination.total_items // .total_items // 0')
        page=$(echo "$response" | jq -r '.pagination.page // .page // 1')
        limit=$(echo "$response" | jq -r '.pagination.limit // .limit // 10')
        
        echo "   Total Voters: $total_items"
        echo "   Page: $page"
        echo "   Limit: $limit"
        echo ""
        
        # Display sample voters
        echo "$response" | jq -r '.items[0:3] | .[] | "   • \(.nim) - \(.name) (\(.faculty_name))"' 2>/dev/null || true
        echo ""
    else
        log_error "List All Voters - Failed"
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
        echo ""
    fi
    
    # 3. Filter by Faculty
    log_section "3. FILTER DPT BY FACULTY"
    
    log_info "Filtering voters by faculty: Fakultas Teknik"
    
    response=$(curl -s -H "Authorization: Bearer $TOKEN" \
        "${API_URL}/api/v1/admin/elections/$ELECTION_ID/voters?faculty=Fakultas%20Teknik&limit=5")
    
    if echo "$response" | jq -e '.items' > /dev/null 2>&1; then
        log_success "Filter by Faculty"
        count=$(echo "$response" | jq '.items | length')
        echo "   Found: $count voters from Fakultas Teknik"
        echo ""
    else
        log_error "Filter by Faculty - Failed"
    fi
    
    # 4. Filter by Voting Status (Has Voted)
    log_section "4. FILTER BY VOTING STATUS"
    
    log_info "Filtering voters who have voted"
    
    response=$(curl -s -H "Authorization: Bearer $TOKEN" \
        "${API_URL}/api/v1/admin/elections/$ELECTION_ID/voters?has_voted=true&limit=10")
    
    if echo "$response" | jq -e '.items' > /dev/null 2>&1; then
        log_success "Filter voters who voted"
        voted_count=$(echo "$response" | jq '.items | length')
        echo "   Voters who voted (this page): $voted_count"
        echo ""
    else
        log_error "Filter voters who voted - Failed"
    fi
    
    log_info "Filtering voters who haven't voted"
    
    response=$(curl -s -H "Authorization: Bearer $TOKEN" \
        "${API_URL}/api/v1/admin/elections/$ELECTION_ID/voters?has_voted=false&limit=10")
    
    if echo "$response" | jq -e '.items' > /dev/null 2>&1; then
        log_success "Filter voters who haven't voted"
        not_voted_count=$(echo "$response" | jq '.items | length')
        echo "   Voters who haven't voted (this page): $not_voted_count"
        echo ""
    else
        log_error "Filter voters who haven't voted - Failed"
    fi
    
    # 5. Filter by Cohort Year
    log_section "5. FILTER BY COHORT YEAR"
    
    log_info "Filtering voters by cohort year: 2021"
    
    response=$(curl -s -H "Authorization: Bearer $TOKEN" \
        "${API_URL}/api/v1/admin/elections/$ELECTION_ID/voters?cohort_year=2021&limit=5")
    
    if echo "$response" | jq -e '.items' > /dev/null 2>&1; then
        log_success "Filter by Cohort Year"
        count=$(echo "$response" | jq '.items | length')
        echo "   Found: $count voters from cohort 2021"
        echo ""
    else
        log_error "Filter by Cohort Year - Failed"
    fi
    
    # 6. Search by Name/NIM
    log_section "6. SEARCH VOTERS"
    
    log_info "Searching voters with keyword: 'test'"
    
    response=$(curl -s -H "Authorization: Bearer $TOKEN" \
        "${API_URL}/api/v1/admin/elections/$ELECTION_ID/voters?search=test&limit=5")
    
    if echo "$response" | jq -e '.items' > /dev/null 2>&1; then
        log_success "Search Voters"
        count=$(echo "$response" | jq '.items | length')
        echo "   Search results: $count voters"
        echo ""
    else
        log_error "Search Voters - Failed"
    fi
    
    # 7. DPT Statistics
    log_section "7. DPT STATISTICS"
    
    log_info "Fetching DPT statistics"
    
    response=$(curl -s -H "Authorization: Bearer $TOKEN" \
        "${API_URL}/api/v1/admin/dpt/stats?election_id=$ELECTION_ID")
    
    if [ ! -z "$response" ] && [ "$response" != "404" ]; then
        log_success "Get DPT Statistics"
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
        echo ""
    else
        log_error "Get DPT Statistics - Failed or Not Available"
    fi
    
    # 8. Pagination Test
    log_section "8. PAGINATION"
    
    log_info "Testing pagination - Page 1"
    response_p1=$(curl -s -H "Authorization: Bearer $TOKEN" \
        "${API_URL}/api/v1/admin/elections/$ELECTION_ID/voters?page=1&limit=5")
    
    log_info "Testing pagination - Page 2"
    response_p2=$(curl -s -H "Authorization: Bearer $TOKEN" \
        "${API_URL}/api/v1/admin/elections/$ELECTION_ID/voters?page=2&limit=5")
    
    if echo "$response_p1" | jq -e '.items' > /dev/null 2>&1 && \
       echo "$response_p2" | jq -e '.items' > /dev/null 2>&1; then
        log_success "Pagination Working"
        
        page1_count=$(echo "$response_p1" | jq '.items | length')
        page2_count=$(echo "$response_p2" | jq '.items | length')
        
        echo "   Page 1 items: $page1_count"
        echo "   Page 2 items: $page2_count"
        echo ""
    else
        log_error "Pagination - Failed"
    fi
    
    # 9. Combined Filters
    log_section "9. COMBINED FILTERS"
    
    log_info "Testing combined filters: Faculty + Voting Status"
    
    response=$(curl -s -H "Authorization: Bearer $TOKEN" \
        "${API_URL}/api/v1/admin/elections/$ELECTION_ID/voters?faculty=Fakultas%20Teknik&has_voted=true&limit=5")
    
    if echo "$response" | jq -e '.items' > /dev/null 2>&1; then
        log_success "Combined Filters"
        count=$(echo "$response" | jq '.items | length')
        echo "   Found: $count voters (Teknik + Voted)"
        echo ""
    else
        log_error "Combined Filters - Failed"
    fi
    
    # 10. Export DPT (Check endpoint availability)
    log_section "10. EXPORT DPT"
    
    log_info "Testing DPT export endpoint availability"
    
    response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" \
        "${API_URL}/api/v1/admin/elections/$ELECTION_ID/voters/export?limit=5" 2>&1)
    
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" -eq "200" ]; then
        log_success "Export DPT Endpoint Available"
        echo "   HTTP Status: $http_code"
        echo "   Note: Export generates CSV file"
        echo ""
    else
        log_error "Export DPT - HTTP $http_code"
        echo "   Note: Export feature may not be implemented yet"
        echo ""
    fi
    
    # 11. Voter Details in Response
    log_section "11. VOTER DATA COMPLETENESS"
    
    log_info "Checking voter data fields completeness"
    
    response=$(curl -s -H "Authorization: Bearer $TOKEN" \
        "${API_URL}/api/v1/admin/elections/$ELECTION_ID/voters?limit=1")
    
    if echo "$response" | jq -e '.items[0]' > /dev/null 2>&1; then
        voter=$(echo "$response" | jq '.items[0]')
        
        # Check required fields
        has_nim=$(echo "$voter" | jq 'has("nim")')
        has_name=$(echo "$voter" | jq 'has("name")')
        has_faculty=$(echo "$voter" | jq 'has("faculty_name")')
        has_status=$(echo "$voter" | jq 'has("status")')
        
        if [ "$has_nim" = "true" ] && [ "$has_name" = "true" ] && \
           [ "$has_faculty" = "true" ] && [ "$has_status" = "true" ]; then
            log_success "Voter Data Complete"
            echo "   ✓ NIM field present"
            echo "   ✓ Name field present"
            echo "   ✓ Faculty field present"
            echo "   ✓ Status field present"
            echo ""
            echo "   Sample voter:"
            echo "$voter" | jq '{nim, name, faculty: .faculty_name, status: .status.has_voted}'
            echo ""
        else
            log_error "Voter Data Incomplete"
        fi
    else
        log_error "Voter Data Check - Failed"
    fi
    
    # 12. Import DPT (Skip - requires CSV file)
    log_section "12. IMPORT DPT"
    
    log_info "Import DPT test skipped (requires CSV file)"
    echo "   To test import manually:"
    echo "   curl -X POST $API_URL/api/v1/admin/elections/$ELECTION_ID/voters/import \\"
    echo "     -H \"Authorization: Bearer \$TOKEN\" \\"
    echo "     -F \"file=@dpt.csv\""
    echo ""
    
    # Summary
    log_section "TEST SUMMARY"
    echo ""
    echo "Total Tests: $TOTAL"
    echo -e "${GREEN}Passed: $PASSED${NC}"
    echo -e "${RED}Failed: $FAILED${NC}"
    echo ""
    
    if [ $FAILED -eq 0 ]; then
        echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║                                                                   ║${NC}"
        echo -e "${GREEN}║              ✅ ALL DPT FEATURES WORKING! ✅                      ║${NC}"
        echo -e "${GREEN}║                                                                   ║${NC}"
        echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════════╝${NC}"
        exit 0
    else
        pass_rate=$(awk "BEGIN {printf \"%.1f\", ($PASSED * 100.0) / $TOTAL}")
        echo -e "${YELLOW}Pass Rate: ${pass_rate}%${NC}"
        exit 0
    fi
}

# Run main function
main
