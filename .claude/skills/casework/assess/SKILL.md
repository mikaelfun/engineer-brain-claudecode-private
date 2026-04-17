---
description: "Step 2 Assess — compliance gate + subagent enrichment + actualStatus/actions 决策，读 .casework/data-refresh-output.json 写 .casework/execution-plan.json"
name: casework:assess
displayName: Case 状态评估
category: casework-sub-skill
stability: beta
requiredInput: caseNumber
promptTemplate: |
  Run Step 2 (assess) for Case {caseNumber}. Read .claude/skills/casework/assess/SKILL.md and follow all steps.
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
- 从 `casework-meta.json` 复用 `actualStatus` + `daysSinceLastContact`
- 调 `write-execution-plan.py`，传：
  - `actualStatus = meta.actualStatus`
  - `actions = []`
  - `noActionReason = "DELTA_EMPTY — no new data, reusing meta"`
  - `routingSource = "rule-table"`
- **零 LLM 调用**，直接退出（输出 `ASSESS_OK|delta=empty|elapsed=Ns`）

```bash
DELTA=$(python3 -c "import json; print(json.load(open(r'{caseDir}/.casework/data-refresh-output.json'))['deltaStatus'])")
if [ "$DELTA" = "DELTA_EMPTY" ]; then
  META=$(cat "{caseDir}/casework-meta.json" 2>/dev/null || echo '{}')
  STATUS=$(echo "$META" | python3 -c "import json,sys; print(json.load(sys.stdin).get('actualStatus','researching'))")
  DAYS=$(echo "$META"  | python3 -c "import json,sys; print(json.load(sys.stdin).get('daysSinceLastContact',0))")
  cat > /tmp/assess-dec-$$.json <<EOF
{"caseNumber":"{caseNumber}","actualStatus":"$STATUS","daysSinceLastContact":$DAYS,
 "actions":[],"noActionReason":"DELTA_EMPTY — no new data, reusing meta","routingSource":"rule-table"}
EOF
  python3 .claude/skills/casework/assess/scripts/write-execution-plan.py \
    --decision /tmp/assess-dec-$$.json --case-dir "{caseDir}"
  rm -f /tmp/assess-dec-$$.json
  echo "ASSESS_OK|delta=empty|elapsed=${SECONDS}s"
  exit 0
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

**re-infer 路径**：hash 不匹配时，执行**完整 compliance-check**（不只是 entitlementOk）：

读取 `.claude/skills/compliance-check/SKILL.md` 的 Step 2-5 规则，依次执行：

1. **Entitlement 合规检查**（Step 2）：从 case-info.md 的 `## Entitlement` 表读取字段，按以下规则判定 entitlementOk：

   **判定规则（按 Service Level 分类）：**

   | Service Level | 合规条件 | 备注 |
   |---|---|---|
   | **Unified** | Service Name 或 Schedule 中含 **"China Cloud"** 或 **"21V"** 字样 | 必须有 21V Exhibit |
   | **Premier** | Service Name 或 Schedule 中含 **"China Cloud"** 或 **"21V"** 字样 | 必须有 21V Exhibit |
   | **Professional** | Service Name = **"21Vianet Cloud Escalation Service"** | 仅限 21Vianet 升级来的 case |
   | **ASfP** | 客户名匹配白名单（见下方） | Advanced Support for Partners，自带 21V Exhibit |

   **ASfP 白名单**（这些合作伙伴客户无需 21V Exhibit 关键词也算合规）：
   - 深圳市伊登软件有限公司 (Edensoft)
   - 厦门一维天地信息技术有限公司
   - 希意禧(上海)信息系统有限公司
   - Digital China Cloud Technology Limited (上海云角信息技术有限公司)

   **India Contract 排斥**：如果 Contract Country = India 且 case 在 Mooncake 队列 → `entitlementOk=false`，warnings 加 "India contract case misrouted to Mooncake queue"

   **判定逻辑**：
   - 匹配 Unified/Premier + 有 21V 信号 → `entitlementOk=true`
   - 匹配 Professional + Service Name 含 "21Vianet" → `entitlementOk=true`
   - 匹配 ASfP 白名单客户 → `entitlementOk=true`
   - 以上都不满足 → `entitlementOk=false`

   **entitlementOk=false 时的 warnings 应包含具体原因和后续建议**：
   - `"Unified/Premier contract lacks 21V Exhibit (no China Cloud/21V signal in Service Name or Schedule). Contact TA to confirm. If no exhibit, suggest customer raise case from portal.azure.cn."`
   - 或 `"India contract case misrouted to Mooncake queue. Transfer back to correct queue."`
   - 或 `"Professional case not from 21Vianet escalation. Service Name: {actual_value}."`
2. **21v Convert 检测**（Step 3）：从 Customer Statement 搜索 `21v ticket`/`21Vianet` → is21vConvert、21vCaseId
3. **CC Finder**（Step 4）：读 `{dataRoot}/mooncake-cc.json`，匹配客户名 → ccEmails、ccAccount（用于首次 IR 邮件 CC 行）
4. **SAP 三层检查**（Step 4.5）：读 `{dataRoot}/sap-scope.json`
   - 4.5a Mooncake 路径检测 → sapMooncake
   - 4.5b Pod 负责范围检测 → sapInPod
   - 4.5c SAP 与问题描述一致性 → sapMismatch
   → sapOk = sapMooncake && sapInPod && !sapMismatch

