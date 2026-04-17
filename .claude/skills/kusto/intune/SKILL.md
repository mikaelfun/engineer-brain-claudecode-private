---
name: intune
description: Microsoft Intune Kusto 查询专家 - 诊断设备管理、策略部署、应用安装、MAM 等问题。当用户需要排查 Intune 相关问题时触发此 skill。
author: fangkun
last_modified: 2026-01-14
---

# Microsoft Intune Kusto 查询 Skill

## 概述

本 Skill 用于查询 Microsoft Intune 相关的 Kusto 日志，诊断设备管理、策略部署、应用安装、MAM (Mobile Application Management) 等问题。

## 触发关键词

- Intune、设备管理、MDM
- 策略、配置文件、合规性
- 应用安装、Win32 App、LOB App、SideCar
- MAM、应用保护策略
- Check-in、签到、同步
- 注册、Enrollment、Autopilot
- SCEP、PKCS、证书
- 许可证、License
- VPP、Apple Business Manager

## 集群信息

| 集群名称 | URI | 数据库 | 用途 |
|----------|-----|--------|------|
| Intune China | https://intunecn.chinanorth2.kusto.chinacloudapi.cn | intune | 设备管理、策略、应用日志 |
| MSODS Mooncake | https://msodsmooncake.chinanorth2.kusto.chinacloudapi.cn | msods | MSODS 审计日志（许可证操作）|

### 访问权限
- **CME 卡**: 有直接访问权限
- **权限申请**: [Intunekusto-CSSMooncake](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/intunekustoc-ftdh)

详细集群信息见: [kusto_clusters.csv](./references/kusto_clusters.csv)

## 主要表

### intune 数据库

| 表名 | 用途 |
|------|------|
| DeviceManagementProvider | 策略应用状态、合规状态、设备管理事件 |
| DeviceLifecycle | 设备注册、状态变更、生命周期事件 |
| IntuneEvent | 通用事件日志（MAM、合规、Check-in 等）|
| IntuneOperation | 设备操作（同步、签入）|
| IntuneScenarioHealth | 场景健康状态（Autopilot、注册等）|
| IOSEnrollmentService | iOS ADE 注册事件 |
| HttpSubsystem | HTTP 请求日志（MAM 操作追踪）|
| DownloadService | 应用下载状态 |
| VppFeatureTelemetry | Apple VPP 令牌同步 |
| CMService | Comanagement 服务日志 |

### MSODS 数据库

| 表名 | 用途 |
|------|------|
| IfxAuditLoggingCommon | 用户许可证操作审计日志 |

### 预定义函数 (Autopilot V2)

| 函数名 | 参数 | 说明 |
|--------|------|------|
| CheckAutopilotV2EligibilityForDevice | (lookback, deviceId) | 检查设备是否支持 APv2 |
| GetAutopilotV2EnrollmentEventsForDevice | (lookback, deviceId) | 获取 APv2 注册事件 |
| GetAutopilotV2ProvisioningEventsForDevice | (lookback, deviceId) | 获取 APv2 预配事件 |
| GetAutopilotV2CheckinSessionInfoForDevice | (lookback, intuneDeviceId) | 获取签入会话信息 |
| GetAutopilotV2SidecarInstallEventsForDevice | (lookback, intuneDeviceId) | 获取 Sidecar 安装事件 |
| GetAutopilotV2ScenarioResultEventsForDevice | (lookback, deviceId) | 获取场景结果事件 |

详细表定义见: [tables/README.md](./references/tables/README.md)

## ⚠️ 重要提示：设备 ID 类型区分

**Intune 中有两种不同的设备 ID**：
- **Intune Device ID**: Intune 内部设备标识符
- **AAD Device ID (Entra ID Device ID)**: Azure AD 设备标识符

**关键注意事项**：
- 用户提供的设备 ID 可能是任一类型
- **必须使用 `* has 'device-id'` 宽泛条件搜索**，不要用精确匹配
- 先查询确认设备存在并获取 Intune Device ID，再进行后续查询
- 两种 ID 之间没有直接映射关系，需要通过日志关联

## 工作流程

### 步骤 1: 获取查询参数

从用户获取必要的查询参数：

| 参数 | 必需 | 说明 |
|------|------|------|
| deviceId | ✅ | Intune 设备 ID 或 AAD Device ID |
| accountId | 可选 | Intune 账户 ID |
| tenantId | 可选 | Entra ID 租户 ID |
| userId | 可选 | 用户 Object ID |
| policyId | 可选 | 策略 ID |
| timeRange | 可选 | 问题发生时间范围（默认 7 天）|

### 步骤 2: 确认设备存在

**始终先执行设备发现查询**，使用宽泛搜索确认设备存在并获取 Intune Device ID：

```kql
let searchId = '{用户提供的设备ID}';

DeviceManagementProvider
| where env_time > ago(30d)
| where * has searchId
| parse message with * 'AADDId=' AADdeviceID_Msg ',' *
| where isnotempty(AADdeviceID_Msg) or isnotempty(deviceId)
| summarize 
    FirstSeen=min(env_time), 
    LastSeen=max(env_time)
  by IntuneDeviceID=deviceId, AADDeviceID=AADdeviceID_Msg, accountId, accountContextId
| project FirstSeen, LastSeen, IntuneDeviceID, AADDeviceID, AccountId=accountId, AADTenant=accountContextId
```

### 步骤 3: 选择查询模板

根据问题类型选择对应的查询文件：

