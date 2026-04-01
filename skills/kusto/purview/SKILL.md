---
name: purview
description: Purview/RMS Kusto 查询专家 - 诊断 Azure Information Protection、MIP 加密解密、DLP 策略、DLM 邮件保留、SCC RBAC 权限问题。Kusto 查询直接执行返回结果，Geneva 日志自动构建链接并用浏览器打开。
author: fangkun
last_modified: 2026-02-14
---

# Purview/RMS Kusto 查询 Skill

## 概述

本 Skill 用于查询 Azure Purview、Azure RMS (Azure Information Protection)、MIP (Microsoft Information Protection)、DLP (Data Loss Prevention)、DLM (Data Lifecycle Management)、SCC RBAC 相关日志，诊断加密解密、认证、策略评估、邮件保留、权限等问题。

- **Kusto 查询**: 使用 `kusto_query` 工具直接执行 KQL 查询并返回结果
- **Geneva 日志**: 自动构建 Jarvis URL 并通过 `Start-Process` 在浏览器中打开

## 触发关键词

- Purview、Azure Information Protection、AIP
- Azure RMS、Rights Management、MIP
- 加密、解密、Encryption、Decryption
- 敏感度标签、Sensitivity Label
- DLP、Data Loss Prevention、数据丢失防护
- 预授权、Prelicense
- Publishing License、PL、EUL
- DLM、邮件生命周期、Email Lifecycle、ELC
- 保留策略、Retention Policy、自动归档
- 策略同步、Policy Sync、Unified Policy
- SCC RBAC、合规门户权限、Security Compliance Center

## 集群信息

| 集群名称 | URI | 数据库 | 用途 |
|----------|-----|--------|------|
| Azure RMS MC | https://azrmsmc.kusto.chinacloudapi.cn | azrms | MIP/AIP 请求日志 |
| ESTS MC | https://estscnn2.chinanorth2.kusto.chinacloudapi.cn | ESTS | AAD 登录日志 (RMS 认证) |

详细集群信息见: [kusto_clusters.csv](./references/kusto_clusters.csv)

## 访问权限

- CME 卡有直接访问权限
- 需要 Azure Information Protection 相关支持权限

## 主要表

### azrms 数据库 (Azure RMS MC)

| 表名 | 用途 | 文档 |
|------|------|------|
| IFxRequestLogEvent | MIP 请求日志（加密、解密、预授权等） | [📄](./references/tables/azrms/IFxRequestLogEvent.md) |
| IFxTrace | RMS 跟踪日志 | [📄](./references/tables/azrms/IFxTrace.md) |
| IFxScenarioLogEvent | RMS 场景日志 | [📄](./references/tables/azrms/IFxScenarioLogEvent.md) |

### ESTS 数据库 (ESTS MC)

| 表名 | 用途 | 文档 |
|------|------|------|
| PerRequestTableIfx | AAD 登录请求（用于 RMS 认证） | [📄](./references/tables/ESTS/PerRequestTableIfx.md) |
| DiagnosticTracesIfx | 诊断跟踪日志（AAD 错误详情） | [📄](./references/tables/ESTS/DiagnosticTracesIfx.md) |

详细表定义见: [tables/](./references/tables/)

## 执行模式

本 Skill 有两种查询执行模式，根据问题类型自动选择：

### 模式 A: Kusto 直接查询 (使用 kusto_query 工具)

适用于 Kusto 集群上的表，**必须直接调用 `kusto_query` 工具执行查询并返回结果**，不要只展示 KQL 语句。

**执行方式**: 使用 `KUSTO-AzureCM-kusto_query` 工具
- `cluster_uri`: 目标集群 URI
- `database`: 目标数据库名称
- `query`: 替换好参数的 KQL 查询语句

**适用场景**: MIP 请求日志、RMS 登录、AADSTS 错误诊断

### 模式 B: Geneva Portal 链接 (构建 URL 并用浏览器打开)

适用于 Geneva Portal (Jarvis) 的事件日志，**必须构建完整的 Geneva URL 并通过 `Start-Process` 在浏览器中打开**。

**执行方式**: 
1. 根据参数构建完整的 Geneva Jarvis URL
2. 使用 PowerShell 命令 `Start-Process "{constructed_url}"` 在默认浏览器中打开

**适用场景**: DLP、DLM/ELC、策略同步、SCC RBAC、EOP 相关日志

