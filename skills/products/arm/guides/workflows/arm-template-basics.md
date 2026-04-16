# ARM 模板部署基础问题 — 排查工作流

**来源草稿**: [ado-wiki-arm-template-processing.md], [ado-wiki-a-get-arm-template-hash.md], [ado-wiki-a-template-specs.md], [ado-wiki-a-terraform-core-functionality.md], [ado-wiki-b-arm-template-schemas.md], [ado-wiki-b-bicep.md], [ado-wiki-b-template-specs-overview.md], [ado-wiki-terraform-on-azure.md], [mslearn-arm-bicep-what-if-guide.md]
**Kusto 引用**: [deployment-tracking.md]
**场景数**: 4
**生成日期**: 2026-04-07

---

## Scenario 1: ARM 模板部署失败排查
> 来源: ado-wiki-arm-template-processing.md, deployment-tracking.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **理解 ARM 模板处理流程**：PUT 请求 → API 检查 → 反序列化/Schema 验证 → 模板处理（参数→函数→变量→资源→依赖图）→ Preflight（RBAC→Policy→Capacity）→ RP Preflight → 部署序列器
2. **查询部署历史**：
   ```kql
   cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').Deployments
   | where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
   | where subscriptionId == "{subscription}"
   | where resourceGroupName == "{resourceGroup}"
   | project TIMESTAMP, deploymentName, executionStatus, resourceCount,
            succeededResourceCount, failedResourceCount, durationInMilliseconds
   | order by TIMESTAMP desc
   ```
   `[来源: deployment-tracking.md — 查询 1]`

3. **查询失败的操作详情**：
   ```kql
   cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').DeploymentOperations
   | where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
   | where subscriptionId == "{subscription}"
   | where deploymentName contains "{deploymentName}"
   | project TIMESTAMP, operationId, resourceName, resourceType, executionStatus,
            statusCode, statusMessage, durationInMilliseconds
   | order by TIMESTAMP asc
   ```
   `[来源: deployment-tracking.md — 查询 3]`

4. **判断逻辑**：
   | 结果 | 含义 | 下一步 |
   |------|------|--------|
   | statusCode = 400 | 模板语法/参数错误 | 检查模板定义和 Schema |
   | statusCode = 403 | 权限不足或 Policy 阻断 | 检查 RBAC 和 Policy |
   | statusCode = 409 | 资源冲突 | 检查并发部署或既有资源 |
   | statusCode = 404 | 依赖资源不存在 | 检查 dependsOn 和资源引用 |

---

## Scenario 2: What-If 部署预览
> 来源: mslearn-arm-bicep-what-if-guide.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **执行 What-If**：
   ```bash
   # Azure CLI — Resource Group 级别
   az deployment group what-if --resource-group {rg} --template-file {file}
   # Azure CLI — Subscription 级别
   az deployment sub what-if --location {location} --template-file {file}
   # PowerShell
   New-AzResourceGroupDeployment -Whatif -ResourceGroupName {rg} -TemplateFile {file}
   ```
2. **理解变更类型**：Create (+) / Delete (-) / Modify (~) / NoChange / NoEffect / Deploy (!) / Ignore
3. **常见误报**：`reference()` / `listKeys()` 等函数无法在 what-if 中解析 → 属性报告为变更（noise）
4. **ValidationLevel**：Provider（完整验证）/ ProviderNoRbac / Template（仅静态验证）
5. **限制**：最多 500 个 nested templates、800 个 resource groups；nested template 展开超时 5 分钟

---

## Scenario 3: 模板 Hash 验证
> 来源: ado-wiki-a-get-arm-template-hash.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. 使用 REST API 计算模板 hash：`POST /providers/Microsoft.Resources/calculateTemplateHash`（Murmurhash64 算法）
2. 在 Kusto Deployments 表中查 templateHash 属性，验证客户实际部署的模板
3. 对比客户声称使用的模板与实际部署的模板是否一致

---

## Scenario 4: Template Specs 配置检查
> 来源: ado-wiki-a-template-specs.md, ado-wiki-b-template-specs-overview.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **获取所有 Template Specs**：Jarvis Action → Get resources from provider → Microsoft.Resources/templateSpecs
2. **获取特定版本详情**：Jarvis Action → Get resource from URI → 获取完整模板内容
3. Template Specs 是 ARM 资源，支持 RBAC 控制分享权限
