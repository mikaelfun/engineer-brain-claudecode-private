---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/App Management/Apple/iOS and iPadOS"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FApp%20Management%2FApple%2FiOS%20and%20iPadOS"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# About iOS/iPadOS App deployment

App deployment is the process of adding an apps to Intune and assigning it to users, groups, and/or devices, thus installing the app automatically or making the app proactively available for the user to install on their device using the company Portal App or website.

For iOS/iPadOS devices the following app types are available for deployment:

- App Store apps
- Apple volume Purchase Program (VPP) apps
- Line of business (LOB) apps
- Web clip (Newest)
- Web link (legacy)
- Built-in app (Microsoft 365 apps)

## How it works

> Starting with the 2601 release new Intune features aligned with DDM App management model will be made available for customers.
> DDM is primarily a change to device management (MDM). It does not replace MAM/APP.
> More details in dedicated page: Apple DDM Apps

### iOS/iPadOS Store apps

All Free apps in the App Store can be added in Intune UI to be deployed to managed or unmanaged devices. iOS/iPadOS store apps are automatically updated. Free of charge only via this method.

### Apple Volume Purchase Program (VPP) apps

Any App Store app can be purchased in volume. Purchases are made using Apple Business Manager (ABM) or Apple School Manager. Apps are linked to a "location based token" or "VPP Token". This token is added to Intune and syncs all linked apps.

#### Automatic app update

VPP introduces ability to prevent automatic VPP app updates at per-app assignment level. Token-level value must be set to "Yes" for updates. "Prevent automatic app updates" setting opts out targeted groups.

| Token Auto Update | Prevent Auto Update | Does app auto update? |
|---|---|---|
| No | No/Yes | No |
| Yes | No | Yes |
| Yes | Yes | No |

When device is in multiple groups, "Prevent=Yes" takes precedence.

### Line of Business (LOB) apps

LOB app = IPA app installation file, typically written in-house. Requires iOS Developer Enterprise Program.
- Maximum size limit: 2 GB per app
- Bundle identifiers must be unique

### Built-in app (Microsoft 365 apps)

Curated managed apps (Excel, OneDrive, Outlook, Skype, etc.). NOT Apple's built-in apps (FaceTime, contacts).

### Web clip (Newest)

Creates shortcut to web app on home screen.

### Web link (legacy)

URL shortcuts with limited capabilities. Use Web clip instead.

## Scoping Questions

- Device type (brand, model)?
- OS Version (iOS 15, 16, 17...)?
- App type (LOB/IPA, Store, Built-In, VPP, Books)?
- Assignment method (user, group, device)?
- If VPP: Device License or User License?
- Device enrolled or not enrolled?
- Assigned as Available or Required?
- Include/exclude groups?
- New deployment or update?
- Error messages on device or Intune console?
- When did issue start? Changes in environment?
- Reproducible?
- One app or all? One user/device or all?
- App name/ID, affected UPN, device serial/DeviceID?

## Support Boundaries

- Intune launches app install; the platform handles actual installation
- First determine: retrieval problem or installation problem
- If app fails to install manually (without Intune) → not an Intune problem
- Refer to app vendor for non-Intune issues

## Troubleshooting

### General

- Troubleshoot app installation: https://learn.microsoft.com/en-us/troubleshoot/mem/intune/troubleshoot-app-install
- Error code reference: https://learn.microsoft.com/en-us/troubleshoot/mem/intune/app-install-error-codes

### Kusto Queries

Key tables: **IntuneEvent** and **DeviceManagementProvider**. Key attributes: env_time, DeviceId/ActivityId, ApplicationId/BundleID.

#### 1. Validate app is being pushed to device

```KQL
HighLevelCheckin(deviceIdentifier="IntuneDeviceId", startTime=datetime(...), endTime=datetime(...))
| where PolicyType == "AppModel"
| where PolicyApplicability == "Applicable"
| project env_time, PolicyName, PolicyId, PolicyCompliance, errorCode, message, EventMessage, PolicyVer, env_cloud_name
```

- PolicyCompliance should show "installed"
- PolicyId = AppID

```KQL
DeviceManagementProvider
| where env_time > datetime(...) and env_time < datetime(...)
| where deviceId == "IntuneDeviceId"
| where TaskName == "DeviceManagementProviderCIReportDataEvent"
| where typeAndCategory == "AppModel;AppModel"
| where applicablilityState == "Applicable"
| project env_time, name, reportComplianceState, typeAndCategory, EventMessage, deviceId
```

#### 2. iOS/iPadOS and macOS app deployment details (LOB, App Store, VPP)

```KQL
let IntuneDeviceID = "ReplaceDeviceIDHere";
IntuneEvent
| where SourceNamespace in ('IntunePE','IntuneFXP')
| where env_time > datetime(...) and env_time < datetime(...)
| where ActivityId == IntuneDeviceID
| where EventUniqueName == "AppleAppSummary"
| project env_time, Col1, Col2, Col3, Col4, Col5, Col6, ActivityId, UserId, DeviceId, AccountId, env_cloud_name, BuildVersion
```

