# AKS ACI 网络与 DNS — general -- Comprehensive Troubleshooting Guide

**Entries**: 47 | **Draft sources**: 3 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-aci-troubleshooting-with-asi.md, ado-wiki-aci-troubleshooting-asi.md, ado-wiki-aci-vulnerability-container-tenant-escape.md
**Generated**: 2026-04-07

---

## Phase 1: ACI network profile created during container group

### aks-327: Cannot delete ACI subnet or VNet - error 'Subnet is in use by networkProfiles/ac...

**Root Cause**: ACI network profile created during container group deployment is not properly cleaned up when CG is deleted, leaving resources in the subnet that block delete operations.

**Solution**:
Workaround 1: Portal → Resource Group → Show hidden types → delete Network Profile → then delete subnet/VNet. Workaround 2: CLI → az network profile list → az network profile delete --ids <id> → delete subnet/VNet. Workaround 3: az resource update --ids <network-profile-id> --set properties.containerNetworkInterfaceConfigurations=[] → then delete. If all fail, file IcM to ACI team.

`[Score: [G] 9.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FUnable%20to%20delete%20ACI%20Subnet%20or%20VNet%20Subnet%20is%20in%20use)]`

## Phase 2: Firewall, NSG rules, or network configuration bloc

### aks-407: ACI container instance fails to start with DeploymentTimeout and mount error: Ex...

**Root Cause**: Firewall, NSG rules, or network configuration blocking access to Azure Storage file share, preventing the container sidecar from mounting the required Azure File volume

**Solution**:
Check firewall settings, NSGs, and network accessibility to the Storage file share. As workaround, redeploy container group in another VNet with fewer network restrictions to confirm it is a network issue

`[Score: [G] 9.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACI/TSG/%5BTSG%5D%20ACI%20Container%20Instance%20Failing%20To%20Start%20because%20Mount%20Error)]`

## Phase 3: ACI creates a Service Association Link (acisal) on

### aks-600: Cannot delete ACI VNet or Subnet — error 'Subnet requires delegations [Microsoft...

**Root Cause**: ACI creates a Service Association Link (acisal) on the delegated subnet. After all container groups are deleted, the acisal may remain (dangling), blocking subnet/VNET deletion. Setting subnet delegation to 'None' does not work because the acisal is still present.

**Solution**:
1) Verify all ACI deployments on the subnet are deleted using Kusto query on accprod.SubscriptionDeployments filtering by subnetId. 2) Delete the SAL via CLI: az resource delete --ids /subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.Network/virtualNetworks/{vnet}/subnets/{subnet}/serviceAssociationLinks/acisal --api-version 2018-10-01. 3) Retry subnet deletion. 4) If still fails, open IcM to ACI team for ACIS Action NRP/DeleteServiceAssociationLink.

`[Score: [G] 9.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Cannot%20delete%20ACI%20Vnet%20or%20Subnet%20due%20to%20dangling%20Service%20Association%20Link)]`

## Phase 4: 重建容器组时未指定 DNS reuse policy；仅使用相同 DNS 标签不足以触发复用，必须同

### aks-288: 删除 ACI 容器组后，用相同 DNS 标签重建新容器组，FQDN 并未复用旧标签，DNS label reuse 不生效

**Root Cause**: 重建容器组时未指定 DNS reuse policy；仅使用相同 DNS 标签不足以触发复用，必须同时在新容器组上明确指定相同的 dnsNameLabelReusePolicy（如 resourceGroupReuse）

**Solution**:
在重建 ACI 容器组时，在 DNS label 设置的同时必须选择（或在 ARM/CLI 中指定）相同的 DNS Reuse Policy（如 ResourceGroupReuse）。5种策略：Unsecure / TenantReuse / SubscriptionReuse / ResourceGroupReuse / NoReuse，默认为 NoReuse

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FHow%20To%2FReusing%20DNS%20labels)]`

## Phase 5: CVE-2019-5736 and CVE-2018-1002102 vulnerabilities

### aks-294: Customer receives Azure Service Health notification about ACI security vulnerabi...

**Root Cause**: CVE-2019-5736 and CVE-2018-1002102 vulnerabilities in Kubernetes and container runtime. ACI was running on old Kubernetes-based stack susceptible to these CVEs. Security researchers from Palo Alto Networks (reported July 1, 2021) inferred internal ACI architecture and attacked ACI custom components. Vulnerability could allow user to escape container and tenant boundary.

**Solution**:
Microsoft deployed fix Aug 31, 2021. Current ACI: (1) runs each container in dedicated VM with hypervisor isolation, (2) uses custom Bridge Service for 'exec' commands instead of Kubernetes API server. Both mechanisms prevent CVE exploitation. Actions: validate if customer subscription was in impacted list; recommend rotating secrets/credentials used in ACI deployments; check access/audit logs of secret stores, storage accounts, databases for suspicious activity. No evidence of exploitation was found. Use 'Vulnerability Related Inquiries' Root Cause in ACI Root Cause Tree when closing ticket.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACI/Emerging%20and%20Known%20Issues/ACI%20Vulnerability)]`

## Phase 6: ACI does not cache images permanently. Large uncac

### aks-307: ACI container group stuck in 'Created' status with long image pull time

**Root Cause**: ACI does not cache images permanently. Large uncached images require full pull from the container registry, causing extended deployment time proportional to image size. This is expected behavior for large images.

**Solution**:
1) Run `az container show --resource-group <RG> --name <CG>` and check events timeline — compare 'Pulling' and 'Pulled' timestamps to determine actual pull duration; 2) If image is large and uncached, this is expected behavior; 3) Consider using pre-cached images from https://learn.microsoft.com/en-us/rest/api/container-instances/2021-09-01/location/list-cached-images; 4) Reduce image size by using multi-stage builds or smaller base images.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FACI%20Long%20Image%20Pull%20times)]`

### aks-370: ACI container group stuck in Created status for extended time due to long image ...

**Root Cause**: ACI does not cache images permanently. Large uncached images must be pulled from registry, causing significant delays.

