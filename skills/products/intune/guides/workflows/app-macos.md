# Intune macOS 应用部署 — 排查工作流

**来源草稿**: ado-wiki-macOS-App-Deployment.md, ado-wiki-macOS-Device-Config.md, onenote-intune-macos-update-kusto.md, onenote-macos-app-deployment-overview.md, onenote-macos-enrollment-renewal-kusto.md, onenote-macos-extension-management.md, onenote-macos-filevault-troubleshooting.md, onenote-macos-log-collection-methods.md, onenote-macos-log-collection.md, onenote-macos-preference-domain-names.md, onenote-macos-preference-domain-reference.md, onenote-macos-shell-script-troubleshooting.md, onenote-macos-shell-script-ts.md, onenote-macos-system-extension-deployment.md
**Kusto 引用**: (无)
**场景数**: 40
**生成日期**: 2026-04-07

---

## Portal 路径

- `Intune > MacOS TSG > Shell TS`
- `Intune > MISC > Collect Intune logs from macOS device`

## Scenario 1: VPP Apps on macOS
> 来源: ado-wiki-macOS-App-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Same Kusto queries and workflow as iOS/iPadOS applies.

## Scenario 2: Sidecar Agent (macOS PKG, DMG, Shell Scripts)
> 来源: ado-wiki-macOS-App-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

General query for a specific device:
```kql
//for macOS PKG, DMG or Shell Scripts
let IntuneASU = "AMSUA0xxx"; //use FXPASU01 for GCC High
let IntuneAccountID = "xxxxxx";
let IntuneDeviceID = "xxxxx";
IntuneEvent
| where env_time >= datetime(2025-10-20 00:01) and env_time < datetime(2025-10-20 23:59)
| where ApplicationName == "SideCar"
| where env_cloud_name == IntuneASU
| where AccountId == IntuneAccountID
| where ActivityId == IntuneDeviceID
| project env_time, EventUniqueName, ComponentName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, UserId, DeviceId
| sort by env_time asc
```
`[来源: ado-wiki-macOS-App-Deployment.md]`

- Look for "resolvedTargeting": "U" = Uninstall, "R" = Required

