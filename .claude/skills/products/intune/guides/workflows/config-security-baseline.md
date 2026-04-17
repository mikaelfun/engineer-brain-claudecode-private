# Intune Security Baseline 与策略冲突 — 排查工作流

**来源草稿**: ado-wiki-Security-Baselines.md
**Kusto 引用**: (无)
**场景数**: 4
**生成日期**: 2026-04-07

---

## Scenario 1: Assignment States
> 来源: ado-wiki-Security-Baselines.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **Succeeded**: Policy applied
- **Conflict**: Two settings on same device, admin must review
- **Error**: Policy failed, error code links to explanation
- **Pending**: Device hasn't checked in
- **Not applicable**: Device can't receive policy (e.g., OS version too old)

## Scenario 2: Conflicts
> 来源: ado-wiki-Security-Baselines.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Use Kusto to identify conflicts:
```kusto
let _deviceId = "<DeviceID>";
IntuneEvent
| where SourceNamespace == "IntunePE"
| where env_time between (datetime(start)..datetime(end))
| where DeviceId == _deviceId or ActivityId == _deviceId
| where Col1 contains "conflict"
| where ApplicationName startswith 'DeviceCheckin'
| where Col5 != 'NotApplicable'
| project env_time, ApplicationName, ComponentName, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, Message
| take 2000
```

Related KB: [How to troubleshoot Device Configuration policy conflicts](https://internal.evergreen.microsoft.com/en-us/topic/60d80b3a-8db4-a7de-670f-02a6f19b5d6d)

## Scenario 3: Errors
> 来源: ado-wiki-Security-Baselines.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Most errors related to scope (user vs device assignment) or applicability (CSP support).
- Review CSP pre-requirements for each security setting
- KB: [How to configure Security Baselines](https://internal.evergreen.microsoft.com/en-us/topic/47625e81-41a4-d0d2-6fa2-93e0adbd3d59)

## Scenario 4: Pending
> 来源: ado-wiki-Security-Baselines.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Confirm device last check-in is recent
2. Force sync and verify status updates
3. Confirm user/device is direct member of assigned group
4. Verify Azure deviceId/objectId matches group membership in ASC
5. [Troubleshoot effective group membership](https://internal.evergreen.microsoft.com/en-us/topic/63526f19-9ef6-9b79-d381-d8ac8dda1ee5)

## Firewall Unsupported Configurations
- [Unsupported configurations](https://docs.microsoft.com/en-us/mem/intune/protect/endpoint-security-firewall-rule-tool#unsupported-configurations)
- [Unsupported setting values](https://docs.microsoft.com/en-us/mem/intune/protect/endpoint-security-firewall-rule-tool#unsupported-setting-values)

---

## Kusto 查询参考

### Conflicts

```kql
let _deviceId = "<DeviceID>";
IntuneEvent
| where SourceNamespace == "IntunePE"
| where env_time between (datetime(start)..datetime(end))
| where DeviceId == _deviceId or ActivityId == _deviceId
| where Col1 contains "conflict"
| where ApplicationName startswith 'DeviceCheckin'
| where Col5 != 'NotApplicable'
| project env_time, ApplicationName, ComponentName, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, Message
| take 2000
```
`[来源: ado-wiki-Security-Baselines.md]`
