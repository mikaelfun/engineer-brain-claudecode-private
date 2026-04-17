# MIP SDK Configuration for Mooncake (21Vianet) Cloud

> Source: OneNote — Mooncake POD Support Notebook / Information Protection (AIP) / MIP SDK support
> Status: draft (from onenote-extract)

## Overview

MIP SDK supports national clouds including Azure China (Mooncake). You must explicitly set the cloud endpoint in your code.

## C++ — Protection/Policy Engine

```cpp
// Set the engine identity to the provided username
ProtectionEngine::Settings engineSettings(mip::Identity(mUsername), mAuthDelegate, "");
engineSettings.SetCloud(mip::Cloud::China_01);
```

## C# — File Engine

```csharp
var engineSettings = new FileEngineSettings(identity.Email, authDelegate, "", "en-US")
{
    Identity = identity
};
engineSettings.Cloud = (Cloud)10;  // China_01
```

## Prerequisites — Service Principal

The "Microsoft Information Protection Sync Service" (AppId: `870c4f2e-85b6-4d43-bdda-6ed9a579b725`) must exist and be enabled:

1. Create if missing: `New-AzADServicePrincipal -ApplicationId 870c4f2e-85b6-4d43-bdda-6ed9a579b725`
2. Enable if disabled:
   ```powershell
   Connect-MsolService -AzureEnvironment AzureChinaCloud
   Get-MsolServicePrincipal -AppPrincipalId 870c4f2e-85b6-4d43-bdda-6ed9a579b725 | Set-MsolServicePrincipal -AccountEnabled $true
   ```
