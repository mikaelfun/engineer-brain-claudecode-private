# Intune macOS 软件更新 / DDM — 综合排查指南

**条目数**: 4 | **草稿融合数**: 3 | **Kusto 查询融合**: 0
**来源草稿**: onenote-macos-ios-software-update-ddm.md, onenote-macos-software-update-monitoring.md, onenote-macos-software-update-troubleshooting.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Macos Ios Software Update Ddm
> 来源: OneNote — [onenote-macos-ios-software-update-ddm.md](../drafts/onenote-macos-ios-software-update-ddm.md)

**macOS/iOS Software Update: DDM vs Software Update Policy**
**Overview**
1. **Declarative Device Management (DDM)** = Managed Software Update Policy
2. **Software Update Policy** (legacy)

**Key Differences**

**Precedence Order**

**iOS/iPadOS**
1. Declarative software updates (Settings catalog > DDM > Software Update)
2. Update policies (Devices > Update policies for iOS/iPadOS)

**macOS**
1. Declarative software updates (Settings catalog > DDM > Software Update)
2. Update policies (Devices > Update policies for macOS)
3. Software updates (Settings catalog > System Updates > Software Update)

**MDM Software Update Command Sequence**
1. `ScheduleOSUpdateScanCommand` — find available updates
2. `AvailableOSUpdatesCommand` — get update list
3. `ScheduleOSUpdateCommand` — download selected update
4. `OSUpdateStatusCommand` — poll status until `IsDownloaded`
5. `ScheduleOSUpdateCommand` (install) — trigger installation

**Known Limitations**
- **macOS 13**: `InstallLater` action is NOT supported (also no DownloadOnly, NotifyOnly, InstallForceRestart)
- **Priority key**: Only applies to minor version updates (e.g., macOS 12.x → 12.y). Do NOT set Priority for major updates.
- `InstallLater` in Apple MDM only applies to minor version updates per Apple documentation.

**DDM Troubleshooting**

**Kusto Query**
```kusto
```

**Console Log Keywords**
```
```

**References**
- [Declarative software updates | Microsoft Learn](https://learn.microsoft.com/en-us/mem/intune/protect/software-updates-declarative-ios-macos)
- [ScheduleOSUpdateCommand | Apple Developer](https://developer.apple.com/documentation/devicemanagement/scheduleosupdatecommand/command/updatesitem)
- [Integrating Declarative Management | Apple Developer](https://developer.apple.com/documentation/devicemanagement/integrating_declarative_management)

### Phase 2: Macos Software Update Monitoring
> 来源: OneNote — [onenote-macos-software-update-monitoring.md](../drafts/onenote-macos-software-update-monitoring.md)

**macOS Software Update Monitoring via Intune (Kusto)**
**Primary Kusto Query**
```kusto
```
**Key EventUniqueNames**
**Understanding Results**
- One message per update category per device
- ProductKey format: `_MACOS_<version>` for OS updates, `MSU_UPDATE_<build>_patch_<version>` for supplemental updates
- State mapping defined in: `Updates\src\Services\Common\Models\SoftwareUpdate\CosmosDbEntity\MacOSSoftwareUpdateState.cs`
- Filter by `Pid` to see messages for a single background task instance

**Reference**
- [IntuneWiki: MacOS Software Update](https://www.intunewiki.com/wiki/MacOS_Software_Update)

### Phase 3: Macos Software Update Troubleshooting
> 来源: OneNote — [onenote-macos-software-update-troubleshooting.md](../drafts/onenote-macos-software-update-troubleshooting.md)

**macOS Software Update Troubleshooting Guide**
**Kusto Query - QMS Background Task Processing**
```kusto
```
**Event Name Reference**
**Kusto Query - Plugin Command Flow**
```kusto
```
**MDM Command Flow**
1. **AvailableOSUpdates** command sent -> device responds with available updates count
2. **OSUpdateStatus** command sent -> device responds with current update status
3. Background task processes QMS messages and updates CosmosDB reports

**State Mapping**

**Reference**
- [MacOS Software Update - IntuneWiki](https://www.intunewiki.com/wiki/MacOS_Software_Update)

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | macOS Software Update policy InstallLater action not working on macOS 13 devices; update not sche... | macOS 13 does not support InstallLater action (nor DownloadOnly, NotifyOnly, ... | For macOS 13, use InstallAction:Default instead of InstallLater. Do not set Priority for major ve... | 🟢 9.0 | OneNote |
| 2 | macOS update policy with Install Later action fails for major OS upgrades with MCMDMErrorDomain E... | Apple limitation: Install Later action is not supported for major OS updates.... | 1. Do not configure Install Later when a major OS upgrade is available. 2. Use Install ASAP or sc... | 🟢 9.0 | OneNote |
| 3 | DDM StatusReport 显示 Valid: Invalid，错误代码 Error.ConfigurationCannotBeApplied | DDM 策略中指定的目标 OS 版本低于设备当前运行的 OS 版本（如目标 15.7.4 但设备已运行 26.3.1） | 1. 检查 DDM 策略中配置的目标 OS 版本；2. 更新策略使目标版本不低于设备当前版本；3. 使用 Kusto 查询 DDMHighLevelCheckin 函数检查 StatusRepo... | 🟢 8.5 | ADO Wiki |
| 4 | macOS legacy MDM-based software update policies deprecated, replaced by DDM | Starting 2510 release, legacy MDM update policies deprecated. From 2602, no n... | Migrate to DDM-based policies at https://aka.ms/Intune/Apple-DDM-software-updates. Existing legac... | 🟢 8.5 | ADO Wiki |
