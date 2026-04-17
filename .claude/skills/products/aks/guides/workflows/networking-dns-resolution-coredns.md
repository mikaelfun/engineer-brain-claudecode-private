# AKS DNS 解析排查 — coredns — 排查工作流

**来源草稿**: ado-wiki-a-LocalDNS.md
**Kusto 引用**: 无
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: LocalDNS Feature
> 来源: ado-wiki-a-LocalDNS.md | 适用: 适用范围未明确

### 排查步骤

#### LocalDNS Feature


#### What is supported

- In preview, LocalDNS requires AKS cluster running Kubernetes version 1.31 or later.
- Subscription must be registered for LocalDNSPreview feature.
- Localdns can only be enabled per nodepool.
- Localdns can only be enabled for linux OS nodepools.
- Localdns can only be enabled for nodepool that has VM SKU Size with >= 4 cpu cores.
- LocalDNS is only supported on node pools running Azure Linux or Ubuntu 22.04 or newer.
- VMAS is not supported.

#### Important

- Editing localdns corefile inside the node, should only be done for troubleshooting and testing. Changes made to this file will not be persisted.
- If customer is looking to update custom VNET DNS servers for an AKS cluster, directly updating 'DNS Servers' under VNET in NodeRG on portal and CLI - will only update NRP. AKS RP will not be aware of this change. Nodepool reimage should be done via AKS RP for the changes to be applied and persisted.
- For Root zone under vnetDNSOverrides, forwardDestination cannot be ClusterCoreDNS (validation failure).
- For Cluster.local zone under both vnetDNSOverrides and kubeDNSOverrides, forwardDestination cannot be VnetDNS (validation failure).
- For a given zone, ServerStale Verify cannot be used when Protocol is ForceTCP (validation failure).
- It is not recommended to enable both upstream kubernetes NodeLocal DNSCache and Localdns in AKS cluster.
- In localdns config, if DNS traffic is forwarded to VnetDNS over TCP, customer NSGs/FW/NVA devices should not block TCP protocol between coredns/localdns to VnetDNS.

##### AKS LocalDNS vs NodeLocalDNS (Upstream)

| Aspect            | AKS LocalDNS                                                                                      | NodeLocalDNS (Upstream)                                                                 |
|-------------------|---------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------|
| Deployment        | Managed by AKS as a systemd service on each node; no manual DaemonSet required                    | Requires manual DaemonSet deployment and configuration                                  |
| Resiliency        | Built-in serve-stale fallback during upstream DNS outages                                         | Stale cache requires memory utilization, and so can be affected by resource constraints |
| Performance       | Optimized for AKS clusters: faster resolution, reduced CoreDNS load, minimized conntrack overhead | Improves latency but lacks AKS-specific optimizations                                   |
| Protocol Handling | Upgrades CoreDNS connections to TCP for better conntrack cleanup                                  | Primarily UDP; TCP requires manual tuning                                               |
| Version Support   | Available on Linux node pools (K8s v1.31+)                                                        | Works across Kubernetes versions; no AKS integration (manual install)                   |
| Management        | Fully integrated with AKS lifecycle and upgrade process                                           | User-managed; risk of drift during upgrades                                             |

#### ControlPlane

##### Verify localdns is enabled

Using Kusto logs:

```kql
let queryFrom = datetime("2025-06-26 00:00:00");
let queryTo = datetime("2025-06-26 23:59:59");
let queryClusterVersion = "";
let queryNodePoolName = "";
AgentPoolSnapshot
| where PreciseTimeStamp between(queryFrom .. queryTo)
| where namespace == queryClusterVersion
| where id endswith queryNodePoolName
| top 1 by PreciseTimeStamp desc
| extend log = parse_json(tostring(log))
| project features = bag_pack(
 "LocalDNS Enabled", coalesce(tobool(log.localDNSProfile.state == 1), false)
)
```

##### View LocalDNS profile

