---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Feature Specific/Cilium FQDN Policy"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FCilium%20FQDN%20Policy"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Cilium FQDN Policy

## Overview

FQDN policy filters traffic based on FQDN rather than IP. Only available for cilium clusters, k8s 1.29.0+.

## Concept

Two flows:
1. **Applying CNP**: DNS rules in CiliumNetworkPolicy select pods, redirect DNS to fqdn-policy pods
2. **DNS request flow**: fqdn-policy pods resolve DNS, send resolved IP to cilium agent for allow/deny

## Prerequisites

* Cluster must use Cilium dataplane (check ASI > Networking > Cilium Dataplane)
* k8s >= 1.29.0
* fqdn-policy daemonset running: `kubectl get pods -n kube-system -l name=fqdn-policy`
* Cluster access for cilium agent and fqdn-policy logs

## Troubleshooting Steps

### 1. Configuration Check

```sh
kubectl get cm cilium-config -n kube-system -o jsonpath='{.data.enable-l7-proxy}'
# Must be "true"
kubectl get cm cilium-config -n kube-system -o jsonpath='{.data.disable-embedded-dns-proxy} {.data.enable-standalone-dns-proxy} {.data.tofqdns-proxy-port} {.data.tofqdns-server-port}'
# Expected: true true 40046 40045
```

### 2. Connectivity Check

```sh
kubectl logs -n kube-system -l name=fqdn-policy
kubectl logs -n kube-system -l k8s-app=cilium | grep fqdn/server
# On node:
ss -tunpa | grep 40045  # grpc server
ss -tunpa | grep 40046  # dns proxy
```

### 3. CNP Validation

```sh
kubectl logs -n kube-system -l k8s-app=cilium | grep "Invalid CiliumNetworkPolicy spec"
kubectl logs -n kube-system <fqdn-policy-pod> | grep "Received DNS rule"
```

Only DNS protocol supported (no HTTP/Kafka/other L7). Dual stack and k8s service names not supported.

### 4. DNS Redirection Check

```sh
iptables -t mangle -L CILIUM_PRE_mangle
# Should show TPROXY rules to 127.0.0.1:40046
kubectl logs -n kube-system <fqdn-policy-pod> | grep "fqdn/dnsproxy"
```

Issues:
* **Endpoint ID/Identity not found**: cilium agent not writing to bpf maps (cilium_lxc, cilium_ipcache)
* **DNS resolution failed**: check core-dns pods, verify CNP selects correct kube-dns pods
* **Stream closed**: DNS response not forwarded due to connection loss

### 5. Traffic Allow/Deny

```sh
kubectl get cep <pod_name> -o jsonpath='{.status.id}'
kubectl exec -n kube-system -it <cilium-pod> -- cilium monitor --related-to=<endpoint_id>
# "Policy Denied" = CNP doesn't allow the FQDN
kubectl logs -n kube-system -l k8s-app=cilium | grep fqdn/server
# Look for: "Received update: FQDN:... IPS:... TTL:..."
```

### 6. Datapath Issues

If all above checks pass, it's a dataplane issue. Packet capture needed. Escalate.

## Expected Behavior

Error logs when enable-l7-proxy is false are expected and can be ignored:
```
Failed to connect to server context deadline exceeded at address localhost:40045
```

## Not Supported

* Non-cilium clusters
* Non-AKS managed clusters
* k8s < 1.29.0
* HTTP/Kafka/other L7 protocols in CNP
* Dual stack
* K8s service names

**Owner:** Jordan Harder <joharder@microsoft.com>
