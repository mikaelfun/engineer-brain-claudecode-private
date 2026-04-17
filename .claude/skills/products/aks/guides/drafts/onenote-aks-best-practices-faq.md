# AKS Best Practices & FAQ

> Source: Mooncake POD Support Notebook — ##Best Practice & FAQ
> Quality: guide-draft (pending review)

## Agent Node Sizing for Production

- Use VMs with at least **8 CPU cores** (e.g., D4_v2) since K8s components consume CPU/memory on each node
  - See [AKS resource reservation](https://docs.microsoft.com/zh-cn/azure/aks/concepts-clusters-workloads#resource-reservations)
- Set a larger OS disk size at cluster creation: `--node-osdisk-size 128` (default 30GB is insufficient as all images are stored on OS disk)
- **Avoid B-series VMs** for production workloads:
  1. Burstable CPU capacity — not consistent performance
  2. Limited IOPS and throughput for Azure Disks — can be a serious bottleneck

## NSG Rules

- **No inbound requirements** for AKS — everything is outbound
- SSH access to nodes is restricted by default (customer choice to open)
- Application Rules (FQDNs):
  - Constrain outbound to datacenter-specific `*azmk8s.io` (e.g., `*eastus.azmk8s.io`)
  - Required FQDNs: `k8s.gcr.io`, `storage.googleapis.com`, `*auth.docker.io`, `*cloudflare.docker.io`, `*registry-1.docker.io`
- Network Rule for Tunnel Front:
  - Protocol: TCP
  - Source: *
  - Destination: All Public IPs in the Azure Region
  - Port: 22

## OOM Recovery

- To correct damage from OOM Killer (e.g., Node in failed state):
  1. **Drain and restart** each node one at a time
  2. `kubectl drain` evicts pods gracefully, allowing containers to terminate properly
  3. Respects PodDisruptionBudgets during eviction

## Replica Set Reliability

- Reference: [More reliable Replica Sets in AKS](https://vincentlauzon.com/2018/05/15/more-reliable-replica-sets-in-aks-part-1/)
