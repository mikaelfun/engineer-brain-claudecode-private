# ARM ARM 杂项操作 notfound invalidtemplate — 排查速查

**来源数**: 9 | **21V**: 部分
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | ARM 部署报错 NotFound 或 ResourceNotFound：Cannot find ServerFarm with name xxx / The Resource Microsoft.… | 1) 模板中引用的依赖资源尚未创建（并行部署时缺少 dependsOn 声明）；2) 引用了错误的资源名称、资源组或订阅；3) 使用 reference() 函数引用不同资源组的资源但未提供完整 r… | 1) 在模板中正确设置 dependsOn（Bicep 优先使用隐式依赖）；2) 检查资源名/RG名/订阅ID 是否正确；3) 跨资源组引用时用 resourceId('otherRG','Micr… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 2 📋 | ARM 部署报错 InvalidTemplate / InvalidTemplateCircularDependency：Deployment template validation failed … | 模板存在循环依赖（resource1→resource3→resource2→resource1）、语法错误、参数值不在 allowedValues 范围内、或 resource name/type… | 1) 循环依赖：检查 dependsOn 链路，移除不必要的依赖，考虑将部分逻辑拆到子资源（extensions）中；2) 语法错误：用 VS Code + Bicep/ARM Tools 扩展检查… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 3 📋 | ARM 部署报错 DeploymentQuotaExceeded：deployment count exceeds 800 per resource group，无法创建新部署 | 每个资源组最多保留 800 条部署历史记录，超出后新部署会失败。如果资源组上有 CanNotDelete lock，ARM 无法自动清理部署历史 | 1) 手动删除不再需要的旧部署记录：az deployment group delete --resource-group {rg} --name {deployment-name}；2) 移除 C… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 4 📋 | ARM 部署报错 ParentResourceNotFound：Can not perform requested operation on nested resource. Parent reso… | 子资源部署时父资源尚未创建完成，常见于：1) 同模板中缺少 dependsOn 声明导致并行部署；2) 子资源名称格式错误（应为 parentName/childName）；3) 子资源部署到与父资… | 1) Bicep 中使用 parent 属性或嵌套资源自动创建依赖；2) ARM JSON 中添加 dependsOn；3) 引用已有父资源时用 existing 关键字（Bicep）；4) 确保子… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 5 📋 | ARM 部署报错 JobSizeExceededException 或 DeploymentJobSizeExceededException：deployment has exceeded limi… | 部署作业压缩后大小超过 1MB（含元数据）、模板压缩后超过 4MB、或单个资源定义压缩后超过 1MB。常见触发因素：1) 参数/变量/输出名称过长在 copy loop 中被大量重复；2) 模板中内… | 1) 缩短参数/变量/输出名称长度（在 loop 中会被乘倍放大）；2) 将大模板拆分为 Bicep modules 或 linked templates（按资源类型分组）；3) 使用 templa… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 6 📋 | 删除资源组后某些资源仍然存在或被重新创建：ARM 删除操作完成后 GET 请求返回 200/201 导致资源被 recreate | ARM 删除资源组时按依赖顺序删除资源并对每个资源发起 DELETE 请求。删除后 ARM 会发 GET 验证：如果 GET 返回 404 则确认删除成功；但如果 RP 的 GET 返回 200 或… | 1) 确认资源没有被其他自动化（如 Policy deployIfNotExists、Azure Automation、自动缩放）重新创建；2) 检查是否有其他资源组的依赖资源阻止删除；3) 如资源… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 7 📋 | 无法删除 VNet 或 Subnet：报错 Subnet is in use / InUseSubnetCannotBeDeleted / SubnetHasDelegations / Cannot… | VNet/Subnet 中仍有依赖资源存在：1) NIC/Private Endpoint 的 IP 配置仍在 subnet 中；2) Subnet 有 Service Delegation（如 S… | 1) 先删除 subnet 中的所有资源：VM、Private Endpoint、NIC；2) 移除 Service Delegation：先删除该服务的资源再删除 delegation；3) 删除… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 8 📋 | ARM Incremental 模式部署后资源属性被重置为默认值：未在模板中指定的属性被覆盖而非保留原值 | Incremental 模式不会增量添加属性。未在模板中指定的属性会被重置为默认值。resource definition 始终代表资源的最终状态而非部分更新。特殊陷阱：1) VNet subnet… | 1) 模板中始终指定所有非默认属性；2) VNet subnets 通过父资源的 subnets 属性定义，不使用子资源 Microsoft.Network/virtualNetworks/subn… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 9 📋 | 通过 Azure Quota REST API 编程方式请求配额增加失败：返回 ResourceNotAvailableForOffer / ResourceNotAvailableForSubsc… | Quota API 调用失败可能有多种原因：1) ResourceNotAvailableForOffer — 该资源在当前 Offer 类型下不可用；2) ResourceNotAvailable… | 1) 确保注册 Microsoft.Quota RP：Register-AzResourceProvider -ProviderNamespace Microsoft.Quota；2) 确保账户有 … | 🟡 4.5 — mslearn | [mslearn] |

## 快速排查路径
1. 1) 在模板中正确设置 dependsOn（Bicep 优先使用隐式依赖）；2) 检查资源名/RG名/订阅ID 是否正确；3) 跨资源组引用时用 resour… `[来源: mslearn]`
2. 1) 循环依赖：检查 dependsOn 链路，移除不必要的依赖，考虑将部分逻辑拆到子资源（extensions）中；2) 语法错误：用 VS Code + … `[来源: mslearn]`
3. 1) 手动删除不再需要的旧部署记录：az deployment group delete --resource-group {rg} --name {depl… `[来源: mslearn]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/arm-misc-operations-notfound-invalidtemplate.md#排查流程)
