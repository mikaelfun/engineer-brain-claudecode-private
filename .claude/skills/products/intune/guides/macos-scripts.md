# Intune macOS Shell 脚本与 Sidecar Agent — 排查速查

**来源数**: 3 | **21V**: 部分适用
**条目数**: 4 | **最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Intune PowerShell scripts using legacy Microsoft Intune application (client) ID (d1ddf0e4-d672-4d... | Microsoft removed the global Intune PowerShell application (client) ID based ... | 1) Create a new app registration in Microsoft Entra admin center. 2) Update all PowerShell script... | 🟢 9.0 | OneNote |
| 2 | Error uploading macOS shell script (.sh) in Intune console - script preview shows extra Unicode c... | Script file saved with Unicode/UTF-16 encoding, injecting non-standard Unicod... | Copy the script content to a new file in Notepad, then Save As with ANSI encoding (or UTF-8 witho... | 🟢 8.5 | ADO Wiki |
| 3 | macOS 11.2.x devices: apps can't be downloaded/installed (Install Pending indefinitely), shell sc... | Known macOS Big Sur 11.2.x bug causing ASDErrorDomain Code=506 duplicate inst... | Upgrade the device to macOS 11.3 or later version. | 🔵 7.5 | MS Learn |
| 4 | Error AADSTS50011 'The reply url specified in the request does not match the reply urls configure... | Default redirect URI for the application registration or PowerShell script ha... | For PowerShell: set redirectUri to 'urn:ietf:wg:oauth:2.0:oob'. For custom app: go to Azure porta... | 🔵 6.5 | MS Learn |

## 快速排查路径
1. 1) Create a new app registration in Microsoft Entra admin center. 2) Update all PowerShell scripts to replace the Intune application ID (d1ddf0e4-d672 `[来源: OneNote]`
2. Copy the script content to a new file in Notepad, then Save As with ANSI encoding (or UTF-8 without BOM). Re-upload the corrected .sh file to Intune. `[来源: ADO Wiki]`
3. Upgrade the device to macOS 11.3 or later version. `[来源: MS Learn]`
4. For PowerShell: set redirectUri to 'urn:ietf:wg:oauth:2.0:oob'. For custom app: go to Azure portal > Entra ID > App registrations > find app by ID > A `[来源: MS Learn]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/macos-scripts.md#排查流程)
