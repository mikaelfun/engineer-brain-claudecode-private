#!/usr/bin/env bash
# resolve-run-path.sh — 从 state.json 解析当前 runId，返回 run 目录下的文件路径
#
# 用法:
#   EP_PATH=$(bash resolve-run-path.sh <caseDir> execution-plan.json)
#   DR_PATH=$(bash resolve-run-path.sh <caseDir> output/data-refresh.json)
#   LOG_DIR=$(bash resolve-run-path.sh <caseDir> scripts)
#
# 逻辑:
#   1. 读 <caseDir>/.casework/state.json → runId
#   2. 如有 runId → 返回 .casework/runs/{runId}/{file}
#   3. 无 runId → 返回 .casework/{file} (fallback)

CASE_DIR="${1:?usage: resolve-run-path.sh <caseDir> <relative-path>}"
REL_PATH="${2:?usage: resolve-run-path.sh <caseDir> <relative-path>}"

STATE_FILE="$CASE_DIR/.casework/state.json"

RUN_ID=$(python3 -c "
import json
try:
    s = json.load(open(r'$STATE_FILE', encoding='utf-8'))
    print(s.get('runId', ''))
except: print('')
" 2>/dev/null || echo "")

if [ -n "$RUN_ID" ]; then
  echo "$CASE_DIR/.casework/runs/$RUN_ID/$REL_PATH"
else
  echo "$CASE_DIR/.casework/$REL_PATH"
fi
