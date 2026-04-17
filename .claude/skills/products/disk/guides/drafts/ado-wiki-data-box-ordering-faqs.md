---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box/Ordering - Logistics/Ordering FAQs"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Data%20Box%2FOrdering%20-%20Logistics%2FOrdering%20FAQs"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Data Box Ordering FAQs

## Can storage account associated with databox be changed?

Storage account cannot be changed once the order is processed. Customer will have to create a new order with the required storage account. The customer will have to return the databox that has been shipped to them earlier and has the inaccurate storage account.

## When creating an order why am I not finding my country in the drop-down for source country?

Because the databox service is not available in the source country, it is not listed in the Source country drop-down.

Workarounds:

1. **Branch in supported country**: If the customer has a branch in another country where the service is available, they can place the order from that branch and then personally transport the device to the desired country. All responsibility of the data box is on the customer. Once transported, customer can copy the data onto the device and transport it back to the source country from where MS will pick it and deliver it to the targeted Azure Data Center.

2. **Self-managed shipping**: Customer will have to provide the address of a supported country. They can then pickup the databox from the data center, copy the data onto it and then drop it back at the datacenter. The datacenter address will be provided by MS but the pickup and drop off should be managed by the customer. Reference: https://docs.microsoft.com/en-us/azure/databox/data-box-portal-customer-managed-shipping

## I placed my Data Box order few days back. When will I receive my Data Box?

When you place an order, we check whether a device is available for your order. If a device is available, we will ship it within 10 days. It is conceivable that there are periods of high demand. In this situation, your order will be queued and you can track the status change in the Azure portal. If your order is not fulfilled in 90 days, the order is automatically canceled.

## How long will my order take from order creation to data uploaded to Azure?

Estimated lead times for a Data Box order:

- **Order Data Box**: A few minutes, from the portal
- **Device allocation and preparation**: 1-2 business days, subject to inventory availability and other orders pending fulfillment
- **Shipping**: 2-3 business days
- **Data copy at customer site**: Depends on nature of data, size, and number of files
- **Return shipping**: 2-3 business days
- **Processing device at datacenter**: 1-2 business days, subject to other orders pending processing
- **Upload data to Azure**: Begins as soon as processing is complete, and the device is connected. Upload time depends on nature of data, size and number of files.

## Public Documentation

- https://docs.microsoft.com/en-us/azure/databox/data-box-faq?tabs=data-box-and-data-box-heavy
