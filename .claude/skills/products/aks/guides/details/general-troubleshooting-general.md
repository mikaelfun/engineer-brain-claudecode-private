# AKS 通用排查 — general -- Comprehensive Troubleshooting Guide

**Entries**: 24 | **Draft sources**: 1 | **Kusto queries**: 0
**Source drafts**: ado-wiki-b-Logrotate-Conflicts.md
**Generated**: 2026-04-07

---

## Phase 1: 直接修改 AKS worker node 的时区会导致 worker 与 master 节点时区不一

### aks-459: AKS 节点时区被修改后集群异常，或需要为 Pod 配置时区但不知道安全方法

**Root Cause**: 直接修改 AKS worker node 的时区会导致 worker 与 master 节点时区不一致，破坏集群功能。客户真正需要的通常是更改容器/Pod 时区而非节点时区。

**Solution**:
三种安全方法配置 Pod 时区：1) 设置 TZ 环境变量（env: name=TZ value=America/New_York）；2) 通过 hostPath 挂载 /usr/share/zoneinfo/{区域} 到容器 /etc/localtime；3) 部署 k8tz admission controller（helm install k8tz k8tz/k8tz --set timezone=Europe/London）自动注入时区到所有 Pod。仅适用于 Linux Pod，Windows 暂无方案。

`[Score: [G] 9.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCluster%20Management%2FConfiguring%20timezone%20settings%20for%20a%20pod)]`

## Phase 2: Known upstream Kubernetes issue with LoadBalancer 

### aks-219: LoadBalancer Service takes hours for external IP assignment; Service remains in ...

**Root Cause**: Known upstream Kubernetes issue with LoadBalancer IP allocation mechanism

**Solution**:
Upgrade to Kubernetes 1.18.2+ which includes upstream fix (PR #88699)

`[Score: [G] 8.0 | Source: [onenote: POD/VMSCIM/4. Services/AKS/##Regular Syn]]`

## Phase 3: Chrony on AKS nodes syncs time via PTP device to p

### aks-263: AKS node time drift observed (e.g. 6 minutes difference); node using Chrony for ...

**Root Cause**: Chrony on AKS nodes syncs time via PTP device to physical host clock instead of Internet outbound NTP. dpkg operations can affect chrony installation, causing time sync failure. Ubuntu 16.04 nodes particularly affected

**Solution**:
CSE script fix deployed for the dpkg lock issue. For persistent time drift: 1) Check chrony status with `chronyc tracking` and `chronyc sources`; 2) Verify PTP device available; 3) Node image upgrade to get latest CSE fix; 4) Reimage affected nodes as immediate mitigation

`[Score: [G] 8.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 4: Remediator on old underlay cluster version has inc

### aks-217: AKS agent node auto-repair (Remediator) causes Docker service to go down on agen...

**Root Cause**: Remediator on old underlay cluster version has incorrect auto-repair behavior

**Solution**:
After underlay cluster migration, Remediator behaves correctly. Ensure cluster is on updated underlay

`[Score: [B] 7.5 | Source: [onenote: POD/VMSCIM/4. Services/AKS/##Regular Syn]]`

## Phase 5: 容器默认使用 UTC 时区，/etc/timezone 和 /etc/localtime 未配置为目

### aks-458: Pod 时区不正确，需要将 AKS 集群中的 Pod 时区更改为特定时区

**Root Cause**: 容器默认使用 UTC 时区，/etc/timezone 和 /etc/localtime 未配置为目标时区

**Solution**:
使用 ConfigMap 挂载 /etc/timezone 文件内容（如 Etc/IST），同时通过 hostPath 将宿主机 /usr/share/zoneinfo/{区域} 挂载到容器 /etc/localtime。ConfigMap 的 key 需与 mountPath/subPath 一致。示例：kubectl create configmap timezone --from-literal=timezone=Etc/IST，Pod spec 中配置 volumeMounts 和 volumes。

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCluster%20Management%2FChanging%20Timezone%20for%20Pods)]`

## Phase 6: 用户未加入 AznwKustoReader 安全组，缺乏 Azure Network Kusto 数

### aks-509: Kusto 查询 Azurehn 数据库检查 Overlake 状态时无返回结果

**Root Cause**: 用户未加入 AznwKustoReader 安全组，缺乏 Azure Network Kusto 数据读取权限。

**Solution**:
在 IDWeb 中搜索 AznwKustoReader 组并加入（描述为 'Azure Network Kusto Data Reader'）。链接：https://idweb.microsoft.com/IdentityManagement/aspx/common/GlobalSearchResult.aspx?searchtype=e0c132db-08d8-4258-8bce-561687a8a51e&content=%20AznwKustoReader

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/pages?path=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FCheck%20whether%20overlake%20is%20enabled%20on%20the%20backend%20host%20of%20the%20AKS%20nodes)]`

