# Intune 设备操作（擦除/锁定/重置等） — 排查工作流

**来源草稿**: ado-wiki-Device-Actions-Troubleshooting.md, ado-wiki-Device-Actions.md, onenote-remote-action-windows.md
**Kusto 引用**: (无)
**场景数**: 15
**生成日期**: 2026-04-07

---

## Scenario 1: Step 1 - Confirm the Graph call was made
> 来源: ado-wiki-Device-Actions-Troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
HttpSubsystem
| where env_time > datetime(2024-04-02 19:09:06.075) and env_time < datetime(2024-04-02 19:12:18.9615100)
| where SourceNamespace == "IntunePE"  // Use IntuneFXP for GCCH
| where url contains "Intune Device Id"
| where httpVerb == "POST" or httpVerb == "ACTION" or httpVerb == "DELETE"
| where url contains "rebootnow"  // Update with action name API
| project-reorder env_time, httpVerb, statusCode, url, cVBase
```

Note down env_time, action name, and cV base from results.

## Scenario 2: Step 2 - Track the timing and result of the action being issued
> 来源: ado-wiki-Device-Actions-Troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
IntuneEvent
| where env_time > datetime(2024-04-02 19:09:06.075) and env_time < datetime(2024-04-02 20:10:18.9615100)
| where SourceNamespace == "IntunePE"  // Use IntuneFXP for GCCH
| where DeviceId == "Intune Device Id"
//| where cV has "cVBase from previous query"
//| where ComponentName == "DeviceActionServiceOperation"  // Result: None=0, Pending=1, Cancel=2, Active=3, Done=4, Failed=5, NotSupported=6
| project-reorder env_time, ActivityId, RelatedActivityId, ComponentName, EventUniqueName, Message, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, AccountId, ContextId, DeviceId, UserId, cV
| take 1000
| sort by env_time asc
```

Search for cVBase or look for:
- Col2: `Microsoft.Intune/RemoteTasks/RebootNow`
- Col3: `Issuing action RebootNow agaist class: Device_Reboot method: RebootNow`
- EventUniqueName: `RebootNow` or `InvokeActionAsync_deviceIntuneDeviceId_RebootNow`
- Col2: `4` (Done)

> For iOS devices: find the CmdUUID to correlate with DeviceManagementProvider table
> For Android Enterprise POWP: result visible directly from device in DeviceManagementProvider. Not available for Dedicated/FM/COWP.

## Scenario 3: Step 3 - See transactional communication and result
> 来源: ado-wiki-Device-Actions-Troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
DeviceManagementProvider
| where env_time > datetime(2024-04-10 19:13:27.2081338) and env_time < datetime(2024-04-10 20:14:27.2081338)
| where SourceNamespace == "IntunePE"  // Use IntuneFXP for GCCH
| where deviceId == "Intune Device Id"
| project-reorder env_time, message, EventMessage
```

Search `action` in output. If action fails, failure reason should appear here.

## Scenario 4: Alternative Starting Point (when device/action/timestamp unknown)
> 来源: ado-wiki-Device-Actions-Troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
HttpSubsystem
| where env_time > datetime(2024-04-14 11:10:40.85) and env_time < datetime(2024-04-22 18:20:50.9615100)
| where accountId == "<accountid>"
| where SourceNamespace == "IntunePE"  // Use IntuneFXP for GCCH
| where httpVerb == "POST" or httpVerb == "ACTION" or httpVerb == "DELETE"
| where statusCode != "200"
| where url !contains "UpdateDeviceCheckinData"
| where url !contains "UpdateInGracePeriodUntil"
| where url !contains "UpdateCompliantStatus"
| where url !contains "UpdateDeviceComplianceData"
| where url !contains "GetDeviceWithCheckinData"
| project-reorder env_time, httpVerb, statusCode, url, cVBase
```

## Device Action API Enumerations

