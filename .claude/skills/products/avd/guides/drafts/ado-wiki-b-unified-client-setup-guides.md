---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/Archived Content/Deprecated Content/DEPRECATED_Mobius/DEPRECATED_Setup Guides"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1234638"
importDate: "2026-04-06"
type: troubleshooting-guide
deprecated: true
deprecationNote: "See Windows App (Unified Client) documentation going forward."
---

> ⚠️ **Deprecated**: See the [Windows App (Unified Client) documentation](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1240862/Windows-App-(Unified-Client)) going onwards.

# Unified Client Setup Guides (Deprecated/Historical)

## Store App — Switching to Unified Client Preview (Selfhost Only)

1. Add registry key:
   ```
   [HKEY_CURRENT_USER\Software\Microsoft\Windows365]
   "Environment"=dword:00000000
   ```
2. Install W365 Store app
3. Toggle **Preview Option** → App will restart
4. New app name becomes **Windows App**

### New UI Overview (for reference)
- **Home Screen** — pinned resources
- **Devices** — Full Desktops
- **Apps** — Remote Apps

## Unified Web Client Access URLs (Historical — No Longer Active)

```
W365 resources (test account for bug bash): https://deschutes-sh.microsoft.com/ent
AVD resources in AVD Self Host:             https://aka.ms/mobi-avd-sh
AVD resources in Prod:                      https://aka.ms/mobi-avd-pe
```

### Unified Web Client Flow
1. Go to URL
2. Select account
3. Home Screen appears
4. **Devices** → Full Desktops
5. **Applications** → Remote Apps
6. Resources can be **pinned to Home Screen**
7. **Connection Information** available during session
8. **Notifications** panel available
