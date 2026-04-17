# Intune macOS 通用问题 — 综合排查指南

**条目数**: 5 | **草稿融合数**: 0 | **Kusto 查询融合**: 0
**生成日期**: 2026-04-07

---

## ⚠️ 已知矛盾 (3 条)

- **solution_conflict** (high): intune-ado-wiki-185 vs intune-contentidea-kb-505 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **rootCause_conflict** (medium): intune-ado-wiki-186 vs intune-contentidea-kb-505 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **rootCause_conflict** (medium): intune-ado-wiki-186 vs intune-contentidea-kb-577 — context_dependent: 不同来源给出不同方案，可能适用不同场景

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | macOS 设备上一个 bad pkg 导致整个下载队列阻塞，其他应用也无法下载安装 | 损坏/不合规的 pkg 阻塞了 macOS storedownloadd 进程的下载队列，Console 日志显示 LegacyDownloadQueue... | 1. 重启 storedownloadd 进程或重启设备；2. 修复问题 pkg（确保 PackageInfo 符合要求）；3. macOS 10.14 Mojave 及以后版本已修复此问题 | 🟢 8.5 | ADO Wiki |
| 2 | macOS 自动更新应用在 Intune 中显示未安装，版本检测不匹配 | 应用支持自动更新后版本号与上传到 Intune 的版本不一致，DeviceManagementProvider 日志可确认版本差异 | 在 Intune 应用配置中启用忽略应用版本（Ignore app version）选项 | 🟢 8.5 | ADO Wiki |
| 3 | macOS pkg 包含 dynamic library 和 executable 应用，安装成功但应用未被检测为已安装 | dynamic library 无法通过 macOS MDM 通道发现，导致应用检测失败 | 检查 PackageInfo 确认每个 package 都是 application 类型；如果 pkg 混合了 library 和 app，可能需要分拆或确保主 app bundle 信息正确 | 🔵 7.5 | ADO Wiki |
| 4 | Custom packages for MacOS or PKG files must be wrapped or pre-processed with the Intune App Wrapp... | The package or .PKG file does not contain Increment package version and CFBun... | Review the output of Detection.xml to extract the detection parameters and version for the create... | 🔵 7.0 | ContentIdea KB |
| 5 | You had set up JAMF-Intune integration appropriately and registered MacOS devices within Intune. ... | During the investigation, JAMF released a new version of 10.6.2 which contain... | After   Jamf released 10.6.2, you had to do the following steps to get the client to   re-registe... | 🔵 7.0 | ContentIdea KB |
