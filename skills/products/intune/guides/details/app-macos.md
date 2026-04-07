# Intune macOS 应用部署 — 综合排查指南

**条目数**: 7 | **草稿融合数**: 14 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-macOS-App-Deployment.md, ado-wiki-macOS-Device-Config.md, onenote-intune-macos-update-kusto.md, onenote-macos-app-deployment-overview.md, onenote-macos-enrollment-renewal-kusto.md, onenote-macos-extension-management.md, onenote-macos-filevault-troubleshooting.md, onenote-macos-log-collection-methods.md, onenote-macos-log-collection.md, onenote-macos-preference-domain-names.md
**生成日期**: 2026-04-07

---

## ⚠️ 已知矛盾 (4 条)

- **solution_conflict** (high): intune-ado-wiki-039 vs intune-onenote-302 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **solution_conflict** (high): intune-ado-wiki-039 vs intune-onenote-331 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **solution_conflict** (high): intune-ado-wiki-183 vs intune-onenote-302 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **solution_conflict** (high): intune-ado-wiki-183 vs intune-onenote-331 — context_dependent: 不同来源给出不同方案，可能适用不同场景

## 排查流程

### Phase 1: Macos App Deployment
> 来源: ADO Wiki — [ado-wiki-macOS-App-Deployment.md](../drafts/ado-wiki-macOS-App-Deployment.md)

**macOS App Deployment Troubleshooting Guide**
**Overview**
**Support Boundaries**
**Scoping Questions**
- What type of application? (Microsoft 365, Edge, PKG, LOB, DMG)
- Error message and where it occurs?
- Reporting-only issue? (app installs but shows as Not Installed)
- When did the issue start? Has it ever worked?
- How many devices affected? All targeted devices?
- Can the app be installed manually?
- Device model and OS version?
- How is the device enrolled?
- Impact and workaround availability?

**Troubleshooting**

**VPP Apps on macOS**

**Sidecar Agent (macOS PKG, DMG, Shell Scripts)**
```kql
```
- Look for "resolvedTargeting": "U" = Uninstall, "R" = Required

**Validate Sidecar Agent Version + App Targeting**
```kql
```

**IntuneMacODC Key Files**

**FAQ**
- **Which app types use the Sidecar Agent?** macOS app (DMG), macOS (PKG) and Shell scripts. IntuneMDMDaemon logs are critical for troubleshooting.
- **DMG vs LOB?** Use macOS app (DMG/PKG) — newer features and fixes, streamlined troubleshooting.

**Escalation Data Requirements**
- For VPP: include VPP-specific data + Kusto query results
- For non-VPP: include SideCar logs or macOS ODC
- For DMG/PKG: screenshots of all configurations, pre/post install scripts
- Always include: App name/ID, timestamps of failed install attempts

### Phase 2: Macos Device Config
> 来源: ADO Wiki — [ado-wiki-macOS-Device-Config.md](../drafts/ado-wiki-macOS-Device-Config.md)

**macOS Device Configuration**
**Overview**
**Configuration Methods**
1. **Settings catalog** — first-party (MAU/Defender/Edge/Office) + Apple Profile-Specific Payload Keys
2. **Templates** — Custom, Device features, Device restrictions, Endpoint protection, Extensions, Preference file
3. **Custom profiles** — .xml or .mobileconfig files created via Apple Configurator 2

**Custom Profile Workflow**
1. Download Apple Configurator 2
2. Create profile, select payload (verify macOS compatibility via Apple Configuration Profile Reference)
3. Export .mobileconfig file
4. Test locally on target Mac first
5. Upload to Intune: Devices > macOS > Configuration profiles > Create > Templates > Custom

**Known Issues**
- Error: `NSPOSIXErrorDomain Code=1 "Operation not permitted" — The profile must be a system profile. User profiles are not supported.`
- **Fix**: Assign to device group instead of user group
- Cause: File saved with Unicode/UTF-16 encoding
- **Fix**: Re-save with ANSI encoding in Notepad

**Scoping Questions**
1. Did this policy ever work or show as succeeded?
2. Are all targeted users/devices impacted, or only a few?
3. What is the policy's goal?
4. If deployed through Apple Configurator directly, does it work?
5. User/device info: UPN, User ID, Intune Device ID, Azure Device/Object ID, Serial Number, OS Version, Model, Enrollment Type

**Support Boundaries**
- Intune delivers config to device; if device fails to apply → OS/Apple issue
- Custom XML creation is customer's responsibility
- Many macOS settings require supervised device (ADE or Apple Configurator)
... (详见原始草稿)

### Phase 3: Intune Macos Update Kusto
> 来源: OneNote — [onenote-intune-macos-update-kusto.md](../drafts/onenote-intune-macos-update-kusto.md)

