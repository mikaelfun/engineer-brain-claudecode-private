# INTUNE Windows Update / Update Rings / WUFB — 排查速查

**来源数**: 4 | **21V**: 部分 (26/31)
**条目数**: 31 | **最后更新**: 2026-04-17

## 快速排查路径

1. **Windows Update Ring policy only deploys B (Patch Tuesday) releases; C and D preview releases are not distributed to managed devices**
   → This is expected behavior. Inform customer: (1) B releases (Patch Tuesday) are the primary security updates and are the only regular releases distributed by Update Ring, (2) C/D releases are previe... `[onenote, 🟢 9.5]`

2. **Quality update rollback via Intune WUfB Ring fails silently; SyncML error 0x80070490 (NotFound) for Rollback/QualityUpdate and 0x82AA0002 (AlreadyExists) for PauseQualityUpdates**
   → 1) Verify all 3 rollback prerequisites; 2) Check MDM event log for CSP errors on PauseQualityUpdates and Rollback/QualityUpdate; 3) Check registry PolicyManager for PauseQualityUpdates=1; 4) Verify... `[onenote, 🟢 9.5]`

3. **Windows Update scan fails with HTTP 407 Proxy Authentication Required when connecting to fe3cr.delivery.mp.microsoft.com**
   → Configure proxy to allow unauthenticated access to WU endpoints (*.delivery.mp.microsoft.com); or configure WinHTTP proxy for SYSTEM context `[onenote, 🟢 9.5]`

4. **Intune Update Ring shows device Failed in End User Update Status but device itself shows Up to date with no visible failed updates**
   → Kusto IntuneEvent (ComponentName==ProcessWindowsUpdateStatus) to get FailedUpdates GUID; look up in WU Catalog; check WindowsUpdate.log for service regulation; manually install blocked KB; known In... `[onenote, 🟢 9.5]`