**Solution**:
1) Run az container show to check events timeline and confirm pull duration; 2) Use smaller/optimized images; 3) Consider using ACI cached base images (list at learn.microsoft.com/.../list-cached-images); 4) If pull time matches image size expectations, this is expected behavior.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FACI%20Long%20Image%20Pull%20times)]`

## Phase 7: Firewall settings, NSGs, or network restrictions b

### aks-308: ACI Container Group fails to start with DeploymentTimeout and 'Existing volume m...

**Root Cause**: Firewall settings, NSGs, or network restrictions blocking connectivity to Azure Storage File service, preventing the sidecar container from completing the volume mount operation.

**Solution**:
1) Check firewall settings and NSGs to ensure Azure File storage endpoint (port 445) is accessible from the container subnet; 2) Verify storage account key and configuration are correct; 3) As workaround, redeploy container group with a VNet with fewer network restrictions to confirm connectivity is the issue.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20ACI%20Container%20Instance%20Failing%20To%20Start%20because%20Mount%20Error)]`

## Phase 8: ACI does not provide static IP; container IP chang

### aks-312: ACI container group gets new IP after restart, causing Application Gateway backe...

**Root Cause**: ACI does not provide static IP; container IP changes on every restart. Application Gateway backend pool is not auto-updated when ACI IP changes.

**Solution**:
Create Azure Automation runbook (PowerShell) comparing ACI IP with AppGw backend pool IP, update if different. Set up Azure Alert on Restart Container Group activity + Log Analytics query for container start events, with Action Group triggering the runbook.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FHow%20To%2FAutomate%20Sync%20of%20ACI%20IP%20to%20backend%20pool%20of%20AppGw)]`

## Phase 9: ACI subscription quota (container groups, cores, G

### aks-313: ACI deployment fails due to quota limits or need to verify ACI quota utilization...

**Root Cause**: ACI subscription quota (container groups, cores, GPU cores) reached or insufficient for deployment in target region.

**Solution**:
Check quota via Kusto: cluster(Accprod).database(accprod).SubscriptionPolicy. To increase quota, open ICM using template 23QA1u.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FHow%20To%2FCheck%20ACI%20Quota%20for%20Subscription)]`

## Phase 10: By default ACI assigns a new public IP address eac

### aks-314: ACI container group needs fixed outbound IP address but Azure assigns different ...

**Root Cause**: By default ACI assigns a new public IP address each time the container group starts, making it impossible to allowlist in firewalls

**Solution**:
Deploy ACI with private networking in a VNet, then attach a NAT Gateway with a static public IP to the ACI subnet. Outbound traffic will use the NAT Gateway's fixed IP.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FHow%20To%2FFixed%20IP%20Address%20for%20Outbound%20Connectivity%20in%20ACI%20through%20NAT%20Gateway)]`

## Phase 11: Platform maintenance events trigger RepairDeployme

### aks-326: ACI container group experiences intermittent restarts without errors in containe...

**Root Cause**: Platform maintenance events trigger RepairDeployments operations that restart container groups; confirmed when OperationName is POST/ADMIN/LOCATIONS/CLUSTERS/REPAIRDEPLOYMENTS with null clientApplicationId

**Solution**:
Use Kusto queries on accprod cluster (SubscriptionDeployments + HttpIncomingRequests tables) to correlate restart time with RepairDeployments operations. If confirmed, share public doc: https://docs.microsoft.com/en-us/azure/container-instances/container-instances-troubleshooting#container-had-an-isolated-restart-without-explicit-user-input. Recommend Always/OnFailure restart policies and running multiple container groups behind Application Gateway or Traffic Manager for HA.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FContainer%20Group%20restart%20due%20to%20Platform%20events)]`

## Phase 12: Firewall blocks TCP port 19390 which is required f

### aks-332: Cannot connect to ACI container from Azure Portal in BYOVNET deployment; error: ...

**Root Cause**: Firewall blocks TCP port 19390 which is required for portal container connect in BYOVNET scenario. This port is an ACI service port not documented in BYOVNET requirements.

**Solution**:
Allow ingress TCP port 19390 in firewall. Ensure all public client IPs that need portal access can reach this port.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Connect%20to%20Container%20requirements%20in%20BYOVNET)]`

## Phase 13: Service Fabric fails to deactivate Code Package du

### aks-343: Ghost ACI Container Groups still running after expected stop; Force Stop CG need...

**Root Cause**: Service Fabric fails to deactivate Code Package due to node issues

**Solution**:
Open CRI/IcM. CSS identifies ghost container via Kusto SubscriptionDeployments table by IP. EEE uses ACIS Action ACI/Stop Container Group (elevated JIT). If newer caas running, transfer to PG/SF PG.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACI/List%20of%20ACI%20issues%20where%20IcM%20is%20required)]`

## Phase 14: Region capacity exhausted for ACI resources

### aks-344: ACI deployment fails with Insufficient Capacity error

**Root Cause**: Region capacity exhausted for ACI resources

**Solution**:
Validate via ASI Insufficient Capacity detector and attempt repro. Ask customer to try another region. Open CRI/IcM for PG to check capacity dashboards.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACI/List%20of%20ACI%20issues%20where%20IcM%20is%20required)]`

## Phase 15: Log uploader or Geneva Metric configuration issues

### aks-345: ACI Container Group logs or metrics missing/gaps

**Root Cause**: Log uploader or Geneva Metric configuration issues

**Solution**:
Validate via ASI Metrics tab (CG page) and Log Uploader Events tab (caas page). Use Kusto LogAnalyticsUploader events query. EEE checks Geneva Metric definitions for shoebox account. Transfer to PG for fix.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACI/List%20of%20ACI%20issues%20where%20IcM%20is%20required)]`

## Phase 16: Leaked subscription deployment — the deployment in

### aks-437: ACI container instance still being billed after stop or deletion; customer repor...

**Root Cause**: Leaked subscription deployment — the deployment index (SubscriptionDeploymentIndex) still reports the container group as active, so the billing job continues emitting usage meters

**Solution**:
1) Verify the resource was actually stopped via Kusto. 2) Have customer create a new container instance with the same resourceId in the same region to force cleanup in ACI backend, then delete immediately. 3) For refunds, collect billing table data (CpuCoreHours/GbHours) for the period after stop and coordinate with Commerce team.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20ACI%20billing%20related%20issues)]`

## Phase 17: Known bug in Service Fabric infrastructure causing

### aks-456: ACI container group deployment to BYOVNET (private ACI) hangs in Waiting status ...

**Root Cause**: Known bug in Service Fabric infrastructure causing Network Container (NC) leak. Atlas nodes reach maximum NC capacity due to leaked network containers not being released.

**Solution**:
Retry the deployment (leaked NCs are eventually cleaned up). Refer to Emerging Issue 'ACI Network Container (NC) Leak' (ADO WI #68102).

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACI/TSG/%5BTSG%5D%20Container%20Group%20deployment%20hangs%20in%20Waiting%20status)]`

