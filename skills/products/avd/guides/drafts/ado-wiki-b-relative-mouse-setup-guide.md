---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/In-Development Content/Relative Mouse/Setup Guide"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=/Sandbox/In-Development%20Content/Relative%20Mouse/Setup%20Guide"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# AVD Relative Mouse — Setup Guide

## Prerequisites

- MSRDC version must be **1.2.3497 or greater**
- RDP stack version must be the latest publicly available version

## Limitations

- AVD Relative Mouse is available for **MSRDC Windows 10+ clients** for full AVD remote desktop only.
- **NOT available** for non-MSRDC clients (MSTSC, Web Client, Windows Store, and non-Windows clients).
- Does **not** support RemoteApp scenarios.

## Setup

1. Login to Azure Portal and navigate to the desired host pool.
1. Select **RDP Properties** > Select the **Advanced** Tab.
1. Add RDP property: `AllowRelativeMouseMode:i:1` > **Save**.

## End User Experience

- Once enabled, relative mouse is activated and deactivated on-demand via an application request (e.g., a video game enabling relative mouse allows screen/map rotation in any direction).
- In the rare case that relative mouse ends up out of sync, the hotkey **Ctrl+Alt+\\** can toggle relative mouse on and off. This should only be used as a last resort.
