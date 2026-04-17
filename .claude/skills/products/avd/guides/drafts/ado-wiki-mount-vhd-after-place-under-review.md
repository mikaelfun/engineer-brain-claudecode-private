---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Cloud PC Actions/Place Cloud PC under review/Mount VHD on Azure VM after placing Cloud PC under review"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FFeatures%2FCloud%20PC%20Actions%2FPlace%20Cloud%20PC%20under%20review%2FMount%20VHD%20on%20Azure%20VM%20after%20placing%20Cloud%20PC%20under%20review"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Mount VHD on Azure VM after placing Cloud PC under review

## Summary

After placing a Cloud PC under review, the customer will likely want to find an easy way to access the data inside of the VHD.
This step might be useful to troubleshoot issues where the Cloud PC is no longer accessible.

## Resolution

1. **Identify the storage account** used to place the Cloud PC under review
   - Take note of the name, subscription, resource group, location and availability zone (if used)
   - Ensure that the performance is set to **Premium**, as recommended by requirements

2. **Create a managed disk** using the VHD in the storage account
   - Use the same subscription, resource group, location and availability zone as the storage account
   - Under source type, select **Storage blob** and browse the storage account and VHD
   - You may also change the size of the disk to match the size of the Cloud PC disk

3. **Mount as data disk** in a new or existing Azure VM
   - The Azure VM should be in the same subscription, resource group, location and availability zone as the storage account
   - Go to the VM's Disks settings and select **Attach existing disks** under Data disks
   - In the dropdown, select the disk created in step 2

4. **Boot the Azure VM** — the data disk should appear with a new drive letter

## More information

- Follow these instructions to place the Cloud PC under review: https://docs.microsoft.com/en-us/windows-365/enterprise/place-cloud-pc-under-review
