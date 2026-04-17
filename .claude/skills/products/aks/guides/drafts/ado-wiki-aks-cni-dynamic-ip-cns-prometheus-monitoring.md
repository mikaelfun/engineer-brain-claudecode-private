---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Monitoring/Scraping Azure CNS metrics with Prometheus"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FMonitoring%2FScraping%20Azure%20CNS%20metrics%20with%20Prometheus"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# AKS Azure CNI Dynamic IP Allocation & CNS Metrics Monitoring

## Summary

Azure CNI Dynamic IP Allocation (Swift) provides better IP management by allocating pod IPs from a dedicated pod subnet, separate from node IPs. This guide covers the architecture, IP allocation mechanism, monitoring with Prometheus/Grafana, and troubleshooting pod subnet exhaustion.

## Key Components

- **DNC** (Delegated Network Controller): deployed on cluster CCP
- **CNS** (Container Network Service): daemonset deployed on cluster nodes

## IP Allocation Mechanism

- IPs are allocated to nodes in **batches of 16**
- Nodes request 16 IPs on startup, request another batch when < 8 IPs unallocated
- Not possible to allocate IPs one-by-one (by design)
- Pod subnet can be shared across different nodes and clusters on the same VNet

## Checking IP Allocation

### Using kubectl

```bash
# List NodeNetworkConfig objects (one per node)
kubectl -n kube-system get nnc

# Describe specific node's NNC
kubectl -n kube-system describe nnc <NODE_NAME>

# Check pod IPs assigned from pod subnet on a specific node
kubectl get po -o wide -A | grep <NODE_NAME> | grep '<POD_SUBNET_NETWORK>'
```

### Using azure-cns Metrics

azure-cns pods expose metrics on `:10092/metrics`:

```bash
# Get azure-cns pod IPs
kubectl -n kube-system get po -l k8s-app=azure-cns -o wide

# Query metrics from a node or test pod
curl -s <AZURE-CNS_POD_IP>:10092/metrics | grep 'cx_ipam_'
```

Key metrics:
- `cx_ipam_available_ips` — IPs reserved but not assigned to Pods
- `cx_ipam_pod_allocated_ips` — IPs assigned to Pods
- `cx_ipam_total_ips` — Total IPs reserved from Subnet
- `cx_ipam_max_ips` — Maximum IPs the Node can reserve
- `cx_ipam_batch_size` — Batch size for IP allocation

## Prometheus + Grafana Setup

### Install kube-prometheus-stack

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
```

Create `values.yaml`:
```yaml
prometheus:
  prometheusSpec:
    podMonitorSelectorNilUsesHelmValues: false
    probeSelectorNilUsesHelmValues: false
    ruleSelectorNilUsesHelmValues: false
    serviceMonitorSelectorNilUsesHelmValues: false
```

```bash
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace -f values.yaml
```

### PodMonitor for azure-cns

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PodMonitor
metadata:
  name: azure-cns
  namespace: kube-system
spec:
  podMetricsEndpoints:
  - port: metrics
  selector:
    matchLabels:
      k8s-app: azure-cns
```

Verify with Prometheus query: `count ({job="kube-system/azure-cns"}) by (__name__)`

### Grafana Dashboard

Import from: https://raw.githubusercontent.com/Azure/azure-container-networking/master/cns/doc/examples/metrics/grafana.json

> Note: Current Grafana template does not handle multiple Pod CIDRs correctly.

## Kusto Queries for DNC Logs

### Check address allocation issues

```kusto
let queryNamespace = "<CLUSTER_CCPNAMESPACE>";
let queryFrom = datetime("...");
let queryTo = datetime("...");
union ControlPlaneEvents, ControlPlaneEventsNonShoebox
| where PreciseTimeStamp between (queryFrom .. queryTo)
| where category == "dnc" or category == "requestcontroller"
| where namespace == queryNamespace
| project TIMESTAMP, properties
| where properties contains "addresses in" or properties contains "fail"
```

### Check subnet capacity exceeded

```kusto
// Same base query, filter:
| where properties contains "subnet capacity exceeded"
| sort by TIMESTAMP desc
| take 5
```

### Check shared pod subnet across clusters

```kusto
AgentPoolSnapshot
| where TIMESTAMP > ago(1d)
| where podSubnetId != ""
| summarize dcount(id) by podSubnetId
| where dcount_id > 1
```

## Diagnostic Tools

- **AppLens**: "Pod Subnet Full" detector
- **Geneva Resource Health**: Check region-level subnet full alerts at https://portal.microsoftgeneva.com/health
- **ASI Support Ticket Insights**: https://asi.azure.ms — search by support ticket number for subnet full errors

## Mitigation: Pod Subnet Full

1. Reduce pod count to release IPs
2. Create new pod subnet on same VNet with larger address space
3. Add new nodepool with `--pod-subnet-id` pointing to new subnet
4. Delete stuck ContainerCreating pods to reschedule on new nodepool

```bash
# Create new subnet
az network vnet subnet create -g $NET_RG --vnet-name $VNET --name podsubnet2 --address-prefixes 10.242.0.0/24

# Add nodepool with new pod subnet
az aks nodepool add --cluster-name $CLUSTER -g $RG -n nodepool2 \
  --max-pods 250 --node-count 2 \
  --vnet-subnet-id $NODE_SUBNET_ID \
  --pod-subnet-id $NEW_POD_SUBNET_ID

# Reschedule stuck pods
for POD in $(kubectl get po | grep ContainerCreating | awk '{print $1}'); do kubectl delete po $POD; done
```

## References

- Public doc: https://learn.microsoft.com/en-us/azure/aks/configure-azure-cni-dynamic-ip-allocation
- Internal doc: https://eng.ms/docs/cloud-ai-platform/azure-core/azure-management-and-platforms/containers-bburns/azure-kubernetes-service/azure-kubernetes-service-troubleshooting-guide/doc/tsg/swift-azure-cni
- Metrics examples: https://github.com/Azure/azure-container-networking/tree/master/cns/doc/examples/metrics
