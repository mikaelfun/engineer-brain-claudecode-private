---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Servers/Vulnerability Assessment/Agentless scanning VM VA/Agentless disk scanning of Customer Managed Key (CMK) encrypted disks - agentless scanning of VM with disks encrypted using Customer Managed Key"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FWorkload%20Protections%2FDefender%20for%20Servers%2FVulnerability%20Assessment%2FAgentless%20scanning%20VM%20VA%2FAgentless%20disk%20scanning%20of%20Customer%20Managed%20Key%20(CMK)%20encrypted%20disks"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Agentless Scanning - Customer Managed Key (CMK) Encrypted Disks

## Overview

To enable CMK agentless scanning, assign the "Key Vault Crypto Service Encryption User" built-in role to the "Microsoft Defender for Cloud Servers Scanner Resource Provider" (App ID: **0c7668b5-3260-4ad0-9f53-34ed54fa19b2**) in Microsoft Entra.

- [Public docs: Enable agentless scanning for VMs](https://learn.microsoft.com/en-us/azure/defender-for-cloud/enable-agentless-scanning-vms)
- [Dashboard: Defender for Cloud - Agentless](https://dataexplorer.azure.com/dashboards/b831d367-1774-4024-88a4-6f890c030e84)

## Permission Assignment

Use the **[AddCmkPermissions PowerShell script](https://github.com/Azure/Microsoft-Defender-for-Cloud/blob/main/Powershell%20scripts/Agentless%20Scanning%20CMK%20support/AddCmkPermissions.ps1)**.

### Default (Subscription-Level RBAC)
- Assigns RBAC at subscription level; RBAC-enabled Key Vaults inherit automatically
- Detects access-policy-based Key Vaults (legacy) and suggests manual permissions
- Dry Run mode (`-DryRun`) available

### Alternative (Key Vault-Level)
- Use `-ApplyAtKeyVaultLevel` flag
- Interactive prompts per Key Vault

### Permissions by Key Vault Type

| Type | Required Permission |
|------|-------------------|
| **RBAC-Based Key Vault** | Key Vault Crypto Service Encryption User role |
| **Access Policies-Based (Legacy)** | Key Get, Key Wrap, Key Unwrap |
| **Managed HSM** | Managed HSM Crypto Service Encryption User role |

**Important:** Disk encryption set (DES) may reference a Key Vault in a different subscription. Run the script across all relevant subscriptions.

## Troubleshooting Steps

### Step 1: Determine Disk Encryption Type (ARG)
```kql
resources
| where type =~ 'microsoft.compute/disks'
| where managedBy contains "<resource ID>"
| extend Encryption = properties.encryption.type
| extend diskEncryptionSetId = properties.encryption.diskEncryptionSetId
| project name, Encryption, managedBy, diskEncryptionSetId
```
- If `diskEncryptionSetId` is null → customer is NOT using CMK

### Step 2: Identify the Key Vault (ARG)
```kql
resources
| where type =~ 'microsoft.compute/diskencryptionsets'
| where id contains "<diskEncryptionSetId>"
| extend sourceKeyVault = properties.activeKey.sourceVault.id
| project id, sourceKeyVault
```

### Debug Query: CMK Permission Issues
```kql
let values = FabricTraceEvent
| where env_time > ago(24h) and applicationName == "fabric:/DiskScanningApp"
| extend envcvprefix = substring(env_cv, 0, 38);
values | where message contains "Creating disk encryption set for disk"
| parse message with '[CreateDisksEncryptionSetAzureScanJobPreparationAction] job ' jobid ': Creating disk encryption set for disks ' disks '; source DiskEncryptionSetResourceId: ' diskEncSet
| join kind=leftouter (values
    | where message has "Processing scan ScanVmId" and message has "CleanupResources=True"
    | parse message with '[AzureScanJobResultProcessingStateMachine] Processing scan ScanVmId=' scanvmid 'JobId=' jobid) on $left.jobid == $right.jobid
| join kind=leftouter (values
    | where message contains "NoPermission" and message contains "[StateMachine]"
    | parse message with * "Message=" exceptionMsg ", Details" *) on $left.envcvprefix == $right.envcvprefix
| join kind=leftouter (values
    | where message contains "Creating AzureScanJobPreparationContext for job "
    | parse message with "[AzureScanJobPreparationContextFactory] Creating AzureScanJobPreparationContext for job " jobid " machine names: " machineNames) on $left.envcvprefix == $right.envcvprefix
| join kind=leftouter (values
    | where message has "[AzureJobsOrchestrationController] Allocated job with ID "
    | parse message with '[AzureJobsOrchestrationController] Allocated job with ID ' jobid '. Worker ID=/subscriptions/' workerSub '/resourceGroups/' workerRegion '/providers/Microsoft.Compute/virtualMachines/' workerVmssId) on $left.jobid == $right.jobid
| project env_time, env_cv, machineNames, diskEncSet=tolower(diskEncSet), success = isnotempty(message1), error = exceptionMsg, workerVmssId
```
