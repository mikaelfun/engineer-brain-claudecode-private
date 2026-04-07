# ARM ARM 模板部署基础问题 — 排查速查

**来源数**: 9 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Application Gateway cannot be moved between resource groups via ARM Resource Mover. AppGW WAF Polic… | Application Gateway does not have native resource move support in ARM. No API for backup/restore of… | Export the existing AppGW configuration as ARM template, deploy the same configuration in the new r… | 🟢 8.5 — onenote+21V适用 | [MCVKB/CN1_CE1 Migration 防坑指南 - Migration Plan - Resource.md] |
| 2 📋 | ARM template deployment of Azure SQL DB elasticpools fails intermittently with InternalServerError … | Concurrent ARM operations on the same SQL Server cause resource contention. The ARM template trigge… | Add dependsOn in ARM template to ensure sequential execution: elasticpools and other SQL Server con… | 🟢 8.0 — onenote+21V适用 | [MCVKB/[MCVKB]如何排查使用ARM部署Azure SQL DB elasticpools  资源失败 (2).md] |
| 3 📋 | ARM template deployment fails with request content size exceeds the maximum size of 4MB | ARM enforces a hard 4MB limit on template file size that cannot be changed. | Split large template into multiple smaller templates and deploy via Linked Templates (templateLink.… | 🟢 8.0 — onenote+21V适用 | [MCVKB/5.1 ARM部署模板_4MB的替代方案与Linked Template方案中存储账号开启防火墙后无.md] |
| 4 📋 | Linked Template deployment returns 403 SASIpAuthorization error when Storage Account has firewall e… | ARM Service Tags contain both IPv4 and IPv6 addresses. Storage Account firewall only supports IPv4 … | Use Template Spec instead of Linked Templates stored in firewall-protected Storage Account. Microso… | 🟢 8.0 — onenote+21V适用 | [MCVKB/5.1 ARM部署模板_4MB的替代方案与Linked Template方案中存储账号开启防火墙后无.md] |
| 5 📋 | ARM template that creates Policy definition/initiative fails to deploy | Template engine processes Policy functions (both use [function()] syntax). ARM template engine cann… | Use [[function()]] (double opening bracket) to escape policy functions in ARM templates. What you w… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 📋 | Need to verify customer provided the correct ARM template for a deployment — how to calculate and c… | Every ARM deployment generates a hash (Murmurhash64) based on the template content. The hash is sto… | Use the REST API 'Deployments - Calculate Template Hash' (https://learn.microsoft.com/en-us/rest/ap… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 📋 | ARM template guid() function produces different GUID than expected when customer tries to reproduce… | The guid() function uses UUID version 5 (RFC 4122) with ARM-specific namespace 11fb06fb-712d-4ddd-9… | Use UUID v5 with namespace 11fb06fb-712d-4ddd-98c7-e71bbd588830. Join multiple parameters with "-" … | 🔵 6.0 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 📋 | ARM template deployment in Complete mode accidentally deletes resources in resource group that are … | Complete deployment mode deletes all resources in the target resource group that are not included i… | Use the what-if operation (az deployment group what-if / New-AzResourceGroupDeployment -WhatIf) bef… | 🔵 6.0 — ado-wiki+21V适用 | [ADO Wiki] |
| 9 📋 | ARM linked/nested template 部署报错 InvalidContentLink：无法下载引用的模板文件（如子模板、参数文件） | linked template 的 URI 无法被 ARM 访问，常见原因：1) 模板存储在有 Azure Storage Firewall 的存储账户中且 ARM 无法访问；2) SAS toke… | 1) 将模板移到公开可访问的位置（如 GitHub）或确保 ARM 可以通过网络访问存储；2) 使用 QueryString 参数传递 SAS token：az deployment group c… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |

## 快速排查路径
1. Export the existing AppGW configuration as ARM template, deploy the same config… `[来源: onenote]`
2. Add dependsOn in ARM template to ensure sequential execution: elasticpools and … `[来源: onenote]`
3. Split large template into multiple smaller templates and deploy via Linked Temp… `[来源: onenote]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/arm-template-basics.md#排查流程)
