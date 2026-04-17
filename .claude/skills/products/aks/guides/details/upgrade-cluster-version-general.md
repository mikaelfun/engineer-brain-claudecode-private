# AKS 集群版本升级 — general -- Comprehensive Troubleshooting Guide

**Entries**: 26 | **Draft sources**: 0 | **Kusto queries**: 3
**Kusto references**: auto-upgrade.md, cluster-snapshot.md, scale-upgrade-operations.md
**Generated**: 2026-04-07

---

## Phase 1: Customer deleted the Log Analytics Workspace or it

### aks-827: AKS update/upgrade fails: 'Unable to get log analytics workspace info. StatusCod...

**Root Cause**: Customer deleted the Log Analytics Workspace or its Resource Group without first disabling the monitoring (omsagent) addon on the AKS cluster.

**Solution**:
Mitigation 1: If deleted <14 days ago, recover soft-deleted workspace (New-AzOperationalInsightsWorkspace). Mitigation 2: If >14 days, disable monitoring addon: 'az aks disable-addons -a monitoring'. Mitigation 3: If disable-addons fails too, recreate the Log Analytics Workspace from Portal, then retry.

`[Score: [G] 9.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FUpgrade%20or%20Scale%20failed%20due%20to%20Log%20Analytics%20Workspace%20not%20found)]`

## Phase 2: Subscription has reached the maximum number of pub

### aks-1196: AKS cluster creation, update, upgrade, or LoadBalancer service deployment fails ...

**Root Cause**: Subscription has reached the maximum number of public IP addresses allowed in the region. Triggered by any operation that creates a Public IP address including creating/upgrading cluster or deploying Kubernetes Service with Public Load Balancer.

**Solution**:
Navigate to Azure portal → Subscriptions → Usage + quotas → Provider: Networking → filter by AKS cluster region → locate Public IP Addresses record → click 'Create a new support request' → specify new limit and submit. Retry operation after quota increase takes effect.

`[Score: [G] 8.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/publicipcountlimitreached-error)]`

## Phase 3: 升级期间 AKS 给节点添加 'do not scale down' annotation 防止被 

### aks-187: AKS 升级期间 Cluster Autoscaler (CAS) 错误 taint 正常工作节点，导致节点持续被 taint 的死循环，集群可用容量降低

**Root Cause**: 升级期间 AKS 给节点添加 'do not scale down' annotation 防止被 CAS taint。但在 surge node 完全删除前 annotation 被提前移除，CAS 发现当前节点数(3) > mincount(2) 后 taint 了正常节点。此后 taint 不会被自动移除，形成死循环。Pod 仍可调度到 tainted node，但优先级降低

**Solution**:
已知 bug (ICM-588873918)。1) 等待 PG 修复; 2) 临时方案：手动移除节点上的 CAS taint; 3) 注意：tainted node 上的 pod 不会被驱逐，但新 pod 优先调度到其他节点

