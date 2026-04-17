# INTUNE 设备配置通用问题 — 已知问题详情

**条目数**: 15 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: Intune portal blade (e.g., Device Configurations) fails to load or shows error. F12 trace shows backend request taking ~15 seconds then ClientClose...
**Solution**: Collect F12 trace, extract client-request-id. Query IntuneEvent by ActivityId to find exception, then CMService by ActivityId to confirm service timeout. Once confirmed, raise ICM/Rave AR to IET team with Kusto evidence.
`[Source: onenote, Score: 9.5]`

### Step 2: macOS 设备 Rotate Recovery Lock Password 操作不可用或密码轮换失败
**Solution**: 1. 确认设备为 Apple Silicon 且 macOS ≥ 11.5；2. 通过 Settings Catalog 启用 EnableRecoveryLockPassword 并配置 RotationSchedule；3. 用 Kusto 验证策略是否已下发（查 IntuneEvent ScenarioType=DeviceSync/MacMDM + EndProcessingRule）；4. 用 HighLevelCheckin 查看 SetRecoveryLock 命令是否已发送并 Acknowledged
`[Source: ado-wiki, Score: 9.0]`

### Step 3: Security baseline shows 'Conflict' status on device; two settings applied to same device with conflicting values
**Solution**: 1) Use Kusto query to identify conflicting settings: query IntuneEvent where Col1 contains 'conflict' and ApplicationName startswith 'DeviceCheckin'. 2) Review all assigned baselines and device config profiles for overlapping settings. 3) Modify or remove conflicting profiles. KB: https://internal.evergreen.microsoft.com/en-us/topic/60d80b3a-8db4-a7de-670f-02a6f19b5d6d
`[Source: ado-wiki, Score: 9.0]`

### Step 4: Security baseline profile shows 'Conflict' status on device — two settings applied to same device with conflicting values from different baselines ...
**Solution**: 1) Use Kusto query with Col1 contains 'conflict' on IntuneEvent table to identify conflicting settings 2) Review per-setting status in Intune portal: Endpoint Security > Security Baselines > select baseline > Device status 3) Compare settings across all assigned baselines and device configuration profiles 4) Remove duplicate/conflicting settings. Reference: internal KB 60d80b3a-8db4-a7de-670f-02a6f19b5d6d
`[Source: ado-wiki, Score: 9.0]`

### Step 5: Endpoint security policy conflicts with security baselines or device configuration profiles — same setting managed by multiple policy types results...
**Solution**: 1) Develop a plan for using multiple policy types to minimize conflict risk 2) All policy types (security baselines, device configuration, endpoint security) are treated as equal sources by Intune 3) Review all assigned policies for overlapping settings 4) Reference: https://docs.microsoft.com/en-us/troubleshoot/mem/intune/troubleshoot-policies-in-microsoft-intune
`[Source: ado-wiki, Score: 9.0]`

### Step 6: Driver Update policy shows empty — drivers not populated for a driver update policy in Intune
**Solution**: 1) Run Kusto Account_Snapshot to verify license and DPSW (Diagnostic Data) enabled 2) For co-managed devices, configure scan source to Windows Update (not WSUS) 3) Check Event Viewer: Microsoft-Windows-WindowsUpdateClient/Operational for scan issues 4) Verify device EG targeting with DriverUpdateEffectiveGroupTargeting query 5) If all OK, escalate via TA/TL or driver update SME
`[Source: ado-wiki, Score: 9.0]`

### Step 7: macOS configuration profile Prevent automatic app updates cannot be set to TRUE. Setting fails to apply.
**Solution**: PG confirmed as platform bug and applied hotfix. If issue persists, file ICM for PG investigation.
`[Source: onenote, Score: 8.5]`

