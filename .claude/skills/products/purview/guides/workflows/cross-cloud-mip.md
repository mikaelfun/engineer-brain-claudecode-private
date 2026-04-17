# Purview 跨云 / 跨租户 MIP 标签 — 排查工作流

**来源草稿**: `onenote-purview-cross-cloud-labeling-config.md`
**Kusto 引用**: `mip-request-analysis.md`
**场景数**: 20
**生成日期**: 2026-04-07

---

## Scenario 1: Cross-Cloud Labeling Configuration and Limitations
> 来源: onenote-purview-cross-cloud-labeling-config.md | 适用: 未标注

### 排查步骤
> Source: OneNote - cross-cloud labeling
> Status: draft

`[来源: onenote-purview-cross-cloud-labeling-config.md]`

---

## Scenario 2: Overview
> 来源: onenote-purview-cross-cloud-labeling-config.md | 适用: Mooncake ✅

### 排查步骤
Cross-cloud labeling allows users in one cloud (e.g., Gallatin/21V) to consume sensitivity-labeled content from another cloud (e.g., Global). Currently in **Public Preview**.

`[来源: onenote-purview-cross-cloud-labeling-config.md]`

---

## Scenario 3: 1. Cross-Tenant Access Policy (XTAP) - Both Sides
> 来源: onenote-purview-cross-cloud-labeling-config.md | 适用: 未标注

### 排查步骤
- Must configure bidirectional XTAP between both tenants
- If XTAP is configured bidirectionally: external users can access protected resources even without B2B Guest/Member invitation
- If XTAP is NOT configured: access to protected documents will **fail**

`[来源: onenote-purview-cross-cloud-labeling-config.md]`

---

## Scenario 4: 2. Label Encryption Permissions
> 来源: onenote-purview-cross-cloud-labeling-config.md | 适用: 未标注

### 排查步骤
Purview admins must explicitly include external user's identity in label permissions:
- By email domain: `*@partnerdomain.com`
- By specific user: `user@partnerdomain.com`

Without these permissions, even with XTAP in place, content consumption will fail.

`[来源: onenote-purview-cross-cloud-labeling-config.md]`

---

## Scenario 5: 3. Email Address Requirement
> 来源: onenote-purview-cross-cloud-labeling-config.md | 适用: 未标注

### 排查步骤
Users opening encrypted files must have an email address assigned in their directory.

`[来源: onenote-purview-cross-cloud-labeling-config.md]`

---

## Scenario 6: Supported Content Types
> 来源: onenote-purview-cross-cloud-labeling-config.md | 适用: 未标注

### 排查步骤
| Type | Supported |
|------|-----------|
| Word files (offline) | Yes |
| Excel files (offline) | Yes |
| PowerPoint files (offline) | Yes |
| Email (all Outlook clients) | **No** |

`[来源: onenote-purview-cross-cloud-labeling-config.md]`

---

## Scenario 7: Limitations
> 来源: onenote-purview-cross-cloud-labeling-config.md | 适用: 未标注

### 排查步骤
1. Only **offline** encrypted Word, Excel, and PowerPoint files are supported
2. **Email is NOT supported** - includes all Outlook clients (desktop, web, mobile)
3. Public Preview - behavior may change

`[来源: onenote-purview-cross-cloud-labeling-config.md]`

---

## Scenario 8: Reference
> 来源: onenote-purview-cross-cloud-labeling-config.md | 适用: Mooncake ✅

