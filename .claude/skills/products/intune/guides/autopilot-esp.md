# INTUNE Autopilot ESP 与预配置 — 排查速查

**来源数**: 3 | **21V**: 部分 (24/25)
**条目数**: 25 | **最后更新**: 2026-04-17

## 快速排查路径

1. **After user-driven Autopilot, device reports 'not compliant' for BitLocker in Intune compliance; affects conditional access**
   → Three options: (1) Use White-glove/pre-provisioning with BitLocker policy assigned to device group; (2) Use 'encryption of data storage on device' compliance setting instead of DHA-based BitLocker ... `[onenote, 🟢 9.5]`

2. **Autopilot Self-Deploying 或 Pre-Provisioning 部署中 TPM attestation 失败，报错 Bad Request No valid TPM EK/Platform certificate provided in the TPM identity request message**
   → 1. 运行 certreq -enrollaik -config "" 验证 TPM 是否受影响；2. 若命令失败则确认为 NTZ 芯片问题；3. 客户需联系 NTZ 厂商处理芯片问题；4. 此问题非 Microsoft 可修复，不支持 AP Pre-Provisioning `[ado-wiki, 🟢 9.0]`

3. **Pre-Provisioning Autopilot 设备在 UDiag 中显示 AAD Join 后紧接 Device UNJOIN，DSREGCMD /status 显示 AzureAdJoined=NO 和 AzurePRT=NO**
   → 这是 Pre-Provisioning 的预期行为，不需要排查 Entra join 问题。如果 Account Setup 阶段出错（如 app error 导致 ESP timeout），设备可能停留在 unjoin 状态。对于 Hybrid Join 场景，如果 policy delta sync 未在到达桌面前完成，可能出现 AzurePRT=No 和 'device id coul... `[ado-wiki, 🟢 9.0]`

4. **Autopilot Pre-Provisioning device shows AzureAdJoined=No and AzurePRT=No in dsregcmd /status after white glove; UDiag shows AAD Join followed by Device UNJOIN**
   → This is expected behavior for Pre-Provisioning. Do not troubleshoot Entra join issues for pre-prov devices before AccountSetup completes. For hybrid joins, ensure policy delta sync completes before... `[ado-wiki, 🟢 9.0]`

