# Token Lifetime Policy Configuration

> Source: OneNote - Application mgmt and config / Common configurations
> Status: draft

## Overview

Configure custom token lifetime policy on a service principal in Azure AD (Mooncake).

## Key Concept

Token lifetime policy is configured on the **service principal of the resource app**, not the client app.

## Prerequisites

- AzureAD PowerShell module
- AAD Global Administrator account

## Steps

```powershell
# 1. Install AzureAD module
Install-Module AzureAD

# 2. Connect to Mooncake AAD
Connect-AzureAD -AzureEnvironmentName AzureChinaCloud

# 3. Create token lifetime policy (example: 4-hour access token)
$policy = New-AzureADPolicy `
    -Definition @('{"TokenLifetimePolicy":{"Version":1,"AccessTokenLifetime":"04:00:00"}}') `
    -DisplayName FourHoursAccessToken `
    -Type TokenLifetimePolicy

# 4. Assign policy to resource app's service principal
Add-AzureADServicePrincipalPolicy -Id <SP_ID_of_resource_app> -RefObjectId $policy.Id
```

## Notes

- Modify `AccessTokenLifetime` value to set desired duration
- Policy applies to all tokens issued for the resource app
- Default access token lifetime is ~1 hour
