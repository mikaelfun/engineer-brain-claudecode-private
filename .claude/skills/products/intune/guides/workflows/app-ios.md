# Intune iOS 应用部署与 VPP — 排查工作流

**来源草稿**: ado-wiki-Apple-DDM-Apps.md, ado-wiki-iOS-Device-Config.md, ado-wiki-iOS-iPadOS-App-Deployment.md, onenote-apple-mdm-protocol-apns.md, onenote-apple-mdm-protocol.md, onenote-building-ios-app-intune-sdk.md, onenote-collecting-vpp-licenses.md, onenote-intune-ios-vpp-app-deployment.md, onenote-ios-ade-console-log-analysis.md, onenote-ios-app-bundle-id-reference.md, onenote-ios-app-crash-log.md, onenote-ios-app-deploy-response-codes.md, onenote-ios-app-install-prompts.md, onenote-ios-app-types-and-deployments.md, onenote-ios-app-types.md, onenote-ios-checkin-troubleshooting.md, onenote-ios-error-codes.md, onenote-ios-fiddler-proxy-capture.md, onenote-ios-fiddler-trace-capture.md, onenote-ios-iexplorer-log.md, onenote-ios-log-collection-methods.md, onenote-ios-log-collection.md, onenote-ios-mdm-error-codes.md, onenote-ios-mdm-response-codes.md, onenote-ios-sso-and-debug.md, onenote-ios-sysdiagnose-assistivetouch.md, onenote-ios-vpp-license-collection.md, onenote-vpp-app-deployment.md, onenote-vpp-app-install-tsg.md, onenote-vpp-app-sync-issues-tsg.md, onenote-xiaohongshu-ipad-applock-kiosk-migration.md
**Kusto 引用**: app-install.md, apple-device.md, vpp-token.md
**场景数**: 103
**生成日期**: 2026-04-07

---

## Portal 路径

- `Intune > Troubleshooting > Device > Look for Intune DeviceId/Azure AD DeviceID/Serial Number/ EMEI > Then expand`
- `Intune > Devices > All Devices > Hardware)`
- `Intune > Tenant administration > Connectors and tokens > Apple VPP tokens`
- `Intune > Apps > All apps`

## Scenario 1: MDM vs DDM
> 来源: ado-wiki-Apple-DDM-Apps.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **MDM**: Imperative + reactive. Server sends action commands, device executes and reports. Multiple commands sent for each required app.
- **DDM**: State-based. Server sends a single DDM policy document (manifest). Device handles installations and status reporting. Proactive reporting — device reports every application state change independently.

## Scenario 2: DDM Check-In Request Types
> 来源: ado-wiki-Apple-DDM-Apps.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Request Type | Description |
|---|---|
| **TokensRequest** | Requests declaration tokens from the server |
| **ConfigurationRequest** | Request applied DDM Apps configurations on the device |
| **DeclarationItemsRequest** | Request DDM Apps targeted to the device |
| **StatusReportRequest** | Reports installation status, issues, or errors back to Intune |

> **TIP**: Status reports are published as soon as they are received from the device. Per-app reporting blade mentions up to 20 minutes delay, but with DDM status arrives significantly faster than MDM.

## Scenario 3: Requirements and Limitations
> 来源: ado-wiki-Apple-DDM-Apps.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **Supported Platforms**: iOS/iPadOS 17.4+
- **Supported Assignment Types**: Required and Uninstall only (Available planned for future)
- **Application types**: LOB (Line of Business)
- **Not Supported**:
  - Apps with Intune App SDK (MAM-enabled apps)
  - App configuration policies
  - Available App assignment type
  - Legacy app config settings

> **WARNING**: Once an app is created with a specific management type (DDM or MDM), the option is **grayed out** and cannot be changed. You must create a new app entry to switch management types.

## DDM App Settings

| Setting | Description |
|---|---|
| **Per App VPN** | Configures a VPN connection scoped to the specific app |
| **Prevent iCloud App Backup** | Prevents the app data from being backed up to iCloud |
| **Tap to Pay Screen Lock** | Configures screen lock behavior for tap-to-pay scenarios |
| **Associated Domains** | Associates specific domains with the app |
| **Direct Downloads** | Boolean setting to enable direct downloads |

## Scenario 4: Troubleshooting DDM Apps
> 来源: ado-wiki-Apple-DDM-Apps.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Review the check-in request types:

1. **Tokens Requests** — Verify declaration tokens are being requested and received.
2. **Configuration Requests** — Confirm the device is requesting updated policies.
3. **DeclarationItemsRequest** — Verify device is receiving targeted declarations.
4. **Status Report Requests** — Check for installation issues or error reports. Look for `"Valid":"Invalid"` entries with `Reasons` and error codes.

## Scenario 5: Common Error: Error.ConfigurationCannotBeApplied
> 来源: ado-wiki-Apple-DDM-Apps.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

StatusReport shows `Valid: Invalid` with code `Error.ConfigurationCannotBeApplied` — typically indicates target OS version is older than current version (e.g., targeting 15.7.4 on a device running 26.3.1).

