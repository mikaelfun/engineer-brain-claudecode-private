---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra Tenant Restrictions/Windows TRV2 (Tenant Restrictions V2) Overview and Support Guidance"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20Tenant%20Restrictions%2FWindows%20TRV2%20(Tenant%20Restrictions%20V2)%20Overview%20and%20Support%20Guidance"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Windows TRV2 (Tenant Restrictions V2) Overview and Support Guidance

## TRV2 Policy Info

Admin sets up TRv2 policy via MDM/Intune or Group Policy. On enrolled devices, registry contains:
- **CloudId**: Cloud instance (may be empty)
- **Policy ID**: Cross Tenant Access Policy (XTAP) ID
- **Tenant ID**: Home tenant ID

When TRv2 is enabled, WinHTTP/WinInet requests to O365 endpoints get the `sec-Restrict-Tenant-Access-Policy` header.

## Security Header Format

```
sec-Restrict-Tenant-Access-Policy: [cloudID:]<tenantID>:<policyID>
```

## Endpoint Matching Algorithm

### Exact Match (Hostnames list)
- `login.microsoft.com` = match
- `somestring.login.microsoft.com` = NOT a match

### Subdomain Match (SubdomainSupportedHostnames list)
- `somestring.sharepoint.com` = match
- `sharepoint.com` = NOT a match

## CloudIdSvc Service

Responsible for syncing O365 endpoint list to local registry at:
`HKLM\SOFTWARE\Microsoft\Windows\TenantRestrictions\TenantRestrictionsList`

### Syncing Algorithm
1. Retrieve cloud instances from `https://endpoints.office.com/version`
2. Request instance-specific endpoints: `https://endpoints.office.com/endpoints/<instance>`
3. Filter: only include endpoints with `required = true` AND (`category = Allow` OR `category = Optimize`)
4. Final list = union of all instances

**Important**: This list does NOT include Azure-related endpoints. Customers can add additional endpoints via policy.

### CloudIdSvc Connectivity Issue (Event 1013)
- Service hardened by WSH Default Outbound Block
- Only allows outbound TCP 443
- If proxy uses different port, sync fails

**Workaround**:
```powershell
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\SharedAccess\Parameters\FirewallPolicy\RestrictedServices\Configurable\System\" -Name $(New-Guid) -PropertyType String -Value "V2.31|Action=Allow|Dir=Out|Protocol=6|Rport=XXXX|App=%SystemRoot%\System32\svchost.exe|Svc=cloudidsvc|Name=Allow TCP XXXX traffic from cloudidsvc|"
```
Replace XXXX with proxy port. Restart cloudidsvc.

## Support Guidance

- **Proxy**: No special proxy detection/discovery logic in TRv2. Standard proxy config applies.
- **Manual endpoints**: Can add endpoints to `HKLM\...\TenantRestrictionsList` registry but NOT recommended (O365 list is dynamic).
- **Destination port**: cloudidsvc only uses TCP 443. For other ports, open collab case with Windows Networking CSS.

## Eventlog Location
`Event Viewer > Application and Services > Microsoft > Windows > Microsoft-Windows-TenantRestrictions > Operational`
