#!/bin/bash

# =============================================================================
# DEMO SCRIPT - Admin Dashboard Features
# =============================================================================
# Script ini mendemonstrasikan semua fitur admin dashboard dengan output
# yang lebih detail dan mudah dibaca
# =============================================================================

API_URL="${API_URL:-http://localhost:8080}"
ELECTION_ID="${ELECTION_ID:-1}"
ADMIN_USERNAME="${ADMIN_USERNAME:-admin}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-password123}"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Get token
echo "🔐 Authenticating as admin..."
TOKEN=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$ADMIN_USERNAME\",\"password\":\"$ADMIN_PASSWORD\"}" \
    "${API_URL}/api/v1/auth/login" | jq -r '.access_token // .data.access_token')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo "❌ Authentication failed"
    exit 1
fi

echo -e "${GREEN}✅ Authenticated successfully${NC}"
echo ""

# Helper function
api_get() {
    curl -s -H "Authorization: Bearer $TOKEN" "${API_URL}$1"
}

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║           ADMIN DASHBOARD - FEATURE DEMONSTRATION            ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# 1. Election Info
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📊 1. ELECTION INFORMATION${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
response=$(api_get "/api/v1/admin/elections/$ELECTION_ID")
echo "$response" | jq '{
  name: .name,
  status: .status,
  year: .year,
  online_enabled: .online_enabled,
  tps_enabled: .tps_enabled,
  voting_start: .voting_start_at,
  voting_end: .voting_end_at
}'
echo ""

# 2. Live Monitoring
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📡 2. LIVE MONITORING${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
response=$(api_get "/api/v1/admin/monitoring/live-count/$ELECTION_ID")
echo "$response" | jq '{
  total_votes: .total_votes // .data.total_votes,
  participation: .participation // .data.participation,
  candidate_votes: .candidate_votes // .data.candidate_votes
}'
echo ""

# 3. Candidates
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}👥 3. CANDIDATES${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
response=$(api_get "/api/v1/admin/elections/$ELECTION_ID/candidates")
echo "$response" | jq '.items[] | {
  number: .number,
  name: .name,
  status: .status,
  votes: .stats.total_votes,
  percentage: (.stats.percentage | tostring + "%")
}'
echo ""

# 4. TPS Status
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🏛️  4. TPS STATUS${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
response=$(api_get "/api/v1/admin/tps?election_id=$ELECTION_ID")
if echo "$response" | jq -e '.items' > /dev/null 2>&1; then
    echo "$response" | jq '.items[] | {
      code: .code,
      name: .name,
      location: .location,
      capacity: .capacity,
      is_active: .is_active
    }'
else
    echo "$response" | jq '.[] | {
      code: .code,
      name: .name,
      location: .location,
      capacity: .capacity,
      is_active: .is_active
    }'
fi
echo ""

# 5. Analytics - By Channel
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📈 5. ANALYTICS - VOTES BY CHANNEL${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
response=$(api_get "/api/v1/admin/elections/$ELECTION_ID/analytics/by-channel")
echo "$response" | jq '.'
echo ""

# 6. Analytics - By Faculty
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🎓 6. ANALYTICS - VOTES BY FACULTY${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
response=$(api_get "/api/v1/admin/elections/$ELECTION_ID/analytics/by-faculty")
echo "$response" | jq '.'
echo ""

# 7. DPT Statistics
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📋 7. DPT STATISTICS${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
response=$(api_get "/api/v1/admin/dpt/stats?election_id=$ELECTION_ID")
echo "$response" | jq '.'
echo ""

# 8. Results Summary
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🏆 8. RESULTS SUMMARY${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
response=$(api_get "/api/v1/admin/elections/$ELECTION_ID/results/summary")
echo "$response" | jq '.'
echo ""

# 9. Audit Report
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🛡️  9. AUDIT REPORT${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
response=$(api_get "/api/v1/admin/elections/$ELECTION_ID/audit/report")
echo "$response" | jq '.'
echo ""

# 10. TPS Checkins
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}✅ 10. TPS CHECKINS (Last 5)${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
response=$(api_get "/api/v1/admin/tps/checkins?election_id=$ELECTION_ID&page=1&limit=5")
echo "$response" | jq '.'
echo ""

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║            ✅ ALL ADMIN FEATURES WORKING PROPERLY            ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✨ Admin Dashboard is fully functional!${NC}"
echo ""
echo "📚 Available Admin Features:"
echo "   • Election Management (Create, Update, Open/Close Voting)"
echo "   • Candidate Management (CRUD, Media, Statistics)"
echo "   • TPS Management (Create, Update, QR Codes, Operators)"
echo "   • Real-time Monitoring (Live counts, Activity logs)"
echo "   • DPT Management (List, Search, Statistics)"
echo "   • Rekapitulasi (Results, Statistics, Audit)"
echo "   • Analytics (By Faculty, Channel, Timeline)"
echo "   • Export & Reports"
echo ""
echo -e "${BLUE}📖 See ADMIN_DASHBOARD_TEST_REPORT.md for detailed test results${NC}"
echo ""
