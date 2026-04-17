---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Security and Identity/Cilium L3-L4 Network Policies"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FSecurity%20and%20Identity%2FCilium%20L3-L4%20Network%20Policies"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Layer 3 & Layer 4 CNP Troubleshooting Guide

## Overview

This guide will help to troubleshoot Layer 3 & Layer 4 Cilium Network Policy (CNP) issues in AKS.
The guide for L7 Policies can be found here: [Cilium L7 Policies](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Security-and-Identity/Cilium-L7-Network-Policies)

## Prerequisites

### 1. Verify Cluster Configuration

- Navigate to [Azure Service Insights (ASI)](https://aka.ms/asi) and locate your cluster
- Verify Cilium Dataplane is enabled:
  - Path: _Networking_ > _Networking Features_ > _Cilium Dataplane_
  - Look for the checkmark indicator

### 2. Verify Cilium Agent Status

Confirm the `cilium-agent` daemonset is operational:

```bash
kubectl get pods -n kube-system -l k8s-app=cilium
```

### 3. Verify ConfigMap

- Make sure enable-policy is set to default

```bash
kubectl get cm -n kube-system cilium-config -o yaml | grep enable-policy
```

### 4. Verify Cilium Status

```bash
kubectl exec -it -n kube-system {cilium pod name} -- cilium status
```

## Troubleshooting

### Verify Policy Configuration & Definition

```bash
kubectl get ciliumnetworkpolicy -A
kubectl describe ciliumnetworkpolicy <policy-name> -n <namespace>
```

- Check to see intention of each policy and the actual behaviour of the policy to find any misconfigurations
- If the policy doesn't show in the list, a syntactical issue may have prevented it from being applied
- Check if Valid is True or False next to the policy -> if it is false, there is probably a misconfiguration in the policy

### Example CiliumNetworkPolicy (CNP)

```yaml
apiVersion: "cilium.io/v2"
kind: CiliumNetworkPolicy
metadata:
  name: allow-http
  namespace: default
spec:
  endpointSelector:
    matchLabels:
      app: my-app
  ingress:
  - fromEndpoints:
    - matchLabels:
        app: frontend
    toPorts:
    - ports:
      - port: "80"
        protocol: TCP
```

### Validate Label Matching & Namespaces

Review the `endpointSelector` in the CNP to ensure it matches intended pods

- Verify that the labels used in policies match the labels assigned to endpoints
- Ensure that the policy is applied in the desired namespace as CNPs are namespace scoped

### Check Endpoints

```bash
# Check which cilium pod corresponds to the node that the endpoint is on
kubectl get pods -A -o wide
kubectl exec -n kube-system [cilium-pod] -- cilium endpoint list
```

- Examine the Policy(ingress) enforcement & Policy(egress) enforcement sections to see if they are enabled or disabled

Example:
```txt
ENDPOINT   POLICY ENFORCEMENT (ingress)   POLICY ENFORCEMENT (egress)   IDENTITY   LABELS
299        Enabled                         Disabled                     29284        k8s:name=server
```

### Policy Overlaps

- If there are multiple network policies on the cluster, check in each policy if there are any overlapping rules that might conflict with each other.
- Gradually apply each Policy to monitor the impact of each policy

### Network Observability Quality Dashboard

- Look at the [Network Observability Quality Dashboard - Cilium Alerts Section](https://dataexplorer.azure.com/dashboards/13f5e22d-9fa9-4ecb-a9f5-af80ea72f14a)
- Take a look at AzureCiliumAgentCrashing, AzureCiliumAgentNotReady, AzureCiliumOperatorNotReady

### Examine Cilium Agent Logs for Errors

```bash
kubectl logs -n kube-system daemonset/cilium | grep <policy-name>
```

- Look for any policy parse errors or warnings.
- If the policy is not appearing in logs, there may be a syntax issue.

### Run Connectivity Tests

Run e2e Cilium Connectivity Tests by installing [Cilium CLI](https://github.com/cilium/cilium-cli)

```bash
cilium install
cilium connectivity test
```

### Pinging Test

```bash
kubectl exec -it [pod] -- /bin/sh
ping <target ip or domain>
```

Depending on the intended behavior of the CNP, the ping command succeeding or failing will give an idea whether the policy is working correctly.