## Phase 18: IP leak in Atlas RP — RP does not release IPs in D

### aks-457: ACI container group deployment to BYOVNET fails with 30-minute timeout. SF execu...

**Root Cause**: IP leak in Atlas RP — RP does not release IPs in DNC storage when ACIs are deleted, causing subnet to be incorrectly marked as full. Especially affects small subnets like /29 which only have 3 usable IPs.

**Solution**:
Customer-side: expand subnet CIDR to at least /24. Do not use small subnets to simulate fixed IP. PG can mitigate manually via IcM. Bug report: ADO WI #24499175.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACI/TSG/%5BTSG%5D%20Container%20Group%20deployment%20hangs%20in%20Waiting%20status)]`

## Phase 19: Azure Portal memory metric for Container Groups is

### aks-605: ACI Portal memory metrics show lower values than expected — running 'free -h' in...

**Root Cause**: Azure Portal memory metric for Container Groups is an AVERAGE aggregation across ALL containers in the group (not per-container). In a multi-container setup where main container uses 10 GiB and sidecar uses 0.02 GiB, the averaged metric shows ~5 GiB. Only average aggregation is available (Min/Max will not show data).

**Solution**:
1) Explain to customer this is expected behavior — Portal metric averages across all containers. 2) Add a dimension filter in Azure Monitor to see metrics per individual container: go to Metrics → add filter → dimension = container name. 3) Reference docs: https://learn.microsoft.com/en-us/azure/container-instances/container-instances-monitor#get-metrics---azure-portal and https://learn.microsoft.com/en-us/azure/azure-monitor/essentials/metrics-supported#microsoftcontainerinstancecontainergroups

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Memory%20usage%20inside%20container%20does%20not%20match%20values%20in%20Portal)]`

## Phase 20: Azure Portal memory metric for ACI shows the avera

### aks-607: ACI memory usage in Azure Portal shows much lower values than 'free -h' inside t...

**Root Cause**: Azure Portal memory metric for ACI shows the average across ALL containers in the Container Group (averaged over 1-minute granularity). In multi-container groups, this averages the main container's usage with sidecar containers that use minimal memory, resulting in misleadingly low values.

**Solution**:
This is expected behavior. Add a dimension filter in Portal Metrics to view per-container memory usage: go to Metrics → select Memory Usage → Add Filter → containerName. Note: only Average aggregation is available for ACI metrics (Min/Max show no data). Reference: https://learn.microsoft.com/en-us/azure/container-instances/container-instances-monitor#get-metrics---azure-portal

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Memory%20usage%20inside%20container%20does%20not%20match%20values%20in%20Portal)]`

## Phase 21: 目标区域不支持所请求的资源配置（CPU/Memory/OS 组合），或客户部署到了不可用的区域，或使

### aks-610: ACI 部署失败，返回 ServiceUnavailable (409)：'The requested resource is not available in...

**Root Cause**: 目标区域不支持所请求的资源配置（CPU/Memory/OS 组合），或客户部署到了不可用的区域，或使用了该区域不支持的功能特性。

**Solution**:
1) 查看 Resource availability by region 文档确认区域支持；2) 调用 Location List Capabilities API 验证可用特性；3) 检查请求中是否含不支持的功能；4) 使用 ARM Kusto 查询 (armprodgbl Unionizer + Traces where message contains 'Limitation') 按 correlationId 关联找出具体限制原因。

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Service%20Unavailable%20Error)]`

## Phase 22: 区域内 K8s 集群处于不健康状态或 scheduleEnabled=false 导致集群被禁用，无

### aks-612: ACI 部署在某区域持续返回 ServiceUnavailable (409)，尽管该区域文档上列为可用；该区域多个客户同时受影响

**Root Cause**: 区域内 K8s 集群处于不健康状态或 scheduleEnabled=false 导致集群被禁用，无可用容量。可能因 K8s Service unhealthy、证书过期等原因导致集群被标记为不可调度。

**Solution**:
1) 使用 ClusterHealth Kusto 查询按 location 过滤，检查 scheduleEnabled、state、provisioningState 状态；2) 对 Atlas 区域检查 InventoryManager Jarvis Dashboard；3) 确认集群 API Server、MSI Connector、Controller Manager 等组件健康状态；4) 如容量不足需部署新集群扩容。

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Service%20Unavailable%20Error)]`

## Phase 23: Three possible causes: 1) Invalid or expired Log A

### aks-613: ACI container logs not appearing in Log Analytics Workspace — ContainerInstanceL...

**Root Cause**: Three possible causes: 1) Invalid or expired Log Analytics Workspace key preventing authentication. 2) Azure Monitor Private Link Scope (AMPLS) configured with public network ingestion disabled — ACI log integration does not support AMPLS. 3) Local authentication disabled on LA Workspace (disableLocalAuth=true), preventing ACI from authenticating.

**Solution**:
1) Verify LA Workspace key validity. 2) If AMPLS is used, enable data ingestion from public network: set 'Accept data ingestion from public networks' to Yes. 3) Check local auth: 'az resource show --ids /subscriptions/<sub>/resourceGroups/<rg>/providers/Microsoft.OperationalInsights/workspaces/<ws>' — if disableLocalAuth=true, enable it: 'az resource update --ids <ws-id> --api-version 2021-06-01 --set properties.features.disableLocalAuth=false'. Diagnostic: query SbzExecLogUploaderEvent in Kusto — look for 'Successfully posted' (success) or 'Upload failed with Http 403' (failure).

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Unable%20to%20send%20ACI%20logs%20to%20Log%20Analytics%20Workspace)]`

## Phase 24: Multiple possible causes: 1) Customer deploying to

### aks-615: ACI deployment fails with 'ServiceUnavailable (409)' — 'The requested resource i...

**Root Cause**: Multiple possible causes: 1) Customer deploying to region/feature combination not yet available (check region availability). 2) ARM limitations blocking the subscription. 3) Regional capacity exhaustion — clusters disabled or at max capacity. 4) For K8s clusters: unhealthy services (API server, controller manager, etc.) causing scheduleEnabled=false.

**Solution**:
1) Verify region availability at https://docs.microsoft.com/en-us/azure/container-instances/container-instances-region-availability. 2) Check feature availability via REST API ListCapabilities. 3) Check for ARM limitations: query armprodgbl Unionizer for 409 status with 'Limitation' in Traces. 4) For Atlas regions: check InventoryManager Jarvis dashboard. 5) For K8s regions: query ClusterHealth for capacity (availableReplicas, scheduleEnabled, service health). 6) Add capacity if needed.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Service%20Unavailable%20Error)]`

