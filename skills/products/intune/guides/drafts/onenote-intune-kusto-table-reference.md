# Intune Kusto Table Reference

## Quick Lookup by Function

| Function | Global Table | Comments | 21v |
|----------|-------------|----------|-----|
| Check enrollment | DeviceService_Device | | |
| Check compliance | DeviceComplianceStatusChangesByDeviceId | IntuneEvent | |
| Check MAM check-in | AMS / AmsActivityForUser | IntuneEvent + HttpSubsystem | |
| Autopilot v2 | (see IntuneEvent) | Check frequent kusto queries | |
| Check VPP license | VppService_VppMultiTokenAccount / User / Device | No function now | |
| Effective group | EffectiveGroupMembershipsDeviceService_RawData / UserService_RawData | Snapshot tables | |
| Win32/MacAgent | SidecarEvent / SideCarPolicyResultPerDevicePerUser_Snapshot | | |
| RBAC | GetUserDirectoryRole / GetLastLoggedinUserPermissions | | |

## Detailed Table Reference

### Policy Info
- `CombinedPolicyMetadataWithScopeTags_Snapshot` — Policy info
- `DeviceIntentMetadataV2_Snapshot`
- `PolicyMetadataV1_Snapshot`
- `SideCarPolicy_Snapshot`

### Policy Settings
- `DCv2PolicySettingsData_Snapshot` — Policy settings info
- `PolicySettingIntendedValue_Snapshot`
- `AdmxDefinitionValue_Snapshot` — ADMX policy settings

### Deployment
- `Deployment_Snapshot` — Deployment info
- `DeploymentStatus_Snapshot`
- `CMPolicyAssignment_Snapshot`

### Policy Status
- `DeviceCompliancePolicyStatus_Snapshot`
- `CombinedPolicyStatusPerDevicePerUserDeviceUser_Snapshot`
- `CombinedPolicyStatusPerDevicePerUserDeviceUserWithV2UpdatePolicy_Snapshot`
- `CombinedAdmxPolicyStatusPerDevicePerUserDeviceUser_Snapshot`
- `SideCarPolicyResultPerDevicePerUser_Snapshot`

### Policy Setting Status
- `IntentSettingStatusPerDevicePerUserV2_Snapshot`
- `SettingStatusPerDevicePerUserV1_Snapshot`
- `SettingStatusPerDevicePerUserV3_Snapshot`
- `AdmxPolicySettingStatusPerDevicePerUserV1_Snapshot` — ADMX

### Application
- `CombinedAppMetadataScopeTags_Snapshot` — Application info

### MAM
- `MAMPolicy_Snapshot` — MAM policy info
- `MAMPolicyAssignment_Snapshot` — MAM policy deployment
- `MAMPolicyExclusionGroup_Snapshot` — MAM exclusion groups
- `MAMAppInstance_Snapshot` — MAM policy assignment status

## Source
- OneNote: Mooncake POD Support Notebook/POD/VMSCIM/4. Services/Intune/## Kusto Query.md
