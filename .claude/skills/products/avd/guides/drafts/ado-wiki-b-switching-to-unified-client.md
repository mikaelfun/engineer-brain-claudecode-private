---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/Archived Content/Deprecated Content/DEPRECATED_Mobius/DEPRECATED_Switching to Unified Client"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1230241"
importDate: "2026-04-06"
type: troubleshooting-guide
deprecated: true
deprecationNote: "See Windows App (Unified Client) documentation going forward."
---

> ⚠️ **Deprecated**: See the [Windows App (Unified Client) documentation](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1240862/Windows-App-(Unified-Client)) going onwards.

# Switching to Unified Client — How Each Client Transitions

## AVD Web Client
- Displays toggle button called **"New Client"** to switch between v1 and v2 (defaults to v2)
- Starting November 16: toggle moves to **Settings** menu
- When preview starts: toggle renamed to **"Try New"** (defaults to OFF); if toggled ON → switches to new unified portal
- Banner added: "Windows App is the new way..." with **"Open Windows App"** button → takes user to Store to install

## Windows Desktop Client (msrdc)
- When preview starts: users get notification that new version is available
- New version has toggle button: **"Try the new Unified Client"** (defaults to OFF)
- If toggled ON: client closes → Windows App downloads in background → opens with new UI, new icon, new app name
- **NOTE**: preview toggle won't be present immediately at public preview — will follow shortly after

## AVD Store App
- When Windows App enters public preview: users can access new experience via **preview toggle** in the app
- Turning on preview toggle: closes app → reopens with new UI, new icon, new app name
- **NOTE**: preview toggle won't be present immediately at public preview — will follow shortly after