## Scenario 3: Validate Sidecar Agent Version + App Targeting
> 来源: ado-wiki-macOS-App-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kql
let IntuneDeviceID = "a99f93a2-...";
IntuneEvent
| where env_time >= datetime(2025-10-20 00:01) and env_time < datetime(2025-10-24 23:59)
| where ApplicationName == "SideCar"
| where ActivityId == IntuneDeviceID
| where ColMetadata has "AgentVersion"
| where EventUniqueName == "LogAppTargetingValidationResults"
| project env_time, EventUniqueName, ComponentName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, UserId, DeviceId
| sort by env_time asc
```
`[来源: ado-wiki-macOS-App-Deployment.md]`

## Scenario 4: IntuneMacODC Key Files
> 来源: ado-wiki-macOS-App-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| File Name | Information |
|---|---|
| SW_vrs.txt | Software version with build number |
| QueryDeviceInformation.txt | Activation lock, CPU Architecture, supervision, SU Policies |
| IntuneProfiles.txt | Profiles delivered with Intune profile ID |
| Profiles_list.xml | Profiles delivered with content |
| mdatp_health.txt | Defender Policies pushed via MDM (AV) |
| pkgutil_pkgs.txt | MDM Deployed apps (BundleIDs only) |
| pkgutil_info.txt | MDM Deployed apps, version and install time |
| Library/Logs/Microsoft/IntuneScripts | Shell Script logs |
| Library/Logs/Microsoft/Intune/IntuneMDMDaemon | MDM daemon logs |
| Users/.../Library/Logs/Company Portal | Company Portal Logs (may be cropped) |

## FAQ

- **Which app types use the Sidecar Agent?** macOS app (DMG), macOS (PKG) and Shell scripts. IntuneMDMDaemon logs are critical for troubleshooting.
- **DMG vs LOB?** Use macOS app (DMG/PKG) — newer features and fixes, streamlined troubleshooting.

## Scenario 5: Escalation Data Requirements
> 来源: ado-wiki-macOS-App-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- For VPP: include VPP-specific data + Kusto query results
- For non-VPP: include SideCar logs or macOS ODC
- For DMG/PKG: screenshots of all configurations, pre/post install scripts
- Always include: App name/ID, timestamps of failed install attempts

## Scenario 6: Configuration Methods
> 来源: ado-wiki-macOS-Device-Config.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. **Settings catalog** — first-party (MAU/Defender/Edge/Office) + Apple Profile-Specific Payload Keys
2. **Templates** — Custom, Device features, Device restrictions, Endpoint protection, Extensions, Preference file
3. **Custom profiles** — .xml or .mobileconfig files created via Apple Configurator 2

## Scenario 7: Custom Profile Workflow
> 来源: ado-wiki-macOS-Device-Config.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Download Apple Configurator 2
2. Create profile, select payload (verify macOS compatibility via Apple Configuration Profile Reference)
3. Export .mobileconfig file
4. Test locally on target Mac first
5. Upload to Intune: Devices > macOS > Configuration profiles > Create > Templates > Custom
6. Assign to groups

## Scenario 8: Known Issues
> 来源: ado-wiki-macOS-Device-Config.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

**Scenario 1**: Custom profile (DLP/TCC) assigned to user group fails:
- Error: `NSPOSIXErrorDomain Code=1 "Operation not permitted" — The profile must be a system profile. User profiles are not supported.`
- **Fix**: Assign to device group instead of user group

**Scenario 2**: Script upload shows garbled Unicode characters:
- Cause: File saved with Unicode/UTF-16 encoding
- **Fix**: Re-save with ANSI encoding in Notepad

## Scoping Questions
1. Did this policy ever work or show as succeeded?
2. Are all targeted users/devices impacted, or only a few?
3. What is the policy's goal?
4. If deployed through Apple Configurator directly, does it work?
5. User/device info: UPN, User ID, Intune Device ID, Azure Device/Object ID, Serial Number, OS Version, Model, Enrollment Type
6. Is user licensed for Intune?
7. BYOD or Corporate? Supervised?
8. Policy name and ID?
9. Assigned to user or device group? Exclude assignments?
10. Does device show restriction in Remote Management Profile?
11. Collect device logs while forcing sync

## Support Boundaries
- Intune delivers config to device; if device fails to apply → OS/Apple issue
- Custom XML creation is customer's responsibility
- Many macOS settings require supervised device (ADE or Apple Configurator)

## Scenario 9: Troubleshooting Steps
> 来源: ado-wiki-macOS-Device-Config.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Collect: UPN, User ID, Intune Device ID, Azure Device/Object IDs, Serial, OS Version, Enrollment Type, Policy Name/ID
2. Validate enrollment type via Assist365 or Kusto
3. Check if device is supervised (required for many restrictions):
   ```kusto
   DeviceManagementProvider
   | where ActivityId == "IntuneDeviceID"
   | where message contains "supervised" or message contains "Enrollmenttype"
   | where env_time between (datetime(YYYY-MM-DD 00:00)..datetime(YYYY-MM-DD 23:59))
   | project env_time, message
   ```
4. Confirm profile visible in System Settings > Privacy & Security > Profiles
5. Validate policy targeting and compliance via Kusto:
   ```kusto
   DeviceManagementProvider
   | where deviceId == "IntuneDeviceID"
   | where TaskName == "DeviceManagementProviderCIReportDataEvent"
   | where applicablilityState == "Applicable"
   | project env_time, name, reportComplianceState, typeAndCategory, EventMessage, deviceId
   ```
   Or new query:
   ```kusto
   HighLevelCheckin(deviceIdentifier="IntuneDeviceID", startTime=datetime(...), endTime=datetime(...))
   | where PolicyApplicability == "Applicable"
   | project env_time, PolicyName, PolicyId, PolicyCompliance, PolicyType, EventMessage, PolicyVer
   ```
6. If policy missing → validate group assignments (include/exclude)
7. For Error policies, check individual settings:
   ```kusto
   IntuneEvent
   | where ActivityId == "IntuneDeviceId"
   | where ApplicationName startswith "DeviceCheckin_"
   | project env_time, Col1
   ```

## Scenario 10: Custom Profile Troubleshooting
> 来源: ado-wiki-macOS-Device-Config.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Analyze the .xml/.mobileconfig file
2. Test locally on Mac device first
3. Collect ODC logs: `curl -L https://aka.ms/IntuneMacODC -o IntuneMacODC.sh && sudo ./IntuneMacODC.sh`

## Log Files Reference

| File | Purpose |
|------|---------|
| syslog_Intune.log | Equivalent to Console Logs (most important) |
| IntuneProfiles.txt | Profiles delivered with Intune profile ID |
| Profiles_list.xml | Profiles delivered with content |
| QueryDeviceInformation.txt | Activation lock, CPU, supervision, SW Update |
| mdatp_health.txt | Defender policies via MDM |
| QuerySecurityInfo.txt | Security policies via MDM (Firewall) |
| pkgutil_pkgs.txt / pkgutil_info.txt | MDM deployed apps |
| SSOExtension logs | macOS SSO extension / Platform SSO |

