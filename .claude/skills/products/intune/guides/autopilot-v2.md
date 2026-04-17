# INTUNE Autopilot v2 / Device Preparation — 排查速查

**来源数**: 4 | **21V**: 部分 (10/14)
**条目数**: 14 | **最后更新**: 2026-04-17

## 快速排查路径

1. **Intune Configuration Policy not applied immediately during Autopilot v2 provisioning; filter rule (deviceTrustType eq AAD join) evaluates as Unknown for up to 48 hours after device registration.**
   → 1) Hotfix deployed 2025-10-30/31 to fix the delay; 2) Workaround before hotfix: use user-based groups with filter mode instead of device-based static groups; 3) Verify via Kusto IntuneEvent query f... `[onenote, 🟢 9.5]`

2. **Autopilot Device Preparation (AP-DP) 部署期间设备在 OOBE 进度条卡在 100% 不继续**
   → 终端用户手动重启设备即可继续完成部署。此问题为已知 Bug，Microsoft 正在修复中 `[ado-wiki, 🟢 9.0]`

3. **配置 AP-DP 设备组 Owner 时，AppID f1346770-5b25-470b-88bd-d5744ab7952c 显示为 Intune Autopilot ConfidentialClient 而非 Intune Provisioning Client**
   → 确认 Service Principal 的 AppID 为 f1346770-5b25-470b-88bd-d5744ab7952c 即可放心选择，名称显示差异不影响 AP-DP 功能 `[ado-wiki, 🟢 9.0]`

4. **AP-DP 部署后用户直接到达桌面但必需应用未安装，Provisioning 被跳过**
   → 两种 Workaround：1) 若 Entra ID Local admin 设为 Selected/None，则 AP-DP 策略的 User account type 改为 Administrator；2) 将 Entra ID Local admin 改为 All，AP-DP 策略保持 Standard user。两种方式最终用户都是 standard user `[ado-wiki, 🟢 9.0]`

