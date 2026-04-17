# AVD ContentIdea KB Legacy (Part 2) - Issue Details

**Entries**: 2 | **Type**: Quick Reference only
**Generated**: 2026-04-07

---

## Issues

### 1. How to disable Maximize/Minimize buttons from Remote Desktop Connection so WVD users cannot take scr...
- **ID**: `avd-contentidea-kb-034`
- **Source**: KB | **Score**: 🔵 6.5
- **Root Cause**: 
- **Solution**: Enable displayconnectionbar:i:0 under hostpool RDP properties. Note: only works with WVD sessions, not MSTSC.
- **Tags**: connection-bar, screenshot-prevention, RDP-property, contentidea-kb

### 2. Similar remote apps (e.g. Chrome) on AVD desktop client overlap on the taskbar.
- **ID**: `avd-contentidea-kb-060`
- **Source**: KB | **Score**: 🔵 6.5
- **Root Cause**: Taskbar grouping controlled by local Windows settings, not AVD.
- **Solution**: On client system: Settings -> Taskbar -> Combine Taskbar buttons -> Select NEVER.
- **Tags**: RemoteApp, taskbar, overlapping-icons, client-settings, contentidea-kb
