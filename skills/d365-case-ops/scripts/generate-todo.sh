#!/usr/bin/env bash
# generate-todo.sh — 规则化 todo 生成（无 LLM）
# 用法: bash generate-todo.sh "{caseDir}"
# 输出: {caseDir}/todo/YYMMDD-HHMM.md
# stdout: TODO_OK|red=N,yellow=N,green=N
set -euo pipefail

CD="$1"
META="$CD/casehealth-meta.json"

if [ ! -f "$META" ]; then
  echo "ERROR|meta not found: $META" >&2
  exit 1
fi

# --- 解析 meta.json（纯 sed，不依赖 jq） ---
ACTUAL_STATUS=$(sed -n 's/.*"actualStatus":[[:space:]]*"\([^"]*\)".*/\1/p' "$META" | head -1)
DAYS=$(sed -n 's/.*"daysSinceLastContact":[[:space:]]*\([0-9]*\).*/\1/p' "$META" | head -1)
DAYS=${DAYS:-0}

# Recalculate days: add calendar-day difference since statusJudgedAt to cached value
JUDGED_AT=$(sed -n 's/.*"statusJudgedAt":[[:space:]]*"\([^"]*\)".*/\1/p' "$META" | head -1)
if [ -n "$JUDGED_AT" ] && [ "$DAYS" -ge 0 ] 2>/dev/null; then
  JUDGED_DATE=$(date -d "$JUDGED_AT" '+%Y-%m-%d' 2>/dev/null || echo "")
  TODAY=$(date '+%Y-%m-%d')
  if [ -n "$JUDGED_DATE" ] && [ "$JUDGED_DATE" != "$TODAY" ]; then
    JUDGED_EPOCH=$(date -d "$JUDGED_DATE" +%s 2>/dev/null || echo "0")
    TODAY_EPOCH=$(date -d "$TODAY" +%s 2>/dev/null || echo "0")
    if [ "$JUDGED_EPOCH" -gt 0 ] 2>/dev/null && [ "$TODAY_EPOCH" -gt 0 ] 2>/dev/null; then
      ELAPSED_DAYS=$(( (TODAY_EPOCH - JUDGED_EPOCH) / 86400 ))
      DAYS=$(( DAYS + ELAPSED_DAYS ))
    fi
  fi
fi

IR_STATUS=$(sed -n 's/.*"irSla".*"status":[[:space:]]*"\([^"]*\)".*/\1/p' "$META" | head -1)
# irSla 可能跨多行，用 awk 做更健壮的提取
if [ -z "$IR_STATUS" ]; then
  IR_STATUS=$(awk '/"irSla"/{f=1} f&&/"status"/{gsub(/.*"status":[[:space:]]*"|".*/,"",$0); print; exit}' "$META")
fi
IR_STATUS=${IR_STATUS:-Unknown}

ENTITLEMENT_OK=$(sed -n 's/.*"entitlementOk":[[:space:]]*\(true\|false\).*/\1/p' "$META" | head -1)
ENTITLEMENT_OK=${ENTITLEMENT_OK:-true}

SERVICE_LEVEL=$(sed -n 's/.*"serviceLevel":[[:space:]]*"\([^"]*\)".*/\1/p' "$META" | head -1)
SERVICE_LEVEL=${SERVICE_LEVEL:-Unknown}

CASE_NUMBER=$(sed -n 's/.*"caseNumber":[[:space:]]*"\([^"]*\)".*/\1/p' "$META" | head -1)
CASE_NUMBER=${CASE_NUMBER:-unknown}

# --- 规则矩阵 ---
RED_ITEMS=()
YELLOW_ITEMS=()
GREEN_ITEMS=()

# 🔴 需人工决策
if [ "$ACTUAL_STATUS" = "new" ] && [ "$IR_STATUS" != "Succeeded" ]; then
  RED_ITEMS+=("IR SLA 未完成（status=$IR_STATUS），需立即处理")
fi
if [ "$ENTITLEMENT_OK" = "false" ]; then
  RED_ITEMS+=("Entitlement 异常，需确认客户合同状态")
fi

# 🟡 待确认执行
if [ "$ACTUAL_STATUS" = "pending-customer" ] && [ "$DAYS" -ge 5 ] 2>/dev/null; then
  YELLOW_ITEMS+=("客户 ${DAYS} 天无回复，已 3 次 follow-up 未回复，考虑关单")
elif [ "$ACTUAL_STATUS" = "pending-customer" ] && [ "$DAYS" -ge 3 ] 2>/dev/null; then
  YELLOW_ITEMS+=("客户 ${DAYS} 天无回复，建议发 follow-up 邮件")
fi
if [ "$ACTUAL_STATUS" = "ready-to-close" ]; then
  YELLOW_ITEMS+=("准备关单，发 closure email")
fi

# ✅ 仅通知
if [ "$IR_STATUS" = "Succeeded" ]; then
  GREEN_ITEMS+=("IR SLA 已完成")
fi
if [ "$ACTUAL_STATUS" = "pending-customer" ] && [ "$DAYS" -lt 3 ] 2>/dev/null; then
  GREEN_ITEMS+=("等待客户回复（${DAYS} 天）")
fi
if [ "$ACTUAL_STATUS" = "pending-pg" ]; then
  GREEN_ITEMS+=("等待 PG 回复")
fi
if [ "$ACTUAL_STATUS" = "researching" ]; then
  GREEN_ITEMS+=("技术排查中")
fi
if [ "$ENTITLEMENT_OK" = "true" ] && [ "$SERVICE_LEVEL" != "Unknown" ]; then
  GREEN_ITEMS+=("Entitlement 合规（${SERVICE_LEVEL}）")
elif [ "$SERVICE_LEVEL" = "Unknown" ]; then
  GREEN_ITEMS+=("Entitlement 未检查（compliance 未运行）")
fi

# --- 生成 todo 文件 ---
TODO_DIR="$CD/todo"
mkdir -p "$TODO_DIR"
TIMESTAMP=$(date '+%y%m%d-%H%M')
TODO_FILE="$TODO_DIR/${TIMESTAMP}.md"
NOW_DISPLAY=$(date '+%Y-%m-%d %H:%M')

{
  echo "# Todo — ${CASE_NUMBER} — ${NOW_DISPLAY}"
  echo ""
  echo "## 🔴 需人工决策"
  echo ""
  if [ ${#RED_ITEMS[@]} -eq 0 ]; then
    echo "（无）"
  else
    for item in "${RED_ITEMS[@]}"; do
      echo "- [ ] $item"
    done
  fi
  echo ""
  echo "## 🟡 待确认执行"
  echo ""
  if [ ${#YELLOW_ITEMS[@]} -eq 0 ]; then
    echo "（无）"
  else
    for item in "${YELLOW_ITEMS[@]}"; do
      echo "- [ ] $item"
    done
  fi
  echo ""
  echo "## ✅ 仅通知"
  echo ""
  if [ ${#GREEN_ITEMS[@]} -eq 0 ]; then
    echo "（无）"
  else
    for item in "${GREEN_ITEMS[@]}"; do
      echo "- [x] $item"
    done
  fi
} > "$TODO_FILE"

# --- stdout 汇总 ---
echo "TODO_OK|red=${#RED_ITEMS[@]},yellow=${#YELLOW_ITEMS[@]},green=${#GREEN_ITEMS[@]}"
