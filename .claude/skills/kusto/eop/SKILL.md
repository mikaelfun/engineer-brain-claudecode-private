# EOP (Exchange Online Protection) 邮件问题排查 Skill

## 概述

本 Skill 用于排查 Exchange Online Protection 相关的邮件问题，包括垃圾邮件误报、钓鱼邮件检测、域模拟保护等问题。

## 适用场景

- 邮件被错误标记为垃圾邮件 (Spam)
- 邮件被错误标记为钓鱼邮件 (Phishing)
- 域模拟保护 (Domain Impersonation) 误报
- 用户模拟保护 (User Impersonation) 误报
- 欺骗保护 (Spoofing) 相关问题
- **钓鱼邮件未被检测 (Phishing False Negative)** — 连接器导致的认证绕过
- **入站连接器配置安全评估** — OnPremises vs Partner 连接器类型分析
- **compauth=none (reason=4xx)** — 复合认证被绕过的场景排查

---

## 排查步骤

### 步骤 1: 收集必要信息

需要客户提供以下信息：
1. **邮件头 (Message Header)** - 从 Outlook 导出的完整邮件头
2. **Message Trace 导出** - 从 Exchange Admin Center 或 Security Portal 导出的 CSV 文件
3. **发件人和收件人信息** - 涉及的邮箱地址和域名

### 步骤 2: 分析邮件头

#### 2.1 关键头字段定位

在邮件头中查找以下关键字段：

```
X-Forefront-Antispam-Report
X-Microsoft-Antispam
Authentication-Results
ARC-Authentication-Results
```

#### 2.2 X-Forefront-Antispam-Report 字段解析

| 字段 | 含义 | 常见值 |
|------|------|--------|
| **CAT** | 邮件分类 | DIMP(域模拟), UIMP(用户模拟), SPOOF(欺骗), SPM(垃圾邮件), PHSH(钓鱼), HSPM(高置信度垃圾邮件), BULK(批量邮件), MALW(恶意软件) |
| **SCL** | 垃圾邮件置信度 | -1(白名单), 0-4(非垃圾), 5-6(垃圾), 7-9(高置信度垃圾) |
| **SFV** | 垃圾邮件过滤判定 | SPM(垃圾), SKS(跳过), SKN(非垃圾), SKB(阻止列表), SKQ(隔离释放) |
| **SFTY** | 安全提示类型 | 9.19(域模拟), 9.20(用户模拟), 9.11(组织内欺骗), 9.21(外部域欺骗) |
| **CIP** | 连接 IP | 发送服务器 IP 地址 |
| **CTRY** | 国家代码 | IP 所在国家 |
| **PTR** | 反向 DNS | 发送服务器的 PTR 记录 |

#### 2.3 邮件认证结果分析

检查 `Authentication-Results` 中的认证状态：

| 认证类型 | 通过标志 | 失败标志 |
|----------|----------|----------|
| SPF | pass | fail, softfail, none |
| DKIM | pass | fail, none |
| DMARC | pass | fail, none |
| compauth | pass (reason=2xx) | fail (reason=0xx, 1xx, 6xx) |

**⚠️ 特别注意: compauth=none (reason=4xx) — 认证绕过**

| compauth 结果 | reason 范围 | 含义 | EOP 行为 |
|:---:|:---:|---|---|
| `compauth=pass` | 2xx | 认证通过 | 正常接受 |
| `compauth=fail` | 0xx, 1xx, 6xx | 认证**失败** — 检测为欺骗 | Spoof Intelligence 触发, Honor DMARC 可执行 |
| `compauth=none` | **4xx** | 认证被**绕过** — 因连接器信任未评估 | **不检测欺骗**, Honor DMARC 失效, 邮件投递 |

常见 4xx reason code:

| Reason Code | 含义 | 典型场景 |
|:---:|---|---|
| 400 | 通过允许的域或连接器绕过复合认证 | 通用连接器绕过 |
| 401 | 通过允许的 IP 绕过复合认证 | IP 基绕过 |
| 405 | 通过连接器信任绕过复合认证（网关中继） | 邮件经受信任的本地/第三方网关中继 |
| 451 | 通过连接器域匹配绕过复合认证 | 连接器 SenderDomains 匹配了邮件域 |

