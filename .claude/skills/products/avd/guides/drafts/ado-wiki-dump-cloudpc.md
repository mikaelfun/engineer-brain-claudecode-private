---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Tools and Data Collection/Dump Cloud PC"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FTools%20and%20Data%20Collection%2FDump%20Cloud%20PC"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Cloud PC / AVD Dump Collection Scenarios

## Scenario 1: Cloud PC/VM No Boot or Stuck on Restarting
- **Cause**: Azure Host level changes (e.g., VMs in certain Cluster/Host version)
- **Action**: Engage **RDOS DRI (OCE)** to capture dump via IcM
- **Method**: FcShell/Orb to Watson. See: How To: Capture a memory dump of a running container
- **Pre-requisites**: Get NodeId, ContainerId, VMId from CPCD Tool or Kusto:
```kql
cluster('azurecm.kusto.windows.net').database('AzureCM').LogContainerSnapshot
| where PreciseTimeStamp between (_startTime .. _endTime)
| where virtualMachineUniqueId has_any (vmid)
| project PreciseTimeStamp, nodeId, containerId, virtualMachineUniqueId, AvailabilityZone, Region
```
- **AVD**: Can leverage Serial Console to check VM first

## Scenario 2: Application Crash in Booted Cloud PC
- Ask end user to collect dump via Windows Error Reporting: Collecting User-Mode Dumps
- Share dump file via DTM
- **AVD**: Same, or use Diagnostic Settings > Crash Dumps

## Scenario 3: Windows App Dependencies Hang/Crash
- Ask end user to capture dump via Task Manager (right-click process > Create dump file)
- If crashed, follow Scenario 2 from client machine
- **AVD**: Same approach

## Scenario 4: Cloud App (App Streaming) Hang/Crash
- Still under discussion for CPC
- **AVD**: Connect to session host or use Diagnostic Settings > Crash Dumps

## Dump Solutions Reference
| Solution | Applies To | Dump Store |
|----------|-----------|------------|
| Diagnostic Settings - Crash Dumps | All Azure Windows VMs (AVD only, not CPC) | Azure Storage Container |
| Fleet Diagnostic (FD) | 1P Azure VM/VMSS only | Watson DiagSpaces VM |
| Get More Data (GMD) | All Windows client/server VMs | Watson |

Note: Previous Fabric Control dump method unavailable since FC deprecation (May 2023).