## Phase 25: ACI network profile with vk- prefix (Virtual Nodes

### aks-742: AKS cluster delete fails with ResourceGroupDeletionBlocked and inner error Netwo...

**Root Cause**: ACI network profile with vk- prefix (Virtual Nodes) still has container NICs bound to it. Known bug with supposed fix (PR 4202309) but may have regression. Tracked in Known Issue 14104.

**Solution**:
No customer-ready mitigation. Escalate via IcM to Support/EEE ACI. Provide: AKS operation ID, correlation ID, ARM logs showing HTTP 400 against Microsoft.Network RP on the vk- network profile.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FDelete%2FCluster%20delete%20with%20NetworkProfileAlreadyInUseWithContainerNics)]`

## Phase 26: ACI network profile container NICs not cleaned up 

### aks-897: AKS cluster delete fails with ResourceGroupDeletionBlocked/NetworkProfileAlready...

**Root Cause**: ACI network profile container NICs not cleaned up properly after Virtual Nodes/ACI removal. Known bug (ADO work item 14104, fix PR 4202309) with possible regression.

**Solution**:
No customer-ready mitigation. Escalate via IcM to Support / EEE ACI team with troubleshooting details including AKS operation ID, ARM correlation ID, and NRP HTTP 400 errors against the vk-* network profile.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FDelete%2FCluster%20delete%20with%20NetworkProfileAlreadyInUseWithContainerNics)]`

## Phase 27: ACI container NICs remain bound to the Virtual Kub

### aks-948: AKS cluster delete fails with ResourceGroupDeletionBlocked, inner error NetworkP...

**Root Cause**: ACI container NICs remain bound to the Virtual Kubelet network profile after cluster/virtual node operations. Possible regression of a 2021 bug in ACI (fix PR 4202309).

**Solution**:
No customer-ready mitigation. Escalate via ICM to 'Support / EEE ACI'. Provide AKS RP operation logs and ARM correlation ID showing HTTP 400 against Microsoft.Network on the 'vk-' network profile.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Delete/Cluster%20delete%20with%20NetworkProfileAlreadyInUseWithContainerNics)]`

## Phase 28: ACI (virtual node) 子网不支持 User-Defined Routing (UDR

### aks-1002: AKS virtual node 创建失败: error creating provider: error setting up network: unable...

**Root Cause**: ACI (virtual node) 子网不支持 User-Defined Routing (UDR)。aci-connector 会校验并阻止使用关联了路由表的子网进行委派

**Solution**:
从 ACI virtual node 使用的子网中移除 User-Defined Routing (路由表)。ACI 服务不支持子网上的 UDR

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2Ferror%20setting%20up%20network%20-%20AKS%20virtual%20node)]`

## Phase 29: Spot containers run on unused Azure capacity with 

### aks-319: ACI Spot container group evicted unexpectedly

**Root Cause**: Spot containers run on unused Azure capacity with eviction policy based on available capacity. When capacity is reclaimed, Spot container groups are evicted.

**Solution**:
Design workloads with checkpoint/resume logic to handle evictions. Use Spot containers only for parallelizable offline workloads (image rendering, genomic processing, Monte Carlo simulations, dev/test). Monitor new eviction events in container group logs. For workloads requiring uptime SLA, use regular-priority containers.

`[Score: [B] 7.0 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FACI%20Spot%20Containers)]`

## Phase 30: TriggerEvictions caused by cluster upgrading or un

### aks-471: ACI SubscriptionDeploymentUnhealthy error during Atlas deployment

**Root Cause**: TriggerEvictions caused by cluster upgrading or unhealthy cluster state

**Solution**:
Query SubscriptionDeployments table in accprod cluster to find clusterDeploymentName, then check JobTraces/JobErrors for detailed failure reason. Root cause is typically cluster upgrade in progress or bad cluster state.

`[Score: [B] 6.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20SubscriptionDeploymentUnhealthy%20(Atlas%20deployment))]`

## Phase 31: Google Kubernetes Engine cluster with Auto-Pilot m

### aks-1314: Customer was facing issue while deploying Google Kubernetes Engine Kubernetes cl...

**Root Cause**: Google Kubernetes Engine cluster with Auto-Pilot mode is not supported yet. The failure was due to insufficient resources on the Kubernetes cluster.

**Solution**:
Issue was fixed after deploying Google Kubernetes Engine k8s cluster in standard mode.

`[Score: [B] 6.5 | Source: [ContentIdea#180136](https://support.microsoft.com/kb/5030818)]`

## Phase 32: ACI virtual node integration issue where the conta

### aks-171: Virtual-node-aci-linux pod deployment stays in Pending state; pod logs show reso...

**Root Cause**: ACI virtual node integration issue where the container group resource is not found in the specified resource group. May be caused by region mismatch, missing ACI provider registration, or virtual node add-on misconfiguration.

**Solution**:
Verify ACI provider is registered (az provider register --namespace Microsoft.ContainerInstance). Check virtual node add-on is properly enabled. Ensure ACI region matches AKS region.

`[Score: [B] 5.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 33: ACI 执行集群日志（execution cluster log）不存储 correlation I

### aks-289: ACI 后端执行日志无法通过 correlation ID 查找到

**Root Cause**: ACI 执行集群日志（execution cluster log）不存储 correlation ID，只能通过 Cluster Deployment Name（caas-xxx）来检索后端详细日志。

**Solution**:
1) 通过 Kusto Helper (https://portal.microsoftgeneva.com/dashboard/ACC/Kusto%20Helper) 填入 subscriptionId/resourceGroup/containerGroup 获取 caas 名称；2) 或使用 Kusto 查询 SubscriptionDeployments 表按资源 URI 过滤得到 caas 名称；3) 找到 caas 名称后再查询执行集群日志。

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/pages?path=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FACI%20Terminologies%20for%20Troubleshooting)]`

