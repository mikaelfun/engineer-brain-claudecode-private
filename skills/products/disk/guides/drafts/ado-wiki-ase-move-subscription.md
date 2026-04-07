---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Stack Edge/Manage Device/Move Azure Stack Edge Resource Between Azure Subscriptions"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Stack%20Edge%2FManage%20Device%2FMove%20Azure%20Stack%20Edge%20Resource%20Between%20Azure%20Subscriptions"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Move Azure Stack Edge Resource Between Azure Subscriptions

**CAUTION**: Data and configuration on the device will be erased. Data in the current storage account will not migrate.

## Steps

1. **Reset the device** via Local WebUI or PowerShell (erases all data and config)
2. **Create new ASE Resource** in target subscription
   - Select "I already have a device" under shipping address tab
3. **Connect to Local WebUI** at https://192.168.100.10 (may take a few minutes after reset)
4. **Configure**: Network settings > Device settings (name, update/time server) > Certificates
5. **Activate**: Generate activation key in Azure portal > Paste in Local WebUI > Activate
6. **Delete old ASE Resource** from Azure portal (backend move completes within 1 business day)

## Notes
- If unable to delete old resource: open IcM with Ops team to re-register ACIS
- Billing cycle needs to finish once old resource is deleted
- Data in old storage account remains but won't be available under new subscription
- Reference: https://docs.microsoft.com/en-us/azure/databox-online/azure-stack-edge-return-device
