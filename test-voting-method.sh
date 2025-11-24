#!/bin/bash

# Test script for voting_method functionality

API_URL="http://localhost:8080"
ELECTION_ID="1"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "================================================"
echo "TEST VOTING METHOD FUNCTIONALITY"
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
    echo "$LOGIN_RESPONSE"
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
    echo "$VOTERS_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✅ Found voter:${NC}"
echo "   ID: $VOTER_ID"
echo "   NIM: $VOTER_NIM"
echo "   Name: $VOTER_NAME"
echo ""

# Test 3: GET single voter - check voting_method field
echo -e "${BLUE}3. GET /api/v1/admin/elections/${ELECTION_ID}/voters/${VOTER_ID} - Check voting_method${NC}"
GET_RESPONSE=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" \
  "${API_URL}/api/v1/admin/elections/${ELECTION_ID}/voters/${VOTER_ID}")

HTTP_CODE=$(echo "$GET_RESPONSE" | tail -n1)
BODY=$(echo "$GET_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ GET single voter - HTTP $HTTP_CODE${NC}"
    VOTING_METHOD=$(echo "$BODY" | jq -r '.voting_method // "NOT_PRESENT"')
    echo -e "   voting_method: ${YELLOW}$VOTING_METHOD${NC}"
    echo "$BODY" | jq '{voter_id, nim, name, voting_method, status}'
else
    echo -e "${RED}❌ GET single voter - HTTP $HTTP_CODE${NC}"
    echo "$BODY"
fi
echo ""

# Test 4: UPDATE voter with voting_method = "online"
echo -e "${BLUE}4. PUT /api/v1/admin/elections/${ELECTION_ID}/voters/${VOTER_ID} - Set voting_method=online${NC}"
UPDATE_PAYLOAD='{
  "voting_method": "online"
}'

echo -e "   Sending payload: $UPDATE_PAYLOAD"

UPDATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$UPDATE_PAYLOAD" \
  "${API_URL}/api/v1/admin/elections/${ELECTION_ID}/voters/${VOTER_ID}")

HTTP_CODE=$(echo "$UPDATE_RESPONSE" | tail -n1)
BODY=$(echo "$UPDATE_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ UPDATE voting_method=online - HTTP $HTTP_CODE${NC}"
    UPDATED_METHOD=$(echo "$BODY" | jq -r '.voting_method // "NOT_PRESENT"')
    STATUS_METHOD=$(echo "$BODY" | jq -r '.status.voting_method // "NOT_PRESENT"')
    LAST_CHANNEL=$(echo "$BODY" | jq -r '.status.last_vote_channel // "NOT_PRESENT"')
    echo -e "   Root voting_method: ${YELLOW}$UPDATED_METHOD${NC}"
    echo -e "   Status voting_method: ${YELLOW}$STATUS_METHOD${NC}"
    echo -e "   Status last_vote_channel: ${YELLOW}$LAST_CHANNEL${NC}"
    
    # GET again to check if data persisted
    echo -e "   ${BLUE}Re-GET to verify persistence...${NC}"
    GET_AGAIN=$(curl -s -H "Authorization: Bearer $TOKEN" \
      "${API_URL}/api/v1/admin/elections/${ELECTION_ID}/voters/${VOTER_ID}")
    
    PERSISTED_ROOT=$(echo "$GET_AGAIN" | jq -r '.voting_method // "NOT_PRESENT"')
    PERSISTED_STATUS=$(echo "$GET_AGAIN" | jq -r '.status.voting_method // "NOT_PRESENT"')
    PERSISTED_CHANNEL=$(echo "$GET_AGAIN" | jq -r '.status.last_vote_channel // "NOT_PRESENT"')
    echo -e "   After re-GET - Root: ${YELLOW}$PERSISTED_ROOT${NC}, Status: ${YELLOW}$PERSISTED_STATUS${NC}, Channel: ${YELLOW}$PERSISTED_CHANNEL${NC}"
    
    echo "$BODY" | jq '{voter_id, nim, name, voting_method, status: {voting_method, last_vote_channel}}'
else
    echo -e "${RED}❌ UPDATE voting_method=online - HTTP $HTTP_CODE${NC}"
    echo "$BODY" | jq '.'
fi
echo ""

# Test 5: UPDATE voter with voting_method = "tps"
echo -e "${BLUE}5. PUT /api/v1/admin/elections/${ELECTION_ID}/voters/${VOTER_ID} - Set voting_method=tps${NC}"
UPDATE_PAYLOAD='{
  "voting_method": "tps"
}'

echo -e "   Sending payload: $UPDATE_PAYLOAD"

UPDATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$UPDATE_PAYLOAD" \
  "${API_URL}/api/v1/admin/elections/${ELECTION_ID}/voters/${VOTER_ID}")

