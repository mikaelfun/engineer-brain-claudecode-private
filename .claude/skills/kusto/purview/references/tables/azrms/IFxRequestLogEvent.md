---
name: IFxRequestLogEvent
database: azrms
cluster: https://azrmsmc.kusto.chinacloudapi.cn
description: MIP/AIP 请求日志，记录加密、解密、预授权等操作
status: active
---

# IFxRequestLogEvent

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azrmsmc.kusto.chinacloudapi.cn |
| 数据库 | azrms |
| 状态 | ✅ 可用 |

## 用途

记录 MIP (Microsoft Information Protection) / AIP (Azure Information Protection) 的请求日志，包括：
- **加密操作** (Encryption)
- **解密操作** (Decryption)
- **预授权** (Prelicense)
- **引导操作** (Bootstrap) - 获取模板、证书等

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| env_time | datetime | 事件时间 |
| operationName | string | 操作名称 |
| resultType | string | 结果类型 (Success/Failure) |
| resultSignature | string | 结果签名/错误码 |
| durationMs | uint | 请求持续时间 (毫秒) |
| correlationId | string | 关联 ID |
| contextId | string | 资源租户 ID |
| homeTenantId | string | 用户主租户 ID |
| userObjectId | string | 用户对象 ID |
| UserAccessType | string | 用户访问类型 |
| appName | string | 应用程序名称 |
| appVersion | string | 应用程序版本 |
| rmsTenantId | string | RMS 租户 ID |
| contentId | string | 受保护内容 ID |
| iisWaitRequestTime | long | IIS 请求等待时间 |
| callerIpAddress | string | 调用者 IP 地址 |
| templateId | string | 模板 ID |
| ownerEmail | string | 所有者邮箱 |
| clientDevicePlatform | string | 客户端设备平台 |
| clientSdkVersion | string | 客户端 SDK 版本 |

## RMS Workload 类型

| Workload | 说明 | 关联操作 |
|----------|------|----------|
| Bootstrap | 引导/初始化 | AcquireTemplateInformation, FECreateClientLicensorCertificateV1, ServiceDiscoveryForUser, FEGetAllTemplatesV1 |
| Encryption | 加密操作 | FECreatePublishingLicenseV1, FECreatePublishingLicenseAndEndUserLicenseV1 |
| Decryption | 解密操作 | FECreateEndUserLicenseV1, FEGetUserRights, AcquireLicense, AcquireDelegationLicense4User |
| Prelicense | 预授权 | AcquirePreLicense4User, AcquireDelegationLicense |
| Admin | 管理操作 | - |

## API 类型

| API 类型 | 说明 | 操作 |
|----------|------|------|
| REST | REST API | FECreateEndUserLicenseV1, FECreatePublishingLicenseV1, FEGetUserRights, FECreateClientLicensorCertificateV1, FEGetAllTemplatesV1, FECreatePublishingLicenseAndEndUserLicenseV1 |
| SOAP | SOAP API (旧版) | AcquireLicense, AcquirePreLicense4User, AcquireDelegationLicense, AcquireDelegationLicense4User |
| Hrms | 其他 | - |

## 常用筛选字段

- `correlationId` - 按请求关联 ID 筛选
- `contextId` / `homeTenantId` - 按租户 ID 筛选
- `userObjectId` - 按用户 ID 筛选
- `operationName` - 按操作类型筛选
- `resultType` - 按结果筛选 (Success/Failure)

## 典型应用场景

1. **排查加密失败** - 查询 Encryption workload 的失败请求
2. **排查解密失败** - 查询 Decryption workload 的失败请求
3. **审计 RMS 使用** - 按租户/用户统计请求
4. **性能分析** - 分析 durationMs 和 iisWaitRequestTime

## 示例查询

### 按 correlationId 查询请求
```kql
cluster('azrmsmc.kusto.chinacloudapi.cn').database('azrms').IFxRequestLogEvent 
| where env_time between (datetime({starttime}) .. datetime({endtime}))
| where correlationId =~ "{correlationId}"
| project env_time, operationName, resultType, resultSignature, durationMs, 
         contextId, homeTenantId, userObjectId, appName
| order by env_time asc
```

### 按租户查询失败请求
```kql
cluster('azrmsmc.kusto.chinacloudapi.cn').database('azrms').IFxRequestLogEvent 
| where env_time between (datetime({starttime}) .. datetime({endtime}))
| where contextId =~ "{tenantId}" or homeTenantId =~ "{tenantId}"
| where resultType != "Success"
| project env_time, operationName, resultType, resultSignature, userObjectId, appName
| order by env_time desc
```

## 关联表

- [IFxTrace.md](./IFxTrace.md) - RMS 跟踪日志
- [PerRequestTableIfx.md](./PerRequestTableIfx.md) - AAD 登录请求 (ESTS)

## 注意事项

- 使用 `env_time` 作为时间筛选字段
- `contextId` 是资源租户，`homeTenantId` 是用户主租户
- 跨租户访问时两者可能不同
