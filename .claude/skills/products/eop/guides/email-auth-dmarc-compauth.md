# EOP DMARC/CompAuth 与 ARC 信任链 - Quick Reference

**Entries**: 8 | **21V**: all applicable | **Last updated**: 2026-04-07

## Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | Auto-forwarded emails from Global M365 to 21V mailbox rejected with 550 5.7.5... | SRS rewrites P1 From for SPF but does not fix DMARC align... | Create Exchange Transport Rule (ETR) with SCL=-1 to bypass filtering for forw... | 🟢 9 | [OneNote] |
| 2 📋 | SPF/DKIM/DMARC returns temperror/timeout intermittently for inbound email. Au... | DNS TTL values for SPF/DKIM/DMARC records (including sub-... | 1) Check all DNS TTLs (top-level and sub-entries) using digwebinterface.com w... | 🟢 8.5 | [ADO Wiki] |
| 3 📋 | Auto-forwarded emails from tenant A to tenant B fail DMARC and are marked as ... | SRS rewrites P1 (MailFrom) sender with forwarding tenant ... | 1) Primary: ensure original sender DKIM-signs with P2 (From) domain AND preve... | 🟢 8.5 | [ADO Wiki] |
| 4 📋 | Self-domain spoofing emails delivered to inbox via Direct Send when MX does n... | Direct Send allows any Internet device on port 25 to send... | Option 1: Lock down M365 to only accept mail from third-party service (connec... | 🟢 8.5 | [ADO Wiki] |
| 5 📋 | 邮件被拒绝或隔离，message header 显示 dmarc=fail action=quarantine/reject，compauth=fail | SPF 或 DKIM 未通过且与 From 地址域不对齐，DMARC 策略为 p=quarantine 或 p=r... | 发件人：确保 SPF 包含所有合法源 IP，配置 DKIM，验证 DMARC 对齐。收件人：配置 Enhanced Filtering for Conne... | 🔵 7.5 | [MS Learn] |
| 6 📋 | 邮件 header 显示 dmarc=bestguesspass action=none，发件人域没有 DMARC 记录，消息正常投递但缺乏认证保护 | 发件人域未发布 DMARC TXT 记录。DMARC 检查默认通过（bestguesspass），但无法提供实际保护 | 建议发件人发布 DMARC 记录（p=quarantine 或 p=reject）。虽然消息被接受，但缺少 DMARC 策略意味着发件人域易被冒充。参考：... | 🔵 7.5 | [MS Learn] |
| 7 📋 | 邮件 header 显示 compauth=pass reason=130（ARC validated），经第三方服务/转发后 SPF/DKIM 直接检查... | 邮件经过中间服务（mailing list/转发服务/安全设备）修改后 SPF 或 DKIM 失败。Microso... | 如果是预期的复杂路由场景，无需操作。中间服务提供商应实现 ARC headers。收件人管理员需在 M365 中配置 trusted ARC sealer... | 🔵 7.5 | [MS Learn] |
| 8 📋 | 邮件 header 显示 compauth=pass reason=116/111，通过 PTR（反向 DNS）验证通过认证，但 SPF/DKIM 均未正确配置 | 发件人未配置 SPF 和 DKIM，Microsoft 365 回退到 PTR 记录验证。发送服务器 IP 的 P... | 发件人应正确配置 SPF 和 DKIM，不应依赖 PTR 回退认证。PTR pass 只是一个指标，表明需要改进 SPF/DKIM 配置。收件人看到此结果... | 🔵 7.5 | [MS Learn] |

## Quick Troubleshooting Path

1. Create Exchange Transport Rule (ETR) with SCL=-1 to bypass filtering for forwarded messages from tru `[OneNote]`
2. 1) Check all DNS TTLs (top-level and sub-entries) using digwebinterface.com with Authoritative serve `[ADO Wiki]`
3. 1) Primary: ensure original sender DKIM-signs with P2 (From) domain AND prevent message modification `[ADO Wiki]`

> This topic has a fusion troubleshooting guide with complete workflow
> -> [Complete troubleshooting guide](details/email-auth-dmarc-compauth.md)
