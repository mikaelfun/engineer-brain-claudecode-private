# Configure Chrome Homepage via Intune ADMX-backed Policy

> Source: OneNote — Mooncake POD Support Notebook / Intune / How To / Windows
> Quality: guide-draft (pending review)

## Overview

Configure Google Chrome homepage and startup behavior on Windows devices via Intune custom OMA-URI profiles using ADMX-backed policies.

## Steps

### 1. Get Chrome ADMX Template

Download latest Chrome ADMX from: [Chrome Enterprise](https://chromeenterprise.google/browser/download/#manage-policies-tab)

### 2. Ingest ADMX Template into Intune

1. Go to **Intune** > **Device Configuration** > **Profiles** > **Create profile**
2. Platform: **Windows 10 and later**, Profile type: **Custom**
3. Add row:
   - **OMA-URI**: `./Device/Vendor/MSFT/Policy/ConfigOperations/ADMXInstall/Chrome/Policy/ChromeAdmx`
   - **Data type**: String
   - **Value**: Paste the full content of `chrome.admx`

### 3. Find Required Registry Keys

On a device with chrome.admx imported, open `regedit.exe` and navigate to:
`HKLM\SOFTWARE\Microsoft\PolicyManager\ADMXDefault`

### 4. Configure Settings (4 OMA-URI rows)

**HomepageIsNewTabPage** (Disable new tab as homepage):
- OMA-URI: `./Device/Vendor/MSFT/Policy/Config/Chrome~Policy~googlechrome~Startup/HomepageIsNewTabPage`
- Data type: String
- Value: `<disabled/>`

**HomepageLocation** (Set homepage URL):
- OMA-URI: `./Device/Vendor/MSFT/Policy/Config/Chrome~Policy~googlechrome~Startup/HomepageLocation`
- Data type: String
- Value:
  ```xml
  <enabled/>
  <data id="HomepageLocation" value="https://your-homepage-url.com"/>
  ```

**RestoreOnStartup** (Open specific pages on startup):
- OMA-URI: `./Device/Vendor/MSFT/Policy/Config/Chrome~Policy~googlechrome~Startup/RestoreOnStartup`
- Data type: String
- Value:
  ```xml
  <enabled/>
  <data id="RestoreOnStartup" value="4"/>
  ```

**RestoreOnStartupURLs** (Startup page URLs):
- OMA-URI: `./Device/Vendor/MSFT/Policy/Config/Chrome~Policy~googlechrome~Startup/RestoreOnStartupURLs`
- Data type: String
- Value:
  ```xml
  <enabled/>
  <data id="RestoreOnStartupURLsDesc" value="1&#xF000;https://your-homepage-url.com"/>
  ```

### 5. Verify

After deployment, open `chrome://policy` on the target device to confirm policies are applied.

## Notes

- This same ADMX ingestion pattern works for any third-party ADMX template (Firefox, Adobe, etc.)
- Replace `https://your-homepage-url.com` with the actual desired URL
- RestoreOnStartup value 4 = "Open a list of URLs"
- If copy-pasting causes errors, check for smart quotes vs straight quotes
