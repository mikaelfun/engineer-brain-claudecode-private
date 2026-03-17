# D365 UCI 页面结构

Dynamics 365 Copilot Service workspace 基于 UCI（Unified Client Interface）框架，页面结构层次如下。

## 顶层布局

```
┌─────────────────────────────────────────────────────────────┐
│ Banner (顶部导航栏)                                          │
│  - App launcher | "Dynamics 365" | App name | Search | Menu │
├──────────┬──────────────────────────────────────────────────┤
│ Session  │ Tab list (子标签页)                                │
│ list     ├──────────────────────────────────────────────────┤
│ (左侧)   │ Main content area (主内容区)                       │
│          │                                                    │
│ - Home   │  Case Form / Dashboard / etc.                     │
│ - Hub    │                                                    │
│ - Copilot│                                                    │
│ - D365   ├──────────────────────────────────────────────────┤
│ Connector│ Copilot Panel (右侧面板，可折叠)                    │
├──────────┤  - Copilot | Knowledge search | What's New        │
│ OneVoice │                                                    │
│ Connector│                                                    │
│ (右侧面板)│                                                   │
└──────────┴──────────────────────────────────────────────────┘
```

## Session 模型

- **Session list**（左侧竖列）：每个 Session 是一个独立上下文
  - `Home`：默认 session，显示 Dashboard
  - `Hub`：Hub 页面
  - `Copilot hub`：Copilot 入口
  - `D365 Connector`：OneVoice 集成
- 打开 Case 时不会创建新 Session，而是在当前 Session 内创建 **Tab**

## Tab 模型

- **Tab list**（主内容区顶部）：Session 内的多个标签页
  - 首个 Tab 通常是 `Support Engineer Dashboard`
  - 打开 Case 后会新增 Case Tab（标题为 Case Number）
  - 可以在 Dashboard 和 Case 之间切换
  - Tab 可关闭

## Case Form 结构

打开一个 Case 后，主内容区显示 Case Form：

```
┌─────────────────────────────────────────────┐
│ Command Bar (工具栏)                          │
│  Smart paste | Resolve | Save | More commands │
├─────────────────────────────────────────────┤
│ Case Header                                   │
│  - 图标 + 标题 + 保存状态                      │
│  - Case number | Severity | Status reason     │
│  - Assigned To                                │
├─────────────────────────────────────────────┤
│ Case Tabs: Summary | Timeline | Details |     │
│            Attachments | Resolve | More Tabs   │
├─────────────────────────────────────────────┤
│ Tab Content (根据选中 Tab 变化)                 │
│                                                │
│ Summary Tab 内含：                              │
│   - Copilot summary (AI 摘要)                  │
│   - General (Internal title, SAP, Category)    │
│   - Restricted information (可折叠)             │
│   - Timeline (内联，含笔记/邮件)                │
│   - Performance indicators                     │
│   - Related sections (Entitlement, DTM, etc.)  │
└─────────────────────────────────────────────┘
```

## iframe 嵌套

D365 页面有多层 iframe，需要注意：

| iframe | 用途 | 选择器 |
|--------|------|--------|
| `#AppLandingPage` | App 选择页面 | 仅在 Apps 页面存在 |
| `ClientApiFrame_*` | 内部 API 框架 | 隐藏，无需操作 |
| OneVoice iframe | 电话集成 | 在 Connector 面板内 |
| Copilot iframe | Copilot 服务 | 在右侧面板内 |

**关键**：进入 App 时需要操作 `#AppLandingPage` iframe 内的元素，进入 Case 后的所有操作都在**主页面**上，不需要 frameLocator。

## Timeline 条目结构

每个 Timeline 条目（`listitem`）的结构：

```
listitem "Email from xxx@xxx.com"
  ├── text: "Received Email" 或 "Sent Email" 或 "Note"（类型）
  ├── document "Email from xxx" （文档标记）
  ├── text: "Created on: M/D/YYYY H:MM AM/PM <类型>"（时间）
  ├── generic: "from: xxx@xxx.com"（发件人）
  ├── text: "Closed" 或其他状态
  ├── link "Reply All"
  ├── link "Open Record"
  ├── button "Pin"
  ├── generic: "邮件主题..."（主题行）
  ├── text: "邮件正文内容..."（正文预览）
  └── button "View more"（展开完整内容）
```
