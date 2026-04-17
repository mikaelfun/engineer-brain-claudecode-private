# Intune Windows Update / Update Rings / WUFB — 排查工作流

**来源草稿**: mslearn-troubleshoot-update-rings.md, onenote-kusto-feature-update-policy.md, onenote-windows-update-ring-logs.md, onenote-wufb-log-collection.md
**Kusto 引用**: (无)
**场景数**: 13
**生成日期**: 2026-04-07

---

## Portal 路径

- `1. Open Settings > Account > Access work or school`

## Scenario 1: Prerequisites
> 来源: mslearn-troubleshoot-update-rings.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Windows 10 v1607+ or Windows 11
- Editions: Pro, Enterprise, Team (Surface Hub), Holographic for Business (subset), LTSC (subset)

## Scenario 2: 1. Check Intune Admin Center
> 来源: mslearn-troubleshoot-update-rings.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Navigate: Devices > Windows > Update rings for Windows 10 and later
- Select the policy → View report → check per-device status
- Two entries per device is normal (user context + system context)
- Kiosk/Autologon devices: only system account entry

## Scenario 3: 2. Verify Settings on Device
> 来源: mslearn-troubleshoot-update-rings.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Settings > Accounts > Access work or school → check managed policies
- Settings > Windows Updates > Advanced options > Configured update policies
- Verify policy type = "Mobile Device Management" (not "Group Policy")

## Scenario 4: 3. Check for MDM vs GPO Conflicts
> 来源: mslearn-troubleshoot-update-rings.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

**Most common root cause of Update ring failures.**

- Run `gpresult /r` to see active group policies
- GPO from SCCM shows as "Local Group Policy" source
- MDM + GPO conflict → updates won't apply or apply incorrectly
- `ControlPolicyConflict` CSP can help resolve some conflicts (but NOT for Update Policy CSP)

## Scenario 5: 4. Verify Registry Keys
> 来源: mslearn-troubleshoot-update-rings.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Intune writes to: `HKLM\SOFTWARE\Microsoft\PolicyManager\current\device\Update`
- Windows Update keys: `HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU`
- Check if `UpdateServiceUrl` points to WSUS vs WU
- If WSUS, verify `DisableDualScan` is set to `0`

## Scenario 6: 5. MDM Diagnostics Report
> 来源: mslearn-troubleshoot-update-rings.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Settings > Accounts > Access work or school > Export
- If Update ring policy appears in report → policy deployed successfully

## Scenario 7: 6. Event Viewer Logs
> 来源: mslearn-troubleshoot-update-rings.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Intune events: Applications and Services logs > Microsoft > Windows > DeviceManagement-Enterprise-Diagnostics-Provider > Admin
- Windows Update Client: Applications and Services logs > Microsoft > Windows > WindowsUpdateClient

## Scenario 8: Common Issues Checklist
> 来源: mslearn-troubleshoot-update-rings.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Check | Detail |
|-------|--------|
| Telemetry enabled? | Device Restriction policy or GPO |
| Network connectivity? | Airplane mode / no service → policy applies when connected |
| TargetReleaseVersion conflict? | Check via GPO or Settings Catalog |
| Co-managed? | Verify Windows Update workload switched to Intune |
| Conflicting policies? | Check for conflicts in Device Configuration pane |
| Correct assignment? | Verify user/device group targeting |
| Edition support? | Some settings only apply to certain Windows versions/editions |

## Scenario 9: Count devices by current build:
> 来源: onenote-kusto-feature-update-policy.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kql
| summarize Devices = dcount(DeviceId)
  by CurrentDeviceBuild = substring(CurrentDeviceVersion, 0, 11)
| order by Devices desc
```
`[来源: onenote-kusto-feature-update-policy.md]`

## Scenario 10: Check specific version adoption:
> 来源: onenote-kusto-feature-update-policy.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kql
| summarize TotalDevices = dcount(DeviceId),
  DevicesOnWin11_22H2 = dcountif(DeviceId, CurrentDeviceVersion startswith "10.0.22621")
```
`[来源: onenote-kusto-feature-update-policy.md]`

## Key Tables
- `FeatureUpdatePolicy_Snapshot` - Policy definitions
- `FeatureUpdatePolicyEffectiveGroupTargeting_Snapshot` - Targeting assignments
- `EffectiveGroupMembershipUserService_Snapshot` / `EffectiveGroupMembershipDeviceService_Snapshot` - Group membership
- `UserServiceUDA_Snapshot` - User-device affinity
- `Device_Snapshot` - Device info with OS version