> 当 compauth reason 为 4xx 时，邮件被 EOP 视为**受信任**，所有依赖认证的下游保护也被绕过。详见[连接器导致的认证绕过排查](#连接器导致的认证绕过排查-compauthnone-reason4xx)章节。

参考: [Composite authentication result values](https://learn.microsoft.com/en-us/defender-office-365/anti-spam-message-headers-message-headers-fields#authentication-results-message-header-fields)

### 步骤 3: 分析 Message Trace

#### 3.1 定位问题邮件

在 Message Trace CSV 中筛选：
- `status` = "Quarantined" 或 "FilteredAsSpam"
- 查看 `custom_data` 字段

#### 3.2 解析 custom_data

使用脚本解析 custom_data 中的 spam agent 数据：

```powershell
# 脚本位置
.\.copilot\skills\kusto\eop\references\decodingspamagentdata.ps1

# 使用方法
.\decodingspamagentdata.ps1 -messagedata "<custom_data字符串>"
```

#### 3.3 custom_data 关键字段

| 字段 | 含义 |
|------|------|
| T | 检测类型 (Phish, Spam, Malware) |
| PT | 策略类型 (AntiPhishPolicy, HostedContentFilterPolicy) |
| ERN | 触发策略名称 (Base64 编码) |
| EQT | 隔离策略名称 (Base64 编码) |
| QS | 隔离状态 (1=已隔离) |
| SFTY | 安全提示类型 |

### 步骤 4: 分析 SFS/ARA 规则 (可选)

如果邮件头中包含 SFS 规则 ID（格式如 `SFS:(13230022)(4636009)`）或 ARA 规则（在 `X-Microsoft-Antispam` 中）：

#### 4.1 本地 Repo 查询

```powershell
# 本地 IPAntispamRule repo 路径
C:\github\IPAntispamRule\

# 搜索规则定义
Get-ChildItem -Path "C:\github\IPAntispamRule\sources\dev\AnalystRule" -Recurse -Filter "*.xml" | 
    Select-String -Pattern "<规则ID>"
```

#### 4.2 规则分数解读

- `score="0"` - 追踪规则，不影响判定
- `score>0` - 正向匹配，增加垃圾邮件可能性
- `score<0` - 负向匹配，降低垃圾邮件可能性

### 步骤 5: 查询 Geneva 日志 (深入分析)

当需要进一步分析邮件过滤决策的详细信息时，可以查询 Geneva 日志获取更多上下文。

> ⚠️ **注意**: 访问 Geneva Portal 需要使用 **CME 账号**登录。

#### 5.1 从邮件头提取关键信息

从邮件头中获取以下信息用于构建 Geneva 查询：

| 字段 | 邮件头位置 | 用途 |
|------|------------|------|
| **NetworkMessageId** | `X-MS-Office365-Filtering-Correlation-Id` | 用于搜索条件 |
| **时间点** | `Date` 头字段 | 用于设置查询时间范围 |

#### 5.2 Geneva 日志查询链接格式

```
https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=<时间点>&offset=~15&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365PassiveGal&en=AntiMalwareMdsEvent,AntispamRejectActionEvent,QuarantineLogEvent,SpamEngineDiagnosticsLogMdsEvent&conditions=[["AnyField","%3D%3D","<NetworkMessageId>"]]&kqlClientQuery=source%0A|%20sort%20by%20env_time%20asc&aggregates=["Count%20by%20domainStatus","Count%20by%20domainName","Count%20by%20resultType"]&chartEditorVisible=true&chartType=line&chartLayers=[["New%20Layer",""]]
```

> ⚠️ **重要**: 访问 Geneva Portal 需要使用 **CME 账号**登录。生成链接后应直接打开浏览器访问。

#### 5.3 参数说明

| 参数 | 值 | 说明 |
|------|-----|------|
| `time` | `2026-02-02T18:24:00.000Z` | 邮件头中 `Date` 字段的时间，格式为 ISO 8601 UTC |
| `offset` | `~15` | 时间偏移量 |
| `offsetUnit` | `Minutes` | 偏移单位 |
| `ep` | `CA%20Mooncake` | Endpoint，Mooncake 环境 |
| `ns` | `O365PassiveGal` | Namespace |
| `en` | `AntiMalwareMdsEvent,AntispamRejectActionEvent,QuarantineLogEvent,SpamEngineDiagnosticsLogMdsEvent` | 事件名称 |
| `conditions` | `[["AnyField","%3D%3D","<NetworkMessageId>"]]` | 搜索条件，使用 AnyField 匹配 NetworkMessageId（`%3D%3D` 是 `==` 的 URL 编码） |

#### 5.4 常用事件类型

| 事件名称 | 描述 |
|----------|------|
| `AntiMalwareMdsEvent` | 反恶意软件扫描事件，包含附件扫描和 Content Hints Analysis (CHA) |
| `SpamEngineDiagnosticsLogMdsEvent` | 反垃圾邮件引擎诊断事件 |
| `AntispamRejectActionEvent` | 反垃圾邮件拒绝操作事件 |
| `QuarantineLogEvent` | 隔离日志事件 |
| `UrlDetonationEvent` | URL 爆破/沙箱分析事件 |
| `SmtpReceiveLogMdsEvent` | SMTP 接收日志事件，记录入站邮件的 SMTP 会话 |
| `AttributionDiagnosticLogMdsEvent` | 归因诊断日志事件 |
| `AttributionLogMdsEvent` | 归因日志事件 |
| `AttributionMailFlowLogMdsEvent` | 归因邮件流日志事件 |
| `AttributionOpticsLogMdsEvent` | 归因光学日志事件 |
| `IPQuarantineCmdletLog` | 隔离操作 Cmdlet 日志 |
| `QuarantineAsstEvent` | 隔离清理助手事件 |
| `TABLProcessorDiagnosticEvent` | TABL 处理器诊断事件，记录租户级别的允许/阻止列表处理 |


#### 5.5 Geneva 日志关键字段解读

**AntiMalwareMdsEvent 示例**:
```json
{
  "CHA": "True",
  "ContentHints": "{\"ContentSource\":\"Email\",\"NetworkMessageId\":\"<id>\"}"
}
```

| 字段 | 含义 |
|------|------|
| `CHA` | Content Hints Analysis - `True` 表示触发了内容提示分析（通常与钓鱼/恶意内容相关） |
| `ContentSource` | 内容来源 (Email, Attachment 等) |
| `NetworkMessageId` | 邮件网络消息 ID |

#### 5.6 示例查询

假设邮件头信息：
- `X-MS-Office365-Filtering-Correlation-Id`: `b3816425-99bc-4b15-e72e-08de62884354`
- `Date`: `Mon, 2 Feb 2026 18:24:02 +0000`

生成的 Geneva 查询链接：
```
https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=2026-02-02T18:24:00.000Z&offset=~15&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365PassiveGal&en=AntiMalwareMdsEvent,AntispamRejectActionEvent,QuarantineLogEvent,SpamEngineDiagnosticsLogMdsEvent&conditions=[["AnyField","%3D%3D","b3816425-99bc-4b15-e72e-08de62884354"]]&kqlClientQuery=source%0A|%20sort%20by%20env_time%20asc&aggregates=["Count%20by%20domainStatus","Count%20by%20domainName","Count%20by%20resultType"]&chartEditorVisible=true&chartType=line&chartLayers=[["New%20Layer",""]]
```

#### 5.7 PowerShell 脚本打开 Geneva 链接

使用以下 PowerShell 命令直接打开浏览器访问日志（需要 CME 账号登录）：

```powershell
# 设置参数
$networkMessageId = "b3816425-99bc-4b15-e72e-08de62884354"
$time = "2026-02-02T18:24:00.000Z"  # 从邮件头 Date 字段获取

# 构建并打开 Geneva 链接
$url = "https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=$time&offset=~15&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365PassiveGal&en=AntiMalwareMdsEvent,AntispamRejectActionEvent,QuarantineLogEvent,SpamEngineDiagnosticsLogMdsEvent&conditions=[[`"AnyField`",`"%3D%3D`",`"$networkMessageId`"]]&kqlClientQuery=source%0A|%20sort%20by%20env_time%20asc&aggregates=[`"Count%20by%20domainStatus`",`"Count%20by%20domainName`",`"Count%20by%20resultType`"]&chartEditorVisible=true&chartType=line&chartLayers=[[`"New%20Layer`",`"`"]]"
Start-Process $url
```

#### 5.8 SMTP Session 日志查询

当需要分析入站邮件在 EOP 前端的 SMTP 会话详情时，查询 SMTP 接收日志和归因日志。

**所需参数：**
- **CorrelationId/NetworkMessageId** (必需): 从邮件头 `X-MS-Office365-Filtering-Correlation-Id` 或 Message Trace 获取
- **SessionId** (必需): 用于获取完整 SMTP 会话和归因流日志

**Geneva 查询链接格式：**

1. **SMTP 日志 (按 NetworkMessageId)**:
```
https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=<时间点>&offset=<时间范围分钟>&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365EopGal&en=SmtpReceiveLogMdsEvent&conditions=[["Data","contains","<NetworkMessageId>"]]&kqlClientQuery=source%0A|%20project%20Timestamp,%20SeqNumber,%20Event,%20LatencyMs,%20Data,%20RemoteIP%20,env_cloud_name,%20SessionId%0A|%20sort%20by%20Timestamp%20asc&chartEditorVisible=true&chartType=line&chartLayers=[["New%20Layer",""]]
```

2. **SMTP 完整会话日志 (按 SessionId)**:
```
https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=<时间点>&offset=<时间范围分钟>&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365EopGal&en=SmtpReceiveLogMdsEvent&conditions=[["SessionId","%3D%3D","<SessionId>"]]&kqlClientQuery=source%0A|%20project%20Timestamp,%20SeqNumber,%20Event,%20LatencyMs,%20Data,%20RemoteIP%20,env_cloud_name,%20SessionId%0A|%20sort%20by%20Timestamp%20asc&chartEditorVisible=true&chartType=line&chartLayers=[["New%20Layer",""]]
```

3. **归因日志 (按 SessionId)**:
```
https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=<时间点>&offset=<时间范围分钟>&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365EopGal&en=AttributionDiagnosticLogMdsEvent,AttributionLogMdsEvent,AttributionMailFlowLogMdsEvent,AttributionOpticsLogMdsEvent&conditions=[["SessionId","%3D%3D","<SessionId>"]]&kqlClientQuery=source%0A|%20sort%20by%20Timestamp%20asc&chartEditorVisible=true&chartType=line&chartLayers=[["New%20Layer",""]]
```

**PowerShell 脚本生成 SMTP 日志链接：**

```powershell
$networkMessageId = "<NetworkMessageId>"
$sessionId = "<SessionId>"
$time = "<ISO8601时间>"  # 从邮件头 Date 字段获取
$offsetMinutes = 15

# SMTP 日志 (按 NMI)
$smtpLogUrl = "https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=$time&offset=$offsetMinutes&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365EopGal&en=SmtpReceiveLogMdsEvent&conditions=[[`"Data`",`"contains`",`"$networkMessageId`"]]&kqlClientQuery=source%0A|%20project%20Timestamp,%20SeqNumber,%20Event,%20LatencyMs,%20Data,%20RemoteIP%20,env_cloud_name,%20SessionId%0A|%20sort%20by%20Timestamp%20asc&chartEditorVisible=true&chartType=line&chartLayers=[[`"New%20Layer`",`"`"]]"

