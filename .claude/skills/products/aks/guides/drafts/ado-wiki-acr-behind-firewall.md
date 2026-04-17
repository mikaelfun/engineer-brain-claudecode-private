---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/How Tos/ACR Behind Firewall"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Behind%20Firewall"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# ACR Behind Firewall

When customer has Azure Container Registry behind the Firewall, they often need to allow specific URLs for successful connectivity to registry and image pull operations.

## ACR Firewall Background

When Docker Daemon tries to pull an image from the registry:

1. Docker client calls ACR endpoint to get manifest first: `GET /v2/<repo>/manifests/<tag>`
2. Docker client parses the manifest, gets the layer digest list, downloads them in parallel:
   - Docker client calls ACR endpoint: `GET /v2/<repo>/blobs/sha256:<sha256 digest>` to get layer blob redirect URL
   - Docker client gets the blob storage URL, follows the link to download content from Azure blob storage

## What Customer needs to allow

Customer has to allow the REST ENDPOINT and the STORAGE ENDPOINT as mentioned in https://docs.microsoft.com/bs-cyrl-ba/azure/container-registry/container-registry-firewall-access-rules.

When customer has also enabled vNET Firewall on ACR, `docker pull` goes through data proxy `region-acr-dp.azurecr.io` instead of directly going via blob URL.

### Important

1. Customer must allow data proxy `region-acr-dp.azurecr.io` in their Firewall for successful connectivity. For example, if registry is hosted in North Europe, the data proxy address would be `neu-acr-dp.azurecr.io`.

2. If customer has GEO-REPLICATION enabled, they must allow the data proxy address for all replicated regions. Example: if replicated region is West Europe, data plane is `weu-acr-dp.azurecr.io`.

## Pain Points

1. Customer is not aware of the data plane URL
2. Customer is not comfortable allowing `*.blob.core.windows.net` (allows all blob storage)
3. Customer is not comfortable allowing all IP ranges for the region

## Upcoming Changes

ACR PG is working on a consistent data plane format:
1. REST ENDPOINT (ACR FQDN)
2. DATA ENDPOINT: `registry_name.region.data.azurecr.io`
   Example: `myregistry.northeurope.data.azurecr.io`

Note: Data endpoint is regional. With GEO REPLICATION, customer must allow data endpoint for each replicated region.
