# AKS DNS 解析排查 — dns — 排查工作流

**来源草稿**: ado-wiki-aks-troubleshooting-dns-performance-lab.md, ado-wiki-custom-logging-with-fluentbit.md, ado-wiki-troubleshoot-nsg-common-scenarios.md, mslearn-dns-resolution-troubleshooting.md, mslearn-realtime-dns-analysis.md, onenote-coredns-logging-enable.md
**Kusto 引用**: 无
**场景数**: 6
**生成日期**: 2026-04-07

---

## Scenario 1: Troubleshooting Flow
> 来源: ado-wiki-aks-troubleshooting-dns-performance-lab.md | 适用: 适用范围未明确

### 排查步骤

##### 1. Collect facts — Baseline questionnaire

| Question | Answer |
|----------|--------|
| Where is DNS failing? | Pod |
| What error type? | Timed out / SERVFAIL |
| How often? | Intermittently |
| Which records? | Any domain |
| Custom DNS? | No custom VNET DNS, no custom CoreDNS config |

##### 2. Generate tests at different levels

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

##### 3a. Review node health and performance

Key checks:
1. `kubectl top nodes` — current CPU/memory usage
2. `kubectl describe no | grep -A5 'Allocated resources:'` — request/limits allocation (watch for over-commitment like 435-642% CPU limits)
3. AppLens → Node Health detector
4. ASI → RDOS counters for node-level metrics

##### 3b. Review CoreDNS pod health

1. `kubectl -n kube-system get po -l k8s-app=kube-dns -o wide` — pod placement
2. ASI → CoreDNS CPU usage, CPU throttling, memory usage

##### 3c. Capture traffic — dumpy

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

##### 4. Develop hypothesis

Evidence pattern for performance-caused DNS failures:
- Nodes over-committed on CPU (limits 400-600%)
- CoreDNS CPU throttling
- High DNS query volume with latency peaks
- ~6% queries without response at CoreDNS level
- No custom DNS configuration issues

**Root cause:** Workloads flooding CoreDNS with excessive queries + under-sized/over-committed nodes causing CPU throttling on CoreDNS pods.

---

## Scenario 2: Custom Logging with FluentBit
> 来源: ado-wiki-custom-logging-with-fluentbit.md | 适用: 适用范围未明确

### 排查步骤

#### Custom Logging with FluentBit

#### Objective

Implementing a custom logging from AKS cluster to Log Analytics Workspace. For example, if we need to get the logging for some of the components deployed on a namespace (eg. kube-system) without activating the logging for entire namespace, we can deploy this kind of DaemonSet solution.

#### Prerequisites

AKS Cluster with monitoring Add On enabled.
Before we deploy our objects, we need to obtain the **Workspace Id** and **Primary Key** for the Log Analytics workspace.

#### Manifests

Deploy the following resources in the `logging` namespace:

1. **ServiceAccount** (`fluent-bit`) — identity for the DaemonSet
2. **ClusterRole** (`fluent-bit-read`) — read access to namespaces, pods
3. **ClusterRoleBinding** — binds the ClusterRole to the ServiceAccount
4. **ConfigMap** (`fluent-bit-config`) — FluentBit configuration including:
   - `fluent-bit.conf` — main config (SERVICE, INCLUDE directives)
   - `input-kubernetes.conf` — tail input from `/var/log/containers/*.log`
   - `filter-kubernetes.conf` — Kubernetes metadata enrichment
   - `output-azure.conf` — output to Azure Log Analytics (requires Customer_ID and Shared_Key)
   - `parsers.conf` — parsers for docker, json, syslog, apache, nginx formats
5. **Secret** (`loganalytics`) — base64-encoded WorkspaceID and WorkspaceKey
6. **DaemonSet** (`fluent-bit`) — runs FluentBit on every node with tolerations for master/NoSchedule/NoExecute

##### Key Configuration Points

- FluentBit image: `fluent/fluent-bit:1.0.6`
- Prometheus metrics exposed on port 2020
- Volume mounts: `/var/log` and `/var/lib/docker/containers` (read-only)
- Parser section in ConfigMap can be customized to filter for specific file type/name

#### Verification

In Log Analytics, find logs in the `Fluentbit_CL` table.

#### References

- https://samcogan.com/export-kubernetes-logs-to-azure-log-analytics-with-fluent-bit/

