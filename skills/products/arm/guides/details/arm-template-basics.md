# ARM ARM 模板部署基础问题 — 综合排查指南

**条目数**: 9 | **草稿融合数**: 9 | **Kusto 查询融合**: 1
**来源草稿**: ado-wiki-a-get-arm-template-hash.md, ado-wiki-a-template-specs.md, ado-wiki-a-terraform-core-functionality.md, ado-wiki-arm-template-processing.md, ado-wiki-b-arm-template-schemas.md (+4 more)
**Kusto 引用**: deployment-tracking.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: ARM template deployment of Azure SQL DB elasticpools fails intermittently with …
> 来源: onenote

**根因分析**: Concurrent ARM operations on the same SQL Server cause resource contention. The ARM template triggers multiple dependent operations (elasticpools + server config changes) simultaneously after SQL Server creation, leading to Server is busy with another operation error.

1. Add dependsOn in ARM template to ensure sequential execution: elasticpools and other SQL Server config changes should depend on both the SQL Server and each other.
2. Use ARM Kusto (armmcadx.
3. chinacloudapi.
4. cn/armmc HttpIncomingRequests) to find serviceRequestId, then query SQL Kusto (sqlazurechi2.
5. chinanorth2.
6. chinacloudapi.
7. cn/MoonCake MonManagement/MonManagementOperations) for detailed error.

`[结论: 🟢 8.0/10 — [MCVKB/[MCVKB]如何排查使用ARM部署Azure SQL DB elasticpools  资源失败 (2).md]]`

### Phase 2: ARM template deployment fails with request content size exceeds the maximum siz…
> 来源: onenote

**根因分析**: ARM enforces a hard 4MB limit on template file size that cannot be changed.

1. Split large template into multiple smaller templates and deploy via Linked Templates (templateLink.
2. uri must be HTTP/HTTPS accessible, e.
3. , Storage Account).
4. Alternatively, use Template Spec: upload linked templates first, then reference them by resource ID in the main template.
5. Template Spec is free and requires Template Spec Contributor RBAC role.

`[结论: 🟢 8.0/10 — [MCVKB/5.1 ARM部署模板_4MB的替代方案与Linked Template方案中存储账号开启防火墙后无.md]]`

### Phase 3: Linked Template deployment returns 403 SASIpAuthorization error when Storage Ac…
> 来源: onenote

**根因分析**: ARM Service Tags contain both IPv4 and IPv6 addresses. Storage Account firewall only supports IPv4 whitelist configuration. When ARM service instance uses IPv6 address to access the linked template, the request is blocked by the firewall.

1. Use Template Spec instead of Linked Templates stored in firewall-protected Storage Account.
2. Microsoft documentation explicitly states Linked Template is not compatible with Storage Account firewall.
3. Upload linked templates to Template Spec, then reference by resource ID in main template.

`[结论: 🟢 8.0/10 — [MCVKB/5.1 ARM部署模板_4MB的替代方案与Linked Template方案中存储账号开启防火墙后无.md]]`

### Phase 4: Application Gateway cannot be moved between resource groups via ARM Resource Mo…
> 来源: onenote

**根因分析**: Application Gateway does not have native resource move support in ARM. No API for backup/restore of configuration.

1. Export the existing AppGW configuration as ARM template, deploy the same configuration in the new resource group.
2. Note: dependencies (VNET, subnet, public IP, SSL certs, WAF policy) must be handled separately.
3. Reference case: 2511110040001280.

`[结论: 🟢 8.5/10 — [MCVKB/CN1_CE1 Migration 防坑指南 - Migration Plan - Resource.md]]`

### Phase 5: ARM template that creates Policy definition/initiative fails to deploy
> 来源: ado-wiki

**根因分析**: Template engine processes Policy functions (both use [function()] syntax). ARM template engine cannot distinguish between template functions and policy functions.

1. Use [[function()]] (double opening bracket) to escape policy functions in ARM templates.
2. What you want template engine to process: [function()].
3. What you want kept as policy function: [[function()]].

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 6: ARM template guid() function produces different GUID than expected when custome…
> 来源: ado-wiki

**根因分析**: The guid() function uses UUID version 5 (RFC 4122) with ARM-specific namespace 11fb06fb-712d-4ddd-98c7-e71bbd588830. Multiple parameters are joined with "-" separator before GUID generation. Customer code not using the correct namespace or join logic.

