---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Settings Framework/FAQ"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FFeatures%2FSettings%20Framework%2FFAQ"
importDate: "2026-04-05"
type: reference-guide
---

# Windows 365 Settings Framework FAQ

## Settings Categories

Settings are split into three categories with distinct delivery paths:

| Category | Delivery Path |
|----------|---------------|
| Cloud PC configurations | Enforced during lifecycle management |
| Windows App settings | Enforced at the app layer post-provisioning |
| Remote connection experience | Applied dynamically at session start |

## Key Q&A

**User settings deprecation**: Some settings already migrated from "User settings" to "Windows App settings". Remaining will migrate to "Cloud PC configurations". "User settings" will eventually be deprecated.

**Graph API**: New Settings framework uses a new Graph API model, not based on legacy "User settings" API.

**Default groups**: "All users" and "All devices" support planned (tracked: Scenario 59197849).

**Policy precedence**: No unified solution yet; depends on feature teams who enforce the settings.

**Settings enforcement time**: Depends on framework and group size. Perf testing for 500K member groups underway.

**AVD vs W365**: Windows App settings for AVD managed in Azure Portal; for W365 managed in Intune.

**Remote connection experience**: Different from Intune/GPO. Settings targeted to device, delivered to fleet management, applied through ARM API call via RMS service.
