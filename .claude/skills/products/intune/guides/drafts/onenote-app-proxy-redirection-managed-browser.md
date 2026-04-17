# How to Setup App Proxy Redirection for Intune Managed Browser/Edge

## Overview
Configure Azure AD Application Proxy to allow users to access internal URLs through Edge/Intune Managed Browser seamlessly.

## Steps

1. **Setup Application Proxy** in Azure AD
2. **Configure External URL** via Enterprise Applications
3. **Assign to target group** that should have this setting applied
4. **Create App Configuration Policy** in Intune:
   - Set `com.microsoft.intune.mam.managedbrowser.appproxyredirection = True`
5. **Assign policy** to the same group as step 3
6. **Verify**: When a user in the group browses an internal URL via Edge/Intune Managed Browser, App Proxy auto-detects and redirects to the external URL. Users not in the group cannot access internal URLs (expected behavior).

## Key Configuration
- App Configuration Policy key: `com.microsoft.intune.mam.managedbrowser.appproxyredirection`
- Value: `True`

## Applicability
- 21Vianet (Mooncake): Yes
- Platforms: iOS, Android (Edge / Managed Browser)

## Source
- OneNote: Mooncake POD Support Notebook > Intune > How To > How to setup App proxy redirection
