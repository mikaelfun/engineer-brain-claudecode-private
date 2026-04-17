# INTUNE Windows Update / Update Rings / WUFB — 已知问题详情

**条目数**: 31 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: Windows Update Ring policy only deploys B (Patch Tuesday) releases; C and D preview releases are not distributed to managed devices
**Solution**: This is expected behavior. Inform customer: (1) B releases (Patch Tuesday) are the primary security updates and are the only regular releases distributed by Update Ring, (2) C/D releases are preview non-security updates for testing only — they roll into the following month's B release, (3) out-of-band releases for critical security vulnerabilities are also distributed. If customer needs C/D releases, they must use other mechanisms (WSUS, manual deployment).
`[Source: onenote, Score: 9.5]`

### Step 2: Quality update rollback via Intune WUfB Ring fails silently; SyncML error 0x80070490 (NotFound) for Rollback/QualityUpdate and 0x82AA0002 (AlreadyE...
**Solution**: 1) Verify all 3 rollback prerequisites; 2) Check MDM event log for CSP errors on PauseQualityUpdates and Rollback/QualityUpdate; 3) Check registry PolicyManager for PauseQualityUpdates=1; 4) Verify Windows Update UI shows paused; 5) If AlreadyExists conflict persists, file ICM to PG
`[Source: onenote, Score: 9.5]`

### Step 3: Windows Update scan fails with HTTP 407 Proxy Authentication Required when connecting to fe3cr.delivery.mp.microsoft.com
**Solution**: Configure proxy to allow unauthenticated access to WU endpoints (*.delivery.mp.microsoft.com); or configure WinHTTP proxy for SYSTEM context
`[Source: onenote, Score: 9.5]`

### Step 4: Intune Update Ring shows device Failed in End User Update Status but device itself shows Up to date with no visible failed updates
**Solution**: Kusto IntuneEvent (ComponentName==ProcessWindowsUpdateStatus) to get FailedUpdates GUID; look up in WU Catalog; check WindowsUpdate.log for service regulation; manually install blocked KB; known Intune reporting limitation
`[Source: onenote, Score: 9.5]`

### Step 5: WUFB Feature Update policy deploys wrong OS version; devices get different version than specified in policy
**Solution**: Check HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate for WSUS config; verify IsDefaultAUService via PowerShell; ensure single feature update deployment; set deferral days to avoid DSS race condition
`[Source: onenote, Score: 9.5]`

### Step 6: macOS update policy with Install Later action fails for major OS upgrades with MCMDMErrorDomain ErrorCode 12008: Unsupported InstallAction for majo...
**Solution**: 1. Do not configure Install Later when a major OS upgrade is available. 2. Use Install ASAP or schedule maintenance window for major upgrades. 3. Doc: https://learn.microsoft.com/en-us/mem/intune/protect/software-updates-macos.
`[Source: onenote, Score: 9.5]`

### Step 7: Intune Windows AutoPatch 在 21V 不可用
**Solution**: 不支持；改用 Windows Update Ring 策略手动管理 patch
`[Source: 21v-gap, Score: 8.0]`

