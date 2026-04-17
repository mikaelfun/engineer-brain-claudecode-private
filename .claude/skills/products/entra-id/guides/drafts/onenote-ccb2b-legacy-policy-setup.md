# Cross-Cloud B2B Legacy Policy Setup (PowerShell)

> **Status**: Draft — extracted from OneNote  
> **Source**: [Archived] Installation (CC B2B)  
> **Note**: Uses deprecated AzureAD PowerShell module. Migrate to Microsoft Graph PowerShell SDK.

## Overview

Cross-Cloud B2B (CC B2B) requires a `CrossTenantAccessPolicy` in each tenant. A tenant can only have **one** such policy.

## Policy Format

```json
{
  "CrossTenantAccessPolicy": {
    "Version": 1,
    "LastModified": "2020-04-15 09:55:00Z",
    "TenantGroup": [
      {
        "DisplayName": "Fabrikam China and Gov",
        "Tenants": ["<tenant-id-1>", "<tenant-id-2>"],
        "FromMyTenancy": [{ "AllowAccess": true }],
        "ToMyTenancy": [
          {
            "AllowAccess": true,
            "AcceptMFA": true,
            "AcceptCompliantDevice": true,
            "AcceptHybridAzureADJoinedDevice": true
          }
        ]
      }
    ],
    "SupportedClouds": ["microsoftonline.us", "partner.microsoftonline.cn"]
  }
}
```

## Configure in Mooncake (21V)

### Create new policy

```powershell
$policy = '{"CrossTenantAccessPolicy":{"Version":1,"LastModified":"2021-01-14 00:00:00Z","TenantGroup":[{"DisplayName":"Cross Cloud B2B Test","Tenants":["*"],"ToMyTenancy":[{"AllowAccess":true,"AcceptMFA":true,"AcceptCompliantDevice":true,"AcceptHybridAzureADJoinedDevice":true}],"FromMyTenancy":[{"AllowAccess":true},{"AllowAccess":true}]}],"SupportedClouds":["microsoftonline.com","microsoftonline.us"]}}'

New-AzureADPolicy -Definition $policy -DisplayName "Cross Tenant Access Policy" -IsOrganizationDefault $true -Type CrossTenantAccessPolicy
```

### Update existing policy

```powershell
$existingPolicy = Get-AzureADPolicy -All $true | Where-Object { $_.Type -eq "CrossTenantAccessPolicy" }
$policyId = $existingPolicy[0].Id
Set-AzureADPolicy -Id $policyId -Definition $policy
```

## Key Notes

- Use `"Tenants": ["*"]` to allow all tenants from supported clouds
- `SupportedClouds` values: `microsoftonline.com` (public), `microsoftonline.us` (US Gov), `partner.microsoftonline.cn` (21V/Mooncake)
- `AcceptMFA: true` — trust MFA from the guest's home tenant
- This is the **legacy** method; current GA uses MS Graph cross-tenant access settings API