- InstallCommand: NOT SENT = app already installed
- Check: UninstallOnRetire, PreventManagedAppBackup, PreventAutoAppUpdate
- Intent (Required/Uninstall), app version
- VPP: AssignmentType, LicenseStatus, TokenId

#### 3. VPP assignment settings (Prevent auto updates, Uninstall on removal, etc.)

```KQL
IntuneEvent
| where SourceNamespace in ('IntunePE','IntuneFXP')
| where ActivityId == IntuneDeviceID
| where EventUniqueName == "AppleAppPolicyProperties"
| where Col1 == IntuneAppId
| project env_time, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, ...
```

- Col2 = intent: 1=Available, 3=Required, 4=Uninstall
- Col3 = assignment settings (UninstallOnRetire, IsRemovable, PreventManagedAppBackup, PreventAutoAppUpdate, Licensing)

#### 4. App installation error code lookup

```KQL
GetAppInstallErrors
| where ErrorCode == "-2016330849"
```

#### 5. VPP v2 Kusto Queries

**Token Details:**
```KQL
IntuneEvent
| where AccountId == IntuneAccountID
| where ApplicationName == "AppleVPP"
| where EventUniqueName == "ValidatingSToken"
| project env_time, EventUniqueName, Message, CurrentState=Col3, TokenId=PayLoadId, TokenLocationId=Col5, TokenLocationName=Col4
```

**Apps synced per token:**
```KQL
IntuneEvent
| where AccountId == IntuneAccountID
| where EventUniqueName == "IncomingAssetsSummary"
| project env_time, ..., VPPApps=Col2, VPPBooks=Col3, ...
```

**License count for specific VPP app (use AdamID):**
```KQL
IntuneEvent
| where ApplicationName == "AppleVPP"
| where ComponentName in ("AppleApiClient")
| where Col3 has AdamID
```

- AdamID from App Store URL (e.g., Company Portal = 719171358)

**License assignment/dissociation tracking:**
```KQL
IntuneEvent
| where ApplicationName == "AppleVPP"
| where Col2 in ("LicenseAssociation","Associate") or Col3 == "Associate"
```

**Token failure tracking:**
```KQL
IntuneEvent
| where ApplicationName == "AppleVPP"
| project env_time, ..., EventUniqueName, ..., Message, ...
```

Common errors:
- DuplicateSTokensFound
- FailedSTokenValidation (error 9625 = sToken revoked → renew token)
- MetadataV2Failed (Invalid Stoken, TooManyRequests, duplicate key)

**Token sync tracking:**
```KQL
IntuneEvent
| where ApplicationName == "AppleVPP"
| where EventUniqueName in ("SyncRequested","SyncStarted")
```

**Admin-initiated revocation:**
```KQL
IntuneEvent
| where EventUniqueName == "RevocationStarted"
| where ApplicationName == "AppleVPP"
```
- Col2: RevokeByTargetAsync / RevokeByAdamIdAsync / RevokeByTokenAsync

### What data to collect

- Application Name, AppID, BundleID
- AdamID (from App Store URL)
- Sample affected deviceID
- VPP Token ID
- Timestamps
- Console logs (prefer macOS; Windows tool as fallback — no Debug messages)

### Use Bruno to simulate VPP synchronize

Based on Apple Managing Apps&Books API. Use Bruno API client with sToken Bearer auth.
- Never ask customer to share sToken file
- URL example: https://vpp.itunes.apple.com/mdm/v2/assets

## Common problems

- Published IPA fails to install: check manual install first, confirm "Corporate" export (not "Ad Hoc"), check .ipa/plist match, verify Apple cert not expired
- App is managed but expired/removed by user: user uninstalled, app expired, detection mismatch, iOS 9.2.2 bug
- "Could not retrieve license for the app with iTunes Store ID": sync VPP token → sync device → remove/reassign as device-licensed → revoke license → retire/re-enroll

| Title | Symptom | KB |
|---|---|---|
| Unable to run application | MSI fails to install/uninstall | 2700127 |
| Invalid manifest | Requires manifest file with ipa package | 2725968 |
| Install fails "heavy load" | Prompt to Cancel/Retry | 2700147 |
| Web Links cannot be removed | IsRemovable=False by design | By Design |

## FAQ

- **VPP v2 GA**: Released with 2504 (end of April 2025)
- **VPP v2 improvements**: No manual sync needed; Apple notifies MDM immediately
- **Expired token renewal**: Always renew, never create new (duplicates apps/assignments)
- **Different Managed Apple ID for renewal**: OK if same ABM/ASM subscription
- **Downloading token from ABM breaks sync?**: No (but ADE token will break if downloaded but not uploaded)
- **Delete VPP app removed from App Store**: Reclaim licenses → move in ABM → contact Apple Care Enterprise
- **VPP Token Sync in audit logs?**: No (only Create/Delete/Patch/Revoke logged)

## Known Issues

- Unable to Revoke VPP app licenses / delete VPP Apps: "The app failed to delete. Ensure that the app is not associated with any VPP license..."
- "In-App Purchase Disabled" notification on VPP apps on any Apple device
- Apple VPP token shows state "Duplicate"