1. Use UUID v5 with namespace 11fb06fb-712d-4ddd-98c7-e71bbd588830.
2. Join multiple parameters with "-" separator.
3. In C#: GuidUtility.
4. Create(namespaceId: new Guid("11fb06fb-712d-4ddd-98c7-e71bbd588830"), name: string.
5. Join("-", input), version: 5).
6. This namespace value is ARM-specific and can be shared with customers.

`[结论: 🔵 6.0/10 — [ADO Wiki]]`

### Phase 7: ARM template deployment in Complete mode accidentally deletes resources in reso…
> 来源: ado-wiki

**根因分析**: Complete deployment mode deletes all resources in the target resource group that are not included in the template. If the customer deploys with mode=Complete without reviewing the impact, existing resources not in the template will be removed.

1. Use the what-if operation (az deployment group what-if / New-AzResourceGroupDeployment -WhatIf) before deploying with Complete mode to preview which resources will be created, deleted, or modified.
2. Consider using Incremental mode (default) unless Complete mode behavior is specifically required.

`[结论: 🔵 6.0/10 — [ADO Wiki]]`

### Phase 8: Need to verify customer provided the correct ARM template for a deployment — ho…
> 来源: ado-wiki

**根因分析**: Every ARM deployment generates a hash (Murmurhash64) based on the template content. The hash is stored in ARMPRODGBL Kusto cluster > Deployments database > Deployments table > templateHash property.

1. Use the REST API 'Deployments - Calculate Template Hash' (https://learn.
2. com/en-us/rest/api/resources/deployments/calculate-template-hash) to calculate the hash of a template without deploying.
3. Compare the calculated hash against the templateHash in Kusto (ARMPRODGBL > Deployments > Deployments table) to verify the customer provided the correct template.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 9: ARM linked/nested template 部署报错 InvalidContentLink：无法下载引用的模板文件（如子模板、参数文件）
> 来源: mslearn

**根因分析**: linked template 的 URI 无法被 ARM 访问，常见原因：1) 模板存储在有 Azure Storage Firewall 的存储账户中且 ARM 无法访问；2) SAS token 过期或未提供；3) URI 拼写错误或资源不存在；4) GitHub raw URL 失效；5) nested template 部署模式只能使用 Incremental（不能独立使用 Complete mode）

1. 1) 将模板移到公开可访问的位置（如 GitHub）或确保 ARM 可以通过网络访问存储；2) 使用 QueryString 参数传递 SAS token：az deployment group create --query-string $sasToken；3) 使用 Template Spec 将 linked template 打包为单一资源，避免运行时下载；4) 使用 relativePath 属性简化子模板路径管理；5) 确认 contentVersion 匹配.

`[结论: 🔵 6.0/10 — [mslearn]]`

## Kusto 查询参考

### deployment-tracking.md
`[工具: Kusto skill — deployment-tracking.md]`

```kusto
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').Deployments
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where resourceGroupName == "{resourceGroup}"
| project TIMESTAMP, deploymentName, executionStatus, resourceCount, 
         succeededResourceCount, failedResourceCount, durationInMilliseconds
| order by TIMESTAMP desc
```

```kusto
// cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd') // Public Cloud - 需要权限
// .Unionizer("Deployments","Deployments")
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where resourceGroupName == "{resourceGroup}"
| project TIMESTAMP, deploymentName, executionStatus, resourceCount, failedResourceCount
| order by TIMESTAMP desc
```

```kusto
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').Deployments
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where executionStatus == "Failed" or failedResourceCount > 0
| project TIMESTAMP, deploymentName, resourceGroupName, executionStatus, 
         resourceCount, failedResourceCount
| order by TIMESTAMP desc
```

