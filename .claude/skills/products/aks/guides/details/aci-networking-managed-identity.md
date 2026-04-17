# AKS ACI 网络与 DNS — managed-identity -- Comprehensive Troubleshooting Guide

**Entries**: 10 | **Draft sources**: 1 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-acr-escalation-process.md
**Generated**: 2026-04-07

---

## Phase 1: 客户使用的 ACI API 版本低于 2021-07-01，该版本不支持 Managed Ident

### aks-291: ACI 使用 Managed Identity 拉取 ACR 镜像时报错：InvalidImageRegistryCredentialType — identi...

**Root Cause**: 客户使用的 ACI API 版本低于 2021-07-01，该版本不支持 Managed Identity 认证方式。

**Solution**:
要求客户升级 ARM Template 使用的 API 版本至 2021-07-01 或更新版本，参考：https://docs.microsoft.com/en-us/azure/container-instances/container-instances-reference-yaml

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FManaged%20Identity%20Auth%20Image%20Pulls)]`

## Phase 2: Container Group ARM Template 定义不规范：imageRegistryCr

### aks-292: ACI 使用 Managed Identity 拉取 ACR 镜像时报错：AmbiguousImageRegistryCredentialType / Inva...

**Root Cause**: Container Group ARM Template 定义不规范：imageRegistryCredentials 中同时设置了 username 和 identity（只能设置其一），或 identity 不在 ContainerGroupIdentity 列表中，或缺少必填的 server 字段。

**Solution**:
检查 ARM Template：1. imageRegistryCredentials 中 username 和 identity 只能设置其一 2. ContainerGroupIdentity 中必须包含 imageRegistryCredentials 所引用的 managed identity 3. imageRegistryCredentials 必须包含 server 字段。参考文档：https://docs.microsoft.com/en-us/azure/templates/microsoft.containerinstance/containergroups

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FManaged%20Identity%20Auth%20Image%20Pulls)]`

## Phase 3: Managed Identity 实例未被授予 ACR 的 Pull 权限（AcrPull RBAC

### aks-293: ACI 使用 Managed Identity 拉取 ACR 私有镜像时报错：InaccessibleImage — image is not accessib...

**Root Cause**: Managed Identity 实例未被授予 ACR 的 Pull 权限（AcrPull RBAC role）。

**Solution**:
1. 为 Managed Identity 分配 ACR AcrPull 角色，参考：https://docs.microsoft.com/en-us/azure/container-registry/container-registry-tasks-authentication-managed-identity#3-grant-the-identity-permissions-to-access-other-azure-resources 
2. 检查 ACR 是否启用了 Trusted Services（通过 Resource Explorer 确认 access 设置）
3. 若以上均正常，通过 IcM 模板提交：https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=g2E3T2

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FManaged%20Identity%20Auth%20Image%20Pulls)]`

## Phase 4: CG uses encrypted volumes referencing deleted Mana

### aks-302: ACI Container Group deletion fails because associated Managed Identity or Key Va...

**Root Cause**: CG uses encrypted volumes referencing deleted Managed Identity or Key Vault (related to Emerging Issue 68347).

**Solution**:
1) Validate via ASI Failed Delete Operations detector; 2) Query accprod.Errors table with correlationId; 3) Escalate to EEE ACI for ACIS Action ACI/Delete Container Group Skip Decryption.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FList%20of%20ACI%20issues%20where%20IcM%20is%20required)]`

## Phase 5: When using Managed Identity to pull images from AC

### aks-306: ACI Managed Identity image pull from ACR fails with permission or image name err...

**Root Cause**: When using Managed Identity to pull images from ACR, ACI control plane retrieves an Infrastructure Token to bypass ACR network protections. Failure occurs if: 1) RBAC ACR Pull permission not granted to the managed identity, or 2) image name is incorrectly spelled.

**Solution**:
1) Ensure the Managed Identity has AcrPull RBAC role on the target ACR; 2) Verify the image name and tag are correctly spelled; 3) Use API version 2021-07-01 or newer; 4) Architecture: ACI control plane pulls image → assigns Atlas data plane VM → data plane pulls from ACR data plane.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FPlatform%20and%20Tools%2FArchitecture%20Diagrams%2FMI%20Auth%20Architecture)]`

## Phase 6: Multiple credential request calls to Managed Ident

### aks-328: ACI container group creation fails with HTTP 400/500 due to throttling at Manage...

**Root Cause**: Multiple credential request calls to Managed Identity service exceed predefined rate limits per AAD Tenant/subscription, causing throttling (429) which manifests as 400/500 at ACI layer

**Solution**:
Limit calls to Managed Identity service per documented rate limits. Cache credentials (valid for 45 days). Avoid provisioning all resources simultaneously to prevent throttling.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20ACI%20Throttling%20at%20Managed%20Identity%20service)]`

## Phase 7: ACR 防火墙规则阻止了 ACI 服务的调用。使用 Service Principal 时无法穿透 

### aks-341: ACI InaccessibleImage error when pulling from ACR with firewall rules enabled, u...

**Root Cause**: ACR 防火墙规则阻止了 ACI 服务的调用。使用 Service Principal 时无法穿透 ACR 防火墙，必须使用 Managed Identity 才能作为 trusted service 访问受网络限制的 registry。

