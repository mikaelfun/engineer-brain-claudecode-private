# Intune PowerShell Script (IME/SideCar) 部署排查指南

**Source:** MCVKB/Intune/Intune PowerShell Script deploy troubleshooting.md  
**Related IDs:** intune-onenote-041, intune-onenote-042, intune-onenote-043  
**Tags:** powershell, ime, sidecar, intune-management-extension

---

## 前提条件检查

- 客户端必须是 Windows 10 1607 或更高版本
- PS 脚本大小限制：10KB（Unicode 为 5KB）
- 设备必须是 AAD Join / Hybrid Join / Co-management + Auto MDM 已注册
- **不支持** Surface Hub（by design）
- 只能对 **用户组** 分配，不能对设备组分配

---

## 排查步骤

### Step 1：确认 IME 已安装

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

### Step 2：查 IME 事件日志

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

### Step 3：检查本地日志

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

### Step 4：强制 IME 立即同步

IME 默认每 **1小时** 检查一次策略。手动触发：

1. 打开 services.msc
2. 找到 **Microsoft Intune Management Extension**
3. 右键 → Restart

---

## Known Issues

### KI-1：脚本始终以 SYSTEM 运行（已修复）
- **现象**：即使勾选 "Run using logged-on credentials"，脚本仍以 SYSTEM 运行
- **修复版本**：SideCar (IME) v1.7.103+
- **ICM**：#55765826
- **related ID**：intune-onenote-041

### KI-2：Surface Hub 不支持 IME
- **现象**：PS 脚本无法在 Surface Hub 执行
- **原因**：平台限制（by design）
- **KB**：4073215
- **related ID**：intune-onenote-042

### KI-3：脚本未签名错误
- **错误**：`The file ...ps1 is not digitally signed. UnauthorizedAccess`
- **原因**：设备执行策略为 AllSigned，拒绝未签名脚本
- **解决**：检查 PowerShell 执行策略；注意 32-bit (x86) PS 的注册表重定向限制
- **related ID**：intune-onenote-043

### KI-4：只支持用户组分配
- 无法将 PS 脚本分配给设备组，只能分配给用户组（by design）

---

## MSI 部署补充（OMA-DM）

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
