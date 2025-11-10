#!/bin/bash

# Quick Health Check for All Phase 1 Microservices
# Tests health endpoints and basic connectivity

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_ID="hpxbcaynhelqktyeoqal"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhweGJjYXluaGVscWt0eWVvcWFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MzQxMzEsImV4cCI6MjA3NjAxMDEzMX0.fKYvL4U0tp2M216dOAPSRyLp-AqdiFyrY6gTDkV0K2M"
BASE_URL="https://${PROJECT_ID}.supabase.co/functions/v1"

# Services to check
SERVICES=(
  "job-plans-service"
  "pm-schedules-service"
  "routes-service"
  "meters-service"
)

echo -e "${BLUE}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Phase 1 Microservices Health Check            ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════╝${NC}"
echo ""

ALL_HEALTHY=true

for service in "${SERVICES[@]}"; do
  echo -ne "${YELLOW}Checking ${service}...${NC} "
  
  start_time=$(date +%s%N)
  response=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}/${service}/health" \
    -H "Authorization: Bearer $ANON_KEY" \
    -H "Content-Type: application/json")
  end_time=$(date +%s%N)
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  duration=$(( (end_time - start_time) / 1000000 ))
  
  if [ "$http_code" = "200" ]; then
    # Parse health check response
    status=$(echo "$body" | jq -r '.status' 2>/dev/null)
    db_status=$(echo "$body" | jq -r '.database' 2>/dev/null)
    
    if [ "$status" = "healthy" ]; then
      echo -e "${GREEN}✅ HEALTHY${NC} (${duration}ms)"
      if [ "$db_status" != "null" ] && [ "$db_status" != "connected" ]; then
        echo -e "   ${YELLOW}⚠️  Database: $db_status${NC}"
      fi
    else
      echo -e "${RED}❌ UNHEALTHY${NC} - Status: $status"
      ALL_HEALTHY=false
    fi
  else
    echo -e "${RED}❌ UNREACHABLE${NC} (HTTP $http_code)"
    echo -e "   ${RED}Response: $body${NC}"
    ALL_HEALTHY=false
  fi
done

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ "$ALL_HEALTHY" = true ]; then
  echo -e "${GREEN}✅ All services are healthy!${NC}"
  exit 0
else
  echo -e "${RED}❌ Some services are unhealthy or unreachable${NC}"
  echo -e "${YELLOW}💡 Check edge function logs for details:${NC}"
  echo -e "   https://supabase.com/dashboard/project/${PROJECT_ID}/functions"
  exit 1
fi
