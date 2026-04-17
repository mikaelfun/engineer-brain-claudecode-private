# AKS 节点池扩缩容 — general -- Comprehensive Troubleshooting Guide

**Entries**: 16 | **Draft sources**: 0 | **Kusto queries**: 1
**Kusto references**: scale-upgrade-operations.md
**Generated**: 2026-04-07

---

## Phase 1: Production Economy preset defaults user node pool 

### aks-094: AKS cluster creation fails when using Production Economy preset in Mooncake port...

**Root Cause**: Production Economy preset defaults user node pool to Spot VMSS, which is not supported in Mooncake (Azure China).

**Solution**:
Workaround: manually change configuration to not use Spot VMSS. PG fix deployed around May 2024 to not use spot VMSS for AKS Create in Mooncake.

`[Score: [G] 8.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 2: Confidential VM (CVM) node pools have specific har

### aks-632: CVM enabled node pools cannot be created with Arm64, Trusted Launch, FIPS, or Po...

**Root Cause**: Confidential VM (CVM) node pools have specific hardware/firmware requirements that are incompatible with Arm64 architecture, Trusted Launch, FIPS, and Pod Sandboxing features

**Solution**:
Remove the incompatible setting (Arm64/Trusted Launch/FIPS/Pod Sandboxing) before creating the CVM node pool. Use only supported AMD SEV-SNP compatible VM SKUs (DCav5/ECav5)

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FAKS%20Confidential%20VM%20%28CVM%29)]`

## Phase 3: By design - CustomKubeletConfig and CustomLinuxOSC

### aks-713: ErrorCode_CustomKubeletConfigOrCustomLinuxOSConfigCanNotBeChanged: CustomKubelet...

**Root Cause**: By design - CustomKubeletConfig and CustomLinuxOSConfig can only be set during initial node pool creation, not during update operations

**Solution**:
Create a new node pool with the desired CustomKubeletConfig/CustomLinuxOSConfig settings. These cannot be modified after creation

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Custom%20Node%20Config)]`

## Phase 4: Portal UI has a hardcoded 1000 node limit that has

### aks-720: Azure Portal does not allow AKS cluster to scale past 1000 nodes even though the...

**Root Cause**: Portal UI has a hardcoded 1000 node limit that has not been updated

**Solution**:
Use Azure CLI to scale the cluster past 1000 nodes. Portal will be updated in the future.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/5k%20Node%20Limit)]`

## Phase 5: Log Analytics workspace key in AKS omsagent-secret

### aks-750: Nodepool operations (scale, add disk) fail with MMAExtension error: Enable faile...

**Root Cause**: Log Analytics workspace key in AKS omsagent-secret does not match actual LAW primary key. Or NSG rules block outbound to Log Analytics agent endpoints.

**Solution**:
Compare workspace key: kubectl get secrets omsagent-secret -n kube-system -o yaml, decode base64, compare with LAW Portal Agents Management Primary Key. If keys match, check NSG/firewall for blocked outbound to LA endpoints.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FInvalid%20workspace%20key%20fails%20cluster%20operations)]`

## Phase 6: AKS does not expose a way to disable Artifact Stre

### aks-917: Cannot disable Artifact Streaming on an AKS node pool - az aks nodepool update d...

**Root Cause**: AKS does not expose a way to disable Artifact Streaming at the nodepool level via az aks nodepool update.

**Solution**:
Delete and recreate the node pool without --enable-artifact-streaming. This is disruptive: nodes will be replaced and workloads rescheduled.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Artifact%20Streaming)]`

## Phase 7: Teleport (private preview) is retired. AKS release

### aks-919: AKS Teleport (private preview) retirement: after April 15 2025 cannot create new...

**Root Cause**: Teleport (private preview) is retired. AKS released Artifact Streaming as replacement in Nov 2023 public preview.

**Solution**:
Disable Teleport on existing node pools: az aks nodepool update --aks-custom-headers EnableACRTeleport=false. Migrate to Artifact Streaming: https://learn.microsoft.com/azure/aks/artifact-streaming

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Artifact%20Streaming)]`

## Phase 8: Multiple validation requirements not met: feature 

### aks-924: Node Public IPTags configuration fails with frontend validation error on AKS cre...

**Root Cause**: Multiple validation requirements not met: feature flag Microsoft.ContainerService/NodePublicIPTagsPreview not registered, node-public-ip not enabled, VMSSNodePublicIPPrefixID set, invalid tag name/value, or RoutingPreference mixed with other IPTags.

**Solution**:
Verify: 1) NodePublicIPTagsPreview feature flag is registered; 2) --enable-node-public-ip is set; 3) VMSSNodePublicIPPrefixID is not set; 4) Only valid tags (FirstPartyUsage/NetworkDomain/RoutingPreference); 5) RoutingPreference value must be 'Internet' and not mixed with other IPTag types.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FNode%20Public%20IPTags)]`

