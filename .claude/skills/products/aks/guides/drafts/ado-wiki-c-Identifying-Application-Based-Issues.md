---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Applications/Identifying Application Based Issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FApplications%2FIdentifying%20Application%20Based%20Issues"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Identifying Application-Based Issues

## Summary

This TSG provides guidance for confidently identifying when an issue is **application-based** versus **infrastructure-related**. Per support guidelines, application failures are supported on a **best-effort basis only**. Engineers must clearly distinguish between the two to properly scope cases and set customer expectations.

> **Support Boundary:** AKS support covers the Kubernetes platform, Azure infrastructure, and managed components. Application code, third-party software configuration, and custom workload logic are **out of scope** for break-fix support.

---

## Key Indicators: Application vs Infrastructure

### Signs the Issue is Application-Based

| Indicator | Why It Points to Application |
|-----------|------------------------------|
| Pod is `Running` with no restarts, but app doesn't work | Kubernetes successfully scheduled and runs the container |
| Logs show application-specific errors (business logic, null pointers, exceptions) | The container runtime is working; the code inside is failing |
| Issue only affects specific endpoints/features, not all traffic | Infrastructure issues typically affect all traffic uniformly |
| Problem started after application code/config deployment | No AKS/Azure changes correlate with the issue |
| Same image works in another cluster or locally | Rules out the container image itself being corrupted |
| Health probes pass but application returns errors | Kubernetes sees the app as healthy; app logic is failing |
| Issue reproduces with `kubectl port-forward` directly to pod | Bypasses all networking; proves app is the source |
| Container exits with code 1 (application error) vs 137 (OOMKilled) or 143 (SIGTERM) | Exit code 1 typically indicates application-level failure |

### Signs the Issue is Infrastructure-Based

| Indicator | Why It Points to Infrastructure |
|-----------|--------------------------------|
| Pod stuck in `Pending`, `ContainerCreating`, or `CrashLoopBackOff` with resource errors | Kubernetes cannot schedule or start the container |
| Events show `FailedMount`, `FailedScheduling`, `FailedAttachVolume` | AKS/Azure components are potentially failing |
| Issue affects multiple unrelated applications in the cluster | Suggests cluster-wide or node-level problem |
| Container killed with exit code 137 (OOMKilled) | Kubernetes killed the container due to memory limits |
| Network timeouts to Azure services (ACR, Key Vault, Storage) | Azure networking or identity issue |
| Problem correlates with AKS upgrade, node scaling, or Azure maintenance | Infrastructure change caused the issue |
| `kubectl` commands timeout or fail | Can be API server or control plane, but validate client-side network/DNS/proxy issues first |

---

## Common Application Failure Scenarios

### Scenario 1: Application Crashes on Startup

**Symptoms:** Pod in `CrashLoopBackOff`, container restarts repeatedly, logs show application exceptions during initialization.

```bash
# Check logs from the crashed container
kubectl logs <pod-name> -n <namespace> --previous
# Check exit code
kubectl get pod <pod-name> -n <namespace> -o jsonpath='{.status.containerStatuses[0].lastState.terminated.exitCode}'
```

**Application-Based If:** Exit code is 1, logs show NullPointerException/ModuleNotFoundError, missing env vars, config parse failures.

**Infrastructure-Based If:** Exit code 137 (OOMKilled), 139 (segfault), events show FailedMount or secret/configmap not found.

### Scenario 2: Application Returns HTTP 5xx Errors

**Symptoms:** Pod is Running and healthy, users report 500/502/503 errors.

```bash
# Test directly to pod (bypasses Service/Ingress)
kubectl port-forward <pod-name> 8080:<container-port> -n <namespace>
curl -v http://localhost:8080/<endpoint>
```

**Application-Based If:** Port-forward reproduces 5xx, logs show unhandled exceptions or DB failures.

**Infrastructure-Based If:** Port-forward works but Service/Ingress does not, or logs show Azure service timeouts.

### Scenario 3: Application Performance Degradation

```bash
kubectl top pods -n <namespace>
kubectl top nodes
kubectl describe pod <pod-name> -n <namespace> | grep -A 5 "Limits"
```

**Application-Based If:** Resources well below limits, slow on specific operations, improves with app-level caching.

**Infrastructure-Based If:** Pod CPU/memory throttled, node under pressure, disk I/O throttling detected.

### Scenario 4: Application Cannot Connect to External Services

```bash
kubectl exec -it <pod-name> -n <namespace> -- nslookup <target-hostname>
kubectl exec -it <pod-name> -n <namespace> -- curl -v <target-url>
```

**Application-Based If:** DNS resolves, TCP succeeds but protocol fails (auth error, wrong credentials, TLS cert validation).

**Infrastructure-Based If:** DNS fails, TCP times out (NSG/firewall/network policy), SNAT exhaustion.

### Scenario 5: Intermittent Application Failures

```bash
kubectl get pods -n <namespace> -o wide
kubectl get events -n <namespace> --sort-by='.lastTimestamp' | tail -50
```

**Application-Based If:** Correlates with specific requests/data, race conditions, state corruption.

**Infrastructure-Based If:** Failing pods on specific nodes, correlates with autoscaler events, SNAT port usage.

---

## The Port-Forward Test - Quick Infrastructure Validation

```bash
kubectl port-forward <pod-name> <local-port>:<container-port> -n <namespace>
curl http://localhost:<local-port>/<endpoint>
```

| Result | Conclusion |
|--------|------------|
| Works via port-forward, Fails via Service/Ingress | **Infrastructure** - Networking issue |
| Fails via port-forward | **Application** - Pod itself not responding correctly |
| Works via both | Issue may be external (client-side, DNS, firewall outside Azure) |

---

## Escalation Guidance

**Do NOT escalate to EEE/PG if:** Issue is clearly application-based, customer asks for app code debugging, third-party software config questions.

**DO escalate if:** Infrastructure issue confirmed, CSI/CNI/managed add-ons involved, potential AKS bug, critical business impact with suspected infra root cause.