```kql
AgentPoolSnapshot
| where PreciseTimeStamp between(queryFrom .. queryTo)
| where namespace == queryClusterVersion
| where name == queryNodePoolName
| where log has_cs "localDNSProfile"
| take 1
| extend profile = parse_json(log).localDNSProfile
```

#### DataPlane

##### Verify localdns is active

Connect to the node and run: `systemctl status localdns`

##### Verify localdns IP configurations

- From inside a pod: nameserver should be 169.254.10.11
- From inside a node: nameserver should be 169.254.10.10

##### Verify localdns corefile

```sh
cat /opt/azure/containers/localdns/updated.localdns.corefile
```

Forward IPs should match VNET DNS servers (AzureDNS IP or custom DNS servers) for zones which forward traffic to VnetDNS.
Forward IP should match DNS serviceIP (default is 10.0.0.10) for zones which forward traffic to ClusterCoreDNS.

##### Identify the pattern

- DNS resolution failure: Always / Intermittent / RCA
- Nodes: All nodes / Only few nodes / Only one node
- Zones: All zones / Only few zones / Only one zone
- Protocol: Both TCP/UDP / Only TCP / Only UDP

##### Using Inspektor Gadget

Install and deploy: <https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/logs/capture-system-insights-from-aks>

#### Identify unsuccessful DNS responses across the cluster

```sh
kubectl gadget run trace_dns:latest --all-namespaces --fields k8s.node,src,dst,name,qtype,rcode --filter "qr==R,rcode!=Success"
```

#### Identify slow DNS queries across the cluster

```sh
kubectl gadget run trace_dns:latest --all-namespaces --fields k8s.node,src,dst,name,qtype,rcode,latency_ns --filter "latency_ns_raw>5000000"
```

#### Verify DNS requests are reaching coredns and localdns

```sh
#### CoreDNS ServiceIP
kubectl gadget run trace_dns:latest --all-namespaces --fields src,dst,id,qr,name,nameserver,rcode,latency_ns --filter "nameserver.addr==10.0.0.10"

#### LocalDNS ClusterListenerIP
kubectl gadget run trace_dns:latest --all-namespaces --fields src,dst,id,qr,name,nameserver,rcode,latency_ns --filter "nameserver.addr==169.254.10.10"
```

##### Enable LocalDNS query logging

Query logging should not be enabled by default in production due to performance impact.

**Option 1 - Enable on all nodes via API:**
Update LocalDNSProfile and explicitly specify "Log" in queryLogging for a zone.
Note: this will cause nodes in the nodepool to get reimaged.

**Option 2 - Enable inside a single node (for troubleshooting only):**
Connect to the node, manually update the corefile, and restart localdns:
```sh
vi /opt/azure/containers/localdns/localdns.corefile
#### Change "errors" to "log" for the desired zone
systemctl restart localdns
```
Note: Changes will not be persisted.

##### View localdns logs

```sh
journalctl -u localdns           # View logs
journalctl -u localdns --reverse  # Latest first
journalctl -u localdns -f         # Follow
```

##### Enable CoreDNS query logging

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

##### View CoreDNS query logs

```sh
kubectl logs --namespace=kube-system -l k8s-app=kube-dns --tail 50 --timestamps
```

#### Azure DNS

##### AzureDNS Throttling

Check if any queries have been dropped due to throttling.
Check "QueriesDroppedByQpsFilterUdp" and "QueriesDroppedByQpsFilterTcp".

##### AzureDNS Timeout

Check DnsForwarderWarmPath - DnsForwardQueryTimeoutEvent.

##### DNS resolution failure diagnostics

| QueriesSent == 0 | No query DnsForwarder received from the given VM |
| --- | --- |
| QueriesSent != QueriesForwarded | Some queries dropped by throttling or rejected |
| QueriesRejected != 0 | Mal-formed query/response packets or internal error |
| ResponsesErrored != 0 | Server returned RCODE other than NoError & NxDomain |
| ResponsesNxDomain != 0 | Server returned NxDomain(RCODE=3) |
| ResponsesTimedOut != 0 | Server failed to return response within 2 seconds |

---
