---
description: "单独写邮件草稿：对指定 Case 生成指定类型的邮件草稿（initial-response/follow-up/closure 等）。"
allowed-tools:
  - Bash
  - Read
  - Write
  - Agent
---

# /draft-email — 单独写邮件草稿

对指定 Case 写邮件草稿。

## 参数
- `$ARGUMENTS` — Case 编号 + 邮件类型
  - 示例: `2603100030005863 initial-response`
  - 示例: `2603100030005863 follow-up zh`
  - 示例: `2603100030005863 closure`

## 邮件类型
- `initial-response` — 初始回复
- `request-info` — 请求信息
- `result-confirm` — 结果确认
- `follow-up` — 跟进
- `closure` — 关单
- `21v-convert-ir` — 21V 转 IR

## 可选语言
- `en` — English（默认）
- `zh` — Chinese

## 执行步骤

1. **读取配置**
   读取 `config.json` 获取 `casesRoot`
   设置 `caseDir = {casesRoot}/active/{caseNumber}/`

2. **确保数据存在**
   如果 `{caseDir}/case-info.md` 不存在：
   - 先执行 `Agent(data-refresh)` 拉取数据

3. **写邮件**
   `Agent(email-drafter)`:
   - prompt 中包含 caseNumber、caseDir、emailType、language
   - "请先读取 `.claude/agents/email-drafter.md` 获取完整执行步骤"

4. **展示结果**
   读取生成的草稿文件
   展示完整邮件内容供用户审阅
