---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/AKS Network Troubleshooting Methodology/[TSG] AKS troubleshooting DNS performance issues lab"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/pages?path=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20AKS%20troubleshooting%20DNS%20performance%20issues%20lab"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# AKS troubleshooting DNS performance issues lab

Demo for the AKS DNS troubleshooting workflow — focuses on intermittent DNS timeout/SERVFAIL caused by CoreDNS overload and node resource pressure.

## Problem description

Pods intermittently fail DNS resolution with timeout errors:

```text
;; communications error to 172.16.0.10#53: timed out
;; communications error to 172.16.0.10#53: timed out
;; no servers could be reached
```

Issue affects any domain. Error type is timeout + SERVFAIL (not NXDOMAIN). VNET has no custom DNS, no custom CoreDNS config.

## Troubleshooting workflow

### 1. Collect facts — Baseline questionnaire

| Question | Answer |
|----------|--------|
| Where is DNS failing? | Pod |
| What error type? | Timed out / SERVFAIL |
| How often? | Intermittently |
| Which records? | Any domain |
| Custom DNS? | No custom VNET DNS, no custom CoreDNS config |

### 2. Generate tests at different levels

Deploy test pod:

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: aks-test
spec:
  containers:
  - name: aks-test
    image: sturrent/debian-ssh
    command: ["/bin/sh"]
    args: ["-c", "while true; do sleep 1000; done"]
EOF
```

Test against CoreDNS service/pod IPs:

```bash
FQDN="db.contoso.com"; DNS_SERVER="172.16.0.10"; for i in $(seq 1 1 50); do echo "host= $(dig +short ${FQDN} @${DNS_SERVER})"; sleep 0.2; done
```

Use `curl -m 2` to detect latency-induced timeouts:

```bash
for i in $(seq 1 1 10); do curl -m 2 -I example.com; done
```

**Test results summary:**

| Level | Works | Fails |
|-------|-------|-------|
| Pod → CoreDNS service | | x (intermittently) |
| Pod → CoreDNS pod IP | | x (intermittently) |
| Pod → Azure internal DNS | x | |
| Pod → VNET DNS | x | |
| Node → Azure DNS | x | |
| Node → VNET DNS | x | |

### 3a. Review node health and performance

Key checks:
1. `kubectl top nodes` — current CPU/memory usage
2. `kubectl describe no | grep -A5 'Allocated resources:'` — request/limits allocation (watch for over-commitment like 435-642% CPU limits)
3. AppLens → Node Health detector
4. ASI → RDOS counters for node-level metrics

### 3b. Review CoreDNS pod health

1. `kubectl -n kube-system get po -l k8s-app=kube-dns -o wide` — pod placement
2. ASI → CoreDNS CPU usage, CPU throttling, memory usage

### 3c. Capture traffic — dumpy

Client-side capture:

```bash
kubectl dumpy capture deploy db-check -f "-i any port 53" --name dns-cap1-db-check
```

CoreDNS-side capture:

```bash
kubectl dumpy capture deploy coredns -n kube-system -f "-i any port 53" --name dns-cap1-coredns
```

Export and merge:

```bash
mkdir dns-captures
kubectl dumpy export dns-cap1-db-check ./dns-captures
kubectl dumpy export dns-cap1-coredns ./dns-captures -n kube-system
mergecap -w coredns-cap1.pcap dns-cap1-coredns-<POD1>.pcap dns-cap1-coredns-<POD2>.pcap
```

**Wireshark analysis:**

| Filter | Purpose |
|--------|---------|
| `(dns.flags.response == 0) && ! dns.response_in` | Queries without response |
| `dns.time >= 5` | Queries taking 5s+ (client default timeout) |
| Statistics → DNS tab | Aggregate metrics: SERVFAIL %, latency, no-response % |

**Key metrics to look for:**
- DNS queries vs responses gap > 2% → indicates drops
- DNS latency > 1s → indicates CoreDNS overload
- SERVFAIL percentage > 1% → indicates upstream failures
- Client-side: responses arriving after 5s → client already timed out

### 4. Develop hypothesis

Evidence pattern for performance-caused DNS failures:
- Nodes over-committed on CPU (limits 400-600%)
- CoreDNS CPU throttling
- High DNS query volume with latency peaks
- ~6% queries without response at CoreDNS level
- No custom DNS configuration issues

**Root cause:** Workloads flooding CoreDNS with excessive queries + under-sized/over-committed nodes causing CPU throttling on CoreDNS pods.

## Mitigation steps

1. **Dedicated system node pool** with proper SKU sizing:
   - [https://learn.microsoft.com/en-us/azure/aks/use-system-pools](https://learn.microsoft.com/en-us/azure/aks/use-system-pools)

2. **Ephemeral OS disk** to avoid disk IO throttling:
   - [https://learn.microsoft.com/en-us/azure/aks/cluster-configuration#default-os-disk-sizing](https://learn.microsoft.com/en-us/azure/aks/cluster-configuration#default-os-disk-sizing)

3. **Tune workload resource requests/limits** for proper distribution:
   - [https://learn.microsoft.com/en-us/azure/aks/developer-best-practices-resource-management](https://learn.microsoft.com/en-us/azure/aks/developer-best-practices-resource-management)

4. **Node Local DNS** for persistent performance issues:
   - [https://kubernetes.io/docs/tasks/administer-cluster/nodelocaldns/](https://kubernetes.io/docs/tasks/administer-cluster/nodelocaldns/)

5. Be aware of **Azure DNS query limits per VM**:
   - [https://learn.microsoft.com/en-us/azure/dns/dns-faq#what-are-the-usage-limits-for-azure-dns-](https://learn.microsoft.com/en-us/azure/dns/dns-faq#what-are-the-usage-limits-for-azure-dns-)

## Monitoring with Prometheus + Grafana

### Setup CoreDNS metrics scraping

```bash
# Download and modify metrics configmap
wget https://raw.githubusercontent.com/Azure/prometheus-collector/main/otelcollector/configmaps/ama-metrics-settings-configmap.yaml
sed -i 's/coredns = false/coredns = true/g' ama-metrics-settings-configmap.yaml
kubectl apply -f ama-metrics-settings-configmap.yaml

# Enable managed Prometheus
az aks update --enable-azure-monitor-metrics -n <cluster-name> -g <rg-name>
```

### Grafana CoreDNS dashboard

Import Grafana dashboard ID **14981** (CoreDNS dashboard):
- Dashboards → New → Import → ID 14981
- Select Managed_Prometheus as data source

Key panels: queries distribution, resolution latency (local + upstream), request rate peaks.

## References

- [AKS DNS troubleshooting workflow](/Azure-Kubernetes-Service-Wiki/AKS/TSG/AKS-Network-Troubleshooting-Methodology/AKS-DNS-troubleshooting-workflow)
- [Use system pools best practices](https://learn.microsoft.com/en-us/azure/aks/use-system-pools)
- [Resource management best practices](https://learn.microsoft.com/en-us/azure/aks/developer-best-practices-resource-management)
- [Node Local DNS](https://kubernetes.io/docs/tasks/administer-cluster/nodelocaldns/)
- [Disable monitoring](https://learn.microsoft.com/en-us/azure/azure-monitor/containers/kubernetes-monitoring-disable)
