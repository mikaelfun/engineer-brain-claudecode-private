---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Encryption/How Tos/Azure Disk Encryption (ADE)/Expand Encrypted OS Disk Partition in Windows_Encryption"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Encryption%2FHow%20Tos%2FAzure%20Disk%20Encryption%20(ADE)%2FExpand%20Encrypted%20OS%20Disk%20Partition%20in%20Windows_Encryption"
importDate: "2026-04-23"
type: guide-draft
---

# Expand Encrypted OS Disk Partition in Windows

## Summary

Steps for expanding an encrypted OS disk partition in Windows VM with ADE enabled.

## Instructions

1. Make a backup of the VM OS disk.
2. Deallocate the VM from Azure portal and expand the OS disk size. Then start it.
3. Login to the VM. In Disk Management tool, assign a drive letter to the reserved partition (350 MB). Example: assign drive letter H:.
4. Add the free space into H: drive, but leave at least 200 MB at the right end of the disk.
5. Create a new volume in the last unallocated partition and assign drive letter G: to it.
6. Run the following in elevated command prompt to copy BCD files:
   ```cmd
   bcdboot c:\windows /s G: /f UEFI
   ```
7. Expand the C: drive in Disk Management - extend into H: space.
8. Remove drive letters for G: and H:.
9. Reboot the VM.
10. Re-run ADE encryption to update encryption settings for the new partition layout.

## Important Notes

- Always create a backup before disk expansion
- Leave 200 MB reserved at end of disk for recovery partition
- After expansion, re-run ADE encryption to re-stamp settings
- Use LabBox for testing: deploy training VM with scenario built-in