# SMTP 完整会话日志 (按 SessionId)
$smtpSessionUrl = "https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=$time&offset=$offsetMinutes&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365EopGal&en=SmtpReceiveLogMdsEvent&conditions=[[`"SessionId`",`"%3D%3D`",`"$sessionId`"]]&kqlClientQuery=source%0A|%20project%20Timestamp,%20SeqNumber,%20Event,%20LatencyMs,%20Data,%20RemoteIP%20,env_cloud_name,%20SessionId%0A|%20sort%20by%20Timestamp%20asc&chartEditorVisible=true&chartType=line&chartLayers=[[`"New%20Layer`",`"`"]]"

# 归因日志 (按 SessionId)
$attributionUrl = "https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=$time&offset=$offsetMinutes&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365EopGal&en=AttributionDiagnosticLogMdsEvent,AttributionLogMdsEvent,AttributionMailFlowLogMdsEvent,AttributionOpticsLogMdsEvent&conditions=[[`"SessionId`",`"%3D%3D`",`"$sessionId`"]]&kqlClientQuery=source%0A|%20sort%20by%20Timestamp%20asc&chartEditorVisible=true&chartType=line&chartLayers=[[`"New%20Layer`",`"`"]]"

Write-Host "SMTP Log (by NMI): $smtpLogUrl"
Write-Host "SMTP Session Log: $smtpSessionUrl"
Write-Host "Attribution Log: $attributionUrl"
```

**SMTP 日志关键字段：**

| 字段 | 含义 |
|------|------|
| `Timestamp` | 事件时间 |
| `SeqNumber` | 序列号，用于排序同一时间的事件 |
| `Event` | SMTP 事件类型 (如 `+`, `-`, `>`, `<`, `*`) |
| `LatencyMs` | 延迟 (毫秒) |
| `Data` | SMTP 命令和响应数据 |
| `RemoteIP` | 远程 IP 地址 |
| `SessionId` | SMTP 会话 ID |

**相关参考：**
- [Internal SMTP Log definition](https://eng.ms/docs/experiences-devices/m365-core-ic3/m365-messaging/substrate-transport/o365-transport-pipeline/transport-and-substratebus-tsg/howto/smtpprotocollogs)
- [SMTP return code reference](https://en.wikipedia.org/wiki/List_of_SMTP_server_return_codes)

#### 5.9 Anti-Malware/Anti-Phishing 日志查询

当需要分析反恶意软件和反钓鱼扫描结果时，查询 AntiMalwareMdsEvent。

**所需参数：**
- **CorrelationId** (必需): 从邮件头 `X-MS-Office365-Filtering-Correlation-Id` 或 Message Trace 获取

**Geneva 查询链接格式：**

```
https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=<时间点>&offset=<时间范围分钟>&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365PassiveGal&en=AntiMalwareMdsEvent&conditions=[["CorrelationId","%3D%3D","<CorrelationId>"]]&kqlClientQuery=source%0A|%20project%20env_time,%20Component,%20Message,AdditionalData,%20CorrelationId,%20activityId%0A|%20sort%20by%20env_time%20asc&aggregates=["Count%20by%20domainStatus","Count%20by%20domainName","Count%20by%20resultType"]&chartEditorVisible=true&chartType=line&chartLayers=[["New%20Layer",""]]
```

**PowerShell 脚本：**

```powershell
$correlationId = "<CorrelationId>"
$time = "<ISO8601时间>"
$offsetMinutes = 15

$antiMalwareUrl = "https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=$time&offset=$offsetMinutes&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365PassiveGal&en=AntiMalwareMdsEvent&conditions=[[`"CorrelationId`",`"%3D%3D`",`"$correlationId`"]]&kqlClientQuery=source%0A|%20project%20env_time,%20Component,%20Message,AdditionalData,%20CorrelationId,%20activityId%0A|%20sort%20by%20env_time%20asc&aggregates=[`"Count%20by%20domainStatus`",`"Count%20by%20domainName`",`"Count%20by%20resultType`"]&chartEditorVisible=true&chartType=line&chartLayers=[[`"New%20Layer`",`"`"]]"
Start-Process $antiMalwareUrl
```

**Anti-Malware 日志关键字段：**

| 字段 | 含义 |
|------|------|
| `env_time` | 事件时间 |
| `Component` | 扫描组件 |
| `Message` | 扫描结果消息 |
| `AdditionalData` | 附加数据 (包含 CHA 信息等) |
| `CorrelationId` | 关联 ID |
| `activityId` | 活动 ID |

#### 5.10 隔离操作日志查询 (Quarantine Actions)

当需要分析邮件隔离操作（如释放、删除等管理操作）时，查询隔离操作日志。

**所需参数：**
- **CorrelationId** (必需): 从邮件头或 Message Trace 获取
- **TenantId** (必需): 用于查询隔离清理日志

**Geneva 查询链接格式：**

1. **隔离操作日志 (IPQuarantineCmdletLog)**:
```
https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=<时间点>&offset=<时间范围分钟>&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365PassiveGal&en=IPQuarantineCmdletLog&conditions=[["CorrelationId","%3D%3D","<CorrelationId>"]]&kqlClientQuery=source%0D%0A|%20project%20Timestamp,%20Message,%20Action,%20MessageId,%20Status,%20CustomData%0D%0A|%20sort%20by%20Timestamp%20asc&aggregates=["Count%20by%20domainStatus","Count%20by%20domainName","Count%20by%20resultType"]&chartEditorVisible=true&chartType=line&chartLayers=[["New%20Layer",""]]
```

2. **隔离清理日志 (QuarantineAsstEvent)**:
```
https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=<时间点>&offset=<时间范围分钟>&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365PassiveGal&en=QuarantineAsstEvent&conditions=[["tenantId","%3D%3D","<TenantId>"]]&kqlClientQuery=source%0D%0A|%20project%20env_time,%20message,%20MailboxGuid%0D%0A|%20order%20by%20env_time&aggregates=["Count%20by%20domainStatus","Count%20by%20domainName","Count%20by%20resultType"]&chartEditorVisible=true&chartType=line&chartLayers=[["New%20Layer",""]]
```

**PowerShell 脚本：**

```powershell
$correlationId = "<CorrelationId>"
$tenantId = "<TenantId>"
$time = "<ISO8601时间>"
$offsetMinutes = 15