## Phase 9: The nodepool has Kata pod sandboxing enabled (work

### aks-931: OSSKU Migration cannot select Ubuntu as target OSSKU for nodepool using Kata pod...

**Root Cause**: The nodepool has Kata pod sandboxing enabled (workloadRuntime: KataMshvVmIsolation), which is AzureLinux-exclusive and not compatible with Ubuntu.

**Solution**:
Check if the nodepool uses Kata pod sandboxing. If so, the nodepool cannot migrate to Ubuntu OSSKU.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FOSSKU%20Migration)]`

## Phase 10: Log Analytics workspace key configured in AKS (sto

### aks-953: AKS nodepool operations (scale, update, add disk) fail with MMAExtension error: ...

**Root Cause**: Log Analytics workspace key configured in AKS (stored in omsagent-secret in kube-system) does not match the actual workspace primary key in Azure portal, or the node lacks outbound connectivity to required Log Analytics endpoints.

**Solution**:
1) Get LAW resource ID from az aks show addonProfiles.omsagent; 2) Compare workspace key from kubectl get secrets omsagent-secret -n kube-system -o yaml (base64 decode) with LAW portal Agents Management > Primary Key; 3) If keys mismatch, update the secret; 4) Verify outbound NSG rules allow access to LAW endpoints; 5) Engage Azure Monitor team if needed.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FInvalid%20workspace%20key%20fails%20cluster%20operations)]`

## Phase 11: Behavioral change in AKS release 2022-04-24: taint

### aks-112: Customer modifies node taints/labels via kubectl (Kubernetes API) but changes ar...

**Root Cause**: Behavioral change in AKS release 2022-04-24: taints and labels applied using the AKS nodepool API (ARM) are not modifiable from the Kubernetes API and vice versa. The two API surfaces are now isolated - changes in one do not sync to the other.

**Solution**:
Choose one API surface for managing taints/labels consistently: 1) Use 'az aks nodepool update --node-taints/--labels' for infrastructure-level taints/labels that should persist across upgrades and reconciles. 2) Use 'kubectl taint/label' for workload-level taints/labels that are temporary. Do not mix both APIs for the same taint/label keys.

