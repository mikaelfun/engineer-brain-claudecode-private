---
description: "Assess — compliance gate + subagent enrichment + actualStatus/actions 决策。作为 act 的第一个 action 执行（不再是独立顶层步骤），读 .casework/data-refresh-output.json 写 .casework/execution-plan.json"
name: casework:assess
displayName: Case 状态评估（act 内部组件）
category: casework-sub-skill
stability: beta
requiredInput: caseNumber
promptTemplate: |
  Run assess for Case {caseNumber}. Read .claude/skills/casework/assess/SKILL.md and follow all steps.
allowed-tools:
  - Bash
  - Read
  - Write
  - Agent
---

# /casework:assess — Step 2 Assess

基于 `.casework/data-refresh-output.json`（Step 1 `/casework:data-refresh` 产出）做状态判断 + 行动规划，产出 `.casework/execution-plan.json`。

## 输入契约

- `{caseDir}/.casework/data-refresh-output.json` — 必须存在（Step 1 成功产物）
- `{caseDir}/casework-meta.json` — 累计元数据（首次运行可不存在）
- `{caseDir}/case-info.md` — D365 snapshot（用于 compliance hash）
- `{caseDir}/notes-ar.md` — AR 专属 notes（仅 AR case 存在，可选）

## 输出契约

- `{caseDir}/casework-meta.json` — upsert（compliance、actualStatus、lastInspected 等字段；AR case 额外含 `ar.scope`、`ar.communicationMode`、`ar.caseOwnerEmail`、`ar.caseOwnerName`、`ar.scopeConfirmed`）
- `{caseDir}/.casework/execution-plan.json` — PRD §4.3 schema

## 执行步骤

### Step 1. DELTA_EMPTY 快速路径

读 `.casework/data-refresh-output.json`，如 `deltaStatus == "DELTA_EMPTY"`：

**ISS-235 过期检查**：先检查 `casework-meta.json → nextFollowUpDate`，若 today >= nextFollowUpDate 则跳出快速路径强制走 LLM re-assess。

```bash
DELTA=$(python3 -c "import json; print(json.load(open(r'{caseDir}/.casework/data-refresh-output.json'))['deltaStatus'])")
if [ "$DELTA" = "DELTA_EMPTY" ]; then
  META=$(cat "{caseDir}/casework-meta.json" 2>/dev/null || echo '{}')

  # ISS-235: Check nextFollowUpDate expiry — if today >= date, force LLM re-assess
  FOLLOW_UP_EXPIRED=$(python3 -c "
import json, sys, datetime
try:
    m = json.load(open(r'{caseDir}/casework-meta.json', encoding='utf-8'))
    nfd = m.get('nextFollowUpDate', '')
    if nfd:
        target = datetime.date.fromisoformat(nfd)
        if datetime.date.today() >= target:
            print('EXPIRED')
            sys.exit(0)
except Exception:
    pass
print('OK')
" 2>/dev/null || echo "OK")

  if [ "$FOLLOW_UP_EXPIRED" = "EXPIRED" ]; then
    echo "DELTA_EMPTY_EXPIRED|nextFollowUpDate reached, forcing LLM re-assess"
    # Fall through to Step 2 (do NOT exit)
  else
    STATUS=$(echo "$META" | python3 -c "import json,sys; print(json.load(sys.stdin).get('actualStatus','researching'))")
    DAYS=$(echo "$META"  | python3 -c "import json,sys; print(json.load(sys.stdin).get('daysSinceLastContact',0))")
    REASONING=$(echo "$META" | python3 -c "import json,sys; r=json.load(sys.stdin).get('statusReasoning',''); print(r.replace('\"','\\\\\"')[:200])")
    cat > /tmp/assess-dec-$$.json <<EOF
{"caseNumber":"{caseNumber}","actualStatus":"$STATUS","daysSinceLastContact":$DAYS,
 "statusReasoning":"$REASONING",
 "actions":[],"noActionReason":"DELTA_EMPTY — no new data, reusing meta","routingSource":"rule-table"}
EOF
    python3 .claude/skills/casework/assess/scripts/write-execution-plan.py \
      --decision /tmp/assess-dec-$$.json --case-dir "{caseDir}"
    rm -f /tmp/assess-dec-$$.json
    # Update lastAssessedAt even on fast path (ISS-227: prevents timing cross-run drift)
    python3 -c "
import json, time, os
p = r'{caseDir}/casework-meta.json'
try: m = json.load(open(p, encoding='utf-8'))
except: m = {}
m['lastAssessedAt'] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
json.dump(m, open(p, 'w', encoding='utf-8'), indent=2, ensure_ascii=False)
"
    echo "ASSESS_OK|delta=empty|elapsed=${SECONDS}s"
    exit 0
  fi
fi
```

