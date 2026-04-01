---
name: onenote-export
displayName: OneNote 导出
category: inline
stability: stable
description: "导出/同步/更新 OneNote 笔记本为 Markdown。触发词：OneNote、onenote、同步笔记本、导出笔记、更新笔记本、sync notebook。支持传入 OneNote 链接或 SharePoint URL 自动识别。常用 notebook：MCVKB、Kun Fang OneNote。"
allowed-tools:
  - Bash
  - Read
  - Write
---

# /onenote-export — 导出 OneNote 为 Markdown

将 OneNote 的 notebook/section/page 导出为 Markdown 文件，支持图片提取和 sub-page 层级保留。

## 前置条件

- **Windows** + OneNote 桌面端已安装
- 目标 notebook 需要在 OneNote 桌面端打开过（出现在左侧列表即可，不需要逐页点开）

## 参数

`$ARGUMENTS` 支持以下格式：

```
/onenote-export                                      → 报错，提示需要参数
/onenote-export sync                                 → 增量同步所有已导出的 notebook（无需指定名称）
/onenote-export <onenote-link-or-sharepoint-url>      → 从链接自动识别 notebook+section+page
/onenote-export -NotebookName "Kun Fang OneNote"      → 增量导出该 notebook（只导出有变更的页面）
/onenote-export -NotebookName "Kun Fang OneNote" -Force  → 强制全量重导出
/onenote-export -NotebookName "Kun Fang OneNote" -SectionPath "Rest Plan"   → 导出指定 section
/onenote-export -NotebookName "Kun Fang OneNote" -PageName "^RPT$"          → 导出指定 page（支持正则）
```

### 自然语言映射

用户可能不会用精确参数格式，以下是常见自然语言到参数的映射：

| 用户说的 | 实际参数 |
|----------|----------|
| `同步所有笔记本` / `sync onenote` / `更新所有笔记` | `sync` |
| `增量更新 MCVKB` / `同步 MCVKB` | `-NotebookName "MCVKB"` |
| `全量导出 MCVKB` / `重新导出 MCVKB` | `-NotebookName "MCVKB" -Force`（需二次确认） |
| `导出 MCVKB 的 VM+SCIM section` | `-NotebookName "MCVKB" -SectionPath "VM+SCIM"` |
| `再跑一次` / `再来一次` | 重复上一次的导出命令（参数不变） |
| `导出这个页面` + 粘贴链接 | `-Link "{链接}"` |

### 增量更新（默认行为，3 层检测）

脚本采用 **timestamp + content hash** 三层增量检测，解决 OneNote COM API `lastModifiedTime` 偶发回退/漂移问题：

```
hierarchy lastModifiedTime  vs  本地 frontmatter modified:
  │
  ├─ 相同 → SKIP（不调用 GetPageContent，最快路径）
  │
  └─ 不同 → 调用 GetPageContent，计算 MD5 content hash
              │  vs 本地 frontmatter content_hash:
              │
              ├─ hash 相同 → UPDATE timestamp only（仅更新 frontmatter 时间戳，不重写文件内容）
              │
              └─ hash 不同 → FULL re-export（重新导出整页 + 图片）
```

脚本输出中可区分：`SKIP (unchanged)` / `UPDATE (timestamp only)` / `OK`（完整导出）。

使用 `-Force` 参数可跳过所有增量检查，强制全量重导出。

> **注意**：增量模式不会删除 OneNote 中已移除的页面对应的本地文件。如需干净同步，使用 `-Force`。

### Sync 模式

`/onenote-export sync` 对 `outputDir` 下所有已导出的 notebook 子目录执行增量更新，无需逐个指定 notebook 名称。

- 自动扫描 `outputDir` 下的子目录作为 notebook 列表
- 通过项目 `config.json` → `onenote.syncExclude`（字符串数组）跳过不需要同步的 notebook
- 每个 notebook 独立增量导出，汇总报告结果
- 导出完成后统一执行一次 RAG 同步

## Skill 配置

配置文件：`.claude/skills/onenote-export/config.json`（skill 自包含，不依赖项目级 config）

```json
{
  "outputDir": "C:\\path\\to\\onenote\\markdown"
}
```

### Sync 模式配置

Sync 模式的 exclude 列表存放在**项目级** `config.json`（不是 skill 的 config.json）：

