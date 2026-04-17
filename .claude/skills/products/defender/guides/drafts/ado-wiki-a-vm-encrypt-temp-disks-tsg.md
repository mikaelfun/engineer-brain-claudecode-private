---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Recommendations and remediation/Server (Compute) Recommendations/[Troubleshooting Guide] - Virtual machines should encrypt temp disks caches and data flows between Compute and Storage resources"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FRecommendations%20and%20remediation%2FServer%20(Compute)%20Recommendations%2F%5BTroubleshooting%20Guide%5D%20-%20Virtual%20machines%20should%20encrypt%20temp%20disks%20caches%20and%20data%20flows%20between%20Compute%20and%20Storage%20resources"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# TSG: Virtual Machines Should Encrypt Temp Disks, Caches, and Data Flows

> **Note:** This recommendation is on a [deprecation path](https://learn.microsoft.com/en-us/azure/defender-for-cloud/upcoming-changes#deprecation-of-encryption-recommendation) and will be replaced by [Unified Disk Encryption recommendations](https://learn.microsoft.com/en-us/azure/defender-for-cloud/upcoming-changes#general-availability-of-unified-disk-encryption-recommendations).

## Policy Details

| Recommendation | Policy ID | Assessment Key |
|---|---|---|
| Windows: "Windows machines should encrypt temp disks, caches, and data flows between Compute and Storage resources" | 3dc5edcd-002d-444c-b216-e123bbfa37c0 | 0cb5f317-a94b-6b80-7212-13a9cc8826af |
| Linux: "Linux virtual machines should enable Azure Disk Encryption or EncryptionAtHost" | ca88aadc-6e2b-416c-9de2-5a0f01d1693f | a40cc620-e72c-fdf4-c554-c6ca2cd705c0 |
| Old combined (deprecated May 2024): "Virtual machines should encrypt temp disks, caches, and data flows" | 0961003e-5a0a-4549-abde-af6a37f2724d | d57a4221-a804-52ca-3dea-768284f06bb7 |

## Encryption Types

### Azure Disk Encryption (ADE)
- Applied via VM Extension (`AzureDiskEncryption` for Windows, `AzureDiskEncryptionForLinux` for Linux)
- Check via PowerShell: `Get-AzVMExtension -ResourceGroupName "{RG}" -Name "{VMName}"`
- Check via Portal: VM → Extensions + Applications

### Host-based Encryption (HBE)
- Check via PowerShell:
  ```powershell
  $vm = Get-AzVM -ResourceGroupName "{ResourceGroup}" -Name "{VirtualMachineName}"
  $vm.SecurityProfile.EncryptionatHost
  ```
- Check via Portal: VM Overview → Security Profile

> ⚠️ **ADE and HBE are mutually exclusive.** Cannot enable both simultaneously. Do not enable HBE on a VM that previously used ADE.

## When is a VM 100% Compliant?

**Windows (ADE):**
- OS disk + all data disks encrypted
- Only exemptions: System Reserved partition, BEK volume

**Linux (ADE):**
- OS disk + all data disks encrypted
- Exemptions: Temporary disk, BEK volume, unsupported filesystem types

**Checking encryption status:**
- Windows: `manage-bde -status` (all disks except BEK should show "Used Space Encrypted")
- Linux: `lsblk` (all drives except BEK/temp disk should show `crypt` partition type)

## Unsupported Scenarios → Not Applicable

| Scenario | MDC Code | Reason |
|---|---|---|
| Basic VM size (Standard_A0, Standard_A1) | BasicSizedVirtualMachine | VM size not supported by ADE/HBE |
| Classic (non-ARM) VM | ClassicVirtualMachine | Classic VMs not supported |
| Unknown OS from IMDS | UnknownOsVirtualMachine | VM OS details missing in IMDS metadata |
| Kubernetes VM | KubernetesVirtualMachine | AKS VMs not supported |
| Databricks VM | DatabrickVirtualMachine | Databricks VMs not supported |
| Unsupported OS + unsupported size | UnsupportedOsVirtualMachine | OS image not in ADE supported list AND size not supported by HBE |
| Ultra-disks attached | UltraDisksVirtualMachine | Ultra disks not supported |
| Confidential VM (CVM) | ConfidentialVMNotSupported | CVMs not supported |

**Finding the NA reason via Kusto:**
```kusto
cluster('Romelogs.kusto.windows.net').database('Prod').FindAdeDataByPartialVmId('<VMname or ResourceId>')
```
Look at `encryptionSupport:classification` value.

## Unhealthy Scenarios

**Windows:**
| Scenario | Guest Config Code | Reason Phrase |
|---|---|---|
| Not encrypted at all | MissingADEandHBE | VM should be encrypted with HBE or ADE |
| Partial ADE (some data disks unencrypted) | VMIsNotFullyEncrypted | Data disks not encrypted: (disk list) |
| ADE extension removed after encryption | ADEExtensionNotFoundOntheVM | Drives locally encrypted but ADE extension not found |

**Linux:**
| Scenario | Guest Config Code | Reason Phrase |
|---|---|---|
| Not encrypted at all | MissingADEandHBE | VM should be encrypted with HBE or ADE |
| OS disk not encrypted | OSDiskNotEncrypted | OS disk is in an unencrypted state |
| Partial ADE (some data disks unencrypted) | VMIsNotFullyEncrypted | Data disks not encrypted: (disk list) |

## Kusto Queries

**Public cloud - check encryption data:**
```kusto
cluster('romelogs.kusto.windows.net').database('Prod').FindAdeDataByPartialVmId('{subscriptionId}')
| summarize arg_max(env_time, *) by vmId
```

**Legacy ADE query:**
```kusto
cluster("Romelogs").database("Prod").DynamicWithSubscriptionOE
| where env_time > ago(1d)
| where operationName == "GetEncryptionData"
| where customData has "{subscriptionId}"
| extend customObject = parse_json(customData)
| project customObject, env_time
| evaluate bag_unpack(customObject)
| evaluate bag_unpack(encryptionSupport)
| summarize arg_max(env_time, *) by vmId
```

## Finding Supported Linux Images
[AzureDiskEncryptionImageList.json](https://dev.azure.com/msazure/One/_git/Rome-Defenders-Gateway?path=/src/Common/Rome/CoreCommon/Compute/AzureDiskEncryptionImageList.json)

## References
- [Azure Disk Encryption for Linux VMs](https://learn.microsoft.com/azure/virtual-machines/linux/disk-encryption-overview)
- [Azure Disk Encryption for Windows VMs](https://learn.microsoft.com/azure/virtual-machines/windows/disk-encryption-overview)
- [Engineering TSG: Investigating ADE CRIs](https://dev.azure.com/msazure/One/_wiki/wikis/Rome%20Core%20Wiki/71247/TSG-Investigating-ADE-(Azure-Disk-Encryption)-CRIs)