### Step 2. Compliance gate（hash cache）

PRD §2.5：字段 hash 匹配则复用缓存，否则 re-infer via LLM。

```bash
CURRENT_HASH=$(bash .claude/skills/casework/assess/scripts/compliance-hash.sh "{caseDir}/case-info.md")
CACHED_HASH=$(python3 -c "
import json
try: print(json.load(open(r'{caseDir}/casework-meta.json'))['compliance']['sourceHash'])
except: print('')
")

if [ "$CURRENT_HASH" = "$CACHED_HASH" ] && [ -n "$CURRENT_HASH" ]; then
  COMPLIANCE_PATH="cache-hit"
else
  COMPLIANCE_PATH="re-infer"
fi
```

**re-infer 路径**：hash 不匹配时，读取 `compliance-rules.md` 执行完整 compliance-check：

> **按需加载**：读取 `.claude/skills/casework/assess/compliance-rules.md` 获取 Entitlement 判定规则、21v Convert 检测、CC Finder、SAP 三层检查的完整规则，然后执行。cache-hit 路径不读此文件。

**entitlementOk === false 时直接阻断**：写 execution-plan.json 带 `actualStatus=ready-to-close`、`noActionReason="compliance: not supported"`，跳过 Step 3/4。阻断时 warnings 必须包含具体原因（见 compliance-rules.md），供 summarize 阶段写入 todo。
**sapOk === false 时不阻断**，但 warnings 传入 LLM prompt context，LLM 可在 actions 中建议修改 SAP。若 compliance 产出了 `suggestedSap`（来自 match-sap 脚本化检查），LLM 应在 actions 中用 `suggestedSap.path` 作为推荐 SAP 路径。
**is21vConvert === true 时**，LLM 的 email-drafter action 应使用 emailType=`21v-convert-ir`（如果是首次 IR）。

### Step 2.5. AR Enrichment（仅 `isAR=true` 时执行）

> **按需加载**：当 `casework-meta.json` 中 `isAR === true` 时，读取 `.claude/skills/casework/assess/ar-rules.md` 的 Step 2.5 章节执行 AR scope 提取 + communicationMode 检测 + AR-specific OneNote/Teams 调整。非 AR case 跳过，不读此文件。

### Step 3. Enrichment digest（已由 data-refresh 完成）

> V2 设计：digest 在 data-refresh.sh 第 6 步并行生成（Teams + OneNote 各一个后台 LLM API call），assess 只 Read 成品文件。

**Degraded 处理（T2.9.2）**：当 data-refresh-output.json 中 `teams.status=FAILED` 或 `onenote.status=FAILED` 时：
- 在 Step 4 LLM prompt 里标注 `⚠️ teams-refresh-degraded` / `⚠️ onenote-refresh-degraded`
- 写 execution-plan 时把 degraded 源列进 `warnings[]`

**产出文件（Step 4 直接 Read）**：
| 数据源 | 产出 | 模板 |
|--------|------|------|
| Teams | `{caseDir}/teams/teams-digest.md` | `.claude/skills/casework/data-refresh/teams-search/teams-digest-template.md` |
| OneNote | `{caseDir}/onenote/onenote-digest.md` | `.claude/skills/onenote/onenote-digest-template.md` |

**失败隔离**：digest 文件不存在 → Step 4 LLM 不引用该数据源，继续运行。

> **性能影响**：raw 文件直接进 Step 4 LLM context，增加 input tokens 但省去 2 次 subagent spawn 开销（~30s 冷启动）。对于 patrol 的 3-10 case 并行场景，总体更快。

**失败隔离**：`_page-*.md` 不存在 → 跳过 OneNote 分析，Step 4 LLM 不引用 OneNote context。

### Step 4. 主 LLM：actualStatus + actions 决策

读 context：
- `{caseDir}/.casework/data-refresh-output.json` → delta + context（含 `deltaContent` md）
- `{caseDir}/casework-meta.json` → 历史 actualStatus / compliance
- Teams 数据：引用 Step 3 产出的 `{caseDir}/teams/teams-digest.md`
- OneNote 数据：引用 Step 3 产出的 `{caseDir}/onenote/onenote-digest.md`

