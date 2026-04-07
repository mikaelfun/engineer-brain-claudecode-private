---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Stack Edge/Hardware/Replacing an Azure Stack Edge Device"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Stack%20Edge%2FHardware%2FReplacing%20an%20Azure%20Stack%20Edge%20Device"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Replacing an Azure Stack Edge Device

## Procedure

1. **Set up replacement device** as new device (install, connect, configure, activate)
2. **Create shares** on replacement device matching original exactly:
   - Azure portal > ASE resource > Overview > + Add share
   - Match name, type (SMB/NFS), storage account, storage service, container
3. **Refresh shares** to pull data from Azure:
   - Azure portal > Shares > select share > Refresh > confirm
   - Wait for refresh job completion; timestamp updates on success
4. **Add original storage account** to replacement device:
   - Azure portal > ASE resource > + Add storage account
   - Map to same Azure Storage account and container
   - Access keys available via blob service endpoint
5. **Configure Compute** (TBD)

## References
- Prepare: https://docs.microsoft.com/en-us/azure/databox-online/azure-stack-edge-j-series-deploy-prep
- Install: https://docs.microsoft.com/en-us/azure/databox-online/azure-stack-edge-j-series-deploy-install
- Connect/Setup/Activate: https://docs.microsoft.com/en-us/azure/databox-online/azure-stack-edge-j-series-deploy-connect-setup-activate
- Create Shares: https://docs.microsoft.com/en-us/azure/databox-online/azure-stack-edge-j-series-deploy-add-shares
- Refresh Shares: https://docs.microsoft.com/en-us/azure/databox-online/azure-stack-edge-manage-shares#refresh-shares
- Add Storage Account: https://docs.microsoft.com/en-us/azure/databox-online/azure-stack-edge-j-series-deploy-add-storage-accounts
