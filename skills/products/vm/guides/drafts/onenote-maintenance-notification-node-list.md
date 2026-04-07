# Finding Node/VM List from Planned Maintenance Notification (Mooncake)

> Source: MCVKB 2.33
> Applicability: Mooncake (21V)

## Background Flow

1. DC identifies nodes needing maintenance → ICM to AzureRT/CLSTS
2. AzureRT/CLSTS marks nodes unallocatable, gets VM list → ICM to Azure Communication Manager
3. Global Azure Communication Manager → new ICM to Mooncake Maintenance Comms Team
4. 21V comms team creates Iridias event → sends notification to customer
5. Customer receives notification with Tracking ID → raises ticket to CSS

## Steps to Find Impacted Nodes/VMs

### Step 1: Get Notification Details from Tracking ID
Replace tracking ID in: `https://iridias.microsoft.com/maintenance?id=<TRACKING-ID>`

Or search at: https://iridias.microsoft.com/ → Maintenance - List → Search box

### Step 2: Find the Source ICM
The Iridias page shows which ICM triggered the notification. The ICM contains:
- SN number
- General reason for maintenance
- Attachment with impacted VM list (at time of ICM creation)

**Warning**: The attached Excel may not list all impacted VMs if engineer used wrong Kusto query. Follow Step 3 to double-confirm.

### Step 3: Find Original Requesting ICM
- Search SN number to find original ICM (team: Azure Communication Manager, NOT the Mooncake one)
- Look for linked ICMs - the one from AzureRT/CLSTS has full node details

### Important Notes

- Time delay exists between ICM raised and notification received
- During this gap, VMs may have migrated due to: customer-initiated redeploy/deallocate, node fault, etc.
- Always verify current VM placement against maintenance nodes
