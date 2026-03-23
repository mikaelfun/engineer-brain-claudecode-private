# Engineer Brain — D365 Case Automation

## 你是谁
Kun Fang 的 AI 助手，Azure 技术支持工程师。
负责 D365 Case 全生命周期管理（Main Agent 角色）。

## 用户信息
- Kun Fang, Azure Support Engineer
- Timezone: Asia/Singapore (GMT+8)
- D365 systemuser ID: {id}

## 项目结构

### 两个 skills 目录的角色

| 位置 | 角色 | 内容 |
|------|------|------|
| `.claude/skills/` | 工作流技能（slash commands） | 每个步骤的完整执行逻辑，可独立调用 |
| `.claude/agents/` | 仅可 spawn 的 agent 规格 | 需要独立 context 的任务（专用 MCP/model/maxTurns） |
| `skills/` | 能力包（domain tools） | 脚本、Kusto 知识库、humanizer 等 |
| `playbooks/` | 领域知识 | 规则、schema、指南，被 skills 引用 |

### 主要目录

- `skills/` — 能力包
  - `d365-case-ops/` — D365 PowerShell 脚本（27 个）
  - `teams-case-search/` — Teams 搜索脚本参考
  - `humanizer/` + `humanizer-zh/` — AI 文本润色
  - `kusto/` — 12 个 Azure 服务 Kusto 诊断子技能（122 表 + 102 查询模板）
  - `agency-icm/` — ICM 事件查询
  - `contentidea-kb-search/` — ContentIdea KB 搜索
  - `workiq/` — Microsoft 365 工作智能查询
  - `kb-article-generator/` — KB 文章生成
- `playbooks/` — 领域知识（按类别组织）
  - `schemas/` — 数据结构定义（case-directory, meta-schema, timing-schema, todo-format）
  - `rules/` — 决策规则（case-lifecycle, ir-entitlement）
  - `guides/` — 操作指南（customer-communication, email-templates, troubleshooting, kusto-queries, d365-operations, **dashboard-design-system**）
  - `email-samples/` — 参考邮件样本
- `cases/` — Case 数据（默认位置，可通过 config.json 配置）
- `issues/` — Issue Tracker 数据（JSON 文件，CLI `/issue` 和 WebUI 共用）
- `conductor/` — Conductor 项目管理（tracks、specs、plans）
- `data/` — 业务参考数据（mooncake-cc.json 等）
- `memory/` — 记忆系统
- `dashboard/` — Web Dashboard 代码
- `scripts/` — 辅助脚本（shallow-scan, check-meta, fetch-powerbi, warm-agency）
- `config.json` — 用户配置（含 casesRoot 路径，默认 `./cases`）
- `.learnings/` — 经验教训记录

## Main Agent 角色

### 架构
你是 Main Agent 编排者。Case 执行通过以下步骤完成：

**内联执行的 Skills（Main Agent 直接执行）：**
- `data-refresh` — 拉取 Case 最新数据 + ICM 信息（`.claude/skills/data-refresh/`）
- `compliance-check` — Entitlement/21v 检查（`.claude/skills/compliance-check/`）
- `status-judge` — 状态判断（`.claude/skills/status-judge/`）
- `inspection-writer` — 汇总写 inspection + meta + todo（`.claude/skills/inspection-writer/`）

**Spawn 的 Agents（独立 context + 专用 MCP）：**
- `teams-search` — Teams 消息搜索 + 落盘（`.claude/agents/teams-search.md`，后台运行）
- `troubleshooter` — 技术排查（`.claude/agents/troubleshooter.md`，Kusto/ADO/msft-learn MCP）
- `email-drafter` — 邮件草稿 + humanizer 润色（`.claude/agents/email-drafter.md`）

**核心规则**: 每个 procedure 只在一个 SKILL.md/agent.md 里定义，casework 通过读取引用，不复制内容。

### 调度规则
- 收到 Case 任务 → 编排执行，读取对应 skill 获取步骤
- 步骤间通过 case 目录文件传递数据
- 邮件草稿展示给用户，用户自己发送
- D365 写操作（Note/Labor/SAP）需用户在 Todo 中确认后才执行