# 隔离操作日志
$quarantineActionUrl = "https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=$time&offset=$offsetMinutes&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365PassiveGal&en=IPQuarantineCmdletLog&conditions=[[`"CorrelationId`",`"%3D%3D`",`"$correlationId`"]]&kqlClientQuery=source%0D%0A|%20project%20Timestamp,%20Message,%20Action,%20MessageId,%20Status,%20CustomData%0D%0A|%20sort%20by%20Timestamp%20asc&aggregates=[`"Count%20by%20domainStatus`",`"Count%20by%20domainName`",`"Count%20by%20resultType`"]&chartEditorVisible=true&chartType=line&chartLayers=[[`"New%20Layer`",`"`"]]"

# 隔离清理日志
$quarantineCleanupUrl = "https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=$time&offset=$offsetMinutes&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365PassiveGal&en=QuarantineAsstEvent&conditions=[[`"tenantId`",`"%3D%3D`",`"$tenantId`"]]&kqlClientQuery=source%0D%0A|%20project%20env_time,%20message,%20MailboxGuid%0D%0A|%20order%20by%20env_time&aggregates=[`"Count%20by%20domainStatus`",`"Count%20by%20domainName`",`"Count%20by%20resultType`"]&chartEditorVisible=true&chartType=line&chartLayers=[[`"New%20Layer`",`"`"]]"

Write-Host "Quarantine Action Log: $quarantineActionUrl"
Write-Host "Quarantine Cleanup Log: $quarantineCleanupUrl"
```

**隔离操作日志关键字段：**

| 字段 | 含义 |
|------|------|
| `Timestamp` | 操作时间 |
| `Message` | 操作消息 |
| `Action` | 操作类型 (Release, Delete, Preview 等) |
| `MessageId` | 邮件 ID |
| `Status` | 操作状态 |
| `CustomData` | 自定义数据 |

#### 5.11 隔离日志查询 (Quarantine Log)

当需要分析邮件被隔离的详细过程时，查询 QuarantineLogEvent。

**所需参数：**
- **CorrelationId/NetworkMessageId** (必需): 从邮件头或 Message Trace 获取

**Geneva 查询链接格式：**

```
https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=<时间点>&offset=<时间范围分钟>&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365PassiveGal&en=QuarantineLogEvent&conditions=[["MessageNetworkId","%3D%3D","<NetworkMessageId>"]]&kqlClientQuery=source%0D%0A|%20project%20env_time,%20Message,%20Action,%20ProcessName,%20Component,%20MessageNetworkId%0D%0A|%20sort%20by%20env_time%20asc&aggregates=["Count%20by%20domainStatus","Count%20by%20domainName","Count%20by%20resultType"]&chartEditorVisible=true&chartType=line&chartLayers=[["New%20Layer",""]]
```

**PowerShell 脚本：**

```powershell
$networkMessageId = "<NetworkMessageId>"
$time = "<ISO8601时间>"
$offsetMinutes = 15

$quarantineLogUrl = "https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=$time&offset=$offsetMinutes&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365PassiveGal&en=QuarantineLogEvent&conditions=[[`"MessageNetworkId`",`"%3D%3D`",`"$networkMessageId`"]]&kqlClientQuery=source%0D%0A|%20project%20env_time,%20Message,%20Action,%20ProcessName,%20Component,%20MessageNetworkId%0D%0A|%20sort%20by%20env_time%20asc&aggregates=[`"Count%20by%20domainStatus`",`"Count%20by%20domainName`",`"Count%20by%20resultType`"]&chartEditorVisible=true&chartType=line&chartLayers=[[`"New%20Layer`",`"`"]]"
Start-Process $quarantineLogUrl
```

**隔离日志关键字段：**

| 字段 | 含义 |
|------|------|
| `env_time` | 事件时间 |
| `Message` | 隔离消息详情 |
| `Action` | 隔离操作 |
| `ProcessName` | 处理进程名称 |
| `Component` | 组件名称 |
| `MessageNetworkId` | 邮件网络 ID (即 NetworkMessageId) |

#### 5.12 TABL 处理器日志查询

当需要分析租户允许/阻止列表 (Tenant Allow/Block List) 的处理状态时，查询 TABL 处理器诊断事件。

**所需参数：**
- **TenantId** (必需): 客户租户 ID

**Geneva 查询链接格式：**

```
https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=<时间点>&offset=<时间范围分钟>&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365PassiveGal&en=TABLProcessorDiagnosticEvent&conditions=[["tenantId","%3D%3D","<TenantId>"]]&kqlClientQuery=source%0D%0A|%20project%20env_time,%20message,%20activityId,%20scenario%0D%0A|%20order%20by%20env_time&aggregates=["Count%20by%20domainStatus","Count%20by%20domainName","Count%20by%20resultType"]&chartEditorVisible=true&chartType=line&chartLayers=[["New%20Layer",""]]
```

**PowerShell 脚本：**

```powershell
$tenantId = "<TenantId>"
$time = "<ISO8601时间>"
$offsetMinutes = 15

$tablLogUrl = "https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=$time&offset=$offsetMinutes&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365PassiveGal&en=TABLProcessorDiagnosticEvent&conditions=[[`"tenantId`",`"%3D%3D`",`"$tenantId`"]]&kqlClientQuery=source%0D%0A|%20project%20env_time,%20message,%20activityId,%20scenario%0D%0A|%20order%20by%20env_time&aggregates=[`"Count%20by%20domainStatus`",`"Count%20by%20domainName`",`"Count%20by%20resultType`"]&chartEditorVisible=true&chartType=line&chartLayers=[[`"New%20Layer`",`"`"]]"
Start-Process $tablLogUrl
```

**TABL 处理器日志关键字段：**

| 字段 | 含义 |
|------|------|
| `env_time` | 事件时间 |
| `message` | 处理消息 (包含 TABL 条目处理结果) |
| `activityId` | 活动 ID |
| `scenario` | 场景名称 (如 Submission, AdminSubmission 等) |

**TABL 相关 PowerShell 诊断命令：**

```powershell
# 获取租户允许/阻止列表条目
Get-TenantAllowBlockListItems -ListType Sender
Get-TenantAllowBlockListItems -ListType Url
Get-TenantAllowBlockListItems -ListType FileHash

