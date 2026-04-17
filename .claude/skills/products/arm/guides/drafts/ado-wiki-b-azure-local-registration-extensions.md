---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/Infrastructure/Azure Local Agents, Extensions and services/Azure Local Registration Extensions"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Disconnected%20Operations/Readiness/Infrastructure/Azure%20Local%20Agents,%20Extensions%20and%20services/Azure%20Local%20Registration%20Extensions"
importDate: "2026-04-06"
type: troubleshooting-guide
---

 Agents Deployed by Extensions  Validation and Inspection Guide
------------------------------------------------------------------

This article outlines how to identify, inspect, and validate agents deployed via VM extensions on Azure Stack HCI nodes. It includes PowerShell and Azure CLI commands to retrieve extension metadata, check service status, and parse deployment state files.

* * *

###  1. Enumerate Extensions from Node File System

To list all deployed extensions and inspect their state:

This command recursively searches for `state.json` files under the `C:\Packages\Plugins` directory, which contain metadata about each extension's deployment state.

```powershell
Get-ChildItem "C:\Packages\Plugins" -Recurse -Include state.json | 
  ForEach-Object {
    Write-Host "Extension: $($_.DirectoryName)"
    Get-Content $_.FullName | ConvertFrom-Json | Format-List
  }
```
```powershell
Extension: C:\Packages\Plugins\Microsoft.AzureStack.Observability.TelemetryAndDiagnostics\2.0.1.0


Blocked                     : False
EnableEndTelemetrySent      : True
ErrorMsg                    : 
Ext_output_size             : 10
ExtensionHash               : 739713B286988777E2A96B09447FDCB38909ED3E953F054A55341E5034B4EB14
ExtensionName               : AzureEdgeTelemetryAndDiagnostics
ExtensionState              : ENABLED
ExtensionVersion            : 2.0.1.0
IsMultiConfig               : False
MachineId                   : f0a1998b-e0b8-422f-8f54-cc19c6fed247
MultiConfigName             : 
MultiConfigPropertiesHash   : 
MultiConfigServiceRequestId : 
OldExtFormat                : False
ProcessingTime              : 0
Publisher                   : Microsoft.AzureStack.Observability
SequenceNumberFinished      : 0
SequenceNumberStarted       : 0
ServiceRequestId            : 7e6aff46-7e19-4055-bd80-01d72e20869a
Type                        : TelemetryAndDiagnostics
jobId                       : ab729c2c-eb6a-4256-ad14-bfd44ecbe3c7



Extension: C:\Packages\Plugins\Microsoft.AzureStack.Orchestration.LcmController\30.2411.0.706


Blocked                     : False
EnableEndTelemetrySent      : True
ErrorMsg                    :
Ext_output_size             : 12
ExtensionHash               : 5793669A94FFAD2F0DE42D3483B0D442B950F1DB8E77670D98B8C9279E984A7C
ExtensionName               : AzureEdgeLifecycleManager
ExtensionState              : ENABLED
ExtensionVersion            : 30.2411.0.706
IsMultiConfig               : False
MachineId                   : f0a1998b-e0b8-422f-8f54-cc19c6fed247
MultiConfigName             :
MultiConfigPropertiesHash   :
MultiConfigServiceRequestId :
OldExtFormat                : False
ProcessingTime              : 0
Publisher                   : Microsoft.AzureStack.Orchestration
SequenceNumberFinished      : 1
SequenceNumberStarted       : 1
ServiceRequestId            : 5f0e902e-0186-4c5a-83d5-34b40d8cc447
Type                        : LcmController
jobId                       : d94e48f3-8f01-461a-895e-db845559052c



Extension: C:\Packages\Plugins\Microsoft.Edge.DeviceManagementExtension\1.2408.0.3038


Blocked                     : False
EnableEndTelemetrySent      : True
ErrorMsg                    :
Ext_output_size             : 12
ExtensionHash               : E6C1252AAB7BDD800661FBE44BCAFC53F03E44DF4A07E6C44AD68878B4CEC8A9
ExtensionName               : AzureEdgeDeviceManagement
ExtensionState              : ENABLED
ExtensionVersion            : 1.2408.0.3038
IsMultiConfig               : False
MachineId                   : f0a1998b-e0b8-422f-8f54-cc19c6fed247
MultiConfigName             :
MultiConfigPropertiesHash   :
MultiConfigServiceRequestId :
OldExtFormat                : False
ProcessingTime              : 0
Publisher                   : Microsoft.Edge
SequenceNumberFinished      : 1
SequenceNumberStarted       : 1
ServiceRequestId            : 38d9ca05-4adb-4e13-a446-44ca5fd700fa
Type                        : DeviceManagementExtension
jobId                       : c862fd02-d19f-4b60-a28c-f2886fc50259
```

