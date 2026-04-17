---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Cluster Management/Using run command to connect to clusters"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCluster%20Management%2FUsing%20run%20command%20to%20connect%20to%20clusters"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Using AKS Run Command to connect to AKS clusters

Author: Alaa AlJaser

## Summary

The `az aks run-command` CLI feature allows a customer to connect to the AKS cluster and interact with the API server regardless of the API server network configuration (public or private cluster). This functionality is especially valuable for private clusters where the API server is not exposed to the internet; using this feature removes the need for a jump host or VPN to connect to the cluster.

## AKS Run command Advantages / Uses

- It can be run from Azure Cloud Shell without any modifications. You only need to be logged in to your Azure account and the Right Subscription.
- It allows you to connect to private AKS clusters without having to build a jumphost VM in the same vNet or to setup vNet peering/VPN/Express Route.
- If you want to connect to cluster without changing the existing .kube/config or storing the credentials of the AKS cluster locally.
- It can be used to troubleshoot connectivity issue to API server if the customer is limiting Egress traffic using UDR.

## AKS Run command Disadvantages

- It takes longer time to execute the commands and get the output/results. Usually 8 seconds per command.
- You can't have an interactive session with the pods for example exec into a pod with bash or sh, you can't copy files to/from the container using kubectl cp command. You can still execute commands inside the pods without using an interactive session.

## Interacting with AKS clusters

To connect to a cluster, use the Azure CLI command:

```bash
az aks command invoke -n <AKS_Cluster_Name> -g <AKS_Cluster_Resource_Group> -c "<kubectl_Command>"
```

This functionality can even be used in a private cluster to perform `kubectl exec` commands on a pod.

## References

- `az aks run-command` announcement: <https://azure.microsoft.com/en-us/updates/general-availability-aks-run-command>
- Using `az aks command invoke` to connect to a private cluster: <https://docs.microsoft.com/en-us/azure/aks/private-clusters#options-for-connecting-to-the-private-cluster>
