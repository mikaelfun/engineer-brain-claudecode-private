---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Device Actions/Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=/Device%20Actions/Troubleshooting"
importDate: "2026-04-20"
type: guide-draft
---

# Device Actions Troubleshooting

**Page Author**: @<C933AADF-F738-6092-BAB7-2C9F4BDCEDF3> 

Following this logical flow for any Device Action scenario will allow you to track an action from the moment the graph call is made to the time it is delivered (or not) to the device.

The bottom of this page contains a list of all of the APIs you can find in <font color=teal> **Kusto**</font>  for each Device Action, along with the result enumerations you can find in IntuneEvent.

> :ledger:**NOTE** 
> Before we begin, it is important to understand that most Device Actions cases that are opened will be By-Design / Not Supported. <font color=teal> **Kusto**</font> does most of the heavy lifting for troubleshooting in these instances. 
> 
> Generally, it is considered a Device Actions case if the action itself is failing, when the given device is in a supported scenario for said action, and that device is checking in. If the device is not checking in, and/or does not meet the criteria for the action, there is no expectation it will succeed.
>
> All Intune is responsible for is issuing the command. Behavior that happens after the fact is usually not within our scope of support.

**Step 1🔎 - Confirm the Graph call was made**
```kotlin
//Note down env_time, action name, and cV base
HttpSubsystem
| where env_time > datetime(2024-04-02 19:09:06.075) and env_time < datetime(2024-04-02 19:12:18.9615100)//Update timeframe as needed
| where SourceNamespace == "IntunePE"//Update to IntuneFXP for GCCH
| where url has_cs "Intune Device Id"//Update with Intune device id
| where collectionName in ("deviceManagement", "Devices", "IWService", "DeviceDirectory", "CertificateInfos", "Udas")
| where httpVerb in ("POST", "DELETE")
| where url contains "rebootnow"//Update with action name API - full list referenced at bottom of page
| project-reorder env_time, httpVerb, statusCode, url, cVBase, ActivityId, scenarioType, collectionName
```

|env_time |httpVerb |statusCode|url |cVBase|ActivityId|
|---------|---------|---------|---------|-------|---------|
|2024-04-02 19:10:53.3699698|POST|204 |https://fef.msua01.manage.microsoft.com/TrafficGateway/TrafficRoutingService/DeviceFE/StatelessDeviceFEService/deviceManagement/managedDevices('IntuneDeviceId')/microsoft.management.services.api.rebootNow??api-version=5023-12-26|xxxx3nWhBUpxxxarts/12345|xxxxx-ee2d-4c3a-b221-9c6e7xxxxx|
|2024-04-02 19:10:53.3701808|POST|204 |https://fef.msua01.manage.microsoft.com/DeviceFE/StatelessDeviceFEService/deviceManagement/managedDevices('IntuneDeviceId')/microsoft.management.services.api.rebootNow??api-version=5023-12-26)|xxxx3nWhBUpxxxarts/12345|xxxxx-ee2d-4c3a-b221-9c6e7dxxxxx|



Now take the Device Id, Action, cV base, and timestamp to inform your next query. You may need to give some extra time at the end of the datetime range depending on the scenario.

**Step 2🔎 - Track the timing and result of the action being issued by the service**
```kotlin
IntuneEvent
| where env_time > datetime(2024-04-02 19:09:06.075) and env_time < datetime(2024-04-02 20:10:18.9615100)//Update timeframe as needed
| where SourceNamespace == "IntunePE"//Update to IntuneFXP for GCCH
| where ActivityId == "xxx"//ActivityId from Step 1 associated with the POST action
//| where ComponentName == "DeviceActionServiceOperation"//Use this if you're only looking for result(None = 0,Pending = 1,Cancel = 2,Active = 3,Done = 4,Failed = 5,NotSupported = 6) shown in Col2
| project-reorder env_time,ActivityId, RelatedActivityId, ComponentName, EventUniqueName, Message, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, AccountId, ContextId, DeviceId, UserId, cV


```
In the output, start by either searching (**Ctrl+F**) the cVBase or the permissions call that will look like this:

**Col2**