# 获取租户允许/阻止列表欺骗条目
Get-TenantAllowBlockListSpoofItems

# 创建允许条目
New-TenantAllowBlockListItems -ListType Sender -Entries "sender@example.com" -Allow -NoExpiration

# 创建阻止条目
New-TenantAllowBlockListItems -ListType Sender -Entries "sender@malicious.com" -Block -NoExpiration
```

---

## 邮件延迟分析

当邮件投递出现延迟时，可以通过分析 Message Header 和 Message Trace 来定位延迟原因。

### 步骤 1: 从 Message Header 提取时间戳

邮件头中的 `Received:` 字段记录了邮件经过每个服务器的时间。从下往上阅读可以追踪邮件路由路径：

```
Received: from ServerA (IP) by ServerB with SMTP; <时间戳>
```

### 步骤 2: 计算各跳延迟

提取每个 `Received:` 头的时间戳，计算相邻跳之间的时间差：

```powershell
# 示例：解析邮件跳转延迟
$hops = @(
    @{Server="发件人服务器"; UTC=[DateTime]::Parse("2026-02-02 04:59:19")},
    @{Server="FireEye ETP"; UTC=[DateTime]::Parse("2026-02-02 04:59:29")},
    @{Server="EOP Edge"; UTC=[DateTime]::Parse("2026-02-02 05:04:22")},
    @{Server="Frontend"; UTC=[DateTime]::Parse("2026-02-02 05:10:27")},
    @{Server="Mailbox"; UTC=[DateTime]::Parse("2026-02-02 05:10:39")}
)

for($i=1; $i -lt $hops.Count; $i++) {
    $delay = ($hops[$i].UTC - $hops[$i-1].UTC).TotalSeconds
    Write-Host "$($hops[$i-1].Server) → $($hops[$i].Server): $delay 秒"
}
```

### 步骤 3: 分析 Message Trace 中的延迟数据

Message Trace 的 `custom_data` 字段包含详细的延迟分析信息 (HAA - Header Analysis Agent)：

#### 3.1 HAA 延迟汇总字段

| 字段 | 含义 |
|------|------|
| `HAA=SUM\|ExternalDelay=xxx` | 外部网络延迟 (毫秒) |
| `HAA=SUM\|EopDelay=xxx` | EOP 边缘接收延迟 (毫秒) |
| `HAA=SUM\|InternalDelay=xxx` | EOP 内部处理延迟 (毫秒) |

#### 3.2 HAA 详细延迟字段

| 字段 | 含义 |
|------|------|
| `HAA=ExternalDetail\|ServerA->ServerB=xxx` | 外部服务器间延迟详情 |
| `HAA=InternalDetail\|ServerA->ServerB=xxx` | EOP 内部服务器间延迟详情 |

#### 3.3 示例解析

```
S:HAA=SUM|ExternalDelay=303|EopDelay=278|InternalDelay=365
S:HAA=ExternalDetail|mail12.averis.biz#>BJSCHN02FT006.mail.protection.partner.outlook.cn=278
S:HAA=InternalDetail|BJSCHN02FT006->NT0PR01CA0017=365|NT0PR01CA0017->ZQ0PR01MB1095=0
```

解读：
- 外部延迟 303ms，主要在 mail12.averis.biz → EOP Edge (278ms)
- 内部延迟 365ms，主要在 EOP Edge → Frontend (365ms)

### 步骤 4: 分析 EOP 内部处理组件延迟

custom_data 中包含各安全组件的处理信息：

#### 4.1 传输规则 (ETR - Exchange Transport Rules)

| 字段 | 含义 |
|------|------|
| `TRA=ETRP\|ruleId=xxx` | 触发的传输规则 ID |
| `ExecW=xxx` | 执行等待时间 |
| `ExecC=xxx` | 执行成本 |
| `CompCost=C\|ETR=xxx` | ETR 总计算成本 |

#### 4.2 敏感度标签扫描 (DPA - Data Protection Agent)

| 字段 | 含义 |
|------|------|
| `DPA=SL\|labelId=xxx` | 扫描的敏感度标签 ID |

#### 4.3 反垃圾邮件扫描 (CFA - Content Filter Agent)

| 字段 | 含义 |
|------|------|
| `CFA=AS\|alat=xxx` | Agent 延迟 (毫秒) |
| `CFA=AS\|mlat=xxx` | 机器学习延迟 (毫秒) |
| `CFA=AS\|rlat=xxx` | 规则延迟 (毫秒) |

#### 4.4 安全筛选代理 (SFA)

| 字段 | 含义 |
|------|------|
| `SFA=SUM\|LAT=xxx` | 安全筛选延迟 (毫秒) |

#### 4.5 日志规则 (JA - Journal Agent)

| 字段 | 含义 |
|------|------|
| `JA=ORIG\|type=tenant` | 租户级日志规则 |
| `JA=ORIG\|ruleid=xxx` | 日志规则 ID |
| `JA=ORIG\|dest=xxx` | 日志目标邮箱 |

### 常见延迟原因及解决方案

| 延迟位置 | 可能原因 | 解决建议 |
|----------|----------|----------|
| **外部网关 → EOP Edge** | 发件方服务器队列积压、网络延迟、DNS 解析慢 | 检查发件方服务器状态，验证 MX/SPF 记录 |
| **EOP Edge → Frontend** | 队列等待、服务负载高、安全扫描 | 检查是否有大量邮件同时发送，查看服务健康状态 |
| **传输规则 (ETR)** | 复杂规则、大量规则、正则表达式匹配 | 优化传输规则，减少不必要的规则 |
| **DLP/敏感度标签** | 大量标签需要扫描、附件内容扫描 | 优化 DLP 策略范围 |
| **反垃圾邮件扫描** | 大附件、复杂内容、ML 分析 | 通常无法优化，属于正常处理 |
| **日志规则** | 日志副本生成和投递 | 评估是否需要所有邮件日志 |

### 延迟分析 PowerShell 脚本

```powershell
# 从 Message Trace CSV 提取延迟信息
function Get-EmailDelayAnalysis {
    param(
        [string]$CsvPath
    )
    
    $trace = Import-Csv $CsvPath
    
    foreach($row in $trace) {
        $customData = $row.custom_data
        
        # 提取 HAA 延迟汇总
        if($customData -match 'HAA=SUM\|ExternalDelay=(\d+)\|EopDelay=(\d+)\|InternalDelay=(\d+)') {
            Write-Host "=== 延迟汇总 ===" -ForegroundColor Cyan
            Write-Host "External Delay: $($Matches[1]) ms"
            Write-Host "EOP Delay: $($Matches[2]) ms"
            Write-Host "Internal Delay: $($Matches[3]) ms"
        }
        
        # 提取外部延迟详情
        if($customData -match 'HAA=ExternalDetail\|([^;]+)') {
            Write-Host "`n=== 外部延迟详情 ===" -ForegroundColor Yellow
            $Matches[1] -split '\|' | ForEach-Object { Write-Host "  $_" }
        }
        
        # 提取内部延迟详情
        if($customData -match 'HAA=InternalDetail\|([^;]+)') {
            Write-Host "`n=== 内部延迟详情 ===" -ForegroundColor Yellow
            $Matches[1] -split '\|' | ForEach-Object { Write-Host "  $_" }
        }
        
        # 提取 CFA 延迟
        if($customData -match 'CFA=AS\|.*?alat=(\d+)\|mlat=(\d+)\|rlat=(\d+)') {
            Write-Host "`n=== 反垃圾邮件延迟 ===" -ForegroundColor Green
            Write-Host "  Agent Latency: $($Matches[1]) ms"
            Write-Host "  ML Latency: $($Matches[2]) ms"
            Write-Host "  Rule Latency: $($Matches[3]) ms"
        }
    }
}

