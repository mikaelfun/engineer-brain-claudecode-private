---
description: "写邮件草稿 + humanizer 润色。作为 act 动态链的 inline/subagent action 执行。"
name: casework:act:draft-email
displayName: 邮件草稿
category: casework-act-action
stability: stable
executionMode: inline-preferred
requiredInput: caseNumber, caseDir, emailType
---

# Email Drafter Agent

## 职责
根据 Case 情况写邮件草稿，使用 humanizer 去 AI 味。

## 输入
- `caseNumber`: Case 编号
- `caseDir`: Case 数据目录路径
- `emailType`: 邮件类型
  - `auto` — AI 自动识别（根据 actualStatus + 邮件历史选择最合适的类型）
  - `initial-response` — 初始回复
  - `request-info` — 请求信息
  - `result-confirm` — 结果确认
  - `follow-up` — 跟进
  - `closure-confirm` — 关单确认（礼貌确认客户问题是否已解决，是否可以关单；不执行关单操作）
  - `closure` — 关单（客户已明确同意关单后使用）
  - `21v-convert-ir` — 21V 转 IR
- `language` (可选): `en` | `zh`，默认 `en`
- `recipient` (可选): `customer` | `pg` | `internal`，默认 `customer`

## 前置条件
需要 `{caseDir}/case-info.md` 已存在。

## 执行日志

**每个步骤执行前后都必须写入日志文件。**

日志路径通过 `state.json` 中的 `runId` 决定：
```bash
RUN_ID=$(python3 -c "import json; print(json.load(open('{caseDir}/.casework/state.json',encoding='utf-8')).get('runId',''))" 2>/dev/null)
LOG="{caseDir}/.casework/runs/$RUN_ID/agents/email-drafter.log"
mkdir -p "$(dirname "$LOG")"
```
格式：`[YYYY-MM-DD HH:MM:SS] STEP {n} {OK|FAIL|SKIP} | {描述}`
用 Bash echo append 写入。

## 执行步骤

### 0. 语言自动检测（当 language 未指定或为 `auto` 时）

如果 `language` 参数未提供、为空、或为 `auto`：
1. 读取 `{caseDir}/emails.md`
2. 提取**客户发送的邮件内容**（不含系统邮件和工程师回复）
3. 统计客户邮件中 CJK 字符（Unicode 范围 `\u4e00-\u9fff\u3400-\u4dbf`）占总字符的比例
4. 判断规则：
   - CJK 字符比例 > 20% → `language = zh`
   - 否则 → `language = en`
5. 在日志中记录：`STEP 0 OK | lang={detected} (auto-detected from emails, CJK ratio={ratio}%)`

如果 `emails.md` 不存在或为空，默认 `language = en`，日志记录 `STEP 0 OK | lang=en (default, no emails found)`。

如果 `language` 参数已明确指定（`en` 或 `zh`），跳过检测，日志记录 `STEP 0 SKIP | lang={specified} (explicitly set)`。

### 1. 读取上下文
- `{caseDir}/case-info.md` — 客户信息、联系方式
- `{caseDir}/emails.md` — 邮件历史（延续语气和上下文）
- `{caseDir}/analysis/` — 分析报告（如有，引用结论）
- `{caseDir}/casework-meta.json` — 读取 `ccEmails` 字段（RDSE CC 联系人）
- `playbooks/guides/email-templates.md` — 邮件模板
- `playbooks/guides/customer-communication.md` — 沟通规范
- `{caseDir}/.casework/claims.json`（如存在）— 证据链声明状态
- `{caseDir}/challenge-report.md`（如存在）— Challenger 审查报告
- `playbooks/email-samples/` — 参考样本

### 2. 选择模板
如果 `emailType` 是 `auto`：
1. 读 `{caseDir}/casework-meta.json` 获取 `actualStatus`
2. 读邮件历史判断最近沟通方向
3. 自动选择：
   - `new` → `initial-response`
   - `pending-engineer` → `follow-up` 或 `result-confirm`（根据是否有分析结论）
   - `pending-customer` 且 daysSinceLastContact ≥ 3 → `follow-up`
   - `ready-to-close` → 读 `statusReasoning` 进一步判断：
     - 客户已明确确认解决/同意关单（如"客户同意"、"confirmed"、"temp close"）→ **`closure`**（执行关单总结，三段式 `=============` 格式）
     - 客户暗示解决但未明确说关单（如"感谢回复"、无后续问题）→ **`closure-confirm`**（询问能否关单）
   - `resolved` / `closed` → `closure`
   - 其他 → `follow-up`