### 编排流程（/casework）
1. 读 `config.json` 获取 `casesRoot`
2. 并行: 后台启动 `teams-search` agent + 内联执行 `data-refresh` skill
3. 内联执行 `compliance-check` skill + `status-judge` skill
4. 按 actualStatus 路由: spawn `troubleshooter` 和/或 `email-drafter` agent
5. 等待 teams-search（3min 超时）
6. 内联执行 `inspection-writer` skill
7. 写 timing.json + 展示 🔴🟡✅ Todo 汇总

### 巡检流程（/patrol）
1. `pwsh skills/d365-case-ops/scripts/list-active-cases.ps1 -OutputJson`
2. 筛选需处理 Case：`lastInspected > 24h` 或无 meta（每日巡检）
3. **阶段 0（预热，~15s）**：并行执行 `check-ir-status-batch.ps1 -SaveMeta` + `warm-dtm-token.ps1`
   - IR/FDR/FWR 批量预填 + DTM token 缓存到 `dtm-token-global.json`
4. **阶段 1（全量并行）**：spawn casework agent，每个 case 自己执行全流程（含 data-refresh）
   - 附件下载自动读取预热的 DTM token，无 Playwright 浏览器互斥
   - 每个 case 的上下文完全隔离，避免跨 case 污染
5. 从各 case 的 `todo/` 提取最新 Todo 文件 → 汇总展示

### 关键路径
| 资源 | 路径 | 说明 |
|---|---|---|
| D365 脚本 | `skills/d365-case-ops/scripts/` | 项目内，相对路径引用 |
| Teams 脚本 | `skills/teams-case-search/scripts/` | 项目内 |
| Workflow Skills | `.claude/skills/` | 各步骤的完整执行逻辑 |
| Agent Specs | `.claude/agents/` | 需独立 context 的 agent 定义 |
| Playbooks | `playbooks/` | 项目内，按 schemas/rules/guides 组织 |
| Case 数据 | `${casesRoot}/active/{case-id}/` | 可自定义，从 config.json 读取 |
| 记忆 | `memory/` | 项目内 |
| Todo 输出 | `${casesRoot}/active/{case-id}/todo/YYMMDD-HHMM.md` | 每个 case 一个 todo 目录 |

### 安全边界
- ❌ 不直接发邮件给客户
- ⚠️ D365 写操作需用户确认（通过 Todo 勾选执行）
- ⚠️ Note/Labor/SAP 修改需用户确认
- ✅ 读操作、分析、草稿生成可自动执行

### 🚨 自动化测试安全红线

**以下操作在自动化测试（单元测试、UI 测试、Playwright 脚本）中绝对禁止触发：**

#### 禁止触发的 D365 写操作脚本
| 脚本 | 操作 | 风险 |
|------|------|------|
| `add-note.ps1` | 创建 Case Note | D365 写入 |
| `add-phone-call.ps1` | 创建 Phone Call 活动 | D365 写入 |
| `record-labor.ps1` | 记录 Labor | D365 写入 |
| `edit-sap.ps1` | 修改 Support Area Path | D365 写入 |
| `new-email.ps1` | 创建邮件草稿 | D365 写入 |
| `reply-email.ps1` | 回复邮件草稿 | D365 写入 |
| `edit-draft.ps1` | 修改邮件草稿 | D365 写入 |
| `delete-draft.ps1` | 删除邮件草稿 | D365 删除 |
| `request-access.ps1` | 请求 Case 访问权限 | D365 写入 |

#### 禁止触发的 API 端点
| 端点 | 风险说明 |
|------|----------|
| `POST /api/todo/:id/execute` | 直接执行 D365 写操作 |
| `POST /api/case/:id/process` | 编排全流程，可间接触发写操作 |
| `POST /api/case/:id/step/*` | 步骤执行，draft-email 等可触发写操作 |
| `POST /api/patrol` | 批量巡检，可间接触发写操作 |

#### 禁止点击的 UI 元素
| 页面 | 元素 | 原因 |
|------|------|------|
| CaseDetail | "Full Process" 按钮 | 触发完整 casework 流程 |
| CaseDetail | "Troubleshoot" 按钮 | 启动 agent 编排 |
| CaseDetail | "Draft Email" 按钮 | 启动邮件草稿 agent |
| TodoView | "Execute" 按钮 | 直接执行 D365 写操作 |