## Scenario 6: Kusto Queries
> 来源: ado-wiki-Apple-DDM-Apps.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kql
DDMHighLevelCheckin("XXXXXX-a721-416a-8bec-XXXXXb17937X", "2026-03-23 00:17:00", "2026-03-24 00:17:00")
```
`[来源: ado-wiki-Apple-DDM-Apps.md]`

This KQL query works for any Declarative policy, not only for DDM Apps.

## Scoping Questions

1. Is the device running iOS/iPadOS 17.4 or later?
2. Is the app a LOB or VPP app type?
3. Was the app created with DDM or MDM management type in the admin console?
4. Does the app use the Intune App SDK (MAM-enabled)?
5. Are app configuration policies assigned to the app?
6. What assignment type is being used (Required, Uninstall, or Available)?

## FAQ

- **Can I switch an app from MDM to DDM?** No. Must create a new app entry.
- **Does DDM support "Available" assignment type?** Not yet. Only Required and Uninstall.
- **Will DDM eliminate "Not Now" state?** Yes. Device installs as soon as able.
- **Are MAM-enabled apps supported?** Not yet. Use MDM management type.
- **Which platforms?** Currently iOS/iPadOS only. macOS/tvOS/visionOS planned.

## How to Get Help

For DDM app deployment issues, reach out to the **Apple MDM SMEs** within Intune CSS.

## Scenario 7: iOS/iPadOS Store apps
> 来源: ado-wiki-iOS-iPadOS-App-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

All Free apps in the App Store can be added in Intune UI to be deployed to managed or unmanaged devices. iOS/iPadOS store apps are automatically updated. Free of charge only via this method.

## Scenario 8: Apple Volume Purchase Program (VPP) apps
> 来源: ado-wiki-iOS-iPadOS-App-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Any App Store app can be purchased in volume. Purchases are made using Apple Business Manager (ABM) or Apple School Manager. Apps are linked to a "location based token" or "VPP Token". This token is added to Intune and syncs all linked apps.

#### Automatic app update

VPP introduces ability to prevent automatic VPP app updates at per-app assignment level. Token-level value must be set to "Yes" for updates. "Prevent automatic app updates" setting opts out targeted groups.

| Token Auto Update | Prevent Auto Update | Does app auto update? |
|---|---|---|
| No | No/Yes | No |
| Yes | No | Yes |
| Yes | Yes | No |

When device is in multiple groups, "Prevent=Yes" takes precedence.

## Scenario 9: Line of Business (LOB) apps
> 来源: ado-wiki-iOS-iPadOS-App-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

LOB app = IPA app installation file, typically written in-house. Requires iOS Developer Enterprise Program.
- Maximum size limit: 2 GB per app
- Bundle identifiers must be unique

## Scenario 10: Built-in app (Microsoft 365 apps)
> 来源: ado-wiki-iOS-iPadOS-App-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Curated managed apps (Excel, OneDrive, Outlook, Skype, etc.). NOT Apple's built-in apps (FaceTime, contacts).

## Scenario 11: Web link (legacy)
> 来源: ado-wiki-iOS-iPadOS-App-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

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

## Scenario 12: General
> 来源: ado-wiki-iOS-iPadOS-App-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Troubleshoot app installation: https://learn.microsoft.com/en-us/troubleshoot/mem/intune/troubleshoot-app-install
- Error code reference: https://learn.microsoft.com/en-us/troubleshoot/mem/intune/app-install-error-codes

## Scenario 13: What data to collect
> 来源: ado-wiki-iOS-iPadOS-App-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Application Name, AppID, BundleID
- AdamID (from App Store URL)
- Sample affected deviceID
- VPP Token ID
- Timestamps
- Console logs (prefer macOS; Windows tool as fallback — no Debug messages)

## Scenario 14: Use Bruno to simulate VPP synchronize
> 来源: ado-wiki-iOS-iPadOS-App-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Based on Apple Managing Apps&Books API. Use Bruno API client with sToken Bearer auth.
- Never ask customer to share sToken file
- URL example: https://vpp.itunes.apple.com/mdm/v2/assets

## Scenario 15: Common problems
> 来源: ado-wiki-iOS-iPadOS-App-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

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

## Scenario 16: Known Issues
> 来源: ado-wiki-iOS-iPadOS-App-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Unable to Revoke VPP app licenses / delete VPP Apps: "The app failed to delete. Ensure that the app is not associated with any VPP license..."
- "In-App Purchase Disabled" notification on VPP apps on any Apple device
- Apple VPP token shows state "Duplicate"

## Scenario 17: APNs Network Requirements
> 来源: onenote-apple-mdm-protocol-apns.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Protocol | Port | Purpose |
|----------|------|---------|
| TCP | 443 | Device activation + fallback if port 5223 unreachable |
| TCP | 5223 | Primary APNs communication |
| TCP | 443 or 2197 | MDM server → APNs push notifications |

- Apple network range: **17.0.0.0/8** — must be allowed directly or via proxy
- iOS 13.4+, iPadOS 13.4+, macOS 10.15.4+, tvOS 13.4+: APNs supports web proxy via PAC file

## Certificate Management

- APNs certificate created at [Apple Push Certificates Portal](https://identity.apple.com/pushcert/)
- Must renew **annually** — track the Managed Apple ID used for creation
- SSL certificate for secure MDM ↔ device communication
- Signing certificate for configuration profiles

## Key References

- [MDM Protocol Reference (PDF)](https://developer.apple.com/business/documentation/MDM-Protocol-Reference.pdf)
- [Device Management API](https://developer.apple.com/documentation/devicemanagement)
- [APNs Deployment Guide](https://support.apple.com/en-sg/guide/deployment/dep2de55389a/web)

## Scenario 18: Required Network Ports
> 来源: onenote-apple-mdm-protocol.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Port | Protocol | Purpose |
|------|----------|---------|
| TCP 443 | HTTPS | Device activation + fallback if port 5223 unreachable |
| TCP 5223 | APNs | Primary APNs communication |
| TCP 443 or 2197 | HTTPS | MDM server → APNs notification delivery |

## Scenario 19: Network Requirements
> 来源: onenote-apple-mdm-protocol.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Allow traffic from devices to Apple network: **17.0.0.0/8**
- iOS 13.4+, iPadOS 13.4+, macOS 10.15.4+, tvOS 13.4+: APNs can use web proxy via PAC file
- Firewall must allow all network traffic from Apple devices to Apple network

## Certificate Management
- APNs certificates required for MDM ↔ device communication
- SSL certificate for secure communication
- Certificate to sign configuration profiles
- **Certificates must be renewed annually**
- Note the Managed Apple ID / Apple ID used to create certificates (needed for renewal)
- [Apple Push Certificates Portal](https://identity.apple.com/pushcert/)

## Security
- Multiple security layers at endpoints and servers
- Traffic inspection/reroute attempts → connection marked as compromised
- No confidential information transmitted through APNs

## Source
- OneNote: MCVKB/Intune/iOS/Apple MDM Protocol.md

## Scenario 20: 1. Create XCode Project
> 来源: onenote-building-ios-app-intune-sdk.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- New XCode project → Single-View → Objective-C
- Add UI elements (buttons/labels) in Main.storyboard
- Connect buttons/labels to `ViewController.h`
- Create event handlers in `ViewController.m`

## Scenario 21: 2. Add Intune iOS SDK
> 来源: onenote-building-ios-app-intune-sdk.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Download latest SDK: https://github.com/msintuneappsdk/ms-intune-app-sdk-ios
- Follow Steps 1-6 from [official guide](https://docs.microsoft.com/en-us/intune/developer/app-sdk-ios#build-the-sdk-into-your-mobile-app)

## Scenario 22: 3. Run IntuneMAMConfigurator
> 来源: onenote-building-ios-app-intune-sdk.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **Common issue**: File lacks execute permissions
  - Fix: `sudo chmod 777 IntuneMAMConfigurator`
  - macOS may block: Go to **System Preferences > Security & Privacy > General** → Allow
- Run IntuneMAMConfigurator specifying the `info.plist` and entitlement file

## Scenario 23: 4. Add ADAL/MSAL via CocoaPods
> 来源: onenote-building-ios-app-intune-sdk.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```bash
pod init
# Edit Podfile to add ADAL
pod install
```

- Close XCode, reopen the `.xcworkspace` file (not `.xcodeproj`)

## Scenario 24: 5. Register App in Azure Portal
> 来源: onenote-building-ios-app-intune-sdk.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Register application
- Add redirect URL
- Add **Microsoft Mobile Application Management** API permission

## Scenario 25: 6. Configure IntuneMAMSettings
> 来源: onenote-building-ios-app-intune-sdk.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Add `IntuneMAMSettings` dictionary to app's Info.plist:
  - `ADALClientId` — App registration client ID
  - `ADALRedirectUri` — Redirect URI from app registration

## Useful Links

- [Configure ADAL/MSAL for Intune SDK](https://docs.microsoft.com/en-us/intune/developer/app-sdk-ios#configure-adalmsal)
- [Azure AD Library for Obj-C](https://github.com/AzureAD/azure-activedirectory-library-for-objc)
- [CocoaPods](https://cocoapods.org/)

## Scenario 26: Prerequisites
> 来源: onenote-collecting-vpp-licenses.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- PowerShell 6.2.3+ (not Windows PowerShell 5.x)
- VPP token file from customer
- Script: `vppGetLicenses.ps1` (available from internal scratch share)

## Scenario 27: Steps
> 来源: onenote-collecting-vpp-licenses.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Download and install [PowerShell 6 (x86)](https://github.com/PowerShell/PowerShell/releases/download/v6.2.3/PowerShell-6.2.3-win-x86.msi)
2. Share `VppGetLicenses.ps1.txt` to customer; instruct to save as `.ps1`
3. Start command prompt, run:
   ```
   "C:\Program Files (x86)\PowerShell\6\pwsh.exe"
   ```
   > **Important**: Do NOT just launch PowerShell from Start Menu — must use this specific path
4. Verify version: `$PSVersionTable.PSVersion` → should be 6.2.3+
5. May need: `Set-ExecutionPolicy Unrestricted`
6. Run: `<path>\VppGetLicenses.ps1`
7. When prompted, select **R** (Run once)
8. Enter the VPP token file path (include full path + filename)
9. Copy output to a text file for analysis

## Reference

- [VPP App License TSG (IntuneWiki)](https://intunewiki.com/wiki/Vpp_App_License_TSG)

## Scenario 28: 1. Apps & Data Screen
> 来源: onenote-ios-ade-console-log-analysis.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```
Setup Current device is enrolled in DEP; not offering migration
```

## Scenario 29: 2. Remote Management Screen
> 来源: onenote-ios-ade-console-log-analysis.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```
Bundle: <private>, key: REMOTE_MANAGEMENT_TITLE, value: , table: Localizable
```

## Scenario 30: 3. SCEP Certificate Request (after authentication)
> 来源: onenote-ios-ade-console-log-analysis.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```
profiled Performing synchronous URL request: https://fef.msuc05.manage.microsoft.com/StatelessIOSEnrollmentService/DeviceEnrollment/PKI/SCEP2/...
profiled Attempting to retrieve issued certificate...
```

## Scenario 31: 4. MDM Authentication Complete
> 来源: onenote-ios-ade-console-log-analysis.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```
profiled Authentication with MDM finished.
```

## Scenario 32: 5. MDM Profile Installation
> 来源: onenote-ios-ade-console-log-analysis.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```
mdmd Attempting to write dictionary ... ConfigurationProfiles/MDMOutstandingActivities.plist
```

## Scenario 33: 6. Intune Device ID Visible
> 来源: onenote-ios-ade-console-log-analysis.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```
"Common Name"; value = "{device-guid}"
```
The Common Name value is the Intune Device ID.

## Scenario 34: 7. Valid MDM Installation Confirmed
> 来源: onenote-ios-ade-console-log-analysis.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```
mdmd MDMConfiguration: readConfigurationOutError: Valid MDM installation found.
```

## Scenario 35: 8. Device Information Collection
> 来源: onenote-ios-ade-console-log-analysis.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```
mdmd Starting MDM power assertion with reason: mdmd-Request-DeviceInformation
```

## Scenario 36: 9. Home Screen Reached
> 来源: onenote-ios-ade-console-log-analysis.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Enrollment complete.

## Reference
- Detailed steps: https://internal.evergreen.microsoft.com/en-us/topic/da09cdb3-de81-ef4a-80da-f61f0f0a39b1

## Scenario 37: Common Apple Bundle IDs
> 来源: onenote-ios-app-bundle-id-reference.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Bundle ID | App Name |
|-----------|----------|
| com.apple.AppStore | App Store |
| com.apple.mobilecal | Calendar |
| com.apple.camera | Camera |
| com.apple.MobileAddressBook | Contacts |
| com.apple.facetime | FaceTime |
| com.apple.Health | Health |
| com.apple.mobilemail | Mail |
| com.apple.MobileSMS | Messages |
| com.apple.Music | Music |
| com.apple.mobilenotes | Notes |
| com.apple.mobileslideshow | Photos |
| com.apple.MobileSafari | Safari |
| com.apple.Preferences | Settings |

## Microsoft Apps

| Bundle ID | App Name |
|-----------|----------|
| com.microsoft.CompanyPortal | Company Portal |
| com.microsoft.Office.Outlook | Outlook |
| com.microsoft.skype.teams | Microsoft Teams |

## How to Find Any App's Bundle ID

1. Go to the App Store page for the app
2. Copy the ID number from the URL (e.g., `586447913` from `https://itunes.apple.com/us/app/microsoft-word/id586447913`)
3. Browse to `https://itunes.apple.com/lookup?id=586447913`
4. Download and open the resulting `1.txt` file
5. Search for `bundleId` in the file