## Scenario 5: ActionName Enum
> 来源: ado-wiki-Device-Actions-Troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Value | Name | Notes |
|-------|------|-------|
| 0 | Lock | Remote lock |
| 1 | PinReset | PIN reset |
| 2 | PinResetHybrid | Hybrid PIN reset |
| 3 | EPSignatureUpdate | Defender signature update |
| 4 | EPFullScan | Defender full scan |
| 5 | EPQuickScan | Defender quick scan |
| 6 | Retire | Retire device |
| 7 | Wipe | Wipe device |
| 8 | EnableLostMode | iOS lost mode enable |
| 9 | DisableLostMode | iOS lost mode disable |
| 10 | LocateDevice | Locate device |
| 11 | RebootNow | Restart device |
| 12 | NGCPinReset | NGC PIN reset |
| 13 | CleanPCRetainingUserData | Fresh Start (retain data) |
| 14 | CleanPCWithoutRetainingUserData | Fresh Start (no data) |
| 15 | LogOutUser | Shared iPad logout |
| 16 | DeleteUser | Shared iPad delete user |
| 17 | ShutDown | Shut down |
| 18 | WipePersistUserData | Wipe keep user data |
| 19 | None | Parameter placeholder |
| 20 | UpdateDeviceAccount | Surface Hub account |
| 21 | AutomaticRedeployment | Autopilot reset |
| 22 | RevokeAppleVppLicenses | Revoke iOS VPP |
| 23 | PlayLostModeSound | Play lost mode sound |
| 24 | Rename | Rename device |
| 25 | SetPinAction | Set PIN |
| 26 | SaveDeviceLocation | Save location |
| 27 | BypassActivationLock | Bypass activation lock |
| 28 | RequestRemoteAssistance | Remote assistance |
| 29 | SyncDevice | Sync device |
| 30 | SetDeviceName | Set device name |
| 31 | TimeLoop | Reset to anchor point |
| 32 | RotateBitLockerKeys | BitLocker key rotation |
| 33 | RenameAndReboot | Rename + reboot (Windows) |
| 34 | RotateFileVaultKey | FileVault key rotation (macOS) |
| 35 | CustomTextNotification | Custom notification |
| 36 | ProtectedWipe | Protected wipe |
| 37 | RotateUserSubmittedPersonalRecoveryKey | macOS personal recovery key |
| 38 | RequestDiagnostics | Collect diagnostics (Win 19H2+) |
| 39 | ActivateDeviceEsim | iOS eSIM activation |
| 40 | Deprovision | Chromebook deprovision |
| 41 | Disable | Chromebook disable |
| 42 | Reenable | Chromebook re-enable |
| 43 | MoveDeviceToOrganizationalUnit | Chromebook move OU |
| 44 | RemoveDFCIManagement | Remove DFCI (Windows) |
| 45 | InitiateMDMKeyRecovery | MDM key recovery with TPM |
| 46 | RemoteHelpLaunch | Remote Help (Windows) |
| 47 | OnDemandProactiveRemediation | On-demand remediation (Windows) |
| 48 | RotateLocalAdminPassword | LAPS rotation (Windows) |
| 49 | RemovePayloads | Remove payloads (Android/iOS) |
| 50 | PauseConfigurationRefresh | Pause config refresh (Windows) |
| 51 | InitiateDeviceAttestation | Device attestation (Windows/iOS) |
| 52 | Delete | Delete device |

## Scenario 6: ActionState Enum
> 来源: ado-wiki-Device-Actions-Troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Value | State |
|-------|-------|
| 0 | None |
| 1 | Pending |
| 2 | Cancel |
| 3 | Active |
| 4 | Done |
| 5 | Failed |
| 6 | NotSupported |