## Phase 7: Two root causes: 1) GetAgentPool_NotFound: agentpo

### aks-576: AKS Machine API (LIST/GET Machines) returns NotFound with GetAgentPool_NotFound ...

**Root Cause**: Two root causes: 1) GetAgentPool_NotFound: agentpool not yet registered in DB (race condition during creation) or incorrect agentpool name in target URI; 2) NoRegisteredProviderFound: specific REST API version used by Machine API implementation is not supported in the target region.

**Solution**:
For GetAgentPool_NotFound: verify agentpool exists via List AgentPools API or GET Agentpool; ensure correct agentpool name in URI path parameter. For NoRegisteredProviderFound: no client-side mitigation available — notify AKS dev team immediately. Machine API does not have async operations. Kusto: FrontEndQoSEvents where operationName == 'ListMachinesHandler.GET' or 'GetMachineHandler.GET'; FrontEndContextActivity for detailed operation context.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Create/GET%20and%20LIST%20Machine%20API%20Troubleshooting)]`

## Phase 8: DNC (Delegated Network Controller) cleanup service

### aks-595: AKS cluster delete fails with DNCCleanupServiceError / UnexpectedStatusFromDNCCl...

**Root Cause**: DNC (Delegated Network Controller) cleanup service returns unexpected HTTP 202 instead of expected 404 during cluster deletion, indicating the DNC resource cleanup did not complete as expected. This is a transient backend issue in the DNC service.

**Solution**:
Requires PG mitigation. Open ICM referencing the internal DNC cleanup TSG: https://eng.ms/docs/cloud-ai-platform/azure-core/azure-networking/sdn-dbansal/azure-container-networking/azure-container-networking-tsgs/tsgs/aks/dnccleanup/dnccleanup. The error is marked retriable but typically requires PG intervention to resolve.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FDelete%2FCluster%20delete%20operation%20failed%20with%20DNCCleanupServiceError)]`

## Phase 9: Customer declined to provide consent for advanced 

### aks-622: Engineer cannot see customer data in ASC (Azure Support Center), message shows '...

**Root Cause**: Customer declined to provide consent for advanced diagnostic data collection when creating the support case

**Solution**:
1) Click 'Learn More' in ASC to get email template, ask customer to provide consent via Azure Portal > Support Request > Allow collection of advanced diagnostic information; 2) If customer refuses consent, troubleshoot via screensharing or ask customer to attach needed info

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACT%20Team%2FProcesses%2FCase%20Management%2FProtecting%20Customer%20Data%20in%20ASC%20Logs%20Access%20Consent)]`

## Phase 10: These scenarios are outside AKS support scope. AKS

### aks-649: Customer submits AKS support case for Deployments, Namespaces, containerizing ap...

**Root Cause**: These scenarios are outside AKS support scope. AKS support covers: API server connectivity, VM registration, horizontal scaling, version upgrades only

**Solution**:
Inform customer that AKS support scope covers: 1) API server connectivity; 2) VM cluster registration; 3) Horizontal scaling; 4) Minor/patch version upgrades. For Deployments/Namespaces/containerizing/advisory, refer to Kubernetes community. Reference: https://learn.microsoft.com/en-US/troubleshoot/azure/general/support-policy-containers

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACT%20Team%2FProcesses%2FCase%20Management%2FSupport%20Scope)]`

## Phase 11: Unknown

### aks-674: Need to share sample/script code with customer and ensure compliance with Micros...

**Root Cause**: N/A

**Solution**:
Include the standard Sample Code Disclaimer when sharing any code/scripts. Full disclaimer text available in wiki. Reference: OneStop Sample Code Policy.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACT%20Team%2FProcesses%2FCase%20Management%2FSample%20Code%20Disclaimer)]`

### aks-685: Customer needs assistance configuring AKS environment with scripts but issue exc...

**Root Cause**: N/A

**Solution**:
Premier customers: recommend CSA engagement through CSAM (check with account team first). Broad Commercial: refer to Azure Partners (https://azure.microsoft.com/en-us/partners/).

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACT%20Team%2FCase%20Handling%20E2E%2FOn%20Going%20Cases%2FExample%20Scenario%20Based%20Responses%2FConfiguration%20Script%20Writing%20Assistance)]`

