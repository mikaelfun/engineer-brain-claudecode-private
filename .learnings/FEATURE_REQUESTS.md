# Feature Requests

用户反馈的功能需求和改进建议。

## 格式
```
### YYYY-MM-DD — 需求描述
- 优先级：P0/P1/P2
- 类型：bug / feature / refactor / chore
- 描述：...
- 状态：pending / tracked / in-progress / done
- Track ID：(如已创建 conductor track)
```

---

## Dashboard UI

### 2026-03-20 — Fix CaseAIPanel Double-Scroll Bug
- 优先级：P1
- 类型：bug
- 描述：Case full process 执行时，`scrollIntoView()` 导致内外两层 scrollbar 都被滚动到底部。应改用 `container.scrollTop` 只滚动内层消息容器。
- 状态：tracked
- Track ID：scroll-fix_20260320

### 2026-03-20 — Improve Process Execution Visibility
- 优先级：P1
- 类型：feature
- 描述：Case full process 执行时 UI 几乎只显示 "Thinking"，看不到实际操作。SSE 管道多个环节丢失信息：后端类型映射默认 thinking、不提取 tool arguments、前端丢弃非字符串 content、chat route 硬编码 thinking、持久化恢复类型名不匹配。
- 状态：tracked
- Track ID：process-visibility_20260320

### 2026-03-20 — Session Active Panel Collapsible
- 优先级：P1
- 类型：bug
- 描述：CaseAIPanel 中 "Session Active" 区域及附属内容（消息列表、Chat 输入、Quick Actions）无法折叠，占据大量页面空间。需添加折叠/展开机制。
- 状态：tracked
- Track ID：session-collapse_20260320

### 2026-03-20 — Case Detail Header Redesign
- 优先级：P1
- 类型：refactor
- 描述：重新设计 Case Detail 页面 header，参考截图 UI 整合关键信息（Case号、SR号、Severity、Status、Owner、创建/更新/拉取时间、SAP 产品路径、SLA 状态、健康分数）到紧凑的 header 卡片。
- 状态：tracked
- Track ID：case-header-redesign_20260320

### 2026-03-20 — UI Error States Fix
- 优先级：P1
- 类型：bug
- 描述：Dashboard UI 错误状态处理修复。
- 状态：tracked
- Track ID：ui-error-states_20260320

### 2026-03-20 — Dashboard Issue Tracker 入口
- 优先级：P2
- 类型：feature
- 描述：Dashboard 增加 Issue 入口页面，支持：创建 issue（标题+描述+类型+优先级）、查看所有 issue 列表（分页）、状态筛选（pending/tracked/in-progress/done）、issue 与 conductor track 关联。数据存储在本地 `issues/` 目录，同步到 FEATURE_REQUESTS.md。
- 状态：tracked
- Track ID：issue-tracker_20260320

## Automation / Workflow

### 2026-03-20 — Teams 搜索客户名精准度
- 优先级：P2
- 类型：feature
- 描述：Teams 搜索使用 D365 Contact Name 搜索不够精准（如"伟 毕"搜不到 "Bi, Weiwei"）。需要实现中英文客户名映射或模糊匹配机制。
- 状态：tracked
- Track ID：teams-name-match_20260320

### 2026-03-20 — SAP 合规检查
- 优先级：P2
- 类型：feature
- 描述：compliance-check skill 当前只检查 Service Name / Schedule / Contract Country / 21v Convert，未包含 SAP 产品路径验证。需将 SAP 路径加入合规检查规则。
- 状态：tracked
- Track ID：sap-compliance_20260320

### 2026-03-20 — cc-finder 集成
- 优先级：P2
- 类型：feature
- 描述：casework 流程中自动查找 case 客户的 CC（Customer Contact）联系人信息。已有 fetch-powerbi-cc 脚本和 mooncake-cc.json 数据，但未集成到 workflow。
- 状态：tracked
- Track ID：cc-finder_20260320

### 2026-03-20 — WebUI 刷新后 Workflow 进度持久化
- 优先级：P2
- 类型：feature
- 描述：当前页面刷新后 SSE 消息可从后端恢复，但 Zustand store 的实时 workflow 进度状态（当前步骤、各步骤耗时等）未持久化到 localStorage 或后端。需要完整的 workflow state 持久化方案。
- 状态：tracked
- Track ID：workflow-persist_20260320
