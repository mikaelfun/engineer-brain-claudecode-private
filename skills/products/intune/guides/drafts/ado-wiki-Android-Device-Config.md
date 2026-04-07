---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Device Config Features Restrictions and Custom/Android"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Config%20Features%20Restrictions%20and%20Custom%2FAndroid"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Android Device Configuration Guide

## Overview
Android has multiple enrollment options that determine available configurations, based on the Device Policy Controller (DPC):
- Corporate-owned: DPC = Google (Android Device Policy app)
- BYOD: DPC = Company Portal app

Profile types covered: Device restrictions, OEMConfig, Custom profiles, Zebra Mobility Extensions.

## Enrollment Types

| Method | Acronym | Type | DPC |
|--------|---------|------|-----|
| AE Work Profile | BYOD | UserEnrollment | Company Portal |
| AE Fully Managed | COBO | AndroidEnterpriseFullyManaged | Android Device Policy |
| AE Dedicated | COSU | AndroidEnterpriseDedicatedDevice | Android Device Policy |
| COSU + Entra Shared Mode | COSU-Shared | AndroidEnterpriseDedicatedDevice | Android Device Policy + Authenticator |
| AE Corp-Owned Work Profile | COPE | AndroidEnterpriseCorporateWorkProfile | Android Device Policy |
| Device Administrator | DA | UserEnrollment (Legacy) | Company Portal |
| AOSP (User/Userless) | AOSP | Limited info | - |

## Support Boundaries
- All Android device config issues are owned by Intune support
- **Do NOT tell customer to contact Google** - Google does not have enterprise support for customers
- If issue is suspected with Android OS, Intune PG can create support ticket with Google PG
- SE/SEEs do not have access to Intune PG <=> Google PG tickets

## DA (Legacy) - Deprecating
- Ending support for DA on devices with GMS (August 2024)
- Supported custom profiles: Wi-Fi PSK, Per-app VPN, Samsung Knox apps, MDE web protection
- If custom profile not in supported list → not supported (may still work, but won't investigate)
- Knox-specific settings require device on Knox supported devices list

## AE Work Profile (BYOD) Custom Profiles
Supported only:
- `./Vendor/MSFT/WiFi/Profile/SSID/Settings`
- `./Vendor/MSFT/VPN/Profile/Name/PackageList`
- `./Vendor/MSFT/WorkProfile/DisallowCrossProfileCopyPaste`

## OEMConfig
- Applies to ALL AE enrollment types
- Functions like app config policy but acts as device configuration
- App must be added to managed Google Play and installed on device
- Samsung Knox Service Plugin: https://docs.samsungknox.com/admin/knox-service-plugin/policies.html

## Managed Home Screen (MHS)
- For dedicated devices in multi-app kiosk mode
- Functions as app config policy
- Setup guide: https://techcommunity.microsoft.com/t5/intune-customer-success/how-to-setup-microsoft-managed-home-screen-on-dedicated-devices/ba-p/1388060

## Log Collection
- **OMADMLog.log**: CP ↔ OS communication, enforcement verification
- **CompanyPortal.log**: CP ↔ Intune service, enrollment issues
- **BrokerAuth.log**: Authentication/Azure registration
- **Sysdump.log**: Samsung-specific (collected only if Samsung requests)
- Enable verbose logging: https://learn.microsoft.com/en-us/mem/intune/user-help/use-verbose-logging-to-help-your-it-administrator-fix-device-issues-android

## Kusto Queries

### BYOD Work Profile - Policy Status
```kusto
DeviceManagementProvider
| where env_time > ago(3d)
| where deviceId == 'deviceId'
| where applicablilityState == "Applicable"
| where typeAndCategory == "ConfigurationPolicy;None"
| project env_time, name, typeAndCategory, applicablilityState, reportComplianceState, policyId, id, EventMessage, ActivityId, I_App, scenarioType
```

### BYOD Work Profile - Individual Settings
```kusto
IntuneEvent
| where env_time > ago(10d)
| where DeviceId == "deviceId"
| where Col1 startswith "Done processing rule"
| project env_time, Message=['Col1'], Status=['Col4'], PolicyID=['Col3'], DeviceId, UserId, ComponentName, ActivityId, EventUniqueName
```

### Corporate-Owned (COBO/COSU/COPE) - Individual Settings
```kusto
IntuneEvent
| where env_time between(datetime(start) .. datetime(end))
| where DeviceId has "deviceID"
| where EventUniqueName == "ProcessedSetting"
| project env_time, ComponentName, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, Message
```

## Assist365 Troubleshooting
1. Select correct tenant
2. Go to Applications > Intune > Troubleshooting > Policy
3. Search by policy ID (preferred over name)
4. Verify PolicyPlatformType and PolicyTypeName:
   - BYOD: `AndroidWorkProfile` / `AndroidWorkProfileGeneralDeviceConfiguration`
   - COBO/COSU/COPE: `AndroidForWork` / `AndroidDeviceOwnerGeneralDeviceConfiguration`
5. Review settings values in policy body
6. Check Assignments section for assigned groups

## DCR Guidance
- Check Android Enterprise developer doc: https://developers.google.com/android/work/requirements
- Not listed → Google needs to implement first (DCR rejected)
- "Not applicable" for target enrollment type → Google needs to implement first
- Standard/optional feature → valid Microsoft DCR

## Getting Help
- Teams: Device Config - Certificates, Email, VPN and Wifi channel
- Document: User ID, license, Intune device ID, device model/OS, serial number, enrollment method, policy name/ID/type, assigned groups