```json
{
  "onenote": {
    "syncExclude": ["Mooncake POD Support Notebook"],
    "autoRagSync": true
  }
}
```

- `onenote.syncExclude`（字符串数组，默认 `[]`）：sync 时跳过的 notebook 名称（大小写不敏感）
- `onenote.autoRagSync`（布尔值，默认 `true`）：导出完成后是否自动 RAG 同步

## 执行步骤

### 0. 参数检查

如果 `$ARGUMENTS` 为空 → 直接报错提示用法，不执行脚本。

### 1. 读取配置 + Onboarding

```bash
cat .claude/skills/onenote-export/config.json
```

检查文件是否存在且包含 `outputDir`：
- **存在** → 提取 `outputDir` 作为 `$OutputBase`，继续
- **不存在（首次使用）** → 执行 onboarding：
  1. 用 `AskUserQuestion` 询问导出目录路径（提示示例：`C:\Users\你的用户名\Documents\OneNote Export`）
  2. 用户提供路径后，写入 `.claude/skills/onenote-export/config.json`：`{"outputDir": "用户输入的路径"}`
  3. 用该路径作为 `$OutputBase` 继续执行

### 2. 解析参数

判断 `$ARGUMENTS` 内容：
- 如果是 `sync`（不区分大小写）→ 进入 **Sync 模式**（见 Step 2.1）
- 如果看起来像 URL（包含 `onenote:` 或 `http` 或 `.one`）→ 作为 `-Link` 参数传入
- 否则 → 解析具名参数（`-NotebookName`、`-SectionPath`、`-PageName`、`-Force`）

### 2.1. Sync 模式（批量增量同步）

当 `$ARGUMENTS` 为 `sync` 时，自动扫描已导出的 notebook 并逐个增量更新：

**a. 扫描已导出 notebook**

```bash
ls -d "{outputDir}"/*/ | xargs -I{} basename "{}"
```

列出 `outputDir` 下所有子目录名（每个子目录 = 一个已导出的 notebook）。

**b. 读取 exclude 列表**

从项目 `config.json`（不是 skill 的 config.json）读取 `onenote.syncExclude`：

```bash
cat config.json | node -e "process.stdin.resume();let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{const e=JSON.parse(d).onenote?.syncExclude||[];console.log(JSON.stringify(e))}catch{console.log('[]')}})"
```

结果是 JSON 数组，如 `["Mooncake POD Support Notebook"]`。从 notebook 列表中过滤掉这些名称（大小写不敏感）。

**c. 读取 Scope 文件并逐个增量导出**

对每个未被 exclude 的 notebook，先读取其 `.export-scope.json`，然后按 scope 调用 PS1 脚本：

```bash
# 读取 scope 文件
SCOPE_FILE="{outputDir}/{notebookName}/.export-scope.json"
if [ -f "$SCOPE_FILE" ]; then
  SCOPE_JSON=$(cat "$SCOPE_FILE")
  SECTIONS=$(echo "$SCOPE_JSON" | node -e "process.stdin.resume();let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{const s=JSON.parse(d).sections;console.log(s?JSON.stringify(s):'null')}catch{console.log('null')}})")
  PAGES=$(echo "$SCOPE_JSON" | node -e "process.stdin.resume();let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{const p=JSON.parse(d).pages;console.log(p&&p.length?JSON.stringify(p):'null')}catch{console.log('null')}})")
fi
```

**有 scope 文件**：

**处理 `sections`**：
- `sections` 为 `null` 且 `pages` 也为 `null`/`[]` → 全量同步（不传 `-SectionPath`）
- `sections` 为数组 → 合并 `sections` + `autoDiscovered`，对每个 section 分别调用脚本（传 `-SectionPath "{section}"`）

**检测 autoDiscovered section**：

每个 section 导出完成后，解析脚本输出中的 `OK`/`UPDATE` 行，提取每个导出页面的实际 section path（格式：`[n/total] (pct%) SectionPath\PageName OK`）。如果某页面的 section path 不匹配当前 scope 中任何 `sections` 或 `pages` 条目，说明 `-SectionPath` 子串匹配意外捕获了额外 section。将这些多出的 section path 追加到 `autoDiscovered` 数组（去重），并在汇总报告中提示用户。

