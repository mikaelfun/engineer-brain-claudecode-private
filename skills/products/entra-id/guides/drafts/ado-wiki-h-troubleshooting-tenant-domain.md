---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Tenant and Domain Management/Microsoft Entra Domain Name Management/Troubleshooting Tenant and Domain"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20Tenant%20and%20Domain%20Management%2FMicrosoft%20Entra%20Domain%20Name%20Management%2FTroubleshooting%20Tenant%20and%20Domain"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Troubleshooting Tenant and Domain - Comprehensive TSG

## 1. Create Tenant Requires Paid Subscription

Since Oct 2023, tenant creation from existing tenant requires non-trial paid M365 seat-based subscription. Free trial tenants can no longer create new free tenants.

- **Error**: 403 Forbidden - "Additional tenant creation is not allowed without non-trial subscription"
- **Portal message**: "Microsoft Entra Workforce tenant can only be created for paid tenants"
- **Check**: `GET /beta/directory/subscriptions?$select=isTrial,status,skuId,commerceSubscriptionId` - need `isTrial=False` and `commerceSubscriptionId != skuId`
- **Note**: Only applies to PROD cloud, not other clouds. Only M365 seat-based subscriptions count (not Azure subscriptions).

## 2. Troubleshooting Directory Deletion Failures

Pre-checks:
1. Customer followed [How to delete your Microsoft Entra ID tenant](https://learn.microsoft.com/en-us/entra/identity/users/directory-delete-howto)
2. Azure subscriptions cancelled
3. M365 subscriptions cancelled
4. Blocking Enterprise Apps removed
5. Check if B2C tenant (different process)

If all above validated: follow [Tenant Deletion Instructions for Azure Identity SE](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/544788/) to engage TA via ICM.

## 3. Troubleshooting Domain Deletion Failures

### Key Terms
- **contextId**: Tenant ID owning the domain
- **DomainForceDeleteTask**: Propagation task for domain removal
- **GlobalIfxUlsEvents()**: Kusto function joining all MSODS clusters

### Decision Tree

1. Check DS Explorer PropagationTask for DomainForceDeleteTask
   - If status=Incomplete -> task failed
2. Check Exchange mastered groups (ExchangeMastered=True) referencing domain
   - If found -> customer removes proxy addresses, ICM to EEE team
3. Check users referencing domain (DS Explorer Users tab)
4. Check applications referencing domain (DS Explorer Applications tab)
5. Check Kusto logs using TaskId + CreationTime
6. No PropagationTask -> check ULS logs with contextId or domain name

### PowerShell Domain Deletion Logs
Kusto query using correlation ID from PowerShell logs:
```kql
GlobalIfxUlsEvents()
| where env_time >= datetime(YYYY-MM-DDTHH:MM) and env_time < datetime(...)
| where * contains "<correlation-id>"
```

## 4. Troubleshooting Domain Verification Failures

### Common Causes

#### A. DNS Record Not Found
- Check DNS: `Resolve-DnsName -Name domain.com -Type TXT` (or MX)
- Check ASC > Tenant Explorer > Domains > Registration tab
- Wait up to 72 hours for DNS propagation

#### B. Domain Already Verified in Another Tenant
- Check via OIDC endpoint or ASC Tenant Explorer
- If customer owns domain -> contact Data Protection team
- VKB: https://internal.evergreen.microsoft.com/en-us/help/2905700

#### C. Domain on Viral/Email-Verified Tenant
- Check User Realm endpoint for IsViral=True
- Check ASC Company Profile or DS Explorer CompanyTags for EmailVerified
- Solution: Internal or External Admin Takeover

#### D. Orphaned Domain in OrgId
- Check ICC tool (Identity Consistency)
- If in OrgId but not MSODS -> ICM to OrgId/Triage to purge
- May also be Exchange Online federation issue

#### E. Source of Authority is Microsoft.com
- Domain hosted by Microsoft (SOA = ns1.bdm.microsoftonline.com)
- Escalate to Office 365 team

### Domain Verification via PowerShell
Check logs at `%localappdata%\Microsoft\AzureAD\Powershell` (v2) or `%USERNAME%\AppData\Local\Microsoft\Office365\Powershell` (v1).

## 5. Checking Tenant/Domain Existence

- **OIDC Metadata**: `https://login.microsoftonline.com/{identifier}/.well-known/openid-configuration`
  - Works with tenant ID, onmicrosoft.com, or custom domain
  - `tenant_region_scope`: NA=North America, EU=Europe, USG/USGov=Government

- **User Realm API**: `https://login.microsoftonline.com/common/userrealm/{domain}?api-version=2.1`
  - Check IsViral for viral tenant detection

## 6. Domain Capabilities Reference

| Value | Service |
|-------|---------|
| 1 | Email |
| 2 | Sharepoint |
| 8 | OfficeCommunicationsOnline |
| 16 | SharepointDefaultDomain |
| 128 | OrgIdAuthentication |
| 256 | Yammer |
| 512 | Intune |

Example: Capabilities=9 means Email(1) + OfficeCommunicationsOnline(8)
