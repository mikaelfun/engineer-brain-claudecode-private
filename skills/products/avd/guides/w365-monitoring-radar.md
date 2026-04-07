# AVD W365 Monitoring & Radar - Quick Reference

**Entries**: 2 | **21V**: all applicable
**Keywords**: display-bug, filters, os-version, radar, ui-bug, w365-monitoring
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | W365 Monitoring (Radar) shows OS build version as Windows 10 instead of Windows ... | Known display issue in Radar monitoring configuration page | Known issue to be addressed in future update. Actual OS is correct, display-only... | 🔵 7.5 | ADO Wiki |
| 2 📋 | W365 Monitoring (Radar) filters lost when switching tabs, time range change rese... | Known UI issue - filters and data series not persisted across tab navigation | Known issue. Workaround: re-apply filters after switching tabs. | 🔵 7.5 | ADO Wiki |

## Quick Triage Path

1. Check: Known display issue in Radar monitoring configurat `[Source: ADO Wiki]`
2. Check: Known UI issue - filters and data series not persi `[Source: ADO Wiki]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/w365-monitoring-radar.md#troubleshooting-flow)
