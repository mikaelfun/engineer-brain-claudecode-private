# AKS UDR 与路由 — general -- Comprehensive Troubleshooting Guide

**Entries**: 22 | **Draft sources**: 3 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-Multiple-Standard-Load-Balancers.md, ado-wiki-b-fleet-automated-deployments.md, ado-wiki-fleet-resourceplacement-tsg.md
**Generated**: 2026-04-07

---

## Phase 1: Cluster running very old deprecated version (e.g. 

### aks-061: AKS upgrade deadlock: certificate rotation fails with InvalidGalleryImageRef (de...

**Root Cause**: Cluster running very old deprecated version (e.g. 1.20.9 Ubuntu 18.04) with expired certs. Cert rotation needs valid image but old image removed from gallery. Upgrade needs valid certs but they are expired. Client-side deadlock.

**Solution**:
Raise ICM to AKS PG to refresh certificate from backend. Reference: ICM-51000000960825. Client-side commands cannot break this deadlock.

`[Score: [G] 10.0 | Source: [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.5]]`

## Phase 2: AKS platform performs automatic certificate rotati

### aks-139: AKS kube-config becomes invalid/expired after platform-initiated certificate rot...

**Root Cause**: AKS platform performs automatic certificate rotation (ref: release 2023-05-14). After platform cert rotation, previously downloaded kubeconfig credentials become invalid because they contain old certificates. GitHub issue: Azure/AKS#3753.

**Solution**:
Re-download kubeconfig using az aks get-credentials after certificate rotation. Docs: https://docs.azure.cn/en-us/aks/certificate-rotation. Monitor cert expiry proactively.

`[Score: [G] 8.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 3: MSI connector 返回 invalid_resource 错误，SPn token 转换失

### aks-186: AKS Remediator 报错 AADSTS500011 invalid_resource，节点上 ManagedIdentityCredential 获取...

**Root Cause**: MSI connector 返回 invalid_resource 错误，SPn token 转换失败。通常因 AAD 应用注册的 resource URI 与实际请求的资源不匹配，或 MSI 配置异常

**Solution**:
1) Kusto 诊断: cluster('mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').CPRemediatorLogs | where level=='error' | where msg contains 'AADSTS500011' | parse msg with * 'node: ' node:string ': ManagedIdentityCredential' *; 2) 检查节点 MSI 配置和 AAD 注册; 3) 如需确认受影响节点: distinct node

`[Score: [B] 7.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 4: VM Size Standard_E112ibds_v5 explicitly only suppo

### aks-575: AKS nodepool creation fails with InvalidParameter DiskControllerTypeMismatchBetw...

**Root Cause**: VM Size Standard_E112ibds_v5 explicitly only supports NVMe DiskControllerType, but the AKS node OS image does not specify a diskControllerType, so it defaults to SCSI. CRP rejects the mismatch: 'The Virtual Machine Scale Set with VM size Standard_E112ibds_v5 cannot boot with OS image or disk'. This is not an AKS-specific bug but a VM SKU + image compatibility issue.

**Solution**:
Use VM size Standard_E112iads_v5 instead (supports SCSI, less restrictive disk controller requirements). Verify SKU disk controller support via https://aka.ms/azure-compute-skus. Reference: Ebdsv5 series uses NVMe interface for Gen2 (https://learn.microsoft.com/en-us/azure/virtual-machines/ebdsv5-ebsv5-series).

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Create/DiskControllerTypeMismatchBetweenOsAndVMScaleSetSize_with_size_Standard_E112ibds_v5)]`

## Phase 5: Variant A: Linux admin username exceeds 32 charact

### aks-578: AKS node provisioning fails with vmssCSE exit code 1 on Linux. Two variants: (A)...

**Root Cause**: Variant A: Linux admin username exceeds 32 characters. The useradd command rejects usernames >32 chars. Cluster may have been created before frontend validation was added, or customer used REST API directly. Variant B: dpkg process locked by concurrent Linux package updates. Old/unsupported AKS versions with outdated node images trigger concurrent apt updates causing dpkg lock contention.

**Solution**:
Variant A: Change admin username to <32 characters: az aks create --admin-username <short_name>. Use Kusto query on FrontEndContextActivity to verify current username length. Variant B: Upgrade cluster to recent supported version and update node image. For both: collect guest logs via InspectIaaSDisk with AKS manifest, check /var/log/cloud-init.log and extension.log.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FCSE%20Exit%20Codes%2FvmssCSE%20failures%20during%20node%20provisioning)]`

