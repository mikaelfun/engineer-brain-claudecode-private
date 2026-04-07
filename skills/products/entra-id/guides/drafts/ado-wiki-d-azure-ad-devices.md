---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Window Devices/Azure AD Devices"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FWindow%20Devices%2FAzure%20AD%20Devices"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Azure AD Devices

**Tags**: AAD, AAD-Devices, AAD-Workflow, AzureAD

## Why are devices important?

Azure Active Directory device registration is the foundation for device-based conditional access scenarios. When a device is registered, Azure AD provides an identity used to authenticate the device. This, combined with MDM (e.g., Intune), enables conditional access policy enforcement.

## Join Type Definitions

| MSODS Value | Join Type | New Trust Type |
|-------------|-----------|----------------|
| 0 | Add a work or school account | Azure AD Registered |
| 1 | Azure AD Join | Azure AD joined |
| 2 | Domain joined and registered (DJ++) | Hybrid Azure AD joined |

## Determine AADJ vs HAADJ from Registry

Recommended: use `dsregcmd /status`.

- AADJ or HAADJ: `HKLM\SYSTEM\CurrentControlSet\Control\CloudDomainJoin\JoinInfo\<THUMBPRINT>` — contains TenantID and UserName of who joined. If `RbacResourceId` is present, it's an Azure VM with AADLoginForWindows extension.
- To distinguish AADJ vs HAADJ: check `HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters` → `Domain` value. Null = AADJ; present = HAADJ.

## Device Settings (Portal)

- **Users may join devices to Azure AD** — defaults to All
- **Users may register their devices with Azure AD** — must be enabled for BYOD/Workplace Join
- **Require MFA to join devices** — disabled by default; recommend enabling via Conditional Access
- **Maximum number of devices** — quota per user (Hybrid AADJ not subject to quota)
- **Additional local administrators on Azure AD joined devices** — premium feature
- **Enterprise State Roaming** — defaults to NONE; premium capability

## Managing Devices

- **Disable**: prevents device from authenticating with Azure AD. Effects:
  - AADJ: user cannot log in to device
  - Mobile: cannot access Azure AD resources (Office 365)
  - HAADJ: user may log into local domain but cannot access Azure AD resources
- **Delete**: permanent; removes all details including BitLocker keys. Non-recoverable. Wipe/retire from MDM first.
- Roles that can disable/delete: Global Administrator, Cloud device administrator, Intune Service Administrator

## Device Activity Timestamp (ApproximateLastLogonTimestamp)

- Updated only when existing value is older than 14 days using most recent device sign-in
- Used to identify stale devices for lifecycle management
- PowerShell query:
  ```powershell
  Get-EntraDevice -All | Select-Object -Property DeviceId, DisplayName, TrustType, ApproximateLastLogonTimestamp | Export-Csv devicelist-summary.csv
  ```

## Stale Device Cleanup Guidance

| Scenario | Recommended Steps |
|----------|-------------------|
| Win10 HAADJ | Follow on-prem stale device mgmt → Disable → Delete in AAD |
| Win10 AADJ | Use Activity to Disable → Delete in AAD |
| Win10 AADJ + Intune | Retire in Intune first → then Disable → Delete in AAD |
| Win7/8 HAADJ | On-prem stale mgmt only; do NOT delete based on activity alone |

### PowerShell Lifecycle Commands

```powershell
# Connect
Connect-EntraService -Scopes Device.ReadWrite.All

# Get all devices older than a date
$dt = [datetime]"2017/01/01"
Get-EntraDevice -All -Filter "ApproximateLastLogonTimeStamp lt $dt" | 
  Select-Object AccountEnabled, DeviceId, DisplayName, TrustType, ApproximateLastLogonTimestamp |
  Export-Csv devicelist-old.csv

# Disable device
Set-EntraDevice -DeviceId $DeviceId -AccountEnabled:$false

# Delete device
Remove-EntraDevice -DeviceId $DeviceId
```

## Notes on Display Name Updates

- **Azure AD Registered**: display name NOT updated post-registration unless managed by MDM
- **Azure AD Joined**: display name UPDATED on build 1903+ even without MDM
- **Hybrid Azure AD Joined**: display name updated from on-prem AD via AAD Connect sync

## Cleanup Before You Start

- On-prem Win10 devices: disable/delete in on-prem AD first; AAD Connect syncs Hybrid joined
- On-prem Win7/8: do not delete based only on activity
- Do not delete System managed devices (Auto-pilot waiting to join)

## Troubleshooting

See Device registration master page: https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=184217

## Public Docs

- [How To: Manage stale devices in Azure AD](https://docs.microsoft.com/en-us/azure/active-directory/devices/manage-stale-devices)
