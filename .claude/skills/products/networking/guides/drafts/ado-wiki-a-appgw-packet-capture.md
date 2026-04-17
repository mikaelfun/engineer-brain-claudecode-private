---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/AppGw Packet Capture - Delivery Partner Only"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/AppGw%20Packet%20Capture%20-%20Delivery%20Partner%20Only"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# AppGw Packet Capture - Delivery Partner Only

## How to Start and Obtain Packet Capture on AppGw

1. Navigate to **Diagnostics** → **Application Gateway Packet Capture (For v2 SKU)**
2. Start capture with appropriate filter
3. After time limit is reached, proceed with **Get Packet Capture Result**
4. Right-click on the output file name and **Copy Link**
5. Paste link into Notepad for later use

> **Note**: The error message "Server failed to authenticate the request" can be safely ignored — it is expected and does not indicate failure.

## Important Values from Capture

From the capture URL:
1. First highlighted section = **storage account** name (varies by resource location) → add to Excel tracker
2. Second highlighted section = **blob name** where capture is stored → add to Excel tracker

## Create TA JIT ICM

To retrieve the packet capture, create a JIT ICM for the PTA:

1. Open ASC → **Escalate Ticket**
2. Select **TA JIT Template** (or search for "TA JIT Request" under All)
3. In **Title**: include the SR number
4. In **Description**: add required values (storage account, blob name, etc.)
5. Set correct **region**

**Important Notes**:
- Support Engineer does NOT need to own/close/manage the ICM
- The PTA selected as Approver owns the ICM
- Captures appear in Storage Account immediately after stop
- Double-check with PTA to confirm presence; otherwise new captures needed

## Excel Tracker

For **Tek Experts America and Mindtree America**, use the [AppGw Packet Capture Retrieval Tracker](https://microsoft.sharepoint.com/:x:/t/AIPDAZN/ERhiMlul6ENOtzIFmpyfl8oByG5uYrspKz47GO4dJvS3DQ?e=yEVx18).

Include:
- Capture names for each instance (first 3 if more than 3)
- Storage account name
- Blob name

Ping **Diego Garro** in Americas for packet capture retrieval. Set expectations with customer that retrieval may take time.
