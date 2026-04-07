# ARM 异步操作追踪与 provisioningState 诊断

> Source: https://learn.microsoft.com/azure/azure-resource-manager/management/async-operations

## 异步操作状态码

| HTTP 初始响应 | 含义 |
|--------------|------|
| 201 Created | 资源创建已接受 |
| 202 Accepted | 操作已接受，异步执行中 |

完成时返回 200 OK 或 204 No Content。

## 追踪状态的两种方式

### 1. Azure-AsyncOperation header（优先）
```http
GET {Azure-AsyncOperation-URL}
```
返回：
```json
{
  "status": "Succeeded | Failed | Canceled | InProgress | {custom}",
  "error": { "code": "...", "message": "..." }
}
```

### 2. Location header（当 Azure-AsyncOperation 不存在时）
```http
GET {Location-URL}
```
- 运行中返回 202
- 完成返回 200 + 资源内容

## provisioningState 值

| 状态 | 含义 |
|------|------|
| Succeeded | 操作成功 |
| Failed | 操作失败 |
| Canceled | 操作取消 |
| Accepted | 已接受，执行中 |
| Updating | 资源创建/更新中 |
| Deleting | 资源删除中 |
| Migrating | ASM 到 ARM 迁移中 |

## 权限要求

追踪异步操作状态需要 **资源组级别权限**（不是资源级别），因为追踪 URL 不以具体资源为范围。

## 常见场景

### VM 启动（202 + Azure-AsyncOperation）
```http
POST .../virtualMachines/{vm}/start?api-version=2019-12-01
# → 202 + Azure-AsyncOperation header
# → GET Azure-AsyncOperation URL → status: InProgress/Succeeded
```

### 部署资源（201 + Azure-AsyncOperation）
```http
PUT .../deployments/{name}?api-version=2020-06-01
# → 201 + provisioningState: Accepted
# → GET operationStatuses URL → status: Running/Succeeded
```

### 创建存储账户（202 + Location + Retry-After）
```http
PUT .../storageAccounts/{name}?api-version=2019-06-01
# → 202 + Location header + Retry-After: 17
# → 等待 Retry-After 秒后 GET Location URL
# → 202（进行中）或 200（完成 + 资源内容）
```

## 重试策略

- 始终尊重 `Retry-After` header 指定的等待时间
- 未返回 Retry-After 时需实现自定义重试逻辑
- REST client 需支持至少 4KB 长度的 URL

## Failed 状态恢复（Network 资源）

Network 资源 provisioningState 为 Failed 时，可通过 Get + Set 操作恢复：
```powershell
Get-AzVirtualNetwork -Name {name} -ResourceGroupName {rg} | Set-AzVirtualNetwork
```
注意：先 Get 再 Set，不要直接 Set（会重置为默认配置）。
