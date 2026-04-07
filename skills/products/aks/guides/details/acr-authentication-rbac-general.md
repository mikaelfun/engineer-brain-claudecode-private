# AKS ACR 认证与 RBAC — general -- Comprehensive Troubleshooting Guide

**Entries**: 42 | **Draft sources**: 2 | **Kusto queries**: 0
**Source drafts**: ado-wiki-acr-connectivity-with-token.md, ado-wiki-b-acr-audit-logs.md
**Generated**: 2026-04-07

---

## Phase 1: Azure portal does not show ACR configuration chang

### aks-350: Customer needs to know what configuration flags were changed in their Azure Cont...

**Root Cause**: Azure portal does not show ACR configuration change history by default; Microsoft.ChangeAnalysis resource provider must be registered

**Solution**:
1) Register 'Microsoft.ChangeAnalysis' resource provider on the subscription; 2) Open 'Change Analysis' service in Azure portal; 3) Select Resource Group and Registry to see changes and who initiated them; 4) For detailed property diff, go to Activity Logs → select the operation → 'Change History (Preview)' to see previous vs new values. Note: this is different from ACR audit logs.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Change%20Analysis)]`

## Phase 2: Various environment issues: old Docker version not

### aks-351: Need to verify ACR environment health and connectivity; az acr check-health repo...

**Root Cause**: Various environment issues: old Docker version not conforming to OCI spec, DNS resolution failure to ACR data endpoint, outdated Azure CLI or Helm versions

**Solution**:
Run 'az acr check-health' which verifies: 1) Docker installed and version is OCI-compliant; 2) Can pull from MCR (docker pull); 3) Azure CLI version is current; 4) DNS connectivity to <registry>.azurecr.io data endpoint and token retrieval; 5) Helm is installed and above minimum version. Address each reported check failure individually.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Health-Check%20Command%20Background)]`

## Phase 3: Locks set at multiple levels (Repository, Image by

### aks-353: Unable to delete ACR repositories or images after adding resource locks (Delete/...

**Root Cause**: Locks set at multiple levels (Repository, Image by Tag, Image by Digest) prevent deletion even when user intends to remove only one level; tag and digest lock interactions are confusing

**Solution**:
Use az acr repository update to enable --delete-enabled true and --write-enabled true at all three levels (repository, image by tag, image by digest) before attempting deletion. Scripts provided in wiki to batch-unlock all images.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FEnable%20image%20and%20repository%20deletion%20with%20ACR%20locks)]`

## Phase 4: Firewall rules do not allow required MCR FQDNs (RE

### aks-355: Cannot pull images from Microsoft Container Registry (MCR) when behind a firewal...

**Root Cause**: Firewall rules do not allow required MCR FQDNs (REST endpoint and data endpoint)

**Solution**:
Configure firewall to allow: mcr.microsoft.com (REST, https) and *.data.mcr.microsoft.com (data, https). Legacy *.cdn.mscr.io endpoint deprecated since March 2020.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FMicrosoft%20Container%20Registry%20(MCR)%20Client%20Firewall%20Rules%20Configuration)]`

## Phase 5: When ARM authentication is disabled on ACR, the re

### aks-357: ACR authentication fails with 401 Unauthorized or 403 Forbidden after disabling ...

**Root Cause**: When ARM authentication is disabled on ACR, the registry rejects ARM-scoped Microsoft Entra tokens (default az login behavior). Automation using default az login without explicit ACR scope will fail. This is working-as-designed behavior, not a connectivity or DNS issue.

**Solution**:
Update authentication to use ACR-scoped token: az login --scope https://containerregistry.azure.net/.default, then az acr login -n <registry>. Check registry config with: az acr config authentication-as-arm show -r <registry>. If needed, re-enable ARM auth: az acr config authentication-as-arm update -r <registry> --status enabled.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Authentication%20disable%20authentication%20as%20arm)]`

## Phase 6: Name Reservation Service (NRS) reserves deleted re

### aks-358: ACR registry name unavailable (CheckNameAvailability returns alreadyExists) afte...

**Root Cause**: Name Reservation Service (NRS) reserves deleted registry names for 30-180 days (or indefinitely for internal subscriptions) to prevent DNS sniping. Reservation period depends on quotaId: Internal=infinite, Enterprise/CSP=180 days, others=30 days.

**Solution**:
1) Verify name is reserved via RPActivity Kusto query (TaskName=NameReservationServiceManagement). 2) If reason is NameNotAvailable_NotAllowedByPolicy, run ACIS action "Force Delete Registry name from Name Reservation Service" with subscription and tenant IDs from logs. 3) Wait up to 1 hour (usually clears in minutes) and retry. 4) If ACIS action fails, submit ICM to "Azure DNS Name Reservation" team.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20DNS%20And%20Name%20Reservation)]`

## Phase 7: Azure quarantine policy was auto-enabled when the 

### aks-363: ACR image push succeeds without error but the pushed image/chart has no content ...

**Root Cause**: Azure quarantine policy was auto-enabled when the customer enabled Microsoft Defender for Cloud (Defender for container registries). The quarantine feature blocks content from being visible until it passes scanning, causing pushed artifacts to appear empty.

**Solution**:
Disable the quarantine policy on the ACR: 1) Get registry ID: id=$(az acr show --name <registry-name> --query id -o tsv). 2) Disable quarantine: az resource update --ids $id --set properties.policies.quarantinePolicy.status=disabled

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Push%20Failure%20no%20content)]`

