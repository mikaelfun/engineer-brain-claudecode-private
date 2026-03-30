# Recipe: Issue-Driven UI Test Generation

> 适用于：issue AC 包含 UI 页面、组件、按钮、布局或用户交互描述的 gap

## 匹配条件

- gap `source` = `issue-driven`
- gap AC / description 包含以下关键词之一：
  - 页面、组件、按钮、表单、对话框、弹窗、侧边栏
  - page、component、button、form、dialog、modal、sidebar
  - 点击、输入、选择、拖拽、hover、navigate
  - click、input、select、drag、hover、navigate
  - 布局、样式、主题、暗色模式、浅色模式
  - layout、style、theme、dark mode、light mode
  - Playwright、DOM、CSS、selector

## 前置检查

- [ ] gap 中是否有明确的页面路径（如 `/cases`、`/settings`）
- [ ] gap 是否描述了用户交互流程（click → expect → verify）
- [ ] 涉及的组件是否需要前端服务运行（localhost:5173）
- [ ] 是否涉及截图对比（visual regression）→ 改用 `ui-visual` category

## YAML 模板结构

生成 `tests/registry/ui-interaction/{id}.yaml`，结构如下：

```yaml
id: "ui-interaction-{short-name}"
name: "{human-readable test name}"
category: "ui-interaction"
source: "issue-driven"
description: "{从 issue AC 提取的 UI 测试目标}"
safety_level: "safe"
priority: "{根据 issue severity}"
tags: ["issue-driven", "{issue-id}"]
steps:
  # Step 1: 导航到目标页面
  - action: "playwright_navigate"
    params:
      url: "http://localhost:5173{page_path}"
  # Step 2: 等待页面加载
  - action: "playwright_wait"
    params:
      selector: "{main_content_selector}"
      state: "visible"
  # Step 3: 执行交互（根据 AC 选择）
  - action: "playwright_click"  # 或 playwright_fill / playwright_select
    params:
      selector: "{target_element_selector}"
      # 如果是 fill: value: "{input_value}"
  # Step 4: 验证结果
  - action: "playwright_assert"
    params:
      selector: "{result_selector}"
      assertion: "visible"  # 或 "text_content", "attribute"
assertions:
  - type: "element_visible"
    target: "{css_selector_or_role}"
    expected: true
  # 根据 AC 选择其他断言：
  - type: "element_text"
    target: "{selector}"
    expected: "{expected_text}"
timeout_seconds: 60
```

## 推荐 Assertion Types

| AC 描述 | Assertion Type | 示例 |
|---------|---------------|------|
| "显示 XX 组件" / "XX 可见" | `element_visible` | `target: "[data-testid='case-list']"` |
| "文本显示 YY" | `element_text` | `target: ".title", expected: "Cases"` |
| "点击后跳转到 ZZ" | `element_visible` | 验证新页面的标志性元素 |
| "表单提交成功" | `element_visible` + `text_contains` | 验证成功提示出现 |
| "列表包含 N 条数据" | `element_text` | `target: ".count", expected: ">= 1"` |
| "样式/主题正确" | `screenshot_match` | 仅在 AC 明确要求视觉一致性时使用 |

## 执行步骤

1. 从 gap AC 提取 UI 交互流程：哪个页面 → 什么操作 → 期望什么结果
2. 确定 `category`：
   - 用户交互为主（click/fill/navigate）→ `ui-interaction`
   - 纯视觉/截图对比 → `ui-visual`（不属于本 recipe 范围）
3. 为 selector 选择策略：
   - 优先 `data-testid` 属性（如果代码中有）
   - 其次 ARIA role（`role="button"`）
   - 最后 CSS class（`.case-list-item`）
4. 按 YAML 模板生成测试定义
5. 如果 AC 包含多步交互流程，合并为一个测试的多个 steps（不拆分）
6. 将 testId 加入 `state.json.testQueue`

## 常见坑

| 坑 | 表现 | 解法 |
|----|------|------|
| 前端服务未启动 | Playwright 超时，页面空白 | 测试前检查 `localhost:5173`，参考 fix recipe `env-service-down.md` |
| selector 不稳定 | class 名变更导致测试碎 | 优先用 `data-testid` 或 ARIA role，避免用动态 class |
| 异步加载未等待 | 元素还没渲染就 assert → fail | 用 `playwright_wait` 等待目标元素 visible |
| SPA 路由跳转 | navigate 后 DOM 还是旧页面 | `playwright_wait` 等待新页面标志性元素出现 |
| 暗色/浅色模式差异 | 同一测试在不同主题下表现不同 | 测试中显式设定主题，或分别测试两种模式 |
| 弹窗/对话框遮挡 | 点击目标被 modal 遮挡 | 先关闭所有 overlay，再执行操作 |

_来源：ISS-166 gen-recipes | 创建：2026-03-30_