# 使用示例
# Get-EmailDelayAnalysis -CsvPath "C:\case\EOP\sample\MTDetail.csv"
```

---

## 连接器导致的认证绕过排查 (compauth=none reason=4xx)

当钓鱼邮件因入站连接器配置问题绕过 EOP 所有复合认证检查（SPF, DKIM, DMARC, CompAuth）时，使用本章节进行排查。

### 症状识别

- 钓鱼/欺骗邮件投递到收件箱 (dest:I)，尽管 SPF/DKIM/DMARC 失败
- `compauth=none` + reason code 在 **4xx 范围**
- SCL:1, CAT:NONE, SFV:NSPM
- DMARC 策略（quarantine/reject）未执行
- `dmarc=fail action=quarantine` 但邮件仍投递

示例邮件头:
```
Authentication-Results: spf=softfail (sender IP is 185.161.208.71)
 smtp.mailfrom=contoso.com; dkim=none (message not signed)
 header.d=none; dmarc=fail action=quarantine
 header.from=contoso.com; compauth=none reason=451
```

### 两种常见攻击场景

#### 场景 1: 绕过 MX 直连 EOP (compauth=none reason=451)

**条件**: MX 指向第三方网关，但 EOP endpoint 公开可访问

攻击者直接连接 EOP 端点（`*.mail.protection.outlook.com` 或 `*.mail.protection.partner.outlook.cn`），绕过 MX/第三方网关。如果入站连接器有宽松的 SenderDomains 匹配（如 `smtp:*;1`），连接被信任。

**邮件头特征** — Received 链中只有 EOP 服务器，没有第三方网关:
```
Received: from AM3GCC02FT010.eop-chn02.gallatin.protection.partner.outlook.cn
  (2406:e003:3a5a::2) by ...
Received: from AM3GCC02FT010.eop-chn02.gallatin.protection.partner.outlook.cn
  (10.152.252.5) by ... via Frontend Transport
```

#### 场景 2: 经网关中继但未启用增强筛选 (compauth=none reason=405)

邮件正确经过第三方网关，但未启用 Enhanced Filtering for Connectors，EOP 看到的是网关 IP 而非原始发件方 IP。

**邮件头特征** — Received 链中有第三方网关:
```
Received: from mail2.contoso.com (222.68.248.5) by
  AM3GCC02FT003.eop-chn02.gallatin.protection.partner.outlook.cn
  via Frontend Transport
Received: from unknown (HELO mailgate.externaldomain.com) (1.2.3.4)
  by mail2.contoso.com with SMTP
```

### 连接器安全配置分析

#### OnPremises vs Partner 连接器类型

| 功能 | OnPremises 连接器 | Partner 连接器 |
|---|:---:|:---:|
| **设计用途** | 混合部署 (Exchange on-prem ↔ EXO) | 第三方网关/合作伙伴组织 |
| **RestrictDomainsToIPAddresses** | ❌ **不生效** | ✅ 生效 |
| **RestrictDomainsToCertificate** | ❌ **不生效** | ✅ 生效 |
| **服务器识别** | TLS 证书 (`TlsSenderCertificateName`) | IP 地址和/或 TLS 证书 |
| **可锁定 EOP** | ❌ 不可以 | ✅ 可以 |
| **SenderIPAddresses 用途** | 用于 EF 的 IP 跳过，不用于限制 | 限制哪些服务器可使用此连接器 |

> ⚠️ **关键**: 使用第三方邮件网关（非 Exchange on-prem）时应使用 **Partner** 连接器，而非 OnPremises。OnPremises 连接器无法实现 IP 锁定，增大攻击面。

参考: [FAQ - Don't use OnPremises type for third-party services](https://learn.microsoft.com/en-us/exchange/mail-flow-best-practices/manage-mail-flow-using-third-party-cloud#faq)

#### 危险配置模式

```powershell
# 检查所有入站连接器的安全配置
Get-InboundConnector | Format-List Name, Enabled, ConnectorType, SenderDomains, 
    SenderIPAddresses, RestrictDomainsToIPAddresses, RestrictDomainsToCertificate,
    TlsSenderCertificateName, EFSkipLastIP, EFSkipIPs, EFUsers
```

| 配置 | 风险 | 说明 |
|---|---|---|
| `SenderDomains = smtp:*;1` | 🔴 高危 | 信任所有发件人域 |
| `SenderIPAddresses = {}` | 🔴 高危 | 无 IP 限制，任何服务器都可使用此连接器 |
| `RestrictDomainsToIPAddresses = False` + `RestrictDomainsToCertificate = False` | 🔴 高危 | 域匹配无额外验证 |
| `EFSkipLastIP = False` + `EFUsers` 有部分用户 | ⚠️ 中危 | EF 未实际启用，EFUsers 设置无效 |

### Honor DMARC 与 compauth=none 的关系

**官方文档明确指出**: *"如果 Microsoft 365 域的 MX 记录指向位于 Microsoft 365 前面的非 Microsoft 服务或设备，则仅当为接收入站消息的连接器启用了 Enhanced Filtering for Connectors 时，Honor DMARC 策略设置才会应用。"*

参考: [Spoof protection and sender DMARC policies](https://learn.microsoft.com/en-us/defender-office-365/anti-phishing-policies-about#spoof-protection-and-sender-dmarc-policies)

逻辑链:
```
compauth=none (4xx)
  → 邮件未被 Spoof Intelligence 检测为欺骗
    → Honor DMARC 前置条件不满足（需先检测为欺骗）
      → DMARC action (quarantine/reject) 未执行
        → 邮件投递到收件箱
