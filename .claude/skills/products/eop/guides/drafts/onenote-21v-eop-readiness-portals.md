# 21v EOP Readiness & Portal Access Guide

> Source: OneNote - Readiness Content | Quality: guide-draft | 21v: Yes

## 21v Portal URLs

| Portal | URL |
|--------|-----|
| Security (SCC/MDO) | https://security.microsoftonline.cn/ |
| Compliance (Purview) | https://compliance.microsoftonline.cn/ |
| O365 Admin | https://portal.partner.microsoftonline.cn/AdminPortal#/homepage |
| Exchange Admin Center | https://admin.exchange.microsoftonline.cn/ |
| Quarantine | https://security.microsoftonline.cn/quarantine?viewid=Email |

## EOP Concepts Quick Reference

| Concept | Description |
|---------|-------------|
| Malware (malspam) | Malware delivered via email attachment, URL, or execution code |
| Spoofing | Emails mimicking a legitimate sender to trick recipients |
| Phishing | Mass emails tricking victims into revealing sensitive info |
| SPAM | Irrelevant/unsolicited messages, especially advertising |
| Bulk | Marketing messages, typically not repeatedly sent |
| RFC 5321 (P1) | SMTP envelope - controls routing (smtp.mailfrom) |
| RFC 5322 (P2) | Message format - header and body (From: display) |

## 21v Feature Gaps

- **Assist 365 diagnostic tool**: Spam Verdict Reason tool does NOT work for 21v EXO tenants
- **Tenant Explorer**: Not available for 21v
- Workaround: Use PowerShell, EAC message trace, message header analysis

## PowerShell Connection (21v)

```powershell
Connect-ExchangeOnline -ExchangeEnvironmentName o365china
Get-TransportConfig | Format-List *
Get-CASMailbox -Identity <your_UPN>
```

## DNS Verification Tools

- SPF: https://dmarcian.com/spf-survey/ | https://www.kitterman.com/spf/validate.html
- MX/Blacklist: https://mxtoolbox.com/
- DMARC: https://dmarcly.com/tools/dmarc-checker
- Message Header: https://mha.azurewebsites.net/ | https://mxtoolbox.com/EmailHeaders.aspx

## Key Reference Links

- EOP Wiki: https://dev.azure.com/Supportability/Modern%20Workplace/_wiki/wikis/Modern%20Workplace/98438/Exchange-Online-Protection
- ASIM Wiki: https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki
