# Disk Data Box Disk: MARS Offline Backup — 排查速查

**来源数**: 1 | **21V**: 全部适用
**最后更新**: 2026-04-07
**关键词**: data-box-disk, mars, mmc-crash, offline-backup

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | MARS offline backup with Data Box Disk: modifying backup items after initial config causes MMC console crash | MARS agent MMC snap-in encounters unhandled exception when modifying backup items for existing offli | Avoid modifying backup items after initial config. Delete existing schedule and create new one if needed. Empty Data Box | 🟢 8.5 | [MCVKB] |

## 快速排查路径

1. MARS offline backup with Data Box Disk: modifying backup items after initial con → Avoid modifying backup items after initial config `[来源: onenote]`
