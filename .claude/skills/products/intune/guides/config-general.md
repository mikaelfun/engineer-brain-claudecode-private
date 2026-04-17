# INTUNE 设备配置通用问题 — 排查速查

**来源数**: 4 | **21V**: 全部适用
**条目数**: 15 | **最后更新**: 2026-04-17

## 快速排查路径

1. **Intune portal blade (e.g., Device Configurations) fails to load or shows error. F12 trace shows backend request taking ~15 seconds then ClientClosedRequestException. Blade renders error.**
   → Collect F12 trace, extract client-request-id. Query IntuneEvent by ActivityId to find exception, then CMService by ActivityId to confirm service timeout. Once confirmed, raise ICM/Rave AR to IET te... `[onenote, 🟢 9.5]`

2. **macOS 设备 Rotate Recovery Lock Password 操作不可用或密码轮换失败**
   → 1. 确认设备为 Apple Silicon 且 macOS ≥ 11.5；2. 通过 Settings Catalog 启用 EnableRecoveryLockPassword 并配置 RotationSchedule；3. 用 Kusto 验证策略是否已下发（查 IntuneEvent ScenarioType=DeviceSync/MacMDM + EndProcessingRule... `[ado-wiki, 🟢 9.0]`

3. **Security baseline shows 'Conflict' status on device; two settings applied to same device with conflicting values**
   → 1) Use Kusto query to identify conflicting settings: query IntuneEvent where Col1 contains 'conflict' and ApplicationName startswith 'DeviceCheckin'. 2) Review all assigned baselines and device con... `[ado-wiki, 🟢 9.0]`

4. **Security baseline profile shows 'Conflict' status on device — two settings applied to same device with conflicting values from different baselines or device configuration profiles**
   → 1) Use Kusto query with Col1 contains 'conflict' on IntuneEvent table to identify conflicting settings 2) Review per-setting status in Intune portal: Endpoint Security > Security Baselines > select... `[ado-wiki, 🟢 9.0]`

5. **Endpoint security policy conflicts with security baselines or device configuration profiles — same setting managed by multiple policy types results in error/conflict on device**
   → 1) Develop a plan for using multiple policy types to minimize conflict risk 2) All policy types (security baselines, device configuration, endpoint security) are treated as equal sources by Intune ... `[ado-wiki, 🟢 9.0]`

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Intune portal blade (e.g., Device Configurations) fails to load or shows error. F12 trace shows b... | Backend microservice (e.g., StatelessDeviceConfigurationFEService) exceeds 15,000 ms ScenarioTime... | Collect F12 trace, extract client-request-id. Query IntuneEvent by ActivityId to find exception, ... | 🟢 9.5 | onenote: MCVKB/Intune/Kusto/Blade error in the... |
| 2 | macOS 设备 Rotate Recovery Lock Password 操作不可用或密码轮换失败 | Recovery Lock 需满足前提条件：(1) macOS 11.5+ Apple Silicon；(2) 已通过 Settings Catalog 配置 EnableRecoveryLoc... | 1. 确认设备为 Apple Silicon 且 macOS ≥ 11.5；2. 通过 Settings Catalog 启用 EnableRecoveryLockPassword 并配置 Ro... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Actions) |
| 3 | Security baseline shows 'Conflict' status on device; two settings applied to same device with con... | Multiple security baselines or device configuration profiles configure the same setting with diff... | 1) Use Kusto query to identify conflicting settings: query IntuneEvent where Col1 contains 'confl... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEndpoint%20Security%2FSecurity%20Baselines) |
| 4 | Security baseline profile shows 'Conflict' status on device — two settings applied to same device... | Multiple security baselines or device configuration profiles targeting same device contain confli... | 1) Use Kusto query with Col1 contains 'conflict' on IntuneEvent table to identify conflicting set... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEndpoint%20Security%2FSecurity%20Baselines) |
| 5 | Endpoint security policy conflicts with security baselines or device configuration profiles — sam... | Managing the same setting on the same device through multiple policy types (endpoint security pol... | 1) Develop a plan for using multiple policy types to minimize conflict risk 2) All policy types (... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEndpoint%20Security%2FSecurity%20Policy) |
| 6 | Driver Update policy shows empty — drivers not populated for a driver update policy in Intune | Prerequisites not met (license or Diagnostic Data not enabled); or co-managed device configured t... | 1) Run Kusto Account_Snapshot to verify license and DPSW (Diagnostic Data) enabled 2) For co-mana... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FManage%20Software%20Updates%2FWindows%2FDriver%20Updates%2FTroubleshooting%2FDriver%20policy%20is%20empty) |
| 7 | macOS configuration profile Prevent automatic app updates cannot be set to TRUE. Setting fails to... | Platform-side bug in Intune preventing the Prevent automatic app updates setting from being set t... | PG confirmed as platform bug and applied hotfix. If issue persists, file ICM for PG investigation. | 🟢 8.5 | onenote: Mooncake POD Support Notebook/POD/VMS... |
| 8 | Wired-network profile stopped applying on macOS devices while other configuration profiles work n... | PG-confirmed bug affecting wired-network profile deployment on macOS. | Bug confirmed and fixed by PG (closed Oct 2023). If issue recurs, file ICM referencing this known... | 🟢 8.5 | onenote: Mooncake POD Support Notebook/POD/VMS... |
| 9 | Microsoft 365 apps on macOS close without notification, update, and restart unexpectedly (no MAU ... | Multiple configuration profiles managing Microsoft AutoUpdate (MAU) settings are deployed, or a s... | Deploy only one configuration profile for MAU settings. Include only MAU settings that apply to a... | 🟢 8.0 | [mslearn](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/app-management/no-notification-microsoft365-apps-macos-update) |
| 10 | Password expiration setting not working. User not prompted after configured days. | Editing the policy resets the timer even if the expiration value was not changed. | Avoid editing policy unnecessarily. Expiry = N days after last modified date. | 🟢 8.0 | [mslearn](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/device-configuration/password-expiration-setting-not-working) |
| 11 | After switching Device Configuration workload to Intune in co-management, Resource Access and End... | By design, Device Configuration workload has a dependency on Resource Access and Endpoint Protect... | This is expected behavior. When switching Device Configuration workload to Intune, Resource Acces... | 🔵 7.5 | onenote: Mooncake POD Support Notebook\POD\VMS... |
| 12 | After enrolling a device in Intune, you may notice that no policies show up on the device, and wh... | This can occur if rules in the Device Configuration policies are conflicting. | To determine which rules are conflicting, you can run the following Kusto query:IntuneEvent / whe... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4230656) |
| 13 | While working with customers for Partner Device Management cases where macOS devices are managed ... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4621607) |
| 14 | Consider the following scenario: You&nbsp;have user groups for multiple countries. Some countries... | This can occur if the Jamf connector is assigned in Intune to all users. To verify, search for &q... | To resolve this problem compete the following: 1. Search serial number of the      impacted devic... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4648613) |
| 15 | On a co-management Windows 10 device, after assigning a MEM Configuration Profile you end up rece... | This behavior is by design on a co-management device if the required workload (depending the type... | To resolve this problem, move the required workload&nbsp;(depending the type of Configuration Pro... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5011250) |

> 本 topic 有排查工作流 → [排查工作流](workflows/config-general.md)
> → [已知问题详情](details/config-general.md)
