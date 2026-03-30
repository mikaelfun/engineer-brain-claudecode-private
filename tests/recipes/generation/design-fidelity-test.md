# Recipe: Design Fidelity Test Generation

> 适用于：design-fidelity scanner 发现的 spec AC 与实际实现不符的 gap

## 匹配条件

- gap `source` = `design-fidelity`
- 或 gap description 包含以下关键词：
  - design fidelity、spec mismatch、implementation gap
  - AC 未实现、验收标准不符、spec-driven
  - conductor track、spec.md

## 前置检查

- [ ] gap 中是否包含 `trackId`（关联的 conductor track）
- [ ] gap 中 `category` 是否已由 scanner 预设（ui-interaction / backend-api / workflow-e2e 等）
- [ ] 对应的 `conductor/tracks/{trackId}/spec.md` 是否可读（提取原始 AC）
- [ ] gap 是否关联到已完成的 track（status = verified / done）

## YAML 模板结构

Category 由 scanner 预设，模板结构根据 category 分支：

### UI 相关 (category = `ui-interaction` / `ui-visual`)

```yaml
id: "{category}-df-{short-name}"
name: "Design Fidelity: {spec AC description}"
category: "{scanner_preset_category}"
source: "design-fidelity"
description: "验证 {trackId} spec AC: {ac_text}"
safety_level: "safe"
priority: "high"
tags: ["design-fidelity", "{trackId}"]
steps:
  # Step 1: 导航到相关页面
  - action: "playwright_navigate"
    params:
      url: "http://localhost:5173{page_path}"
  # Step 2: 等待内容加载
  - action: "playwright_wait"
    params:
      selector: "{content_selector}"
      state: "visible"
  # Step 3: Runtime 验证（从 spec AC 推导）
  - action: "playwright_assert"
    params:
      selector: "{target_selector}"
      assertion: "{visible/text_content/attribute}"
      expected: "{from_spec_ac}"
assertions:
  - type: "element_visible"
    target: "{selector}"
    expected: true
  - type: "element_text"
    target: "{selector}"
    expected: "{spec_ac_expected_value}"
timeout_seconds: 60
```

### API 相关 (category = `backend-api`)

```yaml
id: "backend-api-df-{short-name}"
name: "Design Fidelity: {spec AC description}"
category: "backend-api"
source: "design-fidelity"
description: "验证 {trackId} spec AC: {ac_text}"
safety_level: "{from safety.yaml}"
priority: "high"
tags: ["design-fidelity", "{trackId}"]
steps:
  - action: "http_request"
    params:
      method: "{method}"
      url: "http://localhost:3010{endpoint}"
assertions:
  - type: "status_code"
    expected: {expected_status}
  - type: "json_field"
    target: "{field}"
    expected: "{spec_ac_expected}"
timeout_seconds: 30
```

### Workflow 相关 (category = `workflow-e2e`)

```yaml
id: "workflow-e2e-df-{short-name}"
name: "Design Fidelity: {spec AC description}"
category: "workflow-e2e"
source: "design-fidelity"
description: "验证 {trackId} spec AC: {ac_text}"
safety_level: "safe"
priority: "high"
tags: ["design-fidelity", "{trackId}"]
steps:
  - action: "run_command"
    params:
      command: "{verification_command}"
  - action: "check_output"
    params:
      pattern: "{expected_pattern}"
assertions:
  - type: "file_exists"
    target: "{expected_file}"
    expected: true
  - type: "file_content"
    target: "{file_path}"
    expected: "{expected_content_pattern}"
timeout_seconds: 120
```

## 推荐 Assertion Types

| Spec AC 类型 | Assertion Type | 示例 |
|-------------|---------------|------|
| "页面应显示 XX" | `element_visible` | `target: "[data-testid='xxx']"` |
| "文案应为 YY" | `element_text` | `target: ".title", expected: "YY"` |
| "API 返回 ZZ 结构" | `json_field` | `target: "data.field", expected: "value"` |
| "文件应包含 WW" | `file_content` | `target: "path/file", expected: "pattern"` |
| "命令输出包含" | `text_contains` | `target: "stdout", expected: "success"` |
| "文件应存在" | `file_exists` | `target: "path/to/file"` |

## 执行步骤

1. 从 gap 提取关键信息：
   - `trackId` → 读 `conductor/tracks/{trackId}/spec.md` 获取原始 AC
   - `category` → scanner 预设值（直接使用，不覆盖）
   - `description` → 未实现的具体 AC 条目
2. 根据 `category` 选择对应 YAML 模板分支
3. 从 spec AC 推导 runtime 验证步骤：
   - AC 说 "应显示" → Playwright navigate + assert visible
   - AC 说 "应返回" → HTTP request + assert response
   - AC 说 "应生成/包含" → run command + check file/output
4. 添加 `source: design-fidelity` 和 `trackId` 字段到 YAML
5. 设置 `priority: high`（design fidelity gap 默认高优先级）
6. 将 testId 加入 `state.json.testQueue`

## 常见坑

| 坑 | 表现 | 解法 |
|----|------|------|
| spec AC 过于抽象 | "应该好用" → 无法推导具体断言 | 从源码推断实际行为，补充具体断言 |
| scanner category 错误 | scanner 判断 UI 但实际是 API | 检查 gap description 是否匹配 category，必要时修正 |
| track 已被修改 | spec.md 内容与 gap 创建时不同 | 以 gap 创建时的 description 为准，不重新读 spec |
| 多个 AC 合并成一个 gap | 一个 gap 包含 3 个 AC 条目 | 拆分为独立测试（每个 AC 一个），保持原子性 |
| D365 相关 AC | spec 中有 D365 写操作 AC | 标记 `safety_level: blocked`，不生成写操作测试 |

_来源：ISS-166 gen-recipes | 创建：2026-03-30_
