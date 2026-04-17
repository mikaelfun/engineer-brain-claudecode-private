# EOP 反垃圾邮件策略配置与优先级 - Quick Reference

**Entries**: 5 | **21V**: all applicable | **Last updated**: 2026-04-07

## Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | Administrators unable to modify Spam filter policies; UI error 'operation cou... | Deprecated country codes (XJ Jan Mayen, XE Sint Eustatius... | Remove invalid codes via PowerShell: Set-HostedContentFilterPolicy -Identity ... | 🟢 8.5 | [ADO Wiki] |
| 2 📋 | Threat Policy (AntiSpam/AntiPhish etc) cannot be created from UI; error 'POLI... | Orphaned Policy object created when New-*Rule cmdlet fail... | Check for orphaned policy via PowerShell (e.g. Get-HostedContentFilterPolicy)... | 🟢 8.5 | [ADO Wiki] |
| 3 📋 | Bulk email not filtered as expected or legitimate bulk emails quarantined | BCL threshold misconfiguration or MarkAsSpamBulkMail sett... | Check MarkAsSpamBulkMail via PowerShell. Adjust BCL threshold (Default=7, Sta... | 🟢 8.5 | [ADO Wiki] |
| 4 📋 | 合法的 bulk/marketing 邮件被 EOP 标记为 Bulk email 移至 Junk 或被隔离，或反之用户收到大量不想要的 bulk 邮件 | Anti-spam policy 中的 BCL (Bulk Complaint Level) 阈值设置不当。默认阈... | 1) 检查邮件 header X-Microsoft-Antispam 中的 BCL 值; 2) 收集多封问题邮件计算平均 BCL; 3) 在 Defen... | 🔵 7.5 | [MS Learn] |
| 5 📋 | 修改 anti-spam policy 后设置未立即生效，邮件仍按旧策略处理 | Anti-spam policy 变更需要最长 1 小时才能在整个服务中传播生效 | 保存更改后等待最多 1 小时。如超过 1 小时仍未生效，检查是否有更高优先级的 policy（如 Preset Security Policy）覆盖了自定义策略 | 🔵 6.5 | [MS Learn] |

## Quick Troubleshooting Path

1. Remove invalid codes via PowerShell: Set-HostedContentFilterPolicy -Identity 'Policy Name' -RegionBl `[ADO Wiki]`
2. Check for orphaned policy via PowerShell (e.g. Get-HostedContentFilterPolicy). Remove the orphaned p `[ADO Wiki]`
3. Check MarkAsSpamBulkMail via PowerShell. Adjust BCL threshold (Default=7, Standard=6, Strict=5). Use `[ADO Wiki]`

> This topic has a fusion troubleshooting guide with complete workflow
> -> [Complete troubleshooting guide](details/anti-spam-policy.md)