## Scenario 11: Setupreport Tool
> 来源: onenote-windows-update-ring-logs.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Download Setupreport.cmd.txt, rename to Setupreport.cmd
2. Double-click to run (10-20 min)
3. Results saved to `C:\setup_report_<computername>`
4. Zip and upload; manually remove folder after

## Scenario 12: Known Facts
> 来源: onenote-windows-update-ring-logs.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Update Ring policy only distributes **B releases** (Patch Tuesday, 2nd Tuesday)
- **C releases** (3rd week) and **D releases** (4th week) are preview/non-security; NOT distributed by Update Ring
- Out-of-band releases for critical vulnerabilities ARE distributed
- See intune-onenote-129 for details

## Scenario 13: Key files in wutraces:
> 来源: onenote-wufb-log-collection.md | 适用: Mooncake ❌ (Global-only)

### 排查步骤

- `windowsupdate.etl` - WU client ETL logs
- `Netmon.etl` - network trace
- `MoUsoCoreWorker.*.etl` - USO client logs
- `Appcompat.reg` - appraiser registry
- `CAPI2 event log` - certificate events
- `updatering.reg` - Intune WUFB policy
- `windowsupdate.reg` - AU Group Policy
- `Windowsupdate2.reg` - AU state

## Important Notes
- Windows Update Ring policy only receives B (Patch Tuesday) releases
- C/D preview releases are not distributed by the policy (confirmed by PG)
- WUFB report is not ready in 21v environment
- Intune autopatch (WUFB-DS/DSS) is currently not available in Mooncake

---

## Kusto 查询参考

### Feature Update Policy Targeting Analysis

```kql
FeatureUpdatePolicy_Snapshot
| where FeatureUpdatePolicyId == "<policy-id>"
| join kind=inner
    ((FeatureUpdatePolicyEffectiveGroupTargeting_Snapshot()
      | where IsDeleted == 0  // User targeting
      | join kind=inner EffectiveGroupMembershipUserService_Snapshot on EffectiveGroupId
      | join kind=inner UserServiceUDA_Snapshot on $left.TargetId == $right.UserId
      | distinct DeviceId, FeatureUpdatePolicyId
    )
    | union
    (FeatureUpdatePolicyEffectiveGroupTargeting_Snapshot()
      | where IsDeleted == 0  // Device targeting
      | join kind=inner EffectiveGroupMembershipDeviceService_Snapshot on EffectiveGroupId
      | extend DeviceId = TargetId
      | distinct DeviceId, FeatureUpdatePolicyId
    )) on FeatureUpdatePolicyId
| join kind=inner Device_Snapshot on DeviceId
| where OSDescription == "Windows"
| project DeviceId, PolicyTargetVersion = FeatureUpdateVersion,
  CurrentDeviceVersion = OSVersion
```
`[来源: onenote-kusto-feature-update-policy.md]`

---

## 判断逻辑参考

### Feature Update Policy Targeting Analysis

| where FeatureUpdatePolicyId == "<policy-id>"
| join kind=inner

### Feature Update Policy Targeting Analysis

      | where IsDeleted == 0  // User targeting
      | join kind=inner EffectiveGroupMembershipUserService_Snapshot on EffectiveGroupId
      | join kind=inner UserServiceUDA_Snapshot on $left.TargetId == $right.UserId
      | distinct DeviceId, FeatureUpdatePolicyId

### Feature Update Policy Targeting Analysis

    | union

### Feature Update Policy Targeting Analysis

      | where IsDeleted == 0  // Device targeting
      | join kind=inner EffectiveGroupMembershipDeviceService_Snapshot on EffectiveGroupId
      | extend DeviceId = TargetId
      | distinct DeviceId, FeatureUpdatePolicyId

### Feature Update Policy Targeting Analysis

| join kind=inner Device_Snapshot on DeviceId
| where OSDescription == "Windows"
| project DeviceId, PolicyTargetVersion = FeatureUpdateVersion,

---

> ⚠️ **21V (Mooncake) 注意**: 本主题包含 21V 特有的限制或配置，请注意区分 Global 与 21V 环境差异。
