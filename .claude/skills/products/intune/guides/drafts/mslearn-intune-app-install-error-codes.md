---
source: mslearn
sourceRef: null
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/mem/intune/app-management/app-install-error-codes"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Intune App Installation Error Code Reference

## Android App Installation Errors

| Error Code | Description | Action |
|---|---|---|
| 0xC7D14FB5 | App failed to install (unknown root cause) | Check APK validity, Google Play Protect, API version compatibility |
| 0xC7D14FBA | APK deleted after download before install | Large time gap between download/install, user canceled |
| 0xC7D14FBB | Process restarted during installation | Device rebooted during APK install |
| 0x87D1041C | App not detected after successful install | User uninstalled the app |
| 0xC7D14FB2 | Download failed (unknown error) | Wi-Fi issues or slow connections |
| 0xC7D14FB1 | End user canceled installation | User pressed cancel on OS install prompt |
| 0xc7d14fb8 | App failed to uninstall | Admin apps may block uninstall |
| 0xc7d14fb7 | APK signature mismatch during upgrade | Signing cert differs from existing version, need to uninstall first |

## iOS/iPadOS App Installation Errors

| Error Code | Description | Action |
|---|---|---|
| 0x87D12906 | Apple MDM Agent error | Retry installation |
| 0x87D1313D | Could not retrieve VPP license | Sync VPP token, reassign app |
| 0x87D11388 | Device is currently busy | Unlock device first |
| 0x87D13B66 | App managed but expired/removed | User uninstalled or app expired |
| 0x87d13b7e | No VPP licenses remaining | Purchase additional VPP licenses |
| 0x87d13b8f | App installed but unmanaged | Uninstall app, let Intune reinstall |
| 0x87D13B9D | Latest version failed to update | Wait for device to report updated version |

## Windows Installation Errors

| Error Code | Description | Action |
|---|---|---|
| 0x80073CFF | Sideloading not enabled | Enable AllowAllTrustedApps policy |
| 0x80073CF3 | Package conflict/dependency issue | Check dependencies and architecture |
| 0x80073CFB | Package already installed | Remove old package or increment version |