## Company Portal Redirect URI Format

`companyportal://com.microsoft.CompanyPortal`

The application redirect URI format is: `scheme://bundle_id`

## References

- Apple MDM Bundle ID list: https://support.apple.com/en-sg/guide/mdm/mdm90f60c1ce/web
- Third-party lookup: https://offcornerdev.com/bundleid.html

## Scenario 38: Common Response Codes (5000-5199)
> 来源: onenote-ios-app-deploy-response-codes.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Code | HRESULT | Name | Description |
|------|---------|------|-------------|
| 5000 | -2016341112 | DeviceIsBusy | iOS device returned NotNow (busy) |
| 5001 | -2016341111 | UnexpectedIdleStatus | Unexpected Idle status |
| 5002 | -2016341110 | CommandFormatError | Device rejected command (incorrect format) |
| 5003 | -2016341109 | UnknownIOSError | Generic iOS error |
| 5004 | -2016341108 | PrerequisitesNotSatisfied | Waiting on prerequisite profile |
| 5005 | -2016341107 | FileVaultNotEnabled | FileVault profile installed but not enabled |
| 5006 | -2016341106 | FileVaultEnabledByUser | FileVault enabled by user, Intune can't manage recovery |
| 5007 | -2016341105 | ServerSessionInvalidatedError | 502 Server Session Invalidated |
| 5008 | -2016341104 | UserApprovedEnrollmentRequired | macOS requires UserApprovedEnrollment |

## Scenario 39: App Install Response Codes (5200-5299)
> 来源: onenote-ios-app-deploy-response-codes.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Code | HRESULT | Name | Description |
|------|---------|------|-------------|
| 5200 | -2016330912 | AppInstallNeedsRedemption | Needs redemption code (paid app as managed deeplink) |
| 5201 | -2016330911 | AppInstallUserInstalledApp | User installed app before managed install |
| 5202 | -2016330910 | AppInstallUserRejected | User rejected app install offer |
| 5203 | -2016330909 | AppInstallUpdateRejected | User rejected app update offer |
| 5204 | -2016330908 | AppInstallFailed | App install failed |
| 5205 | -2016330907 | AppInstallRedeeming | Device redeeming redemption code |
| 5206 | -2016330906 | AppInstallManagedButUninstalled | Managed app removed by user |
| 5207 | -2016330905 | AppInstallUnknown | App state unknown |
| 5208 | -2016330904 | AppInstallUserRejectedManagement | User rejected management takeover |
| 5209 | -2016330903 | DeviceVppOsNotApplicable | Device VPP licensing requires iOS 9+ |
| 5210 | -2016330902 | WebAppUninstallFailed | Webclip uninstall failed |
| 5211 | -2016330901 | UserVppLicenseToUserlessEnrollment | User VPP license assigned to userless/shared iPad |
| 5212 | -2016330900 | DeviceVppLicenseNotSupported | Device VPP licenses not supported by item |
| 5213 | -2016330899 | VppUserRetiredOrDeleted | VPP user retired/deleted, can't assign license |
| 5214 | -2016330898 | CouldNotValidateAppManifestUnknown | App Install Failure 12024: Unknown cause |
| 5215 | -2016330897 | CouldNotValidateAppManifestTimedOut | App Install Failure 12024: Timed Out (NSURLErrorTimedOut -1001) |
| 5216 | -2016330896 | CouldNotValidateAppManifestCannotFindHost | App Install Failure 12024: Cannot Find Host (-1003) |
| 5217 | -2016330895 | CouldNotValidateAppManifestCannotConnectToHost | App Install Failure 12024: Cannot Connect To Host (-1004) |

## Usage
- Match HRESULT value from Intune logs/Graph API to identify specific failure reason
- Common in VPP app deployment and managed app lifecycle scenarios

## Source
- OneNote: MCVKB/Intune/iOS/App Deploy - iOS Response Code.md

## Scenario 40: 1. App Installation Prompt
> 来源: onenote-ios-app-install-prompts.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

**Message:** `"..." is about to install and manage the app "...". Your iTunes account will not be charged for this app`

- Triggered on **non-supervised** devices whenever an app is pushed from Intune console
- User must approve to install
- **Cannot be avoided** unless device is **supervised**

## Scenario 41: 2. Apple ID Prompt
> 来源: onenote-ios-app-install-prompts.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- User prompted to enter Apple credentials
- Happens on **first-time installation** of all public and VPP user-based apps
- **To avoid:** Ensure all apps assigned to device are **VPP device-based** apps (not user-based)

## Scenario 42: 3. App Update Prompt
> 来源: onenote-ios-app-install-prompts.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

**Message:** `"..." is about to update the app "...". Cancel/Update`

- Applies to **both supervised and non-supervised** devices
- Triggered **only when the app is currently in use** during update
- Apple design — cannot be bypassed
- For **supervised devices**: if app is not in use, update happens silently

## Scenario 43: 4. App Management Change Prompt
> 来源: onenote-ios-app-install-prompts.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

**Message:** `Would you like to let "..." take management of the app "..."? The app will close and your app data will become managed.`

- Triggered on **non-supervised** devices when "Make app MDM managed if user installed" is enabled with automatic push mode
- Intune/AirWatch attempts to assume management of user-installed apps
- For **supervised devices**: targeted app becomes managed silently if not in use

## Scenario 44: 5. VPP Invite Prompt
> 来源: onenote-ios-app-install-prompts.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

**Message:** `Allow App and Book Assignment? "..." would like to assign apps and books to you.`

- Triggered when user hasn't accepted VPP invite before AND:
  - "Automatically send invite" is enabled in Apps settings > Catalog > VPP Managed Distribution
  - Device gets VPP user-based apps auto-pushed
  - User clicks on a user-based app

## Supervised vs Non-Supervised Summary

| Behavior | Non-supervised | Supervised |
|----------|---------------|------------|
| App installation | User prompted | Silent install |
| Apple ID for public/VPP user apps | Prompted | Prompted |
| App update (app in use) | Prompted | Prompted |
| App update (app not in use) | Prompted | Silent |
| App management takeover | Prompted | Silent (if not in use) |

## How to Supervise iOS Devices

1. **Apple Configurator 2**: Requires Mac + physical connection. Wipes device data.
2. **Apple Device Enrollment Program (ADE/DEP)**: Devices purchased from Apple. Supervised by default.
3. Check supervision status: Device Details > Security tab in Intune portal.

