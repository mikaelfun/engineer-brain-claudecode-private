---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/Archived Content/Deprecated Content/DEPRECATED_Mobius/DEPRECATED_Unified Web Portal"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1238584"
importDate: "2026-04-06"
type: troubleshooting-guide
deprecated: true
deprecationNote: "See Windows App (Unified Client) documentation going forward."
---

> ⚠️ **Deprecated**: See the [Windows App (Unified Client) documentation](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1240862/Windows-App-(Unified-Client)) going onwards.

[[_TOC_]]

# Unified Web Portal

## Overview
Combines AVD Web Client and Remote Desktop web connection center into a single unified portal experience.

**Goals**:
1. AVD workspaces/remote apps accessible from unified portal
2. Remote actions on devices: Restart, Restore, Rename, Troubleshoot
3. Dark mode supported
4. Single unified URL for all WCX services

## Authentication

### Client Authentication
Handled using **msal-browser** library. Tokens obtained for:
- **O365 Header** — onboard O365 Suite Header
- **AVD** — feed discovery
- **OCPS** — survey and feedback features

### Service Authentication
Handled using **MISE+SAL** — ensures only authorized users can access protected resources.

### First Party Application (FPA)
- Portal web client: **Windows 365 Client - Web FPA** (same as Consumer Portal; allows MSA and AAD)
- Portal UX Service: **Windows 365 End User API FPA** (same as Window 365 End User API)

## Architecture

### Unified Web Portal Structure
- Frontend web app served via unified URL
- Backend UX service using Windows 365 End User API FPA
- Client authentication via msal-browser (client-side)
- Service authentication via MISE+SAL (server-side)

### Device List Flow
Two flows for getting devices list (including AVD & Cloud PCs):
1. **Without Unified Feed Discovery** — direct device enumeration
2. **With Unified Feed Discovery** — feed discovery then device list

## Key URLs (Deprecated/Historical)
- These URLs are no longer in use; current production URL is managed by the unified portal team
