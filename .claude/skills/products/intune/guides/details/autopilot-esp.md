# INTUNE Autopilot ESP 与预配置 — 已知问题详情

**条目数**: 25 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: After user-driven Autopilot, device reports 'not compliant' for BitLocker in Intune compliance; affects conditional access
**Solution**: Three options: (1) Use White-glove/pre-provisioning with BitLocker policy assigned to device group; (2) Use 'encryption of data storage on device' compliance setting instead of DHA-based BitLocker check; (3) Add mandatory reboot after Autopilot completes
`[Source: onenote, Score: 9.5]`

### Step 2: Autopilot Self-Deploying 或 Pre-Provisioning 部署中 TPM attestation 失败，报错 Bad Request No valid TPM EK/Platform certificate provided in the TPM identity...
**Solution**: 1. 运行 certreq -enrollaik -config "" 验证 TPM 是否受影响；2. 若命令失败则确认为 NTZ 芯片问题；3. 客户需联系 NTZ 厂商处理芯片问题；4. 此问题非 Microsoft 可修复，不支持 AP Pre-Provisioning
`[Source: ado-wiki, Score: 9.0]`

### Step 3: Pre-Provisioning Autopilot 设备在 UDiag 中显示 AAD Join 后紧接 Device UNJOIN，DSREGCMD /status 显示 AzureAdJoined=NO 和 AzurePRT=NO
**Solution**: 这是 Pre-Provisioning 的预期行为，不需要排查 Entra join 问题。如果 Account Setup 阶段出错（如 app error 导致 ESP timeout），设备可能停留在 unjoin 状态。对于 Hybrid Join 场景，如果 policy delta sync 未在到达桌面前完成，可能出现 AzurePRT=No 和 'device id could not be found' 错误
`[Source: ado-wiki, Score: 9.0]`

### Step 4: Autopilot Pre-Provisioning device shows AzureAdJoined=No and AzurePRT=No in dsregcmd /status after white glove; UDiag shows AAD Join followed by De...
**Solution**: This is expected behavior for Pre-Provisioning. Do not troubleshoot Entra join issues for pre-prov devices before AccountSetup completes. For hybrid joins, ensure policy delta sync completes before reaching Windows Desktop Logon to avoid AzurePRT=No errors.
`[Source: ado-wiki, Score: 9.0]`

### Step 5: Autopilot v1 apps do not install or timeout; LOB (MSI) apps mixed with Win32 apps in ESP-blocking apps list
**Solution**: Do not mix LOB (MSI) and Win32 apps in Autopilot v1. Convert LOB apps to Win32 format, or use APv2 (Autopilot Device Preparation) which supports both types.
`[Source: ado-wiki, Score: 9.0]`

### Step 6: Autopilot fails when LOB (MSI) and Win32 apps are mixed during ESP
**Solution**: Convert all apps to Win32 format (.intunewin). Never mix LOB and Win32 during Autopilot.
`[Source: ado-wiki, Score: 9.0]`

### Step 7: New Microsoft Teams app fails to install during Windows Autopilot ESP (Enrollment Status Page) when M365 Apps are assigned to the Autopilot device ...
**Solution**: Deploy new Teams separately as a Win32 app instead of bundling with M365 Apps: (1) Download teamsbootstrapper.exe from https://go.microsoft.com/fwlink/?linkid=2243204; (2) Download MSIX package (x64: https://go.microsoft.com/fwlink/?linkid=2196106); (3) Create install.ps1 script that copies MSIX to C:\windows	emp and runs teamsbootstrapper.exe -p -o; (4) Wrap as .intunewin; (5) Install command: powershell.exe -executionpolicy bypass -file .\install.ps1; Uninstall: teamsbootstrapper.exe -x; Detec
`[Source: onenote, Score: 8.0]`

