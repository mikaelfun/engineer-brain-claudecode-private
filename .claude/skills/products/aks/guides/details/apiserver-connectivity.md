# AKS API Server 连接与隧道 -- Comprehensive Troubleshooting Guide

**Entries**: 15 | **Draft sources**: 3 | **Kusto queries**: 0
**Source drafts**: ado-wiki-b-aks-cluster-stuck-on-starting.md, onenote-aks-fault-domain-kusto.md, onenote-aks-kusto-queries-reference.md
**Generated**: 2026-04-07

---

## Phase 1: AKS only rotates control plane certificates but no

### aks-096: kubectl logs returns EOF error, konnectivity-agent pod not Running, liveness/rea...

**Root Cause**: AKS only rotates control plane certificates but not konnectivity client certificates, causing them to expire. Expired certificates break the tunnel between control plane and nodes.

**Solution**:
1) Rotate cluster certificates; 2) Or upgrade AKS cluster. Diagnose: use az vmss run-command invoke with crictl ps/logs to check konnectivity-agent logs on node.

`[Score: [G] 8.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 2: Underlay infrastructure update on the Azure platfo

### aks-105: AKS API server becomes unreachable or intermittently unavailable even when uptim...

**Root Cause**: Underlay infrastructure update on the Azure platform can cause API server downtime. Uptime SLA provides financial credit but does not guarantee 100% availability during underlay maintenance events. ICM reference: 259200058.

**Solution**:
1) Confirm SLA is enabled (uptime-sla). 2) If recurring, raise ICM to AKS PG. 3) SLA covers financial compensation, not prevention. 4) For critical workloads, monitor API server health and implement client-side retry logic.

`[Score: [B] 7.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 3: With Uptime SLA, master nodes get fixed CPU/Mem wi

### aks-227: AKS control plane resource limits unknown; API server perf issues under heavy lo...

**Root Cause**: With Uptime SLA, master nodes get fixed CPU/Mem with 12GB memory limit for control plane pods

**Solution**:
Enable AKS Uptime SLA for fixed control plane resources (12GB mem). Without SLA, allocation is best-effort

`[Score: [B] 7.5 | Source: [onenote: POD/VMSCIM/4. Services/AKS/##Regular Syn]]`

## Phase 4: Finalizers on the namespace (e.g. kubernetes final

### aks-464: Kubernetes namespace stuck in Terminating state; kubectl delete --force --grace-...

**Root Cause**: Finalizers on the namespace (e.g. kubernetes finalizer) prevent deletion from completing even with --force flag

**Solution**:
1) Export namespace JSON: kubectl get namespace <ns> -o json > <ns>.json. 2) Edit the JSON file and remove kubernetes from the finalizers array. 3) Apply: kubectl replace --raw /api/v1/namespaces/<ns>/finalize -f ./<ns>.json. 4) Verify with kubectl get namespace.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Cluster%20Management/Deleting%20namespaces%20stuck%20in%20terminating%20state)]`

### aks-467: Kubernetes namespace stuck in Terminating state, cannot be deleted even with kub...

**Root Cause**: Finalizers on the namespace (e.g. kubernetes finalizer) prevent the namespace from being fully deleted

**Solution**:
Export namespace to JSON (kubectl get namespace <ns> -o json), remove kubernetes from the finalizers array, then apply with: kubectl replace --raw /api/v1/namespaces/<ns>/finalize -f ./<ns>.json

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCluster%20Management%2FDeleting%20namespaces%20stuck%20in%20terminating%20state)]`

## Phase 5: When the AKS tunnel (konnectivity/SSH) connection 

### aks-609: Cannot collect container logs via kubectl logs when AKS tunnel/konnectivity is d...

**Root Cause**: When the AKS tunnel (konnectivity/SSH) connection is unavailable, kubectl logs cannot proxy through the API server to reach the kubelet on the node, making standard log collection impossible.

**Solution**:
Collect logs directly from the node's kubelet API: 1) Find node IP: 'kubectl get pod -owide' + 'kubectl get node -owide'. 2) Get bearer token from kubeconfig or ServiceAccount secret. 3) From a VM with network connectivity to node IP on TCP:10250, use: curl -k -H 'Authorization: Bearer <token>' https://<nodeIP>:10250/containerLogs/<namespace>/<podName>/<containerName>. Format: https://<nodeIP>:10250/containerLogs/<namespace>/<pod>/<container>.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FMonitoring%2FCollect%20container%20logs%20directly%20from%20a%20node%27s%20kubelet%20(i.e.%20when%20tunnel%20is%20down))]`

## Phase 6: Kubelet spins up a new set of system pods after re

### aks-611: Kubernetes system pod logs lost after master node reboot — kubectl logs only sho...

**Root Cause**: Kubelet spins up a new set of system pods after reboot. The new pods' logs start from the reboot time, so previous pod logs are no longer accessible via kubectl logs.

