# Dashboard Design System

> 所有 Dashboard UI 修改（包括 conductor track 实现）必须遵循此规范。

## 技术栈

- React + TypeScript + Vite
- Tailwind CSS（dark mode via `class` strategy）
- Zustand（client state）、TanStack Query（server state）
- lucide-react icons
- 字体：Plus Jakarta Sans（UI）+ JetBrains Mono（数据/代码）

## 双主题系统

通过 CSS 变量 + Tailwind `dark:` 前缀实现，默认暗色。

### 暗色主题色值（柔和低对比度，非纯黑）

| Token | 值 | 用途 |
|-------|-----|------|
| `--bg-base` | `#1a1d24` | 页面底色（温暖深灰） |
| `--bg-surface` | `#22262f` | 卡片/面板底色 |
| `--bg-elevated` | `#282d38` | 弹窗/浮层 |
| `--bg-hover` | `#2e3340` | 悬浮状态 |
| `--bg-active` | `#353b4a` | 按下/选中状态 |
| `--bg-inset` | `#1e2129` | 凹陷区域（如 AI session 区） |
| `--text-primary` | `#c9cdd6` | 主文字（柔和灰白，非纯白） |
| `--text-secondary` | `#8b919e` | 次要文字 |
| `--text-tertiary` | `#5e6370` | 辅助/占位文字 |
| `--border-subtle` | `rgba(255,255,255,0.05)` | 分隔线 |
| `--border-default` | `rgba(255,255,255,0.08)` | 默认边框 |

### 强调色（降饱和度，暗色模式下不刺眼）

| Token | 暗色值 | 语义 |
|-------|--------|------|
| `--accent-blue` | `#6ba3e8` | 主操作、链接、选中 |
| `--accent-green` | `#5cbf8a` | 成功、SLA OK、健康 |
| `--accent-amber` | `#d4a44a` | 警告、SEV B、待处理 |
| `--accent-red` | `#d47272` | 错误、SEV A、紧急 |
| `--accent-purple` | `#9e8cc7` | 特殊状态（WPG、Teams） |

每种强调色有对应 `-dim` 变体（`opacity: 0.10`），用于背景色。

### 浅色主题

所有 token 有对应浅色值（详见 `index.css`），通过 `<html class="light">` 切换。

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

- `border-radius: 10px`
- `border: 1px solid var(--border-subtle)`
- `padding: 18px`
- 无明显 shadow（暗色模式下用微弱 shadow）
- 统计卡片顶部有 2px 彩色条（`opacity: 0.7`），hover 时微弱发光

### Badge

- `border-radius: 5px`
- `font-family: var(--font-mono)`
- `font-size: 10px; font-weight: 700`
- 颜色用 `accent-*-dim` 背景 + `accent-*` 文字

### 表格

- 行左侧有 severity 色彩指示条（`border-left: 3px solid`）
- SLA 用小圆点（7px），fail 状态带脉冲动画
- 健康分数用圆环（34px），颜色编码同 accent

### 按钮

- Primary: `background: var(--accent-blue)`，hover 时 `brightness(1.1)`
- Ghost: 透明底 + `border: 1px solid var(--border-default)`
- 不用渐变按钮（保持克制）

### 动画

- 页面载入：`fadeInUp`（0.35s），交错延迟 0.04s
- SLA fail 圆点：`pulse-dot`（2.5s infinite）
- 交互反馈：`transition: all 0.1-0.15s ease`
- **克制原则**：只在首次渲染和状态变化时用动画，不滥用

## 排版

| 元素 | 字体 | 大小 | 粗细 |
|------|------|------|------|
| 页面标题 | Jakarta Sans | 20px | 800, letter-spacing: -0.03em |
| 副标题/mono | JetBrains Mono | 12px | 400 |
| 卡片标题 | Jakarta Sans | 13px | 700 |
| 正文 | Jakarta Sans | 13px | 500 |
| 表格头 | Jakarta Sans | 10px | 700, uppercase, letter-spacing: 0.05em |
| Badge | JetBrains Mono | 10px | 700 |
| 统计数字 | JetBrains Mono | 26px | 800 |

## 设计原则

1. **柔和对比度**：暗色模式不用纯黑/纯白，文字用 `#c9cdd6` 而非 `#ffffff`
2. **颜色降饱和**：所有强调色比标准色降低饱和度，避免刺眼
3. **减少视觉噪音**：边框用极低透明度，shadow 几乎不可见
4. **信息密度优先**：表格视图而非卡片列表，每行一个 case
5. **AI 融入不突出**：AI Panel 是页面的自然延伸，不是贴上去的独立组件
6. **背景有呼吸感**：极淡的噪点纹理 + 微弱径向渐变，不用实线网格

## 参考预览

设计预览文件：`dashboard/design-preview.html`（可直接浏览器打开）