**Prompt 模板**：

```
你是 D365 Case 状态判定助手。基于以下 context 产出 JSON 决策。

## 判定原则（必须遵守）

### actualStatus 信号分层
actualStatus 是对**实际沟通状态**的事实判断，仅基于已发生的沟通事实推理：
- ✅ 输入信号：邮件方向+内容（谁发的、说了什么）、Notes 记录、ICM 当前状态、Teams 对话 Key Facts
- ❌ 不作为 actualStatus 输入：`drafts/` 未发送草稿、`analysis/` 排查文件、todo 待办项
- drafts/analysis 只在 actions 决策中使用，不应回流污染 actualStatus 判断

### `new` 的使用极其严格
只有当 emails.md 中**完全没有工程师（fangkun / support@mail.support.microsoft.com）发出的邮件**时，才判定为 `new`。
已有工程师发出的任何邮件（IR、排查结果、follow-up）→ 不是 `new`，根据邮件内容判定其他状态。

### 首次运行陷阱
无 meta 历史状态不能默认 `new`。Case 可能已被手动处理过。**必须先看邮件和 notes 的实际内容再判定。**

### 邮件方向 ≠ 状态
最后一封邮件方向不等于状态，需结合内容理解意图（客户发"谢谢"≠ pending-engineer）。

### ICM ≠ pending-pg
有 ICM 不自动等于 pending-pg。PG 仍处理 → pending-pg；PG 已完成/已回复 → 可能 pending-engineer。

### daysSinceLastContact 定义
最后一封**工程师发出邮件**到现在的自然日天数（不是客户发出的）。

### AR Mode 判断（仅 isAR=true 时适用）

> **按需加载**：当 `isAR=true` 时，读取 `.claude/skills/casework/assess/ar-rules.md` 的 "Step 4 AR Mode 判断规则" + "AR Context 注入模板" 章节，替代上述普通模式判断规则。非 AR case 不读此文件。

## Context
### meta (casework-meta.json)
{meta_json}

### delta (data-refresh-output.refreshResults + deltaContent)
{delta_md}

### teams digest (if exists)
{teams_digest_md_or_"(none)"}

### onenote notes (if exists, already classified)
{onenote_md_or_"(none)"}

## 输出（纯 JSON，无 markdown 包裹）
{
  "caseNumber": "{caseNumber}",
  "actualStatus": "<one of: pending-engineer|pending-customer|pending-pg|researching|ready-to-close|resolved|closed>",
  "daysSinceLastContact": <int — 距工程师最后发出邮件的天数>,
  "statusReasoning": "<≤200字，关键依据 → {actualStatus}>",
  "actions": [
    // 允许的 type: troubleshooter / email-drafter / challenger / note-gap / labor-estimate
    // 允许的 status: pending
    // ⚠️ v4 规则：当 actions 包含 troubleshooter 时，email 类型统一由 reassess 步骤决定。
    //    deferredActions 字段保留向后兼容但不再影响路由——所有含 troubleshooter 的场景都会走 reassess。
    //    IR-first 例外不变：new case 同时输出 troubleshooter + email-drafter(initial-response)。
    // email-drafter 需额外字段 "emailType"（仅不含 troubleshooter 的场景 + IR-first 场景使用）：
    //   - initial-response: 首次回复客户（工程师从未发过邮件）
    //   - 21v-convert-ir: 21V 转 IR（is21vConvert=true 时）
    //   - request-info: 向客户请求更多信息以继续排查
    //   - result-confirm: 排查完成，向客户确认结果
    //   - follow-up: 跟进邮件（等待中的状态更新、催促等）
    //   - closure-confirm: 客户暗示问题解决但未明确说可以关单（如"谢谢"、无后续问题），需要询问客户是否可以关单
    //   - closure: 客户已明确同意关单/已明确确认问题解决（如"可以关"、"temp close"、"confirmed"、"同意关闭"），发送关单总结邮件（三段式：问题描述/问题建议/更多信息）
    //   ⚠️ closure vs closure-confirm 区分关键：客户是否已"明确表态"可以关。
    //      已明确 → closure（发总结）；未明确 → closure-confirm（询问能否关）
    // 可引用 "dependsOn": "<previous action type>"
  ],
  "deferredActions": ["email-drafter"] | [],
  // ⚠️ 当 actions 包含 troubleshooter 时，必须设 deferredActions: ["email-drafter"]
  //    当不含 troubleshooter 时，设 deferredActions: []
  "deferReason": "<string — 为什么 defer，如 'email type TBD after troubleshoot reassess'> | null",
  "noActionReason": "<string or null>",
  "routingSource": "llm",
  "nextFollowUpDate": "<ISO date (YYYY-MM-DD) or null>"
  // nextFollowUpDate 规则（ISS-235：DELTA_EMPTY 过期机制）：
  // - pending-customer + 提到未来日期事件（版本发布、会议、PG deadline）→ 设为该日期
  // - pending-customer 无明确日期 → 设为 today + 3 天（默认 follow-up 间隔）
  // - pending-engineer / ready-to-close / researching → null（不需要等待到期触发）
  // 当 DELTA_EMPTY 且 today >= nextFollowUpDate 时强制走 LLM re-assess
}
```