**Intune macOS Software Update — Kusto Troubleshooting Guide**
**Query 1: QMS Processing Status**
```kql
```
- `EventUniqueName == "MessageProcessedSuccessfully"` → update processed OK
- Filter by `Pid` to see messages for a single background task instance
- 1 message per update category; individual update data visible in Col fields
- State int mappings: see `Updates\src\Services\Common\Models\SoftwareUpdate\CosmosDbEntity\MacOSSoftwareUpdateState.cs`

**Query 2: Device Plugin Actions**
```kql
```
- Log lines with `iOSPlugin[CreateOrUpdate]: Scheduling [{ProductKey}] to be updated with installAction [Default]` → updates being scheduled, likely Apple-side issue if no errors follow
- Cross-reference `ProductKey` between both queries to correlate QMS processing with device plugin actions
- If reporting seems wrong, check plugin logs and correlate ProductKeys

### Phase 4: Macos App Deployment Overview
> 来源: OneNote — [onenote-macos-app-deployment-overview.md](../drafts/onenote-macos-app-deployment-overview.md)

**macOS App Deployment Overview**
**Deployment Workflow**
1. Users enroll devices in Intune (adds user account + device)
2. Admin creates app package specifying app + conditions/parameters
3. Admin assigns app package to users/devices
4. Intune contacts device to retrieve app package from specified location
5. App installs automatically (Required) or becomes available for user to initiate (Available via IWP/Company Portal)

**Supported App Types (macOS)**
- **Microsoft 365 apps** (Word, Excel, etc.)
- **Microsoft Edge**
- **PKG** — Native macOS installer packages
- **LOB (.intunemac)** — Wrapped with Intune App Wrapping Tool for Mac
- **DMG** — Disk image files (can be converted to PKG)
- **Store apps** — Synced from respective stores

**Deployment Flow (IT Admin perspective)**
1. IT Admin with Global Admin or Intune Service Admin permission accesses Endpoint Manager portal
2. Upload LOB application (or sync store apps)
3. Assign to devices: Required (auto-push) or Available (user-initiated via IWP/Company Portal)
4. Apps presented to devices after successful check-in with Intune Service
5. Application downloaded to device storage, OS handles installation

**Scoping Questions for macOS App Deployment Issues**
- What type of application is being deployed? (M365, Edge, PKG, LOB/intunemac, DMG)
- What is the error message and where is it occurring?
- Is this a reporting-only issue? (app installs but does not show as Installed)
- When did the issue start and has it ever worked before?
... (详见原始草稿)

### Phase 5: Macos Enrollment Renewal Kusto
> 来源: OneNote — [onenote-macos-enrollment-renewal-kusto.md](../drafts/onenote-macos-enrollment-renewal-kusto.md)

**macOS Device Enrollment Certificate Renewal Investigation (Kusto)**
**Step 1: Verify SCEP Certificate & SSL Client Auth**
```kusto
```
- `ReceivedCallWithSslClientCertificate,<thumbprint>,CN=<device-id>` — device presenting its SCEP cert
- `UdaCertificateValidatedSuccessfully` — cert validation passed
- `SetHttpContextItems` — routing info established

**Step 2: Track Certificate Issuance**
```kusto
```
- Col1 = IssueDate
- Col2 = certExpirationDate
- Col3 = CertThumbprint
- Col4 = IntermediateCert

**Step 3: Verify Enrollment Renewal**
```kusto
```

**Step 4: Track Enrollment Session State**
```kusto
```
- `TryAddEnrollmentSessionStateDetails_WriteComplete` — session state recorded
- `DeviceRenewalSuccess` — renewal completed successfully

**Enrollment Attributes to Check**
- `ISRENEWAL: True` — confirms this is a renewal flow
- `CHALLENGETYPE: RenewalScep - 3` — SCEP renewal challenge
- `CURRENTCERTIFICATETHUMBPRINT` — old cert being renewed
- `ENROLLMENTTYPE` — e.g., AppleBulkEnrollmentModernAuth

### Phase 6: Macos Extension Management
> 来源: OneNote — [onenote-macos-extension-management.md](../drafts/onenote-macos-extension-management.md)

