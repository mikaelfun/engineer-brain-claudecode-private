# AVD ContentIdea KB Legacy (Part 2) - Quick Reference

**Entries**: 2 | **21V**: all applicable
**Keywords**: client-settings, connection-bar, overlapping-icons, rdp-property, remoteapp, screenshot-prevention, taskbar
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | How to disable Maximize/Minimize buttons from Remote Desktop Connection so WVD u... | - | Enable displayconnectionbar:i:0 under hostpool RDP properties. Note: only works ... | 🔵 6.5 | KB |
| 2 | Similar remote apps (e.g. Chrome) on AVD desktop client overlap on the taskbar. | Taskbar grouping controlled by local Windows settings, not AVD. | On client system: Settings -> Taskbar -> Combine Taskbar buttons -> Select NEVER... | 🔵 6.5 | KB |

## Quick Triage Path

1. Check: Unknown `[Source: KB]`
2. Check: Taskbar grouping controlled by local Windows setti `[Source: KB]`