> **注意**：PS1 脚本**不会**跟随页面内的 OneNote 链接导出其他 section。autoDiscovered 的主要触发场景是 `-SectionPath` 的子串匹配过于宽泛（如 `"Process"` 意外匹配到 `"Project-based Support"`）。

```bash
# sections = null 且 pages = null → 全量
powershell -NoProfile -STA -File .claude/skills/onenote-export/scripts/export-onenote.ps1 -NotebookName "{notebookName}" -OutputBase "{outputDir}"

# sections = ["Identity", "Storage"] → 逐 section
powershell -NoProfile -STA -File .claude/skills/onenote-export/scripts/export-onenote.ps1 -NotebookName "{notebookName}" -SectionPath "Identity" -OutputBase "{outputDir}"
powershell -NoProfile -STA -File .claude/skills/onenote-export/scripts/export-onenote.ps1 -NotebookName "{notebookName}" -SectionPath "Storage" -OutputBase "{outputDir}"
```

**处理 `pages`**（section + page 级别的精确范围）：
- `pages` 为数组 → 对每个 `{section, page}` 条目，传 `-SectionPath "{section}" -PageName "^{page}$"`
- `-PageName` 使用正则精确匹配（`^...$`），避免匹配到同名子串
- 脚本内置逻辑会自动包含匹配 page 的所有 sub-page

```bash
# pages = [{"section": "Manual", "page": "Topic List"}] → 逐 page
powershell -NoProfile -STA -File .claude/skills/onenote-export/scripts/export-onenote.ps1 -NotebookName "{notebookName}" -SectionPath "Manual" -PageName "^Topic List$" -OutputBase "{outputDir}"
```

**混合场景**（`sections` + `pages` 都有值）：先处理所有 `sections` 条目，再处理所有 `pages` 条目，分别调用脚本。

**无 scope 文件**：用 `AskUserQuestion` 提示用户选择同步范围：
```
Notebook "{notebookName}" 没有 .export-scope.json，首次 sync 需要确认范围：
1. 全量同步（所有 sections）
2. 选择 sections（列出本地已有的 section 目录供选择）
3. 跳过此 notebook
```
- 选择 1 → 全量同步，并写入 `.export-scope.json`（sections: null）
- 选择 2 → 列出本地 `{outputDir}/{notebookName}/` 下的 section 目录，用户选择后同步选中的，并写入 scope 文件
- 选择 3 → 跳过

⚠️ 同样遵守 Step 3 的所有约束（`powershell` not `pwsh`、`-STA`、`timeout: 600000`、一行命令）。

**d. 汇总结果**

每个 notebook 导出完成后收集其 summary（Success/Skipped/Errors 计数）。全部完成后输出汇总表：

```
📓 Sync 完成（N 个 notebook）
  Kun Fang OneNote: 5 exported, 120 skipped, 0 errors
  MCVKB:           2 exported, 85 skipped, 0 errors
  ----
  Excluded: Mooncake POD Support Notebook
```

然后跳转到 Step 6（RAG Sync），对所有变更文件统一执行一次 RAG 同步。

**⚠️ Sync 模式不执行 Step 2.5 和 Step 3-5**，它有自己的循环逻辑（Step 2.1c）。Step 4（处理输出）和 Step 5（报告结果）的逻辑整合在 Step 2.1d 中。

### 2.5. `-Force` 二次确认（安全门）

🔴 **当用户请求全量导出（`-Force`）且没有 `-SectionPath` / `-PageName` 过滤时，必须在执行前用 `AskUserQuestion` 二次确认**：

> `-Force` 全量导出会先删除 `{outputDir}/{NotebookName}` 整个目录再重建。确认要继续吗？
> - ✅ 确认，全量重导出
> - ❌ 取消，改用增量更新（去掉 `-Force`）

**原因**：全量删除不可逆，增量模式已经能正确处理大部分场景。只有以下情况才需要 `-Force`：
- OneNote 中删除了大量页面，需要清理本地残留
- 怀疑本地文件损坏需要完全重建
- 首次导出（本地目录为空时 `-Force` 和增量效果一样，无需确认）

**豁免条件**（无需确认）：
- 带 `-SectionPath` 或 `-PageName` 过滤的 `-Force`（影响范围有限）
- 本地输出目录不存在（首次导出，无数据丢失风险）

### 3. 调用脚本

⚠️ **关键约束（必须全部遵守，否则会报错）**：

