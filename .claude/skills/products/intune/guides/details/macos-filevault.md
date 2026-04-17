# Intune macOS FileVault 加密 — 综合排查指南

**条目数**: 1 | **草稿融合数**: 0 | **Kusto 查询融合**: 0
**生成日期**: 2026-04-07

---

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | macOS FileVault profile is installed via Intune but FileVault is not enabled on the device. Kusto... | FileVault prerequisites are not met on the device, or the FileVault payload w... | Ensure device meets prerequisites. Check Kusto DeviceManagementProvider with device ID and look f... | 🟢 9.0 | OneNote |
