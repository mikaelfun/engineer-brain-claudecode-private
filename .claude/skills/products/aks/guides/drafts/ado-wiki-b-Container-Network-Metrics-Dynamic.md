---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Monitoring/Network Observability (Kappie)/Container Network Metrics Filtering-Dynamic Metrics"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Monitoring/Network%20Observability%20(Kappie)/Container%20Network%20Metrics%20Filtering-Dynamic%20Metrics"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Container Network Metrics TSG Dynamic Metrics

[[_TOC_]]

## Overview

Implements dynamic management of Hubble metrics cardinality through Kubernetes Custom Resource Definitions (CRDs), addressing challenges of high-cardinality metrics in large-scale environments. Enables cluster administrators to control cardinality dimensions and target Hubble metrics without restarting Cilium agents or Prometheus servers.

---

## High-Level Flow

- Users define include/exclude filters in `ContainerNetworkMetric` CR per cluster.
- Filters specify network traffic to measure and control metric dimensions.
- Resource consolidates into central ConfigMap: `cilium-dynamic-metrics-config`.
- ConfigMap controls Cilium's Hubble metrics collection through dynamic configuration.
- One CR per cluster: `container-network-metric`. ConfigMap updates automatically.

---

## Key Benefits

- **Cardinality Management:** Control Hubble metrics cardinality to prevent performance issues.
- **Cost Optimization:** Reduce ingestion costs in managed Prometheus environments.
- **Scalability:** Handle large clusters without overwhelming metrics infrastructure.
- **Dynamic Control:** Adjust metrics collection without service restarts.
- **Targeted Monitoring:** Focus on specific network flows and dimensions.

---

## Prerequisites

- Kubernetes >= 1.32
- Data Plane: Cilium
- Feature Flag: `AdvancedNetworkingDynamicMetricsPreview` enabled during cluster creation
- Retina Operator Version >= 0.1.12

---

## Document Structure

- Overview & Prerequisites
- Troubleshooting (`troubleshooting.md`)
- Design References: CFP-30788, Managed Offering Design Document

---

## Operational Verification Steps

### 1. Check Cilium Pods

```bash
kubectl get pods -n kube-system -l k8s-app=cilium
```

### 2. Verify Dynamic Metrics Feature

```bash
kubectl get configmap cilium-config -n kube-system -o jsonpath='{.data.hubble-dynamic-metrics-config-path}'
```

Expected: `dynamic-metrics-config`

### 3. Verify Dynamic Metrics ConfigMap

```bash
kubectl get configmap cilium-dynamic-metrics-config -n kube-system
```

### 4. Check Cilium Agent Logs

```bash
kubectl logs -n kube-system daemonset/cilium | grep "Starting Hubble server with dynamically enabled metrics"
```

### 5. Check Retina Operator Status

```bash
kubectl get pods -n kube-system -l name=cilium-operator
kubectl logs -n kube-system deployment/cilium-operator -c retina-operator --tail=20 | grep fail
```

---

## Dynamic ConfigMaps

### 4.1 Cilium ConfigMap

```yaml
enable-hubble: "true"
hubble-dynamic-metrics-config-path: dynamic-metrics-config
hubble-metrics-server: ":9965"
```

### 4.2 Dynamic Metrics ConfigMap

```bash
kubectl get configmap dynamic-metrics-config -n kube-system -o jsonpath='{.data.dynamic-metrics.yaml}' | yq
```

Example:

```yaml
metrics:
  - contextOptions:
      - destinationIngressContext
      - sourceEgressContext
    flow:
      - tcp
```

---

## Container Network Metric CRDs

### Check CRD Exists

```bash
kubectl get containernetworkmetric
```

### Validate CRD Schema

```yaml
apiVersion: acn.azure.com/v1alpha1
kind: ContainerNetworkMetric
metadata:
  name: container-network-metric
spec:
  filters:
    metric: dns
    includeFilters:
      protocol: dns
    excludeFilters:
      from:
        namespacedPod: pod-name
      to:
        namespacedPod: pod-name
```

Common schema issues:

- Incorrect `apiVersion`
- Invalid field structure in `namespacedPod` blocks
- Invalid metric names: dns, flow, tcp, drop, http, kafka

### Check CRD Status Events

```bash
kubectl describe containernetworkmetric container-network-metric
```

---

## Troubleshooting

### Common Container Network Metrics Issues

#### **retina-crd-operator Deployment**

`retina-crd-operator` is deployed alongside `cilium-operator` as a side container. Check Cilium operator pod for errors from this component:

Search for: `retina`, `containernetworkmetric`, `retina-crd`, `retina-operator`

```bash
kubectl logs <cilium-operator-pod> -n kube-system | grep "containernetworkmetric"
```

##### **Kusto Query for Logs**

Cilium Operator logs can be checked via Kusto query:

_Keywords:_ `retina`, `retina-crd-operator`, `containernetworkmetric`

Source: `[cluster('aznwsdn.kusto.windows.net').database('ACN')]`

```shell
RetinaReport
    | where podname has "cilium-operator"
    | where Type has "AppTraces"
    | sort by TimeGenerated desc
    | take 50
```

---

### Issue 1: ContainerNetworkMetric CRDs Not Recognized

**Symptoms:**

- `kubectl get containernetworkmetric` fails with "resource not found"
- CRD creation fails with schema validation errors

**Root Causes:**

- Feature not properly enabled
- Cilium operator not running
- Incorrect CRD schema

**Diagnostic Steps:**

```bash
# Check if CRDs are installed
kubectl get crd | grep containernetworkmetric

# Check cilium operator status
kubectl get pods -n kube-system -l name=cilium-operator

# Check operator logs
kubectl logs -n kube-system deployment/cilium-operator
```

**Solutions:**

- Verify feature flag is enabled for subscription
- Check cilium operator is running and healthy
- Use correct CRD schema with `acn.azure.com/v1alpha1` apiVersion

---

### Issue 2: Dynamic Metrics ConfigMap Not Updated

**Symptoms:**

- ContainerNetworkMetric CR created but ConfigMap unchanged
- CR shows "CONFIGURED" state but no metrics generated

**Root Causes:**

- Reconciliation timing delays
- Operator processing errors
- ConfigMap permission issues

**Diagnostic Steps:**

```bash
# Check CR status
kubectl describe containernetworkmetric <cr-name>

# Check ConfigMap contents
kubectl get configmap cilium-dynamic-metrics-config -n kube-system -o yaml

# Check operator logs for reconciliation
kubectl logs -n kube-system deployment/cilium-operator | grep -i "containernetworkmetric"
```

**Solutions:**

- Wait 2 minutes for reconciliation (normal timing)
- Check operator has necessary RBAC permissions
- Restart cilium operator if stuck:

```bash
kubectl rollout restart deployment/cilium-operator -n kube-system
```

---

### Issue 3: Metrics Not Generated Despite Configuration

**Symptoms:**

- ConfigMap updated correctly
- CR shows "CONFIGURED" state
- No metrics appear in expected endpoints

**Root Causes:**

- Incorrect filter configuration
- Operator pod not healthy
- Network traffic not matching filters

**Diagnostic Steps:**

```bash
# Check Cilium pods status
kubectl get pods -n kube-system -l k8s-app=cilium

# Check Cilium configuration
kubectl get configmap cilium-config -n kube-system -o yaml | grep -i "dynamic"

# Check Cilium agent logs for enabled metrics
kubectl logs -n kube-system daemonset/cilium | grep -i "metrics"
```

**Solutions:**

- Restart Cilium pods:

```bash
kubectl rollout restart daemonset/cilium -n kube-system
```

- Verify filter syntax matches expected schema
- Generate network traffic that matches configured filters
- Check metrics endpoints are accessible

---

### Issue 4: Slow ConfigMap Propagation

**Symptoms:**

- CR reconciliation takes longer than expected (>5 minutes)
- Intermittent ConfigMap updates

**Root Causes:**

- Operator restart or high load
- Kubernetes API server performance
- Resource constraints on operator pod

**Diagnostic Steps:**

```bash
# Check operator pod status
kubectl get pods -n kube-system -l name=cilium-operator

# Check operator logs for errors
kubectl logs -n kube-system deployment/cilium-operator --tail=50

# Time reconciliation manually
time kubectl apply -f <cr-yaml>
kubectl get configmap cilium-dynamic-metrics-config -n kube-system --watch

# Check operator resource usage
kubectl top pod -n kube-system | grep cilium-operator

# Check operator events
kubectl get events -n kube-system --field-selector involvedObject.name=cilium-operator
```

**Solutions:**

- Increase operator resource limits if constrained
- Monitor for operator restarts and investigate causes
- Consider cluster performance optimization

---

### Issue 5: CRD Schema Validation Failures

**Symptoms:**

- CRD creation fails with validation errors
- Error messages about unknown fields or incorrect structure

**Root Causes:**

- Using incorrect CRD schema
- Outdated CRD definitions
- Wrong apiVersion specification
- CRD already exists
- Wrong CRD naming