决策规则（判定优先级）：
1. compliance.entitlementOk === false → actualStatus=ready-to-close, actions=[]
2. 客户最新回复后 < 1 day + 无工程师后续 → pending-engineer + troubleshooter, deferredActions=["email-drafter"]
   （email 类型由 reassess 根据排查结论决定）
3. 工程师发出 follow-up 后 > 3 days 无客户回复 → pending-customer + email-drafter(follow-up)
   （无 troubleshooter → 不 defer）
4. ICM 有 PG 新 entry 且 PG 仍在处理 → pending-pg：
   - daysSinceLastContact < 5 → actions=[]（等 PG，客户近期已收到更新）
   - daysSinceLastContact ≥ 5 → actions=[email-drafter(follow-up)]，向客户更新当前状态（"PG 仍在调查中，我们持续跟进"）
5. actualStatus=ready-to-close（问题已解决 / 客户表态可关）→ 分流 closure vs closure-confirm：
   - 客户**明确表态**可以关单（如在邮件/Teams 中说"可以关"、"temp close"、"confirmed"、"同意关闭"、"go ahead"）→ email-drafter(closure)
   - 客户**暗示**问题解决但**未明确说关单**（如"谢谢"、无后续提问、长时间无回复）→ email-drafter(closure-confirm)
6. 其余（数据不足 / 正在排查） → researching + troubleshooter, deferredActions=["email-drafter"]

**actions 推理指导**（非严格规则，LLM 综合判断）：
1. 排查已完成 + 邮件已发送 + ICM pending PG → `no-agent`（等 PG）
2. 有未发送草稿（`drafts/`）且内容仍相关 → actions=[], noActionReason="unsent draft exists"
3. 排查完成但未告知客户 → email-drafter（不需 troubleshooter）
4. 有新信息需排查（客户新数据、PG 新回复）→ troubleshooter
5. 新 case（`new` 状态，无工程师邮件）+ 需初始排查 → troubleshooter + email-drafter(initial-response)
6. 判断不确定 → actions=[]（让 act 的 fallback 路由表处理）
7. 有 troubleshooter action → deferredActions=["email-drafter"]（向后兼容，不影响路由）
   → v4: 所有含 troubleshooter 的场景都走 reassess，reassess 决定 email 类型
   → IR-first 例外不变：new case 同时输出 email-drafter(initial-response) + troubleshooter

**邮件去重规则**（推荐 email-drafter 前必须检查）：
- 读 `{caseDir}/emails.md` 检查工程师是否已发过同类型邮件（IR/follow-up/closure）
- 已发过 IR 邮件（含 21v convert IR）→ 不再推荐 email-drafter(initial-response)
- 已发过 follow-up 且 < 3 天 → 不再推荐 email-drafter(follow-up)
- 已发过 closure-confirm → 不再推荐 email-drafter(closure-confirm)
- `{caseDir}/drafts/` 有未发送草稿且内容仍相关 → 推荐 `no-agent`（用户只需发送现有草稿）
- AR 模式额外去重规则见 `ar-rules.md` "AR 邮件去重补充" 章节
- 违反去重 = 重复骚扰客户，3.25 红线

LLM 返回 JSON 后写 decision 文件，调 `write-execution-plan.py`：

```bash
echo "$LLM_JSON" > "{caseDir}/.casework/assess-decision.json"
python3 .claude/skills/casework/assess/scripts/write-execution-plan.py \
  --decision "{caseDir}/.casework/assess-decision.json" --case-dir "{caseDir}"
```

