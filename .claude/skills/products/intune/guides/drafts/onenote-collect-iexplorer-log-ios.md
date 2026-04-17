# Collect iExplorer Log for iOS MAM Troubleshooting

> Source: OneNote MCVKB/Intune/iOS

## Purpose

Use iExplorer to extract MAM-related information from 3rd-party or LOB apps on iOS devices. Useful when standard Intune diagnostic logs are insufficient.

## Prerequisites

- Windows PC with iTunes installed
- iExplorer: https://macroplant.com/iexplorer

## Steps (Windows)

1. Download and install iExplorer
2. On first launch, select **Keep using Demo mode**
3. **Back up the iOS device to the PC using iTunes** (required step)
4. Open iExplorer → navigate to the backup data
5. Browse to the target app's data directory

## What You Can Find

- MAM-related information for 3rd-party apps
- LOB app MAM policy application data
- App-level configuration data

## Notes

- The device must be backed up via iTunes first — iExplorer reads from the backup, not directly from the device
- Demo mode is sufficient for log browsing
- This method can reveal MAM policy state that is not visible through standard Intune diagnostics
