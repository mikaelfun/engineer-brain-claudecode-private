---
name: rag-sync
displayName: RAG 同步
description: "增量同步 OneNote 知识库到 Local RAG"
category: inline
stability: stable
---

# /rag-sync — 增量同步 OneNote 知识库到 Local RAG

增量同步已导出的 OneNote Markdown 文件到 local-rag 向量数据库。
通过 manifest 文件跟踪文件状态，只对新增/修改的文件执行 ingest。

**架构**：写入（ingest/delete）用 CLI，查询（search）用 MCP。

## 前置条件

- 已使用 `/onenote-export` 导出 notebook
- 首次使用需先运行 `/rag-sync full` 或 `/rag-sync init`

## 参数

`{args}` = 可选操作模式

```
/rag-sync           → 增量同步（默认）
/rag-sync init      → 构建 manifest 基线（已有 lancedb 时用）
/rag-sync status    → 查看变更摘要，不执行同步
/rag-sync full      → 强制全量重新 ingest
```

## 文件结构

- **Manifest**: `{outputDir}/.rag-manifest.json` — 记录每个文件的 mtime + size
- **脚本**: `.claude/skills/rag-sync/manifest.mjs` — 文件变更检测
- **配置**: 复用 `.claude/skills/onenote/config.json` 的 `outputDir`
- **CLI**: `~/.claude/mcp-servers/local-rag/dist/index.js` — 批量 ingest 工具

## CLI 环境变量

从 `.mcp.json` 的 `local-rag` 配置中提取（一次性读取，后续复用）：

```bash
# 读取 .mcp.json 提取 local-rag env（一行完成所有变量）
eval $(cat .mcp.json | node -e "
  process.stdin.resume();let d='';
  process.stdin.on('data',c=>d+=c);
  process.stdin.on('end',()=>{
    const e=JSON.parse(d).mcpServers['local-rag'].env;
    for(const[k,v]of Object.entries(e)) console.log(k+'='+JSON.stringify(v));
  })
")
```

### Fallback 机制

`.mcp.json` 中配置了双 embedding 端点：
- **Primary**: NewAPI (`openai` provider) — 便宜但不稳定
- **Fallback**: Azure OpenAI (`azure` provider) — 稳定可靠

`local-rag/dist/embedder/index.js` 中的 `FallbackEmbedder` 自动处理：
1. Primary 失败 → 自动切换 Fallback
2. 连续 3 次 Primary 失败 → 禁用 Primary 5 分钟（直接用 Fallback）
3. 5 分钟后重新尝试 Primary

相关 env vars: `FALLBACK_PROVIDER`, `FALLBACK_API_KEY`, `FALLBACK_BASE_URL`, `FALLBACK_API_VERSION`

### 并发设置

通过 `INGEST_CONCURRENCY` 环境变量控制文件级并发（默认 5）。

**实测结果**（2026-04，NewAPI + Azure OpenAI fallback）：
| 并发 | NewAPI | Azure Fallback | 备注 |
|------|--------|----------------|------|
| 5 | ✅ 稳定 | ✅ 稳定 | 默认值 |
| 10 | ✅ 稳定 | ✅ 稳定 | **推荐批量 ingest** |
| 50 | ❌ 429→401 | ❌ 429 | 两边都打爆，大量失败 |

**推荐设置**：
- 增量同步（≤20 文件）：默认 `INGEST_CONCURRENCY=5`
- 批量 ingest（>20 文件）：`INGEST_CONCURRENCY=10`
- ⚠️ **禁止超过 10**：实测 50 会触发 NewAPI 401 封号保护 + Azure 429 限流，导致大量失败需要重跑

⚠️ **简化写法**：实际执行时可以合并为一个 node -e 调用读取所有变量，避免 6 次 cat。

## 执行步骤

### 0. 读取配置

读取 `.claude/skills/onenote/config.json` 获取 `outputDir`。
不存在 → 提示先运行 `/onenote-export`。

### 1. 判断操作模式

根据 `{args}` 决定模式：

- **空 / 无参数** → 增量同步模式（步骤 2-6）
- **`init`** → 初始化模式（步骤 A）
- **`status`** → 仅查看变更（步骤 2，显示结果后结束）
- **`full`** → 全量模式（步骤 F）

---

### 模式 A：初始化（`/rag-sync init`）

**场景**：已通过 CLI 完成全量 ingest，需要建立 manifest 基线。

1. 确认 lancedb 目录存在（说明已有全量数据）
2. 运行：
   ```bash
   node .claude/skills/rag-sync/manifest.mjs build "{outputDir}"
   ```
3. 显示结果：记录了多少文件
4. 完成

---

### 模式 F：全量重建（`/rag-sync full`）

**场景**：模型变更、数据损坏、需要重建。

⚠️ **全量重建会删除所有现有向量数据并重新 embed 全部文件，耗时很长。** 必须反复确认：
1. 第一次确认：告知用户将删除现有向量数据并重建，询问是否继续
2. 第二次确认：显示预估文件数和耗时，再次询问 "确定要全量重建吗？"
3. 用户两次都确认后才执行

执行步骤：
1. 删除 lancedb 目录
2. 解析真实路径（同 Step 3.5），用 CLI 执行全量 ingest（**不加 `--skip-existing`**，这是唯一不加的场景）：
   ```bash
   node dist/index.js ingest --base-dir "$REAL_BASE" "$REAL_ONENOTE"
   ```
   ⚠️ 后台运行（`run_in_background: true`），大量文件可能需要 1-2 小时。
3. 完成后运行 `manifest.mjs build` 构建 manifest
4. 显示摘要

---

### 增量同步模式（默认）

#### 2. 检测变更

