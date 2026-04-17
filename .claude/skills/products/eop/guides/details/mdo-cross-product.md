# EOP MDO 跨产品功能 (Teams/MDA/Graph) - Comprehensive Troubleshooting Guide

**Entries**: 2 | **Draft sources**: 3 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-mdo-protection-for-teams.md, ado-wiki-a-secops-best-practices.md, ado-wiki-a-graph-api-oauth-concepts.md
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Messages in Sent Items have
> Source: ado-wiki

**Symptom**: Cannot obtain outbound spam samples with proper X-Forefront-Antispam-Report headers for FP investigation; Sent Items lack filtering headers
**Root Cause**: Messages in Sent Items have not been subject to filtering and therefore lack the X-Forefront-Antispam-Report header values needed for diagnosis.

1. Enable "Send a copy of outbound messages that exceed these limits to these users and groups" in the Default Anti-spam outbound policy (not custom policies). Specify a valid BCC recipient address.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 2: 禁用 on-premises AD 账户会导致 Exchange
> Source: mslearn

**Symptom**: Hybrid 环境中禁用 on-premises AD 账户后，发送到该用户 Exchange Online 邮箱的邮件返回 NDR 5.7.129 表示无权限发送
**Root Cause**: 禁用 on-premises AD 账户会导致 Exchange Online 邮箱拒绝入站邮件。仅禁用账户不会完全停止邮箱功能，但会阻止邮件投递

1. 若要完全停止该邮箱的邮件通信，应删除（而非禁用）on-premises 用户账户。或者移除 Exchange Online 许可证，但需创建 transport rule 阻止入站邮件（否则无许可证后约 30 天内仍可接收邮件）

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 6.5/10 - [MS Learn]]`

---

## Decision Logic

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Cannot obtain outbound spam samples with proper X-Forefro... | Messages in Sent Items have | -> Phase 1 |
| Hybrid 环境中禁用 on-premises AD 账户后，发送到该用户 Exchange Online 邮箱... | 禁用 on-premises AD 账户会导致 Exchange | -> Phase 2 |

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Cannot obtain outbound spam samples with proper X-Forefront-Antispam-Report h... | Messages in Sent Items have not been subject to filtering... | Enable "Send a copy of outbound messages that exceed these limits to these us... | 🟢 8.5 | [ADO Wiki] |
| 2 | Hybrid 环境中禁用 on-premises AD 账户后，发送到该用户 Exchange Online 邮箱的邮件返回 NDR 5.7.129 表示... | 禁用 on-premises AD 账户会导致 Exchange Online 邮箱拒绝入站邮件。仅禁用账户不会完... | 若要完全停止该邮箱的邮件通信，应删除（而非禁用）on-premises 用户账户。或者移除 Exchange Online 许可证，但需创建 transp... | 🔵 6.5 | [MS Learn] |
