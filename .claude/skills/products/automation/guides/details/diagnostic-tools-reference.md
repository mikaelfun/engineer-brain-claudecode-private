# Automation 诊断工具参考 — 综合排查指南

**条目数**: 7 | **草稿融合数**: 5 | **Kusto 查询融合**: 0
**来源草稿**: [onenote-css-wiki-links.md](../drafts/onenote-css-wiki-links.md), [onenote-jarvis-namespaces.md](../drafts/onenote-jarvis-namespaces.md), [onenote-jarvis-job-trigger.md](../drafts/onenote-jarvis-job-trigger.md), [onenote-kusto-cluster-access.md](../drafts/onenote-kusto-cluster-access.md), [onenote-kusto-runbook-queries.md](../drafts/onenote-kusto-runbook-queries.md)
**Kusto 引用**: 无
**生成日期**: 2026-04-05

---

## 排查流程

### Phase 1: 确定诊断工具入口
> 来源: [onenote-css-wiki-links.md](../drafts/onenote-css-wiki-links.md) + [onenote-kusto-cluster-access.md](../drafts/onenote-kusto-cluster-access.md) + [onenote-jarvis-namespaces.md](../drafts/onenote-jarvis-namespaces.md) + automation-047

Automation 排查有三大诊断工具体系，根据问题类型选择：

**判断逻辑**：
| 条件 | 工具 | 后续动作 |
|------|------|---------|
| 需要查询 Job 状态/错误/Sandbox 事件 | Kusto (oaasprodmc) | → Phase 2 |
| 需要查询 Job 触发原因 / Schedule / Portal 请求 | Jarvis | → Phase 3 |
| 需要 TSG / SOP 标准流程参考 | CSS ADO Wiki | → Phase 4 |
| 新人培训 / Readiness | 培训材料 | → Phase 5 |
| 需要 ICM 升级模板 | ICM | → Phase 4 附录 |

`[结论: 🟢 8/10 — OneNote 多源交叉，Mooncake 专属]`

### Phase 2: Kusto 诊断 — Runbook Job 排查
> 来源: [onenote-kusto-cluster-access.md](../drafts/onenote-kusto-cluster-access.md) + [onenote-kusto-runbook-queries.md](../drafts/onenote-kusto-runbook-queries.md)

#### 2.1 集群接入

| 项目 | 值 |
|------|-----|
| Cluster URL | `https://oaasprodmc.chinanorth2.kusto.chinacloudapi.cn` |
| Database | `oaasprodmc` |
| 权限 SG | `Redmond\OaaSKustoGovUsers` |
| 加入 SG | http://idwebelements/GroupManagement.aspx?Group=OaaSKustoGovUsers&Operation=join |

> 必须先加入安全组才能查询

`[结论: 🟢 8.5/10 — OneNote 来源，Mooncake 专属]`

#### 2.2 查询 Runbook Job 状态

```kusto
// Cluster: https://oaasprodmc.chinanorth2.kusto.chinacloudapi.cn
// Database: oaasprodmc
let subId = "<subscriptionId>";
let AccountName = "<accountName>";
let ResourceGroup = "<resourceGroup>";
let inputRunbookName = "<runbookName>";
EtwJobStatus
| where TIMESTAMP > ago(12h)
| where * has inputRunbookName 
| where accountName == AccountName
| project TIMESTAMP, EventId, Pid, Tid, OpcodeName, TaskName, EventMessage, jobId, sandboxId, runbookName, accountName, Region, StampName
```

**关键字段**：
- `TaskName`: `JobStatusChangeRunning` (运行中)、`JobStatusChangeStopped` (已停止)
- `sandboxId`: 沙箱标识，用于关联 DrawbridgeHostV1

`[结论: 🟢 8.5/10 — OneNote Kusto 查询模板，实际验证]`

#### 2.3 查询 Runbook 错误 (Level ≤ 3)

