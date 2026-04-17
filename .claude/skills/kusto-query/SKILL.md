---
name: kusto-query
displayName: Kusto 查询
category: inline
stability: dev
description: "Python Kusto 查询引擎 — 多集群执行、智能截断、自我进化。替代 Kusto MCP 的首选查询方式。"
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# /kusto-query — Python Kusto 查询引擎

多集群 Kusto 查询执行 + 知识库自我进化。支持 Mooncake 和 Public Cloud。

## 参数

- `$ARGUMENTS` — 自由文本，描述查询意图或直接提供 KQL
  - 示例: `查一下 sub xxx 最近 2 天的 VM 操作`
  - 示例: `ApiQosEvent | where subscriptionId == "xxx" | take 10`
  - 示例: `probe schema ApiQosEvent on azcrpmc/crp_allmc`

---

## 1. 快速参考

### 单查询

```bash
AZURE_CONFIG_DIR="/c/Users/fangkun/.azure-profiles/cme-fangkun" \
/c/Python314/python.exe scripts/kusto-query.py \
  --cluster "https://azcrpmc.kusto.chinacloudapi.cn" \
  --database "crp_allmc" \
  --query "ApiQosEvent | where TIMESTAMP > ago(1h) | take 5" \
  --max-rows 50 --max-col-width 80
```

### Schema Probe

```bash
AZURE_CONFIG_DIR="/c/Users/fangkun/.azure-profiles/cme-fangkun" \
/c/Python314/python.exe scripts/kusto-query.py \
  --cluster "https://azcrpmc.kusto.chinacloudapi.cn" \
  --database "crp_allmc" \
  --probe-schema "ApiQosEvent"
```

### 常用参数

| 参数 | 默认 | 说明 |
|------|------|------|
| `--max-rows` | 100 | 最大返回行数 |
| `--max-col-width` | 80 | 列宽截断 |
| `--columns` | all | 逗号分隔列白名单 |
| `--dry-run` | false | 只打印不执行 |
| `--query-file` | — | 从文件读取 KQL |

### 环境变量

```bash
export AZURE_CONFIG_DIR="/c/Users/fangkun/.azure-profiles/cme-fangkun"
```

⚠️ **必须设置**，否则 DefaultAzureCredential 无法获取 Mooncake token。

---

## 2. 集群解析工作流

当需要执行 Kusto 查询时，按以下步骤确定 cluster + database：

### 目录结构（重构后）

表定义按 **database** 子目录组织，层级为 `Product → Database → Table`：

```
.claude/skills/kusto/{product}/references/
├── kusto_clusters.csv          ← cluster + database 映射
├── tables/
│   ├── {database_1}/           ← 按数据库分组
│   │   ├── Table1.md
│   │   └── Table2.md
│   ├── {database_2}/
│   │   └── Table3.md
│   └── README.md
└── queries/
    └── {scenario}.md           ← 查询模板（可跨数据库）
```

### 产品排查 Skill

每个产品还有独立的排查 skill（决策树 + 已知问题 + 工具链）：
- 总览: `.claude/skills/products/SKILL.md`
- 各产品: `.claude/skills/products/{product}/SKILL.md`

排查时先读产品 skill 获取**排查思路**，再读 Kusto skill 获取**数据字典**。

### Step 1: 识别问题域

从 case 信息、用户描述、或上下文中判断 Azure 产品域：

| 关键词 | 产品域 | 子 Skill 路径 |
|--------|--------|--------------|
| VM, VMSS, CRP, 虚拟机, 分配失败, Service Healing | vm | `.claude/skills/kusto/vm/` |
| AKS, Kubernetes, K8s, 集群, 升级, 节点池 | aks | `.claude/skills/kusto/aks/` |
| ARM, 资源管理, 429, 限流, correlationId, 部署 | arm | `.claude/skills/kusto/arm/` |
| AVD, WVD, Session Host, RDAgent, FSLogix | avd | `.claude/skills/kusto/avd/` |
| Disk, IOPS, MBPS, 限流, 延迟, VHD | disk | `.claude/skills/kusto/disk/` |
| 登录, Sign-in, 条件访问, MFA, AAD, Entra | entra-id | `.claude/skills/kusto/entra-id/` |
| Intune, MDM, 设备管理, 策略, MAM | intune | `.claude/skills/kusto/intune/` |
| Alerts, 警报, 通知, 诊断设置, Monitor | monitor | `.claude/skills/kusto/monitor/` |
| VPN, ExpressRoute, Application Gateway, NMAgent | networking | `.claude/skills/kusto/networking/` |
| Purview, AIP, RMS, MIP, DLP | purview | `.claude/skills/kusto/purview/` |
| ACR, Container Registry, Docker Push/Pull | acr | `.claude/skills/kusto/acr/` |
| EOP, 垃圾邮件, 钓鱼, 邮件头 | eop | `.claude/skills/kusto/eop/` |