### aks-691: Customer asks about ETA for new AKS feature or Kubernetes version GA release

**Root Cause**: N/A

**Solution**:
If timeframe available: Product team targets [date], timeline not guaranteed and subject to change. If no timeframe: No ETA available, once provided timeline will not be guaranteed.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACT%20Team%2FCase%20Handling%20E2E%2FOn%20Going%20Cases%2FExample%20Scenario%20Based%20Responses%2FETA%20Request%20For%20Feature%20or%20Version)]`

## Phase 12: The container image has not been signed with notat

### aks-683: Image Integrity policy reports 'signature artifact not found' for container imag...

**Root Cause**: The container image has not been signed with notation; no signature artifact exists in the registry for this image

**Solution**:
Customer must sign the container image using notation before deploying. As a temporary mitigation change the policy effect from Deny to Audit to unblock deployments

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Image%20Integrity)]`

## Phase 13: PodTolerationRestriction admission controller veri

### aks-688: Pod creation rejected: pod tolerations (possibly merged with namespace default t...

**Root Cause**: PodTolerationRestriction admission controller verifies pod tolerations against namespace toleration whitelist (annotation scheduler.alpha.kubernetes.io/tolerationsWhitelist). Pod default tolerations (not-ready, unreachable) must also be in the whitelist

**Solution**:
1) Check namespace annotations for tolerationsWhitelist. 2) Ensure ALL required tolerations are in the whitelist, including default tolerations: node.kubernetes.io/not-ready:NoExecute and node.kubernetes.io/unreachable:NoExecute. 3) Add any custom tolerations used by pods to the whitelist

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FAdmission%20Controllers)]`

## Phase 14: AKS Automatic SKU requires Standard tier as prereq

### aks-736: Error when updating existing AKS cluster to Automatic SKU because cluster SKU ti...

**Root Cause**: AKS Automatic SKU requires Standard tier as prerequisite

**Solution**:
Run: az aks update -g <resource-group> -n <cluster-name> --tier standard before converting to Automatic.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/AKS%20Automatic%20SKU)]`

## Phase 15: API server connectivity timeouts cause leader elec

### aks-1090: Retina-operator pod restarts with error retrieving resource lock kube-system/cil...

**Root Cause**: API server connectivity timeouts cause leader election lease failure. Transient and harmless unless CrashLoop.

**Solution**:
1) Check CrashLoop: kubectl get pods -n kube-system -l app=retina-operator. 2) Infrequent restarts = harmless. 3) If CrashLoop, check API server connectivity. 4) Check logs for persistent lease errors.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Monitoring/Network%20Observability%20(Kappie)/Advanced/Non-Cilium/Retina%20Operator)]`

## Phase 16: Upstream K8s beta feature + podGC behavior change 

### aks-129: After AKS Stop/Start on K8s 1.26, ghost pods appear running on non-existent node...

**Root Cause**: Upstream K8s beta feature + podGC behavior change in 1.26 caused stale pod records after stop/start

**Solution**:
Fixed by AKS team. Upgrade to latest 1.26 patch. ICM: 390020923

`[Score: [B] 6.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 17: Bug in k8s 1.20 cloud-controller-manager (PR #1006

### aks-259: Kubernetes 1.20 known issue: deleting a LoadBalancer service does not clean up t...

**Root Cause**: Bug in k8s 1.20 cloud-controller-manager (PR #100691). When public IP has service and kubernetes-cluster-name tags the delete logic fails to remove the IP.

**Solution**:
Before deleting service manually remove service and kubernetes-cluster-name tags from public IP. After tag removal controller-manager will not attempt to delete PIP allowing manual cleanup.

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 18: (1) Arguments provided to executable are too long,

### aks-1149: Application fails with 'argument list too long' error when kubelet tries to run ...

**Root Cause**: (1) Arguments provided to executable are too long, or (2) too many services in namespace cause kubelet to inject excessive environment variables for service discovery

**Solution**:
(1) Shorten argument list; (2) Reduce active services, or set enableServiceLinks: false in PodSpec and use CoreDNS for service discovery instead

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/application-fails-argument-list-too-long)]`

## Phase 19: ManagedNamespacePreview feature flag not registere

### aks-1271: Managed namespace: FeatureNotFound when registering ManagedNamespacePreview; or ...

**Root Cause**: ManagedNamespacePreview feature flag not registered or command entered incorrectly

**Solution**:
Register: az feature register --namespace Microsoft.containerService -n ManagedNamespacePreview; verify: az feature show

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-managed-namespaces)]`

## Phase 20: Seccomp profile blocks required syscalls (clone, i

### aks-1285: AKS workloads exit with permission denied or function not implemented after conf...

**Root Cause**: Seccomp profile blocks required syscalls (clone, io_uring, clock_settime)

**Solution**:
Use Inspektor Gadget audit_seccomp to identify blocked syscalls; change defaultAction to SCMP_ACT_LOG for diagnosis

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/security/troubleshoot-seccomp-profiles)]`

## Phase 21: AKS clusters created with apiVersion >= 2020-11-01

### aks-237: AKS cluster created after API version 2020-11-01 unexpectedly uses ephemeral OS ...

**Root Cause**: AKS clusters created with apiVersion >= 2020-11-01 have ephemeral OS disk enabled by default. Ephemeral OS disks do not persist data across node reimages.

**Solution**:
Explicitly set osDiskType to Managed if persistent OS disk is required. For new clusters verify osDiskType setting before creation.

`[Score: [B] 5.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 22: A process (potentially omsagent/monitoring extensi

### aks-254: AKS syslog and /var/log/messages files are not rotated growing indefinitely on n...

**Root Cause**: A process (potentially omsagent/monitoring extension) holds log files open preventing logrotate from rotating them.

**Solution**:
1) Check which process holds files: lsof /var/log/syslog /var/log/messages. 2) Check if omsagent extension installed. 3) Restart offending process or configure copytruncate in logrotate config.

