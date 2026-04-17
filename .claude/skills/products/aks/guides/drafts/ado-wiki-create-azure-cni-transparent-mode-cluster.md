---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Networking/Create an Azure CNI transparent mode cluster via REST API"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FCreate%20an%20Azure%20CNI%20transparent%20mode%20cluster%20via%20REST%20API"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Create an Azure CNI transparent mode cluster via REST API

## Background

Azure CNI bridged mode (default) has suspected issues causing DNS latency/timeouts. Transparent mode consistently avoids these delays. Reference ICM: 200716273.

## Prerequisites

- VNet and AKS cluster must be in same region
- Subnet needs at least 93 IPs for 3 nodes with default 30 max pods
- Preview feature registration required

## Steps

### 1. Register preview feature

```bash
az feature register --namespace "Microsoft.ContainerService" --name "AKSNetworkModePreview"
az feature list -o table --query "[?contains(name, 'Microsoft.ContainerService/AKSNetworkModePreview')].{Name:name,State:properties.state}"
```

### 2. Create resource group, VNet and subnet

### 3. Get bearer token

```bash
az account get-access-token --query accessToken -o tsv
```

### 4. Send PUT request via Postman or REST client

URI: `https://<region>.management.azure.com/subscriptions/<subId>/resourceGroups/<rgName>/providers/Microsoft.ContainerService/managedClusters/<clusterName>?api-version=2020-11-01`

Key payload section — networkProfile must include `"networkMode": "transparent"`:

```json
{
  "networkPlugin": "azure",
  "serviceCidr": "10.2.0.0/24",
  "dnsServiceIP": "10.2.0.10",
  "dockerBridgeCidr": "172.17.0.1/16",
  "outboundType": "loadBalancer",
  "loadBalancerSku": "standard",
  "networkMode": "transparent"
}
```

### 5. Verify cluster

Switch request to GET with same URI to confirm cluster creation and networkMode.

## References

- [Transparent mode for CNI network (CloudNativeCompute wiki)](https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki/38321/Transparent-mode-for-CNI-network)
- Sample JSON payload: [azurecni-transparent_demo.json](https://microsoft.sharepoint.com/:u:/t/AzureCSSContainerServicesTeam/ERZ11amnv01Bg95wdU4zWBgBlREOnYBaKSXZXK7qASO6sg?e=C2DT7C)