5. **WUFB Feature Update policy deploys wrong OS version; devices get different version than specified in policy**
   → Check HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate for WSUS config; verify IsDefaultAUService via PowerShell; ensure single feature update deployment; set deferral days to avoid DSS race ... `[onenote, 🟢 9.5]`

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Windows Update Ring policy only deploys B (Patch Tuesday) releases; C and D preview releases are ... | By design, Windows Update Ring policy in Intune only receives B releases (Patch Tuesday, second T... | This is expected behavior. Inform customer: (1) B releases (Patch Tuesday) are the primary securi... | 🟢 9.5 | onenote: Mooncake POD Support Notebook/POD/VMS... |
| 2 | Quality update rollback via Intune WUfB Ring fails silently; SyncML error 0x80070490 (NotFound) f... | Rollback CSP requires 3 conditions: (1) WUfB Connected, (2) Device in Paused State, (3) Latest qu... | 1) Verify all 3 rollback prerequisites; 2) Check MDM event log for CSP errors on PauseQualityUpda... | 🟢 9.5 | onenote: MCVKB/Intune/Windows/Troubleshoot rol... |
| 3 | Windows Update scan fails with HTTP 407 Proxy Authentication Required when connecting to fe3cr.de... | Network proxy requires negotiate authentication but Windows Update service (SYSTEM context) canno... | Configure proxy to allow unauthenticated access to WU endpoints (*.delivery.mp.microsoft.com); or... | 🟢 9.5 | onenote: Mooncake POD Support Notebook/POD/VMS... |
| 4 | Intune Update Ring shows device Failed in End User Update Status but device itself shows Up to da... | Windows Update service regulation blocks download of applicable update; device Update CSP reports... | Kusto IntuneEvent (ComponentName==ProcessWindowsUpdateStatus) to get FailedUpdates GUID; look up ... | 🟢 9.5 | onenote: Mooncake POD Support Notebook/POD/VMS... |
| 5 | WUFB Feature Update policy deploys wrong OS version; devices get different version than specified... | Multiple causes: device scanning WSUS instead of Microsoft Update; device enrollment issues; mult... | Check HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate for WSUS config; verify IsDefaultAUS... | 🟢 9.5 | onenote: Mooncake POD Support Notebook/POD/VMS... |
| 6 | macOS update policy with Install Later action fails for major OS upgrades with MCMDMErrorDomain E... | Apple limitation: Install Later action is not supported for major OS updates. When a major OS upg... | 1. Do not configure Install Later when a major OS upgrade is available. 2. Use Install ASAP or sc... | 🟢 9.5 | onenote: Mooncake POD Support Notebook/POD/VMS... |
| 7 | Intune Windows AutoPatch 在 21V 不可用 | Windows AutoPatch 功能在 21V 未上线 | 不支持；改用 Windows Update Ring 策略手动管理 patch | 🟢 8.0 | 21v-gap: OneNote Export/Mooncake POD Support N... |
| 8 | Intune Windows Feature & Quality Update 策略在 21V 不可用 | 2024.6 Dev team 确认无计划支持；DCR-M365-4825 已提交 | 不支持；改用 Windows Update Ring 或 WSUS 管理 Windows 更新 | 🟢 8.0 | 21v-gap: OneNote Export/Mooncake POD Support N... |
| 9 | Intune Windows Update for Business Report 在 21V 不可用 | DCR-M365-6907 已提交，尚未支持 | 不支持；改用 WSUS 报告或自建监控查看更新合规状态；跟踪 DCR-M365-6907 | 🟢 8.0 | 21v-gap: OneNote Export/Mooncake POD Support N... |
| 10 | Windows Update for Business (WUfB) Feature Update policies and Quality Update rings configured in... | Windows Feature & Quality Update management through Intune is not available in 21v; dev team conf... | Use WSUS (Windows Server Update Services) for all Windows update management in 21v environments. ... | 🟢 8.0 | onenote: Mooncake POD Support Notebook/POD/VMS... |
| 11 | The Intune PC client shows as installing in the system tray for an extended amount of time and ne... | A cause of the reported behavior can be that the Windows machine(s) is configured to connect to a... | Avoid forcing (commonly done via a Group Policy Objects) the Windows machine(s) to use an on-prem... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4037533) |
| 12 | Title: Internal Process for Mindtree Technical Support for Consults/Escalations Purpose: The purp... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4131359) |
| 13 | Intune for Education Tenant Settings - IT dept email, privacy URL, support URL, Windows Defender ... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4041158) |
| 14 | After configuring and assigning an Update Ring policy to a group of Windows 10 Enterprise compute... | This can occur if Automatic Updates have been disabled on the client. This will typically occur i... | To verify when the Windows PC last checked for updates, go to System Settings -> Update & Securit... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4058546) |
| 15 | This articles describes tips and recommended best practices for distributing a software or update... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/2583929) |
| 16 | MDM-enrolled devices become intermittently unenrolled. Device enrolling in MDM managed by on-prem... | Bug in certain Windows RS3/RS4 updates causing unexpected MDM unenrollment | Do not update until fix issued. Self-heal within 90 minutes. Workaround: run disable script befor... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4342791) |
| 17 | On computers running Windows 10 build 1709 or later, if they are configured to receive updates fr... | This can occur if the Microsoft Account Sign In Assistant (MSA or wlidsvc) is not running. The DC... | To resolve this issue, reset the MSA service to the default StartType of Manual.In Intune we have... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4489564) |
| 18 | Intune Support Escalation Engineer&nbsp;Mingzhe Li&nbsp;published a great blog post&nbsp;where sh... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4509568) |
| 19 | When customers sign up for any subscription containing Intune EDU, 4 policies get automatically c... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4513820) |
| 20 | The Classic PC agent is also referred to as legacy pc software client, pc management, and silverl... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/2547289) |
| 21 | Sideloaded Windows 10 applications do not appear as available on ARM based Surface Pro X devices. | In this particular case the customer was missing a update and also didn't have latest version of ... | The easiest way to verify this is have customer download and attempt to install of the required u... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4538097) |
| 22 | Windows 10 Feature Updates use an AI learning algorithm that prevents the Windows Update service ... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4586234) |
| 23 | You experience one or more of the following:Windows 10 device is not able to perform any Windows ... | This can occur if a GPO or ConfigMgr configuration was previously deployed to the device to restr... | To resolve this issue, remove any GPO or ConfigMgr configuration that defers or disables updates.... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4592939) |
| 24 | Background and guidance on providing Windows Update for Business (WUfB) Support to customers |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4640607) |
| 25 | The Windows feature update device readiness report provides per-device information about compatib... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5028056) |
| 26 | The MSfB team has delayed store deprecation and posted a note about this here&nbsp;Manage private... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5028413) |
| 27 | There are no devices found when a MEM-UR report is generated. | There could be multiple reasons for this issue. Let's review them step by step below. | Make sure all prerequisites are met, and the customer is using the assigned device scope tag when... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5029038) |
| 28 | Witapp logs are helpful when troubleshooting devices that are missing from the Intune &gt; Window... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5030743) |
| 29 | This article is intended to provide guidance / how-to steps that help with the creation of a new ... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5030957) |
| 30 | Feature updates never offered on Intune-managed Windows 10 v1709+. Servicing/definition updates w... | Microsoft Account sign-in assistant (MSA/wlidsvc) service disabled via Intune device restriction.... | In Intune admin center > Device configuration > Profiles > Device restrictions > Cloud and Storag... | 🔵 7.0 | [mslearn](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/device-configuration/windows-feature-updates-never-offered) |
| 31 | Intune Support Escalation Engineer Mingzhe Li published a great blog post where she talks about h... |  |  | 🟡 3.0 | contentidea-kb |

> 本 topic 有排查工作流 → [排查工作流](workflows/windows-update.md)
> → [已知问题详情](details/windows-update.md)
