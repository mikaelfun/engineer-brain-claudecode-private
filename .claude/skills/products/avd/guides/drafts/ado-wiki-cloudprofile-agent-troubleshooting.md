---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Windows 365 Frontline/Frontline Shared/User Experience Sync/Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FFeatures%2FWindows%20365%20Frontline%2FFrontline%20Shared%2FUser%20Experience%20Sync%2FTroubleshooting"
importDate: "2026-04-05"
type: troubleshooting-guide
---

[[_TOC_]]

## Install or Update Agent

### Identify the root-cause

The ICM incident may include a **workflowId** linked to the install or update operation, or it may have been forwarded to us because the initial investigation by CDP Core OCE suggests the issue is related to CloudProfile.

The query returns all events related to installing or updating the CloudProfile agent. Look for an error log immediately preceding a log entry that contains cloudprofile/InstallCloudProfileAgentV1Composer. This composer is responsible for installing or updating the agent, so any failure will appear above this entry. Additionally, the log entry with cloudprofile/InstallCloudProfileAgentV1Composer will include a Tag where the Status is marked as failed.

### Possible Root-causes

- The install or update can fail when creating the vm-extension to run the script.
- The script execution in the VM can also fail, this reported with error code "VirtualMachineVmExtensionScriptFailure".
- The CDAgent may fail to run the msi to install or update the agent.

### Mitigation

#### Fail to Create VM-Extension

