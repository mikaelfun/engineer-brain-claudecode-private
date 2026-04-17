# ARM Azure Migrate 迁移与发现 — 排查工作流

**来源草稿**: onenote-azure-migrate-discovery-vm.md, onenote-azure-migrate-discovery-apps-dep.md, onenote-azure-migrate-network-requirements-21v.md
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: VM Discovery 排查
> 来源: onenote-azure-migrate-discovery-vm.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **查找 Appliances** → 使用 Subscription ID 在 AMPKustoDB.Messages 中搜索 configstring
2. **获取 Discovery Agent ID** → 从 appliance 日志中提取
3. **查询已发现的 VM**:

```kql
let subid = "<SUBSCRIPTION_ID>";
let DiscoveryAgentIDs = "<DISCOVERY_AGENT_ID>-agent";
union
(cluster("asrcluswe").database("ASRKustoDB").FdsTelemetryEvent),
(cluster("asrclussea").database("ASRKustoDB").FdsTelemetryEvent),
(cluster("asrcluscus").database("ASRKustoDB").FdsTelemetryEvent)
| where PreciseTimeStamp > ago(20d)
| where SubscriptionId contains subid
| where ResourceId contains DiscoveryAgentIDs
| extend obj = todynamic(Message)
| where obj.ObjectType == "Vm" or obj.ObjectType == "Server"
| summarize arg_max(PreciseTimeStamp, *) by tostring(todynamic(tostring(obj.ObjectData)).ID)
| where ServiceEventName != "VMwareVmDeleteEvent"
```

4. **检查 Discovery Agent 日志** → 使用 VM Name 和 Agent ID 过滤 Messages 表
5. **检查克隆 VM（重复 BIOS GUID）** → 多个 VMName 映射到同一 DatacenterMachineID

---

## Scenario 2: Apps & Dependency Discovery 排查
> 来源: onenote-azure-migrate-discovery-apps-dep.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **查找 Appliances 和 Migrate Projects** → AMPKustoDB.Messages + configstring
2. **获取 Agent IDs** → 使用 MachineIdentifier
3. **查询 Dependency Map 和 App Discovery 错误**:
   - DiscoveryType: DependencyMap 或 AppsAndRoles
   - 检查 RunAs Account 凭证是否正确
4. **使用 ServiceActivityID 深入 Agent 日志**
5. **常见失败原因**: 凭证问题（错误的 RunAs 账户）、VMware Tools 未安装

### 关键表

| 表 | 数据库 | 内容 |
|---|--------|------|
| Messages | AMPKustoDB | Appliance webapp 日志 |
| FdsTelemetryEvent | ASRKustoDB | 发现的 VM 元数据 |
| FdsOperationEvent | ASRKustoDB | Discovery 操作事件 |

---

## Scenario 3: Mooncake Appliance 网络需求
> 来源: onenote-azure-migrate-network-requirements-21v.md | 适用: Mooncake ✅ / Global ❌

### 排查步骤
1. **确认客户防火墙/代理已放行所有必需 URL**:
   - `*.portal.azure.cn` — Portal
   - `graph.chinacloudapi.cn` — Azure AD
   - `login.microsoftonline.cn` — 登录
   - `management.chinacloudapi.cn` — ARM
   - `*.vault.chinacloudapi.cn` — Key Vault
   - `*.servicebus.chinacloudapi.cn` — Service Bus
   - `*.discoverysrv.cn2.windowsazure.cn` — Discovery 服务
   - `*.cn2.prod.migration.windowsazure.cn` — Migration 服务
   - `*.cn2.hypervrecoverymanager.windowsazure.cn` — VMware agentless migration
   - `*.blob.core.chinacloudapi.cn` — 存储上传
2. **这些 endpoint 与 Global Azure 不同** — Mooncake 特有
