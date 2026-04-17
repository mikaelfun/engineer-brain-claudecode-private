# Set Chrome Homepage via Intune ADMX-Backed Policy

> Source: OneNote — Mooncake POD Support Notebook / How To / Windows
> Quality: draft (pending SYNTHESIZE review)

## Overview

Configure Chrome browser homepage and startup pages using ADMX-backed policies via Intune custom OMA-URI profiles. This approach injects the Chrome ADMX template into the device and then configures individual settings.

## Prerequisites

- Download the latest Chrome ADMX template from [Chrome Enterprise](https://chromeenterprise.google/browser/download/#manage-policies-tab)
- Intune license with custom profile support

## Step 1: Ingest Chrome ADMX Template

Create Intune custom profile:

| Field | Value |
|-------|-------|
| Platform | Windows 10 and later |
| Profile type | Custom |
| OMA-URI | `./Device/Vendor/MSFT/Policy/ConfigOperations/ADMXInstall/Chrome/Policy/ChromeAdmx` |
| Data type | String |
| Value | *(paste full content of chrome.admx file)* |

## Step 2: Identify Registry Keys

On a machine with Chrome ADMX imported:
1. Open `regedit.exe`
2. Navigate to `HKLM\SOFTWARE\Microsoft\PolicyManager\ADMXDefault`
3. Browse Chrome setting categories

## Step 3: Configure Settings

### HomepageIsNewTabPage (Disable)

| Field | Value |
|-------|-------|
| OMA-URI | `./Device/Vendor/MSFT/Policy/Config/Chrome~Policy~googlechrome~Startup/HomepageIsNewTabPage` |
| Data type | String |
| Value | `<disabled/>` |

### HomepageLocation

| Field | Value |
|-------|-------|
| OMA-URI | `./Device/Vendor/MSFT/Policy/Config/Chrome~Policy~googlechrome~Startup/HomepageLocation` |
| Data type | String |
| Value | `<enabled/><data id="HomepageLocation" value="https://your-homepage.com"/>` |

### RestoreOnStartup

| Field | Value |
|-------|-------|
| OMA-URI | `./Device/Vendor/MSFT/Policy/Config/Chrome~Policy~googlechrome~Startup/RestoreOnStartup` |
| Data type | String |
| Value | `<enabled/><data id="RestoreOnStartup" value="4"/>` |

### RestoreOnStartupURLs

| Field | Value |
|-------|-------|
| OMA-URI | `./Device/Vendor/MSFT/Policy/Config/Chrome~Policy~googlechrome~Startup/RestoreOnStartupURLs` |
| Data type | String |
| Value | `<enabled/><data id="RestoreOnStartupURLsDesc" value="1&#xF000;https://your-homepage.com"/>` |

## Step 4: Validate

After deployment, verify in Chrome:
- Navigate to `chrome://policy` to see applied policies
- Check homepage behavior

## Notes

- RestoreOnStartup value `4` = Open a list of URLs
- Multiple startup URLs use `&#xF000;` as separator
- Quotes in XML values may cause errors — ensure proper XML escaping
- Reference: [Manage Chrome Browser with Intune](https://support.google.com/chrome/a/answer/9102677)
