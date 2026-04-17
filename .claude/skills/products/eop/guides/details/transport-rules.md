# EOP 传输规则 (Mail Flow Rules) 问题 - Comprehensive Troubleshooting Guide

**Entries**: 7 | **Draft sources**: 1 | **Kusto queries**: 0
**Source drafts**: mslearn-mail-flow-rules-set-scl.md
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: By-design change: count now only
> Source: ado-wiki

**Symptom**: Reduction in transport rule blocked email count in Mailflow status report
**Root Cause**: By-design change: count now only includes emails quarantined BY transport rule, not all emails matching a rule.

1. Expected behavior per MC698146. Decrease does not indicate loss of functionality.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 2: Transport rule sender address 评估逻辑变更：现在评估
> Source: mslearn

**Symptom**: 创建 Exchange transport rule 控制自动转发邮件行为，但用户通过 mailbox rule 自动转发时 transport rule 不匹配
**Root Cause**: Transport rule sender address 评估逻辑变更：现在评估 original sender (header) 而非 forwarder (envelope)。另外 ForwardingSmtpAddress/ForwardingAddress 转发使用 IPM.Note 类别（非 IPM.note.forward），transport rule 基于 message ...

1. 将 transport rule 的 Match sender address in message 设置从 Header 改为 Header or envelope。对 ForwardingSmtpAddress/ForwardingAddress 转发场景，改用基于 recipient 的 exception 而非基于 sender 的条件

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

### Phase 3: Disclaimer 规则未设置排除条件，回复邮件再次匹配规则导致重复添加
> Source: mslearn

**Symptom**: Mail flow rule 的 disclaimer/footer 被添加到原始邮件和所有回复中，而非仅原始邮件
**Root Cause**: Disclaimer 规则未设置排除条件，回复邮件再次匹配规则导致重复添加

1. 在 disclaimer 规则中添加 exception，检查邮件正文是否已包含 disclaimer 中的唯一短语，包含则跳过

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

### Phase 4: By design：单条 rule 中多个条件是 AND
> Source: mslearn

**Symptom**: Mail flow rule 设置两个条件期望满足任一时触发，但实际只有同时满足时才匹配
**Root Cause**: By design：单条 rule 中多个条件是 AND 逻辑，必须同时满足

1. 创建两条独立规则各含一个条件。可先复制规则再分别删除不需要的条件

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

### Phase 5: SentTo 仅匹配 mailbox/mail-enabled user/contact，不支持 distribution
> Source: mslearn

**Symptom**: Mail flow rule 使用 SentTo 条件指定 distribution group 但不匹配
**Root Cause**: SentTo 仅匹配 mailbox/mail-enabled user/contact，不支持 distribution group

1. 改用 SentToMemberOf (To box contains a member of this group) 条件匹配 DG 成员

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

### Phase 6: Transport rule 条件导致处理效率低下：1) 使用 Is
> Source: mslearn

**Symptom**: 邮件投递延迟，EAC Insights 显示 Fix slow mail flow rules 告警
**Root Cause**: Transport rule 条件导致处理效率低下：1) 使用 Is member of 匹配大型组; 2) 使用复杂正则表达式; 3) 使用附件内容检查条件

1. 在 EAC > Mail flow > Rules 中识别低效规则，优化条件：将大型组替换为 distribution group、简化正则、移除不必要的附件扫描条件

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

### Phase 7: 1) 规则创建后传播延迟（可能超过 15 分钟）; 2)
> Source: mslearn

**Symptom**: Exchange Online mail flow rule 配置正确但不生效，邮件未被匹配
**Root Cause**: 1) 规则创建后传播延迟（可能超过 15 分钟）; 2) 另一条更高优先级规则设置了 Stop processing more rules 阻止后续规则执行

1. 等待数小时后重新测试。检查其他规则是否干扰，尝试将问题规则调整为 priority 0。使用 Message Trace 验证规则匹配情况

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 6.5/10 - [MS Learn]]`

---

## Decision Logic

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Reduction in transport rule blocked email count in Mailfl... | By-design change: count now only | -> Phase 1 |
| 创建 Exchange transport rule 控制自动转发邮件行为，但用户通过 mailbox rule ... | Transport rule sender address 评估逻辑变更：现在评估 | -> Phase 2 |
| Mail flow rule 的 disclaimer/footer 被添加到原始邮件和所有回复中，而非仅原始邮件 | Disclaimer 规则未设置排除条件，回复邮件再次匹配规则导致重复添加 | -> Phase 3 |
| Mail flow rule 设置两个条件期望满足任一时触发，但实际只有同时满足时才匹配 | By design：单条 rule 中多个条件是 AND | -> Phase 4 |
| Mail flow rule 使用 SentTo 条件指定 distribution group 但不匹配 | SentTo 仅匹配 mailbox/mail-enabled user/contact，不支持 distribution | -> Phase 5 |
| 邮件投递延迟，EAC Insights 显示 Fix slow mail flow rules 告警 | Transport rule 条件导致处理效率低下：1) 使用 Is | -> Phase 6 |
| Exchange Online mail flow rule 配置正确但不生效，邮件未被匹配 | 1) 规则创建后传播延迟（可能超过 15 分钟）; 2) | -> Phase 7 |

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Reduction in transport rule blocked email count in Mailflow status report | By-design change: count now only includes emails quaranti... | Expected behavior per MC698146. Decrease does not indicate loss of functional... | 🟢 8.5 | [ADO Wiki] |
| 2 | 创建 Exchange transport rule 控制自动转发邮件行为，但用户通过 mailbox rule 自动转发时 transport rule... | Transport rule sender address 评估逻辑变更：现在评估 original sender... | 将 transport rule 的 Match sender address in message 设置从 Header 改为 Header or en... | 🔵 7.5 | [MS Learn] |
| 3 | Mail flow rule 的 disclaimer/footer 被添加到原始邮件和所有回复中，而非仅原始邮件 | Disclaimer 规则未设置排除条件，回复邮件再次匹配规则导致重复添加 | 在 disclaimer 规则中添加 exception，检查邮件正文是否已包含 disclaimer 中的唯一短语，包含则跳过 | 🔵 7.5 | [MS Learn] |
| 4 | Mail flow rule 设置两个条件期望满足任一时触发，但实际只有同时满足时才匹配 | By design：单条 rule 中多个条件是 AND 逻辑，必须同时满足 | 创建两条独立规则各含一个条件。可先复制规则再分别删除不需要的条件 | 🔵 7.5 | [MS Learn] |
| 5 | Mail flow rule 使用 SentTo 条件指定 distribution group 但不匹配 | SentTo 仅匹配 mailbox/mail-enabled user/contact，不支持 distribu... | 改用 SentToMemberOf (To box contains a member of this group) 条件匹配 DG 成员 | 🔵 7.5 | [MS Learn] |
| 6 | 邮件投递延迟，EAC Insights 显示 Fix slow mail flow rules 告警 | Transport rule 条件导致处理效率低下：1) 使用 Is member of 匹配大型组; 2) 使用... | 在 EAC > Mail flow > Rules 中识别低效规则，优化条件：将大型组替换为 distribution group、简化正则、移除不必要的... | 🔵 7.5 | [MS Learn] |
| 7 | Exchange Online mail flow rule 配置正确但不生效，邮件未被匹配 | 1) 规则创建后传播延迟（可能超过 15 分钟）; 2) 另一条更高优先级规则设置了 Stop processin... | 等待数小时后重新测试。检查其他规则是否干扰，尝试将问题规则调整为 priority 0。使用 Message Trace 验证规则匹配情况 | 🔵 6.5 | [MS Learn] |
