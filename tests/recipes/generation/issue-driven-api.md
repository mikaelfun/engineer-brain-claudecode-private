# Recipe: Issue-Driven API Test Generation

> 适用于：issue AC 包含 API 端点、HTTP 方法、curl 命令或后端接口描述的 gap

## 匹配条件

- gap `source` = `issue-driven`
- gap AC / description 包含以下关键词之一：
  - API、endpoint、HTTP、GET、POST、PUT、DELETE、PATCH
  - curl、fetch、request、response、status code
  - `/api/`、REST、backend、server-side
  - JSON response、payload、header

## 前置检查

- [ ] gap 中是否有明确的 API endpoint 路径（如 `/api/cases/:id`）
- [ ] gap 是否指定了期望的 HTTP status code 或 response body 结构
- [ ] 该 endpoint 是否在 `tests/safety.yaml` 中被标记为 `blocked`（D365 写操作）
- [ ] 是否有 authentication 要求（当前测试框架仅支持 localhost 无 auth）

## YAML 模板结构

生成 `tests/registry/backend-api/{id}.yaml`，结构如下：

```yaml
id: "backend-api-{short-name}"
name: "{human-readable test name}"
category: "backend-api"
source: "issue-driven"
description: "{从 issue AC 提取的测试目标描述}"
safety_level: "{从 safety.yaml 查表}"
priority: "{根据 issue severity: critical/high/medium/low}"
tags: ["issue-driven", "{issue-id}"]
steps:
  - action: "http_request"
    params:
      method: "{GET/POST/PUT/DELETE}"
      url: "http://localhost:3010{endpoint_path}"
      # 如果是 POST/PUT，添加 body:
      # body: { ... }
      # 如果需要 headers:
      # headers: { "Content-Type": "application/json" }
assertions:
  - type: "status_code"
    expected: {expected_status}
  # 根据 AC 选择以下断言类型：
  - type: "json_field"
    target: "{field_path}"
    expected: "{expected_value}"
  # 或
  - type: "text_contains"
    target: "response.body"
    expected: "{expected_substring}"
timeout_seconds: 30
```

## 推荐 Assertion Types

| AC 描述 | Assertion Type | 示例 |
|---------|---------------|------|
| "返回 200" / "should succeed" | `status_code` | `expected: 200` |
| "返回 JSON 包含 field X" | `json_field` | `target: "data.status", expected: "ok"` |
| "响应包含字符串 Y" | `text_contains` | `target: "response.body", expected: "success"` |
| "响应时间 < N ms" | `timing_under` | `target: "response_time", expected: 2000` |
| "返回列表长度 > 0" | `json_field` | `target: "data.length", expected: "> 0"` |

## 执行步骤

1. 从 gap AC 提取 endpoint 信息（method + path + expected response）
2. 查 `tests/safety.yaml` 确认 `safety_level`
3. 按上方 YAML 模板生成测试定义
4. 如果 AC 中有多个独立的 API 场景（如 "GET 列表 + POST 创建"），拆分为多个测试文件
5. 每个测试文件的 `id` 以 `backend-api-` 开头
6. 将 testId 加入 `state.json.testQueue`

## 常见坑

| 坑 | 表现 | 解法 |
|----|------|------|
| endpoint 路径包含动态参数 | `/api/cases/:id` 直接写入 url 导致 404 | 使用 `test_case_id` 或 `data_source: synthetic` 提供真实 ID |
| POST body 结构不明确 | issue AC 只说 "创建 case" 没给 body schema | 从源码 `dashboard/src/routes/` 推断 body 结构 |
| D365 写操作端点 | 测试尝试写 D365 → safety blocked | 检查 safety.yaml，标记 `safety_level: blocked` + skip |
| 端口不对 | 用了 5173（前端）而非 3010（后端） | 所有 API 测试统一用 `localhost:3010` |
| 缺少 error case 测试 | 只测 happy path 200 | AC 如有 error 场景，补充 4xx 测试用例 |

_来源：ISS-166 gen-recipes | 创建：2026-03-30_
