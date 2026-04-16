# AKS 网络连通性通用 — api-server — 排查工作流

**来源草稿**: ado-wiki-a-aks-network-performance-troubleshooting.md, ado-wiki-aks-api-connectivity-hands-on-labs.md, ado-wiki-c-Monitoring-API-Server-performance.md, ado-wiki-c-VM-Performance-Troubleshooting-Guideline.md, ado-wiki-d-API-Server-VNet-Integration.md, ado-wiki-network-capture-kubectl-plugin.md, mslearn-api-server-connection-basic-troubleshooting.md
**Kusto 引用**: api-throttling-analysis.md
**场景数**: 7
**生成日期**: 2026-04-07

---

## Scenario 1: Troubleshoot AKS Network Performance Issues
> 来源: ado-wiki-a-aks-network-performance-troubleshooting.md | 适用: 适用范围未明确

### 排查步骤

#### Troubleshoot AKS Network Performance Issues

#### Packet Capture Tools

- **tcpdump** (Linux): [How to take captures with TCPDUMP](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/140089/TCPdump)
- **Wireshark filters**: [Capture filters reference](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/733061/Wireshark-Capture-Filters)
  - [Wireshark Profiles](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/620043/Wireshark-Profiles)
  - [How to merge PCAP files](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/690207/How-to-merge-Packet-capture-(PCAP)-files-using-Wireshark)
