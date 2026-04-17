---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/TSG: Monitor AKS applications with OpenTelemetry Protocol (OTLP)"
sourceUrl: "https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/How-To/TSG%3A%20Monitor%20AKS%20applications%20with%20OpenTelemetry%20Protocol%20(OTLP)"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# TSG: Monitor AKS Applications with OpenTelemetry Protocol (OTLP)

## Public Documentation
[Monitor AKS applications with OpenTelemetry Protocol (OTLP) (Limited Preview)](https://learn.microsoft.com/en-us/azure/azure-monitor/containers/kubernetes-open-protocol)

## What It Does

AKS auto-instrumentation (`appmonitoring` addon) installs Kubernetes objects onto a cluster to enable automatic instrumentation of deployments with SDK distros. Supported languages: **.NET, Java, Node.js** (Python support coming soon).

### Typical Flow
1. **Enable addon at cluster level** (during creation or for existing cluster):
   ```
   aks update --resource-group={resource_group} --name={cluster_name} --enable-azure-monitor-app-monitoring
   ```
2. **Onboard a namespace** by creating a custom resource of kind `Instrumentation` in that namespace
3. (Optional) Fine-tune per-deployment via annotations

## How It Works

### Mutating Admission Webhook
Once enabled, the addon installs a **mutating admission webhook** that intercepts all new/modified Deployments and injects:
- `emptyDir` volumes for SDK distro binaries and logs
- `initContainer` to pull SDK distro image and copy binaries to volume
- Environment variables pointing the runtime to sideload the SDK distro

### Annotation Tracking
Mutated deployments receive the annotation:
```
monitor.azure.com/instrumentation: {"crName":"default","crResourceVersion":"16952597","platforms":["DotNet"]}
```

### Required Kubernetes Objects (verify after enablement)
```bash
kubectl get crd -n kube-system --field-selector metadata.name=instrumentations.monitor.azure.com
kubectl get serviceaccount -n kube-system --field-selector metadata.name=app-monitoring-agent-webhook-sa
kubectl get clusterrole --field-selector metadata.name=instrumentation-crd-watcher
kubectl get clusterrolebinding --field-selector metadata.name=app-monitoring-agent-webhook-binding
kubectl get secret -n kube-system --field-selector metadata.name=app-monitoring-agent-webhook-cert
kubectl get pods -l "app=app-monitoring-webhook" -n kube-system
kubectl get service -n kube-system --field-selector metadata.name=app-monitoring-agent-webhook-service
kubectl get mutatingwebhookconfiguration -n kube-system --field-selector metadata.name=app-monitoring-agent-webhook
```

## Troubleshooting: No Data in Destination

**Symptom:** No telemetry in Application Insights after enabling AKS auto-instrumentation.

### Step 1: Check annotation on deployment
```bash
kubectl describe deployment <deployment-name> -n <namespace>
```
Look for `monitor.azure.com/instrumentation` annotation.

**If annotation IS present** (correct JSON shape: `{"crName":"...","crResourceVersion":"...","platforms":[...]}`):
1. Check CR config — is `spec.destination.applicationInsightsConnectionString` correct?
   ```bash
   kubectl describe instrumentations <crName> -n <customer-namespace>
   ```
2. Check pod YAML for expected mutations (volumes, initContainers, env vars)
3. Verify app is running: `kubectl logs -f <pod-name> -n <namespace>`
4. Check SDK logs at `/var/log/applicationinsights` on the pod:
   ```bash
   kubectl exec -ti <pod-name> -- /bin/bash
   cd /var/log/applicationinsights
   ```
5. If logs show networking issue → investigate DNS/network restrictions preventing SDK from reaching Azure Monitor infrastructure
6. If logs show no issues → escalate to SDK team

**If annotation is NOT present**:
1. Verify addon is enabled:
   ```
   aks update --resource-group={resource_group} --name={cluster_name} --enable-azure-monitor-app-monitoring
   ```
2. Verify all required Kubernetes objects are installed (see list above)
3. If no objects after enablement → escalate to PG
4. Try rollout restart:
   ```bash
   kubectl rollout restart deployment <deployment-name>
   ```
5. Verify `Instrumentation` CR conditions:
   - Either CR named `default` exists in namespace, OR
   - A named CR + matching `inject-` annotation on deployment:
     ```
     instrumentation.opentelemetry.io/inject-dotnet: "cr1"
     instrumentation.opentelemetry.io/inject-java: "cr1"
     instrumentation.opentelemetry.io/inject-nodejs: "cr1"
     ```
   - No `inject-` annotation set to `false` on deployment template
6. If above fails → escalate to PG
