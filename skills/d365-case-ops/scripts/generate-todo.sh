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

# CC Finder fields (RDSE customers)
CC_EMAILS=$(sed -n 's/.*"ccEmails":[[:space:]]*"\([^"]*\)".*/\1/p' "$META" | head -1)
CC_KNOW_ME=$(sed -n 's/.*"ccKnowMePage":[[:space:]]*"\([^"]*\)".*/\1/p' "$META" | head -1)

# AR fields
IS_AR=$(sed -n 's/.*"isAR":[[:space:]]*\(true\|false\).*/\1/p' "$META" | head -1)
IS_AR=${IS_AR:-false}
MAIN_CASE_ID=$(sed -n 's/.*"mainCaseId":[[:space:]]*"\([^"]*\)".*/\1/p' "$META" | head -1)
AR_SCOPE=$(sed -n 's/.*"scope":[[:space:]]*"\([^"]*\)".*/\1/p' "$META" | head -1)
SCOPE_CONFIRMED=$(sed -n 's/.*"scopeConfirmed":[[:space:]]*\(true\|false\).*/\1/p' "$META" | head -1)
SCOPE_CONFIRMED=${SCOPE_CONFIRMED:-false}
COMM_MODE=$(sed -n 's/.*"communicationMode":[[:space:]]*"\([^"]*\)".*/\1/p' "$META" | head -1)
COMM_MODE=${COMM_MODE:-internal}
CASE_OWNER_NAME=$(sed -n 's/.*"caseOwnerName":[[:space:]]*"\([^"]*\)".*/\1/p' "$META" | head -1)
CASE_OWNER_EMAIL=$(sed -n 's/.*"caseOwnerEmail":[[:space:]]*"\([^"]*\)".*/\1/p' "$META" | head -1)

# --- 规则矩阵 ---
RED_ITEMS=()
YELLOW_ITEMS=()
GREEN_ITEMS=()

# 🔴 需人工决策
if [ "$IS_AR" != "true" ]; then
  # SLA rules only apply to main cases
  if [ "$ACTUAL_STATUS" = "new" ] && [ "$IR_STATUS" != "Succeeded" ]; then
    RED_ITEMS+=("IR SLA 未完成（status=$IR_STATUS），需立即处理")
  fi
fi
if [ "$ENTITLEMENT_OK" = "false" ]; then
  RED_ITEMS+=("Entitlement 异常，需确认客户合同状态")
fi
if [ "$ACTUAL_STATUS" = "pending-engineer" ] && [ "$DAYS" -ge 2 ] 2>/dev/null; then
  if [ "$IS_AR" = "true" ]; then
    if [ "$COMM_MODE" = "internal" ]; then
      RED_ITEMS+=("Case owner 等待回复已 ${DAYS} 天，需尽快响应")
    else
      RED_ITEMS+=("客户等待回复已 ${DAYS} 天（AR scope），需尽快响应")
    fi
  else
    RED_ITEMS+=("客户等待回复已 ${DAYS} 天，需尽快响应")
  fi
fi

# 🟡 待确认执行
if [ "$ACTUAL_STATUS" = "pending-engineer" ] && [ "$DAYS" -lt 2 ] 2>/dev/null; then
  YELLOW_ITEMS+=("客户等待工程师回复（${DAYS} 天），需安排跟进")
fi
# Check for unsent drafts
if [ -d "$CD/drafts" ]; then
  DRAFT_COUNT=$(ls "$CD/drafts/"*.md 2>/dev/null | wc -l)
  if [ "$DRAFT_COUNT" -gt 0 ] 2>/dev/null; then
    YELLOW_ITEMS+=("有 ${DRAFT_COUNT} 封邮件草稿待审阅发送")
  fi
fi
if [ "$ACTUAL_STATUS" = "pending-customer" ] && [ "$DAYS" -ge 5 ] 2>/dev/null; then
  YELLOW_ITEMS+=("客户 ${DAYS} 天无回复，已 3 次 follow-up 未回复，考虑关单")
elif [ "$ACTUAL_STATUS" = "pending-customer" ] && [ "$DAYS" -ge 3 ] 2>/dev/null; then
  YELLOW_ITEMS+=("客户 ${DAYS} 天无回复，建议发 follow-up 邮件")
