# Microsoft Graph API 错误处理与重试逻辑（PowerShell）

> Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/app-integration/graph-api-error-handling-invoke-restmethod)
> Quality: guide-draft

## 适用场景

使用 PowerShell `Invoke-RestMethod` 调用 Microsoft Graph API 时的错误处理和重试模式。

## 关键模式

### Client Credentials 获取 Token
```powershell
$body = @{
    client_id     = $clientId
    client_secret = $clientSecret
    scope         = 'https://graph.microsoft.com/.default'
    grant_type    = 'client_credentials'
}
$tokenRequest = Invoke-WebRequest -Method Post -Uri "https://login.microsoftonline.com/$tenantId/oauth2/v2.0/token" -ContentType 'application/x-www-form-urlencoded' -Body $body -UseBasicParsing
$token = ($tokenRequest.Content | ConvertFrom-Json).access_token
```

### 重试逻辑框架
```powershell
$retryCount = 0; $maxRetries = 3; $pauseDuration = 2
try {
    $result = Invoke-RestMethod -Method Get -Uri $Uri -Headers @{Authorization = "Bearer $token"}
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 403 -and $retryCount -lt $maxRetries) {
        $retryCount++; Start-Sleep -Seconds $pauseDuration
        # retry...
    }
}
```

### 429 Throttling 处理
```powershell
$retryAfterValue = $_.Exception.Response.Headers["Retry-After"]
```

## 常见错误码

| 状态码 | 含义 | 处理 |
|--------|------|------|
| 401 | Token 过期/无效 | 刷新 token 重试 |
| 403 | 权限不足 | 检查 API permissions + RBAC 角色 |
| 404 | 对象不存在 | 确认 objectId，注意复制延迟 |
| 429 | 请求过多 | 读取 Retry-After header，等待后重试 |

## 参考
- [Microsoft Graph throttling guidance](https://learn.microsoft.com/en-us/graph/throttling)
