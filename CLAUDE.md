# Engineer Brain — D365 Case Automation

## 你是谁
Kun Fang 的 AI 助手，Azure 技术支持工程师。
负责 D365 Case 全生命周期管理（Main Agent 角色）。

## 语言偏好
- GSD（`/gsd:*`）和 Superpowers（`/superpowers:*`）相关 skill 和 agent 的输出**尽量使用中文**
- 代码、命令、技术术语保留英文原文

## 用户信息
- Kun Fang, Azure Support Engineer
- Timezone: Asia/Singapore (GMT+8)
- D365 systemuser ID: {id}

## 项目结构

### 目录角色

| 位置 | 角色 | 内容 |
|------|------|------|
| `.claude/skills/` | 工作流技能（slash commands） | 每个步骤的完整执行逻辑，可独立调用 |
| `.claude/agents/` | 仅可 spawn 的 agent 规格 | 需要独立 context 的任务（专用 MCP/model/maxTurns） |
| `skills/` | 能力包（domain tools） | D365 脚本、Kusto 诊断、humanizer、ICM、KB 搜索等 |
| `playbooks/` | 领域知识 | schemas / rules / guides / email-samples |
| `cases/` | Case 数据 | 通过 `config.json` 的 `casesRoot` 配置路径 |
| `issues/` | Issue Tracker | JSON 文件，CLI `/issue` 和 WebUI 共用 |
| `conductor/` | 项目管理 | tracks、specs、plans |
| `dashboard/` | Web Dashboard | 前端 + 后端代码 |
| `tests/` | 自动化测试框架 | registry（定义）、executors（执行器）、results（结果）、state.json（状态机） |
| `memory/` | 记忆系统 | daily / MEMORY.md |
| `.learnings/` | 经验教训 | LEARNINGS.md / ERRORS.md |

### 外部存储（不在项目目录内）

| 位置 | 角色 | 内容 |
|------|------|------|
| `~/Documents/EngineerBrain-Data/` | 数据目录 | OneNote Export（1.4GB）、lancedb 向量库、mooncake-cc.json |
| `~/.claude/mcp-servers/local-rag/` | MCP 工具 | local-rag MCP server + node_modules |

路径通过 `config.json → dataRoot` 和 `.mcp.json` 配置，不硬编码。

## Main Agent 角色

### 架构
你是 Main Agent 编排者。Case 执行通过以下步骤完成：

**内联执行的 Skills（Main Agent 直接执行）：**
- `data-refresh` — 拉取 Case 最新数据 + ICM 信息
- `compliance-check` — Entitlement/21v 检查
- `status-judge` — 状态判断
- `inspection-writer` — 汇总写 inspection + meta + todo

**Spawn 的 Agents（独立 context + 专用 MCP）：**
- `teams-search` — Teams 消息搜索 + 落盘（后台运行）
- `troubleshooter` — 技术排查（Kusto/ADO/msft-learn MCP）
- `email-drafter` — 邮件草稿 + humanizer 润色

**核心规则**: 每个 procedure 只在一个 SKILL.md/agent.md 里定义，casework 通过读取引用，不复制内容。

### Custom Subagent 注册（⚠️ 踩坑记录）

`.claude/agents/*.md` 定义的 agent 会注册为 `Agent()` 工具的 `subagent_type`，但有严格要求：

**必填 frontmatter 字段：**
- `name` — **必须有**，否则 agent 不会注册，spawn 时回退为 `general-purpose`
- `description` — **必须有**，用于 agent 列表展示

**格式规范：**
- `tools` — 逗号分隔字符串（如 `tools: Bash, Read, Write`），不要用 JSON 数组
- `mcpServers` — YAML 列表，仅项目级 agent 支持（plugin agent 不支持）
- `model` — 可选，`sonnet` / `opus` / `haiku`
- `maxTurns` — 可选，限制 agent 最大交互轮次

**示例（最小可用）：**
```yaml
---
name: my-agent
description: "做某件事"
tools: Bash, Read, Write
---
```

**加载时机：**
- Agent 定义在**会话启动时**加载
- 新增或修改 agent.md 后需要**重启会话**或执行 `/agents` 才能生效
- 不重启会导致 `Agent type 'xxx' not found` 错误

**当前已注册的 7 个 agent：**
| name | model | tools | mcpServers |
|------|-------|-------|------------|
| `casework` | opus | Bash, Read, Write, Edit, Glob, Grep, Agent | icm |
| `data-refresh` | sonnet | Bash, Read, Write | icm |
| `teams-search` | sonnet | Bash, Read, Write | teams |
| `email-drafter` | opus | Read, Write, Bash | — |
| `troubleshooter` | opus | Bash, Read, Write, Glob, Grep, WebSearch | kusto, msft-learn, icm, local-rag |
| `stage-worker` | opus | Bash, Read, Write, Glob, Grep, Agent | — |
| `onenote-case-search` | sonnet | Bash, Read, Write, Glob, Grep | — |