`[Score: [G] 8.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 4: Portal team sends wrong maintenance window templat

### aks-095: AKS cluster creation fails with error: One and only one of the schedule types sh...

**Root Cause**: Portal team sends wrong maintenance window template to AKS RP with incorrect/missing schedule type configuration

**Solution**:
Raise ticket to portal team to fix the template. Portal bug causing wrong parameters sent to AKS RP.

`[Score: [B] 7.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 5: KEDA addon auto-upgrade behavior inconsistency dur

### aks-141: KEDA addon version remains at old version (e.g. 2.7.0) after upgrading AKS clust...

**Root Cause**: KEDA addon auto-upgrade behavior inconsistency during AKS cluster version upgrade; some clusters do not trigger KEDA version bump as expected per release notes

**Solution**:
File ICM for investigation; verify expected KEDA version from AKS release notes vs actual; normal behavior is KEDA auto-upgrades to match cluster version mapping in release notes

`[Score: [B] 7.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 6: linuxProfile section is required in ARM template f

### aks-463: AKS ARM template deployment fails with PropertyChangeNotAllowed error: Changing ...

**Root Cause**: linuxProfile section is required in ARM template for existing AKS clusters even though documented as optional; omitting it or changing SSH key causes PropertyChangeNotAllowed error during upgrade

**Solution**:
Include the linuxProfile with the original SSH public key in the ARM template when upgrading existing AKS clusters. Reference the AKS ARM template from docs.microsoft.com for correct schema.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Cluster%20Management/Creating%20AKS%20cluster%20using%20ARM%20template%20when%20certain%20properties%20are%20missing)]`

## Phase 7: linuxProfile section with SSH public key is requir

### aks-466: PropertyChangeNotAllowed error when deploying/upgrading AKS cluster via ARM temp...

**Root Cause**: linuxProfile section with SSH public key is required for existing clusters in ARM templates even though documentation marks it as optional

**Solution**:
Include the complete linuxProfile section with ssh.publicKeys.keyData in the ARM template when updating/upgrading existing AKS clusters

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCluster%20Management%2FCreating%20AKS%20cluster%20using%20ARM%20template%20when%20certain%20properties%20are%20missing)]`

## Phase 8: Cluster is on an unsupported Kubernetes version; k

### aks-620: Customer running deprecated/unsupported AKS version (outside N-2 full support or...

**Root Cause**: Cluster is on an unsupported Kubernetes version; known bugs (e.g., containerd deadlock in v1.26) are fixed in newer AKS releases but not backported to EOL versions

**Solution**:
Attempt FQR and basic troubleshooting first; if issue is fixed in newer version, ask customer to upgrade using az aks upgrade --name <cluster> --resource-group <rg> --kubernetes-version <version>; check supported versions with az aks get-versions --location <region> --output table; provide AKS version support policy link; offer alternatives like porting to Linux nodepool if upgrade not immediately actionable

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACT%20Team/Case%20Handling%20E2E/On%20Going%20Cases/Example%20Scenario%20Based%20Responses/Unsupported%20Version%20of%20AKS)]`

## Phase 9: Connectivity between API server instances and webh

### aks-631: AKS operations fail with 'failed calling webhook' errors; upgrade operations sho...

**Root Cause**: Connectivity between API server instances and webhook handler pods is disrupted; konnectivity-agent tunnel is unhealthy or webhook pods are unavailable to handle incoming admission requests

**Solution**:
Immediate mitigation: kubectl delete validatingwebhookconfiguration <webhook-name> or kubectl delete mutatingwebhookconfiguration <webhook-name>. Then investigate konnectivity-agent tunnel health and check webhook pod status for readiness

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FKubernetes%20admission%20webhook%20related%20TSG)]`

## Phase 10: The managedClusters ARM resource type requires all

### aks-687: ARM template deployment fails with BadRequest code NotAllAgentPoolOrchestratorVe...

**Root Cause**: The managedClusters ARM resource type requires all agent pools to be consistently specified; 2022-03-27 API behavioral change prevents implicit nodepool upgrades via cluster-level API

**Solution**:
Use Microsoft.ContainerService/managedClusters/agentPools resource type in ARM template for per-nodepool upgrades (equivalent to az aks nodepool upgrade CLI command)

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FNotAllAgentPoolOrchestratorVersionSpecifiedAndUnchanged%20error%20when%20upgrading%20a%20single%20nodepool%20using%20ARM)]`

## Phase 11: Azure API write/read throttling limits exceeded (e

### aks-724: 429 TooManyRequests / OperationNotAllowed errors during AKS scale-up, cluster cr...

**Root Cause**: Azure API write/read throttling limits exceeded (e.g., HighCostGetVMScaleSet30Min quota)

**Solution**:
Run ARM throttling Kusto query in armprodgbl to identify throttled API requests by operationName/userAgent. File ICM to AKS/RP queue with query results.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/5k%20Node%20Limit)]`

## Phase 12: Race condition between AKS RP and Cluster Autoscal

### aks-748: GetSurgedVms_CountNotMatch during nodepool upgrade. Autoscaler deletes surge nod...

**Root Cause**: Race condition between AKS RP and Cluster Autoscaler. Autoscaler issues forceDelete on surge nodes when RP sets new VMSS capacity. ScaleDownDisabledReasonUpgrade annotation not applied to surge node.

**Solution**:
Disable cluster autoscaler before nodepool upgrades (az aks nodepool update --disable-cluster-autoscaler), re-enable after upgrade completes. Known bug: ADO 30155571/31289428.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FGetSurgedVms_CountNotMatch_for_upgrade)]`

