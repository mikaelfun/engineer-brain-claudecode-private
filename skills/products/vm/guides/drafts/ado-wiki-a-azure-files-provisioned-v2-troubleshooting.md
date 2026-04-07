---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/TSGs/Azure Files Provisioned V2 Troubleshooting_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20All%20Topics%2FTSGs%2FAzure%20Files%20Provisioned%20V2%20Troubleshooting_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Summary

This article aims to help you investigate challenges regarding Provisioned V2 billing model for Azure Files.

## Scenarios

The most common inquiries we anticipate handling include:

- Customer creates a PV2 file share, they manually specify the IOPS/throughput and are surprised by the size of the bill.
- Customer encounters an error updating IOPS/Throughput figures.
- Throttling
- No bursting credits
- Application latency
- Billing discrepancies

## Causes

- Over-provisioning (aka setting the IOPS/Throughput thresholds too high)
- Under-provisioning (aka setting the IOPS/Throughput thresholds too low)
- 24-hour cool down period
- Insufficient bursting credits
- Throttling occurs when customers exceed their provisioned IOPS and throughput, they will experience throttling, which can manifest as increased latency in their applications.

## Scoping

Collect these details from the customer.

- Storage account name
- File share name
- Precise time stamp of the incident
- Subscription ID
- Repro steps

# Troubleshooting

## Provisioning Guidance

**Pro Tip:**

- *A file share that is 100% full on storage is read-only.*
- *A file share that is running at 100% of its IOPS/throughput capacity is very close to being throttled.*

Customers do not know how much IOPS & throughput their workloads require. Therefore, most users will benefit from adhering to the **recommended figures to provision** available in the portal.

- **Under-provisioning Issues:** Customers miscalculate how much resources to provision, such as under-provisioning IOPS and throughput, which could lead to throttling and customer dissatisfaction.
- **Over-provisioning Importance:** Emphasis customers need to overprovision their shares to ensure proper functionality and avoid throttling, recommending a 2X overprovisioning as a general guideline.

> **Resolution**: Start 2X overprovisioned on storage and follow IOPS/throughput recommendations. Tune IOPS/throughput upwards or downwards based on Azure Monitor usage results. 2X overprovisioning decreases overtime as share fills up, reprovision when share is 1.25X overprovisioned.

## Billing Issues

- **Pv2:** Storage, IOPS, and throughput can be independently provisioned, although we do make a default recommendation for IOPS, and throughput based on how much storage the customer provisions.
- **Pv1:** Storage can be independently provisioned, IOPS and throughput are computed values based on a formula.

> **Resolution**: Set up alerts and monitoring to observe customer usage patterns to adjust the provisioned resources to satisfy the customer workload(s). For more information about metrics see [Monitor Azure Files](https://learn.microsoft.com/en-us/azure/storage/files/storage-files-monitoring).

## Throttling issues

A customer may experience throttling that is not easy to detect, and they may see it as **perceived latency** in their application. This can occur if they exceed their provisioned values.

> **Resolution**:
> - [Your workload is being throttled](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-storage/files/performance/files-troubleshoot-performance?tabs=windows#your-workload-is-being-throttled)
> - [How to create an alert if a file share is throttled](https://learn.microsoft.com/en-us/azure/storage/files/files-monitoring-alerts#how-to-create-an-alert-if-a-file-share-is-throttled)

## Burst IOPS issues

The burst IOPS feature allows customers to temporarily exceed their provisioned IOPS by up to three times for an hour.

> **Resolution**: Run performance tests for sufficiently high frequency and duration. Short (minutes) and infrequent (hourly) workloads will be less likely to achieve the upper performance limits. For more information see [Provisioned v2 bursting](https://learn.microsoft.com/en-us/azure/storage/files/understanding-billing#provisioned-v2-bursting).

# Advanced Troubleshooting Tools

- [Azure Files Storage Back End Performance](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495816)
- [Training resources Xportal](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1398146)
- [Query Storage Verbose logs](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/690091)
- [Query Storage Frontend logs](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/690089)

# More Information

- [Azure Files Provisioned V2 model Overview](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1741391)
- [Monitor Azure Files](https://learn.microsoft.com/en-us/azure/storage/files/storage-files-monitoring)
