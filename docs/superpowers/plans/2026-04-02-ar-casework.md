# AR Casework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend casework to support AR (Assistance Request) cases where the user is the task owner (not the main case owner), with AR-specific data collection, status judgment, routing, and todo generation.

**Architecture:** Fork after changegate in casework SKILL.md based on `isAR` flag (detected from case number suffix). AR PATH reuses most infrastructure (changegate, timing, compliance, todo) but customizes data-refresh (pull main case data + AR notes), status-judge (AR semantic rules), routing (recipient depends on communication mode), and inspection (AR-perspective summary). No new skills created — all changes are modifications to existing files.

**Tech Stack:** Bash (generate-todo.sh, casework-fast-path.sh), PowerShell (fetch-all-data.ps1, fetch-notes.ps1), Markdown (SKILL.md files, schema docs)

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `skills/d365-case-ops/scripts/generate-todo.sh` | Modify | Add AR-specific todo rules, skip SLA rules for AR |
| `skills/d365-case-ops/scripts/casework-fast-path.sh` | Modify | Add AR changegate detection for fast-path |
| `skills/d365-case-ops/scripts/fetch-all-data.ps1` | Modify | Add `-MainCaseNumber` parameter for AR dual-fetch |
| `skills/d365-case-ops/scripts/fetch-notes.ps1` | Modify | Add `-OutputFileName` parameter to write `notes-ar.md` |
| `playbooks/schemas/meta-schema.md` | Modify | Add `isAR`, `mainCaseId`, `ar` field documentation |
| `playbooks/schemas/case-directory.md` | Modify | Add `notes-ar.md` file description |
| `.claude/skills/data-refresh/SKILL.md` | Modify | Add AR mode: pull main case data + AR notes separately |
| `.claude/skills/compliance-check/SKILL.md` | Modify | Add Entitlement caching logic (skip if already checked) |
| `.claude/skills/status-judge/SKILL.md` | Modify | Add AR semantic judgment rules for both communication modes |
| `.claude/skills/inspection-writer/SKILL.md` | Modify | Add AR-perspective summary generation |
| `.claude/skills/casework/SKILL.md` | Modify | Add AR PATH branch after changegate (the big one) |

---

### Task 1: Extend generate-todo.sh with AR Rules

**Files:**
- Modify: `skills/d365-case-ops/scripts/generate-todo.sh`

This is the foundational change — the bash script needs to parse new AR meta fields and apply AR-specific todo rules.

- [ ] **Step 1: Add AR field parsing after existing meta parsing (after line 54)**

After the existing `CC_KNOW_ME` parsing (line 54), add AR field extraction:

```bash
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
```

- [ ] **Step 2: Wrap SLA-dependent rules in `isAR` guard**

Modify the RED rules section. The IR SLA rule at line 62-64 should be wrapped:

```bash
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
```

- [ ] **Step 3: Add AR-specific YELLOW rules after the existing YELLOW section (after line 98)**

Insert before the GREEN section (line 100):

```bash
# AR-specific YELLOW rules
if [ "$IS_AR" = "true" ]; then
  if [ "$SCOPE_CONFIRMED" = "false" ] && [ -n "$AR_SCOPE" ]; then
    YELLOW_ITEMS+=("AR Scope: ${AR_SCOPE}，请确认是否准确")
  fi
  if [ "$ACTUAL_STATUS" = "ready-to-close" ]; then
    # Override the generic "准备关单" with AR-specific message
    # Remove the generic ready-to-close item added earlier (overwrite array)
    NEW_YELLOW=()
    for item in "${YELLOW_ITEMS[@]}"; do
      [[ "$item" != "准备关单，发 closure email" ]] && NEW_YELLOW+=("$item")
    done
    YELLOW_ITEMS=("${NEW_YELLOW[@]}")
    YELLOW_ITEMS+=("AR 工作完成，通知 case owner: ${CASE_OWNER_NAME} (${CASE_OWNER_EMAIL})")
  fi
  if [ "$ACTUAL_STATUS" = "pending-customer" ] && [ "$DAYS" -ge 3 ] 2>/dev/null; then
    if [ "$COMM_MODE" = "internal" ]; then
      # Override generic follow-up with AR-specific (overwrite array)
      NEW_YELLOW2=()
      for item in "${YELLOW_ITEMS[@]}"; do
        [[ "$item" != *"天无回复，建议发 follow-up"* ]] && [[ "$item" != *"天无回复，已 3 次"* ]] && NEW_YELLOW2+=("$item")
      done
      YELLOW_ITEMS=("${NEW_YELLOW2[@]}")
      YELLOW_ITEMS+=("Case owner ${DAYS} 天无回复，建议发 follow-up")
    fi
  fi
fi
```

- [ ] **Step 4: Wrap SLA GREEN items in `isAR` guard**

Modify the GREEN section. The IR SLA succeeded check at line 101-103 should be wrapped:

```bash
# ✅ 仅通知
if [ "$IS_AR" != "true" ]; then
  if [ "$IR_STATUS" = "Succeeded" ]; then
    GREEN_ITEMS+=("IR SLA 已完成")
  fi
fi
```

And modify the pending-customer GREEN item to be AR-aware:

```bash
if [ "$ACTUAL_STATUS" = "pending-customer" ] && [ "$DAYS" -lt 3 ] 2>/dev/null; then
  if [ "$IS_AR" = "true" ] && [ "$COMM_MODE" = "internal" ]; then
    GREEN_ITEMS+=("等待 case owner 回复（${DAYS} 天）")
  else
    GREEN_ITEMS+=("等待客户回复（${DAYS} 天）")
  fi
fi
```

Add AR-specific green items:

```bash
if [ "$IS_AR" = "true" ]; then
  GREEN_ITEMS+=("AR Case | Main: ${MAIN_CASE_ID} | Mode: ${COMM_MODE}")
  if [ "$SCOPE_CONFIRMED" = "true" ]; then
    GREEN_ITEMS+=("AR Scope 已确认: ${AR_SCOPE}")
  fi
fi
```