4. 在日志中记录选择的类型和原因

根据最终确定的 `emailType` 选择对应的邮件模板，填充 Case 信息。

### 2.5 必须读取对应样本（不可跳过）

> 🚨 **强制步骤**：在写任何邮件内容之前，必须先 `Read` 对应的样本文件。不读样本直接写 = 不合格。

| emailType | 必须读取的样本文件 |
|-----------|------------------|
| initial-response | `playbooks/email-samples/initial response.txt` |
| 21v-convert-ir | `playbooks/email-samples/initial response 21v convert.txt` |
| request-info | `playbooks/email-samples/answer customer query.txt` |
| result-confirm | `playbooks/email-samples/answer customer query.txt` |
| follow-up | `playbooks/email-samples/follow up.txt` |
| closure-confirm | `playbooks/email-samples/closure confirm.txt` |
| closure | `playbooks/email-samples/case closure.txt` |

读取后**严格匹配样本的格式结构**（段落顺序、分隔符、签名格式），内容替换为当前 case 的具体信息。

### 3. 写草稿
- 遵循 customer-communication.md 中的语气和格式规范
- 参考邮件历史延续上下文
- 如有分析报告，引用关键结论
- **视角：工程师写给客户**，不是给第三方描述客户：
  - ✅ "Hi John," / "您好 张先生,"（从 case-info.md 或邮件历史提取客户名）
  - ❌ "客户xxx反馈了…" / "The customer reported…"
  - 使用 "you / your" 或 "您" 直接称呼客户，不用 "客户" "the customer" 等第三人称
  - 签名使用 Kun Fang（从 case-info.md 的 ownerName 取）
- **claims.json 感知**（如存在）：
  - `status: verified` 的 claim → 邮件中自信引用，使用确定性语气
  - `status: challenged` 的 claim → 试探性语气表达（如 "Based on our initial analysis, it appears..." / "根据初步分析，可能是..."）
  - `status: rejected` 的 claim → **不写入邮件**
  - `status: pending` 的 claim → 按原有逻辑（向后兼容）
  - 如 claims.json 不存在 → 按原有逻辑（向后兼容）

### 4. Humanizer 润色
根据最终确定的语言（Step 0 自动检测或显式指定）选择 humanizer：
- English: 调用 humanizer skill
  ```
  读取 {projectRoot}/.claude/skills/humanizer/SKILL.md 获取使用说明，按说明润色草稿
  ```
- Chinese: 调用 humanizer-zh skill
  ```
  读取 {projectRoot}/.claude/skills/humanizer/rules-zh.md #SKILL.md 获取使用说明，按说明润色草稿
  ```

> ⚠️ humanizer 在 `skills/` 目录下（不是 `.claude/skills/`）。如果 Read 报 file not found，尝试 `./.claude/skills/humanizer/rules-zh.md #SKILL.md`。

### 5. 保存草稿
输出到 `{caseDir}/drafts/YYYYMMDD-HHMM-{type}-{lang}-{recipient}.md`：
```markdown
# Email Draft — {type}

**To:** {recipient email}
**CC:** {ccEmails from casework-meta.json}
**Subject:** {subject line}
**Language:** {en|zh}
**Type:** {emailType}

---

{邮件正文}

---

_Generated at {timestamp} | Humanized: ✅_
```

**CC 行规则：**
- **仅在 `emailType` 为 `initial-response` 且 `casework-meta.json` 中存在 `ccEmails` 字段时**才添加 `**CC:**` 行
- 其他邮件类型（follow-up、closure 等）或无 `ccEmails` 时，省略 `**CC:**` 行
- CC 内容直接使用 `ccEmails` 的值（分号分隔的邮件列表）

### 5a. Challenger 触发的 request-info 模式

当由 casework auto-loop 触发（emailType 为 `request-info` 且 prompt 中包含 Challenger 审查信息）时：

- 从 prompt 中提取 Challenger 发现的「需要的额外信息」列表
- 邮件焦点：收集能验证或推翻待定结论的具体信息
- 将技术问题转化为客户容易回答的具体问题
- **不要暴露内部审查流程**（不要提到 Challenger、claims、evidence chain 等内部概念）
- 语气自然，像正常的信息收集邮件

## 输出文件
- `{caseDir}/drafts/YYYYMMDD-HHMM-{type}-{lang}-{recipient}.md` — 邮件草稿

## 注意
- ❌ 不直接发送邮件
- 草稿展示给用户审阅后由用户自行发送
