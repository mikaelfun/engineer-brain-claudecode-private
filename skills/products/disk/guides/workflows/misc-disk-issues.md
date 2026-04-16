# Disk Miscellaneous Disk Issues — 排查工作流

**来源草稿**: ado-wiki-a-kusto-queries.md, ado-wiki-a-support-operations-collect-traces.md, ado-wiki-a-support-operations-get-cache-plus.md, ado-wiki-a-dump-collection-debug-diag-tool.md, ado-wiki-a-initial-questions.md
**Kusto 引用**: 无
**场景数**: 2
**生成日期**: 2026-04-07

> 注: 此 topic 草稿中部分内容属于 HPC Cache (已在 avere-hpc-cache.md 覆盖) 和 WebApps/IIS (非 Disk 产品)。
> 仅提取与 Disk/Storage 相关的通用工具和流程。

---

## Scenario 1: HPC Cache Geneva Actions 操作参考
> 来源: ado-wiki-a-support-operations-get-cache-plus.md, ado-wiki-a-support-operations-collect-traces.md | 适用: Global-only ❌ (需 SAW + AME)

### Get Cache Plus (只读诊断)
- **用途**: 获取 HPC Cache 初始诊断信息
- **访问**: 只读操作，ame.gbl 凭据即可
- **关键输出字段**:
  - `CurrentState` / `GoalState` — 应均为 "Running"
  - `health.conditions` — 活跃条件和消息
  - `CacheBaseName` — 调试环境访问所需
  - `NodeStates` — 各节点健康状态

### Collect Traces (读写操作)
- **用途**: 收集 HPC Cache 跟踪信息
- **访问**: 需要 Access Token
- **参数**: Environment, Endpoint, Subscription, RG, Cache Name, Initial Time, Duration Before/After
- **输出**: "Accepted." — 跟踪自动上传到 Avere 服务器

### ARMProd Kusto 查询
```kql
EventServiceEntries
| where TIMESTAMP > ago(1d)
| where subscriptionId == "{subscription}"
| where status == 'Failed'
```

---

## Scenario 2: Dump 收集工具 (DebugDiag)
> 来源: ado-wiki-a-dump-collection-debug-diag-tool.md | 适用: Mooncake ✅ / Global ✅

### 适用场景
应用 hang/crash 时收集内存转储用于分析。

### 步骤
1. 下载安装 DebugDiag: https://www.microsoft.com/en-us/download/details.aspx?id=58210
2. 关闭弹出窗口
3. 进入 Processes tab 找到目标进程
4. 等待问题复现
5. 右键目标进程 → Generate Full User dump
6. 间隔 1-2 分钟重复 3 次（确保问题发生时收集）