## 判断逻辑

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| ARM template deployment of Azure SQL DB elasticpools fails … | Concurrent ARM operations on the same SQL Server cause reso… | Add dependsOn in ARM template to ensure sequential executio… |
| ARM template deployment fails with request content size exc… | ARM enforces a hard 4MB limit on template file size that ca… | Split large template into multiple smaller templates and de… |
| Linked Template deployment returns 403 SASIpAuthorization e… | ARM Service Tags contain both IPv4 and IPv6 addresses. Stor… | Use Template Spec instead of Linked Templates stored in fir… |
| Application Gateway cannot be moved between resource groups… | Application Gateway does not have native resource move supp… | Export the existing AppGW configuration as ARM template, de… |
| ARM template that creates Policy definition/initiative fail… | Template engine processes Policy functions (both use [funct… | Use [[function()]] (double opening bracket) to escape polic… |
| ARM template guid() function produces different GUID than e… | The guid() function uses UUID version 5 (RFC 4122) with ARM… | Use UUID v5 with namespace 11fb06fb-712d-4ddd-98c7-e71bbd58… |
| ARM template deployment in Complete mode accidentally delet… | Complete deployment mode deletes all resources in the targe… | Use the what-if operation (az deployment group what-if / Ne… |
| Need to verify customer provided the correct ARM template f… | Every ARM deployment generates a hash (Murmurhash64) based … | Use the REST API 'Deployments - Calculate Template Hash' (h… |
| ARM linked/nested template 部署报错 InvalidContentLink：无法下载引用的模… | linked template 的 URI 无法被 ARM 访问，常见原因：1) 模板存储在有 Azure Stora… | 1) 将模板移到公开可访问的位置（如 GitHub）或确保 ARM 可以通过网络访问存储；2) 使用 QueryStr… |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Application Gateway cannot be moved between resource groups via ARM Resource Mover. AppGW WAF Polic… | Application Gateway does not have native resource move support in ARM. No API for backup/restore of… | Export the existing AppGW configuration as ARM template, deploy the same configuration in the new r… | 🟢 8.5 — onenote+21V适用 | [MCVKB/CN1_CE1 Migration 防坑指南 - Migration Plan - Resource.md] |
| 2 | ARM template deployment of Azure SQL DB elasticpools fails intermittently with InternalServerError … | Concurrent ARM operations on the same SQL Server cause resource contention. The ARM template trigge… | Add dependsOn in ARM template to ensure sequential execution: elasticpools and other SQL Server con… | 🟢 8.0 — onenote+21V适用 | [MCVKB/[MCVKB]如何排查使用ARM部署Azure SQL DB elasticpools  资源失败 (2).md] |
| 3 | ARM template deployment fails with request content size exceeds the maximum size of 4MB | ARM enforces a hard 4MB limit on template file size that cannot be changed. | Split large template into multiple smaller templates and deploy via Linked Templates (templateLink.… | 🟢 8.0 — onenote+21V适用 | [MCVKB/5.1 ARM部署模板_4MB的替代方案与Linked Template方案中存储账号开启防火墙后无.md] |
| 4 | Linked Template deployment returns 403 SASIpAuthorization error when Storage Account has firewall e… | ARM Service Tags contain both IPv4 and IPv6 addresses. Storage Account firewall only supports IPv4 … | Use Template Spec instead of Linked Templates stored in firewall-protected Storage Account. Microso… | 🟢 8.0 — onenote+21V适用 | [MCVKB/5.1 ARM部署模板_4MB的替代方案与Linked Template方案中存储账号开启防火墙后无.md] |
| 5 | ARM template that creates Policy definition/initiative fails to deploy | Template engine processes Policy functions (both use [function()] syntax). ARM template engine cann… | Use [[function()]] (double opening bracket) to escape policy functions in ARM templates. What you w… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 | Need to verify customer provided the correct ARM template for a deployment — how to calculate and c… | Every ARM deployment generates a hash (Murmurhash64) based on the template content. The hash is sto… | Use the REST API 'Deployments - Calculate Template Hash' (https://learn.microsoft.com/en-us/rest/ap… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 | ARM template guid() function produces different GUID than expected when customer tries to reproduce… | The guid() function uses UUID version 5 (RFC 4122) with ARM-specific namespace 11fb06fb-712d-4ddd-9… | Use UUID v5 with namespace 11fb06fb-712d-4ddd-98c7-e71bbd588830. Join multiple parameters with "-" … | 🔵 6.0 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 | ARM template deployment in Complete mode accidentally deletes resources in resource group that are … | Complete deployment mode deletes all resources in the target resource group that are not included i… | Use the what-if operation (az deployment group what-if / New-AzResourceGroupDeployment -WhatIf) bef… | 🔵 6.0 — ado-wiki+21V适用 | [ADO Wiki] |
| 9 | ARM linked/nested template 部署报错 InvalidContentLink：无法下载引用的模板文件（如子模板、参数文件） | linked template 的 URI 无法被 ARM 访问，常见原因：1) 模板存储在有 Azure Storage Firewall 的存储账户中且 ARM 无法访问；2) SAS toke… | 1) 将模板移到公开可访问的位置（如 GitHub）或确保 ARM 可以通过网络访问存储；2) 使用 QueryString 参数传递 SAS token：az deployment group c… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