**Solution**:
Docker daemon preserves logs of previous container instances in 'Exited' status across reboots. 1) Find old containers: 'docker ps -a -f status=exited'. 2) Access logs at /var/lib/docker/containers/<ContainerID>/. 3) Collect all logs: 'tar -cvzf /tmp/kubesystemlogs.tgz /var/lib/docker/containers/*/*.log'. This includes pre-reboot logs for kube-apiserver, controller-manager, scheduler, etc.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FMonitoring%2FCollect%20Kubernetes%20POD%20logs%20prior%20to%20last%20reboot)]`

## Phase 7: Circular dependency: konnectivity requires apiserv

### aks-656: KMS deadlock: AKS cluster with KMS private keyvault + konnectivity gets stuck af...

**Root Cause**: Circular dependency: konnectivity requires apiserver, apiserver requires KMS to decrypt etcd, KMS requires konnectivity to reach private Key Vault. During cluster stop/start konnectivity shuts down breaking the loop. Private keyvault + konnectivity support ended Aug 22 2025

**Solution**:
Enable API Server VNet Integration: az aks update --enable-apiserver-vnet-integration. This removes the konnectivity dependency for KMS access to private Key Vault. For public key vaults this issue does not occur

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/KMS%20etcd%20Encryption)]`

## Phase 8: Customer did not complete storage migration after 

### aks-843: After migrating AKS KMS from v1 to v2, kubectl get secrets returns unable to tra...

**Root Cause**: Customer did not complete storage migration after KMS v1 to v2 migration. Secrets stored in etcd still have v1 prefix (k8s:enc:kms:v1:azurekmsprovider0) but API server expects v2 prefix. For clusters 1.27+, KMS must be disabled before upgrade and re-enabled after.

**Solution**:
Escalate to AKS PG via IcM. PG will: 1) access underlay via hcpdebug, 2) list secrets in etcd to find v1-prefixed entries, 3) edit encryption-provider-config configmap to change apiVersion from v2 back to v1, 4) restart kube-apiserver, 5) re-encrypt affected secrets, 6) verify recovery. CSS cannot resolve without PG engagement.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FKMS%20list%20secrets%20error%20after%20migration)]`

## Phase 9: The kubectl debug command does not provide suffici

### aks-859: When trying to enable AppArmor profile on AKS node using kubectl debug, user get...

**Root Cause**: The kubectl debug command does not provide sufficient privilege escalation to enable AppArmor profiles on AKS nodes.

**Solution**:
Use node-shell or establish a direct SSH connection to the AKS node instead of kubectl debug. Ref: https://learn.microsoft.com/en-us/azure/aks/manage-ssh-node-access

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Security%20and%20Identity/AKS%20cluster%20security%20AppArmor%20Linux%20kernel%20security%20module)]`

## Phase 10: Kubernetes API server has built-in request throttl

### aks-111: AKS API server returns HTTP 429 (Too Many Requests) to client requests; customer...

**Root Cause**: Kubernetes API server has built-in request throttling (Priority and Fairness). When too many concurrent requests hit the API server, it returns 429. This is separate from ARM-level throttling (aks-onenote-005). Need to analyze kube-audit logs to identify the source of excessive API calls.

**Solution**:
Diagnose via Kusto kube-audit query: ControlPlaneEventsNonShoebox union ControlPlaneEvents | where category == 'kube-audit' | extend event=parse_json(tostring(parse_json(properties).log)) | where event.stage == 'ResponseComplete' and event.verb != 'watch' | extend code=tostring(event.responseStatus.code) | summarize count() by code, bin(PreciseTimeStamp, 1m). Filter by ccpNamespace (cluster ID). Look for high count of 429 response codes. Identify callers via event.user.username. Reduce client-side list/watch frequency or add caching.

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 11: The Kubernetes service (e.g. metrics-server, admis

### aks-1122: 'Error from server: error dialing backend: dial tcp' when running kubectl top po...

**Root Cause**: The Kubernetes service (e.g. metrics-server, admission webhook) backing the API request is failing — pods not running, endpoints stale, or service misconfigured

**Solution**:
Check the error message to identify the affected service. Verify pods, services, and endpoints for that service are healthy. Fix or restart the failing service pods.

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/error-from-server-error-dialing-backend-dial-tcp)]`

## Phase 12: AKS applied managed API server guard (aks-managed-

### aks-1175: High rate of HTTP 429 errors from API server; 'The server is currently unable to...

**Root Cause**: AKS applied managed API server guard (aks-managed-apiserver-guard FlowSchema + PriorityLevelConfiguration) after frequent API server OOM events; non-system client requests throttled

**Solution**:
Identify unoptimized clients via kube-audit logs. Tune API call patterns. After fixing, delete guard: kubectl delete flowschema aks-managed-apiserver-guard; kubectl delete prioritylevelconfiguration aks-managed-apiserver-guard.

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/troubleshoot-apiserver-etcd)]`

## Phase 13: Reserved system namespace names blocked; managed n

### aks-1272: Managed namespace: cannot use system namespace names; cannot modify via kubectl ...

**Root Cause**: Reserved system namespace names blocked; managed namespaces controlled by ARM restrict kubectl modifications

