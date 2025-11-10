#!/bin/bash

# Phase 1 Microservices API Testing Script
# Tests Job Plans, PM Schedules, Routes, and Meters services

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Supabase configuration
PROJECT_ID="hpxbcaynhelqktyeoqal"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhweGJjYXluaGVscWt0eWVvcWFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MzQxMzEsImV4cCI6MjA3NjAxMDEzMX0.fKYvL4U0tp2M216dOAPSRyLp-AqdiFyrY6gTDkV0K2M"
BASE_URL="https://${PROJECT_ID}.supabase.co/functions/v1"

# Test results counters
PASSED=0
FAILED=0
TOTAL=0

# Test organization ID (you'll need to replace this with a valid org ID)
ORG_ID="d2b00bd4-7266-4942-b4c8-a5cfcb448daf"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    Phase 1 Microservices Comprehensive API Testing        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to make API request and validate response
test_endpoint() {
  local service=$1
  local method=$2
  local endpoint=$3
  local data=$4
  local description=$5
  
  TOTAL=$((TOTAL + 1))
  echo -ne "${YELLOW}[TEST $TOTAL]${NC} $description... "
  
  local url="${BASE_URL}/${service}${endpoint}"
  local start_time=$(date +%s%N)
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" -X GET "$url" \
      -H "Authorization: Bearer $ANON_KEY" \
      -H "Content-Type: application/json" \
      -H "x-organization-id: $ORG_ID")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" \
      -H "Authorization: Bearer $ANON_KEY" \
      -H "Content-Type: application/json" \
      -H "x-organization-id: $ORG_ID" \
      -d "$data")
  fi
  
  local end_time=$(date +%s%N)
  local duration=$(( (end_time - start_time) / 1000000 ))
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    # Validate JSON response
    if echo "$body" | jq empty 2>/dev/null; then
      echo -e "${GREEN}✅ PASS${NC} (${duration}ms, HTTP $http_code)"
      PASSED=$((PASSED + 1))
      return 0
    else
      echo -e "${RED}❌ FAIL${NC} (Invalid JSON)"
      FAILED=$((FAILED + 1))
      return 1
    fi
  else
    echo -e "${RED}❌ FAIL${NC} (HTTP $http_code)"
    echo -e "   ${RED}Response: $body${NC}"
    FAILED=$((FAILED + 1))
    return 1
  fi
}

# ═══════════════════════════════════════════════════════════
# JOB PLANS SERVICE TESTS
# ═══════════════════════════════════════════════════════════
echo -e "\n${BLUE}━━━ Job Plans Service Tests ━━━${NC}"

test_endpoint "job-plans-service" "GET" "/health" "" "Health check"
test_endpoint "job-plans-service" "GET" "/job-plans" "" "List all job plans"
test_endpoint "job-plans-service" "GET" "/job-plans/stats" "" "Get job plan statistics"

# Create a test job plan
JOB_PLAN_DATA='{
  "job_plan_number": "JP-TEST-001",
  "title": "Test Job Plan",
  "description": "Automated test job plan",
  "job_type": "preventive",
  "status": "draft",
  "organization_id": "'$ORG_ID'"
}'