1. **必须用 `powershell`，不能用 `pwsh`** — OneNote COM 是 STA 对象，`pwsh`（PS7）默认 MTA 会导致 HRESULT 错误
2. **必须加 `-STA` 参数** — 同上原因
3. **必须设 `timeout: 600000`** — 大 notebook（1000+ 页）需要 10-15 分钟，默认 2 分钟会被强制终止
4. **命令必须写成一行** — Windows 的 bash 不支持 `\` 换行续行

正确的调用方式：

```bash
# 链接模式
powershell -NoProfile -STA -File .claude/skills/onenote-export/scripts/export-onenote.ps1 -Link "{link}" -OutputBase "{outputDir}"

# 具名参数模式（增量）
powershell -NoProfile -STA -File .claude/skills/onenote-export/scripts/export-onenote.ps1 -NotebookName "{notebookName}" -OutputBase "{outputDir}"

# 带 section/page 过滤
powershell -NoProfile -STA -File .claude/skills/onenote-export/scripts/export-onenote.ps1 -NotebookName "{notebookName}" -SectionPath "{sectionPath}" -PageName "{pageName}" -OutputBase "{outputDir}"

# 强制全量重导出
powershell -NoProfile -STA -File .claude/skills/onenote-export/scripts/export-onenote.ps1 -NotebookName "{notebookName}" -OutputBase "{outputDir}" -Force
```

**注意**：
- `-OutputBase` 是 base 目录，脚本内部会追加 notebook 名称子目录
- 输出结构为 `{OutputBase}/{NotebookName}/Section/Page.md`

### 4. 处理输出

⚠️ **输出通常很大（100KB+），会被保存到 persisted-output 文件**。
- 不要只看 preview（只有前 2KB）
- 必须读取 persisted-output 文件的**最后 20 行**来获取 summary
- 或者用 `Select-String` 过滤关键行：

```bash
powershell -NoProfile -Command "Get-Content '{persisted-output-file}' | Select-String '=== Export|Success:|Skipped:|Errors:|Images:|Output:'"
```

### 5. 报告结果

脚本输出会包含：
- 导出模式（incremental 或 full (forced)）
- 导出的页数（Success: N / Total (exported)）
- 跳过的页数（Skipped: N (unchanged)）— 仅增量模式
- 导出的图片数（Images: N exported）
- 输出路径（Output: ...）
- 错误信息（如有）

汇总这些信息报告给用户。增量模式下，如果有少量页面被导出，可以用 `Select-String ' OK$'` 列出具体是哪些页面有变更。

### 5.5. 写入 Export Scope（导出范围记忆）

每次导出完成后（不含 sync 模式），将导出范围写入 notebook 输出目录的 `.export-scope.json`，供后续 sync 读取。

**写入时机**：Step 5 报告结果之后、Step 6 RAG Sync 之前。

**文件位置**：`{outputDir}/{NotebookName}/.export-scope.json`

#### Scope 文件 Schema

```json
{
  "notebookName": "MCVKB",
  "sections": ["Identity", "General"],
  "pages": [
    { "section": "Manual", "page": "Topic List" }
  ],
  "autoDiscovered": [],
  "lastSync": "2026-04-01T16:00:00Z"
}
```

**字段说明**：

| 字段 | 类型 | 含义 |
|------|------|------|
| `notebookName` | string | notebook 名称 |
| `sections` | string[] \| null | section 级范围。`null`=全量导出，`[]`=无 section 级范围（仅 pages） |
| `pages` | object[] | page 级精确范围。`{ "section": "路径", "page": "名称" }` |
| `autoDiscovered` | string[] | sync 时检测到的 scope 外 section（子串匹配宽泛导致） |
| `lastSync` | string | 上次导出的 ISO 时间戳 |

**语义约束**：
- `sections: null` → 全量导出整个 notebook（`pages` 和 `autoDiscovered` 被忽略）
- `sections: [...]` + `pages: [...]` → 混合范围（section 级 + page 级）
- `sections: []` + `pages: [...]` → 仅 page 级范围
- `sections: []` + `pages: []` → **无效状态**，视为全量（等同 `null`），在报告中 warn

#### URL/Link 模式 — 先询问再写入

当导出是通过 URL/Link 触发时（Step 2 中识别为链接），PS1 脚本会从 URL 中解析出最细粒度：
- URL 包含 `.one` 文件名 → 解析出 **section**
- URL 包含 fragment（`#` 后面）→ 解析出 **page name**
- 两者都有 → 粒度为 **section + page**，否则为 **section**