## Phase 6: Leftover CRDs, ValidatingWebhookConfigurations, an

### aks-653: KEDA addon is enabled (az aks show reports enabled=true), but keda-* pods are no...

**Root Cause**: Leftover CRDs, ValidatingWebhookConfigurations, and other resources from a previous self-managed open-source KEDA installation conflict with the managed KEDA add-on Helm chart deployment. Multiple KEDA installations are not supported.

**Solution**:
Clean up all residual self-managed KEDA components: 1) Remove CRDs: 'kubectl get crd | grep keda' and delete them, 2) Remove ValidatingWebhookConfigurations: 'kubectl get validatingwebhookconfigurations | grep keda' and delete, 3) Disable KEDA add-on, 4) Re-enable KEDA add-on. Ref: https://learn.microsoft.com/en-us/azure/aks/keda-about#add-on-limitations

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FAddons%20and%20Extensions%2FKEDA)]`

## Phase 7: Kubernetes Dashboard addon has been deprecated and

### aks-661: Customer receives error 'Kubernetes Dashboard addon is deprecated for Kubernetes...

**Root Cause**: Kubernetes Dashboard addon has been deprecated and removed for AKS clusters running Kubernetes version 1.19 or later.

**Solution**:
Direct customer to use the community-maintained Kubernetes Dashboard instead. Check current supported AKS addons at https://learn.microsoft.com/en-us/azure/aks/integrations

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FAddons%20and%20Extensions%2FKube%20Dashboard%20Addon)]`

## Phase 8: GPU driver installation mode (Install/None) is imm

### aks-689: Attempting to change GPU driver installation mode on existing AKS nodepool fails...

**Root Cause**: GPU driver installation mode (Install/None) is immutable once configured on a nodepool; AKS does not support changing this property after nodepool creation

**Solution**:
Delete and recreate the nodepool with the desired GPU driver installation mode. There is no way to change this in-place

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Linux%20GPU)]`

## Phase 9: By design - these kubelet config parameters and Li

### aks-712: ErrorCode_InvalidCustomKubeletConfig on Windows nodepool: cpuManagerPolicy, cpuC...

**Root Cause**: By design - these kubelet config parameters and Linux OS config are not supported on Windows node pools in AKS

**Solution**:
Remove unsupported kubelet config parameters (cpuManagerPolicy, cpuCfsQuota, cpuCfsQuotaPeriod, topologyManagerPolicy, allowedUnsafeSysctls, podMaxPids) for Windows node pools. Do not set CustomLinuxOSConfig for Windows agent pools

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Custom%20Node%20Config)]`

## Phase 10: Customer provided invalid machine names in the DEL

### aks-719: Delete Machines API returns InvalidParameter: Cannot find any valid machines to ...

**Root Cause**: Customer provided invalid machine names in the DELETE request body. Machine names must match existing VMSS instances in the agent pool

**Solution**:
Run az aks machine list to get valid machine names. Provide correct names in request body: {machineNames: [aks-agentpool0-xxxxx-vmss000001]}

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Delete%20Specific%20Node%20Machine)]`

## Phase 11: Multiple prerequisites not met: K8s >= 1.19, Azure

### aks-721: Deployment Safeguards (Guardrails) enable fails with errors: Invalid K8s version...

**Root Cause**: Multiple prerequisites not met: K8s >= 1.19, Azure Policy Add-On enabled, GuardrailsPreview feature flag registered, and Microsoft.Authorization/policyAssignments/read+write permissions. Contributor role is NOT sufficient for the write permission

**Solution**:
Ensure all prerequisites: 1) upgrade cluster to k8s >= 1.19, 2) enable Azure Policy Add-On, 3) register Microsoft.ContainerService/GuardrailsPreview feature flag, 4) grant Microsoft.Authorization/policyAssignments/write permission (beyond Contributor). AKS RP calls Azure Policy OBO customer so both need permissions

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Deployment%20Safeguards%20%28Azure%20Policy%29)]`

## Phase 12: Kubernetes Service sessionAffinity is set to None 

### aks-800: Client requests are not being routed to the same pod consistently across consecu...

**Root Cause**: Kubernetes Service sessionAffinity is set to None by default, so requests are distributed across pods without stickiness.

