# ARM ARM 杂项操作 notfound invalidtemplate — 综合排查指南

**条目数**: 9 | **草稿融合数**: 5 | **Kusto 查询融合**: 3
**来源草稿**: ado-wiki-a-get-arm-template-hash.md, ado-wiki-a-template-specs.md, ado-wiki-arm-template-processing.md, ado-wiki-b-arm-template-schemas.md, ado-wiki-b-template-specs-overview.md
**Kusto 引用**: request-tracking.md, failed-operations.md, activity-log.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: ARM 部署报错 NotFound 或 ResourceNotFound：Cannot find ServerFarm with name xxx / The…
> 来源: mslearn

**根因分析**: 1) 模板中引用的依赖资源尚未创建（并行部署时缺少 dependsOn 声明）；2) 引用了错误的资源名称、资源组或订阅；3) 使用 reference() 函数引用不同资源组的资源但未提供完整 resourceId

1. 1) 在模板中正确设置 dependsOn（Bicep 优先使用隐式依赖）；2) 检查资源名/RG名/订阅ID 是否正确；3) 跨资源组引用时用 resourceId('otherRG','Microsoft.
2. Storage/storageAccounts','myStorage') 提供完整路径；4) 在 Portal 中查看部署操作序列确认部署顺序.

`[结论: 🔵 6.0/10 — [mslearn]]`

### Phase 2: ARM 部署报错 InvalidTemplate / InvalidTemplateCircularDependency：Deployment templat…
> 来源: mslearn

**根因分析**: 模板存在循环依赖（resource1→resource3→resource2→resource1）、语法错误、参数值不在 allowedValues 范围内、或 resource name/type 的 segment 数量不匹配

1. 1) 循环依赖：检查 dependsOn 链路，移除不必要的依赖，考虑将部分逻辑拆到子资源（extensions）中；2) 语法错误：用 VS Code + Bicep/ARM Tools 扩展检查；3) 参数错误：检查模板 allowedValues 并使用允许值；4) Segment 错误：确保嵌套资源的 name 和 type 段数匹配.

`[结论: 🔵 6.0/10 — [mslearn]]`

### Phase 3: ARM 部署报错 DeploymentQuotaExceeded：deployment count exceeds 800 per resource grou…
> 来源: mslearn

**根因分析**: 每个资源组最多保留 800 条部署历史记录，超出后新部署会失败。如果资源组上有 CanNotDelete lock，ARM 无法自动清理部署历史

1. 1) 手动删除不再需要的旧部署记录：az deployment group delete --resource-group {rg} --name {deployment-name}；2) 移除 CanNotDelete lock 让 ARM 自动清理；3) 使用 PowerShell/CLI 批量清理旧部署.

`[结论: 🔵 6.0/10 — [mslearn]]`

### Phase 4: ARM 部署报错 ParentResourceNotFound：Can not perform requested operation on nested r…
> 来源: mslearn

**根因分析**: 子资源部署时父资源尚未创建完成，常见于：1) 同模板中缺少 dependsOn 声明导致并行部署；2) 子资源名称格式错误（应为 parentName/childName）；3) 子资源部署到与父资源不同的资源组

1. 1) Bicep 中使用 parent 属性或嵌套资源自动创建依赖；2) ARM JSON 中添加 dependsOn；3) 引用已有父资源时用 existing 关键字（Bicep）；4) 确保子资源 name 和 type 的段数匹配.

`[结论: 🔵 6.0/10 — [mslearn]]`

### Phase 5: ARM 部署报错 JobSizeExceededException 或 DeploymentJobSizeExceededException：deployme…
> 来源: mslearn

**根因分析**: 部署作业压缩后大小超过 1MB（含元数据）、模板压缩后超过 4MB、或单个资源定义压缩后超过 1MB。常见触发因素：1) 参数/变量/输出名称过长在 copy loop 中被大量重复；2) 模板中内嵌大量不可压缩数据（如证书、二进制）；3) copy loop 创建大量资源导致依赖关系数据爆炸（O(n²) 依赖）。模板其他限制：最多 256 参数、256 变量、800 资源、64 输出、24576 字符表达式

