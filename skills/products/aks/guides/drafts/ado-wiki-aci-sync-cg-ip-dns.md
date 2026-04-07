---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACI/How To/Sync Container Group Private IP Changes With Customer DNS records"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FHow%20To%2FSync%20Container%20Group%20Private%20IP%20Changes%20With%20Customer%20DNS%20records"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Automating DNS Updates for VNet Container Group IP Addresses

> Scoped to ACI customers who run their container group in a Virtual Network

## Summary

When a VNet container group is restarted or stopped/started, its IP address may change. ACI does not support static IP addresses. This causes DNS records to point to the wrong address, resulting in failed connectivity.

## Solution

Use an **init container** to automate DNS record updates whenever the container group is stopped, started, or restarted.

Follow the MS Learn Module: https://docs.microsoft.com/learn/modules/secure-apps-azure-container-instances-sidecar/6-deploy-with-init-container

**Note:** There will still be downtime during restart, but DNS records will be updated automatically.

## References

* Init container for setup tasks: https://learn.microsoft.com/en-us/azure/container-instances/container-instances-init-container
* Deploy with init container: https://learn.microsoft.com/en-us/training/modules/secure-apps-azure-container-instances-sidecar/6-deploy-with-init-container
