---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Monitoring/Network Observability (Kappie)/Advanced/Hubble Relay"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FMonitoring%2FNetwork%20Observability%20(Kappie)%2FAdvanced%2FHubble%20Relay"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Hubble Relay Pod TSG

## Scenarios

### **Hubble CLI does not work**

See [Hubble CLI troubleshooting guide](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Monitoring/Network-Observability-\(Kappie\)/Advanced/Hubble-CLI).

### **Hubble UI does not work**

See [Hubble UI troubleshooting guide](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Monitoring/Network-Observability-\(Kappie\)/Advanced/Hubble-UI).

### **Hubble UI/CLI does not seem to show all the Traffic Flows in my cluster**
Check that the Hubble Relay Pod *is running* AND *discovering nodes* (***see steps below***).

## Troubleshooting

### Check Hubble Relay Pod

Check that the Hubble Relay pod is running:

```shell
kubectl get po -n kube-system | grep hubble-relay
```

### Pod Restarts

If there have been restarts, get previous logs:

```shell
kubectl logs --timestamps -p -n kube-system <hubble-relay pod>
```

Sometimes Hubble Relay Pod restarts when failing to receive peer change notification. This is OK if it is intermittent:

```
level=warning msg="Error while receiving peer change notification; will try again after the timeout has expired" connection timeout=30s error="rpc error: code = Unavailable desc = error reading from server: read tcp 10.224.1.235:56358->10.0.197.139:80: read: connection reset by peer" subsys=hubble-relay
...
level=info msg="Stopping server..." subsys=hubble-relay
level=warning msg="Error while receiving peer change notification; will try again after the timeout has expired" connection timeout=30s error="rpc error: code = Canceled desc = context canceled" subsys=hubble-relay
level=info msg="Server stopped" subsys=hubble-relay
```

### Pod is Running

If the Pod is running, get current logs to check for issues. Look for warnings, errors, etc.:

```shell
kubectl logs --timestamps -n kube-system <hubble-relay pod>
```

#### Check that the Pod is Discovering Nodes

You should see logs like the following for all the nodes. Note the "address" (node IP) and "name" (node name like aks-nodepool1-22539176-vmss000001):
```
level=info msg="Received peer change notification" change notification="name:\"hgregory-04-30-euap2/aks-nodepool1-22539176-vmss000001\" address:\"10.224.0.4\" type:PEER_ADDED tls:{server_name:\"aks-nodepool1-22539176-vmss000001.hgregory-04-30-euap2.hubble-grpc.cilium.io\"}" subsys=hubble-relay
level=info msg="Received peer change notification" change notification="name:\"hgregory-04-30-euap2/aks-nodepool1-22539176-vmss000003\" address:\"10.224.1.246\" type:PEER_ADDED tls:{server_name:\"aks-nodepool1-22539176-vmss000003.hgregory-04-30-euap2.hubble-grpc.cilium.io\"}" subsys=hubble-relay
level=info msg="Received peer change notification" change notification="name:\"hgregory-04-30-euap2/aks-nodepool1-22539176-vmss000000\" address:\"10.224.0.253\" type:PEER_ADDED tls:{server_name:\"aks-nodepool1-22539176-vmss000000.hgregory-04-30-euap2.hubble-grpc.cilium.io\"}" subsys=hubble-relay
```

## Owner and Contributors

**Owner:** Jordan Harder <joharder@microsoft.com>
