# Windows App Migration Guide for Mooncake

> Source: OneNote - Mooncake POD Support Notebook / AVD / Feature Verification / Windows App replacement
> Status: draft

## Retirement Timeline

| Platform | Original Software | Replacement | EOL Date | China Status |
|----------|-------------------|-------------|----------|--------------|
| Windows | Remote Desktop app (Store) | Windows App | May 27, 2025 | End of support, no extension |
| Windows | Remote Desktop client (MSI) | Windows App | **Sep 28, 2026** (extended from Mar 27) | Supported until Windows App fully supports Mooncake |
| Windows | Thin client software | Vendor-dependent | N/A | Check with vendor |
| Mac | Remote Desktop Beta | Windows App | TBD | Does not support Dual Federation |

## Current Status (as of 2026-03)
- Windows App is usable for Mooncake customers **without** Dual Federation scenario
- Remote Desktop MSI retirement date: **September 28, 2026** (Azure Health: 8Q5F-800)
- Dual Federation support: validation build available, awaiting GA

## Dual Federation Workaround

### For Windows App versions < 2.0.916.0
1. Install Windows App from Microsoft Store
2. Add registry key:
   - Path: `HKCU\Software\Microsoft\WindowsApp`
   - Name: `EnableGovernmentNationalCloudSignInOption`
   - Type: DWORD
   - Value: `2`
3. Restart Windows App
4. Use the national cloud sign-in button to log in to 21V

### For Windows App versions >= 2.0.916.0 (No longer needed after this version)
Mooncake support is built-in. If testing preview:
1. Add registry key:
   - Path: `HKCU\Software\Microsoft\WindowsApp\Flights`
   - Name: `EnableMooncakeSupport`
   - Type: DWORD
   - Value: `1`
2. Reset app: Settings > Apps > Windows App > Advanced options > Reset
3. Restart Windows App

## User Switching
- After login, users can switch accounts via the app's user menu

## Legacy Download Links
- macOS Remote Desktop: [App Store](https://apps.apple.com/us/app/microsoft-remote-desktop/id1295203466?mt=12) or [App Center](https://install.appcenter.ms/orgs/rdmacios-k2vy/apps/microsoft-remote-desktop-for-mac/distribution_groups/all-users-of-microsoft-remote-desktop-for-mac)

## Impacted Customers (Tracking)
- Multiple customers waiting for Dual Federation GA (tracked via ICM 596528229)
- Internal tracking mail: "[Internal] Confirm the support plan of Windows App for China/21Vianet AVD"

## Known Limitations
- Windows App does not support Dual Federation on macOS
- Canary builds are NOT for production use
