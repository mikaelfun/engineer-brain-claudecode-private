---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box Disk/Hardware & Unlock/The Media is Write Protected error on Azure Data Box Disk"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Data%20Box%20Disk%2FHardware%20%26%20Unlock%2FThe%20Media%20is%20Write%20Protected%20error%20on%20Azure%20Data%20Box%20Disk"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Can't Copy Data to Azure Data Box Disk — Write Protected Error

## Description / Overview
The customer ordered a Data Box Disk. After unlocking the unit, the customer got the following message:

"ERROR: The media is write protected. Exiting…"

The customer can see the disk contents but can't copy any data onto the disk due to a write-protected message.

## Troubleshooting and Tools

### Tools
Data Box Disk needs the Data Box Disk Unlock tool to unlock the device.

Make sure to follow the [documentation to unlock Data Box disks](https://learn.microsoft.com/en-us/azure/databox/data-box-disk-deploy-set-up?tabs=bitlocker%2Cwindows%2Ccentos).

### Troubleshooting Steps
* If you're using Robocopy, try to drag and drop a file using the file explorer to discard app-specific issues.
* Try the Data Box Disk unit on several devices to rule out host policies that might prevent copying to the disk.
* Connect another USB disk and check if read/write operations are available.
* Ensure you're running the machine with an admin account.
* Right-click and check properties of the folder on the Data Box Disk. If it doesn't have write permission enabled, try to enable it and see if that fails.
* Try to take ownership of the folders and see if that fixes the issue.
* Disable any present antivirus software.
* Launch the Command Prompt as Administrator, type the command `Diskpart`, and press Enter.
  * Type `list disk` and press Enter.
  * Find the drive number corresponding to your drive. The drive size will help you identify it.
  * Type `select disk N` (where N is the number of the disk that corresponds to the flash drive) and press Enter.
  * Type `attributes disk clear readonly` and press Enter.

If these steps don't work, create an ICM for further assistance from the Data Box Data Path engineering team.
