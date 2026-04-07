---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/App Management/Apple/iOS and iPadOS/Apple DDM Apps"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FApp%20Management%2FApple%2FiOS%20and%20iPadOS%2FApple%20DDM%20Apps"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# App Declarative Device Management (DDM)

**Page Owner:** Beatriz Moran (bmoran@microsoft.com)

## About DDM

Apple DDM, or **Declarative Device Management**, is a protocol shift from the traditional imperative and reactive MDM model to a state-based management approach. Instead of the server sending individual action commands, Intune sends a policy document specifying the desired device state, allowing the device to autonomously manage itself and proactively report status changes back to Intune.

Key components of DDM include **declarations**, **status updates**, and **event-driven actions**.

**New Model Highlights**:
- More resilient behavior when devices are intermittently offline
- Fewer "install command > wait > query status" loops
- Richer, real-time app status reports
- No "Not Now" state — DDM eliminates the repeated deferrals seen in MDM

## How DDM Works

### MDM vs DDM

- **MDM**: Imperative + reactive. Server sends action commands, device executes and reports. Multiple commands sent for each required app.
- **DDM**: State-based. Server sends a single DDM policy document (manifest). Device handles installations and status reporting. Proactive reporting — device reports every application state change independently.

### DDM Check-In Request Types

| Request Type | Description |
|---|---|
| **TokensRequest** | Requests declaration tokens from the server |
| **ConfigurationRequest** | Request applied DDM Apps configurations on the device |
| **DeclarationItemsRequest** | Request DDM Apps targeted to the device |
| **StatusReportRequest** | Reports installation status, issues, or errors back to Intune |

> **TIP**: Status reports are published as soon as they are received from the device. Per-app reporting blade mentions up to 20 minutes delay, but with DDM status arrives significantly faster than MDM.

## Requirements and Limitations

- **Supported Platforms**: iOS/iPadOS 17.4+
- **Supported Assignment Types**: Required and Uninstall only (Available planned for future)
- **Application types**: LOB (Line of Business)
- **Not Supported**:
  - Apps with Intune App SDK (MAM-enabled apps)
  - App configuration policies
  - Available App assignment type
  - Legacy app config settings

> **WARNING**: Once an app is created with a specific management type (DDM or MDM), the option is **grayed out** and cannot be changed. You must create a new app entry to switch management types.

## DDM App Settings

| Setting | Description |
|---|---|
| **Per App VPN** | Configures a VPN connection scoped to the specific app |
| **Prevent iCloud App Backup** | Prevents the app data from being backed up to iCloud |
| **Tap to Pay Screen Lock** | Configures screen lock behavior for tap-to-pay scenarios |
| **Associated Domains** | Associates specific domains with the app |
| **Direct Downloads** | Boolean setting to enable direct downloads |

## Troubleshooting DDM Apps

Review the check-in request types:

1. **Tokens Requests** — Verify declaration tokens are being requested and received.
2. **Configuration Requests** — Confirm the device is requesting updated policies.
3. **DeclarationItemsRequest** — Verify device is receiving targeted declarations.
4. **Status Report Requests** — Check for installation issues or error reports. Look for `"Valid":"Invalid"` entries with `Reasons` and error codes.

### Common Error: Error.ConfigurationCannotBeApplied

StatusReport shows `Valid: Invalid` with code `Error.ConfigurationCannotBeApplied` — typically indicates target OS version is older than current version (e.g., targeting 15.7.4 on a device running 26.3.1).

### Kusto Queries

```kql
DDMHighLevelCheckin("XXXXXX-a721-416a-8bec-XXXXXb17937X", "2026-03-23 00:17:00", "2026-03-24 00:17:00")
```

This KQL query works for any Declarative policy, not only for DDM Apps.

## Scoping Questions

1. Is the device running iOS/iPadOS 17.4 or later?
2. Is the app a LOB or VPP app type?
3. Was the app created with DDM or MDM management type in the admin console?
4. Does the app use the Intune App SDK (MAM-enabled)?
5. Are app configuration policies assigned to the app?
6. What assignment type is being used (Required, Uninstall, or Available)?

## FAQ

- **Can I switch an app from MDM to DDM?** No. Must create a new app entry.
- **Does DDM support "Available" assignment type?** Not yet. Only Required and Uninstall.
- **Will DDM eliminate "Not Now" state?** Yes. Device installs as soon as able.
- **Are MAM-enabled apps supported?** Not yet. Use MDM management type.
- **Which platforms?** Currently iOS/iPadOS only. macOS/tvOS/visionOS planned.

## How to Get Help

For DDM app deployment issues, reach out to the **Apple MDM SMEs** within Intune CSS.