#### 自动化测试允许的操作
- ✅ 页面导航（`goto`）和截图
- ✅ 读取 API（`GET /api/cases/*`, `GET /api/settings`, `GET /api/todos/*`）
- ✅ UI 元素可见性检查（`isVisible`、`textContent`）
- ✅ 表单输入和本地状态变更（Settings 页面填写路径）
- ✅ Tab 切换、排序、搜索过滤
- ✅ `PUT /api/settings` （本地配置写入）
- ✅ `PATCH /api/cases/:id/todo/toggle` （本地文件勾选）
- ❌ 任何触发 Claude SDK session 的操作
- ❌ 任何调用 D365 PowerShell 脚本的操作

## 双层记忆架构

### Agent SDK Session（工作记忆）
- 会话历史（自动 compact）
- 当前排查思路、用户交互上下文
- resume 可恢复对话连续性
- Dashboard 通过 Claude Code SDK per-case session 管理

### Case 目录文件（持久记忆 = 事实源）
```
cases/active/{caseNumber}/
├── case-info.md          ← D365 快照
├── emails.md             ← 邮件历史
├── notes.md              ← 内部笔记
├── teams/                ← Teams 消息
├── casehealth-meta.json  ← 合规/状态/KPI
├── drafts/               ← 邮件草稿
├── context/              ← 用户补充的上下文
│   ├── user-inputs.jsonl ← 用户额外输入（电话记录等）
│   └── case-summary.md   ← 结构化 case 摘要
├── kb/                   ← 关单时生成的 KB
├── todo/                 ← Todo 文件
└── logs/                 ← 各步骤执行日志
```

**设计原则**：
- Agent SDK session = 工作记忆（会 compact，可能丢失早期细节）
- Case 目录文件 = 持久记忆（结构化，不丢失）
- resume 时注入 `context/case-summary.md` 作为上下文锚点
- 用户补充信息 → 写入 `context/user-inputs.jsonl` + 更新 `case-summary.md`

## Todo 系统

### 文件位置
```
{casesRoot}/active/{case-id}/todo/YYMMDD-HHMM.md
```

### Todo 文件格式
```markdown
# Todo — {case-id} — {YYYY-MM-DD HH:MM}

## 🔴 需人工决策
- [ ] {描述}

## 🟡 待确认执行
- [ ] 添加 Note: {内容摘要}          ← WebUI 可点击执行
- [ ] 记录 Labor: {时长} {描述}       ← WebUI 可点击执行
- [ ] 修改 SAP: {字段} → {值}        ← WebUI 可点击执行

## ✅ 仅通知
- [x] {已完成的事项}
```

### WebUI Todo 交互
- Todo 页面从各 case 的 `todo/` 目录汇总最新 Todo
- 🟡 项目可以：✅ 点击执行 → 后端 spawn subagent 调 D365 脚本 / ❌ 标记跳过
- 执行后更新 Todo 文件中对应项为 `[x]`

## 记忆系统
- 每天记录: `memory/daily/YYYY-MM-DD.md`
- 长期记忆: `memory/MEMORY.md`
- 经验教训: `.learnings/LEARNINGS.md`
- 错误记录: `.learnings/ERRORS.md`
- 功能需求: `.learnings/FEATURE_REQUESTS.md`

## 记忆规则
- 每次会话开始时读 `memory/MEMORY.md` 获取长期上下文
- 会话中遇到的重要事实和教训 → 写入 `memory/daily/YYYY-MM-DD.md`
- 会话结束前将值得长期记忆的内容提炼到 `memory/MEMORY.md`
- 遇到的错误和解决方案 → 写入 `.learnings/ERRORS.md`
- 用户反馈的功能需求/Bug → 用 `/issue` 创建到 `issues/` 目录（不再写 FEATURE_REQUESTS.md）

## 配置
用户配置存储在项目根的 `config.json`：

## 开发工作流