**Per-run snapshot**: 同时保存到 run 目录供审计：
```bash
EP_DIR=$(bash .claude/skills/casework/scripts/resolve-run-path.sh "{caseDir}" ".")
cp "{caseDir}/.casework/assess-decision.json" "$EP_DIR/assess-decision.json" 2>/dev/null || true
```

### Step 5. 更新 casework-meta.json

upsert 字段：
- `actualStatus` ← LLM 决策
- `daysSinceLastContact` ← LLM 决策（或从 data-refresh-output 透传）
- `statusReasoning` ← LLM 决策（≤200 字，以 `→ {actualStatus}` 结尾）
- `nextFollowUpDate` ← LLM 决策（ISO date 或 null，ISS-235）
- `lastAssessedAt` ← ISO now
- `compliance.sourceHash` / `.entitlementOk` / `.checkedAt` ← Step 2 产物（若 re-infer）

```bash
python3 - <<PYEOF
import json, time
p = r'{caseDir}/casework-meta.json'
try: m = json.load(open(p, encoding='utf-8'))
except: m = {}
m['actualStatus'] = '$STATUS'
m['daysSinceLastContact'] = int('$DAYS')
m['statusJudgedAt'] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
m['statusReasoning'] = '''$REASONING'''.strip()[:200]
m['lastAssessedAt'] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
# ISS-235: nextFollowUpDate — DELTA_EMPTY 过期机制
nfd = '''$NEXT_FOLLOW_UP_DATE'''.strip()
if nfd and nfd != 'null' and nfd != 'None':
    m['nextFollowUpDate'] = nfd
elif 'nextFollowUpDate' in m:
    del m['nextFollowUpDate']  # 清除旧值（非 pending-customer 时）
# compliance merge (如 Step 2 re-infer)
if '$COMPLIANCE_PATH' == 're-infer':
    m['compliance'] = json.loads('''$COMPLIANCE_JSON''')
json.dump(m, open(p, 'w', encoding='utf-8'), indent=2, ensure_ascii=False)
PYEOF
```

### Step 6. Emit completion signal

```
ASSESS_OK|delta=ok|status={actualStatus}|actions={N}|compliance={cache-hit|re-infer}|elapsed={S}s
```

## Safety Redlines

- ❌ 不调 D365 写操作（add-note / record-labor）
- ❌ 不发邮件（email-drafter 产出只写到 drafts/）
- ❌ 不修改 `teams/*.md` chat 原始文件（subagent 职责）
- ✅ compliance.entitlementOk === false 直接阻断 Step 3/4，避免浪费 LLM

## Pitfalls (known)

- **Git Bash `/tmp/` 路径跨 shell 漂移（T2.9.3）**：MSYS Bash 写到 `/tmp/...`，Windows Python `open()` 会把 `/tmp/` 解析到 `C:\Users\...\AppData\Local\Temp\`——两边路径不一致导致 `FileNotFoundError`。**规则**：所有 LLM decision / intermediate tmp file 写到 **`{caseDir}/.casework/`** 下（已挂载在相同 Windows mount，无漂移），不要用 `/tmp/`。
- **compliance-hash 字段对齐（T2.9.1）**：真实 case-info.md 用 `## Entitlement` heading + `| Service Level | Premier |` 子字段 + 顶层 `| SAP |` 行，**不是** `| Entitlement |` / `| SAP Code |` row。utility 已对齐；手写 fixture 时务必按真实格式。
- **Degraded 源不是空信号（T2.9.2）**：`teams.status=FAILED` 会 newMessages=0，但这**不**等于"客户没在 Teams 发消息"。gate-subagents.sh 的 `TEAMS_DEGRADED=1` 是真相来源，Step 3 / Step 4 都必须尊重。

## 错误处理

| 场景 | 行为 |
|------|------|
| `data-refresh-output.json` 不存在 | exit 2，提示先跑 `/casework:data-refresh` |
| compliance hash util 失败 | 视为 "re-infer"（保守，不用错误缓存） |
| teams-digest-writer 失败 | teams-digest.md 不生成，assess 主 LLM 不引用，继续 |
| onenote-classifier 失败 | onenote-digest.md 保持 search-inline 产出（无标注），assess 主 LLM 仍可读 |
| LLM 返回非法 JSON | write-execution-plan.py 校验失败 → exit 2 → 调用方（/casework）retry 一次 |
