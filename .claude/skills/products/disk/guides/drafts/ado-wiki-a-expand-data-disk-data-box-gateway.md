---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box Gateway/Configure & Setup/Process to Expand Data Disk on Data Box Gateway"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Data%20Box%20Gateway%2FConfigure%20%26%20Setup%2FProcess%20to%20Expand%20Data%20Disk%20on%20Data%20Box%20Gateway"
importDate: "2026-04-05"
type: troubleshooting-guide
---

## Process to Expand Data Disk on Data Box Gateway

### Summary

Below is the process to expand the data disk in a Data Box Gateway virtual device.

> **IMPORTANT**: Expanding the **default data drive is NOT supported**. Doing so could result in unpredictable behavior and will NOT affect the data drive capacities. Instead, add a new thinly provisioned SCSI hard disk.

### Step-by-Step Process

1. **Initiate appliance shutdown** and wait until the shutdown process completes.

2. **Add a new, thinly provisioned SCSI hard disk** (DO NOT expand the default data drive):
   - **Hyper-V**: Add a new virtual hard disk via Hyper-V Manager
   - **VMware ESXi**: Add a new virtual disk via VMware vSphere/ESXi console

3. **Restart the appliance** (from Hyper-V Manager or VMware) and wait for the local UI to be available.
   - Note: New capacities may not update immediately unless the newly added drive is small (e.g., ~50 GB).

4. **In the Azure portal**, check for the informational event: **"Started expanding the data disk"**

5. **Wait for completion** — check the Azure portal again for the event: **"Successfully expanded the data disk"**

6. **Check the local UI dashboard** for updated Total and Available capacities.
   - Note: New Available Capacity varies based on existing data drive usage.
   - Expansion may take **up to 10 minutes per TB** of added capacity.

7. **Verify via Azure portal Metrics page** — check new capacities.
   - Numbers may take up to 10 minutes to update; refresh intermittently.
   - Portal values may be slightly higher than local UI values (expected behavior due to portal rendering plugin). Example: 9.74 TB usable in local UI → displayed as 10 TiB in Azure portal.

8. **(Optional) Check via PowerShell** — open a support session to the appliance and run:
   ```powershell
   Get-HcsAppliancePerfReport
   ```

### Notes

- **Supported hypervisors**: Hyper-V and VMware ESXi
- **Do NOT** attempt to resize/expand the default (existing) data disk — only add new disks
- Capacity metrics in Azure portal use TiB units and may differ slightly from local UI
