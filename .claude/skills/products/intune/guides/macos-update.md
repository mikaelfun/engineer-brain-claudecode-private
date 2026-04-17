# Intune macOS 软件更新 / DDM — 排查速查

**来源数**: 2 | **21V**: 全部适用
**条目数**: 4 | **最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | macOS Software Update policy InstallLater action not working on macOS 13 devices; update not sche... | macOS 13 does not support InstallLater action (nor DownloadOnly, NotifyOnly, ... | For macOS 13, use InstallAction:Default instead of InstallLater. Do not set Priority for major ve... | 🟢 9.0 | OneNote |
| 2 | macOS update policy with Install Later action fails for major OS upgrades with MCMDMErrorDomain E... | Apple limitation: Install Later action is not supported for major OS updates.... | 1. Do not configure Install Later when a major OS upgrade is available. 2. Use Install ASAP or sc... | 🟢 9.0 | OneNote |
| 3 | DDM StatusReport 显示 Valid: Invalid，错误代码 Error.ConfigurationCannotBeApplied | DDM 策略中指定的目标 OS 版本低于设备当前运行的 OS 版本（如目标 15.7.4 但设备已运行 26.3.1） | 1. 检查 DDM 策略中配置的目标 OS 版本；2. 更新策略使目标版本不低于设备当前版本；3. 使用 Kusto 查询 DDMHighLevelCheckin 函数检查 StatusRepo... | 🟢 8.5 | ADO Wiki |
| 4 | macOS legacy MDM-based software update policies deprecated, replaced by DDM | Starting 2510 release, legacy MDM update policies deprecated. From 2602, no n... | Migrate to DDM-based policies at https://aka.ms/Intune/Apple-DDM-software-updates. Existing legac... | 🟢 8.5 | ADO Wiki |

## 快速排查路径
1. For macOS 13, use InstallAction:Default instead of InstallLater. Do not set Priority for major version updates. Consider DDM for macOS 14+/iOS 17+. `[来源: OneNote]`
2. 1. Do not configure Install Later when a major OS upgrade is available. 2. Use Install ASAP or schedule maintenance window for major upgrades. 3. Doc: `[来源: OneNote]`
3. 1. 检查 DDM 策略中配置的目标 OS 版本；2. 更新策略使目标版本不低于设备当前版本；3. 使用 Kusto 查询 DDMHighLevelCheckin 函数检查 StatusReportRequest 中的错误详情 `[来源: ADO Wiki]`
4. Migrate to DDM-based policies at https://aka.ms/Intune/Apple-DDM-software-updates. Existing legacy policies remain active `[来源: ADO Wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/macos-update.md#排查流程)