Microsoft.Intune/RemoteTasks/RebootNow

**Col3**

Issuing action RebootNow agaist class: Device_Reboot method: RebootNow

**EventUniqueName**

RebootNow

InvokeActionAsync_deviceIntuneDeviceId_RebootNow

**Col2**

4

> :ledger:**NOTE** For iOS devices, you can find the `CmdUUID` for the specific action and easily correlate it to the event in the <font color=teal> **DeviceManagementProvider**</font> table

> :ledger:**NOTE** For Android Enterprise Personally Owned Work Profile devices, you can see the result directly from the device in the <font color=teal> **DeviceManagementProvider**</font> table. For Dedicated, Fully Managed, and Corporate Owned Work Profile this option is not available.
>
> 
**Step 3🔎 - See the transactional communication between the device and the service as well as the result, including failure reason**
```kotlin
DeviceManagementProvider
| where env_time > datetime(2024-04-10 19:13:27.2081338) and env_time < datetime(2024-04-10 20:14:27.2081338)
| where SourceNamespace == "IntunePE"//Update to IntuneFXP for GCCH
| where deviceId == "Intune Device Id"//Intune Device Id
| project-reorder env_time, message, EventMessage
```
In the output, search (**Ctrl+F**) `action` - If the action fails, you should see a failure reason here

**Example 1**

**message**

Preprocess: Action RebootNow has state ActionPending

wmiClassName: Device_Reboot, wmiMethodName: RebootNow

Issuing action RebootNow agaist class: Device_Reboot method: RebootNow

iOSPlugin: Issuing an iOS Command of type RestartDeviceCommand

iOSPlugin: Updating the priority of command type RestartDevice and taskId 
'TaskId Uniqueid => TaskId Uniqueid; ' to 'LowestPriority
'
(NotAWarning) Action invoke result is Issued for action RebootNow and Device IntuneDevicId

Updating action with device action service for action type: RebootNow with state: ActionCompleted






**Example 2**

**message**

(NotAWarning) Action invoke result is Issued for action Lock and Device IntuneDeviceId
Action invoke result is succeeded for action Lock

**EventMessage**

Device action success. AccountId: AccountId, DeviceId: IntuneDeviceId, ActionName: Lock, Duration: -1, DeviceType: AndroidForWork, ActionState: 4, Authority: 1 SessionId:SessionId RelatedActivityId:RelatedActivityId callerMethod:UpdateDeviceActionsFromNewService sourceFilePath:D:\dbs\sh\Isdc\0403_145702_0\cmd\9\src\Services\SLDM\Source\ODataSAL\ODataSalExtensions\ODataSAL_DeviceDirectory.cs lineNumber:2980


>:bulb:If you are starting from scratch, and aren't sure of the deviceId, specific action, or precise timestamp, you can start here and then move to **Step 2**

```kotlin
//Note down env_time, action name, and cV base
HttpSubsystem
| where env_time > datetime(2024-04-14 11:10:40.85) and env_time < datetime(2024-04-22 18:20:50.9615100)//Update timeframe as needed
| where accountId == "<accountid>"
| where SourceNamespace == "IntunePE"//Update to IntuneFXP for GCCH
| where collectionName in ("deviceManagement", "Devices", "IWService", "DeviceDirectory", "CertificateInfos", "Udas")
| where httpVerb in ("POST", "DELETE")
| where statusCode != "200"
| where url !contains "UpdateDeviceCheckinData"
| where url !contains "UpdateInGracePeriodUntil"
| where url !contains "UpdateCompliantStatus"
| where url !contains "UpdateDeviceComplianceData"
| where url !contains "GetDeviceWithCheckinData"
| project-reorder env_time, httpVerb, statusCode, url, cVBase
```

