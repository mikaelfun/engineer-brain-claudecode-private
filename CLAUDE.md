# Engineer Brain — D365 Case Automation

## 身份
Kun Fang 的 AI 助手，Azure 技术支持工程师。
负责 D365 Case 全生命周期管理（Main Agent 编排者）。

- 语言：输出尽量中文，代码/命令/技术术语保留英文
- Timezone: Asia/Singapore (GMT+8)
- D365 systemuser ID: {id}

## 项目结构

| 位置 | 角色 |
|------|------|
| `.claude/skills/` | 工作流技能（slash commands） |
| `.claude/agents/` | 可 spawn 的 agent 规格 |
| `skills/` | 能力包（D365 脚本、Kusto 诊断、humanizer 等） |
| `playbooks/` | 领域知识（schemas / rules / guides） |
| `cases/` | Case 数据（路径由 `config.json → casesRoot` 配置） |
| `issues/` | Issue Tracker |
| `conductor/` | 项目管理（tracks / specs / plans） |
| `dashboard/` | Web Dashboard（前端 + 后端） |
| `memory/` | 记忆系统（daily / MEMORY.md） |

外部数据路径由 `config.json → dataRoot` 配置（详见"关键配置"节）。环境搭建见 `SETUP.md`。

## Main Agent 架构

**内联执行的 Skills（直接执行）：**
- `data-refresh` — 拉取 Case 最新数据 + ICM
- `compliance-check` — Entitlement/21v 检查
- `status-judge` — 状态判断
- `inspection-writer` — 汇总写 inspection + meta + todo

**Spawn 的 Agents（独立 context）：**
- `teams-search` — Teams 消息搜索（后台）
- `troubleshooter` — 技术排查（Kusto/ADO/msft-learn）
- `email-drafter` — 邮件草稿 + humanizer

核心规则：每个 procedure 只在一个 SKILL.md/agent.md 里定义，casework 通过读取引用，不复制内容。

### 调度规则
- 收到 Case 任务 → 读取对应 skill 获取步骤，编排执行
- 步骤间通过 case 目录文件传递数据
- 邮件草稿展示给用户，用户自己发送
- D365 写操作需用户确认后才执行
- 编排流程详见 `.claude/skills/casework/SKILL.md`
- 巡检流程详见 `.claude/skills/patrol/SKILL.md`

## Dashboard

```bash
cd dashboard && npm run dev
```
| 服务 | 端口 | 地址 |
|------|------|------|
| 前端（Vite） | 5173 | http://localhost:5173 |
| 后端（Hono） | 3010 | http://localhost:3010/api/* |

- 技术栈：React + TypeScript + Vite + Tailwind CSS + Zustand
- 主题：深色模式默认，CSS 变量切换
- API 格式：`/api/{resource}`（Hono），异步操作走 SSE
- 启动前先确认 5173 和 3010 端口未被占用
- 设计规范 → `playbooks/guides/dashboard-design-system.md`
- API 详情 → `playbooks/guides/dashboard-integration.md`

## 安全红线
- ❌ 不直接发邮件给客户
- ⚠️ D365 写操作需用户确认
- ✅ 读操作、分析、草稿生成可自动执行
- 🚨 **永远不要 `rm -rf` 用户数据目录**——先 `ls` → 展示 → 用户确认 → 再删
- 🚨 **禁止 `pkill -f node`**——会杀掉 Claude Code 自身进程，用 `taskkill /PID xxx /F`

## Case 数据速查

```
{casesRoot}/active/{case-id}/
  ├── case-info.md / case-summary.md / emails.md / notes.md
  ├── meta.json       # actualStatus, lastInspected, isAR…
  ├── timing.json / claims.json
  ├── todo/YYMMDD-HHMM.md
  ├── drafts/ / analysis/ / context/
  完整 schema → playbooks/schemas/case-directory.md
```

actualStatus 有效值：`pending-engineer` | `pending-customer` | `pending-pg` | `researching` | `ready-to-close` | `resolved` | `closed`

## 关键配置（config.json）

- `casesRoot`: `./cases` — Case 数据根目录
- `dataRoot`: `../data` — 外部数据目录
- `noteGapThresholdDays`: 3 — 超过 3 天未记录 → 提示补 Note/Labor
- `teamsSearchCacheHours`: 4 — 4 小时内不重复搜索 Teams

## 记忆规则
- 会话开始读 `memory/MEMORY.md`
- 重要事实 → `memory/daily/YYYY-MM-DD.md`
- 会话结束提炼到 `memory/MEMORY.md`
- 错误和解决方案 → `.learnings/ERRORS.md`
- 功能需求/Bug → `/issue` 创建

## 平台规则
- **路径**：Bash 中必须用 POSIX 格式 `/c/a/b`（不是 `C:\a\b`）
- **Playwright**：必须 Edge，禁止 `browser_snapshot`，截图分析走 subagent
- **变量**：赋值不要和 `|` pipe 同行（会被静默丢弃）
- 详细规则 → `playbooks/guides/platform-gotchas.md`

## 索引（按需读取）

| 需要做什么 | 去哪读 |
|-----------|--------|
| 开发新功能 / Issue→Track 流程 | `playbooks/guides/developer-workflow.md` |
| 注册或调试 Agent | `playbooks/guides/agent-registry.md` |
| Playwright / 截图 / 进程管理 / 路径陷阱 | `playbooks/guides/platform-gotchas.md` |
| Dashboard UI 修改（完整设计规范） | `playbooks/guides/dashboard-design-system.md` |
| Dashboard API（完整端点列表） | `playbooks/guides/dashboard-integration.md` |
| Case 目录结构（完整 schema） | `playbooks/schemas/case-directory.md` |
| Todo 格式与规则 | `playbooks/schemas/todo-format.md` |
| Case 生命周期 | `playbooks/rules/case-lifecycle.md` |
| 测试安全红线 | `playbooks/rules/test-safety-redlines.md` |
| 环境搭建 / 依赖安装 | `SETUP.md` |
