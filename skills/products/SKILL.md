# Azure 产品排查 Skill 总览

> 每个产品 skill 包含：诊断层级架构、决策树、可用工具链、已知问题库。
> Kusto 查询的表定义和模板在 `skills/kusto/{product}/`，产品 skill 引用但不复制。

## 产品索引

| 产品 | Skill 路径 | Kusto DB 数 | 核心场景 |
|------|-----------|------------|---------|
| [VM/Compute](vm/SKILL.md) | `skills/products/vm/` | 6 | 启动失败、意外重启、性能、Extension |
| [AKS](aks/SKILL.md) | `skills/products/aks/` | 2 | 集群操作、节点 NotReady、Autoscaler |
| [ARM](arm/SKILL.md) | `skills/products/arm/` | 1 | 429 限流、部署失败、请求追踪 |
| [AVD](avd/SKILL.md) | `skills/products/avd/` | 1 | 连接失败、Session Host、FSLogix |
| [Disk](disk/SKILL.md) | `skills/products/disk/` | 3 | IO 限流、磁盘操作、性能 |
| [Entra ID](entra-id/SKILL.md) | `skills/products/entra-id/` | 4 | 登录失败、条件访问、MFA |
| [Intune](intune/SKILL.md) | `skills/products/intune/` | 2 | 设备注册、策略部署、应用管理 |
| [Monitor](monitor/SKILL.md) | `skills/products/monitor/` | 3 | Alert 未触发、通知、SQR |
| [Networking](networking/SKILL.md) | `skills/products/networking/` | 2 | VPN、ExpressRoute、AppGw |
| [Purview](purview/SKILL.md) | `skills/products/purview/` | 2 | RMS 加密解密、敏感度标签 |
| [ACR](acr/SKILL.md) | `skills/products/acr/` | 1 | 镜像推拉、认证、限流 |
| [EOP](eop/SKILL.md) | `skills/products/eop/` | 0 | 垃圾邮件、钓鱼（PowerShell） |

## 架构关系

```
                    troubleshooter agent
                          │
                    识别问题域 → 选择产品
                          │
                ┌─────────┴─────────┐
                ▼                   ▼
        skills/products/        skills/kusto/
        {product}/SKILL.md      {product}/
        ┌──────────────┐        ┌──────────────────┐
        │ 排查思路      │   引用  │ kusto_clusters.csv│
        │ 决策树        │──────→│ tables/{db}/*.md  │
        │ 已知问题库    │        │ queries/*.md      │
        │ 工具链        │        └──────────────────┘
        └──────────────┘
              │
              │ 使用
              ▼
    ┌─────────────────────┐
    │ kusto-query.py      │ Kusto 查询引擎
    │ ADO Wiki Search     │ TSG / 已知问题
    │ OneNote KB (RAG)    │ 团队知识库
    │ msft-learn MCP      │ 官方文档
    │ ICM MCP             │ Incident 关联
    │ D365 Case Data      │ 客户上下文
    └─────────────────────┘
```

## 使用方式

排查时，troubleshooter agent 应该：

1. 先读 `skills/products/{product}/SKILL.md` — 获取排查思路和决策树
2. 按决策树确定诊断路径
3. 需要 Kusto 查询时，参考 `skills/kusto/{product}/` 获取表定义和模板
4. 通过 `scripts/kusto-query.py` 执行查询（见 `.claude/skills/kusto-query/SKILL.md`）
5. 交叉验证：ADO Wiki、OneNote KB、msft-learn、ICM

## 进化协议

产品 skill 通过 **五个触发源** 持续演进，知识先进入 `known-issues.jsonl` 积累，
成熟后提升到 `SKILL.md` 的决策树和已知问题表。

### 目录结构

```
skills/products/{product}/
├── SKILL.md                 ← 精炼知识（决策树 + 已知问题表）
├── known-issues.jsonl       ← 原始积累（结构化，append-only）
└── evolution-log.md         ← 审计日志
```

### known-issues.jsonl 格式

每行一个 JSON 对象：

