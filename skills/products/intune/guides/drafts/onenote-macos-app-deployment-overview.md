# macOS App Deployment Overview

> Source: OneNote — MacOS App deployment - pkg & dmg
> Status: draft

## Deployment Workflow

1. Users enroll devices in Intune (adds user account + device)
2. Admin creates app package specifying app + conditions/parameters
3. Admin assigns app package to users/devices
4. Intune contacts device to retrieve app package from specified location
5. App installs automatically (Required) or becomes available for user to initiate (Available via IWP/Company Portal)

## Supported App Types (macOS)

- **Microsoft 365 apps** (Word, Excel, etc.)
- **Microsoft Edge**
- **PKG** — Native macOS installer packages
- **LOB (.intunemac)** — Wrapped with Intune App Wrapping Tool for Mac
- **DMG** — Disk image files (can be converted to PKG)
- **Store apps** — Synced from respective stores

## Deployment Flow (IT Admin perspective)

1. IT Admin with Global Admin or Intune Service Admin permission accesses Endpoint Manager portal
2. Upload LOB application (or sync store apps)
3. Assign to devices: Required (auto-push) or Available (user-initiated via IWP/Company Portal)
4. Apps presented to devices after successful check-in with Intune Service
5. Application downloaded to device storage, OS handles installation
6. Reporting available in Endpoint admin console for installation status

## Scoping Questions for macOS App Deployment Issues

- What type of application is being deployed? (M365, Edge, PKG, LOB/intunemac, DMG)
- What is the error message and where is it occurring?
- Is this a reporting-only issue? (app installs but does not show as Installed)
- When did the issue start and has it ever worked before?
- How many devices are affected? Does it fail on all targeted devices?
- Can the application be installed manually?
- What is the device model and OS Version?
- How is the device enrolled in Intune?
- How is this impacting your organization? Is there any workaround?
- What documentation are you using as a reference to deploy the application?
