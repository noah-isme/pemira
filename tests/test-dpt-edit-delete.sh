#!/bin/bash

# Test script for new DPT Edit & Delete features

API_URL="http://localhost:8080"
ELECTION_ID="1"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "================================================"
echo "TEST DPT EDIT & DELETE FEATURES"
echo "================================================"
echo ""

# Login admin
echo -e "${BLUE}1. Login as admin...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}' \
  "${API_URL}/api/v1/auth/login")

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token // .data.access_token')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo -e "${RED}❌ Login failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Login successful${NC}"
echo ""

# Get list of voters
echo -e "${BLUE}2. Get list of voters...${NC}"
VOTERS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
  "${API_URL}/api/v1/admin/elections/${ELECTION_ID}/voters?limit=5")

VOTER_ID=$(echo "$VOTERS_RESPONSE" | jq -r '.items[0].voter_id')
VOTER_NIM=$(echo "$VOTERS_RESPONSE" | jq -r '.items[0].nim')
VOTER_NAME=$(echo "$VOTERS_RESPONSE" | jq -r '.items[0].name')

if [ -z "$VOTER_ID" ] || [ "$VOTER_ID" = "null" ]; then
    echo -e "${RED}❌ No voters found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found voter:${NC}"
echo "   ID: $VOTER_ID"
echo "   NIM: $VOTER_NIM"
echo "   Name: $VOTER_NAME"
echo ""

# Test 3: GET single voter
echo -e "${BLUE}3. GET /api/v1/admin/elections/${ELECTION_ID}/voters/${VOTER_ID}${NC}"
GET_RESPONSE=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" \
  "${API_URL}/api/v1/admin/elections/${ELECTION_ID}/voters/${VOTER_ID}")

HTTP_CODE=$(echo "$GET_RESPONSE" | tail -n1)
BODY=$(echo "$GET_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ GET single voter - HTTP $HTTP_CODE${NC}"
    echo "$BODY" | jq '.'
else
    echo -e "${RED}❌ GET single voter - HTTP $HTTP_CODE${NC}"
    echo "$BODY"
fi
echo ""

# Test 4: UPDATE voter (edit)
echo -e "${BLUE}4. PUT /api/v1/admin/elections/${ELECTION_ID}/voters/${VOTER_ID} (Update)${NC}"
UPDATE_PAYLOAD='{
  "name": "'"$VOTER_NAME"' (EDITED)",
  "email": "updated_email@example.com"
}'

UPDATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$UPDATE_PAYLOAD" \
  "${API_URL}/api/v1/admin/elections/${ELECTION_ID}/voters/${VOTER_ID}")