5. **Autopilot v1 apps do not install or timeout; LOB (MSI) apps mixed with Win32 apps in ESP-blocking apps list**
   → Do not mix LOB (MSI) and Win32 apps in Autopilot v1. Convert LOB apps to Win32 format, or use APv2 (Autopilot Device Preparation) which supports both types. `[ado-wiki, 🟢 9.0]`

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | After user-driven Autopilot, device reports 'not compliant' for BitLocker in Intune compliance; a... | In user-driven Autopilot, BitLocker encryption occurs during or after ESP. DHA boot data collecte... | Three options: (1) Use White-glove/pre-provisioning with BitLocker policy assigned to device grou... | 🟢 9.5 | onenote: Mooncake POD Support Notebook/POD/VMS... |
| 2 | Autopilot Self-Deploying 或 Pre-Provisioning 部署中 TPM attestation 失败，报错 Bad Request No valid TPM EK... | 设备使用 NTZ 厂商在 2022 年 8 月之前生产的 TPM 芯片，该批次芯片存在制造缺陷导致 attestation 失败 | 1. 运行 certreq -enrollaik -config "" 验证 TPM 是否受影响；2. 若命令失败则确认为 NTZ 芯片问题；3. 客户需联系 NTZ 厂商处理芯片问题；4. 此... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FAutopilot) |
| 3 | Pre-Provisioning Autopilot 设备在 UDiag 中显示 AAD Join 后紧接 Device UNJOIN，DSREGCMD /status 显示 AzureAdJo... | Pre-Provisioning 模式下，设备在 enrollment 后会 by design 从 Entra unjoin，直到 AccountSetup 阶段用户认证时才重新 join 以... | 这是 Pre-Provisioning 的预期行为，不需要排查 Entra join 问题。如果 Account Setup 阶段出错（如 app error 导致 ESP timeout），设... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FAutopilot%2FCSS%20Autopilot%20Case%20Wins) |
| 4 | Autopilot Pre-Provisioning device shows AzureAdJoined=No and AzurePRT=No in dsregcmd /status afte... | By design: pre-provisioned devices are unjoined from Entra after enrollment. Device stays unjoine... | This is expected behavior for Pre-Provisioning. Do not troubleshoot Entra join issues for pre-pro... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FAutopilot%2FCSS%20Autopilot%20Case%20Wins) |
| 5 | Autopilot v1 apps do not install or timeout; LOB (MSI) apps mixed with Win32 apps in ESP-blocking... | APv1 does not support mixing LOB (MSI) and Win32 app types. When both are assigned, app installat... | Do not mix LOB (MSI) and Win32 apps in Autopilot v1. Convert LOB apps to Win32 format, or use APv... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FAutopilot%2FCSS%20Autopilot%20Case%20Wins) |
| 6 | Autopilot fails when LOB (MSI) and Win32 apps are mixed during ESP | Mixing LOB (MSI) and Win32 app types causes installation conflicts during ESP | Convert all apps to Win32 format (.intunewin). Never mix LOB and Win32 during Autopilot. | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FAutopilot%2FUser-Driven%20Hybrid%20Join) |
| 7 | New Microsoft Teams app fails to install during Windows Autopilot ESP (Enrollment Status Page) wh... | New Microsoft Teams uses MSI-based installation which conflicts with Win32 app installation durin... | Deploy new Teams separately as a Win32 app instead of bundling with M365 Apps: (1) Download teams... | 🟢 8.0 | onenote: Mooncake POD Support Notebook/POD/VMS... |
| 8 | App failure during the Enrolment Status Page for any Autopilot deployment.&nbsp; | For a successful Autopilot deployment we should not mix LOB and Win32 apps, otherwise, the App in... | Not mixing LOB and Win32 apps during the Autopilot development.&nbsp;If applicable, I would recom... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4550699) |
| 9 | Public Documentation: ======================= https://docs.microsoft.com/en-us/mem/autopilot/wind... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4579910) |
| 10 | Autopilot process fails during initial authentication. User enters credentials in the device duri... | This error is caused by network connectivity issues. During this process, ESP is&nbsp;attempting ... | In the page where we receive the error message, perform the following steps to validate which is ... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4599937) |
| 11 | This article lists the subtasks for&nbsp;Understanding and troubleshooting Autopilot for pre-prov... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4604758) |
| 12 | During an Autopilot Pre-Provisioning (White Glove) deployment, you receive a red screen that disp... | This can occur if the user has clicked on &quot;Change account&quot; in the bottom-left corner of... | If your Autopilot.cab (MdmDiagnosticsTool.exe -area Autopilot;TPM;DeviceProvisioning -cab C:\temp... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4610717) |
| 13 | Autopilot pre-provisioning fails with error&nbsp;0x81039001: | In this case it was caused probably a corrupt OS install after failed hard drive was replaced. | Reinstalled OS from USB.&nbsp; | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5007640) |
| 14 | Some devices may fail TPM attestation on Windows 11 during the Windows Autopilot pre-provisioning... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5009701) |
| 15 | DISCLAIMER:&nbsp;All data and screenshot below are sample from an Internal Demo Tenant; no custom... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5021980) |
| 16 | User-Driven Autopilot fails with error: 8018000a &quot;This device is already enrolled&quot;  The... | A profile to disable AutoAdminLogon was assigned to the device group, this profile works just fin... | This behavior is by design and there is a reference already documented:&nbsp;https://learn.micros... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5022161) |
| 17 | This article details the Pre-Provisioning Autopilot workflow for firmware-based TPM Attestation a... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5024217) |
| 18 | This article describes how to examine the ETL files from the MDMdiag cab file with Insight Tool a... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5028058) |
| 19 | User ESP appears to do nothing for 30 minutes or more but then gets completed after reboot. | Intune Device Check-In (DCI) is throttling clients by Intune DeviceId in the enrollment certifica... | Intune will continue to throttle if too many attempts are made but rebooting the device or forcin... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5030321) |
| 20 | The customer is provisioning Autopilot self-deploying devices, and they are timing out during ESP... | The Intune management extension agent experienced crashes, and upon investigation by the service ... | The timeout issue was resolved by excluding MDMWinsOverGP policy policies from Autopilot. | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5033538) |
| 21 | Hybrid Azure AD join pre-provisioning fails with the following error:  Something happened, and we... | Enrollment Status Page (ESP) assigned to user group.&nbsp; | Assign Enrollment Status Page (ESP) should be assigned to device group for pre-provisioning. | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5033662) |
| 22 | Autopilot provisioning fails in Device preparation stage at step 4 &quot;Preparing your device fo... | This can happen if both device setup and account setup phase of ESP is skipped.&nbsp; | Enable at least device setup phase of ESP.&nbsp; | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5039502) |
| 23 | During Autopilot pre-provisioning, Win32 app installation fails but the ESP show green screen in ... | it's the result of a setting&nbsp;AllowNonBlockingAppInstallation&nbsp;that appears to be hidden ... | In order to see the setting you need to use Graph Explorer with required permissions granted.  ht... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5042164) |
| 24 | Company Portal UWP app with install behavior: System is failing in Autopilot - ESP - Device setup... | WU service is disabled. | Please enable the WU service.  I've done a repro with WU service stopped and it failed, and I've ... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5042163) |
| 25 | The purpose of this KB is to demonstrate the Bitlocker policy behaviour when its targeted to a De... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5061834) |

> 本 topic 有排查工作流 → [排查工作流](workflows/autopilot-esp.md)
> → [已知问题详情](details/autopilot-esp.md)