| 查询文件 | 用途 |
|----------|------|
| [device-info.md](./references/queries/device-info.md) | 设备基本信息、ID 映射、AAD 注册信息 |
| [device-checkin.md](./references/queries/device-checkin.md) | 设备签到历史、HttpSubsystem 路由、MDMCheckIn |
| [policy-status.md](./references/queries/policy-status.md) | 策略应用状态 |
| [policy-error.md](./references/queries/policy-error.md) | 策略错误分析 🔥 |
| [app-install.md](./references/queries/app-install.md) | 应用安装事件、下载关联查询 |
| [ime-extension.md](./references/queries/ime-extension.md) | IME Agent 安装（Win32 App 前置） 🆕 |
| [intune-events-general.md](./references/queries/intune-events-general.md) | 通用事件全量查询模板 🆕 |
| [mam-policy.md](./references/queries/mam-policy.md) | MAM 策略 |
| [license-status.md](./references/queries/license-status.md) | 许可证状态 |
| [enrollment.md](./references/queries/enrollment.md) | 设备注册 |
| [compliance.md](./references/queries/compliance.md) | 合规状态、合规计算事件 |
| [effective-group.md](./references/queries/effective-group.md) | 有效组评估、按 policyID 查询、EG 变更事件 |
| [certificate.md](./references/queries/certificate.md) | 证书 (SCEP/PKCS/MDM) |
| [vpp-token.md](./references/queries/vpp-token.md) | VPP 令牌同步 |
| [autopilot.md](./references/queries/autopilot.md) | Autopilot 资格 |
| [apple-device.md](./references/queries/apple-device.md) | Apple 设备专用 |
| [comanagement.md](./references/queries/comanagement.md) | Comanagement |

### 步骤 4: 执行查询

使用 `fabric-rti-mcp` 的 `kusto_query` 工具执行查询：

```
Tool: kusto_query
Parameters:
  - cluster_uri: https://intunecn.chinanorth2.kusto.chinacloudapi.cn
  - database: intune
  - query: KQL 查询语句
```

### 步骤 5: 分析结果

分析查询结果，生成诊断报告。

## 常见诊断场景

### 场景 1: 设备 Check-in 停滞 🔥

**症状**: Intune 门户显示 Check-in 时间停滞，但设备仍在使用

**排查步骤**:
1. 使用 `device-info.md` 宽泛搜索确认设备存在
2. 使用 `device-checkin.md` 确认后台 Check-in 正常
3. 使用 `policy-error.md` 发现策略错误
4. 分析错误类型和影响范围
5. 在 Intune 门户修复或移除问题策略

**根因经验**: 配置策略错误导致 Check-in 部分失败，门户只更新完全成功的签到时间。

### 场景 2: 策略不生效

**排查步骤**:
1. 使用 `device-info.md` 确认设备存在
2. 使用 `device-checkin.md` 检查最后签到时间
3. 使用 `policy-status.md` 查看策略应用状态
4. 检查 Applicability 和 Compliance 字段

### 场景 3: 应用安装失败

**排查步骤**:
1. 使用 `app-install.md` 查询应用安装事件
2. 检查 enforcementState 和 errorCode
3. 查看 SideCar 事件获取 Win32 应用详情

### 场景 4: MAM 策略不生效

**排查步骤**:
1. 使用 `mam-policy.md` 查询 MAM 活动
2. 检查应用注册状态（Enroll/Unenroll）
3. 分析 PolicyState 和 ReasonCode

### 场景 5: IME Extension 安装问题

**排查步骤**:
1. 使用 `ime-extension.md` 查询 IME Agent 安装事件
2. 检查 IntuneWindowsAgent.msi 是否成功安装
3. 如未安装，确认设备是否签到并被分配 Win32 App 策略
4. 使用 `app-install.md` 查询 8 确认 IME 报告状态

### 场景 6: 通用事件排查

**排查步骤**:
1. 使用 `intune-events-general.md` 的查询 1 按设备/用户检索 IntuneEvent
2. 使用查询 2 通过 RelatedActivityId 展开关联事件
3. 使用查询 3 检索 DeviceManagementProvider 全量事件
4. 通过 filterstring 参数灵活过滤特定事件名或错误

### 场景 7: 设备证书问题

**排查步骤**:
1. 使用 `certificate.md` 查询证书部署状态
2. 检查 SCEP/PKCS 配置文件状态
3. 查看 MDM Identity Certificate 过期日期

### 场景 8: 许可证问题

**排查步骤**:
1. 使用 `license-status.md` 查询 IntuneEvent
2. 查询 MSODS 审计日志确认许可证分配/移除

## 预定义查询索引

详细查询索引见: [queries/README.md](./references/queries/README.md)

## 报告格式

执行查询后，按以下格式输出报告：

```markdown
### 查询: [查询目的]

**为什么执行这个查询:** [原因]

**KQL 查询语句:**
\```kql
[完整 KQL 代码]
\```

**查询结果:**
[结果摘要/表格]

**发现/结论:**
[分析结论]
```

## 参考链接

- [Intune Wiki](https://www.intunewiki.com/wiki/)
- [Supportability Intune Wiki](https://supportability.visualstudio.com/Intune/_wiki/wikis/Intune/1321070/Welcome)
- [Mooncake Intune OneNote](https://microsoft.sharepoint.com/teams/mcpod/_layouts/OneNote.aspx?id=%2Fteams%2Fmcpod%2FSiteAssets%2FMooncake%20POD%20Support%20Notebook)
- [父 Skill](../SKILL.md)
