---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD ESTS/How ESTS detects Device Platform"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20ESTS%2FHow%20ESTS%20detects%20Device%20Platform"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How ESTS Detects Device Platform

## Overview

ESTS detects device platform during authentication (after credential validation, before policy evaluation). Main purpose: Conditional Access Device Platform condition.

## Detection Priority Order (High to Low)

1. **Device auth** (e.g., PRT)
2. **Authenticated credentials** (from incoming refresh tokens or session tokens)
3. **User Agent** (regex expression)
4. **ClientInfo** sent by ADAL/MSAL library
5. **Windows Integrated Auth** (Seamless SSO, federation WIA)

### Exception: Device Code Flow
ESTS uses the original device platform (remote device requesting user code) to overwrite detected platforms. Search "device platform" keyword in diagnostic logs to check.

## How to Check

- ASC sign-in logs: Search for **"DevicePlatform"** keyword
- Focus on **DevicePlatform** property (not DevicePlatformForUI)

## Why Platform Shows "Unknown"

When no detection method can determine the platform, ESTS sets it to "unknown".

## Troubleshooting Unexpected Platform

1. Search "device platform" keyword in ASC sign-in diagnostic logs for overwrite traces
2. Check sign-ins related to incoming tokens (RT, session token) - platform may come from previous tokens
3. Check for "Device" tab in ASC - if present, device auth succeeded and device object platform used (highest priority)
4. Check User Agent regex logic in BrowserSense.cs
5. Escalate via ICM if needed

## ICM Path
- Owning Service: eSTS
- Owning Team: Incident Triage