**Common Schema Errors:**

```txt
error validating data: ValidationError(ContainerNetworkMetric.spec.includeFilters[0].from): unknown field "pod" in com.azure.acn.v1alpha1.ContainerNetworkMetricFrom
```

**Correct Schema Example:**

```yaml
apiVersion: acn.azure.com/v1alpha1
kind: ContainerNetworkMetric
metadata:
  name: example-metric
spec:
  includeFilters:
  - name: "test-filter"
    from:
      namespacedPod: "default/test-pod-*"
    to:
      namespacedPod: "default/target-pod-*"
```

**Solutions:**

- Use `namespacedPod` field instead of separate namespace and pod fields
- Ensure `apiVersion: acn.azure.com/v1alpha1`
- Follow exact schema structure as documented
- Ensure only one ContainerNetworkMetric CR exists per cluster

---

### Error Message Reference

#### Azure CLI Errors

- **Feature flag not enabled:**

```txt
Feature Microsoft.ContainerService/AdvancedNetworkingDynamicMetricsPreview is not enabled.
```

Solution: Enable feature flag.

- **Kubernetes version too low:**

```txt
The specified orchestrator version is not valid. Dynamic Metrics requires Kubernetes version 1.32.0 or later.
```

Solution: Upgrade cluster to supported version.

#### Kubectl Errors

- **CRD not found:**

```txt
error: resource mapping not found for "ContainerNetworkMetric": no matches for kind "ContainerNetworkMetric" in version "acn.azure.com/v1alpha1"
```

Solution: Verify feature is enabled and cilium operator is running.

- **Schema validation error:**

```txt
error validating data: ValidationError(ContainerNetworkMetric.spec): unknown field "filters" in com.azure.acn.v1alpha1.ContainerNetworkMetricSpec
```

Solution: Use correct field name `includeFilters` instead of `filters`.

---

### Diagnostic Information Collection

#### Basic Environment Check

```bash
# Kubernetes and cluster info
kubectl version --short
az aks show -g <resource-group> -n <cluster-name> --query "networkProfile"

# Feature verification
kubectl get configmap cilium-config -n kube-system -o jsonpath='{.data.hubble-dynamic-metrics-config-path}'

# cilium operator status
kubectl get pods -n kube-system -l name=cilium-operator
kubectl logs -n kube-system deployment/cilium-operator --tail=50
```

#### ContainerNetworkMetric Resources

```bash
# List all CRDs and their status
kubectl get containernetworkmetric -o yaml

# Check dynamic metrics ConfigMap
kubectl get configmap cilium-dynamic-metrics-config -n kube-system -o yaml

# Check Cilium configuration
kubectl get configmap cilium-config -n kube-system -o yaml | grep -A10 -B5 "dynamic"
```

#### Pod and Service Status

```bash
# Cilium pods status
kubectl get pods -n kube-system -l k8s-app=cilium
kubectl logs -n kube-system daemonset/cilium --tail=100 | grep -i "dynamic|metrics"

# cilium operator detailed logs
kubectl logs -n kube-system deployment/cilium-operator | grep -i "containernetworkmetric"

# System events
kubectl get events -n kube-system --sort-by='.lastTimestamp'
```

#### Complete Diagnostic Information Collection

When reporting dynamic metrics issues, collect the following comprehensive diagnostic information:

- Environment Information
- Kubernetes and cluster info
- Cilium and cilium operator status
- Configuration details
- CRD information
- Logs

---

### Common Issues Quick Reference

- **Filters Not Applied:** Wait up to 1 minute for propagation, check ConfigMap content:

```bash
kubectl get configmap cilium-config -n kube-system -o jsonpath='{.data.enable-hubble-open-metrics}' | jq '.metricsFilters'
```

- **CRD Validation Failures:** Use correct `acn.azure.com/v1alpha1` apiVersion, CRD name `container-network-metric`, and fields.

- **ConfigMap Not Updating:** Check cilium operator logs and RBAC permissions:

```bash
kubectl logs -n kube-system deployment/cilium-operator | grep -i "containernetworkmetric"
```

- **No Metrics Visible:** Verify feature flag enabled and Cilium pods healthy:

```bash
kubectl get configmap cilium-config -n kube-system -o jsonpath='{.data.hubble-dynamic-metrics-config-path}'
```

## Owner and Contributors

**Owner:** Jordan Harder <Jordan.Harder@microsoft.com>

**Contributors:**

- Jordan Harder <Jordan.Harder@microsoft.com>