#### Point of Contact

Ovidiu Borlean (oborlean@microsoft.com)

---

## Scenario 3: Troubleshoot NSG Common Scenarios
> 来源: ado-wiki-troubleshoot-nsg-common-scenarios.md | 适用: 适用范围未明确

### 排查步骤

#### Troubleshoot NSG Common Scenarios

#### Inbound traffic is blocked by the NSG on a node pool

To resolve the issue, the custom NSG should be configured to allow traffic between the node pools, specifically on UDP port 53. AKS does not automatically update the custom NSG associated with the subnets.

##### Using Portal — Network Watcher

1. Open **Network Watcher** → NSG diagnostics
2. Target resource type: VMSS network interface
3. Select the NIC matching the node (e.g. machine 1)
4. Protocol: ANY or UDP
5. Source Type: IPv4
6. IPv4 addresses: The other Node IP (e.g. 10.5.3.20)
7. Result shows which NSG is blocking; click **View details** to see the specific rule

Reference: https://learn.microsoft.com/en-us/azure/network-watcher/network-watcher-connectivity-portal

##### Using ASC (Test Traffic) — Internal

1. Microsoft Compute > virtualMachineScaleSets > NodeName > NodeInstance
2. Diagnostic > Test Traffic
3. Traffic Direction: **TunnelorLocalIn** (testing inbound traffic)
4. Source IP: Other node IP (e.g. 10.5.3.20)
5. Source Port: any high port (33890)
6. Destination IP: Our node IP (e.g. 10.5.3.6)
7. Destination Port: 53
8. Transport Protocol: UDP

Internal ref: https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/140399/VM-to-VM-Connectivity-Troubleshooting-TSG

#### Outbound traffic is blocked by the NSG on a different node pool

Same procedure as inbound, but configure the custom NSG to allow traffic on the specific protocol/port (e.g. TCP 30578).

##### Using Azure Portal — Network Watcher

1. Open Network Watcher → NSG diagnostics
2. Target resource type: VMSS network interface (from source)
3. Protocol: TCP
4. Source Type: IPv4 → other Node IP (e.g. 10.224.0.17)
5. Destination port: e.g. 30578
6. Click details to see which rule is blocking

##### Using ASC (Test Traffic)

1. Traffic Direction: **TunnelorLocalIn** (testing inbound to destination)
2. Source IP: e.g. 10.224.0.10
3. Destination IP: e.g. 10.224.0.17
4. Destination Port: 30578
5. Transport Protocol: TCP

**Owner:** mario.chaves <mariochaves@microsoft.com>

---

## Scenario 4: AKS DNS Resolution Troubleshooting Guide
> 来源: mslearn-dns-resolution-troubleshooting.md | 适用: 适用范围未明确

### 排查步骤

#### AKS DNS Resolution Troubleshooting Guide

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/dns/basic-troubleshooting-dns-resolution-problems

#### Overview
Structured workflow for diagnosing DNS resolution failures in AKS using scientific method: collect facts, hypothesize, action plan, observe, repeat.

#### Step 1: Collect Facts
- Where fails: Pod / Node / Both
- Error type: Timeout / No such host / Other
- Frequency: Always / Intermittent / Pattern
- Scope: Specific domain / Any domain
- Custom DNS: VNet custom DNS / CoreDNS custom config

#### Step 2: Test DNS at Each Layer
1. **CoreDNS pod level**: `dig +short <FQDN> @<coredns-pod-ip>` from test pod
2. **CoreDNS service level**: `dig +short <FQDN> @<kube-dns-service-ip>`
3. **Node level**: `dig +short <FQDN> @<node-dns-server>` (from /etc/resolv.conf)
4. **VNet DNS level**: Test upstream DNS servers directly

#### Step 3: Check Health & Performance
- `kubectl get pods -l k8s-app=kube-dns -n kube-system`
- `kubectl top pods -n kube-system -l k8s-app=kube-dns`
- `kubectl top nodes` (check nodes hosting CoreDNS)
- `kubectl logs -l k8s-app=kube-dns -n kube-system`
- Check node resource overcommit: `kubectl describe node | grep -A5 'Allocated resources'`

#### Step 4: Analyze DNS Traffic
- **Real-time**: Inspektor Gadget `trace_dns` gadget
- **Capture**: Dumpy/Retina Capture + Wireshark analysis
- Key metrics: RCODE distribution, query/response mismatch %, max latency

