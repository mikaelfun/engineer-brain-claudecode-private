---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/Purview Message Encryption/Learn: Purview Message Encryption/Learn: EXO PowerShell"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FPurview%20Message%20Encryption%2FLearn%3A%20Purview%20Message%20Encryption%2FLearn%3A%20EXO%20PowerShell"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# EXO PowerShell Quick Reference — Purview Message Encryption

See [How To: Connect to Services](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/11330/How-To-Connect-to-Services) for installing and connecting the EXO module.

## Common Commands

| Command | Description |
|---------|-------------|
| `Get-IRMConfiguration` | Get current IRM settings from EXO |
| `Get-TransportRule \| fl Name,Description,ApplyClassification,ApplyRightsProtectionTemplate,ApplyOME` | List transport rules with common AIP/encryption settings |
| `Get-OMEConfiguration \| fl` | List OME (Office Message Encryption) branding configurations |
| `Get-OWAMailboxPolicy \| fl *IRM*` | Check OWAMailboxPolicy IRM settings |

## Docs References
- [Get-IRMConfiguration](https://learn.microsoft.com/en-us/powershell/module/exchange/get-irmconfiguration?view=exchange-ps)
- [Get-TransportRule](https://learn.microsoft.com/en-us/powershell/module/exchange/get-transportrule?view=exchange-ps)
- [Get-OMEConfiguration](https://learn.microsoft.com/en-us/powershell/module/exchange/get-omeconfiguration?view=exchange-ps)
- [Get-OWAMailboxPolicy](https://learn.microsoft.com/en-us/powershell/module/exchange/get-owamailboxpolicy?view=exchange-ps)
- [Set-IRMConfiguration](https://learn.microsoft.com/en-us/powershell/module/exchange/set-irmconfiguration?view=exchange-ps)
