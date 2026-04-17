# INTUNE Autopilot v2 / Device Preparation — 已知问题详情

**条目数**: 14 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: Intune Configuration Policy not applied immediately during Autopilot v2 provisioning; filter rule (deviceTrustType eq AAD join) evaluates as Unknow...
**Solution**: 1) Hotfix deployed 2025-10-30/31 to fix the delay; 2) Workaround before hotfix: use user-based groups with filter mode instead of device-based static groups; 3) Verify via Kusto IntuneEvent query filtering by device ID and devicetrusttype to confirm replication delay.
`[Source: onenote, Score: 9.5]`

### Step 2: Autopilot Device Preparation (AP-DP) 部署期间设备在 OOBE 进度条卡在 100% 不继续
**Solution**: 终端用户手动重启设备即可继续完成部署。此问题为已知 Bug，Microsoft 正在修复中
`[Source: ado-wiki, Score: 9.0]`

### Step 3: 配置 AP-DP 设备组 Owner 时，AppID f1346770-5b25-470b-88bd-d5744ab7952c 显示为 Intune Autopilot ConfidentialClient 而非 Intune Provisioning Client
**Solution**: 确认 Service Principal 的 AppID 为 f1346770-5b25-470b-88bd-d5744ab7952c 即可放心选择，名称显示差异不影响 AP-DP 功能
`[Source: ado-wiki, Score: 9.0]`

### Step 4: AP-DP 部署后用户直接到达桌面但必需应用未安装，Provisioning 被跳过
**Solution**: 两种 Workaround：1) 若 Entra ID Local admin 设为 Selected/None，则 AP-DP 策略的 User account type 改为 Administrator；2) 将 Entra ID Local admin 改为 All，AP-DP 策略保持 Standard user。两种方式最终用户都是 standard user
`[Source: ado-wiki, Score: 9.0]`

### Step 5: 配置 ETG enrollment profile 时更新 Device Security Group 报错 / SG 找不到
**Solution**: 在 Entra 中将 'Intune Provisioning Client' Service Principal 添加为该 Static Security Group 的 Owner。参考: https://learn.microsoft.com/en-us/autopilot/device-preparation/tutorial/user-driven/entra-join-device-group#adding-the-intune-provisioning-client-service-principal
`[Source: ado-wiki, Score: 9.0]`

### Step 6: Autopilot V2 Enrollment Time Grouping (ETG) fails to automatically add device to security group during enrollment in 21Vianet (China) environment.
**Solution**: Run: Install-Module AzureAD; Connect-AzureAD -AzureEnvironmentName AzureChinaCloud; New-AzureADServicePrincipal -AppId f1346770-5b25-470b-88bd-d5744ab7952c. Then create security group with 'Intune Provisioning Client' as owner. Use intune.microsoftonline.cn portal for 21v.
`[Source: onenote, Score: 8.5]`

### Step 7: Autopilot V2 enrollment fails with error 80180014 when personal device enrollment is blocked under enrollment restrictions. Corporate device identi...
**Solution**: Wait for corporate device identifiers to propagate after CSV upload. Verify in Intune portal: Devices > Enrollment > Corporate device identifiers. To create CSV: Get-WmiObject Win32_ComputerSystem | FL Manufacturer, Model; Get-WmiObject Win32_BIOS | FL SerialNumber. Format: Manufacturer,Model,SerialNumber.
`[Source: onenote, Score: 7.5]`