```kusto
// Cluster: https://oaasprodmc.chinanorth2.kusto.chinacloudapi.cn
// Database: oaasprodmc
EtwAll
| where TIMESTAMP >= datetime(...) and TIMESTAMP <= datetime(...)
| where * has "<accountId>"
| where Level <= 3
| project TIMESTAMP, Level, TaskName, EventMessage, ActivityId, Tid
| where EventMessage contains "runbookName=<runbookName>"
```

#### 2.4 查询 Job 失败原因 (Sandbox 层)

```kusto
// Cluster: https://oaasprodmc.chinanorth2.kusto.chinacloudapi.cn
// Database: oaasprodmc
let JOBID = "<jobId>";
EtwJobStatus 
| where jobId == JOBID and sandboxId != "00000000-0000-0000-0000-000000000000"
| project jobId, sandboxId, runbookName
| join DrawbridgeHostV1 on $left.sandboxId == $right.ActivityId
| where EventMessage !contains "The sandboxed process attempted to open an inaccessible resource"
| project TIMESTAMP, runbookName, jobId, sandboxId, EventMessage, Level
```

**判断逻辑**：
| 条件 | 含义 | 后续动作 |
|------|------|---------|
| EventMessage 含 memory exhaustion | 内存超 400MB 限制 | 拆分脚本为 child runbook |
| sandboxId 全零 | Job 未到达 sandbox | 检查 Web Role 日志 (Phase 3) |
| DrawbridgeHostV1 无匹配 | Sandbox 正常退出 | 检查 Job 脚本逻辑错误 |

#### 2.5 查询 Web Request

```kusto
// Cluster: https://oaasprodmc.chinanorth2.kusto.chinacloudapi.cn
// Database: oaasprodmc
EtwIncomingWebRequest
| where TIMESTAMP > ago(15d)
| where EventMessage contains "<scheduleId>"
| where EventMessage contains "Stop"
| where httpMethod != "GET"
| order by TIMESTAMP asc
```

`[结论: 🟢 8.5/10 — OneNote Kusto 模板，多查询交叉验证]`

### Phase 3: Jarvis 诊断 — Job 触发与 Namespace
> 来源: [onenote-jarvis-namespaces.md](../drafts/onenote-jarvis-namespaces.md) + [onenote-jarvis-job-trigger.md](../drafts/onenote-jarvis-job-trigger.md)

#### 3.1 Namespace 参考 (Mooncake)

| Namespace | 服务角色 | 核心表 | 使用场景 |
|-----------|---------|--------|---------|
| **OaasMKWebBjbs1** | Web Role (Portal/Account) | ETWAll, ETWjobID, ETWHighPriority | Portal 问题、账户登录、前门请求、账户验证 |
| **OaasMKTriggerBjbs1** | Trigger Service (Schedules) | ETWAll, TriggerOperations, TriggerExceptions | Schedule 问题、触发调试 |
| **OaasMKWebhookBjbs1** | Webhook Service | ETWAll, ETWHighPriority | Webhook 请求问题 |
| **OaasMKProdBjbs1** | Job Execution (Runbook Worker) | ETWAll, ETWjobID, ETWHighPriority | Job 执行、Sandbox 事件 |

> 注意：`MK` 为区域代码，`Bjbs1` = Beijing。其他区域替换对应区域代码。

`[结论: 🟢 8.5/10 — OneNote 来源，Mooncake 专属]`

#### 3.2 查询 Job 触发原因

**步骤 1: 确认触发来源**
- Namespace: `OaasMKProd{region}`
- Jarvis link: https://jarvis-west.dc.ad.msft.net/65E02B49
- 筛选条件: Runbook name
- 关键字段: **JobtriggerSource** — 枚举值: `scheduled` | `manual` | `webhook`

**步骤 2: 查看触发详情 (Schedule 信息)**
- Namespace: `OaasMKTrigger{region}`
- Jarvis link: https://jarvis-west.dc.ad.msft.net/8E93F5FE
- 筛选条件: Runbook name
- 结果: 显示哪个 Schedule 触发了 Job

**步骤 3: 获取 Schedule 配置**
- 使用 Jarvis action: **Get Resource from URI**
- URI 格式:
  ```
  /subscriptions/{subId}/resourceGroups/{rg}/providers/Microsoft.Automation/automationAccounts/{account}/schedules/{scheduleName}
  ```

