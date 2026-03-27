---
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
| `增量更新 MCVKB` / `同步 MCVKB` | `-NotebookName "MCVKB"` |
| `全量导出 MCVKB` / `重新导出 MCVKB` | `-NotebookName "MCVKB" -Force`（需二次确认） |
| `导出 MCVKB 的 VM+SCIM section` | `-NotebookName "MCVKB" -SectionPath "VM+SCIM"` |
| `再跑一次` / `再来一次` | 重复上一次的导出命令（参数不变） |
| `导出这个页面` + 粘贴链接 | `-Link "{链接}"` |

### 增量更新（默认行为）

默认情况下，脚本会比较 OneNote hierarchy 中每个 page 的 `lastModifiedTime` 与本地 `.md` 文件 frontmatter 中的 `modified` 时间戳：
- **相同** → 跳过（不调用 `GetPageContent()`，大幅节省时间）
- **不同或本地文件不存在** → 重新导出

使用 `-Force` 参数可强制全量重导出（忽略增量检查，行为与之前版本一致）。

> **注意**：增量模式不会删除 OneNote 中已移除的页面对应的本地文件。如需干净同步，使用 `-Force`。

## Skill 配置

配置文件：`.claude/skills/onenote-export/config.json`（skill 自包含，不依赖项目级 config）

```json
{
  "outputDir": "C:\\path\\to\\onenote\\markdown"
}
```

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
- 如果看起来像 URL（包含 `onenote:` 或 `http` 或 `.one`）→ 作为 `-Link` 参数传入
- 否则 → 解析具名参数（`-NotebookName`、`-SectionPath`、`-PageName`、`-Force`）

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
- 增量比较：hierarchy `lastModifiedTime` vs 本地 frontmatter `modified:`，相同则跳过
- frontmatter `modified` 必须存 hierarchy 的 `lastModifiedTime`（不是 page content 的），两者对部分页面不一致
- 文件操作必须用 `-LiteralPath`：page name 常含 `[]`，PowerShell 默认 `-Path` 会当通配符解析
- 同名页面去重：`$usedPaths` hashtable 检测路径冲突，第二个同名页追加 ` (2)` 后缀
- URL path 解码用 `[Uri]::UnescapeDataString()`（保留 `+` 原义），不用 `UrlDecode`
- Page name 中的 `&` 在 URL fragment 中会丢失，脚本用 fuzzy regex 兜底匹配