5. **配置 ETG enrollment profile 时更新 Device Security Group 报错 / SG 找不到**
   → 在 Entra 中将 'Intune Provisioning Client' Service Principal 添加为该 Static Security Group 的 Owner。参考: https://learn.microsoft.com/en-us/autopilot/device-preparation/tutorial/user-driven/entra-join-devic... `[ado-wiki, 🟢 9.0]`

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Intune Configuration Policy not applied immediately during Autopilot v2 provisioning; filter rule... | Entra ID does not support Strong Consistency on national clouds (Mooncake/FairFax). After device ... | 1) Hotfix deployed 2025-10-30/31 to fix the delay; 2) Workaround before hotfix: use user-based gr... | 🟢 9.5 | onenote: Mooncake POD Support Notebook/POD/VMS... |
| 2 | Autopilot Device Preparation (AP-DP) 部署期间设备在 OOBE 进度条卡在 100% 不继续 | 已知产品缺陷，AP-DP 完成所有应用/脚本安装后未自动触发后续流程 | 终端用户手动重启设备即可继续完成部署。此问题为已知 Bug，Microsoft 正在修复中 | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FAutopilot%2FAutopilot%20v2%20Device%20Preparation%20(AP-DP)) |
| 3 | 配置 AP-DP 设备组 Owner 时，AppID f1346770-5b25-470b-88bd-d5744ab7952c 显示为 Intune Autopilot Confidential... | 部分租户中该 Service Principal 的 DisplayName 未正确更新，但 AppID 相同，功能不受影响 | 确认 Service Principal 的 AppID 为 f1346770-5b25-470b-88bd-d5744ab7952c 即可放心选择，名称显示差异不影响 AP-DP 功能 | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FAutopilot%2FAutopilot%20v2%20Device%20Preparation%20(AP-DP)) |
| 4 | AP-DP 部署后用户直接到达桌面但必需应用未安装，Provisioning 被跳过 | Windows Autopilot Device Preparation 策略的 User account type 设为 Standard user 时，与 Entra ID Local ad... | 两种 Workaround：1) 若 Entra ID Local admin 设为 Selected/None，则 AP-DP 策略的 User account type 改为 Adminis... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FAutopilot%2FAutopilot%20v2%20Device%20Preparation%20(AP-DP)) |
| 5 | 配置 ETG enrollment profile 时更新 Device Security Group 报错 / SG 找不到 | Intune Provisioning Client 未设置为该 Security Group 的 Owner，导致 SG 验证失败（返回 SG not found） | 在 Entra 中将 'Intune Provisioning Client' Service Principal 添加为该 Static Security Group 的 Owner。参考: ... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEnroll%20Device%2FEnrollment%20Time%20Grouping) |
| 6 | Autopilot V2 Enrollment Time Grouping (ETG) fails to automatically add device to security group d... | The Intune Provisioning Client service principal (AppId: f1346770-5b25-470b-88bd-d5744ab7952c) mu... | Run: Install-Module AzureAD; Connect-AzureAD -AzureEnvironmentName AzureChinaCloud; New-AzureADSe... | 🟢 8.5 | onenote: Mooncake POD Support Notebook\POD\VMS... |
| 7 | Autopilot V2 enrollment fails with error 80180014 when personal device enrollment is blocked unde... | Corporate device identifiers take time to propagate after CSV upload. If enrollment is attempted ... | Wait for corporate device identifiers to propagate after CSV upload. Verify in Intune portal: Dev... | 🔵 7.5 | onenote: Mooncake POD Support Notebook\POD\VMS... |
| 8 | Autopilot Device Preparation (AP-DP) device stuck at 100% during OOBE, deployment does not continue | Known platform issue in AP-DP initial release | End-user needs to manually restart the device for the deployment to continue. Fix is being worked... | 🔵 7.5 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=/Autopilot/Autopilot%20v2%20Device%20Preparation%20(AP-DP)) |
| 9 | AP-DP: User reaches desktop without required applications installed during Autopilot Device Prepa... | Conflict between AP-DP User account type set to Standard user and Entra ID local admin setting se... | Workaround 1: If Entra ID local admin = Selected/None, set AP-DP User account type to Administrat... | 🔵 7.5 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=/Autopilot/Autopilot%20v2%20Device%20Preparation%20(AP-DP)) |
| 10 | AP-DP: Managed installer policy causes app installs to be skipped during Autopilot Device Prepara... | Prior to 2603, managed installer policy conflicted with app installs during AP-DP | Upgrade to 2603 service release or later. Managed installer usage during AP-DP is now supported. | 🔵 7.5 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=/Autopilot/Autopilot%20v2%20Device%20Preparation%20(AP-DP)) |
| 11 | Customer is deploying the standard Security Baseline Profile to a device group targeted for Autop... | When deploying the Security Baselines to a device it impacts the registry keys and to complete th... | Created an RFC request - https://icm.ad.msft.net/imp/v3/incidents/details/135239275/homeAfter fur... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4515059) |
| 12 | To collect the hash of a computer while it remains in OOBE is necessary to meet the below require... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4541120) |
| 13 | Configured Autopilot Profile &gt; OOBE settings to register enrolling user as a standard user, bu... | By default, Microsoft Entra ID adds the user performing the Microsoft Entra join to the administr... | To overcome default entra join behavior, modify setting &quot;Registering user is added as local ... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5054654) |
| 14 | Intune Connector for Active Directory installed but not visible in Intune portal; ODJ event log s... | Proxy server blocks connector communication with Intune service; proxy not configured in ODJConne... | Add proxy config to ODJConnectorSvc.exe.config with system.net/defaultProxy element, then restart... | 🔵 6.5 | [mslearn](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/certificates/intune-connector-for-ad-not-appear) |

> 本 topic 有排查工作流 → [排查工作流](workflows/autopilot-v2.md)
> → [已知问题详情](details/autopilot-v2.md)
