---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/AdminUI/Troubleshooting with Browser DevTools"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FAdminUI%2FTroubleshooting%20with%20Browser%20DevTools"
importDate: "2026-04-04"
type: troubleshooting-guide
---

# Intune Admin UI — 浏览器 DevTools / HAR 文件诊断指南

> 适用：Intune Admin Center（intune.microsoft.com）页面加载失败、操作静默失败、spinner 不消失等场景

## 前置知识

Intune 门户是 **SPA**，所有操作通过 Graph API（graph.microsoft.com）发出 HTTPS 请求。关键标识符：
- `client-request-id`：每次请求唯一 ID，可在 Kusto 中关联后端 telemetry

```
Browser (SPA) → HTTPS → graph.microsoft.com → Intune Backend (CMService)
```

## 收集 HAR 文件（Edge DevTools）

1. 打开 Edge，导航到 https://intune.microsoft.com
2. 按 **F12** 打开 DevTools → 点击 **Network** 标签
3. 确认红色 Record 按钮激活；勾选 **Preserve log**；可选勾选 **Disable cache**
4. 复现问题
5. 右键 Network 请求列表 → **Save all as HAR with content**

> ⚠️ HAR 文件含认证 token 和 session cookie，仅通过安全渠道（DTM/安全文件上传）传输。

## 从 HAR 提取关键信息

### 过滤 Graph API 调用
在 Network 过滤栏输入：`graph.microsoft.com`

### 关键 Request Headers

| Header | 说明 |
|--------|------|
| `client-request-id` | **最重要** — 每次请求的唯一 ID，用于 Kusto 关联 |
| `Authorization` | Bearer token，**外部分享前脱敏** |

### 失败响应 Body 示例
```json
{
  "error": {
    "code": "Authorization_RequestDenied",
    "message": "Insufficient privileges to complete the operation.",
    "innerError": {
      "request-id": "3fa85f64-...",
      "client-request-id": "3fa85f64-..."
    }
  }
}
```

## 常见 HTTP 错误排查

### HTTP 403 Forbidden
**根因**：管理员缺少必要 Graph 权限或 Intune RBAC 角色
**排查**：
1. 识别失败 URL（如 `GET /deviceManagement/managedDevices`）
2. 读取 response body 中的 error.code
3. 检查管理员在 Intune Admin Center 的 RBAC 角色分配
4. 对照 [Graph permissions reference](https://learn.microsoft.com/en-us/graph/permissions-reference)

### HTTP 429 Too Many Requests
**根因**：租户或用户超过 Graph API 限速
**排查**：
1. 检查响应头 `Retry-After` 值
2. 建议减少并发 API 轮询/自动化频率
3. 参考 [Graph throttling guidance](https://learn.microsoft.com/en-us/graph/throttling)

### HTTP 500 / 503
**根因**：Intune 后端瞬时错误
**排查**：
1. 提取 `client-request-id`
2. 检查 [M365 Service Health Dashboard](https://admin.microsoft.com)
3. 若无活跃事件，用 client-request-id 查 Kusto

### 请求挂起/超时
**根因**：代理阻断 Graph 端口，或后端处理延迟
**排查（看 HAR Timing 标签）**：
- Wait 极高 → 后端问题 → Kusto
- Connect 失败 → 检查 graph.microsoft.com:443 是否被代理/防火墙拦截

## Kusto 查询模板

### 用 client-request-id 追踪请求（CMService）
```kusto
let startTime = ago(24h);
let endTime = now();
CMService
| where env_time between (startTime .. endTime)
| where clientRequestId == "[ClientRequestId]"
| project env_time, operationName, resultType, resultSignature, resultDescription, durationMs, clientRequestId, correlationId, tenantId
| order by env_time asc
```

### 用 client-request-id 追踪 Graph 网关层（HttpsSubsystem）
```kusto
let startTime = ago(24h);
let endTime = now();
HttpsSubsystem
| where env_time between (startTime .. endTime)
| where clientRequestId == "[ClientRequestId]"
| project env_time, requestUri, httpMethod, httpStatusCode, durationMs, clientRequestId, authenticationErrorCode, tenantId
| order by env_time asc
```

### 完整请求路径（Gateway + Backend 合并）
```kusto
let targetClientRequestId = "[ClientRequestId]";
let startTime = ago(24h);
let endTime = now();
HttpsSubsystem
| where env_time between (startTime .. endTime)
| where clientRequestId == targetClientRequestId
| project env_time, Layer = "GraphGateway", Detail = requestUri, StatusCode = httpStatusCode, durationMs, clientRequestId
| union (
    CMService
    | where env_time between (startTime .. endTime)
    | where clientRequestId == targetClientRequestId
    | project env_time, Layer = "CMService", Detail = operationName, StatusCode = resultSignature, durationMs, clientRequestId
)
| order by env_time asc
```

### 查询租户某时间窗口内所有失败
```kusto
CMService
| where env_time between (datetime(2026-03-20T00:00:00Z) .. datetime(2026-03-20T01:00:00Z))
| where tenantId == "[TenantID]"
| where resultType != "Success"
| summarize FailureCount = count() by operationName, resultSignature, resultDescription
| order by FailureCount desc
```

## Scoping Questions

1. 问题发生的精确 URL？
2. 触发问题的操作是什么？
3. UI 显示的错误信息（如有）？
4. 问题是持续性还是间歇性？
5. 所有管理员账号都受影响还是特定账号？
6. 使用的浏览器和版本（Edge 用 `edge://version` 查看）？
7. 是否在 InPrivate 模式下复现？

## FAQ

**Q: HAR 显示 HTTP 200 但 UI 仍报错？**
A: Graph API 可在 HTTP 200 响应中携带 OData 错误 body。查看 Response 标签中是否有 `"error"` JSON 节点。

**Q: 客户担心 HAR 文件含 token？**
A: 建议用测试账号复现再抓包。或客户本地查看 HAR 只提供 `client-request-id` 值，工程师用 Kusto 查询即可，无需查看 token。

**Q: Company Portal 移动端 App 也适用此方法？**
A: 不适用。移动端/桌面 CP App 需直接从 App 收集日志（iOS/Android: Help → Send logs；Windows: Settings → Send logs 或 mdmdiagnosticstool）。

## 支持边界

| 支持范围 | 不支持 |
|---------|--------|
| 从 HAR 识别失败的 Graph API 调用 | 修复客户侧网络代理配置 |
| 用 client-request-id 关联后端 telemetry | 与客户分享原始后端日志 |
| 识别 RBAC/权限错误 | 调试客户自建 Graph API 自动化 |
