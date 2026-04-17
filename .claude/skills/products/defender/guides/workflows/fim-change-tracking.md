# Defender FIM 文件完整性监控 — 排查工作流

**来源草稿**: ado-wiki-a-fim-v2-support-boundaries.md, onenote-fim-change-tracking.md, onenote-fim-troubleshooting.md
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: Training FIM v2 (AMA based)
> 来源: ado-wiki-a-fim-v2-support-boundaries.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Open collaboration task to:
2. Change tracking IcM team (for FIM escalations on ChangeTracking issues):
3. To consult with ChangeTracking Dev team: "Change Tracking Engineering Team" \<changeinventory@microsoft.com\>

### Portal 导航路径
- collaboration task to:

---

## Scenario 2: File Integrity Monitoring (FIM) - Change Tracking Diagnostics
> 来源: onenote-fim-change-tracking.md | 适用: Mooncake ✅

### Kusto 诊断查询
**查询 1:**
```kusto
ConfigurationData
| where Computer contains "MACHINENAME"
```

**查询 2:**
```kusto
ConfigurationChange
| where Computer contains "MACHINENAME"
```

---

## Scenario 3: File Integrity Monitoring (FIM) Troubleshooting Guide
> 来源: onenote-fim-troubleshooting.md | 适用: Mooncake ✅

### Kusto 诊断查询
**查询 1:**
```kusto
ConfigurationData
| where Computer contains "<MACHINENAME>"
```

**查询 2:**
```kusto
ConfigurationChange
| where Computer contains "<MACHINENAME>"
```

---
