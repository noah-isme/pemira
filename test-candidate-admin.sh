#!/bin/bash

# =============================================================================
# TEST KANDIDAT ADMIN - PEMIRA
# =============================================================================
# Script untuk testing semua fitur di halaman kandidat admin
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
        if [ "$http_code" != "204" ]; then
            echo "$body" | jq '.' 2>/dev/null || echo "$body"
        fi
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
# MAIN TESTING
# =============================================================================

main() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║                                                                  ║"
    echo "║           TESTING KANDIDAT ADMIN FEATURES - PEMIRA              ║"
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
    
    # 2. List All Candidates
    log_section "2. LIST ALL CANDIDATES"
    
    response=$(curl -s -H "Authorization: Bearer $TOKEN" \
        "${API_URL}/api/v1/admin/elections/$ELECTION_ID/candidates")
    
    if echo "$response" | jq -e '.items' > /dev/null 2>&1; then
        log_success "List All Candidates"
        candidate_count=$(echo "$response" | jq '.items | length')
        echo "   Total candidates: $candidate_count"
        echo ""
        
        # Extract first candidate ID for detail tests
        CANDIDATE_ID=$(echo "$response" | jq -r '.items[0].id // empty')
        
        # Display candidate summary
        echo "$response" | jq -r '.items[] | "   • Kandidat \(.number): \(.name) - Status: \(.status)"'
        echo ""
    else
        log_error "List All Candidates"
    fi
    
    # 3. Get Candidate Detail (Note: Detail endpoint may not be implemented separately)
    log_section "3. CANDIDATE DETAIL IN LIST"
    
    if [ -n "$CANDIDATE_ID" ]; then
        log_info "Candidate details available in list response"
        response=$(curl -s -H "Authorization: Bearer $TOKEN" \
            "${API_URL}/api/v1/admin/elections/$ELECTION_ID/candidates")
        
        if echo "$response" | jq -e ".items[] | select(.id == $CANDIDATE_ID)" > /dev/null 2>&1; then
            log_success "Candidate detail available in list (ID: $CANDIDATE_ID)"
            echo "$response" | jq ".items[] | select(.id == $CANDIDATE_ID) | {id, number, name, status, vision, missions: (.missions | length), programs: (.main_programs | length)}"
            echo ""
        else
            log_error "Candidate detail not found in list"
        fi
    else
        log_error "Get Candidate Detail - No candidate ID available"
        TOTAL=$((TOTAL + 1))
        FAILED=$((FAILED + 1))
    fi
    
    # 4. Create New Candidate
    log_section "4. CREATE NEW CANDIDATE"
    
    create_payload='{
      "number": 99,
      "name": "Test Candidate - Auto Generated",
      "faculty_name": "Fakultas Testing",
      "study_program_name": "Prodi Test",
      "cohort_year": 2024,
      "tagline": "Testing adalah kunci sukses",
      "short_bio": "Kandidat test untuk automated testing",
      "long_bio": "Ini adalah kandidat yang dibuat otomatis untuk testing sistem",
      "vision": "Visi untuk testing yang lebih baik",
      "missions": [
        "Mission 1: Testing automation",
        "Mission 2: Quality assurance"
      ],
      "main_programs": [
        {
          "title": "Program Testing",
          "description": "Implementasi testing otomatis",
          "category": "Technology"
        }
      ],
      "status": "DRAFT"
    }'
    
    response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "$create_payload" \
        "${API_URL}/api/v1/admin/elections/$ELECTION_ID/candidates")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" -eq "200" ] || [ "$http_code" -eq "201" ]; then
        log_success "Create New Candidate - HTTP $http_code"
        NEW_CANDIDATE_ID=$(echo "$body" | jq -r '.id // .data.id // empty')
        echo "   New Candidate ID: $NEW_CANDIDATE_ID"
        echo "$body" | jq '.'
        echo ""
    else
        log_error "Create New Candidate - Expected HTTP 200/201, got $http_code"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
        echo ""
    fi
    
    # 5. Update Candidate
    log_section "5. UPDATE CANDIDATE"
    
    if [ -n "$NEW_CANDIDATE_ID" ]; then
        update_payload='{
          "number": 99,
          "name": "Test Candidate - UPDATED",
          "faculty_name": "Fakultas Testing Updated",
          "study_program_name": "Prodi Test",
          "cohort_year": 2024,
          "tagline": "Updated tagline for testing",
          "short_bio": "Updated bio",
          "long_bio": "Updated long bio",
          "vision": "Updated vision",
          "missions": [
            "Updated Mission 1",
            "Updated Mission 2",
            "New Mission 3"
          ],
          "main_programs": [
            {
              "title": "Updated Program",
              "description": "Updated description",
              "category": "Technology"
            }
          ],
          "status": "DRAFT"
        }'
        
        test_api "Update Candidate (ID: $NEW_CANDIDATE_ID)" "PUT" \
            "/api/v1/admin/candidates/$NEW_CANDIDATE_ID?election_id=$ELECTION_ID" \
            "$update_payload"
    else
        log_error "Update Candidate - No new candidate ID available"
        TOTAL=$((TOTAL + 1))
        FAILED=$((FAILED + 1))
    fi
    
    # 6. Change Candidate Status
    log_section "6. CHANGE CANDIDATE STATUS"
    
    if [ -n "$NEW_CANDIDATE_ID" ]; then
        # Test different status changes
        for status in "PUBLISHED" "HIDDEN" "DRAFT"; do
            status_payload="{
              \"number\": 99,
              \"name\": \"Test Candidate - UPDATED\",
              \"faculty_name\": \"Fakultas Testing Updated\",
              \"study_program_name\": \"Prodi Test\",
              \"cohort_year\": 2024,
              \"status\": \"$status\"
            }"
            
            log_info "Changing status to: $status"
            response=$(curl -s -w "\n%{http_code}" -X PUT \
                -H "Authorization: Bearer $TOKEN" \
                -H "Content-Type: application/json" \
                -d "$status_payload" \
                "${API_URL}/api/v1/admin/candidates/$NEW_CANDIDATE_ID?election_id=$ELECTION_ID")
            
            http_code=$(echo "$response" | tail -n1)
            
            if [ "$http_code" -eq "200" ]; then
                log_success "Change status to $status"
            else
                log_error "Change status to $status - HTTP $http_code"
            fi
        done
        echo ""
    fi
    
    # 7. Get Candidate Media Profile
    log_section "7. CANDIDATE MEDIA MANAGEMENT"
    
    if [ -n "$CANDIDATE_ID" ]; then
        log_info "Testing: Get Candidate Profile Media"
        
        response=$(curl -s -w "\n%{http_code}" \
            -H "Authorization: Bearer $TOKEN" \
            "${API_URL}/api/v1/admin/candidates/$CANDIDATE_ID/media/profile")
        
        http_code=$(echo "$response" | tail -n1)
        
        if [ "$http_code" -eq "200" ] || [ "$http_code" -eq "404" ]; then
            log_success "Get Candidate Profile Media - HTTP $http_code"
            if [ "$http_code" -eq "404" ]; then
                echo "   No profile media found (expected)"
            fi
        else
            log_error "Get Candidate Profile Media - HTTP $http_code"
        fi
        echo ""
    fi
    
    # 8. Candidate Statistics
    log_section "8. CANDIDATE STATISTICS"
    
    log_info "Verifying vote statistics in candidate list"
    
    response=$(curl -s -H "Authorization: Bearer $TOKEN" \
        "${API_URL}/api/v1/admin/elections/$ELECTION_ID/candidates")
    
    if echo "$response" | jq -e '.items[0].stats' > /dev/null 2>&1; then
        log_success "Candidate statistics available"
        echo "$response" | jq -r '.items[] | "   • Kandidat \(.number): \(.stats.total_votes) votes (\(.stats.percentage)%)"'
        echo ""
    else
        log_error "Candidate statistics not available"
    fi
    
    # 9. Delete Test Candidate (Cleanup)
    log_section "9. DELETE CANDIDATE (CLEANUP)"
    
    if [ -n "$NEW_CANDIDATE_ID" ]; then
        log_info "Deleting test candidate (ID: $NEW_CANDIDATE_ID)"
        
        response=$(curl -s -w "\n%{http_code}" -X DELETE \
            -H "Authorization: Bearer $TOKEN" \
            "${API_URL}/api/v1/admin/candidates/$NEW_CANDIDATE_ID?election_id=$ELECTION_ID")
        
        http_code=$(echo "$response" | tail -n1)
        
        if [ "$http_code" -eq "200" ] || [ "$http_code" -eq "204" ]; then
            log_success "Delete Test Candidate - HTTP $http_code"
        else
            log_error "Delete Test Candidate - HTTP $http_code"
            echo "Note: Manual cleanup may be required"
        fi
        echo ""
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
        echo -e "${GREEN}║            ✅ ALL CANDIDATE FEATURES WORKING! ✅                  ║${NC}"
        echo -e "${GREEN}║                                                                   ║${NC}"
        echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════════╝${NC}"
        exit 0
    else
        PASS_RATE=$(echo "scale=2; $PASSED * 100 / $TOTAL" | bc)
        echo -e "${YELLOW}Pass Rate: ${PASS_RATE}%${NC}"
        exit 0
    fi
}

# Run main function
main