导出完成后，执行**包含关系检测**（见下方），如果已被覆盖则跳过写入。否则用 `AskUserQuestion` 询问：

```
导出完成。是否将此范围添加到 .export-scope.json，以便后续 /onenote-export sync 自动更新？

导出范围：
  Notebook: {notebookName}
  Section: {sectionPath}
  Page: {pageName}（如有）

1. 是 — 添加到 scope，后续 sync 自动更新
2. 否 — 仅本次导出，不记录 scope
```

- 选择 1 → 按下方包含关系规则写入 scope 文件
- 选择 2 → 跳过 scope 写入，直接进入 Step 6

#### 具名参数模式 — 自动写入

当导出是通过 `-NotebookName` + `-SectionPath` / `-PageName` 触发时，自动写入 scope 文件（无需询问），同样遵守包含关系规则。

#### Scope 包含关系检测与合并（排他性规则）

写入 scope 前必须检测新范围与已有 scope 的包含关系，**宽范围自动吞并窄范围**：

```
新增范围 vs 已有 scope → 决策
─────────────────────────────────────────────────────────
全量导出（无 -SectionPath）
  → sections = null, pages = [], autoDiscovered = []
  → 最宽范围，清除一切已有的 section/page 级 scope

新增 section "A"
  → 检查 sections 是否为 null
    ├─ null（已全量）→ 跳过，已被覆盖
    └─ 非 null →
        ├─ "A" 已在 sections[] → 跳过，已存在
        ├─ "A" 不在 sections[] → 追加
        └─ pages[] 中有 section="A" 的条目 → 删除这些 page 条目
           （section 级覆盖了 page 级，page 级冗余）

新增 page { section: "A", page: "X" }
  → 检查 sections 是否为 null
    ├─ null（已全量）→ 跳过，已被覆盖
    └─ 非 null →
        ├─ "A" 已在 sections[] → 跳过，section 级已覆盖此 page
        ├─ pages[] 已有 { section: "A", page: "X" } → 跳过，已存在
        └─ 以上都不满足 → 追加到 pages[]
```

**示例演进**：
```bash
# 1. 首次导出一个 page
/onenote-export -NotebookName "NB" -SectionPath "Manual" -PageName "^Topic$"
# → scope: { sections: [], pages: [{"section":"Manual","page":"Topic"}] }

# 2. 再加一个 page（同 section）
/onenote-export -NotebookName "NB" -SectionPath "Manual" -PageName "^Guide$"
# → scope: { sections: [], pages: [...Topic, ...Guide] }

# 3. 升级到 section 级 — page 级条目被自动清理
/onenote-export -NotebookName "NB" -SectionPath "Manual"
# → scope: { sections: ["Manual"], pages: [] }  ← Topic/Guide 的 page 条目被删除

# 4. 再加另一个 section
/onenote-export -NotebookName "NB" -SectionPath "Storage"
# → scope: { sections: ["Manual", "Storage"], pages: [] }

# 5. 全量导出 — 清除一切
/onenote-export -NotebookName "NB"
# → scope: { sections: null, pages: [] }

# 6. 全量后再加 section → 跳过（null 已覆盖）
/onenote-export -NotebookName "NB" -SectionPath "Identity"
# → scope: { sections: null }  ← 不变，null 已覆盖一切
```

**⚠️ Sync 模式不写 scope 文件**（sync 是消费者，不是生产者）。

### 6. 自动 RAG Sync（联动 embedding）

导出完成后，自动将变更的文件同步到 local-rag 向量数据库。

**开关**: 读取 `config.json` 的 `onenote.autoRagSync`（默认 `true`）。

```bash
# 检查开关
AUTO_RAG=$(cat config.json | node -e "process.stdin.resume();let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{console.log(JSON.parse(d).onenote?.autoRagSync!==false)}catch{console.log('true')}})")
```

**如果 `autoRagSync === false`** → 跳过，在报告中提示 "RAG 同步已关闭，如需同步请运行 `/rag-sync`"

**如果 `autoRagSync !== false`（默认行为）** → 执行增量 RAG 同步：

#### 6a. 检测待 embed 文件

