# ADFS 2019 Per-RP Additional Authentication Method Selection

## Overview

ADFS 2019 introduced a new feature allowing administrators to specify which additional authentication provider to invoke per Relying Party (RP) using claims rules. This is useful for:
- Transitioning from one MFA provider to another (group-based rollout)
- Requiring specific MFA method (e.g., certificate) for certain applications

## Prerequisites

- AD FS 2019 or later
- Multiple additional authentication providers registered

## Steps

### 1. List Available Additional Auth Providers

```powershell
Get-AdfsAuthenticationProvider | where {$_.AllowedForAdditionalAuthentication -eq $true} | fl name
```

Sample output:
- FormsAuthentication
- CertificateAuthentication
- AzureMfaAuthentication

### 2. Set Per-RP MFA with Specific Provider

Force MFA and use only AzureMfaAuthentication for a specific RP:

```powershell
Set-AdfsRelyingPartyTrust -TargetName ClaimsXray -AdditionalAuthenticationRules 'c:[] =>issue(Type = "http://schemas.microsoft.com/ws/2008/06/identity/claims/authenticationmethod", Value = "http://schemas.microsoft.com/claims/multipleauthn");c:[] => issue(Type = "http://schemas.microsoft.com/claims/authnmethodsproviders", Value = "AzureMfaAuthentication");'
```

### 3. Clear Additional Auth Settings

```powershell
Set-AdfsRelyingPartyTrust -TargetName ClaimsXray -AdditionalAuthenticationRules $null
```

### 4. Complex Claim Rules (Group-Based)

Create rules like "if user is in Group A then use method A, else use method B" for gradual MFA provider migration.

## Documentation

- [What's new in AD FS 2019](https://docs.microsoft.com/en-us/windows-server/identity/ad-fs/overview/whats-new-active-directory-federation-services-windows-server)
- Note: This feature was shared internally and may lack complete public documentation

## Source

- OneNote: ADFS Knowledge Sharing - AD FS 2019 new features
- Related ID: entra-id-onenote-137
