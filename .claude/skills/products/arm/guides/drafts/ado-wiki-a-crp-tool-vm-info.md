---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Components/Fabric Infrastructure/How Tos/CRP Tool to Fetch Internal VM Information (node ARM CRP Fabric power states)"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure Stack Hub/Components/Fabric Infrastructure/How Tos/CRP Tool to Fetch Internal VM Information (node ARM CRP Fabric power states)"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# CRP Tool to Fetch Internal VM Information (Azure Stack Hub)

CRP PowerShell cmdlets for CSS to query internal VM states, fetch VM IDs, and diagnose stamp down scenarios.

## Available Cmdlets

```powershell
# Query all VMs and VMScaleSets in a subscription
QueryCrpAdminEndpointBySubscription -SubscriptionId <subid> [-IncludeFabricInformation]

# Query a particular VM
QueryCrpAdminEndpointByVm -SubscriptionId <subid> -ResourceGroupName <rgName> -VmName <vmname> [-IncludeFabricInformation]

# Query a particular VMScaleSet
QueryCrpAdminEndpointByVmss -SubscriptionId <subid> -ResourceGroupName <rgName> -VmssName <vmssname> [-IncludeFabricInformation]
```

> **Warning**: `-IncludeFabricInformation` makes cluster and Hyper-V calls for every matching VM. Be careful if the stamp is WMI throttled and query may return 100+ VMs.

## Output Fields

| Field | Description |
|-------|-------------|
| InternalVmId | CRP/CPI VM ID (correlates with Hyper-V name and cluster group name) |
| IsManaged | Uses managed disks? |
| DesiredPowerState | CRP/ARM's expected power state |
| VMPowerState | CRP's cached power state from CPI |
| GoalSeekingState | Converged / Seeking / Failed |
| ClusterPowerState | Failover clustering's view (with -IncludeFabricInformation) |
| ClusterOwnerNode | Node where VM is located per failover clustering (with -IncludeFabricInformation) |
| HyperVVMPowerState | Hyper-V reported power state (with -IncludeFabricInformation) |

## Diagnostic Use Cases

```powershell
# VMs on a suspected bad node
QueryCrpAdminEndpointBySubscription -SubscriptionId <subid> -IncludeFabricInformation |
  Where-Object { $_.ClusterOwnerNode -eq <suspectedbadnode> }

# VMs where power state doesn't match desired
QueryCrpAdminEndpointBySubscription -SubscriptionId <subid> -IncludeFabricInformation |
  Where-Object { $_.DesiredPowerState -eq "Running" -and ($_.VMPowerState -ne "Running" -or $_.ClusterPowerState -ne "Online" -or $_.HyperVVMPowerState -ne "Running") }

# VMs where cluster or Hyper-V fetching failed
QueryCrpAdminEndpointBySubscription -SubscriptionId <subid> -IncludeFabricInformation |
  Where-Object { $_.DesiredPowerState -ne "Deallocated" -and ($_.ClusterPowerState -like "*Error*" -or $_.HyperVVMPowerState -like "*Error*") }
```

## Setup

Script located at: `\\ecg\azurestack\CPS\Data\lamolley\CrpAdminEndpointHelpers\CrpAdminEndpointHelpers.ps1`

Run from **unlocked PEP session** — either copy the file and dot-source it, or paste the full script content.
