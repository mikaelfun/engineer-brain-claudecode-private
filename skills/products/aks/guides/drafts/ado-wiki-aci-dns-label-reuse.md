---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACI/How To/Reusing DNS labels"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FHow%20To%2FReusing%20DNS%20labels"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to use ACI DNS name reuse

## Summary

Customers may have doubts regarding the ACI DNS label reuse feature (preview): https://learn.microsoft.com/en-us/azure/container-instances/how-to-reuse-dns-names

There are 5 DNS label reuse policies: **unsecure**, **tenantReuse**, **subscriptionReuse**, **resourceGroupReuse**, and **noReuse**.

DNS label reuse applies when an ACI is deleted and a new ACI needs to use the same DNS label as the deleted one.

## Key Points

- When creating a new ACI with the same DNS label as a deleted one, you **must** specify the same reuse policy again
- If you don't specify the reuse policy on the new ACI, the reuse will **not** work
- The FQDN of the new ACI will match the previous deleted ACI's FQDN when properly configured

## Repro Steps (resourceGroupReuse example)

1. Create a container instance with the reuse policy "Resource Group"
2. Note the FQDN assigned
3. Delete the ACI
4. Create a new ACI in the **same resource group** with the **same DNS label** and the **same reuse policy** (resourceGroupReuse)
5. The new ACI will have the same FQDN as the deleted one

## References

- https://learn.microsoft.com/en-us/azure/container-instances/how-to-reuse-dns-names