## Phase 34: ASI 数据源是 Kusto，新创建的资源需要至少 15 分钟的数据摄入时间才能在 ASI 中可见。

### aks-290: ASI (Azure Service Insights) 中搜索新创建的 ACI 资源时提示 Not Found

**Root Cause**: ASI 数据源是 Kusto，新创建的资源需要至少 15 分钟的数据摄入时间才能在 ASI 中可见。

**Solution**:
等待至少 15 分钟后再在 ASI 中搜索新创建的 ACI 资源。ASI 地址：https://azureserviceinsights.trafficmanager.net/ ，选择 ACI service 进行搜索。

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/pages?path=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FACI%20Troubleshooting%20with%20ASI)]`

## Phase 35: ACI ASI 主数据表 SubscriptionDeployments 保留期为 120 天，超过

### aks-295: ASI 中无法找到超过一定时间的 ACI 历史数据

**Root Cause**: ACI ASI 主数据表 SubscriptionDeployments 保留期为 120 天，超过该时间的历史数据将不可查询。

**Solution**:
1) 在 ASI 搜索时确保时间范围在 120 天内；2) 如需查询超过 120 天的历史数据，需通过其他途径（如归档存储或 ICM）获取。SubscriptionDeployments 表保留期为 120 天。

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/pages?path=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FACI%20Troubleshooting%20with%20ASI)]`

## Phase 36: The underlying Spot VM hosting the container group

### aks-300: ACI Spot container group enters 'Waiting' state after having been in 'Running' s...

**Root Cause**: The underlying Spot VM hosting the container group was evicted due to Azure capacity adjustments. Spot VM evictions can happen at any time. The container group waits for relocation to a new node within the same or different cluster.

**Solution**:
This is expected behavior for Spot containers. Use the Spot ContainerGroup Evictions Kusto query (atlaslogscp.eastus/telemetry) with CRP ApiQosEvent_nonGet to confirm evictions (FabricCallback.OnVMScaleSetVMsEvicted.POST), track jump count and jump durations. See guide: guides/drafts/ado-wiki-b-aci-spot-containers-evictions-kusto.md

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACI/TSG/%5BTSG%5D%20ACI%20Spot%20Containers%20Waiting%20State%20Due%20To%20Evictions)]`

## Phase 37: ACI platform automatically terminates idle connect

### aks-315: ACI container connection times out and disconnects when idle for extended period...

**Root Cause**: ACI platform automatically terminates idle connections to container groups after a period of inactivity.

**Solution**:
After connecting to the container via az container exec or Portal, run "nohup tail -f /dev/null" to keep the connection alive. This ignores hangup signals. Use Ctrl+C to resume interactive control when needed.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FHow%20To%2FKeep%20a%20connection%20to%20container%20group%20alive)]`

## Phase 38: ACI billing is tied to the subscription deployment

### aks-329: ACI container instance continues to be billed after customer has stopped or dele...

**Root Cause**: ACI billing is tied to the subscription deployment lifecycle. If a subscription deployment is 'leaked' (not properly cleaned up in ACI backend), billing meters (BillingUsageDuration) continue to be emitted even after the container group is stopped/deleted. Multiple clusterIds emitting billing data indicates a leaked deployment.

**Solution**:
1) Use Kusto queries on accprod cluster (SubscriptionDeployments + BillingUsageEvents tables) to verify billing status and correlate deployment start/stop events with meter quantities; 2) Check for multiple clusterIds emitting billing data (indicates leaked deployment); 3) Have customer create a new container instance with the same resourceId in the same region to force ACI backend cleanup, then delete immediately; 4) For refund: extract billing table data (total core and memory charges) for the over-billed period and have CSS engineer contact Commerce team.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20ACI%20billing%20related%20issues)]`

## Phase 39: Network Container (NC) leak bug in Service Fabric 

### aks-333: ACI deployment to BYOVNET fails after 30-minute timeout with error: Subscription...

**Root Cause**: Network Container (NC) leak bug in Service Fabric infrastructure. Node reaches maximum NC capacity due to leaked NCs not being cleaned up, causing Failed to add NC error with node has reached maximum capacity message.

**Solution**:
1) Track caas-xxx name and correlation ID from subscription deployment query; 2) Check SF Execution cluster logs (SbzExecSFEvent) for Failed to add NC + has reached maximum capacity; 3) Retry deployment - a different node may succeed; 4) If persistent, escalate to PG via IcM for manual NC cleanup

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Container%20Group%20deployment%20hangs%20in%20Waiting%20status)]`

## Phase 40: IP leak bug in Atlas RP - RP does not release IPs 

### aks-334: ACI BYOVNET deployment fails with 30-minute timeout; SF logs show subnet capacit...

**Root Cause**: IP leak bug in Atlas RP - RP does not release IPs from its internal tracking table (DNC storage) when ACIs are deleted, causing subnet to be incorrectly marked full at Atlas level. Small CIDR subnets (/29) exacerbate the issue since only 3 usable IPs exist.

**Solution**:
1) Check SF Execution cluster logs for subnet capacity exceeded error; 2) Customer-side mitigation: expand subnet CIDR to at least /24; 3) Do not use small subnets (/29) to simulate fixed IP for private ACI; 4) Escalate to PG via IcM for manual IP release from DNC storage; PG bug: msazure/One/_workitems/edit/24499175

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Container%20Group%20deployment%20hangs%20in%20Waiting%20status)]`

## Phase 41: Service Fabric 使用 Ctrl+C 信号优雅关闭容器（exit code 7147），

### aks-335: ACI 容器间歇性重启，日志显示 Killing container 事件，exit code 7147

**Root Cause**: Service Fabric 使用 Ctrl+C 信号优雅关闭容器（exit code 7147），这是预期行为。但边缘场景下容器内存消耗超限也可能导致此退出码。

**Solution**:
1) 确认 exit code 7147 为 SF 优雅关闭（预期行为）；2) 使用 Kusto 查询验证容器 CPU/内存使用是否超限排除边缘场景；3) 查看 SF ExitReason 判断是否由用户操作（如重启 CG）触发；4) 通过 ARM 日志查询确认用户 restart action。参考 MS Learn: https://learn.microsoft.com/en-us/azure/service-fabric/service-fabric-diagnostics-code-package-errors

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Container%20killing%20event%20interruptions%20unexpected%20stops)]`