- **tcpdump from Windows and Linux** (commands): [Take tcpdump from NVA](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-troubleshoot-nva#capture-network-trace)

#### Testing Network Performance in AKS

See internal wiki: [Testing network performance in AKS](/Azure-Kubernetes-Service-Wiki/AKS/How-Tos/Networking/Testing-network-performance-in-AKS)

#### Latency Testing

To test latency between VMs:
- **Windows**: Use [Latte](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-test-latency)
- **Linux**: Use [SockPerf](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-test-latency)

More information: [Test network latency between Azure VMs](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-test-latency)

---

## Scenario 2: Public Cluster - API Server Unreachable (Authorized IP Ranges)
> 来源: ado-wiki-aks-api-connectivity-hands-on-labs.md | 适用: 适用范围未明确

### 排查步骤

Public Cluster - API Server Unreachable (Authorized IP Ranges)

**Pattern:** DNS resolves fine but TCP 443 times out on a public cluster.

##### Diagnostic Steps
1. The 3 triage questions: Is it private? From where? Hard or soft failure?
2. Run: `nslookup $FQDN`, `curl -kIv --connect-timeout 10 "https://$FQDN"`, `kubectl get nodes -v7 --request-timeout=5s`
3. Classify: Hard failure = TCP 443 consistently times out, no TLS handshake

##### Root Cause
API server authorized IP ranges enabled but client's egress IP not in allow list. VPN/proxy/firewall NAT can cause actual egress IP to differ from `ifconfig.me`.

##### Fix
```bash
MY_IP=$(curl -s ifconfig.me)
EXISTING=$(az aks show -g <rg> -n <aks> --query "apiServerAccessProfile.authorizedIpRanges[]" -o tsv | paste -sd,)
az aks update -g <rg> -n <aks> --api-server-authorized-ip-ranges "$EXISTING,$MY_IP/32"
```

**Tip:** Verify actual egress IP Azure sees via portal NSG → Add inbound rule → Source "My IP address" → read the auto-populated IP.

---

## Scenario 3: Monitoring API Server Performance
> 来源: ado-wiki-c-Monitoring-API-Server-performance.md | 适用: 适用范围未明确

### 排查步骤

#### Monitoring API Server Performance

#### Background

Customer may experience apiserver performance issues when applying Kubernetes applications. Troubleshooting involves reviewing master component performance metrics.

| Visibility        | Method            |
| ----------------- | ----------------: |
| etcd object count | apiserver metrics |
| request volume    | audit log         |
| request latency   | audit log         |

#### Monitoring via Apiserver Metrics

Kube-apiserver provides Prometheus-format metrics via `/metrics` endpoint. View all metrics with:
```bash
kubectl get --raw /metrics
```

> Note: Metrics are per-apiserver. Due to HA, requests hit different apiservers, limiting usefulness to etcd metrics.

##### Prerequisites

Enable Azure Monitoring for AKS and configure Prometheus scraping via ConfigMap:

```yaml
kind: ConfigMap
apiVersion: v1
metadata:
  name: container-azm-ms-agentconfig
  namespace: kube-system
data:
  schema-version: v1
  config-version: ver1
  prometheus-data-collection-settings: |-
    [prometheus_data_collection_settings.cluster]
        interval = "5m"
        fieldpass = ["etcd_object_counts"]
        urls = ["https://kubernetes.default:443/metrics"]
```

##### Etcd Object Counts Query

```kql
InsightsMetrics
| where Name == 'etcd_object_counts'
| extend labels = parse_json(Tags)
| project TimeGenerated, Val, tostring(labels.resource)
| render timechart
```

#### Monitoring via Audit Logs

##### Prerequisites

Enable `kube-audit` in master component logs. Note: `kube-audit-admin` excludes read-only API calls (get/list).

##### Base Query

```kql
let ResourceId = '<AKS-resource-ID>';
AzureDiagnostics
| where ResourceId has ResourceId
| where Category contains 'kube-audit'
| extend event = parse_json(log_s)
| where event.stage == "ResponseComplete"
| extend responseCode = toint(event.responseStatus.code)
| where responseCode between (200 .. 299)
| extend verb = tostring(event.verb),
         requestURI = tostring(event.requestURI),
         user = tostring(event.user.username),
         userAgent = tostring(event.userAgent),
         latency = datetime_diff('Millisecond', todatetime(event.stageTimestamp), todatetime(event.requestReceivedTimestamp))
| project TimeGenerated, verb, requestURI, responseCode, user, userAgent, latency
```

##### Request Volume
```kql
// Append to base query
| summarize count() by verb, bin(TimeGenerated, 1m)
| render timechart
```

##### Request Volume by User
```kql
// Append to base query
| summarize count() by user, userAgent, verb
| order by count_ desc
| take 10
```

##### Request Latency
```kql
// Append to base query
| summarize percentiles(latency, 99, 90, 50) by tostring(verb)
```

---

## Scenario 4: Troubleshooting Flow
> 来源: ado-wiki-c-VM-Performance-Troubleshooting-Guideline.md | 适用: 适用范围未明确

### 排查步骤

1. Check which node(s) the customer is complaining about.

2. Search for the node in ASC. Collect the VM ID of the node(s) and check the VM size, limits and disks.

   > NOTE: ASC also allows you to check specific metrics individually. Access via "MC Infra Resource Group" link and check `virtualMachineScaleSets` under `Microsoft.Compute` and analyze individual VMSS instances.

   Pay special attention to:
   - Whether the disk is burst capable
   - Whether the VM is burst capable
   - Reference: [Managed disk bursting](https://learn.microsoft.com/en-us/azure/virtual-machines/disk-bursting)

3. Go to [Azure Service Insights](https://asi.azure.ms). Search for AKS > Managed Cluster and locate the cluster by Resource ID.

   - Locate the link for the target node under Cluster Nodes.
   - Under "Node Details", click "VM Performance" to get relevant VM metrics in Jarvis.

   > **Hint:** When checking Disk QD blade, if you see QD above 10, usually it means some disk limits are being reached. Due to all requests getting throttled on disk, this leads to higher CPU consumption as a consequence.

   **Relevant TSGs**:
   - [TSG: node CPU Usage evaluation](https://eng.ms/docs/cloud-ai-platform/azure-edge-platform-aep/aep-health-standards/fundamentals/interruption-management/interruption-management/content/dashboards/tsg_evaluate_cpu_usage)
   - Network I/O flow limits: [Flow limits and active connections recommendations](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-machine-network-throughput#flow-limits-and-active-connections-recommendations)

4. Check node performance in ASI: [Using ASI to Check Node Performance](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Compute/Using-ASI-to-Check-Node-Performance.md)

5. If you observe metrics indicating a performance issue, open a collaboration with the VM team.

---

## Scenario 5: API Server VNet Integration
> 来源: ado-wiki-d-API-Server-VNet-Integration.md | 适用: 适用范围未明确

### 排查步骤

#### API Server VNet Integration


#### Overview

An Azure Kubernetes Service (AKS) cluster with API Server VNet Integration configured projects the API server endpoint directly into a delegated subnet in the VNet where AKS is deployed. This enables network communication between the API server and the cluster nodes without any required private link or tunnel. This means no more tunnelfront/aks-link.

#### How check whether APIServer Vnet Integration is enabled or not?

Get managed cluster with api-version >= 2022-04-02-preview, if you found the following configurations, then the cluster has enabled APIServer Vnet Integration. Or else, it is PrivateLink private cluster.

```json
{
    "apiServerAccessProfile": {
      "enablePrivateCluster": true,
      "enableVnetIntegration": true
   }
}
```

##### DNC (Delegated Network Controller) Logs

Delegated Network Controller (DNC) is a controller provides network management capability to AKS infra container orchestrator. DNC runs as a deployment on each underlay cluster.

Execute: [[Web](https://dataexplorer.azure.com/clusters/https%3a%2f%2faks.kusto.windows.net/databases/AKSprod?query=H4sIAAAAAAAEAGWPQWvCQBCF74H8h8FTAqYq9JpebK8itJ5l2H3E2M3uMjtpFfzxbkLBlh7m8t773sysVvS625ILXSqLbfAqwe0de7x9wWvWbvR9goD2AtMnfPQD3pWHSC%2fEXag2tn5kDCu6IFdqW1pYbxYP6%2bAtxPF1xwNm%2b2RiM%2f6Ijcm7hN2YMHJszKV5nlFcFN5Ox1FLkSXheE7BV1FChGiPVP%2bKxWBbDUml912Vmacs1MuJ%2fivnmbHccobRf58tp6aZm1LKn6DNel0WZXEHAzZVWS0BAAA%3d)] [[Desktop](https://aks.kusto.windows.net/AKSprod?query=H4sIAAAAAAAEAGWPQWvCQBCF74H8h8FTAqYq9JpebK8itJ5l2H3E2M3uMjtpFfzxbkLBlh7m8t773sysVvS625ILXSqLbfAqwe0de7x9wWvWbvR9goD2AtMnfPQD3pWHSC%2fEXag2tn5kDCu6IFdqW1pYbxYP6%2bAtxPF1xwNm%2b2RiM%2f6Ijcm7hN2YMHJszKV5nlFcFN5Ox1FLkSXheE7BV1FChGiPVP%2bKxWBbDUml912Vmacs1MuJ%2fivnmbHccobRf58tp6aZm1LKn6DNel0WZXEHAzZVWS0BAAA%3d&web=0)] <https://aks.kusto.windows.net/AKSprod>

```sql
// DNC logs
cluster("Aksccplogs.centralus").database("AKSccplogs").ControlPlaneEvents
| where PreciseTimeStamp > ago(1d)
| where category == "dnc"
| where UnderlayName == "{Underlay_Name}"
| extend log = parse_json(properties)
| extend pod=tostring(log.pod), log=tostring(log.log)
| project PreciseTimeStamp, pod, log
| take 100
```

##### PCC (PrivateConnect Controller) Logs

PrivateConnect Controller (PCC) is an operator which provides customer subnet projection management via Kubernetes CRDs. It runs as a sidecar of DNC on each underlay cluster.

Execute: [[Web](https://dataexplorer.azure.com/clusters/https%3a%2f%2faks.kusto.windows.net/databases/AKSprod?query=H4sIAAAAAAAEAGWPQWvDMAyF74H8B9FTAvXawq7ZJew6AtvOQzgidetYRla6FvbjZ4dBN3YQQo%2f3PZ52Oxj6HjxPqa56DirsB4%2bBni8UNGtf8HkkIRiErEv05mZ6VZwjPAFO3BzG9u6xqDSx3KDrYBPFXfJtLIdAVssu4Z5kcyfew0ji8faCM63U0Uaz%2fIjG5gqCfkm0YDT2ah5XlK5KYSydoYOIkujjlDg0UTiSqKPU%2frJFHjvlpOLC1GTmIQvtttB%2f5TwrllNOue%2b%2fh7claeWKS%2fFMcNjv66quvgE57Az6RAEAAA%3d%3d)] [[Desktop](https://aks.kusto.windows.net/AKSprod?query=H4sIAAAAAAAEAGWPQWvDMAyF74H8B9FTAvXawq7ZJew6AtvOQzgidetYRla6FvbjZ4dBN3YQQo%2f3PZ52Oxj6HjxPqa56DirsB4%2bBni8UNGtf8HkkIRiErEv05mZ6VZwjPAFO3BzG9u6xqDSx3KDrYBPFXfJtLIdAVssu4Z5kcyfew0ji8faCM63U0Uaz%2fIjG5gqCfkm0YDT2ah5XlK5KYSydoYOIkujjlDg0UTiSqKPU%2frJFHjvlpOLC1GTmIQvtttB%2f5TwrllNOue%2b%2fh7claeWKS%2fFMcNjv66quvgE57Az6RAEAAA%3d%3d&web=0)] <https://aks.kusto.windows.net/AKSprod>

```sql
cluster("Aksccplogs.centralus").database("AKSccplogs").ControlPlaneEvents
| where PreciseTimeStamp > ago(1d)
| where category == "private-connect-controller"
| where UnderlayName == "{Underlay_Name}"
| extend log = parse_json(properties)
| extend pod=tostring(log.pod), log=tostring(log.log)
| project PreciseTimeStamp, pod, log
| take 100
```

##### CNS (Container Network Service) Logs

Container Network Service (CNS) is an agent that DNC communicates with to store the network container goal state which is used when creating containers via CNI. It can also create network adapters and program the assigned customer address on it. CNS runs as a daemonset on each underlay cluster.

Execute: [[Web](https://dataexplorer.azure.com/clusters/https%3a%2f%2faks.kusto.windows.net/databases/AKSprod?query=H4sIAAAAAAAEAGWPMWvDMBCFd4P%2fw5HJhqhJoKu7hK4hkHYuh%2fxwlMqSOJ3bBPrjK5tCWjrc8vi%2bd3ebDe0PJ%2fJxyHW1j0El%2bqPngOcPBC3ZF32eIaCjwLqMFzfipDwmeiIeYrPr2ztjWTFEuVHX0cqGbGwpZBcgqzv0GnqI59uBRyzg2SYz%2fYTGlq3CfsqYOBl7NY%2bLiqsi9POZ1FFiyXi75BiaJDFB1CG3v7AU%2b05jVnFhaIrzUIJ2Pdt%2f4zKLVlousPrvx%2fXctHgzpfwO2m23dVVX36KfcQM3AQAA)] [[Desktop](https://aks.kusto.windows.net/AKSprod?query=H4sIAAAAAAAEAGWPMWvDMBCFd4P%2fw5HJhqhJoKu7hK4hkHYuh%2fxwlMqSOJ3bBPrjK5tCWjrc8vi%2bd3ebDe0PJ%2fJxyHW1j0El%2bqPngOcPBC3ZF32eIaCjwLqMFzfipDwmeiIeYrPr2ztjWTFEuVHX0cqGbGwpZBcgqzv0GnqI59uBRyzg2SYz%2fYTGlq3CfsqYOBl7NY%2bLiqsi9POZ1FFiyXi75BiaJDFB1CG3v7AU%2b05jVnFhaIrzUIJ2Pdt%2f4zKLVlousPrvx%2fXctHgzpfwO2m23dVVX36KfcQM3AQAA&web=0)] <https://aks.kusto.windows.net/AKSprod>

```sql
// CNS logs
cluster("Aksccplogs.centralus").database("AKSccplogs").ControlPlaneEvents
| where PreciseTimeStamp > ago(1d)
| where category == "cns-container"
| where UnderlayName == "{Underlay_Name}"
| extend log = parse_json(properties)
| extend pod=tostring(log.pod), log=tostring(log.log)
| project PreciseTimeStamp, pod, log
| take 100
```

##### PCB (Private Connect Balancer) Logs

Private Connect Balancer (PCB) is an operator which reconciles kube-apiserver ILB in node resource group based on MultiTenantNetworkContainer CRD in the CCP namespace. It runs as a deployment in each CCP namespace.

Execute: [[Web](https://dataexplorer.azure.com/clusters/https%3a%2f%2faks.kusto.windows.net/databases/AKSccplogs?query=H4sIAAAAAAAEAGWPQUsDQQyF74X%2bh9DTFtoyY7W0hxVEvEpB%2f0A6E7ajs8kwE6sFf7yze3HFY9773kvywUEYHoU1SzxGZHq6EGt5iHE%2b%2b4bPM2WCYyYXCr2Gnl4U%2bwT3gJ001i9%2fGefSM%2fZUEjqCtoXFzu532zvrDoS3p70xxm7pBr1ZTDKo1Em%2bjnzK4VLntRNmcro%2bYb3GUR55%2blJiDwlaUPFXxj64JmVJlDVQWU6YKN1IFc2BuyZtqjD1k%2fi%2ffhVGv9a91cX%2fvl0NkdXQO1CK7wTWmPnsBwuUllE7AQAA)] [[Desktop](https://aks.kusto.windows.net/AKSccplogs?query=H4sIAAAAAAAEAGWPQUsDQQyF74X%2bh9DTFtoyY7W0hxVEvEpB%2f0A6E7ajs8kwE6sFf7yze3HFY9773kvywUEYHoU1SzxGZHq6EGt5iHE%2b%2b4bPM2WCYyYXCr2Gnl4U%2bwT3gJ001i9%2fGefSM%2fZUEjqCtoXFzu532zvrDoS3p70xxm7pBr1ZTDKo1Em%2bjnzK4VLntRNmcro%2bYb3GUR55%2blJiDwlaUPFXxj64JmVJlDVQWU6YKN1IFc2BuyZtqjD1k%2fi%2ffhVGv9a91cX%2fvl0NkdXQO1CK7wTWmPnsBwuUllE7AQAA&web=0)] <https://aks.kusto.windows.net/AKSccplogs>

```sql
cluster("Aksccplogs.centralus").database("AKSccplogs").ControlPlaneEventsAll
| where PreciseTimeStamp > ago(1d)
| where ccpNamespace == "{ccp_Namespace}"
| where category == "private-connect-balancer"
| extend p = todynamic(properties)
| extend log = tostring(p.log)
| extend pod = tostring(p.pod)
| project PreciseTimeStamp, pod, log
| take 100
```

#### PCR (Private Connect Router) Logs

Private Connect Router (PCR) is an operator which reconciles kube-apiserver's routes to customer nodes. It runs as a sidecar of kube-apiserver in CCP namespace.

Execute: [[Web](https://dataexplorer.azure.com/clusters/https%3a%2f%2faks.kusto.windows.net/databases/AKSccplogs?query=H4sIAAAAAAAEAGWPQUvDQBCF74H8h6GnFNqya7W0hwgiXqWgf2DdHdLVzcwyO60W%2fPEmuRjxOO997w3vTJEJHplUOB2TI3y6IGl5SKmuvuHzhIJwFPSx4Gvs8UVdn%2bEeXMeNDctfxvv87Hos2XmEtoXFzu532zvrD%2bhu3%2fbGGLvFGxfMYpZxih3LdeKzxMtwrz0Tode18FlRJhq%2fFClAhhaUw5VcH32ThTOKRizLGZO4m6iiEqlr8mYQ5n7m8NcfhMkf6t6Ht%2f%2b2rsbIauwdKXUfCNaYuqqrHw6zw4A7AQAA)] [[Desktop](https://aks.kusto.windows.net/AKSccplogs?query=H4sIAAAAAAAEAGWPQUvDQBCF74H8h6GnFNqya7W0hwgiXqWgf2DdHdLVzcwyO60W%2fPEmuRjxOO997w3vTJEJHplUOB2TI3y6IGl5SKmuvuHzhIJwFPSx4Gvs8UVdn%2bEeXMeNDctfxvv87Hos2XmEtoXFzu532zvrD%2bhu3%2fbGGLvFGxfMYpZxih3LdeKzxMtwrz0Tode18FlRJhq%2fFClAhhaUw5VcH32ThTOKRizLGZO4m6iiEqlr8mYQ5n7m8NcfhMkf6t6Ht%2f%2b2rsbIauwdKXUfCNaYuqqrHw6zw4A7AQAA&web=0)] <https://aks.kusto.windows.net/AKSccplogs>

```sql
cluster("Aksccplogs.centralus").database("AKSccplogs").ControlPlaneEventsAll
| where PreciseTimeStamp > ago(1d)
| where ccpNamespace == "{ccp_Namespace}"
| where category == "private-connect-router"
| extend p = todynamic(properties)
| extend log = tostring(p.log)
| extend pod = tostring(p.pod)
| project PreciseTimeStamp, pod, log
| take 100
```

#### Connection troubleshooting

When APIServerVnetIntegration is enabled, apiserver pods will have 2 nics, eth0 is on aks underlay while eth1 is projected to customer's vnet.

1. eth1 has IP address allocated in customer's vnet.
2. agent nodes talk to apiserver via eth1 IPAddr directly (balanced by an iLB),
3. apiserver talks to workloads on agent nodes via eth1, we don't have konnectivity agent, openvpn client, or tunnel-front on agent nodes anymore.

If there are any connection issues, we will need to escalate to PG.

#### References

- Private Cluster v2 design proposal: <https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki/141703/Private-Cluster-v2>
- Public Docs: <https://learn.microsoft.com/en-us/azure/aks/api-server-vnet-integration>
- PG Wiki: <https://dev.azure.com/msazure/CloudNativeCompute/_wiki/wikis/aks-troubleshooting-guide/240785/APIServer-Vnet-Integration-PrivateCluster-TSG>

#### Owner and Contributors

**Owner:** Luis Alvarez <lualvare@microsoft.com>
**Contributors:**

- Jordan Harder <joharder@microsoft.com>

---

## Scenario 6: Network packet capture on AKS Linux nodes with kubectl plugin
> 来源: ado-wiki-network-capture-kubectl-plugin.md | 适用: 适用范围未明确

### 排查步骤

#### Network packet capture on AKS Linux nodes with kubectl plugin

#### Summary

kubectl plugin to facilitate network traffic capture on AKS Linux nodes with optional upload to a Storage Account Container through azcopy.

#### Prerequisites

- Bash instance
- Working AKS cluster with kubectl configured
- SAS URL environment variable (`SAS`) with Write access for uploading results

#### Implementation

The plugin deploys a privileged DaemonSet with an Alpine container that:
1. Uses `nsenter` to access the host network namespace
2. Downloads azcopy binary
3. Runs `tcpdump` for the specified duration
4. Uploads capture file to Storage Account via azcopy

Usage:
```bash
kubectl netdumps <nodeName> <captureTime(s)>
#### Example:
kubectl netdumps akswin0001 30
```

The DaemonSet uses:
- `hostPID: true` and `privileged: true` security context
- `nsenter --target 1 --mount --uts --ipc --net --pid` to access host namespace
- Node selector: `kubernetes.io/os: linux`
- Tolerations for NoSchedule

#### Notes

- Set SAS environment variable before running: `export SAS=yourSasUrl`
- To skip upload, set a dummy SAS value and comment out the azcopy line

---

## Scenario 7: API Server Connection Basic Troubleshooting (AKS)
> 来源: mslearn-api-server-connection-basic-troubleshooting.md | 适用: Mooncake ✅

### 排查步骤

#### API Server Connection Basic Troubleshooting (AKS)

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/troubleshoot-cluster-connection-issues-api-server
> Status: draft (from mslearn-scan)

#### Overview
Structured checklist for diagnosing AKS API server connectivity failures (network, auth, authz).

#### Checklist

##### 1. Verify FQDN Resolution
```bash
az aks show --resource-group <rg> --name <cluster> --query fqdn
nslookup <cluster-fqdn>
```
Note: After stop/start, API server IP may change. Flush DNS cache.

##### 2. Test API Server Reachability
```bash
curl -k -Iv https://<cluster-fqdn>
telnet <cluster-fqdn> 443
```

##### 3. Private Cluster Check
If cluster is private, must connect from a VM in the same VNet or peered network.
See: [Options for connecting to private cluster](https://learn.microsoft.com/en-us/azure/aks/private-clusters#options-for-connecting-to-the-private-cluster)

##### 4. Authorized IP Ranges
If using API server authorized IP ranges, ensure client IP is included.
See: [Client IP cannot access API server](client-ip-address-cannot-access-api-server)

##### 5. kubectl Version Compatibility
Must be within 2 minor versions of cluster version.
```bash
sudo az aks install-cli
kubectl version --client
```

##### 6. Kubeconfig Validity
Ensure kubeconfig is valid and accessible.
See: [Config file not available when connecting](config-file-is-not-available-when-connecting)

##### 7. Firewall Egress Rules
Ensure firewall allows minimum required egress rules for AKS.
See: [AKS outbound rules](https://learn.microsoft.com/en-us/azure/aks/limit-egress-traffic)

##### 8. NSG Port 10250
Ensure NSG allows TCP 10250 communication within AKS nodes.

#### 21V Applicability
Applicable. Use corresponding 21V FQDN endpoints.

---

## 附录: Kusto 诊断查询

### 来源: api-throttling-analysis.md

# API Server 请求和 Throttling 分析

## 用途

分析 Kubernetes API Server 的请求模式、错误统计和 Throttling 情况。

## 使用场景

1. **性能问题诊断** - API Server 响应慢
2. **Throttling 分析** - 429 错误排查
3. **请求模式分析** - 识别高频请求来源

## 查询 1: API 错误统计

```kql
let queryFrom = datetime('{starttime}');
let queryTo = datetime('{endtime}');
let queryCcpNamespace = '{ccpNamespace}';
union ControlPlaneEvents, ControlPlaneEventsNonShoebox
| where PreciseTimeStamp between(queryFrom .. queryTo)
| where ccpNamespace == queryCcpNamespace
| where category == 'kube-audit'
| extend p = parse_json(properties)
| extend event = parse_json(tostring(p.log))
| extend verb = tostring(event.verb)
| extend user = tostring(event.user.username)
| extend reason = tostring(event.responseStatus.reason)
| extend status = tostring(event.responseStatus.status)
| extend code = tostring(event.responseStatus.code)
| extend subresource = tostring(event.objectRef.subresource)
| extend pod = tostring(p.pod)
| extend objectRefname = tostring(event.objectRef.name)
| extend userAgent = tostring(event.userAgent)
| extend clientIp = tostring(event.sourceIPs[0])
| extend latency = datetime_diff('millisecond', todatetime(tostring(event.stageTimestamp)),
                                 todatetime(tostring(event.requestReceivedTimestamp)))
| where code != "200" and code != "201"
| summarize count() by reason, clientIp, code, status, userAgent, verb, objectRefname
| order by count_ desc
```

## 查询 2: API 请求 Throttling 分析

```kql
let queryFrom = datetime('{starttime}');
let queryTo = datetime('{endtime}');
let queryCcpNamespace = '{ccpNamespace}';
union ControlPlaneEventsNonShoebox, ControlPlaneEvents
| where PreciseTimeStamp between(queryFrom .. queryTo)
| where ccpNamespace == queryCcpNamespace
| where category == 'kube-audit'
| extend p = parse_json(properties)
| extend event = parse_json(tostring(p.log))
| where event.stage == "ResponseComplete"
| where event.verb != "watch"
| where event.objectRef.subresource !in ("proxy", "exec")
| extend verb = tostring(event.verb)
| extend code = tostring(event.responseStatus.code)
| extend lat = datetime_diff('Millisecond', todatetime(event.stageTimestamp),
                              todatetime(event.requestReceivedTimestamp))
| summarize count() by code, bin(PreciseTimeStamp, 1m)
| render timechart
```

## 查询 3: 请求延迟分布

```kql
let queryFrom = datetime('{starttime}');
let queryTo = datetime('{endtime}');
let queryCcpNamespace = '{ccpNamespace}';
union ControlPlaneEventsNonShoebox, ControlPlaneEvents
| where PreciseTimeStamp between(queryFrom .. queryTo)
| where ccpNamespace == queryCcpNamespace
| where category == 'kube-audit'
| extend p = parse_json(properties)
| extend event = parse_json(tostring(p.log))
| where event.stage == "ResponseComplete"
| where event.verb != "watch"
| extend verb = tostring(event.verb)
| extend resource = tostring(event.objectRef.resource)
| extend lat = datetime_diff('Millisecond', todatetime(event.stageTimestamp),
                              todatetime(event.requestReceivedTimestamp))
| summarize
    p50 = percentile(lat, 50),
    p90 = percentile(lat, 90),
    p99 = percentile(lat, 99),
    max_lat = max(lat),
    count = count()
  by verb, resource
| order by p99 desc
```

## 查询 4: 高频请求用户

```kql
let queryFrom = datetime('{starttime}');
let queryTo = datetime('{endtime}');
let queryCcpNamespace = '{ccpNamespace}';
union ControlPlaneEventsNonShoebox, ControlPlaneEvents
| where PreciseTimeStamp between(queryFrom .. queryTo)
| where ccpNamespace == queryCcpNamespace
| where category == 'kube-audit'
| extend p = parse_json(properties)
| extend event = parse_json(tostring(p.log))
| where event.stage == "ResponseComplete"
| extend user = tostring(event.user.username)
| extend userAgent = tostring(event.userAgent)
| extend verb = tostring(event.verb)
| summarize count() by user, userAgent, verb
| order by count_ desc
| take 50
```

## HTTP 状态码说明

| 状态码 | 含义 | 可能原因 |
|-------|------|---------|
| 429 | Too Many Requests | API Throttling |
| 500 | Internal Server Error | API Server 内部错误 |
| 503 | Service Unavailable | API Server 不可用 |
| 504 | Gateway Timeout | 请求超时 |
| 401 | Unauthorized | 认证失败 |
| 403 | Forbidden | 授权失败 |

## 注意事项

- 429 错误通常表示 API Server 正在进行流量控制
- 关注 userAgent 中的自定义应用可能产生过多请求
- 建议分析 p99 延迟而不是平均延迟

---