## Scenario 7: Troubleshooting Flow
> 来源: ado-wiki-Device-Actions.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Confirm device is online and syncing with Intune
2. Verify action was issued via Kusto:
```kusto
HttpSubsystem
| where env_time > ago(5d)
| where url contains "<deviceId>"
| where url contains "remoteLock"  -- change action name
| project env_time, ActivityId, url
```
3. Confirm action reached device:
```kusto
DeviceManagementProvider
| where env_time > ago(5d)
| where deviceId == "<deviceId>"
| where message contains "lock"  -- change action name
| project env_time, message
```

## Scenario 8: Wipe Pending Indefinitely
> 来源: ado-wiki-Device-Actions.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Device didn't report back before reset. Confirm wipe succeeded, then delete device from service.

## Scenario 9: Reset Passcode Not Supported (Android 8.0+ Work Profile)
> 来源: ado-wiki-Device-Actions.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Reset Token not activated. Need: (1) Work Profile passcode required in policy, (2) user set passcode, (3) user accepted reset prompt.

## Scenario 10: Reset Passcode Greyed Out (Android Device Admin)
> 来源: ado-wiki-Device-Actions.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Google removed feature on Android 7.0+ Device Admin API (ransomware protection).

## Scenario 11: Can't Restart After Wipe (Windows)
> 来源: ado-wiki-Device-Actions.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Caused by "continue to wipe even if devices lose power" option. Use bootable media to reinstall Windows.

## Scenario 12: Activation Lock Code Not Showing (iOS)
> 来源: ado-wiki-Device-Actions.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Code expired (15-day validity) or device not Supervised. Check via Graph: `GET /beta/deviceManagement/manageddevices('{id}')?$select=activationLockBypassCode`

## Scenario 13: Apps Not Removed After Retire
> 来源: ado-wiki-Device-Actions.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Only managed apps are removed (deployed as Required or installed via Company Portal).

## Scenario 14: Sign Back Into Office After Retire
> 来源: ado-wiki-Device-Actions.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Retire doesn't revoke access tokens. Use Conditional Access to mitigate.

## Scenario 15: Wipe Greyed Out (Android Work Profile)
> 来源: ado-wiki-Device-Actions.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Expected — Google doesn't allow factory reset via MDM for Work Profile devices.

## Recovery Lock (macOS)
- Requires macOS 11.5+ with Apple Silicon (not Intel)
- Settings Catalog: EnableRecoveryLockPassword + RecoveryLockPasswordRotationSchedule
- View/rotate password: Devices > device > Monitor > Passwords and keys
- Kusto validation queries available for policy application and command delivery

## W365 vs Intune Ownership
| W365 Owned | Intune Owned |
|------------|-------------|
| Restore, Reprovisioning, Resize, Place/Remove Under Review, Power On/Off | Collect Diagnostics, Rename, Sync |

## Scoping Questions
1. Bulk or single device? 2. Platform? 3. Which action? 4. Followed MS troubleshooting? 5. Device name/ID? 6. UPN? 7. Audit log access? 8. Time action sent? 9. Screenshot of status?

## Support Boundaries
- Wipe: If device bricked after successful wipe → contact OEM or Windows D&D team
- TeamViewer: License/app issues → TeamViewer Support
- Fresh Start: Stuck or not removing OEM apps → Windows team

---

## Kusto 查询参考

### Step 1 - Confirm the Graph call was made

```kql
HttpSubsystem
| where env_time > datetime(2024-04-02 19:09:06.075) and env_time < datetime(2024-04-02 19:12:18.9615100)
| where SourceNamespace == "IntunePE"  // Use IntuneFXP for GCCH
| where url contains "Intune Device Id"
| where httpVerb == "POST" or httpVerb == "ACTION" or httpVerb == "DELETE"
| where url contains "rebootnow"  // Update with action name API
| project-reorder env_time, httpVerb, statusCode, url, cVBase
```
`[来源: ado-wiki-Device-Actions-Troubleshooting.md]`

### Step 2 - Track the timing and result of the action being issued