**AR SAP 特化**（`isAR=true` 时）：
- 4.5a/4.5b/4.5c 均使用 **`| AR Support Area Path |`** 行（而非主 case 的 `| SAP |` 行）
- AR 产品必须是 Mooncake，AR scope 必须在 pod 范围内
- 4.5c SAP 与**问题描述**一致性：使用 `| AR Support Area Path |` + `## AR Customer Statement`（AR SAP 匹配 AR 问题，不是 main case 问题）
- compliance 额外保存 `arSapPath` 字段

结果写 `casework-meta.json.compliance`（完整 schema 见 compliance-check/SKILL.md §5）：
```json
{
  "compliance": {
    "entitlementOk": true,
    "sourceHash": "$CURRENT_HASH",
    "checkedAt": "ISO",
    "is21vConvert": false,
    "21vCaseId": null,
    "sapOk": true,
    "sapMooncake": true,
    "sapInPod": true,
    "sapMismatch": false,
    "sapPath": "Azure/21Vianet Mooncake/...",
    "warnings": []
  },
  "ccAccount": "BMW AG",
  "ccEmails": "xxx@microsoft.com;yyy@microsoft.com"
}
```

**entitlementOk === false 时直接阻断**：写 execution-plan.json 带 `actualStatus=ready-to-close`、`noActionReason="compliance: not supported"`，跳过 Step 3/4。阻断时 warnings 必须包含具体原因（见 Step 2 规则），供 summarize 阶段写入 todo。
**sapOk === false 时不阻断**，但 warnings 传入 LLM prompt context，LLM 可在 actions 中建议修改 SAP。
**is21vConvert === true 时**，LLM 的 email-drafter action 应使用 emailType=`21v-convert-ir`（如果是首次 IR）。

### Step 2.5. AR Enrichment（仅 `isAR=true` 时执行）

> 当 `casework-meta.json` 中 `isAR === true` 时执行以下步骤，否则跳过直接进 Step 3。

#### 2.5a. AR Scope 提取（首次 or scopeConfirmed !== true）

```
读取 {caseDir}/notes-ar.md + case-info.md（AR case title + AR Customer Statement + AR Support Area Path）
LLM 提取 AR scope 一句话摘要
Upsert meta: ar.scope = "{extracted_scope}", ar.scopeConfirmed = false
```

如果 `meta.ar.scopeConfirmed === true`，跳过提取（scope 已手动确认）。

#### 2.5b. 沟通模式检测

```
读取 {caseDir}/emails.md 最近几封邮件的 To/CC 字段
检查工程师邮箱（fangkun@microsoft.com）是否在参与者中
是 → communicationMode = "customer-facing"
否 → communicationMode = "internal"
提取 case owner 邮箱/名字（从 case-info.md 的 Owner 字段）
Upsert meta: ar.communicationMode, ar.caseOwnerEmail, ar.caseOwnerName
```

#### 2.5c. AR-specific OneNote 分析

读 `{caseDir}/onenote/_page-*.md`，分析后**重写 `{caseDir}/onenote/onenote-digest.md`**。
格式模板：读取 `.claude/skills/onenote/onenote-digest-template.md`，按模板结构输出（Facts/Analysis 汇聚 + 详细页面 + Summary）。

#### 2.5d. AR-specific Teams 搜索关键词

根据沟通模式调整搜索关键词：
- `internal` → 搜 case owner 名 + AR case number
- `customer-facing` → 搜客户名 + main case number

### Step 3. Enrichment digest（已由 data-refresh 完成）

> V2 设计：digest 在 data-refresh.sh 第 6 步并行生成（Teams + OneNote 各一个后台 LLM API call），assess 只 Read 成品文件。

**Degraded 处理（T2.9.2）**：当 data-refresh-output.json 中 `teams.status=FAILED` 或 `onenote.status=FAILED` 时：
- 在 Step 4 LLM prompt 里标注 `⚠️ teams-refresh-degraded` / `⚠️ onenote-refresh-degraded`
- 写 execution-plan 时把 degraded 源列进 `warnings[]`

**产出文件（Step 4 直接 Read）**：
| 数据源 | 产出 | 模板 |
|--------|------|------|
| Teams | `{caseDir}/teams/teams-digest.md` | `.claude/skills/casework/teams-search/teams-digest-template.md` |
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

当 `isAR=true` 时，以下规则**替代**上述普通模式判断：

**内部模式** (`ar.communicationMode = "internal"`)：
- 你与 case owner 之间的沟通，不直接面对客户
- `pending-engineer` = case owner 在 notes/Teams 中提了新问题，你未回应
- `pending-customer` = 你在 notes 中回复了，等 case owner 反馈
- `ready-to-close` = AR scope 问题已解决，你已回复 case owner
- `daysSinceLastContact` = 距你最后一次在 `notes-ar.md` 中回复的天数