---

## 工作流程

### 步骤 1: 确定问题类型和执行模式

| 问题类型 | 执行模式 | 查询目标 |
|----------|----------|----------|
| MIP 加密/解密失败 | 🔵 模式 A (Kusto 直接查询) | IFxRequestLogEvent @ azrmsmc/azrms |
| Azure RMS 登录失败 | 🔵 模式 A (Kusto 直接查询) | PerRequestTableIfx @ estscnn2/ESTS |
| AADSTS 错误详情 | 🔵 模式 A (Kusto 直接查询) | DiagnosticTracesIfx @ estscnn2/ESTS |
| RMS 跟踪日志 | 🔵 模式 A (Kusto 直接查询) | IFxTrace @ azrmsmc/azrms |
| DLP 策略问题 | 🟠 模式 B (Geneva 浏览器) | DLPSubstrateEvent @ O365PassiveGal |
| 邮件保留/归档/ELC | 🟠 模式 B (Geneva 浏览器) | ElcStatsLogEntryEvent @ O365PassiveGal |
| 策略同步问题 | 🟠 模式 B (Geneva 浏览器) | UnifiedPolicyMonitoringInfoLogEvent @ O365EopGal |
| SCC RBAC/合规门户 | 🟠 模式 B (Geneva 浏览器) | ServerEventLog @ ProtectionCenterPROD |

### 步骤 2: 收集必要参数

| 参数 | 说明 | 获取方式 |
|------|------|----------|
| correlationId | MIP/AAD 请求关联 ID | 客户端日志、错误消息 |
| tenantId | Azure AD 租户 ID | Azure Portal |
| userObjectId | 用户对象 ID | Azure AD 用户属性 |
| contentId | 受保护内容 ID | IFxRequestLogEvent 表 |
| objectId | 邮件/文件 ID | EXO 邮件跟踪、Purview 审计日志 |
| mailboxGuid | 邮箱 GUID | PowerShell: get-mailbox \<upn\> \| select Name, ExchangeGuid |
| sessionId | SCC 会话 ID | 浏览器开发者工具、SCC 日志 |

### 步骤 3: 执行查询

---

#### 🔵 模式 A 查询 - Kusto 直接执行

> **重要**: 以下查询必须使用 `KUSTO-AzureCM-kusto_query` 工具直接执行，替换参数后发起查询，将结果直接返回给用户分析。

##### 3.1 查询 MIP 请求日志

**工具调用**: `KUSTO-AzureCM-kusto_query`
- cluster_uri: `https://azrmsmc.kusto.chinacloudapi.cn`
- database: `azrms`

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
let correlationid = "{correlationId}";
IFxRequestLogEvent 
| where env_time between (starttime .. endtime)
| extend targetid = iff(correlationid <> '', correlationid, iff(tenantid <> '', tenantid, 'non-exist'))
| where correlationId =~ targetid or contextId =~ targetid or homeTenantId =~ targetid
| extend workload = case(
    operationName == 'FECreateEndUserLicenseV1', 'Decryption',
    operationName == 'FECreatePublishingLicenseV1', 'Encryption',
    operationName == 'AcquireLicense', 'Decryption',
    operationName == 'AcquirePreLicense4User', 'Prelicense',
    'Bootstrap'
)
| project env_time, operationName, workload, correlationId, resultType, 
         ResourceTenant = contextId, homeTenantId, userObjectId, appName, resultSignature
| order by env_time asc
```

##### 3.2 查询 RMS 登录请求

**工具调用**: `KUSTO-AzureCM-kusto_query`
- cluster_uri: `https://estscnn2.chinanorth2.kusto.chinacloudapi.cn`
- database: `ESTS`

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
let correlationid = "{correlationId}";
PerRequestTableIfx
| where env_time between (starttime .. endtime)
| extend targetid = iff(correlationid <> '', correlationid, iff(tenantid <> '', tenantid, 'non-exist'))
| where CorrelationId =~ targetid or Tenant =~ targetid or TenantId =~ targetid or UserTenantId =~ targetid
| where ResourceId == '00000012-0000-0000-c000-000000000000'  // Azure RMS
| project env_time, CorrelationId, ErrorCode, Result, ApplicationDisplayName, 
         ClientIp, HttpStatusCode, UserPrincipalObjectID
