# MsOnline Scripts Migration Actions

## CSS Support Actions

1. Point customer to public notification:
   - Global: https://techcommunity.microsoft.com/blog/microsoft-entra-blog/important-update-deprecation-of-azure-ad-powershell-and-msonline-powershell-modu/4094536
   - 21v M365 message center: https://portal.partner.microsoftonline.cn/AdminPortal/Home#/MessageCenter/:/messages/MC1023480
2. If during scream test: ask customer to wait (max 24 hours)
3. Migrate scripts using cmdlet mapping: https://learn.microsoft.com/en-us/powershell/microsoftgraph/azuread-msoline-cmdlet-map

## Extension Request for Full MSOnline PowerShell Access

**Availability**: Very limited. Top security risk. Only for complex extenuating circumstances through April 30.

**Process**:
1. Get commitment date from customer for migration (must be before April 30)
2. Check with TA
3. Raise IcM:
   - Subject: "Full MSOnline PowerShell exclusion Request"
   - Owning Service: AAD Distributed Directory Services
   - Owning Team: Programmability Infra
4. Send email to aadgraphandlegacypsr@microsoft.com

**Required IcM Fields**:

| Field | Required Data |
|-------|--------------|
| Customer Name | |
| TenantId | |
| S500 Tenant? | Yes/No |
| Requesting | Access to MSOnline PowerShell after April 7, 2025 |
| Business impact | |
| What MSOnline operations/cmdlets/use cases? | |
| Why unable to migrate in time? | |
| ETA to complete migration? | |

---
*Source: OneNote - Mooncake POD Support Notebook*
