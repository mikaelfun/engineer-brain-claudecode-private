---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Networking/Determining subscription and other details for public IP"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FDetermining%20subscription%20and%20other%20details%20for%20public%20IP"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Determining subscription and other details for public IP addresses in AKS

## Use Case

When investigating high traffic from a specific public IP, determine what that IP address belongs to (subscription, resource, etc.).

## Steps

### Step 1 — Identify if IP is Azure-owned and its region

Use [azurewhois](https://github.com/joaguas/azurewhois) tool or [iplocation.net](https://www.iplocation.net/find-ip-address).

### Step 2 — Get subscription ID via Jarvis

From a SAVM, open Jarvis link: https://portal.microsoftgeneva.com/72649BB5?genevatraceguid=cfedf803-c494-40b6-b64a-1e3360b4ce88

Fill in the IP details to get the subscription ID where the public IP resource resides.

### Step 3 — Open subscription in ASC

Add the subscription in ASC. Note: If the IP belongs to an internal subscription, the name will be "AKS UNDERLAY - <REGION>".

### Step 4 — Find the specific resource

In ASC: Resource provider → Microsoft.Network → publicIPAddresses → filter by the IP address. Open the resource to see all details.
