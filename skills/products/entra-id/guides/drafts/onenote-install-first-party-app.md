# Install First-Party / Multi-Tenant App in Mooncake

> Source: OneNote - Application mgmt and config
> Status: draft

## Overview

To install a first-party or third-party multi-tenant app in a Mooncake tenant, create a service principal using the app's client ID. This also serves as a way to verify if a first-party app is available in Mooncake.

## Key Concept

First-party app client IDs are identical between Mooncake and public cloud. If the app exists in Mooncake, creating the SP will succeed; otherwise, it will fail.

## Method 1: AzureAD PowerShell Module

```powershell
Connect-AzureAD -AzureEnvironmentName AzureChinaCloud
New-AzureADServicePrincipal -AppId <app-client-id>
```

## Method 2: Az PowerShell Module

```powershell
Connect-AzAccount -Environment AzureChinaCloud
New-AzADServicePrincipal -AppId <app-client-id>
```

## Common Errors

- **"service principal name is already in use"**: The SP already exists in the tenant
- **"does not reference a valid application object"**: The app is not available in Mooncake

## Notes

- This method works for both first-party Microsoft apps and third-party multi-tenant apps
- No need to register the app in your tenant; just create the SP with the known AppId
