# /rag-sync — 增量同步 OneNote 知识库到 Local RAG

增量同步已导出的 OneNote Markdown 文件到 local-rag 向量数据库。
通过 manifest 文件跟踪文件状态，只对新增/修改的文件执行 ingest，删除已移除的文件。

## 前置条件

- 已使用 `/onenote-export` 导出 notebook
- local-rag MCP server 正常运行
- 首次使用需先完成一次全量 ingest（见下方"初始化"）

## 参数

`{args}` = 可选操作模式

```
/rag-sync           → 增量同步（默认）
/rag-sync init      → 全量 ingest 后构建 manifest（首次使用）
/rag-sync status    → 查看变更摘要，不执行同步
/rag-sync full      → 强制全量重新 ingest
```

## 文件结构

- **Manifest**: `{outputDir}/.rag-manifest.json` — 记录每个文件的 mtime + size
- **脚本**: `.claude/skills/rag-sync/manifest.mjs` — 文件变更检测
- **配置**: 复用 `.claude/skills/onenote-export/config.json` 的 `outputDir`

## 执行步骤

### 0. 读取配置

读取 `.claude/skills/onenote-export/config.json` 获取 `outputDir`。
不存在 → 提示先运行 `/onenote-export`。

### 1. 判断操作模式

根据 `{args}` 决定模式：

- **空 / 无参数** → 增量同步模式（步骤 2-5）
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

1. 提示用户确认（会删除现有向量数据）
2. 删除 lancedb 目录
3. 执行全量 ingest：
   ```bash
   cd "{projectRoot}" && MODEL_NAME=jinaai/jina-embeddings-v2-base-zh npx mcp-local-rag ingest "{outputDir}"
   ```
   后台运行，等待完成。
4. 完成后运行 `manifest.mjs build` 构建 manifest
5. 显示摘要

---

### 增量同步模式（默认）

#### 2. 检测变更

运行 diff 命令：
```bash
node .claude/skills/rag-sync/manifest.mjs diff "{outputDir}"
```

解析 JSON 输出，获取：
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

#### 4. 执行增量同步

**4a. 处理新增 + 修改文件**：

对每个文件调用 MCP 工具：
```
mcp__local-rag__ingest_file({ filePath: "{outputDir}/{relativePath}" })
```

- 并行处理（每次最多 5 个文件并行调用）
- 每个文件完成后记录结果
- 失败的文件记录错误，继续处理其他文件

**4b. 处理删除文件**：

对每个文件调用 MCP 工具：
```
mcp__local-rag__delete_file({ filePath: "{outputDir}/{relativePath}" })
```

#### 5. 更新 Manifest

将成功处理的文件更新到 manifest：

```bash
# 更新新增+修改的文件记录
node .claude/skills/rag-sync/manifest.mjs update "{outputDir}" "file1.md" "file2.md" ...

# 移除已删除的文件记录
node .claude/skills/rag-sync/manifest.mjs remove "{outputDir}" "deleted1.md" ...
```

#### 6. 显示结果

```
✅ 增量同步完成：
  成功 ingest: 8 个文件
  成功删除: 1 个文件
  失败: 0
  耗时: ~15 秒
```

## 与 onenote-export 集成

`/onenote-export` 完成后可自动提示运行 `/rag-sync` 同步知识库。
后续可在 onenote-export 的 SKILL.md 末尾添加自动触发。

## 注意事项

- Manifest 基于 **mtime + size** 判断变更，重命名文件会被视为"删除旧 + 新增新"
- 如果 manifest 不存在且 lancedb 也不存在 → 提示先运行 `/rag-sync full` 或 `/rag-sync init`
- 如果 manifest 不存在但 lancedb 存在 → 提示运行 `/rag-sync init` 建立基线
- `ingest_file` MCP 工具内部会自动 delete + re-insert，所以修改文件直接调用即可
