---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box/Connect & Copy/Metadata Preservation and Permissions Issues on Data Box"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Data%20Box%2FConnect%20%26%20Copy%2FMetadata%20Preservation%20and%20Permissions%20Issues%20on%20Data%20Box"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Troubleshooting Guide: Metadata and Permissions Issues on Data Box  
  
## Overview  
Upon completing data transfer to the Data Box, customers may notice that metadata such as ACLs, timestamps, and file attributes are not preserved. They may also encounter issues with editing or deleting data due to permission problems.  
  
## Common Issues and Solutions  
  
### Root Causes  
1. Metadata isn't preserved when transferring data to Blob Storage.  
2. Metadata such as `LastAccessTime`, `File_Attribute_Offline`, and `File_Attribute_Not_Content_Indexed` aren't transferred.  
3. ACLs aren't transferred during data copies over Network File System (NFS).  
4. ACLs aren't transferred when using the Data Copy service.  
5. User is not a backup operator or "Backup Operator Privileges" is disabled.  
6. "Enable ACLs for Azure Files" has been disabled.  
7. Preserved timestamps not reflected correctly in Azure Portal.  
  
### Step-by-Step Instructions  
  
#### Cause 1: Metadata Isn't Preserved When Transferring to Blob Storage  
- **Solution:**  
  - Transfer data to Azure Files instead of Blob Storage.  
  
#### Cause 2: Certain Metadata Not Transferred  
- **Solution:**  
  - This behavior is by design. Metadata such as `LastAccessTime`, `File_Attribute_Offline`, and `File_Attribute_Not_Content_Indexed` are not transferred.  
  
#### Cause 3: ACLs Not Transferred Over NFS  
- **Solution:**  
  - This behavior is by design. ACLs are not transferred during data copies over NFS.  
  
#### Cause 4: ACLs Not Transferred Using Data Copy Service  
- **Solution:**  
  - Use a copy tool such as Robocopy instead of the Data Copy service.  
  - Refer to the documentation: [Copying Data and Metadata](https://docs.microsoft.com/en-us/azure/databox/data-box-file-acls-preservation#copying-data-and-metadata)  
  
#### Cause 5: Backup Operator Privileges  
- **Solution:**  
  1. Ensure the user is part of the Backup Operator group.  
  2. Enable "Backup Operator Privileges" using the Web UI.  
  - Refer to the documentation: [Enable Backup Operator Privileges](https://docs.microsoft.com/en-us/azure/databox/data-box-local-web-ui-admin#enable-backup-operator-privileges)  
  
#### Cause 6: "Enable ACLs for Azure Files" Disabled  
- **Solution:**  
  - Enable ACLs for Azure Files to transfer metadata such as ACLs, file attributes, and timestamps.  
  - Refer to the documentation: [Enable ACLs for Azure Files](https://docs.microsoft.com/en-us/azure/databox/data-box-local-web-ui-admin#enable-acls-for-azure-files)  
  
#### Cause 7: Timestamps Not Reflected Correctly in Azure Portal  
- **Solution:**  
  - The timestamps shown in the Azure Portal are the REST Last Modified Timestamps. To see the preserved timestamps, mount the file share and view the files in Windows File Explorer.  
  - Refer to the documentation: [Data Box File ACLs Preservation](https://docs.microsoft.com/en-us/azure/databox/data-box-file-acls-preservation)  
  
## Public Documentation  
For more detailed information, please refer to the following resources:  
- [Copying Data and Metadata](https://docs.microsoft.com/en-us/azure/databox/data-box-file-acls-preservation#copying-data-and-metadata)  
- [Enable Backup Operator Privileges](https://docs.microsoft.com/en-us/azure/databox/data-box-local-web-ui-admin#enable-backup-operator-privileges)  
- [Enable ACLs for Azure Files](https://docs.microsoft.com/en-us/azure/databox/data-box-local-web-ui-admin#enable-acls-for-azure-files)  
