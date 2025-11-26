#!/bin/bash

# Voter Profile API v3.1 Test Script
# Tests all profile management endpoints

set -e

echo "=========================================="
echo "Voter Profile API v3.1 - Test Suite"
echo "=========================================="
echo ""

# Configuration
API_BASE="${API_BASE:-http://localhost:8080/api/v1}"
VOTER_TOKEN="${VOTER_TOKEN:-your_voter_token_here}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to test endpoint
test_endpoint() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_code="${5:-200}"
    
    echo -n "Testing: $name ... "
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" \
            -X "$method" \
            -H "Authorization: Bearer $VOTER_TOKEN" \
            -H "Content-Type: application/json" \
            "$API_BASE$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" \
            -X "$method" \
            -H "Authorization: Bearer $VOTER_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_BASE$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_code" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        if [ -n "$body" ]; then
            echo "   Response: $(echo "$body" | jq -c '.' 2>/dev/null || echo "$body")"
        fi
    else
        echo -e "${RED}✗ FAILED${NC} (Expected HTTP $expected_code, got $http_code)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        echo "   Response: $body"
    fi
    echo ""
}

# Check if jq is available
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}Warning: jq not found. Install jq for better JSON formatting.${NC}"
    echo ""
fi

# Check token
if [ "$VOTER_TOKEN" = "your_voter_token_here" ]; then
    echo -e "${YELLOW}Warning: Using default token. Set VOTER_TOKEN environment variable.${NC}"
    echo "Usage: VOTER_TOKEN=<token> ./test-voter-profile.sh"
    echo ""
fi

echo "API Base URL: $API_BASE"
echo "Using Token: ${VOTER_TOKEN:0:20}..."
echo ""
echo "=========================================="
echo "1. Profile Retrieval Tests"
echo "=========================================="
echo ""

# Test 1: Get Complete Profile
test_endpoint \
    "Get Complete Profile" \
    "GET" \
    "/voters/me/complete-profile" \
    "" \
    "200"

# Test 2: Get Participation Stats
test_endpoint \
    "Get Participation Stats" \
    "GET" \
    "/voters/me/participation-stats" \
    "" \
    "200"

echo "=========================================="
echo "2. Profile Update Tests"
echo "=========================================="
echo ""

# Test 3: Update Email Only
test_endpoint \
    "Update Email (Partial)" \
    "PUT" \
    "/voters/me/profile" \
    '{"email":"test@example.com"}' \
    "200"

# Test 4: Update Phone Only
test_endpoint \
    "Update Phone (Partial)" \
    "PUT" \
    "/voters/me/profile" \
    '{"phone":"081234567890"}' \
    "200"

# Test 5: Update Student Identity
test_endpoint \
    "Update Student Identity" \
    "PUT" \
    "/voters/me/profile" \
    '{"faculty_code":"FTI","study_program_code":"IF","cohort_year":2021,"class_label":"IF-A"}' \
    "200"

# Test 6: Update Multiple Fields
test_endpoint \
    "Update Multiple Fields" \
    "PUT" \
    "/voters/me/profile" \
    '{"email":"updated@example.com","phone":"081234567891","faculty_code":"FTI"}' \
    "200"

echo "=========================================="
echo "3. Validation Tests"
echo "=========================================="
echo ""

# Test 7: Invalid Email
test_endpoint \
    "Invalid Email Format" \
    "PUT" \
    "/voters/me/profile" \
    '{"email":"invalid-email"}' \
    "400"

# Test 8: Invalid Phone
test_endpoint \
    "Invalid Phone Format" \
    "PUT" \
    "/voters/me/profile" \
    '{"phone":"123"}' \
    "400"

echo "=========================================="
echo "4. Password Management Tests"
echo "=========================================="
echo ""

# Test 9: Change Password (will likely fail without correct current password)
test_endpoint \
    "Change Password (Invalid Current)" \
    "POST" \
    "/voters/me/change-password" \
    '{"current_password":"wrongpass","new_password":"newpass123","confirm_password":"newpass123"}' \
    "401"

# Test 10: Password Too Short
test_endpoint \
    "Password Too Short" \
    "POST" \
    "/voters/me/change-password" \
    '{"current_password":"current","new_password":"short","confirm_password":"short"}' \
    "400"

# Test 11: Password Mismatch
test_endpoint \
    "Password Confirmation Mismatch" \
    "POST" \
    "/voters/me/change-password" \
    '{"current_password":"current","new_password":"newpass123","confirm_password":"different123"}' \
    "400"

echo "=========================================="
echo "5. Voting Method Tests"
echo "=========================================="
echo ""

# Test 12: Update Voting Method to ONLINE
test_endpoint \
    "Update Voting Method (ONLINE)" \
    "PUT" \
    "/voters/me/voting-method" \
    '{"election_id":1,"preferred_method":"ONLINE"}' \
    "200"

# Test 13: Update Voting Method to TPS
test_endpoint \
    "Update Voting Method (TPS)" \
    "PUT" \
    "/voters/me/voting-method" \
    '{"election_id":1,"preferred_method":"TPS"}' \
    "200"

# Test 14: Invalid Voting Method
test_endpoint \
    "Invalid Voting Method" \
    "PUT" \
    "/voters/me/voting-method" \
    '{"election_id":1,"preferred_method":"INVALID"}' \
    "400"

echo "=========================================="
echo "6. Photo Management Tests"
echo "=========================================="
echo ""

# Test 15: Update Photo URL
test_endpoint \
    "Update Photo URL" \
    "PUT" \
    "/voters/me/profile" \
    '{"photo_url":"https://example.com/photo.jpg"}' \
    "200"

# Test 16: Delete Photo
test_endpoint \
    "Delete Profile Photo" \
    "DELETE" \
    "/voters/me/photo" \
    "" \
    "200"

echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo ""
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo -e "Total Tests:  $((TESTS_PASSED + TESTS_FAILED))"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed.${NC}"
    exit 1
fi