HTTP_CODE=$(echo "$UPDATE_RESPONSE" | tail -n1)
BODY=$(echo "$UPDATE_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ UPDATE voting_method=tps - HTTP $HTTP_CODE${NC}"
    UPDATED_METHOD=$(echo "$BODY" | jq -r '.voting_method // "NOT_PRESENT"')
    STATUS_METHOD=$(echo "$BODY" | jq -r '.status.voting_method // "NOT_PRESENT"')
    LAST_CHANNEL=$(echo "$BODY" | jq -r '.status.last_vote_channel // "NOT_PRESENT"')
    echo -e "   Root voting_method: ${YELLOW}$UPDATED_METHOD${NC}"
    echo -e "   Status voting_method: ${YELLOW}$STATUS_METHOD${NC}"
    echo -e "   Status last_vote_channel: ${YELLOW}$LAST_CHANNEL${NC}"
    echo "$BODY" | jq '{voter_id, nim, name, voting_method, status: {voting_method, last_vote_channel}}'
else
    echo -e "${RED}❌ UPDATE voting_method=tps - HTTP $HTTP_CODE${NC}"
    echo "$BODY" | jq '.'
fi
echo ""

# Test 6: UPDATE voter with voter_type and voting_method together
echo -e "${BLUE}6. PUT /api/v1/admin/elections/${ELECTION_ID}/voters/${VOTER_ID} - Update voter_type + voting_method${NC}"
UPDATE_PAYLOAD='{
  "voter_type": "STAFF",
  "voting_method": "online"
}'

UPDATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$UPDATE_PAYLOAD" \
  "${API_URL}/api/v1/admin/elections/${ELECTION_ID}/voters/${VOTER_ID}")

HTTP_CODE=$(echo "$UPDATE_RESPONSE" | tail -n1)
BODY=$(echo "$UPDATE_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ UPDATE voter_type + voting_method - HTTP $HTTP_CODE${NC}"
    UPDATED_TYPE=$(echo "$BODY" | jq -r '.voter_type // "NOT_PRESENT"')
    UPDATED_METHOD=$(echo "$BODY" | jq -r '.voting_method // "NOT_PRESENT"')
    echo -e "   Updated voter_type: ${YELLOW}$UPDATED_TYPE${NC}"
    echo -e "   Updated voting_method: ${YELLOW}$UPDATED_METHOD${NC}"
    echo "$BODY" | jq '{voter_id, nim, name, voter_type, voting_method}'
else
    echo -e "${RED}❌ UPDATE voter_type + voting_method - HTTP $HTTP_CODE${NC}"
    echo "$BODY" | jq '.'
fi
echo ""

# Test 7: Test invalid voting_method value
echo -e "${BLUE}7. PUT /api/v1/admin/elections/${ELECTION_ID}/voters/${VOTER_ID} - Invalid voting_method${NC}"
UPDATE_PAYLOAD='{
  "voting_method": "invalid_method"
}'

UPDATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$UPDATE_PAYLOAD" \
  "${API_URL}/api/v1/admin/elections/${ELECTION_ID}/voters/${VOTER_ID}")

HTTP_CODE=$(echo "$UPDATE_RESPONSE" | tail -n1)
BODY=$(echo "$UPDATE_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "400" ]; then
    echo -e "${GREEN}✅ Correctly rejected invalid voting_method - HTTP $HTTP_CODE${NC}"
    echo "$BODY" | jq '.'
else
    echo -e "${YELLOW}⚠️  Invalid voting_method response - HTTP $HTTP_CODE${NC}"
    echo "$BODY" | jq '.'
fi
echo ""

# Test 8: Test with voted voter (if available)
echo -e "${BLUE}8. Test voting_method update on voted voter${NC}"
VOTED_VOTER=$(curl -s -H "Authorization: Bearer $TOKEN" \
  "${API_URL}/api/v1/admin/elections/${ELECTION_ID}/voters?has_voted=true&limit=1")

VOTED_VOTER_ID=$(echo "$VOTED_VOTER" | jq -r '.items[0].voter_id')

if [ -n "$VOTED_VOTER_ID" ] && [ "$VOTED_VOTER_ID" != "null" ]; then
    echo -e "   Found voted voter ID: $VOTED_VOTER_ID"

    # Try to update voting_method on voted voter
    UPDATE_PAYLOAD='{"voting_method": "tps"}'
    TRY_UPDATE=$(curl -s -w "\n%{http_code}" -X PUT \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$UPDATE_PAYLOAD" \
      "${API_URL}/api/v1/admin/elections/${ELECTION_ID}/voters/${VOTED_VOTER_ID}")

    HTTP_CODE=$(echo "$TRY_UPDATE" | tail -n1)
    BODY=$(echo "$TRY_UPDATE" | head -n-1)

    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ Successfully updated voting_method on voted voter - HTTP $HTTP_CODE${NC}"
        UPDATED_METHOD=$(echo "$BODY" | jq -r '.voting_method // "NOT_PRESENT"')
        echo -e "   Updated voting_method: ${YELLOW}$UPDATED_METHOD${NC}"
    else
        echo -e "${RED}❌ Failed to update voting_method on voted voter - HTTP $HTTP_CODE${NC}"
        echo "$BODY" | jq '.'
    fi
else
    echo -e "${BLUE}ℹ️  No voted voters to test${NC}"
fi
echo ""

echo "================================================"
echo "VOTING METHOD TEST COMPLETED"
echo "================================================"