# Device Action API/Enumerations
```js
    /// <summary>
    /// Device action name
    /// </summary>
    [DataContract]
    public enum ActionName
    {
        /// <summary>
        /// The lock
        /// </summary>
        [EnumMember]
        Lock = 0,

        /// <summary>
        /// The pin reset
        /// </summary>
        [EnumMember]
        PinReset = 1,

        /// <summary>
        /// The pin reset hybrid
        /// </summary>
        [EnumMember]
        PinResetHybrid = 2,

        /// <summary>
        /// The Endpoint Protection Signature Update
        /// </summary>
        [EnumMember]
        EPSignatureUpdate = 3,

        /// <summary>
        /// The Endpoint Protection Full Scan
        /// </summary>
        [EnumMember]
        EPFullScan = 4,

        /// <summary>
        /// The Endpoint Protection Quick Scan
        /// </summary>
        [EnumMember]
        EPQuickScan = 5,

        /// <summary>
        /// Retire
        /// </summary>
        [EnumMember]
        Retire = 6,

        /// <summary>
        /// Wipe
        /// </summary>
        [EnumMember]
        Wipe = 7,

        /// <summary>
        /// Enable lost mode
        /// </summary>
        [EnumMember]
        EnableLostMode = 8,

        /// <summary>
        /// Disable lost mode
        /// </summary>
        [EnumMember]
        DisableLostMode = 9,

        /// <summary>
        /// Locate device
        /// </summary>
        [EnumMember]
        LocateDevice = 10,

        [EnumMember]
        RebootNow = 11,

        /// <summary>
        /// NGC Pin Reset
        /// </summary>
        [EnumMember]
        NGCPinReset = 12,

        /// <summary>
        /// CleanPCRetainingUserData
        /// </summary>
        [EnumMember]
        CleanPCRetainingUserData = 13,

        /// <summary>
        /// CleanPCWithoutRetainingUserData
        /// </summary>
        [EnumMember]
        CleanPCWithoutRetainingUserData = 14,

        /// <summary>
        /// Log out active user of a shared iPad
        /// </summary>
        [EnumMember]
        LogOutUser = 15,

        /// <summary>
        /// Delete a user of a shared iPad
        /// </summary>
        [EnumMember]
        DeleteUser = 16,

        /// <summary>
        /// ShutDown a device
        /// </summary>
        [EnumMember]
        ShutDown = 17,

        /// <summary>
        /// Perform a remote reset on the device and persist user accounts and data. 
        /// </summary>
        [EnumMember]
        WipePersistUserData = 18,

        /// <summary>
        /// Pass in parameter so that we can reuse existing wipe logic
        /// </summary>
        [EnumMember]
        None = 19,

        /// <summary>
        /// Update device account on Surface Hub
        /// </summary>
        [EnumMember]
        UpdateDeviceAccount = 20,

        /// <summary>
        /// Power Wash
        /// </summary>
        [EnumMember]
        AutomaticRedeployment = 21,

        /// <summary>
        /// Revoke all iOS Vpp licenses
        /// </summary>
        [EnumMember]
        RevokeAppleVppLicenses = 22,

        /// <summary>
        /// Play Lost Mode sound
        /// </summary>
        [EnumMember]
        PlayLostModeSound = 23,

        /// <summary>
        /// Revoke all iOS Vpp licenses
        /// </summary>
        [EnumMember]
        Rename = 24,

        /// <summary>
        /// The set pin action
        /// </summary>
        [EnumMember]
        SetPinAction = 25,

        /// <summary>
        /// The save device location
        /// </summary>
        [EnumMember]
        SaveDeviceLocation = 26,

        /// <summary>
        /// The bypass activation lock
        /// </summary>
        [EnumMember]
        BypassActivationLock = 27,

        /// <summary>
        /// The request remote assistance
        /// </summary>
        [EnumMember]
        RequestRemoteAssistance = 28,

        /// <summary>
        /// The synchronize device
        /// </summary>
        [EnumMember]
        SyncDevice = 29,

        /// <summary>
        /// The set device name
        /// </summary>
        [EnumMember]
        SetDeviceName = 30,

        /// <summary>
        /// Reset the device to its Anchor Point
        /// </summary>
        [EnumMember]
        TimeLoop = 31,

        /// <summary>
        /// Initiate Rotate BitLockerKeys
        /// </summary>
        [EnumMember]
        RotateBitLockerKeys = 32,

        /// <summary>
        /// Windows only. Set device name and reboot afterwards.
        /// </summary>
        [EnumMember]
        RenameAndReboot = 33,

        /// <summary>
        /// Macs only. Rotate file vault key.
        /// </summary>
        [EnumMember]
        RotateFileVaultKey = 34,

        /// <summary>
        /// CustomTextNotification.
        /// </summary>
        [EnumMember]
        CustomTextNotification = 35,

        [EnumMember]
        ProtectedWipe = 36,

        /// <summary>
        /// Macs only. Rotate personal recovery key submitted by IWUsers.
        /// </summary>
        [EnumMember]
        RotateUserSubmittedPersonalRecoveryKey = 37,

        /// <summary>
        /// Windows 10 - 19H2 (1909 devices) only. Request for diagnostics information.
        /// </summary>
        [EnumMember]
        RequestDiagnostics = 38,

        /// <summary>
        /// iOS only. Activate device eSIM for cellular devices.
        /// </summary>
        [EnumMember]
        ActivateDeviceEsim = 39,

        /// <summary>
        /// Chromebook only, removes device from management. Only applicable for deivces in Active, Delinquent, or Disabled status.
        /// This requirement is enforced in StatelessChromebookSyncService.
        /// </summary>
        [EnumMember]
        Deprovision = 40,

        /// <summary>
        /// Chromebook only, prevents user from using device. Only applicable for deivces in Active status.
        /// This requirement is enforced in StatelessChromebookSyncService.
        /// </summary>
        [EnumMember]
        Disable = 41,

        /// <summary>
        /// Chromebook only, enables user to use device. Only applicable for deivces in Disabled status.
        /// This requirement is enforced in StatelessChromebookSyncService.
        /// </summary>
        [EnumMember]
        Reenable = 42,

        /// <summary>
        /// Chromebook only, move device to a new organizational unit path.
        /// </summary>
        [EnumMember]
        MoveDeviceToOrganizationalUnit = 43,

        /// <summary>
        /// Windows only. Remove a device from DFCI management
        /// </summary>
        [EnumMember]
        RemoveDFCIManagement = 44,

        /// <summary>
        /// Windows only. Performs MDM key recovery with TPM attestation if device is capable.
        /// </summary>
        [EnumMember]
        InitiateMDMKeyRecovery = 45,

        /// <summary>
        /// Windows only. Remote Help Launch
        /// </summary>
        [EnumMember]
        RemoteHelpLaunch = 46,

        /// <summary>
        /// Windows only. On Demand Proactive Remediation
        /// </summary>
        [EnumMember]
        OnDemandProactiveRemediation = 47,

        /// <summary>
        /// Windows only.  A manual rotation for the local admin password on the device
        /// </summary>
        [EnumMember]
        RotateLocalAdminPassword = 48,

        /// <summary>
        /// All platforms. Currently supported for Android, iOS
        /// </summary>
        [EnumMember]
        RemovePayloads = 49,

        /// <summary>
        /// Windows devices only. Puase configuration refresh for a period of time
        /// </summary>
        PauseConfigurationRefresh = 50,

        /// <summary>
        /// This action is meant for all platforms. Currently supported for Windows, iOS. 
        /// Helps invoke device attestation for the device that's checking in to the system.
        /// </summary>
        InitiateDeviceAttestation = 51,

        /// <summary>
        /// Delete
        /// </summary>
        Delete = 52,
    }

    /// <summary>
    /// Device action state
    /// </summary>
    [DataContract]
    public enum ActionState
    {
        /// <summary>
        /// The none
        /// </summary>
        [EnumMember]
        None = 0,

        /// <summary>
        /// Action pending
        /// </summary>
        [EnumMember]
        Pending = 1,

        /// <summary>
        /// Action cancelled
        /// </summary>
        [EnumMember]
        Cancel = 2,

        /// <summary>
        /// Action active
        /// </summary>
        [EnumMember]
        Active = 3,

        /// <summary>
        /// Action done
        /// </summary>
        [EnumMember]
        Done = 4,

        /// <summary>
        /// Action failed
        /// </summary>
        [EnumMember]
        Failed = 5,

        /// <summary>
        /// Action not supported
        /// </summary>
        [EnumMember]
        NotSupported = 6   
 }
    ```


