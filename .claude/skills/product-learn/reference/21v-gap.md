# 21V Feature Gap — Reference Data Service

NOT a source adapter. Does not produce known-issues JSONL.
Provides structured 21v feature gap data consumed by source adapters during extraction.

---

## Purpose

Provides `21v-gaps.json` cache consumed by extractors for `21vApplicable` marking.
When extracting known issues from any source (OneNote, ADO Wiki, MS Learn, etc.),
adapters check solutions against this cache to determine if the solution involves
features unsupported or partially supported in Azure China (21Vianet).

---

## Cache Location

```
.claude/skills/products/{product}/21v-gaps.json
```

---

## Cache Schema

```json
{
  "lastUpdated": "YYYY-MM-DD",
  "product": "{product}",
  "unsupportedFeatures": [
    {
      "feature": "Feature Name",
      "description": "Brief description of why it's unsupported"
    }
  ],
  "partialFeatures": [
    {
      "feature": "Feature Name",
      "description": "Brief description of limitations"
    }
  ],
  "noGapDataFound": false
}
```

- `unsupportedFeatures`: 明确不支持的功能列表，每条附简短说明
- `partialFeatures`: 部分支持的功能列表，每条附限制说明
- `noGapDataFound`: 当未找到任何 Feature Gap 文件时设为 `true`

---

## Refresh Logic

**数据来源**：POD Services 目录中的 Feature Gap 文件。

1. **检查缓存**：读取 `.claude/skills/products/{product}/21v-gaps.json`
   - 存在且 `lastUpdated` 距今 < 30 天 → 跳过（缓存有效）

2. **读取 `playbooks/product-registry.json`**，找到 `podProducts[product].podServicesDir`
   - 为 null → 写空 21v-gaps.json（标记 `"noGapDataFound": true`）

3. **Glob 搜索 Feature Gap 文件**：

   `SERVICES_DIR` 路径通过 `config.json → dataRoot` 解析：
   ```
   SERVICES_DIR = ${dataRoot}/OneNote Export/Mooncake POD Support Notebook/POD/VMSCIM/4. Services
   ```

   搜索命令：
   ```bash
   find "${SERVICES_DIR}/{podServicesDir}" -maxdepth 2 \( -iname "*Feature*Gap*" -o -iname "*Feature*List*Gap*" -o -iname "*feature*parity*" \)
   ```

   其中 `{podServicesDir}` 从 `playbooks/product-registry.json → podProducts[product].podServicesDir` 获取。

4. **读取文件**（通常 1-2 个），LLM 提取：
   - `unsupportedFeatures`: 明确不支持的功能列表
   - `partialFeatures`: 部分支持的功能列表

5. **没找到 Feature Gap 文件时** — Fallback grep：
   - 用 Grep 在 POD notebook 搜索 `{product}` + `"not support|不支持|gap"`
   - 仍无结果 → 写空 21v-gaps.json（标记 `"noGapDataFound": true`）

6. **Write** `.claude/skills/products/{product}/21v-gaps.json`

---

## Consumer Interface

Source adapters 在提取 known issues 时按以下流程使用 21v-gaps.json：

1. **Read** `21v-gaps.json`（if exists for the current product）
2. **Check** solution text against `unsupportedFeatures` entries
   - 如果 solution 涉及不支持的功能 → `21vApplicable: false`
3. **Set** `21vApplicable` accordingly in the JSONL entry
   - 涉及 unsupported feature → `false`
   - 涉及 partial feature → `true`（附 tag 标记）
   - 无匹配 → `true`（默认适用）
4. **If cache doesn't exist** → set `21vApplicable: null`（MERGE 阶段会 backfill）

---

## Incremental Behavior

21v-gaps.json 刷新在以下条件下触发：

- **TTL 过期**：`lastUpdated` 距今 ≥ 30 天
- **OneNote 变更检测**：`onenote-changes.json` 中包含 Feature Gap 相关文件（文件名匹配 `*Feature*Gap*` / `*feature*parity*`）
- **手动 reset**：orchestrator 显式请求刷新

> 21v-gap-scan 始终一次完成（scope 小），不需要多批次处理。