#### Problem Type Classification
| Type | Indicators |
|------|-----------|
| Performance | Resource exhaustion, I/O throttling, high CoreDNS latency |
| Configuration | NXDOMAIN errors, custom DNS/CoreDNS config issues |
| Network | Packet loss, pod-to-pod or north-south connectivity issues |

#### Remediation
- **Performance**: Dedicated system node pool, ephemeral OS disks, Node Local DNS
- **Configuration**: Review CoreDNS custom ConfigMap, VNet DNS settings, private DNS zone links
- **Network**: Check NSG/firewall rules, kube-proxy health, CNI issues

---

## Scenario 5: Real-time DNS Traffic Analysis with Inspektor Gadget
> 来源: mslearn-realtime-dns-analysis.md | 适用: 适用范围未明确

### 排查步骤

#### Real-time DNS Traffic Analysis with Inspektor Gadget

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/dns/troubleshoot-dns-failures-across-an-aks-cluster-in-real-time

#### Prerequisites
- Inspektor Gadget installed on cluster
- `GADGET_VERSION=$(kubectl gadget version | grep Server | awk '{print $3}')`

#### Step 1: Identify Failed DNS Responses
```bash
kubectl gadget run trace_dns:$GADGET_VERSION \
  --all-namespaces \
  --fields k8s.node,src,dst,name,qtype,rcode \
  --filter "qr==R,rcode!=Success"
```

#### Step 2: Identify Slow DNS Queries (>5ms)
```bash
kubectl gadget run trace_dns:$GADGET_VERSION \
  --all-namespaces \
  --fields k8s.node,src,dst,name,qtype,rcode,latency_ns \
  --filter "latency_ns_raw>5000000"
```

#### Step 3: Verify Upstream DNS Server Health
```bash
kubectl gadget run trace_dns:$GADGET_VERSION \
  --all-namespaces \
  --fields src,dst,id,qr,name,nameserver,rcode,latency_ns \
  --filter "nameserver.addr==168.63.129.16"
```

#### Step 4: Verify Specific Query Gets Response
```bash
kubectl gadget run trace_dns:$GADGET_VERSION \
  -l app=test-pod \
  --fields k8s.node,k8s.namespace,k8s.podname,id,qtype,qr,name,rcode,latency_ns \
  --filter name==microsoft.com.
```

#### Step 5: Verify DNS Responses Contain Expected IPs
```bash
kubectl gadget run trace_dns:$GADGET_VERSION \
  --fields k8s.podname,id,qtype,qr,name,rcode,num_answers,addresses \
  --filter name~myheadless
```

#### Key Fields
- `id`: Correlate query with response
- `rcode`: Success/NameError/ServerFailure/Refused
- `latency_ns`: Response time
- `num_answers` / `addresses`: Verify expected IPs

---

## Scenario 6: AKS CoreDNS 日志启用指南
> 来源: onenote-coredns-logging-enable.md | 适用: 适用范围未明确

### 排查步骤

#### AKS CoreDNS 日志启用指南

AKS 1.12.4 起默认使用 CoreDNS 替代 KubeDNS，日志功能默认关闭（性能考虑）。排查 DNS 问题时可临时启用。

> ⚠️ 诊断完成后务必关闭日志，开启日志对性能影响显著。

#### 步骤

##### 1. 创建 coredns-custom ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: coredns-custom
  namespace: kube-system
data:
  test.override: |
    log
```

##### 2. 应用配置（删除旧 ConfigMap，重建）

```bash
kubectl --namespace kube-system delete configmap coredns-custom
kubectl --namespace kube-system create -f coredns-custom.yaml
kubectl --namespace kube-system describe configmap coredns-custom
```

##### 3. 重启 CoreDNS Pod 使配置生效

```bash
kubectl --namespace kube-system delete pod <coredns-pod-name>
```

Pod 会自动重建。

##### 4. 查看日志

```bash
kubectl --namespace kube-system logs <new-coredns-pod-name>
```

#### 注意事项

- 此操作适用于 AKS 1.12.4+（CoreDNS 版本）
- 日志开启后每条 DNS 查询都会记录，生产环境请谨慎并尽快关闭
- 关闭方法：将 ConfigMap 中的 `log` 行删除并重建，然后重启 CoreDNS pod

---