## FAQ
- **Check-in frequency**: Every 15 min for 1 hour after enrollment, then every 8 hours
- **Custom policy conflicts**: Apple applies conflicting settings randomly; Intune only delivers
- **BYOD showing supervised**: macOS 11+ user-approved devices automatically supervised by Intune
- **Variables in .mobileconfig**: Use `{{serialnumber}}`, `{{deviceid}}` — case sensitive

## Scenario 11: Deployment Workflow
> 来源: onenote-macos-app-deployment-overview.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Users enroll devices in Intune (adds user account + device)
2. Admin creates app package specifying app + conditions/parameters
3. Admin assigns app package to users/devices
4. Intune contacts device to retrieve app package from specified location
5. App installs automatically (Required) or becomes available for user to initiate (Available via IWP/Company Portal)

## Supported App Types (macOS)

- **Microsoft 365 apps** (Word, Excel, etc.)
- **Microsoft Edge**
- **PKG** — Native macOS installer packages
- **LOB (.intunemac)** — Wrapped with Intune App Wrapping Tool for Mac
- **DMG** — Disk image files (can be converted to PKG)
- **Store apps** — Synced from respective stores

## Scenario 12: Deployment Flow (IT Admin perspective)
> 来源: onenote-macos-app-deployment-overview.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. IT Admin with Global Admin or Intune Service Admin permission accesses Endpoint Manager portal
2. Upload LOB application (or sync store apps)
3. Assign to devices: Required (auto-push) or Available (user-initiated via IWP/Company Portal)
4. Apps presented to devices after successful check-in with Intune Service
5. Application downloaded to device storage, OS handles installation
6. Reporting available in Endpoint admin console for installation status

## Scenario 13: Scoping Questions for macOS App Deployment Issues
> 来源: onenote-macos-app-deployment-overview.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- What type of application is being deployed? (M365, Edge, PKG, LOB/intunemac, DMG)
- What is the error message and where is it occurring?
- Is this a reporting-only issue? (app installs but does not show as Installed)
- When did the issue start and has it ever worked before?
- How many devices are affected? Does it fail on all targeted devices?
- Can the application be installed manually?
- What is the device model and OS Version?
- How is the device enrolled in Intune?
- How is this impacting your organization? Is there any workaround?
- What documentation are you using as a reference to deploy the application?

## Scenario 14: Step 1: Verify SCEP Certificate & SSL Client Auth
> 来源: onenote-macos-enrollment-renewal-kusto.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
IntuneEvent
| where env_time between (datetime(<start>) .. datetime(<end>))
| where SourceNamespace == "IntuneCNP"  // adjust for environment
| where ComponentName == "FabricAuthenticationModule"
| where ServiceName == "DeviceGatewayProxy"
| where Col3 has '<intune-device-id>'
| extend deviceId = extract("DeviceId=([[:alnum:]-_.]+),", 1, Col3, typeof(string))
| extend accountId = extract("AccountId=([[:alnum:]-_.]+)", 1, Col3, typeof(string))
| extend userId = extract("UserId=([[:alnum:]-_.]+),", 1, Col3, typeof(string))
| where deviceId == '<intune-device-id>'
| project env_time, Col3
```

Key indicators in Col3:
- `ReceivedCallWithSslClientCertificate,<thumbprint>,CN=<device-id>` — device presenting its SCEP cert
- `UdaCertificateValidatedSuccessfully` — cert validation passed
- `SetHttpContextItems` — routing info established

## Scenario 15: Step 2: Track Certificate Issuance
> 来源: onenote-macos-enrollment-renewal-kusto.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
IntuneEvent
| where env_time between (datetime(<start>) .. datetime(<end>))
| where ServiceName == "CertificateAuthority"
| where ActivityId == "<intune-device-id>"
| where EventUniqueName startswith "CosmosPutCert"
| project env_time, ServiceName, EventUniqueName, ColMetadata,
          Col1, Col2, Col3, Col4, env_cloud_environment,
          ActivityId, env_cloud_roleInstance
```

Look for `IssueCertSuccess` with:
- Col1 = IssueDate
- Col2 = certExpirationDate
- Col3 = CertThumbprint
- Col4 = IntermediateCert