## Phase 42: Service Fabric 发送 Ctrl+C 后容器未及时响应，被强制终止（exit code 

### aks-336: ACI 容器被终止，exit code 7148，容器无响应

**Root Cause**: Service Fabric 发送 Ctrl+C 后容器未及时响应，被强制终止（exit code 7148）。通常由客户应用程序无响应导致。

**Solution**:
1) 确认 exit code 7148 表示容器未响应 Ctrl+C 被强制终止；2) 需与客户协作排查应用程序无响应的根因；3) 参考 MS Learn: https://learn.microsoft.com/en-us/azure/service-fabric/service-fabric-diagnostics-code-package-errors

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Container%20killing%20event%20interruptions%20unexpected%20stops)]`

## Phase 43: SF 重启会导致 Container Group IP 地址变更，这是 ACI 平台当前架构限制。

### aks-338: ACI 容器 Service Fabric 重启后 IP 地址发生变化

**Root Cause**: SF 重启会导致 Container Group IP 地址变更，这是 ACI 平台当前架构限制。

**Solution**:
短期方案：1) 使用 Application Gateway + backend pool 指向 ACI delegated subnet；2) 为 CG 配置 DNS 名称，通过 DNS 访问容器实例。长期方案：ACI 团队计划推出 Static IP 功能。

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Container%20killing%20event%20interruptions%20unexpected%20stops)]`

## Phase 44: Hit maximum number of Elastic SAN deployable per s

### aks-431: ACStor ElasticSan StoragePool creation fails; capacity-provisioner logs: Maximum...

**Root Cause**: Hit maximum number of Elastic SAN deployable per subscription per region

**Solution**:
Check Elastic SAN scale targets for the region; consider different region or subscription

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACStor%2FTSG%2FCreating%20Or%20Deleting%20StoragePools%20Issues)]`

## Phase 45: 非 SF 系统退出码表明客户应用程序自身存在问题导致异常退出。

### aks-337: ACI 容器异常退出，exit code 非 0（非 7147/7148）

**Root Cause**: 非 SF 系统退出码表明客户应用程序自身存在问题导致异常退出。

**Solution**:
1) 确认非 7147/7148 的退出码指向客户应用问题；2) 如客户使用 Microsoft SDK（如 .NET Framework），可联系 Dev POD 团队协助；3) 参考 SF 常见退出码文档。

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.0 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Container%20killing%20event%20interruptions%20unexpected%20stops)]`

## Phase 46: Gateway nodepool subnet too small. Requires minimu

### aks-851: Gateway nodepool cannot join kubeegressgateway LB backend pool. Controller logs:...

**Root Cause**: Gateway nodepool subnet too small. Requires minimum 9 IPs (2 primary + 2 secondary + 5 reserved), minimum subnet /28.