### 排查步骤
- [Microsoft Entra configuration for encrypted content](https://learn.microsoft.com/en-us/purview/encryption-azure-ad-configuration?view=o365-worldwide#cross-cloud-access-settings-and-encrypted-content)
- [MIP parity for 21Vianet](https://learn.microsoft.com/en-us/azure/information-protection/parity-between-azure-information-protection)
- PM contact: **Guang Yang** (doc logic and 21V-specific updates)

`[来源: onenote-purview-cross-cloud-labeling-config.md]`

---

## Scenario 9: 用途
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
分析 MIP (Microsoft Information Protection) / AIP (Azure Information Protection) 的请求日志，排查加密、解密、预授权等操作问题。

---

`[来源: mip-request-analysis.md]`

---

## Scenario 10: 执行方式
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://azrmsmc.kusto.chinacloudapi.cn`
> - database: `azrms`

`[来源: mip-request-analysis.md]`

---

## Scenario 11: 必要参数
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
| 参数 | 必填 | 说明 |
|------|------|------|
| {starttime} | 是 | 开始时间 |
| {endtime} | 是 | 结束时间 |
| {tenantId} | 否 | 租户 ID（与 correlationId 二选一） |
| {correlationId} | 否 | 关联 ID（与 tenantId 二选一） |
| {userId} | 否 | 用户对象 ID |

`[来源: mip-request-analysis.md]`

---

## Scenario 12: 查询语句
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
let correlationid = "{correlationId}";
let userobjectId = "{userId}";
IFxRequestLogEvent
| where env_time between (starttime .. endtime)
| extend targetid = iff(correlationid <> '', correlationid, iff(tenantid <> '', tenantid, 'non-exist'))
| where correlationId =~ targetid or contextId =~ targetid or homeTenantId =~ targetid
| where userObjectId contains userobjectId
| extend workload = case(
    operationName == 'AcquireTemplateInformation', 'Bootstrap',
    operationName == 'FECreateEndUserLicenseV1', 'Decryption',
    operationName == 'FECreatePublishingLicenseV1', 'Encryption',
    operationName == 'FEGetUserRights', 'Decryption',
    operationName == 'AcquireLicense', 'Decryption',
    operationName == 'AcquirePreLicense4User', 'Prelicense',
    operationName == 'FECreateClientLicensorCertificateV1', 'Bootstrap',
    operationName == 'ServiceDiscoveryForUser', 'Bootstrap',
    operationName == 'AcquireDelegationLicense', 'Prelicense',
    operationName == 'FEGetAllTemplatesV1', 'Bootstrap',
    operationName == 'FECreatePublishingLicenseAndEndUserLicenseV1', 'Encryption',
    operationName == 'AcquireDelegationLicense4User', 'Decryption',
    'N/A'
)
| extend ApiType = case(
    operationName in ('FECreateEndUserLicenseV1', 'FECreatePublishingLicenseV1', 'FEGetUserRights', 
                      'FECreateClientLicensorCertificateV1', 'FEGetAllTemplatesV1', 
                      'FECreatePublishingLicenseAndEndUserLicenseV1'), 'REST',
    operationName in ('AcquireLicense', 'AcquirePreLicense4User', 'AcquireDelegationLicense', 
                      'AcquireDelegationLicense4User'), 'SOAP',
    'Hrms'
)
| project env_time, operationName, ApiType, workload, correlationId, resultType, 
         ResourceTenant = contextId, homeTenantId, userObjectId, UserAccessType, 
         appName, appVersion, durationMs, iisWaitRequestTime, rmsTenantId, contentId, resultSignature
| order by env_time asc
```

`[来源: mip-request-analysis.md]`

---

## Scenario 13: 结果字段说明
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
| 字段 | 说明 |
|------|------|
| env_time | 事件时间 |
| operationName | 操作名称 |
| ApiType | API 类型 (REST/SOAP/Hrms) |
| workload | 工作负载类型 (Bootstrap/Encryption/Decryption/Prelicense) |
| correlationId | 关联 ID |
| resultType | 结果类型 |
| ResourceTenant | 资源租户 ID |
| homeTenantId | 用户主租户 ID |
| userObjectId | 用户对象 ID |
| UserAccessType | 用户访问类型 |
| appName | 应用程序名称 |
| durationMs | 持续时间 (毫秒) |
| resultSignature | 结果签名/错误码 |

---

`[来源: mip-request-analysis.md]`

---

## Scenario 14: 执行方式
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://azrmsmc.kusto.chinacloudapi.cn`
> - database: `azrms`

`[来源: mip-request-analysis.md]`

---

## Scenario 15: 用途
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
专门查询 Publishing License (PL) 和 End User License (EUL) 相关的解密请求。

`[来源: mip-request-analysis.md]`

---

## Scenario 16: 查询语句
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
let correlationid = "{correlationId}";
IFxRequestLogEvent 
| where env_time between (starttime .. endtime)
| extend targetid = iff(correlationid <> '', correlationid, iff(tenantid <> '', tenantid, 'non-exist'))
| where correlationId =~ targetid or contextId =~ targetid or homeTenantId =~ targetid
| where operationName in (
    "FECreateEndUserLicenseV1",
    "FECreatePublishingLicenseAndEndUserLicenseV1",
    "AcquireDelegationLicense4User",
    "AcquireDelegationLicense",
    "AcquireLicense",
    "AcquirePreLicense4User",
    "AcquirePreLicense"
)
| extend ApiType = iff(operationName in (
    "FECreateEndUserLicenseV1",
    "FECreatePublishingLicenseAndEndUserLicenseV1"
), "REST", "SOAP")
| project env_time, operationName, ApiType, correlationId, resultType, 
         ResourceTenant = contextId, homeTenantId, userObjectId, UserAccessType, 
         appName, appVersion, rmsTenantId, contentId, resultSignature
| order by env_time asc
```

---

`[来源: mip-request-analysis.md]`

---

## Scenario 17: 执行方式
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://azrmsmc.kusto.chinacloudapi.cn`
> - database: `azrms`

`[来源: mip-request-analysis.md]`

---

## Scenario 18: 查询语句
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
IFxRequestLogEvent 
| where env_time between (starttime .. endtime)
| where contextId =~ tenantid or homeTenantId =~ tenantid
| where resultType != "Success"
| summarize Count = count() by operationName, resultType, resultSignature
| order by Count desc
```

---

`[来源: mip-request-analysis.md]`

---

## Scenario 19: 执行方式
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://azrmsmc.kusto.chinacloudapi.cn`
> - database: `azrms`

`[来源: mip-request-analysis.md]`

---

## Scenario 20: 查询语句
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
```kql
IFxTrace
| where env_time between (datetime({starttime}) .. datetime({endtime}))
| where correlationId =~ "{correlationId}"
| project env_time, level, traceData, region
| order by env_time asc
```

---

`[来源: mip-request-analysis.md]`

---

# Kusto 查询参考

## 来源: `mip-request-analysis.md`

# MIP 请求日志分析

## 用途

分析 MIP (Microsoft Information Protection) / AIP (Azure Information Protection) 的请求日志，排查加密、解密、预授权等操作问题。

---

## 查询 1: 按 correlationId/tenantId 查询所有 MIP 请求

### 执行方式

> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://azrmsmc.kusto.chinacloudapi.cn`
> - database: `azrms`

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {starttime} | 是 | 开始时间 |
| {endtime} | 是 | 结束时间 |
| {tenantId} | 否 | 租户 ID（与 correlationId 二选一） |
| {correlationId} | 否 | 关联 ID（与 tenantId 二选一） |
| {userId} | 否 | 用户对象 ID |

### 查询语句

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
let correlationid = "{correlationId}";
let userobjectId = "{userId}";
IFxRequestLogEvent
| where env_time between (starttime .. endtime)
| extend targetid = iff(correlationid <> '', correlationid, iff(tenantid <> '', tenantid, 'non-exist'))
| where correlationId =~ targetid or contextId =~ targetid or homeTenantId =~ targetid
| where userObjectId contains userobjectId
| extend workload = case(
    operationName == 'AcquireTemplateInformation', 'Bootstrap',
    operationName == 'FECreateEndUserLicenseV1', 'Decryption',
    operationName == 'FECreatePublishingLicenseV1', 'Encryption',
    operationName == 'FEGetUserRights', 'Decryption',
    operationName == 'AcquireLicense', 'Decryption',
    operationName == 'AcquirePreLicense4User', 'Prelicense',
    operationName == 'FECreateClientLicensorCertificateV1', 'Bootstrap',
    operationName == 'ServiceDiscoveryForUser', 'Bootstrap',
    operationName == 'AcquireDelegationLicense', 'Prelicense',
    operationName == 'FEGetAllTemplatesV1', 'Bootstrap',
    operationName == 'FECreatePublishingLicenseAndEndUserLicenseV1', 'Encryption',
    operationName == 'AcquireDelegationLicense4User', 'Decryption',
    'N/A'
)
| extend ApiType = case(
    operationName in ('FECreateEndUserLicenseV1', 'FECreatePublishingLicenseV1', 'FEGetUserRights', 
                      'FECreateClientLicensorCertificateV1', 'FEGetAllTemplatesV1', 
                      'FECreatePublishingLicenseAndEndUserLicenseV1'), 'REST',
    operationName in ('AcquireLicense', 'AcquirePreLicense4User', 'AcquireDelegationLicense', 
                      'AcquireDelegationLicense4User'), 'SOAP',
    'Hrms'
)
| project env_time, operationName, ApiType, workload, correlationId, resultType, 
         ResourceTenant = contextId, homeTenantId, userObjectId, UserAccessType, 
         appName, appVersion, durationMs, iisWaitRequestTime, rmsTenantId, contentId, resultSignature
| order by env_time asc
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| env_time | 事件时间 |
| operationName | 操作名称 |
| ApiType | API 类型 (REST/SOAP/Hrms) |
| workload | 工作负载类型 (Bootstrap/Encryption/Decryption/Prelicense) |
| correlationId | 关联 ID |
| resultType | 结果类型 |
| ResourceTenant | 资源租户 ID |
| homeTenantId | 用户主租户 ID |
| userObjectId | 用户对象 ID |
| UserAccessType | 用户访问类型 |
| appName | 应用程序名称 |
| durationMs | 持续时间 (毫秒) |
| resultSignature | 结果签名/错误码 |

---

## 查询 2: 查询 PL/EUL 解密请求

### 执行方式

> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://azrmsmc.kusto.chinacloudapi.cn`
> - database: `azrms`

### 用途

专门查询 Publishing License (PL) 和 End User License (EUL) 相关的解密请求。

### 查询语句

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
let correlationid = "{correlationId}";
IFxRequestLogEvent 
| where env_time between (starttime .. endtime)
| extend targetid = iff(correlationid <> '', correlationid, iff(tenantid <> '', tenantid, 'non-exist'))
| where correlationId =~ targetid or contextId =~ targetid or homeTenantId =~ targetid
| where operationName in (
    "FECreateEndUserLicenseV1",
    "FECreatePublishingLicenseAndEndUserLicenseV1",
    "AcquireDelegationLicense4User",
    "AcquireDelegationLicense",
    "AcquireLicense",
    "AcquirePreLicense4User",
    "AcquirePreLicense"
)
| extend ApiType = iff(operationName in (
    "FECreateEndUserLicenseV1",
    "FECreatePublishingLicenseAndEndUserLicenseV1"
), "REST", "SOAP")
| project env_time, operationName, ApiType, correlationId, resultType, 
         ResourceTenant = contextId, homeTenantId, userObjectId, UserAccessType, 
         appName, appVersion, rmsTenantId, contentId, resultSignature
| order by env_time asc
```

---

## 查询 3: 统计失败请求

### 执行方式

> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://azrmsmc.kusto.chinacloudapi.cn`
> - database: `azrms`

### 用途

按操作类型和错误码统计失败的 MIP 请求。

### 查询语句

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
IFxRequestLogEvent 
| where env_time between (starttime .. endtime)
| where contextId =~ tenantid or homeTenantId =~ tenantid
| where resultType != "Success"
| summarize Count = count() by operationName, resultType, resultSignature
| order by Count desc
```

---

## 查询 4: 查询 RMS 跟踪日志

### 执行方式

> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://azrmsmc.kusto.chinacloudapi.cn`
> - database: `azrms`

### 用途

根据 correlationId 查询详细的跟踪日志。

### 查询语句

```kql
IFxTrace
| where env_time between (datetime({starttime}) .. datetime({endtime}))
| where correlationId =~ "{correlationId}"
| project env_time, level, traceData, region
| order by env_time asc
```

---

## 关联查询

- [rms-auth-tracking.md](./rms-auth-tracking.md) - RMS 认证追踪（ESTS 日志）

---

