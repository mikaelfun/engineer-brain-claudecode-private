# VM / Compute 产品排查 Skill

> 覆盖 Virtual Machines、VMSS、Availability Sets、Dedicated Hosts 等计算资源。

## 1. 诊断层级架构

VM 问题诊断遵循 **6 层架构**，从用户请求入口逐层深入到物理硬件：

```
Layer 1: ARM（Azure Resource Manager）
  ├─ 集群: armmcadx / armmc
  ├─ 作用: 用户请求入口，记录所有 API 调用
  ├─ 关键表: HttpIncomingRequests, EventServiceEntries
  └─ 提取: correlationId, operationId
        ↓
Layer 2: CRP（Compute Resource Provider）
  ├─ 集群: azcrpmc / crp_allmc
  ├─ 作用: 处理 VM/VMSS 操作的核心层
  ├─ 关键表: ApiQosEvent, ContextActivity, VmssQoSEvent
  └─ 提取: operationId → containerId, nodeId
        ↓
Layer 3: Fabric / CM（Cluster Manager）
  ├─ 集群: azurecm / azurecm
  ├─ 作用: 平台编排层，管理容器部署、Service Healing、Live Migration
  ├─ 关键表: LogContainerSnapshot, TMMgmtTenantEventsEtwTable, ServiceHealingTriggerEtwTable
  └─ 提取: NodeId, TenantName, containerId
        ↓
Layer 4: Host Node（物理主机）
  ├─ 集群: azcore / Fa  或  rdosmc / rdos
  ├─ 作用: 主机级别诊断，VM 健康状态、Hyper-V 事件
  ├─ 关键表: VmHealthRawStateEtwTable, WindowsEventTable, HyperVWorkerTable
  └─ 提取: NodeId, VmId
        ↓
Layer 5: Hardware / DCM（Data Center Management）
  ├─ 集群: azuredcmmc / AzureDCMDb
  ├─ 作用: 硬件管理，故障码、维修记录
  ├─ 关键表: RdmResourceSnapshot, dcmInventoryComponentDiskDirect
  └─ 提取: FaultCode, RepairStatus
        ↓
Layer 6: RCA / Analytics
  ├─ 集群: vmainsight / vmadb  ⚠️ Public Cloud 集群
  ├─ 作用: 自动 RCA 分类，VM 可用性分析
  └─ 关键表: VMA, VMALENS_MonitorRCAEvents
```

### 跨层参数传递规则

| 源表 | 源字段 | 目标表 | 目标字段 |
|------|--------|--------|----------|
| HttpIncomingRequests | correlationId | ApiQosEvent | correlationId |
| ApiQosEvent | operationId | ContextActivity | activityId |
| ContextActivity | (parse message) | LogContainerSnapshot | containerId |
| LogContainerSnapshot | NodeId | VmHealthRawStateEtwTable | NodeId |
| LogContainerSnapshot | containerId | TMMgmtTenantEventsEtwTable | containerId |
| ServiceHealingTriggerEtwTable | FaultCode | RdmResourceSnapshot | (DCM lookup) |

---

## 2. 决策树

### 2.1 VM 无法启动 / 创建失败

```
用户报告 VM 无法启动
  │
  ├─→ 有 correlationId？
  │     ├─ YES → CRP 查 ApiQosEvent by correlationId
  │     │         └─ resultCode?
  │     │              ├─ AllocationFailed → 【分配失败流程】
  │     │              ├─ OSProvisioningTimedOut → 【Provisioning 超时流程】
  │     │              ├─ OverconstrainedAllocationRequest → 【约束过多流程】
  │     │              ├─ QuotaExceeded → 告知客户提 quota 请求
  │     │              └─ 其他 → 查 ContextActivity 获取详细错误
  │     │
  │     └─ NO → CRP 查 ApiQosEvent by subscription + vmname + 时间
  │
  └─→ 无任何 CRP 记录？
        └─ ARM 查 HttpIncomingRequests → 确认请求是否到达 CRP
```

#### 分配失败流程
```
AllocationFailed
  ├─→ 查 ContextActivity → 解析 errorDetails 中的 FabricErrorCode
  │     ├─ Fabric_E_AllocationFailed → 区域无容量
  │     │     └─ 建议: 换 region / 换 SKU / 稍后重试
  │     ├─ Fabric_E_...Pinning → 固定到特定硬件
  │     │     └─ 建议: Stop-Deallocate 再 Start（释放固定）
  │     └─ 其他 → 查 Allocator 日志 (azureallocatormc)
  │
  └─→ 检查是否有 Availability Set / Zone 约束
        └─ ADO Wiki 搜索: "AllocationFailed {FabricErrorCode}"
```