```

| Spoof Intelligence 结果 | Honor DMARC | DMARC 结果 | DMARC 策略 | 最终操作 |
|:---:|:---:|:---:|:---:|:---:|
| 检测为欺骗 (`compauth=fail`) | 启用 | dmarc=fail | p=quarantine | **隔离** ✅ |
| 检测为欺骗 (`compauth=fail`) | 启用 | dmarc=fail | p=reject | **拒绝** ✅ |
| **未检测** (`compauth=none`) | 启用 | dmarc=fail | p=quarantine | **投递** ❌ |
| **未检测** (`compauth=none`) | 启用 | dmarc=fail | p=reject | **投递** ❌ |

### EFUsers 配置限制

| 配置 | 行为 |
|---|---|
| `EFUsers = $null` | Enhanced Filtering 对**所有**收件人生效（推荐） |
| `EFUsers = {user1, user2, ...}` | EF 仅对列出的收件人生效 |
| 多收件人邮件中**任一**收件人不在 EFUsers 中 | EF 对**整封邮件的所有收件人**回退到普通筛选 |

> ⚠️ 如果多收件人邮件中有一个收件人不在 EFUsers 列表中，Enhanced Filtering 对整封邮件（包括在列表中的收件人）都不生效。

### 修复方案

#### 步骤 1: 创建 Partner 连接器锁定 EOP (P0)

```powershell
# 创建 Partner 连接器，仅接受来自网关 IP 的邮件
New-InboundConnector -Name "Lockdown - Accept from Gateway Only" `
    -ConnectorType Partner `
    -SenderDomains "smtp:*;1" `
    -SenderIPAddresses <网关公网IP> `
    -RestrictDomainsToIPAddresses $true `
    -RequireTls $true `
    -Enabled $true

# 效果: 阻止绕过 MX 直连 EOP 的攻击 (场景 1)
# 不影响: 经网关中继的邮件仍需启用 EF (场景 2)
```

#### 步骤 2: 启用 Enhanced Filtering (P0)

```powershell
# 在现有连接器上启用 Enhanced Filtering
Set-InboundConnector -Identity "<连接器名称>" `
    -EFSkipLastIP $true `
    -EFUsers $null

# 效果: 恢复经网关中继邮件的 SPF/DKIM/DMARC/CompAuth 评估
# 同时: 使 Honor DMARC 生效
```

#### 步骤 3: 可选 — Mail Flow Rule DMARC 临时方案

```powershell
# 隔离 DMARC p=quarantine 失败的邮件
New-TransportRule -Name "DMARC Quarantine Enforcement" `
    -HeaderContainsMessageHeader "Authentication-Results" `
    -HeaderContainsWords "dmarc=fail action=quarantine" `
    -SetSCL 9 `
    -SetHeaderName "X-DMARC-Enforcement" `
    -SetHeaderValue "Quarantined-by-TransportRule"

# 拒绝 DMARC p=reject 失败的邮件
New-TransportRule -Name "DMARC Reject Enforcement" `
    -HeaderContainsMessageHeader "Authentication-Results" `
    -HeaderContainsWords "dmarc=fail action=oreject" `
    -RejectMessageReasonText "This message failed DMARC authentication." `
    -RejectMessageEnhancedStatusCode "5.7.1"
```

> **注意**: 
> - EOP 头中 p=reject 显示为 `action=oreject`（不是 `action=reject`）
> - 仅对 DMARC p=quarantine/reject 的发件域有效，p=none 不覆盖
> - 存在误报风险（转发/第三方代发邮件）
> - 这是**临时方案**，不能替代正确的连接器配置

### 排查 Checklist

1. **检查 Authentication-Results**
   - [ ] compauth=none 且 reason 在 4xx 范围? → 连接器绕过
   - [ ] dmarc= 结果和 action= 是什么? 记录发件方 DMARC 策略

2. **分析邮件路由 (Received 头)**
   - [ ] 邮件是否经过预期的第三方网关?
   - [ ] 还是直接连接 EOP 绕过了 MX?
   - [ ] 连接 IP 是客户网关还是未知外部 IP?

3. **检查连接器配置**
   - [ ] ConnectorType: OnPremises 还是 Partner?
   - [ ] SenderDomains: `smtp:*;1` (全匹配) 还是特定域?
   - [ ] SenderIPAddresses: 空 `{}` 还是有网关 IP?
   - [ ] RestrictDomainsToIPAddresses: True? (仅 Partner 有效)
   - [ ] EFSkipLastIP: True? (EF 是否启用)
   - [ ] EFUsers: $null (全部用户) 还是部分列表?

4. **验证 MX 记录**
   ```powershell
   Resolve-DnsName -Name contoso.com -Type MX
   ```
   - [ ] MX → EOP 还是 → 第三方网关?

5. **确定修复路径**

   | MX 指向 | 连接器类型 | 推荐操作 |
   |---|---|---|
   | 第三方网关 | OnPremises | 创建新 Partner 连接器锁定 EOP + 启用 EF |
   | 第三方网关 | Partner (无 IP 限制) | 添加网关 IP, 设置 RestrictDomainsToIPAddresses=$true + 启用 EF |
   | EOP 直连 | 任意 | 审查 SenderDomains 范围，确保 IP/证书限制 |

---

## 常见问题及解决方案

### 问题 1: 域模拟保护误报 (CAT:DIMP)

**症状**: 
- 邮件头显示 `CAT:DIMP`
- SFTY 值为 `9.19`
- 所有邮件认证都通过

**原因**: 
Anti-Phishing 策略检测到发件人域与受保护域相似

**解决方案**:

```powershell
# 方案 1: 添加受信任域
Set-AntiPhishPolicy -Identity "<策略名称>" -ExcludedDomains @{Add="<发件人域>"}

# 方案 2: 查看当前策略配置
Get-AntiPhishPolicy | FL Name,TargetedDomainsToProtect,ExcludedDomains,ExcludedSenders
```

或通过 Defender Portal:
1. 访问 https://security.microsoft.com/antiphishing
2. 编辑触发的策略
3. 在 **Trusted senders and domains** 中添加发件人域

### 问题 2: 用户模拟保护误报 (CAT:UIMP)

**症状**:
- 邮件头显示 `CAT:UIMP`
- SFTY 值为 `9.20`

**解决方案**:

```powershell
# 添加受信任发件人
Set-AntiPhishPolicy -Identity "<策略名称>" -ExcludedSenders @{Add="<发件人邮箱>"}
```

### 问题 3: 欺骗保护误报 (CAT:SPOOF)

**症状**:
- 邮件头显示 `CAT:SPOOF`
- compauth 结果为 fail

**解决方案**:

```powershell
# 查看 Spoof Intelligence 设置
Get-SpoofIntelligenceInsight

# 允许特定发件人欺骗
New-TenantAllowBlockListSpoofItems -SpoofedUser "<被欺骗用户>" -SendingInfrastructure "<发送基础设施>" -SpoofType External -Action Allow
```

### 问题 4: 垃圾邮件误报 (CAT:SPM/HSPM)

**解决方案**:

```powershell
# 方案 1: 创建邮件流规则设置 SCL
New-TransportRule -Name "Allow from <域>" -SenderDomainIs "<发件人域>" -SetSCL -1

# 方案 2: 添加到允许列表
Set-HostedContentFilterPolicy -Identity "<策略名称>" -AllowedSenderDomains @{Add="<发件人域>"}
```

