# Kusto Query for Feature Update Policy Analysis

> Source: OneNote MCVKB/Intune/Kusto/Windows Update.md
> Quality: guide-draft (pending SYNTHESIZE review)
> Related: intune-onenote-022 (WUfB in 21v)

## Feature Update Policy Targeting Analysis

Query to check how many devices are targeted by a Feature Update Policy and their current OS versions:

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

## Useful Aggregations

### Count devices by current build:
```kql
| summarize Devices = dcount(DeviceId)
  by CurrentDeviceBuild = substring(CurrentDeviceVersion, 0, 11)
| order by Devices desc
```

### Check specific version adoption:
```kql
| summarize TotalDevices = dcount(DeviceId),
  DevicesOnWin11_22H2 = dcountif(DeviceId, CurrentDeviceVersion startswith "10.0.22621")
```

## Key Tables
- `FeatureUpdatePolicy_Snapshot` - Policy definitions
- `FeatureUpdatePolicyEffectiveGroupTargeting_Snapshot` - Targeting assignments
- `EffectiveGroupMembershipUserService_Snapshot` / `EffectiveGroupMembershipDeviceService_Snapshot` - Group membership
- `UserServiceUDA_Snapshot` - User-device affinity
- `Device_Snapshot` - Device info with OS version