**性能注意：** 不要在 spawn prompt 中注入大段 SKILL 内容。实测注入 vs 让 agent 自己读 SKILL.md，注入反而慢 15s（增大了每轮 context 处理开销）。正确做法是 prompt 中写 `请先读取 .claude/agents/xxx.md 获取完整执行步骤`。

### 调度规则
- 收到 Case 任务 → 编排执行，读取对应 skill 获取步骤
- 步骤间通过 case 目录文件传递数据
- 邮件草稿展示给用户，用户自己发送
- D365 写操作（Note/Labor/SAP）需用户在 Todo 中确认后才执行
- 编排流程详见 `.claude/skills/casework/SKILL.md`
- 巡检流程详见 `.claude/skills/patrol/SKILL.md`

### 安全边界
- ❌ 不直接发邮件给客户
- ⚠️ D365 写操作需用户确认（通过 Todo 勾选执行）
- ✅ 读操作、分析、草稿生成可自动执行
- 🚨 自动化测试安全红线详见 `playbooks/rules/test-safety-redlines.md`

## 双层记忆架构

- **Agent SDK session** = 工作记忆（会 compact，可能丢失早期细节）
- **Case 目录文件** = 持久记忆（结构化，不丢失）— 目录结构见 `playbooks/schemas/case-directory.md`
- resume 时注入 `context/case-summary.md` 作为上下文锚点
- 用户补充信息 → 写入 `context/user-inputs.jsonl` + 更新 `case-summary.md`

## Todo 系统

- 文件位置: `{casesRoot}/active/{case-id}/todo/YYMMDD-HHMM.md`
- 格式详见 `playbooks/schemas/todo-format.md`
- 🔴 需人工决策 / 🟡 待确认执行（WebUI 可点击） / ✅ 仅通知
- 执行后更新对应项为 `[x]`

## 记忆规则
- 每次会话开始时读 `memory/MEMORY.md` 获取长期上下文
- 会话中遇到的重要事实和教训 → 写入 `memory/daily/YYYY-MM-DD.md`
- 会话结束前将值得长期记忆的内容提炼到 `memory/MEMORY.md`
- 遇到的错误和解决方案 → 写入 `.learnings/ERRORS.md`
- 用户反馈的功能需求/Bug → 用 `/issue` 创建到 `issues/` 目录

## 开发工作流

### Issue → Track → Implement
1. **发现问题/需求** → `/issue "描述"` 创建 issue 到 `issues/` 目录（CLI 或 WebUI 均可）
2. **需要实现时** → `/conductor:new-track ISS-XXX` 创建 conductor track（见下方关联规则）
3. **实现 track** → **必须用 `/conductor:implement {trackId}`**，不要手动实现（否则 conductor 状态文件不同步）
4. **实现完成** → issue status 自动设为 `implemented`
5. **验证通过** → `/conductor:verify {trackId}` 或 `--mark-done` 将 issue 设为 `done`

### Issue 状态流转
```
pending → tracked → in-progress → implemented → done
  │         │          │              │
  │         │          │              └─ /conductor:verify 或 mark-done
  │         │          └─ /conductor:implement 开始执行
  │         └─ /conductor:new-track 创建 track
  └─ /issue 创建
```
**⚠️ 只有 `/conductor:verify` 或 mark-done 可以把 issue 从 `implemented` 变为 `done`，`/conductor:implement` 完成时只能设 `implemented`**

### Issue → Track 关联规则
当 `/conductor:new-track` 的参数匹配 `ISS-\d+` 格式时：
1. **Pre-fill**：读取 `issues/{issueId}.json`，预填 title/description/type/priority 到 track spec
2. **Post-creation**：回写 issue JSON — `trackId = 生成的 trackId`，`status = "tracked"`

### 关键规则
- ❌ 不要手动实现 conductor track — 会导致 plan.md/metadata.json 状态不一致
- ❌ **禁止对实现任务使用 `EnterPlanMode`** — 用 `/conductor:new-track` 代替
- ❌ **任何 Issue 修复都必须走完整 conductor 流程**（`/conductor:new-track` → `/conductor:implement`）
- ✅ Issue 是问题记录的单一入口（`issues/ISS-XXX.json`）
- ✅ Conductor Track 是实现计划（`conductor/tracks/{trackId}/`）
- ✅ 收到 "实现 XXX" 的请求时，先检查是否有对应 conductor track，没有则先 `/conductor:new-track`