1. 1) 缩短参数/变量/输出名称长度（在 loop 中会被乘倍放大）；2) 将大模板拆分为 Bicep modules 或 linked templates（按资源类型分组）；3) 使用 template specs 替代 nested templates；4) 使用隐式依赖替代 dependsOn，避免 loop 对 loop 的 O(n²) 依赖关系；5) 减少模板中的不可压缩数据（证书等外置到 Key Vault）.

`[结论: 🔵 6.0/10 — [mslearn]]`

### Phase 6: 通过 Azure Quota REST API 编程方式请求配额增加失败：返回 ResourceNotAvailableForOffer / Resource…
> 来源: mslearn

**根因分析**: Quota API 调用失败可能有多种原因：1) ResourceNotAvailableForOffer — 该资源在当前 Offer 类型下不可用；2) ResourceNotAvailableForSubscription — 该区域对该订阅不可用；3) UnableToIncreaseQuota — 配额无法增加，需走 Support Request；4) QuotaReductionNotSupported — 不支持减少配额；5) MFA required — 租户/账户未启用 MFA；6) MissingRegistration — 未注册 Microsoft.Quota RP；7) RequestThrottled — API 请求被限流

1. 1) 确保注册 Microsoft.
2. Quota RP：Register-AzResourceProvider -ProviderNamespace Microsoft.
3. Quota；2) 确保账户有 Quota Request Operator 角色（roleId: 0e5f05e5-9ab9-446b-b98d-1e2157c94125）；3) 为 MFA required 错误启用 MFA；4) QuotaReductionNotSupported 不支持减少只能通过 Portal 管理；5) UnableToIncreaseQuota 或 ContactSupport 需提交 Support Request → Issue type: Service and subscription limits (quotas)；6) 被限流时尊重 Retry-After header.

`[结论: 🟡 4.5/10 — [mslearn]]`

### Phase 7: 删除资源组后某些资源仍然存在或被重新创建：ARM 删除操作完成后 GET 请求返回 200/201 导致资源被 recreate
> 来源: mslearn

**根因分析**: ARM 删除资源组时按依赖顺序删除资源并对每个资源发起 DELETE 请求。删除后 ARM 会发 GET 验证：如果 GET 返回 404 则确认删除成功；但如果 RP 的 GET 返回 200 或 201（如资源在后台被重建或 RP 实现问题），ARM 会认为资源仍存在并重新创建它。此外对 5xx/429/408 错误会重试 15 分钟

1. 1) 确认资源没有被其他自动化（如 Policy deployIfNotExists、Azure Automation、自动缩放）重新创建；2) 检查是否有其他资源组的依赖资源阻止删除；3) 如资源组有 lock 先移除 lock；4) 使用 az group delete --force-deletion-types 强制删除 VM/VMSS/Databricks；5) 资源组删除不可逆，成功删除的资源在目标消失，失败的留在源.

`[结论: 🔵 6.0/10 — [mslearn]]`

### Phase 8: 无法删除 VNet 或 Subnet：报错 Subnet is in use / InUseSubnetCannotBeDeleted / SubnetHas…
> 来源: mslearn

**根因分析**: VNet/Subnet 中仍有依赖资源存在：1) NIC/Private Endpoint 的 IP 配置仍在 subnet 中；2) Subnet 有 Service Delegation（如 SQL MI、App Service、Container Instance）；3) AzureBastionSubnet/AzureFirewallSubnet 的 Bastion/Firewall 资源仍存在；4) 孤立 NIC（VM 删除后 NIC 未删除）；5) Service Association Links 残留；6) 被其他 RG 中的 VM 使用

1. 1) 先删除 subnet 中的所有资源：VM、Private Endpoint、NIC；2) 移除 Service Delegation：先删除该服务的资源再删除 delegation；3) 删除 Azure Bastion/Firewall 后再删 AzureBastionSubnet/AzureFirewallSubnet；4) 删除孤立 NIC：az network nic delete；5) 等待 10-15 分钟让 Service Association Links 自动清理；6) 使用 az network vnet subnet show --query ipConfigurations 诊断残留 IP 配置.

