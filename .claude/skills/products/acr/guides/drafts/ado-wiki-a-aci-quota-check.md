---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACI/How To/Check ACI Quota for Subscription"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FHow%20To%2FCheck%20ACI%20Quota%20for%20Subscription"
importDate: "2026-04-21"
type: guide-draft
---

# Checking ACI Quotas on a Subscription

## Overview
Guide for checking ACI quota utilization and limits, and options for increasing available quota.

## Checking Quota Utilization via Kusto
Query ACCProd cluster SubscriptionPolicy table with subscription ID to see:
- Container quota (number of container groups deployed)
- Cores quota (cores currently in use)
- Request limits: pt5M (5-min window) and pt1H (1-hour window) for create/delete operations
- GPU SKU quotas (K80, V100, P100)

## Key Notes
- pt5M/pt1H rate limit info is NOT available via List Usage API; share with customer as-needed
- coresQuota value = number of cores currently in use
- containerQuota_value = number of container groups deployed

## Regional Availability
Query ResourceAvailability table in ACCProd to check available nodes per region and SKU type.
Shows availability percentage and node counts by region, OS type, and SKU.

## Quota Increase Options
- Standard quota increase via Azure portal support request
- For GPU SKUs, additional approval may be required
