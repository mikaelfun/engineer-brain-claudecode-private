# Intune Wi-Fi 配置 — 排查速查

**来源数**: 1 | **21V**: 全部适用
**条目数**: 1 | **最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Network connectivity drops during Windows new hire onboarding after Intune deploys SCEP certifica... | When Intune pushes SCEP+WiFi profile to newly enrolled device, the WiFi authe... | (1) Check WiFi connection timestamp vs auth method switch timing to confirm this is the cause; (2... | 🟢 9.0 | OneNote |

## 快速排查路径
1. (1) Check WiFi connection timestamp vs auth method switch timing to confirm this is the cause; (2) Customer-developed PowerShell script workaround (co `[来源: OneNote]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/wifi-profiles.md#排查流程)
