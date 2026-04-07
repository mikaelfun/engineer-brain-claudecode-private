# Intune Autopilot v2 / Device Preparation — 排查速查

**来源数**: 2 | **21V**: 部分适用
**条目数**: 11 | **最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Intune Configuration Policy not applied immediately during Autopilot v2 provisioning; filter rule... | Entra ID does not support Strong Consistency on national clouds (Mooncake/Fai... | 1) Hotfix deployed 2025-10-30/31 to fix the delay; 2) Workaround before hotfix: use user-based gr... | 🟢 9.0 | OneNote |
| 2 | Autopilot Device Preparation (AP-DP) 部署期间设备在 OOBE 进度条卡在 100% 不继续 | 已知产品缺陷，AP-DP 完成所有应用/脚本安装后未自动触发后续流程 | 终端用户手动重启设备即可继续完成部署。此问题为已知 Bug，Microsoft 正在修复中 | 🟢 8.5 | ADO Wiki |
| 3 | 配置 AP-DP 设备组 Owner 时，AppID f1346770-5b25-470b-88bd-d5744ab7952c 显示为 Intune Autopilot Confidential... | 部分租户中该 Service Principal 的 DisplayName 未正确更新，但 AppID 相同，功能不受影响 | 确认 Service Principal 的 AppID 为 f1346770-5b25-470b-88bd-d5744ab7952c 即可放心选择，名称显示差异不影响 AP-DP 功能 | 🟢 8.5 | ADO Wiki |
| 4 | AP-DP 部署后用户直接到达桌面但必需应用未安装，Provisioning 被跳过 | Windows Autopilot Device Preparation 策略的 User account type 设为 Standard user 时... | 两种 Workaround：1) 若 Entra ID Local admin 设为 Selected/None，则 AP-DP 策略的 User account type 改为 Adminis... | 🟢 8.5 | ADO Wiki |
| 5 | Autopilot v1 apps do not install or timeout; LOB (MSI) apps mixed with Win32 apps in ESP-blocking... | APv1 does not support mixing LOB (MSI) and Win32 app types. When both are ass... | Do not mix LOB (MSI) and Win32 apps in Autopilot v1. Convert LOB apps to Win32 format, or use APv... | 🟢 8.5 | ADO Wiki |
| 6 | Autopilot v1 apps do not install or timeout; LOB (MSI) apps mixed with Win32 apps in ESP-blocking... | APv1 does not support mixing LOB (MSI) and Win32 app types. When both are ass... | Do not mix LOB (MSI) and Win32 apps in Autopilot v1. Convert LOB apps to Win32 format, or use APv... | 🟢 8.5 | ADO Wiki |
| 7 | 配置 ETG enrollment profile 时更新 Device Security Group 报错 / SG 找不到 | Intune Provisioning Client 未设置为该 Security Group 的 Owner，导致 SG 验证失败（返回 SG not ... | 在 Entra 中将 'Intune Provisioning Client' Service Principal 添加为该 Static Security Group 的 Owner。参考: ... | 🟢 8.5 | ADO Wiki |
| 8 | Autopilot Device Preparation (AP-DP) device stuck at 100% during OOBE, deployment does not continue | Known platform issue in AP-DP initial release | End-user needs to manually restart the device for the deployment to continue. Fix is being worked... | 🔵 7.5 | ADO Wiki |
| 9 | AP-DP: User reaches desktop without required applications installed during Autopilot Device Prepa... | Conflict between AP-DP User account type set to Standard user and Entra ID lo... | Workaround 1: If Entra ID local admin = Selected/None, set AP-DP User account type to Administrat... | 🔵 7.5 | ADO Wiki |
| 10 | AP-DP: Managed installer policy causes app installs to be skipped during Autopilot Device Prepara... | Prior to 2603, managed installer policy conflicted with app installs during A... | Upgrade to 2603 service release or later. Managed installer usage during AP-DP is now supported. | 🔵 7.5 | ADO Wiki |
| 11 | Autopilot V2 enrollment fails with error 80180014 when personal device enrollment is blocked unde... | Corporate device identifiers take time to propagate after CSV upload. If enro... | Wait for corporate device identifiers to propagate after CSV upload. Verify in Intune portal: Dev... | 🔵 7.0 | OneNote |

## 快速排查路径
1. 1) Hotfix deployed 2025-10-30/31 to fix the delay; 2) Workaround before hotfix: use user-based groups with filter mode instead of device-based static  `[来源: OneNote]`
2. 终端用户手动重启设备即可继续完成部署。此问题为已知 Bug，Microsoft 正在修复中 `[来源: ADO Wiki]`
3. 确认 Service Principal 的 AppID 为 f1346770-5b25-470b-88bd-d5744ab7952c 即可放心选择，名称显示差异不影响 AP-DP 功能 `[来源: ADO Wiki]`
4. 两种 Workaround：1) 若 Entra ID Local admin 设为 Selected/None，则 AP-DP 策略的 User account type 改为 Administrator；2) 将 Entra ID Local admin 改为 All，AP-DP 策略保持 St `[来源: ADO Wiki]`
5. Do not mix LOB (MSI) and Win32 apps in Autopilot v1. Convert LOB apps to Win32 format, or use APv2 (Autopilot Device Preparation) which supports both  `[来源: ADO Wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/autopilot-v2.md#排查流程)
