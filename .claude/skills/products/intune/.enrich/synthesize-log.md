# Synthesize Log — intune — 2026-04-07

## 模式
全量（首次合成）

## 统计
- 总 JSONL 条目: 1481
- 保留条目: 1232
- 丢弃条目: 261
- 生成 topic: 49
- 融合 topic: 42
- 速查 topic: 7
- 检测矛盾: 565

## 丢弃条目
| ID | 原因 |
|----|------|
| intune-contentidea-kb-016 | 半成品（无根因无方案） |
| intune-contentidea-kb-017 | 半成品（无根因无方案） |
| intune-contentidea-kb-019 | 半成品（无根因无方案） |
| intune-contentidea-kb-022 | 半成品（无根因无方案） |
| intune-contentidea-kb-025 | 半成品（无根因无方案） |
| intune-contentidea-kb-026 | 半成品（无根因无方案） |
| intune-contentidea-kb-027 | 半成品（无根因无方案） |
| intune-contentidea-kb-034 | 半成品（无根因无方案） |
| intune-contentidea-kb-038 | 半成品（无根因无方案） |
| intune-contentidea-kb-041 | 半成品（无根因无方案） |
| intune-contentidea-kb-050 | 半成品（无根因无方案） |
| intune-contentidea-kb-051 | 半成品（无根因无方案） |
| intune-contentidea-kb-052 | 半成品（无根因无方案） |
| intune-contentidea-kb-059 | 半成品（无根因无方案） |
| intune-contentidea-kb-067 | 半成品（无根因无方案） |
| intune-contentidea-kb-068 | 半成品（无根因无方案） |
| intune-contentidea-kb-069 | 半成品（无根因无方案） |
| intune-contentidea-kb-083 | 半成品（无根因无方案） |
| intune-contentidea-kb-084 | 半成品（无根因无方案） |
| intune-contentidea-kb-096 | 半成品（无根因无方案） |
| intune-contentidea-kb-097 | 半成品（无根因无方案） |
| intune-contentidea-kb-100 | 半成品（无根因无方案） |
| intune-contentidea-kb-101 | 半成品（无根因无方案） |
| intune-contentidea-kb-102 | 半成品（无根因无方案） |
| intune-contentidea-kb-105 | 半成品（无根因无方案） |
| intune-contentidea-kb-111 | 半成品（无根因无方案） |
| intune-contentidea-kb-115 | 半成品（无根因无方案） |
| intune-contentidea-kb-118 | 半成品（无根因无方案） |
| intune-contentidea-kb-119 | 半成品（无根因无方案） |
| intune-contentidea-kb-121 | 半成品（无根因无方案） |
| intune-contentidea-kb-122 | 半成品（无根因无方案） |
| intune-contentidea-kb-123 | 半成品（无根因无方案） |
| intune-contentidea-kb-125 | 半成品（无根因无方案） |
| intune-contentidea-kb-126 | 半成品（无根因无方案） |
| intune-contentidea-kb-127 | 半成品（无根因无方案） |
| intune-contentidea-kb-128 | 半成品（无根因无方案） |
| intune-contentidea-kb-132 | 半成品（无根因无方案） |
| intune-contentidea-kb-135 | 半成品（无根因无方案） |
| intune-contentidea-kb-136 | 半成品（无根因无方案） |
| intune-contentidea-kb-137 | 半成品（无根因无方案） |
| intune-contentidea-kb-138 | 半成品（无根因无方案） |
| intune-contentidea-kb-140 | 半成品（无根因无方案） |
| intune-contentidea-kb-144 | 半成品（无根因无方案） |
| intune-contentidea-kb-145 | 半成品（无根因无方案） |
| intune-contentidea-kb-147 | 半成品（无根因无方案） |
| intune-contentidea-kb-148 | 半成品（无根因无方案） |
| intune-contentidea-kb-152 | 半成品（无根因无方案） |
| intune-contentidea-kb-155 | 半成品（无根因无方案） |
| intune-contentidea-kb-160 | 半成品（无根因无方案） |
| intune-contentidea-kb-166 | 半成品（无根因无方案） |
| ... | (共 261 条，仅显示前 50) |