`[Score: [B] 6.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 12: The aks-log-collector.sh service runs periodically

### aks-272: AKS node experiences disk pressure due to aks-log-collector.sh service consuming...

**Root Cause**: The aks-log-collector.sh service runs periodically on AKS nodes to collect and upload diagnostic logs. On some nodes this can cause disk pressure when log bundles accumulate.

**Solution**:
Disable aks-log-collector by adding a tag to the node pool: az aks nodepool update --resource-group <rg> --cluster-name <cluster> --name <pool> --tags aks-log-collector='{"disable": true}' --no-wait. Verify by checking IMDS tag in syslog shows 'disable==true, quitting'.

`[Score: [B] 6.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 13: All node pools in the cluster have CriticalAddonsO

### aks-1218: AKS extension pods stuck in Pending with 'untolerated taint CriticalAddonsOnly: ...

**Root Cause**: All node pools in the cluster have CriticalAddonsOnly taint and extension pods lack the toleration, so they cannot be scheduled.

**Solution**:
Add a new node pool without CriticalAddonsOnly taint, or remove the taint from an existing pool. Do not use CriticalAddonsOnly on single node pool clusters.

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/cluster-extension-deployment-errors)]`

## Phase 14: Ephemeral OS disk feature has a known issue with c

### aks-267: GPU nodes (Standard_NC4as_T4_v3) fail to provision in AKS when using ephemeral O...

**Root Cause**: Ephemeral OS disk feature has a known issue with certain GPU SKUs where temp disk size does not meet minimum requirements.

**Solution**:
1) Use managed disk: az aks nodepool add --node-osdisk-type Managed. 2) Evaluate other GPU SKUs that support ephemeral OS disk.

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 15: Az CLI releases have Mooncake compatibility gaps. 

### aks-209: Azure CLI version incompatibility in Mooncake for AKS management. Az CLI 2.2.0 h...

**Root Cause**: Az CLI releases have Mooncake compatibility gaps. Certain API versions or features require specific CLI versions that may not be available or fully functional in Mooncake at the same time as global Azure.

**Solution**:
For system/user nodepool management: use Az CLI >= 2.3.1. If aks-preview extension is installed, ensure it is updated to latest: az extension update --name aks-preview. Check CLI version compatibility: az version. Report Mooncake-specific CLI issues to GitHub.

`[Score: [B] 5.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 16: The REST API replaces the entire scale profile wit

### aks-704: AKS VirtualMachines (Mixed SKU) agent pool scale profile update fails or produce...

**Root Cause**: The REST API replaces the entire scale profile with the new input rather than merging it. Partial PUT on the virtualMachinesProfile.scale field is not supported. CLI internally fetches and merges but REST API does not.

**Solution**:
Always provide the full desired state of the scale profile (all manual entries) when updating via REST API. When using CLI, use --current-vm-size flag which handles the merge automatically.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FMixed%20SKU%20Nodepools)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS cluster creation fails when using Production Economy preset in Mooncake port... | Production Economy preset defaults user node pool to Spot VM... | Workaround: manually change configuration to not use Spot VM... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | CVM enabled node pools cannot be created with Arm64, Trusted Launch, FIPS, or Po... | Confidential VM (CVM) node pools have specific hardware/firm... | Remove the incompatible setting (Arm64/Trusted Launch/FIPS/P... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FAKS%20Confidential%20VM%20%28CVM%29) |
| 3 | ErrorCode_CustomKubeletConfigOrCustomLinuxOSConfigCanNotBeChanged: CustomKubelet... | By design - CustomKubeletConfig and CustomLinuxOSConfig can ... | Create a new node pool with the desired CustomKubeletConfig/... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Custom%20Node%20Config) |
| 4 | Azure Portal does not allow AKS cluster to scale past 1000 nodes even though the... | Portal UI has a hardcoded 1000 node limit that has not been ... | Use Azure CLI to scale the cluster past 1000 nodes. Portal w... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/5k%20Node%20Limit) |
| 5 | Nodepool operations (scale, add disk) fail with MMAExtension error: Enable faile... | Log Analytics workspace key in AKS omsagent-secret does not ... | Compare workspace key: kubectl get secrets omsagent-secret -... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FInvalid%20workspace%20key%20fails%20cluster%20operations) |
| 6 | Cannot disable Artifact Streaming on an AKS node pool - az aks nodepool update d... | AKS does not expose a way to disable Artifact Streaming at t... | Delete and recreate the node pool without --enable-artifact-... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Artifact%20Streaming) |
| 7 | AKS Teleport (private preview) retirement: after April 15 2025 cannot create new... | Teleport (private preview) is retired. AKS released Artifact... | Disable Teleport on existing node pools: az aks nodepool upd... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Artifact%20Streaming) |
| 8 | Node Public IPTags configuration fails with frontend validation error on AKS cre... | Multiple validation requirements not met: feature flag Micro... | Verify: 1) NodePublicIPTagsPreview feature flag is registere... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FNode%20Public%20IPTags) |
| 9 | OSSKU Migration cannot select Ubuntu as target OSSKU for nodepool using Kata pod... | The nodepool has Kata pod sandboxing enabled (workloadRuntim... | Check if the nodepool uses Kata pod sandboxing. If so, the n... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FOSSKU%20Migration) |
| 10 | AKS nodepool operations (scale, update, add disk) fail with MMAExtension error: ... | Log Analytics workspace key configured in AKS (stored in oms... | 1) Get LAW resource ID from az aks show addonProfiles.omsage... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FInvalid%20workspace%20key%20fails%20cluster%20operations) |
| 11 | Customer modifies node taints/labels via kubectl (Kubernetes API) but changes ar... | Behavioral change in AKS release 2022-04-24: taints and labe... | Choose one API surface for managing taints/labels consistent... | [B] 6.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 12 | AKS node experiences disk pressure due to aks-log-collector.sh service consuming... | The aks-log-collector.sh service runs periodically on AKS no... | Disable aks-log-collector by adding a tag to the node pool: ... | [B] 6.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 13 | AKS extension pods stuck in Pending with 'untolerated taint CriticalAddonsOnly: ... | All node pools in the cluster have CriticalAddonsOnly taint ... | Add a new node pool without CriticalAddonsOnly taint, or rem... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/cluster-extension-deployment-errors) |
| 14 | GPU nodes (Standard_NC4as_T4_v3) fail to provision in AKS when using ephemeral O... | Ephemeral OS disk feature has a known issue with certain GPU... | 1) Use managed disk: az aks nodepool add --node-osdisk-type ... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 15 | Azure CLI version incompatibility in Mooncake for AKS management. Az CLI 2.2.0 h... | Az CLI releases have Mooncake compatibility gaps. Certain AP... | For system/user nodepool management: use Az CLI >= 2.3.1. If... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 16 | AKS VirtualMachines (Mixed SKU) agent pool scale profile update fails or produce... | The REST API replaces the entire scale profile with the new ... | Always provide the full desired state of the scale profile (... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FMixed%20SKU%20Nodepools) |
