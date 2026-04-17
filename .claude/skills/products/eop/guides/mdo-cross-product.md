# EOP MDO 跨产品功能 (Teams/MDA/Graph) - Quick Reference

**Entries**: 2 | **21V**: all applicable | **Last updated**: 2026-04-07

## Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | Cannot obtain outbound spam samples with proper X-Forefront-Antispam-Report h... | Messages in Sent Items have not been subject to filtering... | Enable "Send a copy of outbound messages that exceed these limits to these us... | 🟢 8.5 | [ADO Wiki] |
| 2 📋 | Hybrid 环境中禁用 on-premises AD 账户后，发送到该用户 Exchange Online 邮箱的邮件返回 NDR 5.7.129 表示... | 禁用 on-premises AD 账户会导致 Exchange Online 邮箱拒绝入站邮件。仅禁用账户不会完... | 若要完全停止该邮箱的邮件通信，应删除（而非禁用）on-premises 用户账户。或者移除 Exchange Online 许可证，但需创建 transp... | 🔵 6.5 | [MS Learn] |

## Quick Troubleshooting Path

1. Enable "Send a copy of outbound messages that exceed these limits to these users and groups" in the  `[ADO Wiki]`
2. 若要完全停止该邮箱的邮件通信，应删除（而非禁用）on-premises 用户账户。或者移除 Exchange Online 许可证，但需创建 transport rule 阻止入站邮件（否则无许可证后 `[MS Learn]`

> This topic has a fusion troubleshooting guide with complete workflow
> -> [Complete troubleshooting guide](details/mdo-cross-product.md)