### Step 8: Wired-network profile stopped applying on macOS devices while other configuration profiles work normally.
**Solution**: Bug confirmed and fixed by PG (closed Oct 2023). If issue recurs, file ICM referencing this known bug.
`[Source: onenote, Score: 8.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Intune portal blade (e.g., Device Configurations) fails to load or shows erro... | Backend microservice (e.g., StatelessDeviceConfigurationFEService) exceeds 15... | Collect F12 trace, extract client-request-id. Query IntuneEvent by ActivityId... | 9.5 | onenote |
| 2 | macOS 设备 Rotate Recovery Lock Password 操作不可用或密码轮换失败 | Recovery Lock 需满足前提条件：(1) macOS 11.5+ Apple Silicon；(2) 已通过 Settings Catalog ... | 1. 确认设备为 Apple Silicon 且 macOS ≥ 11.5；2. 通过 Settings Catalog 启用 EnableRecover... | 9.0 | ado-wiki |
| 3 | Security baseline shows 'Conflict' status on device; two settings applied to ... | Multiple security baselines or device configuration profiles configure the sa... | 1) Use Kusto query to identify conflicting settings: query IntuneEvent where ... | 9.0 | ado-wiki |
| 4 | Security baseline profile shows 'Conflict' status on device — two settings ap... | Multiple security baselines or device configuration profiles targeting same d... | 1) Use Kusto query with Col1 contains 'conflict' on IntuneEvent table to iden... | 9.0 | ado-wiki |
| 5 | Endpoint security policy conflicts with security baselines or device configur... | Managing the same setting on the same device through multiple policy types (e... | 1) Develop a plan for using multiple policy types to minimize conflict risk 2... | 9.0 | ado-wiki |
| 6 | Driver Update policy shows empty — drivers not populated for a driver update ... | Prerequisites not met (license or Diagnostic Data not enabled); or co-managed... | 1) Run Kusto Account_Snapshot to verify license and DPSW (Diagnostic Data) en... | 9.0 | ado-wiki |
| 7 | macOS configuration profile Prevent automatic app updates cannot be set to TR... | Platform-side bug in Intune preventing the Prevent automatic app updates sett... | PG confirmed as platform bug and applied hotfix. If issue persists, file ICM ... | 8.5 | onenote |
| 8 | Wired-network profile stopped applying on macOS devices while other configura... | PG-confirmed bug affecting wired-network profile deployment on macOS. | Bug confirmed and fixed by PG (closed Oct 2023). If issue recurs, file ICM re... | 8.5 | onenote |
| 9 | Microsoft 365 apps on macOS close without notification, update, and restart u... | Multiple configuration profiles managing Microsoft AutoUpdate (MAU) settings ... | Deploy only one configuration profile for MAU settings. Include only MAU sett... | 8.0 | mslearn |
| 10 | Password expiration setting not working. User not prompted after configured d... | Editing the policy resets the timer even if the expiration value was not chan... | Avoid editing policy unnecessarily. Expiry = N days after last modified date. | 8.0 | mslearn |
| 11 | After switching Device Configuration workload to Intune in co-management, Res... | By design, Device Configuration workload has a dependency on Resource Access ... | This is expected behavior. When switching Device Configuration workload to In... | 7.5 | onenote |
| 12 | After enrolling a device in Intune, you may notice that no policies show up o... | This can occur if rules in the Device Configuration policies are conflicting. | To determine which rules are conflicting, you can run the following Kusto que... | 7.5 | contentidea-kb |
| 13 | While working with customers for Partner Device Management cases where macOS ... |  |  | 7.5 | contentidea-kb |
| 14 | Consider the following scenario: You&nbsp;have user groups for multiple count... | This can occur if the Jamf connector is assigned in Intune to all users. To v... | To resolve this problem compete the following: 1. Search serial number of the... | 7.5 | contentidea-kb |
| 15 | On a co-management Windows 10 device, after assigning a MEM Configuration Pro... | This behavior is by design on a co-management device if the required workload... | To resolve this problem, move the required workload&nbsp;(depending the type ... | 7.5 | contentidea-kb |
