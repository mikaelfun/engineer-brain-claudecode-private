# Intune Windows Update / Update Rings / WUFB — 综合排查指南

**条目数**: 11 | **草稿融合数**: 4 | **Kusto 查询融合**: 0
**来源草稿**: mslearn-troubleshoot-update-rings.md, onenote-kusto-feature-update-policy.md, onenote-windows-update-ring-logs.md, onenote-wufb-log-collection.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Troubleshoot Update Rings
> 来源: MS Learn — [mslearn-troubleshoot-update-rings.md](../drafts/mslearn-troubleshoot-update-rings.md)

**Troubleshoot Windows Update Rings in Intune**
**Overview**
**Prerequisites**
- Windows 10 v1607+ or Windows 11
- Editions: Pro, Enterprise, Team (Surface Hub), Holographic for Business (subset), LTSC (subset)

**Troubleshooting Decision Tree**

**1. Check Intune Admin Center**
- Navigate: Devices > Windows > Update rings for Windows 10 and later
- Select the policy → View report → check per-device status
- Two entries per device is normal (user context + system context)
- Kiosk/Autologon devices: only system account entry

**2. Verify Settings on Device**
- Settings > Accounts > Access work or school → check managed policies
- Settings > Windows Updates > Advanced options > Configured update policies
- Verify policy type = "Mobile Device Management" (not "Group Policy")

**3. Check for MDM vs GPO Conflicts**
- Run `gpresult /r` to see active group policies
- GPO from SCCM shows as "Local Group Policy" source
- MDM + GPO conflict → updates won't apply or apply incorrectly
- `ControlPolicyConflict` CSP can help resolve some conflicts (but NOT for Update Policy CSP)

**4. Verify Registry Keys**
- Intune writes to: `HKLM\SOFTWARE\Microsoft\PolicyManager\current\device\Update`
- Windows Update keys: `HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU`
- Check if `UpdateServiceUrl` points to WSUS vs WU
- If WSUS, verify `DisableDualScan` is set to `0`

**5. MDM Diagnostics Report**
- Settings > Accounts > Access work or school > Export
- If Update ring policy appears in report → policy deployed successfully

**6. Event Viewer Logs**
- Intune events: Applications and Services logs > Microsoft > Windows > DeviceManagement-Enterprise-Diagnostics-Provider > Admin
... (详见原始草稿)

### Phase 2: Kusto Feature Update Policy
> 来源: OneNote — [onenote-kusto-feature-update-policy.md](../drafts/onenote-kusto-feature-update-policy.md)

**Kusto Query for Feature Update Policy Analysis**
**Feature Update Policy Targeting Analysis**
```kql
```
**Useful Aggregations**
**Count devices by current build:**
```kql
```
**Check specific version adoption:**
```kql
```
**Key Tables**
- `FeatureUpdatePolicy_Snapshot` - Policy definitions
- `FeatureUpdatePolicyEffectiveGroupTargeting_Snapshot` - Targeting assignments
- `EffectiveGroupMembershipUserService_Snapshot` / `EffectiveGroupMembershipDeviceService_Snapshot` - Group membership
- `UserServiceUDA_Snapshot` - User-device affinity
- `Device_Snapshot` - Device info with OS version

### Phase 3: Windows Update Ring Logs
> 来源: OneNote — [onenote-windows-update-ring-logs.md](../drafts/onenote-windows-update-ring-logs.md)

**Windows Update Ring Log Collection Guide**
**Registry Keys to Export (.REG)**
- `HKLM\Software\Policies\Microsoft\Windows\WindowsUpdate`
- `HKLM\Software\Microsoft\WindowsUpdate\UpdatePolicy\Settings`
- `HKLM\Software\Microsoft\WindowsUpdate\UpdatePolicy\PolicyState` — how update ring is configured
- `HKLM\Software\Microsoft\PolicyManager\default\Update`
- `HKLM\System\CurrentControlSet\Control\EAS\Policies`

**Event Logs to Export**
- Applications and Services Logs > Microsoft > Windows > DeviceManagement-Enterprise-Diagnostics-Provider > **Admin** log
- Applications and Services Logs > Microsoft > Windows > DeviceManagement-Enterprise-Diagnostics-Provider > **Debug** log

**MDM Logs**
- Settings > Account > Access work or school > Export your management log files

**Scheduled Tasks**
```cmd

**Run as Admin**
```

**Windows Logs**
- CBS logs from `C:\Windows\Logs\CBS`

**Windows Update Log**
```powershell

**Output: WindowsUpdate.log on Desktop**
```

**Setupreport Tool**
1. Download Setupreport.cmd.txt, rename to Setupreport.cmd
2. Double-click to run (10-20 min)
3. Results saved to `C:\setup_report_<computername>`
4. Zip and upload; manually remove folder after

**Known Facts**
- Update Ring policy only distributes **B releases** (Patch Tuesday, 2nd Tuesday)
- **C releases** (3rd week) and **D releases** (4th week) are preview/non-security; NOT distributed by Update Ring
- Out-of-band releases for critical vulnerabilities ARE distributed
- See intune-onenote-129 for details

### Phase 4: Wufb Log Collection
> 来源: OneNote — [onenote-wufb-log-collection.md](../drafts/onenote-wufb-log-collection.md)