### Step 8: Intune Windows Feature & Quality Update 策略在 21V 不可用
**Solution**: 不支持；改用 Windows Update Ring 或 WSUS 管理 Windows 更新
`[Source: 21v-gap, Score: 8.0]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Windows Update Ring policy only deploys B (Patch Tuesday) releases; C and D p... | By design, Windows Update Ring policy in Intune only receives B releases (Pat... | This is expected behavior. Inform customer: (1) B releases (Patch Tuesday) ar... | 9.5 | onenote |
| 2 | Quality update rollback via Intune WUfB Ring fails silently; SyncML error 0x8... | Rollback CSP requires 3 conditions: (1) WUfB Connected, (2) Device in Paused ... | 1) Verify all 3 rollback prerequisites; 2) Check MDM event log for CSP errors... | 9.5 | onenote |
| 3 | Windows Update scan fails with HTTP 407 Proxy Authentication Required when co... | Network proxy requires negotiate authentication but Windows Update service (S... | Configure proxy to allow unauthenticated access to WU endpoints (*.delivery.m... | 9.5 | onenote |
| 4 | Intune Update Ring shows device Failed in End User Update Status but device i... | Windows Update service regulation blocks download of applicable update; devic... | Kusto IntuneEvent (ComponentName==ProcessWindowsUpdateStatus) to get FailedUp... | 9.5 | onenote |
| 5 | WUFB Feature Update policy deploys wrong OS version; devices get different ve... | Multiple causes: device scanning WSUS instead of Microsoft Update; device enr... | Check HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate for WSUS config;... | 9.5 | onenote |
| 6 | macOS update policy with Install Later action fails for major OS upgrades wit... | Apple limitation: Install Later action is not supported for major OS updates.... | 1. Do not configure Install Later when a major OS upgrade is available. 2. Us... | 9.5 | onenote |
| 7 | Intune Windows AutoPatch 在 21V 不可用 | Windows AutoPatch 功能在 21V 未上线 | 不支持；改用 Windows Update Ring 策略手动管理 patch | 8.0 | 21v-gap |
| 8 | Intune Windows Feature & Quality Update 策略在 21V 不可用 | 2024.6 Dev team 确认无计划支持；DCR-M365-4825 已提交 | 不支持；改用 Windows Update Ring 或 WSUS 管理 Windows 更新 | 8.0 | 21v-gap |
| 9 | Intune Windows Update for Business Report 在 21V 不可用 | DCR-M365-6907 已提交，尚未支持 | 不支持；改用 WSUS 报告或自建监控查看更新合规状态；跟踪 DCR-M365-6907 | 8.0 | 21v-gap |
| 10 | Windows Update for Business (WUfB) Feature Update policies and Quality Update... | Windows Feature & Quality Update management through Intune is not available i... | Use WSUS (Windows Server Update Services) for all Windows update management i... | 8.0 | onenote |
| 11 | The Intune PC client shows as installing in the system tray for an extended a... | A cause of the reported behavior can be that the Windows machine(s) is config... | Avoid forcing (commonly done via a Group Policy Objects) the Windows machine(... | 7.5 | contentidea-kb |
| 12 | Title: Internal Process for Mindtree Technical Support for Consults/Escalatio... |  |  | 7.5 | contentidea-kb |
| 13 | Intune for Education Tenant Settings - IT dept email, privacy URL, support UR... |  |  | 7.5 | contentidea-kb |
| 14 | After configuring and assigning an Update Ring policy to a group of Windows 1... | This can occur if Automatic Updates have been disabled on the client. This wi... | To verify when the Windows PC last checked for updates, go to System Settings... | 7.5 | contentidea-kb |
| 15 | This articles describes tips and recommended best practices for distributing ... |  |  | 7.5 | contentidea-kb |
| 16 | MDM-enrolled devices become intermittently unenrolled. Device enrolling in MD... | Bug in certain Windows RS3/RS4 updates causing unexpected MDM unenrollment | Do not update until fix issued. Self-heal within 90 minutes. Workaround: run ... | 7.5 | contentidea-kb |
| 17 | On computers running Windows 10 build 1709 or later, if they are configured t... | This can occur if the Microsoft Account Sign In Assistant (MSA or wlidsvc) is... | To resolve this issue, reset the MSA service to the default StartType of Manu... | 7.5 | contentidea-kb |
| 18 | Intune Support Escalation Engineer&nbsp;Mingzhe Li&nbsp;published a great blo... |  |  | 7.5 | contentidea-kb |
| 19 | When customers sign up for any subscription containing Intune EDU, 4 policies... |  |  | 7.5 | contentidea-kb |
| 20 | The Classic PC agent is also referred to as legacy pc software client, pc man... |  |  | 7.5 | contentidea-kb |
| 21 | Sideloaded Windows 10 applications do not appear as available on ARM based Su... | In this particular case the customer was missing a update and also didn't hav... | The easiest way to verify this is have customer download and attempt to insta... | 7.5 | contentidea-kb |
| 22 | Windows 10 Feature Updates use an AI learning algorithm that prevents the Win... |  |  | 7.5 | contentidea-kb |
| 23 | You experience one or more of the following:Windows 10 device is not able to ... | This can occur if a GPO or ConfigMgr configuration was previously deployed to... | To resolve this issue, remove any GPO or ConfigMgr configuration that defers ... | 7.5 | contentidea-kb |
| 24 | Background and guidance on providing Windows Update for Business (WUfB) Suppo... |  |  | 7.5 | contentidea-kb |
| 25 | The Windows feature update device readiness report provides per-device inform... |  |  | 7.5 | contentidea-kb |
| 26 | The MSfB team has delayed store deprecation and posted a note about this here... |  |  | 7.5 | contentidea-kb |
| 27 | There are no devices found when a MEM-UR report is generated. | There could be multiple reasons for this issue. Let's review them step by ste... | Make sure all prerequisites are met, and the customer is using the assigned d... | 7.5 | contentidea-kb |
| 28 | Witapp logs are helpful when troubleshooting devices that are missing from th... |  |  | 7.5 | contentidea-kb |
| 29 | This article is intended to provide guidance / how-to steps that help with th... |  |  | 7.5 | contentidea-kb |
| 30 | Feature updates never offered on Intune-managed Windows 10 v1709+. Servicing/... | Microsoft Account sign-in assistant (MSA/wlidsvc) service disabled via Intune... | In Intune admin center > Device configuration > Profiles > Device restriction... | 7.0 | mslearn |
| 31 | Intune Support Escalation Engineer Mingzhe Li published a great blog post whe... |  |  | 3.0 | contentidea-kb |