#### Provisioning 超时流程
```
OSProvisioningTimedOut
  ├─→ Fabric 查 LogContainerSnapshot → 确认 VM 已部署到节点
  ├─→ Host 查 GuestAgentExtensionEvents → GA 是否成功安装
  │     ├─ GA 未安装 → 检查 NSG / UDR 是否阻断下载
  │     └─ GA 安装但超时 → 检查 Custom Script Extension
  └─→ OneNote KB 搜索: "OSProvisioningTimedOut"
```

### 2.2 VM 意外重启

```
用户报告 VM 意外重启
  │
  ├─→ Step 1: Fabric 查 TMMgmtTenantEventsEtwTable → 时间窗口内有无事件
  │     ├─ Service Healing 事件 → 【Service Healing 流程】
  │     ├─ Live Migration 事件 → 【Live Migration 流程】
  │     ├─ Planned Maintenance 事件 → 告知客户是计划维护
  │     └─ 无事件 → Step 2
  │
  ├─→ Step 2: Host 查 VmHealthRawStateEtwTable → VM 健康状态变化
  │     ├─ 有 Unhealthy → Dead 转换 → 确认 VM crash
  │     │     └─ 查 WindowsEventTable → 系统事件（蓝屏、内存故障）
  │     └─ 无状态变化 → 可能是客户自己操作
  │
  └─→ Step 3: RCA 查 VMA (vmadb) → 自动 RCA 分类
        ├─ RCA = DCM fault → 硬件故障，查 DCM 层
        ├─ RCA = Service Healing → 平台恢复操作
        ├─ RCA = Guest OS crash → 客户 OS 问题
        └─ RCA = Memory/CPU pressure → 客户负载问题
```

#### Service Healing 流程
```
Service Healing 触发
  ├─→ 查 ServiceHealingTriggerEtwTable → TriggerType + FaultCode
  ├─→ 查 FaultHandlingRecoveryEventEtwTable → 恢复过程
  ├─→ DCM 查 RdmResourceSnapshot → 硬件故障详情
  │     └─ FaultCode 含义查 ADO Wiki: "DCM fault code {code}"
  └─→ 生成 RCA: "由于节点 {NodeId} 的 {FaultType}，平台触发 Service Healing..."
```

### 2.3 VM 性能问题

```
用户报告 VM 性能慢
  │
  ├─→ 是磁盘 IO 问题？
  │     └─ 转 disk 产品 skill: .claude/skills/products/disk/
  │
  ├─→ 是网络问题？
  │     └─ 转 networking 产品 skill: .claude/skills/products/networking/
  │
  ├─→ 是 CPU/内存问题？
  │     ├─ Host 查 VmShoeboxCounterTable → 宿主机层面性能指标
  │     ├─ Host 查 HighCpuCounterNodeTable → 宿主机 CPU 使用率
  │     └─ 如果宿主机 CPU 高 → 可能是 noisy neighbor → 建议 Redeploy
  │
  └─→ 是 Live Migration 导致的短暂卡顿？
        └─ Fabric 查 LiveMigrationContainerDetailsEventLog
```

### 2.4 Extension 安装失败

```
Extension 安装失败
  ├─→ CRP 查 ApiQosEvent → operationName contains "extensions"
  │     └─ 获取 operationId
  ├─→ CRP 查 ContextActivity → 详细错误信息
  ├─→ Host 查 GuestAgentExtensionEvents → GA 日志
  │     ├─ GA 版本过旧 → 建议更新 GA
  │     ├─ Extension handler 报错 → 解析具体错误
  │     └─ 下载失败 → 检查网络（NSG/UDR/Proxy）
  └─→ msft-learn 搜索: "{extension-name} troubleshooting"
```

---

## 3. 可用工具链

### Kusto 查询
- **引用**: `.claude/skills/kusto/vm/` (6 个数据库, 42 个表, 15 个查询模板)
- **执行**: 通过 `scripts/kusto-query.py` 或 Kusto MCP
- **详见**: `.claude/skills/kusto-query/SKILL.md`

### ADO Wiki 搜索
```bash
# TSG / 已知问题搜索
pwsh -NoProfile -File scripts/ado-search.ps1 -Type wiki -Query "关键词" -Org msazure

# 常用搜索词
"AllocationFailed {region}"
"Service Healing fault code {code}"
"OSProvisioningTimedOut"
"VM stuck in creating"
"VMSS scale out failed"
```

### OneNote KB 搜索
```bash
# 使用 local-rag MCP
mcp__local-rag__query_documents: "VM allocation failed china east"
```

### ICM 关联
```bash
# 检查是否有相关 outage
mcp__icm__get_similar_incidents: incidentId=xxx
mcp__icm__get_impacted_services_regions_clouds: incidentId=xxx
```

### Microsoft Learn 搜索
```bash
mcp__msft-learn__microsoft_docs_search: "Azure VM troubleshoot start failure"
```

---

## 4. 已知问题库

