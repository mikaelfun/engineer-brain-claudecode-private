# Intune macOS FileVault 加密 — 排查速查

**来源数**: 1 | **21V**: 全部适用
**条目数**: 1 | **最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | macOS FileVault profile is installed via Intune but FileVault is not enabled on the device. Kusto... | FileVault prerequisites are not met on the device, or the FileVault payload w... | Ensure device meets prerequisites. Check Kusto DeviceManagementProvider with device ID and look f... | 🟢 9.0 | OneNote |

## 快速排查路径
1. Ensure device meets prerequisites. Check Kusto DeviceManagementProvider with device ID and look for iOSPlugin messages. Verify FileVault profile is co `[来源: OneNote]`