`[Score: [B] 5.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS 节点时区被修改后集群异常，或需要为 Pod 配置时区但不知道安全方法 | 直接修改 AKS worker node 的时区会导致 worker 与 master 节点时区不一致，破坏集群功能。客... | 三种安全方法配置 Pod 时区：1) 设置 TZ 环境变量（env: name=TZ value=America/New... | [G] 9.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCluster%20Management%2FConfiguring%20timezone%20settings%20for%20a%20pod) |
| 2 | LoadBalancer Service takes hours for external IP assignment; Service remains in ... | Known upstream Kubernetes issue with LoadBalancer IP allocat... | Upgrade to Kubernetes 1.18.2+ which includes upstream fix (P... | [G] 8.0 | [onenote: POD/VMSCIM/4. Services/AKS/##Regular Syn] |
| 3 | AKS node time drift observed (e.g. 6 minutes difference); node using Chrony for ... | Chrony on AKS nodes syncs time via PTP device to physical ho... | CSE script fix deployed for the dpkg lock issue. For persist... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 4 | AKS agent node auto-repair (Remediator) causes Docker service to go down on agen... | Remediator on old underlay cluster version has incorrect aut... | After underlay cluster migration, Remediator behaves correct... | [B] 7.5 | [onenote: POD/VMSCIM/4. Services/AKS/##Regular Syn] |
| 5 | Pod 时区不正确，需要将 AKS 集群中的 Pod 时区更改为特定时区 | 容器默认使用 UTC 时区，/etc/timezone 和 /etc/localtime 未配置为目标时区 | 使用 ConfigMap 挂载 /etc/timezone 文件内容（如 Etc/IST），同时通过 hostPath ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCluster%20Management%2FChanging%20Timezone%20for%20Pods) |
| 6 | Kusto 查询 Azurehn 数据库检查 Overlake 状态时无返回结果 | 用户未加入 AznwKustoReader 安全组，缺乏 Azure Network Kusto 数据读取权限。 | 在 IDWeb 中搜索 AznwKustoReader 组并加入（描述为 'Azure Network Kusto Da... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/pages?path=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FCheck%20whether%20overlake%20is%20enabled%20on%20the%20backend%20host%20of%20the%20AKS%20nodes) |
| 7 | AKS Machine API (LIST/GET Machines) returns NotFound with GetAgentPool_NotFound ... | Two root causes: 1) GetAgentPool_NotFound: agentpool not yet... | For GetAgentPool_NotFound: verify agentpool exists via List ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Create/GET%20and%20LIST%20Machine%20API%20Troubleshooting) |
| 8 | AKS cluster delete fails with DNCCleanupServiceError / UnexpectedStatusFromDNCCl... | DNC (Delegated Network Controller) cleanup service returns u... | Requires PG mitigation. Open ICM referencing the internal DN... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FDelete%2FCluster%20delete%20operation%20failed%20with%20DNCCleanupServiceError) |
| 9 | Engineer cannot see customer data in ASC (Azure Support Center), message shows '... | Customer declined to provide consent for advanced diagnostic... | 1) Click 'Learn More' in ASC to get email template, ask cust... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACT%20Team%2FProcesses%2FCase%20Management%2FProtecting%20Customer%20Data%20in%20ASC%20Logs%20Access%20Consent) |
| 10 | Customer submits AKS support case for Deployments, Namespaces, containerizing ap... | These scenarios are outside AKS support scope. AKS support c... | Inform customer that AKS support scope covers: 1) API server... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACT%20Team%2FProcesses%2FCase%20Management%2FSupport%20Scope) |
| 11 | Need to share sample/script code with customer and ensure compliance with Micros... | - | Include the standard Sample Code Disclaimer when sharing any... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACT%20Team%2FProcesses%2FCase%20Management%2FSample%20Code%20Disclaimer) |
| 12 | Image Integrity policy reports 'signature artifact not found' for container imag... | The container image has not been signed with notation; no si... | Customer must sign the container image using notation before... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Image%20Integrity) |
| 13 | Customer needs assistance configuring AKS environment with scripts but issue exc... | - | Premier customers: recommend CSA engagement through CSAM (ch... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACT%20Team%2FCase%20Handling%20E2E%2FOn%20Going%20Cases%2FExample%20Scenario%20Based%20Responses%2FConfiguration%20Script%20Writing%20Assistance) |
| 14 | Pod creation rejected: pod tolerations (possibly merged with namespace default t... | PodTolerationRestriction admission controller verifies pod t... | 1) Check namespace annotations for tolerationsWhitelist. 2) ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FAdmission%20Controllers) |
| 15 | Customer asks about ETA for new AKS feature or Kubernetes version GA release | - | If timeframe available: Product team targets [date], timelin... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACT%20Team%2FCase%20Handling%20E2E%2FOn%20Going%20Cases%2FExample%20Scenario%20Based%20Responses%2FETA%20Request%20For%20Feature%20or%20Version) |
| 16 | Error when updating existing AKS cluster to Automatic SKU because cluster SKU ti... | AKS Automatic SKU requires Standard tier as prerequisite | Run: az aks update -g <resource-group> -n <cluster-name> --t... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/AKS%20Automatic%20SKU) |
| 17 | Retina-operator pod restarts with error retrieving resource lock kube-system/cil... | API server connectivity timeouts cause leader election lease... | 1) Check CrashLoop: kubectl get pods -n kube-system -l app=r... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Monitoring/Network%20Observability%20(Kappie)/Advanced/Non-Cilium/Retina%20Operator) |
| 18 | After AKS Stop/Start on K8s 1.26, ghost pods appear running on non-existent node... | Upstream K8s beta feature + podGC behavior change in 1.26 ca... | Fixed by AKS team. Upgrade to latest 1.26 patch. ICM: 390020... | [B] 6.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 19 | Kubernetes 1.20 known issue: deleting a LoadBalancer service does not clean up t... | Bug in k8s 1.20 cloud-controller-manager (PR #100691). When ... | Before deleting service manually remove service and kubernet... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 20 | Application fails with 'argument list too long' error when kubelet tries to run ... | (1) Arguments provided to executable are too long, or (2) to... | (1) Shorten argument list; (2) Reduce active services, or se... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/application-fails-argument-list-too-long) |
| 21 | Managed namespace: FeatureNotFound when registering ManagedNamespacePreview; or ... | ManagedNamespacePreview feature flag not registered or comma... | Register: az feature register --namespace Microsoft.containe... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-managed-namespaces) |
| 22 | AKS workloads exit with permission denied or function not implemented after conf... | Seccomp profile blocks required syscalls (clone, io_uring, c... | Use Inspektor Gadget audit_seccomp to identify blocked sysca... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/security/troubleshoot-seccomp-profiles) |
| 23 | AKS cluster created after API version 2020-11-01 unexpectedly uses ephemeral OS ... | AKS clusters created with apiVersion >= 2020-11-01 have ephe... | Explicitly set osDiskType to Managed if persistent OS disk i... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 24 | AKS syslog and /var/log/messages files are not rotated growing indefinitely on n... | A process (potentially omsagent/monitoring extension) holds ... | 1) Check which process holds files: lsof /var/log/syslog /va... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
