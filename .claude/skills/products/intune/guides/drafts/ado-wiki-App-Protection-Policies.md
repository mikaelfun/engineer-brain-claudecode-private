---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/App Protection"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FApp%20Protection"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# App Protection Policies (APP/MAM) Troubleshooting Guide

## Overview

App protection policies (APP) are rules that ensure an organization's data remains safe or contained in a managed app. Previously known as MAM (Mobile Application Management). Works with or without MDM enrollment (MAM-WE for BYOD).

## How APP Works

1. MAM-enabled app launched, user authenticated
2. AAD confirms user targeted for MAM policies
3. Intune service deploys MAM payload via mam.manage.microsoft.com (port 444)
4. Payload delivered as encrypted XML containing MAM policies
5. App loads Intune SDK on next launch after successful delivery
6. SDK checks every 30 minutes for selective wipe requests

### Encryption

- **iOS**: Native iOS 256-bit AES encryption (requires device-level PIN)
- **Android**: OpenSSL 256-bit AES + Android Keystore (FIPS 140-2 validated)
- **Windows (WIP)**: Native EFS (Encrypted File System) — WIP EOL end of 2022

### Platform Differences

- **iOS**: SDK per application, Apple Keychain may cache token data
- **Android**: Company Portal required as broker (processes ~80% of SDK), must be installed for ANY Android device
- **Windows**: Uses WIP (EnterpriseDataProtection + Applocker CSP), best-effort protection level

## Prerequisites for APP

Three items must be met:
1. Targeted UPN must resolve in Azure AD
2. UPN must have active Intune license
3. Application must have Intune SDK integrated

**iOS additional**: MAMUPN string must be created and assigned to each application for proper identity.

## Support Boundaries

- MAM policies should NOT be used with third-party MAM or secure container solutions
- On-Premises Skype/Exchange requires Hybrid Modern Auth
- None of the data protection settings control Apple managed Open-In feature on iOS/iPadOS
- Only data marked as "corporate" is encrypted
- BYOD without MDM: can't deploy apps, can't provision certificates, can't provision Wi-Fi/VPN

## Scoping Questions

1. UPN of Azure AD account? Does it have Intune license?
2. Affected OS platform (Android/iOS)? iOS 15.0+ or Android 8.0+
3. Device state: Managed (Intune), Unmanaged (MAM-WE), or 3rd-party MDM?
4. All apps affected or specific app? Store app or LOB?
5. Behavior or error message? Steps to reproduce?
6. Collect app protection logs (Company Portal, MAM, Outlook diagnostics)
7. Screenshots of APP settings
8. Reproducible or intermittent?
9. Any Conditional Access Policies with "Require app protection policy"?

## Kusto Query

```kql
AmsActivityForUser("Insert Entra ID User ID", start=datetime(2024-01-10T00:00:00Z), end=datetime(2024-01-12T13:05:00Z))
| project env_time, ['type'], statusCode, AppId, Os, DeviceId, AppVersion, SdkVersion, ManagementLevel, AppFriendlyName, PolicyState, DeviceModel
```

## Platform-Specific Troubleshooting

- Android: See /App Protection/Android wiki page
- iOS: See /App Protection/iOS wiki page
- Windows: See /App Protection/WIP wiki page (WIP is EOL)

## SME Contacts

- ATZ: Jeffrey Ault, Steve Bucci (leads); Dylan Sturm, Dina Hennen, Martin Kirtchayan, Carlos Fernandez, Reethan Raj
- EMEA: Mihai Lucian Androne (lead); Mohammad Bazzari, Hossam Remawi, Fadi Jweihan
- APAC: Joe Yang, Ulysse Rugwiro (leads)