**Solution**:
Set service.spec.sessionAffinity to ClientIP and optionally configure service.spec.sessionAffinityConfig.clientIP.timeoutSeconds (default 10800 = 3 hours). Example: spec.sessionAffinity: ClientIP, spec.sessionAffinityConfig.clientIP.timeoutSeconds: 900

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FConfiguring%20session%20stickiness%20with%20services)]`

## Phase 13: Client sends If-None-Match header with a value oth

### aks-839: AKS API returns BadRequest: If-None-Match header is not empty or * when customer...

**Root Cause**: Client sends If-None-Match header with a value other than * or empty. AKS pre-validation rejects the request. Only * or empty is accepted for If-None-Match.

**Solution**:
Client error. Customer should only pass * or leave If-None-Match header empty. Use FrontEndContextActivity Kusto query to verify.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FEntity%20Tag%20(ETag)%20Support)]`

## Phase 14: The host port annotation format is invalid. Valid 

### aks-921: AKS Auto Assign Host Ports: pod mutation skipped with Invalid host port annotati...

**Root Cause**: The host port annotation format is invalid. Valid format: <port>/<protocol>,<port>-<port>/<protocol> (e.g. 80/tcp,53/udp,40000-50000/tcp).

**Solution**:
Fix the annotation value to match the valid format. Check ccp-webhook mutator logs via Kusto ControlPlaneEventsAll filtering AutoAssignedHostPortPodMutator.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Auto%20Assign%20Host%20Ports)]`

## Phase 15: The nodepool uses UseGPUDedicatedVHD or Confidenti

### aks-929: OSSKU Migration cannot select AzureLinux as target OSSKU, returns InvalidOSSKU e...

**Root Cause**: The nodepool uses UseGPUDedicatedVHD or Confidential VM (CVM), which are Ubuntu-exclusive features and not compatible with AzureLinux.

**Solution**:
1) Check operation context logs for 'Agentpool has UseGPUDedicatedVHD/CVM enabled, cannot change OSSKU'; 2) Check ASI for VM Image name starting with 'aks-ubuntu-gpu-' (GPU VHD) or node label 'kubernetes.azure.com/security-type=ConfidentialVM' (CVM); 3) These nodepools cannot migrate to AzureLinux.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FOSSKU%20Migration)]`

## Phase 16: Combination of kubelet_disk_type=Temporary + scale

### aks-1054: After scale-up with deallocate mode, AKS node is NotReady even though VMSS insta...

**Root Cause**: Combination of kubelet_disk_type=Temporary + scale_down_mode=Deallocate + VM SKU supporting both OS cache disk and temporary storage (Dsv3, Esv3, M, FX-series). VM stop/start during scale-down/up causes temporary storage loss, deleting kubelet data including kubeconfig and containerd data.

**Solution**:
Short-term: Reimage the affected node. Long-term: Avoid combining kubelet_disk_type=Temporary and scale_down_mode=Deallocate on node pools using VM SKUs that support both OS cache disk and temporary storage (Dsv3/Esv3/M/FX-series). Reference: https://learn.microsoft.com/en-us/rest/api/aks/managed-clusters/create-or-update?view=rest-aks-2024-10-01&tabs=HTTP#kubeletdisktype

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCompute%2FVirtual%20Machine%20TSGs%2FVM%20Node%20NotReady%20kubelet%20missing)]`

## Phase 17: When az cli >= 2.47 but aks-preview extension < 0.

### aks-276: AKS cluster creation with --uptime-sla flag fails with error: Base managed clust...

**Root Cause**: When az cli >= 2.47 but aks-preview extension < 0.5.133, SKU name/tier values (Base/Standard) mismatch with the older API version (< 2023-02-01) used by the outdated extension. Uptime SLA was repositioned as Standard tier feature.

**Solution**:
Upgrade aks-preview extension to 0.5.133+: az extension update -n aks-preview. Use --tier standard instead of --uptime-sla. With az cli 2.47+, the correct SKU is name=Base, tier=Standard.

`[Score: [B] 6.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 18: Dapr OSS (open-source) already installed on cluste

### aks-1257: Dapr extension install fails: ServiceAccount dapr-operator in namespace dapr-sys...

**Root Cause**: Dapr OSS (open-source) already installed on cluster, conflicts with AKS Dapr extension Helm release

**Solution**:
Uninstall Dapr OSS first, then install the Dapr extension. See Migrate from Dapr OSS to Dapr extension guide

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-dapr-extension-installation-errors)]`

## Phase 19: InvalidResourceSelector: user selected invalid or 

### aks-449: AKS Fleet ResourcePlacement not completing - RP stuck with InvalidResourceSelect...

**Root Cause**: InvalidResourceSelector: user selected invalid or non-existent resources; RolloutControlledByExternalController: RP uses external rollout strategy that pauses progression

**Solution**:
For InvalidResourceSelector: fix resource selector configuration to target valid namespace-scoped resources. For RolloutControlledByExternalController: check external rollout controller status. Use Kusto query on FleetWorkloadPlacementStatusLastTimestampSeconds to identify specific condition and reason

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%20Fleet%20Manager%2FTSG%2FResourcePlacement)]`