HTTP_CODE=$(echo "$UPDATE_RESPONSE" | tail -n1)
BODY=$(echo "$UPDATE_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ UPDATE voter - HTTP $HTTP_CODE${NC}"
    echo "$BODY" | jq '{nim, name, email}'
else
    echo -e "${RED}❌ UPDATE voter - HTTP $HTTP_CODE${NC}"
    echo "$BODY" | jq '.'
fi
echo ""

# Test 5: UPDATE is_eligible
echo -e "${BLUE}5. PUT voter - Update is_eligible to false${NC}"
ELIGIBILITY_PAYLOAD='{"is_eligible": false}'

ELIG_RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$ELIGIBILITY_PAYLOAD" \
  "${API_URL}/api/v1/admin/elections/${ELECTION_ID}/voters/${VOTER_ID}")

HTTP_CODE=$(echo "$ELIG_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ UPDATE is_eligible - HTTP $HTTP_CODE${NC}"
else
    echo -e "${RED}❌ UPDATE is_eligible - HTTP $HTTP_CODE${NC}"
fi
echo ""

# Test 6: Verify cannot update voter who has voted
echo -e "${BLUE}6. Test: Cannot UPDATE voter who has voted${NC}"
# Find a voter who has voted
VOTED_VOTER=$(curl -s -H "Authorization: Bearer $TOKEN" \
  "${API_URL}/api/v1/admin/elections/${ELECTION_ID}/voters?has_voted=true&limit=1")

VOTED_VOTER_ID=$(echo "$VOTED_VOTER" | jq -r '.items[0].voter_id')

if [ -n "$VOTED_VOTER_ID" ] && [ "$VOTED_VOTER_ID" != "null" ]; then
    TRY_UPDATE=$(curl -s -w "\n%{http_code}" -X PUT \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"name": "Try to change"}' \
      "${API_URL}/api/v1/admin/elections/${ELECTION_ID}/voters/${VOTED_VOTER_ID}")
    
    HTTP_CODE=$(echo "$TRY_UPDATE" | tail -n1)
    BODY=$(echo "$TRY_UPDATE" | head -n-1)
    
    if [ "$HTTP_CODE" = "403" ]; then
        echo -e "${GREEN}✅ Correctly prevented - HTTP $HTTP_CODE${NC}"
        echo "$BODY" | jq '.'
    else
        echo -e "${RED}❌ Should return 403 - HTTP $HTTP_CODE${NC}"
    fi
else
    echo -e "${BLUE}ℹ️  No voted voters to test${NC}"
fi
echo ""

# Test 7: DELETE voter
echo -e "${BLUE}7. DELETE /api/v1/admin/elections/${ELECTION_ID}/voters/${VOTER_ID}${NC}"
DELETE_RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  "${API_URL}/api/v1/admin/elections/${ELECTION_ID}/voters/${VOTER_ID}")

HTTP_CODE=$(echo "$DELETE_RESPONSE" | tail -n1)
BODY=$(echo "$DELETE_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ DELETE voter - HTTP $HTTP_CODE${NC}"
    echo "$BODY" | jq '.'
else
    echo -e "${RED}❌ DELETE voter - HTTP $HTTP_CODE${NC}"
    echo "$BODY" | jq '.'
fi
echo ""

# Test 8: Verify voter is deleted
echo -e "${BLUE}8. Verify voter is deleted (GET should return 404)${NC}"
VERIFY_DELETE=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" \
  "${API_URL}/api/v1/admin/elections/${ELECTION_ID}/voters/${VOTER_ID}")

HTTP_CODE=$(echo "$VERIFY_DELETE" | tail -n1)

if [ "$HTTP_CODE" = "404" ]; then
    echo -e "${GREEN}✅ Voter successfully deleted - HTTP $HTTP_CODE${NC}"
else
    echo -e "${RED}❌ Voter still exists - HTTP $HTTP_CODE${NC}"
fi
echo ""

# Test 9: Cannot delete voted voter
echo -e "${BLUE}9. Test: Cannot DELETE voter who has voted${NC}"
# Find a voter who has voted
VOTED_VOTER=$(curl -s -H "Authorization: Bearer $TOKEN" \
  "${API_URL}/api/v1/admin/elections/${ELECTION_ID}/voters?has_voted=true&limit=1")

VOTED_VOTER_ID=$(echo "$VOTED_VOTER" | jq -r '.items[0].voter_id')

if [ -n "$VOTED_VOTER_ID" ] && [ "$VOTED_VOTER_ID" != "null" ]; then
    TRY_DELETE=$(curl -s -w "\n%{http_code}" -X DELETE \
      -H "Authorization: Bearer $TOKEN" \
      "${API_URL}/api/v1/admin/elections/${ELECTION_ID}/voters/${VOTED_VOTER_ID}")
    
    HTTP_CODE=$(echo "$TRY_DELETE" | tail -n1)
    BODY=$(echo "$TRY_DELETE" | head -n-1)
    
    if [ "$HTTP_CODE" = "403" ]; then
        echo -e "${GREEN}✅ Correctly prevented - HTTP $HTTP_CODE${NC}"
        echo "$BODY" | jq '.'
    else
        echo -e "${RED}❌ Should return 403 - HTTP $HTTP_CODE${NC}"
    fi
else
    echo -e "${BLUE}ℹ️  No voted voters to test${NC}"
fi
echo ""

echo "================================================"
echo "TEST COMPLETED"
echo "================================================"