## Phase 13: Customer has resource locks (CanNotDelete or ReadO

### aks-790: AKS cluster operations fail with ScopeLocked error: resource group cannot perfor...

**Root Cause**: Customer has resource locks (CanNotDelete or ReadOnly) on the AKS resource group preventing AKS operations like node deletion during upgrade

**Solution**:
Remove the corresponding resource locks on the AKS managed resource group (MC_*) and/or the AKS resource itself

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/Compilation%20of%20Cluster%20In%20Failed%20State)]`

## Phase 14: System node pools cannot configure maxUnavailable;

### aks-792: AKS cluster upgrade causes workload disruption or stalls when system node pool h...

**Root Cause**: System node pools cannot configure maxUnavailable; during upgrades at least one additional system node is needed to maintain availability of kube-system pods

**Solution**:
Ensure system node pools contain at least 2 nodes (3 recommended for production) before performing upgrades

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/Compilation%20of%20Cluster%20In%20Failed%20State)]`

## Phase 15: AKS blocks cluster upgrade to k8s >= 1.34.0 when W

### aks-808: AKS cluster upgrade fails with: 'Cannot upgrade to the target Kubernetes version...

**Root Cause**: AKS blocks cluster upgrade to k8s >= 1.34.0 when Windows2022 nodepools exist, because Windows2022 is not supported from k8s 1.34.0 onwards.

**Solution**:
1. Create new Windows2025 or WindowsAnnualChannel nodepools. 2. Migrate workloads from Windows2022. 3. Delete all Windows2022 nodepools. 4. Retry the cluster upgrade.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Compute/Windows/Windows%20Retirements)]`

## Phase 16: A resource lock (CanNotDelete or ReadOnly) exists 

### aks-826: AKS cluster upgrade, scaling, or nodepool operations fail with ScopeLocked error...

**Root Cause**: A resource lock (CanNotDelete or ReadOnly) exists on the MC_ resource group or individual resources, preventing AKS from modifying or deleting resources during lifecycle operations.

**Solution**:
Remove the resource lock from the MC_ resource group or affected resources via Azure Portal/CLI/PowerShell. After the lock is removed, re-run the failed operation.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FResource%20locks%20block%20cluster%20operations)]`

## Phase 17: AKS-RP does not guarantee removal of non-AKS-manag

### aks-920: After updating node initialization taints and upgrading the cluster, old init ta...

**Root Cause**: AKS-RP does not guarantee removal of non-AKS-managed taints during upgrade. If old init taints are still on node replicas when upgrade runs, they get re-applied to re-created nodes.

**Solution**:
Before upgrading, ensure old init taints are removed from all nodes using: kubectl taint nodes <nodeName> <taintKey>=<taintValue>:<taintEffect>-

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FNode%20Initialization%20Taints)]`

## Phase 18: The node pool's node soak duration is set to a non

### aks-926: AKS upgrade operation taking unusually long, appears stuck between node drain an...

**Root Cause**: The node pool's node soak duration is set to a non-zero value (up to 30 minutes max). This is the wait time after draining a node and before reimaging it, added per-node during upgrade. Default is 0.

**Solution**:
1) Check node pool configuration for soak duration setting; 2) Use Kusto query on AsyncContextActivity filtering for 'using customer node soak duration' message to see actual soak time used; 3) If too high, customer can lower it.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FNode%20Upgrade%20Soak%20Duration)]`

## Phase 19: Subscription vCPU quota (Total Regional vCPUs or s

### aks-1036: AKS cluster creation, node pool addition, scaling, start, or upgrade fails with ...

**Root Cause**: Subscription vCPU quota (Total Regional vCPUs or specific VM size family vCPUs) is insufficient for the requested AKS operation

