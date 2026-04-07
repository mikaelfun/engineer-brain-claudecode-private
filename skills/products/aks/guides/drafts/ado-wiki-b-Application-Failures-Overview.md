---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Applications/Application Failures Overview"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Applications/Application%20Failures%20Overview"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Application Failures Overview

[[_TOC_]]

## Summary

This page provides a centralized overview of common application-level failures in AKS and serves as the starting point for systematic troubleshooting. Use this guide to quickly identify the failure type, understand symptoms, and navigate to detailed troubleshooting guidance.

> **Before You Start:** Application failures can stem from either **application code issues** (out of scope for AKS support) or **infrastructure issues** (in scope). Always verify whether the root cause is application-based or infrastructure-related using the [Identifying Application-Based Issues](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Applications/Identifying-Application-Based-Issues) guide.

## Troubleshooting vs Labs

Use this split to avoid mixing incident-time steps with training scenarios.

| Content Type | Purpose | Start page |
|---|---|---|
| **Troubleshooting guidance** | Active customer incident triage and scoping | [Application Failures - Scoping Guide](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Applications/Application-Failures-TSG.md) |
| **Tool-assisted investigations** | ASI/Jarvis/AppLens/Kusto command and workflow execution | [Application Failure Tooling Guide](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Applications/Application-Failure-Tooling-Guide.md) |
| **Labs / scenario practice** | Proactive learning and reproductions | [Application Failure Labs Index](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Applications/Application-Failure-Labs.md) |

---

## Quick Reference: Application Failure Types