```bash
OUTPUT_DIR="{outputDir}"  # 从 Step 1 获取
node .claude/skills/rag-sync/manifest.mjs diff "$OUTPUT_DIR"
```

解析 JSON 输出获取 `new[]` + `modified[]` + `deleted[]`。

**如果没有变更** → 跳过，报告 "RAG 知识库已是最新"

#### 6b. 执行增量 ingest（CLI 方式）

⚠️ **必须先注入环境变量**，否则 `EMBEDDING_PROVIDER` 默认为 `local`（Ollama），会因 Ollama 未运行而失败。

**第一步：从 `.mcp.json` 注入 local-rag 环境变量**（每次 Bash 调用都需要）：
```bash
eval $(cat .mcp.json | node -e "
  process.stdin.resume();let d='';
  process.stdin.on('data',c=>d+=c);
  process.stdin.on('end',()=>{
    const e=JSON.parse(d).mcpServers['local-rag'].env;
    for(const[k,v]of Object.entries(e)) console.log('export '+k+'='+JSON.stringify(v));
  })
")
```

**第二步：分类处理 new / modified / deleted**

manifest diff 返回三类文件，需要不同处理策略：

| 类型 | 处理方式 | 说明 |
|------|---------|------|
| `new[]` | `--skip-existing` ingest | 向量库中不存在，直接 ingest |
| `modified[]` | **不加** `--skip-existing` ingest | 向量库中已存在但内容变更，工具会自动 delete 旧 chunks + re-insert |
| `deleted[]` | `mcp__local-rag__delete_file()` | 本地文件已删除，清理向量库 |

**处理 `new[]` — 新增文件（加 `--skip-existing`）**：

少量（≤ 20）逐个调用：
```bash
cd "$HOME/.claude/mcp-servers/local-rag" && \
  node dist/index.js ingest --skip-existing "{absolute_path_to_file}"
```

大量（> 20）按目录批量，后台运行：
```bash
cd "$HOME/.claude/mcp-servers/local-rag" && \
  INGEST_CONCURRENCY=10 node dist/index.js ingest --skip-existing "{outputDir}/{notebook-name}"
```

**处理 `modified[]` — 内容变更文件（不加 `--skip-existing`）**：

⚠️ `modified` 文件必须**不加 `--skip-existing`**，否则会被跳过。ingest 工具检测到已存在的文件会自动 delete 旧 chunks 再 re-insert。

少量（≤ 20）逐个调用：
```bash
cd "$HOME/.claude/mcp-servers/local-rag" && \
  node dist/index.js ingest "{absolute_path_to_modified_file}"
```

大量（> 20）逐个调用（⚠️ 不能用目录级 ingest，否则会重跑所有文件）：
```bash
# 逐个文件，不加 --skip-existing
for f in "{file1}" "{file2}" ...; do
  cd "$HOME/.claude/mcp-servers/local-rag" && node dist/index.js ingest "$f"
done
```

**处理 `deleted[]` — 已删除文件**：
```
mcp__local-rag__delete_file({ filePath: "{outputDir}/{relativePath}" })
```

⚠️ **禁止 pipe `| tail` / `| head`**：后台运行时 pipe 会阻塞直到子进程结束，看不到实时进度。正确做法：
- 使用 `run_in_background: true` 直接运行（不加 pipe）
- 完成后用 `tail -30 {output_file}` 读取结果摘要

🚨 **禁止不加 `--skip-existing` 的目录级 ingest**：不加此参数会对所有文件执行 delete + re-insert，
造成数小时的无谓重跑。唯一不加的场景是 `/rag-sync full`（全量重建），且需要用户反复确认。
对 modified 文件必须逐个调用，不能用目录级。

#### 6c. 更新 Manifest

少量文件逐个更新，大量文件直接 rebuild：
```bash
# 少量（≤ 20）
node .claude/skills/rag-sync/manifest.mjs update "$OUTPUT_DIR" "file1.md" "file2.md" ...
node .claude/skills/rag-sync/manifest.mjs remove "$OUTPUT_DIR" "deleted1.md" ...

# 大量（> 20）— 直接 rebuild 更简单
node .claude/skills/rag-sync/manifest.mjs build "$OUTPUT_DIR"
```

#### 6d. 报告 RAG 同步结果