**Solution**:
Submit quota increase via Azure portal (https://learn.microsoft.com/en-us/azure/quotas/quickstart-increase-quota-portal). For large/high-demand SKUs requiring manual review, or if customer declines new request, transfer case to SAP path: Azure\Service and subscription limits (quotas)\ComputeVM (coresvCPUs) with: Subscription ID, Region, SKU Size, Restriction Type (Regional/Zonal), cores requested. Do NOT transfer to VM/VMSS team for quota issues.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCompute%2FQuota%20errors)]`

## Phase 20: PSP removed in K8s 1.25. AKS blocks creation/upgra

### aks-124: AKS cluster creation or upgrade fails when PodSecurityPolicy (PSP) is enabled on...

**Root Cause**: PSP removed in K8s 1.25. AKS blocks creation/upgrade for PSP-enabled clusters on v1.25+

**Solution**:
Migrate from PSP to Pod Security Admission (PSA) or Azure Policy before upgrading to 1.25+

`[Score: [B] 6.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 21: cgroup v2 is default in K8s 1.25+ on AKS. cgroup v

### aks-1145: Pods report increased memory usage after upgrading AKS cluster to Kubernetes 1.2...

**Root Cause**: cgroup v2 is default in K8s 1.25+ on AKS. cgroup v2 uses different memory accounting that reports kernel memory (page cache, slab) as part of container memory.

**Solution**:
If only higher reported memory without evictions, no action needed. For evictions: increase VM memory or pod limits. Update apps to cgroup v2 compatible versions (Java jdk8u372+/11.0.16+; .NET 5.0+; uber-go/automaxprocs v1.5.1+). Temporary: revert cgroup v1 via DaemonSet.

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/aks-increased-memory-usage-cgroup-v2)]`

## Phase 22: Kubernetes version skew policy violation: node poo

### aks-1194: AKS node pool upgrade fails with NodePoolMcVersionIncompatible: node pool versio...

**Root Cause**: Kubernetes version skew policy violation: node pool minor version is more than 2 versions behind control plane, or node pool version is greater than control plane version

**Solution**:
1) Check control plane version: az aks get-upgrades --resource-group <rg> --name <cluster> --output table. 2) Upgrade node pool to a version within 2 minor versions of control plane and not greater than it: az aks nodepool upgrade --resource-group <rg> --cluster-name <cluster> --name <pool> --kubernetes-version <valid-version>

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/nodepoolmcversionincompatible-error)]`

## Phase 23: Target K8s version deprecated in region, attemptin

### aks-1181: AKS upgrade blocked with K8sVersionNotSupported, OperationNotAllowed (cannot ski...

**Root Cause**: Target K8s version deprecated in region, attempting to skip minor versions, or version skew >3 between control plane and node pool.

**Solution**:
1) az aks get-upgrades to check available paths. 2) Upgrade control plane + node pool together (az aks upgrade --kubernetes-version <version>). 3) If version too old, create new cluster on supported version and migrate workloads.

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/aks-upgrade-blocked)]`

## Phase 24: AKS releases new node images weekly and always upg

### aks-285: Need to upgrade AKS node pool to a specific node image version instead of latest...

**Root Cause**: AKS releases new node images weekly and always upgrades to latest. No --node-image-version parameter exists. The only way to pin a specific version is using node pool snapshots from another cluster/pool running the desired version.

**Solution**:
1) Find pool with desired image version. 2) Create snapshot: az aks nodepool snapshot create --name <snap> -g <rg> --nodepool-id <id>. 3) Upgrade target: az aks nodepool upgrade --name <pool> --cluster-name <cluster> -g <rg> --snapshot-id <snap-id> --node-image-only. LIMITATION: snapshot and target must be in SAME region in Mooncake. Must use --node-image-only flag. Ref: docs.azure.cn/en-us/aks/node-pool-snapshot

`[Score: [B] 5.0 | Source: [onenote: MCVKB/wiki_migration/======VM&SCIM======]]`

## Phase 25: VPA feature requires Kubernetes version 1.24.0 or 

### aks-1071: Enabling VPA on AKS cluster fails with validation error: 'Vertical Pod Autoscale...

**Root Cause**: VPA feature requires Kubernetes version 1.24.0 or higher. The cluster is running an older version.