### Step 2: 读取集群信息

```bash
# 读取对应产品的集群列表
cat .claude/skills/kusto/{product}/references/kusto_clusters.csv
```

CSV 格式: `cluster_name,cluster_uri,database,description,environment`

### Step 3: 选择查询模板

```bash
# 列出可用查询模板
ls .claude/skills/kusto/{product}/references/queries/

# 读取具体模板
cat .claude/skills/kusto/{product}/references/queries/{scenario}.md
```

### Step 4: 了解表结构

```bash
# 列出数据库分组
ls .claude/skills/kusto/{product}/references/tables/

# 读取特定数据库下的表定义
cat .claude/skills/kusto/{product}/references/tables/{database}/{TableName}.md
```

### Step 5: 替换参数并执行

模板中的 `{paramName}` 替换为实际值，然后调用 `kusto-query.py`。

---

## 3. 跨集群链路模式

复杂问题需要跨多个集群追踪。以下是常见链路：

### VM 问题链（5 层）

```
Layer 1: ARM 入口
  集群: armmcadx.chinaeast2.kusto.chinacloudapi.cn / armmc
  表: HttpIncomingRequests
  提取: correlationId, operationId
      ↓
Layer 2: CRP 操作
  集群: azcrpmc.kusto.chinacloudapi.cn / crp_allmc
  表: ApiQosEvent → ContextActivity
  提取: operationId → containerId, nodeId
  注意: ApiQosEvent.operationId = ContextActivity.activityId
      ↓
Layer 3: Fabric 平台
  集群: azurecm.chinanorth2.kusto.chinacloudapi.cn / azurecm
  表: LogContainerSnapshot, TMMgmtTenantEventsEtwTable
  提取: NodeId, TenantName, containerId
      ↓
Layer 4: Host 主机
  集群: azcore.chinanorth3.kusto.chinacloudapi.cn / Fa
  表: VmHealthRawStateEtwTable, WindowsEventTable
  或: rdosmc.kusto.chinacloudapi.cn / rdos
      ↓
Layer 5: Hardware
  集群: azuredcmmc.kusto.chinacloudapi.cn / AzureDCMDb
  表: ResourceSnapshotHistoryV1 (故障码, 维修状态)
```

### AKS 问题链（4 层）

```
Layer 1: AKS 前端
  集群: mcakshuba.chinaeast2.kusto.chinacloudapi.cn / AKSprod
  表: FrontEndQoSEvents → AsyncQoSEvents
  提取: operationId, ccpNamespace
      ↓
Layer 2: AKS 控制面
  集群: mcakshuba.chinaeast2.kusto.chinacloudapi.cn / AKSccplogs
  表: (控制面日志)
      ↓
Layer 3: CRP (如涉及 VMSS)
  集群: azcrpmc.kusto.chinacloudapi.cn / crp_allmc
      ↓
Layer 4: Fabric (如涉及节点硬件)
  集群: azurecm.chinanorth2.kusto.chinacloudapi.cn / azurecm
```

### 参数提取规则

| 源字段 | 源表 | 目标字段 | 目标表 |
|--------|------|----------|--------|
| operationId | ApiQosEvent | activityId | ContextActivity |
| correlationId | ARM HttpIncomingRequests | correlationId | ApiQosEvent |
| containerId | ContextActivity (parse) | containerId | LogContainerSnapshot |
| nodeId | LogContainerSnapshot | NodeId | VmHealthRawStateEtwTable |
| TenantName | LogContainerSnapshot | TenantName | TMMgmtTenantEventsEtwTable |

