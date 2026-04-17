---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/App Management/Windows"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FApp%20Management%2FWindows"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Apps-Deployment for Windows

## What is Windows App Deployment

App deployment for Windows is the process of adding an app to Intune and assigning it to users, groups, and/or devices. This can install the app automatically or make it available for user self-service.

## Deployment Flow

1. Users enroll their devices in Intune
2. Admin creates an app package specifying the app and parameters
3. Admin assigns the app package to desired users or devices
4. Intune contacts the device to retrieve the app package
5. Installation is automatic (Required) or user-initiated (Available)

## App Types & References

- **APPX and Store Apps**: Deep links, modern app updates, offline Company Portal
- **Web Apps**: Deep links via Intune
- **Win32 Apps**: S Mode, Windows Update packages, code signing
- **Office 365 Apps**: M365 deployment to Windows 10/11

## Scoping Questions

- Device type (Brand, Make, Model)?
- OS Version?
- Application type (Win32, Store, LOB)?
- Deployment method (uploaded, synced, etc.)?
- Assignment type (Required/Available, User/Device group)?
- Previously deployed? Update or new?
- Error messages on device or Intune console?
- When did issue start? Any changes?
- Reproducible? Affecting one or all?
- Gather App Name/ID, User UPN, Device Serial/ID

## Support Boundaries

Intune does not support applications that fail to install during setup unless the failure ONLY occurs when the device is enrolled/managed by Intune. First step: verify the problem occurs only with Intune management. If it occurs without Intune → transfer to Windows Performance team or refer to app vendor.

## Troubleshooting Resources

- **WSFB**: Microsoft Store and Intune integration troubleshooting
- **Win32 LOB**: Step-by-step deployment troubleshooting with Sidecar
- **Office Suite**: M365 Apps deployment and MSI removal
- **MSI Apps**: MSI installation verification
- **APPX LOB**: APPX packaging and deployment
- **IME (Sidecar)**: SideCar Troubleshooting Guide on Engineering Hub

## Key Kusto Queries

- DeviceManagementProvider + IntuneEvent tables for device-level logs
- WSFB sync events via IntuneEvent table
- Store Apps detection failures via DeviceManagementProvider
- App-specific logs filtered by app name

## Log Collection

- **WSFB Apps**: `net stop InstallService` → `wsreset` → `net start InstallService` → repro → `wscollect`
- **APPX Diag**: Use AppxDiag tool from internal share
- **IME Logs**: `%ProgramData%\Microsoft\IntuneManagementExtension\Logs`