## Phase 20: Multiple possible causes: API version too old (nee

### aks-647: Validation errors when creating a Managed Cluster Snapshot: OperationNotSupporte...

**Root Cause**: Multiple possible causes: API version too old (need >=v20220202preview), wrong request body format, subscription not found or invalid state, preview feature not registered, snapshot count exceeds limit (default 100), missing cluster-id in body, source cluster deleted or not in same region, or source cluster is in broken/non-Succeeded state.

**Solution**:
1) Use API version >=v20220202preview; 2) Verify request body format matches spec; 3) Check subscription exists and is in valid state; 4) Register ManagedClusterSnapshotPreviewFeature; 5) Check snapshot count vs limit (default 100); 6) Include source cluster-id in request body; 7) Verify source cluster exists in same region and is in Succeeded state. Use Kusto: AKSprod.FrontEndContextActivity with operationName=PutManagedClusterSnapshotHandler.PUT.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FPreview%20Features%2FManaged%20Cluster%20Snapshot)]`

## Phase 21: The command-<ID> pod created by az aks command inv

### aks-1127: az aks command invoke fails with Operation returned invalid status Not Found - c...

**Root Cause**: The command-<ID> pod created by az aks command invoke cannot be scheduled because nodes have insufficient resources, NotReady/SchedulingDisabled status, or untolerated taints

**Solution**:
Increase node pool size, remove pod-excluding constraints (taints), adjust resource requests/limits so the command pod can be scheduled and run

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [Y] 4.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/resolve-az-aks-command-invoke-failures)]`

## Phase 22: Service Connection extension (sc-extension) versio

### aks-1000: AKS Service Connections (Storage Account, Key Vault) stuck in Failed/Accepted st...

**Root Cause**: Service Connection extension (sc-extension) version 0.1.0 references old container images (scaksextension.azurecr.io/prod/image/sc-operator:20250417.1) that no longer exist in registry. The sc-job responsible for provisioning cannot pull the image.