```kql
IntuneEvent
| where env_time > datetime(2024-04-02 19:09:06.075) and env_time < datetime(2024-04-02 20:10:18.9615100)
| where SourceNamespace == "IntunePE"  // Use IntuneFXP for GCCH
| where DeviceId == "Intune Device Id"
//| where cV has "cVBase from previous query"
//| where ComponentName == "DeviceActionServiceOperation"  // Result: None=0, Pending=1, Cancel=2, Active=3, Done=4, Failed=5, NotSupported=6
| project-reorder env_time, ActivityId, RelatedActivityId, ComponentName, EventUniqueName, Message, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, AccountId, ContextId, DeviceId, UserId, cV
| take 1000
| sort by env_time asc
```
`[来源: ado-wiki-Device-Actions-Troubleshooting.md]`

### Step 3 - See transactional communication and result

```kql
DeviceManagementProvider
| where env_time > datetime(2024-04-10 19:13:27.2081338) and env_time < datetime(2024-04-10 20:14:27.2081338)
| where SourceNamespace == "IntunePE"  // Use IntuneFXP for GCCH
| where deviceId == "Intune Device Id"
| project-reorder env_time, message, EventMessage
```
`[来源: ado-wiki-Device-Actions-Troubleshooting.md]`

### Alternative Starting Point (when device/action/timestamp unknown)

```kql
HttpSubsystem
| where env_time > datetime(2024-04-14 11:10:40.85) and env_time < datetime(2024-04-22 18:20:50.9615100)
| where accountId == "<accountid>"
| where SourceNamespace == "IntunePE"  // Use IntuneFXP for GCCH
| where httpVerb == "POST" or httpVerb == "ACTION" or httpVerb == "DELETE"
| where statusCode != "200"
| where url !contains "UpdateDeviceCheckinData"
| where url !contains "UpdateInGracePeriodUntil"
| where url !contains "UpdateCompliantStatus"
| where url !contains "UpdateDeviceComplianceData"
| where url !contains "GetDeviceWithCheckinData"
| project-reorder env_time, httpVerb, statusCode, url, cVBase
```
`[来源: ado-wiki-Device-Actions-Troubleshooting.md]`

### Troubleshooting Flow

```kql
HttpSubsystem
| where env_time > ago(5d)
| where url contains "<deviceId>"
| where url contains "remoteLock"  -- change action name
| project env_time, ActivityId, url
```
`[来源: ado-wiki-Device-Actions.md]`

### Troubleshooting Flow

```kql
DeviceManagementProvider
| where env_time > ago(5d)
| where deviceId == "<deviceId>"
| where message contains "lock"  -- change action name
| project env_time, message
```
`[来源: ado-wiki-Device-Actions.md]`

---

## 判断逻辑参考

### Step 2 - Track the timing and result of the action being issued

| where env_time > datetime(2024-04-02 19:09:06.075) and env_time < datetime(2024-04-02 20:10:18.9615100)
| where SourceNamespace == "IntunePE"  // Use IntuneFXP for GCCH
| where DeviceId == "Intune Device Id"

### Step 2 - Track the timing and result of the action being issued

| project-reorder env_time, ActivityId, RelatedActivityId, ComponentName, EventUniqueName, Message, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, AccountId, ContextId, DeviceId, UserId, cV
| take 1000
| sort by env_time asc

### Step 3 - See transactional communication and result

| where env_time > datetime(2024-04-10 19:13:27.2081338) and env_time < datetime(2024-04-10 20:14:27.2081338)
| where SourceNamespace == "IntunePE"  // Use IntuneFXP for GCCH
| where deviceId == "Intune Device Id"
| project-reorder env_time, message, EventMessage

### Alternative Starting Point (when device/action/timestamp unknown)