**典型使用场景**：
- 客户报告 Job 意外执行
- 需要验证 Job 是否由正确的 Schedule/Webhook 触发
- 审计 Automation 执行历史

`[结论: 🟢 8.5/10 — OneNote 来源，步骤完整]`

### Phase 4: CSS ADO Wiki 参考
> 来源: [onenote-css-wiki-links.md](../drafts/onenote-css-wiki-links.md) + automation-048

#### 4.1 关键 Wiki 资源

| Wiki | URL | 说明 |
|------|-----|------|
| Azure Automation Wiki | https://supportability.visualstudio.com/AzureAutomation/_wiki/wikis/Azure-Automation.wiki/23859/Azure-Automation | Automation 基础 TSG |
| Azure Update Center (Latest) | https://msazure.visualstudio.com/DefaultCollection/One/_wiki/wikis/One.wiki/157713/Azure-Update-Center | AUM 最新文档 |
| AAAP Wiki | https://supportability.visualstudio.com/AAAP_Code/_wiki/wikis/AAAP/1679934/Welcome | **推荐优先使用** |

> AAAP wiki 是当前最新推荐资源

#### 4.2 ICM 升级模板

| 产品 | ICM 模板 |
|------|---------|
| Azure Update Manager | https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=ja3O2a |

`[结论: 🔵 7/10 — OneNote 参考链接，单源文档]`

### Phase 5: Readiness 培训材料
> 来源: automation-047

| 模块 | 时长 | 内容 |
|------|------|------|
| Automation Foundation | 2h | 基础概念 |
| Hybrid Worker | 3h | 混合工作者部署与排查 |
| Machine Configuration | TBD | 待定 |
| Troubleshooting | 1h | 排查方法论 |
| AUM Overview | 2h | Azure Update Manager 概览 |
| Auto VM Guest Patching | 2h | 自动修补配置 |
| AUM Troubleshooting | 1h | AUM 排查 |

**关键 Lab**：
- 创建 Runbook 重启 VM
- 在 Linux 上部署 Hybrid Worker
- 启用 AUM patching modes

**关键 Wiki**: AAAP (见上方链接)

`[结论: 🔵 6/10 — OneNote 来源，培训参考]`

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | 需要 CSS Wiki 参考链接 | — | AAAP Wiki 优先，见 Phase 4 | 🔵 7 — OneNote 参考 | [Mooncake POD/CSS Wiki](../drafts/onenote-css-wiki-links.md) |
| 2 📋 | Jarvis Namespace 参考 | — | 4 个 Namespace，见 Phase 3.1 | 🟢 8.5 — OneNote Mooncake 专属 | [Mooncake POD/Jarvis](../drafts/onenote-jarvis-namespaces.md) |
| 3 📋 | 查询 Job 触发原因 (Jarvis) | — | 3 步 Jarvis 查询流程，见 Phase 3.2 | 🟢 8.5 — OneNote 步骤完整 | [Mooncake POD/Jarvis](../drafts/onenote-jarvis-job-trigger.md) |
| 4 📋 | Kusto 集群接入权限 | — | oaasprodmc + OaaSKustoGovUsers SG，见 Phase 2.1 | 🟢 8.5 — OneNote Mooncake 专属 | [Mooncake POD/Kusto](../drafts/onenote-kusto-cluster-access.md) |
| 5 📋 | Kusto Runbook 排查查询 | — | 4 类 KQL 模板，见 Phase 2.2-2.5 | 🟢 8.5 — OneNote 查询模板 | [Mooncake POD/Kusto/Runbook](../drafts/onenote-kusto-runbook-queries.md) |
| 6 | Readiness 培训材料 | — | Foundation/HW/AUM 共 ~11h，见 Phase 5 | 🔵 6 — OneNote 参考 | [Mooncake POD/Readiness](automation-047) |
| 7 | AUM ICM 升级模板 | — | https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=ja3O2a | 🔵 6 — OneNote 单源 | [Mooncake POD/AUM ICM](automation-048) |