运行 diff 命令：
```bash
node .claude/skills/rag-sync/manifest.mjs diff "{outputDir}"
```

解析 JSON 输出（用 node 解析避免 Python 编码问题），获取：
- `new[]` — 新增文件
- `modified[]` — 修改文件
- `deleted[]` — 已删除文件
- `summary.unchanged` — 未变文件数

**如果没有变更**（new + modified + deleted = 0）→ 显示 "知识库已是最新" 并结束。

如果是 `status` 模式 → 显示变更摘要后结束，不执行同步。

#### 3. 显示变更摘要

```
📊 变更检测结果：
  新增: 5 个文件
  修改: 3 个文件
  删除: 1 个文件
  未变: 1661 个文件
```

#### 3.5. 解析真实路径（处理 symlink）

`outputDir` 路径中可能包含 symlink。`local-rag` 内部用 `realpathSync` 解析文件路径会跟随 symlink，如果 `--base-dir` 仍用原始路径，`startsWith` 检查会失败。

```bash
# 解析 outputDir 的真实路径（跟随 symlink），取 parent 作为 base-dir
# 注意：realpathSync 在 Windows 返回反斜杠路径，必须转为正斜杠，
# 否则 Bash 双引号展开会把 \U \f 等当转义符吃掉
REAL_ONENOTE=$(node -e "console.log(require('fs').realpathSync('{outputDir}'))" | sed 's|\\\\|/|g')
REAL_BASE=$(dirname "$REAL_ONENOTE")
# 后续所有 --base-dir 用 $REAL_BASE，文件路径用 $REAL_ONENOTE/... 前缀
```

无 symlink 时 `realpathSync` 返回原路径，行为不变。

#### 4. 执行增量同步（CLI）

**4a. 处理新增 + 修改文件**：

⚠️ **所有 ingest 调用必须加 `--skip-existing` 和 `--base-dir "$REAL_BASE"`**。
`--base-dir` 必须使用 resolved 后的真实路径（Step 3.5），否则 symlink 场景下路径校验会失败。

**少量文件（≤ 20 个）**：逐个 CLI 调用，每个 1-2s
```bash
node dist/index.js ingest --skip-existing --base-dir "$REAL_BASE" "$REAL_ONENOTE/{relative_path}"
```

**大量文件（> 20 个）**：按目录批量 ingest，后台运行
```bash
INGEST_CONCURRENCY=10 node dist/index.js ingest --skip-existing --base-dir "$REAL_BASE" "$REAL_ONENOTE/{notebook-name}"
```
CLI 会自动查询 vectordb，跳过已 ingest 的文件，只处理新增文件。

⚠️ **禁止 pipe `| tail` / `| head`**：后台运行时 pipe 会阻塞直到子进程结束，看不到实时进度。正确做法：
- 使用 `run_in_background: true` 直接运行（不加 pipe）
- 完成后用 `tail -30 {output_file}` 读取结果摘要

**4b. 处理删除文件**：

对每个文件调用 MCP 工具（删除操作量少，MCP 够用）：
```
mcp__local-rag__delete_file({ filePath: "{outputDir}/{relativePath}" })
```

#### 5. 更新 Manifest

两种方式（按文件数量选择）：

**少量文件**：逐个更新
```bash
node .claude/skills/rag-sync/manifest.mjs update "{outputDir}" "file1.md" "file2.md" ...
node .claude/skills/rag-sync/manifest.mjs remove "{outputDir}" "deleted1.md" ...
```

**大量文件**：全量重建（更简单可靠）
```bash
node .claude/skills/rag-sync/manifest.mjs build "{outputDir}"
```

#### 6. 显示结果

```
✅ 增量同步完成：
  Ingest: 8 个文件
  删除: 1 个文件
  失败: 0
  耗时: ~15 秒
```

## 与 onenote-export 联动

`/onenote-export` 完成后会自动触发增量 RAG 同步（通过 `config.json` 的 `onenote.autoRagSync` 控制，默认开启）。

- **开关开启**（默认）: export 完成 → 自动 diff → CLI ingest 变更文件 → 更新 manifest
- **开关关闭**: export 完成 → 提示用户手动运行 `/rag-sync`

独立运行 `/rag-sync` 仍然有效，适用于：
- 补齐已 export 但未 embed 的文件
- 手动触发全量重建（`/rag-sync full`）
- 查看待同步状态（`/rag-sync status`）

## MCP vs CLI 分工

| 操作 | 方式 | 原因 |
|------|------|------|
| **ingest / 写入** | CLI (`node dist/index.js ingest`) | 批量并发、进度可见、可后台运行 |
| **delete / 删除** | MCP (`mcp__local-rag__delete_file`) | 量少，MCP 够用 |
| **query / 查询** | MCP (`mcp__local-rag__query_documents`) | Agent 直接调用，语义搜索 |
| **status / 状态** | MCP (`mcp__local-rag__status`) | 快速检查 |

## 注意事项

- Manifest 基于 **mtime + size** 判断变更，重命名文件会被视为"删除旧 + 新增新"
- 如果 manifest 不存在且 lancedb 也不存在 → 提示先运行 `/rag-sync full`
- 如果 manifest 不存在但 lancedb 存在 → 提示运行 `/rag-sync init` 建立基线
- CLI `ingest` 对已存在的文件会自动 delete + re-insert（幂等操作）
- CLI 的 env 变量从 `.mcp.json` 读取，保持与 MCP server 配置一致
- **Embedding API 故障处理**：CLI 内置 3 次 retry。如果 proxy 彻底挂了，CLI 会超时退出，已完成的文件不受影响。恢复后重跑 `/rag-sync` 会增量补齐剩余文件。
