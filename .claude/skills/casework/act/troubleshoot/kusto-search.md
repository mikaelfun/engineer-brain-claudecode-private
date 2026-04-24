# Kusto 查询排查（Step 4B — Kusto 部分）

> 按需加载：主控 SKILL.md 走路径 B 或 Lab 复现后需补充 Kusto 数据时读取。

## 执行方式

**首选方式（Python 引擎）：**
1. 读 `.claude/skills/products/{product}/SKILL.md` 获取排查思路和决策树
2. 按决策树确定诊断路径和需要查询的层级
3. 读 `.claude/skills/kusto-query/SKILL.md` 获取执行方法
4. 读 `.claude/skills/kusto/{product}/references/kusto_clusters.csv` 选择集群
5. 读 `.claude/skills/kusto/{product}/references/tables/{database}/` 了解 schema
6. 读 `.claude/skills/kusto/{product}/references/queries/` 获取模板
7. 通过 `scripts/kusto-query.py` 执行查询（支持多集群切换）
8. 如遇 `[SCHEMA_MISMATCH]`，按进化协议自动修复后重试

**备选方式（Kusto MCP）：**
参考 `.claude/skills/kusto/SKILL.md`：
- 使用 Kusto MCP 执行查询（仅限 mcakshuba/AKSprod 集群）
- 适用于简单 AKS 查询

**可用 Kusto 子技能：**
acr / aks / arm / avd / disk / entra-id / eop / intune / monitor / networking / purview / vm

## Kusto 查询结果文件

保存到 `{caseDir}/kusto/`，文件命名：`{YYYYMMDD-HHMM}-{query-description}.md`

```markdown
# Kusto Query — {query-description}

## 查询目的
{为什么执行这个查询}

## KQL
```kql
{完整查询语句}
```

## 关键结果
{查询结果摘要，只保留关键发现}

## 结论
{这个查询告诉我们什么}
```

## 日志

```
[timestamp] STEP 4B-KUSTO OK | queries executed: {N}, clusters: {list}
```
