# Intune macOS Shell 脚本与 Sidecar Agent — 综合排查指南

**条目数**: 4 | **草稿融合数**: 1 | **Kusto 查询融合**: 0
**来源草稿**: onenote-powershell-script-deploy-troubleshooting.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Powershell Script Deploy Troubleshooting
> 来源: OneNote — [onenote-powershell-script-deploy-troubleshooting.md](../drafts/onenote-powershell-script-deploy-troubleshooting.md)

**Intune PowerShell Script (IME/SideCar) 部署排查指南**
**前提条件检查**
- 客户端必须是 Windows 10 1607 或更高版本
- PS 脚本大小限制：10KB（Unicode 为 5KB）
- 设备必须是 AAD Join / Hybrid Join / Co-management + Auto MDM 已注册
- **不支持** Surface Hub（by design）
- 只能对 **用户组** 分配，不能对设备组分配

**排查步骤**

**Step 1：确认 IME 已安装**
```kusto
```

**Step 2：查 IME 事件日志**
```kusto
```

**Step 3：检查本地日志**
- `IntuneManagementExtension.log`（**主日志**，搜索 `Policybody`）
- `AgentExecutor.log`
- `ClientHealth.log`

**Step 4：强制 IME 立即同步**
1. 打开 services.msc
2. 找到 **Microsoft Intune Management Extension**
3. 右键 → Restart

**Known Issues**

**KI-1：脚本始终以 SYSTEM 运行（已修复）**
- **现象**：即使勾选 "Run using logged-on credentials"，脚本仍以 SYSTEM 运行
- **修复版本**：SideCar (IME) v1.7.103+
- **ICM**：#55765826
- **related ID**：intune-onenote-041

**KI-2：Surface Hub 不支持 IME**
- **现象**：PS 脚本无法在 Surface Hub 执行
- **原因**：平台限制（by design）
- **KB**：4073215
- **related ID**：intune-onenote-042

**KI-3：脚本未签名错误**
- **错误**：`The file ...ps1 is not digitally signed. UnauthorizedAccess`
... (详见原始草稿)

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Intune PowerShell scripts using legacy Microsoft Intune application (client) ID (d1ddf0e4-d672-4d... | Microsoft removed the global Intune PowerShell application (client) ID based ... | 1) Create a new app registration in Microsoft Entra admin center. 2) Update all PowerShell script... | 🟢 9.0 | OneNote |
| 2 | Error uploading macOS shell script (.sh) in Intune console - script preview shows extra Unicode c... | Script file saved with Unicode/UTF-16 encoding, injecting non-standard Unicod... | Copy the script content to a new file in Notepad, then Save As with ANSI encoding (or UTF-8 witho... | 🟢 8.5 | ADO Wiki |
| 3 | macOS 11.2.x devices: apps can't be downloaded/installed (Install Pending indefinitely), shell sc... | Known macOS Big Sur 11.2.x bug causing ASDErrorDomain Code=506 duplicate inst... | Upgrade the device to macOS 11.3 or later version. | 🔵 7.5 | MS Learn |
| 4 | Error AADSTS50011 'The reply url specified in the request does not match the reply urls configure... | Default redirect URI for the application registration or PowerShell script ha... | For PowerShell: set redirectUri to 'urn:ietf:wg:oauth:2.0:oob'. For custom app: go to Azure porta... | 🔵 6.5 | MS Learn |