**客户面向模式** (`ar.communicationMode = "customer-facing"`)：
- 你被拉入客户邮件链，直接面对客户（但只处理 AR scope 内的问题）
- `pending-engineer` = 客户发了新的 AR scope 内问题，你未回复
- `pending-customer` = 你回复了客户（AR scope 内），等客户反馈
- `ready-to-close` = 客户确认 AR scope 问题已解决
- `daysSinceLastContact` = 距你最后一次在 `emails.md` 中给客户发邮件的天数

**AR 判断步骤**：
1. 读取 `notes-ar.md`（最后几条 note）
2. 读取 `emails.md` 最后 100 行
3. 读取 `ar.communicationMode` 和 `ar.scope`
4. **内部模式**：检查 notes-ar.md 最后一条 note 是谁写的
   - case owner → pending-engineer
   - 你 → pending-customer 或 researching
5. **客户面向模式**：分析 emails.md 最后几封邮件
   - 客户最后发邮件且涉及 AR scope → pending-engineer
   - 你最后发邮件（AR scope 回复）→ pending-customer

## Context（AR 时额外注入）
当 `isAR=true` 时，LLM prompt 额外注入以下 context：
```
## AR Context
- AR Scope: {ar.scope}
- Communication Mode: {ar.communicationMode}
- Case Owner: {ar.caseOwnerName} ({ar.caseOwnerEmail})
- Main Case: {mainCaseId}

### notes-ar.md (AR 专属 notes)
{notes_ar_tail}
```

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
  "statusReasoning": "<≤200字，关键依据 → {actualStatus}，例：'客户4/15回复部署中，2天未更新 → pending-customer'>",
  "actions": [
    // 允许的 type: troubleshooter / email-drafter / challenger / note-gap / labor-estimate
    // 允许的 status: pending
    // email-drafter 需额外字段 "emailType"
    // 可引用 "dependsOn": "<previous action type>"
  ],
  "noActionReason": "<string or null>",
  "routingSource": "llm"
}
```

决策规则（判定优先级）：
1. compliance.entitlementOk === false → actualStatus=ready-to-close, actions=[]
2. 客户最新回复后 < 1 day + 无工程师后续 → pending-engineer + troubleshooter 或 email-drafter
3. 工程师发出 follow-up 后 > 3 days 无客户回复 → pending-customer + email-drafter(follow-up)
4. ICM 有 PG 新 entry 且 PG 仍在处理 → pending-pg：
   - daysSinceLastContact < 5 → actions=[]（等 PG，客户近期已收到更新）
   - daysSinceLastContact ≥ 5 → actions=[email-drafter(follow-up)]，向客户更新当前状态（"PG 仍在调查中，我们持续跟进"）
5. 其余（数据不足 / 正在排查） → researching + troubleshooter

**actions 推理指导**（非严格规则，LLM 综合判断）：
1. 排查已完成 + 邮件已发送 + ICM pending PG → `no-agent`（等 PG）
2. 有未发送草稿（`drafts/`）且内容仍相关 → actions=[], noActionReason="unsent draft exists"
3. 排查完成但未告知客户 → email-drafter（不需 troubleshooter）
4. 有新信息需排查（客户新数据、PG 新回复）→ troubleshooter
5. 新 case（`new` 状态，无工程师邮件）+ 需初始排查 → troubleshooter + email-drafter(initial-response)
6. 判断不确定 → actions=[]（让 act 的 fallback 路由表处理）

**邮件去重规则**（推荐 email-drafter 前必须检查）：
- 读 `{caseDir}/emails.md` 检查工程师是否已发过同类型邮件（IR/follow-up/closure）
- 已发过 IR 邮件（含 21v convert IR）→ 不再推荐 email-drafter(initial-response)
- 已发过 follow-up 且 < 3 天 → 不再推荐 email-drafter(follow-up)
- 已发过 closure-confirm → 不再推荐 email-drafter(closure-confirm)
- `{caseDir}/drafts/` 有未发送草稿且内容仍相关 → 推荐 `no-agent`（用户只需发送现有草稿）
- AR 模式额外注意：internal 模式检查 `notes-ar.md` 最近回复，customer-facing 检查 `emails.md` 最近发出邮件
- 违反去重 = 重复骚扰客户，3.25 红线

LLM 返回 JSON 后写 decision 文件，调 `write-execution-plan.py`：

```bash
echo "$LLM_JSON" > /tmp/assess-dec-$$.json
python3 .claude/skills/casework/assess/scripts/write-execution-plan.py \
  --decision /tmp/assess-dec-$$.json --case-dir "{caseDir}"
rm -f /tmp/assess-dec-$$.json
```

### Step 5. 更新 casework-meta.json

upsert 字段：
- `actualStatus` ← LLM 决策
- `daysSinceLastContact` ← LLM 决策（或从 data-refresh-output 透传）
- `statusReasoning` ← LLM 决策（≤200 字，以 `→ {actualStatus}` 结尾）
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
m['lastAssessedAt'] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
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