## 融合统计
| topic | 类型 | 三元组 | draft | Kusto | sub-agents |
|-------|------|--------|-------|-------|------------|
| mam-general | 📋 融合 | 110 | 0 | 1 | 0 |
| enrollment-general | 📋 融合 | 85 | 0 | 3 | 0 |
| ios-general | 📋 融合 | 78 | 0 | 1 | 0 |
| compliance-policy | 📋 融合 | 74 | 4 | 2 | 0 |
| cert-scep-ndes | 📋 融合 | 73 | 15 | 1 | Map-Reduce |
| app-win32 | 📋 融合 | 63 | 14 | 2 | Map-Reduce |
| app-general | 📋 融合 | 62 | 2 | 1 | 0 |
| intune-general | 📊 速查 | 60 | 0 | 0 | 0 |
| 21v-feature-gaps | 📋 融合 | 56 | 5 | 0 | 0 |
| cert-general | 📋 融合 | 43 | 5 | 1 | 0 |
| autopilot-general | 📋 融合 | 39 | 0 | 1 | 0 |
| app-office | 📋 融合 | 39 | 3 | 0 | 0 |
| config-general | 📋 融合 | 37 | 0 | 2 | 0 |
| comanagement | 📋 融合 | 37 | 5 | 1 | 0 |
| license-tenant | 📋 融合 | 33 | 0 | 1 | 0 |
| cert-pkcs-pfx | 📋 融合 | 29 | 3 | 1 | 0 |
| windows-general | 📊 速查 | 24 | 0 | 0 | 0 |
| config-admx-omauri | 📋 融合 | 23 | 10 | 1 | Map-Reduce |
| autopilot-hybrid | 📋 融合 | 22 | 0 | 1 | 0 |
| app-ios | 📋 融合 | 22 | 31 | 3 | Map-Reduce |
| conditional-access | 📋 融合 | 22 | 1 | 0 | 0 |
| graph-api | 📋 融合 | 19 | 3 | 0 | 0 |
| android-general | 📊 速查 | 19 | 0 | 0 | 0 |
| device-actions | 📋 融合 | 18 | 3 | 0 | 0 |
| app-android | 📋 融合 | 13 | 0 | 1 | 0 |
| email-profiles | 📋 融合 | 13 | 1 | 0 | 0 |
| windows-bitlocker | 📋 融合 | 13 | 2 | 0 | 0 |
| copilot-intune | 📋 融合 | 12 | 1 | 0 | 0 |
| autopilot-v2 | 📋 融合 | 11 | 18 | 1 | Map-Reduce |
| mam-windows | 📊 速查 | 11 | 0 | 0 | 0 |
| enrollment-windows | 📋 融合 | 11 | 0 | 1 | 0 |
| windows-update | 📋 融合 | 11 | 4 | 0 | 0 |
| cert-whfb | 📋 融合 | 10 | 1 | 0 | 0 |
| vpn-ms-tunnel | 📋 融合 | 10 | 6 | 0 | 0 |
| app-macos | 📋 融合 | 7 | 14 | 0 | Map-Reduce |
| reporting-diagnostics | 📋 融合 | 7 | 3 | 2 | 0 |
| config-security-baseline | 📋 融合 | 5 | 1 | 0 | 0 |
| windows-laps | 📋 融合 | 5 | 8 | 0 | 0 |
| macos-general | 📊 速查 | 5 | 0 | 0 | 0 |
| autopilot-esp | 📋 融合 | 4 | 0 | 1 | 0 |
| enrollment-ios | 📋 融合 | 4 | 19 | 2 | Map-Reduce |
| vpn-general | 📊 速查 | 4 | 0 | 0 | 0 |
| windows-defender | 📋 融合 | 4 | 1 | 0 | 0 |
| macos-scripts | 📋 融合 | 4 | 1 | 0 | 0 |
| macos-update | 📋 融合 | 4 | 3 | 0 | 0 |
| windows-kiosk | 📋 融合 | 3 | 1 | 0 | 0 |
| mam-android | 📋 融合 | 1 | 28 | 1 | Map-Reduce |
| wifi-profiles | 📋 融合 | 1 | 2 | 0 | 0 |
| macos-filevault | 📊 速查 | 1 | 0 | 0 | 0 |

