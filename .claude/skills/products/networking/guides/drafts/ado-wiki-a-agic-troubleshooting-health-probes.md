---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/AGIC Application Gateway Ingress Controller/Troubleshooting Health Probes"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FAGIC%20Application%20Gateway%20Ingress%20Controller%2FTroubleshooting%20Health%20Probes"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

> **Key note**
>
> AGIC does **not** run health probes and does **not** have its own probe.
>  
> AGIC is a **configuration translator**:
> - It reads probe-related configuration from Kubernetes objects (Pod specs or Ingress annotations)
> - It generates an **ARM template**
> - That ARM template deploys or updates **Application Gateway** with a specific **health probe configuration**
>
> **Application Gateway is the component that actually executes health probes and determines backend health.**


# Understanding AGIC Health Probes 

In AGIC-based deployments, **Application Gateway health probes** can be derived from three different Kubernetes configuration sources. Although multiple configurations may exist in Kubernetes at the same time, AGIC will use only one of them to determine backend health in Application Gateway.

This precedence order is:

1. Kubernetes Pod Readiness or Liveness probes
2. Ingress health probe annotations
3. AGIC default (fallback) health probe

Only one of these will be active at any given time.

Note that **neither AGIC nor Application Gateway consumes the *results* of Kubernetes readiness or liveness probes**. AGIC only reuses their *configuration* to generate the Application Gateway health probe in ARM.

## 1) Pod Readiness and Liveness Probes (Highest Priority)

If a Deployment or Pod specification defines a `readinessProbe` or `livenessProbe`, AGIC treats the Pod probe configuration as the authoritative **input** for generating the Application Gateway health probe in the ARM template.

AGIC reads the probe definition from the Pod spec and creates an equivalent Application Gateway health probe using the same path, port, and protocol (HTTP or HTTPS). **Once a Pod probe exists, AGIC does not look at Ingress health probe annotations at all.**

This is the most common source of confusion in support cases. Engineers often focus on the Ingress resource and assume AGIC is using annotations, when in reality a readiness or liveness probe defined months earlier in the Deployment is silently driving Application Gateway behavior.

## 2) Ingress Health Probe Annotations (Used Only If No Pod Probes Exist)

If no readiness or liveness probes are defined on the Pods, AGIC then evaluates the Ingress resource for health probe annotations.

Supported annotations:
- `appgw.ingress.kubernetes.io/health-probe-path`
- `appgw.ingress.kubernetes.io/health-probe-hostname`
- `appgw.ingress.kubernetes.io/health-probe-status-codes`
- `appgw.ingress.kubernetes.io/health-probe-timeout`
- `appgw.ingress.kubernetes.io/health-probe-interval`

Reference: [AppGW Ingress Controller Annotations](https://learn.microsoft.com/en-us/azure/application-gateway/ingress-controller-annotations)

## 3) AGIC Default Health Probe (Last Resort)

If neither Pod probes nor Ingress health probe annotations exist, AGIC creates a default health probe automatically: HTTP GET to `/` on the default backend port, 200-399 status codes healthy, 3 consecutive failures = unhealthy, 30s interval.

---

# Common Issues and Troubleshooting AGIC Probes

## How to Find Which Probe Configuration Is Being Used

**Step 1) Inspect the Kubernetes Deployment / Pod**
```bash
kubectl get deploy -n <namespace> -o yaml
```
Look for `readinessProbe` or `livenessProbe`. If either exists → AGIC uses Pod probe, ignores annotations.

**Step 2) Check Ingress health probe annotations**
```bash
kubectl get ingress -n <namespace> -o yaml
```
Look for `appgw.ingress.kubernetes.io/health-probe-*` annotations.

**Step 3) Default probe** — if neither Pod probes nor annotations exist, AGIC uses the default.

**Step 4) Validate via Backend Server Diagnostics History** in ASC/Portal.

---

## Health probe returns 404 (Page Not Found)

Probe path does not match a valid application endpoint (e.g., default `/` path returns 404).

**Fix:** Update readiness probe in Pod spec or set `health-probe-path` annotation to point to a valid `/health` or `/status` endpoint.

## Health probe returns 401 (Unauthorized)

App Gateway probes cannot send authentication headers. Probe receives 401 and marks backend unhealthy.

**Fix options:**
1. Expose a dedicated unauthenticated health endpoint
2. Use `health-probe-status-codes` annotation to accept 401: e.g., `200-399,401`

## Backend unhealthy due to hostname mismatch

Probe uses wrong Host header causing HTTPS/SNI validation failure.

**Fix:** Use `health-probe-hostname` annotation or configure host override in backend HTTP settings.

## Manual changes being overwritten

AGIC fully owns App Gateway configuration. Manual changes via portal/CLI are reverted on next reconciliation.

**Fix:** Always apply probe changes through Kubernetes (Pod probes or Ingress annotations).

## Probe path format causing AppGW Failed state

**Error:**
```
ApplicationGatewayProbePathIsInvalid: Path specified for Probe ... is not valid. 
Path must start with a forward slash (/) and meet the format requirements.
```

**Cause:** Kubernetes readiness/liveness probe configured with path like `test.html` (no leading `/`). Kubernetes accepts it; Application Gateway rejects it.

**Fix:**
```bash
kubectl get deploy -n <namespace> -o yaml
```
Correct probe path to start with `/` (e.g., `/test.html`). Once fixed, AGIC regenerates the App Gateway health probe.