- [ ] **Step 5: Test the modified script manually**

Create a test meta file and run:

```bash
mkdir -p /tmp/test-ar-todo/todo
cat > /tmp/test-ar-todo/casehealth-meta.json << 'METAEOF'
{
  "caseNumber": "2603300030003153001",
  "isAR": true,
  "mainCaseId": "2603300030003153",
  "actualStatus": "pending-engineer",
  "daysSinceLastContact": 3,
  "statusJudgedAt": "2026-04-02T10:00:00+08:00",
  "compliance": { "entitlementOk": true, "serviceLevel": "Premier" },
  "ar": {
    "scope": "Azure VM performance troubleshooting",
    "scopeConfirmed": false,
    "communicationMode": "internal",
    "caseOwnerEmail": "other.eng@microsoft.com",
    "caseOwnerName": "Other Engineer"
  }
}
METAEOF
bash skills/d365-case-ops/scripts/generate-todo.sh /tmp/test-ar-todo
cat /tmp/test-ar-todo/todo/*.md
```

Expected: RED item about "Case owner 等待回复已 3 天", YELLOW item about "AR Scope: ... 请确认", GREEN item about "AR Case | Main: ...", NO IR SLA items.

- [ ] **Step 6: Test with non-AR case to verify no regression**

```bash
mkdir -p /tmp/test-normal-todo/todo
cat > /tmp/test-normal-todo/casehealth-meta.json << 'METAEOF'
{
  "caseNumber": "2603300030003153",
  "actualStatus": "pending-customer",
  "daysSinceLastContact": 4,
  "statusJudgedAt": "2026-04-02T10:00:00+08:00",
  "irSla": { "status": "Succeeded" },
  "compliance": { "entitlementOk": true, "serviceLevel": "Premier" }
}
METAEOF
bash skills/d365-case-ops/scripts/generate-todo.sh /tmp/test-normal-todo
cat /tmp/test-normal-todo/todo/*.md
```

Expected: Standard todo output (no AR items), IR SLA item present.

- [ ] **Step 7: Commit**

```bash
git add skills/d365-case-ops/scripts/generate-todo.sh
git commit -m "feat(todo): add AR-specific todo rules, skip SLA for AR cases"
```

---

### Task 2: Extend fetch-notes.ps1 with OutputFileName Parameter

**Files:**
- Modify: `skills/d365-case-ops/scripts/fetch-notes.ps1`

Add a parameter to write notes to a custom filename (e.g., `notes-ar.md` instead of `notes.md`), enabling AR notes to be stored separately.

- [ ] **Step 1: Add OutputFileName parameter to param block (line 24-33)**

Replace the param block:

```powershell
param(
    [Parameter(Mandatory)][string]$TicketNumber,
    [string]$OutputDir = $(if ($env:D365_CASES_ROOT) { "$env:D365_CASES_ROOT\active" } else {
        $projRoot = (Resolve-Path "$PSScriptRoot\..\..\..").Path
        $cfg = Get-Content "$projRoot\config.json" -Raw | ConvertFrom-Json
        $cr = if ([IO.Path]::IsPathRooted($cfg.casesRoot)) { $cfg.casesRoot } else { Join-Path $projRoot $cfg.casesRoot }
        "$cr\active"
    }),
    [switch]$Force,
    [string]$OutputFileName = "notes.md",
    [string]$OutputSubDir
)
```

- [ ] **Step 2: Update the notesFile path construction (line 39)**

Replace line 39:

```powershell
$targetDir = if ($OutputSubDir) { Join-Path $OutputDir $OutputSubDir } else { Join-Path $OutputDir $TicketNumber }
if (-not (Test-Path $targetDir)) { New-Item -ItemType Directory -Path $targetDir -Force | Out-Null }
$notesFile = Join-Path $targetDir $OutputFileName
```

- [ ] **Step 3: Verify existing behavior is unchanged**

Run with no new parameters — should produce identical output:

```bash
pwsh -NoProfile -File skills/d365-case-ops/scripts/fetch-notes.ps1 -TicketNumber 2603250010001221 -OutputDir cases/active 2>&1 | tail -5
```