| order by env_time desc
```

##### 3.3 查询 AADSTS 错误详情

**工具调用**: `KUSTO-AzureCM-kusto_query`
- cluster_uri: `https://estscnn2.chinanorth2.kusto.chinacloudapi.cn`
- database: `ESTS`

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let correlationid = "{correlationId}";
DiagnosticTracesIfx
| where env_time between (starttime .. endtime)
| where CorrelationId == correlationid
| where Message contains "AADSTS" or Exception contains "AADSTS"
| project env_time, Message, Exception
| order by env_time asc
```

---

#### 🟠 模式 B 查询 - Geneva Portal 浏览器打开

> **重要**: 以下查询必须构建完整的 Geneva Jarvis URL，然后使用 PowerShell `Start-Process` 命令在浏览器中打开。用户需要使用 CME 账号登录 Geneva Portal 查看结果。

##### 通用 Geneva URL 构建规则

1. 计算时间偏移: `timediff_minutes = (endtime - starttime) 的分钟数`
2. 替换 URL 模板中的参数
3. 执行: `Start-Process "{url}"` 在浏览器中打开
4. 告知用户使用 CME 账号登录查看结果

##### 3.4 DLP 策略日志 (SPO/ODB)

**Geneva URL 模板** - 详见 [dlp-jarvis-urls.md](./references/queries/dlp-jarvis-urls.md)

```powershell
# 构建并打开 DLP SPO/ODB 日志
$starttime = "{starttime}"
$minutes = {minutes}
$tenantId = "{tenantId}"
$objectId = "{objectId}"
$url = "https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=$starttime&offset=$minutes&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365PassiveGal&en=DLPSubstrateErrorEvent,DLPSubstrateEvent&conditions=[[`"TenantId`",`"%3D%3D`",`"$tenantId`"],[`"WorkloadItemId`",`"contains`",`"$objectId`"]]&kqlClientQuery=source|project%20env_time,%20CorrelationId,%20AssistantName,%20Data,%20WorkloadItemId|sort%20by%20env_time%20asc"
Start-Process $url
```

##### 3.5 DLM 邮件生命周期 (ELC)

**Geneva URL 模板** - 详见 [dlm-elc-operations.md](./references/queries/dlm-elc-operations.md)

```powershell
# 构建并打开 ELC 状态日志
$starttime = "{starttime}"
$minutes = {minutes}
$tenantId = "{tenantId}"
$mailboxGuid = "{mailboxGuid}"
$url = "https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=$starttime&offset=$minutes&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365PassiveGal&en=ElcStatsLogEntryEvent,ElcStatsLogEntryExceptionEvent&conditions=[[`"tenantId`",`"%3D%3D`",`"$tenantId`"],[`"mailboxGuid`",`"contains`",`"$mailboxGuid`"]]&kqlClientQuery=source%0A|%20sort%20by%20env_time%20asc"
Start-Process $url
```

```powershell
# 构建并打开 ELC 跟踪日志
$starttime = "{starttime}"
$minutes = {minutes}
$tenantId = "{tenantId}"
$mailboxGuid = "{mailboxGuid}"
$url = "https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=$starttime&offset=$minutes&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365PassiveGal&en=ElcAssistantTraceEvent,ElcAssistantTraceExEvent&conditions=[[`"tenantId`",`"%3D%3D`",`"$tenantId`"],[`"mailboxGuid`",`"contains`",`"$mailboxGuid`"]]&kqlClientQuery=source%0A|%20project%20env_time,%20message,%20activityId,%20operationId,assistantName%20,%20scenario,%20subScenario,%20mailboxGuid%0A|%20sort%20by%20env_time%20asc"
Start-Process $url
```

##### 3.6 策略同步状态

**Geneva URL 模板** - 详见 [dlm-policy-sync.md](./references/queries/dlm-policy-sync.md)

```powershell
# 构建并打开策略同步日志
$starttime = "{starttime}"
$minutes = {minutes}
$tenantId = "{tenantId}"
$correlationId = "{correlationId}"
$url = "https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=$starttime&offset=$minutes&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365EopGal&en=UnifiedPolicyMonitoringInfoLogEvent&conditions=[[`"TenantId`",`"%3D%3D`",`"$tenantId`"],[`"ClientCorrelationId`",`"contains`",`"$correlationId`"]]&kqlClientQuery=source%0A|%20project%20env_time,%20activityId,%20operationId,%20ObjectId,%20Workload,%20PolicyScenario%20,ClientCorrelationId,%20Stage,%20Status,%20CustomData,%20Latency%0A|%20extend%20Pipeline%20%3D%20iif(ObjectId%20%3D%3D%20%2200000000-0000-0000-0000-000000000000%22,%20%22FileSync%22,%20%22ObjectSync%22)"
Start-Process $url
```

##### 3.7 SCC RBAC 日志

**Geneva URL 模板** - 详见 [scc-rbac-logs.md](./references/queries/scc-rbac-logs.md)

```powershell
# 构建并打开 SCC RBAC 日志
$starttime = "{starttime}"
$minutes = {minutes}
$tenantId = "{tenantId}"
$sessionId = "{sessionId}"
$url = "https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=$starttime&offset=$minutes&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=ProtectionCenterPROD&en=ServerEventLog,TraceEventLog&conditions=[[`"TenantId`",`"%3D%3D`",`"$tenantId`"],[`"SessionId`",`"contains`",`"$sessionId`"]]&aggregates=[`"Count%20by%20domainStatus`",`"Count%20by%20domainName`",`"Count%20by%20resultType`"]"
Start-Process $url
```

## 常见诊断场景

### 场景 1: MIP 加密/解密失败

**症状**: 用户无法打开或加密受保护的文档

**执行动作** (🔵 模式 A):
1. 向用户获取 correlationId 或 tenantId 和时间范围
2. 调用 `KUSTO-AzureCM-kusto_query` 查询 IFxRequestLogEvent (cluster: `https://azrmsmc.kusto.chinacloudapi.cn`, db: `azrms`)
3. 检查 resultType 和 resultSignature 了解失败原因
4. 如涉及认证问题，继续调用 `KUSTO-AzureCM-kusto_query` 查询 PerRequestTableIfx (cluster: `https://estscnn2.chinanorth2.kusto.chinacloudapi.cn`, db: `ESTS`)