`[结论: 🔵 6.0/10 — [mslearn]]`

### Phase 9: ARM Incremental 模式部署后资源属性被重置为默认值：未在模板中指定的属性被覆盖而非保留原值
> 来源: mslearn

**根因分析**: Incremental 模式不会增量添加属性。未在模板中指定的属性会被重置为默认值。resource definition 始终代表资源的最终状态而非部分更新。特殊陷阱：1) VNet subnets 如通过子资源定义而非父资源属性，重部署时 subnet 会丢失；2) Web App site config 空对象不会更新，但有值时会覆盖

1. 1) 模板中始终指定所有非默认属性；2) VNet subnets 通过父资源的 subnets 属性定义，不使用子资源 Microsoft.
2. Network/virtualNetworks/subnets；3) 使用 what-if 在部署前检查属性变更；4) 使用 Bicep existing 关键字引用已有资源避免覆盖.

`[结论: 🔵 6.0/10 — [mslearn]]`

## Kusto 查询参考

### request-tracking.md
`[工具: Kusto skill — request-tracking.md]`

```kusto
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').EventServiceEntries
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where correlationId == "{correlationId}"
| project TIMESTAMP, resourceUri, operationName, status, level, properties, claims
| order by TIMESTAMP asc
```

```kusto
// cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd') // Public Cloud - 需要权限
// .Unionizer("Requests","EventServiceEntries")
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where correlationId == "{correlationId}"
| project TIMESTAMP, resourceUri, operationName, status, level, properties, claims
| order by TIMESTAMP asc
```

```kusto
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpIncomingRequests
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where correlationId == "{correlationId}"
| project TIMESTAMP, httpMethod, targetUri, commandName, httpStatusCode, clientIpAddress, userAgent
| order by TIMESTAMP asc
```

### failed-operations.md
`[工具: Kusto skill — failed-operations.md]`

```kusto
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').EventServiceEntries
| where subscriptionId == "{subscription}"
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where status == "Failed"
| where properties notcontains "isComplianceCheck" and properties notcontains "OK" and properties != ""
| project PreciseTimeStamp, resourceUri, properties, status, level, EventId, eventName, 
         eventCategory, operationName, correlationId, claims, tenantId
| order by PreciseTimeStamp desc
```

```kusto
// cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd') // Public Cloud - 需要权限
// .Unionizer("Requests","EventServiceEntries")
| where subscriptionId == "{subscription}"
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where status == "Failed"
| where properties notcontains "isComplianceCheck"
| project PreciseTimeStamp, resourceUri, properties, status, operationName, correlationId
| order by PreciseTimeStamp desc
```

```kusto
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').EventServiceEntries
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where correlationId == "{correlationId}"
| where status == "Failed"
| project PreciseTimeStamp, resourceUri, operationName, status, properties
| order by PreciseTimeStamp asc
```

### activity-log.md
`[工具: Kusto skill — activity-log.md]`

```kusto
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').EventServiceEntries 
| where subscriptionId == "{subscription}"
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where operationName notcontains "Microsoft.Authorization/policies/auditIfNotExists/action"
| where operationName notcontains "Microsoft.Authorization/policies/audit/action"
| project PreciseTimeStamp, operationName, resourceProvider, correlationId, status, subStatus, 
         properties, resourceUri, eventName, operationId, armServiceRequestId
| sort by PreciseTimeStamp asc
```

```kusto
// cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd') // Public Cloud - 需要权限
// .Unionizer("Requests","EventServiceEntries") 
| where subscriptionId == "{subscription}"
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where operationName notcontains "Microsoft.Authorization/policies"
| project PreciseTimeStamp, operationName, resourceProvider, correlationId, status, properties, resourceUri
| sort by PreciseTimeStamp asc
```

```kusto
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').EventServiceEntries 
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where resourceUri contains "{resourceUri}"
| where operationName notcontains "Microsoft.Authorization/policies"
| project PreciseTimeStamp, operationName, resourceProvider, correlationId, status, subStatus, 
         properties, resourceUri, eventName
| sort by PreciseTimeStamp asc
```

