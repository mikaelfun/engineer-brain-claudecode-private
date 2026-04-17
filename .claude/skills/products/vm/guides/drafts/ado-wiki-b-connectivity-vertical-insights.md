---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/Processes/Verticals & Subject Matter Experts (SMEs)/Connectivity Vertical Insights_Process"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FProcesses%2FVerticals%20%26%20Subject%20Matter%20Experts%20(SMEs)%2FConnectivity%20Vertical%20Insights_Process"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Connectivity Vertical Insights — ASC Diagnostic Checks

This page explains the diagnostic checks in Azure Support Center (ASC) that are relevant to the VM Connectivity vertical.

## Composite Can't RDP/SSH ASC Insight

### ContainerDeallocatedCheckBlock

#### IsVmNotDeallocated
- **Applies To**: Linux and Windows VMs
- **Explanation**: `IsVmNotDeallocated` is **false** if `CurrentPowerState` is **Deallocated** in CRP VM properties.
- **Source**: `VmNotDeallocatedSignalGenerator.cs`

### ContainerFunctioningCheckBlock

#### IsVmNotInFailedOrTransitionalState
- **Applies To**: Linux and Windows VMs
- **Explanation**: `IsVmNotInFailedOrTransitionalState` is **false** if container settings `StateModel` is **ContainerStateStopped**.
- **Source**: `VmNotInFailedStateSignalGenerator.cs`

#### IsVmStateRunning
- **Applies To**: Linux and Windows VMs
- **Explanation**: `IsVmStateRunning` is **true** if VM `StateModel` is **Converged**, `CurrentPowerState` is **Running**, and container `StateModel` is **ContainerStateStarted**.
- **Source**: `VmRunningSignalGenerator.cs`

### AzurePlatformNetworkCheckBlock

#### IsPlatformNetworkValidated
- **Applies To**: Linux and Windows VMs
- **Explanation**: `IsPlatformNetworkValidated` is **true** if both `IsNmProgrammingCompleteModel` and `IsNetworkAllocationCompleteModel` are true in container settings.
- **Source**: `PlatformNetworkSignalGenerator.cs`

### VscStateDataCheckBlock

#### IsVscStateDataValidated
- **Applies To**: Linux and Windows VMs
- **Explanation**: `VscStateDataCheckBlock` is **true** if both `VmHyperVIcHeartbeatData` and `isVscStateData` are true.
- **Source**: `VSCStateDataSignalGenerator.cs`

### ConsoleLogBlock

#### IsDHCPError
- **Applies To**: Linux VMs only
- **Explanation**: `IsDHCPError` is **true** if the serial log matches regex pattern: `(DoDhcpWork: Setting(.|\n)*ERROR:timeout: timed out)|(ERROR:timeout: timed out(.|\n)*DoDhcpWork: Setting)`
- **Source**: `ConsoleLogSignalGenerator.cs`, `SerialLogDetectionConfigv2.json`

#### IsHyperVProbeFailure
- **Applies To**: Linux VMs only
- **Explanation**: `IsHyperVProbeFailure` is **true** if the serial log matches regex pattern: `hv_\\S+: probe of \\S+ failed with error (-\\d+)`
- **Source**: `ConsoleLogSignalGenerator.cs`, `SerialLogDetectionConfigv2.json`

#### IsKernelMisconfiguration
- **Applies To**: Linux VMs only
- **Explanation**: `IsKernelMisconfiguration` is **true** if the serial log matches patterns indicating boot failure or kernel configuration issues (e.g., `Warning: Boot has failed`, `No root device found`).
- **Source**: `ConsoleLogSignalGenerator.cs`, `SerialLogDetectionConfigv2.json`
