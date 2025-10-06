#!/bin/bash

# Load Testing Script for Phase 1 Microservices
# Creates test data and measures performance under load

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
PROJECT_ID="jsqzkaarpfowgmijcwaw"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzcXprYWFycGZvd2dtaWpjd2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMTE2NjEsImV4cCI6MjA3NDY4NzY2MX0.Wmx2DQY5sNMlzMqnkTAftfdkIUFkm_w577fy-4nPXWY"
BASE_URL="https://${PROJECT_ID}.supabase.co/functions/v1"
ORG_ID="d2b00bd4-7266-4942-b4c8-a5cfcb448daf"

# Test parameters
NUM_RECORDS=50
CONCURRENT_REQUESTS=10

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        Phase 1 Microservices Load Testing                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}Configuration:${NC}"
echo -e "  • Records to create: ${NUM_RECORDS} per service"
echo -e "  • Concurrent requests: ${CONCURRENT_REQUESTS}"
echo ""

# Function to create test records
create_test_records() {
  local service=$1
  local endpoint=$2
  local data_template=$3
  local description=$4
  
  echo -e "${YELLOW}Creating ${NUM_RECORDS} ${description}...${NC}"
  
  local start_time=$(date +%s%N)
  local success_count=0
  local fail_count=0
  
  for i in $(seq 1 $NUM_RECORDS); do
    # Replace placeholders in template
    local data=$(echo "$data_template" | sed "s/{{INDEX}}/$i/g" | sed "s/{{ORG_ID}}/$ORG_ID/g")
    
    response=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/${service}${endpoint}" \
      -H "Authorization: Bearer $ANON_KEY" \
      -H "Content-Type: application/json" \
      -H "x-organization-id: $ORG_ID" \
      -d "$data")
    
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
      success_count=$((success_count + 1))
      echo -ne "\r  Progress: ${success_count}/${NUM_RECORDS} "
    else
      fail_count=$((fail_count + 1))
    fi
  done
  
  local end_time=$(date +%s%N)
  local total_duration=$(( (end_time - start_time) / 1000000 ))
  local avg_duration=$(( total_duration / NUM_RECORDS ))
  
  echo ""
  if [ $fail_count -eq 0 ]; then
    echo -e "  ${GREEN}✅ Created ${success_count}/${NUM_RECORDS} records${NC}"
  else
    echo -e "  ${YELLOW}⚠️  Created ${success_count}/${NUM_RECORDS} records (${fail_count} failed)${NC}"
  fi
  echo -e "  ${CYAN}⏱️  Total time: ${total_duration}ms | Avg: ${avg_duration}ms/record${NC}"
  echo ""
}

# Function to test concurrent reads
test_concurrent_reads() {
  local service=$1
  local endpoint=$2
  local description=$3
  
  echo -e "${YELLOW}Testing ${CONCURRENT_REQUESTS} concurrent reads for ${description}...${NC}"
  
  local start_time=$(date +%s%N)
  local pids=()
  
  # Launch concurrent requests
  for i in $(seq 1 $CONCURRENT_REQUESTS); do
    curl -s "${BASE_URL}/${service}${endpoint}" \
      -H "Authorization: Bearer $ANON_KEY" \
      -H "Content-Type: application/json" \
      -H "x-organization-id: $ORG_ID" \
      > /dev/null &
    pids+=($!)
  done
  
  # Wait for all requests to complete
  for pid in "${pids[@]}"; do
    wait $pid
  done
  
  local end_time=$(date +%s%N)
  local total_duration=$(( (end_time - start_time) / 1000000 ))
  local avg_duration=$(( total_duration / CONCURRENT_REQUESTS ))
  
  echo -e "  ${GREEN}✅ Completed ${CONCURRENT_REQUESTS} concurrent requests${NC}"
  echo -e "  ${CYAN}⏱️  Total time: ${total_duration}ms | Avg: ${avg_duration}ms/request${NC}"
  echo ""
}

# ═══════════════════════════════════════════════════════════
# JOB PLANS SERVICE LOAD TEST
# ═══════════════════════════════════════════════════════════
echo -e "${BLUE}━━━ Job Plans Service Load Test ━━━${NC}"
echo ""

JOB_PLAN_TEMPLATE='{
  "job_plan_number": "JP-LOAD-{{INDEX}}",
  "title": "Load Test Job Plan {{INDEX}}",
  "description": "Automated load test record",
  "job_type": "preventive",
  "status": "draft",
  "organization_id": "{{ORG_ID}}"
}'

create_test_records "job-plans-service" "/job-plans" "$JOB_PLAN_TEMPLATE" "job plans"
test_concurrent_reads "job-plans-service" "/job-plans" "job plans"

# ═══════════════════════════════════════════════════════════
# PM SCHEDULES SERVICE LOAD TEST
# ═══════════════════════════════════════════════════════════
echo -e "${BLUE}━━━ PM Schedules Service Load Test ━━━${NC}"
echo ""

test_concurrent_reads "pm-schedules-service" "/pm-schedules" "PM schedules"

# ═══════════════════════════════════════════════════════════
# ROUTES SERVICE LOAD TEST
# ═══════════════════════════════════════════════════════════
echo -e "${BLUE}━━━ Routes Service Load Test ━━━${NC}"
echo ""

test_concurrent_reads "routes-service" "/routes" "maintenance routes"

# ═══════════════════════════════════════════════════════════
# METERS SERVICE LOAD TEST
# ═══════════════════════════════════════════════════════════
echo -e "${BLUE}━━━ Meters Service Load Test ━━━${NC}"
echo ""

test_concurrent_reads "meters-service" "/meter-groups" "meter groups"
test_concurrent_reads "meters-service" "/meters" "meters"

# ═══════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                   Load Test Complete                       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✅ Load testing completed successfully${NC}"
echo -e "${CYAN}💡 Performance target: < 2000ms average response time${NC}"
echo ""
