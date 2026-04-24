#!/usr/bin/env bash
# generate-todo.sh — 规则化 todo 生成（无 LLM）
# 用法: bash generate-todo.sh "{caseDir}"
# 输出: {caseDir}/todo/YYMMDD-HHMM.md
# stdout: TODO_OK|red=N,yellow=N,green=N
set -euo pipefail

CD="$1"
META="$CD/casework-meta.json"

if [ ! -f "$META" ]; then
  echo "ERROR|meta not found: $META" >&2
  exit 1
fi

# --- dismissed.json: 用户已确认/忽略的 todo 项，不再重复生成 ---
# 格式: {"patterns": ["AR Scope:.*请确认", "修改 SAP:.*"], "items": ["完整文本"]}
DISMISSED_FILE="$CD/todo/dismissed.json"
DISMISSED_PATTERNS=""
if [ -f "$DISMISSED_FILE" ]; then
  DISMISSED_PATTERNS=$(python3 -c "
import json, sys
try:
    d = json.load(open('$DISMISSED_FILE'))
    patterns = d.get('patterns', [])
    items = d.get('items', [])
    # items 转为精确匹配 regex（转义特殊字符）
    import re
    for item in items:
        patterns.append(re.escape(item))
    print('|'.join(patterns) if patterns else '')
except:
    print('')
" 2>/dev/null)
fi

# 函数: 检查某个 todo 项是否已被 dismissed
is_dismissed() {
  local item="$1"
  if [ -z "$DISMISSED_PATTERNS" ]; then
    return 1  # 没有 dismissed 项
  fi
  echo "$item" | grep -qE "$DISMISSED_PATTERNS" 2>/dev/null
}

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

# CC fields: two-layer (base CC from config + RDSE CC from meta)
CC_EMAILS=$(sed -n 's/.*"ccEmails":[[:space:]]*"\([^"]*\)".*/\1/p' "$META" | head -1)
CC_KNOW_ME=$(sed -n 's/.*"ccKnowMePage":[[:space:]]*"\([^"]*\)".*/\1/p' "$META" | head -1)
CC_ACCOUNT=$(sed -n 's/.*"ccAccount":[[:space:]]*"\([^"]*\)".*/\1/p' "$META" | head -1)
# Fallback: if meta has no ccEmails, read defaultCcEmails from config.json
if [ -z "$CC_EMAILS" ]; then
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  CONFIG_FILE="$SCRIPT_DIR/../../../../config.json"
  if [ -f "$CONFIG_FILE" ]; then
    CC_EMAILS=$(sed -n 's/.*"defaultCcEmails":[[:space:]]*"\([^"]*\)".*/\1/p' "$CONFIG_FILE" | head -1)
  fi
fi

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
  # Read compliance warnings for specific reason
  ENT_WARNING=$(python3 -c "
import json
try:
  m = json.load(open(r'$META', encoding='utf-8'))
  warnings = m.get('compliance', {}).get('warnings', [])
  ent_warns = [w for w in warnings if 'entitlement' in w.lower() or '21v' in w.lower() or 'exhibit' in w.lower() or 'india' in w.lower() or 'misrouted' in w.lower() or 'contract' in w.lower()]
  print(ent_warns[0] if ent_warns else '')
except: print('')
" 2>/dev/null)
  if [ -n "$ENT_WARNING" ]; then
    RED_ITEMS+=("Entitlement 不合规: ${ENT_WARNING}")
  else
    RED_ITEMS+=("Entitlement 不合规（缺少 21V Exhibit），联系 TA 确认。无 exhibit 则引导客户从 portal.azure.cn 提工单")
  fi
fi

# ICM Manage Access check: verify CSS Mooncake team has access
ICM_SUMMARY="$CD/icm/icm-summary.md"
if [ -f "$ICM_SUMMARY" ]; then
  if grep -qi "CSS Mooncake Access Check" "$ICM_SUMMARY" 2>/dev/null; then
    if grep -q "❌.*No CSS Mooncake team found" "$ICM_SUMMARY" 2>/dev/null; then
      RED_ITEMS+=("ICM Manage Access 缺少 CSS Mooncake team 的 Owner/Contributor 权限，需在 ICM 中添加")
    elif grep -q "✅.*CSS Mooncake team found" "$ICM_SUMMARY" 2>/dev/null; then
      GREEN_ITEMS+=("ICM Manage Access: CSS Mooncake team 已授权")
    fi
  fi
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

# SAP 准确性检查（从 meta.sapCheck 读取结果，新版支持 suggestedSap 对象）
# AR Case → 跳过 SAP 检查（AR 的 SAP 按产品路径判断，由 main case owner 管理）
SAP_ACCURATE=$(python3 -c "
import json, os
try:
    meta = json.load(open('$META'))
    if meta.get('isAR', False):
        print('OK')  # AR case: skip SAP check
    else:
        sc = meta.get('sapCheck', {})
        if not sc or sc.get('isAccurate', True):
            print('OK')
        else:
            suggested = sc.get('suggestedSap', {})
            if isinstance(suggested, dict):
                sap_path = suggested.get('path', '未知')
                sap_guid = suggested.get('guid', '')
            else:
                sap_path = str(suggested) if suggested else '未知'
                sap_guid = ''
            reason = sc.get('reason', '')
            current = sc.get('currentSap', '')
            print(f'MISMATCH|{current}|{sap_path}|{sap_guid}|{reason}')
except:
    print('OK')
" 2>/dev/null)
if echo "$SAP_ACCURATE" | grep -q "^MISMATCH"; then
  SAP_CURRENT=$(echo "$SAP_ACCURATE" | cut -d'|' -f2)
  SAP_SUGGESTED=$(echo "$SAP_ACCURATE" | cut -d'|' -f3)
  SAP_GUID=$(echo "$SAP_ACCURATE" | cut -d'|' -f4)
  SAP_REASON=$(echo "$SAP_ACCURATE" | cut -d'|' -f5)
  YELLOW_ITEMS+=("修改 SAP: 当前 \`${SAP_CURRENT}\` → 建议 \`${SAP_SUGGESTED}\`（${SAP_REASON}）")
fi

# 21v Boundary 检测（cloudScope from sapCheck — LLM 语义判断客户实际环境）
CLOUD_SCOPE=$(python3 -c "
import json
try:
    meta = json.load(open('$META'))
    if meta.get('isAR', False):
        print('skip')
    else:
        sc = meta.get('sapCheck', {})
        cs = sc.get('cloudScope', 'mooncake')
        current_sap = meta.get('compliance', {}).get('sapPath', '')
        is_mooncake_sap = '21Vianet' in current_sap or 'Mooncake' in current_sap or 'China' in current_sap
        if cs == 'global' and is_mooncake_sap:
            print('GLOBAL_MISMATCH')
        else:
            print('OK')
except:
    print('OK')
" 2>/dev/null)
if [ "$CLOUD_SCOPE" = "GLOBAL_MISMATCH" ]; then
  RED_ITEMS+=("客户问题实际发生在 Azure Global，但 case SAP 为 Mooncake 路径。需 transfer case 到 Global team 或让客户新开 Global case")
fi

# Compliance warnings (ISS-218: surface compliance.warnings to todo)
# This covers SAP scope mismatch detected during assess compliance check,
# which is separate from the sapCheck done during summarize.
COMPLIANCE_WARNINGS=$(python3 -c "
import json, sys
try:
    meta = json.load(open('$CD/casework-meta.json', encoding='utf-8'))
    comp = meta.get('compliance', {})
    warnings = comp.get('warnings', [])
    for w in warnings:
        if w: print(w)
    # ISS-225: suggestedSap from match-sap
    ss = comp.get('suggestedSap')
    if ss and isinstance(ss, dict):
        path = ss.get('path', '')
        pod = ss.get('suggestedPod', '')
        if path:
            msg = f'SAP 建议: \`{path}\`'
            if pod: msg += f' (transfer → {pod})'
            print(msg)
except: pass
" 2>/dev/null)
if [ -n "$COMPLIANCE_WARNINGS" ]; then
  while IFS= read -r warn; do
    YELLOW_ITEMS+=("⚠️ Compliance: $warn")
  done <<< "$COMPLIANCE_WARNINGS"
fi

# Check for unsent drafts — only consider the LATEST draft, compare against sent emails
if [ -d "$CD/drafts" ]; then
  LATEST_DRAFT=$(ls -t "$CD/drafts/"*.md 2>/dev/null | head -1)
  if [ -n "$LATEST_DRAFT" ]; then
    DRAFT_BASENAME=$(basename "$LATEST_DRAFT")
    # Extract draft type from filename: YYYYMMDD-HHMM-{type}-{lang}-{recipient}.md
    DRAFT_TYPE=$(echo "$DRAFT_BASENAME" | sed -n 's/^[0-9]*-[0-9]*-\([a-z-]*\)-[a-z]*-.*\.md$/\1/p')
    DRAFT_TYPE=${DRAFT_TYPE:-email}
    DRAFT_SENT=false
    # Check if a similar email was already sent after the draft was created
    if [ -f "$CD/emails.md" ]; then
      DRAFT_MTIME=$(stat -c %Y "$LATEST_DRAFT" 2>/dev/null || stat -f %m "$LATEST_DRAFT" 2>/dev/null || echo 0)
      DRAFT_DATE=$(date -d "@$DRAFT_MTIME" '+%Y-%m-%d' 2>/dev/null || date -r "$DRAFT_MTIME" '+%Y-%m-%d' 2>/dev/null || echo "")
      # Extract draft subject line (first # heading or Subject: line)
      DRAFT_SUBJECT=$(grep -m1 -E '^(#\s|Subject:)' "$LATEST_DRAFT" 2>/dev/null | sed 's/^#\s*//;s/^Subject:\s*//' | head -1)
      if [ -n "$DRAFT_SUBJECT" ] && [ -n "$DRAFT_DATE" ]; then
        # Check if emails.md contains a sent email with similar subject after draft date
        # emails.md format: ### 📧 {date} | {from} → {to} \n **{subject}**
        # Look for our outgoing email (from: kfang) with matching subject keywords
        SUBJ_KEYWORDS=$(echo "$DRAFT_SUBJECT" | sed 's/[^a-zA-Z0-9 ]//g' | tr ' ' '\n' | sort -u | head -5 | tr '\n' '|' | sed 's/|$//')
        if [ -n "$SUBJ_KEYWORDS" ]; then
          if grep -qi "kfang\|kun.fang\|kunfang" "$CD/emails.md" 2>/dev/null && grep -qiE "$SUBJ_KEYWORDS" "$CD/emails.md" 2>/dev/null; then
            DRAFT_SENT=true
          fi
        fi
      fi
    fi
    if [ "$DRAFT_SENT" = "true" ]; then
      GREEN_ITEMS+=("邮件草稿已发送: $DRAFT_BASENAME")
    else
      YELLOW_ITEMS+=("审阅并发送最新邮件草稿: [$DRAFT_BASENAME](/case/$CASE_NUMBER?tab=drafts)")
    fi
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
# CC reminder — two-layer: base CC (all cases) + RDSE CC (additional)
# AR cases: CC is managed by case owner, skip reminder for AR engineer
if [ -n "$CC_EMAILS" ] && [ "$IS_AR" != "true" ]; then
  if [ -n "$CC_ACCOUNT" ]; then
    CC_REMINDER="[RDSE] 发送邮件时请 CC: \`${CC_EMAILS}\`"
  else
    CC_REMINDER="发送邮件时请 CC: \`${CC_EMAILS}\`"
  fi
  if [ -n "$CC_KNOW_ME" ]; then
    CC_REMINDER="${CC_REMINDER} | [Know-Me Wiki](${CC_KNOW_ME})"
  fi
  # Check if we already sent an email that CC'd this address
  CC_ALREADY_SENT=false
  if [ -f "$CD/emails.md" ]; then
    # Extract first CC email (before comma/semicolon) for matching
    CC_FIRST=$(echo "$CC_EMAILS" | sed 's/[,;].*//' | xargs)
    if [ -n "$CC_FIRST" ] && grep -qi "$CC_FIRST" "$CD/emails.md" 2>/dev/null; then
      CC_ALREADY_SENT=true
    fi
  fi
  if [ "$CC_ALREADY_SENT" = "true" ]; then
    GREEN_ITEMS+=("已 CC ${CC_EMAILS} 发送邮件")
  else
    YELLOW_ITEMS+=("$CC_REMINDER")
  fi
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

# --- 过滤 dismissed 项 ---
FILTERED_RED=()
FILTERED_YELLOW=()
for item in "${RED_ITEMS[@]}"; do
  is_dismissed "$item" || FILTERED_RED+=("$item")
done
for item in "${YELLOW_ITEMS[@]}"; do
  is_dismissed "$item" || FILTERED_YELLOW+=("$item")
done
# GREEN 项不过滤（仅通知，无 actionable）

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
  if [ ${#FILTERED_RED[@]} -eq 0 ]; then
    echo "（无）"
  else
    for item in "${FILTERED_RED[@]}"; do
      echo "- [ ] $item"
    done
  fi
  echo ""
  echo "## 🟡 待确认执行"
  echo ""
  if [ ${#FILTERED_YELLOW[@]} -eq 0 ]; then
    echo "（无）"
  else
    for item in "${FILTERED_YELLOW[@]}"; do
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

# --- 清理旧 todo：只保留最近 7 个 .md 文件（不含 dismissed.json）---
TODO_COUNT=$(ls -1 "$TODO_DIR"/*.md 2>/dev/null | wc -l)
if [ "$TODO_COUNT" -gt 7 ]; then
  ls -1t "$TODO_DIR"/*.md | tail -n +8 | xargs rm -f
fi

# --- stdout 汇总 ---
echo "TODO_OK|red=${#FILTERED_RED[@]},yellow=${#FILTERED_YELLOW[@]},green=${#GREEN_ITEMS[@]}"
