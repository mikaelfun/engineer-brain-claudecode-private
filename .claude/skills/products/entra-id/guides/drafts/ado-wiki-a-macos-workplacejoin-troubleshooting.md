---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Device Registration/Apple Devices/MacOS WorkplaceJoin troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FApple%20Devices%2FMacOS%20WorkplaceJoin%20troubleshooting"
importDate: "2026-04-05"
type: troubleshooting-guide
pageLength: 22590
---

# TSG Guide for MacOS WorkPlaceJoin

> Tags: AAD, AAD-Authentication, AAD-Workflow, Azure AD Device Registration  
> Platform Priority: iOS/macOS — Priority 1

## Applicable Scope

Troubleshooting device registration (WPJ) on **macOS** only.
On macOS, only WorkPlaceJoin (WPJ) is supported (no HAADJ or AADJ).

## Key Concepts

### What is Device Identity?

In context of this document, Identity = a WorkPlaceJoin certificate + its private key.

WPJ establishes device identity with AAD for:
- Device-based Conditional Access
- Client TLS challenge & PkeyAuth challenge with AAD/ADFS endpoints

### Device Registration Process on macOS

- Uses Azure Device Registration Service (ADRS/DRS) to create signed x.509 certificate
- Creates WPJ keychain objects in user's **macOS login keychain**
- On macOS: only **Intune Company Portal** can perform device registration (Authenticator is iOS only)

### Keychain Basics on macOS

- WPJ keychain items stored in **login keychain**
- macOS keychain uses Access Control List (ACL) model (vs iOS which uses shared access group)
- Items encrypted with AES-256-GCM (metadata key + per-row secret key)

### Device Authentication Fundamentals

- Access to protected resources requires establishing device identity via client TLS challenge
- On iOS: Only Apple-native apps can access system-level keychain (3rd party apps cannot)
- Certificate chain verification goes through OS for client TLS

## Scoping Questions

Before troubleshooting, identify:

1. **Device registration intent**:
   - HAADJ (Hybrid Azure AD Join) — auto-registration?
   - AADJ (Azure AD Join)?
   - BYOD WPJ (Add work or school account)?

2. **Customer environment**:
   - Multiple verified domains?
   - Managed or federated domain?
   - AD FS or 3rd party STS?
   - Cloud-only, hybrid, or on-prem?
   - Device management: GPO, SCCM, or MDM?
   - Client OS (Windows 7/10, iOS, macOS, Android)?

## Common Troubleshooting Areas

### Intune Requirement

Intune app is **required** on macOS to:
- Comply with device-based CA policies
- Perform WPJ registration

Reference: https://docs.microsoft.com/en-us/mem/intune/protect/create-conditional-access-intune

### Conditional Access Failures

If device CA fails after WPJ:
1. Verify WPJ certificate is present in login keychain
2. Verify certificate is not expired
3. Check if Intune enrollment is complete (MDM profile installed)
4. Confirm PkeyAuth is working — test with browser to AAD-protected resource

### Keychain Access Issues

Common symptom: Device appears registered in AAD portal but CA fails
- Check if WPJ keychain items are intact in macOS login keychain
- After changing keychain password, WPJ items may become inaccessible
- Solution: Re-register device through Intune Company Portal

## Public Documentation

- [Device identity overview](https://docs.microsoft.com/en-us/azure/active-directory/devices/overview)
- [Create device compliance policies with Intune](https://docs.microsoft.com/en-us/mem/intune/protect/create-conditional-access-intune)
- [Apple Keychain Services — Access Control Lists](https://developer.apple.com/documentation/security/keychain_services/access_control_lists)