## Scenario 45: Keeping VPP Apps Updated
> 来源: onenote-ios-app-types-and-deployments.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. **Sync VPP Tokens Regularly**: Configure automatic sync in Intune for VPP token updates
2. **Enable Automatic App Updates**: Intune auto-pushes VPP app updates when new versions available
3. **Monitor Update Status**: Intune admin center > Apps > All apps > select VPP app > check deployment status
4. **Compliance Policies**: Create policies requiring latest app versions
5. **User Notifications**: Use Company Portal notifications to remind users about updates

## Scenario 46: VPP Licensing
> 来源: onenote-ios-app-types-and-deployments.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **User-based licensing**: 1 Apple ID can associate max 10 devices (<5 PC/Mac)
- **Device-based licensing**: No Apple ID required, app assigned directly to device serial number
- **Recommendation**: Use device-based licensing to avoid Apple ID prompts and limits

## Key Differences

- **Store vs VPP**: VPP provides centralized license management; store apps require individual App Store purchases
- **LOB vs Store**: LOB apps uploaded as .ipa files; store apps linked from App Store
- **User vs Device licensing**: User-based requires Apple ID; device-based does not

## Scenario 47: Problem Overview
> 来源: onenote-ios-checkin-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

iOS devices fail to check-in via Company Portal, or Last Check-in time stops updating, causing compliance state not to refresh.

## Historical Cases

## Scenario 48: WV Cases
> 来源: onenote-ios-checkin-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Case ID | Device ID | Date | Issue | Owner | Solution |
|---------|-----------|------|-------|-------|----------|
| 2512150030005387 | 6da604a8-... | 12/15, 12/17 | Last check-in time not updating | Jaime | Update Company Portal |
| 2601060030004300 | 98174a9c-... | 1/6 | Last check-in stuck on 2025.12.22, portal Sync has no effect | Qi | Update Company Portal |
| 2601130030003324 | c416fcb3-... | 1/9 | Last check-in stuck on 2025.12.14, compliance grace period expired but device still compliant | Daisy | Power saving mode |
| 2601280030001250 | 9af7a259-... | 1/28 | Check status fails with error, reinstall CP didn't help | Xi | Upgrade iOS to 26.3 |
| 2603040040000817 | - | 3/4 | Multiple devices non-compliant, can't login M365 | Daisy | Reinstall + restart |

## Scenario 49: Deloitte Cases
> 来源: onenote-ios-checkin-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Case ID | Device ID | Date | Issue | Owner | Solution |
|---------|-----------|------|-------|-------|----------|
| 2601260030004360 | dd89e4f6-... | 01-18 ~ 01-31 | iOS 26.2 but portal shows 26.1, check status fails | Eric | Resolved itself |

## Scenario 50: Step 1: Confirm Impact Scope
> 来源: onenote-ios-checkin-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Confirm number of affected devices
2. If **multiple devices** affected:
   - Check if APN certificate expired or recently changed (if sync breaks uniformly)
   - Check emails sent to `wihotnot@microsoft.com` for IcM incidents
   - Verify if issue reproduces across same CP + iOS version combinations

## Scenario 51: Step 2: Collect Diagnostics
> 来源: onenote-ios-checkin-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Info Type | Collection Method |
|-----------|-------------------|
| Intune Device ID | Intune Admin Portal |
| Outlook Diagnostic Log | Must include **Authenticator** and **Company Portal** logs |

## Scenario 52: Step 3: Analyze Authenticator Logs
> 来源: onenote-ios-checkin-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Check for **Power Saving Mode / Low Power Mode** entries:
- Look for "Power Saving Mode" or "Low Power Mode" in log
- Check if Company Portal logs show interruptions during impact timeframe

## Scenario 53: Step 4: Query Intune Service Kusto Logs
> 来源: onenote-ios-checkin-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Verify auto check-in (every 8 hours) responses:

> **Note**: Devices in sleep mode may not respond, so up to 8-hour delay is normal.

```kusto
let deviceid = "<Intune device id>";
let accountid = "<Account id>";
let starttime = datetime(YYYY-MM-DD);
let endtime = datetime(YYYY-MM-DD);
DeviceManagementProvider
| where env_time between (starttime .. endtime)
| where accountId == accountid
| where deviceId == deviceid
| where EventId == 5782  // TraceIOSCommandEvent
| project env_time
| order by env_time asc
| extend PrevTime = prev(env_time)
| extend GapHours = datetime_diff('hour', env_time, PrevTime)
| where isnotnull(PrevTime)
| project env_time, PrevTime, GapHours, GapDays = GapHours / 24.0
| order by env_time asc
```

## Scenario 54: Result Interpretation
> 来源: onenote-ios-checkin-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| GapHours | Assessment |
|----------|-----------|
| <= 8 hours | Normal |
| 8-24 hours | Possible background app restrictions |
| > 24 hours | Abnormal, needs further analysis |

**Conclusion from Step 3+4**: If power saving mode is on AND Kusto shows extended check-in gaps, the root cause is iOS limiting background app execution, delaying Intune check-in responses.

## Scenario 55: Step 5: Root Cause Determination
> 来源: onenote-ios-checkin-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Scenario | Root Cause | Solution |
|----------|-----------|----------|
| Power saving mode ON + long check-in gaps | iOS restricts background app execution, delaying check-in responses | Disable power saving mode, or add Company Portal to background refresh whitelist |
| Logs show **Check-in Timeout** | Network issue (Intune service never received request) | Check network, proxy, firewall |
| Outdated Company Portal / iOS version | Compatibility issue | Update Company Portal and/or iOS |

## Scenario 56: Historical Resolution Summary
> 来源: onenote-ios-checkin-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Pattern | Fix |
|---------|-----|
| Most common | Update Company Portal app |
| Power saving related | Disable Low Power Mode |
| Timeout scenario | Re-enroll device, or update iOS, then monitor |
| Persistent issue | Reset device if re-enrollment fails |

## Scenario 57: Special Case: Timeout Scenario (Case 2601280030001250)
> 来源: onenote-ios-checkin-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **Symptom**: Logs show check-in **timeout**
- **Priority**: Network issue investigation (Intune service received no request)
- **Limitation**: Without iOS Console logs, cannot determine where request was sent
- **Recommendation**: Reproduce with iOS Console logs. For single device: try re-enrollment; if fails, reset device or update iOS first

## Scenario 58: 1. Configure Fiddler on PC
> 来源: onenote-ios-fiddler-proxy-capture.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Tools > Options > Connections > Enable "Allow remote computers to connect"
2. Tools > Options > HTTPS > Check "Decrypt HTTPS traffic", trust the root cert
3. Download & install "Certificate Maker" plugin from https://www.telerik.com/fiddler/add-ons
4. Restart Fiddler
5. Hover over Online indicator to get Fiddler machine IP

## Scenario 59: 2. Configure iOS Device
> 来源: onenote-ios-fiddler-proxy-capture.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Connect to same Wi-Fi, disable cellular data
2. Verify connectivity: browse to `http://<FiddlerIP>:8888` — should show Echo Service page
3. Settings > WLAN > connected Wi-Fi > Configure Proxy > Manual:
   - Server: Fiddler machine IP
   - Port: 8888
   - Authentication: Off
4. Browse to `http://<FiddlerIP>:8888` on iOS, download FiddlerRoot certificate
5. Install the `.cer` file
6. **Important**: Settings > General > About > Certificate Trust Settings > enable full trust for FiddlerRoot

## Scenario 60: 3. Capture
> 来源: onenote-ios-fiddler-proxy-capture.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Reproduce the issue on iOS device
2. Stop capture in Fiddler (click "Capturing" in lower-left)
3. File > Save All Sessions to export `.saz` file

## Source
- OneNote: IOS logs/Gather Fiddler logs for IOS device

