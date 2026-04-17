---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/Archived Content/Deprecated Content/DEPRECATED_Mobius/DEPRECATED_Notes"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1239741"
importDate: "2026-04-06"
type: troubleshooting-guide
deprecated: true
deprecationNote: "See Windows App (Unified Client) documentation going forward."
---

> ⚠️ **Deprecated**: See the [Windows App (Unified Client) documentation](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1240862/Windows-App-(Unified-Client)) going onwards.

# Unified Client Engineering Notes

## Unified Web Client Notes

- **`get cloudPCs/{cloudPCId}/getCloudPcLaunchInfo`**: relates to a different abstraction for identifying a Cloud PC (workspace ID needs conversion to get RDP file, tenant, resource ID)
- **ADFS SSO**: not supported during public preview → falls back to password
- **Azure AD SSO**: supported for public preview
- **Mobius Broadcast Channel Diagram**: communication between Mobius portal and client for launching remote apps in correct browser tab
- **Consumer scenario**: separate (out of scope for public preview)
- Same endpoints, API calls, FQDNs as existing web client → note new `cloud.microsoft` name and redirect
- **Telemetry**:
  - Client telemetry for AVD web client and Mobius client are distinct
  - Nighthawk sends to ARIA (scrubbed of EUPI)
  - RD Core emits telemetry uniformly to **Event Hub**
- **Nighthawk** = application running in browser that loads RD Core Web
  - Handles authentication, connecting to backend services
  - Distinct telemetry from AVD client (different destination too)
- **RD Core** = both AVD web client and Nighthawk web client rely on RD Core for connection/session management
  - RD Core emits telemetry to Event Hub uniformly
- **Mobius client**:
  - Connects directly to resource without going through feed discovery
  - User Agent: `CPC.Web`
  - Diagnostics data from RD Core has separate identifier for it
- **Feed Discovery**:
  - Happens in different URL/web app than the connection itself
  - Users can bookmark connection URL to skip feed discovery in future
  - Connection URL contains resource ID → can go straight to connect without feed discovery

## Unified Windows App Notes

- **Hostapp**: special version for the app; only one version installed even if customer also has AVD store app client (both use same hostapp)
- **ECS**: flighting system (both CPC and AVD, not CPC-only)
- **ARIA**: telemetry destination (both CPC and AVD, not CPC-only)