if test_endpoint "job-plans-service" "POST" "/job-plans" "$JOB_PLAN_DATA" "Create job plan"; then
  JOB_PLAN_ID=$(echo "$body" | jq -r '.id')
  
  if [ "$JOB_PLAN_ID" != "null" ] && [ -n "$JOB_PLAN_ID" ]; then
    test_endpoint "job-plans-service" "GET" "/job-plans/$JOB_PLAN_ID" "" "Get job plan by ID"
    
    # Test task operations
    TASK_DATA='{
      "job_plan_id": "'$JOB_PLAN_ID'",
      "task_title": "Test Task",
      "task_description": "Automated test task",
      "task_sequence": 1,
      "organization_id": "'$ORG_ID'"
    }'
    
    if test_endpoint "job-plans-service" "POST" "/tasks" "$TASK_DATA" "Create task"; then
      TASK_ID=$(echo "$body" | jq -r '.id')
      
      UPDATE_TASK_DATA='{
        "id": "'$TASK_ID'",
        "task_title": "Updated Test Task"
      }'
      test_endpoint "job-plans-service" "PUT" "/tasks/$TASK_ID" "$UPDATE_TASK_DATA" "Update task"
      test_endpoint "job-plans-service" "DELETE" "/tasks/$TASK_ID" "" "Delete task"
    fi
    
    # Test part operations
    PART_DATA='{
      "job_plan_id": "'$JOB_PLAN_ID'",
      "part_name": "Test Part",
      "quantity_required": 5,
      "organization_id": "'$ORG_ID'"
    }'
    
    if test_endpoint "job-plans-service" "POST" "/parts" "$PART_DATA" "Create part"; then
      PART_ID=$(echo "$body" | jq -r '.id')
      test_endpoint "job-plans-service" "DELETE" "/parts/$PART_ID" "" "Delete part"
    fi
    
    # Test tool operations
    TOOL_DATA='{
      "job_plan_id": "'$JOB_PLAN_ID'",
      "tool_name": "Test Tool",
      "quantity_required": 2,
      "organization_id": "'$ORG_ID'"
    }'
    
    if test_endpoint "job-plans-service" "POST" "/tools" "$TOOL_DATA" "Create tool"; then
      TOOL_ID=$(echo "$body" | jq -r '.id')
      test_endpoint "job-plans-service" "DELETE" "/tools/$TOOL_ID" "" "Delete tool"
    fi
    
    # Update and delete job plan
    UPDATE_JOB_PLAN_DATA='{
      "id": "'$JOB_PLAN_ID'",
      "title": "Updated Test Job Plan"
    }'
    test_endpoint "job-plans-service" "PUT" "/job-plans/$JOB_PLAN_ID" "$UPDATE_JOB_PLAN_DATA" "Update job plan"
    test_endpoint "job-plans-service" "DELETE" "/job-plans/$JOB_PLAN_ID" "" "Delete job plan"
  fi
fi

# ═══════════════════════════════════════════════════════════
# PM SCHEDULES SERVICE TESTS
# ═══════════════════════════════════════════════════════════
echo -e "\n${BLUE}━━━ PM Schedules Service Tests ━━━${NC}"

test_endpoint "pm-schedules-service" "GET" "/health" "" "Health check"
test_endpoint "pm-schedules-service" "GET" "/pm-schedules" "" "List all PM schedules"
test_endpoint "pm-schedules-service" "GET" "/pm-schedules/stats" "" "Get PM schedule statistics"

# ═══════════════════════════════════════════════════════════
# ROUTES SERVICE TESTS
# ═══════════════════════════════════════════════════════════
echo -e "\n${BLUE}━━━ Routes Service Tests ━━━${NC}"

test_endpoint "routes-service" "GET" "/health" "" "Health check"
test_endpoint "routes-service" "GET" "/routes" "" "List all routes"
test_endpoint "routes-service" "GET" "/routes/stats" "" "Get route statistics"

# ═══════════════════════════════════════════════════════════
# METERS SERVICE TESTS
# ═══════════════════════════════════════════════════════════
echo -e "\n${BLUE}━━━ Meters Service Tests ━━━${NC}"

test_endpoint "meters-service" "GET" "/health" "" "Health check"
test_endpoint "meters-service" "GET" "/meter-groups" "" "List all meter groups"
test_endpoint "meters-service" "GET" "/meters" "" "List all meters"

# ═══════════════════════════════════════════════════════════
# RESULTS SUMMARY
# ═══════════════════════════════════════════════════════════
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                     Test Results Summary                   ║${NC}"
echo -e "${BLUE}╠════════════════════════════════════════════════════════════╣${NC}"
echo -e "${BLUE}║${NC}  Total Tests:  ${TOTAL}"
echo -e "${BLUE}║${NC}  ${GREEN}Passed:      ${PASSED}${NC}"
echo -e "${BLUE}║${NC}  ${RED}Failed:      ${FAILED}${NC}"
echo -e "${BLUE}║${NC}  Success Rate: $(awk "BEGIN {printf \"%.1f%%\", ($PASSED/$TOTAL)*100}")"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Exit with error code if any tests failed
if [ $FAILED -gt 0 ]; then
  exit 1
else
  echo -e "${GREEN}🎉 All tests passed!${NC}"
  exit 0
fi