## 判断逻辑

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| ARM 部署报错 NotFound 或 ResourceNotFound：Cannot find ServerFarm… | 1) 模板中引用的依赖资源尚未创建（并行部署时缺少 dependsOn 声明）；2) 引用了错误的资源名称、资源组或订… | 1) 在模板中正确设置 dependsOn（Bicep 优先使用隐式依赖）；2) 检查资源名/RG名/订阅ID 是否正… |
| ARM 部署报错 InvalidTemplate / InvalidTemplateCircularDependenc… | 模板存在循环依赖（resource1→resource3→resource2→resource1）、语法错误、参数值不… | 1) 循环依赖：检查 dependsOn 链路，移除不必要的依赖，考虑将部分逻辑拆到子资源（extensions）中；… |
| ARM 部署报错 DeploymentQuotaExceeded：deployment count exceeds 8… | 每个资源组最多保留 800 条部署历史记录，超出后新部署会失败。如果资源组上有 CanNotDelete lock，A… | 1) 手动删除不再需要的旧部署记录：az deployment group delete --resource-gro… |
| ARM 部署报错 ParentResourceNotFound：Can not perform requested o… | 子资源部署时父资源尚未创建完成，常见于：1) 同模板中缺少 dependsOn 声明导致并行部署；2) 子资源名称格式… | 1) Bicep 中使用 parent 属性或嵌套资源自动创建依赖；2) ARM JSON 中添加 dependsOn… |
| ARM 部署报错 JobSizeExceededException 或 DeploymentJobSizeExceed… | 部署作业压缩后大小超过 1MB（含元数据）、模板压缩后超过 4MB、或单个资源定义压缩后超过 1MB。常见触发因素：1… | 1) 缩短参数/变量/输出名称长度（在 loop 中会被乘倍放大）；2) 将大模板拆分为 Bicep modules … |
| 通过 Azure Quota REST API 编程方式请求配额增加失败：返回 ResourceNotAvailabl… | Quota API 调用失败可能有多种原因：1) ResourceNotAvailableForOffer — 该资源… | 1) 确保注册 Microsoft.Quota RP：Register-AzResourceProvider -Pro… |
| 删除资源组后某些资源仍然存在或被重新创建：ARM 删除操作完成后 GET 请求返回 200/201 导致资源被 rec… | ARM 删除资源组时按依赖顺序删除资源并对每个资源发起 DELETE 请求。删除后 ARM 会发 GET 验证：如果 … | 1) 确认资源没有被其他自动化（如 Policy deployIfNotExists、Azure Automation… |
| 无法删除 VNet 或 Subnet：报错 Subnet is in use / InUseSubnetCannotB… | VNet/Subnet 中仍有依赖资源存在：1) NIC/Private Endpoint 的 IP 配置仍在 sub… | 1) 先删除 subnet 中的所有资源：VM、Private Endpoint、NIC；2) 移除 Service … |
| ARM Incremental 模式部署后资源属性被重置为默认值：未在模板中指定的属性被覆盖而非保留原值 | Incremental 模式不会增量添加属性。未在模板中指定的属性会被重置为默认值。resource definiti… | 1) 模板中始终指定所有非默认属性；2) VNet subnets 通过父资源的 subnets 属性定义，不使用子资… |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | ARM 部署报错 NotFound 或 ResourceNotFound：Cannot find ServerFarm with name xxx / The Resource Microsoft.… | 1) 模板中引用的依赖资源尚未创建（并行部署时缺少 dependsOn 声明）；2) 引用了错误的资源名称、资源组或订阅；3) 使用 reference() 函数引用不同资源组的资源但未提供完整 r… | 1) 在模板中正确设置 dependsOn（Bicep 优先使用隐式依赖）；2) 检查资源名/RG名/订阅ID 是否正确；3) 跨资源组引用时用 resourceId('otherRG','Micr… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 2 | ARM 部署报错 InvalidTemplate / InvalidTemplateCircularDependency：Deployment template validation failed … | 模板存在循环依赖（resource1→resource3→resource2→resource1）、语法错误、参数值不在 allowedValues 范围内、或 resource name/type… | 1) 循环依赖：检查 dependsOn 链路，移除不必要的依赖，考虑将部分逻辑拆到子资源（extensions）中；2) 语法错误：用 VS Code + Bicep/ARM Tools 扩展检查… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 3 | ARM 部署报错 DeploymentQuotaExceeded：deployment count exceeds 800 per resource group，无法创建新部署 | 每个资源组最多保留 800 条部署历史记录，超出后新部署会失败。如果资源组上有 CanNotDelete lock，ARM 无法自动清理部署历史 | 1) 手动删除不再需要的旧部署记录：az deployment group delete --resource-group {rg} --name {deployment-name}；2) 移除 C… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 4 | ARM 部署报错 ParentResourceNotFound：Can not perform requested operation on nested resource. Parent reso… | 子资源部署时父资源尚未创建完成，常见于：1) 同模板中缺少 dependsOn 声明导致并行部署；2) 子资源名称格式错误（应为 parentName/childName）；3) 子资源部署到与父资… | 1) Bicep 中使用 parent 属性或嵌套资源自动创建依赖；2) ARM JSON 中添加 dependsOn；3) 引用已有父资源时用 existing 关键字（Bicep）；4) 确保子… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 5 | ARM 部署报错 JobSizeExceededException 或 DeploymentJobSizeExceededException：deployment has exceeded limi… | 部署作业压缩后大小超过 1MB（含元数据）、模板压缩后超过 4MB、或单个资源定义压缩后超过 1MB。常见触发因素：1) 参数/变量/输出名称过长在 copy loop 中被大量重复；2) 模板中内… | 1) 缩短参数/变量/输出名称长度（在 loop 中会被乘倍放大）；2) 将大模板拆分为 Bicep modules 或 linked templates（按资源类型分组）；3) 使用 templa… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 6 | 删除资源组后某些资源仍然存在或被重新创建：ARM 删除操作完成后 GET 请求返回 200/201 导致资源被 recreate | ARM 删除资源组时按依赖顺序删除资源并对每个资源发起 DELETE 请求。删除后 ARM 会发 GET 验证：如果 GET 返回 404 则确认删除成功；但如果 RP 的 GET 返回 200 或… | 1) 确认资源没有被其他自动化（如 Policy deployIfNotExists、Azure Automation、自动缩放）重新创建；2) 检查是否有其他资源组的依赖资源阻止删除；3) 如资源… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 7 | 无法删除 VNet 或 Subnet：报错 Subnet is in use / InUseSubnetCannotBeDeleted / SubnetHasDelegations / Cannot… | VNet/Subnet 中仍有依赖资源存在：1) NIC/Private Endpoint 的 IP 配置仍在 subnet 中；2) Subnet 有 Service Delegation（如 S… | 1) 先删除 subnet 中的所有资源：VM、Private Endpoint、NIC；2) 移除 Service Delegation：先删除该服务的资源再删除 delegation；3) 删除… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 8 | ARM Incremental 模式部署后资源属性被重置为默认值：未在模板中指定的属性被覆盖而非保留原值 | Incremental 模式不会增量添加属性。未在模板中指定的属性会被重置为默认值。resource definition 始终代表资源的最终状态而非部分更新。特殊陷阱：1) VNet subnet… | 1) 模板中始终指定所有非默认属性；2) VNet subnets 通过父资源的 subnets 属性定义，不使用子资源 Microsoft.Network/virtualNetworks/subn… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 9 | 通过 Azure Quota REST API 编程方式请求配额增加失败：返回 ResourceNotAvailableForOffer / ResourceNotAvailableForSubsc… | Quota API 调用失败可能有多种原因：1) ResourceNotAvailableForOffer — 该资源在当前 Offer 类型下不可用；2) ResourceNotAvailable… | 1) 确保注册 Microsoft.Quota RP：Register-AzResourceProvider -ProviderNamespace Microsoft.Quota；2) 确保账户有 … | 🟡 4.5 — mslearn | [mslearn] |
