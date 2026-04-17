# AKS 外部负载均衡器与 SNAT — networking — 排查工作流

**来源草稿**: ado-wiki-a-SNAT-Port-Exhaustion.md, ado-wiki-aks-traffic-analytics-nsg-flow-logs.md, mslearn-snat-port-exhaustion-diagnostic.md
**Kusto 引用**: 无
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: Troubleshooting SNAT Port Exhaustion
> 来源: ado-wiki-a-SNAT-Port-Exhaustion.md | 适用: 适用范围未明确

### 排查步骤

#### Troubleshooting SNAT Port Exhaustion


#### Overview

This document guides through finding the high-connection generating Pods to mitigate heavy outbound connections causing SNAT port exhaustion.

**Note:** If locating SNAT port exhaustion on AKS nodes running Kubernetes-jobs, follow the procedure only when jobs are actively running on the nodes.

#### Step 1: Identify SNAT Exhaustion via Azure Portal

1. Locate the default kubernetes load balancer in the AKS cluster's resource group
2. Use load balancer metrics portal to identify nodes experiencing SNAT port exhaustion: [Check SNAT port usage and allocation](https://learn.microsoft.com/en-us/azure/load-balancer/load-balancer-standard-diagnostics#how-do-i-check-my-snat-port-usage-and-allocation)

Reference: [SNAT ports and allocation per VM](https://learn.microsoft.com/en-us/azure/load-balancer/load-balancer-outbound-connections#what-are-snat-ports)

#### Step 2: Identify AKS Node Name

```bash
kubectl get nodes -o wide | grep <node IP>
```

#### Step 3: TCPTracer - Find Heavy Connections

**Note:** bcc-tools are pre-installed on Linux AKS nodes. Use node-shell tool to access.

Install node-shell:
```bash
curl -LO https://github.com/kvaps/kubectl-node-shell/raw/master/kubectl-node_shell
chmod +x ./kubectl-node_shell
sudo mv ./kubectl-node_shell /usr/local/bin/kubectl-node_shell
```

SSH to node and run tcptracer:
```bash
kubectl node-shell <node name>
cd /usr/share/bcc/tools
python3 tcptracer -t4v
```

Sort output to find top connections:
```bash
python3 tcptracer -t4v > log
head -n +2 log | tail -n 1 | awk '{print "Count",$6,$10}'; awk '{print $6,$10}' log | sort | uniq -c | sort -nrk 1 | column -t
```

#### Step 4: LSNS - Map NETNS to PID

```bash
lsns -t net
```

Note the NETNS with most connections from tcptracer output, find corresponding PID.

#### Step 5: PSTree - Map PID to Container

```bash
pstree -aps <PID>
```

Look for the containerd-shim process and its container ID.

#### Step 6: CRICTL - Map Container to Pod

```bash
crictl ps -a
```

Use first 5 characters of containerd id from pstree to find the POD ID and pod name.

#### Step 7: Verify with Netstat

```bash
#### List all pods on the node
kubectl get pods --all-namespaces -o wide --field-selector spec.nodeName=<nodename>

#### Exec into the identified pod
kubectl exec -it <pod name> -n <namespace> /bin/bash

#### For Linux - install and run netstat
apt update && apt install net-tools
netstat -ptn | grep -i established

#### For Windows
kubectl exec -it <windows pod name> -- cmd.exe
netstat -aon | find /i "established"
```

Count only ESTABLISHED connections to **public IP addresses** (ignore private IPs). The pod with most public IP connections is causing SNAT exhaustion.

#### Remediation

Work with application developers to tune the application using recommendations from:
https://learn.microsoft.com/en-us/azure/load-balancer/troubleshoot-outbound-connection#design-connection-efficient-applications

---

## Scenario 2: AKS Traffic Analytics with NSG Flow Logs
> 来源: ado-wiki-aks-traffic-analytics-nsg-flow-logs.md | 适用: 适用范围未明确

### 排查步骤

#### AKS Traffic Analytics with NSG Flow Logs

#### Objective

Network traffic analysis in context of Azure Kubernetes Services managed cluster could be a complex task as it could involve installation of third-party products on the cluster's Node, manually capturing network traffic with or without the necessary filters and exporting the results to an external destination in order to be analyzed. NSG FlowLogs combined with Traffic Analytics will simplify the process and would provide a significant support in troubleshooting network connectivity.

#### Setup Steps

1. **Enable NSG Flow Logs**: Open the Network Security Group Resource -> Monitoring -> NSG flow logs panel
2. Click Create, select the NSG to monitor and provide a Storage Account for records
3. Set retention day value
4. Choose **Version 2** of Flow Logs and enable **Traffic Analytics**
5. Provide a **Log Analytics Workspace** for flow logging data

#### Viewing Traffic Analytics

Once NSG Flow Logs is linked to Log Analytics Workspace, go to **Network Watcher -> Logs -> Traffic Analytics** in Azure Portal.

Select resources including the Resource Group where NSG is located and the Time Interval.

The dashboard provides:
- Number of flows
- Deployed Region and VNet
- Total number of NSG monitored
- Subnets
- Traffic distribution (Total, Malicious, Blocked, Frequent conversation flows)

#### Raw Capture Data

Raw traffic capture is available as JSON from the configured Storage Account in a hierarchical structure:
`Subscription -> Resource Group -> Microsoft Network -> NSG -> NodePool name -> year/month/day/hour`

Flow log JSON format example:
```json
{
  "records": [
    {
      "time": "2023-01-06T08:00:32.7787936Z",
      "macAddress": "6045BDF32344",
      "category": "NetworkSecurityGroupFlowEvent",
      "resourceId": "/SUBSCRIPTIONS/.../NETWORKSECURITYGROUPS/AKS-AGENTPOOL-...-NSG",
      "properties": {
        "Version": 2,
        "flows": [
          {
            "rule": "DefaultRule_AllowInternetOutBound",
            "flows": [
              {
                "mac": "6045BDF32344",
                "flowTuples": [
                  "timestamp,srcIP,dstIP,srcPort,dstPort,protocol,direction,action,state,..."
                ]
              }
            ]
          }
        ]
      }
    }
  ]
}
```

#### Log Analytics Tables

Traffic Analytics logs are sent to Log Analytics Workspace through custom logging tables:
- **AzureNetworkAnalytics_CL** — main traffic analytics data
- **AzureNetworkAnalyticsIPDetails_CL** — IP detail information

---

## Scenario 3: SNAT Port Exhaustion Diagnostic Guide (AKS)
> 来源: mslearn-snat-port-exhaustion-diagnostic.md | 适用: Mooncake ✅

### 排查步骤

#### SNAT Port Exhaustion Diagnostic Guide (AKS)

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/snat-port-exhaustion
> Status: draft (from mslearn-scan)

#### Overview
Multi-step diagnostic procedure to identify which pod on an AKS node is causing SNAT port exhaustion.

#### Step 1: Locate the Exhausted Node
1. Navigate to AKS cluster resource group → find default Kubernetes load balancer
2. Check SNAT port usage/allocation on LB metrics page → identify node IP with exhaustion
3. Map node IP to node name: `kubectl get nodes -o wide | grep <node IP>`

#### Step 2: Locate the Pod with High Outbound Connections (Linux)
1. Install kubectl-node-shell: `curl -LO https://github.com/kvaps/kubectl-node-shell/raw/master/kubectl-node_shell`
2. SSH into the node: `kubectl node-shell <node name>`
3. Run tcptracer: `cd /usr/share/bcc/tools && python3 tcptracer -t4v`
4. Write output to log, sort by connection count:
   ```bash
   python3 tcptracer -t4v > log
   head -n +2 log | tail -n 1 | awk '{print "Count",$6,$10}'; awk '{print $6,$10}' log | sort | uniq -c | sort -nrk 1 | column -t
   ```
5. Map SADDR/NETNS to PID: `lsns -t net`
6. Map PID to containerd: `pstree -aps <PID>`
7. Map containerd ID to pod: `crictl ps -a`
8. Confirm pod: `kubectl get pods --all-namespaces -o wide --field-selector spec.nodeName=<nodename>`

#### Step 3: Find All Outbound Connections
##### Linux Pod
```bash
kubectl exec -it <pod> -n <ns> -- /bin/bash
apt-get update && apt-get install net-tools
netstat -ptn | grep -i established
```

##### Windows Pod
```cmd
kubectl exec -it <pod> -- cmd.exe
netstat -aon | find /i "established"
```

Count ESTABLISHED connections to public IPs (not private). The pod with most public IP connections is causing SNAT exhaustion.

#### Resolution
- Work with app developers to tune application for connection efficiency
- Reference: [Design connection-efficient applications](https://learn.microsoft.com/en-us/azure/load-balancer/troubleshoot-outbound-connection#design-connection-efficient-applications)
- Consider increasing public IPs on egress device or ports per node

#### 21V Applicability
Applicable to 21V (Mooncake) environments. Load balancer metrics and BCC tools work the same way.

---