### Step 8: App failure during the Enrolment Status Page for any Autopilot deployment.&nbsp;
**Solution**: Not mixing LOB and Win32 apps during the Autopilot development.&nbsp;If applicable, I would recommend converting LOB to Win32 and not vice-versa as you will lose the Win32 Intune capabilities.&nbsp;
`[Source: contentidea-kb, Score: 7.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | After user-driven Autopilot, device reports 'not compliant' for BitLocker in ... | In user-driven Autopilot, BitLocker encryption occurs during or after ESP. DH... | Three options: (1) Use White-glove/pre-provisioning with BitLocker policy ass... | 9.5 | onenote |
| 2 | Autopilot Self-Deploying 或 Pre-Provisioning 部署中 TPM attestation 失败，报错 Bad Req... | 设备使用 NTZ 厂商在 2022 年 8 月之前生产的 TPM 芯片，该批次芯片存在制造缺陷导致 attestation 失败 | 1. 运行 certreq -enrollaik -config "" 验证 TPM 是否受影响；2. 若命令失败则确认为 NTZ 芯片问题；3. 客户需... | 9.0 | ado-wiki |
| 3 | Pre-Provisioning Autopilot 设备在 UDiag 中显示 AAD Join 后紧接 Device UNJOIN，DSREGCMD ... | Pre-Provisioning 模式下，设备在 enrollment 后会 by design 从 Entra unjoin，直到 AccountSet... | 这是 Pre-Provisioning 的预期行为，不需要排查 Entra join 问题。如果 Account Setup 阶段出错（如 app err... | 9.0 | ado-wiki |
| 4 | Autopilot Pre-Provisioning device shows AzureAdJoined=No and AzurePRT=No in d... | By design: pre-provisioned devices are unjoined from Entra after enrollment. ... | This is expected behavior for Pre-Provisioning. Do not troubleshoot Entra joi... | 9.0 | ado-wiki |
| 5 | Autopilot v1 apps do not install or timeout; LOB (MSI) apps mixed with Win32 ... | APv1 does not support mixing LOB (MSI) and Win32 app types. When both are ass... | Do not mix LOB (MSI) and Win32 apps in Autopilot v1. Convert LOB apps to Win3... | 9.0 | ado-wiki |
| 6 | Autopilot fails when LOB (MSI) and Win32 apps are mixed during ESP | Mixing LOB (MSI) and Win32 app types causes installation conflicts during ESP | Convert all apps to Win32 format (.intunewin). Never mix LOB and Win32 during... | 9.0 | ado-wiki |
| 7 | New Microsoft Teams app fails to install during Windows Autopilot ESP (Enroll... | New Microsoft Teams uses MSI-based installation which conflicts with Win32 ap... | Deploy new Teams separately as a Win32 app instead of bundling with M365 Apps... | 8.0 | onenote |
| 8 | App failure during the Enrolment Status Page for any Autopilot deployment.&nbsp; | For a successful Autopilot deployment we should not mix LOB and Win32 apps, o... | Not mixing LOB and Win32 apps during the Autopilot development.&nbsp;If appli... | 7.5 | contentidea-kb |
| 9 | Public Documentation: ======================= https://docs.microsoft.com/en-u... |  |  | 7.5 | contentidea-kb |
| 10 | Autopilot process fails during initial authentication. User enters credential... | This error is caused by network connectivity issues. During this process, ESP... | In the page where we receive the error message, perform the following steps t... | 7.5 | contentidea-kb |
| 11 | This article lists the subtasks for&nbsp;Understanding and troubleshooting Au... |  |  | 7.5 | contentidea-kb |
| 12 | During an Autopilot Pre-Provisioning (White Glove) deployment, you receive a ... | This can occur if the user has clicked on &quot;Change account&quot; in the b... | If your Autopilot.cab (MdmDiagnosticsTool.exe -area Autopilot;TPM;DeviceProvi... | 7.5 | contentidea-kb |
| 13 | Autopilot pre-provisioning fails with error&nbsp;0x81039001: | In this case it was caused probably a corrupt OS install after failed hard dr... | Reinstalled OS from USB.&nbsp; | 7.5 | contentidea-kb |
| 14 | Some devices may fail TPM attestation on Windows 11 during the Windows Autopi... |  |  | 7.5 | contentidea-kb |
| 15 | DISCLAIMER:&nbsp;All data and screenshot below are sample from an Internal De... |  |  | 7.5 | contentidea-kb |
| 16 | User-Driven Autopilot fails with error: 8018000a &quot;This device is already... | A profile to disable AutoAdminLogon was assigned to the device group, this pr... | This behavior is by design and there is a reference already documented:&nbsp;... | 7.5 | contentidea-kb |
| 17 | This article details the Pre-Provisioning Autopilot workflow for firmware-bas... |  |  | 7.5 | contentidea-kb |
| 18 | This article describes how to examine the ETL files from the MDMdiag cab file... |  |  | 7.5 | contentidea-kb |
| 19 | User ESP appears to do nothing for 30 minutes or more but then gets completed... | Intune Device Check-In (DCI) is throttling clients by Intune DeviceId in the ... | Intune will continue to throttle if too many attempts are made but rebooting ... | 7.5 | contentidea-kb |
| 20 | The customer is provisioning Autopilot self-deploying devices, and they are t... | The Intune management extension agent experienced crashes, and upon investiga... | The timeout issue was resolved by excluding MDMWinsOverGP policy policies fro... | 7.5 | contentidea-kb |
| 21 | Hybrid Azure AD join pre-provisioning fails with the following error:  Someth... | Enrollment Status Page (ESP) assigned to user group.&nbsp; | Assign Enrollment Status Page (ESP) should be assigned to device group for pr... | 7.5 | contentidea-kb |
| 22 | Autopilot provisioning fails in Device preparation stage at step 4 &quot;Prep... | This can happen if both device setup and account setup phase of ESP is skippe... | Enable at least device setup phase of ESP.&nbsp; | 7.5 | contentidea-kb |
| 23 | During Autopilot pre-provisioning, Win32 app installation fails but the ESP s... | it's the result of a setting&nbsp;AllowNonBlockingAppInstallation&nbsp;that a... | In order to see the setting you need to use Graph Explorer with required perm... | 7.5 | contentidea-kb |
| 24 | Company Portal UWP app with install behavior: System is failing in Autopilot ... | WU service is disabled. | Please enable the WU service.  I've done a repro with WU service stopped and ... | 7.5 | contentidea-kb |
| 25 | The purpose of this KB is to demonstrate the Bitlocker policy behaviour when ... |  |  | 7.5 | contentidea-kb |
