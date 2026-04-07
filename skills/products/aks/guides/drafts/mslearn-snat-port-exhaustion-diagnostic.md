# SNAT Port Exhaustion Diagnostic Guide (AKS)

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/snat-port-exhaustion
> Status: draft (from mslearn-scan)

## Overview
Multi-step diagnostic procedure to identify which pod on an AKS node is causing SNAT port exhaustion.

## Step 1: Locate the Exhausted Node
1. Navigate to AKS cluster resource group → find default Kubernetes load balancer
2. Check SNAT port usage/allocation on LB metrics page → identify node IP with exhaustion
3. Map node IP to node name: `kubectl get nodes -o wide | grep <node IP>`

## Step 2: Locate the Pod with High Outbound Connections (Linux)
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

## Step 3: Find All Outbound Connections
### Linux Pod
```bash
kubectl exec -it <pod> -n <ns> -- /bin/bash
apt-get update && apt-get install net-tools
netstat -ptn | grep -i established
```

### Windows Pod
```cmd
kubectl exec -it <pod> -- cmd.exe
netstat -aon | find /i "established"
```

Count ESTABLISHED connections to public IPs (not private). The pod with most public IP connections is causing SNAT exhaustion.

## Resolution
- Work with app developers to tune application for connection efficiency
- Reference: [Design connection-efficient applications](https://learn.microsoft.com/en-us/azure/load-balancer/troubleshoot-outbound-connection#design-connection-efficient-applications)
- Consider increasing public IPs on egress device or ports per node

## 21V Applicability
Applicable to 21V (Mooncake) environments. Load balancer metrics and BCC tools work the same way.