### Step 8: Autopilot Device Preparation (AP-DP) device stuck at 100% during OOBE, deployment does not continue
**Solution**: End-user needs to manually restart the device for the deployment to continue. Fix is being worked on by PG.
`[Source: ado-wiki, Score: 7.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Intune Configuration Policy not applied immediately during Autopilot v2 provi... | Entra ID does not support Strong Consistency on national clouds (Mooncake/Fai... | 1) Hotfix deployed 2025-10-30/31 to fix the delay; 2) Workaround before hotfi... | 9.5 | onenote |
| 2 | Autopilot Device Preparation (AP-DP) 部署期间设备在 OOBE 进度条卡在 100% 不继续 | 已知产品缺陷，AP-DP 完成所有应用/脚本安装后未自动触发后续流程 | 终端用户手动重启设备即可继续完成部署。此问题为已知 Bug，Microsoft 正在修复中 | 9.0 | ado-wiki |
| 3 | 配置 AP-DP 设备组 Owner 时，AppID f1346770-5b25-470b-88bd-d5744ab7952c 显示为 Intune Au... | 部分租户中该 Service Principal 的 DisplayName 未正确更新，但 AppID 相同，功能不受影响 | 确认 Service Principal 的 AppID 为 f1346770-5b25-470b-88bd-d5744ab7952c 即可放心选择，名称... | 9.0 | ado-wiki |
| 4 | AP-DP 部署后用户直接到达桌面但必需应用未安装，Provisioning 被跳过 | Windows Autopilot Device Preparation 策略的 User account type 设为 Standard user 时... | 两种 Workaround：1) 若 Entra ID Local admin 设为 Selected/None，则 AP-DP 策略的 User acc... | 9.0 | ado-wiki |
| 5 | 配置 ETG enrollment profile 时更新 Device Security Group 报错 / SG 找不到 | Intune Provisioning Client 未设置为该 Security Group 的 Owner，导致 SG 验证失败（返回 SG not ... | 在 Entra 中将 'Intune Provisioning Client' Service Principal 添加为该 Static Securit... | 9.0 | ado-wiki |
| 6 | Autopilot V2 Enrollment Time Grouping (ETG) fails to automatically add device... | The Intune Provisioning Client service principal (AppId: f1346770-5b25-470b-8... | Run: Install-Module AzureAD; Connect-AzureAD -AzureEnvironmentName AzureChina... | 8.5 | onenote |
| 7 | Autopilot V2 enrollment fails with error 80180014 when personal device enroll... | Corporate device identifiers take time to propagate after CSV upload. If enro... | Wait for corporate device identifiers to propagate after CSV upload. Verify i... | 7.5 | onenote |
| 8 | Autopilot Device Preparation (AP-DP) device stuck at 100% during OOBE, deploy... | Known platform issue in AP-DP initial release | End-user needs to manually restart the device for the deployment to continue.... | 7.5 | ado-wiki |
| 9 | AP-DP: User reaches desktop without required applications installed during Au... | Conflict between AP-DP User account type set to Standard user and Entra ID lo... | Workaround 1: If Entra ID local admin = Selected/None, set AP-DP User account... | 7.5 | ado-wiki |
| 10 | AP-DP: Managed installer policy causes app installs to be skipped during Auto... | Prior to 2603, managed installer policy conflicted with app installs during A... | Upgrade to 2603 service release or later. Managed installer usage during AP-D... | 7.5 | ado-wiki |
| 11 | Customer is deploying the standard Security Baseline Profile to a device grou... | When deploying the Security Baselines to a device it impacts the registry key... | Created an RFC request - https://icm.ad.msft.net/imp/v3/incidents/details/135... | 7.5 | contentidea-kb |
| 12 | To collect the hash of a computer while it remains in OOBE is necessary to me... |  |  | 7.5 | contentidea-kb |
| 13 | Configured Autopilot Profile &gt; OOBE settings to register enrolling user as... | By default, Microsoft Entra ID adds the user performing the Microsoft Entra j... | To overcome default entra join behavior, modify setting &quot;Registering use... | 7.5 | contentidea-kb |
| 14 | Intune Connector for Active Directory installed but not visible in Intune por... | Proxy server blocks connector communication with Intune service; proxy not co... | Add proxy config to ODJConnectorSvc.exe.config with system.net/defaultProxy e... | 6.5 | mslearn |