**常见错误**:
| 错误 | 原因 | 解决方案 |
|------|------|----------|
| resultType = "Failure" | 请求处理失败 | 查看 resultSignature 详情 |
| 超时 | 网络或服务问题 | 检查 durationMs 和 iisWaitRequestTime |

### 场景 2: Azure RMS 登录失败

**症状**: 用户访问 RMS 时出现登录错误

**执行动作** (🔵 模式 A):
1. 向用户获取 correlationId 或 tenantId 和时间范围
2. 调用 `KUSTO-AzureCM-kusto_query` 查询 PerRequestTableIfx (ResourceId = Azure RMS)
3. 检查 ErrorCode 和 Result
4. 如需详细错误信息，调用 `KUSTO-AzureCM-kusto_query` 查询 DiagnosticTracesIfx (搜索 AADSTS 错误)

**常见 AADSTS 错误**:
| 错误码 | 说明 |
|--------|------|
| AADSTS50076 | 需要 MFA |
| AADSTS53003 | 被条件访问策略阻止 |
| AADSTS65001 | 用户未同意应用程序 |

### 场景 3: DLP 策略未触发

**症状**: 预期应触发的 DLP 策略未生效

**执行动作** (🟠 模式 B):
1. 确定工作负载 (SPO/ODB 或 EXO)
2. 向用户获取 TenantId、ObjectId 和时间范围
3. 根据模板构建 Geneva Jarvis URL
4. 使用 `Start-Process "{url}"` 在浏览器中打开
5. 告知用户使用 CME 账号登录查看 AssistantName 和 Data 字段

**Jarvis URL 模板** - 见 [dlp-jarvis-urls.md](./references/queries/dlp-jarvis-urls.md)

### 场景 4: 邮件保留/归档/ELC 问题

**症状**: 邮件保留策略未生效、邮件未自动过期或归档失败

**执行动作** (🟠 模式 B):
1. 向用户获取 TenantId、MailboxGuid (通过 `get-mailbox <upn> | select Name, ExchangeGuid`) 和时间范围
2. 构建 ELC 状态事件 Geneva URL (ElcStatsLogEntryEvent)
3. 构建 ELC 跟踪日志 Geneva URL (ElcAssistantTraceEvent)
4. 使用 `Start-Process "{url}"` 在浏览器中打开两个链接
5. 告知用户检查 scenario/subScenario 和 message 字段