**macOS System/Kernel Extension Management via Intune**
**Overview**
**Key References**
- [Support Tip: Using system extensions instead of kernel extensions](https://techcommunity.microsoft.com/t5/intune-customer-success/support-tip-using-system-extensions-instead-of-kernel-extensions/ba-p/1191413)
- [Apple: Deprecated Kernel Extensions and System Extension Alternatives](https://developer.apple.com/support/kernel-extensions/)

**Verification**

**Check if extension is deployed**
```bash
```

**Successful deployment logs (Console.app)**
```
```

**Finding Team Identifier and Bundle Identifier**
1. Open Terminal
2. Run: `sqlite3 /var/db/SystemPolicyConfiguration/KextPolicy`
3. Execute: `SELECT * FROM kext_policy;`

**Troubleshooting**
- `"request contains no authorizationref"` in sysextd logs - may indicate profile deployment timing issue
- Verify profile is targeting device channel, not user channel
- Check that Team ID and Bundle ID match exactly in Intune profile configuration

### Phase 7: Macos Filevault Troubleshooting
> 来源: OneNote — [onenote-macos-filevault-troubleshooting.md](../drafts/onenote-macos-filevault-troubleshooting.md)

**macOS FileVault Troubleshooting Guide**
**Error Codes Reference**
**Kusto Query - Check FileVault Status**
```kusto
```
**Log Patterns**
**Working (Profile Installed + FileVault Enabled)**
```
```
**Error - Payload Installed But Not Enabled (-2016341107)**
```
```
**Error - Enabled By User, Not Via Payload (-2016341106)**
```
```
**Assume Management Workflow**
1. Deploy a FileVault policy to the device (will not decrypt/re-encrypt)
2. Direct the device user to upload their personal recovery key to Intune
3. If key is valid, Intune assumes management and generates a new recovery key

**References**
- [Apple FDEFileVault Documentation](https://developer.apple.com/documentation/devicemanagement/fdefilevault)
- [Apple: Set a FileVault recovery key](https://support.apple.com/en-us/HT202385)
- [Microsoft: Assume management of FileVault](https://docs.microsoft.com/en-us/mem/intune/protect/encrypt-devices-filevault#assume-management-of-filevault-on-previously-encrypted-devices)

### Phase 8: Macos Log Collection Methods
> 来源: OneNote — [onenote-macos-log-collection-methods.md](../drafts/onenote-macos-log-collection-methods.md)

**macOS Intune Log Collection Methods**
**1. Company Portal Diagnostic Report (Simplest)**
1. Open **Company Portal** app on Mac
2. Click **Help** > **Send Diagnostic Report**
3. Collect the **Incident ID** and share with support

**2. macOS Console Log (Real-time Debug)**
1. Press **Cmd + Space**, search for **Console** (or Applications > Utilities > Console)
2. Select your macOS device from the Devices list
3. Click **Start** to begin capturing
4. From menu: **Action** > **Include Info Messages** and **Include Debug Messages**
5. Reproduce the issue, then pause capturing

**Additional Log Location**
```
```

**3. ODC Log Collection (Comprehensive)**
1. Open **Terminal**
2. Run:
```bash
```
3. Wait for completion. Output folder `odc` is created in the current directory.

**Source**
- OneNote: Mooncake POD Support Notebook > Intune > Mac logs

### Phase 9: Macos Log Collection
> 来源: OneNote — [onenote-macos-log-collection.md](../drafts/onenote-macos-log-collection.md)

**macOS Intune Log Collection Guide**
**Source**
- OneNote: Mooncake POD Support Notebook > Intune > MISC > Collect Intune logs from macOS device
- Reference: https://cloudinfra.net/how-to-collect-intune-logs-from-macos-device/
- Internal: https://eng.ms/docs/microsoft-security/management/intune/microsoft-intune/intune/scenarios/macsidecar/tsgs

**Key Log File Locations**

**Console Log Collection Commands**
```bash

**Download/content delivery logs (last 7 days)**

**Uber agent logs (last 4 days)**

**All Intune + MDM process logs**

**MDM client logs (last 30 days)**

**App Store download logs (last 30 days)**
```

**Usage Tips**
- Always collect **IntuneMDMDaemon** logs first - they cover most enrollment and policy issues
- For app deployment issues, combine **Company Portal** logs with **storedownloadd** logs
- For VPP/managed app issues, the **appstored** predicate is essential
- Console log commands can take several minutes to complete on 30-day ranges

### Phase 10: Macos Preference Domain Names
> 来源: OneNote — [onenote-macos-preference-domain-names.md](../drafts/onenote-macos-preference-domain-names.md)

**macOS Preference Domain Names for Intune Configuration Profiles**
**Overview**
**Key Difference: Store vs Standalone**
**Where Preferences Are Stored**
```
```
**Best Practices**
- [Best practice examples for configuring macOS apps with Microsoft Endpoint Manager](https://techcommunity.microsoft.com/t5/intune-customer-success/best-practice-examples-for-configuring-macos-apps-with-microsoft/ba-p/2564255)
- Always verify the correct domain name for the app variant (Store vs Standalone) before creating the configuration profile
- Use `defaults read <domain>` on a test device to verify settings are applied

### Phase 11: Macos Preference Domain Reference
> 来源: OneNote — [onenote-macos-preference-domain-reference.md](../drafts/onenote-macos-preference-domain-reference.md)

**macOS Preference Domain Names Reference**
**Key Concept**
**Common Domain Names**
**Where to Find Preference Profiles on Device**
```
```
**References**
- [Best practice examples for configuring macOS apps (Microsoft Tech Community)](https://techcommunity.microsoft.com/t5/intune-customer-success/best-practice-examples-for-configuring-macos-apps-with-microsoft/ba-p/2564255)
- [Deploy and configure OneDrive on Mac (Microsoft Docs)](https://docs.microsoft.com/en-us/onedrive/deploy-and-configure-on-macos)
- [Chrome browser on Mac / Linux (Google)](https://support.google.com/chrome/a/topic/7590800)

### Phase 12: Macos Shell Script Troubleshooting
> 来源: OneNote — [onenote-macos-shell-script-troubleshooting.md](../drafts/onenote-macos-shell-script-troubleshooting.md)

**macOS Shell Script Troubleshooting (Intune)**
**Source**
**Kusto Queries**
**1. Check if Intune macOS Agent is installed**
```kql
```
**2. Check Sidecar events (requires extra cluster)**
```kql
```
**3. Check shell script execution result**
```kql
```
**4. Check specific policy script results across tenant**
```kql
```
**Key Log Files on Device**
**Common Issues**
1. Mac scripting requires Intune MDM Agent (Company Portal must be installed)
2. Multiple scripts run in parallel as separate processes
3. "Run as signed-in user" scripts run for ALL currently signed-in user accounts
4. Root privileges required for changes standard user cannot make
5. Scripts attempt to run more frequently than configured if: disk full, storage location tampered, local cache deleted, Mac restarts

**Useful Resources**
- [IntuneMacODC log collector](https://github.com/markstan/IntuneMacODC)
- [Sample shell scripts for Intune](https://github.com/microsoft/shell-intune-samples)

**Related**
- intune-onenote-297: Shell script reports Error but actually ran successfully
- intune-onenote-313: Sidecar/Agent workflow overview

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | macOS LOB app update deployed via Intune does not apply on device. Device still shows old version... | The updated .pkg and .intunemac file do not have incremented BuildNumber and ... | 1. Increment <version> parameter in pkgbuild when creating the updated component package. 2. Rebu... | 🟢 9.0 | OneNote |
| 2 | macOS LOB app (.pkg) re-packaged by third-party tool (e.g., sudre) installs successfully but Intu... | Re-packaged .pkg apps have empty install-location key in bundle info (pkgutil... | 1. Run pkgutil --pkg-info-plist <bundleID> to verify install-location is populated (should be App... | 🟢 9.0 | OneNote |
| 3 | macOS LOB 应用无法设置为 Uninstall 部署类型 | macOS LOB 应用只有在部署时设置了 'Install as Managed' = Yes 的情况下才支持 Uninstall 部署类型 | 重新部署应用时确保 'Install as Managed' 选项设置为 Yes，然后才能使用 Uninstall assignment type | 🟢 8.5 | ADO Wiki |
| 4 | macOS LOB 应用（dynamic library/ktext 类型 pkg）通过 Intune 部署后安装失败 | pkg 的 PackageInfo 文件中 install-location 不是 /Applications 或其子目录，或缺少有效的 app bund... | 1. 用 xar -x -f <pkg> -C <output> 解压 pkg；2. 检查 PackageInfo：install-location 必须是 /Applications 或子目录... | 🟢 8.5 | ADO Wiki |
| 5 | macOS 设备 Rotate Recovery Lock Password 操作不可用或密码轮换失败 | Recovery Lock 需满足前提条件：(1) macOS 11.5+ Apple Silicon；(2) 已通过 Settings Catalog ... | 1. 确认设备为 Apple Silicon 且 macOS ≥ 11.5；2. 通过 Settings Catalog 启用 EnableRecoveryLockPassword 并配置 Ro... | 🟢 8.5 | ADO Wiki |
| 6 | macOS configuration profile Prevent automatic app updates cannot be set to TRUE. Setting fails to... | Platform-side bug in Intune preventing the Prevent automatic app updates sett... | PG confirmed as platform bug and applied hotfix. If issue persists, file ICM for PG investigation. | 🟢 8.0 | OneNote |
| 7 | Error 0x87D13BA2 'One or more apps contain invalid bundleIDs' when deploying macOS LOB app, even ... | Multiple applications included in the macOS app package; not all individual a... | 1) Run 'sudo /usr/libexec/mdmclient QueryInstalledApps > InstalledApps.txt' on device. 2) Compare... | 🔵 7.5 | MS Learn |