**Solution**:
1) Confirm version: az k8s-extension show --name sc-extension --query currentVersion. 2) Enable auto-upgrade: az k8s-extension update --name sc-extension --auto-upgrade true. 3) Delete stuck service connections. 4) Verify sc-job deleted: kubectl get job -n sc-system. 5) Recreate and verify provisioningState becomes Succeeded.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [W] 2.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FOthers%2FService%20Connectors%20Troubleshooting)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS upgrade deadlock: certificate rotation fails with InvalidGalleryImageRef (de... | Cluster running very old deprecated version (e.g. 1.20.9 Ubu... | Raise ICM to AKS PG to refresh certificate from backend. Ref... | [G] 10.0 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.5] |
| 2 | AKS kube-config becomes invalid/expired after platform-initiated certificate rot... | AKS platform performs automatic certificate rotation (ref: r... | Re-download kubeconfig using az aks get-credentials after ce... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | AKS Remediator 报错 AADSTS500011 invalid_resource，节点上 ManagedIdentityCredential 获取... | MSI connector 返回 invalid_resource 错误，SPn token 转换失败。通常因 AAD ... | 1) Kusto 诊断: cluster('mcakshuba.chinaeast2.kusto.chinaclouda... | [B] 7.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 4 | AKS nodepool creation fails with InvalidParameter DiskControllerTypeMismatchBetw... | VM Size Standard_E112ibds_v5 explicitly only supports NVMe D... | Use VM size Standard_E112iads_v5 instead (supports SCSI, les... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Create/DiskControllerTypeMismatchBetweenOsAndVMScaleSetSize_with_size_Standard_E112ibds_v5) |
| 5 | AKS node provisioning fails with vmssCSE exit code 1 on Linux. Two variants: (A)... | Variant A: Linux admin username exceeds 32 characters. The u... | Variant A: Change admin username to <32 characters: az aks c... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FCSE%20Exit%20Codes%2FvmssCSE%20failures%20during%20node%20provisioning) |
| 6 | KEDA addon is enabled (az aks show reports enabled=true), but keda-* pods are no... | Leftover CRDs, ValidatingWebhookConfigurations, and other re... | Clean up all residual self-managed KEDA components: 1) Remov... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FAddons%20and%20Extensions%2FKEDA) |
| 7 | Customer receives error 'Kubernetes Dashboard addon is deprecated for Kubernetes... | Kubernetes Dashboard addon has been deprecated and removed f... | Direct customer to use the community-maintained Kubernetes D... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FAddons%20and%20Extensions%2FKube%20Dashboard%20Addon) |
| 8 | Attempting to change GPU driver installation mode on existing AKS nodepool fails... | GPU driver installation mode (Install/None) is immutable onc... | Delete and recreate the nodepool with the desired GPU driver... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Linux%20GPU) |
| 9 | ErrorCode_InvalidCustomKubeletConfig on Windows nodepool: cpuManagerPolicy, cpuC... | By design - these kubelet config parameters and Linux OS con... | Remove unsupported kubelet config parameters (cpuManagerPoli... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Custom%20Node%20Config) |
| 10 | Delete Machines API returns InvalidParameter: Cannot find any valid machines to ... | Customer provided invalid machine names in the DELETE reques... | Run az aks machine list to get valid machine names. Provide ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Delete%20Specific%20Node%20Machine) |
| 11 | Deployment Safeguards (Guardrails) enable fails with errors: Invalid K8s version... | Multiple prerequisites not met: K8s >= 1.19, Azure Policy Ad... | Ensure all prerequisites: 1) upgrade cluster to k8s >= 1.19,... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Deployment%20Safeguards%20%28Azure%20Policy%29) |
| 12 | Client requests are not being routed to the same pod consistently across consecu... | Kubernetes Service sessionAffinity is set to None by default... | Set service.spec.sessionAffinity to ClientIP and optionally ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FConfiguring%20session%20stickiness%20with%20services) |
| 13 | AKS API returns BadRequest: If-None-Match header is not empty or * when customer... | Client sends If-None-Match header with a value other than * ... | Client error. Customer should only pass * or leave If-None-M... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FEntity%20Tag%20(ETag)%20Support) |
| 14 | AKS Auto Assign Host Ports: pod mutation skipped with Invalid host port annotati... | The host port annotation format is invalid. Valid format: <p... | Fix the annotation value to match the valid format. Check cc... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Auto%20Assign%20Host%20Ports) |
| 15 | OSSKU Migration cannot select AzureLinux as target OSSKU, returns InvalidOSSKU e... | The nodepool uses UseGPUDedicatedVHD or Confidential VM (CVM... | 1) Check operation context logs for 'Agentpool has UseGPUDed... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FOSSKU%20Migration) |
| 16 | After scale-up with deallocate mode, AKS node is NotReady even though VMSS insta... | Combination of kubelet_disk_type=Temporary + scale_down_mode... | Short-term: Reimage the affected node. Long-term: Avoid comb... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCompute%2FVirtual%20Machine%20TSGs%2FVM%20Node%20NotReady%20kubelet%20missing) |
| 17 | AKS cluster creation with --uptime-sla flag fails with error: Base managed clust... | When az cli >= 2.47 but aks-preview extension < 0.5.133, SKU... | Upgrade aks-preview extension to 0.5.133+: az extension upda... | [B] 6.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 18 | Dapr extension install fails: ServiceAccount dapr-operator in namespace dapr-sys... | Dapr OSS (open-source) already installed on cluster, conflic... | Uninstall Dapr OSS first, then install the Dapr extension. S... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-dapr-extension-installation-errors) |
| 19 | AKS Fleet ResourcePlacement not completing - RP stuck with InvalidResourceSelect... | InvalidResourceSelector: user selected invalid or non-existe... | For InvalidResourceSelector: fix resource selector configura... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%20Fleet%20Manager%2FTSG%2FResourcePlacement) |
| 20 | Validation errors when creating a Managed Cluster Snapshot: OperationNotSupporte... | Multiple possible causes: API version too old (need >=v20220... | 1) Use API version >=v20220202preview; 2) Verify request bod... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FPreview%20Features%2FManaged%20Cluster%20Snapshot) |
| 21 | az aks command invoke fails with Operation returned invalid status Not Found - c... | The command-<ID> pod created by az aks command invoke cannot... | Increase node pool size, remove pod-excluding constraints (t... | [Y] 4.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/resolve-az-aks-command-invoke-failures) |
| 22 | AKS Service Connections (Storage Account, Key Vault) stuck in Failed/Accepted st... | Service Connection extension (sc-extension) version 0.1.0 re... | 1) Confirm version: az k8s-extension show --name sc-extensio... | [W] 2.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FOthers%2FService%20Connectors%20Troubleshooting) |
