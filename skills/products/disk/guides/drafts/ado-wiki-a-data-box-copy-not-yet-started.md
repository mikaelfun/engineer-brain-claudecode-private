---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box/Data Copy to Azure/Data Box copy not yet started"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Data%20Box%2FData%20Copy%20to%20Azure%2FData%20Box%20copy%20not%20yet%20started"
importDate: "2026-04-06"
type: troubleshooting-guide
---

Description / Overview
----------------------

When Microsoft receives and scans the device, order status is updated to Received. The device then undergoes physical verification for damage or signs of tampering.

After the verification is complete, the Data Box is connected to the network in the Azure datacenter. The data copy starts automatically. Depending upon the data size, the copy operation may take a few hours to days to complete. However, some scenarios are listed below where data copy doesn't start at the Datacenter.

*   Due to shipping delay, the device has not yet reached Azure DC

*   Delay at Azure DC in moving the job to next state.

*   Device hardware issue

*   Multiple retries due to an issue at the Azure DC

*   Customer changed/deleted the storage account.

*   Unit not connected with the network adapters at Azure DC.

*   Unit could have been damaged in transit.

Troubleshooting
---------------

Using ASC check if the data box device has reached Azure DC. The stage status for AtAzureDC should show succeeded.

If you need shipping related details, they can be found under Shipping Status in ASC.

Check the data transfer status using Data Transfer Status in ASC.

Root cause
----------

Windows Azure > Azure Databox > Technical > Issues in Datacenter > DC operations > select topic based on the exact issue
