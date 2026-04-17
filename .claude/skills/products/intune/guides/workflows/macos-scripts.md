# Intune macOS Shell 脚本与 Sidecar Agent — 排查工作流

**来源草稿**: onenote-powershell-script-deploy-troubleshooting.md
**Kusto 引用**: (无)
**场景数**: 8
**生成日期**: 2026-04-07

---

## Scenario 1: Step 1：确认 IME 已安装
> 来源: onenote-powershell-script-deploy-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

从 **Apps & Features** 中查找 `Microsoft Intune Management Extension`。

**Kusto 确认 IME agent 安装状态：**
```kusto
DeviceManagementProvider
| where env_time >= ago(24h)
| where * contains "<deviceId>"
| where * contains "IntuneWindowsAgent"
| project env_time, name, applicablilityState, reportComplianceState
| summarize max(env_time) by name, applicablilityState, reportComplianceState
```

## Scenario 2: Step 2：查 IME 事件日志
> 来源: onenote-powershell-script-deploy-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
// 查设备 SideCar 事件
IntuneEvent
| where env_time >= ago(24h)
| where ApplicationName == "SideCar"
| where ActivityId == "<deviceId>"
| project env_time, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, ComponentName

// 查 Policy
IntuneEvent
| where env_time >= ago(24h)
| where ApplicationName == "SideCar"
| where ActivityId == "<deviceId>"
| where Col3 contains "PolicyId"
| extend Policy = split(Col3, ',')
| extend PolicyId = split(Policy[0],':')[1]
| extend PolicyType = split(Policy[1],':')[1]
| extend PolicyBody = split(Policy[5],'\":\"')[1]
| project PolicyId, PolicyType, PolicyVersion, PolicyBody
```

## Scenario 3: Step 3：检查本地日志
> 来源: onenote-powershell-script-deploy-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

日志路径：`C:\ProgramData\Microsoft\Intune Management Extension\Logs`

3个日志文件：
- `IntuneManagementExtension.log`（**主日志**，搜索 `Policybody`）
- `AgentExecutor.log`
- `ClientHealth.log`

> 日志格式与 SCCM 相同，可用 Config Manager Trace Tool 读取

**脚本文件保存位置：**
`C:\Program Files (x86)\Microsoft Intune Management Extension\Policies\Scripts\`

**脚本结果注册表：**
`HKLM\SOFTWARE\Microsoft\IntuneManagementExtension\Policies\<UserGUID>\<ScriptGUID>`

若需强制重新执行脚本：将 `DownloadCount`、`ErrorCode` 重置为 `0`，`Result`/`ResultDetails` 清空，然后重启 IME 服务。

## Scenario 4: Step 4：强制 IME 立即同步
> 来源: onenote-powershell-script-deploy-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

IME 默认每 **1小时** 检查一次策略。手动触发：

1. 打开 services.msc
2. 找到 **Microsoft Intune Management Extension**
3. 右键 → Restart

---

## Scenario 5: KI-1：脚本始终以 SYSTEM 运行（已修复）
> 来源: onenote-powershell-script-deploy-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **现象**：即使勾选 "Run using logged-on credentials"，脚本仍以 SYSTEM 运行
- **修复版本**：SideCar (IME) v1.7.103+
- **ICM**：#55765826
- **related ID**：intune-onenote-041

## Scenario 6: KI-2：Surface Hub 不支持 IME
> 来源: onenote-powershell-script-deploy-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **现象**：PS 脚本无法在 Surface Hub 执行
- **原因**：平台限制（by design）
- **KB**：4073215
- **related ID**：intune-onenote-042

## Scenario 7: KI-3：脚本未签名错误
> 来源: onenote-powershell-script-deploy-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **错误**：`The file ...ps1 is not digitally signed. UnauthorizedAccess`
- **原因**：设备执行策略为 AllSigned，拒绝未签名脚本
- **解决**：检查 PowerShell 执行策略；注意 32-bit (x86) PS 的注册表重定向限制
- **related ID**：intune-onenote-043

## Scenario 8: MSI 部署补充（OMA-DM）
> 来源: onenote-powershell-script-deploy-troubleshooting.md | 适用: Mooncake ✅

### 排查步骤

注册表路径：`HKLM\SOFTWARE\Microsoft\EnterpriseDesktopAppManagement\<SID>\<MSI-ProductCode>`

关键字段：
- `CurrentDownloadUrl`：MSI 下载地址
- `EnforcementRetryCount`：最大重试次数
- `LastError`：最后一次执行错误

---

## 21Vianet 适用性

✅ 适用 — IME 功能在 21v 与 Public 云行为一致。

---
*Extracted from OneNote: MCVKB/Intune | 2026-04-04*

---

## Kusto 查询参考

### Step 1：确认 IME 已安装

```kql
DeviceManagementProvider
| where env_time >= ago(24h)
| where * contains "<deviceId>"
| where * contains "IntuneWindowsAgent"
| project env_time, name, applicablilityState, reportComplianceState
| summarize max(env_time) by name, applicablilityState, reportComplianceState
```
`[来源: onenote-powershell-script-deploy-troubleshooting.md]`

### Step 2：查 IME 事件日志

```kql
// 查设备 SideCar 事件
IntuneEvent
| where env_time >= ago(24h)
| where ApplicationName == "SideCar"
| where ActivityId == "<deviceId>"
| project env_time, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, ComponentName

// 查 Policy
IntuneEvent
| where env_time >= ago(24h)
| where ApplicationName == "SideCar"
| where ActivityId == "<deviceId>"
| where Col3 contains "PolicyId"
| extend Policy = split(Col3, ',')
| extend PolicyId = split(Policy[0],':')[1]
| extend PolicyType = split(Policy[1],':')[1]
| extend PolicyBody = split(Policy[5],'\":\"')[1]
| project PolicyId, PolicyType, PolicyVersion, PolicyBody
```
`[来源: onenote-powershell-script-deploy-troubleshooting.md]`

---

> ⚠️ **21V (Mooncake) 注意**: 本主题包含 21V 特有的限制或配置，请注意区分 Global 与 21V 环境差异。