| Error Code / 症状 | Root Cause | 解决方案 | 来源 |
|-------------------|------------|---------|------|
| AllocationFailed | 区域无容量 | 换 region / 换 SKU / 稍后重试 | 经验 |
| AllocationFailed + Pinning | VM 固定到特定硬件 | Stop-Deallocate 再 Start | 经验 |
| OverconstrainedAllocationRequest | AS/AZ 约束过多 | 减少约束或新建 AS | 经验 |
| OSProvisioningTimedOut | GA 安装超时 | 检查 NSG/DNS/Proxy，确认 168.63.129.16 可达 | KB |
| QuotaExceeded | 配额不足 | 提 quota request | 文档 |
| VMExtensionProvisioningError | Extension 安装失败 | 检查 GA 版本、网络连通性 | 经验 |
| InternalExecutionError | CRP 内部错误 | 重试 / 联系 CRP PG | 经验 |
| VM stuck "Creating" > 30min | Fabric 部署卡住 | 检查 LogContainerSnapshot 状态 | 经验 |
| Unexpected reboot + SH trigger | Service Healing | 查 DCM fault code → 硬件问题 | 经验 |
| Unexpected reboot + Guest crash | 客户 OS crash | 查 WindowsEventTable → 蓝屏/内存 | 经验 |
| Disk IO throttling | 达到 IOPS/MBPS 上限 | 升级磁盘 SKU 或启用 bursting | 文档 |

---

## 5. Kusto 数据库地图

| 数据库 | 集群 | 层级 | 表数 | 核心用途 |
|--------|------|------|------|---------|
| armmc | armmcadx.chinaeast2 | L1 ARM | (参见 arm skill) | 用户请求入口 |
| crp_allmc | azcrpmc | L2 CRP | 8 | VM/VMSS API 操作 |
| azurecm | azurecm.chinanorth2 | L3 Fabric | 15 | 容器部署、Service Healing |
| Fa | azcore.chinanorth3 | L4 Host | 10 | VM 健康、Hyper-V |
| AzureDCMDb | azuredcmmc | L5 Hardware | 6 | 硬件故障、维修 |
| vmadb | vmainsight (Public) | L6 RCA | 2 | 自动 RCA 分析 |
| azureallocatormc | azureallocatormc.chinaeast2 | L2.5 Allocator | 1 | 分配决策 |

---

## 6. 常见排查路径速查

| 场景 | 首查 | 次查 | 第三步 |
|------|------|------|--------|
| 操作失败 | CRP ApiQosEvent | CRP ContextActivity | ADO Wiki |
| 意外重启 | Fabric TMMgmt... | RCA VMA | DCM Hardware |
| 分配失败 | CRP ApiQosEvent | Allocator | ADO Wiki |
| 性能问题 | Host VmShoebox... | Host HighCpu... | 转 disk/networking |
| Extension 失败 | CRP ApiQosEvent | Host GuestAgent... | msft-learn |
| 计划维护 | Fabric TMMgmt... | RCA VMA | 告知客户 |
| 磁盘故障 | DCM dcmInventory... | Fabric LogNode... | DCM RdmResource... |

---

## Knowledge Base Assets

> Auto-enriched from 5 sources: ADO Wiki, MS Learn, OneNote, ContentIdea KB, 21V Gap Analysis.
> Last synthesized: 2026-04-07

### Directory Structure

```
.claude/skills/products/vm/
  known-issues.jsonl          1585 entries (structured break/fix triples)
  guides/
    _index.md                 Topic index (66 topics)
    {topic-slug}.md           66 speed-reference tables (symptom/cause/solution + scores)
    details/{topic-slug}.md   50 fusion troubleshooting guides (full KQL + decision trees)
    drafts/*.md               425 raw extraction drafts (source material, do not delete)
    conflict-report.md        Cross-source contradiction report
  .enrich/                    Enrichment state (progress, scanned records, evolution log)
```

### How to Use

**Troubleshooter Integration (Step 1.5)**:
1. Read `guides/_index.md` to find matching topic by symptom keywords
2. Read the speed-reference `guides/{topic}.md` for quick symptom-cause-solution lookup
3. If the topic has a fusion guide, read `guides/details/{topic}.md` for full KQL queries and decision trees
4. Fallback to `known-issues.jsonl` keyword search if no topic matches
5. Final fallback: RAG / MS Learn search

**Score Legend** (in speed-reference tables):
| Score | Icon | Meaning |
|-------|------|---------|
| 8-10  | Green circle  | Directly trustworthy |
| 5-7.9 | Blue circle  | Reference, verify key steps |
| 3-4.9 | Yellow circle  | Directional only |
| 0-2.9 | White circle  | Possibly outdated |

**Source Priority**: OneNote(5) > ADO Wiki(4) > ContentIdea KB(3) > MS Learn(2) > Case(1)

### Maintenance

- New knowledge: `/product-learn add vm` or auto-enriched via `/product-learn auto-enrich`
- Re-synthesize after significant new entries: `/product-learn synthesize vm`
- Promote high-confidence entries to this SKILL.md: `/product-learn promote vm`