```json
{"id":"vm-001","date":"2026-03-31","symptom":"AllocationFailed with Pinning","rootCause":"VM pinned to specific hardware","solution":"Stop-Deallocate then Start","source":"case","sourceRef":"2603100030005863","product":"vm","confidence":"high","promoted":false}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `id` | 是 | `{product}-{seq}` 格式 |
| `date` | 是 | 发现日期 |
| `symptom` | 是 | 症状描述 |
| `rootCause` | 是 | 根因 |
| `solution` | 是 | 解决方案 |
| `source` | 是 | 来源: `case` / `onenote` / `ado-wiki` / `email-review` / `manual` |
| `sourceRef` | 否 | Case 编号 / URL / 页面名 |
| `product` | 是 | 产品域 |
| `confidence` | 是 | `high` / `medium` / `low` |
| `promoted` | 是 | 是否已提升到 SKILL.md |
| `tags` | 否 | 标签数组，如 `["mooncake","china-specific"]` |
| `kustoQuery` | 否 | 相关 KQL 查询（如有） |
| `deprecated` | 否 | 已过时标记 `true` + 原因 |

### 五个触发源

#### ① 排查后写回（自动）

**触发**: troubleshooter agent 完成排查后。

**流程**:
1. 从 `{caseDir}/analysis/*.md` 提取根因和解决方案
2. 与 `known-issues.jsonl` 去重（按 symptom + rootCause 相似度）
3. 新发现 → append 到 `known-issues.jsonl`
4. 已有条目 → 增加 confidence（多次遇到 = high）
5. 记录到 `evolution-log.md`

#### ② OneNote 团队知识库扫描（手动触发）

**触发**: `/product-learn onenote {product}`

**流程**:
1. 使用 `local-rag` MCP 搜索与产品相关的 OneNote 页面
2. 搜索词：产品关键词 + 常见错误码 + "已知问题"/"workaround"
3. 从匹配页面提取 symptom/rootCause/solution 三元组
4. 去重后 append 到 `known-issues.jsonl`，source = `onenote`

#### ③ ADO Wiki TSG 扫描（手动触发）

**触发**: `/product-learn ado-wiki {product}`

**流程**:
1. 使用 `scripts/ado-search.ps1` 搜索 ADO Wiki
2. 搜索词：产品名 + "known issue" / "TSG" / "mitigation"
3. 读取匹配的 Wiki 页面全文
4. 提取结构化知识条目
5. 去重后 append 到 `known-issues.jsonl`，source = `ado-wiki`

#### ④ 归档案例复盘（手动触发）

**触发**: `/product-learn case-review {product}` 或 `/product-learn case-review {caseNumber}`

**流程**:
1. 扫描 `cases/archived/` 下的案例
2. 读取 `context/case-summary.md` 和 `emails.md`
3. 从关闭邮件中提取最终解决方案
4. 从 `analysis/*.md` 中提取 Kusto 查询模式
5. 构建 known-issue 条目，source = `email-review`
6. 特别关注：客户困惑点（文档改进信号）、反复出现的问题

#### ⑤ 手动输入（随时）

**触发**: `/product-learn add {product}` 或排查中主动建议

**流程**:
1. 交互式收集：symptom、rootCause、solution
2. append 到 `known-issues.jsonl`，source = `manual`

### 知识提升（Promotion）

当 `known-issues.jsonl` 中的条目满足以下条件时，建议提升到 SKILL.md：

- **高频**: 同一 symptom 出现 3+ 次（confidence = high）
- **高影响**: 导致客户数据丢失或服务不可用
- **新路径**: 发现 SKILL.md 决策树未覆盖的排查路径

提升流程：
1. 列出候选条目
2. 用户确认
3. 追加到 SKILL.md 的决策树或已知问题表
4. 标记 `promoted: true`

### 知识衰退（Deprecation）

Azure 产品变化快，已知问题可能过时：
- 排查时发现 known-issue 不再适用 → 标记 `deprecated: true`
- 定期检查 > 6 个月未匹配的条目 → 标记 `confidence: "low"`

