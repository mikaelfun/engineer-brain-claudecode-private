# EOP 增强筛选 (EFC/Skip Listing) 配置 - Quick Reference

**Entries**: 5 | **21V**: partial | **Last updated**: 2026-04-07

## Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Missed detections, false positives, or policy gaps in dual-use deployment whe... | Enhanced Filtering for Connectors (EFC) is not configured... | Configure Enhanced Filtering for Connectors to preserve original sender IP an... | 🟢 8.5 | [ADO Wiki] |
| 2 | Enhanced Filtering (skip listing) defaults to connecting IP instead of skippi... | When every previous IP in the received headers is a priva... | Fix on-prem/external MX side to include real public IPs in received headers, ... | 🟢 8.5 | [ADO Wiki] |
| 3 | Enhanced Filtering EFUsers is populated but skip listing not working for hybr... | EFUsers applies skip listing only to listed addresses (no... | Add the targetAddress of the MailUser object (e.g. user@contoso.mail.onmicros... | 🟢 8.5 | [ADO Wiki] |
| 4 | Enhanced Filtering skip listing not applied - no skip listing headers present... | Message was attributed to a different inbound connector t... | Verify which inbound connector was applied to the message using the Message P... | 🟢 8.5 | [ADO Wiki] |
| 5 | 复杂路由场景（邮件经第三方服务/on-prem 再到 M365）中 SPF/DKIM/DMARC 认证失败，合法邮件被标记为 spoof | M365 看到的源 IP 是第三方服务/网关的 IP 而非原始发件人 IP，导致 SPF 验证失败；中间服务修改邮... | 1) 在 Defender portal 启用 Enhanced Filtering for Connectors (skip listing); 2) ... | 🔵 6.5 | [MS Learn] |

## Quick Troubleshooting Path

1. Configure Enhanced Filtering for Connectors to preserve original sender IP and authentication. Run D `[ADO Wiki]`
2. Fix on-prem/external MX side to include real public IPs in received headers, or use a solution other `[ADO Wiki]`
3. Add the targetAddress of the MailUser object (e.g. user@contoso.mail.onmicrosoft.com) to EFUsers. If `[ADO Wiki]`