---

## 4. "先窄后宽" 迭代策略

查询不到结果时，按以下顺序放宽条件：

### Round 1 — 精确

```kql
| where correlationId == "{correlationId}"
| where subscriptionId == "{sub}"
| where resourceName =~ "{vmname}"
| where TIMESTAMP between(datetime({start})..datetime({end}))
```

### Round 2 — 去掉 correlationId

```kql
| where subscriptionId == "{sub}"
| where resourceName =~ "{vmname}"
| where TIMESTAMP between(datetime({start})..datetime({end}))
```

### Round 3 — 只留订阅 + 宽时间

```kql
| where subscriptionId == "{sub}"
| where TIMESTAMP > ago(7d)
```

### Round 4 — 换表/换集群

如果当前表/集群无结果，尝试：
- ApiQosEvent → ApiQosEvent_nonGet
- CRP → ARM (看 ARM 层是否有记录)
- 正常集群 → BI 集群 (azcrpmcbi/bi_allmc)

### 自动迭代规则

1. Round 1 返回 0 行 → 自动尝试 Round 2
2. Round 2 返回 0 行 → 自动尝试 Round 3
3. Round 3 返回 0 行 → 报告 "未找到数据"，建议换表/换集群
4. 任何 Round 返回 > 0 行 → 停止迭代，分析结果

---

## 5. 结果持久化

### Case 关联查询

当在 case 排查中执行查询时，保存结果到 case 目录：

**路径**: `{caseDir}/kusto/{YYYYMMDD-HHMM}-{description}.md`

**格式**:
```markdown
# Kusto Query — {description}

## 查询目的
{为什么执行这个查询}

## KQL
```kql
{完整查询语句}
```

## 集群信息
- Cluster: {cluster_uri}
- Database: {database}

## 关键结果
{markdown 表格}

## 结论
{这个查询告诉我们什么}
```

### 独立查询

不关联 case 的查询，结果直接输出到终端，不持久化。

---

## 6. 进化协议

### 概述

本 skill 的知识库（`.claude/skills/kusto/` 下的 table/query 定义）会自我进化。
进化遵循 **append-only** 原则：只追加标注，不删除已有内容。

### 6.1 Schema 漂移检测（自动）

**触发**: `kusto-query.py` 返回 `[SCHEMA_MISMATCH]` 错误。

**处理流程**:

```
1. 解析错误 → 识别 table name 或 column name
2. 执行 schema probe:
   kusto-query.py --probe-schema {table} --cluster {cluster} --database {db}
3. 读取已有 table 定义:
   .claude/skills/kusto/{product}/references/tables/{database}/{Table}.md
4. 对比差异
5. 按写回规则更新文件
6. 追加 evolution-log.md
7. 用修正后的 schema 重试查询
```

**写回规则（自动执行，无需确认）**:

| 发现 | 操作 |
|------|------|
| 表不存在 | YAML frontmatter: `status: active` → `status: deprecated (YYYY-MM-DD auto-detected)` |
| 列不存在 | 关键字段表中该行末尾追加 `⚠️ deprecated YYYY-MM-DD` |
| 新增列 | 关键字段表末尾追加新行: `\| newCol \| type \| 🆕 YYYY-MM-DD auto-discovered \|` |
| 列类型变更 | 更新类型列，追加: `📝 YYYY-MM-DD type changed: old → new` |

**安全保证**: 
- ❌ 绝不删除文件
- ❌ 绝不删除已有行（只追加标注）
- ❌ 绝不修改 kusto_clusters.csv
- ✅ 所有变更记录到 `.claude/skills/kusto/_meta/evolution-log.md`

**Changelog**: 每次写回在文件末尾追加：
```markdown
## Changelog
- YYYY-MM-DD: [auto] Column `oldField` marked deprecated (SCHEMA_MISMATCH)
- YYYY-MM-DD: [auto] New column `newField` (string) discovered via probe
```

### 6.2 Query Health Tracking（自动）

**触发**: 每次通过查询模板执行查询后。

