---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box Disk/Disk Validation/Generic \"Access Denied\" Error When Using Data Box Disk Validation Tool"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=/Azure%20Data%20Box%20Disk/Disk%20Validation/Generic%20%22Access%20Denied%22%20Error%20When%20Using%20Data%20Box%20Disk%20Validation%20Tool"
importDate: "2026-04-05"
type: troubleshooting-guide
---

## Access Denied error during checksum/Prepare to Ship phase

### Overview
When running the Validation Tool on an Azure Data Box Disk, you might receive an 'Access Denied' error during the checksum or Prepare to Ship phase.

### Cause
Several issues could cause this error. Follow the steps in the Resolution section to investigate and resolve the problem.

## Common issues and solutions

### Investigate permission issues
Confirm that the permissions of the Azure Data Box Disk are correct.

### Step-by-step instructions

#### Confirm permissions
1. Run the script again from PowerShell as an Administrator.

2. Check if `Everyone` is listed under 'Group or user names:' Navigate to the share/folder or file properties in the security tab.

If not, add it with full permissions. After making this change, re-run the Validation Tool.
   - Note: If this change doesn't resolve the issue, you can undo it by removing the `Everyone` user.

#### Check folder attributes
1. Run the command `attrib Drive_Letter:\Folder_Name` in `command prompt`.
2. Provide a screenshot of the output to get an accurate view of the attributes present on the device.

#### Verify data type and origin
1. Determine the type of data copied onto the Azure Data Box Disk and its origin (e.g., `.bak`, SQL backups, etc.).

#### Run Validation Tool on another machine
1. Ask the customer to try running the Validation Tool on another machine.
   - Note: Ensure the disk is unlocked on the other machine before attempting to run the Validation Tool.

### Check status of previous Validation Tool runs
If there are no issues with the permissions or attributes, gather further information by checking the status of previous Validation Tool runs.

1. From a PowerShell session run as an Administrator, change the directory to that of the Azure Data Box Disk. For example, if the disk is mounted as the E drive, run:

    ```bash
    cd E:
    ```

2. Run the Data Box Disk tool with the argument `-?` to list options:

    ```bash
    E:\DataBoxDiskImport\WaImportExport.exe -?
    ```

This will list options to run the executable, which is called internally by the Validation Tool. Use these options to see the status of previous runs and any generated logs.

### Collect a private binary file for debugging (WaImportExportV1)
1. Share the private binary (WaImportExportV1) with the customer. It can be found here: `\hcsfs\support\WaimportExport_debug`.
2. Once downloaded and unzipped, have the customer run the following command from a PowerShell session run as an Administrator:

    ```bash
    <Drive_Letter>:\DataBoxDiskImport\WaImportExport.exe PrepImport /BlobType:<Blob_Type> /j:<Drive_Letter>:\journal.jrn /skipwrite /dstdir:/ /silentmode /databoxdisk /bk:<Bitlocker_Key> /t:<Drive_Letter> /id:afsession /srcdir:<Drive_Letter>:<BlobType>
    ```

### Open an IcM
If all troubleshooting efforts are exhausted, gather all information and create an IcM for the PG team to troubleshoot further.

1. Collect the Azure Data Box Disk logs located at `Drive:\DataBoxDiskImport\logs`.
2. Upload the logs to `\hcsfs\support\DataBoxDisk<SupportRequest_CustomerCompanyName>`.
3. Use the IcM template [here](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=Dw1DfG) to create an IcM.
4. Include the troubleshooting steps performed and the paths for the debugging logs and Azure Data Box Disk logs in the notes for analysis by PG.