## Scenario 16: Step 3: Verify Enrollment Renewal
> 来源: onenote-macos-enrollment-renewal-kusto.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
DeviceLifecycle
| where TaskName == "EnrollmentRenewDeviceEvent"
| where deviceId == '<intune-device-id>'
| project env_time, TaskName, oldThumbprint, oldManagementState,
          newManagementState, newThumbprint
```

## Scenario 17: Step 4: Track Enrollment Session State
> 来源: onenote-macos-enrollment-renewal-kusto.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
IntuneEvent
| where env_time > ago(90d)
| where DeviceId == "<intune-device-id>"
| where * contains "<certificate-thumbprint>"
| project env_time, env_cloud_name, ComponentName, ApplicationName,
          EventUniqueName, ActivityId, Message, ColMetadata,
          Col1, Col4, Col2, Col3, Col5, Col6
```

Key EventUniqueNames:
- `TryAddEnrollmentSessionStateDetails_WriteComplete` — session state recorded
- `DeviceRenewalSuccess` — renewal completed successfully

## Scenario 18: Enrollment Attributes to Check
> 来源: onenote-macos-enrollment-renewal-kusto.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- `ISRENEWAL: True` — confirms this is a renewal flow
- `CHALLENGETYPE: RenewalScep - 3` — SCEP renewal challenge
- `CURRENTCERTIFICATETHUMBPRINT` — old cert being renewed
- `ENROLLMENTTYPE` — e.g., AppleBulkEnrollmentModernAuth

## Scenario 19: Check if extension is deployed
> 来源: onenote-macos-extension-management.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Run on macOS device:
```bash
systemextensionsctl list
```

## Scenario 20: Successful deployment logs (Console.app)
> 来源: onenote-macos-extension-management.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Look for these log entries:
```
SystemExtensionsMDM: cpValidatePayloadForInstall for profile name System Extension Profile returning success
sysextd: Installed MDM payload with UUID <uuid>
mdmclient: Installed configuration profile: System Extension Profile
```

## Finding Team Identifier and Bundle Identifier

Required when configuring system extension profiles in Intune:

1. Open Terminal
2. Run: `sqlite3 /var/db/SystemPolicyConfiguration/KextPolicy`
3. Execute: `SELECT * FROM kext_policy;`

Output shows: Team ID | Bundle ID | Display Name for each extension.

## Scenario 21: Troubleshooting
> 来源: onenote-macos-extension-management.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- `"request contains no authorizationref"` in sysextd logs - may indicate profile deployment timing issue
- Verify profile is targeting device channel, not user channel
- Check that Team ID and Bundle ID match exactly in Intune profile configuration

## Scenario 22: Error Codes Reference
> 来源: onenote-macos-filevault-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Error Code | Constant | Meaning |
|-----------|----------|---------|
| -2016341108 | PrerequisitesNotSatisfied | Prerequisites for FileVault not met |
| -2016341107 | FileVaultNotEnabled | FileVault profile installed but FileVault not enabled on device |
| -2016341106 | FileVaultEnabledByUser | FileVault already enabled by user - Intune cannot manage recovery |

## Kusto Query - Check FileVault Status

```kusto
DeviceManagementProvider
| where env_time > ago(1d)
| where ActivityId == "{deviceID}"
| where message contains "iOSPlugin"
| project env_time, deviceName, userId, DeviceID=ActivityId, PolicyName=name,
    PolicyType=typeAndCategory, Applicability=applicablilityState,
    Compliance=reportComplianceState, EventMessage, message, TaskName
```

## Log Patterns

## Scenario 23: Working (Profile Installed + FileVault Enabled)
> 来源: onenote-macos-filevault-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```
iOSPlugin: Received profile list response with '4' profiles. Profile identifiers:
  www.windowsintune.com.security.filevault,
  www.windowsintune.com.pkcs1credentials.filevaultescrowcertificate,
  Microsoft.Profiles.MDM,
  www.windowsintune.com.security.filevault.escrow
```

## Scenario 24: Error - Payload Installed But Not Enabled (-2016341107)
> 来源: onenote-macos-filevault-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```
iOSPlugin: FileVault payload is installed but FileVault isn't enabled.
iOSPlugin: Processing recovery key for SecurityInfo with value:
iOSPlugin: CommandResult did not contain a FileVault personal recovery key.
```

**Action**: User must log out and log back in to trigger the FileVault enablement prompt.

## Scenario 25: Error - Enabled By User, Not Via Payload (-2016341106)
> 来源: onenote-macos-filevault-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```
iOSPlugin: FileVault is enabled but not via a FileVault payload.
Report an error as this prevents us from backing up a personal recovery key
```