## Scenario 61: 1. Configure Fiddler Classic
> 来源: onenote-ios-fiddler-trace-capture.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Open Fiddler Classic → stop capturing
2. Tools > Options > HTTPS → disable Capturing HTTPS Connects
3. Close Fiddler, install BouncyCastle CertMaker.dll from [here](https://telerik-fiddler.s3.amazonaws.com/fiddler/addons/fiddlercertmaker.exe)
4. Reopen Fiddler → Tools > Options > HTTPS → Actions > Reset all certificates
5. Enable Capturing HTTPS Connects + Decrypt HTTPS traffic
6. Tools > Options > Connections → check "Allow remote computers to connect"
7. Restart Fiddler
8. Ensure firewall allows incoming connections to Fiddler process

## Scenario 62: 2. Get Fiddler Machine IP
> 来源: onenote-ios-fiddler-trace-capture.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Hover over Online indicator at far-right of Fiddler toolbar to see IP addresses

## Scenario 63: 3. Configure iOS Device Proxy
> 来源: onenote-ios-fiddler-trace-capture.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Remove all existing DO_NOT_TRUST_FiddlerRoot profiles: Settings > General > VPN & Device Management
2. Settings > WiFi > current network > (i) icon
3. Scroll to bottom → Configure Proxy → Manual
4. Server: Fiddler machine IP, Port: 8888 → Save

## Scenario 64: 4. Install Fiddler Certificate on iOS
> 来源: onenote-ios-fiddler-trace-capture.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. On iOS browser, navigate to `http://ipv4.fiddler:8888`
2. Click Fiddler root certificate link to download
3. Settings > General > VPN & Device Management → install via Profile Downloaded
4. (iOS 10.3+) Settings > General > About > Certificate Trust Settings → enable full trust for DO_NOT_TRUST_FiddlerRoot

## Scenario 65: 5. Verify
> 来源: onenote-ios-fiddler-trace-capture.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Navigate to `http://FiddlerMachineIP:8888` on iOS → should show Fiddler Echo Service page
- Disable 3G/4G on iPhone (WiFi only)
- Use **Safari** browser (verified working) for capturing

## Tips
- Safari is verified working for trace capture (verified by team member)
- Remember to remove proxy settings and certificate after capture is complete

## Source
- OneNote: MCVKB/Intune/iOS/##MCVKB--ios SSO and debug/##Capture fiddler trace on ios.md

## Scenario 66: Steps (Windows)
> 来源: onenote-ios-iexplorer-log.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Download and install iExplorer
2. On first launch, select **"Keep using Demo mode"**
3. **Use iTunes to backup the device to current PC** (required step)
4. Open iExplorer → find the backup data in the backup section
5. Navigate to app data to find MAM-related information for 3rd party/LOB apps

## What You Can Find
- MAM policy information for managed apps
- 3rd party app and LOB app Intune MAM data
- App-specific configuration and protection policy state

## Tips
- iTunes backup must be completed before iExplorer can read the data
- Demo mode is sufficient for log extraction
- Useful when standard Intune diagnostic logs are insufficient for 3rd party/LOB app MAM issues

## Source
- OneNote: MCVKB/Intune/iOS/Collect iExplorer log for iOS.md

## Scenario 67: Additional Commands
> 来源: onenote-ios-log-collection-methods.md | 适用: Mooncake ✅

### 排查步骤

| Command | Purpose |
|---|---|
| `sdsiosloginfo.exe -d > C:\Folder\iOS_Console_Log.log` | Start logging |
| `sdsdeviceinfo.exe -q com.apple.disk_usage -x > C:\Folder\iOS_Disk_Usage.xml` | Pull disk usage |
| `sdsdeviceinfo.exe -x > C:\Folder\iOS_Device_Stats.xml` | Pull device stats |
| `sdsioscrashlog.exe -e -k C:\Folder` | Pull iTunes/crash logs |

## 4. tcpdump Network Trace (Mac Required)
1. `sudo tcpdump -i <BSDname> -s 0 -B 524288 -w ~/Desktop/DumpFile01.pcap`
2. Reproduce issue (e.g., log into Company Portal)
3. Press Control-C to stop capture
4. Use Company Portal to collect logs and note Incident ID
5. Share DumpFile01.pcap for review
- Ref: https://support.apple.com/en-us/HT202013

## Source
- OneNote: Mooncake POD Support Notebook > Intune > IOS logs

## Scenario 68: Deep MAM Log Extraction (via iTunes Backup)
> 来源: onenote-ios-log-collection.md | 适用: Mooncake ✅

### 排查步骤

1. Backup device to local computer using iTunes (offline installer, NOT Microsoft Store version)
2. Install and launch **iExplorer** (https://www.macroplant.com/iexplorer/)
3. Go to iExplorer → Preferences → check **Show hidden files and folders**
4. Find last backup under **Browse iTunes Backups**
5. Navigate to:
   - `Backup Explorer > AppGroups > [app group] > .IntuneMAM` OR
   - `Backup Explorer > App > [bundleID] > Library > .IntuneMAM`
6. Export all files under `.IntuneMAM`

## Source

- OneNote: Mooncake POD Support Notebook/POD/VMSCIM/4. Services/Intune/IOS logs
- OneNote: Mooncake POD Support Notebook/POD/VMSCIM/4. Services/Intune/IOS logs/1 - Gather MAM logs from 3rd party app

## Scenario 69: Profile Errors (1000-1010)
> 来源: onenote-ios-mdm-error-codes.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Code | Error | Description |
|------|-------|-------------|
| 1000 | Malformed profile | Profile XML is invalid |
| 1001 | Unsupported profile version | Profile version not supported by device |
| 1003 | Bad data type in field | Field has wrong data type |
| 1004 | Bad signature | Profile signature verification failed |
| 1005 | Empty profile | Profile contains no payloads |
| 1006 | Cannot decrypt | Profile decryption failed |
| 1007 | Non-unique UUIDs | Duplicate UUIDs in profile |
| 1008 | Non-unique payload identifiers | Duplicate payload IDs |
| 1009 | Profile installation failure | General install failure |

## Scenario 70: Payload Errors (2000-2005)
> 来源: onenote-ios-mdm-error-codes.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Code | Error | Description |
|------|-------|-------------|
| 2000 | Malformed Payload | Payload structure invalid |
| 2001 | Unsupported payload version | Version not supported |
| 2002 | Missing required field | Required field absent |
| 2003 | Bad data type in field | Wrong data type |
| 2004 | Unsupported field value | Value not valid |

## Scenario 71: Profile Installation Errors (4000-4031)
> 来源: onenote-ios-mdm-error-codes.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Code | Error | Description |
|------|-------|-------------|
| 4000 | Cannot parse profile | Profile parsing failed |
| 4001 | Installation failure | General installation error |
| 4002 | Duplicate UUID | Profile UUID already exists |
| 4003 | Profile not queued | Not in install queue |
| 4004 | User cancelled installation | User declined install |
| 4008 | Mismatched certificates | Cert mismatch |
| 4009 | Device locked | Device is locked |
| 4020 | UI installation prohibited | Cannot install via UI |
| 4025 | Invalid supervision | Supervision requirement not met |

## Scenario 72: Passcode Errors (5000-5018)
> 来源: onenote-ios-mdm-error-codes.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Code | Error | Description |
|------|-------|-------------|
| 5000 | Passcode too short | Does not meet length requirement |
| 5005 | Passcode requires number | Numeric char required |
| 5006 | Passcode requires alpha | Alpha char required |
| 5010 | Device locked | Device is locked |
| 5011 | Wrong passcode | Incorrect passcode |

## Scenario 73: Certificate Errors (9000-9006)
> 来源: onenote-ios-mdm-error-codes.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Code | Error | Description |
|------|-------|-------------|
| 9000 | Invalid password | Certificate password wrong |
| 9002 | Cannot store certificate | Storage failed |
| 9005 | Certificate is malformed | Invalid cert format |
| 9006 | Certificate is not an identity | Not an identity cert |

## Scenario 74: MDM Errors (12000-12081)
> 来源: onenote-ios-mdm-error-codes.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Code | Error | Description |
|------|-------|-------------|
| 12000 | Invalid access rights | Insufficient MDM permissions |
| 12001 | Multiple MDM instances | Device has multiple MDM |
| 12004 | Invalid push certificate | APNs cert invalid |
| 12011 | Invalid MDM configuration | MDM config error |
| 12025 | App already installed | App exists on device |
| 12035 | App cannot be purchased | Purchase not allowed |
| 12047 | Cannot find VPP assignment | VPP license not found |
| 12064 | License not found | App license missing |

## Scenario 75: VPN Errors (15000-15005)
> 来源: onenote-ios-mdm-error-codes.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Code | Error | Description |
|------|-------|-------------|
| 15000 | Cannot install VPN | VPN profile install failed |
| 15001 | Cannot remove VPN | VPN removal failed |
| 15003 | Invalid certificate | VPN cert invalid |
| 15005 | Cannot parse VPN payload | VPN payload malformed |

## Scenario 76: Wi-Fi Errors (13000-13005)
> 来源: onenote-ios-mdm-error-codes.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Code | Error | Description |
|------|-------|-------------|
| 13000 | Cannot install | Wi-Fi install failed |
| 13002 | Password required | Wi-Fi password missing |
| 13003 | Cannot create WiFi configuration | Config creation failed |

## Scenario 77: SCEP/Certificate Provisioning Errors (22000-22013)
> 来源: onenote-ios-mdm-error-codes.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Code | Error | Description |
|------|-------|-------------|
| 22000 | Invalid key usage | Key usage invalid |
| 22001 | Cannot generate key pair | Key generation failed |
| 22005 | Network error | Network connectivity issue |
| 22007 | Invalid signed certificate | Signed cert invalid |
| 22011 | Cannot generate CSR | CSR generation failed |

## Scenario 78: Email Errors (7000-7007)
> 来源: onenote-ios-mdm-error-codes.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Code | Error | Description |
|------|-------|-------------|
| 7000 | Host unreachable | Email server unreachable |
| 7001 | Invalid credentials | Auth failed |
| 7003 | SMIME certificate not found | S/MIME cert missing |

## Scenario 79: Device Supervision Required (29000)
> 来源: onenote-ios-mdm-error-codes.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Code | Error | Description |
|------|-------|-------------|
| 29000 | Device not supervised | Feature requires supervision |

## Usage Notes

- Error codes are negative integers in Intune logs (e.g., -2016332112 maps to code 4000)
- Formula: `ErrorCode = -(2016336112 + code)` approximately
- Cross-reference with Intune device status reports and Kusto DeviceManagementEvent table

## Scenario 80: Broker Types
> 来源: onenote-ios-sso-and-debug.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

**Unmanaged Broker (non-MDM devices):**
- Used for interactive requests only
- Communication via iOS URL schemes; broker response encrypted
- Returns refresh token to the app; app uses RT silently until expiry
- On expiry, user returns to broker interactively

**Managed Broker (MDM devices) — Entra ID SSO Extension:**
- Available only on MDM-managed devices
- Relies on Apple Enterprise SSO feature; admin enables in MDM profile
- Supports silent token operations — all requests go through broker
- MDM + AADR/AADJ/HAADJ device with Microsoft authentication broker

## Scenario 81: Browser SSO
> 来源: onenote-ios-sso-and-debug.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Browser | Configuration |
|---------|--------------|
| Safari | No additional config needed |
| Chrome | Install [Microsoft SSO Chrome extension](https://chromewebstore.google.com/detail/microsoft-single-sign-on/ppnbnpeolgkicgegkbkbjmhlideopiji) |
| Edge | Sign into Edge profile |
| Custom native apps | Admin must add bundleId to SSO extension allow-list |

## Scenario 82: Supported Apps
> 来源: onenote-ios-sso-and-debug.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Apps integrated with MSAL libraries capable of calling platform broker
- Browsers listed in [Conditional Access supported browsers](https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-conditions#supported-browsers)
- Other apps may work with SSO extension in Browser SSO mode (nuanced)

## macOS Notes
- Only managed broker (Entra ID SSO extension) supported
- XPC method for unmanaged Mac devices (Apple engineering, expected H1 2025)
- XPC will NOT support Platform SSO (Entra ID login to Mac)

## Scenario 83: Step 1: Check Sign-in Logs
> 来源: onenote-ios-sso-and-debug.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Azure AD sign-in request status
- Kusto: PerRequestTableIfx with CorrelationId, check ErrorCode, DeviceTrustType, IsDeviceCompliantAndManaged

## Scenario 84: Step 2: Collect Broker Logs
> 来源: onenote-ios-sso-and-debug.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Collect Fiddler trace on iOS
- Collect broker logs via Intune diagnostics

## Scenario 85: Step 3: Analyze Auth Flow
> 来源: onenote-ios-sso-and-debug.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Look for `Prompt=login` — forces fresh login, bypasses SSO
- Check `sso_extension_mode` (full = managed broker active)
- Check `wpj_status` (joined = device registered)
- Check `device_mode` (personal vs shared)

## Scenario 86: Step 1: Determine Licensing Type
> 来源: onenote-vpp-app-install-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **User Licensing**: Allows 5-10 devices per user via Apple ID association. Requires user affinity.
- **Device Licensing**: Associates VPP license to each unique device. No Apple ID required.

## Scenario 87: Step 2: Check Assignment Target
> 来源: onenote-vpp-app-install-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- If deployed to device group without user affinity → only device licensing works
- If user licensing targets device group → uses the Intune user who owns the device

## Scenario 88: Step 3: Collect Info
> 来源: onenote-vpp-app-install-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Device ID (Intune > Devices > All Devices > Hardware)
- VPP App name and iTunes Store ID (adamId)

## Scenario 89: Check app status
> 来源: onenote-vpp-app-install-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
DeviceManagementProvider
| where env_time > ago(2d)
| where ActivityId == "<Intune Device ID>"
| where message contains "<app name>"
| project env_time, EventMessage, message
```

## Scenario 90: Check VPP pre-requisites
> 来源: onenote-vpp-app-install-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
DeviceManagementProvider
| where env_time > ago(2d)
| where ActivityId == "<Intune Device ID>"
| where message contains "<AppId>" 
| where message contains "IsVppAppReadyForInstall" or message contains "VppLicense" or message contains "VPPService"
| project env_time, message
```

## Scenario 91: Check VPP sync status
> 来源: onenote-vpp-app-install-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
VppFeatureTelemetry
| where env_time > ago(2d)
| where accountId == "<account-id>"
| where productId == "<iTunes Store ID>"
| project env_time, userId, deviceId, TaskName, ActivityId
```

## Scenario 92: Common Errors
> 来源: onenote-vpp-app-install-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Error | Cause | Solution |
|-------|-------|----------|
| `yet to accept VPP invite` | User hasn't accepted VPP invite | Verify invite sent; don't block App Store (use Hide instead) |
| `9632: Too many recent calls` | Too many devices/Apple IDs per org | Switch to device licensing |
| `9616: regUsersAlreadyAssigned` | Apple ID used by another Intune user | New Intune user + new Apple ID, or device licensing |
| `VPP user licensing not supported for userless enrollment` | User licensing on device without user affinity | Switch to device licensing |
| `LicenseNotFound` | User changed Apple ID after initial VPP agreement | Log back in with original Apple ID, or device licensing |
| `VppDeviceLicenseAssignmentFailedEvent` + "depleted licenses" | All user licenses consumed | Switch to device licensing or revoke unused assignments |
| `APP_CI_ENFORCEMENT_IN_PROGRESS` | Pre-requisites not met | Check IsVppAppReadyForInstall details |

## Scenario 93: Auto-Update Limitations
> 来源: onenote-vpp-app-install-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- VPP auto-update NOT supported for iOS < 11.3
- Apps will not update even if tenant has auto-update enabled

## References

- [Apple VPP Developer Documentation](https://developer.apple.com/library/content/documentation/Miscellaneous/Reference/MobileDeviceManagementProtocolRef/5-Web_Service_Protocol_VPP/webservice.html)

## Scenario 94: Quick Validation Steps
> 来源: onenote-vpp-app-sync-issues-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Most issues can be identified within minutes by checking these items:

## Scenario 95: Step 1: Check Apple System Status
> 来源: onenote-vpp-app-sync-issues-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Go to https://www.apple.com/support/systemstatus/
- Verify "Volume Purchase Program" shows as **Available**

## Scenario 96: Step 2: Validate VPP Token Status
> 来源: onenote-vpp-app-sync-issues-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Intune Admin Center > Tenant administration > Connectors and tokens > Apple VPP Tokens
- Check token is syncing and reports no issues
- Note the VPP Token ID from the URL

## Scenario 97: Step 3: Verify App Purchased in ABM
> 来源: onenote-vpp-app-sync-issues-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Go to https://business.apple.com > Apps and Books
- Search for the affected app
- Check "Manage licenses" > verify the **Location** matches the VPP token name in Intune
- Note: Recent purchases may take a few minutes to propagate

## Scenario 98: Step 4: Kusto Backend Validation
> 来源: onenote-vpp-app-sync-issues-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

**Get sync Activity ID:**
```kql
VppFeatureTelemetry
| where accountId == "{AccountID}"
| where tokenId == "{VPP-Token-ID}"
| where TaskName == "VppAssetSyncSuccessEvent"
| where env_time > ago(3d)
| project env_time, accountId, tokenId, applications, ActivityId
```
`[来源: onenote-vpp-app-sync-issues-tsg.md]`

**Check app sync details:**
```kql
IntuneEvent
| where ActivityId == "{ActivityID-from-above}"
| project ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6
```
`[来源: onenote-vpp-app-sync-issues-tsg.md]`
Look for the affected app name and verify the TokenID value.

## Scenario 99: Step 5: Renew VPP Token
> 来源: onenote-vpp-app-sync-issues-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

If all above checks pass and the issue persists:
- Follow token renewal procedure in Intune admin center
- Reference: Intune: How to renew a VPP token

## Escalation

If steps 1-5 don't resolve the issue:
- Check with TA/TL or SME
- Post on Intune App-Deployment Teams channel with:
  - Sample app name
  - TokenId
  - Kusto query results

## Scenario 100: Scenario
> 来源: onenote-xiaohongshu-ipad-applock-kiosk-migration.md | 适用: Mooncake ✅

### 排查步骤

Migrating a fleet of iPads from one single-app (AppLock/Kiosk) mode to another (e.g., switching from TencentMeeting to a new meeting app).

## Key Challenges

1. **Sequencing**: Device MUST exit old single-app mode before new single-app profile is pushed. Pushing new profile while old one is active causes device to get stuck.
2. **Report Delay**: Intune policy deployment reports have significant delay (several hours) when removing single-app mode profiles — cannot rely on portal status alone.
3. **Distributed Devices**: Devices spread across multiple offices/meeting rooms, IT cannot physically access all devices.
4. **Rollback Safety**: Need to identify devices that failed to exit old mode and exclude them from new profile push.

## Kusto Queries (21v Intune Cluster)

Cluster: `intunecn.chinanorth2.kusto.chinacloudapi.cn` / Database: `intune`

## Scenario 101: Check RemoveProfile (Exit Old Single-App Mode)
> 来源: onenote-xiaohongshu-ipad-applock-kiosk-migration.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kql
DeviceManagementProvider
| where env_time >= ago(1d)
| where tenantId == "<TENANT_ACCOUNT_ID>"
| where message startswith "[Device] Sending" or message startswith "[Device] Received"
| where commandType == "RemoveProfile"
| extend errorChain = extract(@"ErrorChain:\s*(.*)$", 1, message)
| extend identifier = extract(@"identifier\s+(.+?)\s+with", 1, message)
| summarize
    env_time = max(env_time),
    commandType = take_anyif(commandType, isnotempty(commandType)),
    identifier = take_anyif(identifier, isnotempty(identifier)),
    commandResultStatus = take_anyif(commandResultStatus, isnotempty(commandResultStatus)),
    errorChain = take_anyif(errorChain, isnotempty(errorChain))
by ActivityId, commandUUID
| where identifier has "www.windowsintune.com.app.lock"
| project env_time, ActivityId, commandType, identifier, commandResultStatus, errorChain, commandUUID
```
`[来源: onenote-xiaohongshu-ipad-applock-kiosk-migration.md]`

## Scenario 102: Check InstallProfile (Push New Single-App Mode)
> 来源: onenote-xiaohongshu-ipad-applock-kiosk-migration.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kql
DeviceManagementProvider
| where env_time >= ago(1d)
| where tenantId == "<TENANT_ACCOUNT_ID>"
| where message startswith "[Device] Sending" or message startswith "[Device] Received"
| where commandType == "InstallProfile"
| extend errorChain = extract(@"ErrorChain:\s*(.*)$", 1, message)
| extend identifier = extract(@"identifier\s+(.+?)\s+with", 1, message)
| summarize
    env_time = max(env_time),
    commandType = take_anyif(commandType, isnotempty(commandType)),
    identifier = take_anyif(identifier, isnotempty(identifier)),
    commandResultStatus = take_anyif(commandResultStatus, isnotempty(commandResultStatus)),
    errorChain = take_anyif(errorChain, isnotempty(errorChain))
by ActivityId, commandUUID
| where * has "www.windowsintune.com.app.lock"
| project env_time, ActivityId, commandType, identifier, commandResultStatus, errorChain, commandUUID
```
`[来源: onenote-xiaohongshu-ipad-applock-kiosk-migration.md]`

## Scenario 103: Recommended Migration Steps
> 来源: onenote-xiaohongshu-ipad-applock-kiosk-migration.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Remove old AppLock profile assignment from device group
2. Use Kusto RemoveProfile query to verify removal status per device (don't rely on portal reports)
3. Only after confirming RemoveProfile succeeded, assign new AppLock profile
4. Use Kusto InstallProfile query to verify new profile push status
5. For devices that fail RemoveProfile, investigate individually — may need physical access to factory reset

## Notes

- Profile identifier format: `www.windowsintune.com.app.lock`
- Use `ActivityId` and `commandUUID` to correlate send/receive events
- `commandResultStatus` shows success/failure of each command
- `errorChain` contains detailed error info if failed

---

## Kusto 查询参考

### 查询 1: 查询设备上部署的所有应用

```kql
DeviceManagementProvider  
| where env_time >= ago(7d)
| where ActivityId == '{deviceId}'
| where (EventId == 5767 or EventId == 5766) 
| project env_time, EventId, TaskName, enforcementType, enforcementState, errorCode, 
    name, ['id'], typeAndCategory, applicablilityState, reportComplianceState, 
    EventMessage, message, env_cloud_name, ActivityId, tenantId, userId, 
    sessionId, relatedActivityId2, appPolicyId, platform, technology, devicePlatformType 
| order by ActivityId, env_time asc
```
`[来源: app-install.md]`

### 查询 2: 查询特定应用部署状态

```kql
DeviceManagementProvider  
| where env_time >= ago(2d)
| where ActivityId == '{deviceId}'
| where (['id'] contains '{appId}' or appPolicyId contains '{appId}' 
    or message contains '{appId}' or name contains '{appName}')  
| where (EventId == 5767 or EventId == 5766) 
| project env_time, EventId, TaskName, enforcementType, enforcementState, errorCode, 
    name, ['id'], typeAndCategory, applicablilityState, reportComplianceState, 
    EventMessage, message, env_cloud_name, ActivityId, tenantId, userId, 
    sessionId, relatedActivityId2, appPolicyId, platform, technology, devicePlatformType 
| order by ActivityId, env_time asc
```
`[来源: app-install.md]`

### 查询 3: 查询应用安装日志

```kql
DeviceManagementProvider
| where env_time >= ago(2d)
| where ActivityId == '{deviceId}'
| where message contains '{appName}' or EventMessage contains '{appName}'
| project env_time, message, EventMessage, aadDeviceId, ActivityId
```
`[来源: app-install.md]`

### 查询 4: 已安装/未安装应用对比

```kql
let devId='{deviceId}';

DeviceManagementProvider
| where SourceNamespace == "IntuneCNP"
| where env_time > ago(7d) and ActivityId == devId
| where EventId==5786
| project env_time, EventId, Level, name, type=typeAndCategory, compliance=reportComplianceState, EventMessage  
| where type=="AppModel;AppModel" and compliance=="NotInstalled"
| summarize lastNotInstalled=max(env_time) by name 
| join kind= leftouter (
    DeviceManagementProvider
    | where SourceNamespace == "IntuneCNP"
    | where env_time > ago(7d) and ActivityId == devId
    | where EventId==5786
    | project env_time, EventId, Level, name, type=typeAndCategory, compliance=reportComplianceState, EventMessage  
    | where type=="AppModel;AppModel" and compliance=="Installed"
    | summarize 1stInstalled=min(env_time) by name 
) on name 
| project name, lastNotInstalled, 1stInstalled, compliance = iff(isnull(1stInstalled), "NotInstalled", "Installed")
```
`[来源: app-install.md]`

### 查询 5: 应用下载状态查询

```kql
DownloadService
| where SourceNamespace == "IntuneCNP"
| where env_time > ago(1d)
| where EventId in (13796)
| where deviceId == '{deviceId}' 
| project env_time, SourceNamespace, accountId, deviceId, userId, TaskName, 
    EventId, status, platform, statusCode, exception, errorEventId, result, EventMessage
```
`[来源: app-install.md]`

### 查询 6: SideCar (Win32 App) 事件查询

```kql
IntuneEvent
| where env_time >= ago(3d)
| where ApplicationName == 'SideCar'
| where ActivityId == '{deviceId}'
| project env_time, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, 
    ComponentName, RelatedActivityId, SessionId
```
`[来源: app-install.md]`

### 查询 7: 获取 Win32 App 策略详情

```kql
IntuneEvent
| where env_time >= ago(24h)
| where ApplicationName == 'SideCar'
| where ActivityId == '{deviceId}'
| extend Policy = split(Col3, ',')
| extend PolicyId = split(Policy[0],':')[1]
| extend PolicyType = split(Policy[1],':')[1]
| extend PolicyVersion = split(Policy[2],':')[1]
| extend PolicyBody = split(Policy[5],'":\"')[1]
| project PolicyId, PolicyType, PolicyVersion, PolicyBody
```
`[来源: app-install.md]`

### 查询 8: 检查 IME Agent 是否安装

```kql
DeviceManagementProvider
| where env_time >= ago(30d)
| where * contains '{deviceId}'
| where * contains 'IntuneWindowsAgent'
| project env_time, name, applicablilityState, reportComplianceState  
| summarize max(env_time) by name, applicablilityState, reportComplianceState
```
`[来源: app-install.md]`

### 查询 9: 应用下载事件关联查询（DownloadService + IntuneEvent）

```kql
let starttime = datetime({startTime});
let endtime = datetime({endTime});
let deviceid = '{deviceId}';
let inputAccountId = '{accountId}';
let ApplicationId = '{appId}';

let correlationTable = cluster('intunecn.chinanorth2.kusto.chinacloudapi.cn').database('intune').
IntuneEvent
| where env_time between (starttime..endtime)
| where DeviceId contains deviceid
| where ComponentName == 'DownloadService'
| where EventUniqueName == 'AppRequestCorrelation'
| where AccountId == inputAccountId
| project env_time, env_seqNum, env_cloud_name, env_cloud_role, env_cloud_roleInstance, ApplicationName, BuildVersion, Pid, Tid, ActivityId, RelatedActivityId,
Level = TraceLevel, EventUniqueName, AccountId, ContextId, UserId, DeviceId, ApplicationId = Col1, ContentId = Col2, FileId = Col3, HttpVerb = Col4, cV, Exception = Message;

correlationTable
| summarize by RelatedActivityId, ApplicationId, ContextId
| join (
    DownloadService
    | where env_time between (starttime..endtime) and EventId == 13796
    | where accountId =~ inputAccountId
    | project env_time, env_seqNum, env_cloud_name, env_cloud_role, env_cloud_roleInstance, ApplicationName = I_App,
    BuildVersion = I_BuildVer, Pid, Tid, ActivityId,
    RelatedActivityId = relatedActivityId2, Level, EventUniqueName = TaskName, AccountId = accountId, UserId = userId, DeviceId = deviceId, exceptionType,
    platform, requestedRange, statusCode, bytesDelivered, bytesRequested, timeElapsed, cV, Message = EventMessage
) on RelatedActivityId
| project-away RelatedActivityId1
| order by env_time asc, env_seqNum asc
| summarize MegabytesTransfered = sum(bytesDelivered)/1024/1024 by ApplicationId, AccountId, DeviceId, bin(env_time, 10m)
| order by MegabytesTransfered desc
| limit 1000
```
`[来源: app-install.md]`

### 查询 1: Apple 设备请求/响应查询

```kql
let _deviceId = '{deviceId}';

IntuneEvent
| where env_time > ago(6h)
| where env_cloud_name == "CNPASU01"
| where DeviceId == _deviceId
| where EventUniqueName in ("ExternalAppleHttpCallRequestBody", "ExternalAppleHttpCallResponseBody")
| extend _body = iff(EventUniqueName == "ExternalAppleHttpCallRequestBody", Col5, Col4)
| extend _url = iff(EventUniqueName == "ExternalAppleHttpCallRequestBody", Col4, Col3)
| extend _durationMs = iff(EventUniqueName == "ExternalAppleHttpCallRequestBody", parse_json(Col6).durationMs, "(response has no duration)")
| extend _json = parse_json(_body)
| project env_time, cV, _url, _durationMs, _json, DeviceId
| order by env_time asc
```
`[来源: apple-device.md]`

### 查询 2: iOS 注册服务查询

```kql
IOSEnrollmentService 
| where env_time > ago(30d)
| where ActivityId == '{deviceId}'
| project env_time, userId, callerMethod, message, deviceTypeAsString, 
    serialNumber, siteCode, ActivityId, relatedActivityId2
```
`[来源: apple-device.md]`

### 查询 3: 获取 Apple 设备列表

```kql
let accountId = '{accountId}';

DeviceLifecycle
| where env_time > ago(90d)
| where accountId == accountId
| where platform in ("7", "8", "10")  // iPhone, iPad, macOS
| where deviceId != ""
| summarize 
    LastSeen=max(env_time),
    FirstSeen=min(env_time)
  by deviceId, platform
| extend PlatformName = case(
    platform=="7", "iPhone",
    platform=="8", "iPad",
    platform=="10", "macOS",
    platform)
| order by LastSeen desc
| limit 1000
```
`[来源: apple-device.md]`

### 查询 1: VPP 令牌同步状态查询

```kql
VppFeatureTelemetry
| where accountId == '{accountId}'
| where env_time >= ago(7d)
| where TaskName == "VppApplicationSyncEvent"
| project env_time, env_cloud_name, TaskName, ActivityId, accountId, tokenId, 
    applications, userId, ex, clientContextIntune, clientContextExternalVppService, 
    I_Srv, tokenState
| order by env_time desc
```
`[来源: vpp-token.md]`

### 查询 2: VPP 同步错误查询

```kql
VppFeatureTelemetry
| where accountId == '{accountId}'
| where env_time >= ago(7d)
| where isnotempty(ex)
| project env_time, tokenId, tokenState, ex, TaskName
| order by env_time desc
```
`[来源: vpp-token.md]`

### Step 4: Query Intune Service Kusto Logs

```kql
let deviceid = "<Intune device id>";
let accountid = "<Account id>";
let starttime = datetime(YYYY-MM-DD);
let endtime = datetime(YYYY-MM-DD);
DeviceManagementProvider
| where env_time between (starttime .. endtime)
| where accountId == accountid
| where deviceId == deviceid
| where EventId == 5782  // TraceIOSCommandEvent
| project env_time
| order by env_time asc
| extend PrevTime = prev(env_time)
| extend GapHours = datetime_diff('hour', env_time, PrevTime)
| where isnotnull(PrevTime)
| project env_time, PrevTime, GapHours, GapDays = GapHours / 24.0
| order by env_time asc
```
`[来源: onenote-ios-checkin-troubleshooting.md]`

### Check app status

```kql
DeviceManagementProvider
| where env_time > ago(2d)
| where ActivityId == "<Intune Device ID>"
| where message contains "<app name>"
| project env_time, EventMessage, message
```
`[来源: onenote-vpp-app-install-tsg.md]`

### Check VPP sync status

```kql
VppFeatureTelemetry
| where env_time > ago(2d)
| where accountId == "<account-id>"
| where productId == "<iTunes Store ID>"
| project env_time, userId, deviceId, TaskName, ActivityId
```
`[来源: onenote-vpp-app-install-tsg.md]`

---

## 判断逻辑参考

### 3. VPP assignment settings (Prevent auto updates, Uninstall on removal, etc.)

| where SourceNamespace in ('IntunePE','IntuneFXP')
| where ActivityId == IntuneDeviceID
| where EventUniqueName == "AppleAppPolicyProperties"
| where Col1 == IntuneAppId
| project env_time, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, ...

### 4. App installation error code lookup

| where ErrorCode == "-2016330849"

### Result Interpretation

| GapHours | Assessment |
|----------|-----------|
| <= 8 hours | Normal |
| 8-24 hours | Possible background app restrictions |
| > 24 hours | Abnormal, needs further analysis |

### Profile Errors (1000-1010)

| Code | Error | Description |
|------|-------|-------------|
| 1000 | Malformed profile | Profile XML is invalid |
| 1001 | Unsupported profile version | Profile version not supported by device |
| 1003 | Bad data type in field | Field has wrong data type |
| 1004 | Bad signature | Profile signature verification failed |
| 1005 | Empty profile | Profile contains no payloads |
| 1006 | Cannot decrypt | Profile decryption failed |
| 1007 | Non-unique UUIDs | Duplicate UUIDs in profile |
| 1008 | Non-unique payload identifiers | Duplicate payload IDs |
| 1009 | Profile installation failure | General install failure |

### Payload Errors (2000-2005)

| Code | Error | Description |
|------|-------|-------------|
| 2000 | Malformed Payload | Payload structure invalid |
| 2001 | Unsupported payload version | Version not supported |
| 2002 | Missing required field | Required field absent |
| 2003 | Bad data type in field | Wrong data type |
| 2004 | Unsupported field value | Value not valid |

---

> ⚠️ **21V (Mooncake) 注意**: 本主题包含 21V 特有的限制或配置，请注意区分 Global 与 21V 环境差异。
