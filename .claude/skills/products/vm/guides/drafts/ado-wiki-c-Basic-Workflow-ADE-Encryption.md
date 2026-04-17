---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Encryption/Workflows/Azure Disk Encryption (ADE)/Basic Workflow_ADE_Encryption"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Encryption%2FWorkflows%2FAzure%20Disk%20Encryption%20(ADE)%2FBasic%20Workflow_ADE_Encryption"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# ADE Basic Workflow

## Initial Data Collection

1. Review Customer verbatim for minimum required details
2. Check approval to collect Guest OS Logs (GrantPermission variable)
3. Permission to collect logs:
   - If granted: run Inspect IaaS against VM(s) (may fail if OS disk encrypted)
   - If NOT granted: proceed with manual collection
4. Required info: Subscription Id, Region, Resource Group, VM Name, VM Size, time of encryption attempt
5. Linux VMs: additionally need distro/version and boot diagnostics if VM fails to boot

## Scoping Questions

1. Date/Time issue first observed
2. Has VM been encrypted before?
3. Impact of the problem
4. Is VM Hardened/Custom Image?
5. Has same process been tried on another VM?
6. Changes made before issue occurred
7. Method of enabling encryption (PS, CLI, Portal, other) + steps/commands + guide followed
8. Error messages received
9. Has CX rebooted VM before encryption completed?

## Log Collection - Windows

1. Disk management screenshot (all disks/volumes)
2. Bitlocker state: manage-bde -status, manage-bde -protectors -get C:
3. AzureDiskEncryption extension logs: C:\WindowsAzure\Logs\Plugins\Microsoft.Azure.Security.AzureDiskEncryption
4. AzureDiskEncryption extension config: C:\Packages\Plugins\Microsoft.Azure.Security.AzureDiskEncryption\RuntimeSettings
5. Bitlocker event logs: Microsoft-Windows-BitLocker%4BitLocker Management.evtx, DrivePreparationTool%4Operational.evtx

## Log Collection - Linux

1. Commands: cat /etc/os-release, lsblk, lsblk -f, cat /etc/fstab, df -h, blkid, cat /etc/crypttab
2. ADE Single-Pass logs: /var/log/azure/Microsoft.Azure.Security.AzureDiskEncryptionForLinux/extension.log
3. ADE Dual-Pass logs: /var/log/azure/Microsoft.Azure.Security.AzureDiskEncryptionForLinux/*/extension.log
4. Extension configs: /var/lib/waagent/Microsoft.Azure.Security.AzureDiskEncryptionForLinux-*/config/*.settings
5. Internal configs: /var/lib/azure_disk_encryption_config/
6. Azure Linux Agent Logs: /var/log/waagent.log

## Escalation Process

### ADE Windows
1. Teams Channel: Azure Disk Encryption channel
2. Email: adesup@microsoft.com
3. ICM to Azure Disk Encryption team (sev 2 for prod down with TA/SME approval, else sev 3)
4. Follow up: adeteam@microsoft.com + adesup@microsoft.com

### ADE Linux
1. Teams Channel: Azure Disk Encryption channel
2. Email: adesup@microsoft.com
3. Create collaboration task with Linux Escalation team (they handle ICM creation)
