# VM/Compute EEE to PG ICM Transfer Destinations

**Source**: Mooncake POD Support Notebook > VM > Process > Transfer Destinations
**Source of Truth for CSS Verticals**: [Ownership Areas Per Vertical](https://microsoft.sharepoint.com/teams/AzureIaaSVMTAsandManagers/Shared%20Documents/Vertical%20Model/Ownership%20Areas%20Per%20Vertical.xlsx?web=1)

## Primary Transfer Mapping

| EEE Queue | Component | Engineering ICM Queue |
|-----------|-----------|----------------------|
| Support\EEE AKS | AKS | Azure Kubernetes Service\RP |
| Support\EEE AKS | ACR | Azure Container Registry\Triage |
| Support\EEE ARM | Managed Applications | Azure Resource Manager\Azure Managed Applications |
| Support\EEE ARM | ARM | Azure Resource Manager\Azure Resource Manager |
| Support\EEE AzureRT | CRP | AzureRT\CRP Core Service* |
| Support\EEE AzureRT | Disk RP | AzureRT\DiskService |
| Support\EEE AzureRT | PaaS | AzureRT\GA/PaaS/Storage* |
| Support\EEE AzureRT | IaaS (Classic), KMS proxy | AzureRT\IaaS |
| Support\EEE AzureRT | SDK/PS/CLI (Compute) | AzureRT\Networking/SDK/PowerShell |
| Support\EEE AzureRT | PIR | AzureRT\CRP-PIR |
| Support\EEE AzureRT | VMSS | AzureRT\ScaleSetService |
| Support\EEE AzureRT | KMS hosts | IMAGINGPROD\KMS |
| Support\EEE Compute Manager | Compute Manager | COMPUTEMANAGER\TenantController(AzTec)LowPriRotation |
| Support\EEE GA/PA | Guest Agent | AzureRT\GuestAgent* |
| Support\EEE GA/PA | Extensions | AzureRT\Extensions* |
| Support\EEE GA/PA | WinPA | CSD CFE\HCCompute-WindowsPA |
| Support\EEE RDOS | RDOS | ONEFLEETNODE\AzureHost-Agent-Sev-3-4 |

*\* = Geneva automation enabled (auto-move CRIs from PG to EEE if created directly against PG)*

## Other Components (No EEE Queue)

| Component | Engineering ICM Queue |
|-----------|----------------------|
| Guest OS - Windows | WSD CFE\HCCompute-Guest OS Health / CSD CFE\CSD Triage |
| Guest OS - Linux | EOSG Linux\Triage |
| Marketplace | MARKETPLACE\MarketplaceStoreAPI |
| Portal (VM) | AZUREIAASEXPERIENCES\Triage |
| WACAP | WACAP\IncidentManager |
| NRP | CLOUDNET\NRP |
| OMS Extension | AZURELOGANALYTICS\OMSLinuxAgent |
| WAD/IaaSDiagnostic | AZUREDIAGNOSTICS\WAD |
| Azure Policy | AZUREPOLICY\Triage |
| WinFab | WINDOWSFABRIC\WindowsFabricService |
| ACR | AZURECONTAINERREGISTRY\Triage |

## Notes
- EEE AzureRT does NOT debug W3WP.exe process dumps; Azure Dev POD should assign collab to **MSaaS Developer Web Apps** using path: `Developer Tools/ASP.NET/ASP.NET on .NET Framework 4.8/Problem Displaying Page, Not Responding, or Crash/Crash`
- WSD CFE\HCCompute-Guest OS Health confirmed for IaaS Windows guest OS escalations (confirmed 2021-12-06)

## Top ICM Destinations by Volume (90-day snapshot, 2023-03)

Top 10: AKS RP (187), CRP Core (46), Host Storage (30), VMSS (26), WinCloudServerDev (26), DiskService (23), Blackbird (14), Deployments (13), Container Instance (12), ARM (10)
