---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Container Storage Enabled by Azure Arc/Common errors Kubernetes"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Container%20Storage%20Enabled%20by%20Azure%20Arc%2FCommon%20errors%20Kubernetes"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Common Kubernetes Errors — Azure Container Storage Enabled by Azure Arc

### CrashLoopBackOff

*A pod keeps restarting repeatedly due to failure in the application or container misconfiguration*

**Identify the failing pod:**

1. `kubectl get pods -n <namespace>`

**Describe the pod:**

2. `kubectl describe pod <pod-name> -n <namespace>`

**Check container logs:**

3. `kubectl logs <pod-name> -n <namespace>` or `kubectl logs <pod-name> -n <namespace> --previous`

### PendingPods

*Pods remain in a Pending state because they cannot be scheduled due to resource constraints or missing dependencies*

**Describe the pod:**

1. `kubectl describe pod <pod-name> -n <namespace>`

Common reasons:
- FailedScheduling
- Insufficient cpu
- Insufficient memory
- pod has unbound PersistentVolumeClaims
- didn't tolerate node taint
- 0/X nodes are available

**Check node health and schedulability:**

2. `kubectl get nodes`
3. `kubectl describe node <node-name>`

### CreateContainerConfigError

*A container fails to start due to incorrect configuration setting, such as missing environment variables, incorrect volume mounts or invalid secrets*

**Confirm and pull the real failure reason (Events):**

1. `kubectl get pods -A | grep -i CreateContainerConfigError`
2. `kubectl describe pod <pod-name> -n <namespace>`
3. `kubectl get events -n <namespace> --sort-by='.lastTimestamp' | tail -50`

**Quick triage cheat sheet (what to look for in Events):**

- **`configmap "<name>" not found`** — create/fix ConfigMap
- **`secret "<name>" not found`** — create/fix Secret ref (common with env `secretKeyRef`)
- **`subPath ...` / volumeMount errors** — volume/volumeMount/subPath mismatch
- **`stat /path ... no such file or directory`** — node missing expected path; reschedule/cordon node
