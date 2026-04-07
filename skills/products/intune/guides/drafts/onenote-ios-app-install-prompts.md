# iOS App Installation Prompt Types Guide

> Source: OneNote — iOS TSG
> Status: DRAFT — pending SYNTHESIZE review

## Overview

When deploying apps via Intune to iOS devices, users may encounter various prompts depending on device supervision status, app type, and licensing model.

## Five Types of iOS App Installation Prompts

### 1. App Installation Prompt
**Message:** `"..." is about to install and manage the app "...". Your iTunes account will not be charged for this app`

- Triggered on **non-supervised** devices whenever an app is pushed from Intune console
- User must approve to install
- **Cannot be avoided** unless device is **supervised**

### 2. Apple ID Prompt
- User prompted to enter Apple credentials
- Happens on **first-time installation** of all public and VPP user-based apps
- **To avoid:** Ensure all apps assigned to device are **VPP device-based** apps (not user-based)

### 3. App Update Prompt
**Message:** `"..." is about to update the app "...". Cancel/Update`

- Applies to **both supervised and non-supervised** devices
- Triggered **only when the app is currently in use** during update
- Apple design — cannot be bypassed
- For **supervised devices**: if app is not in use, update happens silently

### 4. App Management Change Prompt
**Message:** `Would you like to let "..." take management of the app "..."? The app will close and your app data will become managed.`

- Triggered on **non-supervised** devices when "Make app MDM managed if user installed" is enabled with automatic push mode
- Intune/AirWatch attempts to assume management of user-installed apps
- For **supervised devices**: targeted app becomes managed silently if not in use

### 5. VPP Invite Prompt
**Message:** `Allow App and Book Assignment? "..." would like to assign apps and books to you.`

- Triggered when user hasn't accepted VPP invite before AND:
  - "Automatically send invite" is enabled in Apps settings > Catalog > VPP Managed Distribution
  - Device gets VPP user-based apps auto-pushed
  - User clicks on a user-based app

## Supervised vs Non-Supervised Summary

| Behavior | Non-supervised | Supervised |
|----------|---------------|------------|
| App installation | User prompted | Silent install |
| Apple ID for public/VPP user apps | Prompted | Prompted |
| App update (app in use) | Prompted | Prompted |
| App update (app not in use) | Prompted | Silent |
| App management takeover | Prompted | Silent (if not in use) |

## How to Supervise iOS Devices

1. **Apple Configurator 2**: Requires Mac + physical connection. Wipes device data.
2. **Apple Device Enrollment Program (ADE/DEP)**: Devices purchased from Apple. Supervised by default.
3. Check supervision status: Device Details > Security tab in Intune portal.
