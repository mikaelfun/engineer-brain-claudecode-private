# Dashboard Design System

> 所有 Dashboard UI 修改（包括 conductor track 实现）必须遵循此规范。

## 技术栈

- React + TypeScript + Vite
- Tailwind CSS（dark mode via `class` strategy）
- Zustand（client state）、TanStack Query（server state）
- lucide-react icons
- 字体：Rubik（UI）+ JetBrains Mono（数据/代码）
- 设计灵感：Sentry Light — 淡紫底色、紫色强调、uppercase 标签、毛玻璃卡片

## 双主题系统

通过 CSS 变量 + Tailwind `dark:` 前缀实现，默认浅色（Sentry Light）。

### 浅色主题色值（默认 — Sentry Light 灵感）

| Token | 值 | 用途 |
|-------|-----|------|
| `--bg-base` | `#faf9fb` | 页面底色（淡紫白，带紫色调） |
| `--bg-surface` | `#ffffff` | 卡片/面板底色 |
| `--bg-elevated` | `#ffffff` | 弹窗/浮层 |
| `--bg-hover` | `#f3f1f5` | 悬浮状态（淡紫灰） |
| `--bg-active` | `#ebe8ef` | 按下/选中状态 |
| `--bg-inset` | `#f5f3f7` | 凹陷区域（如 AI session 区） |
| `--text-primary` | `#1f1633` | 主文字（紫色调深黑） |
| `--text-secondary` | `#3e3554` | 次要文字（暖紫灰） |
| `--text-tertiary` | `#9e95b0` | 辅助/占位文字 |
| `--border-subtle` | `#e8e3f0` | 分隔线（紫色调淡边框） |
| `--border-default` | `#d4ccdf` | 默认边框 |

### 暗色主题色值（Sentry Dark 灵感）

| Token | 值 | 用途 |
|-------|-----|------|
| `--bg-base` | `#1f1633` | 页面底色（紫色调深黑） |
| `--bg-surface` | `#150f23` | 卡片/面板底色（更深紫黑） |
| `--bg-elevated` | `#2a2145` | 弹窗/浮层 |
| `--bg-hover` | `#362d59` | 悬浮状态 |
| `--bg-active` | `#422082` | 按下/选中状态 |
| `--bg-inset` | `#180e2a` | 凹陷区域 |
| `--text-primary` | `#ffffff` | 主文字 |
| `--text-secondary` | `#e5e7eb` | 次要文字 |
| `--text-tertiary` | `#6e6e82` | 辅助/占位文字 |
| `--border-subtle` | `#362d59` | 分隔线 |
| `--border-default` | `#584674` | 默认边框 |

### 强调色

| Token | 浅色值 | 暗色值 | 语义 |
|-------|--------|--------|------|
| `--accent-blue` | `#6a5fc1` | `#6a5fc1` | 主操作、链接、选中（Sentry Purple） |
| `--accent-green` | `#16a34a` | `#4ade80` | 成功、SLA OK、健康 |
| `--accent-amber` | `#d97706` | `#fbbf24` | 警告、SEV B、待处理 |
| `--accent-red` | `#dc2626` | `#f87171` | 错误、SEV A、紧急 |
| `--accent-purple` | `#7c3aed` | `#a78bfa` | 特殊状态（WPG、Teams） |

每种强调色有对应 `-dim` 变体（浅色 `opacity: 0.10`，暗色 `opacity: 0.15`），用于背景色。

**注意**：`--accent-blue` 实际为 Sentry Purple `#6a5fc1`，在语义上仍代表"主操作"。

## 布局规范

### 全局结构

```
┌──────────┬────────────────────────────────────┐
│  Sidebar │  Main Content (flex: 1)            │
│  220px   │  padding: 24px 32px                │
│  fixed   │  no max-width (利用全宽)            │
│          │                                    │
└──────────┴────────────────────────────────────┘
```

- **侧边栏导航**（左侧 220px，fixed），不用顶部导航
- 主内容区**不限 max-width**，充分利用宽屏
- 侧边栏底部放主题切换按钮

### CaseDetail 布局

```
┌──────────────────────────────┬──────────┐
│  Tab Bar                     │          │
│  ─────────────────────────── │ AI Panel │  ← 一个大卡片
│  Tab Content                 │ 280px    │     内部用 border-right 分隔
│                              │          │     AI Panel 无独立边框
│                              │          │
└──────────────────────────────┴──────────┘
```