If RCA indicates the failure occurred because the workflow step could not create the VM extension on the device to run the script, take these actions:
- **Install Operation**: Contact CDP Core OCE. The issue may be due to the device not being fully provisioned. Agents cannot be installed on devices that are not fully provisioned.
- **Update Operation**: The device already has the agent, but the update failed because the device is in an unhealthy state. Action: Restart the device using this [guide](https://eng.ms/docs/experiences-devices/wd-windows/wcx/avd/azure-virtual-desktop/cdp-cloud-profile-service/servicetroubleshooting/tsg_service_002_6).

#### VirtualMachineVmExtensionScriptFailure

This error means the script responsible for installing the agent either did not execute or failed during execution on the device.

## Enable Crash Dumps

Download the latest crash dump configuration script from the CloudProfiles repository:
- [EnableDump.ps1](https://dev.azure.com/microsoft/RDV/_git/CloudProfiles?path=/build/scripts/EnableDump.ps1)

### Configure the Host

Run the following PowerShell commands to enable crash dumps:

```powershell
$Script = "<path>\<to>\<script>\EnableDump.ps1"
$DumpFolder = "C:\CrashDumps"
& "$Script" -ImageName "cldprof.exe" -DumpFolder $DumpFolder -DumpType "Full"
```

### Collect Crash Dumps

1. Monitor the `$DumpFolder` for `.DMP` files.
2. When crash dumps are available, zip the entire `$DumpFolder`.
3. Share the ZIP file with the Cloud Profile Agent team (SaaF > ICM)

## Kusto

Use Prod through Azure Data Explorer or Kusto App by adding the following connection strings:
- **Non-EU regions**: https://cdp-gds-global-prod.eastus.kusto.windows.net
- **EU regions**: https://cdp-gds-eudb-prod.northeurope.kusto.windows.net

### Finding Common Identifier

You will need identifiers such as CollectionId, UserProfileId, CloudDeviceId and UserId to better troubleshoot issues.

### Finding CollectionId in PlatformResourceName (PRN) format

#### Using CDP Data Entity Kusto Cluster

```kql
union isfuzzy=true cluster('cluster-name').database('cpsdata-entityData').["clouddevicecollectiondata*CloudDeviceCollectionsV1"]
| where Name has "Assignment name (Collection Name)"
| project CloudDeviceCollectionId, Name
```

**Note:** Replace cluster-name with the appropriate Kusto cluster name based on your region (EU or NonEU).

### Finding UserId (ObjectId) using UserName or AccountName

#### Method 1: Using Intune Management Portal

1. Connect to Management Portal
2. Click on `Users` menu item
3. Start typing the User display name or Principal name
4. Select the User from the result list
5. The UserId (ObjectId) will be located in the Overview page

### Finding UserProfileId in PlatformResourceName format

#### Using CDP Data Entity Kusto Cluster

```kql
union isfuzzy=true cluster('cluster-name').database('cpsdata-entityData').["cloudprofiledata*CloudProfile"]
| where UserId == "<userid>"
| project CloudProfileId, UserId, CollectionId
```

### Finding CloudDeviceId and SessionHostName

#### Method 1: Using CDP Diagnostic Kusto Cluster

```kql
ServiceEvent
| where ServiceName == "azurevirtualdesktoprm"
| where EventIdName == "AddDeviceToHostPool"
| where Tags has "<cloud-pc-name>"
| extend json_tags = parse_json(Tags)
| extend CloudDeviceId = tostring(json_tags.CloudDeviceId)
| project CloudDeviceId
```

#### Method 2: Using CDP Data Entity Kusto Cluster

**NonEU Regions:**
```kql
union isfuzzy=true cluster('<cluster-name>').database('avdrmdata-entityData').["azurevirtualdesktoprmdata*DeviceV1"]
| where SessionHostName contains "<cloud-pc-name>"
```

**EU Regions:**
```kql
union isfuzzy=true cluster('<cluster-name>').database('avdrmdata-entityData').["azurevirtualdesktoprmdata*DeviceV1"]
| where SessionHostName contains "<cloud-pc-name>"
```

Finding CloudDeviceId from Hostname:

```kql
union isfuzzy=true cluster('<cluster-name>').database('avdrmdata-entityData').["azurevirtualdesktoprmdata*DeviceV1"]
| where CloudDeviceId == "<deviceid>"
| project-reorder SessionHostName
```

### Suggested Kusto Queries - Profile Load Performance

```kql
cluster("rdsprod.eastus2.kusto.windows.net").database("WVD").RDCloudProfileTrace
| union cluster("rdsprodus.eastus2.kusto.windows.net").database("WVD").RDCloudProfileTrace
| union cluster("rdsprodeu.westeurope.kusto.windows.net").database("WVD").RDCloudProfileTrace
| union cluster("rdsprodgb.uksouth.kusto.windows.net").database("WVD").RDCloudProfileTrace
| union cluster("rdsprodca.canadacentral.kusto.windows.net").database("WVD").RDCloudProfileTrace
| union cluster("rdsprodjp.japaneast.kusto.windows.net").database("WVD").RDCloudProfileTrace
| union cluster("rdsprodau.australiaeast.kusto.windows.net").database("WVD").RDCloudProfileTrace
| union cluster("rdsprodin.centralindia.kusto.windows.net").database("WVD").RDCloudProfileTrace
| union cluster("rdsprodsa.southafricanorth.kusto.windows.net").database("WVD").RDCloudProfileTrace
| where HostInstance == "<session-host-name>"
| where TIMESTAMP > ago(7d)
| where EventId == 6
| extend OperationName = extract('Name="([^"]+)"', 1, Message)
| extend ErrorCode = extract('ErrorCode="([^"]+)"', 1, Message)
| extend ElapsedMs = toint(extract('ElapsedMs="([^"]+)"', 1, Message))
| where OperationName in ("WaitForDisk", "WaitForDiskAttach", "PrepareDisk", "Logon", "AddProfilePathRedirection", "ProfileListImport", "AppxPackageRegistration", "StartShell")
| extend Stage = case(
  OperationName in ("WaitForDiskAttach", "WaitForDisk"), "1. Disk Attach",
  OperationName == "PrepareDisk", "2. Disk Prepare",
  OperationName in ("ProfileListImport", "AddProfilePathRedirection"), "3. Profile Setup",
  OperationName == "Logon", "4. User Logon",
  OperationName in ("AppxPackageRegistration", "StartShell"), "5. Shell Start",
  "Other"
)
| summarize
  Operations = make_list(OperationName),
  TotalTimeMs = sum(ElapsedMs),
  MaxTimeMs = max(ElapsedMs),
  AllSuccessful = iff(countif(ErrorCode != "0") == 0, "All Passed", "Errors Found")
  by Stage, ActivityId
| extend TotalTimeSec = round(TotalTimeMs / 1000.0, 2)
| project Stage, Operations, TotalTimeSec, MaxTimeMs, AllSuccessful
| order by Stage asc
```

### Regular Timings Reference

| Stage | Typical Duration | Notes |
|-------|-----------------|-------|
| 1. Disk Attach | ~12.9s | Expected, Azure managed disk attachment |
| 2. Disk Prepare | ~0.15s | Fast |
| 3. Profile Setup | ~0.16s | Very fast, profile already exists |
| 4. User Logon | ~8.2s | Normal Windows logon time |
| 5. Shell Start | ~8.7s | App registration and shell startup |