## Phase 8: ACR has temporarily paused ACR Tasks for subscript

### aks-364: ACR Tasks fail with error 'ACR Tasks requests for the registry are not supported...

**Root Cause**: ACR has temporarily paused ACR Tasks for subscriptions using Azure trial/free credits (including $200 USD free credits, Azure for Students, etc.) as part of credit reorganization.

**Solution**:
Advise customer to upgrade to a paid subscription. For formal requests where free-credit customers need access, create an ICM with ACR PG including: 1) What workloads they run on ACR Tasks, 2) Expected usage/load. ACR PG will review and may grant access.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Tasks%20Temporary%20Pause)]`

## Phase 9: Microsoft.ContainerRegistry resource provider is n

### aks-366: Unable to add VNET/Subnet to ACR Firewall across subscriptions - newly added cro...

**Root Cause**: Microsoft.ContainerRegistry resource provider is not registered in the second subscription where the VNET/SUBNET resides

**Solution**:
Register Microsoft.ContainerRegistry resource provider in the second subscription: az provider register --namespace Microsoft.ContainerRegistry, then re-add the VNET/Subnet via Portal or CLI

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Virtual%20Network%20%26%20Firewall%20Configuration%20Cross%20Subscription)]`

## Phase 10: ACR webhooks under spoke model do not work across 

### aks-367: ACR webhook fails to push to App Service with status code 500 InternalServerErro...

**Root Cause**: ACR webhooks under spoke model do not work across subscriptions. ACR cannot make outbound calls through a VNET to the Kudu endpoint (webhook endpoint) in an ILB ASE environment

**Solution**:
Use Azure DevOps pipelines instead of ACR webhooks for cross-subscription or ILB ASE scenarios. Ensure ACR and App Service are in the same subscription and the Kudu site is publicly accessible

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Webhook%20fails%20to%20push%20to%20App%20Service)]`

## Phase 11: ACR retention policy does not support MediaType v1

### aks-374: ACR retention policy for untagged manifests does not delete untagged images; ret...

**Root Cause**: ACR retention policy does not support MediaType v1 manifests (application/vnd.docker.distribution.manifest.v1) or OCI image indexes (application/vnd.oci.image.index.v1+json); az acr import also pushes using unsupported media type

**Solution**:
Ensure Docker/BuildKit is up-to-date to push v2 manifests; avoid using az acr import for images that need retention cleanup as it pushes OCI index media type; manually purge v1/OCI index manifests via az acr repository delete

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20retention%20policy%20for%20untagged%20manifests%20does%20not%20work%20as%20expected)]`

## Phase 12: Azure Portal caching logic retains deleted reposit

### aks-375: Deleting repositories from ACR via Azure Portal returns NAME_UNKNOWN error, or C...

**Root Cause**: Azure Portal caching logic retains deleted repository links until cache expires; also image locks can block delete operations from succeeding

**Solution**:
Wait for Portal cache to refresh. If delete silently failed, escalate to ACR PG to run Geneva Action to resync ARM metadata. Check for image locks via az acr repository show.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20unable%20to%20delete%20repository)]`

## Phase 13: Untagging only removes tag reference; underlying i

### aks-376: Untagged images in ACR still showing as vulnerable in Microsoft Defender for Clo...

**Root Cause**: Untagging only removes tag reference; underlying image manifest and layers remain in registry. Defender scans all manifests including untagged ones.

**Solution**:
Purge untagged manifests using 'az acr run' with acr purge command (--untagged --ago 1d), or enable ACR retention policy to auto-delete untagged manifests. Use 'az acr manifest list-metadata --query [?tags==null].digest' to list untagged images.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20untagged%20images%20showing%20in%20defender)]`

## Phase 14: Portal uses ARM deployment to create webhooks, req

### aks-377: ACR webhook creation fails with 'You do not have access for this operation, plea...

