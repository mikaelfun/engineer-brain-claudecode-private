# Intune Effective Group Membership (EGM) Troubleshooting Guide

> Source: OneNote - Mooncake POD Support Notebook / Intune / Kusto Query / Device and User Effective Group (4 pages)

## Overview

Effective Group Membership (EGM) determines which policies, apps, and configurations target a device/user in Intune. When EGM changes, policies may be added or removed ("tombstoned"). This guide covers how to diagnose EGM-related issues using Kusto.

## Key Concepts

- **DeviceEG**: The Effective Group ID calculated for a device
- **UserEG**: The Effective Group ID calculated for a user
- **PrimaryUserEG**: The primary user's Effective Group ID
- **PayloadType**: The type of Intune item (policy, app, etc.) assigned via EGM

## Special GUIDs

| Object | GUID |
|--------|------|
| Default policy ID | C0F4911A-7CE6-4804-8563-677A2665D379 |
| All devices | E903BF28-ADA9-11E1-98B8-657B6188709B |
| All users | 5B2726C0-DBE3-40C9-998D-D080B96E9404 |
| New user or unknown object | 00000000-0000-0000-0000-000000000000 |

## PayloadType Enum Reference

| Value | Name | Description |
|-------|------|-------------|
| 0 | Invalid | Unknown |
| 1 | SettingsPolicy | Settings Policy type |
| 2 | Application | Application type |
| 3 | Document | Document |
| 4 | TermsOfUse | Terms Of Use |
| 5 | MAMPolicy | MAM Policy |
| 6 | MDMSoftwareUpdate | Software Update |
| 7 | OnPremConditionalAccess | On-prem conditional access |
| 8 | AfwApplication | Android for Work application |
| 9 | EnrollmentConfiguration | Enrollment configuration |
| 10 | SideCar | Sidecar/PowerShell |
| 11 | EBooks | Ebooks |
| 12 | GroupPolicy | ADMX Group Policy |
| 13 | Mifo | Microsoft Intune for Office |
| 14 | EmbeddedSim | eSIM |
| 15 | ZtdDeviceConfigProfile | ZTD Device Config Profile |
| 16 | AndroidEnterprisePolicy | Android Enterprise policy |
| 17 | CustomTextNotification | Custom Text Notification |
| 18 | BrandingProfile | Branding profile |
| 19 | HWHashExtraction | HW hash extraction |
| 20 | DFCIPolicy | DFCI Policy |
| 21 | WindowsUpdateProfile | Windows Update profile |
| 22 | RoleScopeTags | Role Scope Tags |
| 23 | RAPolicy | RA Policy |
| 24 | SidecarPolicy | Sidecar Policy |
| 25 | WDACPolicy | Win 10s unlock policy |
| 26 | Parcel | Bundle Payload |
| 27 | MAMNonGnT | MAM non-GnT |
| 28 | AppleEnrollmentProfile | Apple Enrollment Profile |
| 29 | DCV2Policy | DCV2 Policy |
| 30 | RAMMPC | Resource Access MMP-C |

## Diagnostic Queries

### 1. Get Current DeviceEG/UserEG from Session Logs

```kql
DeviceManagementProvider
| where env_time >= datetime(YYYY-MM-DD) and env_time <= datetime(YYYY-MM-DD)
| where message contains "DeviceEG" or message contains "UserEG="
| where userId == "<AAD_USER_ID>" and deviceId has "<INTUNE_DEVICE_ID>"
| project env_time, deviceId, userId, message
| order by env_time asc
```

Look for: `DeviceEG=<guid> UserEG=<guid> PrimaryUserEG=<guid>`

### 2. See Which Groups a Policy is Targeted To

```kql
let Intune_Account_ID = '<INTUNE_ACCOUNT_ID>';
IntuneEvent
| where env_time >= ago(10d)
| where ServiceName == "StatefulDeploymentService"
| where ApplicationName == "WCSServices"
| where ComponentName == "DeploymentProvider"
| where AccountId == Intune_Account_ID
| extend MessageAsJson = tostring(split(split(Message, "ÆcallerMethod:")[1], "ÆsourceFilePath:")[0])
| where MessageAsJson != ''
| sort by env_time desc
| project env_time, MessageAsJson
```

### 3. Track EGM Changes Over Time (Policy Targeting)

```kql
IntuneEvent
| where env_time >= ago(30d)
| where env_cloud_name == "CNPASU01"  // For 21v
| where EventUniqueName == "47121"
| where AccountId == "<INTUNE_ACCOUNT_ID>"
| where PayLoadId == "<POLICY_ID>"
| extend EffectiveGroupId = Col1
| project env_time, AccountId, PayLoadId, Col1, Col2, Col3, Col4, Col5, Col6, ColMetadata, ActivityId
| order by env_time asc
```

Key fields:
- **Col1** (EffectiveGroupId): The EG this policy is targeted to
- **Col2** (PayloadType): Type of the payload (see enum above)
- **Col3** (IsDeletedDeployment): `True` = policy was REMOVED from targeting
- **Col4** (DeploymentDateTime): When the deployment changed
- **Col5** (Source): `Existing` or `New`

### 4. Detect EGM Membership Changes

```kql
IntuneEvent
| where env_time >= ago(2d)
| where SourceNamespace == "IntunePE"
| where ComponentName == "GnTSLA"
| where EventUniqueName == "EffectiveGroupMembershipChangeMessageBuilt"
| where AccountId == "<INTUNE_ACCOUNT_ID>"
| order by env_time asc
| project env_time, Target = Col3, newEGId = Col1, oldEGId = Col2, cV
```

- `oldEGId = 00000000-...` means this is a new enrollment (no previous EGM)
- Compare `newEGId` vs `oldEGId` to see what changed

### 5. Check if Device Was Deleted and Re-added to AAD

```kql
let myDeviceID = '<INTUNE_DEVICE_ID>';
let Intune_Account_ID = '<INTUNE_ACCOUNT_ID>';
IntuneEvent
| where env_time >= ago(30d)
| where AccountId == Intune_Account_ID
| where ServiceName == "StatefulDeviceService"
| where ComponentName == "AADDeviceRecordManagement"
| where EventUniqueName == "64213"
| where DeviceId == myDeviceID
| sort by env_time asc
| project env_time, AAD_DeviceID = Col1, IsDeleted = Col2, Details = Col3, DeviceId
```

If AAD_DeviceID changes between entries, the device was deleted and re-registered. Static group memberships assigned to the old AAD device ID will be lost.

## Troubleshooting Flow

1. Get the device's current EGM (Query 1)
2. Check what policies target that EGM (Query 3)
3. If a policy shows `IsDeletedDeployment=True`, the device was removed from targeting
4. Check if EGM changed (Query 4) — identify when and why
5. If EGM change is unexpected, check if device was re-added to AAD (Query 5)
6. Verify AAD group memberships are correct