**Solution**:
Recreate egress nodepool in larger subnet (minimum /28). SGC and egress LB must also be recreated.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FOutbound%20Connectivity%2FTroubleshoot%20Static%20Egress%20Gateway%20Feature)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Cannot delete ACI subnet or VNet - error 'Subnet is in use by networkProfiles/ac... | ACI network profile created during container group deploymen... | Workaround 1: Portal → Resource Group → Show hidden types → ... | [G] 9.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FUnable%20to%20delete%20ACI%20Subnet%20or%20VNet%20Subnet%20is%20in%20use) |
| 2 | ACI container instance fails to start with DeploymentTimeout and mount error: Ex... | Firewall, NSG rules, or network configuration blocking acces... | Check firewall settings, NSGs, and network accessibility to ... | [G] 9.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACI/TSG/%5BTSG%5D%20ACI%20Container%20Instance%20Failing%20To%20Start%20because%20Mount%20Error) |
| 3 | Cannot delete ACI VNet or Subnet — error 'Subnet requires delegations [Microsoft... | ACI creates a Service Association Link (acisal) on the deleg... | 1) Verify all ACI deployments on the subnet are deleted usin... | [G] 9.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Cannot%20delete%20ACI%20Vnet%20or%20Subnet%20due%20to%20dangling%20Service%20Association%20Link) |
| 4 | 删除 ACI 容器组后，用相同 DNS 标签重建新容器组，FQDN 并未复用旧标签，DNS label reuse 不生效 | 重建容器组时未指定 DNS reuse policy；仅使用相同 DNS 标签不足以触发复用，必须同时在新容器组上明确指... | 在重建 ACI 容器组时，在 DNS label 设置的同时必须选择（或在 ARM/CLI 中指定）相同的 DNS Re... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FHow%20To%2FReusing%20DNS%20labels) |
| 5 | Customer receives Azure Service Health notification about ACI security vulnerabi... | CVE-2019-5736 and CVE-2018-1002102 vulnerabilities in Kubern... | Microsoft deployed fix Aug 31, 2021. Current ACI: (1) runs e... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACI/Emerging%20and%20Known%20Issues/ACI%20Vulnerability) |
| 6 | ACI container group stuck in 'Created' status with long image pull time | ACI does not cache images permanently. Large uncached images... | 1) Run `az container show --resource-group <RG> --name <CG>`... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FACI%20Long%20Image%20Pull%20times) |
| 7 | ACI Container Group fails to start with DeploymentTimeout and 'Existing volume m... | Firewall settings, NSGs, or network restrictions blocking co... | 1) Check firewall settings and NSGs to ensure Azure File sto... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20ACI%20Container%20Instance%20Failing%20To%20Start%20because%20Mount%20Error) |
| 8 | ACI container group gets new IP after restart, causing Application Gateway backe... | ACI does not provide static IP; container IP changes on ever... | Create Azure Automation runbook (PowerShell) comparing ACI I... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FHow%20To%2FAutomate%20Sync%20of%20ACI%20IP%20to%20backend%20pool%20of%20AppGw) |
| 9 | ACI deployment fails due to quota limits or need to verify ACI quota utilization... | ACI subscription quota (container groups, cores, GPU cores) ... | Check quota via Kusto: cluster(Accprod).database(accprod).Su... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FHow%20To%2FCheck%20ACI%20Quota%20for%20Subscription) |
| 10 | ACI container group needs fixed outbound IP address but Azure assigns different ... | By default ACI assigns a new public IP address each time the... | Deploy ACI with private networking in a VNet, then attach a ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FHow%20To%2FFixed%20IP%20Address%20for%20Outbound%20Connectivity%20in%20ACI%20through%20NAT%20Gateway) |
| 11 | ACI container group experiences intermittent restarts without errors in containe... | Platform maintenance events trigger RepairDeployments operat... | Use Kusto queries on accprod cluster (SubscriptionDeployment... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FContainer%20Group%20restart%20due%20to%20Platform%20events) |
| 12 | Cannot connect to ACI container from Azure Portal in BYOVNET deployment; error: ... | Firewall blocks TCP port 19390 which is required for portal ... | Allow ingress TCP port 19390 in firewall. Ensure all public ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Connect%20to%20Container%20requirements%20in%20BYOVNET) |
| 13 | Ghost ACI Container Groups still running after expected stop; Force Stop CG need... | Service Fabric fails to deactivate Code Package due to node ... | Open CRI/IcM. CSS identifies ghost container via Kusto Subsc... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACI/List%20of%20ACI%20issues%20where%20IcM%20is%20required) |
| 14 | ACI deployment fails with Insufficient Capacity error | Region capacity exhausted for ACI resources | Validate via ASI Insufficient Capacity detector and attempt ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACI/List%20of%20ACI%20issues%20where%20IcM%20is%20required) |
| 15 | ACI Container Group logs or metrics missing/gaps | Log uploader or Geneva Metric configuration issues | Validate via ASI Metrics tab (CG page) and Log Uploader Even... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACI/List%20of%20ACI%20issues%20where%20IcM%20is%20required) |
| 16 | ACI container group stuck in Created status for extended time due to long image ... | ACI does not cache images permanently. Large uncached images... | 1) Run az container show to check events timeline and confir... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FACI%20Long%20Image%20Pull%20times) |
| 17 | ACI container instance still being billed after stop or deletion; customer repor... | Leaked subscription deployment — the deployment index (Subsc... | 1) Verify the resource was actually stopped via Kusto. 2) Ha... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20ACI%20billing%20related%20issues) |
| 18 | ACI container group deployment to BYOVNET (private ACI) hangs in Waiting status ... | Known bug in Service Fabric infrastructure causing Network C... | Retry the deployment (leaked NCs are eventually cleaned up).... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACI/TSG/%5BTSG%5D%20Container%20Group%20deployment%20hangs%20in%20Waiting%20status) |
| 19 | ACI container group deployment to BYOVNET fails with 30-minute timeout. SF execu... | IP leak in Atlas RP — RP does not release IPs in DNC storage... | Customer-side: expand subnet CIDR to at least /24. Do not us... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACI/TSG/%5BTSG%5D%20Container%20Group%20deployment%20hangs%20in%20Waiting%20status) |
| 20 | ACI Portal memory metrics show lower values than expected — running 'free -h' in... | Azure Portal memory metric for Container Groups is an AVERAG... | 1) Explain to customer this is expected behavior — Portal me... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Memory%20usage%20inside%20container%20does%20not%20match%20values%20in%20Portal) |
| 21 | ACI memory usage in Azure Portal shows much lower values than 'free -h' inside t... | Azure Portal memory metric for ACI shows the average across ... | This is expected behavior. Add a dimension filter in Portal ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Memory%20usage%20inside%20container%20does%20not%20match%20values%20in%20Portal) |
| 22 | ACI 部署失败，返回 ServiceUnavailable (409)：'The requested resource is not available in... | 目标区域不支持所请求的资源配置（CPU/Memory/OS 组合），或客户部署到了不可用的区域，或使用了该区域不支持的功... | 1) 查看 Resource availability by region 文档确认区域支持；2) 调用 Locatio... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Service%20Unavailable%20Error) |
| 23 | ACI 部署在某区域持续返回 ServiceUnavailable (409)，尽管该区域文档上列为可用；该区域多个客户同时受影响 | 区域内 K8s 集群处于不健康状态或 scheduleEnabled=false 导致集群被禁用，无可用容量。可能因 K... | 1) 使用 ClusterHealth Kusto 查询按 location 过滤，检查 scheduleEnabled... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Service%20Unavailable%20Error) |
| 24 | ACI container logs not appearing in Log Analytics Workspace — ContainerInstanceL... | Three possible causes: 1) Invalid or expired Log Analytics W... | 1) Verify LA Workspace key validity. 2) If AMPLS is used, en... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Unable%20to%20send%20ACI%20logs%20to%20Log%20Analytics%20Workspace) |
| 25 | ACI deployment fails with 'ServiceUnavailable (409)' — 'The requested resource i... | Multiple possible causes: 1) Customer deploying to region/fe... | 1) Verify region availability at https://docs.microsoft.com/... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Service%20Unavailable%20Error) |
| 26 | AKS cluster delete fails with ResourceGroupDeletionBlocked and inner error Netwo... | ACI network profile with vk- prefix (Virtual Nodes) still ha... | No customer-ready mitigation. Escalate via IcM to Support/EE... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FDelete%2FCluster%20delete%20with%20NetworkProfileAlreadyInUseWithContainerNics) |
| 27 | AKS cluster delete fails with ResourceGroupDeletionBlocked/NetworkProfileAlready... | ACI network profile container NICs not cleaned up properly a... | No customer-ready mitigation. Escalate via IcM to Support / ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FDelete%2FCluster%20delete%20with%20NetworkProfileAlreadyInUseWithContainerNics) |
| 28 | AKS cluster delete fails with ResourceGroupDeletionBlocked, inner error NetworkP... | ACI container NICs remain bound to the Virtual Kubelet netwo... | No customer-ready mitigation. Escalate via ICM to 'Support /... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Delete/Cluster%20delete%20with%20NetworkProfileAlreadyInUseWithContainerNics) |
| 29 | AKS virtual node 创建失败: error creating provider: error setting up network: unable... | ACI (virtual node) 子网不支持 User-Defined Routing (UDR)。aci-conn... | 从 ACI virtual node 使用的子网中移除 User-Defined Routing (路由表)。ACI 服... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2Ferror%20setting%20up%20network%20-%20AKS%20virtual%20node) |
| 30 | ACI Spot container group evicted unexpectedly | Spot containers run on unused Azure capacity with eviction p... | Design workloads with checkpoint/resume logic to handle evic... | [B] 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FACI%20Spot%20Containers) |
| 31 | ACI SubscriptionDeploymentUnhealthy error during Atlas deployment | TriggerEvictions caused by cluster upgrading or unhealthy cl... | Query SubscriptionDeployments table in accprod cluster to fi... | [B] 6.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20SubscriptionDeploymentUnhealthy%20(Atlas%20deployment)) |
| 32 | Customer was facing issue while deploying Google Kubernetes Engine Kubernetes cl... | Google Kubernetes Engine cluster with Auto-Pilot mode is not... | Issue was fixed after deploying Google Kubernetes Engine k8s... | [B] 6.5 | [ContentIdea#180136](https://support.microsoft.com/kb/5030818) |
| 33 | Virtual-node-aci-linux pod deployment stays in Pending state; pod logs show reso... | ACI virtual node integration issue where the container group... | Verify ACI provider is registered (az provider register --na... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 34 | ACI 后端执行日志无法通过 correlation ID 查找到 | ACI 执行集群日志（execution cluster log）不存储 correlation ID，只能通过 Clu... | 1) 通过 Kusto Helper (https://portal.microsoftgeneva.com/dashb... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/pages?path=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FACI%20Terminologies%20for%20Troubleshooting) |
| 35 | ASI (Azure Service Insights) 中搜索新创建的 ACI 资源时提示 Not Found | ASI 数据源是 Kusto，新创建的资源需要至少 15 分钟的数据摄入时间才能在 ASI 中可见。 | 等待至少 15 分钟后再在 ASI 中搜索新创建的 ACI 资源。ASI 地址：https://azureservice... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/pages?path=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FACI%20Troubleshooting%20with%20ASI) |
| 36 | ASI 中无法找到超过一定时间的 ACI 历史数据 | ACI ASI 主数据表 SubscriptionDeployments 保留期为 120 天，超过该时间的历史数据将不... | 1) 在 ASI 搜索时确保时间范围在 120 天内；2) 如需查询超过 120 天的历史数据，需通过其他途径（如归档存... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/pages?path=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FACI%20Troubleshooting%20with%20ASI) |
| 37 | ACI Spot container group enters 'Waiting' state after having been in 'Running' s... | The underlying Spot VM hosting the container group was evict... | This is expected behavior for Spot containers. Use the Spot ... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACI/TSG/%5BTSG%5D%20ACI%20Spot%20Containers%20Waiting%20State%20Due%20To%20Evictions) |
| 38 | ACI container connection times out and disconnects when idle for extended period... | ACI platform automatically terminates idle connections to co... | After connecting to the container via az container exec or P... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FHow%20To%2FKeep%20a%20connection%20to%20container%20group%20alive) |
| 39 | ACI container instance continues to be billed after customer has stopped or dele... | ACI billing is tied to the subscription deployment lifecycle... | 1) Use Kusto queries on accprod cluster (SubscriptionDeploym... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20ACI%20billing%20related%20issues) |
| 40 | ACI deployment to BYOVNET fails after 30-minute timeout with error: Subscription... | Network Container (NC) leak bug in Service Fabric infrastruc... | 1) Track caas-xxx name and correlation ID from subscription ... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Container%20Group%20deployment%20hangs%20in%20Waiting%20status) |
| 41 | ACI BYOVNET deployment fails with 30-minute timeout; SF logs show subnet capacit... | IP leak bug in Atlas RP - RP does not release IPs from its i... | 1) Check SF Execution cluster logs for subnet capacity excee... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Container%20Group%20deployment%20hangs%20in%20Waiting%20status) |
| 42 | ACI 容器间歇性重启，日志显示 Killing container 事件，exit code 7147 | Service Fabric 使用 Ctrl+C 信号优雅关闭容器（exit code 7147），这是预期行为。但边缘... | 1) 确认 exit code 7147 为 SF 优雅关闭（预期行为）；2) 使用 Kusto 查询验证容器 CPU/... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Container%20killing%20event%20interruptions%20unexpected%20stops) |
| 43 | ACI 容器被终止，exit code 7148，容器无响应 | Service Fabric 发送 Ctrl+C 后容器未及时响应，被强制终止（exit code 7148）。通常由客... | 1) 确认 exit code 7148 表示容器未响应 Ctrl+C 被强制终止；2) 需与客户协作排查应用程序无响应... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Container%20killing%20event%20interruptions%20unexpected%20stops) |
| 44 | ACI 容器 Service Fabric 重启后 IP 地址发生变化 | SF 重启会导致 Container Group IP 地址变更，这是 ACI 平台当前架构限制。 | 短期方案：1) 使用 Application Gateway + backend pool 指向 ACI delegat... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Container%20killing%20event%20interruptions%20unexpected%20stops) |
| 45 | ACStor ElasticSan StoragePool creation fails; capacity-provisioner logs: Maximum... | Hit maximum number of Elastic SAN deployable per subscriptio... | Check Elastic SAN scale targets for the region; consider dif... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACStor%2FTSG%2FCreating%20Or%20Deleting%20StoragePools%20Issues) |
| 46 | ACI 容器异常退出，exit code 非 0（非 7147/7148） | 非 SF 系统退出码表明客户应用程序自身存在问题导致异常退出。 | 1) 确认非 7147/7148 的退出码指向客户应用问题；2) 如客户使用 Microsoft SDK（如 .NET ... | [B] 5.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Container%20killing%20event%20interruptions%20unexpected%20stops) |
| 47 | Gateway nodepool cannot join kubeegressgateway LB backend pool. Controller logs:... | Gateway nodepool subnet too small. Requires minimum 9 IPs (2... | Recreate egress nodepool in larger subnet (minimum /28). SGC... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FOutbound%20Connectivity%2FTroubleshoot%20Static%20Egress%20Gateway%20Feature) |
