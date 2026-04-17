---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Applications/Application Failure Tooling Guide"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Applications/Application%20Failure%20Tooling%20Guide"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Application Failure Tooling Guide

[[_TOC_]]

## Summary

This guide provides practical workflows for using **ASI**, **Jarvis/Geneva Actions (via ASC)**, **AppLens**, and **Kusto** to investigate application failures on AKS. These tools allow you to efficiently gather diagnostic data without requiring direct cluster access through customer-provided kubeconfig.

> **When to Use This Guide:** Use these tools when you need to investigate pod crashes, application issues, or workload problems on a customer's AKS cluster. They are especially valuable when customers cannot easily provide logs or diagnostics.

---

## Tool Overview

| Tool | Primary Use | Access Method | Read/Write |
|------|-------------|---------------|------------|
| **ASI** | View cluster state, pod status, events, workload history, kubectl audit logs, API QoS metrics | ASI Portal > AKS Service > Managed Cluster | Read-only |
| **ASC (Azure Support Center)** | Central support portal hosting Geneva Actions, case context, resource diagnostics, and Log Analytics access | ASC Portal > Select resource | Read-only |
| **Log Analytics Workspace** | Customer application logs (if enabled by customer) | Via ASC > AKS Resource Page (top section) | Read-only |
| **Geneva Actions** | Execute kubectl commands (read-only), get pod YAML, describe resources, kube-system pod logs only | Via ASC Portal > AKS Cluster Resource > Geneva Actions tab | Read-only |
| **AppLens** | Automated diagnostics, detector results, cluster health insights, common issue detection | [Applens Page](https://applens.trafficmanager.net/) | Read-only |
| **Kusto** | Query raw telemetry, logs, events, and metrics for deep analysis | [Kusto Explorer](https://dataexplorer.azure.com) | Read-only |

---

## ASI: Key Capabilities for Application Failures

### 1. Pods/Daemonsets Tab

The Pods tab in ASI provides a comprehensive view of all workload state changes in the cluster, focusing on placement events and restarts

#### What You Can See

- Restart counts and restart timestamps
- Pod/Deployment creation and deletion history
- Container images in use
- List of running Daemonsets
- Node placement

> **Note:** Current pod placement information is generally more straightforward to identify via kubectl Geneva Actions.

#### How to Access

1. Open ASI, search for cluster by subscription ID or cluster name
2. Navigate to **Pods/Daemonsets** tab
3. Filter by namespace if looking for specific workloads

#### Key Information to Look For

| Column | What It Tells You |
|--------|-------------------|
| **Status** | Current pod phase (Running, Pending, Failed, etc.) |
| **Restarts** | Number of container restarts (high count = crash loop) |
| **Age** | When pod was created (correlate with issue timeline) |
| **Node** | Which node the pod runs on (node-level issues?) |
| **Ready** | Container readiness (0/1 = readiness probe failing) |

#### Investigating Pod Restarts

1. Sort by **Restarts** column (descending) to find problematic pods
2. Click on a pod to see detailed container status
3. Look for **Last State** to see termination reason (OOMKilled, Error, etc.)
4. Check **Exit Code** to categorize the failure (see [Exit Code Reference](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Applications/Application-Failures-Overview#exit-code-reference))

### 2. Workload History / Audit Logs

ASI captures who or what created, modified, or deleted workloads. This is critical for determining if a deployment caused an issue.

#### Use Cases

- "When was this Deployment last updated?"
- "Who deleted the pods?"
- "Was there a recent rollout that correlates with the failure?"

#### How to Access

1. In ASI, navigate to **Kubectl Audit** tab
2. Filter by:
   - **Resource Type:** `pods`, `deployments`, `daemonsets`, `replicasets`
   - **Verb:** `create`, `update`, `patch`, `delete`
   - **Namespace:** Customer's workload namespace
   - **Time Range:** Around the reported issue time

#### What to Look For

| Scenario | Audit Log Filter |
|----------|------------------|
| Pod deletions | Verb = `delete`, Resource = `pods` |
| Deployment updates | Verb = `patch` or `update`, Resource = `deployments` |
| Scale events | Resource = `replicasets`, look for replica count changes |
| HPA actions | User Agent containing `horizontal-pod-autoscaler` |

### 3. API QoS View

When deployment or workload operations are slow or failing, use the API QoS view to check API server health.

#### What It Shows

- API request latency
- Request success/failure rates
- Throttling events
- Slow requests by resource type

#### How to Access

1. In ASI, navigate to **API QoS** or **CCP** tab
2. Select time range around the issue
3. Look for latency spikes or error rate increases

#### Red Flags

- P99 latency > 1 second for common operations
- Error rate spikes correlating with customer-reported issues
- Throttling (429) responses increasing

---

## ASC & Geneva Actions: Key Capabilities

**Azure Support Center (ASC)** is the primary portal for accessing Azure Resource data (configuration overview, changelog, resource-specific metrics/data) as well as Geneva Actions for AKS clusters. Geneva Actions are **read-only** kubectl operations that are typically accessed via SAW / Jarvis (kubectl get/describe, top, etc).

### Accessing Geneva Actions

1. Open [ASC](https://azuresupportcenter.azure.com)
2. Search for the AKS cluster by resource ID or name
3. Navigate to **Geneva Actions** tab
4. Select the desired action from the list

### Common Geneva Actions for Application Failures

> **Important Log Access Limitation:** Geneva Actions can only retrieve logs for **certain kube-system pods** (e.g., coredns, kube-proxy, azure-cni). **Customer application logs are NOT available via Geneva Actions.** For customer workload logs, see [Log Analytics Workspace](#log-analytics-workspace-customer-logs) below.

- kube-system pod logs (limited pods only - use Kubectl Command tab)
- kubectl get pods/nodes
- kubectl describe
- kubectl top
- Any action otherwise available in Jarvis that does NOT cause customer changes (API server restart, CCP replacement, etc)

---

## Log Analytics Workspace (Customer Logs)

Historical customer application logs are **only available** if the customer has enabled **Container Insights** with a Log Analytics Workspace.

### How to Access

1. Open [ASC](https://azuresupportcenter.azure.com) and search for the AKS cluster
2. On the **main AKS resource page**, look at the **top section** for Log Analytics Workspace link
3. If enabled, click to access the workspace and query customer logs

### Checking if Log Analytics is Enabled

- If the Log Analytics link appears at the top of the ASC resource page: **Enabled**
- If no link appears: **Not enabled** (customer must provide logs directly)

### Querying Customer Logs

Once in Log Analytics, use these KQL queries:

```kusto
// Get container logs for a specific pod
ContainerLogV2
| where PodName == "<pod-name>"
| where TimeGenerated > ago(1h)
| project TimeGenerated, PodName, ContainerName, LogMessage
| order by TimeGenerated desc
```

```kusto
// Search for errors in customer namespace
ContainerLogV2
| where PodNamespace == "<namespace>"
| where TimeGenerated > ago(24h)
| where LogMessage contains "error" or LogMessage contains "exception" or LogMessage contains "fatal"
| project TimeGenerated, PodName, LogMessage
| order by TimeGenerated desc
```

```kusto
// Get logs around a crash time
let crashTime = datetime("2026-02-14T10:30:00Z");
ContainerLogV2
| where PodName == "<pod-name>"
| where TimeGenerated between ((crashTime - 5m) .. (crashTime + 1m))
| project TimeGenerated, ContainerName, LogMessage
| order by TimeGenerated asc
```

> **Note:** If Log Analytics is not enabled, work with the customer to obtain logs via `kubectl logs` or other means.

---

### 1. Get Pod YAML

Retrieve the full pod specification to review configuration, resource limits, probes, and environment variables.

#### Geneva Action (via ASC)

- **Action Name:** `Kubectl Get/Describe Execution`
- **Command:** `get -o yaml`
- **Command:** `pods`
- **Command:** `<namespace>`

#### What to Review in YAML

| Section | What to Look For |
|---------|------------------|
| `spec.containers[].resources` | Memory/CPU requests and limits |
| `spec.containers[].livenessProbe` | Probe configuration (timing, endpoint) |
| `spec.containers[].readinessProbe` | Readiness probe settings |
| `spec.containers[].env` | Environment variables (missing required vars?) |
| `spec.containers[].image` | Correct image and tag |
| `status.containerStatuses[]` | Current and last state, restart count |

### 2. Describe Pod

Get event history and detailed status for a specific pod namespace.

#### Geneva Action (via ASC)

- **Action Name:** `Kubectl Get/Describe Execution`
- **Command:** `describe`
- **Command:** `pods`
- **Command:** `<namespace>`

#### Key Sections in Output

| Section | Information |
|---------|-------------|
| **Events** | Recent events (probe failures, kills, scheduling) |
| **Conditions** | Pod conditions (Ready, ContainersReady, etc.) |
| **State/Last State** | Current and previous container state |
| **Reason** | Termination reason (OOMKilled, Error, Completed) |

### 3. Get Pod Logs

Retrieve logs from kube-system pods.

> **Limitation:** Geneva Actions can only retrieve logs for **certain kube-system pods** (coredns, kube-proxy, etc.). For customer application logs, use [Log Analytics Workspace](#log-analytics-workspace-customer-logs) or request logs directly from the customer.

#### Geneva Actions (via ASC - Kubectl Command tab)

- Navigate to **Kubectl Command** tab in Geneva Actions
- Select the kube-system pod to view logs
- Only certain system pods are available

#### For Customer Application Logs

- Check if Log Analytics is enabled (top of ASC resource page)
- If enabled: Query via Log Analytics Workspace
- If not enabled: Request customer to run `kubectl logs <pod-name> -n <namespace>` and share output

#### Log Analysis Tips

- Look for stack traces or exceptions near crash time
- Search for "error", "fatal", "panic", "exception"
- Check for connection failures to dependencies
- Look for OOM warnings before exit 137

### 4. Get Events

Retrieve namespace or cluster-wide events to see the full picture.

#### Geneva Action (via ASC)

- **Action Name:** `Kubectl Get/Describe Execution`
- **Command:** `get`
- **Resource:** `events`
- **Namespace:** `<namespace>`

#### Event Patterns and Their Meaning

| Event Reason | Indicates |
|-------------|-----------|
| `BackOff` | Container crash loop |
| `Killing` | Container being terminated (probe fail, OOM) |
| `OOMKilling` | Memory limit exceeded |
| `FailedScheduling` | Cannot schedule pod (resources, affinity) |
| `FailedMount` | Volume mount issue |
| `Unhealthy` | Probe failure |

---

## Short Copy-Paste Workflows

### Workflow A: Pod `CrashLoopBackOff`

Use this quick sequence when pods are restarting and failing.

```bash
# 1) Pod status and restart count
kubectl get pods -n <namespace> -o wide

# 2) Pod details and events
kubectl describe pod <pod-name> -n <namespace>

# 3) Current and previous logs
kubectl logs <pod-name> -n <namespace> --tail=200
kubectl logs <pod-name> -n <namespace> --previous --tail=200

# 4) Last termination reason / exit code
kubectl get pod <pod-name> -n <namespace> -o jsonpath='{.status.containerStatuses[*].lastState.terminated.reason}{"\n"}{.status.containerStatuses[*].lastState.terminated.exitCode}{"\n"}'
```

Then in ASI:

1. **Pods/Daemonsets**: confirm restart history and timeline.
2. **Kubectl Audit**: check who/what patched, updated, or deleted workload objects near issue start time.
3. **API QoS** (if deployment/rollout failed): verify API latency/error spikes.

### Workflow B: App not responding but pod is `Running`

Use this quick sequence to locate the failing hop.

```bash
# 1) Verify pod and service state
kubectl get pod <pod-name> -n <namespace> -o wide
kubectl get svc <service-name> -n <namespace>
kubectl get endpoints <service-name> -n <namespace>

# 2) Bypass ingress and test service directly
kubectl -n <namespace> port-forward svc/<service-name> 18080:<service-port>
# In another shell:
curl -v http://127.0.0.1:18080/<path>

# 3) Bypass service and test pod directly
kubectl -n <namespace> port-forward pod/<pod-name> 18081:<container-port>
# In another shell:
curl -v http://127.0.0.1:18081/<path>

# 4) Correlate logs at ingress and app layers
kubectl logs <pod-name> -n <namespace> --tail=200
```

Then in ASI:

1. **Pods/Daemonsets**: verify pod health/restarts during repro.
2. **Kubectl Audit**: look for recent service/ingress/deployment changes.
3. **API QoS**: use when creation/update operations are slow or failing.

---

## Detailed Example Workflows

### Workflow 1: Pod in CrashLoopBackOff

Use this workflow when a customer reports pods are repeatedly crashing.

#### Step 1: Get Pod Status (ASI)

1. Open ASI, select cluster
2. Go to **Pods/Daemonsets** tab
3. Filter by namespace: `<customer-namespace>`
4. Find the crashing pod(s) - look for `CrashLoopBackOff` status or high restart count
5. Note the restart count, last restart time, and node

#### Step 2: Check Last Termination State (Geneva Actions via ASC)

Use `Kubectl Get/Describe Execution` action:

- Command: `get -o yaml`
- Resource: `pods`
- Namespace: `<namespace>`

In the YAML output, look for `status.containerStatuses[0].lastState.terminated` which shows `exitCode`, `reason`, and `finishedAt`.

#### Step 3: Get Container Logs

_Option A - If Log Analytics is enabled (check top of ASC resource page):_

```kusto
// Query in Log Analytics Workspace
ContainerLogV2
| where PodName == "<pod-name>"
| where TimeGenerated > ago(1h)
| project TimeGenerated, ContainerName, LogMessage
| order by TimeGenerated desc
```

_Option B - If Log Analytics is NOT enabled:_
Request customer to run and share output:

```bash
kubectl logs <pod-name> -n <namespace> --previous --tail=200
```

Look for errors, exceptions, or crash stack traces.

#### Step 4: Check Resource Limits (Geneva Actions via ASC)

Use `Kubectl Get/Describe Execution` action:

- Command: `get -o yaml`
- Resource: `pods`
- Namespace: `<namespace>`

In the YAML output, look for `spec.containers[0].resources` to see limits. Compare against actual usage if exit code was 137 (OOMKilled).

#### Step 5: Check Events (Geneva Actions via ASC)

Use `Kubectl Get/Describe Execution` action:

- Command: `get`
- Resource: `events`
- Namespace: `<namespace>`

Look for `Killing`, `BackOff`, or `Unhealthy` events.

#### Step 6: Query Restart History (Kusto)

```kusto
let clusterName = "<cluster-name>";
AKSPodInventory
| where TimeGenerated > ago(24h)
| where ClusterName =~ clusterName
| where PodName contains "<pod-name>"
| project TimeGenerated, PodName, PodStatus, RestartCount
| order by TimeGenerated desc
```

Use to see restart pattern over time.

#### Decision Matrix

| Finding | Next Action |
|---------|-------------|
| Exit code 137 + OOMKilled reason | See [Resource-Constraint-Troubleshooting](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Cluster-Management/Resource-Constraint-Troubleshooting) |
| Exit code 1 + application exception in logs | Application code issue (out of scope) |
| Exit code 127 / "command not found" | Image configuration issue |
| Liveness probe failures in events | Check probe configuration |
| "exec format error" in logs | Architecture mismatch (see [Exec Format Error](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Applications/Application-Failures-Overview#exec-format-error)) |

---

### Workflow 2: Application Not Responding (Pod Running)

Use this workflow when pods show `Running` status but the application doesn't respond to requests.

#### Step 1: Verify Pod Status (Geneva)

1. Open ASC, select cluster
2. Go to **Geneva Actions** tab
3. Confirm pod is `Running` with `Ready` status (1/1 or similar) via get pods -o wide
4. Check restart count - if high, may be intermittent crashes
5. Note which node the pod is on

#### Step 2: Check AppLens Detectors

1. Open **AppLens** site, provide AKS Resource ID
2. Via "Analysis - L2 Support Topic" run "Pod Creation and Scheduling" detectors
3. Check for any flagged issues or recommendations

#### Step 3: Get Full Pod Details (Geneva Actions via ASC)

Use `Kubectl Get/Describe Execution` action:

- Command: `describe`
- Resource: `pods`
- Namespace: `<namespace>`

Look for:

- **Conditions:** All should be `True` for healthy pod
- **Events:** Any recent probe failures or warnings
- **Resource Usage:** Compare against limits

#### Step 4: Check Application Logs

_Option A - If Log Analytics is enabled (check top of ASC resource page):_

```kusto
// Query in Log Analytics Workspace
ContainerLogV2
| where PodName == "<pod-name>"
| where TimeGenerated > ago(1h)
| where LogMessage contains "error" or LogMessage contains "timeout"
| project TimeGenerated, ContainerName, LogMessage
| order by TimeGenerated desc
```

_Option B - If Log Analytics is NOT enabled:_
Request customer to run and share output:

```bash
kubectl logs <pod-name> -n <namespace> --tail=500
```

Look for:

- Error messages without crashes
- Connection timeouts to dependencies
- Thread/goroutine exhaustion
- Slow query warnings

#### Step 5: Check Service Endpoints (Geneva Actions via ASC)

Use `Kubectl Get/Describe Execution` action:

- Command: `get`
- Resource: `endpoints`
- Namespace: `<namespace>`

Verify the pod IP is listed in endpoints. If missing, readiness probe may be failing.

#### Step 6: Check API Server Latency (ASI)

> **Note:** Control plane issues are exceptionally unlikely to result in application failures on a running pod unless the pod is explicitly interacting with other Kubernetes resources via control plane calls.

1. Go to **API QoS** tab
2. Check if there are latency spikes or errors
3. High latency could indicate control plane issues affecting deployments

#### Step 7: Review Recent Changes (ASI)

1. Go to **Kubectl Audit** tab
2. Filter: Namespace = `<namespace>`, Resource = `deployments` or `pods`
3. Check for recent updates that correlate with when issue started

#### Step 8: Deep Dive with Kusto (if needed)

```kusto
let clusterName = "<cluster-name>";
let namespace = "<namespace>";
KubeEvents
| where TimeGenerated > ago(24h)
| where ClusterName =~ clusterName
| where Namespace == namespace
| where Reason == "Unhealthy" or Message contains "timeout" or Message contains "connection refused"
| project TimeGenerated, Name, Reason, Message
| order by TimeGenerated desc
```

Look for patterns in probe failures or connectivity issues.

#### Decision Matrix

| Finding | Next Action |
| --------- | ------------- |
| Pod not in service endpoints | Check readiness probe |
| Logs show connection refused to DB/API | Check network connectivity, DNS |
| Logs show slow queries or timeouts | Application performance issue (first verify node health, otherwise out of scope) |
| Recent deployment update correlates with issue | Recommend rollback |
| No errors, pod healthy, but app unresponsive | Likely application deadlock/resource issue (out of scope) |

---

## Quick Reference: Geneva Actions Commands

These commands are executed via **Kubectl Get/Describe Execution** action in ASC:

| Scenario | Command | Resource | Notes |
| ---------- | --------- | ---------- | ------- |
| Get pod status | `get -o wide` | `pods` | |
| Get pod YAML | `get -o yaml` | `pods` | |
| Describe pod | `describe` | `pods` | |
| Get events | `get` | `events` | |
| Check resource usage | `top` | `pods` | |
| Check node resources | `top` | `nodes` | |
| Get deployment | `get -o yaml` | `deployments` | |
| Get service endpoints | `get` | `endpoints` | |
| **kube-system logs** | Via Kubectl Command tab | limited pods only | Only certain system pods |

> **Note:** Customer application logs are NOT available via Geneva Actions. Use [Log Analytics](#log-analytics-workspace-customer-logs) or request from customer.

---

## Jarvis Quick Commands (via ASC/Geneva)

Use these for fast incident triage when kubeconfig access is unavailable.

| Goal | Action / Command pattern |
|---|---|
| Gather workload YAML | `get -o yaml pods -n <namespace>` or `get -o yaml deploy/<name> -n <namespace>` |
| Describe pod state and events | `describe pod <pod-name> -n <namespace>` |
| Get kube-system logs (supported pods only) | `logs <pod-name> -n kube-system --tail=200` |
| Get workload inventory | `get pods -n <namespace> -o wide` |
| Validate endpoints | `get endpoints <service-name> -n <namespace>` |

If customer application logs are needed, use Log Analytics (if enabled) or ask customer to run `kubectl logs` and share output.

---

## Quick Reference: Tool Selection Guide

| Need | Best Tool | Why |
|------|-----------|-----|
| Quick pod/cluster overview | **ASI** | Visual dashboard, no commands needed |
| Run kubectl commands (read-only) | **Geneva Actions (ASC)** | Read-only access, no kubeconfig needed |
| **Customer application logs** | **Log Analytics** | Only source for customer logs (if enabled) |
| kube-system pod logs | **Geneva Actions** | Via Kubectl Command tab (limited pods) |
| Automated issue detection | **AppLens** | Pre-built detectors identify common problems |
| Historical pattern analysis | **Kusto** | Query telemetry over time |
| Audit log investigation | **ASI** or **Kusto**| Built-in audit log viewer |
| API server performance | **ASI** | API QoS metrics dashboard |

---

## Troubleshooting Tips

### When ASI Data is Stale or Missing

- ASI data may have a slight delay (minutes) as all data is streamed via Kusto which is not real-time
- For real-time data, use Geneva Actions via ASC
- If cluster is off/unreachable, ASI may not show current state

### When Geneva Actions Fail

- Verify cluster connectivity (API server accessible)
- Check if cluster is in failed state
- Try simpler commands first (`get pods`) to verify access
- Geneva Actions are read-only; they cannot modify cluster state
- See [How-to-pull-logs-via-Serial-Access-Console-when-Jarvis-is-failing](/Azure-Kubernetes-Service-Wiki/AKS/Platform-and-Tools/Tools/Jarvis/How-to-pull-logs-via-Serial-Access-Console-when-Jarvis-is-failing)

### When AppLens Detectors Don't Show Data

- Check the time range - detectors may not have recent data
- Some detectors require specific conditions to trigger
- Use Kusto queries for more granular investigation

### When Logs Are Empty or Truncated

- Container may have crashed before writing logs
- **Geneva Actions can only access kube-system pod logs** - for customer app logs, use Log Analytics
- Check if Log Analytics is enabled (top of ASC resource page)
- If Log Analytics not enabled, request customer to run `kubectl logs` and share output
- Look at events instead of logs for immediate crash scenarios

### When Kusto Returns No Results

- Verify SubscriptionId and ClusterName filters are correct
- Expand the time range (`ago(7d)` instead of `ago(24h)`)
- Check if telemetry is enabled for the cluster
- Try broader queries first, then narrow down

---

## Related Documentation

- [Application Failures Overview](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Applications/Application-Failures-Overview) - Main overview of application failure types
- [Application Failures - Scoping Guide](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Applications/Application-Failures-TSG) - Flowchart for categorizing issues
- [Identifying Application-Based Issues](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Applications/Identifying-Application-Based-Issues) - Distinguish app vs infra issues
- [Kusto Documentation](/Azure-Kubernetes-Service-Wiki/AKS/Platform-and-Tools/Tools/Kusto) - Additional Kusto guides

---

## Owner and Contributors

**Owner:** jamesonhearn <jamesonhearn@microsoft.com>

**Contributors:**

- jamesonhearn <jamesonhearn@microsoft.com>

