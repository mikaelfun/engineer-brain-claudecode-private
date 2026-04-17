# Disk Data Box Disk: MARS Offline Backup — 详细速查

**条目数**: 1 | **类型**: 📊 速查（无融合素材）
**生成日期**: 2026-04-07

---

### 1. MARS offline backup with Data Box Disk: modifying backup items after initial config causes MMC conso

**分数**: 🟢 8.5 | **来源**: [MCVKB] | **置信度**: medium
**21V 适用**: ✅ 是

**根因**: MARS agent MMC snap-in encounters unhandled exception when modifying backup items for existing offline backup schedule.

**方案**: Avoid modifying backup items after initial config. Delete existing schedule and create new one if needed. Empty Data Box Disk folders before retrying.

**标签**: data-box-disk, mars, offline-backup, mmc-crash

---

