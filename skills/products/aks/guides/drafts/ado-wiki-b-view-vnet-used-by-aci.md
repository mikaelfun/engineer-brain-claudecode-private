---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACI/How To/View VNET used by ACI"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FHow%20To%2FView%20VNET%20used%20by%20ACI"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Finding the Virtual Network Used for an ACI Container Group

[[_TOC_]]

## Background

Determining the virtual network used by ACI container groups can help significantly when troubleshooting network issues. Container groups may use different networking mechanisms depending on the API version used to create them.

## Method 1 — ACI using Network Profile (API version < 2021-07-01)

Container Groups deployed to BYOVNET and created with an API version **lower than** 2021-07-01 use network profiles.

1. Open ASC for the case and navigate to the ACI container group in Resource Explorer.
2. Navigate to the "Networking" section.
3. Review the network profile — it will show the VNET details and subnet.
4. Use the ASC resource search bar to navigate to the virtual network.

**Common items to check once you've found the VNET:**

* Is the VNET using Azure DNS or custom DNS servers?
* Note the VNET address space and CIDR of the ACI subnet.
* Are there any VNET peerings and are they relevant to the container group's connectivity?

## Method 2 — ACI using Delegated Subnet (API version >= 2021-07-01)

Container groups created with API version **2021-07-01 or later** use subnet delegation to `Microsoft.ContainerInstance/containerGroups` — no network profile is created (shows as `NetworkProfileIdPlaceholder` in ASC).

Use the following Kusto query to track down VNET from subnet ID:

```sql
cluster('accprod').database('accprod').SubscriptionDeployments
| where TIMESTAMP between (datetime()..datetime()) //datetime format YYYY-MM-DD HH:MM:ss
//| where TIMESTAMP > ago(1d)
| where subscriptionId == "{subscription}"
| where containerGroup has "{containerGroup}"
| project TIMESTAMP, containerGroup, subnetId, ipAddress, clusterDeploymentName, correlationId
| sort by TIMESTAMP desc
```
