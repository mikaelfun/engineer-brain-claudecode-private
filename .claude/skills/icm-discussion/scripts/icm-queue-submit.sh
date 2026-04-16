#!/usr/bin/env bash
# icm-queue-submit.sh — 提交 ICM discussion 抓取请求到 queue
# 用法: bash icm-queue-submit.sh <incidentId> <caseDir> <caseNumber> <casesRoot> [patrolDir]
set -uo pipefail

ICM_ID="${1:?Usage: icm-queue-submit.sh <incidentId> <caseDir> <caseNumber> <casesRoot> [patrolDir]}"
CASE_DIR="${2}"
CASE_NUMBER="${3}"
CASES_ROOT="${4}"
PATROL_DIR="${5:-$CASES_ROOT/.patrol}"

QUEUE_DIR="$PATROL_DIR/icm-queue"
mkdir -p "$QUEUE_DIR"

cat > "$QUEUE_DIR/request-${ICM_ID}.json" <<EOF
{"incidentId":"${ICM_ID}","caseDir":"${CASE_DIR}","caseNumber":"${CASE_NUMBER}"}
EOF

echo "ICM_QUEUE_SUBMITTED|${ICM_ID}|${CASE_NUMBER}"