### 问题 5: 钓鱼邮件未检测 — 连接器认证绕过 (compauth=none reason=4xx)

**症状**:
- 钓鱼/欺骗邮件投递到收件箱，SCL:1, CAT:NONE
- `compauth=none` + reason code 在 4xx 范围（如 400, 401, 405, 451）
- `dmarc=fail` 但 DMARC 策略未执行
- X-Forefront-Antispam-Report 中无钓鱼/欺骗分类

**原因**:
入站连接器配置不当，导致 EOP 对匹配连接器的邮件建立信任关系，绕过所有复合认证检查。常见于:
- 第三方网关场景使用了 OnPremises 类型连接器（应使用 Partner）
- SenderDomains 使用通配符匹配所有域 (`smtp:*;1`)
- SenderIPAddresses 为空，无 IP 限制
- Enhanced Filtering 未启用 (`EFSkipLastIP=False`)

**排查与解决**: 

详见[连接器导致的认证绕过排查](#连接器导致的认证绕过排查-compauthnone-reason4xx)章节。

关键修复步骤:
1. 创建 Partner 连接器锁定 EOP 仅接受来自网关 IP 的连接
2. 在现有连接器上启用 Enhanced Filtering (`EFSkipLastIP=$true`, `EFUsers=$null`)
3. 临时方案: 创建 Transport Rule 匹配 `dmarc=fail action=quarantine/oreject`

---

## 邮件保护优先级

| 优先级 | 保护类型 | 类别标记 | 配置位置 |
|--------|----------|----------|----------|
| 1 | 恶意软件 | CAT:MALW | Anti-Malware 策略 |
| 2 | 高置信度钓鱼 | CAT:PHSH | Anti-Spam 策略 |
| 3 | 高置信度垃圾邮件 | CAT:HSPM | Anti-Spam 策略 |
| 4 | 欺骗 | CAT:SPOOF | Spoof Intelligence |
| 5 | 垃圾邮件 | CAT:SPM | Anti-Spam 策略 |
| 6 | 批量邮件 | CAT:BULK | Anti-Spam 策略 |
| 7 | 域模拟 | CAT:DIMP | Anti-Phishing 策略 (MDO) |
| 8 | 用户模拟 | CAT:UIMP | Anti-Phishing 策略 (MDO) |

---

## 相关资源

### Microsoft 官方文档
- Anti-Phishing 策略: https://aka.ms/antiphishing
- 隔离管理: https://security.microsoft.com/quarantine
- 提交误报: https://security.microsoft.com/reportsubmission
- MDO 产品更新: https://aka.ms/mdopu
- MDO 已知问题: https://aka.ms/mdoki
- Composite authentication result values: https://learn.microsoft.com/en-us/defender-office-365/anti-spam-message-headers-message-headers-fields
- Enhanced Filtering for Connectors: https://learn.microsoft.com/en-us/exchange/mail-flow-best-practices/use-connectors-to-configure-mail-flow/enhanced-filtering-for-connectors
- 第三方云筛选最佳实践: https://learn.microsoft.com/en-us/exchange/mail-flow-best-practices/manage-mail-flow-using-third-party-cloud
- Spoof protection and DMARC policies: https://learn.microsoft.com/en-us/defender-office-365/anti-phishing-policies-about#spoof-protection-and-sender-dmarc-policies
- Email authentication in EOP: https://learn.microsoft.com/en-us/defender-office-365/email-authentication-about
- 第三方筛选 FAQ (连接器类型指引): https://learn.microsoft.com/en-us/exchange/mail-flow-best-practices/manage-mail-flow-using-third-party-cloud#faq

### 内部工具
- Spam Agent Data 解析脚本: `.\.copilot\skills\kusto\eop\references\decodingspamagentdata.ps1`
- IPAntispamRule Repo: `C:\github\IPAntispamRule\`
- Geneva Portal (需要 CME 账号): `https://portal.microsoftgeneva.com/`

### Supportability Wiki
- EOP Wiki: https://dev.azure.com/Supportability/Modern%20Workplace/_wiki/wikis/Modern%20Workplace/98438/Exchange-Online-Protection
- Spoofing/Impersonation 文档: 搜索 "Spoofing User Impersonation Domain Impersonation"

---

## PowerShell 诊断命令

```powershell
# 获取 Anti-Phishing 策略
Get-AntiPhishPolicy | FL

# 获取 Anti-Spam 策略
Get-HostedContentFilterPolicy | FL

# 获取 Spoof Intelligence 信息
Get-SpoofIntelligenceInsight

# 获取租户允许/阻止列表
Get-TenantAllowBlockListItems -ListType Sender
Get-TenantAllowBlockListSpoofItems

# 获取隔离邮件
Get-QuarantineMessage -StartReceivedDate (Get-Date).AddDays(-7)

# 获取 Message Trace
Get-MessageTrace -SenderAddress "<发件人>" -StartDate (Get-Date).AddDays(-7) -EndDate (Get-Date)

# 获取入站连接器安全配置（连接器绕过排查用）
Get-InboundConnector | Format-List Name, Enabled, ConnectorType, SenderDomains, 
    SenderIPAddresses, RestrictDomainsToIPAddresses, RestrictDomainsToCertificate,
    TlsSenderCertificateName, EFSkipLastIP, EFSkipIPs, EFUsers

# 检查 MX 记录
Resolve-DnsName -Name "<客户域名>" -Type MX
```

---

## 版本历史

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| 1.5 | 2026-02-26 | 新增连接器导致的认证绕过排查章节 (compauth=none reason=4xx)，包括 OnPremises vs Partner 连接器差异、直连 EOP 攻击向量、Honor DMARC 与 compauth=none 交互、EFUsers 限制、修复方案 (Partner 连接器锁定 + EF 启用 + Mail Flow Rule)、排查 Checklist; 扩展 compauth 认证结果表; 新增问题 5 钓鱼邮件未检测; 补充连接器相关官方文档链接和诊断命令 |
| 1.4 | 2026-02-14 | 从 purview.json Dashboard 补充 SMTP Session 日志、Anti-Malware 日志、隔离操作日志、隔离日志、TABL 处理器日志的 Geneva 查询链接和 PowerShell 脚本 (5.8-5.12)，扩展常用事件类型列表 |
| 1.3 | 2026-02-03 | 添加邮件延迟分析章节，包括 HAA 字段解析、EOP 组件延迟分析、延迟分析脚本 |
| 1.2 | 2026-02-03 | 更新 Geneva 日志查询格式，使用 AnyField 条件直接匹配 NetworkMessageId，添加 PowerShell 脚本直接打开浏览器 |
| 1.1 | 2026-02-03 | 添加 Geneva 日志查询步骤，支持 AntiMalwareMdsEvent 等事件分析 |
| 1.0 | 2026-01-16 | 初始版本，基于 shiseido.com.tw 域模拟案例创建 |