**Root Cause**: Portal uses ARM deployment to create webhooks, requiring subscription-level Microsoft.Resources/deployments/* permissions beyond ACR Owner role

**Solution**:
Create custom RBAC role with Microsoft.Resources/deployments/read,write,validate/action,operations/read and Microsoft.Resources/subscriptions/resourceGroups/read permissions at subscription level, then assign to user alongside ACR Owner role

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20webhook%20creation%20permission%20issue)]`

## Phase 15: Cache Rule 名称不符合命名规范（需5-50字符，仅字母数字和连字符）。

### aks-380: ACR 创建 Cache Rule 时报错 Resource names must contain alphanumeric characters and mu...

**Root Cause**: Cache Rule 名称不符合命名规范（需5-50字符，仅字母数字和连字符）。

**Solution**:
使用符合规范的名称：5-50字符，仅包含字母、数字和连字符。

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FCaching)]`

## Phase 16: 客户尝试从不受支持的上游注册表拉取镜像，ACR Caching 仅支持特定的上游注册表。

### aks-381: ACR Cache Rule 拉取镜像时报错 Unsupported upstream or login server provided

**Root Cause**: 客户尝试从不受支持的上游注册表拉取镜像，ACR Caching 仅支持特定的上游注册表。

**Solution**:
仅使用受支持的上游注册表（如 docker.io、mcr.microsoft.com）。参考文档: https://learn.microsoft.com/en-us/azure/container-registry/artifact-cache-overview#upstream-support

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FCaching)]`

## Phase 17: ACR 的服务主体/托管标识未被授予 Key Vault 的 secrets get 权限，导致无法

### aks-382: ACR Caching 使用 Credential Set 时报错 does not have secrets get permission on key va...

**Root Cause**: ACR 的服务主体/托管标识未被授予 Key Vault 的 secrets get 权限，导致无法读取 Credential Set 中的凭据。

**Solution**:
运行 az keyvault set-policy --name <vaultName> --object-id <acrObjectId> --secret-permissions get 为 ACR 分配 Key Vault 访问策略。参考: https://learn.microsoft.com/en-us/azure/key-vault/general/assign-access-policy

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FCaching)]`

## Phase 18: ACR 注册表已达到 Cache Rule 数量上限（Standard SKU 限制为 1000 条

### aks-383: ACR 创建 Cache Rule 时报错 Quota exceeded for resource type cacheRules

**Root Cause**: ACR 注册表已达到 Cache Rule 数量上限（Standard SKU 限制为 1000 条）。错误消息提示升级 SKU 可解决，但实际上升级 SKU 不会增加限制。

**Solution**:
删除不需要的 Cache Rule 以腾出配额。注意：升级 SKU 不会增加 Cache Rule 上限。

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FCaching)]`

## Phase 19: Known Container Apps bug where ACR registry names 

### aks-388: Container Apps creation fails with ContainerAppOperationError 'Failed to provisi...

**Root Cause**: Known Container Apps bug where ACR registry names exceeding ~30 characters cause provisioning timeout during container app creation

**Solution**:
Use an ACR registry with a shorter name (under 30 characters) to create the Container App

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=/Azure Kubernetes Service Wiki/ACR/TSG/ContainersApps Creation failure due to ACR name too long)]`

## Phase 20: CSSC workflows are not supported on repositories c

### aks-389: ACR Continuous Patching cssc-patch-image task fails at push-image step with cach...

**Root Cause**: CSSC workflows are not supported on repositories containing PTC-based cache rules

**Solution**:
Switch to Artifact sync based cache rules, or use the CSSC workflow on a different repository that does not contain PTC based cache rules

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=/Azure Kubernetes Service Wiki/ACR/TSG/Continuous Patching)]`

## Phase 21: Known bug in ContainerApps that cannot handle ACR 

### aks-390: Container Apps creation fails after 15-20 minutes with ContainerAppOperationErro...

**Root Cause**: Known bug in ContainerApps that cannot handle ACR registry names exceeding ~30 characters. The long name causes an internal timeout during provisioning.

**Solution**:
Use a shorter ACR registry name (under 30 characters) for ContainerApps deployment.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FContainersApps%20Creation%20failure%20due%20to%20ACR%20name%20too%20long)]`

## Phase 22: CSSC (Continuous Security Supply Chain) workflows 

### aks-391: ACR Continuous Patching cssc-patch-image task fails at push-image step with cach...

**Root Cause**: CSSC (Continuous Security Supply Chain) workflows are not supported on repositories containing PTC (Pull-Through Cache) based rules.

**Solution**:
Switch to Artifact sync based cache rules, or use CSSC workflow on a different repository that does not contain PTC-based rules.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FContinuous%20Patching)]`

## Phase 23: The tooling image that Copacetic (Copa) uses for p

### aks-392: ACR Continuous Patching cssc-patch-image task fails with image "not found" in MC...

**Root Cause**: The tooling image that Copacetic (Copa) uses for patching is not available/published in MCR (Microsoft Container Registry).

**Solution**:
Contact upstream team (azcu-publishing@microsoft.com) or raise a PR to pull the missing tooling image to MCR. Example PR: https://github.com/microsoft/mcr/pull/3914

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FContinuous%20Patching)]`

## Phase 24: Azure Storage front-end nodes can enter a half-up 

### aks-395: Intermittent 502 Bad Gateway or 'connection reset by peer' errors during ACR pus...

**Root Cause**: Azure Storage front-end nodes can enter a half-up state where the load balancer routes requests to nodes that appear healthy but are actually down, causing 502 responses and connection resets during layer downloads via 307 redirect

**Solution**:
Retry the push/pull request. Use Kusto query on cluster('acr.kusto.windows.net').database('acrprod').RegistryActivity to confirm 502 errors with timestamps. Azure Storage PG has optimized reboot logic to reduce incidence. Long-term fix deployed to Azure Storage infrastructure.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=/Azure Kubernetes Service Wiki/ACR/TSG/Intermittent 502 responses from ACR)]`

## Phase 25: 客户端侧网络连接差、CPU 慢或磁盘 I/O 慢，导致从 Azure Blob Storage 下载

### aks-408: ACR 拉取镜像缓慢，AzureBlobServerLatency 低但 EndToEndLatency 高、MegabytePerSecond 低

**Root Cause**: 客户端侧网络连接差、CPU 慢或磁盘 I/O 慢，导致从 Azure Blob Storage 下载层数据的端到端延迟高。

**Solution**:
1) 通过 StorageAccountLogs 查询确认 AzureBlobServerLatencyInSecond 小但 EndToEndLatencyInSecond 大；2) 让客户运行 https://azurespeed.com 速度测试；3) 如确认网络慢，建议切换到更大或计算优化的 VM SKU，或排查客户端到 ACR 的网络路径。

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FSlow%20pull%20and%20push%20performance)]`

## Phase 26: ACR 内部服务端问题，registry frontend 或 data proxy 处理推送请求延

### aks-409: ACR 推送镜像缓慢，PUT manifest 或 HEAD/POST/PUT blob 请求耗时超过 2 分钟

**Root Cause**: ACR 内部服务端问题，registry frontend 或 data proxy 处理推送请求延迟异常。

**Solution**:
通过 RegistryActivity 查询推送相关请求（PUT manifest、HEAD/POST/PUT blob）的 ACRResponseDurationInSecond；如超过 2 分钟且非 PATCH blob，属于 ACR 内部问题，需向 ACR PG 开 ICM。

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FSlow%20pull%20and%20push%20performance)]`

## Phase 27: ACR 后端 Azure Blob Storage 性能问题，ACR 到 Blob Storage 

### aks-410: ACR 推送镜像缓慢，PATCH blob 操作慢，StorageAccountLogs 显示 Blob Storage 侧延迟高

**Root Cause**: ACR 后端 Azure Blob Storage 性能问题，ACR 到 Blob Storage 之间的上传延迟高。

**Solution**:
1) 从 RegistryActivity 取慢 PATCH 操作的 correlationid；2) 在 StorageAccountLogs 用 ClientRequestId 匹配查询 Blob Storage 延迟；3) 如 AzureBlobServerLatencyInSecond 高，联系 ACR PG 开 ICM（由 ACR PG 转给 Storage 团队）。

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FSlow%20pull%20and%20push%20performance)]`

## Phase 28: 客户端侧网络问题，客户端到 ACR data proxy 的上传速度慢。

### aks-411: ACR 推送镜像缓慢，PATCH blob 操作慢但 Blob Storage 侧延迟正常

**Root Cause**: 客户端侧网络问题，客户端到 ACR data proxy 的上传速度慢。

**Solution**:
1) 确认 StorageAccountLogs 中 Blob Storage 延迟正常；2) 让客户运行 https://azurespeed.com 速度测试；3) 如网络慢，建议更换 VM SKU（计算优化型）或排查客户端网络路径。

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FSlow%20pull%20and%20push%20performance)]`

## Phase 29: The ACR indexing service failed to update the Regi

### aks-422: ACR registry size (RegistrySize table entry) not updated correctly after indexin...

**Root Cause**: The ACR indexing service failed to update the RegistrySize entry, causing incorrect storage usage reporting.

**Solution**:
Use Jarvis action "Recalculate registry size and update registry size entry" under Azure Container Registry > User Registry Management. Set Confirm=true to update. If conflict error "Encountered conflict when updating RegistrySize table", retry the operation. Note: currently only recalculates acr.docker storage (not acr.artifact).

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FPlatform%20and%20Tooling%2FTools%2FJarvis%2FACR%20Jarvis%20Actions%20New)]`

## Phase 30: ACR storage usage has exceeded the default 20TB st

### aks-425: Cannot push images to ACR - registry has reached the 20TB storage limit

**Root Cause**: ACR storage usage has exceeded the default 20TB storage limit across all service tiers (Basic/Standard/Premium)

**Solution**:
Contact ACR PG to increase the storage limit beyond 20TB. Customer will pay per-GB rate for added storage. Check current usage via "az acr show-usage" or portal Monitoring tab. Check current limit via Kusto query on RegistryMasterData SizeThresholdInTiB.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FPlatform%20and%20Tooling%2FTools%2FJarvis%2FACR%20Technical%20Advisors%20Actions)]`

## Phase 31: ACR enforces per-layer size limits by SKU: Standar

### aks-480: Pushing large container images to ACR fails due to image layer size limits

**Root Cause**: ACR enforces per-layer size limits by SKU: Standard SKU has 20 GB layer limit, Premium SKU has 50 GB layer limit.

**Solution**:
Verify the image layer sizes do not exceed the SKU limits. If needed, upgrade to Premium SKU (50 GB limit) or split large layers into smaller ones.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACR)]`

## Phase 32: When pushing with the same tag, the previous manif

### aks-481: CI/CD pushes images with same name and tag to ACR, previous manifests become unt...

**Root Cause**: When pushing with the same tag, the previous manifest loses its tag and becomes orphan. ACR does not automatically purge orphan manifests (Auto-Purge feature was on roadmap).

**Solution**:
List untagged manifests: az acr repository show-manifests -n <registry> --repository <repo> --query '[?!tags[0]].digest' -o tsv. Delete each: az acr repository delete -n <registry> --image <repo>@sha256:<digest>. Consider enabling retention policy for untagged manifests.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACR)]`

## Phase 33: Known browser compatibility issue: Internet Explor

### aks-482: Unable to see all repositories in ACR using Azure Portal when registry has more ...

**Root Cause**: Known browser compatibility issue: Internet Explorer and Edge (legacy) only render up to 100 repositories in the Portal UI.

**Solution**:
Use Chrome browser to list all repositories beyond 100. Alternatively, use CLI: az acr repository list -n <registry>

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACR)]`

## Phase 34: This occurs on Classic Registry SKU when the custo

### aks-483: Pulling images from ACR fails with error: 'Error response from daemon: unknown: ...

**Root Cause**: This occurs on Classic Registry SKU when the customer has regenerated the storage account keys associated with the ACR. The registry still references the old keys.

**Solution**:
Update the storage keys in ACR using: az acr update -n <registry> --tags key1=value1 key2=value2. Note: Classic SKU is deprecated; recommend migrating to managed SKU (Basic/Standard/Premium).

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACR)]`

## Phase 35: Incorrect CLI syntax: the -n parameter expects the

### aks-485: Unable to login to ACR using CLI command 'az acr login -n acrname.azurecr.io' - ...

**Root Cause**: Incorrect CLI syntax: the -n parameter expects the registry name only (e.g., 'myacr'), not the full FQDN (e.g., 'myacr.azurecr.io'). May also be in wrong subscription context.

**Solution**:
Use registry name only: az acr login -n myacr (not myacr.azurecr.io). Verify correct subscription: az account set --subscription <subscription_name>

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACR)]`

## Phase 36: Azure Container Registry has a 40 TiB storage limi

### aks-533: ACR push/pull fails with error: unknown: The operation is disallowed on this reg...

**Root Cause**: Azure Container Registry has a 40 TiB storage limit per registry. Internal hard limit is 60 TB. Registries exceeding 60 TB cannot create new geo-replications

**Solution**:
1) Verify storage trend via az acr show-usage, 2) Open ICM to ACR PG requesting limit increase (include sub ID, registry name, desired size), 3) Advise customer: set metric alerts, delete unused images, create retention policy for untagged manifests, enable auto-purge. Caveats: SLA may not apply above 40 TiB; limit cannot be reduced once increased; max 60 TB with PG approval

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Storage%20Limit%20Increase)]`

## Phase 37: ACR does not support self-service recovery. Recove

### aks-019: Customer accidentally deleted Azure Container Registry or image manifests and ne...

**Root Cause**: ACR does not support self-service recovery. Recovery requires ACR PG intervention and is only possible within ~30 days of deletion.

**Solution**:
1) Customer recreates ACR with identical subscription/RG/name/SKU/location, geo-replication disabled. 2) Collect: ACR resource ID, location, registry name, image manifest SHA. 3) Submit IcM to ACR/Triage: https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=01n102. 4) Recovery is Seattle-hours only; no SLA. 5) Recover images one at a time. 6) Auth credentials cannot be restored.

`[Score: [B] 6.5 | Source: [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.1]]`

## Phase 38: Known bug in docker-compose 1.17.1 on Ubuntu 18.04

### aks-059: az acr login fails with Error saving credentials: Cannot autolaunch D-Bus withou...

**Root Cause**: Known bug in docker-compose 1.17.1 on Ubuntu 18.04 that interferes with Docker credential storage. GitHub issue: docker/compose#6023.

**Solution**:
Remove docker-compose: apt remove docker-compose -y && apt autoremove.

`[Score: [B] 5.5 | Source: [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.4]]`

### aks-287: az acr login or docker login fails on Ubuntu 18.04 with error: Error saving cred...

**Root Cause**: Known bug in docker-compose 1.17.1 on Ubuntu 18.04. The package installs a credential helper requiring X11/D-Bus which is unavailable in headless/SSH sessions. Tracked at github.com/docker/compose/issues/6023

**Solution**:
Remove docker-compose: apt remove docker-compose -y && apt autoremove. After removal, docker login / az acr login works normally. Alternatively upgrade docker-compose to a newer version.

`[Score: [B] 5.0 | Source: [onenote: MCVKB/wiki_migration/======VM&SCIM======]]`

## Phase 39: ARM audience token authentication (authentication-

### aks-396: Microsoft Defender for Cloud fails to scan ACR images with error 'The container ...

**Root Cause**: ARM audience token authentication (authentication-as-arm) is disabled on the ACR, preventing Defender for Cloud from authenticating to the registry for vulnerability scanning. This is by design - Defender relies on ARM audience tokens.

**Solution**:
Enable ARM audience token authentication: az acr config authentication-as-arm update -r <acr> --status enabled. If blocked by Azure Policy ('Container registries should disable authentication with ARM audience tokens'), exempt the ACR from the policy or disable the policy assignment.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=/Azure Kubernetes Service Wiki/ACR/TSG/Microsoft Defender for cloud doesnt scan images in ACR)]`

## Phase 40: Kubelet identity on AKS cluster was changed but th

### aks-857: Pod stuck in ImagePullBackOff with '401 Unauthorized' when pulling images from A...

**Root Cause**: Kubelet identity on AKS cluster was changed but the new identity was not properly assigned to the VMSS. IMDS returns 'Identity not found' (400 Bad Request) when kubelet tries to acquire token, causing ACR authentication failure.

**Solution**:
Ensure the Kubelet identity assigned to AKS cluster matches the identity on the underlying VMSS. Reconcile with 'az aks update' or manually assign the correct managed identity to the VMSS. Verify by checking IMDS response for the kubelet identity client ID.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FOthers%2FImagePullBackOff%20401%20Unauthorized)]`

## Phase 41: AKS does not natively report which pods/containers

### aks-281: Need to identify which AKS workloads depend on Docker Hub (docker.io) public ima...

**Root Cause**: AKS does not natively report which pods/containers pull from public registries. Without Azure Monitor container insights enabled, there is no visibility into image repository sources. GitOps (Flux) is not officially available in Mooncake via Azure Arc, requiring manual Flux bootstrap.

**Solution**:
1) Enable Azure Monitor container insights on AKS cluster. 2) Use Log Analytics query: ContainerInventory | where _ResourceId contains '<cluster>' | summarize arg_max(TimeGenerated, ContainerState, Repository, Image, ImageTag) by ImageID — empty Repository field means docker.io. 3) Use workbook to visualize public registry usage (sample: https://raw.githubusercontent.com/simonxin/cluster-config/main/scripts/aksimageview.json). 4) Control monitoring costs by setting collection_settings.stdout/stderr to false in container-azm-ms-agentconfig.yaml. 5) For migration: bootstrap Flux manually via 'flux bootstrap git --url=ssh://git@github.com/<repo> --branch=main --path=clusters/<name> --private-key-file <key>'. 6) Use flux create source git + flux create kustomization to track workloads, then update image references from docker.io to ACR. Ref: https://fluxcd.io/docs/components/source/

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [Y] 3.0 | Source: [onenote: MCVKB/wiki_migration/======VM&SCIM======]]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Customer needs to know what configuration flags were changed in their Azure Cont... | Azure portal does not show ACR configuration change history ... | 1) Register 'Microsoft.ChangeAnalysis' resource provider on ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Change%20Analysis) |
| 2 | Need to verify ACR environment health and connectivity; az acr check-health repo... | Various environment issues: old Docker version not conformin... | Run 'az acr check-health' which verifies: 1) Docker installe... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Health-Check%20Command%20Background) |
| 3 | Unable to delete ACR repositories or images after adding resource locks (Delete/... | Locks set at multiple levels (Repository, Image by Tag, Imag... | Use az acr repository update to enable --delete-enabled true... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FEnable%20image%20and%20repository%20deletion%20with%20ACR%20locks) |
| 4 | Cannot pull images from Microsoft Container Registry (MCR) when behind a firewal... | Firewall rules do not allow required MCR FQDNs (REST endpoin... | Configure firewall to allow: mcr.microsoft.com (REST, https)... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FMicrosoft%20Container%20Registry%20(MCR)%20Client%20Firewall%20Rules%20Configuration) |
| 5 | ACR authentication fails with 401 Unauthorized or 403 Forbidden after disabling ... | When ARM authentication is disabled on ACR, the registry rej... | Update authentication to use ACR-scoped token: az login --sc... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Authentication%20disable%20authentication%20as%20arm) |
| 6 | ACR registry name unavailable (CheckNameAvailability returns alreadyExists) afte... | Name Reservation Service (NRS) reserves deleted registry nam... | 1) Verify name is reserved via RPActivity Kusto query (TaskN... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20DNS%20And%20Name%20Reservation) |
| 7 | ACR image push succeeds without error but the pushed image/chart has no content ... | Azure quarantine policy was auto-enabled when the customer e... | Disable the quarantine policy on the ACR: 1) Get registry ID... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Push%20Failure%20no%20content) |
| 8 | ACR Tasks fail with error 'ACR Tasks requests for the registry are not supported... | ACR has temporarily paused ACR Tasks for subscriptions using... | Advise customer to upgrade to a paid subscription. For forma... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Tasks%20Temporary%20Pause) |
| 9 | Unable to add VNET/Subnet to ACR Firewall across subscriptions - newly added cro... | Microsoft.ContainerRegistry resource provider is not registe... | Register Microsoft.ContainerRegistry resource provider in th... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Virtual%20Network%20%26%20Firewall%20Configuration%20Cross%20Subscription) |
| 10 | ACR webhook fails to push to App Service with status code 500 InternalServerErro... | ACR webhooks under spoke model do not work across subscripti... | Use Azure DevOps pipelines instead of ACR webhooks for cross... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Webhook%20fails%20to%20push%20to%20App%20Service) |
| 11 | ACR retention policy for untagged manifests does not delete untagged images; ret... | ACR retention policy does not support MediaType v1 manifests... | Ensure Docker/BuildKit is up-to-date to push v2 manifests; a... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20retention%20policy%20for%20untagged%20manifests%20does%20not%20work%20as%20expected) |
| 12 | Deleting repositories from ACR via Azure Portal returns NAME_UNKNOWN error, or C... | Azure Portal caching logic retains deleted repository links ... | Wait for Portal cache to refresh. If delete silently failed,... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20unable%20to%20delete%20repository) |
| 13 | Untagged images in ACR still showing as vulnerable in Microsoft Defender for Clo... | Untagging only removes tag reference; underlying image manif... | Purge untagged manifests using 'az acr run' with acr purge c... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20untagged%20images%20showing%20in%20defender) |
| 14 | ACR webhook creation fails with 'You do not have access for this operation, plea... | Portal uses ARM deployment to create webhooks, requiring sub... | Create custom RBAC role with Microsoft.Resources/deployments... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20webhook%20creation%20permission%20issue) |
| 15 | ACR 创建 Cache Rule 时报错 Resource names must contain alphanumeric characters and mu... | Cache Rule 名称不符合命名规范（需5-50字符，仅字母数字和连字符）。 | 使用符合规范的名称：5-50字符，仅包含字母、数字和连字符。 | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FCaching) |
| 16 | ACR Cache Rule 拉取镜像时报错 Unsupported upstream or login server provided | 客户尝试从不受支持的上游注册表拉取镜像，ACR Caching 仅支持特定的上游注册表。 | 仅使用受支持的上游注册表（如 docker.io、mcr.microsoft.com）。参考文档: https://le... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FCaching) |
| 17 | ACR Caching 使用 Credential Set 时报错 does not have secrets get permission on key va... | ACR 的服务主体/托管标识未被授予 Key Vault 的 secrets get 权限，导致无法读取 Credent... | 运行 az keyvault set-policy --name <vaultName> --object-id <ac... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FCaching) |
| 18 | ACR 创建 Cache Rule 时报错 Quota exceeded for resource type cacheRules | ACR 注册表已达到 Cache Rule 数量上限（Standard SKU 限制为 1000 条）。错误消息提示升级... | 删除不需要的 Cache Rule 以腾出配额。注意：升级 SKU 不会增加 Cache Rule 上限。 | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FCaching) |
| 19 | Container Apps creation fails with ContainerAppOperationError 'Failed to provisi... | Known Container Apps bug where ACR registry names exceeding ... | Use an ACR registry with a shorter name (under 30 characters... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=/Azure Kubernetes Service Wiki/ACR/TSG/ContainersApps Creation failure due to ACR name too long) |
| 20 | ACR Continuous Patching cssc-patch-image task fails at push-image step with cach... | CSSC workflows are not supported on repositories containing ... | Switch to Artifact sync based cache rules, or use the CSSC w... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=/Azure Kubernetes Service Wiki/ACR/TSG/Continuous Patching) |
| 21 | Container Apps creation fails after 15-20 minutes with ContainerAppOperationErro... | Known bug in ContainerApps that cannot handle ACR registry n... | Use a shorter ACR registry name (under 30 characters) for Co... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FContainersApps%20Creation%20failure%20due%20to%20ACR%20name%20too%20long) |
| 22 | ACR Continuous Patching cssc-patch-image task fails at push-image step with cach... | CSSC (Continuous Security Supply Chain) workflows are not su... | Switch to Artifact sync based cache rules, or use CSSC workf... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FContinuous%20Patching) |
| 23 | ACR Continuous Patching cssc-patch-image task fails with image "not found" in MC... | The tooling image that Copacetic (Copa) uses for patching is... | Contact upstream team (azcu-publishing@microsoft.com) or rai... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FContinuous%20Patching) |
| 24 | Intermittent 502 Bad Gateway or 'connection reset by peer' errors during ACR pus... | Azure Storage front-end nodes can enter a half-up state wher... | Retry the push/pull request. Use Kusto query on cluster('acr... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=/Azure Kubernetes Service Wiki/ACR/TSG/Intermittent 502 responses from ACR) |
| 25 | ACR 拉取镜像缓慢，AzureBlobServerLatency 低但 EndToEndLatency 高、MegabytePerSecond 低 | 客户端侧网络连接差、CPU 慢或磁盘 I/O 慢，导致从 Azure Blob Storage 下载层数据的端到端延迟高... | 1) 通过 StorageAccountLogs 查询确认 AzureBlobServerLatencyInSecond... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FSlow%20pull%20and%20push%20performance) |
| 26 | ACR 推送镜像缓慢，PUT manifest 或 HEAD/POST/PUT blob 请求耗时超过 2 分钟 | ACR 内部服务端问题，registry frontend 或 data proxy 处理推送请求延迟异常。 | 通过 RegistryActivity 查询推送相关请求（PUT manifest、HEAD/POST/PUT blob... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FSlow%20pull%20and%20push%20performance) |
| 27 | ACR 推送镜像缓慢，PATCH blob 操作慢，StorageAccountLogs 显示 Blob Storage 侧延迟高 | ACR 后端 Azure Blob Storage 性能问题，ACR 到 Blob Storage 之间的上传延迟高。 | 1) 从 RegistryActivity 取慢 PATCH 操作的 correlationid；2) 在 Storag... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FSlow%20pull%20and%20push%20performance) |
| 28 | ACR 推送镜像缓慢，PATCH blob 操作慢但 Blob Storage 侧延迟正常 | 客户端侧网络问题，客户端到 ACR data proxy 的上传速度慢。 | 1) 确认 StorageAccountLogs 中 Blob Storage 延迟正常；2) 让客户运行 https:... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FSlow%20pull%20and%20push%20performance) |
| 29 | ACR registry size (RegistrySize table entry) not updated correctly after indexin... | The ACR indexing service failed to update the RegistrySize e... | Use Jarvis action "Recalculate registry size and update regi... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FPlatform%20and%20Tooling%2FTools%2FJarvis%2FACR%20Jarvis%20Actions%20New) |
| 30 | Cannot push images to ACR - registry has reached the 20TB storage limit | ACR storage usage has exceeded the default 20TB storage limi... | Contact ACR PG to increase the storage limit beyond 20TB. Cu... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FPlatform%20and%20Tooling%2FTools%2FJarvis%2FACR%20Technical%20Advisors%20Actions) |
| 31 | Pushing large container images to ACR fails due to image layer size limits | ACR enforces per-layer size limits by SKU: Standard SKU has ... | Verify the image layer sizes do not exceed the SKU limits. I... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACR) |
| 32 | CI/CD pushes images with same name and tag to ACR, previous manifests become unt... | When pushing with the same tag, the previous manifest loses ... | List untagged manifests: az acr repository show-manifests -n... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACR) |
| 33 | Unable to see all repositories in ACR using Azure Portal when registry has more ... | Known browser compatibility issue: Internet Explorer and Edg... | Use Chrome browser to list all repositories beyond 100. Alte... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACR) |
| 34 | Pulling images from ACR fails with error: 'Error response from daemon: unknown: ... | This occurs on Classic Registry SKU when the customer has re... | Update the storage keys in ACR using: az acr update -n <regi... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACR) |
| 35 | Unable to login to ACR using CLI command 'az acr login -n acrname.azurecr.io' - ... | Incorrect CLI syntax: the -n parameter expects the registry ... | Use registry name only: az acr login -n myacr (not myacr.azu... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACR) |
| 36 | ACR push/pull fails with error: unknown: The operation is disallowed on this reg... | Azure Container Registry has a 40 TiB storage limit per regi... | 1) Verify storage trend via az acr show-usage, 2) Open ICM t... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Storage%20Limit%20Increase) |
| 37 | Customer accidentally deleted Azure Container Registry or image manifests and ne... | ACR does not support self-service recovery. Recovery require... | 1) Customer recreates ACR with identical subscription/RG/nam... | [B] 6.5 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.1] |
| 38 | az acr login fails with Error saving credentials: Cannot autolaunch D-Bus withou... | Known bug in docker-compose 1.17.1 on Ubuntu 18.04 that inte... | Remove docker-compose: apt remove docker-compose -y && apt a... | [B] 5.5 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.4] |
| 39 | Microsoft Defender for Cloud fails to scan ACR images with error 'The container ... | ARM audience token authentication (authentication-as-arm) is... | Enable ARM audience token authentication: az acr config auth... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=/Azure Kubernetes Service Wiki/ACR/TSG/Microsoft Defender for cloud doesnt scan images in ACR) |
| 40 | az acr login or docker login fails on Ubuntu 18.04 with error: Error saving cred... | Known bug in docker-compose 1.17.1 on Ubuntu 18.04. The pack... | Remove docker-compose: apt remove docker-compose -y && apt a... | [B] 5.0 | [onenote: MCVKB/wiki_migration/======VM&SCIM======] |
| 41 | Pod stuck in ImagePullBackOff with '401 Unauthorized' when pulling images from A... | Kubelet identity on AKS cluster was changed but the new iden... | Ensure the Kubelet identity assigned to AKS cluster matches ... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FOthers%2FImagePullBackOff%20401%20Unauthorized) |
| 42 | Need to identify which AKS workloads depend on Docker Hub (docker.io) public ima... | AKS does not natively report which pods/containers pull from... | 1) Enable Azure Monitor container insights on AKS cluster. 2... | [Y] 3.0 | [onenote: MCVKB/wiki_migration/======VM&SCIM======] |