```
🔗 RAG 自动同步完成：
  Ingest: {N} 个文件
  删除: {M} 个文件
  失败: {K}
```

> **注意**: 大批量首次 embed（如 479 个文件）可能需要 5-10 分钟。
> 如需关闭自动同步，修改 `config.json` 的 `onenote.autoRagSync` 为 `false`。

## 输出目录结构

```
{outputDir}/
  {NotebookName}/
    SectionA/
      Page1.md                  ← Level 1 page
      Page1/                    ← sub-page 目录（以 parent page 名命名）
        SubPage1.md             ← Level 2 sub-page
        SubPage1/
          SubSubPage.md         ← Level 3 sub-sub-page
      assets/
        Page1-1.png
        SubPage1-1.png
    SectionGroup/
      SectionB/
        ...
```

sub-page 层级完整保留：OneNote 中 `Section > ADFS > Management UI > RPT` 会导出为
`Section/ADFS/Management UI/RPT.md`。

同名页面自动去重：同 section 下同名同级的页面，第二个会导出为 `PageName (2).md`。

## 打包导出到其他项目

整个 skill 自包含在 `.claude/skills/onenote-export/` 目录下：

```
.claude/skills/onenote-export/
  SKILL.md                      ← skill 定义（打包）
  scripts/
    export-onenote.ps1          ← 导出脚本（打包）
  config.json                   ← 用户配置（不打包，onboarding 自动生成）
```

导出方法：
```bash
# 复制 skill 到目标项目（排除 config.json）
rsync -av --exclude='config.json' .claude/skills/onenote-export/ /path/to/other-project/.claude/skills/onenote-export/
```

目标项目首次调用 `/onenote-export` 时会自动触发 onboarding，询问输出目录。

## 错误处理

- 无参数 → 提示用法
- Notebook 不存在 → 脚本会列出所有可用 notebook 及其 sections
- Link 无法解析出 notebook → 脚本会列出可用 notebook
- Section/Page 无匹配 → 脚本会列出可用 sections

## 技术备忘

- OneNote COM API：`New-Object -ComObject OneNote.Application`
- `GetHierarchy("", 4, ...)` — 4=hsPages，拉取完整层级（含 `lastModifiedTime` 属性）
- `GetPageContent(id, ..., 3)` — 3=piAll，包含图片二进制（最耗时操作，增量模式跳过未变更页面避免调用）
- **三层增量检测**：① hierarchy `lastModifiedTime` vs 本地 frontmatter `modified:` → 相同则 SKIP；② 不同时计算 MD5 content hash vs frontmatter `content_hash:` → 相同则 UPDATE timestamp only；③ hash 也不同则 FULL re-export
- frontmatter `modified` 必须存 hierarchy 的 `lastModifiedTime`（不是 page content 的），两者对部分页面不一致
- OneNote `lastModifiedTime` 存在漂移/回退现象（同一页面两次 GetHierarchy 返回不同时间戳），content hash 是兜底方案
- 文件操作必须用 `-LiteralPath`：page name 常含 `[]`，PowerShell 默认 `-Path` 会当通配符解析
- **`-SectionPath` 过滤**：使用 `.IndexOf(filterPath, OrdinalIgnoreCase)` 子串匹配（不用 `-like` 避免 `[]` 被当通配符）
- **`-PageName` 过滤**：PowerShell `-match` 正则匹配，支持 `^...$` 精确匹配。自动 forward-scan 包含子页面（pageLevel 更深的后续页面）
- **PS1 脚本不跟随链接**：页面内的 `onenote:` 链接只转换为 `[[PageName]]` markdown 引用，不会把链接目标添加到导出队列
- **导出输出格式**：`[n/total] (pct%) Section\Page OK` / `SKIP (unchanged)` / `UPDATE (timestamp only)` / `FAILED: msg`
- 同名页面去重：`$usedPaths` hashtable 检测路径冲突，第二个同名页追加 ` (2)` 后缀
- URL path 解码用 `[Uri]::UnescapeDataString()`（保留 `+` 原义），不用 `UrlDecode`
- Page name 中的 `&` 在 URL fragment 中会丢失，脚本用 fuzzy regex 兜底匹配
- **Link 解析粒度**：URL → `.one` 文件名提取 section → `#` fragment 提取 page name → 最终生成 `-SectionPath` + `-PageName "^fuzzy$"`
