---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box Disk/Data Copy at Azure/Data Box disk showing as Internal Error in Azure Portal"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=/Azure%20Data%20Box%20Disk/Data%20Copy%20at%20Azure/Data%20Box%20disk%20showing%20as%20Internal%20Error%20in%20Azure%20Portal"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Data Box disk showing as internal Error in Azure Portal

### Applies to

Data Box disks

### Overview

When you've already returned the disk but see an error in the portal and can't view the logs, follow these steps to troubleshoot and resolve the issue.

### Step-by-step instructions

1. Go to ASC and click on Resource Explorer.
2. Check the Data Transfer Status tab.
   - You'll see the status of the copy here.
3. Confirm the status.
4. Check the Active ICM tab to see if an ICM (Incident Communication Management Ticket) is already created.
   - If an ICM exists, check its status and the investigation details.
   - Inform the customer that you've opened this case and share any updates from the ICM.
5. If you didn't find an ICM, you'll need to create one with the data path team.

### ICM Creation
* Create ICM with the Data Box Data Path Engineering Team.

Keep the customer informed based on the updates in the ICM and communicate any necessary information they might need.
