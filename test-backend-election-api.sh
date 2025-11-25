#!/bin/bash

echo "================================================"
echo "🧪 Testing Backend Election API"
echo "================================================"
echo ""

API_URL="http://localhost:8080/api/v1/elections/current"
CURRENT_DATE=$(date -u +"%Y-%m-%dT%H:%M:%S")

echo "📍 Endpoint: $API_URL"
echo "📅 Current Time: $CURRENT_DATE"
echo ""

# Test 1: Full response
echo "1️⃣  Fetching current election..."
RESPONSE=$(curl -s -m 5 $API_URL 2>/dev/null)

if [ -z "$RESPONSE" ] || [ "$RESPONSE" == "" ]; then
    echo "❌ FAILED: No response from backend"
    echo ""
    echo "Possible causes:"
    echo "  1. Backend server is not running"
    echo "  2. Backend is not listening on port 8080"
    echo "  3. Endpoint path is different"
    echo ""
    echo "Please start backend server first, then run this test again."
    exit 1
fi

echo "✅ Response received"
echo ""

# Test 2: Check status
echo "2️⃣  Checking status field..."
STATUS=$(echo $RESPONSE | jq -r '.status')
echo "   Current status: $STATUS"

if [ "$STATUS" == "VOTING_OPEN" ]; then
    echo "   ❌ WRONG: Status should be REGISTRATION (25 Nov = Pendaftaran period)"
else
    echo "   ✅ CORRECT"
fi
echo ""

# Test 3: Check voting dates
echo "3️⃣  Checking voting dates..."
VOTING_START=$(echo $RESPONSE | jq -r '.voting_start_at')
VOTING_END=$(echo $RESPONSE | jq -r '.voting_end_at')

echo "   voting_start_at: $VOTING_START"
echo "   voting_end_at: $VOTING_END"

if [[ "$VOTING_START" == *"2025-12-15"* ]]; then
    echo "   ✅ voting_start_at is correct (15 Dec 2025)"
else
    echo "   ❌ voting_start_at should be 2025-12-15T08:00:00+07:00"
fi

if [[ "$VOTING_END" == *"2025-12-17"* ]]; then
    echo "   ✅ voting_end_at is correct (17 Dec 2025)"
else
    echo "   ❌ voting_end_at should be 2025-12-17T23:59:59+07:00"
fi
echo ""

# Test 4: Check phases
echo "4️⃣  Checking phases array..."
HAS_PHASES=$(echo $RESPONSE | jq 'has("phases")')
PHASE_COUNT=$(echo $RESPONSE | jq '.phases | length // 0')

echo "   Has phases field: $HAS_PHASES"
echo "   Number of phases: $PHASE_COUNT"

if [ "$HAS_PHASES" == "true" ] && [ "$PHASE_COUNT" -ge 5 ]; then
    echo "   ✅ Phases are present"
    echo ""
    echo "   📋 Phases list:"
    echo $RESPONSE | jq -r '.phases[] | "      - \(.phase): \(.start_at) to \(.end_at)"'
else
    echo "   ❌ FAILED: Phases array missing or incomplete"
    echo "   Expected at least 5 phases (Pendaftaran, Verifikasi, Kampanye, Masa Tenang, Voting)"
fi
echo ""

# Summary
echo "================================================"
echo "📊 TEST SUMMARY"
echo "================================================"

ERRORS=0

if [ "$STATUS" == "VOTING_OPEN" ]; then
    echo "❌ Status incorrect (should be REGISTRATION)"
    ERRORS=$((ERRORS + 1))
fi

if [[ "$VOTING_START" != *"2025-12-15"* ]]; then
    echo "❌ voting_start_at incorrect"
    ERRORS=$((ERRORS + 1))
fi

if [[ "$VOTING_END" != *"2025-12-17"* ]]; then
    echo "❌ voting_end_at incorrect"
    ERRORS=$((ERRORS + 1))
fi

if [ "$HAS_PHASES" != "true" ] || [ "$PHASE_COUNT" -lt 5 ]; then
    echo "❌ Phases missing or incomplete"
    ERRORS=$((ERRORS + 1))
fi

echo ""
if [ $ERRORS -eq 0 ]; then
    echo "✅ ALL TESTS PASSED!"
    echo "Frontend will now display correct countdown and status."
else
    echo "❌ FAILED: $ERRORS error(s) found"
    echo ""
    echo "📝 Action Required:"
    echo "   1. Implement buildGeneralInfoResponse with phases"
    echo "   2. Calculate status from current date vs phases timeline"
    echo "   3. Update database: voting_start_at = 2025-12-15, voting_end_at = 2025-12-17"
    echo ""
    echo "📖 See BACKEND_ELECTION_API_FIX.md for details"
fi

echo "================================================"