**操作**: 读取 → 合并 → 写回 `.claude/skills/kusto/_meta/query-health.json`

```json
{
  "{product}/{query-name}": {
    "lastUsed": "ISO-8601",
    "successCount": 0,
    "failureCount": 0,
    "emptyCount": 0,
    "lastError": null,
    "lastErrorDate": null,
    "avgRows": 0,
    "flag": null
  }
}
```

**Flag 自动设置**:
- `failureCount > 3` → `"review-needed"`
- `emptyCount > 5` → `"low-yield"`
- 上次使用 > 90 天 → `"stale"`

**使用**: 
- 选择查询模板时，优先选 flag 为 null 的健康模板
- flag = `"review-needed"` 的模板使用时加注意
- 定期检查 query-health.json 中 flagged 的模板

### 6.3 Ad-Hoc Query Capture（需确认）

当排查中构造了一个有价值的临时查询时：

1. **主动建议保存**: "这个查询有诊断价值，要保存为模板吗？"
2. **用户确认后**:
   - 创建 `.claude/skills/kusto/{product}/references/queries/{name}.md`
   - 自动参数化: 
     - literal subscription ID → `{subscription}`
     - literal resource name → `{vmname}` / `{resourceName}`
     - literal datetime → `{starttime}` / `{endtime}`
     - literal correlationId → `{correlationId}`
   - 填充标准 YAML frontmatter (name, description, tables, parameters)
3. **记录到 evolution-log.md**

### 6.4 External Knowledge Import（手动）

当用户提供来自 ADO wiki / OneNote / 同事分享的 KQL 时：

1. 提取 KQL 语句
2. 识别目标 product（从表名 → 反查 kusto_clusters.csv）
3. 判断：更新现有模板 or 创建新模板
4. YAML frontmatter 中标注来源:
   ```yaml
   source: ADO wiki / KB-12345
   # 或
   source: OneNote / MCVKB / {page-title}
   ```
5. 记录到 evolution-log.md

---

## 7. 与 Troubleshooter 集成

Troubleshooter agent 优先使用本 skill 执行 Kusto 查询：

### 在 troubleshooter 中的使用方式

1. 读取本 SKILL.md 了解执行方法
2. 按 Section 2 解析集群
3. 按 Section 3 确定链路（如需跨集群）
4. 通过 Bash 调用 `scripts/kusto-query.py`
5. 如遇 `[SCHEMA_MISMATCH]`，按 Section 6.1 执行进化
6. 结果保存到 `{caseDir}/kusto/`

### Kusto MCP 仍可用（过渡期）

troubleshooter 的 mcpServers 仍包含 kusto，但仅限：
- `mcakshuba/AKSprod` 集群的简单查询
- Python 引擎遇到 auth 问题时的备选方案

2 周后将移除 MCP 依赖。

---

## 8. 最佳实践

### 查询效率

1. **始终加时间过滤** — `TIMESTAMP > ago(2d)` 或 `between()`
2. **优先过滤索引字段** — subscriptionId, correlationId, operationId
3. **限制结果行数** — `| take N` 或 `--max-rows`
4. **用 --columns 减少输出** — 只选需要的列
5. **避免 > 7 天时间跨度** — 大表查询慢且易超时

### 输出控制

- 常规排查: `--max-rows 50 --max-col-width 80`
- 趋势分析: `--max-rows 200`
- 精确排查: `--columns "PreciseTimeStamp,operationName,resultCode,errorDetails"`
- 全量导出: `--max-rows 0` (不截断)

### 错误处理

| 错误前缀 | 含义 | 处理 |
|----------|------|------|
| `[SCHEMA_MISMATCH]` | 表/列不存在 | → 进化协议 6.1 |
| `[AUTH_ERROR]` | 认证失败 | → 检查 AZURE_CONFIG_DIR, 运行 az login |
| `[TIMEOUT]` | 查询超时 | → 缩小时间范围, 加更多过滤 |
| `[QUERY_ERROR]` | KQL 语法错误 | → 检查查询语句 |
| `[CONNECTION_ERROR]` | 集群不可达 | → 检查网络, 确认集群 URI |
