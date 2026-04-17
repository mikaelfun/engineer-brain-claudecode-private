# ARM Azure Policy 通用问题 — 排查工作流

**来源草稿**: ado-wiki-policy-operation-blocked.md, ado-wiki-b-policy-issues-when-assigning.md, ado-wiki-b-policy-faq.md, ado-wiki-a-policy-selectors-overrides.md, ado-wiki-policy-get-customer-logs.md
**场景数**: 4
**生成日期**: 2026-04-07

---

## Scenario 1: Policy Assignment 问题
> 来源: ado-wiki-b-policy-issues-when-assigning.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **分类问题类型**: 咨询/数据不正确/UI 问题/Assignment 报错
2. **数据显示问题排查**:
   - 确认客户查看的 scope 正确
   - 捕获 HAR trace 分析 API 调用
   - 确定数据是 client-side 还是 server-side 丢失

---

## Scenario 2: Selectors & Overrides
> 来源: ado-wiki-a-policy-selectors-overrides.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Selectors** — 基于条件渐进式 rollout assignment
2. **Overrides** — 修改 effect（如将 Deny 改为 Audit）
3. **组合使用** — Override 仅对 Selector 匹配的资源生效

---

## Scenario 3: Policy Logs 获取（Kusto）
> 来源: ado-wiki-policy-get-customer-logs.md | 适用: Mooncake ⚠️ / Global ✅

### KQL: 获取 Policy 资源变更 (Global)

```kql
let resource = ""; // definition, initiative or assignment id
let since = ago(3d);
cluster("armprodgbl.eastus.kusto.windows.net").database("ARMProd").Unionizer("Requests","HttpIncomingRequests")
| where targetUri contains resource
| where TIMESTAMP > since
| where Role =~ "Providers.Authorization.razzle"
| where operationName contains "/PROVIDERS/MICROSOFT.AUTHORIZATION/POLICY"
| where httpMethod =~ "PUT" or httpMethod =~ "DELETE"
| where httpStatusCode == 200 or httpStatusCode == 201 or httpStatusCode == 202
```

### KQL: 获取 Greenfield 评估记录 (Global)

```kql
let correlation = ""; // Correlation id
let since = ago(3d);
cluster("armprodgbl.eastus.kusto.windows.net").database("ARMProd").Unionizer("Traces","Traces")
| where TIMESTAMP > since
| where correlationId == correlation
| where operationName startswith "PolicyEvaluationEngine"
```

> Mooncake: 替换集群为 armmcadx.chinaeast2.kusto.chinacloudapi.cn

### Greenfield 判断标识
- isComplianceCheck: "False" → Greenfield 评估

---

## Scenario 4: Policy 常见 FAQ
> 来源: ado-wiki-b-policy-faq.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **RegEx 支持?** → 尚不支持，在 roadmap 中
2. **告警支持?** → 不直接支持，可用 Event Grid 系统主题
3. **导出合规数据?** → 通过 Azure Resource Graph 或 REST API
4. **Built-in Policy 维护者?** → 各工程团队，通过 PolicyMetadata.json 映射