| Failure Type | Pod Status | Common Symptoms | Diagnostic Goal | TSG Link |
|-------------|-----------|-----------------|-----------------|----------|
| **CrashLoopBackOff** | `CrashLoopBackOff` | Container repeatedly crashes and restarts; increasing backoff delays | Determine if crash is due to app code, resource limits, or missing dependencies | [Scoping Guide - CrashLoopBackOff](#crashloopbackoff) |
| **Pod Restart Loop** | `Running` (high restart count) | Application runs briefly then crashes; restart counter incrementing | Identify crash trigger (OOM, liveness probe, app error) | [Pod Restarts](#pod-restarts-high-restart-count) |
| **Exec Format Error** | `CrashLoopBackOff` or `Error` | `exec format error` in logs; container fails immediately on start | Validate image architecture matches node architecture | [Exec Format Error](#exec-format-error) |
| **OOMKilled** | `CrashLoopBackOff` | Exit code 137; "OOMKilled" in container last state | Adjust memory limits or investigate memory leak | [OOMKilled](#oomkilled) |
| **Image Pull Failures** | `ImagePullBackOff` / `ErrImagePull` | Cannot pull container image; authentication or network errors | Verify registry access, credentials, and image existence | [Scoping Guide - Image Pull](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Applications/Application-Failures-TSG#step-2c-pod-not-running---image-pull-errors) |
| **Startup Probe Failure** | `CrashLoopBackOff` | Pod killed before app fully initializes | Adjust startup probe timing or fix slow initialization | [Probe Failures](#probe-failures) |
| **Liveness Probe Failure** | `Running` (restarts) | Container restarted by kubelet; "Liveness probe failed" events | Fix probe configuration or application health endpoint | [Probe Failures](#probe-failures) |
| **Readiness Probe Failure** | `Running` (not ready) | Pod not receiving traffic; "Readiness probe failed" events | Fix probe or application readiness | [Probe Failures](#probe-failures) |
| **Application Hangs** | `Running` | Pod status healthy but application unresponsive | Profile application, check for deadlocks or resource starvation | [Application Performance Issues](#application-hangs-unresponsive) |

---

## Failure Type Details

### CrashLoopBackOff

**What It Means:** The container starts, crashes, and Kubernetes restarts it with exponentially increasing delays (10s, 20s, 40s, etc.).

**Example Symptoms:**

- `kubectl get pods` shows status `CrashLoopBackOff`
- Restart count increasing over time
- Events show container exiting with non-zero exit code

**Diagnostic Goals:**

1. Retrieve logs from the crashed container (`kubectl logs --previous`)
2. Check exit code to categorize the failure
3. Determine if app code, configuration, or infrastructure

**Exit Code Reference:**

| Exit Code | Meaning | Category |
|-----------|---------|----------|
| 0 | Success (unusual for crash) | Application Logic |
| 1 | Generic application error | Application Code |
| 126 | Command not executable | Image/Permission Issue |
| 127 | Command not found | Image/Configuration |
| 128+ | Signal-based termination (128 + signal number) | Infrastructure/Runtime |
| 137 | SIGKILL (OOMKilled or manual kill) | Resource Limits |
| 139 | SIGSEGV (Segmentation fault) | Application/Runtime Bug |
| 143 | SIGTERM (Graceful termination) | Expected Shutdown |

**Quick Commands:**

```bash
# Check current status and restart count
kubectl get pod <pod-name> -n <namespace>

# Get logs from crashed container
kubectl logs <pod-name> -n <namespace> --previous

# Check exit code and termination reason
kubectl get pod <pod-name> -n <namespace> -o jsonpath='{.status.containerStatuses[0].lastState.terminated}'
```

**Related TSGs:**

- [Application Failures - Scoping Guide](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Applications/Application-Failures-TSG#step-2b-pod-not-running---crashloopbackoff)
- [Identifying Application-Based Issues](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Applications/Identifying-Application-Based-Issues)
- [Resource-Constraint-Troubleshooting](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Cluster-Management/Resource-Constraint-Troubleshooting)

---

### Pod Restarts (High Restart Count)

**What It Means:** The pod is in `Running` state but the container inside keeps crashing and restarting. Unlike `CrashLoopBackOff`, the restart happens with enough delay that status shows `Running` prior to restart event.

**Example Symptoms:**

- `kubectl get pods` shows `Running 1/1` but RESTARTS column shows high number
- Intermittent application availability
- Users report sporadic failures

**Diagnostic Goals:**

1. Determine what triggers each restart
2. Check if memory/CPU limits are being hit
3. Review liveness probe configuration
4. Validate application lifecycle with customer (What happens upon startup, what checks/calls does application make) to identify any failure points post-startup

**Quick Commands:**

```bash
# Check restart count and timeline
kubectl get pod <pod-name> -n <namespace> -o jsonpath='{.status.containerStatuses[0].restartCount}'

# See last termination details
kubectl get pod <pod-name> -n <namespace> -o jsonpath='{.status.containerStatuses[0].lastState}'

# Watch events for restart triggers
kubectl get events -n <namespace> --field-selector involvedObject.name=<pod-name> -w

# Check logs prior to restart
kubectl logs <pod-name> -n <namespace> # Optional: add "-c <container-name>" to specify a container
```

---

### Exec Format Error

**What It Means:** The container image was built for a different CPU architecture than the node where it's scheduled.

**Example Symptoms:**

- Container crashes immediately on startup
- Logs show: `exec format error` or `exec user process caused: exec format error`
- No application logs generated (crashes before app code runs)

**Common Causes:**

- AMD64 image running on ARM64 node (or vice versa)
- Image built on M1/M2 Mac (ARM) deployed to x86 nodes
- Multi-arch image with missing platform

**Diagnostic Goals:**

1. Verify node architecture: `kubectl get node <node> -o jsonpath='{.status.nodeInfo.architecture}'` or via ASI
2. Check image manifest for supported architectures
3. Ensure correct image is pulled or rebuild for target architecture

**Quick Commands:**

```bash
# Check node architecture
kubectl get nodes -o custom-columns=NAME:.metadata.name,ARCH:.status.nodeInfo.architecture

# Get image references from init containers and app containers
kubectl get pod <pod-name> -n <namespace> -o jsonpath='{range .spec.initContainers[*]}{.image}{"\n"}{end}{range .spec.containers[*]}{.image}{"\n"}{end}'

# Check image architecture (requires registry access)
# From ACR: az acr manifest list-metadata --registry <acr-name> --name <image-name>
```

**Resolution:**

- Build multi-arch images using `docker buildx` or equivalent
- Use node selectors/affinity to schedule pods on correct architecture nodes
- Pull architecture-specific image tags (e.g., `:latest-amd64`)
- Reference: [Assign Pods to Nodes (nodeSelector)](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#nodeselector)
- Reference: [Deploy the application (AKS Windows quickstart)](https://learn.microsoft.com/en-us/azure/aks/learn/quick-windows-container-deploy-cli#deploy-the-application)

---

### OOMKilled

**What It Means:** The container was terminated by the kernel's Out-Of-Memory killer because it exceeded its memory limit.

**Example Symptoms:**

- Container status shows exit code `137`
- Events or container state shows `OOMKilled`
- Application crashes during high-memory operations

**Diagnostic Goals:**

1. Confirm OOMKilled vs other exit 137 causes
2. Determine if memory limit is too low or app has memory leak
3. Review memory usage patterns before crash

**Quick Commands:**

```bash
# Confirm OOMKilled
kubectl get pod <pod-name> -n <namespace> -o jsonpath='{.status.containerStatuses[0].lastState.terminated.reason}'

# Check memory limits
kubectl get pod <pod-name> -n <namespace> -o jsonpath='{.spec.containers[0].resources.limits.memory}'

# Review recent memory usage (before crash)
kubectl top pods -n <namespace>
```

**Related TSGs:**

- [Resource-Constraint-Troubleshooting](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Cluster-Management/Resource-Constraint-Troubleshooting)

---

### Probe Failures

**What It Means:** Kubernetes health probes are failing, causing the container to be restarted (liveness), removed from service (readiness), or prevented from starting (startup).

**Probe Types:**

| Probe Type | Failure Consequence | Common Causes |
|------------|-------------------|---------------|
| **Startup Probe** | Container killed and restarted | App takes longer to start than probe allows |
| **Liveness Probe** | Container killed and restarted | App hangs, deadlock, health endpoint broken |
| **Readiness Probe** | Pod removed from Service endpoints | App temporarily unhealthy, dependencies unavailable |

**Example Symptoms:**

- Events: `Liveness probe failed: ...`, `Readiness probe failed: ...`
- Pod restarting despite no application errors in logs
- Pod running but not receiving traffic

**Diagnostic Goals:**

1. Identify which probe is failing
2. Check probe configuration (path, port, timing)
3. Manually test the health endpoint

**Quick Commands:**

```bash
# See probe configuration
kubectl get pod <pod-name> -n <namespace> -o jsonpath='{range .spec.containers[*]}{.name}{" liveness="}{.livenessProbe}{"\n"}{end}'
kubectl get pod <pod-name> -n <namespace> -o jsonpath='{range .spec.containers[*]}{.name}{" readiness="}{.readinessProbe}{"\n"}{end}'

# Check events for probe failures
kubectl describe pod <pod-name> -n <namespace> | grep -i probe

# Test probe endpoint directly
kubectl exec <pod-name> -n <namespace> -- curl -v localhost:<port>/<health-path>
```

---

### Application Hangs (Unresponsive)

**What It Means:** The pod is running and "healthy" according to Kubernetes, but the application is not responding to requests.

**Example Symptoms:**

- Pod status shows `Running` and `Ready`
- No restarts, no error events
- Users report timeouts or no responses
- Port-forward to pod shows application not responding

**Diagnostic Goals:**

1. Confirm the issue is at application level (port-forward test)
    - If application is functional bypassing Ingress, redirect to ingress troubleshooting
2. Check for resource starvation (CPU throttling, I/O)
3. Review application logs for errors/warnings
4. Profile application for deadlocks or performance issues

**Quick Commands:**

```bash
# Test directly to pod
kubectl port-forward <pod-name> 8080:<container-port> -n <namespace>
# In another terminal: curl -v http://localhost:8080/
# - Take note that port-forwarding may get broken by corporate proxies in customer env

# Check resource usage
kubectl top pod <pod-name> -n <namespace>

# View live logs
kubectl logs <pod-name> -n <namespace> -f
```

**Related TSGs:**

- [Identifying Application-Based Issues](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Applications/Identifying-Application-Based-Issues#scenario-3-application-performance-degradation)

---

## Systematic Troubleshooting Approach

Use this high-level workflow for any application failure:

```text
1. IDENTIFY POD STATE
   - kubectl get pods -n <namespace>
         |
         |-- Not Running (Pending/CrashLoop/ImagePull) - Check events & pod describe
         |-- Running - Check logs & connectivity

2. GATHER DIAGNOSTICS
   - kubectl describe pod <name> -n <namespace>
   - kubectl logs <name> -n <namespace> [--previous]
   - kubectl get events -n <namespace>

3. CATEGORIZE THE ISSUE
   - Application code error - Out of scope (best effort)
   - Configuration error - May be in scope
   - Infrastructure issue - In scope (use TSGs)

4. NAVIGATE TO APPROPRIATE TSG
   - See "Related TSGs" links above
```

For detailed scoping and categorization, use the [Application Failures - Scoping Guide](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Applications/Application-Failures-TSG).

---

## Tooling for Application Failure Investigations

Use **ASI**, **Geneva Actions (via ASC)**, **AppLens**, and **Kusto** to efficiently gather data and diagnose application failures:

| Tool | Use For |
|------|---------|
| **ASI** | Quick cluster/pod overview, audit logs, API QoS metrics |
| **ASC / Geneva Actions** | Run kubectl commands (read-only) without kubeconfig |
| **AppLens** | Automated diagnostics and detector-based issue identification |
| **Kusto** | Deep telemetry analysis and historical pattern queries |

**See:** [Application Failure Tooling Guide](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Applications/Application-Failure-Tooling-Guide)

---

## Related Documentation

### Troubleshooting Guides (TSGs)

- [Application Failures - Scoping Guide](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Applications/Application-Failures-TSG) - Flowchart-based decision tree for categorizing issues
- [Identifying Application-Based Issues](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Applications/Identifying-Application-Based-Issues) - Distinguish app vs infrastructure issues
- [Application Failure Tooling Guide](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Applications/Application-Failure-Tooling-Guide) - How to use ASI, Geneva Actions, AppLens, and Kusto for investigations
- [Resource-Constraint-Troubleshooting](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Cluster-Management/Resource-Constraint-Troubleshooting) - For OOMKilled and resource-related failures
- [Application Failure Labs Index](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Applications/Application-Failure-Labs.md) - Links to proactive scenario and training pages

### Related Category TSGs

- [AKS-Network-Troubleshooting-Methodology](/Azure-Kubernetes-Service-Wiki/AKS/TSG/AKS-Network-Troubleshooting-Methodology) - When connectivity is suspected
- [AKS-Storage-Troubleshooting-Methodology](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Storage/AKS-Storage-Troubleshooting-Methodology) - For mount/volume issues

---

## Owner and Contributors

**Owner:** jamesonhearn <jamesonhearn@microsoft.com>

**Contributors:**

- jamesonhearn <jamesonhearn@microsoft.com>