**WUFB / Windows Update Ring - Log Collection Guide**
**Registry Keys (Export as .REG files)**
- `HKLM\Software\Policies\Microsoft\Windows\WindowsUpdate`
- `HKLM\Software\Microsoft\WindowsUpdate\UpdatePolicy\Settings`
- `HKLM\Software\Microsoft\WindowsUpdate\UpdatePolicy\PolicyState` (Update ring config)
- `HKLM\Software\Microsoft\PolicyManager\default\Update`
- `HKLM\System\CurrentControlSet\Control\EAS\Policies`

**Event Logs**
- Applications and Services Logs > Microsoft > Windows > DeviceManagement-Enterprise-Diagnostics-Provider > Admin
- Applications and Services Logs > Microsoft > Windows > DeviceManagement-Enterprise-Diagnostics-Provider > Debug

**MDM Logs**
1. Open Settings > Account > Access work or school
2. Click "Export your management log files"
3. Logs at: `C:\Users\Public\Documents\MDMDiagnostics\MDMDiagReport.html`

**Scheduled Tasks**
```cmd
```

**Windows Update Log**
```powershell
```

**CBS Logs**
- Location: `C:\Windows\Logs\CBS\CBS.log`

**Advanced Diagnostic Script (WUFB scan/feature update)**
1. Download collect_windowsupdate_log.cmd from ADO repo
2. Run as admin: `collect_windowsupdate_log.cmd /start`
3. Stop WU service, delete `C:\Windows\SoftwareDistribution`
4. Start WU service, click "Check for updates", reproduce issue
5. Run: `collect_windowsupdate_log.cmd /stop`

**Key files in wutraces:**
- `windowsupdate.etl` - WU client ETL logs
- `Netmon.etl` - network trace
- `MoUsoCoreWorker.*.etl` - USO client logs
- `Appcompat.reg` - appraiser registry
... (详见原始草稿)

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Windows Update Ring policy only deploys B (Patch Tuesday) releases; C and D preview releases are ... | By design, Windows Update Ring policy in Intune only receives B releases (Pat... | This is expected behavior. Inform customer: (1) B releases (Patch Tuesday) are the primary securi... | 🟢 9.0 | OneNote |
| 2 | Quality update rollback via Intune WUfB Ring fails silently; SyncML error 0x80070490 (NotFound) f... | Rollback CSP requires 3 conditions: (1) WUfB Connected, (2) Device in Paused ... | 1) Verify all 3 rollback prerequisites; 2) Check MDM event log for CSP errors on PauseQualityUpda... | 🟢 9.0 | OneNote |
| 3 | Windows Update scan fails with HTTP 407 Proxy Authentication Required when connecting to fe3cr.de... | Network proxy requires negotiate authentication but Windows Update service (S... | Configure proxy to allow unauthenticated access to WU endpoints (*.delivery.mp.microsoft.com); or... | 🟢 9.0 | OneNote |
| 4 | Intune Update Ring shows device Failed in End User Update Status but device itself shows Up to da... | Windows Update service regulation blocks download of applicable update; devic... | Kusto IntuneEvent (ComponentName==ProcessWindowsUpdateStatus) to get FailedUpdates GUID; look up ... | 🟢 9.0 | OneNote |
| 5 | WUFB Feature Update policy deploys wrong OS version; devices get different version than specified... | Multiple causes: device scanning WSUS instead of Microsoft Update; device enr... | Check HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate for WSUS config; verify IsDefaultAUS... | 🟢 9.0 | OneNote |
| 6 | Windows Update Ring configured with Feature update delay of 365 days, expected client to receive ... | The 'Enable Windows 11 latest' toggle was enabled in the update ring, causing... | 1) Disable 'Enable Windows 11 latest' toggle in the update ring; 2) Verify all WU registry keys (... | 🟢 8.0 | OneNote |
| 7 | Intune Windows Feature & Quality Update 策略在 21V 不可用 | 2024.6 Dev team 确认无计划支持；DCR-M365-4825 已提交 | 不支持；改用 Windows Update Ring 或 WSUS 管理 Windows 更新 | 🔵 7.0 | 21V Gap |
| 8 | After configuring and assigning an Update Ring policy to a group of Windows 10 Enterprise compute... | This can occur if Automatic Updates have been disabled on the client. This wi... | To verify when the Windows PC last checked for updates, go to System Settings -> Update & Securit... | 🔵 7.0 | ContentIdea KB |
| 9 |  | **Collecting log filesRequesting the customer to send the Windows Update log ... | Delete | 🔵 7.0 | ContentIdea KB |
| 10 | On computers running Windows 10 build 1709 or later, if they are configured to receive updates fr... | This can occur if the Microsoft Account Sign In Assistant (MSA or wlidsvc) is... | To resolve this issue, reset the MSA service to the default StartType of Manual.In Intune we have... | 🔵 7.0 | ContentIdea KB |
| 11 | Windows Update for Business (WUfB) Feature Update policies and Quality Update rings configured in... | Windows Feature & Quality Update management through Intune is not available i... | Use WSUS (Windows Server Update Services) for all Windows update management in 21v environments. ... | 🔵 7.0 | OneNote |