**Jarvis URL 模板** - 见 [dlm-elc-operations.md](./references/queries/dlm-elc-operations.md)

### 场景 5: 策略同步失败或延迟

**症状**: DLP/保留策略在 SCC 中配置后未同步到 SPO/EXO 等工作负载

**执行动作** (🟠 模式 B):
1. 向用户获取 TenantId 和 ClientCorrelationId 和时间范围
2. 构建 UnifiedPolicyMonitoringInfoLogEvent Geneva URL
3. 使用 `Start-Process "{url}"` 在浏览器中打开
4. 告知用户检查 Status、Stage、Pipeline 和 CustomData 字段

**Jarvis URL 模板** - 见 [dlm-policy-sync.md](./references/queries/dlm-policy-sync.md)

### 场景 6: SCC RBAC/合规门户权限问题

**症状**: 用户无法访问 Purview 合规门户或执行特定操作

**执行动作** (🟠 模式 B):
1. 向用户获取 TenantId 和 SessionId (可选) 和时间范围
2. 构建 ProtectionCenterPROD Geneva URL (ServerEventLog, TraceEventLog)
3. 使用 `Start-Process "{url}"` 在浏览器中打开
4. 告知用户检查 resultType 和 domainStatus 字段

**Jarvis URL 模板** - 见 [scc-rbac-logs.md](./references/queries/scc-rbac-logs.md)

## RMS Workload 类型参考

| Workload | 说明 | 关联操作 |
|----------|------|----------|
| Bootstrap | 引导/初始化 | AcquireTemplateInformation, FECreateClientLicensorCertificateV1, ServiceDiscoveryForUser |
| Encryption | 加密操作 | FECreatePublishingLicenseV1, FECreatePublishingLicenseAndEndUserLicenseV1 |
| Decryption | 解密操作 | FECreateEndUserLicenseV1, FEGetUserRights, AcquireLicense |
| Prelicense | 预授权 | AcquirePreLicense4User, AcquireDelegationLicense |

## 预定义查询

详细查询模板见: [queries/](./references/queries/)

| 查询 | 用途 |
|------|------|
| [mip-request-analysis.md](./references/queries/mip-request-analysis.md) | MIP 请求日志分析 |
| [rms-auth-tracking.md](./references/queries/rms-auth-tracking.md) | RMS 认证追踪 |
| [dlp-jarvis-urls.md](./references/queries/dlp-jarvis-urls.md) | DLP Jarvis 查询 URL |
| [dlm-elc-operations.md](./references/queries/dlm-elc-operations.md) | DLM 邮件生命周期 (ELC) 操作 |
| [dlm-policy-sync.md](./references/queries/dlm-policy-sync.md) | 统一策略同步状态 |
| [scc-rbac-logs.md](./references/queries/scc-rbac-logs.md) | SCC RBAC 日志 |

## 相关 Wiki 链接

- **AIP Wiki**: https://dev.azure.com/ASIM-Security/Information%20Protection/_wiki/wikis/Azure%20Information%20Protection/1892/Azure-Information-Protection
- **Modern Workspace**: https://dev.azure.com/Supportability/Modern%20Workplace/_wiki/wikis/Modern%20Workplace/81845/Welcome
- **DLP TSG**: https://supportability.visualstudio.com/Modern%20Workplace/_wiki/wikis/Modern%20Workplace/98373/Data-Loss-Prevention
- **DLM/Retention TSG**: https://supportability.visualstudio.com/Modern%20Workplace/_wiki/wikis/Modern%20Workplace/98833/Unified-Retention-and-Labels
- **Compliance Hold TSG**: https://supportability.visualstudio.com/Modern%20Workplace/_wiki/wikis/Modern%20Workplace/102114/Compliance-Holds
- **SCC RBAC TSG**: https://eng.ms/docs/microsoft-security/microsoft-threat-protection-mtp/microsoft-defender-for-office-mdo/mdo-pre-breach/infrastructure-engineering/quarantine/investigate-rbac-issues

## 参考链接

- [Azure Information Protection 故障排查](https://learn.microsoft.com/azure/information-protection/troubleshoot-aip)
- [Microsoft Purview DLP 故障排查](https://learn.microsoft.com/purview/dlp-learn-about-dlp)
- [父 Skill](../SKILL.md)