**Solution**:
Upgrade the cluster to Kubernetes version 1.24.0 or above using --kubernetes-version flag.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Vertical%20Pod%20Autoscaler)]`

## Phase 26: Pod log file path and log format changed when AKS 

### aks-264: Custom log collection (Fluentd/Fluentbit) breaks after AKS upgrade from Docker t...

**Root Cause**: Pod log file path and log format changed when AKS container runtime switched from Dockerd to containerd. Custom log collection solutions configured for Docker format will break.

**Solution**:
1) Update Fluentd/Fluentbit config to handle CRI log format. 2) Reference OMS Agent parser config for containerd. 3) If using Azure Monitor (omsagent), ensure latest version deployed.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [Y] 4.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS update/upgrade fails: 'Unable to get log analytics workspace info. StatusCod... | Customer deleted the Log Analytics Workspace or its Resource... | Mitigation 1: If deleted <14 days ago, recover soft-deleted ... | [G] 9.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FUpgrade%20or%20Scale%20failed%20due%20to%20Log%20Analytics%20Workspace%20not%20found) |
| 2 | AKS cluster creation, update, upgrade, or LoadBalancer service deployment fails ... | Subscription has reached the maximum number of public IP add... | Navigate to Azure portal → Subscriptions → Usage + quotas → ... | [G] 8.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/publicipcountlimitreached-error) |
| 3 | AKS 升级期间 Cluster Autoscaler (CAS) 错误 taint 正常工作节点，导致节点持续被 taint 的死循环，集群可用容量降低 | 升级期间 AKS 给节点添加 'do not scale down' annotation 防止被 CAS taint。... | 已知 bug (ICM-588873918)。1) 等待 PG 修复; 2) 临时方案：手动移除节点上的 CAS tai... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 4 | AKS cluster creation fails with error: One and only one of the schedule types sh... | Portal team sends wrong maintenance window template to AKS R... | Raise ticket to portal team to fix the template. Portal bug ... | [B] 7.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 5 | KEDA addon version remains at old version (e.g. 2.7.0) after upgrading AKS clust... | KEDA addon auto-upgrade behavior inconsistency during AKS cl... | File ICM for investigation; verify expected KEDA version fro... | [B] 7.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 6 | AKS ARM template deployment fails with PropertyChangeNotAllowed error: Changing ... | linuxProfile section is required in ARM template for existin... | Include the linuxProfile with the original SSH public key in... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Cluster%20Management/Creating%20AKS%20cluster%20using%20ARM%20template%20when%20certain%20properties%20are%20missing) |
| 7 | PropertyChangeNotAllowed error when deploying/upgrading AKS cluster via ARM temp... | linuxProfile section with SSH public key is required for exi... | Include the complete linuxProfile section with ssh.publicKey... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCluster%20Management%2FCreating%20AKS%20cluster%20using%20ARM%20template%20when%20certain%20properties%20are%20missing) |
| 8 | Customer running deprecated/unsupported AKS version (outside N-2 full support or... | Cluster is on an unsupported Kubernetes version; known bugs ... | Attempt FQR and basic troubleshooting first; if issue is fix... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACT%20Team/Case%20Handling%20E2E/On%20Going%20Cases/Example%20Scenario%20Based%20Responses/Unsupported%20Version%20of%20AKS) |
| 9 | AKS operations fail with 'failed calling webhook' errors; upgrade operations sho... | Connectivity between API server instances and webhook handle... | Immediate mitigation: kubectl delete validatingwebhookconfig... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FKubernetes%20admission%20webhook%20related%20TSG) |
| 10 | ARM template deployment fails with BadRequest code NotAllAgentPoolOrchestratorVe... | The managedClusters ARM resource type requires all agent poo... | Use Microsoft.ContainerService/managedClusters/agentPools re... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FNotAllAgentPoolOrchestratorVersionSpecifiedAndUnchanged%20error%20when%20upgrading%20a%20single%20nodepool%20using%20ARM) |
| 11 | 429 TooManyRequests / OperationNotAllowed errors during AKS scale-up, cluster cr... | Azure API write/read throttling limits exceeded (e.g., HighC... | Run ARM throttling Kusto query in armprodgbl to identify thr... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/5k%20Node%20Limit) |
| 12 | GetSurgedVms_CountNotMatch during nodepool upgrade. Autoscaler deletes surge nod... | Race condition between AKS RP and Cluster Autoscaler. Autosc... | Disable cluster autoscaler before nodepool upgrades (az aks ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FGetSurgedVms_CountNotMatch_for_upgrade) |
| 13 | AKS cluster operations fail with ScopeLocked error: resource group cannot perfor... | Customer has resource locks (CanNotDelete or ReadOnly) on th... | Remove the corresponding resource locks on the AKS managed r... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/Compilation%20of%20Cluster%20In%20Failed%20State) |
| 14 | AKS cluster upgrade causes workload disruption or stalls when system node pool h... | System node pools cannot configure maxUnavailable; during up... | Ensure system node pools contain at least 2 nodes (3 recomme... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/Compilation%20of%20Cluster%20In%20Failed%20State) |
| 15 | AKS cluster upgrade fails with: 'Cannot upgrade to the target Kubernetes version... | AKS blocks cluster upgrade to k8s >= 1.34.0 when Windows2022... | 1. Create new Windows2025 or WindowsAnnualChannel nodepools.... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Compute/Windows/Windows%20Retirements) |
| 16 | AKS cluster upgrade, scaling, or nodepool operations fail with ScopeLocked error... | A resource lock (CanNotDelete or ReadOnly) exists on the MC_... | Remove the resource lock from the MC_ resource group or affe... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FResource%20locks%20block%20cluster%20operations) |
| 17 | After updating node initialization taints and upgrading the cluster, old init ta... | AKS-RP does not guarantee removal of non-AKS-managed taints ... | Before upgrading, ensure old init taints are removed from al... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FNode%20Initialization%20Taints) |
| 18 | AKS upgrade operation taking unusually long, appears stuck between node drain an... | The node pool's node soak duration is set to a non-zero valu... | 1) Check node pool configuration for soak duration setting; ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FNode%20Upgrade%20Soak%20Duration) |
| 19 | AKS cluster creation, node pool addition, scaling, start, or upgrade fails with ... | Subscription vCPU quota (Total Regional vCPUs or specific VM... | Submit quota increase via Azure portal (https://learn.micros... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCompute%2FQuota%20errors) |
| 20 | AKS cluster creation or upgrade fails when PodSecurityPolicy (PSP) is enabled on... | PSP removed in K8s 1.25. AKS blocks creation/upgrade for PSP... | Migrate from PSP to Pod Security Admission (PSA) or Azure Po... | [B] 6.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 21 | Pods report increased memory usage after upgrading AKS cluster to Kubernetes 1.2... | cgroup v2 is default in K8s 1.25+ on AKS. cgroup v2 uses dif... | If only higher reported memory without evictions, no action ... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/aks-increased-memory-usage-cgroup-v2) |
| 22 | AKS node pool upgrade fails with NodePoolMcVersionIncompatible: node pool versio... | Kubernetes version skew policy violation: node pool minor ve... | 1) Check control plane version: az aks get-upgrades --resour... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/nodepoolmcversionincompatible-error) |
| 23 | AKS upgrade blocked with K8sVersionNotSupported, OperationNotAllowed (cannot ski... | Target K8s version deprecated in region, attempting to skip ... | 1) az aks get-upgrades to check available paths. 2) Upgrade ... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/aks-upgrade-blocked) |
| 24 | Need to upgrade AKS node pool to a specific node image version instead of latest... | AKS releases new node images weekly and always upgrades to l... | 1) Find pool with desired image version. 2) Create snapshot:... | [B] 5.0 | [onenote: MCVKB/wiki_migration/======VM&SCIM======] |
| 25 | Enabling VPA on AKS cluster fails with validation error: 'Vertical Pod Autoscale... | VPA feature requires Kubernetes version 1.24.0 or higher. Th... | Upgrade the cluster to Kubernetes version 1.24.0 or above us... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Vertical%20Pod%20Autoscaler) |
| 26 | Custom log collection (Fluentd/Fluentbit) breaks after AKS upgrade from Docker t... | Pod log file path and log format changed when AKS container ... | 1) Update Fluentd/Fluentbit config to handle CRI log format.... | [Y] 4.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
