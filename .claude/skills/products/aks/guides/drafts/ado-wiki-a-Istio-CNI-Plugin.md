---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Networking/Managed Istio/Istio CNI Plugin"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FManaged%20Istio%2FIstio%20CNI%20Plugin"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Istio CNI Plugin: Overview and Troubleshooting Guide

[[_TOC_]]

## Overview

The Istio Container Network Interface (CNI) plugin is a component of the Azure Service Mesh (ASM) Istio add-on that handles network traffic redirection for pods in the mesh. The CNI plugin configures iptables rules to redirect traffic through the Envoy sidecar proxy, enabling Istio's traffic management, security, and observability features.

When enabled, the Istio CNI plugin runs as a DaemonSet (`azure-service-mesh-istio-cni-addon-node`) on each node in the cluster and is responsible for installing the Istio CNI binary on each node. The binary is responsible for:

- Configuring pod network traffic redirection through iptables rules
- Setting up proper network namespace configuration for sidecar injection
- Handling race condition mitigation between pod startup and CNI configuration

## Prerequisites

Before proceeding with troubleshooting, ensure the following:

- Customers have read the public support page on [Istio CNI for the Istio service mesh add-on](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/istio-add-on-cni-troubleshooting)
- The Istio add-on is properly installed and enabled on the AKS cluster
- The cluster is running a supported Istio revision (Istio CNI is available starting from `asm-1-25`)
- The Istio CNI is enabled on the cluster. You can verify this by running:

   ```bash
   az aks show -n $CLUSTER_NAME -g $RESOURCE_GROUP --query "serviceMeshProfile.istio.components.proxyRedirectionMechanism
   ```

   The expected output should be CNIChaining.

## DaemonSet Readiness and Installation Issues

### Checking CNI DaemonSet Status

First, verify the CNI DaemonSet is running correctly:

```bash
kubectl get daemonset azure-service-mesh-istio-cni-addon-node -n aks-istio-system -o wide
kubectl get pods -n aks-istio-system -l app.kubernetes.io/name=azure-service-mesh-istio-cni-addon
```

Expected output should show all DaemonSet pods in `Running` state with `1/1` ready.

### CNI Installation Verification

Check if the CNI plugin is properly installed on nodes:

```bash
# Check CNI installation logs
kubectl logs -n aks-istio-system -l app.kubernetes.io/name=azure-service-mesh-istio-cni-addon --tail=100 | egrep installation
```

If node access is available, verify CNI binary:

```bash
kubectl debug node/<node-name> -it --image=mcr.microsoft.com/cbl-mariner/busybox:2.0
chroot /host
grep istio-cni /etc/cni/net.d/*
```

The `azure-service-mesh-istio-cni-addon` daemonset proxies all logs from the CNI plugin, which is useful for troubleshooting.

## Pod Startup Failures and Network Configuration Issues

### Diagnosing Pod Startup Problems

When pods fail to start due to CNI issues, follow these steps:

```bash
# Check pod events for CNI errors
kubectl describe pod <pod-name> -n <namespace>

# Check istio-validation init container logs
kubectl logs <pod-name> -n <namespace> -c istio-validation

# Search CNI logs for the specific pod
kubectl logs -n aks-istio-system -l app.kubernetes.io/name=azure-service-mesh-istio-cni-addon | grep <pod-name>
```

### Common Pod Startup Issues

1. **Connection Refused Errors in istio-validation**

   ```bash
   # Example error in istio-validation logs:
   # Error connecting to 127.0.0.6:15002: dial tcp connect: connection refused
   ```

   - **Cause**: Traffic redirection not properly configured by CNI
   - **Diagnosis**: Check CNI logs for the pod ID and look for setup errors
   - **Solution**: Verify iptables rules and network namespace configuration

2. **Pod Continuously Evicted**
   - **Symptom**: Pods restart immediately after creation
   - **Cause**: CNI race condition repair mechanism evicting "broken" pods
   - **Check**: Look for race condition repair logs in CNI DaemonSet
   - **Solution**: Address underlying CNI installation issues

3. **Network Traffic Not Intercepted**
   - **Symptom**: Traffic bypassing Envoy sidecar
   - **Check**: Verify iptables rules in pod network namespace
   - **Solution**: Ensure CNI plugin properly configured redirection rules

## Race Condition Mitigation

### Understanding Race Conditions

Race conditions occur when pods start before the CNI plugin is ready, leading to improper network configuration.

### Identifying Race Condition Issues

```bash
# Look for race condition repair logs
kubectl logs -n aks-istio-system -l app.kubernetes.io/name=azure-service-mesh-istio-cni-addon | grep -E "pod repaired"

# Check race condition metrics
kubectl exec -n aks-istio-system <istio-cni-pod> -- curl -s localhost:15014/metrics | grep repair
```

## Canary Upgrades and CNI

### Upgrade Considerations

During Istio minor revision upgrades:

1. **CNI Version Compatibility**: Ensure CNI version matches the highest control plane revision. If not, this is an internal issue (customer cannot cause this) so reach to the Istio upgrade team
2. **DaemonSet Updates**: Verify CNI DaemonSet updates with new revision
3. **Configuration Migration**: Check CNI configuration compatibility across revisions

### Troubleshooting Upgrade Issues

Get the current image version used by the daemonset

```bash
kubectl get daemonset azure-service-mesh-istio-cni-addon-node -n aks-istio-system -o jsonpath='{.spec.template.spec.containers[?(@.name=="install-cni")].image}'
```

## References and Additional Resources

1. [Official Istio CNI Troubleshooting](https://istio.io/latest/docs/ops/diagnostic-tools/cni/)
2. [Istio CNI Installation and Operation](https://istio.io/latest/docs/setup/additional-setup/cni/)
3. [AKS CNI Troubleshooting](https://learn.microsoft.com/en-us/azure/architecture/operator-guides/aks/troubleshoot-network-aks)