**Solution**:
改用 Managed Identity 拉取镜像，启用 ACR trusted services 访问。参考文档: https://docs.microsoft.com/en-us/azure/container-registry/allow-access-trusted-services#about-trusted-services

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20InaccessibleImage%20Error)]`

## Phase 8: Related to Emerging Issue 68347; delete operation 

### aks-342: Unable to delete ACI Container Group due to missing managed identity or Key Vaul...

**Root Cause**: Related to Emerging Issue 68347; delete operation fails when managed identity or KV is missing

**Solution**:
Open CRI/IcM. EEE uses ACIS Action ACI/Delete Container Group Skip Decryption. Validate via ASI Failed Delete Operations detector and RP Error Kusto: cluster('accprod').database('accprod').Errors filtered by correlationId and operationName has 'delete'.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACI/List%20of%20ACI%20issues%20where%20IcM%20is%20required)]`

## Phase 9: Subscription may lack access to the managed identi

### aks-602: ACI MSI token request failure — AccessTokenRequestEvent shows successful=False; ...

**Root Cause**: Subscription may lack access to the managed identity, or an ARM limitation/throttle exists on the subscription preventing token acquisition.

**Solution**:
1) Query Kusto AccessTokenRequestEvent filtering by TIMESTAMP, Tenant (region), successful==False. 2) For BadRequest errors, verify subscription has access to the managed identity. 3) Check for ARM limitations using Kusto query on cluster armprodgbl against ARMProd.Unionizer filtering by subscriptionId and PUT method, joined with Traces containing 'Limitation'.

`[Score: [B] 7.0 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20MSITokenRequestFailure)]`

## Phase 10: Multiple possible causes: 1) Subscription does not

### aks-604: ACI MSI token request failure — AccessTokenRequestEvent shows successful=False, ...

**Root Cause**: Multiple possible causes: 1) Subscription does not have access to the managed identity resource. 2) ARM limitations applied to the subscription blocking PUT operations on identity resources. 3) Regional Tenant issues in WARP clusters.

**Solution**:
1) Check Kusto AccessTokenRequestEvent table filtered by TIMESTAMP, Tenant/region, successful=False to identify failure details. 2) For BadRequest: verify subscription has proper RBAC access to the managed identity. 3) Check ARM limitations: query cluster('armprodgbl.eastus').database('ARMProd').Unionizer('Requests','HttpIncomingRequests') joined with Traces containing 'Limitation' to confirm if quota/policy limits are blocking identity operations.

`[Score: [B] 7.0 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20MSITokenRequestFailure)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | ACI 使用 Managed Identity 拉取 ACR 镜像时报错：InvalidImageRegistryCredentialType — identi... | 客户使用的 ACI API 版本低于 2021-07-01，该版本不支持 Managed Identity 认证方式。 | 要求客户升级 ARM Template 使用的 API 版本至 2021-07-01 或更新版本，参考：https://... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FManaged%20Identity%20Auth%20Image%20Pulls) |
| 2 | ACI 使用 Managed Identity 拉取 ACR 镜像时报错：AmbiguousImageRegistryCredentialType / Inva... | Container Group ARM Template 定义不规范：imageRegistryCredentials ... | 检查 ARM Template：1. imageRegistryCredentials 中 username 和 ide... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FManaged%20Identity%20Auth%20Image%20Pulls) |
| 3 | ACI 使用 Managed Identity 拉取 ACR 私有镜像时报错：InaccessibleImage — image is not accessib... | Managed Identity 实例未被授予 ACR 的 Pull 权限（AcrPull RBAC role）。 | 1. 为 Managed Identity 分配 ACR AcrPull 角色，参考：https://docs.micr... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FManaged%20Identity%20Auth%20Image%20Pulls) |
| 4 | ACI Container Group deletion fails because associated Managed Identity or Key Va... | CG uses encrypted volumes referencing deleted Managed Identi... | 1) Validate via ASI Failed Delete Operations detector; 2) Qu... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FList%20of%20ACI%20issues%20where%20IcM%20is%20required) |
| 5 | ACI Managed Identity image pull from ACR fails with permission or image name err... | When using Managed Identity to pull images from ACR, ACI con... | 1) Ensure the Managed Identity has AcrPull RBAC role on the ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FPlatform%20and%20Tools%2FArchitecture%20Diagrams%2FMI%20Auth%20Architecture) |
| 6 | ACI container group creation fails with HTTP 400/500 due to throttling at Manage... | Multiple credential request calls to Managed Identity servic... | Limit calls to Managed Identity service per documented rate ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20ACI%20Throttling%20at%20Managed%20Identity%20service) |
| 7 | ACI InaccessibleImage error when pulling from ACR with firewall rules enabled, u... | ACR 防火墙规则阻止了 ACI 服务的调用。使用 Service Principal 时无法穿透 ACR 防火墙，必须... | 改用 Managed Identity 拉取镜像，启用 ACR trusted services 访问。参考文档: ht... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20InaccessibleImage%20Error) |
| 8 | Unable to delete ACI Container Group due to missing managed identity or Key Vaul... | Related to Emerging Issue 68347; delete operation fails when... | Open CRI/IcM. EEE uses ACIS Action ACI/Delete Container Grou... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACI/List%20of%20ACI%20issues%20where%20IcM%20is%20required) |
| 9 | ACI MSI token request failure — AccessTokenRequestEvent shows successful=False; ... | Subscription may lack access to the managed identity, or an ... | 1) Query Kusto AccessTokenRequestEvent filtering by TIMESTAM... | [B] 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20MSITokenRequestFailure) |
| 10 | ACI MSI token request failure — AccessTokenRequestEvent shows successful=False, ... | Multiple possible causes: 1) Subscription does not have acce... | 1) Check Kusto AccessTokenRequestEvent table filtered by TIM... | [B] 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20MSITokenRequestFailure) |