Expected: Same behavior as before (writes to `notes.md` in the case's own directory).

- [ ] **Step 4: Commit**

```bash
git add skills/d365-case-ops/scripts/fetch-notes.ps1
git commit -m "feat(fetch-notes): add -OutputFileName and -OutputSubDir parameters for AR notes"
```

---

### Task 3: Extend fetch-all-data.ps1 with AR Mode

**Files:**
- Modify: `skills/d365-case-ops/scripts/fetch-all-data.ps1`

Add `-MainCaseNumber` parameter. When set, the script fetches snapshot/emails/notes from the main case and AR notes from the AR case.

- [ ] **Step 1: Add MainCaseNumber and SkipIrCheck parameters (line 18-30)**

Replace the param block:

```powershell
param(
    [Parameter(Mandatory)][string]$TicketNumber,
    [string]$OutputDir = $(if ($env:D365_CASES_ROOT) { "$env:D365_CASES_ROOT\active" } else {
        $projRoot = (Resolve-Path "$PSScriptRoot\..\..\..").Path
        $cfg = Get-Content "$projRoot\config.json" -Raw | ConvertFrom-Json
        $cr = if ([IO.Path]::IsPathRooted($cfg.casesRoot)) { $cfg.casesRoot } else { Join-Path $projRoot $cfg.casesRoot }
        "$cr\active"
    }),
    [switch]$Force,
    [int]$CacheMinutes = 10,
    [switch]$IncludeIrCheck,
    [string]$MetaDir,
    [string]$MainCaseNumber,
    [switch]$SkipIrCheck
)
```

- [ ] **Step 2: Add AR mode logic after the Ensure-D365Tab call (after line 50)**

Insert after `Ensure-D365Tab` (line 50):

```powershell
# --- AR Mode: determine which case to fetch main data from ---
$isAR = [bool]$MainCaseNumber
$fetchCaseNumber = if ($isAR) { $MainCaseNumber } else { $TicketNumber }
$arCaseNumber = $TicketNumber  # Always the AR case for AR-specific notes

if ($isAR) {
    Write-Host "🔵 AR Mode: fetching main data from $fetchCaseNumber, AR notes from $arCaseNumber"
    # Pre-warm incident ID for the MAIN case (not the AR case)
    Write-Host "🔵 Pre-warming incident ID for main case $fetchCaseNumber..."
    $mainIncidentId = Get-IncidentId -TicketNumber $fetchCaseNumber
    if (-not $mainIncidentId) {
        Write-Error "❌ Main case $fetchCaseNumber not found"
        exit 1
    }
    Write-Host "🔵 Main case incident ID: $mainIncidentId (cached)"
}
```

- [ ] **Step 3: Modify the parallel jobs to use `$fetchCaseNumber` for main data**

Replace lines 55-75 (the three job launches). The key change: snapshot/emails/notes jobs use `$fetchCaseNumber` (main case) but output to `$TicketNumber` directory (AR case dir):

```powershell
# Launch parallel jobs — use $fetchCaseNumber for main data, output to AR case dir ($TicketNumber)
Write-Host "🔵 Launching parallel: snapshot + emails + notes for case $fetchCaseNumber..."

$jobSnapshot = Start-Job -ScriptBlock {
    param($root, $tn, $outDir, $cache, $arDir)
    $env:D365_CASES_ROOT = Split-Path (Split-Path $outDir)
    # Fetch from $tn (main case), but if AR mode, output goes to AR dir
    $targetDir = if ($arDir) { $arDir } else { $tn }
    & "$root\fetch-case-snapshot.ps1" -TicketNumber $tn -OutputDir $outDir -CacheMinutes $cache 2>&1 | Out-String
    # If AR mode, copy case-info.md from main case dir to AR dir
    if ($arDir -and $arDir -ne $tn) {
        $srcFile = Join-Path (Join-Path $outDir $tn) "case-info.md"
        $dstDir = Join-Path $outDir $arDir
        if (-not (Test-Path $dstDir)) { New-Item -ItemType Directory -Path $dstDir -Force | Out-Null }
        if (Test-Path $srcFile) {
            Copy-Item $srcFile (Join-Path $dstDir "case-info.md") -Force
            Write-Host "🔵 Copied case-info.md from $tn to $arDir"
        }
    }
} -ArgumentList $scriptRoot, $fetchCaseNumber, $OutputDir, $CacheMinutes, $(if ($isAR) { $arCaseNumber } else { $null })

$jobEmails = Start-Job -ScriptBlock {
    param($root, $tn, $outDir, $force, $arDir)
    $env:D365_CASES_ROOT = Split-Path (Split-Path $outDir)
    $params = @{ TicketNumber = $tn; OutputDir = $outDir }
    if ($force) { $params.Force = $true }
    & "$root\fetch-emails.ps1" @params 2>&1 | Out-String
    # If AR mode, copy emails.md from main case dir to AR dir
    if ($arDir -and $arDir -ne $tn) {
        $srcFile = Join-Path (Join-Path $outDir $tn) "emails.md"
        $dstDir = Join-Path $outDir $arDir
        if (-not (Test-Path $dstDir)) { New-Item -ItemType Directory -Path $dstDir -Force | Out-Null }
        if (Test-Path $srcFile) {
            Copy-Item $srcFile (Join-Path $dstDir "emails.md") -Force
            Write-Host "🔵 Copied emails.md from $tn to $arDir"
        }
    }
} -ArgumentList $scriptRoot, $fetchCaseNumber, $OutputDir, $Force.IsPresent, $(if ($isAR) { $arCaseNumber } else { $null })

$jobNotes = Start-Job -ScriptBlock {
    param($root, $tn, $outDir, $force, $arDir)
    $env:D365_CASES_ROOT = Split-Path (Split-Path $outDir)
    $params = @{ TicketNumber = $tn; OutputDir = $outDir }
    if ($force) { $params.Force = $true }
    & "$root\fetch-notes.ps1" @params 2>&1 | Out-String
    # If AR mode, copy notes.md from main case dir to AR dir
    if ($arDir -and $arDir -ne $tn) {
        $srcFile = Join-Path (Join-Path $outDir $tn) "notes.md"
        $dstDir = Join-Path $outDir $arDir
        if (-not (Test-Path $dstDir)) { New-Item -ItemType Directory -Path $dstDir -Force | Out-Null }
        if (Test-Path $srcFile) {
            Copy-Item $srcFile (Join-Path $dstDir "notes.md") -Force
            Write-Host "🔵 Copied notes.md from $tn to $arDir"
        }
    }
} -ArgumentList $scriptRoot, $fetchCaseNumber, $OutputDir, $Force.IsPresent, $(if ($isAR) { $arCaseNumber } else { $null })
```

- [ ] **Step 4: Add AR notes fetch after parallel jobs complete (after line 108)**

Insert after `Remove-Job` (line 108), before the IR check section:

```powershell
# --- AR Mode: fetch AR-specific notes into notes-ar.md ---
if ($isAR) {
    Write-Host "🔵 Fetching AR notes from $arCaseNumber..."
    $arSw = [System.Diagnostics.Stopwatch]::StartNew()
    $arDir = Join-Path $OutputDir $arCaseNumber
    & "$scriptRoot\fetch-notes.ps1" -TicketNumber $arCaseNumber -OutputDir $OutputDir -OutputFileName "notes-ar.md" -OutputSubDir $arCaseNumber
    $arSw.Stop()
    Write-Host "ar-notes: $([math]::Round($arSw.Elapsed.TotalSeconds, 1))s"
}
```

- [ ] **Step 5: Skip IR check in AR mode (modify line 111)**

Wrap the IR check section:

```powershell
# --- Optional: IR check (skip for AR cases — not AR owner's SLA) ---
if ($IncludeIrCheck -and -not $isAR) {
```

- [ ] **Step 6: Commit**

```bash
git add skills/d365-case-ops/scripts/fetch-all-data.ps1
git commit -m "feat(fetch-all-data): add AR mode with -MainCaseNumber for dual-fetch"
```

---

### Task 4: Extend casework-fast-path.sh for AR

**Files:**
- Modify: `skills/d365-case-ops/scripts/casework-fast-path.sh`

The fast-path script needs to know about AR to skip SLA-related cache checks and adjust routing decisions.

- [ ] **Step 1: Parse AR fields from meta (after line 8)**

After `META="$CD/casehealth-meta.json"` (line 9), add:

```bash
IS_AR=$(sed -n 's/.*"isAR":[[:space:]]*\(true\|false\).*/\1/p' "$META" 2>/dev/null | head -1)
IS_AR=${IS_AR:-false}
```

- [ ] **Step 2: No changes needed for DR/Teams/Compliance/Judge cache checks**

The existing cache checks work correctly for AR:
- DR skip: same behavior (NO_CHANGE = skip data-refresh)
- Teams cache: same behavior
- Compliance cache: checks `entitlementOk` + `ccAccount` — works for AR
- Judge cache: checks email/note counts — works for AR (checks case-info.md which contains main case data)

No modifications needed for these sections.

- [ ] **Step 3: Adjust routing decision for AR (line 84-90)**

The routing `case` statement should use AR-specific semantics. Replace lines 84-90:

```bash
  case "$ACTUAL_STATUS" in
    new|pending-engineer) NEED_AGENT="true" ;;
    researching) NEED_AGENT="true" ;;
    ready-to-close) NEED_AGENT="true" ;;
    pending-customer)
      if [ "$IS_AR" = "true" ]; then
        # AR: follow-up to case owner or customer depending on mode
        [ "$DAYS" -ge 3 ] 2>/dev/null && NEED_AGENT="true"
      else
        [ "$DAYS" -ge 3 ] 2>/dev/null && NEED_AGENT="true"
      fi
      ;;
    pending-pg) ;;
  esac
```

Note: The routing logic is actually identical for AR and main cases at this level (same thresholds). The difference is in _how_ casework routes (recipient selection), which happens in the SKILL.md, not here. So this step is effectively a no-op but adds the `IS_AR` variable for future use.

- [ ] **Step 4: Include IS_AR in output for casework to parse (modify line 100)**

Update the FAST_PATH_OK output:

```bash
  echo "FAST_PATH_OK|status=$ACTUAL_STATUS,days=$DAYS,teams=$TEAMS_DETAIL,judge=$JUDGE_DETAIL,isAR=$IS_AR"
```

- [ ] **Step 5: Commit**

```bash
git add skills/d365-case-ops/scripts/casework-fast-path.sh
git commit -m "feat(fast-path): parse AR fields, include isAR in output"
```

---

### Task 5: Update Meta Schema Documentation

**Files:**
- Modify: `playbooks/schemas/meta-schema.md`

- [ ] **Step 1: Add AR fields to the complete schema example (after line 65)**

After the `ccKnowMePage` field in the example JSON, add:

```json
  "isAR": false,
  "mainCaseId": null,
  "ar": null
```

And add a second example showing an AR case:

```markdown
### AR Case Example

```json
{
  "caseNumber": "2603300030003153001",
  "isAR": true,
  "mainCaseId": "2603300030003153",
  "lastInspected": "2026-04-02T18:30:00+08:00",
  "actualStatus": "pending-engineer",
  "daysSinceLastContact": 2,
  "statusJudgedAt": "2026-04-02T18:30:00+08:00",
  "statusReasoning": "Case owner asked about VM perf in notes, no reply yet → pending-engineer",
  "emailCountAtJudge": 14,
  "noteCountAtJudge": 2,
  "icmIdAtJudge": "",
  "compliance": {
    "entitlementOk": true,
    "serviceLevel": "Premier",
    "serviceName": "Unfd AddOn | ProSv Ente - China Cld",
    "contractCountry": "China",
    "is21vConvert": false,
    "warnings": []
  },
  "ar": {
    "scope": "Azure VM performance troubleshooting",
    "scopeConfirmed": true,
    "communicationMode": "internal",
    "caseOwnerEmail": "other.engineer@microsoft.com",
    "caseOwnerName": "Other Engineer"
  }
}
```

> **Note**: AR cases do NOT have `irSla`/`fdr`/`fwr` fields — SLA is not the AR owner's responsibility.
```

- [ ] **Step 2: Add AR field descriptions to the field table (after line 97)**

```markdown
| `isAR` | boolean | casework (auto-detect) | Whether this is an AR (Assistance Request) case. Auto-detected from case number suffix (3+ digits). |
| `mainCaseId` | string\|null | casework (auto-detect) | Main case number (without AR suffix). Null for non-AR cases. |
| `ar` | object\|null | casework | AR-specific metadata. Null for non-AR cases. |
| `ar.scope` | string | casework (LLM extract) | One-sentence summary of what the AR asks you to do |
| `ar.scopeConfirmed` | boolean | user confirmation | Whether user has confirmed the extracted scope is accurate |
| `ar.communicationMode` | string | casework (auto-detect) | `"internal"` (communicate with case owner) or `"customer-facing"` (pulled into customer email) |
| `ar.caseOwnerEmail` | string | casework (auto-detect) | Main case owner's email address |
| `ar.caseOwnerName` | string | casework (auto-detect) | Main case owner's display name |
```

- [ ] **Step 3: Add AR writer to the writers section (line 8-11)**

After the existing writers list, add:

```markdown
- `casework` (auto-detect)：写入 `isAR` / `mainCaseId`（case number 后缀检测）
- `casework` (LLM/auto)：写入 `ar` 对象（scope 提取、沟通模式检测、case owner 信息）
```

- [ ] **Step 4: Commit**

```bash
git add playbooks/schemas/meta-schema.md
git commit -m "docs(meta-schema): add AR fields (isAR, mainCaseId, ar object)"
```

---

### Task 6: Update Case Directory Schema Documentation

**Files:**
- Modify: `playbooks/schemas/case-directory.md`

- [ ] **Step 1: Add notes-ar.md to the file table (after line 28)**

After the `notes.md` row, add:

```markdown
| `notes-ar.md` | Markdown | d365-case-ops (fetch-notes.ps1) | AR case 专属 notes（仅 AR case 有此文件）。与 `notes.md` 格式相同（reverse-chronological append），但仅包含 AR case 实体上的 notes，用于分离 AR 沟通和 main case 沟通。 |
```

- [ ] **Step 2: Add AR case directory explanation**

After the "平台无关性" section (end of file), add:

```markdown
## AR Case 目录

AR (Assistance Request) case 的目录结构与普通 case 基本相同，区别：

| 文件 | 来源 | 说明 |
|------|------|------|
| `case-info.md` | 从 **main case** 拉取 | AR 没有独立的 case-info |
| `emails.md` | 从 **main case** 拉取 | AR 没有独立邮件 |
| `notes.md` | 从 **main case** 拉取 | main case 的 notes |
| `notes-ar.md` | 从 **AR case** 拉取 | AR 专属 notes（case owner 需求 + 你的工作记录） |
| `attachments/` | 从 **main case** 拉取 | 附件在 main case 上 |
| `emails-office.md` | **不拉取** | AR 不需要 Outlook 邮件 |

AR case 通过 case number 后缀识别（3+ 位数字后缀，如 `2603300030003153001`）。`casehealth-meta.json` 中 `isAR=true`，`mainCaseId` 指向对应的 main case。
```

- [ ] **Step 3: Commit**

```bash
git add playbooks/schemas/case-directory.md
git commit -m "docs(case-directory): add notes-ar.md and AR case directory explanation"
```

---

### Task 7: Extend data-refresh SKILL.md for AR Mode

**Files:**
- Modify: `.claude/skills/data-refresh/SKILL.md`

- [ ] **Step 1: Add AR parameter documentation (after line 27)**

After the "配置读取" section, add:

```markdown
## AR Mode

当 casework 传入 `isAR=true` 和 `mainCaseId={mainCaseNumber}` 时：

- **数据源变化**：
  - `case-info.md` / `emails.md` / `notes.md` / `attachments/` → 从 **main case** (`mainCaseId`) 拉取
  - `notes-ar.md` → 从 **AR case** (`caseNumber`) 拉取
- **跳过项**：
  - `emails-office.md` — AR 不需要
  - IR check — SLA 不是 AR owner 的责任
- **PowerShell 命令**：
  ```bash
  pwsh -NoProfile -File skills/d365-case-ops/scripts/fetch-all-data.ps1 -TicketNumber {caseNumber} -OutputDir {casesRoot}/active -MainCaseNumber {mainCaseId} -CacheMinutes 10 -MetaDir {casesRoot}/active
  ```
  `-MainCaseNumber` 触发 AR 模式，脚本内部会：
  1. 从 mainCaseNumber 拉取 snapshot/emails/notes → 存到 AR case 目录
  2. 从 AR caseNumber 拉取 notes → 存为 `notes-ar.md`
  3. 跳过 IR check
```

- [ ] **Step 2: Update Step 1 with AR variant (modify the command at line 61-62)**

After the existing Step 1 command, add:

```markdown
**AR Mode**:
```bash
pwsh -NoProfile -File skills/d365-case-ops/scripts/fetch-all-data.ps1 -TicketNumber {caseNumber} -OutputDir {casesRoot}/active -MainCaseNumber {mainCaseId} -CacheMinutes 10 -MetaDir {casesRoot}/active
```
内部会从 mainCaseId 拉取 snapshot + emails + notes 到 AR 目录，并从 AR caseNumber 拉取 notes-ar.md。IR check 自动跳过。
```

- [ ] **Step 3: Update Step 2 (attachments) with AR note**

Add after the existing Step 2 content:

```markdown
**AR Mode**: 从 main case 下载附件（读 AR 目录下的 `case-info.md`，它来自 main case）。
```

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/data-refresh/SKILL.md
git commit -m "docs(data-refresh): add AR mode documentation with -MainCaseNumber"
```

---

### Task 8: Extend compliance-check SKILL.md with Caching

**Files:**
- Modify: `.claude/skills/compliance-check/SKILL.md`

- [ ] **Step 1: Update the caching section (lines 28-31)**

The existing caching logic already covers the basic case. Update to make AR caching explicit:

Replace lines 28-31:

```markdown
## 缓存跳过
读 `{caseDir}/casehealth-meta.json`：
- `compliance.entitlementOk === true` **且** `ccAccount` 字段已存在（非 undefined）→ **跳过**，沿用缓存
- 否则执行完整检查（Entitlement 已缓存时仍需运行 CC Finder）

> ⚠️ `ccAccount` 为 `null` 视为"已评估但未匹配"，允许跳过。`ccAccount` 字段不存在（undefined）才表示 CC Finder 从未执行过。

### AR 缓存策略
AR case 的 compliance 缓存更积极：
- Entitlement 检查基于 **main case** 数据（`case-info.md` 来自 main case），合同信息不会因 AR 而变化
- 首次检查后缓存永久有效（除非手动清除 meta）
- casework AR PATH 在 Step A3 中调用时，读取 `compliance.entitlementOk`：
  - 有值 → 跳过（无论 true/false，都不重新检查）
  - 无值 → 执行完整检查
- `entitlementOk === false` 时 casework 阻断，但不重新检查（避免反复查询已知不合规的 case）
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/compliance-check/SKILL.md
git commit -m "docs(compliance-check): add AR caching strategy documentation"
```

---

### Task 9: Extend status-judge SKILL.md with AR Rules

**Files:**
- Modify: `.claude/skills/status-judge/SKILL.md`

- [ ] **Step 1: Add AR mode section (after line 57, after "判断原则")**

After the existing judgment principles, add:

```markdown
### AR Mode 判断原则

当 `meta.isAR === true` 时，status-judge 使用 AR 语义规则。核心区别：

**数据源变化**：
- `emails.md` — 来自 **main case**，分析客户/case owner 的最新沟通
- `notes-ar.md` — AR 专属 notes，分析 case owner 的需求和你的回复
- `ar.communicationMode` — 决定用哪套判断规则

**内部模式** (`communicationMode = "internal"`)：
- 你与 case owner 之间的沟通，不直接面对客户
- `pending-engineer` = case owner 在 notes/Teams 中提了新问题，你未回应
- `pending-customer` = 你在 notes 中回复了，等 case owner 反馈
- `ready-to-close` = AR scope 问题已解决，你已回复 case owner
- `daysSinceLastContact` = 距你最后一次在 `notes-ar.md` 中回复的天数

**客户面向模式** (`communicationMode = "customer-facing"`)：
- 你被拉入客户邮件链，直接面对客户（但只处理 AR scope 内的问题）
- `pending-engineer` = 客户发了新的 AR scope 内问题，你未回复
- `pending-customer` = 你回复了客户（AR scope 内），等客户反馈
- `ready-to-close` = 客户确认 AR scope 问题已解决
- `daysSinceLastContact` = 距你最后一次在 `emails.md` 中给客户发邮件的天数

### AR 判断步骤

1. 读取 `notes-ar.md`（如存在）— 最后几条 note
2. 读取 `emails.md` 最后 100 行（与普通 case 相同）
3. 读取 `ar.communicationMode` 和 `ar.scope`
4. **内部模式**：
   - 检查 notes-ar.md 最后一条 note 是谁写的
   - 如果是 case owner → pending-engineer
   - 如果是你 → pending-customer 或 researching
5. **客户面向模式**：
   - 分析 emails.md 最后几封邮件
   - 如果客户最后发邮件且涉及 AR scope → pending-engineer
   - 如果你最后发邮件（AR scope 回复）→ pending-customer
6. ICM 查询逻辑与普通 case 相同
```

- [ ] **Step 2: Update Step 2 (Read Case Data) to include notes-ar.md**

After the existing Step 2 content, add:

```markdown
- `{caseDir}/notes-ar.md`（如存在）— **只读最后 50 行**（AR notes 通常较少）：
  ```bash
  tail -50 "{caseDir}/notes-ar.md" 2>/dev/null || echo "(no AR notes)"
  ```
  > AR Mode 时必须读取此文件。
```

- [ ] **Step 3: Update Step 6 (Upsert meta) to preserve AR fields**

Add note to Step 6:

```markdown
> ⚠️ AR Mode 时，保留已有的 `isAR`、`mainCaseId`、`ar` 字段不覆盖。status-judge 只写入 `actualStatus`/`daysSinceLastContact`/`statusJudgedAt`/`statusReasoning`/`emailCountAtJudge`/`noteCountAtJudge`/`icmIdAtJudge`。
```

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/status-judge/SKILL.md
git commit -m "docs(status-judge): add AR semantic judgment rules for both comm modes"
```

---

### Task 10: Extend inspection-writer SKILL.md for AR

**Files:**
- Modify: `.claude/skills/inspection-writer/SKILL.md`

- [ ] **Step 1: Add AR section to Step 2a (first-time generation, after line 67)**

After the existing rules in Step 2a, add:

```markdown
**AR Case 规则**（`meta.isAR === true`）：
- 「问题描述」格式：`[AR] {ar.scope} — Main Case: {mainCaseId}`
- 「排查进展」从 notes-ar.md + emails.md 提取 AR scope 相关事件
- 「关键发现」仅包含 AR scope 内的诊断结论
- 「风险」不包含 SLA 风险评估（不是 AR owner 的 SLA）
- 额外 section **「AR 信息」**（放在「问题描述」和「排查进展」之间）：
  ```markdown
  ## AR 信息
  - Main Case: {mainCaseId}
  - Case Owner: {ar.caseOwnerName} ({ar.caseOwnerEmail})
  - Communication Mode: {ar.communicationMode}
  - Scope: {ar.scope}
  - Scope Confirmed: {ar.scopeConfirmed}
  ```
```

- [ ] **Step 2: Add AR section to Step 2b (incremental append)**

After the existing Step 2b content, add:

```markdown
**AR Case**：增量追加逻辑相同，但只关注 AR scope 相关的新事件。如 `ar.communicationMode` 或 `ar.scopeConfirmed` 有变化，更新「AR 信息」section。
```

- [ ] **Step 3: Add note about notes-ar.md data source**

In Step 2a, after "读取：`case-info.md`、`emails.md`、`notes.md`、`teams/*.md`（如有）", add:

```markdown
- AR Case 额外读取：`notes-ar.md`（如存在）
```

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/inspection-writer/SKILL.md
git commit -m "docs(inspection-writer): add AR-perspective summary generation rules"
```

---

### Task 11: Add AR PATH to casework SKILL.md (the main integration)

**Files:**
- Modify: `.claude/skills/casework/SKILL.md`

This is the largest and most critical change. It adds the AR branch after changegate.

- [ ] **Step 1: Add AR detection to Step 1 (after changegate, line 65)**

After the changegate bash block ends (line 65), before the "路径 A" section (line 71), add:

```markdown
**AR 检测**：检查 case number 是否有 3+ 位后缀（AR case）。

```bash
# AR detection: case number with 3+ digit suffix
CASE_NUM="{caseNumber}"
# Main case is 16 digits. AR suffix adds 3+ more digits.
if [ ${#CASE_NUM} -ge 19 ]; then
  IS_AR="true"
  MAIN_CASE_ID="${CASE_NUM:0:16}"
else
  IS_AR="false"
  MAIN_CASE_ID=""
fi
```

如果 `IS_AR=true`：
1. 读取/创建 `casehealth-meta.json`，upsert `isAR: true` 和 `mainCaseId`
2. 后续步骤走 **AR PATH**（见下文）

如果 `IS_AR=false`：走现有路径（不变）。
```

- [ ] **Step 2: Add AR PATH section (before the "Bash 调用次数" table at end of file)**

Before the final "## Bash 调用次数" section (line 242), add the complete AR PATH:

```markdown
---

## AR PATH（isAR = true 时的执行流程）

当 Step 1 检测到 `IS_AR=true` 后，casework 切换到 AR PATH。复用大部分基础设施，但定制数据收集、状态判断、路由。

### AR 路径 A：NO_CHANGE → AR 快速路径

changegate 对 AR case 的检测方式：比较 main case + AR case 的 D365 状态变化。

fast-path 脚本输出含 `isAR=true` 时，AR 快速路径行为与普通快速路径相同（生成 todo + timing），但 generate-todo.sh 会自动应用 AR 规则（跳过 SLA 等）。

### AR 路径 B：CHANGED → AR 正常流程

**AR-B0. 归档检测**

同普通路径 B0，检测 main case 是否已归档。

**AR-B1. spawn data-refresh（AR 模式）**

```
subagent_type: "data-refresh"
description: "data-refresh AR {caseNumber}"
run_in_background: true
prompt: |
  AR Case {caseNumber}，mainCaseId={mainCaseId}，caseDir={caseDir}（绝对路径），casesRoot={casesRoot}。
  这是一个 AR Case，需要从 main case 拉取主要数据。
  请先读取 .claude/skills/data-refresh/SKILL.md 获取完整执行步骤（关注 AR Mode 部分），然后执行。
  ⚠️ casework changegate 已预热浏览器并缓存 incidentId，跳过 Step 0a 和 0b。
  ⚠️ AR Mode: 使用 `-MainCaseNumber {mainCaseId}` 参数。不执行 IR check。
  ⏱ 第一个 Bash 调用中写 date +%s > "{caseDir}/logs/.t_dataRefresh_start"
  ⏱ 最后一个 Bash 调用中写 date +%s > "{caseDir}/logs/.t_dataRefresh_end"
  完成后汇报各步骤成功/失败状态。
```

**AR-B2. Teams 预检 + spawn teams-search / onenote-case-search**

Teams 搜索关键词根据沟通模式调整（由 casework 在 prompt 中传入）：
- 沟通模式尚未确定时（首次处理），默认搜 case owner 名 + AR case number
- `communicationMode = "internal"` → 搜 case owner 名 + AR ID
- `communicationMode = "customer-facing"` → 搜客户名 + main case number

OneNote 搜索：始终搜 AR case number（个人笔记）。

**AR-B3. compliance-check（带缓存）**

读取 `meta.compliance.entitlementOk`：
- 有值（true 或 false）→ **跳过**，沿用缓存
- 无值 → 执行 compliance-check（基于 main case 数据的 case-info.md）
- `entitlementOk === false` → 🔴 阻断（同普通路径 B3a）

**AR-B4. 等待后台 agent → AR Scope 提取 + 沟通模式检测 + status-judge**

等待 data-refresh + teams-search + onenote-case-search 完成后：

**AR-B4a. AR Scope 提取**（首次 or `ar.scopeConfirmed !== true`）

```
读取 {caseDir}/notes-ar.md + case-info.md（AR case title/description）
LLM 提取 AR scope 一句话摘要
Upsert meta: ar.scope = "{extracted_scope}", ar.scopeConfirmed = false
```

如果 `ar.scopeConfirmed === true`，跳过提取。

**AR-B4b. 沟通模式检测**

```
读取 {caseDir}/emails.md 最近几封邮件的 To/CC 字段
检查用户邮箱（fangkun@microsoft.com）是否在参与者中
是 → communicationMode = "customer-facing"
否 → communicationMode = "internal"
提取 case owner 邮箱/名字（从 case-info.md 的 Owner 字段）
Upsert meta: ar.communicationMode, ar.caseOwnerEmail, ar.caseOwnerName
```

**AR-B4c. AR Status Judge**

按 status-judge/SKILL.md 的 AR Mode 部分执行。传入 `isAR=true` 上下文。

**AR-B5. 按 actualStatus + communicationMode 路由**

| actualStatus | communicationMode | 执行 |
|---|---|---|
| `new` | any | troubleshooter（AR scope 内诊断）→ email-drafter |
| `pending-engineer` | `internal` | troubleshooter → email-drafter（收件人: case owner） |
| `pending-engineer` | `customer-facing` | troubleshooter → email-drafter（收件人: 客户，仅 AR scope） |
| `pending-customer` (days<3) | any | 无 agent |
| `pending-customer` (days≥3) | `internal` | email-drafter（follow-up to case owner） |
| `pending-customer` (days≥3) | `customer-facing` | email-drafter（follow-up to customer, AR scope only） |
| `pending-pg` | any | 无 agent |
| `researching` | any | troubleshooter（继续 AR scope 内诊断） |
| `ready-to-close` | `internal` | email-drafter（AR 完成总结 to case owner） |
| `ready-to-close` | `customer-facing` | email-drafter（AR scope 结论 to customer, CC case owner） |

spawn troubleshooter 时，prompt 中明确 AR scope：
```
prompt: |
  AR Case {caseNumber}，AR Scope: {ar.scope}
  沟通模式: {communicationMode}
  请只排查 AR scope 范围内的问题，不要排查 main case 的其他问题。
  ...
```

spawn email-drafter 时，prompt 中明确收件人和 scope：
```
prompt: |
  AR Case {caseNumber}，AR Scope: {ar.scope}
  沟通模式: {communicationMode}
  收件人: {根据模式选择 case owner email 或 客户 email}
  [内部模式] 邮件发给 case owner，总结 AR scope 内的发现和建议
  [客户面向模式] 邮件发给客户（reply-all from main case），仅回复 AR scope 内的问题
  ...
```

### AR Step 4. case-summary + todo + timing.json

按 inspection-writer/SKILL.md 的 AR 规则执行。case-summary.md 使用 AR 视角。generate-todo.sh 自动应用 AR 规则。

---
```

- [ ] **Step 3: Update the "Bash 调用次数" table to include AR scenarios**

After the existing table (line 248), add:

```markdown
| **AR 快速路径**（全缓存 + summary 存在） | 3 次 | ~15-30s |
| **AR 正常流程**（有变化） | 5-8 次：changegate + AR-B1~B5 + summary+todo+timing | ~120-240s |
```

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/casework/SKILL.md
git commit -m "feat(casework): add AR PATH branch with full execution flow"
```

---

### Task 12: End-to-End Verification

**Files:** No new files — verification only.

- [ ] **Step 1: Verify generate-todo.sh with AR meta**

```bash
mkdir -p /tmp/e2e-ar-test/todo /tmp/e2e-ar-test/logs
cat > /tmp/e2e-ar-test/casehealth-meta.json << 'METAEOF'
{
  "caseNumber": "2603300030003153001",
  "isAR": true,
  "mainCaseId": "2603300030003153",
  "actualStatus": "new",
  "daysSinceLastContact": 0,
  "statusJudgedAt": "2026-04-02T10:00:00+08:00",
  "compliance": { "entitlementOk": true, "serviceLevel": "Premier" },
  "ar": {
    "scope": "Azure VM performance diagnosis",
    "scopeConfirmed": false,
    "communicationMode": "internal",
    "caseOwnerEmail": "case.owner@microsoft.com",
    "caseOwnerName": "Case Owner"
  }
}
METAEOF
bash skills/d365-case-ops/scripts/generate-todo.sh /tmp/e2e-ar-test
cat /tmp/e2e-ar-test/todo/*.md
```

Expected output should contain:
- 🔴: (none — `new` with days=0 doesn't trigger pending-engineer red)
- 🟡: "AR Scope: Azure VM performance diagnosis，请确认是否准确"
- ✅: "AR Case | Main: 2603300030003153 | Mode: internal", "Entitlement 合规（Premier）"
- NO IR SLA items

- [ ] **Step 2: Verify generate-todo.sh with ready-to-close AR**

```bash
mkdir -p /tmp/e2e-ar-close/todo /tmp/e2e-ar-close/logs
cat > /tmp/e2e-ar-close/casehealth-meta.json << 'METAEOF'
{
  "caseNumber": "2603300030003153001",
  "isAR": true,
  "mainCaseId": "2603300030003153",
  "actualStatus": "ready-to-close",
  "daysSinceLastContact": 1,
  "statusJudgedAt": "2026-04-02T10:00:00+08:00",
  "compliance": { "entitlementOk": true, "serviceLevel": "Premier" },
  "ar": {
    "scope": "Azure VM performance diagnosis",
    "scopeConfirmed": true,
    "communicationMode": "customer-facing",
    "caseOwnerEmail": "case.owner@microsoft.com",
    "caseOwnerName": "Case Owner"
  }
}
METAEOF
bash skills/d365-case-ops/scripts/generate-todo.sh /tmp/e2e-ar-close
cat /tmp/e2e-ar-close/todo/*.md
```

Expected:
- 🟡: "AR 工作完成，通知 case owner: Case Owner (case.owner@microsoft.com)" (NOT generic "准备关单")
- ✅: "AR Scope 已确认: Azure VM performance diagnosis"

- [ ] **Step 3: Verify non-AR case regression**

```bash
mkdir -p /tmp/e2e-normal/todo /tmp/e2e-normal/logs
cat > /tmp/e2e-normal/casehealth-meta.json << 'METAEOF'
{
  "caseNumber": "2603250010001221",
  "actualStatus": "new",
  "daysSinceLastContact": 0,
  "statusJudgedAt": "2026-04-02T10:00:00+08:00",
  "irSla": { "status": "In Progress" },
  "compliance": { "entitlementOk": true, "serviceLevel": "Premier" }
}
METAEOF
bash skills/d365-case-ops/scripts/generate-todo.sh /tmp/e2e-normal
cat /tmp/e2e-normal/todo/*.md
```

Expected: Standard todo with IR SLA warning, no AR items.

- [ ] **Step 4: Verify casework-fast-path.sh with AR meta**

```bash
mkdir -p /tmp/e2e-ar-fp/todo /tmp/e2e-ar-fp/logs /tmp/e2e-ar-fp/teams
echo "$(date +%s)" > /tmp/e2e-ar-fp/teams/_cache-epoch
cat > /tmp/e2e-ar-fp/case-info.md << 'CIEOF'
# Case Info — 2603300030003153001
## Emails (5)
## Notes (2)
| Field | Value |
|-------|-------|
| ICM Number | |
CIEOF
cat > /tmp/e2e-ar-fp/casehealth-meta.json << 'METAEOF'
{
  "caseNumber": "2603300030003153001",
  "isAR": true,
  "mainCaseId": "2603300030003153",
  "actualStatus": "pending-pg",
  "daysSinceLastContact": 1,
  "statusJudgedAt": "2026-04-02T10:00:00+08:00",
  "emailCountAtJudge": 5,
  "noteCountAtJudge": 2,
  "icmIdAtJudge": "",
  "compliance": { "entitlementOk": true, "serviceLevel": "Premier" },
  "ccAccount": null,
  "ar": {
    "scope": "test",
    "scopeConfirmed": true,
    "communicationMode": "internal",
    "caseOwnerEmail": "a@b.com",
    "caseOwnerName": "Test"
  }
}
METAEOF
bash skills/d365-case-ops/scripts/casework-fast-path.sh /tmp/e2e-ar-fp "emails=5,notes=2"
```

Expected: `FAST_PATH_OK|status=pending-pg,days=1,...,isAR=true`

- [ ] **Step 5: Clean up test directories**

```bash
rm -rf /tmp/e2e-ar-test /tmp/e2e-ar-close /tmp/e2e-normal /tmp/e2e-ar-fp
```

- [ ] **Step 6: Clean up explorer-generated files (if any)**

```bash
rm -f IMPLEMENTATION_PLAN_AR_CASEWORK.md AR_IMPLEMENTATION_SUMMARY.txt 2>/dev/null
```

- [ ] **Step 7: Final commit with all docs**

```bash
git add -A
git status
git commit -m "feat: complete AR casework implementation — todo, fast-path, data-refresh, skills docs"
```
