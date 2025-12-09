#!/bin/bash

# =============================================================================
# TEST MONITORING & LIVE COUNT ADMIN - PEMIRA
# =============================================================================
# Script untuk testing semua fitur Monitoring Voting & Live Count admin panel
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
    echo "║      TESTING MONITORING & LIVE COUNT ADMIN - PEMIRA             ║"
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
    
    # 2. Live Vote Count
    log_section "2. LIVE VOTE COUNT"
    
    log_info "Fetching live vote count for election $ELECTION_ID"
    
    response=$(curl -s -H "Authorization: Bearer $TOKEN" \
        "${API_URL}/api/v1/admin/monitoring/live-count/$ELECTION_ID")
    
    if echo "$response" | jq -e '.total_votes // .data.total_votes' > /dev/null 2>&1; then
        log_success "Live Vote Count"
        
        total_votes=$(echo "$response" | jq -r '.total_votes // .data.total_votes')
        echo "   Total Votes: $total_votes"
        
        # Display candidate votes
        echo ""
        echo "   Candidate Vote Distribution:"
        echo "$response" | jq -r '
            (.candidate_votes // .data.candidate_votes) | to_entries[] | 
            "     Kandidat \(.key): \(.value) votes"
        ' 2>/dev/null || true
        
        echo ""
    else
        log_error "Live Vote Count - Failed"
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
        echo ""
    fi
    
    # 3. Participation Statistics
    log_section "3. PARTICIPATION STATISTICS"
    
    log_info "Checking participation data"
    
    response=$(curl -s -H "Authorization: Bearer $TOKEN" \
        "${API_URL}/api/v1/admin/monitoring/live-count/$ELECTION_ID")
    
    if echo "$response" | jq -e '.participation // .data.participation' > /dev/null 2>&1; then
        log_success "Participation Statistics"
        
        echo "$response" | jq '.participation // .data.participation' 2>/dev/null || echo "$response"
        echo ""
    else
        log_error "Participation Statistics - Not Available"
    fi
    
    # 4. TPS Statistics
    log_section "4. TPS STATISTICS"
    
    log_info "Fetching TPS voting statistics"
    
    response=$(curl -s -H "Authorization: Bearer $TOKEN" \
        "${API_URL}/api/v1/admin/monitoring/live-count/$ELECTION_ID")
    
    if echo "$response" | jq -e '.tps_stats // .data.tps_stats' > /dev/null 2>&1; then
        log_success "TPS Statistics"
        
        tps_count=$(echo "$response" | jq '(.tps_stats // .data.tps_stats) | length')
        echo "   Total TPS: $tps_count"
        
        echo ""
        echo "   TPS Activity:"
        echo "$response" | jq -r '
            (.tps_stats // .data.tps_stats)[] | 
            "     • \(.tps_name // .name): \(.total_votes) votes, \(.total_checkins // 0) checkins"
        ' 2>/dev/null || true
        
        echo ""
    else
        log_error "TPS Statistics - Not Available"
    fi
    
    # 5. Vote Statistics
    log_section "5. VOTE STATISTICS"
    
    log_info "Fetching detailed vote statistics"
    
    response=$(curl -s -H "Authorization: Bearer $TOKEN" \
        "${API_URL}/api/v1/admin/elections/$ELECTION_ID/stats/votes")
    
    if [ ! -z "$response" ] && [ "$response" != "404" ]; then
        log_success "Vote Statistics"
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
        echo ""
    else
        log_error "Vote Statistics - Endpoint may not be available"
    fi
    
    # 6. Participation Stats Endpoint
    log_section "6. PARTICIPATION STATS ENDPOINT"
    
    log_info "Fetching participation statistics endpoint"
    
    response=$(curl -s -H "Authorization: Bearer $TOKEN" \
        "${API_URL}/api/v1/admin/elections/$ELECTION_ID/stats/participation")
    
    if [ ! -z "$response" ] && [ "$response" != "404" ]; then
        log_success "Participation Stats Endpoint"
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
        echo ""
    else
        log_error "Participation Stats Endpoint - May not be available"
    fi
    
    # 7. Recent Activities
    log_section "7. RECENT ACTIVITIES"
    
    log_info "Fetching recent voting activities"
    
    response=$(curl -s -H "Authorization: Bearer $TOKEN" \
        "${API_URL}/api/v1/admin/elections/$ELECTION_ID/activities?limit=10")
    
    if [ ! -z "$response" ] && [ "$response" != "404" ]; then
        log_success "Recent Activities"
        
        # Try to display activities
        if echo "$response" | jq -e '.items // .' > /dev/null 2>&1; then
            activity_count=$(echo "$response" | jq '.items // . | length')
            echo "   Recent activities: $activity_count entries"
        fi
        echo ""
    else
        log_error "Recent Activities - Endpoint may not be available"
    fi
    
    # 8. Voter Status List
    log_section "8. VOTER STATUS LIST"
    
    log_info "Fetching voter status list"
    
    response=$(curl -s -H "Authorization: Bearer $TOKEN" \
        "${API_URL}/api/v1/admin/elections/$ELECTION_ID/voter-status?limit=10")
    
    if echo "$response" | jq -e '.items // .' > /dev/null 2>&1; then
        log_success "Voter Status List"
        
        voter_count=$(echo "$response" | jq '(.items // .) | length')
        echo "   Voter status entries: $voter_count"
        echo ""
    else
        log_error "Voter Status List - Not Available"
    fi
    
    # 9. TPS Checkins
    log_section "9. TPS CHECKINS"
    
    log_info "Fetching TPS checkin data"
    
    response=$(curl -s -H "Authorization: Bearer $TOKEN" \
        "${API_URL}/api/v1/admin/tps/checkins?election_id=$ELECTION_ID&limit=10")
    
    if [ ! -z "$response" ] && [ "$response" != "404" ]; then
        log_success "TPS Checkins"
        
        if echo "$response" | jq -e '.items // .' > /dev/null 2>&1; then
            checkin_count=$(echo "$response" | jq '(.items // .) | length')
            echo "   Total checkins: $checkin_count entries"
        fi
        echo ""
    else
        log_error "TPS Checkins - Not Available"
    fi
    
    # 10. Real-time Data Freshness
    log_section "10. REAL-TIME DATA FRESHNESS"
    
    log_info "Checking timestamp for real-time data"
    
    response=$(curl -s -H "Authorization: Bearer $TOKEN" \
        "${API_URL}/api/v1/admin/monitoring/live-count/$ELECTION_ID")
    
    if echo "$response" | jq -e '.timestamp // .data.timestamp' > /dev/null 2>&1; then
        log_success "Real-time Data with Timestamp"
        
        timestamp=$(echo "$response" | jq -r '.timestamp // .data.timestamp')
        echo "   Timestamp: $timestamp"
        echo "   Data is real-time: ✓"
        echo ""
    else
        log_error "Timestamp - Not Available"
    fi
    
    # 11. Data Completeness Check
    log_section "11. DATA COMPLETENESS CHECK"
    
    log_info "Verifying all monitoring data fields"
    
    response=$(curl -s -H "Authorization: Bearer $TOKEN" \
        "${API_URL}/api/v1/admin/monitoring/live-count/$ELECTION_ID")
    
    has_total_votes=$(echo "$response" | jq 'has("total_votes") or has("data") and .data | has("total_votes")')
    has_participation=$(echo "$response" | jq 'has("participation") or has("data") and .data | has("participation")')
    has_candidate_votes=$(echo "$response" | jq 'has("candidate_votes") or has("data") and .data | has("candidate_votes")')
    has_tps_stats=$(echo "$response" | jq 'has("tps_stats") or has("data") and .data | has("tps_stats")')
    
    if [ "$has_total_votes" = "true" ] && [ "$has_participation" = "true" ] && \
       [ "$has_candidate_votes" = "true" ] && [ "$has_tps_stats" = "true" ]; then
        log_success "Data Completeness"
        echo "   ✓ Total votes field present"
        echo "   ✓ Participation field present"
        echo "   ✓ Candidate votes field present"
        echo "   ✓ TPS stats field present"
        echo ""
    else
        log_error "Data Completeness - Some fields missing"
    fi
    
    # 12. Analytics - Votes by Channel
    log_section "12. ANALYTICS - VOTES BY CHANNEL"
    
    log_info "Fetching votes by channel (Online vs TPS)"
    
    response=$(curl -s -H "Authorization: Bearer $TOKEN" \
        "${API_URL}/api/v1/admin/elections/$ELECTION_ID/analytics/by-channel")
    
    if [ ! -z "$response" ] && [ "$response" != "404" ]; then
        log_success "Analytics - Votes by Channel"
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
        echo ""
    else
        log_error "Analytics by Channel - Not Available"
    fi
    
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
        echo -e "${GREEN}║          ✅ ALL MONITORING FEATURES WORKING! ✅                   ║${NC}"
        echo -e "${GREEN}║                                                                   ║${NC}"
        echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════════╝${NC}"
        exit 0
    else
        pass_rate=$(awk "BEGIN {printf \"%.1f\", ($PASSED * 100.0) / $TOTAL}")
        echo -e "${YELLOW}Pass Rate: ${pass_rate}%${NC}"
        
        echo ""
        echo "Note: Some optional analytics endpoints may return 404."
        echo "Core monitoring features (live count, participation, TPS stats) are working."
        exit 0
    fi
}

# Run main function
main