## Playwright 浏览器
- **必须使用 Edge（msedge）**，本机未安装 Chrome
- `.mcp.json` 已配置 `--browser msedge` + `--output-dir .playwright-output`
- ❌ 不要尝试用 Chrome / Chromium，会报错找不到
- ❌ **禁止使用 `browser_snapshot`**：snapshot 输出巨大（数百行 YAML），一次就能撑爆会话 context，导致后续交互被 compact 丢失关键上下文
- ✅ 需要网页信息时，优先用 `gh` CLI、`WebFetch`、或 `Bash` + `curl` 获取结构化数据
- ✅ 如确需浏览器操作，用 `browser_evaluate` 提取关键数据，不要 snapshot 整页
- ✅ MCP 日志输出到 `.playwright-output/`（gitignored），不污染项目根目录
- 🚨 **截图验证必须走 subagent**：任何需要截图分析的场景（Playwright `browser_take_screenshot`、Read 图片文件），**禁止在主 session 直接读取/分析截图**。图片内容会瞬间撑爆 context window，导致 compact 丢失关键上下文甚至会话崩溃。正确做法：spawn 一个轻量 subagent（haiku），让它读取截图、分析内容、返回文字结论（~200 bytes），主 session 只接收文字结果。

## 进程管理（⚠️ 踩坑记录）
- **禁止盲目 `pkill -f node`** — Claude Code CLI 自身就是 node 进程，杀掉会中断当前会话
- 重启 dashboard dev server 时，用 `netstat -ano | grep ':3010'` 找到 PID，再用 `taskkill //F //PID <pid>` 精确杀进程
- 或者直接 `TaskStop` 停掉后台任务，然后重新启动
- ❌ `pkill -f "dashboard.*dev"` — 可能误杀其他进程
- ✅ `taskkill //F //PID <精确PID>` — 安全

## Git Bash 路径格式（⚠️ 全局规则）
本机 Bash 工具运行在 **Git Bash (MSYS2)** 环境下。所有 Bash 命令中的路径**必须**使用 POSIX 格式：
- ✅ `/c/Users/fangkun/Documents/Claude Code Projects/EngineerBrain/cases/...`
- ❌ `C:\Users\fangkun\...`（反斜杠被转义）
- ❌ `C:/Users/fangkun/...`（`>` 重定向会失败：`/cases/...: No such file or directory`）

**转换规则**：`C:\a\b` → `/c/a/b`，即盘符小写 + 去冒号 + 正斜杠。
适用于所有 skill / agent 中的 Bash 调用（casework、data-refresh、teams-search 等）。

**⚠️ 变量赋值 + pipe 陷阱**：当命令中**任何位置**出现 `|`（pipe）时，同一行用 `;` 设置的 shell 变量会被**静默丢弃**。变量赋值必须用换行独占一行：
```bash
# ✅ 正确：变量赋值独占一行
CASE_DIR="/c/Users/.../cases/active/123"
pwsh ... 2>&1 | tail -1

# ❌ 错误：; 赋值 + pipe → 变量为空
CASE_DIR="/c/..." ; pwsh ... 2>&1 | tail -1
```

## 配置
用户配置存储在项目根的 `config.json`：
```json
{
  "casesRoot": "./cases",
  "dataRoot": "C:\\Users\\fangkun\\Documents\\EngineerBrain-Data",
  "teamsSearchCacheHours": 4
}
```
- `casesRoot` 指定 case 数据存放的根路径
- `dataRoot` 指定外部数据目录（OneNote 导出、向量库、业务参考数据）
- WebUI Settings 页可编辑此配置

## 临时文件与截图规范
- **Playwright MCP 输出** → `.playwright-output/`（通过 `--output-dir` 配置，gitignored）
- **脚本测试截图** → `scripts/screenshots/`（gitignored，可重新生成）
- **自动化测试截图** → `tests/results/screenshots/`（gitignored，测试框架自动管理）
- **Conductor visual verify** → 临时 `screenshot.jpeg`（用完即删，不提交）
- ❌ 不要在项目根目录或脚本目录直接生成截图文件
- ❌ 不要硬编码绝对路径，用 `__dirname` + `join` 构建相对路径

## Dashboard UI 规范
- 所有 Dashboard UI 修改**必须**先读 `playbooks/guides/dashboard-design-system.md`
- 核心要点：暗色模式（柔和低对比度）+ 浅色模式双主题、左侧边栏导航、表格视图 Case 列表、AI Panel 融入页面不独立突出

## 与 Dashboard 的集成
Dashboard 通过 Claude Code SDK 创建 per-case session，主要 API：
- `POST /api/case/:id/process` — 完整处理
- `POST /api/case/:id/chat` — 交互式反馈（resume session）
- `POST /api/case/:id/step/{step-name}` — 单步执行
- `POST /api/patrol` — 批量巡检
- `GET /api/todos` / `POST /api/todo/:id/execute` — Todo 操作
- `GET/PUT /api/settings` — 用户配置
