# ARM 杂项操作 (NotFound / InvalidTemplate) — 排查工作流

**来源草稿**: ado-wiki-a-get-arm-template-hash.md, ado-wiki-arm-template-processing.md, ado-wiki-b-arm-template-schemas.md, ado-wiki-a-template-specs.md, ado-wiki-b-template-specs-overview.md
**Kusto 查询**: request-tracking.md, failed-operations.md, activity-log.md
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: ResourceNotFound 错误排查
> 来源: failed-operations.md, activity-log.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **确认资源是否存在**: 使用 REST API GET 检查
2. **检查 dependsOn 依赖链**: 确认依赖资源已创建
3. **检查 reference() 函数**: 确认引用的资源在正确 scope
4. **查询失败操作**:

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').EventServiceEntries
| where subscriptionId == "{subscription}"
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where status == "Failed"
| extend errorCode = tostring(parse_json(properties).error.code)
| where errorCode == "ResourceNotFound" or errorCode == "NotFound"
| project PreciseTimeStamp, resourceUri, operationName, errorCode
| order by PreciseTimeStamp desc
```

---

## Scenario 2: InvalidTemplate 错误排查
> 来源: ado-wiki-arm-template-processing.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **检查模板语法**: 验证 JSON schema 正确性
2. **circular dependency 检查**: dependsOn 不能形成循环
3. **验证模板 hash**:
   - 使用 REST API: Deployments - Calculate Template Hash
   - 对比 Kusto Deployments 表中的 templateHash (Murmurhash64)
4. **Template Specs 问题**: 确认 template spec 版本和权限

---

## Scenario 3: 部署失败详细分析
> 来源: failed-operations.md, deployment-tracking.md | 适用: Mooncake ✅ / Global ✅

### KQL: 查询失败的部署操作 (Mooncake)

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').DeploymentOperations
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where executionStatus == "Failed"
| project TIMESTAMP, deploymentName, resourceName, resourceType, statusCode, statusMessage
| order by TIMESTAMP desc
```
