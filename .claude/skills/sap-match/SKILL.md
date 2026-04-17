---
name: sap-match
displayName: SAP 路径搜索
description: 根据问题描述搜索匹配的 D365 Support Area Path（SAP）路径。支持 Mooncake/Global 范围限定、POD 归属检查、family 过滤。纯本地搜索，无需浏览器。触发词：SAP 搜索、SAP 匹配、找 SAP、搜索 SAP、match SAP、transfer SAP、SAP 路径。
category: utility
stability: stable
---

# /sap-match — SAP 路径搜索

根据问题描述关键词搜索最匹配的 D365 Support Area Path。

## 使用场景

1. **casework assess** — sapMismatch 时建议正确 SAP
2. **out-of-scope transfer** — 建议目标 POD + SAP 路径
3. **工程师手动查询** — 快速找到产品的 SAP 路径供拷贝

## 用法

```bash
# 基本搜索
python3 .claude/skills/sap-match/match-sap.py "virtual machine disk resize"

# 只搜 Mooncake SAP（21Vianet 路径）
python3 .claude/skills/sap-match/match-sap.py "cosmos db" --scope mooncake

# 只搜 Global SAP（排除 Mooncake）
python3 .claude/skills/sap-match/match-sap.py "cosmos db" --scope global

# 限定 family + POD 归属检查
python3 .claude/skills/sap-match/match-sap.py "cosmos db" --family Azure --pod-check --top 5

# JSON 输出（供程序调用）
python3 .claude/skills/sap-match/match-sap.py "storage account" --pod-check --json

# 列出所有 family / 某 family 的产品
python3 .claude/skills/sap-match/match-sap.py --list-families
python3 .claude/skills/sap-match/match-sap.py --list-products Azure
```

## 参数

| 参数 | 说明 |
|------|------|
| `query` | 搜索关键词（问题描述） |
| `--scope mooncake\|global` | 限定范围：mooncake 只返回 21Vianet 路径，global 排除 21Vianet |
| `--family FAMILY` | 限定 product family（如 Azure, Windows） |
| `--pod-check` | 标注结果是否在当前 POD scope 内 |
| `--top N` | 返回前 N 条（默认 10） |
| `--json` | JSON 格式输出 |
| `--list-families` | 列出所有 family |
| `--list-products FAMILY` | 列出某 family 的所有产品 |

## 数据源

- `{dataRoot}/sap-routing.json` — 主索引（61 families, 2159 products）
- `{dataRoot}/sap-paths/{family}.json` — 各 family 的完整路径（380K 条）
- `{dataRoot}/sap-scope.json` — POD scope 定义

纯本地搜索，无网络/浏览器依赖，毫秒级响应。
