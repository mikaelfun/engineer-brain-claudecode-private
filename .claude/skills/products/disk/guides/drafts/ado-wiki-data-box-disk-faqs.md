---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box Disk/Ordering & Logistics/Data Box Disk FAQs"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Data%20Box%20Disk%2FOrdering%20%26%20Logistics%2FData%20Box%20Disk%20FAQs"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Data Box Disk FAQs — Ordering & Logistics

## Can storage account associated with Data Box be changed?

Storage account cannot be changed once the order is processed. Customer will have to create a new order with the required storage account. The customer will have to return the Data Box that has been shipped earlier with the inaccurate storage account.

## When creating an order, why am I not finding my country in the drop-down for source country?

Because the Data Box service is not available in the source country, it is not listed in the Source country drop-down.

### Workarounds:
- **Branch in supported country**: If the customer has a branch in another country where the service is available, they can place the order from that branch and personally transport the device. All responsibility of the Data Box is on the customer once transported.
- **Self-managed shipping**: Customer will have to provide the address of a supported country. They can then pick up the Data Box from the data center, copy data, and drop it back. The datacenter address will be provided by MS but pickup and drop-off are managed by the customer.

Reference: [Microsoft Azure Data Box Disk self-managed Shipping](https://learn.microsoft.com/en-us/azure/databox/data-box-disk-portal-customer-managed-shipping)

## When will I receive my Data Box?

When you place an order, we check whether a device is available. If available, it will ship within 10 days. During periods of high demand, orders are queued — track status changes in the Azure portal. Orders not fulfilled in 90 days are automatically canceled.

## Estimated Lead Times for a Data Box Order

- Order Data Box: A few minutes, from the portal
- Device allocation and preparation: 1-2 business days (subject to inventory)
- Shipping: 2-3 business days
- Data copy at customer site: Depends on data nature, size, and number of files
- Return shipping: 2-3 business days
- Processing device at datacenter: 1-2 business days
- Upload data to Azure: Begins as soon as processing is complete; upload time depends on data characteristics

Public Documentation: [Data Box FAQ](https://docs.microsoft.com/en-us/azure/databox/data-box-faq?tabs=data-box-and-data-box-heavy)
