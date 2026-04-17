---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Networking/CoreDNS and NodeLocalDNS in Kubernetes AKS Focus"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Networking/CoreDNS%20and%20NodeLocalDNS%20in%20Kubernetes%20AKS%20Focus"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# CoreDNS and NodeLocalDNS in Kubernetes (AKS Focus)

## Part I: CoreDNS Behavior in AKS

### DNS Policies

| Policy | Behavior |
|---------|-----------|
| ClusterFirst | Pod → CoreDNS (10.0.0.10) → upstream DNS if not resolved |
| Default | Pod → node DNS (168.63.129.16) directly |

### ClusterFirst Resolution Chain (ndots:5)

For FQDN `microsoft.com` with `ndots:5`:
1. microsoft.com.default.svc.cluster.local → NXDOMAIN
2. microsoft.com.svc.cluster.local → NXDOMAIN
3. microsoft.com.cluster.local → NXDOMAIN
4. microsoft.com.{private-dns}.internal.cloudapp.net → forwarded to Azure DNS
5. microsoft.com. → forwarded to upstream DNS

### CoreDNS Logging

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: coredns-custom
  namespace: kube-system
data:
  log.override: |
    log
```
Apply and restart: `kubectl -n kube-system rollout restart deployment coredns`

### Known Challenges

- **Network Bottlenecks**: All DNS queries traverse cluster CNI → latency/packet loss in large clusters
- **Conntrack Table Exhaustion**: UDP tracked in conntrack → thousands of short-lived entries → when full, queries dropped silently → DNS timeouts. Check: `conntrack -L | grep 10.0.0.10`
- **Load Imbalance**: 5-tuple hashing + Istio port reuse → traffic pinned to one CoreDNS pod → OOMKilled

## Part II: NodeLocalDNS

Runs local DNS caching agent on each node (DaemonSet at 169.254.20.10):
- Reduces cross-node traffic
- Avoids conntrack pressure (TCP forwarding for cluster.local)
- Improves DNS latency and reliability

### Limitations
- Requires DaemonSet (resource overhead)
- DNS downtime possible during upgrades
- User-managed in AKS (not built-in addon)

### Debug Logs
Edit `node-local-dns` ConfigMap: replace `errors` with `log`, then restart DaemonSet.

## LocalDNS (Microsoft native addon)

Microsoft has developed a native NodeLocalDNS add-on for AKS called **LocalDNS** (managed by AKS).
