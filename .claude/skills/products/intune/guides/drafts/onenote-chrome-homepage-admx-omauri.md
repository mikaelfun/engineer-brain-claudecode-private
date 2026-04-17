# Configure Chrome Homepage via ADMX-Backed OMA-URI in Intune

## Overview

Use third-party ADMX template (Chrome.admx) ingested via CSP to manage Chrome browser settings through Intune custom profiles.

## Steps

### 1. Get Chrome ADMX File

Download from: [Chrome Enterprise](https://chromeenterprise.google/browser/download/#manage-policies-tab)

### 2. Ingest ADMX Template into Intune

Create custom profile:
- **Platform**: Windows 10 and later
- **Profile type**: Custom
- **OMA-URI**: `./Device/Vendor/MSFT/Policy/ConfigOperations/ADMXInstall/Chrome/Policy/ChromeAdmx`
- **Data type**: String
- **Value**: Paste full content of chrome.admx file

### 3. Determine Registry Keys

On a device with chrome.admx imported, check: `HKLM\SOFTWARE\Microsoft\PolicyManager\ADMXDefault` to see Chrome setting categories.

### 4. Configure Settings

Create 4 OMA-URI settings in the custom profile:

**HomepageIsNewTabPage** (disable):
```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/Chrome~Policy~googlechrome~Startup/HomepageIsNewTabPage
Data type: String
Value: <disabled/>
```

**HomepageLocation**:
```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/Chrome~Policy~googlechrome~Startup/HomepageLocation
Data type: String
Value:
<enabled/>
<data id="HomepageLocation" value="https://your-homepage-url.com"/>
```

**RestoreOnStartup** (value 4 = open specific URLs):
```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/Chrome~Policy~googlechrome~Startup/RestoreOnStartup
Data type: String
Value:
<enabled/>
<data id="RestoreOnStartup" value="4"/>
```

**RestoreOnStartupURLs**:
```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/Chrome~Policy~googlechrome~Startup/RestoreOnStartupURLs
Data type: String
Value:
<enabled/>
<data id="RestoreOnStartupURLsDesc" value="1&#xF000;https://your-homepage-url.com"/>
```

> **Note**: Use `&#xF000;` as delimiter for multiple URL entries.

### 5. Validate

After deployment, verify in Chrome at `chrome://policy` to confirm policies are applied.

## References

- [Manage Chrome Browser with Microsoft Intune](https://support.google.com/chrome/a/answer/9102677)
- CSP: `./Device/Vendor/MSFT/Policy/ConfigOperations/ADMXInstall`