| where env_time > datetime(2024-04-14 11:10:40.85) and env_time < datetime(2024-04-22 18:20:50.9615100)
| where accountId == "<accountid>"
| where SourceNamespace == "IntunePE"  // Use IntuneFXP for GCCH
| where httpVerb == "POST" or httpVerb == "ACTION" or httpVerb == "DELETE"
| where statusCode != "200"
| where url !contains "UpdateDeviceCheckinData"
| where url !contains "UpdateInGracePeriodUntil"
| where url !contains "UpdateCompliantStatus"
| where url !contains "UpdateDeviceComplianceData"
| where url !contains "GetDeviceWithCheckinData"
| project-reorder env_time, httpVerb, statusCode, url, cVBase

### ActionName Enum

| Value | Name | Notes |
|-------|------|-------|
| 0 | Lock | Remote lock |
| 1 | PinReset | PIN reset |
| 2 | PinResetHybrid | Hybrid PIN reset |
| 3 | EPSignatureUpdate | Defender signature update |
| 4 | EPFullScan | Defender full scan |
| 5 | EPQuickScan | Defender quick scan |
| 6 | Retire | Retire device |
| 7 | Wipe | Wipe device |
| 8 | EnableLostMode | iOS lost mode enable |
| 9 | DisableLostMode | iOS lost mode disable |
| 10 | LocateDevice | Locate device |
| 11 | RebootNow | Restart device |
| 12 | NGCPinReset | NGC PIN reset |
| 13 | CleanPCRetainingUserData | Fresh Start (retain data) |
| 14 | CleanPCWithoutRetainingUserData | Fresh Start (no data) |
| 15 | LogOutUser | Shared iPad logout |
| 16 | DeleteUser | Shared iPad delete user |
| 17 | ShutDown | Shut down |
| 18 | WipePersistUserData | Wipe keep user data |
| 19 | None | Parameter placeholder |
| 20 | UpdateDeviceAccount | Surface Hub account |
| 21 | AutomaticRedeployment | Autopilot reset |
| 22 | RevokeAppleVppLicenses | Revoke iOS VPP |
| 23 | PlayLostModeSound | Play lost mode sound |
| 24 | Rename | Rename device |
| 25 | SetPinAction | Set PIN |
| 26 | SaveDeviceLocation | Save location |
| 27 | BypassActivationLock | Bypass activation lock |
| 28 | RequestRemoteAssistance | Remote assistance |
| 29 | SyncDevice | Sync device |
| 30 | SetDeviceName | Set device name |
| 31 | TimeLoop | Reset to anchor point |
| 32 | RotateBitLockerKeys | BitLocker key rotation |
| 33 | RenameAndReboot | Rename + reboot (Windows) |
| 34 | RotateFileVaultKey | FileVault key rotation (macOS) |
| 35 | CustomTextNotification | Custom notification |
| 36 | ProtectedWipe | Protected wipe |
| 37 | RotateUserSubmittedPersonalRecoveryKey | macOS personal recovery key |
| 38 | RequestDiagnostics | Collect diagnostics (Win 19H2+) |
| 39 | ActivateDeviceEsim | iOS eSIM activation |
| 40 | Deprovision | Chromebook deprovision |
| 41 | Disable | Chromebook disable |
| 42 | Reenable | Chromebook re-enable |
| 43 | MoveDeviceToOrganizationalUnit | Chromebook move OU |
| 44 | RemoveDFCIManagement | Remove DFCI (Windows) |
| 45 | InitiateMDMKeyRecovery | MDM key recovery with TPM |
| 46 | RemoteHelpLaunch | Remote Help (Windows) |
| 47 | OnDemandProactiveRemediation | On-demand remediation (Windows) |
| 48 | RotateLocalAdminPassword | LAPS rotation (Windows) |
| 49 | RemovePayloads | Remove payloads (Android/iOS) |
| 50 | PauseConfigurationRefresh | Pause config refresh (Windows) |
| 51 | InitiateDeviceAttestation | Device attestation (Windows/iOS) |
| 52 | Delete | Delete device |

---

> ⚠️ **21V (Mooncake) 注意**: 本主题包含 21V 特有的限制或配置，请注意区分 Global 与 21V 环境差异。