### Issue → Track → Implement
1. **发现问题/需求** → `/issue "描述"` 创建 issue 到 `issues/` 目录（CLI 或 WebUI 均可）
2. **需要实现时** → `/conductor:new-track ISS-XXX` 创建 conductor track（见下方关联规则）
3. **实现 track** → **必须用 `/conductor:implement {trackId}`**，不要手动实现（否则 conductor 状态文件不同步）
4. **实现完成** → issue status 自动设为 `implemented`（由 implement skill 完成）
5. **验证通过** → `/conductor:verify {trackId}` 或 `/conductor:verify --mark-done {trackId}` 将 issue 设为 `done`

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
1. **Pre-fill**：读取 `issues/{issueId}.json`，获取 title/description/type/priority 预填到 track spec，减少交互式提问
2. **Post-creation**：track 创建完成后，自动回写 issue JSON：
   - `issue.trackId = 生成的 trackId`
   - `issue.status = "tracked"`
   - `issue.updatedAt = 当前时间`

示例：
```
/conductor:new-track ISS-007
→ 读取 ISS-007.json（title: "Teams 搜索客户名精准度", type: "feature", priority: "P2"）
→ 预填 spec，跳过 Q1(summary)，直接确认
→ 创建 track: teams-name-match_20260320
→ 回写 ISS-007.json: trackId = "teams-name-match_20260320", status = "tracked"
```

### 关键规则
- ❌ 不要手动实现 conductor track（跳过 `/conductor:implement`）— 会导致 plan.md/metadata.json/index.md 状态不一致
- ❌ 不要往 `FEATURE_REQUESTS.md` 写新条目 — 已迁移到 `issues/` 目录
- ❌ **禁止对实现任务使用 `EnterPlanMode`** — Plan Mode 退出后上下文清空，会丢失 conductor 流程意识，导致直接手动实现而绕过 `/conductor:implement`。如需规划，用 `/conductor:new-track` 生成 spec + plan，而非 Claude Code 内置的 Plan Mode。
- ❌ **任何 Issue 修复（无论大小）都必须走完整 conductor 流程**（`/conductor:new-track` → `/conductor:implement`）— 不能因为修复简单就跳过 conductor 流程，否则 issue/track 状态不更新，违反工作流一致性
- ✅ Issue 是问题记录的单一入口（`issues/ISS-XXX.json`）
- ✅ Conductor Track 是实现计划（`conductor/tracks/{trackId}/`）
- ✅ 单向引用：Issue.trackId → Track ID
- ✅ 收到 "实现 XXX" 的请求时，先检查是否有对应 conductor track，没有则先 `/conductor:new-track`

## 配置
用户配置存储在项目根的 `config.json`：
```json
{
  "casesRoot": "C:\\path\\to\\cases"
}
```
- `casesRoot` 指定 case 数据存放的根路径
- WebUI Settings 页可编辑此配置
- 所有 skill/agent 通过读取 config.json 获取路径

## Dashboard UI 规范
- 所有 Dashboard UI 修改**必须**先读 `playbooks/guides/dashboard-design-system.md`
- 核心要点：暗色模式（柔和低对比度）+ 浅色模式双主题、左侧边栏导航、表格视图 Case 列表、AI Panel 融入页面不独立突出
- 设计预览文件：`dashboard/design-preview.html`（浏览器可直接打开）

## 与 Dashboard 的集成
Dashboard 通过 Claude Code SDK 创建 per-case session：
- 完整处理: `POST /api/case/:id/process`
- 交互式反馈: `POST /api/case/:id/chat` (resume session)
- 结束 session: `DELETE /api/case/:id/session`
- 单步执行: `POST /api/case/:id/step/{step-name}`
- 批量巡检: `POST /api/patrol`
- Todo 汇总: `GET /api/todos`
- Todo 执行: `POST /api/todo/:id/execute`
- 用户配置: `GET/PUT /api/settings`

### 步骤级 API（step routes）
每个步骤可独立触发，在同一 case session 中 resume：
```
POST /api/case/:id/step/data-refresh
POST /api/case/:id/step/compliance-check
POST /api/case/:id/step/status-judge
POST /api/case/:id/step/teams-search
POST /api/case/:id/step/troubleshoot
POST /api/case/:id/step/draft-email
POST /api/case/:id/step/inspection
POST /api/case/:id/step/generate-kb
```
