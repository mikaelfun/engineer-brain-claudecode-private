# AVD MFA Setup via Conditional Access

**Source**: OneNote Lab Verification (Rika, 2021-11)
**Status**: Draft — pending SYNTHESIZE review

## Overview

Enable Azure MFA for Azure Virtual Desktop using Conditional Access policies.

## Prerequisites

- Azure AD Premium P1 or P2 license
- Azure MFA enabled for target users
- Azure Virtual Desktop app registered in Azure AD

## Steps

### 1. Enable MFA for user

- Azure AD > Users > Per-user MFA > Enable for target users

### 2. Create Conditional Access Policy

1. **Users**: Select target user(s) or group(s)
2. **Cloud apps**: Select "Azure Virtual Desktop" (App ID: 9cdead84-a844-4324-93f2-b2e6bb768d07)
3. **Conditions**: Configure as needed (e.g., location, device platform)
4. **Grant**: Require multifactor authentication
5. **Session**: Configure sign-in frequency if needed (e.g., every 8 hours)
6. **Enable policy**: On

### 3. Verify

- Login via Windows Desktop Client
- MFA prompt should appear during sign-in
- After MFA completion, user should connect to session host

## Notes

- Sign-in frequency controls how often users must re-authenticate
- Conditional Access can be scoped to specific locations, devices, or risk levels
- Reference: [Azure multifactor authentication for AVD](https://docs.microsoft.com/en-us/azure/virtual-desktop/set-up-mfa)
