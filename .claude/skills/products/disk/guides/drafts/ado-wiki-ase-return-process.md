---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Stack Edge/Device Return - Logistics/Return Process for Azure Stack Edge Devices"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Stack%20Edge%2FDevice%20Return%20-%20Logistics%2FReturn%20Process%20for%20Azure%20Stack%20Edge%20Devices"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Return Process for Azure Stack Edge Devices

## Self-Service Return
Customer should reset device to factory settings and follow: https://learn.microsoft.com/en-us/azure/databox-online/azure-stack-edge-return-device?tabs=azure-edge-hardware-center

## Manual Return (if self-service fails)

### Step 1: Gather Customer Details
```
Azure Resource Name:
Subscription ID:
MS Asset Tag (found on device):
Physical Address for pickup:
Is shipping box needed?
Customer Contact Name:
Contact Phone Number:
Contact Email:
Service tag (optional):
Reason for return?
```

### Step 2: Create ICM
- Team: Azure Stack Edge Service / DataBox Edge Billing Ops
- Include ARM ID and Location from Service Desk
- ARM ID format: `/subscriptions/{sub-id}/resourcegroups/{rg}/providers/Microsoft.DataBoxEdge/dataBoxEdgeDevices/{device}`

### Step 3: Email Ops Team
Send to: adbeops@microsoft.com with SR#, customer details, ICM reference.

### Post-ICM Process
1. Ops acknowledges ICM and takes ownership
2. Ops contacts customer for additional info if needed
3. Ops updates order status to `ReturnInitiated`
4. Ops sends return shipment label to customer
5. Once device received and validated, Ops confirms to customer
6. Ops requests SR closure; support closes ICM and SR