- AI Panel **融入页面**：与左侧内容共享同一个外层卡片容器
- 分隔用 `border-right: 1px solid var(--border-subtle)`
- AI Session 区域用 `--bg-inset` 凹陷背景

## 组件规范

### 卡片

- `border-radius: 12px`
- `border: 1px solid var(--border-subtle)`
- `padding: 18px`
- 浅色模式：`box-shadow: rgba(0,0,0,0.04) 0 1px 3px`
- 暗色模式：`backdrop-filter: blur(18px) saturate(180%)`（毛玻璃效果）
- hover: `border-color: var(--border-default)` + 紫色调 shadow `rgba(106,95,193,0.1) 0 4px 16px`
- 统计卡片顶部有 2px 彩色条（`opacity: 0.7`），hover 时微弱发光

### Badge

- `border-radius: 18px`（pill 形）
- `font-family: var(--font-display)`
- `font-size: 12px; font-weight: 600`
- `text-transform: uppercase; letter-spacing: 0.2px`
- 颜色用 `accent-*-dim` 背景 + `accent-*` 文字

### 表格

- 行左侧有 severity 色彩指示条（`border-left: 3px solid`）
- SLA 用小圆点（7px），fail 状态带脉冲动画
- 健康分数用圆环（34px），颜色编码同 accent

### 按钮

- Primary: `background: var(--accent-blue)`（Sentry Purple），`border: 1px solid rgba(0,0,0,0.1)`，`border-radius: 13px`，`text-transform: uppercase`，`letter-spacing: 0.2px`，`font-weight: 700`，`box-shadow: rgba(0,0,0,0.06) 0 1px 3px 0 inset`（触感 inset shadow）
- Primary hover: `box-shadow: rgba(0,0,0,0.12) 0 4px 12px`
- Ghost: 透明底 + `backdrop-filter: blur(18px) saturate(180%)` + `box-shadow: rgba(0,0,0,0.08) 0 2px 8px`（毛玻璃按钮）
- Ghost hover: `background: rgba(106,95,193,0.06)`

### Action Button 模式（⚠️ 所有异步操作必须遵循）

异步操作按钮**必须**按以下模式实现，不允许 fire-and-forget。

#### 质量等级

| 等级 | 特征 | 适用场景 |
|------|------|---------|
| **A 级** (SSE 驱动) | Spinner + 实时输出 + Cancel + 状态 badge | 长时间后台任务：Full Process、Implement、Verify、Trigger Run |
| **B 级** (Mutation 反馈) | Spinner + 文字变化 + disabled + toast/inline error | 短时间写操作：Create、Delete、Toggle、Submit |
| **C 级** (最低标准) | disabled + cursor:not-allowed + 完成后刷新 | 极简操作：Refresh、inline 编辑 |

**❌ 禁止**：点击后无任何视觉反馈（0 级）

#### A 级模式 — SSE 驱动的长时间操作

```
[Start] → [Running... ■ Cancel] → [✅ Done (Xs) Dismiss]
                                   [🔴 Failed Dismiss]
                                   [⊗ Cancelled Dismiss]
```

**架构要求**：
1. **后端**：操作函数广播 SSE 事件（`xxx-started`, `xxx-progress`, `xxx-completed`, `xxx-failed`）
2. **前端 Store**：Zustand store 追踪运行状态 (`running | completed | failed | cancelled`)，存储实时输出和 elapsed time
3. **前端 SSE Hook**：`useSSE.ts` 监听事件并更新 store
4. **前端 UI**：
   - **运行中**：Play → Square(Stop) 按钮切换 + `<Loader2 className="animate-spin" />` + "Running" badge + 实时输出面板（蓝色背景头 + 流式文本）
   - **完成**：`<CheckCircle2 />` + 绿色 "Done (Xs)" badge + 可 dismiss 的结果面板
   - **失败**：`<AlertCircle />` + 红色 "Failed" badge + 错误详情
   - **取消**：`<XCircle />` + 灰色 "Cancelled" badge
5. **防护**：
   - 运行中禁止重复触发（double-run protection）
   - 运行中禁止 Delete（`disabled` + `cursor: not-allowed`）
   - 取消支持（Windows: `taskkill /F /T /PID`，Unix: `SIGTERM`）

**参考实现**：
- `stores/triggerRunStore.ts` — Zustand store 模板
- `services/cron-manager.ts` → `executeCronPrompt()` — 后端 SSE 广播模板
- `pages/AgentMonitor.tsx` — trigger 卡片 UI 模板
- `components/issues/ImplementPanel.tsx` — Issue implement 模板（更复杂的 SSE 场景）

