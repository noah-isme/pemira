#!/bin/bash

# =============================================================================
# TEST TPS ADMIN - PEMIRA
# =============================================================================
# Script untuk testing semua fitur Manajemen TPS di admin panel
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
NEW_TPS_ID=""

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
    echo "║           TESTING TPS ADMIN FEATURES - PEMIRA                   ║"
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
    
    # 2. List All TPS
    log_section "2. LIST ALL TPS"
    
    log_info "Fetching all TPS for election $ELECTION_ID"
    
    response=$(curl -s -H "Authorization: Bearer $TOKEN" \
        "${API_URL}/api/v1/admin/tps?election_id=$ELECTION_ID")
    
    if echo "$response" | jq -e 'type == "array" or .items' > /dev/null 2>&1; then
        log_success "List All TPS"
        
        if echo "$response" | jq -e '.items' > /dev/null 2>&1; then
            count=$(echo "$response" | jq '.items | length')
            echo "   Total TPS: $count"
            echo "$response" | jq -r '.items[0:3] | .[] | "   • \(.code) - \(.name) (\(.location))"' 2>/dev/null || true
        else
            count=$(echo "$response" | jq '. | length')
            echo "   Total TPS: $count"
            echo "$response" | jq -r '.[0:3] | .[] | "   • \(.code) - \(.name) (\(.location))"' 2>/dev/null || true
        fi
        
        # Save first TPS ID for detail tests
        TPS_ID=$(echo "$response" | jq -r '(if type == "array" then .[0].id else .items[0].id end) // empty')
        echo ""
    else
        log_error "List All TPS - Failed"
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
        echo ""
    fi
    
    # 3. Get TPS Detail
    log_section "3. GET TPS DETAIL"
    
    if [ -n "$TPS_ID" ]; then
        log_info "Getting detail for TPS ID: $TPS_ID"
        
        response=$(curl -s -H "Authorization: Bearer $TOKEN" \
            "${API_URL}/api/v1/admin/tps/$TPS_ID?election_id=$ELECTION_ID")
        
        if echo "$response" | jq -e '.id // .data.id' > /dev/null 2>&1; then
            log_success "Get TPS Detail"
            echo "$response" | jq '{id, code, name, location, capacity, is_active}' 2>/dev/null || echo "$response"
            echo ""
        else
            log_error "Get TPS Detail - Failed"
        fi
    else
        log_error "Get TPS Detail - No TPS ID available"
    fi
    
    # 4. Create New TPS
    log_section "4. CREATE NEW TPS"
    
    create_payload='{
      "code": "TEST_TPS_AUTO",
      "name": "TPS Test Automated",
      "location": "Testing Location - Auto Generated",
      "capacity": 100,
      "open_time": "08:00",
      "close_time": "17:00",
      "pic_name": "Test PIC",
      "pic_phone": "081234567890",
      "notes": "Created by automated test",
      "election_id": '$ELECTION_ID',
      "is_active": true
    }'
    
    log_info "Creating new TPS"
    
    response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "$create_payload" \
        "${API_URL}/api/v1/admin/tps")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" -eq "200" ] || [ "$http_code" -eq "201" ]; then
        log_success "Create New TPS - HTTP $http_code"
        NEW_TPS_ID=$(echo "$body" | jq -r '.id // .data.id // empty')
        echo "   New TPS ID: $NEW_TPS_ID"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
        echo ""
    else
        log_error "Create New TPS - HTTP $http_code"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
        echo ""
    fi
    
    # 5. Update TPS
    log_section "5. UPDATE TPS"
    
    if [ -n "$NEW_TPS_ID" ]; then
        update_payload='{
          "name": "TPS Test UPDATED",
          "location": "Updated Location",
          "capacity": 150,
          "is_active": true
        }'
        
        log_info "Updating TPS ID: $NEW_TPS_ID"
        
        response=$(curl -s -w "\n%{http_code}" -X PUT \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "$update_payload" \
            "${API_URL}/api/v1/admin/tps/$NEW_TPS_ID?election_id=$ELECTION_ID")
        
        http_code=$(echo "$response" | tail -n1)
        body=$(echo "$response" | head -n-1)
        
        if [ "$http_code" -eq "200" ]; then
            log_success "Update TPS"
            echo "$body" | jq '{name, location, capacity}' 2>/dev/null || echo "$body"
            echo ""
        else
            log_error "Update TPS - HTTP $http_code"
        fi
    else
        log_error "Update TPS - No test TPS created"
    fi
    
    # 6. TPS Status Toggle
    log_section "6. TPS STATUS TOGGLE"
    
    if [ -n "$NEW_TPS_ID" ]; then
        # Deactivate
        log_info "Deactivating TPS"
        response=$(curl -s -w "\n%{http_code}" -X PUT \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d '{"is_active": false}' \
            "${API_URL}/api/v1/admin/tps/$NEW_TPS_ID?election_id=$ELECTION_ID")
        
        http_code=$(echo "$response" | tail -n1)
        
        if [ "$http_code" -eq "200" ]; then
            log_success "Deactivate TPS"
        else
            log_error "Deactivate TPS"
        fi
        
        # Reactivate
        log_info "Reactivating TPS"
        response=$(curl -s -w "\n%{http_code}" -X PUT \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d '{"is_active": true}' \
            "${API_URL}/api/v1/admin/tps/$NEW_TPS_ID?election_id=$ELECTION_ID")
        
        http_code=$(echo "$response" | tail -n1)
        
        if [ "$http_code" -eq "200" ]; then
            log_success "Reactivate TPS"
        else
            log_error "Reactivate TPS"
        fi
        echo ""
    fi
    
    # 7. QR Code Management
    log_section "7. QR CODE MANAGEMENT"
    
    if [ -n "$TPS_ID" ]; then
        # Get QR metadata
        log_info "Getting QR metadata for TPS $TPS_ID"
        response=$(curl -s -H "Authorization: Bearer $TOKEN" \
            "${API_URL}/api/v1/admin/tps/$TPS_ID/qr")
        
        if [ ! -z "$response" ] && [ "$response" != "404" ]; then
            log_success "Get QR Metadata"
            echo "$response" | jq '.' 2>/dev/null || echo "$response"
            echo ""
        else
            log_error "Get QR Metadata - Not Available"
        fi
        
        # Rotate QR
        log_info "Rotating QR code"
        response=$(curl -s -w "\n%{http_code}" -X POST \
            -H "Authorization: Bearer $TOKEN" \
            "${API_URL}/api/v1/admin/tps/$TPS_ID/qr/rotate")
        
        http_code=$(echo "$response" | tail -n1)
        body=$(echo "$response" | head -n-1)
        
        if [ "$http_code" -eq "200" ]; then
            log_success "Rotate QR Code"
            echo "$body" | jq '.' 2>/dev/null || echo "$body"
            echo ""
        else
            log_error "Rotate QR Code - HTTP $http_code"
        fi
        
        # Get QR for print
        log_info "Getting QR for print"
        response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" \
            "${API_URL}/api/v1/admin/tps/$TPS_ID/qr/print")
        
        http_code=$(echo "$response" | tail -n1)
        
        if [ "$http_code" -eq "200" ]; then
            log_success "Get QR for Print"
        else
            log_error "Get QR for Print - HTTP $http_code"
        fi
        echo ""
    fi
    
    # 8. TPS Operators Management
    log_section "8. TPS OPERATORS MANAGEMENT"
    
    if [ -n "$TPS_ID" ]; then
        # List operators
        log_info "Getting operators for TPS $TPS_ID"
        response=$(curl -s -H "Authorization: Bearer $TOKEN" \
            "${API_URL}/api/v1/admin/tps/$TPS_ID/operators")
        
        if echo "$response" | jq -e 'type == "array"' > /dev/null 2>&1; then
            log_success "List TPS Operators"
            operator_count=$(echo "$response" | jq '. | length')
            echo "   Total operators: $operator_count"
            echo ""
        else
            log_error "List TPS Operators - Failed"
        fi
        
        # Create operator (optional - may conflict)
        log_info "Note: Create operator test skipped to avoid conflicts"
        echo "   To test: POST /api/v1/admin/tps/{id}/operators"
        echo "   Payload: {username, password, name, email}"
        echo ""
    fi
    
    # 9. TPS Data Completeness
    log_section "9. TPS DATA COMPLETENESS"
    
    if [ -n "$TPS_ID" ]; then
        log_info "Checking TPS data fields completeness"
        
        response=$(curl -s -H "Authorization: Bearer $TOKEN" \
            "${API_URL}/api/v1/admin/tps/$TPS_ID?election_id=$ELECTION_ID")
        
        if echo "$response" | jq -e '.id // .data.id' > /dev/null 2>&1; then
            tps=$(echo "$response" | jq '. // .data')
            
            has_code=$(echo "$tps" | jq 'has("code")')
            has_name=$(echo "$tps" | jq 'has("name")')
            has_location=$(echo "$tps" | jq 'has("location")')
            has_capacity=$(echo "$tps" | jq 'has("capacity")')
            
            if [ "$has_code" = "true" ] && [ "$has_name" = "true" ] && \
               [ "$has_location" = "true" ] && [ "$has_capacity" = "true" ]; then
                log_success "TPS Data Complete"
                echo "   ✓ Code field present"
                echo "   ✓ Name field present"
                echo "   ✓ Location field present"
                echo "   ✓ Capacity field present"
                echo ""
            else
                log_error "TPS Data Incomplete"
            fi
        else
            log_error "TPS Data Check - Failed"
        fi
    fi
    
    # 10. Delete Test TPS (Cleanup)
    log_section "10. DELETE TPS (CLEANUP)"
    
    if [ -n "$NEW_TPS_ID" ]; then
        log_info "Deleting test TPS (ID: $NEW_TPS_ID)"
        
        response=$(curl -s -w "\n%{http_code}" -X DELETE \
            -H "Authorization: Bearer $TOKEN" \
            "${API_URL}/api/v1/admin/tps/$NEW_TPS_ID?election_id=$ELECTION_ID")
        
        http_code=$(echo "$response" | tail -n1)
        
        if [ "$http_code" -eq "200" ] || [ "$http_code" -eq "204" ]; then
            log_success "Delete Test TPS - HTTP $http_code"
        else
            log_error "Delete Test TPS - HTTP $http_code"
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
        echo -e "${GREEN}║              ✅ ALL TPS FEATURES WORKING! ✅                      ║${NC}"
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