**Solution**:
Use non-reserved namespace names; manage through ARM API, Azure portal, or az aks namespace CLI commands instead of kubectl

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-managed-namespaces)]`

## Phase 14: Etcd leader election event occurred. This is typic

### aks-106: AKS API server returns error: rpctypes.EtcdError{code:0xe, desc:"etcdserver: lea...

**Root Cause**: Etcd leader election event occurred. This is typically transient and not necessarily fatal — etcd performs leader elections during maintenance, network blips, or pod restarts. S500 customer (BMW) reported this error.

**Solution**:
1) Check if the error is transient or persistent. 2) Collect client-side error logs to correlate with API server errors. 3) If persistent, investigate etcd cluster health. 4) Engage AKS PG if etcd leader changes are frequent and causing API instability.

`[Score: [B] 5.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | kubectl logs returns EOF error, konnectivity-agent pod not Running, liveness/rea... | AKS only rotates control plane certificates but not konnecti... | 1) Rotate cluster certificates; 2) Or upgrade AKS cluster. D... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | AKS API server becomes unreachable or intermittently unavailable even when uptim... | Underlay infrastructure update on the Azure platform can cau... | 1) Confirm SLA is enabled (uptime-sla). 2) If recurring, rai... | [B] 7.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | AKS control plane resource limits unknown; API server perf issues under heavy lo... | With Uptime SLA, master nodes get fixed CPU/Mem with 12GB me... | Enable AKS Uptime SLA for fixed control plane resources (12G... | [B] 7.5 | [onenote: POD/VMSCIM/4. Services/AKS/##Regular Syn] |
| 4 | Kubernetes namespace stuck in Terminating state; kubectl delete --force --grace-... | Finalizers on the namespace (e.g. kubernetes finalizer) prev... | 1) Export namespace JSON: kubectl get namespace <ns> -o json... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Cluster%20Management/Deleting%20namespaces%20stuck%20in%20terminating%20state) |
| 5 | Kubernetes namespace stuck in Terminating state, cannot be deleted even with kub... | Finalizers on the namespace (e.g. kubernetes finalizer) prev... | Export namespace to JSON (kubectl get namespace <ns> -o json... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCluster%20Management%2FDeleting%20namespaces%20stuck%20in%20terminating%20state) |
| 6 | Cannot collect container logs via kubectl logs when AKS tunnel/konnectivity is d... | When the AKS tunnel (konnectivity/SSH) connection is unavail... | Collect logs directly from the node's kubelet API: 1) Find n... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FMonitoring%2FCollect%20container%20logs%20directly%20from%20a%20node%27s%20kubelet%20(i.e.%20when%20tunnel%20is%20down)) |
| 7 | Kubernetes system pod logs lost after master node reboot — kubectl logs only sho... | Kubelet spins up a new set of system pods after reboot. The ... | Docker daemon preserves logs of previous container instances... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FMonitoring%2FCollect%20Kubernetes%20POD%20logs%20prior%20to%20last%20reboot) |
| 8 | KMS deadlock: AKS cluster with KMS private keyvault + konnectivity gets stuck af... | Circular dependency: konnectivity requires apiserver, apiser... | Enable API Server VNet Integration: az aks update --enable-a... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/KMS%20etcd%20Encryption) |
| 9 | After migrating AKS KMS from v1 to v2, kubectl get secrets returns unable to tra... | Customer did not complete storage migration after KMS v1 to ... | Escalate to AKS PG via IcM. PG will: 1) access underlay via ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FKMS%20list%20secrets%20error%20after%20migration) |
| 10 | When trying to enable AppArmor profile on AKS node using kubectl debug, user get... | The kubectl debug command does not provide sufficient privil... | Use node-shell or establish a direct SSH connection to the A... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Security%20and%20Identity/AKS%20cluster%20security%20AppArmor%20Linux%20kernel%20security%20module) |
| 11 | AKS API server returns HTTP 429 (Too Many Requests) to client requests; customer... | Kubernetes API server has built-in request throttling (Prior... | Diagnose via Kusto kube-audit query: ControlPlaneEventsNonSh... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 12 | 'Error from server: error dialing backend: dial tcp' when running kubectl top po... | The Kubernetes service (e.g. metrics-server, admission webho... | Check the error message to identify the affected service. Ve... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/error-from-server-error-dialing-backend-dial-tcp) |
| 13 | High rate of HTTP 429 errors from API server; 'The server is currently unable to... | AKS applied managed API server guard (aks-managed-apiserver-... | Identify unoptimized clients via kube-audit logs. Tune API c... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/troubleshoot-apiserver-etcd) |
| 14 | Managed namespace: cannot use system namespace names; cannot modify via kubectl ... | Reserved system namespace names blocked; managed namespaces ... | Use non-reserved namespace names; manage through ARM API, Az... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-managed-namespaces) |
| 15 | AKS API server returns error: rpctypes.EtcdError{code:0xe, desc:"etcdserver: lea... | Etcd leader election event occurred. This is typically trans... | 1) Check if the error is transient or persistent. 2) Collect... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