* * *

###  2. Query Extensions via Azure CLI

To retrieve extension metadata from Azure:
```powershell
az login --use-device-code
$AsHCI = Get-AzureStackHCI
$ResourceUri = $AsHCI.AzureResourceUri
$Subs = $ResourceUri.Split('/')[2]
$ResG = $ResourceUri.Split('/')[4]

az connectedmachine extension list `
  --machine-name $env:computername `
  --resource-group $ResG `
  --subscription $Subs `
  --output table
```
This command lists all extensions registered to the current machine in Azure Arc. (This command suppose to work in ALDO, however getting api versions error), alternatively we can se ethem from the portal

![image.png](/.attachments/image-ded018ed-f665-4464-b782-067b33e4e6aa.png)

* * *

###  3. Validate Extension Services on All Cluster Nodes

To verify that key services are running on each node:
```powershell
$cred = Get-Credential
$nodes = Get-ClusterNode

foreach ($node in $nodes){
    Write-Host "Node: $node" -ForegroundColor Cyan
    Invoke-Command -ComputerName $node -Credential $cred -ScriptBlock {
        Get-Service DeviceManagementService, LCMController, 'AzureStack Observability Agent' | Format-Table -AutoSize
    }
}
```
This checks the health of the following services:

*   `DeviceManagementService` (Microsoft.Edge.DeviceManagementExtension)
*   `LCMController` (AzureEdgeLifecycleManager)
*   `AzureStack Observability Agent` (AzureEdgeTelemetryAndDiagnostics)

![image.png](/.attachments/image-f1109642-8e4e-4fa3-a3f2-194bbacc323e.png)
* * *

###  4. Inspect Individual Extension State and Service Details from each node

For each extension, you can inspect the service and its associated `state.json`:

#### Device Management Service
```powershell
Get-WmiObject -Class Win32_Service | ? Name -eq "DeviceManagementService" | 
  Select Name, Caption, StartMode, State, Status, PathName, StartName, ProcessID | Format-List
$Status = (Get-ChildItem -Path C:\Packages\Plugins\Microsoft.Edge.DeviceManagementExtension -Recurse -Filter "*state.json*").FullName
Get-Content -Path $Status | ConvertFrom-Json
```
![image.png](/.attachments/image-943429f4-a191-46fd-b591-44cb1424e170.png)

#### Azure Edge Lifecycle Manager
```powershell
Get-WmiObject -Class Win32_Service | ? Name -eq "LcmController" | 
  Select Name, Caption, StartMode, State, Status, PathName, StartName, ProcessID | Format-List

$Status = (Get-ChildItem -Path C:\Packages\Plugins\Microsoft.AzureStack.Orchestration.LcmController -Recurse -Filter "*state.json*").FullName
Get-Content -Path $Status | ConvertFrom-Json
```
![image.png](/.attachments/image-2dc34138-d148-4aea-a066-2dd783557026.png)

#### Azure Edge Telemetry and Diagnostics
```powershell
Get-WmiObject -Class Win32_Service | ? Name -eq "LcmController" | 
  Select Name, Caption, StartMode, State, Status, PathName, StartName, ProcessID | Format-List

$Status = (Get-ChildItem -Path C:\Packages\Plugins\Microsoft.AzureStack.Orchestration.LcmController -Recurse -Filter "*state.json*").FullName
Get-Content -Path $Status | ConvertFrom-Json
```
![image.png](/.attachments/image-0a65cee8-60f1-4676-bf32-133224642860.png)