fi
if [ "$ACTUAL_STATUS" = "ready-to-close" ]; then
  YELLOW_ITEMS+=("准备关单，发 closure email")
fi
# CC Finder reminder for RDSE customers
if [ -n "$CC_EMAILS" ]; then
  CC_REMINDER="发送 Initial Response 时请 CC: \`${CC_EMAILS}\`"
  if [ -n "$CC_KNOW_ME" ]; then
    CC_REMINDER="${CC_REMINDER} | [Know-Me Wiki](${CC_KNOW_ME})"
  fi
  YELLOW_ITEMS+=("$CC_REMINDER")
fi

# AR-specific YELLOW rules
if [ "$IS_AR" = "true" ]; then
  if [ "$SCOPE_CONFIRMED" = "false" ] && [ -n "$AR_SCOPE" ]; then
    YELLOW_ITEMS+=("AR Scope: ${AR_SCOPE}，请确认是否准确")
  fi
  if [ "$ACTUAL_STATUS" = "ready-to-close" ]; then
    # Override the generic "准备关单" with AR-specific message
    NEW_YELLOW=()
    for item in "${YELLOW_ITEMS[@]}"; do
      [[ "$item" != "准备关单，发 closure email" ]] && NEW_YELLOW+=("$item")
    done
    YELLOW_ITEMS=("${NEW_YELLOW[@]}")
    YELLOW_ITEMS+=("AR 工作完成，通知 case owner: ${CASE_OWNER_NAME} (${CASE_OWNER_EMAIL})")
  fi
  if [ "$ACTUAL_STATUS" = "pending-customer" ] && [ "$DAYS" -ge 3 ] 2>/dev/null; then
    if [ "$COMM_MODE" = "internal" ]; then
      # Override generic follow-up with AR-specific
      NEW_YELLOW2=()
      for item in "${YELLOW_ITEMS[@]}"; do
        [[ "$item" != *"天无回复，建议发 follow-up"* ]] && [[ "$item" != *"天无回复，已 3 次"* ]] && NEW_YELLOW2+=("$item")
      done
      YELLOW_ITEMS=("${NEW_YELLOW2[@]}")
      YELLOW_ITEMS+=("Case owner ${DAYS} 天无回复，建议发 follow-up")
    fi
  fi
fi

# ✅ 仅通知
if [ "$IS_AR" != "true" ]; then
  if [ "$IR_STATUS" = "Succeeded" ]; then
    GREEN_ITEMS+=("IR SLA 已完成")
  fi
fi
if [ "$ACTUAL_STATUS" = "pending-customer" ] && [ "$DAYS" -lt 3 ] 2>/dev/null; then
  if [ "$IS_AR" = "true" ] && [ "$COMM_MODE" = "internal" ]; then
    GREEN_ITEMS+=("等待 case owner 回复（${DAYS} 天）")
  else
    GREEN_ITEMS+=("等待客户回复（${DAYS} 天）")
  fi
fi
if [ "$ACTUAL_STATUS" = "pending-pg" ]; then
  GREEN_ITEMS+=("等待 PG 回复")
fi
if [ "$ACTUAL_STATUS" = "pending-internal" ]; then
  GREEN_ITEMS+=("等待内部确认")
fi
if [ "$ACTUAL_STATUS" = "researching" ]; then
  GREEN_ITEMS+=("技术排查中")
fi
if [ "$ENTITLEMENT_OK" = "true" ] && [ "$SERVICE_LEVEL" != "Unknown" ]; then
  GREEN_ITEMS+=("Entitlement 合规（${SERVICE_LEVEL}）")
elif [ "$SERVICE_LEVEL" = "Unknown" ]; then
  GREEN_ITEMS+=("Entitlement 未检查（compliance 未运行）")
fi
if [ "$IS_AR" = "true" ]; then
  GREEN_ITEMS+=("AR Case | Main: ${MAIN_CASE_ID} | Mode: ${COMM_MODE}")
  if [ "$SCOPE_CONFIRMED" = "true" ]; then
    GREEN_ITEMS+=("AR Scope 已确认: ${AR_SCOPE}")
  fi
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
