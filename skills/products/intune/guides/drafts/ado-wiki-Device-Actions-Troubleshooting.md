---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Device Actions/Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Actions%2FTroubleshooting"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Device Actions Troubleshooting — Detailed Kusto Guide

> Most Device Actions cases are By-Design / Not Supported. Kusto does most of the heavy lifting. All Intune is responsible for is issuing the command. Behavior after the fact is usually not in scope.

## Step 1 - Confirm the Graph call was made

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

## Step 2 - Track the timing and result of the action being issued

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

## Step 3 - See transactional communication and result

```kusto
DeviceManagementProvider
| where env_time > datetime(2024-04-10 19:13:27.2081338) and env_time < datetime(2024-04-10 20:14:27.2081338)
| where SourceNamespace == "IntunePE"  // Use IntuneFXP for GCCH
| where deviceId == "Intune Device Id"
| project-reorder env_time, message, EventMessage
```

Search `action` in output. If action fails, failure reason should appear here.

## Alternative Starting Point (when device/action/timestamp unknown)

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

### ActionState Enum

| Value | State |
|-------|-------|
| 0 | None |
| 1 | Pending |
| 2 | Cancel |
| 3 | Active |
| 4 | Done |
| 5 | Failed |
| 6 | NotSupported |
