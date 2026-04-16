#!/usr/bin/env bash
# icm-queue-submit.sh — 提交 ICM discussion 抓取请求到 queue
# 用法: bash icm-queue-submit.sh <incidentId> <caseDir> <caseNumber> <casesRoot>
set -uo pipefail

ICM_ID="${1:?Usage: icm-queue-submit.sh <incidentId> <caseDir> <caseNumber> <casesRoot>}"
CASE_DIR="${2}"
CASE_NUMBER="${3}"
CASES_ROOT="${4}"

QUEUE_DIR="$CASES_ROOT/.patrol/icm-queue"
mkdir -p "$QUEUE_DIR"

cat > "$QUEUE_DIR/request-${ICM_ID}.json" <<EOF
{"incidentId":"${ICM_ID}","caseDir":"${CASE_DIR}","caseNumber":"${CASE_NUMBER}"}
EOF

echo "ICM_QUEUE_SUBMITTED|${ICM_ID}|${CASE_NUMBER}"