#### B 级模式 — Mutation 反馈

```tsx
<button
  onClick={() => mutation.mutate(id)}
  disabled={mutation.isPending}
  style={{ opacity: mutation.isPending ? 0.6 : 1, cursor: mutation.isPending ? 'not-allowed' : 'pointer' }}
>
  {mutation.isPending ? (
    <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
  ) : (
    <><Icon className="w-4 h-4" /> Action</>
  )}
</button>
```

**必须包含**：
- `disabled={mutation.isPending}`
- Spinner 图标切换（`Loader2 animate-spin`）
- 文字变化（"Create" → "Creating..."）
- 错误展示（inline `<div style={{ background: 'var(--accent-red-dim)' }}>` 或 toast）

#### C 级模式 — 最低标准

```tsx
<button
  onClick={handleAction}
  disabled={isLoading}
  className="transition-colors"
  style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
>
  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
</button>
```

#### SSE 事件命名规范

```
{domain}-started     — 操作开始
{domain}-progress    — 中间输出/状态更新
{domain}-completed   — 成功完成
{domain}-failed      — 失败
{domain}-cancelled   — 用户取消（如适用）
{domain}-question    — 需要用户输入（如适用）
```

已有 domain：`case-step`, `issue-track`, `issue-implement`, `issue-verify`, `trigger`, `todo-execute`, `patrol`

#### 实时输出面板

长时间操作的输出面板统一风格：

```
┌─ [accent-*-dim 背景] ──────────────────────┐
│ 🔄 Running... (Xs)        [output length]  │  ← 状态头
├────────────────────────────────────────────┤
│ [bg-secondary]                             │
│ 流式文本输出                                │  ← pre, whitespace-pre-wrap, max-height: 200px
│ ...                                        │
└────────────────────────────────────────────┘
```

- 运行中：蓝色头 `accent-blue-dim`
- 完成：绿色头 `accent-green-dim` + Dismiss 按钮
- 失败：红色头 `accent-red-dim` + 错误详情
- 取消：默认灰 `bg-hover`

### 动画

- 页面载入：`fadeInUp`（0.35s），交错延迟 0.04s
- SLA fail 圆点：`pulse-dot`（2.5s infinite）
- 交互反馈：`transition: all 0.1-0.15s ease`
- **克制原则**：只在首次渲染和状态变化时用动画，不滥用

## 排版

| 元素 | 字体 | 大小 | 粗细 | 备注 |
|------|------|------|------|------|
| 页面标题 | Rubik | 20px | 600 | letter-spacing: -0.3px |
| 副标题/mono | JetBrains Mono | 12px | 400 | |
| 卡片标题 | Rubik | 14px | 600 | |
| 正文 | Rubik | 14px | 400 | line-height: 1.5 |
| 表格头 | Rubik | 10px | 600 | uppercase, letter-spacing: 0.25px |
| Badge | Rubik | 12px | 600 | uppercase, letter-spacing: 0.2px |
| 统计数字 | Rubik | 32px | 600 | |
| 按钮 | Rubik | 14px | 700 | uppercase, letter-spacing: 0.2px |
| 导航 | Rubik | 15px | 500 | |
| 代码/Case ID | JetBrains Mono | 12px | 500 | |

## 设计原则

1. **紫色调温暖**：浅色模式底色 `#faf9fb` 带淡紫色调，暗色模式底色 `#1f1633` 为紫黑，区别于冷灰
2. **Uppercase 系统化**：按钮、Badge、表格头、微标签统一使用 `text-transform: uppercase` + `letter-spacing: 0.2px`
3. **触感按钮**：Primary 按钮使用 inset shadow 创造"按入表面"的质感，hover 时外阴影浮起
4. **毛玻璃层叠**：暗色模式的卡片和 Ghost 按钮使用 `backdrop-filter: blur(18px) saturate(180%)`
5. **pill 形 Badge**：状态标签使用 18px radius pill 形，更圆润柔和
6. **信息密度优先**：表格视图而非卡片列表，每行一个 case
7. **AI 融入不突出**：AI Panel 是页面的自然延伸，不是贴上去的独立组件
8. **紫色为品牌**：`#6a5fc1` 作为唯一品牌强调色，hover 时 `#6a5fc1`，focus 时紫色光晕

## 参考预览

- 浅色模式预览：`../awesome-design-md/sentry-light.html`
- 暗色模式预览：`../awesome-design-md/sentry-preview.html`
- 设计灵感来源：`../awesome-design-md/design-md/sentry/DESIGN.md`