**Action**: Deploy FileVault policy -> user uploads personal recovery key -> Intune assumes management.

## Scenario 26: Assume Management Workflow
> 来源: onenote-macos-filevault-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Prerequisites:
1. Deploy a FileVault policy to the device (will not decrypt/re-encrypt)
2. Direct the device user to upload their personal recovery key to Intune
3. If key is valid, Intune assumes management and generates a new recovery key

> **Important**: Intune does NOT alert users to upload their key. Use IT communication channels.

## References

- [Apple FDEFileVault Documentation](https://developer.apple.com/documentation/devicemanagement/fdefilevault)
- [Apple: Set a FileVault recovery key](https://support.apple.com/en-us/HT202385)
- [Microsoft: Assume management of FileVault](https://docs.microsoft.com/en-us/mem/intune/protect/encrypt-devices-filevault#assume-management-of-filevault-on-previously-encrypted-devices)

## Scenario 27: Additional Log Location
> 来源: onenote-macos-log-collection-methods.md | 适用: Mooncake ✅

### 排查步骤

Sidecar (IME) logs for app installation issues:
```
/Library/Logs/Microsoft/Intune
```

Reference: [View log messages in Console on Mac](https://support.apple.com/en-sg/guide/console/cnsl1012/mac)

## 3. ODC Log Collection (Comprehensive)
1. Open **Terminal**
2. Run:
```bash
curl -L https://aka.ms/IntuneMacODC -o IntuneMacODC.sh
chmod u+x ./IntuneMacODC.sh
sudo ./IntuneMacODC.sh
```
3. Wait for completion. Output folder `odc` is created in the current directory.

## Source
- OneNote: Mooncake POD Support Notebook > Intune > Mac logs

## Scenario 28: Common Domain Names
> 来源: onenote-macos-preference-domain-reference.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| App | Store App Domain | Standalone App Domain |
|-----|-----------------|----------------------|
| OneDrive | com.microsoft.OneDrive-mac | com.microsoft.OneDrive |
| Google Chrome (updates) | - | com.google.Keystone |

## Where to Find Preference Profiles on Device

Managed preference files are stored at:

```
/Library/Managed Preferences/<Preference domain name>.plist
```

## References

- [Best practice examples for configuring macOS apps (Microsoft Tech Community)](https://techcommunity.microsoft.com/t5/intune-customer-success/best-practice-examples-for-configuring-macos-apps-with-microsoft/ba-p/2564255)
- [Deploy and configure OneDrive on Mac (Microsoft Docs)](https://docs.microsoft.com/en-us/onedrive/deploy-and-configure-on-macos)
- [Chrome browser on Mac / Linux (Google)](https://support.google.com/chrome/a/topic/7590800)

## Scenario 29: 1. Check if Intune macOS Agent is installed
> 来源: onenote-macos-shell-script-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kql
DeviceManagementProvider
| where env_time > ago(2d)
| where ActivityId == "<device-id>"
| project env_time, accountId, userId, DeviceID=ActivityId, PolicyName=name,
  PolicyType=typeAndCategory, Applicability=applicablilityState,
  Compliance=reportComplianceState, EventMessage, message, TaskName
```
`[来源: onenote-macos-shell-script-troubleshooting.md]`

## Scenario 30: 2. Check Sidecar events (requires extra cluster)
> 来源: onenote-macos-shell-script-troubleshooting.md | 适用: Mooncake ✅

### 排查步骤

```kql
sidecarmooncakeevent
| where DeviceId == "<device-id>"
| order by EventInfo_Time asc
| project EventInfo_Time, FunctionName, MessageText, LogLevel, FileName,
  ColumnMetadata, Col1, Col2, Col3, Col4, Col5, Col6, DeviceId, DeviceInfo_OsVersion
```
`[来源: onenote-macos-shell-script-troubleshooting.md]`
> Note: Requires adding Sidecar Mooncake cluster in Kusto Explorer

## Scenario 31: 3. Check shell script execution result
> 来源: onenote-macos-shell-script-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kql
IntuneEvent
| where env_time >= datetime('YYYY-MM-DD HH:MM:SS') and env_time <= datetime('YYYY-MM-DD HH:MM:SS')
| where DeviceId == "<device-id>"
| where Col5 == "ShellScriptResult" or Col4 == "ShellScript"
| project env_time, ActivityId, RelatedActivityId, EventUniqueName,
  ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, Message
```
`[来源: onenote-macos-shell-script-troubleshooting.md]`

## Scenario 32: 4. Check specific policy script results across tenant
> 来源: onenote-macos-shell-script-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kql
IntuneEvent
| where env_time >= ago(2d)
| where AccountId == "<tenant-id>"
| where Col5 == "ShellScriptResult" or Col4 == "ShellScript"
| where ActivityId == "<device-id>"
| project env_time, DeviceId, RelatedActivityId, EventUniqueName,
  ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, Message
| summarize DeviceCount = dcount(DeviceId) by policyId=Col4,
  bin(env_time, 8h), Col5, ShellScriptResult=Col6
| order by bin(env_time, 8h), DeviceCount, Col5, ShellScriptResult
```
`[来源: onenote-macos-shell-script-troubleshooting.md]`

## Key Log Files on Device
| Log | Path |
|-----|------|
| MDM Daemon | `/Library/Logs/Microsoft/Intune/IntuneMDMDaemon*.log` |
| Company Portal | `~/Library/Logs/Company Portal/com.microsoft.CompanyPortalMac*.log` |
| Install log | `/private/var/log/install.log` or `/var/log/install.log` |
| Console.app | Filter on `downloadd` to check agent install |

## Scenario 33: Common Issues
> 来源: onenote-macos-shell-script-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Mac scripting requires Intune MDM Agent (Company Portal must be installed)
2. Multiple scripts run in parallel as separate processes
3. "Run as signed-in user" scripts run for ALL currently signed-in user accounts
4. Root privileges required for changes standard user cannot make
5. Scripts attempt to run more frequently than configured if: disk full, storage location tampered, local cache deleted, Mac restarts
6. MDM check-in differs from agent check-in (agent every 8 hours)
7. Periodic scripts only report status on first run
8. Agent telemetry controlled by Mac Company Portal "usage data collection" preference

## Useful Resources
- [IntuneMacODC log collector](https://github.com/markstan/IntuneMacODC)
- [Sample shell scripts for Intune](https://github.com/microsoft/shell-intune-samples)

## Related
- intune-onenote-297: Shell script reports Error but actually ran successfully
- intune-onenote-313: Sidecar/Agent workflow overview

## Scenario 34: Prerequisites
> 来源: onenote-macos-shell-script-ts.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Intune MDM Agent (Company Portal) must be installed
- Agent location: `/Library/Intune/Microsoft Intune Agent.app`

## Kusto Queries

## Scenario 35: Check if Intune management agent is installed
> 来源: onenote-macos-shell-script-ts.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kql
DeviceManagementProvider
| where env_time > ago(2d)
| where ActivityId == "{deviceID}"
| project env_time, accountId, deviceName, userId, DeviceID=ActivityId,
    PolicyName=name, PolicyType=typeAndCategory,
    Applicability=applicablilityState, Compliance=reportComplianceState,
    EventMessage, message, TaskName
```
`[来源: onenote-macos-shell-script-ts.md]`

## Scenario 36: Check shell script execution result
> 来源: onenote-macos-shell-script-ts.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kql
IntuneEvent
| where env_time >= datetime('YYYY-MM-DD HH:MM:SS') and env_time <= datetime('YYYY-MM-DD HH:MM:SS')
| where DeviceId == "{deviceId}"
| where Col5 == "ShellScriptResult" or Col4 == "ShellScript"
| project env_time, ActivityId, RelatedActivityId, EventUniqueName,
    ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, Message
```
`[来源: onenote-macos-shell-script-ts.md]`

## Scenario 37: Check tenant-wide shell script results
> 来源: onenote-macos-shell-script-ts.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kql
IntuneEvent
| where env_time >= ago(2d)
| where AccountId == "{tenantId}"
| where Col5 == "ShellScriptResult" or Col4 == "ShellScript"
| project env_time, DeviceId, RelatedActivityId, EventUniqueName,
    ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, Message
| summarize DeviceCount = dcount(DeviceId) by policyId=Col4, bin(env_time, 8h), Col5, ShellScriptResult=Col6
| order by bin(env_time, 8h), DeviceCount, Col5, ShellScriptResult
```
`[来源: onenote-macos-shell-script-ts.md]`

## Scenario 38: SideCar (21v/Mooncake) Kusto
> 来源: onenote-macos-shell-script-ts.md | 适用: Mooncake ✅

### 排查步骤

```kql
sidecarmooncakeevent
| where DeviceId == "{deviceId}"
| order by EventInfo_Time asc
| project EventInfo_Time, FunctionName, MessageText, LogLevel, FileName,
    ColumnMetadata, Col1, Col2, Col3, Col4, Col5, Col6, DeviceId, DeviceInfo_OsVersion
```
`[来源: onenote-macos-shell-script-ts.md]`

Cluster: `https://kusto.aria.microsoft.com` (Public cloud, AAD-Federated)
Database: `IntuneMacSidecar`

## Log Collection

Collect these files from macOS device:
- `/Library/Logs/Microsoft/Intune/IntuneMDMDaemon*.log` - script running results
- `~/Library/Logs/Company Portal/com.microsoft.CompanyPortalMac*.log`
- `/private/var/log/install.log` - IME app installation + LOB app installation
- `/var/log/install.log`
- Console.app log filtered on `downloadd` - verify agent installation

## Scenario 39: DMG App Deployment
> 来源: onenote-macos-shell-script-ts.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

For DMG-based app deployment troubleshooting, check `install.log` for installation status.

## Reference

- [macOS Scripting Troubleshooting Guide (SideCar)](https://www.intunewiki.com/wiki/MacOS_Scripting_Troubleshooting_Guide_(SideCar_for_MacOS))
- [Sample shell scripts for Intune admins](https://github.com/microsoft/shell-intune-samples)

## Scenario 40: Check via Console Logs (Successful Deployment)
> 来源: onenote-macos-system-extension-deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```
SystemExtensionsMDM  cpValidatePayloadForInstall for profile name System Extension Profile returning success
sysextd  Received request to install MDM payload with UUID {uuid}
sysextd  Installed MDM payload with UUID {uuid}
SystemExtensionsMDM  cpInstallPayload for profile name System Extension Profile returned success
mdmclient  Installed configuration profile: System Extension Profile (www.windowsintune.com.systemExtensionPolicy:{id}) for <Computer> (Source: MDM)
```

## Find Team ID and Bundle ID

Required for Intune system extension allowlist configuration.

```bash
# Open Terminal
sqlite3 /var/db/SystemPolicyConfiguration/KextPolicy

# Run query
SELECT * FROM kext_policy;
```

Output shows: Team ID (first column), Bundle ID, and developer display name for each extension.

## References

- [Support Tip: Using system extensions instead of kernel extensions (Microsoft Tech Community)](https://techcommunity.microsoft.com/t5/intune-customer-success/support-tip-using-system-extensions-instead-of-kernel-extensions/ba-p/1191413)
- [Deprecated Kernel Extensions and System Extension Alternatives (Apple Developer)](https://developer.apple.com/support/kernel-extensions/)

---

## Kusto 查询参考

### Troubleshooting Steps

```kql
DeviceManagementProvider
   | where ActivityId == "IntuneDeviceID"
   | where message contains "supervised" or message contains "Enrollmenttype"
   | where env_time between (datetime(YYYY-MM-DD 00:00)..datetime(YYYY-MM-DD 23:59))
   | project env_time, message
```
`[来源: ado-wiki-macOS-Device-Config.md]`

### Troubleshooting Steps

```kql
DeviceManagementProvider
   | where deviceId == "IntuneDeviceID"
   | where TaskName == "DeviceManagementProviderCIReportDataEvent"
   | where applicablilityState == "Applicable"
   | project env_time, name, reportComplianceState, typeAndCategory, EventMessage, deviceId
```
`[来源: ado-wiki-macOS-Device-Config.md]`

### Troubleshooting Steps

```kql
HighLevelCheckin(deviceIdentifier="IntuneDeviceID", startTime=datetime(...), endTime=datetime(...))
   | where PolicyApplicability == "Applicable"
   | project env_time, PolicyName, PolicyId, PolicyCompliance, PolicyType, EventMessage, PolicyVer
```
`[来源: ado-wiki-macOS-Device-Config.md]`

### Troubleshooting Steps

```kql
IntuneEvent
   | where ActivityId == "IntuneDeviceId"
   | where ApplicationName startswith "DeviceCheckin_"
   | project env_time, Col1
```
`[来源: ado-wiki-macOS-Device-Config.md]`

### Query 1: QMS Processing Status

```kql
IntuneEvent
| where env_time > ago(10d)
| where ComponentName == "ProcessMacOSSoftwareUpdateStatusMessageFromQmsIntoCosmosProvider"
| where EventUniqueName !in ("GetMessagesStop", "GetMessagesStarted",
    "TaskRunTimeBeforeExit", "BatchDeleteMessagesStop",
    "BatchOfMessagesProcessedComplete", "QMSProcessedMessagesDeletedSuccesfully",
    "QMSProxyStart", "QMSProxyStop", "BatchDeleteMessagesStart")
| where DeviceId == "{deviceId}"
| project env_time, Pid, Tid, EventUniqueName, ColMetadata, Col1, Col2, Col3,
          Col4, Col5, Col6, Message, AccountId, DeviceId, UserId 
| order by env_time asc
```
`[来源: onenote-intune-macos-update-kusto.md]`

### Query 2: Device Plugin Actions

```kql
DeviceManagementProvider
| where env_time > ago(2d)
| where ActivityId == "{deviceId}"
| project env_time, message, osVersion, commandType, commandResultStatus, accountId, userId 
| where message startswith "iOSPlugin" or message contains "MacOS"
    or message contains "UpdateResults" or message contains "OSUpdateStatus"
    or commandType != "" or commandResultStatus != ""
| order by env_time asc
```
`[来源: onenote-intune-macos-update-kusto.md]`

### Step 1: Verify SCEP Certificate & SSL Client Auth

```kql
IntuneEvent
| where env_time between (datetime(<start>) .. datetime(<end>))
| where SourceNamespace == "IntuneCNP"  // adjust for environment
| where ComponentName == "FabricAuthenticationModule"
| where ServiceName == "DeviceGatewayProxy"
| where Col3 has '<intune-device-id>'
| extend deviceId = extract("DeviceId=([[:alnum:]-_.]+),", 1, Col3, typeof(string))
| extend accountId = extract("AccountId=([[:alnum:]-_.]+)", 1, Col3, typeof(string))
| extend userId = extract("UserId=([[:alnum:]-_.]+),", 1, Col3, typeof(string))
| where deviceId == '<intune-device-id>'
| project env_time, Col3
```
`[来源: onenote-macos-enrollment-renewal-kusto.md]`

### Step 2: Track Certificate Issuance

```kql
IntuneEvent
| where env_time between (datetime(<start>) .. datetime(<end>))
| where ServiceName == "CertificateAuthority"
| where ActivityId == "<intune-device-id>"
| where EventUniqueName startswith "CosmosPutCert"
| project env_time, ServiceName, EventUniqueName, ColMetadata,
          Col1, Col2, Col3, Col4, env_cloud_environment,
          ActivityId, env_cloud_roleInstance
```
`[来源: onenote-macos-enrollment-renewal-kusto.md]`

### Step 3: Verify Enrollment Renewal

```kql
DeviceLifecycle
| where TaskName == "EnrollmentRenewDeviceEvent"
| where deviceId == '<intune-device-id>'
| project env_time, TaskName, oldThumbprint, oldManagementState,
          newManagementState, newThumbprint
```
`[来源: onenote-macos-enrollment-renewal-kusto.md]`

### Step 4: Track Enrollment Session State

```kql
IntuneEvent
| where env_time > ago(90d)
| where DeviceId == "<intune-device-id>"
| where * contains "<certificate-thumbprint>"
| project env_time, env_cloud_name, ComponentName, ApplicationName,
          EventUniqueName, ActivityId, Message, ColMetadata,
          Col1, Col4, Col2, Col3, Col5, Col6
```
`[来源: onenote-macos-enrollment-renewal-kusto.md]`

### Kusto Query - Check FileVault Status

```kql
DeviceManagementProvider
| where env_time > ago(1d)
| where ActivityId == "{deviceID}"
| where message contains "iOSPlugin"
| project env_time, deviceName, userId, DeviceID=ActivityId, PolicyName=name,
    PolicyType=typeAndCategory, Applicability=applicablilityState,
    Compliance=reportComplianceState, EventMessage, message, TaskName
```
`[来源: onenote-macos-filevault-troubleshooting.md]`

---

## 判断逻辑参考

### Query 1: QMS Processing Status

| where env_time > ago(10d)
| where ComponentName == "ProcessMacOSSoftwareUpdateStatusMessageFromQmsIntoCosmosProvider"
| where EventUniqueName !in ("GetMessagesStop", "GetMessagesStarted",

### Query 1: QMS Processing Status

| where DeviceId == "{deviceId}"
| project env_time, Pid, Tid, EventUniqueName, ColMetadata, Col1, Col2, Col3,

### Query 1: QMS Processing Status

| order by env_time asc

### Query 2: Device Plugin Actions

| where env_time > ago(2d)
| where ActivityId == "{deviceId}"
| project env_time, message, osVersion, commandType, commandResultStatus, accountId, userId 
| where message startswith "iOSPlugin" or message contains "MacOS"

### Query 2: Device Plugin Actions

| order by env_time asc

---

> ⚠️ **21V (Mooncake) 注意**: 本主题包含 21V 特有的限制或配置，请注意区分 Global 与 21V 环境差异。
