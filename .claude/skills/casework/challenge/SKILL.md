---
name: challenge
displayName: 证据链审查
description: "手动触发 Challenger 审查 troubleshooter 分析的证据链。"
category: agent
stability: experimental
requiredInput: caseNumber
estimatedDuration: 60s
promptTemplate: |
  Execute challenge for Case {caseNumber}. Read .claude/skills/challenge/SKILL.md for full instructions, then execute.
allowed-tools:
  - Bash
  - Read
  - Glob
  - Agent
---

# /challenge — 证据链审查

手动触发 Challenger agent 审查 troubleshooter 分析报告的证据链。

## 参数
- `$ARGUMENTS` — Case 编号

## 执行步骤

### 1. 初始化

读取 `config.json` 获取 `casesRoot`，设置 `caseDir = {casesRoot}/active/{caseNumber}/`（绝对路径）。

### 2. 前置检查

检查 `{caseDir}/.casework/claims.json` 是否存在：

- **存在** → 继续到 Step 3
- **不存在** → 检查 `{caseDir}/analysis/` 目录：
  - 有 `.md` 文件 → 提示用户：`⚠️ 该 Case 有分析报告但无 claims.json。请先用 /troubleshoot 重新排查（新版会自动产出 claims.json）。`
  - 无 `.md` 文件 → 提示用户：`⚠️ 该 Case 无分析数据可审查。请先执行 /troubleshoot 进行技术排查。`

### 3. 推断产品域

从 `{caseDir}/case-info.md` 读取 serviceTree / 产品信息，推断 product 标识（如 aks, vm, monitor, networking 等）。

### 4. Spawn Challenger

```
subagent_type: "challenger"
description: "challenge {caseNumber}"
run_in_background: false
prompt: |
  Case {caseNumber}，caseDir={caseDir}（绝对路径）。
  产品域：{product}（从 case-info.md serviceTree 推断）。
  请先读取 .claude/agents/challenger.md 获取完整执行步骤，然后执行。
  ⏱ 第一个 Bash 调用中写 date +%s > "{caseDir}/logs/.t_challenge_start"
  ⏱ 最后一个 Bash 调用中写 date +%s > "{caseDir}/logs/.t_challenge_end"
```

### 5. 展示结果

读取 `{caseDir}/challenge-report.md`，展示：
- 审查摘要（verified/challenged/rejected 计数）
- 需要的额外信息（如有）
- 建议替代方向（如有）

如果 Challenger 返回 `ACTION:request-info`，提示用户可执行 `/draft-email {caseNumber} request-info` 生成信息收集邮件。
