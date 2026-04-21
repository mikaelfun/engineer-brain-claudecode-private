---
description: "交互式技术排查：对指定 Case 执行 Kusto 诊断、文档搜索等技术分析，支持用户实时交互。"
name: troubleshoot
displayName: 技术排查
category: agent
stability: stable
requiredInput: caseNumber
mcpServers: [msft-learn, local-rag]
estimatedDuration: 120s
promptTemplate: |
  Interactive troubleshoot session for Case {caseNumber}. Read .claude/skills/casework/troubleshoot/SKILL.md for full instructions, then execute.
  {troubleshootContext}
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Grep
  - Agent
  - WebSearch
  - AskUserQuestion
---

# /troubleshoot — 交互式技术排查

对指定 Case 执行交互式技术排查。用户可以在排查过程中提供额外信息、纠正方向、或要求深入某个领域。

## 参数
- `$ARGUMENTS` — Case 编号
- `troubleshootContext` — 预注入的 case 上下文（由 stepCaseSession 自动拼接）

## 执行步骤

### Step 0. 理解预注入上下文

系统已将以下内容注入到 prompt 中（在 `{troubleshootContext}` 占位符处）：
- `case-summary.md` — Case 摘要（如有）
- `analysis/` 目录下的分析结果（如有）
- Case 目录结构

**不要**重复读取这些已注入的文件。直接使用 prompt 中的内容。

### Step 1. 询问用户意图

使用 `AskUserQuestion` 工具，展示以下选项：

```
question: "Case {caseNumber} 交互式排查。请选择你需要的操作："
options:
  - label: "用现有数据排查"
    description: "基于当前 case 数据直接执行技术排查"
  - label: "补充信息后排查"
    description: "先告诉我遗漏的信息或之前分析不准确的地方"
  - label: "刷新数据后排查"
    description: "先执行 data-refresh 获取最新数据，再排查"
```

### Step 2. 根据用户选择执行

**选项 1: "用现有数据排查"**
→ 跳到 Step 3 直接执行排查

**选项 2: "补充信息后排查"**
→ 使用 `AskUserQuestion` 收集用户补充信息：
```
question: "请描述需要补充的信息（如客户新提供的错误日志、资源 ID、问题复现步骤等）："
```
→ 收到信息后，将其作为额外上下文带入 Step 3

**选项 3: "刷新数据后排查"**
→ 执行 data-refresh：
```bash
bash .claude/skills/casework/scripts/data-refresh.sh \
  --case-number {caseNumber} --case-dir {caseDir}
```
→ 完成后读取新的 delta-content.md 了解变化内容
→ 跳到 Step 3

### Step 3. 执行排查

Spawn troubleshooter agent：
```
Agent({
  subagent_type: "troubleshooter",
  prompt: "Case {caseNumber}, caseDir={caseDir}。{用户补充信息（如有）}。请先读取 .claude/agents/troubleshooter.md 获取完整执行步骤。",
  model: "opus"
})
```

等待 agent 完成后，读取分析报告。

### Step 4. 展示结果 + 后续交互

展示排查关键发现后，使用 `AskUserQuestion` 询问后续操作：
```
question: "排查完成。需要进一步操作吗？"
options:
  - label: "结果满意，结束"
    description: "排查结束，无需进一步操作"
  - label: "追加排查"
    description: "针对某个方向深入排查，或补充新信息"
  - label: "生成邮件草稿"
    description: "基于排查结果草拟客户回复邮件"
```

**如果用户选择"追加排查"**：
→ 收集追加方向 → 回到 Step 3 重新 spawn troubleshooter（带上新上下文）

**如果用户选择"生成邮件草稿"**：
→ 按照 `.claude/skills/casework/draft-email/SKILL.md` 生成邮件草稿

**如果用户选择"结束"**：
→ 输出排查完成摘要

## 安全红线
- ❌ 不直接发邮件给客户
- ✅ 邮件草稿只保存到 `{caseDir}/drafts/` 目录