---

# Synthesize Log — intune — 2026-04-17

## 模式
增量（lastEntryCount=1481 → 4166）

## 统计
- 总条目: 4166
- Topics: 49

## Topic 分布
| Topic | 条目数 | 类型 |
|-------|--------|------|
| intune-general | 934 | 📊 速查 |
| app-win32 | 266 | 📋 融合 |
| compliance-policy | 260 | 📋 融合 |
| cert-scep-ndes | 211 | 📋 融合 |
| ios-general | 188 | 📋 融合 |
| autopilot-general | 180 | 📋 融合 |
| mam-general | 174 | 📋 融合 |
| conditional-access | 170 | 📋 融合 |
| app-general | 132 | 📋 融合 |
| app-ios | 123 | 📋 融合 |
| 21v-feature-gaps | 119 | 📋 融合 |
| autopilot-hybrid | 103 | 📋 融合 |
| app-android | 101 | 📋 融合 |
| enrollment-general | 85 | 📋 融合 |
| config-admx-omauri | 81 | 📋 融合 |
| comanagement | 76 | 📋 融合 |
| cert-general | 72 | 📋 融合 |
| device-actions | 72 | 📋 融合 |
| graph-api | 72 | 📋 融合 |
| mam-windows | 66 | 📊 速查 |
| email-profiles | 59 | 📋 融合 |
| vpn-ms-tunnel | 56 | 📋 融合 |
| cert-pkcs-pfx | 52 | 📋 融合 |
| license-tenant | 47 | 📋 融合 |
| enrollment-windows | 42 | 📋 融合 |
| app-macos | 40 | 📋 融合 |
| app-office | 36 | 📋 融合 |
| config-security-baseline | 36 | 📋 融合 |
| windows-update | 31 | 📋 融合 |
| windows-defender | 29 | 📊 速查 |
| autopilot-esp | 25 | 📋 融合 |
| enrollment-ios | 23 | 📋 融合 |
| windows-bitlocker | 22 | 📋 融合 |
| wifi-profiles | 20 | 📋 融合 |
| android-general | 19 | 📊 速查 |
| config-general | 15 | 📋 融合 |
| mam-android | 15 | 📋 融合 |
| autopilot-v2 | 14 | 📋 融合 |
| macos-update | 14 | 📋 融合 |
| copilot-intune | 13 | 📋 融合 |
| cert-whfb | 12 | 📋 融合 |
| reporting-diagnostics | 10 | 📋 融合 |
| windows-general | 9 | 📊 速查 |
| macos-scripts | 8 | 📋 融合 |
| vpn-general | 8 | 📊 速查 |
| macos-general | 7 | 📊 速查 |
| windows-kiosk | 7 | 📋 融合 |
| macos-filevault | 6 | 📊 速查 |
| windows-laps | 6 | 📋 融合 |

# Synthesize Log - intune - 2026-04-24

## 模式
增量（Phase 2.5 + S5 索引生成，无 topic 重生成）

## 执行范围
- topicsToRegen: 0
- Phase 2.5: 生成 `_index.search.jsonl`（49 条记录）
- S5: 更新 `_index.md` 为新格式（| # | Topic | Title | Entries | Fusion | Score | Keywords | Sources | Files |）

## 评分统计
| Badge | 范围 | Topic 数 |
|-------|------|---------|
| 🟢 | 8.0-10.0 | 0 |
| 🔵 | 5.0-7.9 | 49 |
| 🟡 | 3.0-4.9 | 0 |
| ⚪ | 0-2.9 | 0 |

## 索引统计
| 指标 | 值 |
|------|-----|
| 总 topic 数 | 49 |
| 总条目数 | 4166 |
| 融合 topic | 41 |
| 速查 topic | 8 |
| 有工作流 topic | 41 |
| Draft 文件数 | 378 |
| Kusto query 文件数 | 18 |
